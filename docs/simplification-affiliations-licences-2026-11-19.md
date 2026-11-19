# Simplification des affiliations et licences

Ce lot remplace les contrôles d’ouverture de saison et de hiérarchie ajoutés au parcours de licence historique dans les lots précédents. La création unifiée d’une nouvelle identité conserve ses règles actuelles.

## Parcours livré

Choisir l’athlète → réutiliser son affiliation active et son club → Enregistrer → numéro automatique. La saison configurée est présélectionnée ; son statut « ouverte » et ses dates ne bloquent plus la délivrance. La saison reste une référence technique du compteur, sans étape de vérification supplémentaire.

La recherche peut commencer par l’athlète, sans choisir son club au préalable. Son club est renseigné depuis l’affiliation. Les données sont chargées une seule fois à l’ouverture : choix du club, choix de saison et frappe de recherche ne provoquent plus de requêtes. Sans affiliation, la régularisation explicite existante reste disponible ; elle n’est pas imposée aux athlètes déjà affiliés.

Les protections de session, des références réelles, de l’unicité d’une licence vivante par athlète/saison et des numéros réservés sont conservées. Les mouvements ne sont pas transformés en changement silencieux de club.

## Cause du refus signalé et correction

Le message « une délivrance est déjà réservée » venait de la revendication persistante athlète/saison d’une ancienne licence confirmée dont la ligne était absente. Le refus n’était pas causé par l’affiliation active actuelle ni par la création unifiée.

Le magasin identifie ce cas à partir des **métadonnées déjà lues**, sans requête par acteur. Une réservation peut être remplacée uniquement si son ancien reçu est confirmé, que son empreinte et ses revendications d’identifiants concordent, que tous ses résultats sont absents des lignes et qu’aucune autre opération active ou incertaine n’en conserve le verrou. Une réservation sans reçu confirmé reste protégée.

Lors de la nouvelle délivrance, un seul batchUpdate dans Licences réalise :

1. Retrait conditionnel de l’ancienne revendication athlète/saison, par ID, clé, propriétaire et visibilité exacts.
2. Revendication de la nouvelle opération et marqueurs terminaux pour les anciens résultats absents.
3. Nouvelle licence et mise à jour du compteur.

Le numéro et l’identifiant de l’ancienne licence restent réservés. Les reçus historiques sont conservés. Les numéros réservés sans ligne participent au maximum de compteur ; ils ne sont pas recyclés. Une ancienne commande rejouée ne ressuscite pas la licence retirée. Le remplacement d’une revendication n’est jamais réalisé par le chargement du formulaire ou par un script de purge.

Le batch utilise un nouvel ID de métadonnée pour la revendication remplacée. Un refus du batch conserve l’ancienne réservation ; une réponse perdue est vérifiée avec le reçu de la nouvelle commande avant toute répétition. Aucun nouvel athlète n’est créé.

## Réduction des appels et du CPU

| Travail | Avant | Après, sur fixture |
| --- | ---: | ---: |
| Snapshot de licence | 10 appels Google | 7 |
| Snapshot de mouvement/affiliation athlète | 10 | 6 |
| Snapshots complets par délivrance sur identité existante | 2 | 1 |
| Options du formulaire | Rechargées à l’ouverture puis au changement de saison/club | 1 requête navigateur par ouverture |
| Changement de club, saison ou texte de recherche | Pouvait relancer les options | 0 appel supplémentaire |
| Délivrance directe complète, reçus compris | Non remesurée sur l’ancienne version | 18 lectures logiques |

Les propriétés Sheets des sources uniquement lues ne sont plus demandées à chaque snapshot. Le profil Affiliation ne charge plus les compteurs, saisons ou statuts de licence inutiles. Le profil Licence ne charge plus les ligues, ententes, sexes et statuts d’ouverture inutiles. Les lectures fraîches du compteur, des affiliations et des réservations sont maintenues.

Le service ne relit plus tout le snapshot avant puis après la même acquisition de verrou. La délivrance sur affiliation existante ne cherche plus un reçu de création d’affiliation qui ne peut pas exister pour cette commande. Les ensembles de licences et de numéros déjà construits sont réutilisés ; la libération du verrou global n’est plus relue deux fois au sein d’un même commit. Le rechargement des références après un mouvement n’entraîne plus la lecture de tous les athlètes.

Ces mesures décrivent des appels logiques et du travail supprimé sur fixture. Elles ne constituent pas une mesure du CPU ou de la latence Vercel, ni du temps passé dans l’authentification/proxy.

## Preuves

- Le test initial reproduisait le refus SAISON_COURANTE_INVALIDE pour une saison non ouverte. Le cas est maintenant accepté pour une identité déjà affiliée.
- Tests locaux : délivrance, 999 → 1000, concurrence, réservations, reprise, refus atomique, réponse perdue, anciennes commandes, suppressions et non-régression de la création unifiée.
- Navigateur : ordinateur 1440×1000 et mobile 390×844, affiliation existante et réservation orpheline, recherche avant le choix du club, club automatique, un seul GET, double clic et réponse perdue. Preuves sous `docs/verification/licence-lightweight/`.
- Vérification Google **en lecture seule** le 19 novembre 2026 à 19:44:15 UTC : ATH00584 est éligible ; ATH00586 reste exclu pour LICENCE_EXISTANTE. Aucune écriture Google pendant cette vérification. La réparation de la revendication est différée jusqu’à l’enregistrement réel de la nouvelle licence.

TypeScript indépendant, lint, build et diff-check sont exécutés. Les tests de transport sont contrôlés ; le batch de remplacement n’a pas été exécuté comme test dans les classeurs réels. Les modifications manuelles Sheets qui contournent le protocole restent hors de sa garantie de concurrence.

Résultats : 100 tests ciblés réussis (85 CommonJS et 15 du domaine sportif), TypeScript indépendant, lint et build réussis. Les quatre scénarios navigateur — normal et réservation orpheline, ordinateur et mobile — passent avec un seul chargement d’options. Les tests de remplacement couvrent aussi un lot refusé puis une réponse Google perdue : pas de libération isolée de réservation et pas de deuxième numéro à la reprise.

Fichiers principaux : `lib/existing-athlete-licence.ts`, `lib/athlete-licence-eligibility.ts`, `lib/sports-licences-domain.ts`, `lib/sports-atomic-store.ts`, `lib/sports-mutations.ts`, `lib/sports-model.ts`, `lib/business-write-guard.ts`, `lib/actor-affiliations.ts`, `components/licences/existing-athlete-licence-dialog.tsx`, tests et scripts de vérification associés.

Les travaux parallèles présents au début du lot sont conservés. Aucun push, déploiement, purge de production ou création de licence de test en production.
