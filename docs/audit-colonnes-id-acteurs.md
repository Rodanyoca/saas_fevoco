# FEVOCO — audit des identifiants dans les tableaux d’acteurs

## Colonnes Licence des entraîneurs et arbitres

Les listes entraîneurs et arbitres utilisent désormais la même première colonne Licence que la liste athlètes. Le composant partagé ActorTable affiche aussi cette information dans les cartes mobiles. La colonne reste visuelle et non connectée, selon la consigne existante : tiret dans le tableau, « Non renseigné » sur mobile. Les identifiants internes restent masqués et les actions de consultation sont conservées.

Fichiers : `components/coachs/coachs-table.tsx`, `components/arbitres/arbitres-table.tsx`. Aucun service, mapping ou schéma modifié. TypeScript, ESLint ciblé et build réussis. Aucun commit ni push.

État Git ciblé, incluant le masquage d’ID des lots précédents :

```text
 components/arbitres/arbitres-table.tsx | 3 ++-
 components/coachs/coachs-table.tsx     | 3 ++-
 2 files changed, 4 insertions(+), 2 deletions(-)

 M components/arbitres/arbitres-table.tsx
 M components/coachs/coachs-table.tsx
```

Mise à jour suivante : le tableau « Athlètes liés » est retiré de la fiche ligue à la demande de l’utilisateur, ainsi que sa définition de colonnes. Le KPI athlètes reste présent. Seul components/ligues/ligue-detail.tsx change pour cette correction ; les tableaux Ententes et Clubs restent affichés. ESLint ciblé et git diff --check réussis. Contrôle Playwright à 1440 et 390 pixels : deux tableaux, aucune recherche d’athlète, KPI conservé, aucune erreur JavaScript ; capture mobile inspectée. Aucun écart restant pour cette demande, aucun commit ni push.

État Git ciblé après cette correction (inclut la modification du tableau de ligue du lot précédent) :

```text
git diff --stat -- components/ligues/ligue-detail.tsx
 components/ligues/ligue-detail.tsx | 5 -----
 1 file changed, 5 deletions(-)

git status --short -- components/ligues/ligue-detail.tsx
 M components/ligues/ligue-detail.tsx
```

Date : 7 octobre 2026. Périmètre : présentation uniquement.

## Emplacements corrigés

| Interface | Modification |
| --- | --- |
| Liste des athlètes | ID athlète remplacé par Licence sans branchement ; tiret sur ordinateur, valeur non renseignée sur mobile. |
| Listes des entraîneurs, arbitres et médecins | Colonne ID interne masquée, y compris dans les cartes mobiles. |
| Listes des officiels et autres acteurs | Suppression de la colonne ID, du rappel mobile et adaptation du nombre de colonnes des états vides. |
| Fiche club : athlètes | Licence remplace ID athlète, avec un tiret sans lecture des licences. |
| Fiche club : entraîneurs, médecins, officiels, autres acteurs | Colonne ID masquée. |
| Fiche ligue : athlètes liés | Licence remplace ID, avec un tiret sans branchement. |
| Mouvements | Suppression de l’ID d’athlète affiché sous son nom. |
| Compétition : intervenants et distinctions | Masquage de la colonne Acteur qui affichait uniquement id_acteur brut. |

L’audit a aussi examiné les tableaux des équipes nationales, des compétitions, des licences, du tableau de bord et des ententes. Les autres tableaux d’acteurs utilisent déjà les noms ou les numéros de licence. Les identifiants nationaux et FIVB sont conservés, ainsi que les références de clubs, ligues, ententes et équipes nationales. Les identifiants présents dans les fiches individuelles et formulaires ne font pas partie de ce lot.

Les identifiants internes restent dans les données, clés React, paramètres de navigation, recherches et actions. Aucun service, mapping, type métier ou schéma Google modifié. Aucune requête ajoutée pour alimenter Licence.

## Composants et fichiers modifiés

