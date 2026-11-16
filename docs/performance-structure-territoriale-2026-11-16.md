# Structure territoriale — étude CPU et optimisations du 16 novembre 2026

## Périmètre et état initial

Étude des listes et fiches Ligues, Ententes et Clubs, du chargement de leurs relations et du composant de tableau partagé. Ce complément prend comme point de départ le code déjà optimisé, décrit dans `performance-structure-territoriale-2026-11-05.md`. Les gains de cette ancienne intervention ne sont pas attribués à celle-ci.

La lecture unique de la hiérarchie par page, les index de regroupement et le chargement des acteurs de club à l'ouverture de la fiche existaient déjà. Le client Google partagé, le regroupement des plages, la déduplication des lectures simultanées, le cache brut de 30 secondes et les invalidations existantes sont conservés. Le modèle reste Ligue → Entente → Club ; les athlètes restent directement liés au club.

## Rapport d'écart

| Priorité | Écart confirmé | Implémentation du lot |
| --- | --- | --- |
| P1 | Ligues et Ententes chargeaient et transmettaient les profils complets des athlètes, alors que les fiches ne les utilisent que pour des comptages et l'appartenance aux clubs. | `getAthleteTerritorialLinks()` retourne uniquement `idAthlete` et `clubId`. Il réutilise le mapper existant et ses critères de validité, préserve les doublons et n'appelle pas le référentiel des sexes. |
| P1 | Le composant DataTable refiltrait toutes les lignes à chaque rendu, notamment à chaque changement de page ou taille de page. | Mémorisation par données, recherche, filtres et clé d'identité. Changer de page réutilise le résultat ; modifier les données ou les critères l'invalide. |
| P2 | Une recherche vide matérialisait `Object.values` de chaque ligne et lisait les valeurs des profils ; la recherche était remise en minuscules et les filtres reconstruits pour chaque ligne. | Normalisation de la requête et préparation des filtres une fois par calcul. Recherche vide : vérification d'une clé d'identité énumérable, avec compatibilité des objets sans cette clé et des objets vides. Aucun index persistant des profils. |
| P2 | La fiche Entente filtrait les clubs et athlètes et reconstruisait les compteurs lors de chaque rendu de son parent. | Mémorisation des relations selon les collections clubs/athlètes et l'identifiant d'entente. |

Les types des composants Ligues/Ententes et du modèle de hiérarchie acceptent désormais le lien minimal. Le modèle reste générique pour ses appelants qui utilisent encore des athlètes complets. Aucune nouvelle règle de mapping par position, aucun nouveau champ métier, formulaire, endpoint ou changement de permissions.

Le composant DataTable étant partagé, sa correction bénéficie aussi aux autres écrans qui l'utilisent. Son API, sa recherche sur tous les champs, les filtres contrôlés/non contrôlés, la pagination et son rendu restent les mêmes.

## Boucles de reproduction et équivalence

Avant correction, `node --test tests/unit/territorial-performance.test.cjs` échouait sur les deux vraies pages : les props sérialisées contenaient 34 champs de profil au lieu des deux champs nécessaires.

Le test du vrai composant DataTable peut aussi être exécuté contre sa version Git précédente :

```powershell
$env:TERRITORIAL_TABLE_BASELINE='1'
node --test tests/unit/territorial-table-cpu.test.cjs
Remove-Item Env:TERRITORIAL_TABLE_BASELINE
```

Cette version échoue : 100 lectures de champs invisibles pour 100 lignes lors d'une recherche vide, contre zéro avec la correction. Le test réexécute le composant et ses hooks dans un banc déterministe ; il ne prétend pas être une vérification navigateur. Il contrôle également l'absence de nouveau parcours après pagination et l'invalidation lors d'une recherche, d'un filtre contrôlé ou d'un remplacement des données.

Les tests d'équivalence couvrent les lignes valides/invalides, les doublons, les athlètes sans club, la déduplication propre aux fiches ligue, l'appartenance par entente, les diagnostics de parenté et l'ordre. La recherche conserve les résultats des cas vide, majuscules, valeurs numériques, booléens, null/undefined, objets vides et filtres inconnus.

## Mesures locales

Commande : `node scripts/benchmark-territorial-cpu.cjs`.

Jeu synthétique hors application : 10 000 athlètes, 100 clubs, Node v24.16.0, trois échauffements puis 200 répétitions. Les deux lecteurs réels du dépôt sont exécutés avec une frontière Sheets simulée. La projection des anciennes données est comparée exactement au nouveau résultat avant mesure. Les deux callbacks de filtrage sont exécutés dans un contexte VM pour éviter de comparer un callback hôte avec un callback VM.

