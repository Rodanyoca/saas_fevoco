# Gestion indépendante des acteurs, affiliations et licences

## Contrat initial vérifié

Le 19 novembre 2026, 45 tests de création unifiée et de protocole sportif passent avant ce lot. Le parcours crée exactement un athlète, une affiliation `TRF001` / `SAF001`, sans prédécesseur ni fin artificielle, puis une licence `STL001` pour la saison sélectionnée, avec l'identifiant de cette affiliation et le club d'attribution attendu. Les reçus persistants, l'idempotence et les reprises des trois étapes sont conservés.

## Inventaire et écarts

| Élément | Créer | Modifier | Supprimer | Dépendances et contraintes |
| --- | --- | --- | --- | --- |
| Athlète (`/api/athletes`) | Parcours unifié existant | PATCH d'identité existant, indépendant | À ajouter | Affiliation, licence, compétitions, sélections/staffs, activités et documents. |
| Coach (`/api/coachs`) | Identité existante | PATCH existant | À ajouter | Affiliations, licences, fonctions et affectations. |
| Arbitre (`/api/arbitres`) | Identité existante | PATCH existant | À ajouter | Licences, grades, matchs/compétitions ; aucune affiliation. |
| Médecin (`/api/medecins`) | Identité existante | PATCH existant | À ajouter | Affiliations, licences, staffs. |
| Officiel (`/api/officiels`) | Identité existante | PATCH existant | À ajouter | Affiliations, mandats, licences et affectations. |
| Autre acteur (`/api/autres-acteurs`) | Identité existante | PATCH existant | À ajouter | Affiliations par entité/saison, références génériques au type d'acteur. Pas de licence à inventer. |
| Affiliation athlète | Moteur de mouvements existant | Chaînes et dates contrôlées | À ajouter | Toutes licences, tous statuts ; prédécesseurs, cessions, retours et opérations en cours. |
| Autres affiliations | Domaine existant (cinq familles hors arbitre) | À renforcer : propriétaire/cible et licences liées | À ajouter | Mandats et licences liées ; aucun effet sur l'identité. |
| Licence athlète | Allocation/réservations existantes | Numéro et rattachements déjà immuables | À ajouter | Identifiant, numéro et compteur à conserver comme réservations techniques. |
| Licence entourage | Délivrance/renouvellement existants | À renforcer : numéro, affiliation, cycle et propriétaire immuables en édition ordinaire | À ajouter | Références entrantes et opérations en cours ; annulation distincte de la suppression. |

L'autorisation actuelle est `AUT-SPT:WRITE` pour les mutations sportives, DELETE compris selon `route-policy.ts`. Aucun rôle ou périmètre supplémentaire n'est introduit. Les interfaces existantes partagent panneaux, tables, confirmations et composants FEVOCO. Aucun média Drive ne sera supprimé.

## Lots

1. Confirmer la création unifiée et inventorier toutes les sources de dépendances.
2. Renforcer l'édition indépendante et le contrôle de version.
3. Ajouter la suppression contrôlée, les tombstones et la compatibilité avec les anciens reçus.
4. Porter les actions sur les six fiches et les interfaces d'affiliations/licences.
5. Tester dépendances, reprises, concurrence, accès, invalidations et navigateur ; documenter les garanties et limites.

## Résultat du lot

Les cinq lots sont implémentés. Le tableau ci-dessus décrit l'écart **avant** intervention : toutes les suppressions indiquées « À ajouter » sont désormais proposées. La création automatique affiliation/licence reste exclusive au formulaire de création d'athlète. Les créations indépendantes des autres familles, les mouvements, renouvellements et transitions existants utilisent leurs services habituels. Aucun moteur parallèle de transfert ou de licence n'a été ajouté.

Les six fiches proposent une suppression avec confirmation commune ; les panneaux d'affiliations et les deux listes de licences proposent la même action. Annuler, suspendre, clôturer, renouveler et transférer restent des actions distinctes. Les acteurs supprimés sont retirés de l'état de leur liste et leur fiche se ferme. Les affiliations sont rechargées pour l'acteur courant ; les listes de licences reçoivent les données actualisées du serveur. Aucun succès optimiste, polling ou effacement de média.

## Édition indépendante

| Enregistrement | Champs modifiables | Champs protégés et contrôles |
| --- | --- | --- |
| Identité, six familles | Champs déjà autorisés par son service et son formulaire | ID stable ; aucune création d'affiliation/licence. |
| Affiliation athlète | Observations et corrections autorisées par le moteur de mouvements | Propriétaire, club, type et prédécesseur stables ; segments de cession et suites protégés ; dates compatibles avec les licences existantes. |
| Autres affiliations | Dates, observations, statut et champs métier déjà autorisés | Propriétaire et club/entité immuables ; les dates doivent couvrir délivrance et début de validité des licences liées, tous statuts inclus. |
| Licence athlète | Date de délivrance, statut, observations selon le service existant | Identifiant, acteur, saison, affiliation, club et numéro inchangés. |
| Licence entourage | Dates, statut, observations selon le domaine existant | Identifiant, type, acteur, affiliation, cycle et numéro inchangés. Renouveler demeure une nouvelle délivrance distincte. |

