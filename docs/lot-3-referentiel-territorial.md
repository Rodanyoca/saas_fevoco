# Lot 3 — Référentiel territorial

## Périmètre et décision

Le lot couvre exclusivement la hiérarchie FEVOCO `Province → Ligue → Entente → Club`, ses identifiants, ses statuts et les référentiels utilisés par les clubs. Aucun niveau `ÉQUIPE` territorial, `STRUCTURE` ou `CERCLE` n’a été ajouté. L’équipe nationale reste un domaine séparé.

La règle retenue est celle du parent direct : une entente stocke `id_ligue`, un club stocke `id_entente`, et les parents indirects sont reconstruits en mémoire. Les identifiants existants restent stables lors d’un changement de rattachement.

## Écart constaté avant modification

L’interface lisait plusieurs colonnes qui n’existent pas dans les feuilles (`categorie`, `version`, `date_affiliation_club`, `nom_entente`, `pseudo_entente`, `id_ligue`, `nom_ligue`) alors que le classeur stocke des identifiants normalisés. Les mutations réécrivaient aussi des libellés et des ascendants indirects dans les lignes métier. Enfin, l’édition d’une entente ou d’un club pouvait recalculer son identifiant à partir de son nouveau parent.

Le référentiel réel utilise :

- `PROVINCES` pour le rattachement des ligues ;
- `CATEGORIES_CLUB` via `id_categorie_club` ;
- `ACTEURS_SEXE` via `id_sexe` ;
- les statuts `ACTIF` et `INACTIF` pour toute nouvelle écriture.

La feuille `VERSION_CLUB` contient des lignes sans identifiant et n’est pas la source utilisée par `CLUBS`. Elle a donc été écartée sans être modifiée. Aucun référentiel de niveau compétitif n’a été créé : les valeurs correspondantes sont toutes vides et aucune nomenclature autoritative n’a été trouvée.

## État des Google Sheets audités

Audit en lecture seule au moment du lot :

| Feuille | Lignes de données | Relation ou rôle |
|---|---:|---|
| `PROVINCES` | 26 | Référentiel `PROV001` à `PROV026` |
| `LIGUES` | 26 | `id_province` |
| `ENTENTES` | 25 | `id_ligue`, `id_ville` facultatif |
| `CLUBS` | 76 | `id_entente`, `id_categorie_club`, `id_sexe` |
| `CATEGORIES_CLUB` | 4 | Catégories identifiées |
| `ACTEURS_SEXE` | 4 | Sexes identifiés |

`PROVINCES` existait déjà avec la structure attendue (`id_province`, `nom_province`, `statut`, `observations`) lorsqu’une création protégée a été envisagée. La feuille a été conservée telle quelle. Aucune feuille Google Sheets n’a été créée, renommée ou réécrite durant ce lot.

## Anomalies préservées

Les anomalies suivantes ont été documentées mais non corrigées, faute de valeur autoritative :

- 25 statuts de ligue, 25 statuts d’entente et 76 statuts de club sont vides ;
- 11 clubs ont une catégorie et un sexe renseignés ; les autres références sont vides ;
- 11 lignes de club n’ont ni `id_club` ni `id_entente` ;
- 20 codes de club sont vides ou valent `N/A` ;
- `0401N/A` apparaît deux fois, `0701N/A` deux fois et `0201N/A` trois fois ;
- aucun `id_entente` non vide ne pointe vers une entente inconnue ;
- aucun conflit n’a été trouvé entre `id_ligue_historique` et la ligue déduite de l’entente.

Les lignes sans identifiant ne sont pas exposées comme entités modifiables par l’application, mais elles restent intactes dans la feuille.

## Adaptations réalisées

- Lecture groupée des trois feuilles territoriales et des trois référentiels avec `spreadsheets.values.batchGet`, cache court et résolution des libellés en mémoire.
- Mappage sur les en-têtes réels des feuilles, y compris les métadonnées de ligue, d’entente et de club.
- Écritures limitées aux colonnes existantes et aux parents directs.
- Conservation de l’identifiant lors de l’édition d’une entente ou d’un club.
- Sélecteurs de catégorie et de sexe fondés sur les identifiants de référence ; les libellés ne sont plus enregistrés comme clés.
- Remplacement du libellé d’interface ambigu « Version » par « Sexe » dans le domaine club.
- Normalisation des nouveaux statuts vers `ACTIF` ou `INACTIF`, sans remplissage automatique des cellules historiques vides.
- Formalisation du vocabulaire métier dans `CONTEXT.md`.

## Contrôles

- `npm run lint` : réussi.
- `npm run build` : réussi, 13 pages statiques générées et routes dynamiques compilées.
- Audit d’intégrité des relations Google Sheets : réussi pour tous les parents directs non vides.
- Vérification fonctionnelle des écritures : réalisée par inspection du contrat des routes et des en-têtes ; aucune écriture de test n’a été envoyée aux données de production.

## Risques restant ouverts

- Les doublons d’identifiants empêchent de garantir quelle ligne serait ciblée par une modification ; ils doivent être arbitrés avant toute correction en masse.
- Les lignes sans identifiant ne peuvent pas être adressées de façon sûre par l’API.
- Les statuts historiques vides demeurent indéterminés.
- Les référentiels `VILLES` et de niveau compétitif ne doivent être activés qu’après validation d’une source métier complète.

Le lot 3 s’arrête ici. Le lot 4 n’est pas engagé.
