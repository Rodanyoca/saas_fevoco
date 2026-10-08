# FEVOCO — acteurs de la fiche club

Mise à jour suivante : retrait du tableau « Autres acteurs du club » à la demande de l’utilisateur. Seul components/clubs/club-detail.tsx change pour cette correction ; les quatre autres tableaux et le calcul global des KPI restent présents. ESLint ciblé, git diff --check et contrôle Playwright desktop/mobile (quatre tableaux, recherche, pagination, modification, états vide et indisponible) réussis ; capture inspectée. Aucun composant porté ni écart restant pour ce retrait. Aucun commit ni push.

État Git ciblé, incluant les changements précédents de la fiche club :

```text
git diff --stat -- components/clubs/club-detail.tsx
 components/clubs/club-detail.tsx | 51 ++++++++++++++++++++++++++--------------
 1 file changed, 34 insertions(+), 17 deletions(-)
git status --short -- components/clubs/club-detail.tsx
 M components/clubs/club-detail.tsx
```

Date : 7 octobre 2026.

## Livraison

La fiche club affiche cinq tableaux : athlètes, entraîneurs, médecins, officiels et autres acteurs. Chaque tableau utilise le composant DataTable existant avec recherche et pagination indépendantes. Les cartes affichent le total des acteurs rattachés, les athlètes, l’encadrement (les quatre autres familles) et les acteurs dont la fiche porte un statut actif.

Le chargement résout les relations par identifiants et les libellés par référentiels. Les en-têtes réels ont été vérifiés en lecture seule avant l’implémentation. Les identités proviennent de ATHLETES, COACHS, MEDECINS, OFFICIELS et AUTRES. Les liens proviennent de ATHLETE_AFFILIATIONS, COACH_AFFILIATIONS, MEDECIN_AFFILIATIONS, OFFICIELS_AFFILIATIONS et AUTRES_AFFILIATIONS. Les mandats d’officiels existants restent lus pour compatibilité avec le service d’écriture actuel, uniquement lorsque les types d’acteur et de structure correspondent à un officiel et un club.

Seuls les rattachements actifs à la date du jour à Kinshasa sont retenus : bornes de début et fin inclusives, bornes vides admises. Une personne est comptée une fois par club et famille, même avec plusieurs affiliations ou fonctions. Aucun rapprochement entre familles sur le nom n’est inventé. Les affiliations invalides ou orphelines sont exclues avec une indication dans l’interface. En cas d’indisponibilité des sources, les cartes affichent « Indisponible » au lieu d’un faux zéro.

Trois lectures groupées utilisent le cache Sheets existant : identités, affiliations et référentiels. Aucune lecture par ligne ou carte, aucune écriture Google.

## Fichiers et composants

- app/clubs/page.tsx : chargement groupé et état d’indisponibilité.
- components/clubs/clubs-client.tsx : transmission des effectifs au club sélectionné.
- components/clubs/club-detail.tsx : cinq tableaux et quatre KPI ; réutilisation de Card, DetailCard, DataTable, StatusBadge et ClubFormDialog.
- lib/club-actors.ts : service serveur de lecture.
- lib/club-actors-model.ts : jointures, filtrage, déduplication et calcul des KPI.
- lib/club-actors-model.test.ts : quatre tests métier.

## Vérifications et écarts

- Lint, TypeScript sans émission et build : réussis. Le contrôle TypeScript a été exécuté séparément du build.
- Quatre tests métier : jointures et référentiels, dates et statuts, doublons et mandats, relations orphelines et club vide : réussis.
- Playwright sur les composants réels dans un banc isolé : 1440 × 1000 et 390 × 844, cinq tableaux, KPI, recherche, pagination, ouverture du formulaire existant, club vide et sources indisponibles : réussis, aucune erreur JavaScript.
- Captures desktop et mobile inspectées ; structure comparée à la capture FEBACO existante docs/design-qa-assets/febaco-club-detail-1440.png. Les tableaux défilent horizontalement sur mobile sans débordement de page.
- Le banc de contrôle et ses données de test restent sous node_modules/.cache/club-actors-ui, hors application et hors Git. Ce contrôle ne constitue pas une session authentifiée de production.
- Écart volontaire avec FEBACO : aucune équipe territoriale, les acteurs sont reliés directement au club. Les permissions, l’authentification et les actions de modification du club restent celles de l’application.
- Limite : si l’un des trois lots acteurs échoue, l’ensemble des effectifs apparaît indisponible ; les informations générales du club restent accessibles.
- Les modifications préexistantes concernant les licences et les dates sont conservées. Aucun commit ni push effectué.

## État Git observé avant ajout de ce rapport

`git diff --stat` (comprend les travaux préexistants ; les nouveaux fichiers non suivis ne figurent pas dans cette commande) :

```text
 app/clubs/page.tsx                              | 12 ++--
 app/licences/page.tsx                           |  3 +-
 components/clubs/club-detail.tsx                | 52 +++++++++++------
 components/clubs/clubs-client.tsx               | 11 ++--
 components/licences/athlete-licences-client.tsx |  4 +-
 lib/compact-date.test.mjs                       |  9 +++
 lib/compact-date.ts                             | 77 ++++++++++++++++++++-----
 lib/licences-domain.test.ts                     | 13 +++++
 lib/licences-domain.ts                          |  3 +-
 lib/mappers/actor-records.ts                    |  5 +-
 10 files changed, 139 insertions(+), 50 deletions(-)
```

`git status --short` :

```text
 M app/clubs/page.tsx
 M app/licences/page.tsx
 M components/clubs/club-detail.tsx
 M components/clubs/clubs-client.tsx
 M components/licences/athlete-licences-client.tsx
 M lib/compact-date.test.mjs
 M lib/compact-date.ts
 M lib/licences-domain.test.ts
 M lib/licences-domain.ts
 M lib/mappers/actor-records.ts
?? app/api/licences/
?? components/licences/athlete-licence-form.tsx
?? lib/athlete-affiliation-fields.test.ts
?? lib/athlete-affiliation-fields.ts
?? lib/athlete-licence-creation.ts
?? lib/club-actors-model.test.ts
?? lib/club-actors-model.ts
?? lib/club-actors.ts
?? test-results/
```
