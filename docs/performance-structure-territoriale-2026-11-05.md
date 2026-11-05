# Structure territoriale : rapport d'écart CPU

## Livraison principale : fiche club et licences

La colonne Licence des athlètes et entraîneurs de `components/clubs/club-detail.tsx` rendait littéralement « — ». `lib/club-actors.ts` ne lisait aucune licence. Elle affiche désormais le numéro actif selon le calcul commun `activeActorLicenceNumbers` : statut de licence autorisé, période valide, bornes inclusives et choix déterministe en cas de chevauchement. La période des athlètes est résolue depuis SAISON ; celle des coachs depuis la licence. Une suspension ou une ancienne saison ne devient pas une licence active. Aucun identifiant, rattachement historique ou enregistrement Sheets n'est modifié.

La liste Clubs ne charge plus `loadClubActors` et ne sérialise plus les acteurs de tous les clubs. Elle lit une seule hiérarchie territoriale, contre deux précédemment. L'ouverture d'une fiche appelle une fois `GET /api/clubs/[id]/actors` ; la réponse ne contient que les groupes du club demandé. Un club inconnu répond 404 avant la lecture des acteurs. Les droits frais restent contrôlés par le proxy existant (politique READ AUT-SPT), sans modification de l'authentification. Réponses HTTP privées `no-store`, aucun nouveau cache dérivé ou client persistant.

Le modèle accepte un identifiant de club optionnel : le filtrage précède la validation des dates d'affiliation, l'enrichissement, la déduplication et le tri. Un index remplace aussi la recherche linéaire des personnes déjà ajoutées. Le compteur de relations ignorées est celui du club consulté. Les plages Sheets restent complètes et les index d'identités restent linéaires sur les sources ; cette correction ne prétend pas réduire les lignes transférées par Google lors d'une lecture froide de fiche.

Les licences sont lues par lot (ATHLETE_LICENCES et ACTEURS_LICENCES), les saisons par le lecteur existant. Seuls les identifiants des athlètes/coachs rattachés sont mappés en licences. Le cache brut existant et ses tags SAISON/licences/affiliations/acteurs restent utilisés ; aucune invalidation retirée. Si les licences échouent, les acteurs restent visibles et leur colonne indique « Indisponible », distinct de l'absence de licence active. Si les acteurs/affiliations/référentiels échouent, les effectifs indiquent leur indisponibilité avec une relance manuelle, sans retry automatique côté client.

`components/clubs/clubs-client.tsx` annule les requêtes côté client au changement de fiche et ignore les réponses tardives. Cela ne garantit pas l'arrêt d'une lecture Google déjà engagée côté serveur, notamment lorsqu'elle est partagée. L'ouverture, y compris une réouverture du même club, efface l'ancien état avant de charger. Une modification du club ou de nouvelles propriétés issues de l'actualisation générale déclenchent une relecture des effectifs ; le retour à la liste conserve ses données. Les informations générales restent visibles pendant le chargement des effectifs, sans afficher simultanément de faux compteurs de réussite.

Régression reproduite avant correction, puis tests du lecteur réel avec données synthétiques : licence active athlète/coach, suspension, ancienne saison, périmètre club et panne/configuration des licences. Tests de la vraie route : conservation des zéros initiaux, réponse limitée, club vide/inconnu et pannes 503 JSON. Les trois vraies pages sont exercées pour vérifier un seul calcul de hiérarchie et les pannes indépendantes. Les résultats consolidés et les limites navigateur/build figurent dans la validation du lot.

Retour arrière ciblé du complément : rétablir les contrats antérieurs de `app/clubs/page.tsx`, des deux composants Clubs et de `lib/club-actors*`, puis retirer uniquement la nouvelle route `/api/clubs/[id]/actors`. Conserver les travaux locaux antérieurs sur les acteurs, leurs licences et leurs libellés. Aucun retour arrière de données n'est nécessaire.

## Référence et modèle FEBACO

5 novembre 2026. Cible réelle : `data/monosport/fevoco-managment`, branche `feature/competitions-fevoco`, référence `46df72e16f381d55030b8ec9389adbaede5aec16`. Travaux locaux préservés. Aucun SHA publié ni métrique Vercel vérifié. Aucun appel Google de mesure ni écriture de test.

Comparaison en lecture seule de `data/monosport/febaco-managment` : `docs/modules/structure-territoriale.md` (relations par clés), `docs/exploitation-et-qualite.md` (coalescence, cache local, requêtes bornées), `docs/archive/audits/vercel-cpu-dashboard-2026-10-17.md` (cache brut distinct des jointures et limites métriques). Le dernier document porte sur le dashboard, pas sur un gain territorial mesuré. Ne pas transposer le niveau Équipe basket au volleyball.

