# Distinctions FEVoco : présentation CNAC

11 octobre 2026.

## Référence et écarts corrigés

À la demande explicite de l’utilisateur, référence de ce lot : `cnac-cible/components/dashboard/competition-medals.tsx`, consulté en lecture seule. CNAC présente un en-tête avec icône, description et action, un tableau compact encadré et des actions dans les lignes ; création et modification s’ouvrent dans un Sheet latéral.

FEVoco affichait une liste de raccourcis de modification, puis un tableau générique séparé, et ouvrait une fenêtre centrale. Ces doublons sont supprimés.

## Portage

- `components/competitions/competition-distinction-manager.tsx` : en-tête Distinctions obtenues, tableau Distinction / Épreuve / Club / Phase ou match / Statut / Actions. Bénéficiaire en sous-titre de la distinction. Club résolu depuis l’unité ou l’acteur ; phase et match avec leurs noms disponibles. Toutes ces données proviennent du chargement existant, sans nouvelle requête. Message vide dans le tableau, adapté au retour à la ligne mobile.
- Création et modification dans un Sheet à droite, largeur maximale xl sur ordinateur et pleine largeur mobile, formulaire vertical, erreurs visibles et annulation.
- Action crayon directement sur chaque ligne, avec infobulle. Identifiants de formulaires uniques. En clôture, liste visible et actions masquées.
- `components/competitions/competition-detail-v2.tsx` : un seul composant rend désormais l’ensemble de l’onglet ; retrait du tableau générique et de son mapping devenu inutile.

Les règles et mutations FEVoco existantes sont conservées : attribution aux unités ou acteurs autorisés par le type ; contexte d’épreuve, phase ou match facultatif ; édition limitée au statut et aux observations. Aucune nouvelle requête à l’ouverture du panneau, aucune dépendance à un résultat logique CNAC importée. La suppression définitive CNAC n’est pas portée : FEVoco dispose d’une désactivation par statut.

## Référentiel et dates

En-têtes réels de COMPETITIONS_DISTINCTIONS et référentiel TYPES_DISTINCTIONS vérifiés en lecture seule. Mapping par id_type_distinction, id_unite_competition, id_acteur avec id_type_acteur, id_epreuve_competition, date_attribution et statut. Données déjà chargées utilisées pour résoudre les noms.

La saisie de date reste fondée sur formatCompactDateInput, le clavier numérique, dix caractères et le pattern JJ/MM/AAAA ; formatDateForDisplay est utilisé dans la liste. La validation serveur existante utilise formatDateForSheet. Aucun changement des mutations de date dans ce lot.

## Contrôles

ESLint ciblé, TypeScript indépendant, build et git diff --check réussis ; 18 tests de contexte, modification des engagements et mises à jour atomiques réussis.

Playwright sur le build compilé temporaire port 3100, édition VOL-COMP-2026-001 : état vide et en-têtes, ouverture à droite, formulaire en 1440 × 1000 et 390 × 1000, passage MVP vers CHAMPION avec changement de sélecteur bénéficiaire, sélection de LA LOI, saisie progressive et collage de dates, date impossible rejetée par la vraie route serveur, effacement de l’erreur à la correction, annulation et enregistrement valide intercepté. Aucune erreur JavaScript ni débordement de page mobile. Captures inspectées dans `docs/competition-distinctions-cnac-qa/`.

Aucune distinction réelle créée ou modifiée. La compétition est vide : une ligne issue de la réponse simulée est visible sur mobile ; les lignes Google réelles et l’ouverture du panneau de modification ne sont pas vérifiées visuellement. Le serveur temporaire est arrêté après vérification ; le serveur existant est conservé.

## Écarts métier préexistants

Le type DST099 AUTRE porte la cible AUTRE dans Google, non reconnue comme unité ou acteur par la logique actuelle. Cette anomalie métier n’est pas corrigée par un portage visuel. Les règles de suppression et de liaison obligatoire aux résultats propres au CNAC ne sont pas importées.

## Livraison

Commit et push demandés explicitement par l’utilisateur. Le lot inclut les changements précédents des engagements et de la colonne Version des clubs. Les captures QA locales restent non suivies. Voir aussi `lot-livraison-engagements-distinctions.md`.
