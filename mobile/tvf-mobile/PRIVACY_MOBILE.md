# TVF Mobile - Confidentialite et donnees collectees

Ce document prepare la politique de confidentialite mobile de Territoires Vivants France. Il doit etre relu avant toute diffusion officielle sur Play Store, App Store ou autre canal public.

## 1. Finalite de l'application

TVF Mobile sert a transmettre a Territoires Vivants France des demandes terrain relatives a :

- un lieu vacant ou abandonne ;
- des materiaux reutilisables ;
- un bien propose a l'etude ;
- une candidature benevole ;
- un besoin de contact avec TVF.

Les donnees sont utilisees pour qualifier la demande, recontacter la personne si necessaire, rattacher la demande a TVF OS et preparer une instruction interne.

## 2. Donnees pouvant etre collectees

Selon le parcours choisi, l'application peut traiter :

- nom et prenom ;
- e-mail ;
- telephone ;
- adresse ou localisation du lieu ;
- coordonnees GPS si l'utilisateur les autorise ;
- description libre ;
- type de demande ;
- photos ajoutees volontairement ;
- reference de demande ;
- statut de transmission vers TVF OS.

Aucune donnee de paiement n'est collectee dans TVF Mobile.

## 3. Photos et localisation

Les photos et la localisation sont facultatives mais utiles pour qualifier une demande.

L'utilisateur doit uniquement transmettre des photos prises legalement, sans entrer dans une propriete privee sans autorisation et sans exposer inutilement des personnes reconnaissables.

La localisation est utilisee uniquement pour situer la demande dans le cadre de l'objet de TVF.

## 4. Transmission vers TVF OS

Lorsque la configuration Supabase est active, les demandes sont transmises vers TVF OS via la table `mobile_requests` et, le cas echeant, via les buckets de stockage associes aux photos.

Si l'envoi echoue ou si la configuration n'est pas active, la demande peut rester conservee localement sur le telephone avec sa reference afin de permettre une relance.

## 5. Conservation et suivi

Les donnees transmises sont conservees le temps necessaire a la qualification, a l'instruction, a l'orientation ou a l'archivage de la demande.

Les durees definitives de conservation devront etre precisees dans la politique RGPD officielle de TVF avant publication publique.

## 6. Droits des personnes

Toute personne pourra demander :

- l'acces aux donnees la concernant ;
- la rectification d'informations inexactes ;
- l'effacement lorsque cela est applicable ;
- des informations sur le traitement de sa demande.

Contact : contact@territoiresvivantsfrance.fr

## 7. Points a valider avant publication

Avant diffusion officielle, verifier :

- la politique de confidentialite publique du site ;
- la coherence avec les mentions legales ;
- les durees de conservation ;
- les droits RGPD ;
- la securite Supabase ;
- les regles de stockage photo ;
- le texte des fiches Play Store et App Store.