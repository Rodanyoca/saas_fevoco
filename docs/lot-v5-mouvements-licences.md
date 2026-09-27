# Lot V5 — Mouvements et licences

Date : 25 septembre 2026  
Branche : `design/harmonisation-febaco`

## Périmètre fonctionnel retenu

FEVOCO possède un module de mouvements basé sur les affiliations/transferts d’athlètes ainsi que des licences intégrées aux fiches Entraîneur, Arbitre, Médecin et Officiel. Aucun module autonome ou règle basketball n’a été créé artificiellement.

## Mouvements

- header replacé hors du conteneur de contenu et renommé « Mouvements » ;
- libellés adaptés aux affiliations et transferts entre clubs FEVOCO ;
- suppression des KPI absents du gabarit FEBACO ;
- recherche et filtres saison/statut affichés directement dans le flux ;
- tableau aligné sur FEBACO : conteneur, bordures, rayon, ombre, en-têtes et survol ;
- compteur de résultats ;
- badges de statut partagés ;
- cartes mobiles dédiées avec parcours origine → bénéficiaire ;
- état vide explicite ;
- fiche détaillée conservant athlète, origine, bénéficiaire, type, saison, dates et observation ;
- bouton « Retour aux mouvements » avec icône ;
- formulaire de création converti en sheet latérale responsive.

## Licences

Les formulaires réellement présents ont été harmonisés sans créer de nouvelle source de données :

- licence d’entraîneur ;
- licence d’arbitre ;
- licence de médecin ;
- licence d’officiel.

Ces formulaires utilisent maintenant les sheets FEBACO. Les validations, renouvellements, identifiants, dates, statuts, notifications et routes API FEVOCO restent inchangés.

Les historiques de licences restent intégrés aux fiches Acteurs, conformément au modèle existant. Aucun cycle, identifiant ou type de licence basketball n’a été importé.

## Résilience des données

Les transferts, athlètes, clubs et types de transfert sont chargés indépendamment. Si une feuille Google Sheets est indisponible :

- la page reste accessible ;
- les données disponibles sont conservées ;
- une alerte explicite est affichée ;
- aucune donnée fictive n’est ajoutée.

## Contrôles

- `npm run lint` : réussi.
- `npx tsc --noEmit` : réussi.
- `npm run build` : réussi.
- `/transferts` : HTTP 200.
- `git diff --check` : à inclure au contrôle Git final.

## Limite visuelle

Le runtime navigateur intégré n’est pas disponible dans cette session. Les captures comparatives FEBACO/FEVOCO aux quatre dimensions prescrites restent donc impossibles. Le responsive est implémenté dans le code mais n’est pas certifié par captures.

## Hors périmètre

- aucune équipe territoriale ;
- aucune nouvelle feuille Google Sheets ;
- aucune modification de l’authentification ;
- aucun travail du lot V6 ;
- aucun commit et aucun push.