L'ouverture d'un formulaire d'édition charge une empreinte SHA-256 de la ligne fraîche via `GET /api/actors/records?...&check=version`. Les PATCH/PUT concernés exigent `If-Match`. Une empreinte absente ou différente produit `VERSION_CONFLIT` (409) avant le service d'écriture. Il faut recharger et réouvrir la fiche après un conflit ; aucune fusion automatique. Ce contrôle porte sur la ligne cible depuis l'ouverture du formulaire, pas sur une transaction entre classeurs.

## Commande de suppression et dépendances

`GET /api/actors/records?entity=actor|affiliation|licence&family=...&id=...` fournit libellé, version et dépendances. `DELETE /api/actors/records` accepte exclusivement `entity`, `family`, `id`, `version`, `operation` (UUID de tentative). Le navigateur ne transmet jamais de numéro de ligne. Session valide, droit sportif WRITE et contrôle d'origine sont vérifiés par les mécanismes communs. Le serveur retrouve la ligne par l'identifiant et refuse les identifiants dupliqués.

| Cible | Références qui bloquent, quel que soit leur statut |
| --- | --- |
| Acteur | Affiliation/affectation, licence, grade, mandat, sélection, staff (`id_entourage` compris), activité, compétition, document et tout identifiant de relation correspondant. Les références génériques tiennent compte du type d'acteur ; une référence ambiguë reste bloquante. |
| Affiliation | Licence liée, prédécesseur d'un mouvement suivant, cession/retour ou autre référence d'affiliation. |
| Licence | Référence de licence depuis une table métier, même hors modules actuellement visibles. |
| Toutes | Réservation sportive de l'acteur ou création unifiée encore partielle. Une lecture incomplète interdit la suppression. |

Le contrôle découvre **toutes les feuilles** des sources métier configurées : acteurs, affiliations, licences, territoire, compétitions, équipe nationale, activités, documents et classeur historique s'il existe. Les propriétés et en-têtes sont lus fraîchement, puis seulement les colonnes `id_*`, `*_id` et les discriminants de type générique. Les lectures sont regroupées par classeur, jamais par acteur ou par référence. Une feuille sans en-tête, une ambiguïté d'en-têtes, une source absente ou illisible interdit la suppression. Les valeurs de médias et les contenus de documents ne sont pas chargés. Les comptes de dépendances sont présentés par table ; les liens disponibles ouvrent les modules sportifs concernés.

Variables nécessaires au contrôle complet : `FEVOCO_ACTEURS_SPREADSHEET_ID`, `FEVOCO_AFFILIATIONS_SPREADSHEET_ID` (ou alias existant `FEVOCO_AFFILIATIONS_LICENCES_SPREADSHEET_ID`), `FEVOCO_LICENCES_SPREADSHEET_ID`, `FEVOCO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID`, `FEVOCO_COMPETITIONS_SPREADSHEET_ID`, `FEVOCO_EQUIPE_NATIONALE_SPREADSHEET_ID`, `FEVOCO_ACTIVITES_SPREADSHEET_ID`, `FEVOCO_DOCUMENTS_SPREADSHEET_ID`, avec les accès Google déjà utilisés par l'application. Aucune valeur de configuration ne doit être copiée dans ce document. Le classeur `GOOGLE_SHEETS_SPREADSHEET_ID` est aussi contrôlé lorsqu'il est configuré.

## Suppression réelle et protocole de concurrence

La suppression retire **toutes les valeurs de la ligne métier**, y compris son identifiant. Ce n'est pas un changement de statut ou un drapeau de suppression. La grille Sheets conserve une ligne vide, afin de ne pas déplacer les autres lignes et leurs indices pendant des écritures concurrentes. Aucun `deleteDimension` n'est utilisé pour ces trois entités. Les lecteurs écartent les lignes sans identifiant. Aucun enregistrement dépendant ni fichier Drive n'est effacé.

Le protocole ajoute des métadonnées techniques, sans nouvelle feuille ni colonne métier :

