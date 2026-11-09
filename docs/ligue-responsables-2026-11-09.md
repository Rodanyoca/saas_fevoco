# Responsables des ligues — 9 novembre 2026

## Livraison

La section Responsables conserve le composant FEVOCO DetailCard, son emplacement, son icône, ses couleurs et la présentation des champs. Les anciens champs président/secrétaire ne sont plus la source de cette section. Chaque désignation fournit une fonction, un nom complet, un téléphone et une adresse e-mail. Tous les responsables actifs sont affichés, avec les contacts principaux en premier.

Périmètre : lecture de la fiche Ligue uniquement. Aucune modification des formulaires, des fiches Entente/Club, des autorisations ou du schéma des classeurs. Aucune écriture Google Sheets, aucun commit ni push.

## Sources vérifiées en lecture seule

- Structure territoriale : `1NP19RMt5huJU57vK8hGmTrwsCWvpeQRETndwTfWO7Ro`, onglets LIGUES et PERSONNES_CONTACT_ENTITES.
- Référentiel : TYPES_ACTEURS fournit TAC001/ATHLETES, TAC002/COACHS, TAC003/OFFICIELS, TAC004/ARBITRES, TAC005/MEDECINS et TAC099/AUTRES.
- Acteurs : en-têtes vérifiés dans les six onglets. Les colonnes identifiantes sont respectivement id_athlete, id_coach, id_officiel, id_arbitre, id_medecin et id_autre_acteur.
- COC : `lib/federations/entity-contacts.ts`, consulté uniquement comme référence de résolution par catégorie.

En-têtes territoriaux constatés : id_contact_entite, id_type_structure, id_entite, id_type_acteur, id_acteur, fonction_contact, est_contact_principal, statut, observation.

La ligue `01` correspond à la LIGUE DE VOLLEYBALL DE KINSHASA. Les 999 lignes de données de PERSONNES_CONTACT_ENTITES ne contiennent actuellement aucune désignation : les cases principal sont FALSE, les références sont vides. Résultat attendu pour `01` : « Aucun responsable désigné ». Aucun responsable de test n'a été ajouté au classeur.

## Lecture et projection

Filtrage serveur STR001/ACTIF puis regroupement exact par id_entite, sous forme de chaîne : `01` reste distinct de `1`. Le client sélectionne le groupe correspondant à l'idLigue ouvert. Le serveur résout chaque couple type/identifiant à partir de source_donnees et de la colonne propre à la catégorie.

Le chargement des désignations démarre avec les autres lectures territoriales. Le service existant coalesce les lectures simultanées par classeur et conserve son cache de 30 secondes. Les catégories Acteurs nécessaires sont dédupliquées et chargées dans un batch, puis indexées en mémoire : aucun appel par responsable. Si aucune désignation n'est active, les référentiels Acteurs et les fiches Acteurs ne sont pas chargés pour cette section.

Seuls le rôle, le nom, le téléphone, l'e-mail et l'éventuelle référence introuvable sont transmis au client. Les coordonnées restent dans le classeur Acteurs. Les erreurs de lecture sont distinctes de l'état vide et n'empêchent pas le chargement des autres informations de la page.

## Fichiers du lot

- app/ligues/page.tsx : chargement serveur et état d'indisponibilité séparé.
- components/ligues/ligues-client.tsx : transmission du groupe de responsables de la ligue ouverte.
- components/ligues/ligue-detail.tsx : champs dynamiques dans la carte existante.
- lib/ligue-responsables.ts : adaptateur serveur utilisant les services Sheets existants.
- lib/ligue-responsables-model.ts : filtrage, jointure, tri et projection minimale.
- lib/ligue-responsables-model.test.ts : tests sur données isolées en mémoire.

## Validation

- 5 tests réussis : deux acteurs actifs dont un principal, désignation inactive, fiche introuvable, collisions d'identifiants entre catégories, distinction 01/1, coordonnées vides, projection minimale, absence d'appels inutiles et propagation des pannes.
- ESLint ciblé et `npm.cmd run lint` : réussis.
- `npx.cmd tsc --noEmit` : réussi après correction de l'import du runner Node dans le nouveau test.
- `npm.cmd run build` : réussi. La configuration existante ignore la validation des types au build ; le contrôle TypeScript a donc été exécuté séparément.
- `git diff --check` : réussi.
- Revue React : données chargées côté serveur, imports de types côté client, aucun nouvel effet ni appel client, carte réutilisée.

Limite restante : vérification visuelle navigateur non effectuée. Le serveur demeure arrêté à la demande précédente de l'utilisateur. Les captures anciennes ne sont pas utilisées comme preuve de validation de ce lot.

## État Git

Le dépôt contient des changements antérieurs à ce lot, notamment la connexion et le travail licences/transferts. Les sorties globales ci-dessous les incluent. Les fichiers nouveaux non suivis ne figurent pas dans diff --stat.

### git diff --stat

