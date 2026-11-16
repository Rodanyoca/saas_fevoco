# Acteurs, affiliations et licences — étude CPU du 16 novembre 2026

## Périmètre

Six familles d'acteurs : athlètes, coachs, arbitres, médecins, officiels et autres acteurs. Chargement et enrichissement des affiliations ; aperçu et synthèse des licences d'athlètes ; modèle des licences d'acteurs. Les optimisations précédentes du tableau de bord, de la structure territoriale et du tableau partagé constituent le point de départ.

L'intervention conserve les règles métier et les sources existantes : athlètes liés au club, arbitres sans affiliation, validité des licences, priorité des statuts manuels, historique et libellés résolus à la lecture. Les écritures fraîches, validations serveur, identifiants, permissions, sessions et invalidations ne sont pas remplacés. Aucun formulaire ni champ de date n'a été modifié. Les données synthétiques du banc ne sont jamais envoyées à l'application ou à Google.

## Rapport d'écart et implémentation

| Écart confirmé | Correction |
| --- | --- |
| L'aperçu des licences d'athlètes demandait 19 plages, dont des licences, affiliations, acteurs et référentiels propres à l'entourage. | 9 plages correspondant aux données effectivement consommées ; les cinq classeurs nécessaires restent lus en parallèle. |
| Une fiche d'affiliations convertissait les dates de toutes les personnes avant de filtrer l'acteur demandé. | Filtrage des lignes brutes selon la même colonne d'identité avant le mapper existant et les conversions. Le contrat complet utilisé par les mutations reste intact. |
| Les libellés d'affiliation étaient retrouvés par recherches linéaires répétées dans les structures et référentiels. | Résolveur indexé par instantané de références pour les lectures multiples. La première référence gagne comme avec `find`. Les tableaux vides ne créent pas d'index. Une fiche à une seule ligne conserve la résolution directe. |
| Le modèle de licences d'acteurs recherchait acteur, affiliation, structure, statut et cycle pour chaque ligne. | Index locaux, clés composites incluant type et acteur, priorité de la première correspondance et mêmes valeurs de repli. Le jour de référence est converti une fois. |
| La page Officiels reconstruisait trois fois la hiérarchie territoriale. | Un seul appel à `getTerritorialHierarchy` dans la page. Le contexte indépendant des affiliations officielles reste chargé. |
| Les options de structures Médecins/Officiels utilisaient `findIndex` pour chaque ligne. | Index de première occurrence, puis même filtre des identifiants/noms ; conservation du comportement des doublons et des premières lignes invalides. |
| Les six listes d'acteurs retriaient les résultats à chaque recherche ou filtre. | Tri d'une copie mémorisé selon les lignes ; les recherches filtrent cette copie stable. Une sauvegarde créant un nouveau tableau invalide le tri. |
| Coachs/Arbitres/Officiels parcouraient toutes les licences pour chaque acteur recherché ; Officiels recherchait aussi son premier mandat à chaque fois. | Index des numéros de licences par acteur et du premier mandat, mémorisés selon leurs sources. Les numéros vides, doublons, ordre et recherche sur l'historique sont conservés. |
| La synthèse des licences d'athlètes refiltrait toutes les licences pour chaque club et était reconstruite à l'ouverture d'un éditeur. | Agrégats globaux et par club en un parcours de constitution des groupes, puis comptage ; mémorisation selon la saison. La dernière ligne du couple athlète/saison reste prioritaire, globalement et séparément dans chaque club. |
| L'ouverture d'un éditeur recréait aussi les licences visibles et la collection des clubs. | Mémorisation des collections selon leurs données et filtres réels, pour réutilisation par le tableau partagé. |

La synthèse des licences conserve son critère historique de statut affiché ; elle n'introduit pas une nouvelle règle de validité temporelle. Les calculs temporels du domaine restent contrôlés séparément.

## Reproduction et résultats déterministes

`node --test tests/unit/actors-cpu.test.cjs` échouait avant correction sur deux cas : 19 plages au lieu de 9, et 100 lectures de dates au lieu d'une pour la fiche d'un acteur parmi 100 lignes. Les deux cas passent après correction.

| Mesure du parcours testé | Avant | Après |
| --- | ---: | ---: |
| Plages logiques de l'aperçu des licences d'athlètes | 19 | 9 |
| Dates de début matérialisées sur 100 affiliations, une pertinente | 100 | 1 |
| Reconstructions de la hiérarchie dans la page Officiels | 3 | 1 |
| Demandes de LIGUES observées dans le parcours Officiels, contexte affiliations compris | 4 | 2 |
| Tri et lecture des licences à nouveau lors d'une recherche, source inchangée | Répétés | Index et tri réutilisés |

Les 9 plages ne sont pas un nombre de requêtes HTTP : le cache brut et le regroupement Sheets existaient déjà. L'aperçu utilise toujours les mêmes cinq classeurs ; la réduction concerne les plages et données inutilisées dans leurs lots. Le chargement des options de création, distinct de l'aperçu, reste disponible.

## Benchmark CPU local

Commande reproductible :

```powershell
node scripts/benchmark-actors-cpu.cjs 90e9a0d71dd802c91a277199cc19b7decab6f186
```

Node v24.16.0 ; données synthétiques ; un échauffement par version, cinq échantillons par version, douze répétitions par échantillon, ordre avant/après alterné. Le modèle de licences antérieur est chargé depuis le commit indiqué. Les résolutions directes des affiliations et l'algorithme historique de synthèse servent de références pour les deux autres mesures. L'égalité sérialisée des résultats est vérifiée avant chronométrage. Les callbacks des algorithmes comparés tournent dans des contextes VM comparables.

