const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "investisseurs", {
    select: "id,nom,categorie,organisation,territoire_interet,statut,created_at",
    publicQuery: "select=id,nom,categorie,organisation,territoire_interet,statut,created_at&statut=eq.valide&order=created_at.desc",
    allowedPost: ["nom", "categorie", "organisation", "territoire_interet", "contact", "motivation"],
    statusField: "statut",
    defaultStatus: "a_contacter"
  });
