# Libellés des licences dans les fiches acteurs

Correction locale du 5 novembre 2026.

- Constat : le lecteur des licences athlètes exposait `id_saison` comme saison et `id_statut_licence` comme statut. Les autres catégories résolvaient déjà le statut.
- Correction : utiliser `SAISON.nom_saison` et joindre `STATUT_LICENCE.nom_statut_licence`. Conserver `idStatutLicence`, les dates et le club historique de délivrance. Le statut affiché reste celui de la licence, distinct du statut de sa saison.
- Sans référence de saison, conserver le libellé historique s'il existe ; sinon laisser la valeur vide pour l'état « non renseigné » de l'interface.
- La lecture du statut participe au regroupement existant des lectures du référentiel. Le test du lecteur réel vérifie toujours cinq appels à froid pour les athlètes et aucun appel supplémentaire au second chargement.
- Validation : régression reproduite (`STL001` affiché au lieu d'`ACTIVE`), puis cinq tests réussis (lecteurs coachs/athlètes et validité). Tests de mapping : nom de saison, référence absente et libellé historique. Aucune écriture dans les classeurs.
- Limite : rendu dans une session navigateur authentifiée non vérifié. Aucun gain de performance en production revendiqué.
- Retour arrière : retirer la résolution ajoutée dans `lib/actor-records.ts` et `lib/mappers/actor-records.ts`, ainsi que les assertions correspondantes de `lib/coach-loading.test.cjs`.
