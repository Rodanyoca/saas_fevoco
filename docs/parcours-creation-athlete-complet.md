# Création unifiée d'un athlète, de sa première affiliation et de sa licence

## Rapport d'écart initial — code observé le 18 novembre 2026

| Point | Comportement actuel vérifié | Comportement attendu | Modification nécessaire |
| --- | --- | --- | --- |
| Formulaire | `athlete-form-dialog.tsx`, panneau partagé création/modification, crée seulement l'identité. | Un panneau, identité + club/date + saison, une commande. | Sections supplémentaires uniquement en création ; modification inchangée. |
| Identité | `createAthlete` : validation nom/sexe/date/e-mail/statut, identifiant `ATH#####`, append puis relecture complète. Pas de reçu ni protection distribuée d'allocation. | Identité stable et reprise sans doublon. | Partager le validateur ; append atomique avec identifiant réservé et reçu. |
| Doublons | Seul le doublon d'identifiant généré est contrôlé ; pas de rapprochement d'identité ni d'avertissement observé. | Détecter une fiche potentiellement identique sans fusion ni contournement. | Détection préalable et revendication persistante, avertissement avec consultation. |
| Affiliation | Planificateur `planAthleteTransfer`, première affiliation `TRF001`, statut `SAF001`, dates et absence de précédent contrôlées. | Même règle, bon athlète, club et date. | Réutiliser le planificateur sans demander le type à l'utilisateur. |
| Licence | `allocateSportsLicences`, unicité athlète/saison, compteur club/saison, `BigInt`, revendications atomiques. | Même attribution après l'affiliation. | Réutiliser le moteur et conserver les réservations historiques. |
| Saison | Paramètre `SAISON_COURANTE` lu par les paramètres ; le formulaire d'identité ne le charge pas. | Présélection configurée et validation fraîche serveur. | Références ciblées et contrôle de la période/statut. |
| Droits | Les trois mutations sont sous `AUT-SPT:WRITE` ; ADMIN avec affectation active ou super-administrateur. Aucun périmètre territorial utilisateur dans le modèle actuel. | Contrôler le droit commun avant toute étape ; ne pas inventer un périmètre. | Réutiliser session et autorisation ; club actif et parents vérifiés dans le référentiel. |
| Reprise | Protocole sportif persistant entre affiliation et licence ; pas de coordination avec l'identité, plusieurs classeurs. | Reprise du même athlète puis de la même affiliation, y compris réponse perdue. | Reçus dans les trois classeurs, commande liée à l'utilisateur et à la charge utile. |
| Affichage | Colonne Licence issue de `activeActorLicenceNumbers(getAthleteLicences())` ; sauvegarde d'identité locale sans actualisation des licences. | Liste, fiche, historique et club cohérents. | Retour de la licence mappée, actualisation locale et invalidations des sources/routes. |
| Stockage | Tables métier adaptées, mappers par en-têtes, métadonnées Sheets déjà utilisées par le store sportif. | Aucun nouveau champ métier sans nécessité. | Étendre les reçus techniques aux identités ; aucune nouvelle feuille métier. |

## Tâches

1. Vérifier les contrats et en-têtes en lecture seule.
2. Partager la validation d'identité et étendre le store atomique aux identités et reçus de parcours.
3. Implémenter prévalidation, commande unique, autorisation et reprise persistante.
4. Adapter seulement la création du panneau et actualiser les lecteurs après succès.
5. Tester validation, concurrence, erreurs partielles, réponse perdue et non-régressions ; mesurer les appels logiques.
6. Vérifier TypeScript, lint, build et navigateur isolé ; consigner les résultats et limites.

Les constats de cette table proviennent du code. Les vérifications Sheets et navigateur sont consignées séparément ci-dessous ; un test isolé ne vaut pas une création de production.

## Contrats Sheets vérifiés en lecture seule

