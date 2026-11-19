# Délivrance séparée : candidats et diagnostic des réservations

## Écart et travaux réalisés

| Point | Comportement actuel vérifié avant correction | Comportement attendu | Modification livrée |
| --- | --- | --- | --- |
| Options | `athleteLicenceCreationOptions` exposait les affiliations ; la liste individuelle filtrait seulement par club. | Proposer les acteurs réellement admissibles pour le club et la saison. | Chargement frais ciblé des candidats via GET ; la population initiale d'athlètes n'est plus envoyée au formulaire. |
| Unicité | Le moteur refusait déjà toute licence athlète/saison, tous statuts et clubs confondus, mais le sélecteur individuel ne le faisait pas. | Même critère pour affichage et mutation. | Index et validation partagés dans `athlete-licence-eligibility.ts`, utilisés par le sélecteur serveur et l'allocateur. |
| Traces sans ligne | Les revendications athlète/saison n'apparaissaient pas dans les options. Le commit finissait par refuser une réservation existante. | Détecter le blocage avant toute attribution. | Les métadonnées déjà lues exposent les revendications et opérations ; candidat exclu avec conflit explicite. |
| Actualisation | Les options provenaient de l'ouverture de page ; la liste pouvait rester périmée. | Recharger au bon changement et après refus concurrent. | Requêtes annulables, clé de sélection et garde contre réponses obsolètes ; conservation club/saison après refus connu. |
| Disponibilité | Pas d'état distinct de vérification des licences pour le sélecteur individuel. | Échec de lecture bloquant, jamais « aucune licence ». | Chargement, erreur avec Réessayer et état vide distincts ; création désactivée hors résultat confirmé. |
| Test de production | Affiliation B active sans ligne de licence visible ; cause technique inconnue. | Identifier précisément la trace avant tout nettoyage. | Réservation historique et reçu confirmé trouvés ; aucun verrou actif. Aucune trace supprimée faute de preuve de son obsolescence. |

Reproduction initiale : `node --test lib/athlete-licence-eligibility.test.cjs` échouait sur « already licensed athlete must disappear » (`true !== false`). Le même test passe après correction, à travers le vrai service d'options et le transport Sheets contrôlé.

## Matrice métier

| Situation | Visible dans le sélecteur ? | Action autorisée |
| --- | --- | --- |
| Affiliation SAF001 effective, acteur existant, aucune licence/réservation pour la saison | Oui, si club, date, saison, compteur et historique sont admissibles | Nouvelle délivrance individuelle. |
| Licence active STL001 de la même saison | Non | Consulter/modifier la licence existante. |
| Licence expirée STL002 de la même saison | Non | Gestion de l'existante ; renouvellement dans une autre saison admissible. |
| Licence suspendue STL003 de la même saison | Non | Gestion du statut existant. |
| Licence clôturée STL004 ou annulée STL005 de la même saison | Non | Conserver les réservations et utiliser les actions de gestion appropriées. |
| Licence d'une autre saison seulement | Oui si autres critères respectés | Nouvelle délivrance pour la saison choisie ; renouvellement groupé si l'historique le permet. |
| Affiliation SAF002 terminée, SAF003 suspendue ou SAF004 annulée | Non | Aucun nouveau numéro dans ce parcours. |
| Affiliation hors période de délivrance ou d'un autre club | Non | Aucun. |
| Deux rattachements effectifs incompatibles, même vers des clubs différents | Non | Vérifier les mouvements ; conflit RATTACHEMENT_AMBIGU. |
| Réservation athlète/saison sans ligne métier | Non | Vérifier le reçu et l'état de l'ancienne opération, sans nouvelle commande indépendante. |
| Verrou d'acteur présent | Non | Reprise de sa commande avec la même clé, ou récupération contrôlée après vérification. |
| Verrou global d'écriture présent | Vérification temporairement indisponible | Attendre la confirmation ou vérifier l'opération incertaine ; aucune expiration automatique. |

L'unicité du moteur est **athlète + saison**, sans condition sur le club, l'affiliation ou le statut de licence. Une licence d'un club précédent suffit donc à interdire une deuxième délivrance. Le numéro reste distinct de l'identifiant système ; les imports et réservations historiques ne sont pas recalculés.

La saison suit les critères du moteur de délivrance séparée : référence connue et date de délivrance incluse dans sa période. Ce parcours n'ajoute pas une contrainte « saison courante uniquement ». Le parcours unifié conserve ses contrôles supplémentaires existants de saison ouverte/configurée. Le référentiel des statuts de licence reste celui déjà utilisé.

