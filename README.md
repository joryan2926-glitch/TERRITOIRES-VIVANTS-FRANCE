# Territoires Vivants France

Nouvelle base propre du portail Territoires Vivants France.

## Objectif

Présenter TVF comme une association nationale en création, claire, crédible et lisible pour :

- collectivités ;
- propriétaires ;
- entreprises ;
- associations ;
- citoyens ;
- financeurs.

## Pages publiques

- `index.html`
- `qui-sommes-nous.html`
- `nos-actions.html`
- `nos-poles.html`
- `observatoire.html`
- `saint-etienne.html`
- `agir-avec-nous.html`
- `partenaires.html`
- `notre-methode.html`
- `impact.html`
- `documents.html`
- `faq.html`
- `contact.html`
- `transparence.html`
- `mentions-legales.html`

## Documents préparatoires

- `documents/fiche-collectivite.md`
- `documents/fiche-proprietaire.md`
- `documents/fiche-entreprise.md`
- `documents/fiche-projet.md`
- `documents/dossier-presentation-tvf.md`
- `documents/modele-convention.md`
- `documents/grille-impact.md`
- `documents/bareme-priorisation.md`

## Génération

Les pages sont générées depuis :

```bash
node scripts/generate-site.js
```

## Prévisualisation locale

```bash
node scripts/serve-preview.js
```

Puis ouvrir :

```text
http://127.0.0.1:4173/index.html
```
