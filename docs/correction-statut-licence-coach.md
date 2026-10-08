# Libellé du statut des licences entraîneurs

8 octobre 2026.

Le défaut était reproduit par le chargeur réel dans `lib/coach-loading.test.cjs` : `statutLicence` contenait STL001 au lieu d'ACTIVE.

Correction dans `lib/actor-records.ts` : le chargeur commun des licences d'acteurs résout `nom_statut_licence` depuis `STATUT_LICENCE`, tout en conservant `idStatutLicence` pour la logique métier. La correction bénéficie aux entraîneurs et aux autres familles utilisant ce même chargeur. Les références sont chargées en parallèle et regroupées avec les autres référentiels, sans lecture par licence ni requête navigateur supplémentaire.

Le test couvre ACTIVE et SUSPENDUE ainsi que la conservation de l'identifiant. Cinq tests passent, avec trois lectures Sheets groupées à froid pour les entraîneurs puis zéro avec cache valide. TypeScript indépendant, ESLint ciblé et build de production passent.

Playwright sur la page réelle : statut ACTIVE présent dans l'onglet Licence, STL001 absent de la cellule de statut ; liste, recherche, bureau/mobile et absence d'appel API de données supplémentaire vérifiés. Aucun changement Google. Serveur temporaire 3100 arrêté.

[Capture inspectée](coachs-qa/licence-statut.png).

Fichiers du lot : `lib/actor-records.ts`, `lib/coach-loading.test.cjs`, ce rapport et captures de vérification. Aucun composant visuel porté, aucun commit. L'état Git ci-dessous inclut les autres lots conservés.

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
 lib/actor-records.ts                               |  56 ++++++++----
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
 55 files changed, 741 insertions(+), 474 deletions(-)
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
?? docs/correction-statut-licence-coach.md
?? docs/correction-structure-licence-athlete.md
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
