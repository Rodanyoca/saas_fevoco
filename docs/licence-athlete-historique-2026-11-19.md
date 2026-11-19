# Licence d’une identité athlète existante

## Diagnostic et rapport d’écart

| Point | Cause vérifiée | Modification |
| --- | --- | --- |
| Identité sans affiliation introuvable | La recherche de délivrance partait exclusivement de ATHLETE_AFFILIATIONS. Le test initial échoue sur une identité existante sans ligne d’affiliation. | Recherche explicite des identités existantes, distincte des membres déjà rattachés au club. |
| Affiliation active ajoutée séparément | Le moteur de licence accepte déjà ce cas. Aucun reçu de création d’identité n’est exigé par l’allocateur. Un test sans métadonnées d’identité confirme une délivrance directe. | Point d’entrée dédié et commande qui conservent l’identifiant et réutilisent l’affiliation. |
| Fiche athlète | Le bloc Licence proposait une seconde entrée de délivrance, distincte de l’interface de gestion des licences. | Retirer cette action de la fiche ; les licences d’identités existantes sont gérées depuis la page Licences. |
| Pas d’affiliation | Le service de licence refusait correctement une licence orpheline, mais l’interface n’offrait pas de régularisation explicite. | Club, date réelle obligatoire et confirmation ; coordination première affiliation → licence sur l’identité existante. |
| Ancien historique sans affiliation active | Une nouvelle première affiliation serait une reclassification incorrecte. | Blocage expliqué et lien vers les mouvements ; aucune réactivation, date ou première affiliation inventée. |
| Opérations persistantes | Les réservations et verrous peuvent bloquer indépendamment de l’ancienneté de l’identité. | Conservation des protections et explication ; reprise sur même clé après étape partielle. |

La création unifiée n’est pas la cause démontrée du blocage général : le parcours historique était incomplet dans ses points d’entrée et sa recherche. Le test initial a reproduit précisément l’absence de l’identité dans la recherche fondée sur les affiliations. Le test révisé porte sur le nouveau point d’entrée, qui expose cette identité comme NEEDS_AFFILIATION, sans la présenter comme déjà affiliée.

Le diagnostic réel du lot précédent avait aussi identifié, pour ATH00584, une revendication athlète/saison de licence confirmée dont la ligne était absente. Ce cas de journal historique incohérent reste distinct du défaut d’interface. Il n’a pas été relu ni modifié pendant ce lot ; sa réservation n’est pas contournée. Voir `eligibilite-licences-athletes-2026-11-19.md`.

## Deux parcours conservés

- Nouvelle identité : formulaire actuel identité → première affiliation → licence, sans modification de ses règles ni de sa commande.
- Identité existante : choix ou fiche de l’athlète → vérification / complément d’affiliation → délivrance. Aucune création ou modification de ligne ATHLETES, aucun faux reçu d’identité, aucun média Drive manipulé.

Le second parcours réutilise le même panneau depuis la page Licences :

Après choix du club, la recherche normale présente les identités rattachées à ce club ; l’action « Rechercher un athlète existant à rattacher à ce club » expose séparément les identités sans rattachement actuel. La fiche athlète conserve l’historique en lecture, sans bouton de délivrance.

L’action de délivrance est rendue sur la page Licences pour `AUT-SPT:WRITE` via `canAccess` côté page serveur ; les mutations et lectures du nouveau parcours recontrôlent session, activation et droits. Aucun rôle, session ou mécanisme d’autorisation commun n’est modifié. Les anciennes fonctions de modification, consultation et renouvellement groupé restent en place.

## États d’affiliation et de licence

