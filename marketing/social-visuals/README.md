# Kit de communication reseaux sociaux TVF

Ce dossier contient une bibliotheque de campagnes publicitaires et editoriales pour Territoires Vivants France.

## Contenu

- `strategie-reseaux-sociaux.md` : strategie globale, publics, messages, cadence, KPI.
- `bibliotheque-campagnes.md` : 20 campagnes avec objectifs, textes, hashtags, carrousels et storyboards Reels.
- `calendrier-editorial-8-semaines.md` : proposition de lancement Instagram.
- `captions.md` : textes de publications prets a adapter.
- `manifest.csv` : inventaire de tous les exports.
- `campaigns.json` : fichier central pour modifier titres, photos, couleurs et CTA.

## Formats generes

- Instagram publication : 1080 x 1080.
- Instagram story : 1080 x 1920.
- Instagram carrousel : 3 slides par campagne en 1080 x 1080.
- Instagram Reel : couverture 1080 x 1920 + storyboard dans la bibliotheque de campagnes.
- Facebook feed : 1200 x 630.
- LinkedIn feed : 1200 x 627.
- X : 1600 x 900.
- TikTok cover : 1080 x 1920.
- Meta Ads square : 1080 x 1080.
- Meta Ads story : 1080 x 1920.

## Fichiers modifiables

Chaque visuel est fourni en deux versions :

- `.jpg` : export pret a publier.
- `.svg` : source modifiable dans Figma, Illustrator, Inkscape ou un editeur de texte.

## Regenerer le kit

Modifier `campaigns.json`, puis lancer :

```powershell
& "C:\Users\jowst\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" scripts\generate-social-visuals.py
```

## Regle de credibilite

Ne pas publier de faux chiffres, faux partenaires, faux financeurs ou projets realises non confirmes. Les formats statistiques sont prevus pour recevoir des donnees sourcees.