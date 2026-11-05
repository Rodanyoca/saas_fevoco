# Vérification navigateur des effectifs de la fiche club

Date : 5 novembre 2026. Périmètre : FEVOCO uniquement.

Le script `scripts/verify-club-actors-ui.cjs` compile les composants réels `ClubsClient` et `ClubDetail` dans un banc isolé, servi sur une adresse de boucle locale et un port éphémère. Les réponses de l’API des effectifs sont entièrement synthétiques et interceptées par Playwright. Il ne démarre pas l’application, ne contourne pas son authentification et ne contacte aucun classeur Google.

Commande : `node scripts/verify-club-actors-ui.cjs`. Le dossier de compilation est `.next/cache/club-actors-ui-20261105` ; les preuves sont écrites sous `docs/performance/club-actors-ui-2026-11-05`.

Scénarios contrôlés :

- Liste : aucun appel aux effectifs avant ouverture d’une fiche.
- Fiche : un appel à l’ouverture, chargement distinct de l’état de réussite, puis numéro de licence visible et recherchable.
- Ordinateur (1440 × 1000) et mobile (390 × 844) : absence de débordement horizontal de la page ; tableaux conservés dans leur conteneur.
- Formulaire de modification existant : ouverture et annulation sans relire les effectifs.
- Actualisation des props serveur pendant la consultation : nouvel état de chargement sans anciens effectifs affichés, puis un seul appel supplémentaire.
- Panne 503 : erreur explicite, puis nouvelle tentative uniquement au clic sur « Réessayer ».
- Changement rapide de club : la réponse de l’ancienne fiche ne remplace pas celle du club consulté.

Les captures `desktop.png` et `mobile.png` et `results.json` sont produits après les assertions correspondantes. Les résultats de ce banc ne démontrent ni le fonctionnement d’une session authentifiée de production ni un gain CPU Vercel. Les permissions et les accès Google relèvent des contrôles serveur complémentaires.

Résultat final : réussi, zéro erreur JavaScript. Deux appels sur chaque format (un à l’ouverture et un à l’actualisation des props), deux appels pour panne puis nouvelle tentative, deux appels pour changement rapide de fiche. La liste seule reste à zéro appel aux effectifs. Les captures ont été inspectées.

Contrôle du script : `npx.cmd eslint scripts/verify-club-actors-ui.cjs` réussi. Le navigateur et le serveur éphémère ont été fermés après les contrôles. Le premier dossier de compilation sous `test-results`, généré par cette vérification, a été supprimé après contrôle exact de son chemin et de ses quatre fichiers ; aucun autre travail n’a été supprimé.

Limites rencontrées : le bac à sable a refusé la création des dossiers temporaires (`EPERM`) ; le même banc synthétique a ensuite été exécuté avec les permissions locales adaptées. Un passage a expiré pendant `page.goto` en attendant le chargement complet des ressources ; la navigation de test attend désormais `domcontentloaded`, puis les éléments et réponses vérifiés explicitement. Le dernier passage a rejoué les assertions avec `--reuse-bundle` sur le bundle des mêmes composants, compilé juste avant. Cette option sert uniquement à ce rejeu sans changement des sources UI ; la commande normale recompile le banc.
