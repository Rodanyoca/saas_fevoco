# Athlètes : licence active et lectures dynamiques

Date : 8 octobre 2026. Périmètre : `/athletes` et sa vue détaillée.

La colonne Licence utilise les licences `ATHLETE_LICENCES` déjà transmises avec la page. Le tableau et les cartes mobiles affichent le numéro sélectionné par la fonction commune aux coachs : statut actif, dates valides, période contenant le jour courant à Kinshasa, bornes incluses. Aucun chargement par ligne. La recherche reconnaît aussi le numéro actif ; son placeholder l'indique.

Les affiliations initialement chargées étaient devenues inutilisées : le détail utilise `AffiliationsPanel`. Suppression du chargement initial, de l'état associé, du fetch systématique à l'ouverture du détail et du callback après enregistrement qui rechargeait ce même état inutilisé. Le panneau continue de charger ses données à l'ouverture de l'onglet, de mettre à jour son état après mutation et d'actualiser la page.

Le regroupement commun des lectures Google et le cache existant sont réutilisés sans modification supplémentaire. La page ne charge plus que les athlètes, leurs licences et les sexes.

## Correction du mapping saisonnier (8 octobre 2026)

Le signalement suivant a permis de reproduire un défaut du premier lot : deux licences au statut STL001 et liées à SAI006 existaient, mais aucune ne passait le filtre actif. ATHLETE_LICENCES ne possède pas de colonnes date_debut_validite/date_fin_validite. La validité est portée par SAISON.date_debut/date_fin. La réutilisation du filtre coach sans cette jointure était incorrecte.

Correction : getAthleteLicences charge SAISON en parallèle, joint id_saison et transmet la période au mapper athlète. Cette lecture rejoint le lot des référentiels : toujours trois appels Sheets à froid dans le test des chargeurs, puis zéro avec cache valide. Aucun changement des licences ou saisons Google.

Régression reproduite avant correction avec le chargeur et le mapper réels : licence de saison courante absente. Après correction, elle est sélectionnée et celle de saison passée est exclue. Cinq tests, TypeScript, ESLint et build passent. Playwright avec Google réel confirme deux licences affichées, recherche par numéro, bureau/mobile et zéro appel API de données supplémentaire. Une ancienne lecture a d’abord été servie par le cache existant ; la vérification passe après revalidation et rechargement. Les captures liées ci-dessous sont actualisées. Serveur temporaire arrêté.

Fichiers de cette correction : lib/actor-records.ts, lib/mappers/actor-records.ts, lib/coach-loading.test.cjs et ce rapport. Aucun changement visuel ni commit. Les observations du premier passage ci-dessous sont historiques ; la vérification initiale sans jointure ne permettait pas de conclure à l’absence de licences actives.

## Vérifications

- Cinq tests passent : trois tests communs de sélection active et deux tests des chargeurs réels coachs/athlètes avec transport Google simulé.
- Athlètes : trois lectures groupées à froid (acteurs, licences, référentiels), zéro lecture au deuxième chargement avec cache valide. Les lectures fraîches restent indépendantes. Ce compte exclut OAuth, les retries et les référentiels absents.
- TypeScript indépendant, ESLint ciblé, build de production et vérification du diff passent.
- Playwright sur l'application réelle, Google en lecture seule : liste, ouverture du détail général, onglet Licence et retour à la liste sans requête API de données supplémentaire ; bureau 1440 × 1000 et mobile 390 × 844 sans débordement ni erreur JavaScript.
- La source ne comporte actuellement aucune licence d'athlète active. Les captures vérifient donc l'état sans licence ; l'affichage d'un numéro actif et sa sélection reposent sur la fonction commune testée et déjà vérifiée sur les coachs. La recherche par numéro actif n'a pas pu être exercée sur des données réelles d'athlètes.
- Aucune écriture Google ; serveur temporaire 3100 arrêté après vérification.

Captures inspectées : [bureau](athletes-qa/licence-desktop.png), [mobile](athletes-qa/licence-mobile.png).

## Fichiers du lot

