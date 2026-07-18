export const homeActions = [
  {
    key: "signal",
    title: "Signaler un lieu",
    subtitle: "Logement vacant, commerce fermé, friche ou bâtiment inutilisé.",
    icon: "alert-circle-outline",
    primary: true
  },
  {
    key: "materials",
    title: "Proposer des matériaux",
    subtitle: "Bois, fenêtres, portes, mobilier, sanitaires ou équipements.",
    icon: "cube-outline"
  },
  {
    key: "property",
    title: "Proposer un bien",
    subtitle: "Logement, local, commerce, bâtiment, terrain ou friche.",
    icon: "home-outline"
  },
  {
    key: "volunteer",
    title: "Devenir bénévole",
    subtitle: "Proposer du temps, une compétence ou une aide terrain.",
    icon: "people-outline"
  },
  {
    key: "tracking",
    title: "Suivre ma demande",
    subtitle: "Retrouver un statut à partir d'un e-mail ou numéro TVF.",
    icon: "search-outline"
  }
];

export const signalCategories = [
  { key: "logement", label: "Logement vacant", icon: "home-outline" },
  { key: "commerce", label: "Commerce fermé", icon: "storefront-outline" },
  { key: "batiment", label: "Bâtiment inutilisé", icon: "business-outline" },
  { key: "friche", label: "Friche / terrain", icon: "leaf-outline" },
  { key: "depot", label: "Dépôt sauvage", icon: "warning-outline" },
  { key: "autre", label: "Autre situation", icon: "ellipsis-horizontal-circle-outline" }
];

export const materialCategories = [
  "Bois",
  "Portes",
  "Fenêtres",
  "Sanitaires",
  "Carrelage",
  "Mobilier",
  "Luminaires",
  "Équipements",
  "Outils",
  "Divers"
];

export const propertyTypes = [
  "Logement vacant",
  "Maison",
  "Immeuble",
  "Commerce",
  "Local d'activité",
  "Bâtiment inutilisé",
  "Terrain",
  "Friche"
];

export const documents = [
  {
    title: "Pièces à fournir - particuliers",
    subtitle: "Checklist pour préparer un dossier propriétaire."
  },
  {
    title: "Brochure propriétaires",
    subtitle: "Biens dormants, usages possibles et conventions."
  },
  {
    title: "Brochure matériaux",
    subtitle: "Critères, ressources et procédure de qualification."
  },
  {
    title: "Fiche contact TVF",
    subtitle: "Coordonnées officielles et premiers échanges."
  }
];

export const statusSteps = [
  "Reçu",
  "À vérifier",
  "À compléter",
  "En étude",
  "Orienté",
  "Clôturé"
];

export const requiredFieldsByFlow = {
  signal: ["category", "address", "description"],
  materials: ["category", "quantity", "condition", "address"],
  property: ["category", "address", "condition", "objective"],
  volunteer: ["contactName", "email", "skills"]
};

export const fieldLabels = {
  category: "catégorie",
  title: "titre",
  address: "adresse ou localisation",
  description: "description",
  contactName: "nom et prénom",
  email: "e-mail",
  phone: "téléphone",
  quantity: "quantité",
  condition: "état général",
  availability: "disponibilité",
  objective: "objectif recherché",
  skills: "compétences ou disponibilités"
};

export const flowLabels = {
  signal: "Signalement de terrain",
  materials: "Proposition de matériaux",
  property: "Proposition de bien",
  volunteer: "Candidature bénévole"
};

export const nextSteps = [
  "Réception dans TVF OS",
  "Qualification de la demande",
  "Demande de pièces si nécessaire",
  "Orientation ou instruction du dossier"
];

export const contactChannels = [
  {
    icon: "logo-whatsapp",
    title: "WhatsApp TVF",
    subtitle: "Discussion officielle",
    url: "https://wa.me/message/SKYLJHX46E43C1"
  },
  {
    icon: "mail-outline",
    title: "E-mail",
    subtitle: "contact@territoiresvivantsfrance.fr",
    url: "mailto:contact@territoiresvivantsfrance.fr"
  },
  {
    icon: "call-outline",
    title: "Téléphone",
    subtitle: "04 65 81 54 69",
    url: "tel:+33465815469"
  },
  {
    icon: "logo-instagram",
    title: "Instagram",
    subtitle: "@territoiresvivantsfrance",
    url: "https://www.instagram.com/territoiresvivantsfrance?igsh=MW5uajF2MmQ3MW91OQ=="
  }
];

export const documentGroups = [
  {
    title: "Préparer une demande propriétaire",
    items: ["Pièces à fournir - particuliers", "Brochure propriétaires", "Convention de pré-étude"]
  },
  {
    title: "Proposer des matériaux",
    items: ["Brochure matériaux", "Fiche de qualification", "Liste de photos à fournir"]
  },
  {
    title: "Contacter TVF",
    items: ["Fiche contact TVF", "Courrier de premier contact", "Présentation synthétique"]
  }
];