## Cartographie et protections existantes

- Pages listes serveur dynamiques : `app/ligues/page.tsx`, `app/ententes/page.tsx`, `app/clubs/page.tsx`. Recherche, tri, filtres et pagination locaux dans leurs composants clients.
- `lib/data.ts` charge LIGUES, ENTENTES, CLUBS et PROVINCES, VILLES, CATEGORIES_CLUB, SEXES ; indexe les parents et enrichit les trois niveaux. Les acteurs servent aux relations de fiche.
- Fiche ligue : `buildLigueHierarchy` appelé via `useMemo`. Fiche entente : filtrage des clubs par parent, athlètes par ensemble de clubs, puis compteurs. Fiche club : lecteurs et modèle `lib/club-actors*` ; correction des licences et chargement à la demande traités dans le lot principal parallèle.
- APIs `/api/ligues`, `/api/ententes`, `/api/clubs` et `[id]` réutilisent les lecteurs ; mutations dans `lib/territorial-mutations.ts`. Invalidation des tags par l'adaptateur et de chemins par les routes ; aucune invalidation retirée ici.
- `lib/google-sheets.ts` possède déjà client partagé, cache brut 30 secondes, partage des promesses et regroupement des plages compatibles. Pas de lecture Drive par ligne repérée dans les lecteurs territoriaux. Retries transitoires bornés à deux reprises (150/300 ms) et timeout 20 secondes par tentative. Les TTL FEBACO documentés (15 min référentiels/2 min métier) ne sont pas recopiés automatiquement.

## Écarts, priorités et tâches

| Priorité / état | Coût confirmé | Correction / critère |
|---|---|---|
| P1 vérifié | Ligues/ententes appellent trois getters reconstruisant chacun toute la hiérarchie malgré la coalescence Sheets : environ 3T mappings de T lignes. | Un seul appel au lecteur existant exporté `getTerritorialHierarchy` par page, aucun nouveau cache. Vraies pages exécutées en test : un appel, sortie cohérente et panne source. |
| P1 vérifié | Groupes de fiche ligue accumulés par spread : k(k−1)/2 références recopiées pour un groupe de k lignes. | `push` sur les nouveaux tableaux, entrées intactes ; ordre, dédoublonnage et diagnostics inchangés. Équivalence exacte et mesure ci-dessous. |
| P2 vérifié | Fiche entente : filtre des athlètes pour chaque ligne club, O(clubs affichés × athlètes liés). | Index de compteurs en un passage, lookup par club. Test de conformité aux anciens filtres, y compris doublons/clé vide. |
| P1 vérifié | Liste clubs préchargeant toutes les familles d'acteurs ; licences absentes des lignes liées. | Effectifs à la demande, filtre précoce par club, numéro actif et états distincts. Lecteur/route/pages testés, comparaison et validation visuelle documentées. |
| P2 différé | Getters API simples construisent encore toute la hiérarchie ; listes ligues/ententes transportent encore des acteurs destinés aux fiches. | Lecteurs gradués et relations à la demande à étudier avec contrats d'erreurs/chargements et mesures HTTP. |
| P3 différé | Transformations répétées entre requêtes ; invalidations parfois larges. | Aucun cache dérivé ni retrait d'invalidation sans graphe complet de dépendances. Coût possible distinct d'une part CPU Vercel mesurée. |

## Mesure locale

`node scripts/benchmark-territorial-hierarchy.cjs 46df72e16f381d55030b8ec9389adbaede5aec16` exécute le vrai modèle Git puis le modèle de travail : mêmes données synthétiques, 1 ligue/1 entente/100 clubs/10 000 athlètes, dont 8 000 dans un club. Trois échauffements, huit mesures par version, ordre alterné. Égalité sérialisée exacte vérifiée.

| Mesure | Avant | Après |
|---|---:|---:|
| CPU processus, médiane locale | 508 ms | 15 ms |
| Durée écoulée, médiane locale | 600,03 ms | 10,24 ms |
| Lignes d'entrée du modèle | 10 101 | 10 101 |
| Groupes retournés | 100 clubs/10 000 athlètes | identiques |
| Octets du contrôle sérialisé avec index | 732 289 | 732 289 |
| Lectures Sheets/Drive du microbenchmark | 0/0 | 0/0 |

Scénario volontairement concentré ; ce n'est pas une mesure HTTP ni une projection Vercel. Durées bruitées sur machine partagée : avant 496–2 333 ms, après 7,94–13,29 ms. CPU Windows grossier : certains échantillons après 0 ms ne signifient pas coût nul. Les octets mesurent le contrôle du modèle, pas une réponse API. Attente réseau exclue. Le benchmark réimprime toutes les mesures brutes.

