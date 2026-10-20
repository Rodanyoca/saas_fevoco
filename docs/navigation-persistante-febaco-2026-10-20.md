# Navigation persistante FEVOCO — modèle FEBACO

## Symptôme confirmé

L'utilisateur a précisé que la navigation se recharge à chaque changement de page, plutôt qu'une disparition durable du panneau. Le diagnostic initial `diagnostic-navigation-2026-10-20.md` doit être lu avec cette précision.

## Référence et écarts

Référence lue uniquement : `febaco-reference/app/dashboard/layout.tsx` et sa sidebar. FEBACO conserve la navigation dans un layout partagé. FEVOCO conserve ses routes, son identité, ses modules, son responsive et ses droits.

| Élément | FEBACO | FEVOCO avant | Adaptation réalisée |
|---|---|---|---|
| Durée de vie | Sidebar montée dans layout partagé | DashboardLayout monté dans plusieurs pages et leurs chargements | Cadre unique dans le layout racine, conservé pendant les transitions Next |
| Premier affichage | Liens disponibles immédiatement | Menu vide puis requête navigateur `/api/auth/session` | Navigation calculée côté serveur via les fonctions d'accès existantes, transmise dès le premier rendu |
| Wrappers historiques | Un cadre | Wrappers de page/segment/chargement | Context de cadre : les wrappers internes rendent leur contenu sans seconde sidebar |
| Droits | Configuration de référence | Filtrage FEVOCO spécifique | Filtrage conservé, aucun affichage de modules sans droit, aucune modification du proxy, de l'API de session ou des fonctions d'authentification |
| Groupes ouverts | Initialisés avec les liens | Initialisés avec tableau vide avant lecture de session | Initialisés avec les liens déjà disponibles ; sidebar conservée lors des changements de rubrique |
| Pages autonomes | Adaptation FEVOCO | Login, activation, indisponibilité, accès refusé, compte hors cadre | Même présentation autonome conservée via DashboardShell |

## Fichiers et fonctionnement

- `app/layout.tsx` : fournit les liens autorisés au cadre commun avec `getSession`, `getNavigationAccess` et `filterNavigation`, sans modifier leur comportement.
- `components/dashboard/dashboard-layout.tsx` : DashboardShell persistant, contexte évitant les cadres imbriqués, suppression de la requête de session côté navigateur pour la navigation. Drawer mobile et fermeture au clic conservés.
- `tests/unit/dashboard-navigation-lifecycle.test.ts` : quatre régressions vérifiant le rendu initial peuplé, l'unicité du cadre, les pages autonomes et le filtrage au layout racine.

Pas de déplacement de routes ou de modification des pages métier. Le premier accès ou un rechargement complet attend toujours normalement le rendu serveur et les droits réels : aucun contenu fictif ni contournement du filtrage. Les transitions Next ordinaires gardent le cadre monté. Les contrôles du proxy restent exécutés ; ce correctif ne supprime pas leurs requêtes.

## Validation

- Les quatre nouveaux tests ont d'abord échoué sur l'ancienne implémentation : menu vide au premier rendu et double cadre reproduits avec React SSR et le véritable composant transpilé en mémoire. Sidebar et Sheet sont substitués pour isoler le cycle du layout.
- Après correction : quatre tests de régression, six tests navigation et cinq tests de politique de routes réussis (15 au total).
- ESLint ciblé et TypeScript `--noEmit --incremental false` réussis.
- Build de production réussi. La configuration Next existante ignore la validation TypeScript pendant le build ; le contrôle TypeScript a donc bien été exécuté séparément.
- Vérification React : hooks non conditionnels dans chaque composant, contexte distinct pour le cadre, données sérialisables transmises au client, aucune API serveur importée dans le composant client.
- Aucun navigateur disponible via l'outil (`apps:[]`, `browsers:[]`). La persistance réelle en navigation navigateur, le responsive et le focus du drawer restent à vérifier visuellement. Pas de capture ni de validation visuelle revendiquée ; ce lot n'est pas présenté comme validé visuellement selon AGENTS.md.
- Aucun commit, push ou déploiement ; aucune modification de FEBACO ou COC. Modifications et dossiers QA préexistants préservés.

## État du dépôt

Les sorties ci-dessous incluent les changements préexistants (notamment `tsconfig.json` et dossiers QA) ; ils ne font pas partie de ce correctif.

```text
git diff --stat
 app/layout.tsx                            | 12 +++++++--
 components/dashboard/dashboard-layout.tsx | 43 +++++++++++++++++--------------
 2 files changed, 34 insertions(+), 21 deletions(-)
```

```text
git status --short
 M app/layout.tsx
 M components/dashboard/dashboard-layout.tsx
 M tsconfig.json
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/audit-visuel-competitions/
?? docs/autres-acteurs-qa/
?? docs/clubs-version-qa/
?? docs/coachs-qa/
?? docs/competition-detail-qa/
?? docs/competition-distinctions-cnac-qa/
?? docs/competition-equipes-affichage-qa/
?? docs/competition-equipes-colonnes-qa/
?? docs/competition-equipes-modification-qa/
?? docs/competition-equipes-qa/
?? docs/competition-phases-qa/
?? docs/diagnostic-navigation-2026-10-20.md
?? docs/entourage-qa/
?? docs/medecins-qa/
?? docs/navigation-persistante-febaco-2026-10-20.md
?? docs/officiels-qa/
?? test-results/
?? tests/unit/dashboard-navigation-lifecycle.test.ts
```
