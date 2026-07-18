# Checklist de test terrain - TVF Mobile V1

## Objectif

Vérifier que la préversion TVF Mobile permet de préparer des demandes exploitables avant connexion complète à TVF OS.

## Prérequis

- Node 20 LTS recommandé.
- Expo Go installé sur téléphone.
- Dossier mobile installé avec `npm install`.
- Variables Supabase facultatives pour un test local.
- SQL `supabase/tvf-mobile-requests.sql` exécuté uniquement si l'enregistrement réel est testé.

## Test 1 - Signalement de lieu

1. Ouvrir TVF Mobile.
2. Cliquer sur `Signaler un lieu`.
3. Choisir une catégorie.
4. Ajouter une photo depuis la galerie.
5. Tester `Utiliser ma position`.
6. Renseigner une adresse ou un repère.
7. Renseigner une description courte.
8. Envoyer.
9. Vérifier le numéro de demande simulé.
10. Vérifier que le récapitulatif indique photo et GPS.

## Test 2 - Proposition de matériaux

1. Cliquer sur `Proposer des matériaux`.
2. Choisir une catégorie.
3. Renseigner quantité, état, lieu de stockage et disponibilité.
4. Ajouter une photo.
5. Envoyer.
6. Vérifier que le flux cible le bucket `materiaux` si Supabase est configuré.

## Test 3 - Proposition de bien

1. Cliquer sur `Proposer un bien`.
2. Sélectionner le type de bien.
3. Renseigner adresse, état général et objectif recherché.
4. Ajouter photo et localisation.
5. Envoyer.
6. Vérifier le récapitulatif.

## Test 4 - Bénévolat

1. Cliquer sur `Devenir bénévole`.
2. Tenter d'envoyer sans les champs obligatoires.
3. Vérifier l'affichage des champs manquants.
4. Compléter nom, e-mail et compétences.
5. Envoyer.

## Test 5 - Contact

1. Ouvrir `Contact`.
2. Tester le lien WhatsApp.
3. Tester l'e-mail.
4. Tester le téléphone.
5. Tester Instagram.

## Test Supabase réel

1. Copier `.env.example` vers `.env`.
2. Renseigner :
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. Exécuter `supabase/tvf-mobile-requests.sql`.
4. Relancer Expo.
5. Déposer un signalement avec photo.
6. Vérifier dans Supabase :
   - table `mobile_requests` ;
   - bucket `signalements` ou `materiaux` ;
   - colonnes `photo_bucket` et `photo_path`.

## Points de vigilance

- Ne jamais utiliser la clé `service_role` dans l'application mobile.
- Ne pas photographier une propriété privée sans autorisation.
- Les demandes mobiles doivent rester qualifiées par TVF avant toute action.
- Les politiques Storage publiques sont prévues pour la préversion et devront être durcies avant diffusion large.