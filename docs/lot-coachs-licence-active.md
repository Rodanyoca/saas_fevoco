# Liste coachs : licence active et lectures dynamiques

Date : 8 octobre 2026. Périmètre : `/coachs`, ses onglets et la couche commune de lecture Google Sheets.

## Affichage

La colonne Licence du tableau et des cartes mobiles utilise maintenant les licences déjà chargées avec la page. Aucun fetch par coach ni nouvelle requête API navigateur. La recherche par numéro reste disponible, y compris dans l'historique.

Une licence affichée doit avoir le statut `STL001` (alias historiques ACTIVE/ACTIF), deux dates valides et une période contenant le jour courant à Kinshasa, bornes incluses. Une licence suspendue, annulée, expirée ou future n'est pas affichée comme active. Sans licence active, les libellés vides existants du tableau sont conservés. En cas de chevauchement dans la source, la période commençant le plus récemment est choisie, puis l'identifiant départage les égalités.

## Inspection des données dynamiques

La page chargeait neuf ensembles. Cinq étaient devenus inutilisés : affiliations, clubs/structures, équipes nationales, types d'affiliation et fonctions coach. Ils provenaient d'une ancienne version du détail. Le détail utilise désormais `AffiliationsPanel`, qui charge les affiliations et leurs références à l'ouverture de son onglet. Les anciennes lectures et leurs props/états morts ont été retirées.

Restent coachs, licences, sexes et niveaux. Sexes/niveaux sont aussi nécessaires au mapper coach et au formulaire ; les appels identiques sont dédupliqués par la couche existante.

La couche commune conserve son cache de 30 secondes, ses tags d'invalidation après écriture et son partage des lectures en cours. Les lectures qui manquent simultanément au cache sont maintenant regroupées par classeur via `values.batchGet`. Les plages d'un même onglet partant de A sont fusionnées jusqu'à la plus grande colonne déjà demandée, sans élargissement arbitraire. L'ordre des plages est stabilisé pour les clés du cache.

Un onglet invalide provoque exceptionnellement une séparation des plages pour préserver les autres lecteurs. Une erreur réseau/DNS ne déclenche pas cette séparation. Les retries bornés existants sont conservés. Les lectures `fresh: true` des mutations évitent toujours le cache et ce regroupement ; les écritures ne sont pas regroupées.

Ce mécanisme commun bénéficie aux autres écrans qui utilisent ces chargeurs. Il regroupe les lectures simultanées ; une lecture dépendant du résultat d'une précédente reste une vague distincte. Cette inspection ne constitue pas une mesure exhaustive de tous les parcours de l'application. Les chargements d'images d'avatar restent séparés des données métier.

## Vérifications

- Huit tests passent : sélection active, dates et statuts, renouvellement, regroupement par classeur/plages, isolation d'un onglet absent, absence de multiplication en cas d'erreur réseau, chargeurs coach réels avec transport simulé, régression API licences.
- Chargeurs coach avec cache initialement vide et transport simulé : trois appels Sheets (ACTEURS, LICENCES, REFERENTIELS), zéro appel au second chargement avec cache valide. La lecture fraîche reste indépendante. Ce compte exclut OAuth, les retries et le cas de référentiels absents.
- TypeScript indépendant et ESLint ciblé passent ; build de production réussi.
- Playwright sur l'application de production avec Google réel en lecture seule : la licence active source apparaît dans le tableau ; recherche par numéro réussie ; bureau 1440 × 1000 et mobile 390 × 844 sans débordement ni erreur JavaScript.
- Zéro requête API de données supplémentaire dans la liste pendant le chargement et la recherche. Le navigateur charge l'avatar via `/api/avatars`.
- Aucune mutation Google réalisée. Serveur temporaire 3100 arrêté après vérification.

Captures inspectées : [bureau](coachs-qa/licence-desktop.png), [mobile](coachs-qa/licence-mobile.png).

## Fichiers du lot

- `app/coachs/page.tsx` : suppression des lectures inutilisées.
- `components/coachs/coachs-client.tsx`, `coachs-table.tsx`, `coach-detail.tsx` : numéro actif et suppression des props/états morts.
- `lib/active-actor-licences.ts` et son test : sélection de la licence active en mémoire.
- `lib/google-sheets.ts`, `sheet-read-batcher.ts` et son test : regroupement des lectures simultanées.
- `lib/coach-loading.test.cjs` : vérification des chargeurs et du cache avec transport simulé.

Aucun nouveau composant visuel porté ; structure du tableau existant conservée. Aucun commit. L'état Git ci-dessous inclut les changements préexistants des autres lots, conservés.

### git diff --stat

```text
 AGENTS.md                                          |   6 ++
 app/api/athletes/[id]/affiliations/route.ts        |   8 ++
 app/api/coachs/[id]/affiliations/route.ts          |  18 ++--
 app/api/medecins/[id]/affiliations/route.ts        |  18 ++--
 app/api/officiels/[id]/affiliations/route.ts       |  18 ++--
 app/clubs/page.tsx                                 |  12 +--
 app/coachs/page.tsx                                |  19 ++--
 app/licences/entourage/page.tsx                    |   9 +-
 app/licences/page.tsx                              |   3 +-
 components/actors/actor-table.tsx                  |   2 +-
 components/actors/record-sections.tsx              |  70 +++++++--------
 components/arbitres/arbitres-table.tsx             |   7 +-
 components/athletes/athlete-detail.tsx             |  28 ++----
 components/athletes/athletes-table.tsx             |   2 +-
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
 52 files changed, 685 insertions(+), 435 deletions(-)
```

### git status --short

```text
 M AGENTS.md
 M app/api/athletes/[id]/affiliations/route.ts
 M app/api/coachs/[id]/affiliations/route.ts
 M app/api/medecins/[id]/affiliations/route.ts
 M app/api/officiels/[id]/affiliations/route.ts
 M app/clubs/page.tsx
 M app/coachs/page.tsx
 M app/licences/entourage/page.tsx
 M app/licences/page.tsx
 M components/actors/actor-table.tsx
 M components/actors/record-sections.tsx
 M components/arbitres/arbitres-table.tsx
 M components/athletes/athlete-detail.tsx
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
?? docs/audit-colonnes-id-acteurs.md
?? docs/coachs-qa/
?? docs/correction-select-licences.md
?? docs/entourage-qa/
?? docs/lot-affiliations-acteurs.md
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
