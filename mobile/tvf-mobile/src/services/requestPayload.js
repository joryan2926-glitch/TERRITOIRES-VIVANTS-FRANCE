export function buildRequestPayload({ flow, draft, reference }) {
  return {
    reference,
    source: "tvf-mobile-preversion-terrain",
    flow,
    status: "draft_mobile",
    category: draft.category || null,
    location: {
      rawAddress: draft.address || null,
      latitude: draft.latitude ? Number(draft.latitude) : null,
      longitude: draft.longitude ? Number(draft.longitude) : null,
      accuracyMeters: draft.locationAccuracy ? Number(draft.locationAccuracy) : null
    },
    media: {
      photoUri: draft.photoUri || null,
      photoFileName: draft.photoFileName || null,
      storageTarget: draft.photoUri ? "supabase-storage-signalements" : null
    },
    contact: {
      name: draft.contactName || null,
      email: draft.email || null,
      phone: draft.phone || null
    },
    details: {
      title: draft.title || null,
      description: draft.description || null,
      quantity: draft.quantity || null,
      condition: draft.condition || null,
      availability: draft.availability || null,
      objective: draft.objective || null,
      skills: draft.skills || null
    },
    nextSystemTarget: "tvf-os-demandes"
  };
}