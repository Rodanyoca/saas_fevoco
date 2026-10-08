# Page Licences des athlètes — FEVOCO — 8 octobre 2026

## Ajustement demandé : synthèse sans action

L’action « Voir les licenciés », sa cellule, l’en-tête Action et son gestionnaire `onClick` sont supprimés de la synthèse territoriale. L’état vide couvre désormais six colonnes. Le filtre Club conserve son fonctionnement propre via la liste déroulante ; aucun service ou route n’était lié au bouton supprimé. Fichier modifié : `components/licences/athlete-licences-client.tsx`.

## Comparaison et adaptation

Références FEBACO consultées en lecture seule : `app/dashboard/licences/page.tsx` et `components/dashboard/licence-editor.tsx`.

| Élément FEBACO | Adaptation FEVOCO |
| --- | --- |
| Saison et actions d’enregistrement | Même disposition, action principale or, actualisation |
| Cinq KPI par saison | Total, masculins, féminins, actives, expirées/clôturées |
| Synthèse territoriale par équipe | Synthèse par club, y compris clubs sans licence |
| Filtres Ligue → Entente → Club → Équipe | Ligue → Entente → Club, filtres enfants réinitialisés |
| Liste des licences et filtres sexe/statut | Même ordre : numéro, athlète, sexe, saison, club, délivrance, statut, actions |
| Consultation et modification latérales | Panneaux latéraux, identité/saison/affiliation immuables en modification |
| Enregistrement individuel | Choix d’une affiliation d’athlète au club |
| Renouvellement par équipe | Renouvellement par club, sélection d’affiliés renouvelables |
| Cartes mobiles | Cartes mobiles avec statuts et actions, tableaux territoriaux à défilement horizontal |

Les références FEVOCO restent autoritatives. Aucun identifiant, équipe territoriale, schéma ou règle d’authentification FEBACO n’est importé. Les en-têtes utilisés sont ceux du schéma déjà vérifié dans les lots précédents. Les lignes sans identifiant sont exclues des options.

## Données et mutations

La licence conserve son lien `id_affiliation_athlete` ; le club est résolu depuis l’affiliation, puis l’entente et la ligue depuis les parents territoriaux. Les champs d’observation et d’affiliation sont exposés au panneau de consultation/modification. Les lectures restent groupées et mises en cache, avec relecture fraîche des licences avant mutation.

La modification met à jour la même ligne et conserve les identifiants d’athlète, saison et affiliation. Le renouvellement collectif demande une affiliation active au club à la date saisie, une licence précédente et l’absence de licence pour la saison cible. Il conserve le numéro précédent. Une première licence est enregistrée individuellement. Toutes les commandes du lot sont validées avant une seule requête d’ajout groupée, sans lecture Sheets par athlète. Les vues licences, athlètes et clubs sont invalidées après sauvegarde.

Les dates utilisent la saisie compacte centralisée et sont revalidées côté serveur ; écritures ISO et format de cellule `yyyy-mm-dd`. Une saisie partielle ne déclenche pas d’exception de rendu.

## Fichiers du lot

- `components/licences/athlete-licences-client.tsx` : structure, KPI, filtres, synthèse, tableau et actions.
- `components/licences/athlete-licence-editor.tsx` : panneaux individuel, consultation, modification et renouvellement collectif.
- `components/dashboard/data-table.tsx` : état vide visible aussi avec les cartes mobiles.
- `lib/licences-overview.ts` : exposition de l’affiliation et des observations.
- `lib/athlete-licence-creation.ts` : références territoriales, résolution des statuts, mutations sérialisées dans l’instance, relecture fraîche.
- `lib/licences-domain.ts` et son test : modification, renouvellement, validation partagée des dates et tests métier.
- `lib/google-sheets.ts` : ajout de plusieurs lignes via une seule requête append ; API d’ajout unitaire conservée.
- `app/api/licences/athletes/route.ts` : création individuelle/collective, modification, invalidation des vues.
- Ce rapport.

## Vérifications

- TypeScript, ESLint global et build de production : réussis.
- 24 tests de domaine, dates et affiliations : réussis.
- Service et routes réels avec Google simulé : références, parents territoriaux, renouvellement groupé, club incompatible, doublons, dates impossibles, modification et relecture vérifiés.
- Navigateur : cinq KPI, filtres territoriaux, recherche, consultation verrouillée, modification, création, renouvellement, dates progressives/collées/invalides et actualisation après sauvegarde. États vide et erreur vérifiés. Ordinateur et mobile 390 px sans débordement de page.
- Captures : `node_modules/.cache/club-actors-ui/licence-page-desktop.png`, `licence-page-mobile.png`, `licence-renew-club.png`.
- Aucune écriture de test sur Google réel. Aucun commit ni push.