- `app/athletes/page.tsx` : chargement initial réduit.
- `components/athletes/athletes-client.tsx` : sélection active en mémoire, recherche, suppression des requêtes inutilisées.
- `components/athletes/athletes-table.tsx` : numéro actif dans la colonne et les cartes existantes.
- `components/athletes/athletes-filters.tsx` : placeholder de recherche.
- `components/athletes/athlete-detail.tsx` : suppression des props et du callback inutilisés.
- `lib/coach-loading.test.cjs` : couverture étendue aux chargeurs athlètes.

Aucun nouveau composant visuel porté. Aucun commit. L'état Git ci-dessous inclut les changements préexistants conservés.

### git diff --stat

```text
 AGENTS.md                                          |   6 ++
 app/api/athletes/[id]/affiliations/route.ts        |   8 ++
 app/api/coachs/[id]/affiliations/route.ts          |  18 ++--
 app/api/medecins/[id]/affiliations/route.ts        |  18 ++--
 app/api/officiels/[id]/affiliations/route.ts       |  18 ++--
 app/athletes/page.tsx                              |  10 +--
 app/clubs/page.tsx                                 |  12 +--
 app/coachs/page.tsx                                |  19 ++--
 app/licences/entourage/page.tsx                    |   9 +-
 app/licences/page.tsx                              |   3 +-
 components/actors/actor-table.tsx                  |   2 +-
 components/actors/record-sections.tsx              |  70 +++++++--------
 components/arbitres/arbitres-table.tsx             |   7 +-
 components/athletes/athlete-detail.tsx             |  32 ++-----
 components/athletes/athletes-client.tsx            |  33 ++-----
 components/athletes/athletes-filters.tsx           |   2 +-
 components/athletes/athletes-table.tsx             |   4 +-
 components/autres-acteurs/autre-acteur-detail.tsx  |   9 +-
 components/autres-acteurs/autres-acteurs-table.tsx |   4 +-
 components/clubs/club-detail.tsx                   |  51 +++++++----
 components/clubs/clubs-client.tsx                  |  11 +--
 components/coachs/coach-detail.tsx                 |  46 +++++-----
 components/coachs/coach-licence-form-dialog.tsx    |  64 -------------
 components/coachs/coachs-client.tsx                |  37 ++------
 components/coachs/coachs-table.tsx                 |   5 +-
 components/competitions/competition-detail-v2.tsx  |   4 +-
 components/dashboard/data-table.tsx                |   2 +-
 components/ententes/entente-detail.tsx             |   2 +-
 components/ententes/entente-form-dialog.tsx        |   4 +-
 components/licences/actor-licences-client.tsx      |  58 ++++++++++--
 components/licences/athlete-licences-client.tsx    |  55 ++++++++++--
 components/ligues/ligue-detail.tsx                 |   7 +-
 components/ligues/ligue-form-dialog.tsx            |   8 +-
 components/ligues/ligues-client.tsx                |   1 -
 components/medecins/medecin-detail.tsx             |  12 +--
 components/medecins/medecins-table.tsx             |   2 +-
 components/officiels/officiel-detail.tsx           |  12 +--
 components/officiels/officiels-table.tsx           |   4 +-
 components/transferts/transferts-table.tsx         |   2 +-
 components/ui/search-select.tsx                    |   4 +-
 lib/actor-records.ts                               |  20 ++---
 lib/affiliations-domain.test.ts                    |  45 ++++++++++
 lib/affiliations-domain.ts                         |  47 +++++-----
 lib/compact-date.test.mjs                          |  20 ++++-
 lib/compact-date.ts                                |  91 +++++++++++++++----
 lib/google-sheets.ts                               |  46 ++++++++--
 lib/licences-domain.test.ts                        | 100 +++++++++++++++++++++
 lib/licences-domain.ts                             |  63 ++++++++++++-
 lib/licences-overview.ts                           |  16 ++--
 lib/mappers/actor-records.ts                       |   5 +-
 lib/mappers/ententes.ts                            |   1 -
 lib/mappers/ligues.ts                              |   2 -
 lib/mappers/territorial.test.mjs                   |  14 +--
 lib/territorial-mutations.ts                       |  23 +----
 lib/types.ts                                       |   3 -
 55 files changed, 703 insertions(+), 468 deletions(-)
```

