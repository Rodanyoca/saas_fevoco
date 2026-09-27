# Contexte métier FEVOCO

## Glossaire territorial

- **Ligue** : premier niveau territorial de la FEVOCO. Une ligue est rattachée à une province.
- **Entente** : deuxième niveau territorial. Une entente appartient directement à une seule ligue.
- **Club** : dernier niveau territorial. Un club appartient directement à une seule entente.
- **Parent direct** : rattachement enregistré dans la feuille de l’entité (`id_ligue` pour une entente, `id_entente` pour un club).
- **Parent indirect** : rattachement déduit de la hiérarchie à la lecture. La ligue d’un club, par exemple, est celle de son entente et n’est pas dupliquée comme source de vérité.
- **Identifiant territorial** : identifiant métier stable. Un changement de rattachement ne doit pas le recalculer.
- **`id_ligue_historique`** : trace historique éventuelle portée par un club ; ce champ ne constitue pas son rattachement territorial courant.
- **Statut territorial** : valeur contrôlée `ACTIF` ou `INACTIF`. Une valeur historique vide reste inconnue et n’est pas complétée sans source autoritative.
- **Équipe nationale** : agrégat sportif national distinct de la hiérarchie territoriale. Il n’existe pas d’entité « équipe » entre l’entente et le club.

## Hiérarchie de référence

`Province → Ligue → Entente → Club → Athlète`

L’athlète est rattaché directement au club. Les catégories de club et les sexes sont des référentiels identifiés ; les feuilles métier stockent leurs identifiants et l’application résout leurs libellés à la lecture.
