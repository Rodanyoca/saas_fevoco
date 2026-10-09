# Officiels : colonne Licence

9 octobre 2026.

Comparaison en lecture seule du code FEBACO `app/dashboard/officiels/page.tsx` : première colonne ID, puis nom avec avatar, sexe/âge, identifiants, contact, statut et actions. FEVoco conservait les autres informations mais n'avait pas la première colonne.

Adaptation ciblée de `components/officiels/officiels-table.tsx` : Licence prend cette première position, en remplacement de l'identifiant de la référence. Les largeurs sont réparties sur sept colonnes. Ajout du numéro dans les cartes mobiles et adaptation du colspan de l'état vide. Les autres contenus FEVoco, dont l'identifiant FIVB, les filtres, la pagination et les actions, sont conservés.

La fonction commune `activeActorLicenceNumbers` calcule les numéros depuis la prop `licences` déjà chargée avec la page : statut actif et période valide au jour courant à Kinshasa. Sans licence valide, un tiret apparaît. Aucun endpoint ni appel Sheets supplémentaire.

Validation : trois tests de validité, TypeScript indépendant, ESLint ciblé, build et contrôle du diff réussis. Playwright sur l'application réelle vérifie la première colonne Licence, les sept en-têtes, le bureau 1440 × 1000 et le mobile 390 × 844, sans débordement ni erreur JavaScript. Zéro requête API de données supplémentaire ; les avatars restent chargés séparément.

Aucune licence d'officiel valide dans la source au moment du contrôle : la vérification réelle couvre l'état vide, et la sélection des numéros valides repose sur la fonction commune testée.

Captures inspectées : [bureau](officiels-qa/licence-desktop.png), [mobile](officiels-qa/licence-mobile.png). Aucun changement Google. Serveur temporaire 3100 arrêté.

Fichiers de ce lot : `components/officiels/officiels-table.tsx`, ce rapport et captures locales. Aucun composant externe porté ; aucune modification FEBACO. Aucun commit ni push. L'état Git ci-dessous inclut le lot médecins précédent, conservé.

### git diff --stat

```text
 components/medecins/medecins-client.tsx  | 12 ++++++++----
 components/medecins/medecins-table.tsx   |  3 ++-
 components/officiels/officiels-table.tsx |  9 ++++++---
 3 files changed, 16 insertions(+), 8 deletions(-)
```

### git status --short

```text
 M components/medecins/medecins-client.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiels-table.tsx
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/coachs-qa/
?? docs/entourage-qa/
?? docs/lot-medecins-licence-valide.md
?? docs/lot-officiels-colonne-licence.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? test-results/
```

## Correction de disposition demandée

Les ID national et FIVB, l’e-mail et le téléphone occupent désormais quatre colonnes distinctes, alignées sur la ligne de l’officiel. Seuls le sexe et l’âge restent superposés. Cette disposition remplace les regroupements identifiants/contact décrits précédemment : neuf colonnes au total. Le tableau conserve un défilement horizontal dans son conteneur lorsque sa largeur minimale de 1280 px dépasse l’espace disponible. Sur mobile, chaque champ possède son libellé et les coordonnées disposent de toute la largeur de la carte.

TypeScript indépendant, ESLint ciblé, build et git diff --check réussis. Playwright vérifie les neuf en-têtes, les quatre cellules sans retour à la ligne, le sexe/âge sur deux lignes et l’absence de débordement de page mobile. Captures bureau et mobile inspectées. Aucune requête API de données supplémentaire, aucune écriture Google. Serveur temporaire arrêté, aucun port 3100 en écoute.

État final du diff (inclut le lot médecins conservé) :
```text
 components/medecins/medecins-client.tsx  | 12 ++++++++----
 components/medecins/medecins-table.tsx   |  3 ++-
 components/officiels/officiels-table.tsx | 11 ++++++-----
 3 files changed, 16 insertions(+), 10 deletions(-)
```
Le statut Git reste celui relevé ci-dessus : trois composants modifiés, rapports et captures non suivis. Aucun commit ni push.

## Retrait des coordonnées de la liste

