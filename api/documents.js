const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "documents", {
    select: "id,titre,type_document,territoire,storage_path,statut_validation,created_at",
    publicQuery: "select=id,titre,type_document,territoire,storage_path,created_at&statut_validation=eq.valide&order=created_at.desc",
    allowedPost: ["titre", "type_document", "territoire", "storage_path", "description"],
    defaultStatus: "a_moderer"
  });
