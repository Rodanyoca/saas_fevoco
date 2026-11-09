# Transferts et licences saisonnières FEVOCO

> **Mise à jour à la demande de l’utilisateur : verrou général supprimé.** Les transferts et licences ne nécessitent plus `FEVOCO_SPORTS_ATOMIC_WRITES_ENABLED`. Les champs API de compatibilité annoncent leur disponibilité ; le verrou d’activation ne désactive plus les formulaires. Les descriptions de gate et de désactivation par flag ci-dessous relatent l’état initial du lot et sont remplacées par cette mise à jour. Les permissions, réservations atomiques et contrôles d’intégrité restent appliqués. Aucune affiliation, licence, clé de club ni donnée Google n’est supprimée. Les deux compteurs A_VERIFIER et l’identifiant invalide restent des blocages ciblés, pas un arrêt général de la section.

Validation de cette suppression : test d’intégration des vrais services sur SDK Google simulé, d’abord en échec sur ECRITURES_SPORTIVES_BLOQUEES, puis réussi sans variable d’activation pour une licence suivie d’un transfert. Huit tests du protocole et treize tests métier réussis ; lint ciblé, TypeScript indépendant et diff-check réussis. Le cache TypeScript de vérification isolé a été supprimé après succès. La qualification réelle Google et le build complet restent les limites du lot initial : supprimer le verrou ne les valide pas. Fichiers de ce correctif : `lib/sports-atomic-store.ts`, `lib/sports-mutations.ts`, `lib/sports-atomic-store.test.cjs` et ce rapport. Les autres travaux locaux sont conservés. Aucun push, déploiement ou test d’écriture Google.

Référence locale : `b518414`, branche `feature/competitions-fevoco`. Intervention locale sans publication ni écriture Google. Les modifications parallèles des filtres Athlètes, de leur documentation et des fichiers générés Next sont conservées.

## Constat des sources, en lecture seule

Les quatre identifiants fournis correspondent à la configuration de l'application. Métadonnées, en-têtes et notes relus via le connecteur Google Drive/Sheets le 5 novembre 2026. Aucune donnée personnelle n'est conservée dans ce rapport.

- Référentiel : TYPES_TRANSFERT existe, avec id_type_transfert, nom_transfert, description, et TRF001/TRF002/TRF003. TYPES_TRANSFERTS absent. Les trois paramètres annoncés sont présents et correspondent à TRUE / CLUB_COMPTEUR_SAISON / TRUE. FORMATS_ID distingue ID technique VOL-LIC-AAAA-###### et numéro sportif club + compteur ; les clubs ont sept chiffres.
- Affiliations : A:I conformes, 131 lignes identifiées, toutes sans type historique. Aucun club orphelin détecté.
- Licences : A:J conformes, 132 lignes. Aucun doublon athlète/saison ou saison/numéro, aucune affiliation orpheline, propriétaire incorrect ou attribution de club divergente. Six compteurs historiques restent vides ; aucun numéro modifié.
- Compteurs : huit couples, six PRET, deux A_VERIFIER. Les deux blocages concernent le même club sur deux saisons et restent bloqués.
- Clubs : 58 identifiants, dont 701019 de longueur incorrecte (composantes 0701019). Cette clé n'est pas modifiée et ne peut servir à une nouvelle attribution.

## Écarts et tâches

| État initial | Correction / validation prévue |
|---|---|
| Types et précédent non lus/écrits | Mappings et formulaire athlète, historique vide « Non renseigné », liens conservés |
| Chevauchements limités au même club | Contrôle global des périodes sportives d'un athlète en création/modification |
| Pas de cession/retour cohérent | Segments datés, retour explicite contrôlé, lot atomique et reprise idempotente |
| Numéro manuel et renouvellement recopiant l'ancien | Génération serveur club/saison, compteur sans recyclage, numéro immuable |
| Verrous seulement en mémoire | Coordination persistante et revendications uniques dans des batchUpdate atomiques |
| Attribution confondue avec rattachement courant | Exposition distincte des deux clubs, aucun changement automatique de licence |

## Bornes retenues

