# Lot 2 — Layout et navigation

Date : 25 septembre 2026  
Branche : `design/harmonisation-febaco`

## Objectif

Harmoniser le layout principal, la sidebar et la navigation mobile avec les conventions de FEBACO et du COC, sans modifier l’authentification ni le métier.

## Rapport d’écart avant intervention

- La configuration des menus était codée directement dans la sidebar.
- Les états actifs ne reconnaissaient que l’égalité exacte de route.
- `Transferts` était rangé sous `Compétitions` au lieu de représenter les mouvements.
- `Activités` et `Documents` étaient absents.
- La navigation mobile utilisait un dialogue construit manuellement.
- Les libellés mélangeaient français, anglais et accents manquants.
- La sidebar mobile proposait implicitement le comportement de réduction desktop.

## Navigation retenue

```text
Tableau de bord
Structure territoriale
  Ligues
  Ententes
  Clubs
Acteurs
  Athlètes
  Entraîneurs
  Médecins
  Arbitres
  Officiels
Mouvements
Compétitions
Équipes nationales
  Sélections
  Performances
Activités
Documents
```

Cette structure réutilise exclusivement les routes déjà fonctionnelles, sauf `Activités` et `Documents`, ajoutées comme pages statiques « Bientôt disponible ».

## Modifications

- Configuration de navigation centralisée dans `lib/navigation.ts`.
- Détection des sous-routes pour les états actifs.
- Groupes repliables et ouverts automatiquement lorsque leur route est active.
- Sidebar desktop réductible avec libellés accessibles en français.
- Navigation mobile migrée vers le composant Sheet Radix, avec gestion native du focus, de la touche Échap et du dialogue modal.
- En-tête mobile plus lisible et cohérent avec l’identité FEVOCO.
- Ajout d’un composant partagé pour les modules non encore disponibles.
- Ajout des pages `/activites` et `/documents`, sans données, compteur ou service fictif.
- Traduction du libellé accessible de fermeture du Sheet.

## Hors périmètre

- aucune modification de connexion, session, utilisateur, rôle ou permission ;
- aucune modification Google Sheets ;
- aucune règle métier modifiée ;
- aucune donnée de démonstration ajoutée ;
- aucun module Activités ou Documents déclaré comme fonctionnel.

## Contrôles

- `npm.cmd run lint` : réussi.
- `npm.cmd run build` : réussi ; les 13 pages statiques, dont `/activites` et
  `/documents`, ont été générées.
- Script `typecheck` : absent du `package.json`.
- Script `test` : absent du `package.json`; aucun test automatisé dans le dépôt.
- Vérification visuelle navigateur : non exécutable dans cette session, car le
  runtime du navigateur intégré n’est pas disponible.

## État de clôture

- Feuilles Google Sheets créées ou adaptées : aucune.
- Colonnes ajoutées : aucune.
- Mappings modifiés : aucun.
- Authentification, comptes et permissions modifiés : aucun.
- Commit et push : aucun.
