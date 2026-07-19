const FLOW_CONFIG = {
  signal: {
    typeLabel: "Signalement de terrain",
    caseType: "signalement",
    queue: "Demandes recues",
    priority: "normale",
    defaultTitle: "Signalement a qualifier",
    documentHints: ["Adresse ou repere", "Photo si possible", "Description factuelle"]
  },
  materials: {
    typeLabel: "Proposition de materiaux",
    caseType: "materiaux",
    queue: "Materiotheque",
    priority: "normale",
    defaultTitle: "Materiaux disponibles",
    documentHints: ["Quantite", "Etat", "Lieu de stockage", "Photos"]
  },
  property: {
    typeLabel: "Proposition de bien",
    caseType: "bien_vacant",
    queue: "Dossiers en pre-etude",
    priority: "haute",
    defaultTitle: "Bien a etudier",
    documentHints: ["Adresse du bien", "Etat general", "Objectif du proprietaire", "Photos"]
  },
  volunteer: {
    typeLabel: "Candidature benevole",
    caseType: "benevole",
    queue: "CRM contacts",
    priority: "basse",
    defaultTitle: "Contact benevole",
    documentHints: ["Coordonnees", "Competences", "Disponibilites"]
  }
};

const COMPLETENESS_FIELDS = {
  signal: ["category", "address", "description", "photoUri"],
  materials: ["category", "address", "description", "quantity", "condition", "contactName", "phone"],
  property: ["category", "address", "description", "objective", "contactName", "phone"],
  volunteer: ["contactName", "phone", "skills", "availability"]
};

function clean(value) {
  const text = String(value || "").trim();
  return text || null;
}

function numberOrNull(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function getConfig(flow) {
  return FLOW_CONFIG[flow] || FLOW_CONFIG.signal;
}

function normalizePhotos(draft) {
  if (Array.isArray(draft.photos) && draft.photos.length) {
    return draft.photos
      .filter((photo) => clean(photo?.uri))
      .slice(0, 4)
      .map((photo, index) => ({
        uri: clean(photo.uri),
        fileName: clean(photo.fileName) || `photo-tvf-mobile-${index + 1}.jpg`,
        rank: index + 1
      }));
  }
  if (clean(draft.photoUri)) {
    return [{ uri: clean(draft.photoUri), fileName: clean(draft.photoFileName) || "photo-tvf-mobile.jpg", rank: 1 }];
  }
  return [];
}

function buildTitle(config, draft, categoryLabel) {
  const title = clean(draft.title);
  if (title) return title;

  const category = clean(categoryLabel) || clean(draft.category);
  return category ? `${config.defaultTitle} - ${category}` : config.defaultTitle;
}

function buildShortDescription(flow, draft) {
  const description = clean(draft.description);
  if (description) return description.length > 180 ? `${description.slice(0, 177)}...` : description;

  if (flow === "materials") return "Materiaux ou equipements proposes depuis le terrain.";
  if (flow === "property") return "Bien propose pour une premiere etude TVF.";
  if (flow === "volunteer") return "Contact volontaire a qualifier par TVF.";
  return "Signalement terrain transmis depuis TVF Mobile.";
}

function calculateCompleteness(flow, draft) {
  const fields = COMPLETENESS_FIELDS[flow] || COMPLETENESS_FIELDS.signal;
  const completed = fields.filter((field) => clean(draft[field])).length;
  return Math.round((completed / fields.length) * 100);
}

function buildRouting(flow, draft) {
  const config = getConfig(flow);
  const hasContact = Boolean(clean(draft.email) || clean(draft.phone));
  const hasLocation = Boolean(clean(draft.address) || (clean(draft.latitude) && clean(draft.longitude)));

  return {
    recommendedQueue: config.queue,
    recommendedCaseType: config.caseType,
    priority: config.priority,
    needsHumanReview: true,
    canCreateCase: hasLocation || flow === "volunteer",
    canContactApplicant: hasContact,
    suggestedFirstAction: hasContact ? "Qualifier la demande" : "Completer les coordonnees"
  };
}

export function buildRequestPayload({ flow, draft, reference, categoryLabel }) {
  const config = getConfig(flow);
  const title = buildTitle(config, draft, categoryLabel);
  const completeness = calculateCompleteness(flow, draft);
  const routing = buildRouting(flow, draft);
  const photos = normalizePhotos(draft);
  const primaryPhoto = photos[0] || null;

  return {
    reference,
    source: "tvf-mobile-terrain",
    flow,
    status: "received_mobile",
    category: clean(draft.category),
    categoryLabel: clean(categoryLabel) || clean(draft.category),
    summary: {
      title,
      typeLabel: config.typeLabel,
      shortDescription: buildShortDescription(flow, draft),
      priority: routing.priority,
      completeness,
      recommendedQueue: routing.recommendedQueue
    },
    classification: {
      caseType: config.caseType,
      documentHints: config.documentHints,
      requiresContact: flow !== "signal",
      hasPhoto: photos.length > 0,
      photoCount: photos.length,
      hasLocation: Boolean(clean(draft.address) || (clean(draft.latitude) && clean(draft.longitude))),
      routing
    },
    location: {
      rawAddress: clean(draft.address),
      latitude: numberOrNull(draft.latitude),
      longitude: numberOrNull(draft.longitude),
      accuracyMeters: numberOrNull(draft.locationAccuracy)
    },
    media: {
      photoUri: primaryPhoto?.uri || null,
      photoFileName: primaryPhoto?.fileName || null,
      photos,
      photoCount: photos.length,
      storageTarget: photos.length ? (flow === "materials" ? "supabase-storage-materiaux" : "supabase-storage-signalements") : null
    },
    contact: {
      name: clean(draft.contactName),
      email: clean(draft.email),
      phone: clean(draft.phone)
    },
    details: {
      title,
      description: clean(draft.description),
      quantity: clean(draft.quantity),
      condition: clean(draft.condition),
      availability: clean(draft.availability),
      objective: clean(draft.objective),
      skills: clean(draft.skills)
    },
    submissionContext: {
      app: "TVF Mobile",
      sdk: "Expo SDK 57",
      createdFrom: "mobile-field-intake",
      preparedFor: "TVF OS",
      version: "0.1.0"
    },
    nextSystemTarget: "tvf-os-demandes"
  };
}