const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "materiaux", {
    select: "id,type,categorie,quantite,etat,localisation,latitude,longitude,photo_url,disponibilite,contact_source,created_at",
    publicQuery: "select=id,type,categorie,quantite,etat,localisation,latitude,longitude,photo_url,disponibilite,created_at&statut_validation=eq.valide&order=created_at.desc",
    allowedPost: ["type", "categorie", "quantite", "etat", "localisation", "latitude", "longitude", "photo_url", "disponibilite", "contact_source"],
    defaultStatus: "a_moderer"
  });
