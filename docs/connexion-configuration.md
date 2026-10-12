# Configuration de la connexion FEVOCO

## Variables

Ajouter dans .env.local et dans le projet Vercel FEVOCO principal :

- FEVOCO_USERS_SPREADSHEET_ID : identifiant du classeur FEVOCO dédié aux comptes.
- AUTH_SECRET : secret aléatoire propre à FEVOCO, au moins 32 caractères.
- AUTH_TELEMETRY_HMAC_KEY : autre secret aléatoire, au moins 32 caractères.
- GOOGLE_CLIENT_EMAIL et GOOGLE_PRIVATE_KEY : identifiants Google déjà utilisés par FEVOCO ; le compte de service doit accéder au classeur utilisateurs.

Ne jamais publier les valeurs ni réutiliser les secrets ou le classeur du COC. Modifier AUTH_SECRET invalide toutes les sessions. Ces variables sont uniquement serveur, sans préfixe NEXT_PUBLIC.

## Feuilles et en-têtes

L’ordre des colonnes peut changer ; les noms doivent rester exacts.

### USERS

id_user, nom_complet, email, password_hash, type_user, est_super_admin, doit_changer_mot_de_passe, statut, date_creation, date_modification_mot_de_passe, derniere_connexion, session_version, date_expiration_acces_temporaire

type_user : ADMIN ou VIEWER. statut : ACTIF, INACTIF ou BLOQUE. Booléens : TRUE/FALSE. Les instants sont ISO 8601 avec fuseau. session_version est un entier positif. Aucun mot de passe en clair ne doit être ajouté à cette feuille.

### USER_AUTORISATIONS

id_user_autorisation, id_user, id_bloc_autorisation, statut, date_debut, date_fin

Blocs : AUT-SPT, AUT-ADM, AUT-COM. Statut ACTIF/INACTIF ; dates civiles YYYY-MM-DD. Les périodes actives d’un même utilisateur et bloc ne doivent pas se chevaucher.

### AUTH_TENTATIVES

id_tentative, identifiant_hash, ip_hash, date_tentative, resultat, request_id

Résultats : ECHEC, SUCCES, REFUS_BLOCAGE_TEMPORAIRE. L’e-mail et l’adresse réseau ne sont pas conservés en clair.

### JOURNAL_OPERATIONS

id_operation, id_user, action, type_objet, id_objet, date_operation, resultat, request_id, details_non_sensibles

Aucun secret, cookie ou empreinte de mot de passe dans les détails.

## Préparation du classeur

Après désignation du classeur FEVOCO, `npm.cmd run auth:prepare-workbook` inspecte le schéma sans écriture. Ajouter `-- --execute` crée seulement les feuilles absentes et les en-têtes des feuilles vides. Un schéma existant incompatible est refusé ; aucune donnée ni feuille existante n’est écrasée. Aucun compte n’est créé par cette commande.

## Premier super-administrateur

Après vérification du classeur et des en-têtes, lancer depuis fevoco-cible :

~~~powershell
npm.cmd run bootstrap:super-admin -- --id VOL-USR-0001 --nom "Nom réel" --email "adresse-reelle@domaine"
~~~

Cette commande effectue uniquement un contrôle à blanc. Elle refuse une feuille USERS non vide. Pour créer le compte, ajouter --execute dans un terminal interactif et suivre la confirmation du CLI. Le secret temporaire n’est affiché qu’au terminal de l’opérateur, une seule fois, puis doit être remplacé dans les 24 heures. Ne pas le coller dans un rapport ou dans Git.

L’identifiant ci-dessus est un exemple de commande, pas un compte fourni ni inséré. Choisir un identifiant FEVOCO réel conforme au référentiel retenu.

## Vérification

~~~powershell
npm.cmd run test:auth
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd run test:auth:e2e
~~~

La suite navigateur démarre un serveur de production local sur 127.0.0.1:3107 et l’arrête après exécution. Ses variables isolées laissent volontairement le classeur utilisateurs vide, afin de vérifier les refus et l’indisponibilité sans écrire dans des données réelles.

Après configuration, vérifier avec le véritable opérateur : connexion, activation, navigation autorisée, refus d’écriture VIEWER, changement du mot de passe, révocation d’une ancienne session, déconnexion et panne contrôlée de la source. Aucun déploiement de ce lot ne doit être présenté comme une connexion réelle validée avant ces essais.

## Raccordement du classeur fourni

Le 12 octobre 2026, le classeur fourni a ete configure dans `.env.local` de FEVOCO principale. Les deux secrets serveur independants ont ete prepares localement ; aucune valeur confidentielle ne figure dans ce document.

Verification Google Sheets en lecture seule : les quatre feuilles et leurs en-tetes sont conformes. La validation par le repository donne 0 utilisateur, 0 autorisation, 0 tentative et 0 operation. Aucune ecriture distante ni creation de compte n'a ete effectuee.

La creation du premier administrateur attend son nom et son adresse e-mail reels. Le test de connexion reelle reste a effectuer ensuite. Cette configuration locale ne configure pas les variables du projet Vercel.

Controle reproductible sans ecriture et sans affichage de donnees personnelles : `node --experimental-strip-types scripts/check-users-workbook-readonly.mjs`.
