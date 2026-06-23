# Audit de professionnalisation du contenu TVF

## Constat initial

- 93 pages HTML sont présentes dans le site Territoires Vivants France.
- Les pages étaient structurellement cohérentes, mais plusieurs contenus restaient trop courts pour un positionnement de plateforme nationale.
- Les pages stratégiques manquaient d'analyse territoriale, de données publiques récentes, de sources citées, d'exemples pédagogiques et de FAQ.
- Certains blocs présentaient des fonctionnalités futures sans expliquer les enjeux, les garanties, la méthode de validation ou les limites des données.

## Corrections appliquées

- Ajout d'un socle documentaire sur l'ensemble des pages HTML.
- Enrichissement approfondi des pages liées aux logements vacants, commerces inoccupés, friches, matériaux de réemploi, insertion, observatoire, financement, antennes locales et Vision France 2035.
- Ajout d'introductions analytiques, états des lieux, enjeux économiques, sociaux et environnementaux, solutions concrètes et rôle de TVF.
- Ajout de chiffres clés nationaux, graphiques HTML/CSS, cartes prévues, FAQ et encadrés pédagogiques.
- Ajout d'exemples fictifs clairement identifiés comme pédagogiques, sans les présenter comme des projets réalisés.
- Ajout de listes de sources publiques en bas des blocs documentaires.
- Harmonisation visuelle avec les classes `doc-section`, `data-grid`, `analysis-note`, `chart-panel`, `map-sketch`, `example-quote` et `source-list`.
- Ajout d'une couche rédactionnelle longue sur les 93 pages avec les classes `longform-section`, `longform-grid`, `module-detail-grid`, `longform-path` et `longform-note`.
- Développement des textes de modules par famille de page : habitat, commerces, friches, matériaux, insertion, observatoire, financement, engagement, plateforme, partenariats, antennes et pages institutionnelles.
- Clarification des parcours utilisateurs : signaler, proposer, qualifier, valider, financer, suivre, publier et mesurer.
- Renforcement des garanties éditoriales : transparence, modération, protection des données, absence de fausses promesses et distinction entre projet préparé, projet qualifié et résultat vérifié.

## Sources publiques utilisées

- Zéro Logement Vacant : logements vacants de plus de deux ans, propriétaires contactés, collectivités mobilisées et surfaces sorties de vacance.
- Cartofriches / Cerema : projets candidats et soutenus par le Fonds friches, surfaces visées, friches polluées, données et API de repérage.
- SDES / Ministère de la Transition écologique : bilan 2020 de la production de déchets, dont déchets minéraux de construction et valorisation matière.
- Portail national de l'artificialisation des sols : objectif ZAN 2050 et trajectoire de sobriété foncière.
- ANCT : Action coeur de ville, Petites villes de demain, communes concernées et enveloppes nationales annoncées.
- INSEE : pauvreté 2023, taux de chômage localisés au 1er trimestre 2026.

Ces données sont présentées comme des repères nationaux de contexte, jamais comme des résultats propres à Territoires Vivants France.

## Pages stratégiques renforcées

- `action-logements-vacants.html`
- `action-commerces-inoccupes.html`
- `action-espaces-abandonnes.html`
- `action-materiaux-reemploi.html`
- `action-solidarite-insertion.html`
- `observatoire-national.html`
- `observatoire-patrimoine-vacant.html`
- `financer-projets.html`
- `antennes-locales.html`
- `vision-france-2035.html`
- pages associées aux pôles, à la banque de matériaux, au financement solidaire, aux antennes et aux espaces opérationnels.

## Chiffres clés intégrés

- Plus d'un million de logements vacants depuis plus de deux ans recensés en 2020.
- Plus de 100 000 propriétaires contactés via Zéro Logement Vacant.
- Plus de 1000 collectivités mobilisées sur Zéro Logement Vacant.
- 400 000 m² de surfaces sorties de la vacance via Zéro Logement Vacant.
- 2999 projets candidats aux premières éditions du Fonds friches.
- 1382 projets soutenus par le Fonds friches.
- 3375 hectares de friches visés par les projets soutenus.
- 310 millions de tonnes de déchets produits en France en 2020.
- 66 % de déchets minéraux issus de la construction.
- 15,4 % de taux de pauvreté en 2023 selon l'INSEE.
- 244 communes Action coeur de ville.
- 1646 communes Petites villes de demain.

## Garde-fous éditoriaux

- Aucun faux partenaire.
- Aucun faux financeur.
- Aucun faux projet réalisé.
- Aucun chiffre d'impact TVF inventé.
- Les témoignages ajoutés sont exclusivement des exemples fictifs signalés comme tels.
- Les données d'impact propres à TVF doivent être publiées uniquement après enregistrement, validation et datation dans Supabase.

## Validation statique

- 93 pages contrôlées.
- Aucun lien interne cassé.
- Aucune image locale manquante.
- Balises SEO de base présentes.
- Un bloc d'enrichissement professionnel et/ou documentaire présent sur chaque page.
- 93 sections rédactionnelles longues ajoutées et contrôlées.
- Identifiants HTML des sections longues vérifiés.
- Contrôle linguistique des nouveaux blocs effectué pour supprimer les principaux restes ASCII visibles.
