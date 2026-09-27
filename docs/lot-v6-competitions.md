# Lot V6 — Compétitions

## Périmètre

Ce lot harmonise le module **Compétitions** de FEVOCO avec les conventions visuelles observées dans FEBACO, sans reprendre de modèle métier basket et sans modifier les données sources.

Fichiers principaux concernés :

- `app/competitions/page.tsx`
- `components/competitions/competitions-client.tsx`
- `components/competitions/competitions-filters.tsx`
- `components/competitions/competitions-table.tsx`
- `components/competitions/competition-detail.tsx`
- `components/dashboard/data-load-notice.tsx`

## Changements réalisés

### Page et hiérarchie visuelle

- adoption du header commun déjà harmonisé avec FEBACO ;
- titre simplifié en « Compétitions » et sous-titre explicite ;
- alignement des espacements avec les autres modules FEVOCO harmonisés ;
- suppression du bloc de KPI placé au-dessus de la liste ;
- suppression du composant `competitions-stats.tsx`, devenu inutile.

### Liste et filtres

- conservation des filtres FEVOCO utiles : recherche, discipline, statut, saison, type, format et niveau ;
- tableau présenté dans un conteneur, avec en-tête et survol conformes au langage visuel FEBACO ;
- compteur de résultats discret, sans carte KPI ;
- action de consultation réduite à l’icône œil, comme dans la liste de référence ;
- utilisation du composant partagé de statut ;
- état vide explicite, sans donnée de démonstration ;
- cartes mobiles dédiées sous le point de rupture tablette.

### Vue détaillée

- bouton complet « Retour aux compétitions » avec icône ;
- retour direct à la liste depuis la vue détaillée ;
- onglets adaptés aux petits écrans ;
- correction des libellés accentués ;
- conservation des sections Participants, Unités, Résultats et Classement.

### Chargement des données

- les cinq sources Compétitions continuent d’être chargées indépendamment ;
- en cas d’échec partiel, les données disponibles restent affichées ;
- une alerte visible signale l’échec sans injecter de contenu fictif.

## Vérité métier FEVOCO conservée

Le lot ne transforme pas les compétitions de volley en compétitions de basket. Sont notamment conservés :

- les disciplines indoor et beach-volley ;
- les participants clubs ou paires selon la discipline ;
- les unités de compétition, poules et phases ;
- les résultats, scores globaux et scores par sets ;
- les classements issus des feuilles FEVOCO ;
- les structures organisatrices, niveaux, formats, saisons et lieux existants.

Aucun champ basket ou FIBA n’a été ajouté. La recherche textuelle dans le périmètre du module ne relève aucun résidu `basket` ou `fiba`.

## Création et modification

La version actuelle de FEVOCO ne fournit pas, dans ce module, de formulaire ni de mutation autorisée pour créer ou modifier une compétition. Le lot n’invente donc pas cette capacité à partir de FEBACO : la consultation et la navigation existantes sont harmonisées, tandis que le périmètre fonctionnel FEVOCO reste inchangé.

## Vérifications

- `npm.cmd run lint` : réussi ;
- `npx.cmd tsc --noEmit` : réussi ;
- requête locale `GET /competitions` : HTTP 200 ;
- recherche `basket|fiba` dans le périmètre Compétitions : aucun résultat ;
- `npm.cmd run build` : réussi, route dynamique `/competitions` incluse dans la sortie Next.js.

La capture et la comparaison visuelles automatisées dans le navigateur ne sont pas disponibles dans cette session. L’alignement a donc été contrôlé par comparaison directe des composants sources FEBACO et FEVOCO, complétée par les validations techniques ci-dessus.

## Hors périmètre

- dashboard général ;
- équipe nationale ;
- activités et documents ;
- authentification, utilisateurs et permissions ;
- création de données fictives ;
- lot V7 et lots suivants ;
- commit ou push Git.