### git status --short

```text
 M AGENTS.md
 M app/api/athletes/[id]/affiliations/route.ts
 M app/api/coachs/[id]/affiliations/route.ts
 M app/api/medecins/[id]/affiliations/route.ts
 M app/api/officiels/[id]/affiliations/route.ts
 M app/athletes/page.tsx
 M app/clubs/page.tsx
 M app/coachs/page.tsx
 M app/licences/entourage/page.tsx
 M app/licences/page.tsx
 M components/actors/actor-table.tsx
 M components/actors/record-sections.tsx
 M components/arbitres/arbitres-table.tsx
 M components/athletes/athlete-detail.tsx
 M components/athletes/athletes-client.tsx
 M components/athletes/athletes-filters.tsx
 M components/athletes/athletes-table.tsx
 M components/autres-acteurs/autre-acteur-detail.tsx
 M components/autres-acteurs/autres-acteurs-table.tsx
 M components/clubs/club-detail.tsx
 M components/clubs/clubs-client.tsx
 M components/coachs/coach-detail.tsx
 D components/coachs/coach-licence-form-dialog.tsx
 M components/coachs/coachs-client.tsx
 M components/coachs/coachs-table.tsx
 M components/competitions/competition-detail-v2.tsx
 M components/dashboard/data-table.tsx
 M components/ententes/entente-detail.tsx
 M components/ententes/entente-form-dialog.tsx
 M components/licences/actor-licences-client.tsx
 M components/licences/athlete-licences-client.tsx
 M components/ligues/ligue-detail.tsx
 M components/ligues/ligue-form-dialog.tsx
 M components/ligues/ligues-client.tsx
 M components/medecins/medecin-detail.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiel-detail.tsx
 M components/officiels/officiels-table.tsx
 M components/transferts/transferts-table.tsx
 M components/ui/search-select.tsx
 M lib/actor-records.ts
 M lib/affiliations-domain.test.ts
 M lib/affiliations-domain.ts
 M lib/compact-date.test.mjs
 M lib/compact-date.ts
 M lib/google-sheets.ts
 M lib/licences-domain.test.ts
 M lib/licences-domain.ts
 M lib/licences-overview.ts
 M lib/mappers/actor-records.ts
 M lib/mappers/ententes.ts
 M lib/mappers/ligues.ts
 M lib/mappers/territorial.test.mjs
 M lib/territorial-mutations.ts
 M lib/types.ts
?? app/api/affiliations/
?? app/api/licences/
?? components/actors/affiliations-panel.tsx
?? components/licences/actor-licence-editor.tsx
?? components/licences/athlete-licence-editor.tsx
?? components/licences/athlete-licence-form.tsx
?? docs/athletes-qa/
?? docs/audit-colonnes-id-acteurs.md
?? docs/coachs-qa/
?? docs/correction-select-licences.md
?? docs/entourage-qa/
?? docs/lot-affiliations-acteurs.md
?? docs/lot-athletes-licence-active.md
?? docs/lot-coachs-licence-active.md
?? docs/lot-fiche-club-acteurs.md
?? docs/lot-onglet-licences.md
?? docs/lot-page-licences-athletes.md
?? docs/lot-suppression-colonnes-territoriales.md
?? docs/lot-variables-environnement.md
?? docs/rapport-ecarts-licences-entourage.md
?? lib/active-actor-licences.test.ts
?? lib/active-actor-licences.ts
?? lib/actor-affiliation-schema.test.ts
?? lib/actor-affiliation-schema.ts
?? lib/actor-affiliations.ts
?? lib/actor-licence-api.test.cjs
?? lib/actor-licence-creation.ts
?? lib/actor-licences-model.test.ts
?? lib/actor-licences-model.ts
?? lib/athlete-affiliation-fields.test.ts
?? lib/athlete-affiliation-fields.ts
?? lib/athlete-licence-creation.ts
?? lib/club-actors-model.test.ts
?? lib/club-actors-model.ts
?? lib/club-actors.ts
?? lib/coach-loading.test.cjs
?? lib/sheet-read-batcher.test.ts
?? lib/sheet-read-batcher.ts
?? test-results/
```

