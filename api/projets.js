const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "projets", {
    select: "id,titre,type_projet,commune,description,besoins,statut,created_at",
    publicQuery: "select=id,titre,type_projet,commune,description,besoins,statut,created_at&statut=neq.archive&order=created_at.desc",
    allowedPost: ["titre", "type_projet", "commune", "description", "besoins", "statut"],
    defaultStatus: "a_moderer"
  });