Le 18 novembre 2026, les en-têtes des feuilles `ATHLETES`, `ATHLETE_AFFILIATIONS`, `ATHLETE_LICENCES`, `COMPTEURS_LICENCES`, `CLUBS`, `ENTENTES` et `LIGUES` ont été relus sur les classeurs configurés, sans lecture d'identités pour cet inventaire. Les noms du contrat correspondent aux colonnes présentes. `ATHLETES` contient également des colonnes passeport : elles ne sont pas ajoutées au formulaire et restent vides lors de la nouvelle création, comme auparavant.

Les référentiels confirment : `TRF001 = PREMIERE_AFFILIATION`, `SAF001 = ACTIF`, `STL001 = ACTIVE` et le paramètre `SAISON_COURANTE`. La valeur observée du paramètre est `SAI006`, ouverte à la date de l'audit. Cette valeur n'est pas codée en dur : chaque commande relit le paramètre, les saisons et leurs statuts. Les saisons clôturées, suspendues, annulées, futures hors période ou inconnues ne sont pas proposées pour cette délivrance immédiate.

Les mappers et écritures utilisent les noms d'en-têtes ; le store valide les colonnes nécessaires aux trois plans avant la première écriture. Le schéma métier n'est pas modifié. Aucun onglet, identifiant historique ou numéro officiel réel n'est créé ou réécrit pendant l'intervention.

## Parcours livré

Dans le panneau « Créer un athlète » :

1. **Identité** : champs existants, avec nom complet et sexe obligatoires. La naissance et les autres champs gardent leurs obligations antérieures. Le formatage des dates est centralisé dans `compact-date.ts`.
2. **Première affiliation** : club obligatoire choisi dans le référentiel et date obligatoire, saisie en chiffres avec affichage `JJ/MM/AAAA`. Le type est fixé côté serveur à `TRF001`, le statut à `SAF001`, la fin et le prédécesseur restent vides.
3. **Licence saisonnière** : saison courante préselectionnée ; choix parmi les saisons actives couvrant la date de délivrance. Numéro automatique, sans saisie ni aperçu non réservé. Le statut initial est `STL001` et n'est pas choisi arbitrairement par le navigateur.
4. **Enregistrer** : envoi d'une seule commande. Un garde synchrone empêche le double envoi avant même le rendu React suivant. Les champs restent présents et sont désactivés pendant l'envoi.

Le club est transmis comme chaîne, avec ses zéros initiaux. Le serveur contrôle l'existence et l'activité du club, de son entente et de sa ligue à partir de leurs liens réels. Il refuse toute tentative d'envoyer des parents, un identifiant technique ou un numéro de licence dans la commande. Le modèle d'autorisation actuel donne accès au bloc sportif, sans périmètre individuel par club/entente/ligue : aucune restriction territoriale utilisateur absente des sources n'est inventée. Une future restriction de ce type devra être portée par le dispositif d'accès commun.

La délivrance utilise le jour civil de l'opération calculé côté serveur, fuseau `Africa/Kinshasa`. Cette date est distincte de la date de première affiliation. L'affiliation doit déjà être effective à la délivrance ; une affiliation future est donc refusée pour ce parcours immédiat. Le jour de l'opération est conservé dans le reçu d'identité afin qu'une réponse perdue puis une reprise le lendemain ne déplace pas la délivrance.

La modification d'un athlète existant conserve le panneau d'identité et sa route PATCH : aucun sélecteur d'affiliation ou de saison, aucune création ou reconduction de licence. Le téléversement facultatif d'avatar reste une action média postérieure au succès métier ; un échec de média ne relance pas les trois créations.

## Commande serveur et accès

`GET /api/athletes/registration` fournit seulement les clubs admissibles, leurs libellés, les saisons disponibles, la saison courante et la date indicative de l'opération. Les références sont chargées à l'ouverture du panneau de création, par deux lots territoriaux/référentiels, sans médias ni population d'athlètes.

`POST /api/athletes` est la commande complète. Aucun autre consommateur applicatif du POST d'identité seul n'a été trouvé dans le dépôt ; son contrat de création exige désormais les champs du parcours complet. Le service historique d'identité reste disponible pour les consommateurs internes, et le PATCH d'identité n'est pas redirigé vers la commande complète.

Champs supplémentaires de la commande :

