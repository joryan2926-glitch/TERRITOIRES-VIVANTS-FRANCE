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
    key: "requests",
    title: "Mes demandes",
    subtitle: "Consulter les références enregistrées sur ce téléphone.",
    icon: "file-tray-full-outline"
  },
  {
    key: "tracking",
    title: "Suivre ma demande",
    subtitle: "Retrouver le numéro créé sur ce téléphone.",
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
  { key: "bois", label: "Bois", icon: "layers-outline" },
  { key: "portes", label: "Portes", icon: "exit-outline" },
  { key: "fenetres", label: "Fenêtres", icon: "grid-outline" },
  { key: "sanitaires", label: "Sanitaires", icon: "water-outline" },
  { key: "carrelage", label: "Carrelage", icon: "apps-outline" },
  { key: "mobilier", label: "Mobilier", icon: "cube-outline" },
  { key: "luminaires", label: "Luminaires", icon: "bulb-outline" },
  { key: "equipements", label: "Équipements", icon: "construct-outline" },
  { key: "outils", label: "Outils", icon: "hammer-outline" },
  { key: "divers", label: "Divers", icon: "ellipsis-horizontal-circle-outline" }
];

export const propertyTypes = [
  { key: "logement-vacant", label: "Logement vacant", icon: "home-outline" },
  { key: "maison", label: "Maison", icon: "home-outline" },
  { key: "immeuble", label: "Immeuble", icon: "business-outline" },
  { key: "commerce", label: "Commerce", icon: "storefront-outline" },
  { key: "local-activite", label: "Local d'activité", icon: "briefcase-outline" },
  { key: "batiment-inutilise", label: "Bâtiment inutilisé", icon: "business-outline" },
  { key: "terrain", label: "Terrain", icon: "map-outline" },
  { key: "friche", label: "Friche", icon: "leaf-outline" }
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

export const flowGuides = {
  signal: ["Identifier", "Localiser", "Transmettre"],
  materials: ["Décrire", "Qualifier", "Orienter"],
  property: ["Présenter", "Pré-étudier", "Constituer"],
  volunteer: ["Se présenter", "Préciser", "Être recontacté"],
  tracking: ["Retrouver", "Comprendre", "Suivre"]
};

export const checklistByFlow = {
  signal: [
    "Choisir la catégorie du lieu",
    "Indiquer une adresse ou un repère fiable",
    "Ajouter une description factuelle",
    "Joindre une photo si elle peut être prise légalement"
  ],
  materials: [
    "Indiquer le type de matériau",
    "Préciser la quantité ou les dimensions",
    "Décrire l'état général",
    "Ajouter un contact pour organiser la suite"
  ],
  property: [
    "Identifier le type de bien",
    "Décrire l'état général",
    "Préciser l'objectif du propriétaire",
    "Préparer les pièces utiles avant instruction"
  ],
  volunteer: [
    "Laisser ses coordonnées",
    "Présenter ses compétences",
    "Indiquer ses disponibilités",
    "Attendre un contact selon les besoins TVF"
  ]
};

export const requiredFieldsByFlow = {
  signal: ["category", "address", "description"],
  materials: ["category", "quantity", "condition", "address", "contactName"],
  property: ["category", "address", "condition", "objective", "contactName"],
  volunteer: ["contactName", "email", "skills"]
};

export const fieldLabels = {
  category: "catégorie",
  title: "titre",
  address: "adresse ou localisation",
  description: "description",
  contactName: "nom et prénom",
  contactMethod: "e-mail ou téléphone",
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
  },
  {
    icon: "logo-facebook",
    title: "Facebook",
    subtitle: "Territoires Vivants France",
    url: "https://www.facebook.com/share/1Ef3zqWypK/"
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