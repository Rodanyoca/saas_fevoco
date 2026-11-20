# Licence automatique au rattachement sportif

## Rapport d'écart initial (code local, sans lecture de production)

| Point | Comportement actuel vérifié | Attendu | Modification |
| --- | --- | --- | --- |
| Nouvel athlète | Identité, première affiliation et licence coordonnées | Même résultat, moteur commun | Déléguer affiliation/licence à la commande commune |
| POST affiliations/athlete | Première affiliation, transfert et cession sans licence | Licence automatique | Coordination persistante commune |
| Retour de cession | Nouveau segment sans délivrance | Nouvelle licence au retour | Même commande, sans réactivation historique |
| Unicité | Toute ligne athlète/saison bloque une délivrance | Historique multiple, un seul statut actif | Exception interne liée à une nouvelle affiliation |
| Réservations | Revendication athlète/saison permanente | Historique conservé et remplacement admissible | Revendication affiliation/saison ; anciennes réservations conservées |
| Page Licences | Ajout, renouvellement, synthèse et tableau détaillé | Synthèse seule ; gestion sur fiche | Retirer ajouts, tableau et dépendances exclusives |
| Édition | Mutations indépendantes et contrôlées | Aucune délivrance | Préserver PUT et les protections de version |

## Tâches

1. Commande commune, prévalidation, reçus et reprise ; intégration aux entrées existantes.
2. Remplacement atomique des statuts dans le classeur Licences, unicité et compteurs conservés.
3. Information/récapitulatif dans le panneau de mouvement ; gestion indépendante sur fiche.
4. Retrait des parcours manuels et de leur code exclusif ; conservation de la synthèse.
5. Fixtures, contrôles statiques, navigateur et documentation des limites.

## Contrat

La saison est `SAISON_COURANTE`, active selon STATUTS_SAISON et couvrant le jour de l'opération en Africa/Kinshasa. La date de délivrance est serveur et conservée dans le reçu d'affiliation. Les affiliations futures ou terminées sont refusées avant écriture : programmation et import restent distincts. Une date passée est admise seulement si le rattachement est encore effectif aujourd'hui.

| Mouvement | Affiliation | Ancienne licence active, toute saison | Nouvelle licence |
| --- | --- | --- | --- |
| Première affiliation TRF001 | SAF001, sans prédécesseur | Clôture STL004 si un historique incohérent reste actif | STL001, nouveau rattachement |
| Transfert définitif TRF003 | Ancienne terminée, nouvelle active | Clôture STL004 | Nouveau club, nouveau numéro |
| Cession TRF002 | Moteur actuel et interruption SAF003 | Suspension STL003 | Club temporaire |
| Retour TRF002 | Nouveau segment du moteur de retour | Suspension STL003 de la licence temporaire | Club d'origine, nouveau numéro ; aucune réactivation |

Les codes de statuts sont ceux des transitions existantes (`licences-domain.ts`). Leur présence réelle dans le snapshot est obligatoire ; aucun statut libre ni modification du référentiel. Aucune donnée de production n'est modifiée par les tests.

Le lot Licences désactive les anciennes licences et ajoute la nouvelle avec compteur et reçu dans un seul batch atomique Sheets. L'affiliation est dans un autre classeur : un échec laisse un état partiel, verrouillé au même propriétaire, à reprendre avec la même clé. Les réservations historiques de numéros, identifiants et athlète/saison ne sont pas effacées. Une réservation sans licence connue bloque et nécessite diagnostic. La revendication affiliation/saison empêche une seconde délivrance pour le même rattachement. Les suppressions volontaires restent terminales via les tombstones existants.

La garantie distribuée concerne les mutations qui utilisent les verrous sportifs et le garde d'écriture commun. Les éditions directes dans Sheets contournent ce protocole. Pas de transaction multi-classeur, ni de migration ou régularisation massive.

## Entrées et interfaces

`POST /api/athletes`, `POST /api/affiliations/athlete`, son alias `/api/athletes/[id]/affiliations` et `/api/transferts` aboutissent au même coordinateur `runAthleteAttachment`. Les mouvements TRF001/TRF002/TRF003 et RETURN restent planifiés par `planAthleteTransfer`. Les PUT d'identité, affiliation et licence restent indépendants. Les droits existants AUT-SPT WRITE, la session et l'origine sont vérifiés ; aucun rôle nouveau.

Le panneau existant annonce la saison, la licence active et le club remplacés, le statut de destination et le nouveau club. Dates compactes centralisées, contrôle civil local et serveur, statut initial actif imposé. Après succès, la réponse contient affiliation, club, saison et numéro. Une erreur partielle conserve le payload et la clé ; « Vérifier cette tentative » reprend la même commande. Un seul rafraîchissement global est demandé, plus la relecture ciblée du panneau.

`/licences` conserve seulement compteurs visuels et synthèse territoriale, sans tableau détaillé de remplacement. Il ne charge plus options de création, candidats, compteurs de réservation ou formulaires. La fiche conserve son historique et propose modification de statut/observations et suppression contrôlée. L'éditeur lit les valeurs et leur empreinte ensemble ; les références, le numéro et la date de délivrance sont immuables. Une réactivation est refusée lorsqu'une autre licence est active pour cet athlète.

Les POST manuels `/api/licences/athletes` et `/api/licences/athletes/existing` répondent 410. Le GET ancien de candidats est retiré ; seul `GET /api/licences/athletes?edit=<id>` sert l'édition autorisée. Le PUT reste protégé par If-Match et le garde commun. Le service interne d'allocation reste en place. Les interfaces et routes de licences d'entourage ne sont pas modifiées.

