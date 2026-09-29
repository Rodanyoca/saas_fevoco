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

## Affiliations et licences

- **Affiliation** : relation historique datée entre un acteur et une affectation. L’athlète, le coach et le médecin sont affiliés directement à un club ; l’officiel est affilié à une entité FEVOCO.
- **Affiliation effectivement active** : affiliation au statut `SAF001` dont la date de début est atteinte et dont la date de fin est absente ou non dépassée à la date de référence.
- **Licence d’athlète** : autorisation saisonnière liée à une affiliation d’athlète existante. Son unicité métier est le couple athlète–saison.
- **Licence d’acteur** : autorisation périodique d’un coach, officiel, arbitre ou médecin. Celle d’un coach, officiel ou médecin conserve l’affiliation utilisée lors de sa délivrance.
- **Arbitre** : seul acteur licenciable sans affiliation. Sa `date_affiliation` est une information de profil et non une relation d’affiliation.
- **Numéro officiel de licence** : donnée administrative distincte de l’identifiant technique immuable de la licence.
