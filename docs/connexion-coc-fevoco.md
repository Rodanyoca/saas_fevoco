# Connexion FEVOCO — comparaison COC et implémentation

Date : 12 octobre 2026. Projet cible : `fevoco-cible`. Référence : `coc-cible`, consulté sans modification. Le portage de la connexion est explicitement demandé par l’utilisateur ; il remplace, pour ce lot, l’ancienne exclusion de l’authentification dans AGENTS.md.

## Écarts observés avant le lot

| Sujet | COC | FEVOCO avant intervention | Adaptation |
| --- | --- | --- | --- |
| Page login | Composition à deux panneaux, identité et formulaire ; mobile à un panneau | Absente | Même composition, logo et textes FEVOCO ; illustration locale de volleyball |
| Formulaire | E-mail, mot de passe affichable, attente, erreurs et verrou de soumission | Absent | Portage avec navigation complète après pose du cookie |
| Comptes | USERS, ADMIN/VIEWER, statut et super-administrateur | Aucune source configurée | Modèle porté ; classeur FEVOCO à désigner |
| Mots de passe | scrypt versionné, sel aléatoire, accès temporaire 24 h | Aucun mécanisme | Même politique ; activation et changement de mot de passe |
| Session | Cookie HttpOnly signé, 8 h, version vérifiée côté serveur | Absente | Cookie distinct fevoco_session ; aucune session COC réutilisée |
| Autorisations | Blocs explicites datés, contrôle serveur | Pages et API ouvertes | Politique adaptée aux chemins FEVOCO, refus par défaut |
| Navigation | Sections selon droits | Navigation fixe | Une lecture de session par montage du layout, partagée entre menus mobile/ordinateur |
| Tentatives | Dix échecs, blocage 30 min, temporisation progressive | Absentes | Même logique et identifiants pseudonymisés |
| Indisponibilité | Distinction panne / identifiants refusés | Aucune couche auth | 503 et écran dédié ; cookie conservé lors d’une panne |
| Déconnexion / compte | Routes dédiées | Absents | Ajout des actions d’en-tête et de Mon compte |

L’image de délégation du COC n’est pas copiée : elle ne représente pas le volleyball FEVOCO. Une illustration SVG locale remplit la même zone visuelle. Les comptes, secrets et données du COC ne sont jamais transférés.

## Parcours

1. Une personne non connectée est dirigée vers /login. Les API répondent 401.
2. Un secret valide et un compte ACTIF produisent une session signée.
3. Un accès temporaire impose /activation ; les données métier restent inaccessibles.
4. L’activation remplace le secret temporaire, incrémente session_version et renouvelle la session.
5. Un compte AUT-SPT arrive sur / ; un compte AUT-ADM sur /activites ; un compte sans bloc FEVOCO disponible reste sur /mon-compte.
6. VIEWER lit les sections attribuées ; les mutations sont refusées côté serveur. ADMIN écrit dans ses blocs actifs. Le super-administrateur accède à tous les blocs.
7. La déconnexion efface le cookie et effectue une navigation complète vers /login.

## Politique FEVOCO

- AUT-SPT : structures territoriales, acteurs, affiliations, licences, transferts, compétitions et équipes nationales.
- AUT-ADM : activités et documents, dans leur état fonctionnel existant.
- /parametres : réservé au super-administrateur, car cet écran comprend des paramètres généraux.
- AUT-COM est conservé pour compatibilité de modèle ; aucun module de communication n’est inventé.
- /mon-compte : tout compte activé, même sans autorisation métier.
- Tout chemin inconnu est refusé. Les API et les identifiants contenant un point restent protégés.
- Les mutations exigent une origine identique au site. Les scripts HTTP doivent donc envoyer explicitement l’en-tête Origin.
- Les indicateurs d’interface ne remplacent jamais le contrôle d’autorisation serveur. Les boutons métier existants ne sont pas tous remaniés pour VIEWER ; leur API refuse l’écriture.

## Données et lectures

Le classeur est choisi avec FEVOCO_USERS_SPREADSHEET_ID ; GOOGLE_SHEETS_USERS_SPREADSHEET_ID reste un alias de compatibilité. Il n’existe aucun repli vers le classeur COC ou vers une feuille métier FEVOCO.