La création séparée exige désormais explicitement SAF001, en plus de la période effective. L'ancien moteur pouvait accepter une affiliation terminée pour une attribution historique à l'intérieur de ses bornes ; cette tolérance n'est plus proposée pour une nouvelle délivrance ordinaire. Les chemins d'import historique ne sont pas modifiés. Les dates utilisent toujours les utilitaires centralisés et les écritures canoniques existantes.

## Serveur, interface et performance

`GET /api/licences/athletes?club=...&season=...&date=...` retourne les candidats et conflits après lecture fraîche. Session valide et droit sportif WRITE sont requis ; aucun rôle ou périmètre n'est créé. POST contrôle aussi explicitement session, droit et origine, puis utilise l'orchestrateur et son protocole d'idempotence existants. Les contrôles du proxy restent en place.

Un index commun prépare les acteurs, les affiliations, les rattachements effectifs, les licences de la saison et les réservations athlète/saison. Le sélecteur groupe par acteur et valide aussi le compteur et l'historique du club par un **plan à blanc**, sans écriture ni revendication. Le moteur répète les validations sur son snapshot frais après réservation de l'acteur ; un refus préalable ne consomme pas de numéro.

Les verrous d'acteur sont filtrés dans les options ; la mutation les contrôle via son acquisition persistante existante, qui doit accepter uniquement la reprise appropriée. Le verrou détenu par la mutation elle-même ne la rend donc pas artificiellement inéligible. La confirmation par reçu reste prioritaire à toute répétition.

Le client ne calcule plus une éligibilité concurrente à partir de ses anciennes lignes de licences. Il charge au changement club/saison/date complète, réinitialise la sélection, annule l'ancienne requête et ignore ses réponses. La frappe dans la recherche filtre localement les candidats et ne déclenche pas de lecture Google. Un refus connu efface l'acteur devenu inéligible et recharge les candidats en gardant club/saison. Un résultat réseau incertain conserve le corps et la clé de tentative pour vérification ; le formulaire ne reconstruit pas une nouvelle commande.

Le test local trouve le même nombre de lectures logiques pour 2 et 200 candidats : 5 lectures de propriétés/métadonnées et 5 lectures de valeurs par lots, sans écriture. Le magasin sportif existant est réutilisé ; ces lectures fraîches ne sont pas remplacées par un cache périmé. Le chargement initial retire la population ATHLETES et le référentiel d'affiliation inutiles : 7 plages au lieu de 9 dans ce service d'options. Les comparaisons ne constituent pas une mesure CPU Vercel. Les contrôles historiques et le tri restent en mémoire ; pas de requête par candidat ni de polling.

Après succès, le panneau se ferme, les vues existantes sont revalidées (`/licences`, `/athletes`, `/clubs`) et les prochaines options sont relues. Après une lecture en échec, la création reste désactivée jusqu'à vérification réussie.

## Diagnostic réel du CLUB TEST

Lectures fraîches du 19 novembre 2026 à 01:10 puis 01:16 UTC, avec un compte Google restreint au scope **lecture seule** pour ces scripts. Aucune écriture Google exécutée. Les scripts n'affichent ni secrets ni champs d'identité personnels.

| Dossier | Constat réel | Verdict du service corrigé, exécuté sur données réelles en lecture seule |
| --- | --- | --- |
| ATH00586 / AFA-000273 | Licence VOL-LIC-2026-000373, saison SAI006, numéro 2705102001, STL001 ; ligne et reçu présents. | Exclu : LICENCE_EXISTANTE. Aucun élément à nettoyer. |
| ATH00584 / AFA-000274 | Affiliation SAF001 du 2026-11-15 au club 2705102, sans fin ni prédécesseur ; aucune licence de cet athlète dans les lignes relues. | Exclu : DELIVRANCE_RESERVEE. La réservation historique bloque même si l'affiliation actuelle est admissible. |

La trace qui explique le refus de B est dans le classeur Licences :

- Métadonnée **826591147**, clé `fevoco:sports:v1:athlete-season:ATH00584:SAI006`.
- Propriétaire : opération `1368de47-c57b-48d4-965a-af1616d06a8e`.
- Reçu confirmé **769939159**, clé `fevoco:sports:v1:receipt:1368de47-c57b-48d4-965a-af1616d06a8e`, table ATHLETE_LICENCES, résultat `VOL-LIC-2026-000372`.
- La recherche par identifiant dans toute la table confirme que **VOL-LIC-2026-000372 est absente**, pas simplement rattachée à un autre acteur visible.
- L'opération conserve les revendications de l'identifiant VOL-LIC-2026-000372 (**243244133**), du numéro SAI006/0101081026 (**1503190995**) et du compteur SAI006/0101081/26 (**366940536**).
- Aucun verrou `fevoco:sports:v1:lock:ATH00584` ni verrou global d'écriture n'est présent lors du contrôle.
- La création de l'affiliation actuelle AFA-000274 est confirmée par un **autre** reçu, opération `ba400805-6b10-42e3-8f75-1118b47ab6bc`, avec sa ligne toujours présente.