### Correction : git diff --stat

```text
 AGENTS.md                                          |   6 ++
 app/api/athletes/[id]/affiliations/route.ts        |   8 ++
 app/api/coachs/[id]/affiliations/route.ts          |  18 ++--
 app/api/medecins/[id]/affiliations/route.ts        |  18 ++--
 app/api/officiels/[id]/affiliations/route.ts       |  18 ++--
 app/athletes/page.tsx                              |  10 +--
 app/clubs/page.tsx                                 |  12 +--
 app/coachs/page.tsx                                |  19 ++--
 app/licences/entourage/page.tsx                    |   9 +-
 app/licences/page.tsx                              |   3 +-
 components/actors/actor-table.tsx                  |   2 +-
 components/actors/record-sections.tsx              |  70 +++++++--------
 components/arbitres/arbitres-table.tsx             |   7 +-
 components/athletes/athlete-detail.tsx             |  32 ++-----
 components/athletes/athletes-client.tsx            |  33 ++-----
 components/athletes/athletes-filters.tsx           |   2 +-
 components/athletes/athletes-table.tsx             |   4 +-
 components/autres-acteurs/autre-acteur-detail.tsx  |   9 +-
 components/autres-acteurs/autres-acteurs-table.tsx |   4 +-
 components/clubs/club-detail.tsx                   |  51 +++++++----
 components/clubs/clubs-client.tsx                  |  11 +--
 components/coachs/coach-detail.tsx                 |  46 +++++-----
 components/coachs/coach-licence-form-dialog.tsx    |  64 -------------
 components/coachs/coachs-client.tsx                |  37 ++------
 components/coachs/coachs-table.tsx                 |   5 +-
 components/competitions/competition-detail-v2.tsx  |   4 +-
 components/dashboard/data-table.tsx                |   2 +-
 components/ententes/entente-detail.tsx             |   2 +-
 components/ententes/entente-form-dialog.tsx        |   4 +-
 components/licences/actor-licences-client.tsx      |  58 ++++++++++--
 components/licences/athlete-licences-client.tsx    |  55 ++++++++++--
 components/ligues/ligue-detail.tsx                 |   7 +-
 components/ligues/ligue-form-dialog.tsx            |   8 +-
 components/ligues/ligues-client.tsx                |   1 -
 components/medecins/medecin-detail.tsx             |  12 +--
 components/medecins/medecins-table.tsx             |   2 +-
 components/officiels/officiel-detail.tsx           |  12 +--
 components/officiels/officiels-table.tsx           |   4 +-
 components/transferts/transferts-table.tsx         |   2 +-
 components/ui/search-select.tsx                    |   4 +-
 lib/actor-records.ts                               |  31 +++----
 lib/affiliations-domain.test.ts                    |  45 ++++++++++
 lib/affiliations-domain.ts                         |  47 +++++-----
 lib/compact-date.test.mjs                          |  20 ++++-
 lib/compact-date.ts                                |  91 +++++++++++++++----
 lib/google-sheets.ts                               |  46 ++++++++--
 lib/licences-domain.test.ts                        | 100 +++++++++++++++++++++
 lib/licences-domain.ts                             |  63 ++++++++++++-
 lib/licences-overview.ts                           |  16 ++--
 lib/mappers/actor-records.ts                       |  13 ++-
 lib/mappers/ententes.ts                            |   1 -
 lib/mappers/ligues.ts                              |   2 -
 lib/mappers/territorial.test.mjs                   |  14 +--
 lib/territorial-mutations.ts                       |  23 +----
 lib/types.ts                                       |   3 -
 55 files changed, 718 insertions(+), 472 deletions(-)
```

### Correction : git status --short

