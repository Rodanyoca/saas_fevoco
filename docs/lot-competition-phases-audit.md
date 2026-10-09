# Compétitions — phases, groupes et contrôle transversal

Date : 9 octobre 2026. Référence visuelle : FEBACO, notamment `components/dashboard/competition-structure-panel.tsx`, `competition-participants-panel.tsx` et `competition-distinctions-panel.tsx`. Seul FEVoco est modifié.

## Comparaison et réalisation

| Interface | Écart constaté | Réalisation / état |
| --- | --- | --- |
| Phases et groupes | Deux tableaux et création en fenêtres au lieu des deux formulaires intégrés et des cartes FEBACO | Nouveau `CompetitionPhasePanel` : formulaires côte à côte sur ordinateur, empilés sur mobile, cartes par épreuve, ordre des phases, type et mode résolus, compteurs, badges des groupes et états vides |
| Engagements | Identifiants de clubs ; absence de libellé de paire | Libellé de l’engagement depuis les clubs ou les membres de la paire déjà chargés ; tableau ordinateur et fiches mobile |
| Participants | Le nom de la personne manquait ; unité affichée par ID | Nom résolu avec le type d’acteur, unité résolue, même libellé proposé dans le formulaire ; fiches mobile |
| Classement | Unités brutes et contexte phase/groupe absent | Libellés d’unités, colonnes phase/groupe, choix nommés dans la qualification et fiches mobile |
| Distinctions | Nom du bénéficiaire individuel absent ; unités brutes | Nom du bénéficiaire et unité résolus ; choix nommés ; correspondance épreuve/phase/match corrigée ; fiches mobile |
| Général, épreuves, matchs et résultats | Contrôle des adaptations du lot précédent | Navigation et responsive vérifiés, cartes et saisie par sets conservées |

Les données sont transmises depuis le chargement serveur existant. Aucun `useEffect` de rechargement ni appel API de lecture par carte n’a été ajouté. Les noms sont résolus en mémoire et ne sont pas écrits dans les feuilles métier.

## Règles contrôlées et anomalies corrigées

Lecture des mutations existantes : garde `TERMINEE`, unités CLUB/PAIRE, identifiants serveur `VOL-*`, scores volleyball, affectations écrites dans `COMPETITIONS_PHASES_UNITES`, dates centralisées.

Huit tests de domaine isolent le transport Sheets et exécutent les véritables fonctions métier. La première exécution reproduisait cinq catégories d’acceptations incorrectes (cinq tests rouges). Les causes ont été vérifiées : présence de l’identifiant contrôlée sans statut, ordre seulement non vide, victoire contrôlée sans phase du match, et filtre de distinction contrôlé seulement quand une phase était explicitement sélectionnée.

Corrections :

- Création d’une phase : épreuve active et ordre entier strictement positif et représentable.
- Engagement : épreuve, phase et groupe actifs.
- Programmation d’un match : groupe actif, en plus des affectations communes déjà contrôlées.
- Recalcul et qualification : groupe actif ; recalcul sur phase active ; match source obligatoirement rattaché à la phase source.
- Distinction : match appartenant à l’épreuve choisie, même sans phase sélectionnée. L’interface filtre les mêmes possibilités et efface l’unité au changement d’épreuve.

Les tests positifs vérifient les écritures valides, les identifiants générés et les dates `2026-10-09`. Le test de clôture vérifie le refus sans écriture des mutations de phase, groupe, engagement, match, qualification, recalcul et distinction. Aucun nouveau mapper ni colonne Sheets n’est introduit.

## Validation

- ESLint ciblé : réussi.
- `npx.cmd tsc --noEmit` indépendant : réussi (le build Next ignore les erreurs de types par configuration existante).
- Build de production après corrections : réussi.
- `node --test lib/competition-context-rules.test.cjs` : 8 tests réussis, incluant scénarios invalides et valides.
- `node --test lib/competition-cards.test.cjs` : 4 tests réussis, dont cartes de phases avec groupes, décompte distinct des affectations actives et lecture seule.
- Tests volleyball, classement et clôture : 11 tests réussis.
- Playwright sur l’édition réelle `VOL-COMP-2026-001` : neuf onglets, 1440 × 1000 et 390 × 844 ; zéro erreur JavaScript, zéro débordement horizontal, zéro appel API de lecture supplémentaire hors images.
- Formulaires de phase/groupe : deux formulaires intégrés, choix d’épreuve disponible, absence de phase de groupes correctement représentée, création désactivée tant que la saisie est incomplète.
- Captures dans `docs/competition-phases-qa/`. Captures Phases ordinateur/mobile inspectées visuellement.
- Aucun POST/PATCH de navigateur autorisé durant la vérification ; aucune donnée métier ajoutée ou modifiée dans Google Sheets. Serveur temporaire arrêté après vérification.

## Écarts restants et limites

- La compétition réelle possède une épreuve mais pas de phases, groupes, engagements, matchs, résultats, classements ou distinctions. Le navigateur vérifie les états vides et les formulaires ; les cartes renseignées et les règles sont vérifiées par tests en mémoire, sans introduire de données fictives dans l’application.
- Les engagements, participants, classements et distinctions conservent leurs formulaires en fenêtres. Les filtres, statistiques et panneaux latéraux complets de FEBACO ne sont pas tous portés ; ces onglets ne sont donc pas déclarés visuellement identiques.
- Les distinctions conservent une liste de raccourcis de modification en plus de leur tableau de consultation, contrairement à la colonne Actions unique de FEBACO.
- Les noms des équipes nationales saisonnières restent à résoudre depuis leur référentiel : l’identifiant reste le repli si aucun club ni paire ne fournit de nom. Aucun référentiel ou mapping hypothétique n’a été ajouté.
- Ce contrôle concerne les neuf onglets de la fiche compétition, pas un nouvel audit de tous les autres modules de l’application.

