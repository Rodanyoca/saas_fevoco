# Responsables dans la modification d’une ligue — 9 novembre 2026

## Résultat

Le formulaire latéral « Modifier une ligue » comprend maintenant une section Responsables. Elle est accessible depuis les boutons de modification de la liste et de la fiche détaillée. La création d’une ligue conserve son parcours existant.

Chaque désignation propose : catégorie d’acteur, recherche d’une personne, fonction auprès de la ligue, statut Actif/Inactif, contact principal et observation. Le téléphone et l’e-mail sont affichés depuis la fiche acteur en lecture seule. Le bouton Ajouter un responsable crée une ligne dans le formulaire. Retirer une désignation existante la désactive à l’enregistrement ; aucune suppression définitive n’est réalisée.

Les données sont chargées à l’ouverture du formulaire, avec annulation de la requête à sa fermeture. Une erreur de chargement affiche une action Réessayer et bloque l’enregistrement pour éviter de remplacer les responsables par une liste vide. Le bouton Enregistrer sauvegarde la ligue et les responsables dans une seule opération Sheets. Un verrou de soumission empêche les doubles clics. La fiche est rafraîchie après succès.

## Données et contrôles serveur

Les en-têtes de PERSONNES_CONTACT_ENTITES et TYPES_ACTEURS ont été revérifiés en lecture seule. Les catégories sont résolues par source_donnees et les identifiants par la colonne propre à chaque catégorie. Les six catégories Acteurs sont chargées dans un batch lors de l’ouverture du formulaire, puis lors de la validation d’un enregistrement. Seuls les identifiants, noms et coordonnées utiles aux sélecteurs sont renvoyés.

Le serveur impose STR001 et l’identifiant de la ligue de la route. Il génère les nouveaux identifiants VOL-CONTACT avec UUID. Les identifiants sont écrits comme chaînes, notamment 01 et 001. Le contact principal est écrit comme booléen. Les nouvelles écritures ne contiennent aucune copie du nom, du téléphone ou de l’e-mail de l’acteur.

Contrôles : existence de la ligue, appartenance des désignations à cette ligue, correspondance type/personne, fonction obligatoire, statuts autorisés, absence de personne active dupliquée et au plus un principal actif. Une fiche introuvable peut être désactivée sans inventer de coordonnées. Une empreinte des désignations détecte les changements intervenus depuis l’ouverture et est revérifiée avant l’écriture.

Le service batch existant est étendu pour grouper modifications et ajouts dans un seul spreadsheets.batchUpdate, avec mapping par en-têtes, conservation des autres cellules, booléens natifs et dates canoniques. Toutes les validations précèdent les écritures. Les règles et données d’Entente/Club ne sont pas modifiées. La route GET/PATCH reste soumise à la politique d’accès sportive existante du proxy.

## Fichiers du lot

- components/ligues/ligue-form-dialog.tsx : chargement, intégration et soumission du formulaire.
- components/ligues/ligue-responsables-fields.tsx : champs de gestion des responsables avec composants FEVOCO existants.
- app/api/ligues/[id]/route.ts : lecture des données du formulaire.
- lib/ligue-contact-editor-model.ts : types de l’interface.
- lib/ligue-contact-editor.ts : lectures groupées et préparation des mutations.
- lib/ligue-contact-rules.ts : règles, empreinte et plan d’écriture.
- lib/ligue-responsables-model.ts : export partagé des colonnes d’identifiants Acteurs.
- lib/territorial-mutations.ts : sauvegarde de la ligue et des désignations.
- lib/google-sheets.ts : extension du batch existant.
- lib/ligue-contact-rules.test.ts, lib/ligue-contact-write.test.cjs, lib/ligue-contact-save.test.cjs : tests isolés.
- lib/territorial-pages.test.cjs : adaptation du mock au service de responsables ajouté lors du lot précédent ; les tests Entente/Club restent inchangés dans leur comportement.

## Vérifications

- 45 tests réussis au total sur les règles de responsables, la lecture, la sauvegarde complète, le batch partagé, les modifications de compétitions utilisant ce batch, les dates compactes, les mappings et les pages territoriales.
- ESLint global et ciblé : réussis.
- TypeScript sans émission : réussi.
- Build de production : réussi ; le contrôle TypeScript a été exécuté séparément car le build existant ignore les erreurs de types.
- git diff --check : réussi.
- Aucune écriture dans les classeurs réels pendant ces contrôles ; les mutations ont été vérifiées avec des sources et clients Sheets isolés en mémoire.
- Revue React : imports serveur séparés, chargement limité à l’ouverture, requête annulable, identifiants de champs par useId, clés stables des lignes, champs désactivés pendant la sauvegarde.

## Limites restantes

La vérification visuelle dans le navigateur n’a pas été effectuée : le serveur reste arrêté selon la demande précédente. Le parcours réel d’enregistrement n’a pas été exécuté dans Google Sheets pour éviter toute modification de données pendant les tests. L’empreinte fournit une détection optimiste des changements ; Google Sheets ne propose pas de verrou conditionnel transactionnel entre la dernière lecture et l’écriture de deux requêtes concurrentes. Le batch garantit l’application groupée des changements d’une requête.

Le dépôt contient des changements antérieurs. Les sorties globales ci-dessous les incluent ; les fichiers nouveaux non suivis n’entrent pas dans diff --stat. Aucun commit ni push.

## git diff --stat

~~~text
 CONTEXT.md                                      |   4 +
 app/api/affiliations/[kind]/route.ts            |   5 +-
 app/api/licences/athletes/route.ts              |   8 +-
 app/api/ligues/[id]/route.ts                    |  10 ++
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
 components/ligues/ligue-form-dialog.tsx         |  42 +++++++-
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
 lib/google-sheets.ts                            |  29 +++++-
 lib/licences-domain.test.ts                     |  62 ++---------
 lib/licences-domain.ts                          |  44 ++------
 lib/licences-overview.ts                        |   6 +-
 lib/mappers/actor-records.ts                    |   6 +-
 lib/territorial-mutations.ts                    |  20 +++-
 lib/territorial-pages.test.cjs                  |   3 +-
 lib/types.ts                                    |  10 ++
 proxy.ts                                        |   2 +-
 44 files changed, 343 insertions(+), 641 deletions(-)
~~~

## git status --short

~~~text
 M CONTEXT.md
 M app/api/affiliations/[kind]/route.ts
 M app/api/licences/athletes/route.ts
 M app/api/ligues/[id]/route.ts
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
 M components/ligues/ligue-form-dialog.tsx
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
 M lib/territorial-mutations.ts
 M lib/territorial-pages.test.cjs
 M lib/types.ts
 M proxy.ts
 M tsconfig.json
?? app/conditions-utilisation/
?? app/confidentialite/
?? components/athletes/athlete-transfers-panel.tsx
?? components/ligues/ligue-responsables-fields.tsx
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
?? docs/ligue-responsables-formulaire-2026-11-09.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? docs/performance/sports-ui-2026-11-05/
?? docs/transferts-licences-sportives-2026-11-05.md
?? lib/athlete-transfers-domain.ts
?? lib/ligue-contact-editor-model.ts
?? lib/ligue-contact-editor.ts
?? lib/ligue-contact-rules.test.ts
?? lib/ligue-contact-rules.ts
?? lib/ligue-contact-save.test.cjs
?? lib/ligue-contact-write.test.cjs
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