| Mesure | Avant | Après |
| --- | ---: | ---: |
| Plages logiques du lecteur d'athlètes, SEXES renseigné | 2 | 1 |
| Champs transmis par athlète | 34 | 2 |
| JSON des seuls athlètes, octets UTF-8 | 6 185 671 | 497 891 |
| CPU de sérialisation JSON, 200 répétitions | 3 250 ms | 234 ms |
| Durée de sérialisation | 3 217,70 ms | 245,06 ms |
| CPU du filtrage initial vide, 200 répétitions | 1 922 ms | 375 ms |
| Durée du filtrage initial vide | 1 970,32 ms | 400,51 ms |
| Nouveaux parcours de filtrage lors de la pagination, source/critères inchangés | Un à chaque rendu | Zéro, résultat mémorisé |

Sur cette exécution : **−92,0 % d'octets sur le sous-ensemble athlètes**, **−92,8 % de CPU de sérialisation** et **−80,5 % de CPU de filtrage initial**. Ce sont des microbenchmarks des opérations indiquées, pas une baisse mesurée de la consommation globale de l'application.

La hiérarchie continue à charger les sexes nécessaires à l'affichage des clubs ; seule la lecture logique supplémentaire du lecteur d'athlètes disparaît. Une lecture logique n'est pas nécessairement un appel HTTP : cache et regroupement peuvent déjà la servir sans nouvel appel Google.

Les premières exécutions avec 20 répétitions présentaient une granularité CPU Windows insuffisante, dont un résultat après à zéro. Elles ont servi à ajuster le banc ; le tableau ci-dessus utilise les 200 répétitions finales. Les durées restent sensibles au GC et à la charge de la machine.

## Validation

```powershell
node --test tests/unit/territorial-table-cpu.test.cjs tests/unit/territorial-performance.test.cjs lib/territorial-pages.test.cjs lib/territorial-hierarchy.test.cjs lib/club-actors-api.test.cjs lib/club-actors-loading.test.cjs lib/mappers/territorial.test.mjs tests/unit/dashboard-performance.test.cjs
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

Résultat : **33 tests réussis**, typecheck, lint et build de production réussis. La suite du tableau de bord confirme encore son budget de 29 plages logiques. Les tests Clubs couvrent notamment les licences, le chargement différé et le refus de charger les acteurs d'un club inconnu.

Revue React : hooks inconditionnels, dépendances complètes, mises à jour par nouveaux tableaux après sauvegarde, filtre mémorisé invalidé sur nouvelle source et état contrôlé. Aucun cache de données métier interutilisateurs n'est ajouté.

## Limites et coûts restants

- Aucun profil CPU/RSS de production, aucune mesure TTFB/RSC/HTTP ni capture navigateur : l'outil navigateur n'est pas disponible dans cette session. L'étude ne démontre pas un gain global Vercel ou navigateur.
- Les octets mesurés concernent le JSON des seuls athlètes, pas l'intégralité des props, la réponse RSC ni les octets compressés sur le réseau.
- Les feuilles ATHLETES restent lues avec la plage historique A:ZZ. La réduction porte sur la lecture de référence supplémentaire et les données conservées/transmises ; elle ne réduit pas le nombre de lignes téléchargées chez Google.
- Le mapper existant construit encore temporairement le profil avant la projection minimale. Il conserve les alias et les critères d'admission sans créer un nouveau mapper métier ; son coût résiduel n'est pas présenté comme supprimé.
- Ligues/Ententes préchargent encore les liens de tous les athlètes pour leurs fiches. Le chargement à la demande serait une intervention distincte sur les états de lecture/reprise et les contrats API ; cette étude ne lui attribue aucun gain.
- Les responsables de ligues et les options de formulaires restent chargés suivant le fonctionnement existant. Les références de catégories/sexes du formulaire Clubs ont encore leurs propres traitements, parfois déjà couverts par le cache brut.
- Chaque nouveau texte de recherche parcourt encore les lignes et les champs pertinents. La correction évite les parcours aux rendus sans changement des critères ; elle ne remplace pas la recherche par une pagination serveur.

## Fichiers et composants du lot

- Chargement : `app/ligues/page.tsx`, `app/ententes/page.tsx`, `lib/data.ts`.
- Contrats : `lib/territorial-hierarchy.ts`, `components/ligues/ligues-client.tsx`, `components/ligues/ligue-detail.tsx`, `components/ententes/ententes-client.tsx`, `components/ententes/entente-detail.tsx`.
- Calculs d'interface : `components/dashboard/data-table.tsx`, nouveau `lib/data-table-filter.ts`.
- Preuves : `lib/territorial-pages.test.cjs`, nouveaux `tests/unit/territorial-performance.test.cjs`, `tests/unit/territorial-table-cpu.test.cjs`, `scripts/benchmark-territorial-cpu.cjs` et ce rapport.

Les changements précédents de connexion, tableau de bord et complétude sont conservés dans le répertoire de travail et ne sont pas attribués à ce lot. Aucun commit, push, écriture Google ou changement d'authentification.