## Validation et limites

### Mesure complémentaire du modèle des acteurs de club

Commande : `node scripts/benchmark-club-actors.cjs 46df72e16f381d55030b8ec9389adbaede5aec16`. Vrais modèles Git/travail et vraie conversion de date ; mêmes 1 000 identités, 2 000 affiliations (deux périodes par personne), 20 clubs, 800 identités concentrées dans un club. Trois échauffements puis huit mesures alternées avant/après/après filtré C1. Sortie globale exactement identique ; sortie C1 exactement identique à la partie C1 de la référence.

| Mesure du modèle | Avant global | Après global | Après C1 |
|---|---:|---:|---:|
| CPU processus médian local | 172,5 ms | 94 ms | 7,5 ms |
| Durée écoulée médiane | 2 250,35 ms | 2 174,88 ms | 11,86 ms |
| Appels à la conversion de date | 4 000 | 4 000 | 40 |
| Identités retournées | 1 000 | 1 000 | 10 |
| Octets sérialisés du modèle | 121 410 | 121 410 | 1 323 |
| Appels Google du microbenchmark | 0 | 0 | 0 |

CPU bruts, ms : avant `[157,172,173,187,172,187,250,156]`, après global `[93,94,93,63,296,94,251,126]`, après C1 `[15,0,0,0,16,0,31,15]`. Contention très forte : la durée avant atteint 17,7 secondes alors que le CPU du même échantillon est 250 ms ; aucune conclusion proportionnelle sur les durées ou Vercel. Les valeurs CPU à zéro relèvent de la granularité Windows. Un premier essai de 10 000 identités a été interrompu sous contention, sans résultats conservés ; il n'est pas présenté comme une mesure réussie.

Le filtrage C1 économise les conversions, enrichissements, tris et taille du modèle ; les plages Sheets source restent complètes. Ce benchmark ne prouve donc aucune baisse du volume de lignes lues chez Google. Le report du chargement des acteurs depuis la liste vers l'ouverture de la fiche supprime ce parcours entier avant consultation, avec un coût différé à cette ouverture : distinguer ce déplacement de travail d'une suppression définitive. Les octets ci-dessus n'incluent ni les licences ajoutées ensuite par le lecteur ni les en-têtes HTTP.

`node --test lib/territorial-hierarchy.test.cjs lib/territorial-pages.test.cjs` : neuf tests ciblés dans la consolidation finale (comptage, ordre/doublons/diagnostics, ligue inconnue, trois pages et panne source). Pas de modification des gardes, permissions, mutations ou des caches de droits. Les contrôles navigateur du complément Clubs sont documentés séparément. Aucune observation Vercel ni donnée personnelle conservée.

Les formats, ordres, identifiants et entrées restent identiques. En panne de hiérarchie, les trois collections deviennent indisponibles comme auparavant ; les sources indépendantes athlètes/options restent disponibles. Pas de nouveau cache partagé ni de dépendance à invalider.

## Fichiers et preuves du lot