| Champ | Contrat |
| --- | --- |
| `clubId` | Identifiant exact d'un club actif, sans saisie libre. |
| `affiliationDate` | Date civile obligatoire ; valeur UI `JJ/MM/AAAA`. |
| `seasonId` | Identifiant d'une saison active couvrant la délivrance. |
| `idempotencyKey` | UUID de tentative, conservé pendant toute la reprise. |

La liste blanche reprend les champs d'identité du formulaire. Le serveur refuse les champs supplémentaires et les valeurs non textuelles. Les validations d'identité sont partagées avec les mutations existantes. Les dates de création sont revalidées puis persistées en `YYYY-MM-DD`, cellules formatées `yyyy-mm-dd` ; les valeurs vides restent vides. Les identifiants, numéros et compteurs sont des cellules texte.

Avant toute mutation métier, la route vérifie l'origine avec `isMutationOriginAllowed`, résout la session avec les services existants et vérifie `AUT-SPT:WRITE`. Ce même droit est celui des trois routes antérieures ; il n'existe pas de droit de délivrance distinct dans le modèle actuel. Compte absent, révoqué, inactif, à activer ou non autorisé : refus avant la commande. Le proxy commun et les protections existantes ne sont pas modifiés. Aucun nouveau régime de session ou rôle n'est introduit.

Le rapprochement d'identité préexistant se limitait à l'identifiant technique. Le nouveau parcours ajoute donc un avertissement bloquant documenté : identifiant national/FIVB déjà connu, ou nom normalisé et sexe concordants avec naissance identique ou non renseignée. Une date de naissance différente ne fusionne pas les homonymes. Le serveur renvoie `DOUBLON_POTENTIEL` et l'identifiant consultable ; le bouton de consultation ouvre la fiche depuis la liste déjà autorisée. Aucune fusion et aucun bouton « forcer » ne sont ajoutés. Les signatures de rapprochement sont hachées dans les revendications techniques pour empêcher deux créations concurrentes identiques.

## Coordination et garantie réelle

La coordination réutilise `planAthleteTransfer` et `allocateSportsLicences` ; elle ne réimplémente ni les transferts ni la numérotation. Elle construit les trois plans, valide les références, dates, doublons, compteurs et colonnes, puis seulement réserve et écrit.

Le store sportif existant est étendu au classeur Acteurs et à la table `ATHLETES`. Une création comporte trois lots atomiques individuels : identité, affiliation, licence/compteur. Chaque lot contient son reçu et les revendications nécessaires dans le même `spreadsheets.batchUpdate` que ses lignes. Les propriétés et les clés de métadonnées sont chargées dans les mêmes appels que précédemment. Les identifiants déjà réservés sont exclus de l'allocation, même lorsque leur ligne n'est plus présente.

Le protocole repose sur les identifiants uniques de `developerMetadata`, les revendications persistantes et les collisions refusées par Google. Il ne repose pas sur un verrou en mémoire et convient à plusieurs instances participantes. Une collision connue recharge les données et recalcule le plan, avec un nombre borné de reprises.

**Il n'existe pas de transaction globale entre les trois classeurs.** Le parcours est une coordination reprenable ; un succès partiel peut être visible dans les sources. Il n'y a pas de suppression automatique d'identité pour simuler un rollback, ni de remise en circulation d'un numéro. Les écritures manuelles ou les autres clients qui ne participent pas au protocole restent hors de sa garantie. Les métadonnées doivent être préservées ; leurs quotas et une maintenance contrôlée des données historiques restent des contraintes opérationnelles.

## Reçus, journal technique et reprise

Le reçu existant est complété, pour cette commande, par la date de l'opération et une trace non sensible : identifiant de l'utilisateur, action/étape, horodatage. Il conserve l'empreinte de commande, la table et les identifiants créés. Les clés sont dans l'espace de noms sportif existant ; aucune nouvelle feuille technique n'est nécessaire. Les empreintes lient la tentative à son utilisateur et à son contenu. Un autre utilisateur ou un contenu différent avec la même clé est refusé.