1. Un verrou global durable `fevoco:business-write:v1` est acquis dans le classeur Affiliations par création d'un `developerMetadata` à ID déterministe. Deux instances ne peuvent pas créer ce même ID. Un verrou en mémoire seul n'est pas utilisé comme garantie distribuée.
2. Sous ce verrou : relecture de la cible, contrôle de version, graphe de dépendances frais et contrôle des opérations sportives.
3. Une intention centrale `fevoco:deleted:v1:TABLE:ID` est persistée **avant** la suppression. Les écrivains communs refusent ensuite de recréer cet identifiant ou de lui ajouter une référence, même à partir d'une lecture antérieure.
4. Un unique `spreadsheets.batchUpdate` dans le classeur cible crée le marqueur local `fevoco:sports:v1:deleted:TABLE:ID`, le reçu `fevoco:delete-receipt:v1:UUID` et vide les cellules. Le reçu et le retrait de ligne sont dans le même lot atomique.
5. Le verrou est libéré uniquement après résultat connu. La répétition de la même commande vérifie reçu, empreinte et absence de la ligne avant de confirmer le succès.

Les écritures via les helpers Sheets partagés et le magasin sportif participent à ce verrou ; les scopes imbriqués le réutilisent. Les helpers vérifient les tombstones avant insertion/modification de relations. L'ajout legacy vérifie aussi l'unicité de l'identifiant sous verrou. Les allocations d'identifiants incluent les identifiants supprimés. Le verrou est volontairement global : il sérialise les écritures métier et ajoute des appels de métadonnées ; ce compromis privilégie la sécurité des suppressions interclasseurs. Il ne constitue pas une amélioration CPU annoncée.

**Limites réelles :** Google Sheets ne fournit pas de transaction entre classeurs. Les modifications manuelles Sheets et les intégrations qui contournent ces helpers ne participent pas au verrou ; elles doivent être exclues pendant une suppression. Le graphe repose sur les identifiants des schémas présents, pas sur la recherche de noms dans du texte libre ou des fichiers Drive. L'ajout d'une relation stockée dans un JSON ou une cellule multivaluée demanderait un extracteur explicite. La mutation refuse les sources illisibles mais ne peut pas découvrir un classeur inconnu de la configuration.

Un incident réseau sans reçu vérifiable conserve le verrou, sans expiration automatique : un délai réseau ne prouve pas que la requête Google a échoué. Si le lot a été confirmé, répéter la commande permet de libérer son verrou et de confirmer la suppression. Si aucun reçu ne peut être confirmé, une vérification technique des requêtes et métadonnées est nécessaire avant libération ; **aucune purge automatique de verrous n'est livrée**. Le même principe s'applique à une ancienne écriture legacy sans reçu : elle peut nécessiter cette vérification. Cette limite évite une garantie trompeuse de reprise automatique de toutes les écritures Google.

## Réservations et anciens reçus

Les reçus de création et revendications sportives ne sont jamais supprimés. Un tombstone contient seulement cible/ID, empreinte, auteur technique, date, tentative, version et, pour la licence, numéro/saison/club/compteur. Aucun nom, téléphone ou média n'est conservé dans cette trace.

Le numéro et l'identifiant de licence restent réservés après suppression. Le compteur n'est jamais diminué ; le maximum historique tient aussi compte des réservations supprimées. Les identifiants des six familles ne sont pas recyclés. Une licence supprimée ne libère pas son numéro et ne modifie pas l'affiliation.

Une ancienne création unifiée ou attribution rejouée après suppression volontaire reçoit `SUPPRESSION_VOLONTAIRE` (410), même si un reçu de création existe. Elle ne retourne pas un faux succès avec ligne absente et ne recrée ni identité, ni affiliation, ni licence. Une création indépendante exige une nouvelle tentative et reste soumise aux validations/doublons habituels.

La confirmation maintient le même UUID après perte de réponse et présente « Vérifier cette suppression ». Les valeurs et la cible sont conservées ; une réponse réseau perdue ne provoque pas une deuxième suppression indépendante. Une dépendance apparue depuis la prévisualisation est recontrôlée côté serveur et bloque l'opération.

## Caches et coûts

La table réellement modifiée est invalidée via ses tags Sheets. Les routes sportives consommatrices sont revalidées, dont les six familles, licences, clubs, territoire, transferts et tableau de bord. Le rafraîchissement client intervient après confirmation ; aucune relecture périodique n'est ajoutée. La commande de prévisualisation de version ne charge pas le graphe complet.

Sur fixture de huit sources métier, une prévisualisation complète effectue les lectures des propriétés/en-têtes/colonnes identifiantes par classeur ; la suppression les répète intentionnellement sous verrou. Les coûts augmentent avec le nombre de colonnes de relations, pas avec une requête par référence. Les mesures de création unifiée publiées précédemment ne mesurent pas ce nouveau verrou : le banc isolé sans verrou complet rapporte désormais 34 lectures logiques contre 38 pour le parcours séparé, 8 contre 12 lectures de valeurs, et 6 contre 7 écritures. Ces valeurs incluent les vérifications de reçus ajoutées ; elles ne représentent ni les appels totaux du mode suppression ni une économie CPU Vercel.

