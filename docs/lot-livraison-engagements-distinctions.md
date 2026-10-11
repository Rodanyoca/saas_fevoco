# Livraison FEVoco du 11 octobre 2026

## Changements

Colonne Version des clubs ; tableau des engagements discret avec Club, Catégorie, Sexe, Groupe, Date d’inscription et Statut ; correction des lignes masquées ; modification des engagements dans un panneau latéral et route PATCH avec mises à jour atomiques des trois feuilles associées.

Onglet Distinctions aligné sur la présentation CNAC, avec les colonnes demandées : Distinction, Épreuve, Club, Phase ou match, Statut, puis Actions. Les libellés utilisent les données déjà chargées. Aucun changement des identifiants ni ajout de requête par ligne.

## Validation

ESLint ciblé, TypeScript indépendant, build Next.js et 18 tests réussis. Contrôles Playwright ordinateur et mobile ; dates impossibles rejetées par la route réelle, sauvegarde valide interceptée sans écriture Google. Serveur temporaire arrêté ; serveur utilisateur conservé. Les rapports de chaque lot décrivent les limites et mappings.

## Périmètre Git

Neuf fichiers de code et tests, sept rapports de lot. Captures QA et test-results conservés localement hors commit. Branche feature/competitions-fevoco synchronisée avec origin avant livraison (0 commit divergent). Commit et push explicitement demandés ; aucun changement dans les projets de référence.
