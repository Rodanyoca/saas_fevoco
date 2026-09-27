# Lot 0 — Audit initial et matrice d’écart

Date : 25 septembre 2026  
Branche : `design/harmonisation-febaco`

## Périmètre

Audit en lecture seule de `fevoco-cible`, comparé à `febaco-reference` et à
`coc-cible`. La hiérarchie métier retenue est `Ligue → Entente → Club` et un
athlète ne dépend d’aucune équipe territoriale.

## Inventaire FEVOCO

- 13 pages App Router, 28 routes API, 136 composants React et 59 fichiers métier dans `lib`.
- Next.js 16, React 19, TypeScript 5.7, Tailwind CSS 4, shadcn/ui et Google Sheets.
- Aucun test automatisé et aucun script `test` ou `typecheck`.
- Zod est installé mais aucun schéma Zod n’est utilisé.
- Pages présentes : tableau de bord, ligues, ententes, clubs, athlètes, coachs,
  médecins, arbitres, officiels, transferts, compétitions et équipes nationales.
- Pages absentes : entrée Acteurs, Activités, Documents et placeholders associés.

## Classeurs réels

| Classeur | Feuilles principales | Volumes constatés |
| --- | --- | --- |
| Territoire | `LIGUES`, `ENTENTES`, `CLUBS` | 26, 25 et 76 lignes |
| Acteurs | `ATHLETES`, `COACHS`, `OFFICIELS`, `ARBITRES`, `MEDECINS`, `AUTRES` | feuilles vides, en-têtes présents |
| Affiliations | affiliations, affectations, grades et mandats | feuilles vides |
| Compétitions | compétitions, participants, unités, résultats, classement | 1 compétition, autres feuilles vides |
| Équipes nationales | équipe, sélections, staff, compétitions, résultats | feuilles vides |
| Référentiels | sexe, catégories et versions de club, transferts, fonctions, spécialités, sport | valeurs contrôlées présentes |

Aucune feuille territoriale `EQUIPES` n’existe. Le modèle de résultats des
compétitions contient les cinq sets et les agrégats propres au volleyball.

## Écarts majeurs

1. Les plages territoriales sont tronquées (`A:G`, `A:K`, `A:M`) alors que les
   feuilles possèdent respectivement 11, 13 et 19 colonnes.
2. Plusieurs mappers ne correspondent pas aux en-têtes réels : `id_sexe`/`sexe`,
   `nom_complet`/`nom`, `email`/`email_ligue`, `date_affiliation`/`date_affiliation_club`.
3. Le code lit une feuille `PROVINCES` absente du classeur des référentiels.
4. Le code appelle plusieurs feuilles de licences et `OFFICIELS_AFFILIATIONS`
   qui n’existent pas dans le classeur connecté.
5. `ATHLETES` ne contient pas `id_club`; le club courant est aujourd’hui porté
   par `ATHLETE_AFFILIATIONS`. La source canonique devra être décidée avant les Lots 7 et 8.
6. Le dashboard déclenche de nombreuses lectures individuelles et ne dispose ni
   de `batchGet`, ni de limite de concurrence, ni de déduplication explicite des lectures en cours.
7. La navigation n’expose ni Activités ni Documents et regroupe Transferts avec Compétitions.

## Risques

- données écrites mais invisibles à cause des plages tronquées ;
- champs vides dus aux divergences d’en-têtes ;
- erreurs lors de la lecture de feuilles inexistantes ;
- double source possible pour le club courant d’un athlète ;
- dépassement de quota Google Sheets sur les pages agrégées ;
- régressions non détectées en l’absence de tests.

## Ordre recommandé

1. Fondations visuelles.
2. Layout et navigation.
3. Référentiel territorial.
4. Ligues, ententes, puis clubs.
5. Acteurs.
6. Affiliations, licences et mouvements.
7. Compétitions.
8. Équipes nationales.
9. Activités et Documents.
10. Dashboard final.
11. Vérification transversale.

## Contrôles du Lot 0

- `npm.cmd run lint` : réussi.
- `npm.cmd run build` : réussi.
- Typecheck dédié : non disponible.
- Tests : non disponibles.
- Fichiers, feuilles, colonnes et mappings modifiés : aucun.