Dates civiles de Kinshasa, intervalles inclusifs. Lors d'un changement au jour D, le segment précédent se termine D−1. Une opération future ne supprime pas le rattachement actuellement valable. Une cession se termine au jour E inclus et son retour ne commence pas avant E+1. Le retour nécessite une confirmation : aucun statut n'est réactivé par simple dépassement de date. Les interruptions sont représentées par des segments suspendus explicites ; elles ne suspendent pas la licence. Les anciens types vides ne sont pas reconstitués.

## Concurrence et activation

Les métadonnées Sheets permettent de créer un identifiant de métadonnée explicitement unique. Une collision fait échouer la requête ; les sous-requêtes d'un batchUpdate sont atomiques. Sources officielles : [métadonnées](https://developers.google.com/workspace/sheets/api/guides/metadata), [lots atomiques](https://developers.google.com/workspace/sheets/api/guides/batch).

Le protocole utilise des réservations de personnes sans expiration automatique, une clé d'idempotence stable et des revendications uniques de compteur/numéro/identifiant technique, dans le même lot que les lignes métier. Une écriture d'issue inconnue conserve sa réservation et demande une reprise avec la même clé. Aucun repli manuel ou mémoire seul. Les collisions de hachage n'écrasent pas d'autre clé. Les sources de mutation sont relues sans cache ; les caches de lecture sont invalidés après confirmation.

**Activation bloquée par défaut** : aucune écriture de qualification n'est autorisée sur les classeurs fournis. Avant activation future : tester les primitives réelles sur une copie privée, vérifier les habilitations, supprimer les anciens chemins d'écriture non participants, et définir la récupération des réservations d'issue inconnue. Les écritures manuelles simultanées, suppressions de métadonnées et déplacements de lignes pendant les mutations nécessitent une maintenance contrôlée. Surveiller les quotas de métadonnées ; aucune purge automatique des réservations historiques.

## Livraison locale et suivi

| Tâche | État | Preuve |
|---|---|---|
| Vérifier les sources réelles et les dépendances historiques | Vérifiée en lecture seule | Comptages ci-dessus ; aucun renommage de club ni reclassification |
| Lire/écrire H:I des affiliations et I:J des licences par en-têtes | Implémentée, tests synthétiques | `actor-affiliation-schema.test.ts`, mappers et domaine sportif |
| Première affiliation, cession, définitif, modification et retour | Implémentée, tests synthétiques | `sports-domain.test.ts` |
| Génération du numéro, renouvellement et compteurs bloqués | Implémentée, tests synthétiques | Domaine et tests de concurrence |
| Coordination persistante inter-instances et erreurs partielles | Implémentée, qualification Google bloquée | Adaptateur réel exercé avec un SDK Google simulé, huit tests |
| Interfaces fiche athlète et page Transferts | Vérifiées sur composants réels, API simulées | Captures et `results.json` sous `performance/sports-ui-2026-11-05` |
| Permissions existantes et entourage | Non-régression vérifiée par tests | Matrice d'autorisation, route-policy, anciens tests administratifs |
| TypeScript et lint | Vérifiés | Commandes ci-dessous |
| Build normal complet | Non validé | Tentative interrompue, détail ci-dessous |
| Activation et écriture réelles | Bloquées volontairement | Aucune qualification autorisée sur les sources de production |

### Mappings et règles finales

