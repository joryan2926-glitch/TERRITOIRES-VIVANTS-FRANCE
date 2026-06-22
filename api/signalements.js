const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "signalements", {
    select: "id,type_signalement,adresse,commune,latitude,longitude,description,photo_url,statut_validation,created_at",
    publicQuery: "select=id,type_signalement,commune,latitude,longitude,description,photo_url,created_at&statut_validation=eq.valide&order=created_at.desc",
    allowedPost: ["type_signalement", "adresse", "commune", "latitude", "longitude", "description", "photo_url", "contact_facultatif"],
    defaultStatus: "a_moderer"
  });
