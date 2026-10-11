# Onglet Équipes : six colonnes demandées

10 octobre 2026.

## Résultat

`components/competitions/competition-detail-v2.tsx` présente désormais Club, Catégorie, Sexe, Groupe, Date d’inscription, Statut dans cet ordre. Grille discrète et cartes mobiles inspirées de FEBACO `competition-participants-panel.tsx`, avec les six colonnes explicitement demandées et sans la colonne basketball Équipe engagée.

## Mapping vérifié

En-têtes réels contrôlés en lecture seule dans Google Sheets :

- Club : `COMPETITIONS_UNITES.id_club`, noms déjà chargés ; libellé de l’unité conservé comme repli pour les paires et équipes nationales.
- Catégorie et sexe : jointure par `id_epreuve_competition` avec `COMPETITIONS_EPREUVES.id_categorie_age` et `id_sexe`, puis référentiels CATEGORIES_AGE et SEXES.
- Groupe : `COMPETITIONS_PHASES_UNITES.id_unite_competition`, affectation initiale TAP001 prioritaire parmi les affectations non inactives, puis `COMPETITIONS_GROUPES.id_groupe` vers `nom_groupe`. Première affectation disponible en repli.
- Date et statut : `COMPETITIONS_PARTICIPANTS`, relié par `id_participation`, colonnes `date_inscription` et `statut_participation`. Statut de l’unité en repli.

Les données sont assemblées en mémoire depuis le chargement existant. Aucune requête ajoutée ni écriture Google. Date affichée avec formatDateForDisplay ; aucun formulaire de date modifié.

## Contrôles

ESLint ciblé, TypeScript indépendant, build et git diff --check réussis. Playwright en 1440 × 1000 et 390 × 1000 : six en-têtes dans le bon ordre et ligne réelle LA LOI / SENIORS / FEMININ / POULE A / 02/09/2025 / ACTIF. Aucune erreur JavaScript ni débordement mobile. Captures inspectées dans `docs/competition-equipes-colonnes-qa/`. Serveur existant conservé ; aucun serveur temporaire lancé pour ce lot.

## État et limites

Les unités exclusivement affectées via l’ancienne feuille GROUPES_UNITES ne bénéficient pas de ce mapping de groupe canonique ; cette lecture historique reste un écart possible. Paires et équipes nationales non vérifiées visuellement dans ce lot.

Git diff --stat global : clubs-client.tsx (4 lignes), competition-detail-v2.tsx (27 lignes), 28 insertions et 3 suppressions, incluant les lots précédents. Git status --short : ces deux composants modifiés, rapports et captures non suivis. Aucun autre fichier source modifié ; anciens dossiers QA préservés. Aucun commit ni push.