## Limites et différences conservées

- Les permissions FEVOCO existantes sont conservées ; aucun système de rôles FEBACO n’est ajouté.
- Le champ de date reste au format de saisie FEVOCO obligatoire, plutôt que le champ natif FEBACO.
- Les KPI sont globaux pour la saison sélectionnée ; les filtres territoriaux restreignent la synthèse et la liste, comme dans la référence.
- Google Sheets ne fournit pas de transaction entre instances serveur : la sérialisation locale réduit les conflits, sans garantie d’unicité atomique entre plusieurs instances. Les erreurs métier sont contrôlées avant l’écriture groupée.
- Les règles existantes d’enregistrement individuel depuis une affiliation historique sont conservées. La condition d’affiliation active concerne le renouvellement collectif.

## État Git global

Les travaux précédents non commités sont conservés. Les fichiers non suivis ne figurent pas dans `git diff --stat`.

### git diff --stat

```text
 app/api/athletes/[id]/affiliations/route.ts        |  8 +++
 app/api/coachs/[id]/affiliations/route.ts          | 18 ++---
 app/api/medecins/[id]/affiliations/route.ts        | 18 ++---
 app/api/officiels/[id]/affiliations/route.ts       | 18 ++---
 app/clubs/page.tsx                                 | 12 ++--
 app/licences/page.tsx                              |  3 +-
 components/actors/actor-table.tsx                  |  2 +-
 components/actors/record-sections.tsx              | 70 +++++++++-----------
 components/arbitres/arbitres-table.tsx             |  2 +-
 components/athletes/athlete-detail.tsx             | 28 ++------
 components/athletes/athletes-table.tsx             |  2 +-
 components/autres-acteurs/autre-acteur-detail.tsx  |  9 ++-
 components/autres-acteurs/autres-acteurs-table.tsx |  4 +-
 components/clubs/club-detail.tsx                   | 51 +++++++++-----
 components/clubs/clubs-client.tsx                  | 11 ++--
 components/coachs/coach-detail.tsx                 | 12 ++--
 components/coachs/coachs-table.tsx                 |  2 +-
 components/competitions/competition-detail-v2.tsx  |  4 +-
 components/dashboard/data-table.tsx                |  2 +-
 components/ententes/entente-detail.tsx             |  2 +-
 components/ententes/entente-form-dialog.tsx        |  4 +-
 components/licences/athlete-licences-client.tsx    | 55 ++++++++++++++--
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
 lib/google-sheets.ts                               | 34 ++++++++--
 lib/licences-domain.test.ts                        | 42 ++++++++++++
 lib/licences-domain.ts                             | 37 ++++++++++-
 lib/licences-overview.ts                           |  4 +-
 lib/mappers/actor-records.ts                       |  5 +-
 lib/mappers/ententes.ts                            |  1 -
 lib/mappers/ligues.ts                              |  2 -
 lib/mappers/territorial.test.mjs                   | 14 ++--
 lib/territorial-mutations.ts                       | 23 +------
 lib/types.ts                                       |  3 -
 46 files changed, 468 insertions(+), 284 deletions(-)
```

### git status --short

```text
 M app/api/athletes/[id]/affiliations/route.ts
 M app/api/coachs/[id]/affiliations/route.ts
 M app/api/medecins/[id]/affiliations/route.ts
 M app/api/officiels/[id]/affiliations/route.ts
 M app/clubs/page.tsx
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
 M components/coachs/coachs-table.tsx
 M components/competitions/competition-detail-v2.tsx
 M components/dashboard/data-table.tsx
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
?? components/licences/athlete-licence-editor.tsx
?? components/licences/athlete-licence-form.tsx
?? docs/audit-colonnes-id-acteurs.md
?? docs/correction-select-licences.md
?? docs/lot-affiliations-acteurs.md
?? docs/lot-fiche-club-acteurs.md
?? docs/lot-onglet-licences.md
?? docs/lot-page-licences-athletes.md
?? docs/lot-suppression-colonnes-territoriales.md
?? lib/actor-affiliation-schema.test.ts
?? lib/actor-affiliation-schema.ts
?? lib/actor-affiliations.ts
?? lib/athlete-affiliation-fields.test.ts
?? lib/athlete-affiliation-fields.ts
?? lib/athlete-licence-creation.ts
?? lib/club-actors-model.test.ts
?? lib/club-actors-model.ts
?? lib/club-actors.ts
?? test-results/
```