Retraits : `existing-athlete-licence-dialog`, `athlete-licence-form`, `use-athlete-licence-candidates`, commande `existing-athlete-licence`, anciennes options/recherche de création, tests et scripts propres à ces interfaces. Le script de vérification historique `verify-existing-athlete-licence-ui.cjs`, déjà modifié par un travail parallèle au début du lot, est préservé ; il cible un parcours désormais retiré et n'est plus une vérification actuelle. Les anciennes captures restent des preuves historiques.

## Reprise et stockage

Les reçus existants restent compatibles. `operationSeason` est un champ facultatif ajouté aux métadonnées du reçu, sans ajout de colonne ni changement de schéma Sheets. L'identité et l'affiliation conservent la saison engagée pour la reprise ; une nouvelle commande relit toujours SAISON_COURANTE. L'allocation garde ses identifiants, préfixes avec zéro, compteurs BigInt et numéros réservés.

Le garde distribué peut être repris par son **propriétaire exact**, uniquement dans le commit sportif disposant de reçus et revendications atomiques. Il n'est pas purgé pour un autre propriétaire. Un batch retardé et sa reprise ne peuvent pas tous deux créer leurs métadonnées de reçu/réservation. Les éditions et suppressions génériques ne bénéficient pas de cette exception.

Une réservation athlète/saison sans licence connue reste bloquante : elle nécessite un diagnostic, pas une purge automatique. Les marqueurs de suppression volontaire et les reçus sont conservés ; une commande ancienne ne recrée pas une ligne supprimée. Aucune licence n'est créée au chargement, à la suppression ou à la simple modification d'un rattachement.

## Lecteurs, invalidations et performance

Les lecteurs d'athlètes, fiches, historique et clubs sont préservés ; la colonne Licence continue de sélectionner le numéro actif. Les invalidations existantes ATHLETE_AFFILIATIONS, ATHLETE_LICENCES et COMPTEURS_LICENCES sont utilisées par le magasin, avec les chemins d'athlètes, transferts, clubs et synthèses. Aucun polling ni lecture par candidat.

Mesure isolée contre `23c8a76`, même fixture et garde réel simulé :

| Travail | Lectures logiques Google | Lots de valeurs | Écritures totales | Lots métier |
| --- | ---: | ---: | ---: | ---: |
| Ancienne affiliation seule | 18 | 6 | 5 | 1 |
| Ancien parcours affiliation puis licence | 37 | 12 | 10 | 2 |
| Nouveau rattachement complet | 28 | 7 | 8 | 2 |

Le nouveau parcours coûte davantage que l'ancienne **étape d'affiliation seule**, puisqu'il délivre aussi la licence. Il réduit les appels du **parcours complet**. Le snapshot commun est mutualisé ; la création unifiée réutilise son snapshot déjà lu. Ces comptes incluent les métadonnées/reçus ; ils ne mesurent ni latence ni consommation CPU Vercel. Reproduction : `node scripts/measure-athlete-attachment.cjs`, sans réseau ni secret ; référence extraite sous `.next/cache`.

## Validation et limites

Tests réels sur services avec Sheets simulé : première affiliation d'une identité historique, création unifiée, liens, numérotation, transfert, cession, retour, anciennes saisons encore actives, historiques multiples, modifications sans délivrance, réservations inconnues conservées, compteurs bloqués, permissions, concurrence entre instances, double soumission, réponse perdue, reprise de chaque étape et suppression volontaire. Tests de non-régression du moteur d'entourage et des dépendances de suppression exécutés également.

`node scripts/verify-athlete-attachment-ui.cjs` teste les composants réels et le coordinateur réel avec fixture : ordinateur 1440×1000 et mobile 390×844, scénario normal et échec de licence après affiliation. Un POST normal, deux POST identiques pour la reprise, une seule licence et identité inchangée ; saisie progressive, date impossible, focus clavier, absence du formulaire manuel et du tableau supprimé. Captures et résultats sous `docs/verification/athlete-attachment/`.

Le navigateur testé est une fixture locale, pas une session authentifiée sur le déploiement réel. Les classeurs réels et leurs en-têtes n'ont pas été relus pendant ce lot ; les colonnes existantes sont contrôlées par le magasin à la mutation. Restent à qualifier sur un environnement de recette : références/configuration réelles, transport Google, permissions réelles, changement d'état des licences et navigation complète avec données représentatives. Aucune migration, suppression de données, écriture métier de production, publication ou push.

Bilan automatisé : 92 tests CommonJS et 34 tests de domaine TypeScript, soit 126 tests réussis. Les tests anciens liés au parcours manuel supprimé ont été retirés ; les assertions d’ancien renouvellement/saisie indépendante ont été adaptées explicitement au nouveau contrat, sans prétendre que leurs échecs initiaux étaient préexistants. Lint, TypeScript indépendant et build de production sont exécutés séparément, car le build ignore la validation de types.

Fichiers centraux : `lib/athlete-attachment.ts`, `sports-mutations.ts`, `athlete-registration.ts`, `sports-licences-domain.ts`, `sports-atomic-store.ts`, `business-write-guard.ts`, routes affiliations/transferts/licences, panneau de mouvements, synthèse Licences et actions sur fiche. Les détails du diff et du statut Git du lot sont fournis dans `docs/verification/athlete-attachment/git-report.txt` ; les modifications parallèles initiales y restent présentes.

Contrôles finaux : TypeScript indépendant, lint et build réussis ; 126 tests ciblés réussis ; quatre scénarios navigateur réussis sur la version finale après build ; lecteur actif de la colonne Licence vérifié après transfert. `git diff --check` réussi. Résumé lisible par machine : `docs/verification/athlete-attachment/validation.json`.