| Fonction isolée | Jeu de données | CPU médian avant | CPU médian après | Réduction locale |
| --- | --- | ---: | ---: | ---: |
| Modèle des licences acteurs | 2 000 licences, acteurs et affiliations | 734 ms | 578 ms | 21,3 % |
| Libellés d'affiliation | 4 000 affiliations et clubs | 953 ms | 32 ms | 96,6 % |
| Synthèse des licences par club | 10 000 licences, 500 clubs | 1 047 ms | 47 ms | 95,5 % |

CPU bruts avant/après, ms :

- Licences acteurs : `[750,766,702,719,734]` / `[578,578,563,563,609]`.
- Libellés d'affiliation : `[876,968,953,953,1078]` / `[78,63,31,32,31]`.
- Synthèse par club : `[1313,1313,1047,1031,1016]` / `[62,156,47,31,47]`.

Ces mesures portent sur les fonctions et jeux indiqués, hors réseau, rendu React, réponse RSC, authentification et consommation générale de l'application. La granularité CPU Windows, le GC et la charge de la machine influencent les échantillons. Aucune baisse globale de CPU de production n'est affirmée.

## Vérifications

```powershell
node --experimental-transform-types --test tests/unit/actors-cpu.test.cjs tests/unit/actor-search-cpu.test.cjs tests/unit/dashboard-performance.test.cjs tests/unit/territorial-performance.test.cjs tests/unit/territorial-table-cpu.test.cjs lib/actor-affiliation-schema.test.ts lib/affiliations-domain.test.ts lib/actor-licences-model.test.ts lib/licences-domain.test.ts lib/active-actor-licences.test.ts lib/actor-licence-api.test.cjs lib/coach-loading.test.cjs lib/club-actors-loading.test.cjs
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

58 tests distincts réussis. Une première exécution sans `--experimental-transform-types` ne pouvait pas charger les propriétés de paramètres TypeScript du domaine d'affiliations ; elle n'est pas comptée comme un succès. Le domaine a été réexécuté avec l'option adaptée, puis l'ensemble de la sélection a réussi avec cette option. Les sept tests ciblant le chargement et l'équivalence ont été revérifiés après l'ajustement du cas à une seule affiliation.

Les tests couvrent les six vrais composants de listes : recherche sans nouveau tri ni parcours des licences, résultats conservés et invalidation après sauvegarde. Ils vérifient aussi les premières références en double, numéros vides ou répétés, affiliations fédérales sans identifiant d'entité, références orphelines, dates invalides, règles de renouvellement/chevauchement et priorité manuelle des statuts. Les règles et dates sont vérifiées par les suites de domaine existantes ; aucun test de ce lot n'écrit dans Google.

Le banc TypeScript utilise une cible ES2022 pour respecter les itérateurs Map/Set de l'application. Une compilation ES5 sans itération descendante ne convient pas à ces tests. Les index sont locaux à une lecture ou mémorisés dans un composant ; aucun nouveau cache métier partagé n'a été ajouté.

## Limites et écarts restants

- Vérification navigateur indisponible dans cette session. La structure, les contrôles et les styles des interfaces n'ont pas été redessinés. Les tests de composants sont un banc de hooks déterministe, pas une session navigateur.
- Absence de profil CPU/RSS de production, de TTFB et de mesure réseau réelle. Les comparaisons de plages et les microbenchmarks ne prouvent pas une baisse proportionnelle des quotas Google ou de la facture d'hébergement.
- Les feuilles d'affiliations restent téléchargées intégralement : le filtrage précoce évite la conversion et l'enrichissement des autres acteurs, pas le transfert de leurs lignes depuis Sheets.
- Les profils et historiques nécessaires aux fiches restent chargés selon les parcours existants. Les appels de références communs aux pages et mappers peuvent encore être répétés logiquement ; le cache et le regroupement de bas niveau continuent à les absorber.
- Les conversions/validations des dates nécessaires au modèle de licences restent effectuées. Le domaine d'écriture utilise toujours ses sources fraîches et ses contrôles existants.
- Les index et la copie triée demandent une mémoire supplémentaire bornée par la taille des sources. Ils sont reconstruits lors d'une nouvelle source et libérables avec le composant ou le chargement.
- Les plages historiques A:Z/A:ZZ restent compatibles avec les en-têtes existants. Aucun nouvel ordre de colonnes n'a été supposé ni nouveau mapper métier créé.

## Fichiers et composants du lot

- Pages : `app/medecins/page.tsx`, `app/officiels/page.tsx`.
- Six listes : `components/{athletes,coachs,arbitres,medecins,officiels,autres-acteurs}/*-client.tsx` ; synthèse : `components/licences/athlete-licences-client.tsx`.
- Lecteurs/modèles : `lib/licences-overview.ts`, `lib/actor-affiliations.ts`, `lib/actor-affiliation-schema.ts`, `lib/actor-licences-model.ts`.
- Nouveaux utilitaires : `lib/first-index.ts`, `lib/actor-search-index.ts`, `lib/athlete-licence-metrics.ts`.
- Banc : `tests/helpers/dashboard-harness.cjs`, `tests/helpers/actors-cpu-fixtures.cjs`, `tests/unit/actors-cpu.test.cjs`, `tests/unit/actor-search-cpu.test.cjs`, `scripts/benchmark-actors-cpu.cjs` et ce rapport.

Les travaux précédents de connexion, complétude, tableau de bord et territoire sont conservés et séparés dans les rapports correspondants. Aucun commit ni push.