- `AffiliationRow.transferTypeId` ↔ `id_type_transfert`, `previousAffiliationId` ↔ `id_affiliation_precedente`. Les libellés sont résolus depuis TYPES_TRANSFERT ; une valeur historique vide reste « Non renseigné ». Les projections compatibles `AthleteAffiliation` et `Transfert` conservent les nouveaux identifiants ; la page globale résout aussi le club précédent et l'état temporel. Aucun export CSV/XLSX d'affiliations/transferts existant n'a été trouvé : aucun nouvel export n'est ajouté dans ce lot.
- `AthleteLicence.idClubAttribution` / `compteurSaison` et `AthleteLicenceView.seasonCounter` lisent les nouvelles colonnes. Le club actuel vient des périodes d'affiliation au jour civil de Kinshasa, pas du préfixe du numéro. Une ambiguïté est affichée « À vérifier ». Tableaux, consultation et carte mobile distinguent attribution et rattachement actuel.
- Une création sélectionne une affiliation appartenant au bon athlète et au bon club, seule effective à la délivrance. Un segment terminé avec des bornes valables peut justifier une délivrance historique ; un simple statut Actif ne suffit pas. La délivrance doit appartenir à la saison. Les doublons concernent tous les statuts de licence.
- Le compteur utilise des entiers exacts (`BigInt`), produit un texte avec suffixe de trois chiffres minimum, vérifie l'ensemble des numéros historiques du couple et ne descend jamais sous son maximum. Un compteur absent est initialisé dans le même lot que la première attribution, après cette vérification. Un compteur bloqué ou incohérent ne donne aucun repli manuel.
- Les identifiants techniques restent distincts du numéro sportif : `VOL-LIC-AAAA-######` et `AFA-######`, générés côté serveur et revendiqués dans le journal persistant.
- Une modification de licence conserve numéro, saison, athlète, affiliation, attribution, compteur et date de délivrance ; seuls statut et observations restent modifiables. Les anciens chemins sportifs du domaine manuel refusent désormais d'écrire ; le cycle administratif de l'entourage conserve ses méthodes et ses tests.
- Les dates sont validées et canonicalisées côté serveur. Les lots écrivent des cellules DATE au format `yyyy-mm-dd`, et des cellules TEXT pour les identifiants, numéros et compteurs. Les positions des lignes existantes sont conservées même en présence de lignes vides.
- Les segments d'interruption de cession peuvent rester ouverts jusqu'au retour explicite lorsque le contrat d'origine n'a pas de fin. Il s'agit d'une interruption du club d'origine, distincte de la cession bénéficiaire, dont la fin est obligatoire. Le retour crée un nouveau segment ; il ne réactive jamais l'ancien. Un transfert définitif pendant la cession clôt aussi l'interruption ; celle-ci reste suspendue dans l'historique, avec sa fin, pour ne pas devenir une deuxième période d'appartenance.
- Club, type et précédent sont immuables en modification d'un rattachement. Un changement de club nécessite un nouveau transfert. Les dates d'un mouvement qui possède des suites nécessitent une correction contrôlée de la chaîne et sont bloquées ; ses observations restent modifiables. Une interruption ne se réactive pas directement. Une modification ne peut exclure la délivrance d'une licence déjà liée.

### Garanties et limites du protocole

`FEVOCO_SPORTS_ATOMIC_WRITES_ENABLED` est absent/non activé dans la configuration contrôlée. Aucune valeur locale ou Vercel n'a été changée. Sans valeur explicite `TRUE`, les services sportifs refusent avant tout appel Google d'écriture et les formulaires expliquent le blocage.

Une réservation exclusive de l'athlète dans le classeur Affiliations protège les mutations d'affiliation et de licence, y compris entre instances. Elle **n'est pas réentrante**, même pour deux exécuteurs simultanés portant la même clé. Une tentative déjà confirmée peut seulement relire son reçu et libérer conditionnellement sa propre réservation. Le propriétaire est vérifié par identifiant de métadonnée, clé et valeur ; un ancien nettoyage ne libère pas une nouvelle réservation.

Pour les licences : incréments, lignes, revendications uniques (athlète/saison, saison/numéro, étape du compteur, identifiant technique) et reçu appartiennent au même `spreadsheets.batchUpdate` dans le classeur Licences. Pour les transferts : précédent, cession, interruption et reçu appartiennent au même lot dans Affiliations. La réservation séparée n'est pas une transaction entre classeurs : elle assure l'exclusion, et reste bloquée si l'issue est inconnue.

Les lectures nécessaires aux mutations sont fraîches et groupées par classeur ; elles ne réutilisent pas les caches métier. Elles bénéficient du retry borné existant. Les écritures n'ont pas de retry automatique SDK. Une collision de revendication connue provoque au plus trois calculs sur source fraîche, espacés de 150 puis 300 ms. Un timeout sans reçu confirmé conserve la réservation et interdit de réémettre le lot. Les huit emplacements déterministes de métadonnées traitent les collisions de hachage sans écraser les clés existantes.

