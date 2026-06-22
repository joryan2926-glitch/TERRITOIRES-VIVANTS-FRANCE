const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "territoires", {
    select: "id,nom,type_territoire,region,departement,statut,created_at",
    publicQuery: "select=id,nom,type_territoire,region,departement,statut,created_at&order=nom.asc",
    allowedPost: ["nom", "type_territoire", "region", "departement", "statut"],
    statusField: "statut",
    defaultStatus: "prefiguration"
  });
