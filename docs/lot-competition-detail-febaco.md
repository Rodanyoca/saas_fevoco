# Competitions FEVoco : Epreuves, Matchs et Resultats selon FEBACO

9 octobre 2026. Perimetre limite aux trois onglets de la fiche competition. Les lots precedents dans le statut Git sont conserves. Aucune modification FEBACO.

## Comparaison et adaptation

Sources FEBACO consultees : components/dashboard/competition-events-panel.tsx et competition-play-panel.tsx, avec leurs composants Card et formulaires. Avant : FEVoco affichait des SimpleTable dans ces trois onglets et ouvrait programmation/saisie dans des Dialog. Apres :

- Epreuves : grille de cartes (une colonne mobile, deux en md, trois en xl), nom, discipline/categorie/sexe, statut, compteurs Unites/Phases/Matchs et crayon de modification. Bouton Creer une epreuve propre a cet onglet ; les actions de phase/groupe restent dans Phases. La modification reutilise PATCH /epreuves/[eventId] existant, sans nouvelle mutation serveur ; discipline/categorie/sexe restent desactives comme FEBACO.
- Matchs : formulaire integre en trois colonnes (epreuve/phase/groupe, unites A/B, date/heure), puis affiches en cartes avec phase/groupe, statut, noms A VS B et date/heure. Changer d'epreuve reinitialise phase/groupe/unites, changer de phase/groupe reinitialise les dependances.
- Resultats : saisie integree lorsqu'un match attend son resultat, puis cartes compactes avec phase/groupe/date, statut resolu, deux lignes de score et vainqueur, detail des sets effectivement renseignes. Zero conserve. Une annulation reste affichee ANNULE et sans details de sets.

Components portes/adaptes : nouvelles CompetitionEventCards, CompetitionMatchCards et CompetitionResultCards, inspirant la composition FEBACO sans importer son code de scores basketball. Les managers existants conservent endpoints et schemas FEVoco. Aucun champ de quart-temps/prolongation ajoute. Indoor cinq sets maximum et beach trois sets maximum, validation volley serveur inchangee. Edition TERMINEE : formulaires et boutons de mutation masques, protections serveur existantes conservees.

## Donnees et requetes

Les cartes utilisent le detail initial deja charge. Les noms de clubs (y compris inactifs pour l'historique) et d'athletes sont exposes depuis les memes getClubs/getAthletes de competitionEntryOptions, sans nouvelle lecture. Les paires sont nommees depuis les intervenants athletes de l'unite. Les eligibilites de creation restent filtrees sur les acteurs/clubs actifs. En absence de libelle, un identifiant existant reste le repli ; aucun nom invente. Les equipes nationales sans libelle dans ces sources restent identifiees par leur reference, ecart explicite restant.

Aucune requete API de donnees par carte ou ouverture de formulaire. Navigation des onglets via le serveur Next existant. Pas de copie des appels auth/me de FEBACO ni intervention sur permissions/authentification. Pas d'ecriture Google pendant les controles.

## Validation et limites

ESLint cible, TypeScript independant, build et git diff --check reussis. Trois tests de rendu des vrais composants dans lib/competition-cards.test.cjs : score zero et sets joues seulement, statut annule d'un match, resultat administratif sans faux sets. Onze tests existants volley/classements/cloture et six tests de dates reussis.

Playwright sur VOL-COMP-2026-001 (21 COUPE DU CONGO) : Epreuves/Matchs/Resultats sans tableaux, carte d'epreuve avec compteurs, ouverture/fermeture du dialogue de modification et trois references desactivees, formulaire de match integre, date saisie progressivement puis collee avec separateurs. Bureau 1440x1000 et mobile 390x844 sans debordement de page ni erreur JavaScript. Zero requete API de donnees supplementaire. Captures des trois onglets inspectees dans docs/competition-detail-qa ; capture Epreuves corrigee pour attendre la fermeture complete du dialogue avant capture.

La competition reelle contient une epreuve, zero phase, zero unite, zero match et zero resultat au controle. Les cartes de matchs et resultats remplis sont donc couvertes par tests de rendu en memoire, pas par une verification visuelle sur des enregistrements reels. La selection d'un match et les 3/5 sets du formulaire n'ont pas pu etre verifies dans le navigateur reel faute de match disponible. Aucune donnee fictive ajoutee a l'application ou a Google. Les ecritures existantes restent inchangees ; aucune saisie de resultat, programmation ni cloture executee pour tester. Serveur temporaire arrete apres verification. Aucun commit ni push.

Fichiers de ce lot : components/competitions/competition-detail-v2.tsx, competition-event-cards.tsx, competition-play-cards.tsx, competition-structure-manager.tsx, competition-match-manager.tsx, competition-result-manager.tsx, lib/competition-entries.ts et lib/competition-cards.test.cjs.
 
## git diff --stat (inclut les lots precedents)
```text
 app/api/officiels/[id]/licences/route.ts           | 19 ------
 components/actors/affiliations-panel.tsx           |  5 +-
 components/actors/record-sections.tsx              |  6 +-
 components/autres-acteurs/autre-acteur-detail.tsx  |  3 +-
 .../autres-acteurs/autres-acteurs-client.tsx       | 20 +-----
 components/autres-acteurs/autres-acteurs-table.tsx | 22 ++++---
 components/competitions/competition-detail-v2.tsx  | 17 +++--
 .../competitions/competition-match-manager.tsx     | 31 ++++++----
 .../competitions/competition-result-manager.tsx    | 25 ++++----
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
 lib/competition-entries.ts                         |  2 +
 lib/officiel-licence-mutations.ts                  | 72 ----------------------
 lib/types.ts                                       |  1 +
 27 files changed, 173 insertions(+), 270 deletions(-)
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
 M components/competitions/competition-match-manager.tsx
 M components/competitions/competition-result-manager.tsx
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
 M lib/competition-entries.ts
 D lib/officiel-licence-mutations.ts
 M lib/types.ts
?? components/competitions/competition-event-cards.tsx
?? components/competitions/competition-play-cards.tsx
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/autres-acteurs-qa/
?? docs/coachs-qa/
?? docs/competition-detail-qa/
?? docs/entourage-qa/
?? docs/lot-autres-acteurs-febaco.md
?? docs/lot-competition-detail-febaco.md
?? docs/lot-medecins-licence-valide.md
?? docs/lot-officiels-colonne-licence.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? lib/competition-cards.test.cjs
?? test-results/
```
