# Affiliation athlète — réservations persistantes et identifiants techniques

## Incident

Le POST d'affiliation renvoyait HTTP 409 après environ 11,5 secondes, avec le message « Une réservation persistante existe déjà ». Les traces fournies distinguent environ 1,5 seconde dans le proxy et 10 secondes dans le traitement métier. Ces durées ne constituent pas une mesure du CPU : elles comprennent notamment les attentes réseau.

## Diagnostic en lecture seule

L'audit du 18 novembre 2026 a vérifié les en-têtes réels de `ATHLETE_AFFILIATIONS`, les lignes et les clés de métadonnées du classeur, sans modification Google.

Pour l'athlète signalé : aucune affiliation et aucun verrou d'opération actif. Le plus grand identifiant présent dans les lignes est `AFA-000268`. Les clés de réservation des identifiants `AFA-000269`, `AFA-000270` et `AFA-000271` existent toujours alors que les lignes correspondantes sont absentes. La raison de cette absence n'est pas déduite de l'audit.

Le générateur utilisait uniquement les lignes pour trouver le maximum. Il proposait donc de nouveau `AFA-000269`. Le contrôle des réservations le refusait ; les reprises relisaient les sources puis proposaient encore le même identifiant. La réservation de l'athlète était correctement libérée après ce refus connu.

## Reproduction et correction

Une régression à travers le véritable orchestrateur et le store, avec une API Sheets isolée, reproduit exactement `RESERVATION_EXISTANTE` et le message du 409 lorsqu'une première affiliation tente de réutiliser des identifiants réservés sans lignes.

La lecture des propriétés des feuilles inclut désormais les clés de métadonnées déjà présentes, dans le même appel `spreadsheets.get`. Aucun appel HTTP supplémentaire n'est ajouté. Le snapshot distingue les identifiants réservés des véritables lignes métier ; aucune ligne fictive n'est injectée dans les collections.

Le calcul du prochain identifiant prend le maximum des lignes et des réservations de la table concernée. Les affiliations et les identifiants techniques des licences utilisent cette règle. Pour l'état audité, le prochain identifiant d'affiliation est donc supérieur à 271. Le numéro administratif de licence et son compteur saisonnier ne changent pas de règle.

Les réservations historiques ne sont ni supprimées ni réaffectées. Les reçus, la vérification d'idempotence, les verrous d'athlètes, les contrôles de chevauchement et les écritures atomiques restent applicables. Un reçu dont les lignes ont disparu reste une anomalie à traiter ; ce correctif ne restaure pas ses lignes automatiquement.

## Vérification

```powershell
node --test lib/sports-atomic-store.test.cjs
node --experimental-transform-types --test lib/sports-domain.test.ts
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
git diff --check
```

Les deux nouveaux scénarios vérifient la première affiliation avec des identifiants réservés absents des lignes, ainsi que le même risque sur un identifiant technique de licence. Ils vérifient une seule écriture métier, le maintien des réservations anciennes et la libération du verrou d'athlète. Les tests existants couvrent notamment deux instances concurrentes, les doubles soumissions, les réponses perdues, les lots refusés et les cessions.

Résultats : 10 tests du store atomique et 15 tests métier réussis ; lint global, contrôle TypeScript indépendant, build et contrôle du diff réussis. Le diff des cinq fichiers suivis représente 43 insertions et 7 suppressions ; ce rapport est un nouveau fichier documentaire. Aucun composant porté.

## Performance et limites

Le correctif supprime les reprises vouées à échouer sur ces identifiants déjà consommés. Il ne prétend pas réduire les 1,5 seconde observées dans le proxy et ne modifie pas l'authentification ou les permissions. Aucun nouveau temps de réponse réel en écriture n'est annoncé : la création effective d'une affiliation Google n'est pas exécutée pendant le diagnostic.

Aucun formulaire, champ de date ou composant visuel n'est modifié. Aucune vérification visuelle n'est requise pour constater le changement du générateur ; la recette du parcours complet avec session réelle reste distincte des tests isolés. Les dates et les règles sportives existantes sont conservées.

Fichiers : `lib/sports-model.ts`, `lib/sports-atomic-store.ts`, `lib/athlete-transfers-domain.ts`, `lib/sports-licences-domain.ts`, `lib/sports-atomic-store.test.cjs` et ce rapport. Aucun commit, push ou déploiement inclus.
