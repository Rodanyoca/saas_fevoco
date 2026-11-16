# Tableau de bord — écarts et optimisations du 16 novembre 2026

## Périmètre

Optimisation du chargement et des agrégations de `/`, sans changement de présentation, d'authentification, de permissions ou de mutation Sheets. Les données restent réelles dans l'application. Les données synthétiques sont exclusivement utilisées dans les tests et le benchmark hors ligne.

## Diagnostic et rapport d'écart

Le scénario reproductible exécute réellement `DashboardPage`, les chargeurs et les mappers du dépôt. Seule la frontière Google Sheets est remplacée par des lectures contrôlées. Avant modification, `node --test tests/unit/dashboard-performance.test.cjs` échouait sur le budget de lectures : 90 demandes logiques, 42 plages distinctes. La plage territoriale LIGUES était demandée quatre fois, dont trois reconstructions complètes de la hiérarchie et un chargement d'affiliations officielles.

| Écart observé | Correction appliquée |
| --- | --- |
| Trois getters territoriaux reconstruisaient chacun la hiérarchie complète. | Un chargeur de répertoire lit chaque feuille territoriale une fois. Les mappers et filtres d'identifiants/noms existants restent utilisés. |
| Provinces, villes, catégories de clubs, niveaux des coachs, grades des arbitres et spécialités des médecins chargés sans être affichés. | Ces références ne sont plus lues pour le tableau de bord. Le référentiel des sexes est résolu une fois et partagé entre les cinq familles. |
| Les affiliations chargeaient noms d'acteurs, structures, fonctions et transferts, puis construisaient les vues détaillées pour ne compter que les statuts. | Lecture des quatre feuilles d'affiliations et du référentiel des statuts ; réutilisation du lecteur canonique `readAffiliationRow`, sans jointures de détail ni conversions de dates inutilisées. |
| ACTEURS_LICENCES parcourue séparément pour chaque famille ; licences d'athlètes enrichies de clubs courants/historiques ; cycles officiels chargés inutilement. | Une seule lecture et répartition d'ACTEURS_LICENCES. Les mappers de licences, les identifiants de familles centralisés, les statuts et les dates des saisons restent la source de vérité. Aucun calcul de club courant pour une statistique de licences. |
| Fichiers et relations de documents chargés alors que seuls titre/type/date/statut sont affichés. | `loadDocuments({ includeRelations: false })` sur le tableau de bord. Le comportement détaillé par défaut est conservé ailleurs. |
| Plusieurs filtres, allocations intermédiaires et normalisations pour les compteurs d'acteurs. | Une passe par famille pour hommes/femmes/actifs/autres statuts. |
| Validité des licences recalculée dans les filtres actifs et expirés. | Une passe, une conversion de date par licence, une heure de référence commune par agrégation. |
| Copie et tri complet des activités/documents pour afficher cinq lignes. | Sélection stable bornée à cinq éléments : O(5n), mémoire auxiliaire O(5). Ordre identique, y compris les dates égales et vides. |
| Ancien helper de complétude encore présent sans appelant. | Suppression de `completionPercent`. |

Le mécanisme de regroupement `createSheetReadBatcher`, le client Google partagé, le cache Sheets de 30 secondes et ses tags d'invalidation existaient déjà. Ils sont conservés. Aucun cache supplémentaire d'agrégats susceptible de prolonger des données périmées n'a été ajouté. Le tableau de bord ne contient pas de polling : l'actualisation reste déclenchée par l'utilisateur et le bouton est désactivé pendant la transition.

## Résultats mesurés

| Mesure du parcours hors ligne | Avant | Après |
| --- | ---: | ---: |
| Demandes logiques de plages | 90 | 29 |
| Plages distinctes | 42 | 29 |
| Chargements de SEXES au niveau applicatif | Répétés | Un seul, avec alias ACTEURS_SEXE si nécessaire |
| Lectures DOCUMENTS_FICHIERS / DOCUMENTS_RELATIONS | 2 | 0 |

