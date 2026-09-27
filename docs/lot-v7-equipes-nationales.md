# Lot V7 — Équipes nationales

## Périmètre

Ce lot harmonise les deux interfaces FEVOCO consacrées aux équipes nationales :

- `/equipe-nationale` : équipes, sélections, staff, compétitions et résultats ;
- `/suivi-equipe-nationale` : suivi des performances et détail des scores.

Les équipes nationales restent un domaine distinct de la structure territoriale `Ligue → Entente → Club`.

## Fichiers modifiés

- `app/equipe-nationale/page.tsx`
- `app/suivi-equipe-nationale/page.tsx`
- `components/equipe-nationale/equipe-nationale-client.tsx`

Le lot réutilise aussi les composants partagés déjà portés lors des lots précédents :

- `Header` ;
- `StatCard` ;
- `StatusBadge` ;
- `DataLoadNotice` ;
- `Button`, `Card`, `Table`, `Tabs`, `Input` et `Select`.

## Changements réalisés

### Espace Équipes nationales

- en-tête aligné sur le gabarit FEBACO ;
- titre et sous-titre adaptés au métier FEVOCO ;
- cartes statistiques remplacées par le composant partagé de FEBACO ;
- conservation des filtres réels : discipline, catégorie, genre, saison et statut ;
- tableau enveloppé dans le conteneur harmonisé avec en-tête visuel et action œil ;
- ajout d’une présentation en cartes sur mobile ;
- statuts rendus avec le badge partagé ;
- états vides maintenus sans données de démonstration.

### Vue détaillée d’une équipe

- bouton complet « Retour aux équipes » avec icône ;
- identité, identifiant et statut de l’équipe conservés ;
- informations Discipline, Catégorie, Genre et Saison conservées ;
- onglets Athlètes, Staff, Compétitions et Résultats rendus responsives ;
- tables et résultats associés conservés ;
- correction des libellés et accents visibles.

### Suivi des performances

- en-tête et espacements alignés sur le gabarit commun ;
- statistiques rendues avec `StatCard` ;
- liste de résultats conservant le score global et le détail des cinq sets ;
- mise en évidence du vainqueur et badges de résultat conservés ;
- état vide explicite ;
- erreur de chargement affichée sans provoquer de remplacement par des données fictives.

### Robustesse des données

- les cinq feuilles de l’espace Équipes nationales restent chargées indépendamment avec `Promise.allSettled` ;
- un échec partiel laisse visibles les sources disponibles ;
- la page Performances utilise désormais le même principe de chargement sûr ;
- aucun identifiant ou référentiel FEBACO n’est importé.

## Vérité métier FEVOCO conservée

- une équipe nationale n’est pas une équipe territoriale de club ;
- les athlètes sélectionnés restent reliés à leur club FEVOCO ;
- les disciplines, catégories, genres et saisons viennent des feuilles FEVOCO ;
- les membres du staff et leurs fonctions restent inchangés ;
- les compétitions internationales et participations existantes restent inchangées ;
- les résultats conservent les scores volleyball par sets et les totaux réels ;
- aucune donnée basket ou FIBA n’a été ajoutée.

La version actuelle de FEVOCO ne fournit pas de mutation autorisée pour ce module. Aucun formulaire de création ou de modification n’a donc été inventé à partir de FEBACO.

## Vérifications

- `npm.cmd run lint` : réussi ;
- `npx.cmd tsc --noEmit` : réussi ;
- `npm.cmd run build` : réussi ;
- routes `/equipe-nationale` et `/suivi-equipe-nationale` incluses dans la sortie Next.js ;
- recherche des termes `basket`, `fiba` et `équipe territoriale` dans le périmètre : aucun résidu métier relevé.

Le contrôle HTTP du serveur de développement déjà actif a expiré pendant la vérification. La capture et la comparaison visuelles automatisées dans le navigateur ne sont pas disponibles dans cette session. Le lot a donc été contrôlé par comparaison directe des composants FEBACO et FEVOCO, lint, typage et build de production, sans prétendre à une certification visuelle par capture.

## Écarts restants et hors périmètre

- aucune création ou modification d’équipe nationale, faute de service de mutation FEVOCO existant ;
- aucune modification du dashboard général ;
- aucune modification de l’authentification, des utilisateurs ou des permissions ;
- Activités et Documents restent en « Bientôt disponible » ;
- lot V8 et suivants non commencés ;
- aucun commit et aucun push.
