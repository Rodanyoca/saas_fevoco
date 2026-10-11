# Colonne Version dans la liste des clubs

10 octobre 2026.

## Modification

`components/clubs/clubs-client.tsx` : colonne Version après Catégorie et même information sur les cartes mobiles. Réutilisation de DataTable, sans nouveau composant ni requête.

Les en-têtes Google réels ont été contrôlés en lecture seule : `CLUBS.id_sexe` rejoint `SEXES.id_sexe`, dont le libellé est `nom_sexe` (MASCULIN, FEMININ, MIXTE). Aucune colonne métier `version` n’existe. La propriété d’interface `version` existe déjà ; les références chargées permettent également de résoudre le sexe après une modification du club. Une valeur absente affiche « Non renseignée ».

## Validation

ESLint ciblé, TypeScript indépendant, build Next.js et git diff --check réussis. Playwright sur les clubs réels en 1440 × 1000 et 390 × 844 : colonne visible, libellés MASCULIN/FEMININ et absence correctement affichés, information mobile visible, aucun débordement horizontal mobile ni erreur JavaScript. Captures inspectées dans `docs/clubs-version-qa/`. Aucune écriture Google. Serveur temporaire arrêté après vérification.

## État du lot

Diff ciblé : 3 insertions, 1 suppression dans clubs-client.tsx. Aucun écart restant dans le périmètre demandé. Le cas MIXTE et le retour après sauvegarde n’ont pas été testés par écriture sur les données réelles.

Git status --short : clubs-client.tsx modifié, rapport et captures non suivis. Les modifications précédentes de competition-detail-v2.tsx et les anciens dossiers QA sont conservés. Diff global au contrôle : 2 composants, 13 insertions, 3 suppressions. Aucun commit ni push.