La réduction des demandes logiques est de 67,8 %. Le scénario vide force la compatibilité SEXES → ACTEURS_SEXE ; lorsque SEXES contient des valeurs, le nouveau parcours fait 28 demandes. Il ne s'agit **pas** d'un nombre d'appels HTTP Google : les appels logiques peuvent être satisfaits par le cache, dédupliqués ou regroupés en batchGet. Les quotas et la latence réseau réels ne sont pas mesurés ici.

Benchmark CPU : Node v24.16.0, 50 000 lignes synthétiques, 3 échauffements et 12 répétitions, une exécution locale. Mesure via `process.cpuUsage()`, hors transpilation, réseau, cache Next et rendu React. Les résultats avant/après sont comparés avant chronométrage.

| Agrégation isolée | CPU avant (ms) | CPU après (ms) | Réduction sur cette exécution |
| --- | ---: | ---: | ---: |
| Acteurs | 515 | 437 | 15,1 % |
| Licences | 2 172 | 1 188 | 45,3 % |
| Cinq éléments récents | 672 | 282 | 58,0 % |

Temps écoulés correspondants : acteurs 522,85 → 425,03 ms ; licences 2 166,55 → 1 208,95 ms ; récents 665,50 → 284,04 ms. Les durées varient selon la machine, le GC et sa charge ; ce ne sont ni un SLO ni des pourcentages de gain CPU global du serveur.

## Vérification et reproduction

```powershell
node --test tests/unit/dashboard-performance.test.cjs tests/unit/dashboard-navigation-lifecycle.test.ts
node scripts/benchmark-dashboard.cjs
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

Les tests contrôlent le budget de lectures du parcours complet, l'absence des références invisibles, l'équivalence avec les anciens getters sur les champs affichés, les statuts d'affiliation et de licence, les dates de saisons, l'exclusion des lignes invalides, l'isolation d'une famille d'acteurs indisponible, la stabilité des cinq récents et une seule lecture de validité par licence.

Résultat du lot : 10 tests sur 10 réussis (6 tests de performance/équivalence et 4 de navigation), typecheck, lint, build de production et `git diff --check` réussis. Le benchmark a également vérifié l'égalité des résultats des trois agrégations comparées.

## Limites et écarts restants

- Pas de profil CPU/RSS réel en production, de TTFB ni de capture navigateur : l'outil navigateur n'est pas disponible dans cette session. Aucun gain global de consommation n'est affirmé. Le rendu n'a pas été modifié.
- Les plages historiques A:Z et A:ZZ restent inchangées. Les réduire à des lettres fixes risquerait de tronquer des colonnes après réorganisation ; aucun nouvel ordre de colonnes n'a été supposé. Aucun nouveau mapper ou formulaire métier n'a été créé.
- Les mappers existants construisent encore certains champs non affichés. Les réutiliser évite de dupliquer les règles et alias ; un profil de production doit justifier un éventuel découpage supplémentaire.
- Les compteurs compétitions et équipes nationales utilisent les getters existants pour préserver leurs filtres métier.
- Comme auparavant, une source indisponible peut apparaître vide dans le tableau de bord. Le nouveau répertoire conserve l'isolation des erreurs entre familles d'acteurs. Aucun mécanisme d'autorisation ou de session n'est modifié.
- Le bouton Actualiser conserve la sémantique du cache Sheets existant : ce n'est pas une invalidation forcée de toutes les sources.
- Les préchargements automatiques de navigation et le coût du cadre global ne sont pas mesurés ; ils n'ont pas été modifiés sans preuve de surcoût.

## Fichiers du lot

`app/page.tsx`, `lib/dashboard-directory.ts`, `lib/dashboard-records.ts`, `lib/dashboard-metrics.ts`, `lib/documents.ts`, `tests/helpers/dashboard-harness.cjs`, `tests/unit/dashboard-performance.test.cjs`, `scripts/benchmark-dashboard.cjs`, et ce rapport. Les autres modifications du répertoire de travail proviennent des demandes précédentes. Aucun commit ni push.
