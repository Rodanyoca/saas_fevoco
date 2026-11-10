# Modules en préparation — 9 novembre 2026

## Résultat

Équipes nationales, suivi des équipes nationales, Administration (Activités et Documents, détail d’activité inclus) et Paramètres sont placés en « Bientôt disponible ».

La navigation conserve leurs libellés et icônes, mais les entrées ne possèdent plus de lien ni d’action de navigation. Le libellé Bientôt disponible apparaît sous chaque entrée et dans l’infobulle de la barre réduite. Le comportement est partagé avec le menu mobile.

Une URL directe vers l’une des pages existantes affiche uniquement le composant ComingSoonPage FEVOCO avant toute lecture métier. Les URL d’API de ces modules, y compris les sous-routes, renvoient HTTP 403 avec le code MODULE_UNAVAILABLE. Cette désactivation s’applique aussi aux super-administrateurs et à toutes les méthodes HTTP ; les règles d’authentification et d’autorisation existantes restent appliquées en amont.

Le code des pages, composants, services, mutations et connexions aux classeurs est conservé. Aucune donnée ni aucun schéma n’est modifié. La configuration centrale lib/module-availability.ts permet de réactiver ultérieurement un module en retirant son entrée de la liste des modules indisponibles. Les autres sections restent accessibles selon leurs droits habituels. Les indicateurs agrégés existants du tableau de bord ne sont pas modifiés par ce lot.

## Fichiers concernés

- lib/module-availability.ts : configuration commune des modules et correspondance des chemins de pages/API.
- lib/module-availability.test.cjs : tests isolés du blocage et du rendu de navigation.
- components/dashboard/sidebar.tsx : entrées désactivées sans href, avec état accessible aria-disabled et mention Bientôt disponible.
- components/dashboard/coming-soon-page.tsx : icônes Équipes nationales et Paramètres ajoutées au composant existant.
- app/equipe-nationale/page.tsx et app/suivi-equipe-nationale/page.tsx : garde avant les lectures métier.
- app/activites/page.tsx et app/activites/[id]/page.tsx : même garde pour la liste et les détails.
- app/documents/page.tsx et app/parametres/page.tsx : même garde.
- proxy.ts : refus des API désactivées après les contrôles d’accès existants.

## Vérifications

- 9 tests dédiés réussis : frontières et alias des chemins, 6 pages sans exécution des services métier, API bloquées pour GET/HEAD/POST/PATCH/DELETE même en super-administrateur, rendu de la navigation sans lien vers les modules désactivés.
- 13 tests existants réussis : navigation, cycle de vie du layout, page publique et destinations après connexion.
- ESLint global : réussi.
- TypeScript sans émission : réussi (contrôle séparé du build).
- Build de production : réussi.
- git diff --check sur les fichiers du lot : réussi.
- Aucun serveur relancé, aucune écriture distante, aucun commit ni push.

Vérification visuelle dans un navigateur non effectuée : le serveur reste arrêté à la demande précédente. Les tests du rendu sont des rendus React isolés, pas une validation navigateur.

## État Git

Les sorties globales incluent les modifications antérieures présentes dans le dépôt. Les fichiers nouveaux non suivis ne figurent pas dans diff --stat.

### git diff --stat

~~~text
 app/activites/[id]/page.tsx               | 7 ++++++-
 app/activites/page.tsx                    | 5 +++++
 app/documents/page.tsx                    | 5 +++++
 app/equipe-nationale/page.tsx             | 5 +++++
 app/parametres/page.tsx                   | 7 ++++++-
 app/suivi-equipe-nationale/page.tsx       | 5 +++++
 components/dashboard/coming-soon-page.tsx | 4 ++--
 components/dashboard/sidebar.tsx          | 8 ++++++++
 proxy.ts                                  | 4 ++++
 9 files changed, 46 insertions(+), 4 deletions(-)
~~~

### git status --short

~~~text
 M app/activites/[id]/page.tsx
 M app/activites/page.tsx
 M app/documents/page.tsx
 M app/equipe-nationale/page.tsx
 M app/parametres/page.tsx
 M app/suivi-equipe-nationale/page.tsx
 M components/dashboard/coming-soon-page.tsx
 M components/dashboard/sidebar.tsx
 M proxy.ts
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
?? docs/entourage-qa/
?? docs/medecins-qa/
?? docs/modules-bientot-disponibles-2026-11-09.md
?? docs/officiels-qa/
?? docs/performance/sports-ui-2026-11-05/
?? lib/module-availability.test.cjs
?? lib/module-availability.ts
?? test-results/
~~~
