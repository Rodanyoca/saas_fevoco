# Hydratation des logos de connexion

Symptome : le serveur rend /logo-fevoco.png, tandis que le navigateur attend /_next/image avec srcSet et sizes.

Le test `node --test tests/login-images.test.cjs` rend la vraie page via React et le calculateur de props Next.js sous les deux configurations images.unoptimized. Avant correction : echec avec les differences exactes rapportees. Apres correction : reussite. Les autres composants sont remplaces par des elements simples dans ce test ; il ne constitue pas une verification navigateur complete.

Correction : prop unoptimized explicite sur les deux logos de app/login/page.tsx, conforme au choix global existant. Aucun masquage de l'avertissement. La source du decalage global (configuration navigateur ou ancien bundle) n'est pas etablie par ce test.

Aucun serveur relance, conformement a la demande d'arret precedente. Aucun commit ni push.
