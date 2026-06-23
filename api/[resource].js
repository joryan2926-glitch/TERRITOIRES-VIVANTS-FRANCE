const { handleCollection, sendJson } = require("../lib/supabase");

const COLLECTIONS = {
  signalements: {
    table: "signalements",
    select: "id,type_signalement,adresse,commune,latitude,longitude,description,photo_url,statut_validation,created_at",
    publicQuery: "select=id,type_signalement,commune,latitude,longitude,description,photo_url,created_at&statut_validation=eq.valide&order=created_at.desc",
    allowedPost: ["type_signalement", "adresse", "commune", "latitude", "longitude", "description", "photo_url", "contact_facultatif"],
    defaultStatus: "a_moderer"
  },
  materiaux: {
    table: "materiaux",
    select: "id,type,categorie,quantite,etat,localisation,latitude,longitude,photo_url,disponibilite,contact_source,created_at",
    publicQuery: "select=id,type,categorie,quantite,etat,localisation,latitude,longitude,photo_url,disponibilite,created_at&statut_validation=eq.valide&order=created_at.desc",
    allowedPost: ["type", "categorie", "quantite", "etat", "localisation", "latitude", "longitude", "photo_url", "disponibilite", "contact_source"],
    defaultStatus: "a_moderer"
  },
  projets: {
    table: "projets",
    select: "id,titre,type_projet,commune,description,besoins,statut,created_at",
    publicQuery: "select=id,titre,type_projet,commune,description,besoins,statut,created_at&statut=neq.archive&order=created_at.desc",
    allowedPost: ["titre", "type_projet", "commune", "description", "besoins", "statut"],
    defaultStatus: "a_moderer"
  },
  territoires: {
    table: "territoires",
    select: "id,nom,type_territoire,region,departement,statut,created_at",
    publicQuery: "select=id,nom,type_territoire,region,departement,statut,created_at&order=nom.asc",
    allowedPost: ["nom", "type_territoire", "region", "departement", "statut"],
    statusField: "statut",
    defaultStatus: "prefiguration"
  },
  partenaires: {
    table: "partenaires",
    select: "id,nom,categorie,territoire,intention,statut,created_at",
    publicQuery: "select=id,nom,categorie,territoire,intention,statut,created_at&statut=eq.valide&order=created_at.desc",
    allowedPost: ["nom", "categorie", "territoire", "contact", "intention"],
    statusField: "statut",
    defaultStatus: "a_valider"
  },
  documents: {
    table: "documents",
    select: "id,titre,type_document,territoire,storage_path,statut_validation,created_at",
    publicQuery: "select=id,titre,type_document,territoire,storage_path,created_at&statut_validation=eq.valide&order=created_at.desc",
    allowedPost: ["titre", "type_document", "territoire", "storage_path", "description"],
    defaultStatus: "a_moderer"
  },
  "biens-candidats": {
    table: "biens_candidats",
    select: "id,type_bien,commune,adresse_ou_secteur,etat_general,usage_souhaite,formule_envisagee,duree_envisagee,latitude,longitude,statut_validation,confidentialite,created_at",
    publicQuery: "select=id,type_bien,commune,adresse_ou_secteur,etat_general,usage_souhaite,formule_envisagee,duree_envisagee,latitude,longitude,created_at&statut_validation=eq.valide&confidentialite=eq.public&order=created_at.desc",
    allowedPost: [
      "type_bien",
      "commune",
      "adresse_ou_secteur",
      "etat_general",
      "surface_approximative",
      "situation_proprietaire",
      "usage_souhaite",
      "formule_envisagee",
      "duree_envisagee",
      "contact_proprietaire",
      "latitude",
      "longitude",
      "confidentialite"
    ],
    defaultStatus: "a_moderer"
  },
  investisseurs: {
    table: "investisseurs",
    select: "id,nom,categorie,organisation,territoire_interet,statut,created_at",
    publicQuery: "select=id,nom,categorie,organisation,territoire_interet,statut,created_at&statut=eq.valide&order=created_at.desc",
    allowedPost: ["nom", "categorie", "organisation", "territoire_interet", "contact", "motivation"],
    statusField: "statut",
    defaultStatus: "a_contacter"
  },
  mecenes: {
    table: "mecenes",
    select: "id,nom_structure,type_mecenat,territoire_interet,statut,created_at",
    publicQuery: "select=id,nom_structure,type_mecenat,territoire_interet,statut,created_at&statut=eq.valide&order=created_at.desc",
    allowedPost: ["nom_structure", "type_mecenat", "contribution_envisagee", "territoire_interet", "contact"],
    statusField: "statut",
    defaultStatus: "a_contacter"
  }
};

function resourceFromRequest(req) {
  const url = new URL(req.url, "https://territoiresvivantsfrance.fr");
  const queryResource = url.searchParams.get("resource");
  if (queryResource) return queryResource;
  return url.pathname.split("/").filter(Boolean).pop();
}

module.exports = async function handler(req, res) {
  const resource = resourceFromRequest(req);
  const config = COLLECTIONS[resource];
  if (!config) return sendJson(res, 404, { error: "Ressource API inconnue" });
  return handleCollection(req, res, config.table, config);
};