Ce mécanisme privilégie la sécurité à la disponibilité : une requête dont l'application reste inconnue nécessite une récupération contrôlée. Le formulaire garde clé et corps identiques pour la vérification tant qu'il reste ouvert. La clé est affichée ; elle n'est pas persistée au rechargement du navigateur. Après perte de cette session, un opérateur devra retrouver le reçu/réservation avant toute nouvelle opération. Les refus d'acquisition conservateurs peuvent nécessiter cette même vérification. Aucun déblocage automatique ni purge par durée n'est fourni.

Les revendications et reçus s'accumulent. La capacité en métadonnées et la taille des lots doivent être qualifiées sur les volumes attendus ; aucune politique d'archivage sûre n'est inventée. Tous les producteurs doivent participer au protocole : une ancienne version Vercel, un script externe ou une modification manuelle de lignes/métadonnées peut invalider ses hypothèses. Les primitives Google sont documentées officiellement mais **n'ont pas été exercées en écriture réelle ici** ; les tests ne prouvent pas une garantie de production déjà acquise.

### Parcours et coûts

Le panneau Transferts charge une fois son historique/références à sa consultation ; ouvrir le formulaire n'ajoute pas de lecture. Un AbortController et le contrôle de réponse abandonnée protègent les changements rapides de fiche. La page globale réutilise ce même panneau au lieu du formulaire ancien qui déduisait le précédent par dernière date. Ses chargements inutilisés Clubs/TYPES_TRANSFERT séparés ont été retirés. Les options licences ne relisent plus ACTEURS_LICENCES ni la collection ATHLETE_LICENCES inutilisée ; seuls les compteurs supplémentaires sont lus, par lot. Aucun appel par ligne, récupération Drive ou cache d'autorisation n'est ajouté. Les caches métier de lecture existants sont invalidés après confirmation, sans reprise d'ancien patch d'invalidation.

Une mutation sportive relit cinq classeurs pour sécuriser les relations et paramètres ; une modification/renouvellement collectif nécessite aussi une résolution initiale des athlètes à réserver. Ce coût de cohérence est explicite, non présenté comme un gain CPU. Aucun benchmark Vercel, test de charge ou gain CPU mesuré n'est revendiqué.

## Validation reproductible

- `node --experimental-transform-types --test lib/sports-domain.test.ts lib/actor-affiliation-schema.test.ts lib/licences-domain.test.ts lib/affiliations-domain.test.ts lib/active-athlete-affiliations.test.ts tests/unit/fevoco-route-policy.test.ts tests/unit/authorization.test.ts tests/unit/authorization-matrix.test.ts` : **55 tests réussis**. Domaines sportif/administratif, dates, anciens champs vides, compteurs, renouvellement, retours, identité, matrice de permissions, refus fermé en panne d'autorisation, origine et couverture des routes. Les avertissements Node sur les modules TypeScript restent ceux du lanceur expérimental.
- `node --test lib/sports-atomic-store.test.cjs lib/club-actors-loading.test.cjs lib/club-actors-api.test.cjs` : **18 tests réussis**, dont huit du protocole sportif. Deux instances simulées, doubles soumissions, refus atomique sans ligne partielle, réponse perdue après application, absence de reçu sans réémission, ancienne libération, cession multi-segments et gate sans appel Google. Les tests clubs vérifient aussi licences, périmètre, états vides/inconnus et pannes.
- `node scripts/verify-sports-ui.cjs` : composants réels et CSS de l'application, API intégralement simulées, **1440×1000 et 390×844**. Historique « Non renseigné », aucun débordement de page, une lecture initiale et zéro lecture à l'ouverture du formulaire, champs de cession, saisie compacte, absence de numéro manuel, identifiant de club invalide exclu, 503 puis reprise strictement identique, zéro erreur JavaScript. Captures et résultats JSON sous `docs/performance/sports-ui-2026-11-05`. Les premières tentatives du banc ont échoué sur des sélecteurs de test (deux boutons Fermer et résultats SearchSelect rendus comme boutons), corrigés sans changer ces composants partagés.
- TypeScript indépendant : `node node_modules/typescript/bin/tsc --noEmit --incremental --tsBuildInfoFile .sports-verification.tsbuildinfo`, copie isolée du cache existant, **réussi**. Trois erreurs de raccordement révélées puis corrigées. La copie temporaire du build a ensuite été retirée pour ne pas être incluse comme source TypeScript obsolète. Le cache original et la configuration ne sont pas modifiés par ce contrôle.
- `npm run lint` : **réussi**, dépôt complet. `git diff --check` : réussi (avertissements de conversion LF/CRLF habituels).
- `npm run build` normal : **non validé**. Lancé sur copie isolée sans secrets, dépendances existantes liées, avertissement de plusieurs lockfiles puis compilation Turbopack sans résultat final ; interrompu pour préserver le poste, seuls ses processus identifiés arrêtés. La copie a été supprimée après retrait de sa jonction. Le serveur de développement de l'utilisateur a été conservé. Le rapport [du lot territorial précédent](performance-structure-territoriale-2026-11-05.md) documentait déjà une compilation isolée sans résultat et un panic dans une autre disposition. Cela ne prouve pas l'absence de régression : comparaison complète avec la référence et build final restent requis dans un environnement disponible. `ignoreBuildErrors` préexistant rend le contrôle TypeScript séparé indispensable.

