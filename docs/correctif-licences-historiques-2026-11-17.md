# Licence athlète : conflit sur un préfixe historique

## Incident et constat

L'ajout d'une licence retournait HTTP 409, code `HISTORIQUE_HORS_FORMAT`, avec le message « Des numéros historiques empêchent l'initialisation sûre du compteur. »

L'audit Google Sheets du 17 novembre 2026 a été effectué en lecture seule. Les en-têtes réels de `ATHLETE_LICENCES` et `COMPTEURS_LICENCES` correspondent aux champs utilisés par le domaine. Parmi 434 licences, deux lignes attribuées à GREEN TEAM (`0101081`) portent un numéro dont le préfixe est `0101079`, absent du référentiel actuel des clubs. Leurs suffixes correspondent exactement aux compteurs saisonniers stockés : 1 et 2. Le compteur du club pour `SAI006` est `PRET`, à 24. Les affiliations liées désignent également `0101081`.

Ces observations établissent une incohérence historique de préfixe ; elles ne prouvent pas à elles seules la date ou la raison d'un changement d'identifiant. Aucun numéro historique, club ou affiliation n'a été réécrit.

## Cause et correction

Le validateur exigeait le préfixe du club actuel sur chaque numéro historique, y compris lorsque le compteur existant était confirmé et que la séquence consommée était connue. Le rejet empêchait toute nouvelle attribution pour ce couple club–saison.

La compatibilité ajoutée accepte un ancien préfixe uniquement si toutes les conditions suivantes sont réunies :

- le club d'attribution de la ligne correspond au club traité ;
- un compteur existant est `PRET` avec une identité conforme ;
- le numéro contient sept chiffres de préfixe et au moins trois chiffres de suffixe ;
- le préfixe n'appartient à aucun club du référentiel actuel ;
- ce préfixe n'est pas attribué à un autre club dans les licences de la même saison ;
- le champ `compteur_saison` est un entier positif et correspond exactement au suffixe ;
- le compteur confirmé est au moins égal à cette séquence.

L'algorithme conserve ensuite ses contrôles de maximum historique, doublons et réservations atomiques. Les numéros anciens restent inchangés ; les nouvelles licences utilisent le club actuel et poursuivent le compteur. Un compteur absent ou `A_VERIFIER`, un suffixe divergent, un préfixe ambigu ou un compteur trop bas restent bloquants. Aucun repli manuel n'est ajouté.

## Vérification

La régression est reproduite avant correction par le scénario « ancien prefixe retire » dans `lib/sports-domain.test.ts`, qui échoue avec le message exact du 409. Le même scénario passe après correction. Les cas négatifs couvrent l'absence de compteur, un préfixe appartenant à un autre club, une séquence absente ou divergente, un compteur insuffisant et un préfixe partagé entre plusieurs attributions.

Une simulation locale a également exécuté le véritable planificateur sur les données réelles lues : un candidat admissible de GREEN TEAM produit une proposition de licence avec `compteur_saison = 25`, club d'attribution `0101081`. Le snapshot reste identique et le nombre d'écritures Google est zéro. Cette simulation ne crée pas de licence et ne réserve pas le numéro : une attribution future relira les données sous le protocole de réservation existant.

Commandes de contrôle :

```powershell
node --experimental-transform-types --test lib/sports-domain.test.ts
node --test lib/sports-atomic-store.test.cjs lib/actor-licence-api.test.cjs
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
git diff --check
```

Résultats : 15 tests métier et 9 tests du protocole atomique/API réussis ; lint global, contrôle TypeScript indépendant, build et contrôle du diff réussis. Les avertissements Node sur le lanceur TypeScript expérimental et les avertissements Git de normalisation LF/CRLF n'empêchent pas les contrôles.

État Git du lot : deux fichiers suivis modifiés, soit 42 insertions et une suppression ; un nouveau rapport Markdown non suivi. Aucun composant d'interface porté dans ce lot.

## Périmètre et limites

Fichiers du correctif : `lib/sports-licences-domain.ts`, `lib/sports-domain.test.ts` et ce rapport. Aucun composant d'interface, champ de date, dispositif d'accès ou schéma Sheets n'est modifié. Les historiques réellement ambigus détectés sur d'autres clubs restent bloqués. Une attribution effective via le navigateur et Google n'est pas exécutée dans ce lot. Aucun commit, push ou déploiement n'est inclus.
