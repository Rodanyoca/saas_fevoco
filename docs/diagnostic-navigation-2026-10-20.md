# Diagnostic de disparition de la navigation FEVOCO

Analyse uniquement, sur `feature/competitions-fevoco`. Aucun composant, paramètre d'authentification ou droit modifié. Modifications et dossiers QA préexistants préservés.

## Précision du symptôme après retour utilisateur

L'utilisateur précise que **le panneau entier disparaît**. La reproduction de liens absents ci-dessous ne suffit donc pas à expliquer ce symptôme : avec une liste vide, DashboardLayout conserve l'aside et sa largeur sur ordinateur.

Chemins distincts à qualifier :

- Sous le seuil `lg`, le conteneur desktop `hidden lg:block` est caché, tandis que le bouton Header `lg:hidden` permet d'ouvrir le drawer. Le drawer se ferme après un clic de navigation. Une variation de largeur CSS (fenêtre ou zoom) peut activer ce comportement.
- `/mon-compte`, `/acces-refuse`, `/service-indisponible`, `/login` et `/activation` sont des pages sans DashboardLayout. Le proxy peut rediriger vers les pages d'accès/session ; ces destinations ne conservent donc pas la sidebar.
- Les routes avec DashboardLayout monté dans la page n'ont pas un cadre persistant partagé. Cela peut expliquer une coupure pendant une transition, mais une disparition durable sur une route métier nécessite encore une reproduction en navigateur.

Informations demandées : URL au moment de la disparition, présence du bouton menu, déclencheur (clic/rechargement/taille ou zoom). Aucun de ces chemins n'est présenté comme la cause certaine dans la session réelle avant cette qualification. Aucun correctif appliqué.

## Reproduction contrôlée

Le composant réel `DashboardLayout` a été transpilé en mémoire et exécuté avec des hooks simulés, le vrai `filterNavigation` et la vraie configuration des routes. Seule la réponse API est simulée ; aucune donnée de production ni session utilisateur utilisée.

| Réponse simulée | Entrées au premier rendu | Après la requête | Nombre de requêtes |
|---|---:|---:|---:|
| Session super-admin valide | 0 | 8 entrées racines | 1 |
| HTTP 503 | 0 | 0, toujours vide au rendu suivant | 1 |
| Erreur réseau | 0 | 0, toujours vide au rendu suivant | 1 |

Le panneau vide est donc reproductible au niveau du composant. Cela ne prouve pas que le navigateur de l'utilisateur reçoit actuellement un 503. Aucun scénario réel en navigateur n'a été capturé.

## Constats

1. `components/dashboard/dashboard-layout.tsx` initialise `user` à null. `lib/auth/navigation-access.ts` retourne alors une navigation vide. Le chargement ne fournit pas d'indicateur visuel distinct.
2. Le layout ne lance qu'une requête `/api/auth/session` à son montage. Un HTTP non réussi quitte silencieusement le traitement ; une erreur réseau ou un timeout est absorbé. Aucun état d'erreur, bouton de reprise ou nouvel essai n'existe. Un résultat `user:null` laisse aussi le menu vide.
3. De nombreuses routes (athlètes, coachs, arbitres, médecins, officiels, structures, accueil) montent leur propre DashboardLayout dans leur page. Ces transitions peuvent remonter le layout et répéter le cycle menu vide / lecture de session. Compétitions, Licences et Paramètres utilisent au contraire leur layout de segment. Cette incohérence favorise l'impression de disparition répétée.
4. `components/dashboard/sidebar.tsx` initialise les groupes ouverts depuis les entrées disponibles au montage, alors que cette liste est initialement vide. Quand les droits arrivent, seul le groupe de la route active est automatiquement ajouté ; les autres groupes ne retrouvent pas une ouverture initiale complète. Une fermeture de sous-menus doit être distinguée d'une disparition des liens.
5. La sidebar desktop est volontairement cachée sous `lg` (1024 px avec les seuils Tailwind par défaut), au profit du bouton menu mobile. Le mode réduit est conservé dans localStorage. Ce sont deux comportements distincts du menu vide.
6. Autre chemin dans la couche d'accès existante : `lib/auth.ts/getNavigationAccess` transforme une erreur de lecture des autorisations en valeurs false. Pour un non-super-admin, une réponse HTTP réussie peut donc néanmoins produire zéro lien. Cela relève des sessions/permissions et reste hors modification selon AGENTS.md.

## Contrôles et proposition

Les six tests existants de `lib/navigation.test.ts` passent. Ils vérifient les routes, l'état actif et l'hydratation du chemin, mais ne couvrent pas la réponse de session en échec ni les transitions de DashboardLayout. Aucun build nécessaire pour cette analyse sans modification applicative.

Correction UI à préparer après qualification du symptôme : rendre explicites les états chargement/échec, permettre une reprise, préserver une navigation déjà résolue pendant une actualisation, stabiliser le cadre de page et initialiser correctement les groupes lorsque les entrées deviennent disponibles. Toujours conserver le filtrage réel des droits : ne jamais afficher tous les modules comme contournement.

Une correction du calcul des droits ou des sessions nécessiterait une demande explicite adaptée, compte tenu de l'interdiction AGENTS.md. Aucune correction, aucun commit et aucun push réalisés dans ce lot. Rapport ajouté uniquement ; état préexistant : `tsconfig.json` modifié et dossiers QA non suivis.