Deux réservations protègent le parcours : la tentative de création, puis l'athlète créé. Leur reprise par le même propriétaire est permise uniquement pour cette coordination dont chaque étape possède un reçu atomique. Les parcours séparés gardent leur règle antérieure de verrou. Un autre transfert ne peut pas prendre le verrou d'un athlète pendant une reprise partielle. Les réservations sont libérées après confirmation complète ; une issue inconnue les conserve.

| Situation | Traitement |
| --- | --- |
| Validation initiale refusée | `REJECTED`, aucune écriture, valeurs corrigeables. |
| Échec avant confirmation d'identité | Vérifier le reçu avec la même clé avant de recommencer ; aucune suppression. |
| Identité confirmée, affiliation absente | `PARTIAL` ; reprendre l'identifiant d'athlète du reçu. |
| Affiliation confirmée, licence absente | `PARTIAL` ; reprendre la même affiliation et réserver la licence via le moteur existant. |
| Réponse perdue | `UNCERTAIN` ou `PARTIAL` ; vérifier les reçus puis exécuter seulement les étapes manquantes. |
| Opération déjà complète | Restituer les mêmes identifiants et le même numéro, sans réattribution. |
| Nouvelle soumission avec une autre clé | Opération distincte ; contrôles de doublons normaux, aucune réutilisation silencieuse d'une ancienne création. |
| Ligne supprimée après reçu confirmé | Vérification contrôlée requise ; ne pas fabriquer une nouvelle ligne avec un autre identifiant. |

Le bouton devient « Reprendre l’enregistrement » pour un état partiel ou incertain. Les champs sont conservés et verrouillés pour ne pas changer le contenu associé à la clé. Le formulaire n'est pas réinitialisé par un rendu React. Une erreur de validation connue laisse les champs modifiables. Les libellés d'erreur et de chargement sont annoncés par `role="alert"` / `role="status"`.

La reprise de ce lot conserve son brouillon dans l'état du panneau, pas dans un stockage persistant de données personnelles du navigateur. Un rechargement complet de page ou une fermeture de l'onglet n'est pas un mécanisme de reprise automatique : en cas de perte du brouillon, la récupération de l'opération doit utiliser son reçu technique et être contrôlée. Une source durable de brouillons côté utilisateur serait une évolution distincte. Les changements de droits ou de disponibilité du club/de la saison restent revalidés pendant une reprise ; ils ne sont pas contournés. Un changement du seul paramètre de saison par défaut ne substitue pas la saison déjà engagée.

## Affichage et invalidations

La réponse complète contient l'athlète mappé, l'identifiant d'affiliation et son club, la licence mappée, la saison et `numeroLicence`. Le mapping de licence utilise les bornes de `SAISON`, comme le lecteur existant. Le test nominal passe la licence renvoyée dans `activeActorLicenceNumbers` : la même colonne Licence la reconnaît immédiatement.

`AthletesClient` ajoute la nouvelle identité et la licence à ses collections locales, puis appelle `router.refresh()`. La fiche utilise la collection de licences actualisée ; son historique d'affiliations recharge les lecteurs existants. Les vues du club continuent à consommer les mêmes tables et relations, avec le tri croissant par numéro déjà livré.

Chaque étape confirmée invalide les tags des feuilles concernées via `invalidateSportsSheets` : `ATHLETES`, `ATHLETE_AFFILIATIONS`, `ATHLETE_LICENCES` et `COMPTEURS_LICENCES`. Après succès global, les routes `/athletes`, `/clubs`, `/licences`, `/transferts`, `/ligues`, `/ententes` et `/` sont invalidées. Les contrôles d'allocation et de sécurité conservent leurs lectures fraîches ; aucun cache de droits n'est ajouté.

## Mesures locales

Mesure par la même API Google isolée, une personne nouvelle et un club identique ; hors authentification, ouverture du panneau et avatar. Le parcours séparé appelle le service d'identité conservé, puis les deux mutations sportives existantes. Il ne bénéficie pas artificiellement de la nouvelle coordination.

| Mesure | Trois étapes séparées | Commande complète |
| --- | ---: | ---: |
| Mutations métier navigateur | 3 | 1 |
| Lectures API du store (métadonnées, propriétés et valeurs) | 36 | 31 |
| Dont lectures de valeurs du store | 12 | 8 |
| Appels de lecture du service d'identité, en plus du store | 3 | 0 |
| Appels d'écriture, réservations/libérations comprises | 7 | 6 |
| Lots d'écriture métier | 3 | 3 |