| État | Action |
| --- | --- |
| Une affiliation SAF001 seule effective | Club proposé depuis la relation ; délivrance sur cette affiliation, sans duplication. |
| Aucune ligne d’affiliation dans l’historique | Demander club admissible, date civile réelle et confirmation explicite. Type TRF001, statut SAF001, sans prédécesseur ni fin artificielle. |
| Historique existant, sans affiliation active admissible | MOVEMENT_REQUIRED : afficher le contexte et orienter vers l’historique des mouvements. Le moteur existant détermine la correction, le transfert ou le retour admissible ; le nouveau formulaire ne l’invente pas. |
| Club différent de l’affiliation active | TRANSFER_REQUIRED ; les acteurs d’un autre club ne sont pas proposés par la recherche de la page Licences. Depuis leur fiche, le conflit est expliqué. |
| Plusieurs affiliations effectives | CONFLICT : aucune délivrance. |
| Licence de la même saison, tous statuts | EXISTING : numéro visible et lien de consultation/gestion, sans nouveau numéro. |
| Licence d’une autre saison seulement | Ne bloque pas à elle seule ; les critères et réservations de la saison choisie sont appliqués. |
| Réservation athlète/saison, verrou d’acteur ou écriture incertaine | RESERVED : vérification ou reprise de l’opération concernée ; aucune purge automatique. |

Le choix initial de saison provient de SAISON_COURANTE et du référentiel via les mêmes fonctions de résolution que le parcours unifié. La saison sélectionnée est vérifiée côté serveur. Le club provient de Ligue → Entente → Club, avec contrôles d’activité et identifiant chaîne conservant les zéros. Les codes de transfert et de statut déjà confirmés sont réutilisés.

La date de première affiliation reste vide jusqu’à la saisie de l’utilisateur. CompactDateInput utilise les utilitaires centralisés ; la commande revalide la date réelle, les bornes et son antériorité à la délivrance. Les nouvelles écritures conservent les cellules DATE canoniques et leur format yyyy-mm-dd. La date de délivrance est la date de l’opération en Africa/Kinshasa, distincte de la date d’affiliation.

## Commande et reprise

`GET /api/licences/athletes/existing` accepte les sélections `actor`, `club`, `season`. Il retourne références, saison configurée et états des identités. La recherche dans les noms reste locale, sans appel par frappe. Les lectures sont fraîches et regroupées par classeur ; les index acteur/historique/période/licence/réservation sont construits une seule fois par snapshot. Une erreur de lecture rend la vérification indisponible.

`POST /api/licences/athletes/existing` accepte uniquement :

| Champ | Contrôle |
| --- | --- |
| actorId | Identité déjà présente, jamais générée. |
| clubId | Référentiel territorial et rattachement compatible. |
| seasonId | Saison admissible du référentiel. |
| affiliationDate | Obligatoire uniquement si aucune affiliation n’existe ; date réelle, non future à la délivrance. |
| confirmAffiliation | Chaîne `true` pour confirmer explicitement la création manquante. |
| idempotencyKey | UUID lié au but, à l’utilisateur et au contenu de la commande. |

La commande prévalide règles, numéro, compteur, historique et schémas avant la première écriture. Elle réserve ensuite l’acteur avec le protocole existant et relit un snapshot frais. Elle utilise `planAthleteTransfer`, `allocateSportsLicences` et `createGoogleSportsStore`, sans second moteur métier. Elle n’appelle jamais le service de création d’identité. L’import de `registrationOptions` réutilise uniquement la résolution pure des références ; aucun reçu de création unifiée n’est recherché.

Les reçus appartiennent à **cette** commande, uniquement dans Affiliations et Licences. L’affiliation confirmée est retrouvée par son reçu à la reprise. Si elle existe déjà avant l’opération, aucun reçu d’affiliation n’est nécessaire : le reçu de licence conserve sa référence exacte. La date d’opération est persistée avec les étapes pour ne pas changer silencieusement de date pendant une reprise.

| Incident | Comportement |
| --- | --- |
| Prévalidation refusée | Aucune écriture métier. |
| Lot refusé explicitement | Reprise avec même corps et clé ; aucune deuxième identité. |
| Affiliation confirmée, licence échouée | Conserver l’acteur réservé ; reprendre sur l’affiliation confirmée. |
| Écriture confirmée, réponse perdue | Vérifier reçu et lignes avant répétition ; résultat unique. |
| Deux requêtes identiques concurrentes | Revendications persistantes et reçus empêchent les doubles effets ; un conflit peut demander une reprise. |
| Délai réseau sans reçu vérifiable | Conserver le verrou ; aucun effacement automatique ni promesse de réparation sûre sans vérification technique. |
| Ligne volontairement supprimée après succès | Les marqueurs existants interdisent la résurrection ; reçu absent de ses lignes = vérification requise. |

