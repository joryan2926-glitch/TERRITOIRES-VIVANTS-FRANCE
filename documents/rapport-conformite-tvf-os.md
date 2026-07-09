# Rapport de conformité TVF OS

Date : 2026-07-09  
Objet : comparaison entre les dossiers de cadrage TVF OS et l'implémentation présente dans le dépôt Territoires Vivants France.

Documents de référence :

- `documents/cahier-des-charges-tvf-os.md`
- `documents/dossier-conception-ux-ui-tvf-os.md`
- `documents/dossier-architecture-technique-tvf-os.md`

## 1. Synthèse exécutive

TVF OS suit la logique générale des dossiers : recevoir, qualifier, instruire, documenter, décider, agir, mesurer et capitaliser. Le dépôt contient déjà un socle modulaire avancé avec une interface admin, une session sécurisée, des modules métiers, une API centralisée, des migrations Supabase par domaine et des tests API par module.

L'état actuel correspond à un socle pré-MVP avancé. Il permet de structurer les modules et de préparer l'usage opérationnel, mais il ne doit pas encore être présenté comme le logiciel métier complet décrit dans les dossiers. Les écarts principaux concernent les permissions fines, la RLS réellement vérifiée, les workflows complets, l'audit transversal, l'IA gouvernée et la profondeur des fiches métier.

## 2. Conformité globale par axe

| Axe du dossier | État actuel | Niveau | Commentaire |
|---|---|---|---|
| Vision TVF OS | Présente | Conforme | La logique de centre opérationnel national est bien reprise. |
| Navigation métier | Présente | Conforme à renforcer | Les modules principaux sont présents et regroupés par usage. |
| Demandes entrantes | Présent | Partiel avancé | Réception, qualification et conversion existent, mais les workflows doivent être verrouillés. |
| CRM contacts / organisations | Présent | Partiel avancé | Le CRM existe, mais consentement, doublons, historique et rattachements doivent être consolidés. |
| Dossiers | Présent | Partiel | Les dossiers existent, mais la fiche complète avec onglets, décisions, risques, pièces et timeline doit être renforcée. |
| Tâches / agenda / projets | Présent | Partiel | Le suivi existe, mais le moteur de workflow n'est pas encore complet. |
| Documents / modèles | Présent | Partiel avancé | Les documents et modèles existent, mais versioning, validation, génération et stockage privé doivent être confirmés. |
| Procédures | Présent | Partiel | La base est là, mais l'application directe aux dossiers doit être systématisée. |
| Connaissances | Présent | Partiel | Le module existe, mais la capitalisation validée et sourcee reste à approfondir. |
| Assistant IA | Présent | Préparé | Le module existe, mais l'IA n'est pas encore le copilote transversal gouverné décrit dans les dossiers. |
| Antennes | Présent | Partiel | La gestion existe, mais le cycle maturité / lancement / supervision doit être renforcé. |
| Cartographie / observatoire | Présent | Préparé | Les modules existent, mais les données, couches, confidentialité et sources restent à sécuriser. |
| Finances / mécénat | Présent | Préparé | Le module existe, mais il doit être connecté à des budgets, justificatifs et reporting réels. |
| Impact | Présent | Préparé | L'écran existe, mais les indicateurs doivent rester rattachés à des preuves validées. |
| Gouvernance / risques | Présent | Partiel | Les modules existent, mais le registre des décisions et l'audit doivent devenir transversaux. |
| Utilisateurs / rôles | Présent | Partiel | L'interface existe, mais les permissions fines restent à connecter au modèle cible. |
| Sécurité | Présente | À renforcer | Session admin et token existent ; il reste à vérifier RLS, rôles, MFA futur et journal d'audit. |
| API | Présente | Conforme à l'architecture Vercel | Les endpoints sont regroupés sous `api/admin/[module].js`, avec rewrites. |
| Tests | Présents | Bon socle | Des tests API existent par module, à compléter par tests d'intégration et RLS. |

## 3. Ce qui a été fait dans le dépôt

### Interface TVF OS

- Accueil admin `admin.html`.
- Dashboard `dashboard.html`.
- Navigation admin partagée `admin-nav.js`.
- Modules : demandes, CRM, dossiers, documents, e-mails, tâches, antennes, gouvernance, risques, utilisateurs, paramètres, IA, cartographie, observatoire, finances, impact, procédures, connaissances.

### Backend et routes

- Fonction centralisée `api/admin/[module].js`.
- Rewrites Vercel pour garder les anciennes routes lisibles du type `/api/admin-documents` sans dépasser la limite de fonctions.
- API contact publique conservée à part.
- Dashboard API conservée à part.

### Données et Supabase

- Scripts Supabase par module TVF OS.
- Scripts de vérification par module.
- Scripts de données de test par module.
- Architecture compatible avec une montée progressive.

### Tests

- Tests API pour les modules admin principaux.
- Tests dashboard.
- Tests environnement réel dashboard.

## 4. Écarts prioritaires restants

### Priorité 1 - Sécurité et accès

- Remplacer progressivement le token admin global par une vraie authentification Supabase Auth.
- Activer les rôles : super admin, admin national, responsable antenne, référent pôle, chargé dossier, contributeur, auditeur.
- Vérifier les policies RLS de chaque table.
- Ajouter un journal d'audit transversal obligatoire.

### Priorité 2 - Demande vers dossier

- Verrouiller le workflow : reçue, à compléter, en qualification, rendez-vous, à instruire, acceptée, réorientée, refusée, clôturée.
- Générer un numéro unique visible.
- Créer automatiquement les tâches de qualification.
- Préparer l'accusé de réception et les pièces manquantes.

### Priorité 3 - Fiche dossier complète

- Ajouter une lecture unifiée : résumé, prochaine action, responsable, priorité, score de maturité.
- Structurer les onglets : aperçu, informations, tâches, documents, échanges, décisions, risques, historique.
- Relier chaque décision à une preuve, une date et un responsable.

### Priorité 4 - Documents et modèles

- Séparer clairement pièces, documents officiels, modèles, versions et exports.
- Prévoir statut : brouillon, à valider, validé, remplacé, archivé.
- Relier les documents aux dossiers, demandes, projets, antennes et organisations.
- Préparer les liens signés Supabase Storage.

### Priorité 5 - IA gouvernée

- Chaque suggestion IA doit afficher : proposition, justification, sources, niveau de confiance, action attendue.
- Toute action engageante doit rester validée par un humain.
- Les corrections humaines doivent être journalisées.
- Les suggestions acceptées ou refusées doivent alimenter l'amélioration du système.

## 5. Décision de cadrage recommandée

Le MVP TVF OS doit se concentrer sur 5 modules réellement utilisables avant d'élargir :

1. Demandes entrantes.
2. CRM contacts / organisations.
3. Dossiers.
4. Tâches / agenda.
5. Documents / modèles.

Les autres modules peuvent rester préparés, mais ne doivent pas être considérés comme pleinement opérationnels tant que le socle demande-dossier-document-audit n'est pas verrouillé.

## 6. Conclusion

TVF OS est bien orienté et respecte l'esprit des dossiers. La base actuelle est cohérente avec la vision d'une plateforme interne nationale, mais la prochaine étape doit être la consolidation métier : sécurité, rôles, workflows, dossiers, documents, audit et preuves.

Le principe directeur reste : aucune automatisation ne doit remplacer la validation humaine ; TVF OS doit organiser, tracer, proposer et sécuriser.