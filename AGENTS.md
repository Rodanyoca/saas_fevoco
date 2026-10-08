# Instructions permanentes — harmonisation FEVOCO

Lire ce fichier avant chaque nouveau lot d’harmonisation.

## Arrêt des serveurs locaux

- Quand l’utilisateur demande « taskkill », « taskill » ou « arrête tout », rechercher tous les serveurs de développement actifs des projets `C:\Projets\SNDS-HARMONISATION`, même si un seul PID est fourni.
- Identifier les processus par leur ligne de commande, leur parent et les ports en écoute ; arrêter tous les serveurs de ces projets et leurs processus npm/Next.js associés dont le rattachement est confirmé. Préserver les services Windows et les outils Codex/MCP sans rapport avec les serveurs.
- Vérifier après l’arrêt qu’aucun serveur de ces projets ne reste actif, rapporter les PID arrêtés et ne relancer aucun serveur sans demande de l’utilisateur.

## Périmètre et références

- Modifier uniquement `fevoco-cible`.
- Considérer FEBACO comme la source de vérité visuelle absolue.
- Utiliser le COC uniquement comme référence secondaire d’adaptation.
- Conserver FEVOCO comme source de vérité métier et données.
- Ne jamais modifier, formater, installer de dépendance ou créer un commit dans `febaco-reference` ou `coc-cible`.

## Modèle métier FEVOCO

- Respecter la structure territoriale `Ligue → Entente → Club`.
- Le club est le dernier niveau territorial.
- Les athlètes sont directement liés au club.
- Ne jamais créer d’équipe territoriale entre le club et l’athlète.
- Ne jamais importer les identifiants, catégories, règles ou données basketball.
- Ne jamais utiliser de données fictives pour faire fonctionner une interface.

## Compétitions FEVOCO

- FEBACO est la référence visuelle et fonctionnelle du module, mais ses règles basketball ne doivent jamais être copiées.
- Ne jamais créer d'entité permanente `EQUIPE` : l'unité engagée est un `CLUB` en indoor, une `PAIRE` en beach-volley ou une équipe nationale activée pour une saison.
- Utiliser les identifiants `VOL-*` générés côté serveur et ne jamais les rendre modifiables.
- Les résultats sont saisis et calculés par sets. Toute notion de quart-temps, `qt1`, panier ou score basketball est interdite.
- Mapper Google Sheets exclusivement par noms d'en-têtes. Vérifier les en-têtes et le référentiel réels avant tout nouveau mapper ou formulaire.
- Résoudre les libellés depuis les référentiels à la lecture ; ne jamais les dupliquer dans les feuilles métier lorsqu'un identifiant existe.
- Écrire les nouvelles affectations de phase dans `COMPETITIONS_PHASES_UNITES`. `COMPETITIONS_GROUPES_UNITES` reste en lecture historique uniquement.
- Une compétition `TERMINEE` est en lecture seule dans l'interface et dans chaque mutation serveur.
- Charger les feuilles par lots, filtrer en mémoire et proscrire une requête Sheets par ligne, carte ou match.

## Limites fonctionnelles

- Ne pas intervenir sur la connexion, l’authentification, les utilisateurs, les rôles, les permissions ou les sessions.
- Maintenir `Activités` et `Documents` en « Bientôt disponible » jusqu’à autorisation fonctionnelle.
- Implémenter le tableau de bord en dernier et uniquement avec des données réelles.

## Méthode de livraison

- Faire suivre à chaque interface le design FEBACO actuel : structure, proportions, composants, états, interactions et responsive.
- Vérifier chaque lot dans le navigateur, aux dimensions prévues, avant de passer au suivant.
- Exécuter les contrôles disponibles : lint, typecheck, tests pertinents et build.
- Afficher les fichiers modifiés, composants portés, écarts restants, `git diff --stat` et `git status --short` dans le rapport de lot.
- Ne créer aucun commit et ne pousser aucune modification sans autorisation explicite.

## Champs de date — règle obligatoire

Appliquer cette règle à chaque champ de date créé ou modifié, sans faire confiance à la valeur envoyée par le navigateur :

- Utiliser une saisie texte à clavier numérique avec `inputMode="numeric"`, `maxLength={10}` et le placeholder `JJMMAAAA`.
- À chaque frappe, supprimer tous les caractères non numériques, conserver au maximum huit chiffres et insérer automatiquement les séparateurs pour afficher `JJ/MM/AAAA`. L’utilisateur saisit uniquement les chiffres, mais la valeur contrôlée et envoyée par l’interface est `JJ/MM/AAAA` : la regex HTML doit donc valider `[0-9]{2}/[0-9]{2}/[0-9]{4}`, jamais huit chiffres nus.
- Réutiliser exclusivement les fonctions centralisées de `lib/compact-date.ts` (`sanitizeDateInput`, `formatCompactDateInput`, `parseCompactDate`, `formatDateForSheet`, `formatDateForDisplay`) au lieu de réécrire une regex dans un composant.
- Valider de nouveau côté serveur : huit chiffres complets, date civile réelle, années bissextiles, contraintes métier et ordre chronologique. Une validation HTML ou côté client ne constitue jamais une validation métier.
- Écrire dans Google Sheets au format canonique non ambigu `YYYY-MM-DD`, conserver une date vide comme chaîne vide et appliquer le format de cellule `yyyy-mm-dd`.
- Lire les anciens formats seulement comme alias de compatibilité ; toute nouvelle écriture utilise le format canonique.
- Une adaptation de formulaire comportant une date n’est terminée qu’après vérification de la saisie progressive, du collage avec séparateurs, du rejet d’une date impossible et de la valeur réellement écrite côté serveur.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
