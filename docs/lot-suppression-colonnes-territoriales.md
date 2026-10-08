# FEVOCO — retrait des colonnes territoriales supprimées

7 octobre 2026.

Les en-têtes réels de LIGUES et ENTENTES ont été vérifiés par une lecture Google limitée aux premières lignes. Suppression de id_ligue_coc, sigle_ligue et id_entente_coc dans les types, mappings, données des formulaires, réponses serveur et écritures de création/modification. Les interfaces retirent le sigle de ligue (liste, détail et formulaire) et les identifiants COC (formulaires, détail de l’entente). Le sigle d’entente sigle_entente reste présent dans le référentiel et est conservé.

Fichiers : lib/types.ts, lib/mappers/ligues.ts, lib/mappers/ententes.ts, lib/mappers/territorial.test.mjs, lib/territorial-mutations.ts ; components/ligues/ligues-client.tsx, ligue-detail.tsx et ligue-form-dialog.tsx ; components/ententes/entente-detail.tsx et entente-form-dialog.tsx. Réutilisation de DetailCard, Table et Sheet ; aucun composant externe porté.

Validation : lint, TypeScript indépendant, build et trois tests de mapping réussis. Les quatre parcours serveur de création/modification ligue/entente ont été exécutés dans un banc isolé avec dépendances Google simulées : les écritures ne contiennent plus les colonnes supprimées et le sigle d’entente est conservé. Playwright sur les composants réels, aux largeurs 1440 et 390 pixels : fiches, formulaires de création et modification sans les champs supprimés ; aucune erreur JavaScript. Bancs et captures sous node_modules/.cache, hors application et Git. Aucune écriture réelle dans Google et aucune session authentifiée de production testée.

Aucune référence aux propriétés supprimées ne subsiste dans le code applicatif et ses tests. Les anciennes notes de documentation sont conservées comme historique. Aucun écart fonctionnel restant pour cette demande. Les travaux préexistants sont préservés ; la statistique de ligue-detail inclut le retrait précédent du tableau des athlètes. Aucun commit ni push.

## git diff --stat (fichiers du lot)

```text
components/ententes/entente-detail.tsx      |  2 +-
 components/ententes/entente-form-dialog.tsx |  4 +---
 components/ligues/ligue-detail.tsx          |  7 +------
 components/ligues/ligue-form-dialog.tsx     |  8 +++-----
 components/ligues/ligues-client.tsx         |  1 -
 lib/mappers/ententes.ts                     |  1 -
 lib/mappers/ligues.ts                       |  2 --
 lib/mappers/territorial.test.mjs            | 14 +++++++-------
 lib/territorial-mutations.ts                | 23 +++--------------------
 lib/types.ts                                |  3 ---
 10 files changed, 16 insertions(+), 49 deletions(-)
```

## git status --short (fichiers du lot)

```text
M components/ententes/entente-detail.tsx
 M components/ententes/entente-form-dialog.tsx
 M components/ligues/ligue-detail.tsx
 M components/ligues/ligue-form-dialog.tsx
 M components/ligues/ligues-client.tsx
 M lib/mappers/ententes.ts
 M lib/mappers/ligues.ts
 M lib/mappers/territorial.test.mjs
 M lib/territorial-mutations.ts
 M lib/types.ts
```

