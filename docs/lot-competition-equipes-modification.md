# Modification des équipes engagées par panneau latéral

10 octobre 2026.

## Interface et comportement

Action crayon dans la colonne Actions et sur les cartes mobiles de l’onglet Équipes. Elle ouvre directement un Sheet latéral prérempli ; aucune vue détaillée ajoutée. Champs : club représenté, phase initiale de l’épreuve, groupe conditionnel, statut, date d’inscription et observations. Annulation, fermeture, état d’enregistrement et erreurs de validation sont gérés. Les erreurs du champ disparaissent à sa correction. Les identifiants et l’épreuve restent inchangés.

Réutilisation de Sheet, Button, Input, Select, Label et Textarea, suivant le panneau de modification de compétition existant. Données déjà présentes dans le chargement initial ; aucune requête pour ouvrir le panneau.

## Logique serveur

Route PATCH `/api/competitions/[id]/unites/[unitId]`. Vérification de l’appartenance à la compétition et de l’existence de l’inscription et de l’affectation initiale TAP001. Les en-têtes Google de ces trois feuilles ont été contrôlés dans le lot précédent.

- Compétition TERMINEE : mutation refusée et action absente.
- Club actif, unicité du club dans l’épreuve, phase de la bonne épreuve et groupe actif de la bonne phase.
- Club, phase, groupe et statut verrouillés dès qu’un match, une affectation supplémentaire, un classement, une distinction ou un intervenant utilise l’unité. La date et les observations restent éditables.
- Réactivation soumise à une épreuve, une phase et un groupe actifs, sans doublon d’engagement.
- Date civile validée avec formatDateForSheet, y compris les années bissextiles ; l’inscription ne peut pas suivre un match existant. Saisie progressive JJ/MM/AAAA sur clavier numérique.
- Mise à jour groupée de COMPETITIONS_UNITES, COMPETITIONS_PARTICIPANTS et COMPETITIONS_PHASES_UNITES. Un seul spreadsheets.batchUpdate écrit les cellules adressées par leurs en-têtes et leurs identifiants ; valeurs ISO et format yyyy-mm-dd pour les dates. Aucun identifiant changé ; autres cellules préservées ; colonnes absentes ou identifiants dupliqués font échouer la préparation avant toute écriture. Cache invalidé après réussite.
- Le groupe initial reste visible dans la liste lorsqu’un engagement est désactivé.

## Fichiers du lot

- Modifiés : `components/competitions/competition-detail-v2.tsx`, `lib/google-sheets.ts`.
- Ajoutés : `components/competitions/competition-entry-edit-sheet.tsx`, `lib/competition-entry-edit.ts`, `app/api/competitions/[id]/unites/[unitId]/route.ts`.
- Tests : `lib/competition-entry-edit.test.cjs`, `lib/sheet-update-batch.test.cjs`.

## Validation et limites

18 tests réussis via `node --test lib/competition-entry-edit.test.cjs lib/sheet-update-batch.test.cjs lib/competition-context-rules.test.cjs`. Ils exercent les modules réels avec transport Sheets isolé : cohérence des trois enregistrements, refus des mutations invalides, dates impossibles, doublons, clôture, verrouillage des dépendances, adressage par en-têtes réordonnés et requête d’écriture groupée avec format de date. ESLint ciblé, TypeScript indépendant, build et git diff --check réussis.

Playwright sur le build de production temporaire (port 3100), données réelles LA LOI, 1440 × 1000 et 390 × 1000 : ouverture latérale, préremplissage, saisie progressive, date impossible rejetée par la vraie route PATCH, erreur corrigée à la saisie, sauvegarde valide interceptée sans écriture Google, fermeture et annulation. Captures inspectées dans `docs/competition-equipes-modification-qa/`. Aucune erreur JavaScript sur ce parcours. Les écritures valides ont été vérifiées par le transport isolé, sans modifier le référentiel réel.

Le contrôle initial sur le serveur de développement existant port 3000 a montré une absence d’hydratation du bouton et une erreur WebSocket HMR ERR_INVALID_HTTP_RESPONSE. Il n’a donc pas validé l’interaction sur cette instance. Le build de production valide le parcours complet ; aucun redémarrage du serveur existant n’a été effectué. Les serveurs temporaires 3100 ont été arrêtés après les contrôles.

Les anciens engagements sans inscription ou sans affectation initiale canonique affichent un avertissement et ne peuvent pas être modifiés par ce panneau. Les membres des paires et l’identité des équipes nationales ne sont pas remplaçables ici. Ces cas n’ont pas été vérifiés visuellement.

## État Git

Git diff --stat des fichiers déjà suivis, incluant les lots précédents : clubs-client.tsx (4 lignes), competition-detail-v2.tsx (29 lignes), google-sheets.ts (35 lignes), 65 insertions et 3 suppressions. Les cinq nouveaux fichiers source/tests ci-dessus sont non suivis et ne sont pas comptés dans ce diff.

Git status --short : trois fichiers suivis modifiés, cinq fichiers source/tests ajoutés non suivis, présent rapport et captures QA non suivis ; rapports et anciens dossiers QA préservés. Le changement de clubs-client.tsx provient du lot précédent. Aucun commit ni push.