## Fichiers de ce lot

Composant porté : `components/competitions/competition-phase-panel.tsx`.

Adaptations : `competition-detail-v2.tsx`, `competition-entry-manager.tsx`, `competition-people-manager.tsx`, `competition-standings-manager.tsx`, `competition-distinction-manager.tsx` ; domaines `lib/competition-structure.ts`, `competition-entries.ts`, `competition-matches.ts`, `competition-standings.ts`, `competition-distinctions.ts` ; tests `competition-cards.test.cjs` et `competition-context-rules.test.cjs`.

L’état Git ci-dessous inclut les lots précédents non commités ; il ne représente pas seulement ce lot. Aucun commit ni push effectué.

## git diff --stat (fichiers suivis)

```text
 app/api/officiels/[id]/licences/route.ts           | 19 ------
 components/actors/affiliations-panel.tsx           |  5 +-
 components/actors/record-sections.tsx              |  6 +-
 components/autres-acteurs/autre-acteur-detail.tsx  |  3 +-
 .../autres-acteurs/autres-acteurs-client.tsx       | 20 +-----
 components/autres-acteurs/autres-acteurs-table.tsx | 22 ++++---
 components/competitions/competition-detail-v2.tsx  | 41 ++++++++----
 .../competition-distinction-manager.tsx            |  8 +--
 .../competitions/competition-entry-manager.tsx     |  2 +-
 .../competitions/competition-match-manager.tsx     | 31 ++++++----
 .../competitions/competition-people-manager.tsx    |  4 +-
 .../competitions/competition-result-manager.tsx    | 25 ++++----
 .../competitions/competition-standings-manager.tsx |  8 +--
 .../competitions/competition-structure-manager.tsx | 24 ++++----
 components/medecins/medecins-client.tsx            | 12 ++--
 components/medecins/medecins-table.tsx             |  3 +-
 components/officiels/officiel-detail.tsx           | 24 +++-----
 .../officiels/officiel-licence-form-dialog.tsx     | 64 -------------------
 components/officiels/officiels-client.tsx          |  2 +-
 components/officiels/officiels-filters.tsx         |  2 +-
 components/officiels/officiels-table.tsx           | 29 +++++----
 lib/actor-affiliation-schema.ts                    |  5 +-
 lib/actor-affiliations.ts                          |  3 +-
 lib/actor-licences-model.test.ts                   | 10 +++
 lib/actor-licences-model.ts                        |  5 +-
 lib/actor-records.ts                               |  9 ++-
 lib/affiliations-domain.test.ts                    | 17 +++++
 lib/affiliations-domain.ts                         | 11 ++--
 lib/competition-distinctions.ts                    |  2 +-
 lib/competition-entries.ts                         |  6 +-
 lib/competition-matches.ts                         |  2 +-
 lib/competition-standings.ts                       |  8 +--
 lib/competition-structure.ts                       |  2 +
 lib/officiel-licence-mutations.ts                  | 72 ----------------------
 lib/types.ts                                       |  1 +
 35 files changed, 210 insertions(+), 297 deletions(-)
```

## git status --short

```text
 D app/api/officiels/[id]/licences/route.ts
 M components/actors/affiliations-panel.tsx
 M components/actors/record-sections.tsx
 M components/autres-acteurs/autre-acteur-detail.tsx
 M components/autres-acteurs/autres-acteurs-client.tsx
 M components/autres-acteurs/autres-acteurs-table.tsx
 M components/competitions/competition-detail-v2.tsx
 M components/competitions/competition-distinction-manager.tsx
 M components/competitions/competition-entry-manager.tsx
 M components/competitions/competition-match-manager.tsx
 M components/competitions/competition-people-manager.tsx
 M components/competitions/competition-result-manager.tsx
 M components/competitions/competition-standings-manager.tsx
 M components/competitions/competition-structure-manager.tsx
 M components/medecins/medecins-client.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiel-detail.tsx
 D components/officiels/officiel-licence-form-dialog.tsx
 M components/officiels/officiels-client.tsx
 M components/officiels/officiels-filters.tsx
 M components/officiels/officiels-table.tsx
 M lib/actor-affiliation-schema.ts
 M lib/actor-affiliations.ts
 M lib/actor-licences-model.test.ts
 M lib/actor-licences-model.ts
 M lib/actor-records.ts
 M lib/affiliations-domain.test.ts
 M lib/affiliations-domain.ts
 M lib/competition-distinctions.ts
 M lib/competition-entries.ts
 M lib/competition-matches.ts
 M lib/competition-standings.ts
 M lib/competition-structure.ts
 D lib/officiel-licence-mutations.ts
 M lib/types.ts
?? components/competitions/competition-event-cards.tsx
?? components/competitions/competition-phase-panel.tsx
?? components/competitions/competition-play-cards.tsx
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/autres-acteurs-qa/
?? docs/coachs-qa/
?? docs/competition-detail-qa/
?? docs/competition-phases-qa/
?? docs/entourage-qa/
?? docs/lot-autres-acteurs-febaco.md
?? docs/lot-competition-detail-febaco.md
?? docs/lot-competition-phases-audit.md
?? docs/lot-medecins-licence-valide.md
?? docs/lot-officiels-colonne-licence.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? lib/competition-cards.test.cjs
?? lib/competition-context-rules.test.cjs
?? test-results/
```
