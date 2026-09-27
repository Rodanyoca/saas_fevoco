# Lot V4 — Acteurs

Date : 25 septembre 2026  
Branche : `design/harmonisation-febaco`  
Modules : Athlètes, Entraîneurs, Arbitres, Médecins et Officiels

## Résultat

Les interfaces Acteurs reprennent désormais la densité et les composants FEBACO tout en conservant les modèles, identifiants, affiliations, licences et référentiels volleyball FEVOCO.

## Harmonisation réalisée

- suppression des cartes KPI placées au-dessus des listes, absentes des pages Acteurs FEBACO ;
- filtres et recherche remis directement dans le flux de page, sans carte décorative intermédiaire ;
- tableaux alignés sur le conteneur FEBACO : fond, bordure, rayon, ombre, en-têtes et survols ;
- badges de statut partagés FEBACO ;
- action de consultation conservée sous forme d’icône œil ;
- compteur de résultats ajouté ;
- affichage mobile en cartes pour éviter les tableaux illisibles ;
- profils détaillés conservant avatar, identifiants FEVOCO, état civil, contacts, affiliations et licences ;
- formulaires principaux de création/modification convertis de modales centrales en sheets latérales FEBACO ;
- erreurs, champs obligatoires, chargement, annulation et notifications conservés ;
- suppression des anciens composants KPI devenus inutilisés.

## Données et métier préservés

- Athlète directement rattaché au club ; aucune équipe territoriale ajoutée.
- Les équipes nationales restent un rattachement métier distinct pour les entraîneurs, médecins et officiels.
- Les identifiants FIVB et référentiels volleyball sont conservés.
- Aucun identifiant FIBA, aucune catégorie basketball et aucune donnée de démonstration n’ont été ajoutés.
- Les mutations, routes API, fichiers Google Sheets et relations existantes restent utilisés.

## Résilience des données

Les pages Acteurs ne provoquent plus une erreur serveur complète lorsqu’une feuille Google Sheets secondaire est absente ou mal configurée. Chaque source est chargée indépendamment :

- les données disponibles continuent de s’afficher ;
- les collections indisponibles restent vides ;
- une alerte « Données partiellement indisponibles » est affichée ;
- aucune donnée fictive n’est utilisée comme remplacement.

Cette correction couvre notamment l’erreur observée sur la plage `ATHLETE_LICENCE!A:Z`.

## Contrôles

- `npm run lint` : réussi.
- `npx tsc --noEmit` : réussi.
- `npm run build` : réussi.
- `/athletes` : HTTP 200.
- `/coachs` : HTTP 200.
- `/arbitres` : HTTP 200.
- `/medecins` : HTTP 200.
- `/officiels` : HTTP 200.
- recherche des références basketball accidentelles : aucune référence FIBA ou basketball dans le périmètre Acteurs.

## Limite visuelle

Le runtime navigateur intégré n’est pas exposé dans cette session. Les captures FEBACO/FEVOCO aux dimensions 1440×900, 1280×800, 768×1024 et 390×844 ne peuvent pas être réalisées ici. Le rendu responsive est implémenté dans le code, mais sa certification par captures reste à effectuer dans une session disposant du navigateur intégré.

## Hors périmètre

- le login, les utilisateurs et les permissions n’ont pas été modifiés ;
- le tableau de bord n’a pas été modifié ;
- le lot V3 n’a pas été repris ;
- aucun commit et aucun push n’ont été effectués.
