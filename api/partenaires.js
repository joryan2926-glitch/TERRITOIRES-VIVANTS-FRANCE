const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "partenaires", {
    select: "id,nom,categorie,territoire,intention,statut,created_at",
    publicQuery: "select=id,nom,categorie,territoire,intention,statut,created_at&statut=eq.valide&order=created_at.desc",
    allowedPost: ["nom", "categorie", "territoire", "contact", "intention"],
    statusField: "statut",
    defaultStatus: "a_valider"
  });