Les tables du login sont lues en un batchGet. Le mapping utilise les noms d’en-têtes, accepte leur réorganisation et refuse les doublons. Les booléens Google natifs sont normalisés en TRUE/FALSE. Les écritures repèrent la ligne réelle, y compris en présence de lignes vides. Dernière connexion ne réécrit pas les autres colonnes du compte.

Les lectures de sécurité n’utilisent pas le cache métier de 30 secondes. La déduplication ne concerne que les requêtes simultanées ; le cache d’un adaptateur reste limité à son opération et est invalidé après mutation. Une révocation ne dépend donc pas d’une expiration de cache persistant.

## Configuration et amorçage

Voir [la configuration détaillée](connexion-configuration.md) et [.env.auth.example](../.env.auth.example).

Aucun compte réel, accès temporaire ou classeur n’est créé dans ce lot sans désignation de la source FEVOCO. Aucun secret COC n’est copié. Tant que le classeur et les secrets ne sont pas configurés, la page login fonctionne mais une tentative reçoit une indisponibilité explicite ; aucune authentification factice n’est acceptée.

## Vérifications et limites

Les résultats des contrôles sont consignés à la fin de ce rapport après exécution. Les tests unitaires et d’intégration utilisent des adaptateurs mémoire isolés ; ils n’insèrent aucune donnée fictive dans Google Sheets. Les tests navigateur couvrent le rendu login, ses erreurs, le verrou de soumission, la navigation sûre et la protection anonyme des pages/API. La réponse positive simulée du test d’interface ne constitue pas une connexion réelle.

Le parcours réel Google Sheets avec un compte FEVOCO reste à valider après configuration. Une limitation des tentatives portée par Sheets n’est pas atomique entre plusieurs instances Vercel ; elle ne remplace pas un limiteur distribué pour une forte charge. Les modifications simultanées d’un même compte ne disposent pas d’une transaction multifeuille. La création graphique et l’administration des utilisateurs ne font pas partie de cette page login ; l’amorçage du premier compte est fourni par CLI.

## Dépendance Next.js