À la demande utilisateur, suppression des colonnes e-mail et téléphone ainsi que de ces champs dans les cartes mobiles des officiels. Sept colonnes conservées : Licence, Nom complet, Sexe / Âge, ID national, ID FIVB, Statut et Actions. Largeurs rééquilibrées à 100 %, largeur minimale ramenée à 980 px et colspan vide ajusté à sept. Aucun composant porté, aucun changement de mapping ni de requête. Fichier modifié : components/officiels/officiels-table.tsx. Les modifications médecins déjà présentes restent conservées. Aucun commit ni push.
Validation finale : ESLint, TypeScript indépendant, build et diff check réussis. Playwright et inspection des captures bureau/mobile confirment sept colonnes et le retrait des coordonnées. Zéro requête API de données supplémentaire. Serveur temporaire arrêté. Diff stat et statut Git identiques au relevé précédent.

## Fiche detaillee : comparaison FEBACO / FEVoco

Reference lue sans modification : FEBACO app/dashboard/officiels/[id]/page.tsx et components/dashboard/actor-licenses-panel.tsx. FEBACO utilise des DetailCard et trois onglets ; General comporte trois cartes avec grille adaptative, Licences un historique en lecture seule (numero, cycle, delivrance, validite, statut). Aucun bouton de creation dans cette fiche. Son bouton de rafraichissement relance une lecture API.

Avant adaptation FEVoco : cartes conditionnelles avec grille auto-fit, jusqu'a cinq cartes, nombre et disposition variables selon les champs renseignes. Licences affichait quatre colonnes et un formulaire local, avec une mutation historique vers OFFICIELS_LICENCES distincte du parcours canonique ACTEURS_LICENCES.

Resultat selon la demande : quatre cartes permanentes Identite, Contact, Identifiants, Observations ; deux colonnes des 768 px, une seule sur mobile. Passeport et dates conserves dans Identifiants. L'historique reprend les cinq informations FEBACO. Le cycle est resolu par id_cycle_licence / nom_cycle_licence, en-tetes verifies dans Google en lecture seule. La lecture du referentiel est lancee en parallele et regroupee avec les autres lectures Sheets ; aucune lecture par ligne ni requete navigateur lors du changement d'onglet. Le bouton de rafraichissement FEBACO n'est pas porte : donnees initiales conservees selon la contrainte de chargement groupe. Aucun changement de statut ni de regles metier.

Suppression du dialogue officiel-licence-form-dialog.tsx, de l'API /api/officiels/[id]/licences et de lib/officiel-licence-mutations.ts, plus du callback local. Le parcours Entourage /api/licences/acteurs reste disponible, ses tests creation/renouvellement/transitions passent. Aucun composant FEBACO copie ni fichier FEBACO modifie.

Fichiers de ce lot : components/officiels/officiel-detail.tsx, components/officiels/officiels-client.tsx, components/actors/record-sections.tsx, lib/actor-records.ts, lib/types.ts et les trois suppressions ci-dessus. Les modifications de liste et medecins precedentes sont conservees.

Validation : ESLint cible, TypeScript independant, build, git diff --check, deux tests de chargement et test des routes Entourage reussis. Playwright sur donnees reelles verifie exactement quatre cartes, leurs positions 2 x 2 a 1440 x 1000, cinq colonnes de licences, absence de creation, et mobile 390 x 844 sans debordement de page. Aucun appel API de donnees supplementaire ni erreur JavaScript. Captures detail-general-desktop/mobile et detail-licences-desktop/mobile inspectees dans docs/officiels-qa. Le tableau mobile defile dans son conteneur. Aucun officiel avec licence dans la fiche controlee : verification visuelle de l'etat vide, sans ajout de donnees fictives. Serveur temporaire arrete. Aucun commit ni push.
 