- Sources : `app/{ligues,ententes,clubs}/page.tsx`, `app/api/clubs/[id]/actors/route.ts`, `components/clubs/{clubs-client,club-detail}.tsx`, `components/ententes/entente-detail.tsx`, `lib/{data,territorial-hierarchy,club-actors,club-actors-model}.ts`.
- Régressions : `lib/club-actors-api.test.cjs`, `lib/club-actors-loading.test.cjs`, `lib/territorial-hierarchy.test.cjs`, `lib/territorial-pages.test.cjs` ; suites existantes de validité, chargement, autorisations, politique de routes et résolution de session.
- Mesures : `scripts/benchmark-territorial-hierarchy.cjs`, `scripts/benchmark-club-actors.cjs`.
- Navigateur : `scripts/verify-club-actors-ui.cjs`, `docs/club-actors-ui-validation-2026-11-05.md`, captures et résultats dans `docs/performance/club-actors-ui-2026-11-05/`.
- Validation synthétique consolidée : 57 tests réussis, aucun échec. Navigation réelle des composants sur 1440 × 1000 et 390 × 844 : aucune erreur JavaScript, aucun débordement de page ; licence lisible et recherchable, état de chargement isolé, actualisation, erreur/reprise, annulation d'édition et réponse tardive vérifiées. Liste seule : zéro requête aux effectifs ; ouverture : une ; actualisation des props : une supplémentaire. Ce banc n'est pas une session de production.
- ESLint ciblé sur les 18 fichiers sources/tests/scripts du lot, y compris la nouvelle route : réussi. Deux déclarations de globals en double dans les nouveaux tests ont été retirées avant le succès du contrôle. `git diff --check` avec la configuration Windows habituelle : réussi. Aucune écriture métier n'a été exercée ; les invalidations existantes et la relecture après sauvegarde sont vérifiées par lecture du code, et l'actualisation des props par le banc navigateur.
- TypeScript : **réussi** avec `node node_modules/typescript/bin/tsc --noEmit --incremental --tsBuildInfoFile .territorial-verification.tsbuildinfo`, sur une copie du cache existant (même compilateur 5.7.3), sans changement de `tsconfig.json`, des fichiers inclus ni du cache original. Plusieurs tentatives sans cache ont été interrompues sous forte pression mémoire (environ 1,9 Go privés observés pour le compilateur) ; elles ne sont pas comptées comme des succès. La copie de cache propre à la vérification est supprimée après le contrôle. Ce résultat est indépendant du build qui ignore les erreurs de types par configuration préexistante.
- Build normal `npm run build` : **non validé**. Il a été lancé sur une copie des sources/configurations sans `.env.local`, afin de préserver le serveur et ses fichiers générés. Première tentative depuis une copie sous `node_modules` : panic Turbopack `Expected process result to be a module, but it could not be processed` dans `MiddlewareEndpoint`, après avertissement sur les deux lockfiles. Même copie déplacée hors de `node_modules` : compilation démarrée, puis interrompue après une longue attente sans nouveau diagnostic ni résultat final. Ce ne sont pas des succès de build. Aucun changement du proxy ou de la configuration Next n'est ajouté pour contourner ces échecs. L'attribution à une régression applicative ou à la disposition/environnement de validation n'est pas établie ; une comparaison de build complète avec la référence reste à effectuer sur un environnement disponible. La configuration existante ignore les erreurs TypeScript au build : un build seul ne remplace donc pas le contrôle de types séparé.
- Les changements préexistants sur les acteurs, leur pagination, les libellés de licences, `next-env.d.ts` et `tsconfig.json`, ainsi que les répertoires QA non suivis, sont préservés. Ils ne sont pas attribués à ce lot. Aucun autre dépôt modifié, aucune migration, écriture Google, installation, publication ou modification des quotas.

## Après publication et retour arrière (procédure)

État Git final du lot, distinct des travaux préexistants : dix fichiers applicatifs déjà suivis modifiés (`git diff --stat` ciblé : 109 insertions, 37 suppressions), plus huit nouveaux fichiers de code/tests/scripts non encore suivis et les preuves documentaires. `git diff --stat` ne compte pas les fichiers non suivis. Branche et référence inchangées ; aucun commit.

```text
 M app/clubs/page.tsx
 M app/ententes/page.tsx
 M app/ligues/page.tsx
 M components/clubs/club-detail.tsx
 M components/clubs/clubs-client.tsx
 M components/ententes/entente-detail.tsx
 M lib/club-actors-model.ts
 M lib/club-actors.ts
 M lib/data.ts
 M lib/territorial-hierarchy.ts
?? app/api/clubs/[id]/actors/
?? lib/club-actors-api.test.cjs
?? lib/club-actors-loading.test.cjs
?? lib/territorial-hierarchy.test.cjs
?? lib/territorial-pages.test.cjs
?? scripts/benchmark-club-actors.cjs
?? scripts/benchmark-territorial-hierarchy.cjs
?? scripts/verify-club-actors-ui.cjs
```

Les répertoires QA, les autres modifications d'acteurs et les fichiers générés Next présents dans le statut global restent ceux des travaux parallèles/antérieurs. Le cache TypeScript original conserve sa date et sa taille initiales. La copie de build est rangée dans `node_modules/.territorial-verify-build-20261105` (ignoré), afin de ne pas être compilée comme source de l'application. Elle ne contient pas les variables secrètes du projet.

Contrôler listes/recherche/filtres, fiches ligue/entente, données inconnues et panne source contrôlée hors production. Vérifier les parentés après une mutation autorisée. Mesurer séparément CPU actif, durée, appels Google et octets sur une même base ; ne pas assimiler lenteur réseau et CPU.

Retour arrière : rétablir les appels séparés des deux pages, retirer l'export supplémentaire de `lib/data.ts`, rétablir l'accumulation de `lib/territorial-hierarchy.ts` et le filtre de comptage de `components/ententes/entente-detail.tsx`. Retirer seulement les tests/script ajoutés par ce lot ; conserver les autres travaux. Aucune donnée ou migration à annuler.