Une session authentifiée complète contre les nouvelles écritures Google n'est pas testée : aucun droit réel ni écriture de qualification n'est exercé en production. Les preuves navigateur portent sur les composants avec API simulées ; les preuves de permissions portent sur la politique/matrice existante. CASTEL BOYS, les six compteurs historiques vides et les deux couples A_VERIFIER restent des points de données à traiter séparément, avec audit de références.

## Qualification future et retour arrière

1. Créer/utiliser des copies privées des cinq sources nécessaires (référentiel, affiliations, licences, territorial, acteurs) avec données anonymisées et compte de service de test. Ne pas réutiliser les identifiants de production pour les commandes de qualification.
2. Vérifier les droits developerMetadata, l'unicité d'un metadataId fourni, l'échec atomique d'un lot contenant une collision, et la suppression conditionnelle par id+clé+propriétaire. Tester les dates et les textes avec zéros dans la vraie API.
3. Activer le flag uniquement dans cet environnement de test. Exécuter deux processus indépendants, pertes d'ACK, reprise de reçu, échec de libération, cession/retour, renouvellement et mutations avec les rôles réels de test. Qualifier capacité et récupération opérateur ; retirer les anciens écrivains avant toute activation de production.
4. Une issue inconnue ne se libère qu'après arrêt/isolement du producteur, fin certaine de ses requêtes en vol et vérification du reçu et des lignes. Ne jamais supprimer une réservation d'après son âge. Sans preuve de non-application, conserver le blocage et examiner les données. Aucune commande destructive automatique n'est fournie.
5. Pour revenir en lecture seule, désactiver le flag. Ne pas republier l'ancien allocateur manuel : cela casserait le protocole. Un retour de code après de vraies opérations exige de préserver H:I, I:J, les compteurs et métadonnées ; aucune restauration de classeur à l'aveugle et aucun changement de numéros historiques.

## Fichiers du lot

Nouveaux : `lib/sports-model.ts`, `lib/sports-licences-domain.ts`, `lib/athlete-transfers-domain.ts`, `lib/sports-atomic-store.ts`, `lib/sports-mutations.ts`, leurs deux suites de tests, `components/athletes/athlete-transfers-panel.tsx`, `scripts/verify-sports-ui.cjs`, ce rapport et les preuves UI.

Adaptés : routes `api/affiliations/[kind]`, `api/licences/athletes`, `api/transferts` ; pages licences/transferts ; composants affiliations, sections licences, éditeurs/licences, page globale/formulaire/fiche transferts ; services `actor-affiliations`, `actor-records`, `athlete-affiliation-mutations`, `athlete-licence-creation`, `data`, `google-sheets`, `licences-overview`, schémas/types/mappers, anciens tests correspondants, `CONTEXT.md` et note d'obsolescence du lot licences.

Le statut global contient aussi les travaux préexistants `athletes-client`, `athletes-filters`, leur rapport, `next-env.d.ts`, les répertoires QA et `test-results` ; ils ne doivent pas être attribués à ce lot ni ajoutés automatiquement à un futur commit. `git diff --stat` ne compte pas les nouveaux fichiers non suivis. Aucun commit, push, déploiement, achat ou changement de quota ; aucune écriture réelle Google.