Les trois lectures du service d'identité sont des appels abstraits (`getActorSexes`, deux `getAthletes`), pas trois requêtes Sheets garanties : le coût réseau sous-jacent dépend des caches et agrégations. Elles ne sont donc pas additionnées aux 36 comme une mesure réseau homogène. La commande complète charge un snapshot métier frais mutualisé, réutilise ses plans et ne renormalise pas la population via `getAthletes` après chaque étape. Les confirmations relisent seulement la table de l'étape concernée. Une reprise ou une collision coûte davantage que le parcours nominal.

Les nombres ci-dessus ne mesurent ni un gain CPU Vercel, ni une latence de production, ni l'ouverture isolée du formulaire. La fixture conserve les lectures de confirmation et les réservations ; elles ne sont pas supprimées pour améliorer artificiellement le comptage.

## Tests et preuves

Les tests ciblés de création couvrent notamment : liens nominaux et lecteur Licence, statut/club/saison/date invalides sans écriture, champs techniques interdits, compteur bloqué et passage 999→1000, historique annulé préservé, trois points d'échec, trois réponses perdues, clé répétée ou utilisée par un autre utilisateur, double soumission, créations concurrentes, verrou d'athlète pendant une reprise, changement de saison par défaut et modification d'identité seule.

La non-régression exécute également les domaines affiliations/licences, les transferts/cessions, le protocole atomique, les licences entourage, les lecteurs de clubs, la politique des routes, les autorisations et la résolution/révocation de session. Les refus d'accès du nouveau POST sont testés au niveau route avec les services de session/autorisation contrôlés ; la validité et la révocation cryptographiques sont vérifiées séparément par les tests existants de session.

Le script `scripts/verify-athlete-registration-ui.cjs` monte les vrais composants et utilise le véritable coordinateur/store avec une API Google **isolée**. Il couvre 1440×1000 et 390×844 : sélection clavier du sexe et du club, présélection de saison, date impossible refusée, formatage progressif, double clic, erreur partielle, champs maintenus, reprise de la même commande, un seul athlète/une seule licence, numéro visible dans le tableau ou la carte mobile, et modification d'identité sans champs sportifs. Aucune erreur JavaScript n'a été constatée.

La recette complémentaire ouvre la fiche, son onglet Licence et son historique Transferts, puis vérifie une nouvelle soumission indépendante identique : avertissement et consultation de la fiche existante, sans troisième création. Les résultats JSON indiquent deux ouvertures des références (création initiale puis nouvelle tentative indépendante), trois POST (échec partiel, reprise, doublon refusé) et toujours une seule identité/affiliation/licence nouvelles par viewport.

Contrôles exécutés avec succès : **126 tests** (56 tests de commande/store/API/lecteurs de clubs et 70 tests de domaines/sessions/autorisations), contrôle TypeScript indépendant, lint global, build de production et `git diff --check`. Le build conserve sa configuration de validation de types désactivée : c'est bien `tsc --noEmit`, exécuté séparément, qui valide les types. Les avertissements du lanceur TypeScript expérimental et de normalisation Git LF/CRLF sont informatifs.

```powershell
node --test lib/athlete-registration.test.cjs lib/sports-atomic-store.test.cjs lib/actor-licence-api.test.cjs lib/club-actors-loading.test.cjs lib/club-actors-api.test.cjs
node --experimental-transform-types --test lib/sports-domain.test.ts lib/licences-domain.test.ts lib/affiliations-domain.test.ts lib/actor-affiliation-schema.test.ts lib/active-actor-licences.test.ts tests/unit/session-resolution.test.ts tests/unit/session-token.test.ts tests/unit/authorization.test.ts tests/unit/authorization-matrix.test.ts tests/unit/fevoco-route-policy.test.ts
node scripts/verify-athlete-registration-ui.cjs
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
git diff --check
```

