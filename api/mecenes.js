const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "mecenes", {
    select: "id,nom_structure,type_mecenat,territoire_interet,statut,created_at",
    publicQuery: "select=id,nom_structure,type_mecenat,territoire_interet,statut,created_at&statut=eq.valide&order=created_at.desc",
    allowedPost: ["nom_structure", "type_mecenat", "contribution_envisagee", "territoire_interet", "contact"],
    statusField: "statut",
    defaultStatus: "a_contacter"
  });
