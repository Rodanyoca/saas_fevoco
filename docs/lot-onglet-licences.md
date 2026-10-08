# Onglet Licences — 8 octobre 2026

## Fiche entraîneur : retrait de l’ajout

L’action d’ajout de licence est supprimée de la fiche entraîneur. Le composant dédié `coach-licence-form-dialog.tsx`, devenu sans appelant, est supprimé ; son import, la prop `onLicenceCreated` et le callback de création dans `coachs-client.tsx` sont retirés. L’historique reste affiché en lecture. Les interfaces et services du module Licences sont conservés. TypeScript, ESLint ciblé et build passent. Aucun commit ni push.

État Git des fichiers concernés, incluant les adaptations antérieures de la fiche :

```text
 components/coachs/coach-detail.tsx              | 15 ++----
 components/coachs/coach-licence-form-dialog.tsx | 64 -------------------------
 components/coachs/coachs-client.tsx             |  2 +-
 3 files changed, 6 insertions(+), 75 deletions(-)

 M components/coachs/coach-detail.tsx
 D components/coachs/coach-licence-form-dialog.tsx
 M components/coachs/coachs-client.tsx
```

La fiche athlète reprend la carte « Historique des licences » de `febaco-reference/app/dashboard/athletes/[id]/page.tsx` : colonnes Saison, Numéro, Structure, Délivrée le, Statut ; numéro en police monospace, badges, en-têtes et séparations partagés, état vide dans le tableau. Le tableau défile horizontalement sur mobile. Les blocs de licence actuelle et les cartes d’historique sont remplacés par cette liste unique.

Le composant commun `components/actors/record-sections.tsx` adapte aussi les licences des autres acteurs : numéro, délivrance, validité et statut. Les actions existantes restent disponibles à gauche, en or. Aucun bouton d’ajout sans fonctionnalité existante n’est introduit pour l’athlète. Aucun service, mapping, permission ni schéma Sheets ne change.

Fichiers modifiés : `components/actors/record-sections.tsx`, `components/athletes/athlete-detail.tsx`, ce rapport. Composants portés : Card et Table de l’onglet FEBACO, adaptés aux données FEVOCO.

Contrôles : ESLint ciblé, TypeScript, build de production et cinq tests de dates réussis. Vérification navigateur : historique rempli et vide, colonnes, dates, affichage ordinateur et mobile 390 px. Captures locales sous `node_modules/.cache/club-actors-ui/`. Écart conservé : les autres acteurs présentent leur validité plutôt qu’une saison absente de leur type de données. Aucun commit ni push.

État Git des fichiers du lot (inclut les changements antérieurs sur la fiche athlète) :

```text
 components/actors/record-sections.tsx  | 70 +++++++++++++++-------------------
 components/athletes/athlete-detail.tsx | 28 +++-----------
 2 files changed, 37 insertions(+), 61 deletions(-)

 M components/actors/record-sections.tsx
 M components/athletes/athlete-detail.tsx
?? docs/lot-onglet-licences.md
```
