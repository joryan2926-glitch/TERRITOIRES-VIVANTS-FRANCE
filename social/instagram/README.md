# Visuels Instagram TVF

Ce dossier contient une première bibliothèque de visuels publicitaires pour Territoires Vivants France.

## Contenu

- `instagram-visuals.json` : textes, photos, styles, CTA et couleurs de chaque visuel.
- `exports/` : exports PNG prêts à publier.
- `exports/00-planche-contact.png` : aperçu global de la collection.

## Collection

- 5 visuels pour les pôles TVF.
- 8 visuels pour les actions TVF.
- Format carré Instagram : `1080 x 1080`.

## Modifier un visuel

1. Ouvrir `instagram-visuals.json`.
2. Modifier le titre, l'accroche, le texte, le CTA, l'image ou la couleur d'accent.
3. Relancer :

```powershell
& "C:\Users\jowst\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" scripts\generate-instagram-visuals.py
```

## Règles éditoriales

- Ne pas afficher de faux partenaires.
- Ne pas inventer de chiffres d'impact.
- Ne pas présenter un scénario comme un projet réalisé.
- Utiliser des photos cohérentes avec le sujet du visuel.
- Garder le logo TVF lisible.
