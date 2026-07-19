import { hasSupabaseConfig, supabase } from "./supabaseClient";

function bucketForFlow(flow) {
  return flow === "materials" ? "materiaux" : "signalements";
}

function sanitizeFileName(value) {
  return String(value || "photo-tvf-mobile.jpg")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "photo-tvf-mobile.jpg";
}

async function uploadPhotoIfNeeded(payload) {
  const photos = Array.isArray(payload.media?.photos) && payload.media.photos.length
    ? payload.media.photos
    : payload.media?.photoUri
      ? [{ uri: payload.media.photoUri, fileName: payload.media.photoFileName, rank: 1 }]
      : [];

  if (!photos.length) return { payload, bucket: null, path: null, paths: [], warning: null };

  const bucket = bucketForFlow(payload.flow);
  const uploaded = [];
  const warnings = [];

  for (const [index, photo] of photos.entries()) {
    if (!photo?.uri) continue;
    const fileName = sanitizeFileName(photo.fileName || `photo-tvf-mobile-${index + 1}.jpg`);
    const storagePath = `${payload.reference}/${Date.now()}-${index + 1}-${fileName}`;

    try {
      const response = await fetch(photo.uri);
      const blob = await response.blob();
      const contentType = blob.type || "image/jpeg";

      const { error } = await supabase.storage.from(bucket).upload(storagePath, blob, {
        contentType,
        upsert: false
      });

      if (error) throw error;
      uploaded.push({ ...photo, uri: null, storageBucket: bucket, storagePath, rank: index + 1 });
    } catch (error) {
      warnings.push(error?.message || "Photo non transmise.");
      uploaded.push({ ...photo, uri: null, storageBucket: null, storagePath: null, uploadWarning: error?.message || "Photo non transmise.", rank: index + 1 });
    }
  }

  const firstUploaded = uploaded.find((photo) => photo.storagePath) || null;
  const warning = warnings.length ? `${warnings.length} photo(s) non transmise(s).` : null;

  return {
    bucket: firstUploaded?.storageBucket || null,
    path: firstUploaded?.storagePath || null,
    paths: uploaded.filter((photo) => photo.storagePath).map((photo) => photo.storagePath),
    warning,
    payload: {
      ...payload,
      media: {
        ...payload.media,
        photoUri: null,
        photos: uploaded,
        photoCount: uploaded.length,
        storageBucket: firstUploaded?.storageBucket || null,
        storagePath: firstUploaded?.storagePath || null,
        storagePaths: uploaded.filter((photo) => photo.storagePath).map((photo) => photo.storagePath),
        uploadWarning: warning
      }
    }
  };
}

export async function submitMobileRequest(payload) {
  if (!hasSupabaseConfig() || !supabase) {
    return {
      ok: true,
      mode: "local-preview",
      message: "Demande preparee sur ce telephone. Activez l'envoi TVF OS pour la transmettre."
    };
  }

  try {
    const upload = await uploadPhotoIfNeeded(payload);
    const finalPayload = upload.payload;
    const { error } = await supabase.from("mobile_requests").insert({
      reference: finalPayload.reference,
      flow: finalPayload.flow,
      category: finalPayload.category,
      status: "received_mobile",
      raw_address: finalPayload.location?.rawAddress || null,
      latitude: finalPayload.location?.latitude || null,
      longitude: finalPayload.location?.longitude || null,
      photo_bucket: upload.bucket,
      photo_path: upload.path,
      contact_name: finalPayload.contact?.name || null,
      contact_email: finalPayload.contact?.email || null,
      contact_phone: finalPayload.contact?.phone || null,
      payload: finalPayload
    });

    if (error) throw error;

    return {
      ok: true,
      mode: "supabase",
      message: upload.warning
        ? "Demande transmise vers TVF OS. Certaines photos pourront etre ajoutees ensuite."
        : upload.paths?.length
          ? `Demande et ${upload.paths.length} photo(s) transmises vers TVF OS.`
          : "Demande transmise vers TVF OS."
    };
  } catch (error) {
    return {
      ok: false,
      mode: "supabase-error",
      message: error.message || "Erreur de transmission vers TVF OS."
    };
  }
}