Le navigateur garde les valeurs et le corps exact pendant une reprise, désactive les doubles soumissions et les fermetures susceptibles de perdre la tentative. Les réponses de recherche obsolètes sont ignorées. Il n’annonce COMPLETE qu’après confirmation de l’affiliation et de la licence cohérentes. Aucun rollback destructif, recyclage de numéro ou diminution de compteur.

## Actualisation et limites

Après confirmation, le numéro attribué est annoncé et la page Licences est actualisée. Les tags Sheets réellement écrits sont invalidés par le store ; les routes athlètes, licences, clubs, transferts et territoire sont revalidées.

La prévalidation et la relecture après réservation sont volontairement distinctes pour la sécurité. Aucun gain CPU Vercel n’est annoncé. Le magasin existant lit les populations nécessaires par lots, sans lecture par candidat et sans chargement des fichiers médias. Le verrou distribué et ses limites envers les écritures manuelles Sheets restent ceux du protocole déjà documenté.

Les historiques sans rattachement effectif ne sont pas réparés automatiquement : l’utilisateur doit résoudre les dates / mouvements appropriés. Le formulaire ne propose pas de saisie libre d’un ancien numéro Excel. La reprise d’un numéro historique et la réparation d’une réservation incohérente restent des interventions distinctes.

## Validation et fichiers

Les fixtures couvrent identité sans affiliation ni métadonnées, affiliation active séparée, anciens statuts/historique, autre club, ambiguïté, même saison / autre saison, date et confirmation manquantes, source illisible, réservation protégée, échec à chaque étape, réponse perdue, répétition concurrente et droits insuffisants. Elles vérifient l’absence de toute modification du classeur Acteurs et l’unicité des relations créées.

Les tests de création unifiée et du magasin atomique, les tests du précédent sélecteur, les suppressions, les lecteurs clubs et les tests CPU restent exécutés en non-régression. Les contrôles TypeScript, lint et build sont exécutés séparément ; la configuration de build continue à ignorer la validation des types.

Le dispositif navigateur existant monte les composants FEVOCO réels avec services et classeurs simulés. Il vérifie l’absence d’action d’ajout dans la fiche athlète et le parcours de délivrance depuis la page Licences, sur ordinateur et mobile. Il couvre aussi la date initialement vide, le refus d’une date impossible, la confirmation, la reprise partielle, la réponse perdue et le double clic. Preuves : `docs/verification/existing-athlete-licence/`.

Fichiers principaux : `lib/existing-athlete-licence.ts`, `app/api/licences/athletes/existing/route.ts`, `components/licences/existing-athlete-licence-dialog.tsx`, pages Athlètes et Licences, leurs composants clients, fiche athlète et panneau des transferts ; `lib/existing-athlete-licence.test.cjs`, transport de fixtures et `scripts/verify-existing-athlete-licence-ui.cjs`.

Aucune écriture de test, réparation ou création de licence dans les classeurs réels pendant ce lot. Aucun commit, push ou déploiement. Les travaux locaux parallèles sont conservés. La qualification multi-instance réelle et les parcours avec sessions/données de recette connectées restent distincts des tests sur fixtures.

Résultats locaux : **123 tests réussis** — 14 du nouveau parcours, 35 de création unifiée, 10 du magasin atomique, 49 de non-régression (ancien sélecteur, suppressions, recherche/CPU et lecteurs clubs), 15 du domaine sportif. TypeScript indépendant, lint, build et contrôle du diff exécutés. Les quatre scénarios navigateur (deux points d’entrée × deux tailles) réussissent, sans erreur JavaScript. La fiche et la liste Athlètes sont vérifiées après succès ; le rafraîchissement RSC réel de la page Licences reste à qualifier en recette connectée, le routeur étant contrôlé dans la fixture.

Un refus de verrou appartenant à une autre opération reste REJECTED : le formulaire peut être fermé ou vérifié de nouveau. Seules une étape partielle ou une issue incertaine de la commande courante conservent le corps de reprise et verrouillent ses champs.