~~~text
 CONTEXT.md                                      |   4 +
 app/api/affiliations/[kind]/route.ts            |   5 +-
 app/api/licences/athletes/route.ts              |   8 +-
 app/api/transferts/route.ts                     |   3 +
 app/licences/page.tsx                           |   2 +-
 app/ligues/page.tsx                             |   4 +
 app/login/login.module.css                      |  68 ++++++------
 app/login/page.tsx                              |  20 ++--
 app/transferts/page.tsx                         |  14 +--
 components/actors/affiliations-panel.tsx        |   4 +
 components/actors/record-sections.tsx           |   4 +-
 components/athletes/athletes-client.tsx         |   6 +-
 components/athletes/athletes-filters.tsx        |  11 --
 components/dashboard/dashboard-layout.tsx       |   2 +-
 components/licences/athlete-licence-editor.tsx  |  53 ++++++----
 components/licences/athlete-licence-form.tsx    | 105 ++-----------------
 components/licences/athlete-licences-client.tsx |   4 +-
 components/ligues/ligue-detail.tsx              |  17 ++-
 components/ligues/ligues-client.tsx             |   6 +-
 components/transferts/transfert-detail.tsx      |   4 +-
 components/transferts/transfert-form-dialog.tsx | 132 ++----------------------
 components/transferts/transferts-client.tsx     |  12 +--
 components/ui/search-select.tsx                 |  13 ++-
 docs/athletes-pagination-febaco-2026-10-20.md   |   7 ++
 docs/lot-page-licences-athletes.md              |   2 +
 lib/actor-affiliation-schema.test.ts            |   3 +-
 lib/actor-affiliation-schema.ts                 |   8 +-
 lib/actor-affiliations.ts                       |  25 +++--
 lib/actor-records.ts                            |  13 ++-
 lib/affiliations-domain.ts                      |   1 +
 lib/athlete-affiliation-mutations.ts            | 119 +--------------------
 lib/athlete-licence-creation.ts                 |  68 ++----------
 lib/data.ts                                     |   3 +
 lib/google-sheets.ts                            |   6 ++
 lib/licences-domain.test.ts                     |  62 ++---------
 lib/licences-domain.ts                          |  44 ++------
 lib/licences-overview.ts                        |   6 +-
 lib/mappers/actor-records.ts                    |   6 +-
 lib/types.ts                                    |  10 ++
 proxy.ts                                        |   2 +-
 40 files changed, 259 insertions(+), 627 deletions(-)
~~~

### git status --short

~~~text
 M CONTEXT.md
 M app/api/affiliations/[kind]/route.ts
 M app/api/licences/athletes/route.ts
 M app/api/transferts/route.ts
 M app/licences/page.tsx
 M app/ligues/page.tsx
 M app/login/login.module.css
 M app/login/page.tsx
 M app/transferts/page.tsx
 M components/actors/affiliations-panel.tsx
 M components/actors/record-sections.tsx
 M components/athletes/athletes-client.tsx
 M components/athletes/athletes-filters.tsx
 M components/dashboard/dashboard-layout.tsx
 M components/licences/athlete-licence-editor.tsx
 M components/licences/athlete-licence-form.tsx
 M components/licences/athlete-licences-client.tsx
 M components/ligues/ligue-detail.tsx
 M components/ligues/ligues-client.tsx
 M components/transferts/transfert-detail.tsx
 M components/transferts/transfert-form-dialog.tsx
 M components/transferts/transferts-client.tsx
 M components/ui/search-select.tsx
 M docs/athletes-pagination-febaco-2026-10-20.md
 M docs/lot-page-licences-athletes.md
 M lib/actor-affiliation-schema.test.ts
 M lib/actor-affiliation-schema.ts
 M lib/actor-affiliations.ts
 M lib/actor-records.ts
 M lib/affiliations-domain.ts
 M lib/athlete-affiliation-mutations.ts
 M lib/athlete-licence-creation.ts
 M lib/data.ts
 M lib/google-sheets.ts
 M lib/licences-domain.test.ts
 M lib/licences-domain.ts
 M lib/licences-overview.ts
 M lib/mappers/actor-records.ts
 M lib/types.ts
 M proxy.ts
 M tsconfig.json
?? app/conditions-utilisation/
?? app/confidentialite/
?? components/athletes/athlete-transfers-panel.tsx
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/audit-visuel-competitions/
?? docs/autres-acteurs-qa/
?? docs/clubs-version-qa/
?? docs/coachs-qa/
?? docs/competition-detail-qa/
?? docs/competition-distinctions-cnac-qa/
?? docs/competition-equipes-affichage-qa/
?? docs/competition-equipes-colonnes-qa/
?? docs/competition-equipes-modification-qa/
?? docs/competition-equipes-qa/
?? docs/competition-phases-qa/
?? docs/correction-recherche-athletes-licence-2026-11-05.md
?? docs/entourage-qa/
?? docs/ligue-responsables-2026-11-09.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? docs/performance/sports-ui-2026-11-05/
?? docs/transferts-licences-sportives-2026-11-05.md
?? lib/athlete-transfers-domain.ts
?? lib/ligue-responsables-model.test.ts
?? lib/ligue-responsables-model.ts
?? lib/ligue-responsables.ts
?? lib/sports-atomic-store.test.cjs
?? lib/sports-atomic-store.ts
?? lib/sports-domain.test.ts
?? lib/sports-licences-domain.ts
?? lib/sports-model.ts
?? lib/sports-mutations.ts
?? scripts/verify-sports-ui.cjs
?? test-results/
~~~
