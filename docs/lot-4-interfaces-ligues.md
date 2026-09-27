# Lot 4 — Interfaces des ligues

## Périmètre

Ce lot adapte uniquement les interfaces et mutations des ligues. Les interfaces des ententes et des clubs restent réservées aux lots suivants.

## Rapport d’écart initial

FEVOCO disposait déjà d’une liste, d’une recherche, de filtres, d’un formulaire, d’une vue détaillée et d’un calcul hiérarchique. Ces éléments ont été conservés.

Les écarts principaux étaient :

- formulaire limité au nom, à la province, à l’e-mail, au statut et aux observations ;
- colonnes réelles `sigle_ligue`, `telephone`, `année_creation`, `date_affiliation_ligue` et `id_ligue_coc` non éditables ;
- aucune action explicite d’activation ou de désactivation ;
- statistiques de liste peu centrées sur les relations territoriales ;
- recherche ignorant le sigle, le téléphone et l’identifiant COC ;
- fiche détaillée affichant des champs de responsables qui ne font pas partie des en-têtes réels de `LIGUES`.

FEBACO a servi de référence pour la composition des champs, la table filtrable, les statuts contrôlés et l’identifiant immuable. Le COC confirme l’usage de synthèses territoriales compactes, mais son modèle n’a pas été transposé à FEVOCO.

## Référentiel et Google Sheets

Aucune feuille n’a été créée ou modifiée structurellement. Aucune colonne n’a été ajoutée.

La feuille existante `LIGUES` reste la source de vérité avec les colonnes :

`id_ligue`, `nom_ligue`, `email`, `id_province`, `statut`, `observations`, `id_ligue_coc`, `sigle_ligue`, `année_creation`, `date_affiliation_ligue`, `telephone`.

Les écritures de création et de modification prennent désormais en charge toutes ces métadonnées. `id_ligue` reste généré par le serveur à la création et immuable ensuite.

## Adaptations réalisées

### Identité visuelle FEVOCO

Les premières versions du lot restaient trop proches de l’ancien écran ou interprétaient librement la référence. La reprise finale transpose directement les primitives du dépôt FEBACO :

- fond bleu nuit, surfaces sombres, bordures et ombres selon les mêmes conventions ;
- header compact et sticky avec repère vertical ;
- composant `DataTable` avec recherche, filtres, pagination et cartes mobiles ;
- composants `StatusBadge`, `StatCard` et `DetailCard` reproduisant la structure FEBACO, avec les cartes statistiques réservées à la fiche détaillée ;
- formulaire placé dans un panneau latéral `Sheet` plutôt que dans une modale centrale ;
- liste composée comme le `TerritorialManager` FEBACO ;
- fiche composée comme la fiche Ligue FEBACO, sans la section `Équipes` non applicable à FEVOCO ;
- mêmes couleurs de mise en évidence que l’interface FEBACO observée : bleu ciel pour la navigation active et les actions, rouge pour les états destructifs ; l’or reste limité à la signature décorative du logo.

### Liste et recherche

- ajout du sigle dans le tableau ;
- recherche étendue au sigle, au téléphone et à l’identifiant COC ;
- conservation des filtres province et statut ;
- aucun compteur relationnel dans le tableau, conformément à la liste FEBACO ;
- état vide et état de relations indisponibles conservés.

### Statistiques

Les KPI placés au-dessus de la liste ont été retirés pour reproduire la composition FEBACO. Les statistiques restent disponibles dans la fiche détaillée d’une ligue. Les clubs y sont toujours déduits à travers les ententes, sans relation directe artificielle avec la ligue.

### Création et modification

Le formulaire prend en charge : nom, province, sigle, téléphone, e-mail, année de création, date d’affiliation, identifiant COC, statut et observations.

Les statuts envoyés à la feuille sont `ACTIF` ou `INACTIF`. Les erreurs serveur sont affichées dans le formulaire et les contrôles conservent leurs libellés accessibles.

### Actions

Comme dans FEBACO, la liste expose uniquement les icônes de consultation et de modification. La fiche détaillée conserve une seule action de modification. Le statut reste modifiable dans le formulaire complet ; aucune action rapide de désactivation n’est ajoutée.

### Vue détaillée

La fiche affiche les métadonnées réelles de la feuille, les statistiques hiérarchiques, les ententes, les clubs déduits via les ententes et les athlètes directement rattachés à ces clubs.

## Contrôles exécutés

- `npm run lint` : réussi ;
- `npm exec -- tsc --noEmit` : réussi ;
- `npm run build` : réussi ;
- compilation des routes `/ligues`, `/api/ligues` et `/api/ligues/[id]` : réussie ;
- `git diff --check` : exécuté en fin de lot.

Aucune écriture de test n’a été envoyée au classeur de production. Le runtime du navigateur local n’étant pas disponible dans cette session, la vérification visuelle automatisée, le responsive réel et l’absence d’erreurs dans la console navigateur restent à confirmer manuellement.

## Risques restant ouverts

- Les statuts historiques vides restent affichés comme non renseignés jusqu’à arbitrage métier.
- L’activation ou la désactivation d’une ligue ne propage volontairement aucun statut aux enfants.
- La création réelle, la modification réelle et le changement de statut doivent être validés sur un environnement de recette ou avec une ligne dédiée avant usage en production.

Le lot 4 s’arrête ici. Le lot 5 n’est pas engagé.