- components/actors/actor-table.tsx : masquage par défaut de la colonne ID.
- components/athletes/athletes-table.tsx : colonne visuelle Licence.
- components/coachs/coachs-table.tsx, components/arbitres/arbitres-table.tsx, components/medecins/medecins-table.tsx : masquage explicite de l’ID.
- components/officiels/officiels-table.tsx et components/autres-acteurs/autres-acteurs-table.tsx : retrait des cellules et rappels mobiles.
- components/clubs/club-detail.tsx : colonnes des cinq familles.
- components/ligues/ligue-detail.tsx : colonne des athlètes liés.
- components/transferts/transferts-table.tsx : retrait du rappel de l’ID athlète.
- components/competitions/competition-detail-v2.tsx : colonnes des intervenants et distinctions.

Réutilisation des composants existants ActorTable, Table et DataTable. Aucun composant provenant d’un autre projet.

## Vérifications et écarts restants

Lint, vérification TypeScript indépendante et build : réussis. Contrôles Playwright sur les composants réels dans un banc isolé à 1440 et 390 pixels : six familles d’acteurs, absence des ID internes dans les listes, présence de Licence pour les athlètes, callbacks de détail conservés ; recherche, pagination et états vide/indisponible de la fiche club : réussis. Captures desktop/mobile inspectées. Le banc est sous node_modules/.cache et ne fait pas partie de l’application. Il ne remplace pas une session authentifiée de production.

La connexion des nouvelles colonnes Licence reste volontairement à faire sur instruction ultérieure. Aucun nouveau test unitaire pour ce changement purement visuel. Aucun commit ni push.

## État Git avant ajout de ce rapport

Les sorties comprennent les travaux préexistants sur les licences, les dates et le précédent lot de fiche club ; leurs changements sont conservés.

### git diff --stat

```text
app/clubs/page.tsx                                 | 12 ++--
 app/licences/page.tsx                              |  3 +-
 components/actors/actor-table.tsx                  |  2 +-
 components/arbitres/arbitres-table.tsx             |  2 +-
 components/athletes/athletes-table.tsx             |  2 +-
 components/autres-acteurs/autres-acteurs-table.tsx |  4 +-
 components/clubs/club-detail.tsx                   | 52 ++++++++++-----
 components/clubs/clubs-client.tsx                  | 11 ++--
 components/coachs/coachs-table.tsx                 |  2 +-
 components/competitions/competition-detail-v2.tsx  |  4 +-
 components/licences/athlete-licences-client.tsx    |  4 +-
 components/ligues/ligue-detail.tsx                 |  2 +-
 components/medecins/medecins-table.tsx             |  2 +-
 components/officiels/officiels-table.tsx           |  4 +-
 components/transferts/transferts-table.tsx         |  2 +-
 lib/compact-date.test.mjs                          |  9 +++
 lib/compact-date.ts                                | 77 +++++++++++++++++-----
 lib/licences-domain.test.ts                        | 13 ++++
 lib/licences-domain.ts                             |  3 +-
 lib/mappers/actor-records.ts                       |  5 +-
 20 files changed, 152 insertions(+), 63 deletions(-)
```

### git status --short

```text
M app/clubs/page.tsx
 M app/licences/page.tsx
 M components/actors/actor-table.tsx
 M components/arbitres/arbitres-table.tsx
 M components/athletes/athletes-table.tsx
 M components/autres-acteurs/autres-acteurs-table.tsx
 M components/clubs/club-detail.tsx
 M components/clubs/clubs-client.tsx
 M components/coachs/coachs-table.tsx
 M components/competitions/competition-detail-v2.tsx
 M components/licences/athlete-licences-client.tsx
 M components/ligues/ligue-detail.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiels-table.tsx
 M components/transferts/transferts-table.tsx
 M lib/compact-date.test.mjs
 M lib/compact-date.ts
 M lib/licences-domain.test.ts
 M lib/licences-domain.ts
 M lib/mappers/actor-records.ts
?? app/api/licences/
?? components/licences/athlete-licence-form.tsx
?? docs/lot-fiche-club-acteurs.md
?? lib/athlete-affiliation-fields.test.ts
?? lib/athlete-affiliation-fields.ts
?? lib/athlete-licence-creation.ts
?? lib/club-actors-model.test.ts
?? lib/club-actors-model.ts
?? lib/club-actors.ts
?? test-results/
```
