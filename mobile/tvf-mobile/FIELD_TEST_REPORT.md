# TVF Mobile - Rapport de recette terrain

Document a remplir lors du test reel de TVF Mobile sur telephone avant diffusion a des utilisateurs externes.

## 1. Informations de recette

| Champ | A renseigner |
| --- | --- |
| Date du test |  |
| Testeur |  |
| Telephone utilise |  |
| Version Expo Go |  |
| Mode de connexion | LAN / Tunnel / Build APK |
| Commune de test |  |
| Connexion internet | Wi-Fi / 4G / 5G |
| Variables Supabase actives | Oui / Non |

## 2. Validation rapide

| Point a verifier | Resultat attendu | OK | Commentaire |
| --- | --- | --- | --- |
| L'application s'ouvre | Accueil TVF Mobile visible sans blocage |  |  |
| Logo et interface | Logo lisible, textes visibles, navigation basse stable |  |  |
| Navigation | Accueil, demandes, documents et contact accessibles |  |  |
| Formulaires | Champs obligatoires bloques si vides |  |  |
| Photos | Camera et galerie fonctionnent |  |  |
| GPS | Position recuperee ou message clair si refusee |  |  |
| Supabase | Demande transmise si variables configurees |  |  |
| TVF OS | Demande visible et transformable en dossier |  |  |
| Historique local | Reference visible apres envoi |  |  |
| Renvoi | Une demande non transmise peut etre renvoyee |  |  |

## 3. Parcours Signalement

| Etape | Donnee testee | Resultat attendu | OK | Observation |
| --- | --- | --- | --- | --- |
| Categorie | Logement, commerce, batiment, friche, depot ou autre | Selection visible |  |  |
| Adresse | Rue, quartier ou repere | Adresse affichee dans le recapitulatif |  |  |
| GPS | Autorisation localisation | Coordonnees enregistrees si autorise |  |  |
| Description | Faits observes | Texte conserve dans la demande |  |  |
| Photos | 1 a 4 photos | Apercu visible et nombre correct |  |  |
| Envoi | Envoyer a TVF | Reference generee |  |  |
| TVF OS | Verification backend | Demande visible dans TVF OS |  |  |

Reference creee :  
Commentaire general :  

## 4. Parcours Materiaux

| Etape | Donnee testee | Resultat attendu | OK | Observation |
| --- | --- | --- | --- | --- |
| Categorie | Bois, portes, fenetres, sanitaires, mobilier, etc. | Selection visible |  |  |
| Quantite | Nombre, surface ou volume | Champ conserve |  |  |
| Etat | Neuf, bon etat, a verifier | Champ conserve |  |  |
| Lieu de stockage | Adresse ou commune | Localisation exploitable |  |  |
| Contact | Nom + e-mail ou telephone | Demande envoyable |  |  |
| Photos | Plusieurs photos | Photos jointes ou alerte claire |  |  |
| TVF OS | Verification backend | Demande visible dans TVF OS |  |  |

Reference creee :  
Commentaire general :  

## 5. Parcours Bien propose

| Etape | Donnee testee | Resultat attendu | OK | Observation |
| --- | --- | --- | --- | --- |
| Type de bien | Logement, maison, immeuble, commerce, terrain, friche | Selection visible |  |  |
| Adresse | Adresse precise | Localisation exploitable |  |  |
| Etat general | Vacant, a renover, inutilise | Champ conserve |  |  |
| Objectif | Rendez-vous, pre-etude, orientation | Texte conserve |  |  |
| Contact | Nom + e-mail ou telephone | Demande envoyable |  |  |
| Photos | Photos utiles du bien | Apercu visible |  |  |
| TVF OS | Verification backend | Demande visible dans TVF OS |  |  |

Reference creee :  
Commentaire general :  

## 6. Parcours Benevolat

| Etape | Donnee testee | Resultat attendu | OK | Observation |
| --- | --- | --- | --- | --- |
| Identite | Nom et prenom | Champ obligatoire |  |  |
| E-mail | Adresse valide | Validation active |  |  |
| Telephone | Numero facultatif ou exploitable | Validation simple |  |  |
| Competences | Disponibilites, savoir-faire | Texte conserve |  |  |
| Envoi | Transmettre a TVF | Reference creee |  |  |
| TVF OS | Verification backend | Contact ou demande visible |  |  |

Reference creee :  
Commentaire general :  

## 7. Verification TVF OS

| Element | Resultat attendu | OK | Observation |
| --- | --- | --- | --- |
| Mobile request | Ligne presente dans `mobile_requests` |  |  |
| Contact TVF OS | Contact cree ou rattache |  |  |
| Dossier TVF OS | Dossier cree ou transformable |  |  |
| Piece jointe | Photo stockee si presente |  |  |
| Statut | Statut initial coherent |  |  |
| Reference | Reference identique mobile / TVF OS |  |  |

## 8. Anomalies relevees

| Numero | Ecran | Probleme | Gravite | Correction attendue |
| --- | --- | --- | --- | --- |
| 1 |  |  | Bloquant / Majeur / Mineur |  |
| 2 |  |  | Bloquant / Majeur / Mineur |  |
| 3 |  |  | Bloquant / Majeur / Mineur |  |

## 9. Decision finale

- [ ] Valide pour usage interne TVF
- [ ] Valide pour test terrain limite
- [ ] Valide pour build APK preview
- [ ] A corriger avant diffusion

Decision :  
Responsable validation :  
Date :  
Signature :
## 10. Validation utilisateur du 21/07/2026

Retour utilisateur : "tout fonctionne".

Etat de recette consolide :

| Parcours | Statut | Observation |
| --- | --- | --- |
| Signalement de lieu | Valide utilisateur | Envoi et suivi confirmes en usage reel |
| Proposition de materiaux | Valide utilisateur | Parcours fonctionnel |
| Proposition de bien | Valide utilisateur | Parcours fonctionnel |
| Candidature benevole | Valide utilisateur | Parcours fonctionnel |
| Photos | Valide utilisateur | Ajout photo fonctionnel |
| Localisation / GPS | Valide utilisateur | Localisation fonctionnelle |
| Transmission TVF OS | Valide utilisateur | Remontee confirmee cote usage |
| Ticket de suivi | Valide utilisateur | Reference et suivi exploitables |

Decision : TVF Mobile est valide pour passer en phase APK preview / production candidate, sous reserve des validations manuelles store, RGPD et captures officielles.

Responsable validation : validation utilisateur projet TVF.
Date : 21/07/2026.