### git diff --stat (apres adaptation de la fiche)
```text
 app/api/officiels/[id]/licences/route.ts           | 19 ------
 components/actors/record-sections.tsx              |  6 +-
 components/medecins/medecins-client.tsx            | 12 ++--
 components/medecins/medecins-table.tsx             |  3 +-
 components/officiels/officiel-detail.tsx           | 20 +++---
 .../officiels/officiel-licence-form-dialog.tsx     | 64 -------------------
 components/officiels/officiels-client.tsx          |  2 +-
 components/officiels/officiels-table.tsx           | 11 ++--
 lib/actor-records.ts                               |  9 ++-
 lib/officiel-licence-mutations.ts                  | 72 ----------------------
 lib/types.ts                                       |  1 +
 11 files changed, 38 insertions(+), 181 deletions(-)
```
### git status --short (apres adaptation de la fiche)
```text
 D app/api/officiels/[id]/licences/route.ts
 M components/actors/record-sections.tsx
 M components/medecins/medecins-client.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiel-detail.tsx
 D components/officiels/officiel-licence-form-dialog.tsx
 M components/officiels/officiels-client.tsx
 M components/officiels/officiels-table.tsx
 M lib/actor-records.ts
 D lib/officiel-licence-mutations.ts
 M lib/types.ts
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/coachs-qa/
?? docs/entourage-qa/
?? docs/lot-medecins-licence-valide.md
?? docs/lot-officiels-colonne-licence.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? test-results/
```

## Officiel federal : entite non requise

Symptome reproduit avant correction par node --experimental-transform-types --test lib/affiliations-domain.test.ts : creation sans id_entite refusee, ENTITE_INVALIDE (422). Causes confirmees : champ affiche sans condition dans le formulaire, validation serveur generique, et targetExists false dans le mapping des licences pour federation sans id_entite.

Correction : le type FEDERATION du referentiel identifie un officiel federal. Le formulaire masque alors Entite ; le serveur accepte et normalise id_entite a vide en creation/modification. Ligue, Entente et Club exigent toujours une entite existante du bon type. Fonction et type restent obligatoires. Les autres categories d'acteurs sont inchangees. Les affiliations federales sans nom restent lisibles sans anomalie Structure introuvable et utilisables dans Entourage ; libelle de federation resolu depuis les donnees existantes, sinon depuis le type. Aucun nouveau mapper de colonnes ni lecture Google ajoutee. Les anciennes lignes federales avec id_entite sont reconnues pour l'idempotence et les chevauchements ; aucune migration des donnees existantes.

Fichiers : components/actors/affiliations-panel.tsx, lib/affiliations-domain.ts, lib/actor-affiliation-schema.ts, lib/actor-affiliations.ts, lib/actor-licences-model.ts ; regressions lib/affiliations-domain.test.ts et lib/actor-licences-model.test.ts. Aucun composant porte depuis FEBACO, aucune modification des references.

Validation : 14 tests domaine/mapping et test des routes Entourage passes, ESLint cible, TypeScript independant, build et diff check reussis. Playwright sur donnees reelles : FEDERATION sans champ Entite, LIGUE/ENTENTE/CLUB avec champ obligatoire, bureau 1440x1000 et mobile 390x844 sans debordement ni erreur JavaScript. Captures affiliation-federation-desktop/mobile.png inspectees. Aucune ecriture Google pendant la verification. Serveur temporaire arrete. Les mutations sont verifiees avec des stores de test en memoire. Aucun commit ni push ; les lots precedents sont conserves dans le statut ci-dessous.
 
### git diff --stat (entite federale)
```text
 app/api/officiels/[id]/licences/route.ts           | 19 ------
 components/actors/affiliations-panel.tsx           |  5 +-
 components/actors/record-sections.tsx              |  6 +-
 components/medecins/medecins-client.tsx            | 12 ++--
 components/medecins/medecins-table.tsx             |  3 +-
 components/officiels/officiel-detail.tsx           | 20 +++---
 .../officiels/officiel-licence-form-dialog.tsx     | 64 -------------------
 components/officiels/officiels-client.tsx          |  2 +-
 components/officiels/officiels-table.tsx           | 11 ++--
 lib/actor-affiliation-schema.ts                    |  5 +-
 lib/actor-affiliations.ts                          |  3 +-
 lib/actor-licences-model.test.ts                   | 10 +++
 lib/actor-licences-model.ts                        |  5 +-
 lib/actor-records.ts                               |  9 ++-
 lib/affiliations-domain.test.ts                    | 17 +++++
 lib/affiliations-domain.ts                         | 11 ++--
 lib/officiel-licence-mutations.ts                  | 72 ----------------------
 lib/types.ts                                       |  1 +
 18 files changed, 84 insertions(+), 191 deletions(-)
```
### git status --short (entite federale)
```text
 D app/api/officiels/[id]/licences/route.ts
 M components/actors/affiliations-panel.tsx
 M components/actors/record-sections.tsx
 M components/medecins/medecins-client.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiel-detail.tsx
 D components/officiels/officiel-licence-form-dialog.tsx
 M components/officiels/officiels-client.tsx
 M components/officiels/officiels-table.tsx
 M lib/actor-affiliation-schema.ts
 M lib/actor-affiliations.ts
 M lib/actor-licences-model.test.ts
 M lib/actor-licences-model.ts
 M lib/actor-records.ts
 M lib/affiliations-domain.test.ts
 M lib/affiliations-domain.ts
 D lib/officiel-licence-mutations.ts
 M lib/types.ts
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/coachs-qa/
?? docs/entourage-qa/
?? docs/lot-medecins-licence-valide.md
?? docs/lot-officiels-colonne-licence.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? test-results/
```

