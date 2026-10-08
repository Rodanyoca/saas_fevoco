# Lot affiliations des acteurs FEVOCO

## Correction visuelle du 8 octobre 2026

Le bouton d’ajout est placé à gauche sous le titre, avec l’action d’actualisation. Les actions principales de cet onglet et du formulaire utilisent l’or FEBACO `#f6c515` et un texte foncé. Le tableau utilise les composants partagés Table, avec en-têtes sur fond discret, libellés en capitales, séparations horizontales, survol des lignes, badges de statut et actions centrées. Les cartes mobiles restent disponibles. Cette correction concerne uniquement `components/actors/affiliations-panel.tsx` et ce rapport ; aucune règle métier ni écriture Google n’est modifiée.

Contrôles de la correction : ESLint, TypeScript et build de production réussis. Le composant est toujours non suivi (`??`) car le lot initial n’a pas été commité ; `git diff --stat` ne comptabilise donc pas encore ce nouveau fichier. Les autres modifications du dépôt sont conservées.

## Resultat
L’onglet Affiliations de la fiche athlete reprend la structure FEBACO : carte unique, tableau sur ordinateur, cartes sur mobile, actualisation, ajout et actions consulter/modifier dans un panneau lateral. Le composant partage est integre aux athletes, entraineurs, medecins, officiels et autres acteurs. Les libelles et choix proviennent des referentiels FEVOCO.

## Sources verifiees
Les en-tetes et references Google ont ete consultes en lecture seule avant l’implementation. ATHLETE_AFFILIATIONS, COACH_AFFILIATIONS et MEDECIN_AFFILIATIONS rattachent directement au club. OFFICIELS_AFFILIATIONS utilise type d’entite, entite et fonction. AUTRES_AFFILIATIONS utilise type d’entite, entite et saison ; son statut est un libelle dans statut_affiliation. Les autres feuilles stockent id_statut_affiliation. Tous les mappings utilisent les noms des colonnes, independamment de leur ordre.

## Fonctionnement
Le nouveau service commun verifie l-identite, les references, les dates civiles, leur ordre, les periodes chevauchantes et les regles du statut. Une commande identique est idempotente ; une modification conserve l-identifiant et met a jour la ligne. Les identifiants sont gener-s cete serveur. Les dates sont -crites au format ISO avec format de cellule yyyy-mm-dd. Les lectures des referentiels sont groupees et mises en cache ; une mutation relit les affiliations sans cache, invalide les donnees Sheets et les vues concern-es. Les anciennes routes d’ajout athlete/coach/medecin/officiel deleguent au nouveau service. Les lecteurs historiques utilisent les memes mappings resolus.