## Validation et preuves

Observé dans le code : schémas par noms d'en-têtes, familles et routes, immutabilité, matrice de références, réservations et reçus. Les contrats des en-têtes FEVOCO déjà documentés sont réutilisés. **Aucun nouvel audit des classeurs réels et aucune écriture métier réelle pendant ce lot.** Les dépendances sont découvertes fraîchement au moment d'utiliser la commande.

Les tests du protocole utilisent les services réels avec transport Sheets atomique simulé et données fictives. Les tests isolés de domaine/UI peuvent remplacer le verrou ; seuls les tests `record-management` couvrent le vrai protocole de verrou. Les mocks historiques ont été adaptés aux nouvelles dépendances, sans qualifier leurs échecs de préexistants.

Le navigateur utilise les composants React réels et l'API réelle de suppression sur fixtures : ordinateur 1440×1000 et mobile 390×844, confirmation accessible, clavier, dépendances, double clic, perte de réponse puis vérification avec même UUID et retrait confirmé. Preuves dans `docs/verification/record-management/`. Le parcours unifié et l'édition d'identité ont aussi été rejoués aux deux dimensions (`docs/verification/athlete-registration/`). Ces essais ne constituent pas un test de session réelle ni de concurrence sur l'infrastructure Google/Vercel.

Restent à vérifier sur un environnement de recette connecté : droits et périmètres réels, accès à l'ensemble des classeurs, liens entre modules avec les données existantes, capacité disponible de developerMetadata (limite Google), coexistence avec les intégrations externes, concurrence multi-instance réelle et procédure opérateur pour les résultats sans reçu vérifiable. Aucun changement de configuration ni nettoyage de métadonnées de production n'est demandé ou effectué.

### Contrôles exécutés le 19 novembre 2026

- **100 tests CommonJS réussis** : `record-management` (21), création unifiée, magasin atomique, routes/licences entourage, mise en page, aller-retour AUTRES et en-têtes réordonnés, mises à jour Sheets, lecteurs de clubs/coachs et CPU/recherche acteurs. Le test d'en-têtes confirme que deux acteurs de même sexe ne sont pas traités comme un doublon d'identifiant.
- **50 tests TypeScript réussis** : domaines affiliation/licence/sport, schémas d'affiliations, licences actives et lecteurs licences/clubs. Les corrections d'affiliation qui excluent une licence et les changements ordinaires de numéro/rattachement sont refusés.
- `tsc --noEmit --incremental false`, `npm run lint`, `npm run build` et `git diff --check` exécutés. Le build ignore les types selon la configuration existante : TypeScript est donc contrôlé séparément.
- `node scripts/verify-record-management-ui.cjs` et `node scripts/verify-athlete-registration-ui.cjs` réussis. Captures revues ; aucune erreur JavaScript navigateur. Les boutons, panneaux et confirmations FEVOCO existants sont réutilisés, sans création d'un design parallèle.

### Principaux fichiers de ce lot

| Groupe | Fichiers |
| --- | --- |
| Commande, dépendances et versions | `lib/record-management-model.ts`, `lib/record-management.ts`, `lib/record-management-api.ts`, `app/api/actors/records/route.ts` |
| Coordination et réservations | `lib/business-write-guard.ts`, `lib/google-sheets.ts`, `lib/sports-atomic-store.ts`, `lib/sports-model.ts`, `lib/athlete-registration.ts`, `lib/sports-licences-domain.ts`, les six services `*-mutations.ts` d'identité |
| Éditions indépendantes | Routes `[id]` des six familles, routes affiliations/licences, `lib/actor-affiliations.ts`, `lib/affiliations-domain.ts`, `lib/actor-licence-creation.ts`, `lib/licences-domain.ts` |
| Interfaces portées | `components/actors/record-management.tsx`, les six fiches/formulaires/listes, panneaux d'affiliations/mouvements, éditeurs et listes de licences |
| Validation | `lib/record-management.test.cjs`, tests de domaine et fixtures adaptés, `tests/helpers/sports-harness.cjs`, scripts navigateur et captures |

Le diff Git contient aussi les modifications locales antérieures de création unifiée et de réservations : elles sont conservées. Les formulaires territoriaux et anciennes boîtes d'affiliation déjà modifiés dans le workspace ne sont pas attribués à ce lot. Aucun commit ou push effectué. Les sorties `git diff --stat` et `git status --short` ont été consultées ; le premier n'inclut pas les nouveaux fichiers non suivis.
