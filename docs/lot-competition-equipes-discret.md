# Onglet Équipes : présentation discrète FEBACO

Date : 10 octobre 2026.

## Écart corrigé

Le tableau générique FEVoco affichait une carte, un titre interne et les colonnes même sans engagement. La référence `components/dashboard/competition-participants-panel.tsx` de FEBACO affiche un en-tête avec action et un simple message encadré lorsque la liste est vide.

## Portage

Fichier modifié : `components/competitions/competition-detail-v2.tsx`.

- Titre et action regroupés, avec retour à la ligne sur mobile.
- État vide sans colonnes ni fond de carte.
- Liste renseignée : grille discrète sur ordinateur, séparateurs de lignes et statuts ; cartes sur mobile.
- Colonnes et règles métier FEVoco conservées. Aucune requête ajoutée.
- Les autres onglets conservent leur présentation actuelle.

## Vérifications

ESLint ciblé, TypeScript indépendant et build Next.js réussis. Playwright sur l’édition VOL-COMP-2026-001 : état vide contrôlé en 1440 × 1000 et 390 × 844, sans en-tête de tableau, débordement horizontal ni erreur JavaScript. Captures inspectées dans `docs/competition-equipes-qa/`. Aucune écriture métier effectuée. La liste renseignée n’a pas été vérifiée visuellement, cette édition étant vide.

Le serveur temporaire de vérification a été arrêté. Le formulaire d’engagement et les autres écarts documentés précédemment restent hors de ce lot.

## État Git

Diff du composant : 10 insertions, 2 suppressions. Un composant modifié, présent rapport et captures ajoutés ; anciens dossiers QA non suivis conservés. Aucun commit ni push pour ce lot.