## Fichiers et composants du lot
- components/actors/affiliations-panel.tsx : composant commun port- depuis la structure visuelle FEBACO.
- components/{athletes,coachs,medecins,officiels,autres-acteurs}/*-detail.tsx : int-gration dans les fiches.
- components/ui/search-select.tsx : liaison accessible du libelle avec le champ de recherche.
- lib/actor-affiliation-schema.ts et son test : mappings exacts des cinq feuilles.
- lib/actor-affiliations.ts : adaptateur Sheets commun.
- lib/affiliations-domain.ts et son test : validation metier.
- lib/actor-records.ts : lecteurs historiques harmonis-s.
- lib/google-sheets.ts : relecture sans cache et formatage group- des dates.
- app/api/affiliations/[kind]/route.ts et les quatre routes historiques : lecture, creation, modification et actualisation.

## Verifications
- TypeScript : reussi.
- ESLint : reussi.
- Build de production : reussi.
- 10 tests de domaine et mappings : reussis.
- Routes et service reels avec Google simule : creation, idempotence, conflit, modification, relecture, cache et dates valides pour cinq familles.
- Navigateur avec composants et routes reels, Google simule : dates saisies progressivement/coll-es/invalides, ajout, consultation, modification, actualisation, erreur/reprise, ordinateur et mobile 390 px sans debordement valides. Captures locales sous node_modules/.cache/club-actors-ui.
- Aucune ecriture de test sur Google reel. Aucun commit ni push.

## ecarts et limites
- Les arbitres disposent d-ARBITRE_AFFECTATIONS, pas d’une feuille d’affiliations : leur modele reste inchang-.
- Aucun rattachement d-equipe territoriale ni reference basketball n-a ete introduit. Les types sans source d’entites exploitable ne sont pas proposes.
- La serialisation des mutations protege une instance serveur ; Google Sheets ne fournit pas de transaction entre plusieurs instances. Les UUID -vitent les collisions d’identifiants, sans garantir l’unicite atomique inter-instances.
- Le parcours historique des transferts n’est pas migre par ce lot ; il reste a harmoniser separement avec ses regles metier.
- Les autorisations existantes sont conserv-es, sans modification de l’authentification.

## etat Git global
Cet etat inclut les travaux precedents non commites et les changements licences presents avant ce lot ; ils ont ete conserves.

### git diff --stat
```
 app/api/athletes/[id]/affiliations/route.ts        |  8 +++
 app/api/coachs/[id]/affiliations/route.ts          | 18 ++---
 app/api/medecins/[id]/affiliations/route.ts        | 18 ++---
 app/api/officiels/[id]/affiliations/route.ts       | 18 ++---
 app/clubs/page.tsx                                 | 12 ++--
 app/licences/page.tsx                              |  3 +-
 components/actors/actor-table.tsx                  |  2 +-
 components/arbitres/arbitres-table.tsx             |  2 +-
 components/athletes/athlete-detail.tsx             | 26 ++------
 components/athletes/athletes-table.tsx             |  2 +-
 components/autres-acteurs/autre-acteur-detail.tsx  |  9 ++-
 components/autres-acteurs/autres-acteurs-table.tsx |  4 +-
 components/clubs/club-detail.tsx                   | 51 +++++++++-----
 components/clubs/clubs-client.tsx                  | 11 ++--
 components/coachs/coach-detail.tsx                 | 12 ++--
 components/coachs/coachs-table.tsx                 |  2 +-
 components/competitions/competition-detail-v2.tsx  |  4 +-
 components/ententes/entente-detail.tsx             |  2 +-
 components/ententes/entente-form-dialog.tsx        |  4 +-
 components/licences/athlete-licences-client.tsx    |  4 +-
 components/ligues/ligue-detail.tsx                 |  7 +-
 components/ligues/ligue-form-dialog.tsx            |  8 +--
 components/ligues/ligues-client.tsx                |  1 -
 components/medecins/medecin-detail.tsx             | 12 ++--
 components/medecins/medecins-table.tsx             |  2 +-
 components/officiels/officiel-detail.tsx           | 12 ++--
 components/officiels/officiels-table.tsx           |  4 +-
 components/transferts/transferts-table.tsx         |  2 +-
 components/ui/search-select.tsx                    |  4 +-
 lib/actor-records.ts                               | 20 ++----
 lib/affiliations-domain.test.ts                    | 45 +++++++++++++
 lib/affiliations-domain.ts                         | 47 ++++++-------
 lib/compact-date.test.mjs                          |  9 +++
 lib/compact-date.ts                                | 77 +++++++++++++++++-----
 lib/google-sheets.ts                               | 22 +++++--
 lib/licences-domain.test.ts                        | 13 ++++
 lib/licences-domain.ts                             |  3 +-
 lib/mappers/actor-records.ts                       |  5 +-
 lib/mappers/ententes.ts                            |  1 -
 lib/mappers/ligues.ts                              |  2 -
 lib/mappers/territorial.test.mjs                   | 14 ++--
 lib/territorial-mutations.ts                       | 23 +------
 lib/types.ts                                       |  3 -
 43 files changed, 315 insertions(+), 233 deletions(-)
```

### git status --short
```
 M app/api/athletes/[id]/affiliations/route.ts
 M app/api/coachs/[id]/affiliations/route.ts
 M app/api/medecins/[id]/affiliations/route.ts
 M app/api/officiels/[id]/affiliations/route.ts
 M app/clubs/page.tsx
 M app/licences/page.tsx
 M components/actors/actor-table.tsx
 M components/arbitres/arbitres-table.tsx
 M components/athletes/athlete-detail.tsx
 M components/athletes/athletes-table.tsx
 M components/autres-acteurs/autre-acteur-detail.tsx
 M components/autres-acteurs/autres-acteurs-table.tsx
 M components/clubs/club-detail.tsx
 M components/clubs/clubs-client.tsx
 M components/coachs/coach-detail.tsx
 M components/coachs/coachs-table.tsx
 M components/competitions/competition-detail-v2.tsx
 M components/ententes/entente-detail.tsx
 M components/ententes/entente-form-dialog.tsx
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
 M lib/mappers/actor-records.ts
 M lib/mappers/ententes.ts
 M lib/mappers/ligues.ts
 M lib/mappers/territorial.test.mjs
 M lib/territorial-mutations.ts
 M lib/types.ts
-- app/api/affiliations/
-- app/api/licences/
-- components/actors/affiliations-panel.tsx
-- components/licences/athlete-licence-form.tsx
-- docs/audit-colonnes-id-acteurs.md
-- docs/lot-fiche-club-acteurs.md
-- docs/lot-suppression-colonnes-territoriales.md
-- lib/actor-affiliation-schema.test.ts
-- lib/actor-affiliation-schema.ts
-- lib/actor-affiliations.ts
-- lib/athlete-affiliation-fields.test.ts
-- lib/athlete-affiliation-fields.ts
-- lib/athlete-licence-creation.ts
-- lib/club-actors-model.test.ts
-- lib/club-actors-model.ts
-- lib/club-actors.ts
-- test-results/
```