Le compteur du CLUB TEST reste PRET, dernier_compteur = 1 pour SAI006. Le préfixe de l'ancien numéro est 0101081 ; les métadonnées conservées ne donnent pas l'identifiant de son affiliation d'origine. Il serait incorrect d'inventer cette relation ou la cause de la disparition de la ligne.

### Décision de nettoyage

**Traces supprimées : aucune.** Il ne s'agit pas d'un verrou d'opération abandonné : le reçu atomique confirme une délivrance passée dont la ligne a ensuite disparu. Aucun marqueur de suppression volontaire correspondant n'a été trouvé dans les traces relues. On ne peut pas établir si la disparition relève d'un nettoyage volontaire de test, d'un import ou d'un autre incident. L'obsolescence de la réservation saisonnière n'est donc pas démontrée.

Supprimer cette seule revendication permettrait une deuxième délivrance de la même saison après une première délivrance confirmée. Ce serait une décision de réparation historique, et non la libération d'un verrou obsolète prouvé. L'autorisation conditionnelle de nettoyage n'est pas utilisée pour contourner cette incertitude. Réservations, reçus, identifiants, numéros, compteurs, fiches et affiliations restent intégralement conservés.

Une ancienne commande de licence 372 ne recrée pas sa ligne : elle retrouve d'abord son reçu puis refuse RESULTAT_INCOHERENT si la ligne manque. Les marqueurs de suppression volontaire existants continuent à produire SUPPRESSION_VOLONTAIRE quand ils sont présents. Aucun reçu ou marqueur n'est purgé.

## Réparation contrôlée : garanties et limites

Le mécanisme existant `completed` puis `recoverCompleted`/`release` peut libérer un verrou d'acteur dont le résultat est **confirmé et présent**. La suppression du verrou exige ID, clé, propriétaire et visibilité concordants ; les réservations de numéros ne sont pas touchées. Cette situation est testée localement, ainsi que le refus quand le résultat manque.

Sans reçu, ou avec reçu mais ligne absente, aucune expiration ou libération automatique n'est introduite. La réparation de B nécessite d'abord une preuve ou une décision explicite sur le traitement historique de la licence 372, puis un protocole qui conserve ses identifiants/numéros et empêche sa résurrection. Ce lot ne restaure aucune ancienne licence et n'en délivre aucune nouvelle en production.

## Vérifications et fichiers

Tests : service réel d'options, cinq statuts de licence, ancienne saison, autre club, affiliations incompatibles/inactives, erreurs de lecture, réservations et opérations persistantes, concurrence après affichage, permissions/origine, coût constant et récupération conditionnelle d'un verrou confirmé. Les suites de création unifiée, magasin atomique, suppressions et domaine sportif restent exécutées en non-régression.

Navigateur sur composants réels et fixtures : 1440×1000 et 390×844 ; absence du licencié dans les candidats, remise à zéro saison/club, réponse retardée, aucune lecture par frappe, erreur puis réessai, concurrence avec conservation des filtres, double clic et répétition exacte après réponse perdue. Captures et résultats : `docs/verification/licence-eligibility/`. Ce n'est pas un test d'écriture Google ni une recette de session réelle.

Fichiers principaux : `lib/athlete-licence-eligibility.ts`, `lib/athlete-licence-creation.ts`, `lib/sports-licences-domain.ts`, `lib/sports-model.ts`, `lib/sports-atomic-store.ts`, `app/api/licences/athletes/route.ts`, `components/licences/use-athlete-licence-candidates.ts`, `components/licences/athlete-licence-editor.tsx`, `lib/athlete-licence-eligibility.test.cjs` et les trois scripts `audit-athlete-licence-reservations.cjs`, `verify-athlete-licence-eligibility-readonly.cjs`, `verify-licence-eligibility-ui.cjs`.

Contrôles : tests ciblés, TypeScript indépendant, lint complet, build et vérification du diff. Aucun push ni déploiement. Les travaux locaux antérieurs sont conservés ; le rapport Git du lot inclut leur présence et ne les attribue pas à cette correction.

Résultats : **78 tests CommonJS** (12 d'éligibilité, 35 de création unifiée, 10 du magasin atomique, 21 de gestion indépendante) et **15 tests du domaine sportif** réussis. Les deux scénarios navigateur ont aussi réussi sans erreur JavaScript. Le build ignore les types selon sa configuration existante ; le contrôle TypeScript est exécuté séparément. Le rapport Git et les preuves de lecture réelle sont conservés dans `docs/verification/licence-eligibility/`.