Preuves : [résultats navigateur](verification/athlete-registration/results.json), [identité ordinateur](verification/athlete-registration/desktop-identite.png), [reprise ordinateur](verification/athlete-registration/desktop-reprise.png), [liste ordinateur](verification/athlete-registration/desktop-liste.png), [identité mobile](verification/athlete-registration/mobile-identite.png), [reprise mobile](verification/athlete-registration/mobile-reprise.png), [liste mobile](verification/athlete-registration/mobile-liste.png).

Ce navigateur de fixture n'est pas une session authentifiée contre les classeurs réels. Le shell complet, les droits d'un utilisateur de production et une écriture Google réelle ne sont pas certifiés par ces captures. Aucun faux athlète n'est créé en production.

## Fichiers et périmètre

| Fichiers | Rôle |
| --- | --- |
| `lib/athlete-identity.ts`, `lib/athlete-mutations.ts` | Validation partagée et mapping d'identité ; édition toujours indépendante. |
| `lib/athlete-registration.ts`, `lib/athlete-registration-api.ts` | Options, prévalidation, coordination, droits et réponse. |
| `app/api/athletes/route.ts`, `app/api/athletes/registration/route.ts` | POST unique et GET des références. |
| `components/athletes/athlete-form-dialog.tsx`, `athletes-client.tsx` | Panneau, reprise, consultation de doublon et actualisation des licences. |
| `lib/sports-model.ts`, `sports-atomic-store.ts` | Identités dans le protocole et reçus enrichis, sans feuille supplémentaire. |
| `lib/athlete-transfers-domain.ts`, `sports-licences-domain.ts` | Prise en compte des identifiants réservés, issue du correctif local antérieur conservé. |
| `tests/helpers/sports-harness.cjs`, `lib/sports-atomic-store.test.cjs`, `lib/athlete-registration.test.cjs` | API isolée commune et tests de régression. |
| `scripts/verify-athlete-registration-ui.cjs`, `docs/verification/athlete-registration/*` | Recette navigateur isolée et preuves sans données réelles. |

Le workspace FEVOCO est le seul dépôt modifié. Le correctif local non commité des identifiants réservés, déjà présent au début, est conservé et réutilisé. Aucun push, déploiement ou changement de configuration de production n'est effectué. Aucune variable supplémentaire n'est requise : les variables existantes `FEVOCO_ACTEURS_SPREADSHEET_ID`, `FEVOCO_AFFILIATIONS_SPREADSHEET_ID` (ou son alias existant), `FEVOCO_LICENCES_SPREADSHEET_ID`, `FEVOCO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID`, `FEVOCO_REFERENTIELS_SPREADSHEET_ID`, les identifiants du compte de service et `AUTH_SECRET` restent nécessaires à leurs services respectifs. Leurs valeurs ne figurent pas dans ce rapport.

État Git de livraison, sans staging ni commit : neuf fichiers suivis modifiés, `181 insertions(+), 203 deletions(-)` dans `git diff --stat`, auxquels s'ajoutent les nouveaux fichiers de commande, de tests, de documentation et de preuves listés ci-dessus. Les suppressions du test du store correspondent à l'extraction de son harness commun, pas au retrait de ses scénarios. `git status --short` conserve également le rapport antérieur non suivi `docs/correctif-reservations-affiliations-2026-11-18.md`.

## Complément du 19 novembre 2026 : gestion après création

La suppression volontaire est désormais distinguée d’une ligne perdue par un tombstone persistant. Un ancien reçu rejoué retourne `SUPPRESSION_VOLONTAIRE` (410) et ne recrée aucun élément. Voir [Gestion indépendante](gestion-acteurs-affiliations-licences.md) pour les versions, verrous, réservations et limites de reprise.

Les mesures initiales ci-dessus restent la référence du premier lot. Les contrôles de reçus ajoutés portent maintenant le banc isolé à 38 lectures logiques pour les trois étapes et 34 pour la commande complète ; ce banc remplace le nouveau verrou global et ne mesure donc pas son coût total. Les lectures de valeurs restent 12 contre 8, les écritures 7 contre 6. Aucun gain CPU Vercel n’en est déduit.
