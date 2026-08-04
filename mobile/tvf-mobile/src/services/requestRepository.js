import { hasSupabaseConfig, supabase } from "./supabaseClient";

const DEFAULT_CONTACT_API_URL = "https://www.territoiresvivantsfrance.fr/api/contact";
const contactApiUrl = process.env.EXPO_PUBLIC_TVF_CONTACT_API_URL || DEFAULT_CONTACT_API_URL;

function mobileProfileForFlow(flow) {
  return {
    signal: "Habitant",
    materials: "Entreprise",
    property: "Proprietaire particulier",
    volunteer: "Benevole"
  }[flow] || "Utilisateur TVF Mobile";
}

function mobileSubjectForFlow(flow) {
  return {
    signal: "Signalement TVF Mobile",
    materials: "Proposition de materiaux TVF Mobile",
    property: "Presentation d'un bien TVF Mobile",
    volunteer: "Candidature benevole TVF Mobile"
  }[flow] || "Demande TVF Mobile";
}

function buildContactNotificationPayload(payload) {
  const address = payload.location?.rawAddress || "Adresse non renseignee";
  const description = payload.details?.description || payload.summary?.shortDescription || "Demande transmise depuis TVF Mobile.";
  const photos = payload.media?.photoCount ? `${payload.media.photoCount} photo(s) jointe(s) ou referencee(s).` : "Aucune photo indiquee.";
  const coordinates = payload.location?.latitude && payload.location?.longitude
    ? `Coordonnees GPS : ${payload.location.latitude}, ${payload.location.longitude}.`
    : "Coordonnees GPS non renseignees.";

  return {
    formKind: "tvf-mobile",
    submittedAfterMs: 2500,
    page: "tvf-mobile",
    fields: {
      profil: mobileProfileForFlow(payload.flow),
      nom: payload.contact?.name || "Utilisateur TVF Mobile",
      email: payload.contact?.email || "",
      telephone: payload.contact?.phone || "",
      territoire: address,
      objet: `${mobileSubjectForFlow(payload.flow)} - ${payload.reference}`,
      message: [
        `Reference mobile : ${payload.reference}`,
        `Type : ${payload.summary?.typeLabel || mobileSubjectForFlow(payload.flow)}`,
        `Categorie : ${payload.categoryLabel || payload.category || "Non renseignee"}`,
        `Adresse : ${address}`,
        coordinates,
        `Description : ${description}`,
        photos,
        `File TVF OS recommandee : ${payload.summary?.recommendedQueue || "Demandes recues"}`,
        "Cette notification provient de TVF Mobile. L'adresse officielle reste contact@territoiresvivantsfrance.fr."
      ].join("\n"),
      consent: "true"
    }
  };
}

async function notifyContactApi(payload) {
  if (!contactApiUrl) return { sent: false, skipped: true };
  try {
    const response = await fetch(contactApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildContactNotificationPayload(payload))
    });
    let result = null;
    try {
      result = await response.json();
    } catch {
      result = null;
    }
    if (!response.ok) throw new Error(`Notification contact ${response.status}`);
    if (result?.email?.internal === "failed") throw new Error("Notification Gmail non transmise.");
    return { sent: true, skipped: false, provider: result?.email?.provider || "contact-api" };
  } catch (error) {
    return { sent: false, skipped: false, warning: error?.message || "Notification e-mail non transmise." };
  }
}
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
    const notification = await notifyContactApi(payload);
    const notificationWarning = notification.warning ? " La notification Gmail n'a pas pu etre confirmee." : "";
    return {
      ok: notification.sent,
      mode: notification.sent ? "contact-api" : "local-preview",
      notification,
      message: notification.sent
        ? "Demande transmise a TVF par notification e-mail. Elle reste aussi conservee sur ce telephone."
        : `Demande preparee sur ce telephone.${notificationWarning}`
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

    const notification = await notifyContactApi(finalPayload);
    const notificationWarning = notification.warning ? " Notification e-mail a verifier." : "";

    return {
      ok: true,
      mode: "supabase",
      notification,
      message: upload.warning
        ? `Demande transmise vers TVF OS. Certaines photos pourront etre ajoutees ensuite.${notificationWarning}`
        : upload.paths?.length
          ? `Demande et ${upload.paths.length} photo(s) transmises vers TVF OS.${notificationWarning}`
          : `Demande transmise vers TVF OS.${notificationWarning}`
    };
  } catch (error) {
    return {
      ok: false,
      mode: "supabase-error",
      message: error.message || "Erreur de transmission vers TVF OS."
    };
  }
}

