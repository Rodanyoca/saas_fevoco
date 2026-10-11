# Engagement enregistré mais invisible sur ordinateur

10 octobre 2026.

## Reproduction et diagnostic

Skill utilisé : diagnosing-bugs. L’engagement réel LA LOI de VOL-COMP-2026-001 était présent dans le DOM. Sur le serveur de développement port 3000, son conteneur desktop avait `display: none` et la carte mobile était également masquée à 1440 px. Le rendu production port 3100 était correct. La feuille CSS de développement servie ne fournissait pas la nouvelle règle `md:grid`.

Commande de reproduction : `node node_modules/.cache/entourage-ui/repro-entries.cjs`. Avant correction : `Engagement must produce visible cells`, code 1 ; après correction : cinq cellules visibles, code 0. Aucun engagement de test créé.

Hypothèses étudiées : style responsive absent (confirmé par comparaison des styles calculés), chargement transitoire (écart persistant après attente), différence desktop/mobile (seul le desktop était affecté). Aucune perte ni erreur de mapping des données observée.

## Correction

Fichier : `components/competitions/competition-detail-v2.tsx`. Le tableau discret utilise désormais `hidden md:block`, déjà disponible dans les styles servis, et une grille interne dont le display est explicite. Colonnes, libellés, état vide et comportement mobile conservés. Aucune nouvelle requête ni écriture métier.

## Vérification

Boucle de régression navigateur : `node node_modules/.cache/entourage-ui/verify-entries-visible.cjs`. Engagement LA LOI visible sur le serveur 3000 en 1440 × 1000 et 390 × 1000, sans débordement ni erreur JavaScript. Captures inspectées dans `docs/competition-equipes-affichage-qa/`. Scripts temporaires conservés uniquement dans le cache de diagnostic ignoré. ESLint ciblé, TypeScript indépendant et build réussis.

Le serveur temporaire 3100 a été arrêté ; le serveur existant 3000 est conservé. Aucun autre écart observé dans ce périmètre.

## État Git

Lot courant : trois lignes modifiées dans le tableau discret. Diff global avec lots précédents : clubs-client.tsx (4 lignes), competition-detail-v2.tsx (14 lignes), 15 insertions et 3 suppressions. `git status --short` : ces deux composants modifiés, rapports et dossiers QA non suivis ; anciens artefacts préservés. Aucun commit ni push.
