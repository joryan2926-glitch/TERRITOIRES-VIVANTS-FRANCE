# Territoires Vivants France

Nouvelle base propre du portail Territoires Vivants France.

## Objectif

Présenter TVF comme une association nationale en structuration, claire, crédible et lisible pour :

- collectivités ;
- propriétaires ;
- entreprises ;
- associations ;
- bénévoles et citoyens ;
- financeurs et mécènes.

## Coordonnées publiques

- E-mail : contact@territoiresvivantsfrance.fr
- Téléphone : 06 22 03 93 24
- Siège : 25 rue Élise Gervais, 42000 Saint-Étienne

## Pages publiques

- `index.html`
- `qui-sommes-nous.html`
- `nos-actions.html`
- `nos-poles.html`
- `observatoire.html`
- `saint-etienne.html`
- `agir-avec-nous.html`
- `collectivites.html`
- `proprietaires.html`
- `entreprises.html`
- `benevoles-citoyens.html`
- `financeurs-mecenes.html`
- `partenaires.html`
- `notre-methode.html`
- `impact.html`
- `documents.html`
- `gouvernance.html`
- `kit-media.html`
- `faq.html`
- `contact.html`
- `transparence.html`
- `mentions-legales.html`

## Documents préparatoires

- `documents/dossier-presentation-tvf.md`
- `documents/dossier-contact-tvf.md`
- `documents/dossier-collectivite-tvf.md`
- `documents/dossier-entreprise-mecene-tvf.md`
- `documents/dossier-proprietaire-tvf.md`
- `documents/registre-elements-officiels-en-attente.md`
- `documents/fiche-collectivite.md`
- `documents/cahier-charges-diagnostic-territorial.md`
- `documents/convention-cooperation-territoriale.md`
- `documents/fiche-comite-pilotage.md`
- `documents/plan-action-territorial.md`
- `documents/fiche-proprietaire.md`
- `documents/fiche-bien-solidaire-usage-partage.md`
- `documents/accord-principe-proprietaire.md`
- `documents/scenarios-usage-bien.md`
- `documents/suivi-restitution-bien.md`
- `documents/fiche-entreprise.md`
- `documents/fiche-benevole.md`
- `documents/fiche-financeur.md`
- `documents/fiche-projet.md`
- `documents/fiche-signalement-lieu.md`
- `documents/protocole-qualification-signalement.md`
- `documents/registre-sources-donnees-territoriales.md`
- `documents/fiche-cartographie-territoriale.md`
- `documents/pieces-a-fournir.md`
- `documents/registre-demandes-entrantes.md`
- `documents/accuse-reception-demande.md`
- `documents/grille-instruction-dossier.md`
- `documents/fiche-decision-orientation.md`
- `documents/fiche-audit-terrain.md`
- `documents/autorisation-visite-bien.md`
- `documents/autorisation-droit-image.md`
- `documents/consentement-donnees-personnelles.md`
- `documents/evaluation-securite-site.md`
- `documents/plan-prevention-action-terrain.md`
- `documents/proces-verbal-remise-materiaux.md`
- `documents/fiche-incident-action.md`
- `documents/fiche-mission-benevole.md`
- `documents/consignes-securite-action-terrain.md`
- `documents/feuille-emargement-action.md`
- `documents/compte-rendu-action-terrain.md`
- `documents/budget-previsionnel-projet.md`
- `documents/demande-devis-prestation.md`
- `documents/tableau-comparatif-devis.md`
- `documents/fiche-engagement-depense.md`
- `documents/proces-verbal-reception-prestation.md`
- `documents/registre-financements-appels-projets.md`
- `documents/fiche-eligibilite-financement.md`
- `documents/plan-financement-territorial.md`
- `documents/tableau-cofinancement-projet.md`
- `documents/demande-soutien-financier.md`
- `documents/note-impact-previsionnel.md`
- `documents/suivi-contribution-financeur.md`
- `documents/reporting-financeur.md`
- `documents/ordre-du-jour-reunion-cadrage.md`
- `documents/matrice-risques-projet.md`
- `documents/fiche-territoire-partenaire.md`
- `documents/note-opportunite-territoriale.md`
- `documents/lettre-intention-cooperation.md`
- `documents/courrier-proprietaire-proposition-bien.md`
- `documents/courrier-collectivite-territoire-partenaire.md`
- `documents/courrier-entreprise-contribution.md`
- `documents/courrier-financeur-mecene.md`
- `documents/fiche-partenaire-potentiel.md`
- `documents/protocole-officialisation-partenariat.md`
- `documents/convention-partenariat-association.md`
- `documents/convention-mise-disposition-bien.md`
- `documents/fiche-contribution-entreprise.md`
- `documents/bordereau-don-materiaux.md`
- `documents/convention-mecenat-preparatoire.md`
- `documents/registre-materiaux-reemploi.md`
- `documents/modele-convention.md`
- `documents/grille-impact.md`
- `documents/bareme-priorisation.md`
- `documents/charte-ethique.md`
- `documents/criteres-selection-projets.md`
- `documents/bulletin-adhesion.md`
- `documents/registre-adherents.md`
- `documents/proces-verbal-reunion.md`
- `documents/delegation-pouvoir.md`
- `documents/reglement-interieur-preparatoire.md`
- `documents/registre-suivi-decisions.md`
- `documents/kit-media.md`

## Dossiers PDF prêts à présenter

Les PDF sont générés depuis les documents Markdown :

- `output/pdf/dossier-presentation-tvf.pdf`
- `output/pdf/dossier-collectivite-tvf.pdf`
- `output/pdf/dossier-entreprise-mecene-tvf.pdf`
- `output/pdf/dossier-proprietaire-tvf.pdf`

Tous les modèles opérationnels du dossier `documents/` sont également générés en PDF téléchargeables dans `output/documents/`.

## Génération

Les pages sont générées depuis :

```bash
node scripts/generate-site.js
```

Générer les PDF :

```bash
python scripts/generate-pdf-documents.py
```

## Prévisualisation locale

```bash
node scripts/serve-preview.js
```

Puis ouvrir :

```text
http://127.0.0.1:4173/index.html
```