L’audit a identifié une version Next.js vulnérable, notamment sur serveur Windows. Le correctif est fondé sur les avis officiels [GHSA-p293-qw3h-jr36](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36) et [GHSA-mcj8-r9mp-w47p](https://github.com/vercel/next.js/security/advisories/GHSA-mcj8-r9mp-w47p). Le résultat de la mise à jour et l’audit final sont consignés avec les vérifications.

## Résultats exécutés

- Build de production Next.js 16.3.8 : réussi. La configuration héritée ignore la validation TypeScript pendant le build ; `npx tsc --noEmit` a donc été exécuté séparément avec succès.
- ESLint sur app, components, lib, proxy, configuration Playwright, scripts et tests : aucune erreur.
- Tests d’authentification : 68 réussis. Les deux tests du mapping ont également été rejoués après la prise en compte des colonnes vides.
- Suite métier existante : réussie avec `node --experimental-transform-types --test lib/*.test.ts lib/*.test.cjs`. Le flag est nécessaire à la syntaxe TypeScript déjà présente dans affiliations-domain.ts ; aucune modification métier n’a été faite pour contourner ce besoin.
- Quatre scénarios Playwright : réussis en production. Résolutions inspectées : 1440 × 1000, 390 × 844, 320 × 640 et 844 × 390.
- Audit npm après corrections compatibles des dépendances : zéro vulnérabilité signalée.
- `git diff --check` : réussi.
- Serveur de vérification arrêté après les tests. Aucun commit ni push de ce lot.

Les tests ont notamment révélé et couvert la normalisation des adresses locales par Next : la vérification d’origine et les redirections conservent maintenant l’autorité publique du navigateur. Le script public de Vercel Analytics reste accessible sans être redirigé vers du HTML de connexion. Sur mobile, le document défile naturellement pour éviter de tronquer le formulaire en paysage.

### Captures inspectées

Les champs des captures contiennent exclusivement des valeurs de test isolées, jamais des comptes créés.

- [Ordinateur](connexion-qa/login-1440x1000.png)
- [Téléphone](connexion-qa/login-390x844.png)
- [Téléphone étroit](connexion-qa/login-320x640.png)
- [Paysage](connexion-qa/login-844x390.png)

## Fichiers du lot

La page, les styles et l’illustration se trouvent dans app/login et public/images/login. Les parcours complémentaires sont dans app/activation, app/mon-compte, app/acces-refuse et app/service-indisponible. Les routes de compte sont dans app/api/auth. Le moteur est dans lib/auth, lib/auth.ts, lib/users et lib/audit ; le client HTTP est lib/api/client.ts. Les modules COC correspondants ont été portés puis adaptés aux noms de cookie, variables, routes et mappings FEVOCO.

Les composants de navigation modifiés sont dashboard-layout.tsx, sidebar.tsx et header.tsx ; account-menu.tsx est ajouté. Les scripts préparent le schéma et amorcent le premier compte sans aucune exécution distante automatique. Les tests sont dans tests/unit, tests/integration et tests/e2e/auth. Les changements next-env.d.ts sont générés par la version corrigée de Next.

Le diff Git ci-dessous ne comptabilise que les fichiers déjà suivis ; les nouveaux dossiers sont visibles dans l’état Git. Les anciens dossiers QA et test-results étaient déjà présents avant ce lot et ne sont pas ajoutés à sa portée.

### git diff --stat

~~~text
 .gitignore                                |   4 +
 components/dashboard/dashboard-layout.tsx |  20 +-
 components/dashboard/header.tsx           |   3 +-
 components/dashboard/sidebar.tsx          |  14 +-
 next-env.d.ts                             |   1 +
 package-lock.json                         | 737 +++++++++++++++++-------------
 package.json                              |   9 +-
 7 files changed, 450 insertions(+), 338 deletions(-)
~~~

### git status --short

~~~text
 M .gitignore
 M components/dashboard/dashboard-layout.tsx
 M components/dashboard/header.tsx
 M components/dashboard/sidebar.tsx
 M next-env.d.ts
 M package-lock.json
 M package.json
 M tsconfig.json
?? .env.auth.example
?? app/acces-refuse/
?? app/activation/
?? app/api/auth/
?? app/login/
?? app/mon-compte/
?? app/service-indisponible/
?? components/dashboard/account-menu.tsx
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/audit-visuel-competitions/
?? docs/autres-acteurs-qa/
?? docs/clubs-version-qa/
?? docs/coachs-qa/
?? docs/competition-detail-qa/
?? docs/competition-distinctions-cnac-qa/
?? docs/competition-equipes-affichage-qa/
?? docs/competition-equipes-colonnes-qa/
?? docs/competition-equipes-modification-qa/
?? docs/competition-equipes-qa/
?? docs/competition-phases-qa/
?? docs/connexion-coc-fevoco.md
?? docs/connexion-configuration.md
?? docs/connexion-qa/
?? docs/entourage-qa/
?? docs/medecins-qa/
?? docs/officiels-qa/
?? lib/api/
?? lib/audit/
?? lib/auth.ts
?? lib/auth/
?? lib/users/
?? playwright.auth.config.ts
?? proxy.ts
?? public/images/
?? scripts/
?? test-results/
?? tests/
~~~

## Raccordement du classeur fourni

Le 12 octobre 2026, le classeur fourni a ete configure dans `.env.local` de FEVOCO principale. Les deux secrets serveur independants ont ete prepares localement ; aucune valeur confidentielle ne figure dans ce document.

Verification Google Sheets en lecture seule : les quatre feuilles et leurs en-tetes sont conformes. La validation par le repository donne 0 utilisateur, 0 autorisation, 0 tentative et 0 operation. Aucune ecriture distante ni creation de compte n'a ete effectuee.

La creation du premier administrateur attend son nom et son adresse e-mail reels. Le test de connexion reelle reste a effectuer ensuite. Cette configuration locale ne configure pas les variables du projet Vercel.

Controle reproductible sans ecriture et sans affichage de donnees personnelles : `node --experimental-strip-types scripts/check-users-workbook-readonly.mjs`.