```text
 M AGENTS.md
 M app/api/athletes/[id]/affiliations/route.ts
 M app/api/coachs/[id]/affiliations/route.ts
 M app/api/medecins/[id]/affiliations/route.ts
 M app/api/officiels/[id]/affiliations/route.ts
 M app/athletes/page.tsx
 M app/clubs/page.tsx
 M app/coachs/page.tsx
 M app/licences/entourage/page.tsx
 M app/licences/page.tsx
 M components/actors/actor-table.tsx
 M components/actors/record-sections.tsx
 M components/arbitres/arbitres-table.tsx
 M components/athletes/athlete-detail.tsx
 M components/athletes/athletes-client.tsx
 M components/athletes/athletes-filters.tsx
 M components/athletes/athletes-table.tsx
 M components/autres-acteurs/autre-acteur-detail.tsx
 M components/autres-acteurs/autres-acteurs-table.tsx
 M components/clubs/club-detail.tsx
 M components/clubs/clubs-client.tsx
 M components/coachs/coach-detail.tsx
 D components/coachs/coach-licence-form-dialog.tsx
 M components/coachs/coachs-client.tsx
 M components/coachs/coachs-table.tsx
 M components/competitions/competition-detail-v2.tsx
 M components/dashboard/data-table.tsx
 M components/ententes/entente-detail.tsx
 M components/ententes/entente-form-dialog.tsx
 M components/licences/actor-licences-client.tsx
 M components/licences/athlete-licences-client.tsx
 M components/ligues/ligue-detail.tsx
 M components/ligues/ligue-form-dialog.tsx
 M components/ligues/ligues-client.tsx
 M components/medecins/medecin-detail.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiel-detail.tsx
 M components/officiels/officiels-table.tsx
 M components/transferts/transferts-table.tsx
 M components/ui/search-select.tsx
 M lib/actor-records.ts
 M lib/affiliations-domain.test.ts
 M lib/affiliations-domain.ts
 M lib/compact-date.test.mjs
 M lib/compact-date.ts
 M lib/google-sheets.ts
 M lib/licences-domain.test.ts
 M lib/licences-domain.ts
 M lib/licences-overview.ts
 M lib/mappers/actor-records.ts
 M lib/mappers/ententes.ts
 M lib/mappers/ligues.ts
 M lib/mappers/territorial.test.mjs
 M lib/territorial-mutations.ts
 M lib/types.ts
?? app/api/affiliations/
?? app/api/licences/
?? components/actors/affiliations-panel.tsx
?? components/licences/actor-licence-editor.tsx
?? components/licences/athlete-licence-editor.tsx
?? components/licences/athlete-licence-form.tsx
?? docs/athletes-qa/
?? docs/audit-colonnes-id-acteurs.md
?? docs/coachs-qa/
?? docs/correction-select-licences.md
?? docs/entourage-qa/
?? docs/lot-affiliations-acteurs.md
?? docs/lot-athletes-licence-active.md
?? docs/lot-coachs-licence-active.md
?? docs/lot-fiche-club-acteurs.md
?? docs/lot-onglet-licences.md
?? docs/lot-page-licences-athletes.md
?? docs/lot-suppression-colonnes-territoriales.md
?? docs/lot-variables-environnement.md
?? docs/rapport-ecarts-licences-entourage.md
?? lib/active-actor-licences.test.ts
?? lib/active-actor-licences.ts
?? lib/actor-affiliation-schema.test.ts
?? lib/actor-affiliation-schema.ts
?? lib/actor-affiliations.ts
?? lib/actor-licence-api.test.cjs
?? lib/actor-licence-creation.ts
?? lib/actor-licences-model.test.ts
?? lib/actor-licences-model.ts
?? lib/athlete-affiliation-fields.test.ts
?? lib/athlete-affiliation-fields.ts
?? lib/athlete-licence-creation.ts
?? lib/club-actors-model.test.ts
?? lib/club-actors-model.ts
?? lib/club-actors.ts
?? lib/coach-loading.test.cjs
?? lib/sheet-read-batcher.test.ts
?? lib/sheet-read-batcher.ts
?? test-results/
```