## Harmonisation finale de la liste et de la fiche des officiels

Perimetre : officiels, dans la continuite de la conversation. References FEBACO consultees en lecture seule : app/dashboard/officiels/page.tsx, components/dashboard/data-table.tsx, app/dashboard/officiels/[id]/page.tsx et components/dashboard/detail-card.tsx.

Liste : recherche compacte max-w-md, filtres de 180 px avec retour a la ligne, finition du conteneur du tableau et pagination toujours visible comme FEBACO. Choix 10/25/50/100, nombre de resultats, page courante et fleches desactivees aux limites. Titre de section conserve pour l'accessibilite et masque visuellement. Fiche : statut sous le nom, identifiant national sous le nom avec repli sur le code, Code Officiel distinct a droite, icones Flag/Fingerprint de la reference. Aucun nouveau composant global porte ; styles et comportements adaptes dans les composants existants.

Demandes precedentes preservees : Licence en premiere colonne, aucun e-mail/telephone en liste, ID national et FIVB distincts, sexe/age empiles, quatre cartes 2x2, onglet licence sans creation, creation dans Entourage, federation sans nom d'entite obligatoire. Ecarts volontaires avec FEBACO : ces choix utilisateur, cartes mobiles pour la liste, photo modifiable dans le formulaire existant plutot qu'un nouveau bouton et formulaire photo dedie. Les mappers et chargements restent inchanges dans ce lot.

Fichiers modifies : components/officiels/officiels-table.tsx, components/officiels/officiels-filters.tsx et components/officiels/officiel-detail.tsx. Validation : ESLint cible, TypeScript independant, build et diff check reussis ; Playwright bureau/mobile, recherche d'une licence active reelle, recherche sans resultat et reinitialisation, choix 25 lignes, ouverture fiche et retour, code officiel, quatre cartes 2x2 et cinq colonnes de licences. Une licence active d'officiel trouvee dans Google et affichee dans la liste au controle. Aucune requete API de donnees supplementaire lors des lectures liste/general/licences, aucune erreur JavaScript, aucun debordement de page mobile. Captures liste et fiche inspectees. La fiche capturee par le controle conserve l'etat sans licence pour l'officiel alors selectionne ; aucune ecriture ou donnee de test injectee dans Google. Serveur temporaire arrete. Aucun commit ni push. Le statut suivant comprend les lots precedents conserves.
 
### git diff --stat (harmonisation finale)
```text
 app/api/officiels/[id]/licences/route.ts           | 19 ------
 components/actors/affiliations-panel.tsx           |  5 +-
 components/actors/record-sections.tsx              |  6 +-
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
 lib/officiel-licence-mutations.ts                  | 72 ----------------------
 lib/types.ts                                       |  1 +
 19 files changed, 98 insertions(+), 201 deletions(-)
```
### git status --short (harmonisation finale)
```text
 D app/api/officiels/[id]/licences/route.ts
 M components/actors/affiliations-panel.tsx
 M components/actors/record-sections.tsx
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
 D lib/officiel-licence-mutations.ts
 M lib/types.ts
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/coachs-qa/
?? docs/entourage-qa/
?? docs/lot-medecins-licence-valide.md
?? docs/lot-officiels-colonne-licence.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? test-results/
```
