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
  if (!payload.media?.photoUri) return { payload, bucket: null, path: null };

  const bucket = bucketForFlow(payload.flow);
  const fileName = sanitizeFileName(payload.media.photoFileName);
  const storagePath = `${payload.reference}/${Date.now()}-${fileName}`;
  const response = await fetch(payload.media.photoUri);
  const blob = await response.blob();
  const contentType = blob.type || "image/jpeg";

  const { error } = await supabase.storage.from(bucket).upload(storagePath, blob, {
    contentType,
    upsert: false
  });

  if (error) throw error;

  return {
    bucket,
    path: storagePath,
    payload: {
      ...payload,
      media: {
        ...payload.media,
        photoUri: null,
        storageBucket: bucket,
        storagePath
      }
    }
  };
}

export async function submitMobileRequest(payload) {
  if (!hasSupabaseConfig() || !supabase) {
    return {
      ok: true,
      mode: "local-preview",
      message: "Demande préparée localement. Configurez Supabase pour l'enregistrement réel."
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
      message: upload.path ? "Demande et photo enregistrées dans Supabase." : "Demande enregistrée dans Supabase."
    };
  } catch (error) {
    return {
      ok: false,
      mode: "supabase-error",
      message: error.message || "Erreur d'enregistrement Supabase."
    };
  }
}