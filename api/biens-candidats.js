const { handleCollection } = require("./_supabase");

module.exports = (req, res) =>
  handleCollection(req, res, "biens_candidats", {
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
  });
