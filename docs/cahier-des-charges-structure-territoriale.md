# Cahier des charges — Bloc Structure territoriale FEVOCO

## 1. Objet

Le bloc **Structure territoriale** permet de consulter et d’administrer l’organisation territoriale de la Fédération de Volley-ball du Congo (FEVOCO), depuis les ligues provinciales jusqu’aux clubs affiliés.

Il doit respecter le modèle métier FEVOCO, tout en reprenant les principes d’interface du référentiel FEBACO : listes sobres, tableaux filtrables, formulaires en volets latéraux, fiches détaillées et mise en évidence or.

## 2. Périmètre fonctionnel

Le bloc couvre les trois modules suivants :

1. **Ligues** — route `/ligues` ;
2. **Ententes** — route `/ententes` ;
3. **Clubs** — route `/clubs`.

La hiérarchie fonctionnelle est :

```text
Province
└── Ligue
    └── Entente
        └── Club
            └── Athlète
```

Il n’existe pas d’équipe territoriale intermédiaire entre le club et l’athlète. Les équipes nationales relèvent d’un autre bloc fonctionnel.

## 3. Hors périmètre

Le présent bloc ne couvre pas :

- la gestion des utilisateurs, rôles ou autorisations ;
- l’authentification ;
- les équipes nationales ;
- les compétitions ;
- les transferts, affiliations et licences ;
- la suppression physique ou logique des structures ;
- la correction automatique des anomalies historiques du classeur ;
- la création de données fictives en cas d’indisponibilité de la source.

## 4. Principes généraux d’interface

### 4.1 Navigation

- Le groupe **Structure territoriale** contient les entrées Ligues, Ententes et Clubs.
- Le titre du groupe reste visuellement neutre.
- Seule l’entrée correspondant à la page active est mise en évidence en **or**.
- Depuis une fiche détaillée, un clic sur l’entrée active du menu ramène à la liste du module.
- Le header affiche toujours le titre de la page ou de la fiche actuellement visible.
- La navigation doit fonctionner sur ordinateur et dans le volet mobile.

### 4.2 Listes

Chaque liste doit proposer :

- un bouton d’ajout aligné à droite ;
- une recherche textuelle ;
- des filtres contextuels ;
- un tableau paginé sur ordinateur ;
- une présentation adaptée sur mobile ;
- un état vide explicite ;
- une indication non bloquante si une partie des relations n’a pas pu être chargée ;
- les actions **Consulter** et **Modifier** uniquement ;
- aucun KPI au-dessus du tableau.

### 4.3 Formulaires

- Les formulaires de création et de modification s’ouvrent dans un **volet latéral droit**.
- Le volet reste ouvert pendant l’enregistrement.
- Les boutons d’action et leurs survols utilisent la couleur or.
- Les champs obligatoires sont identifiés par un astérisque.
- Les erreurs fonctionnelles retournées par le serveur sont affichées dans le volet et par notification.
- Les identifiants calculés sont affichés en lecture seule lors d’une modification.

### 4.4 Fiches détaillées

- Le header prend le nom de la structure consultée.
- Un bouton permet de revenir à la liste.
- Une seule action principale **Modifier** est affichée, sous forme de bouton avec icône et libellé.
- Les icônes de mise en évidence sont dorées.
- Les relations sont calculées à partir des identifiants des parents directs, sans inventer de rattachement.

## 5. Module Ligues

### 5.1 Liste des ligues

Le tableau comporte les colonnes suivantes :

| Colonne | Contenu |
|---|---|
| ID | Identifiant de la ligue |
| Ligue | Nom officiel |
| Sigle | Sigle de la ligue |
| Province | Province de rattachement |
| Statut | Actif ou inactif |
| Actions | Consulter et modifier |

Les filtres disponibles sont la province et le statut.

### 5.2 Création et modification

Le formulaire contient :

- nom de la ligue — obligatoire ;
- province — obligatoire ;
- sigle ;
- téléphone ;
- adresse e-mail ;
- année de création ;
- date d’affiliation ;
- identifiant COC ;
- statut ;
- observations.

L’identifiant de ligue est généré côté serveur à la création, sur deux chiffres à partir du plus grand identifiant numérique existant. Il devient immuable.

### 5.3 Règles métier

- Une province sélectionnée doit exister dans le référentiel `PROVINCES`.
- Le nom d’une ligue doit être unique dans une même province.
- Une adresse e-mail renseignée doit être valide.
- Le statut enregistré doit être `ACTIF` ou `INACTIF`.
- Une modification de province ne modifie pas l’identifiant de la ligue.

### 5.4 Fiche Ligue

La fiche présente :

- les informations générales ;
- les responsables de la ligue ;
- le nombre d’ententes, de clubs et d’athlètes liés ;
- la liste des ententes liées ;
- la liste des clubs déduits des ententes ;
- la liste des athlètes rattachés à ces clubs.

Les responsables affichés sont le président et le secrétaire, avec leurs coordonnées lorsqu’elles existent dans les données lues. Aucun responsable fictif ne doit être créé.

## 6. Module Ententes

### 6.1 Liste des ententes

Le tableau comporte les colonnes suivantes :

| Colonne | Contenu |
|---|---|
| ID | Identifiant de l’entente |
| Entente | Nom officiel |
| Pseudo | Pseudo ou sigle de l’entente |
| Ligue | Ligue de rattachement |
| Statut | Actif ou inactif |
| Actions | Consulter et modifier |

L’adresse e-mail n’apparaît pas dans la liste. Les filtres disponibles sont la ligue et le statut.

### 6.2 Création et modification

Le formulaire contient :

- code de l’entente — obligatoire à la création et immuable ensuite ;
- ligue — obligatoire ;
- nom de l’entente — obligatoire ;
- pseudo ;
- adresse e-mail ;
- statut ;
- observations.

L’identifiant est construit à la création par concaténation de l’identifiant de la ligue et du code de l’entente.

### 6.3 Règles métier

- La ligue sélectionnée doit exister.
- L’identifiant calculé doit être unique.
- Le code doit être unique dans la ligue.
- Le nom doit être unique dans la ligue, sans distinction de casse.
- L’adresse e-mail renseignée doit être valide.
- Le statut enregistré doit être `ACTIF` ou `INACTIF`.
- Le changement de ligue ne recalcule pas l’identifiant d’une entente existante.

### 6.4 Fiche Entente

La fiche est organisée en deux sections :

1. **Informations générales** : identifiant, nom, pseudo, ligue, statut, dates disponibles ;
2. **Coordonnées et suivi** : téléphone, adresse e-mail, identifiant COC et observations.

Elle affiche également le nombre de clubs et d’athlètes liés, ainsi que le tableau des clubs de l’entente.

## 7. Module Clubs

### 7.1 Liste des clubs

Le tableau respecte l’ordre de colonnes suivant :

| Colonne | Contenu |
|---|---|
| ID | Identifiant du club |
| Logo | Logo ou initiales de remplacement |
| Club | Nom officiel |
| Catégorie | Libellé issu du référentiel |
| Entente | **Pseudo** de l’entente |
| Ligue | Nom de la ligue déduite de l’entente |
| Statut | Actif ou inactif |
| Actions | Consulter et modifier |

Les filtres disponibles sont la ligue, le pseudo de l’entente et le statut.

### 7.2 Création et modification

Le formulaire contient :

- code du club — obligatoire à la création et immuable ensuite ;
- entente — obligatoire, affichée par son pseudo lorsque celui-ci existe ;
- nom du club — obligatoire ;
- catégorie ;
- sexe ;
- date d’affiliation ;
- statut ;
- logo du club ;
- observations.

Le formulaire s’ouvre dans un volet latéral pour la création comme pour la modification.

### 7.3 Logo du club

- Le logo est un fichier JPEG, PNG ou WebP.
- La taille maximale est de 5 Mo.
- Le logo est téléversé dans Google Drive après l’enregistrement du club.
- Les colonnes `logo_drive_id` et `logo_drive_url` sont mises à jour dans `CLUBS`.
- En modification, le logo existant est prévisualisé.
- Un nouveau fichier remplace l’ancien logo ; l’ancien fichier est placé dans la corbeille Drive après réussite de la mise à jour.
- Si aucun logo n’est disponible, l’interface affiche les initiales du club.

### 7.4 Règles métier

- L’entente sélectionnée doit exister.
- L’identifiant est construit à la création par concaténation de l’identifiant de l’entente et du code du club.
- L’identifiant calculé doit être unique.
- Le code doit être unique dans l’entente.
- Le nom doit être unique dans l’entente, sans distinction de casse.
- La catégorie et le sexe doivent appartenir à leurs référentiels lorsqu’ils sont renseignés.
- La date d’affiliation doit respecter le format métier accepté.
- Le statut enregistré doit être `ACTIF` ou `INACTIF`.
- Le changement d’entente ne recalcule pas l’identifiant d’un club existant.

### 7.5 Fiche Club

La fiche présente :

- l’identité du club ;
- son rattachement territorial, avec le pseudo de l’entente ;
- les informations d’affiliation et de suivi ;
- les athlètes directement rattachés au club.

## 8. Données et persistance

### 8.1 Source de vérité

La source de vérité est le classeur Google Sheets territorial configuré par `FEVOCO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID`.

Les feuilles principales sont :

- `PROVINCES` ;
- `LIGUES` ;
- `ENTENTES` ;
- `CLUBS` ;
- `CATEGORIES_CLUB` ;
- `ACTEURS_SEXE`.

### 8.2 Relations enregistrées

- Une ligue enregistre uniquement son `id_province`.
- Une entente enregistre uniquement son `id_ligue`.
- Un club enregistre uniquement son `id_entente`.
- Les ascendants indirects et leurs libellés sont reconstruits à la lecture.
- Un athlète est rattaché directement à un club.

### 8.3 API applicative

| Ressource | Liste/création | Modification | Média |
|---|---|---|---|
| Ligues | `/api/ligues` | `/api/ligues/[id]` | — |
| Ententes | `/api/ententes` | `/api/ententes/[id]` | — |
| Clubs | `/api/clubs` | `/api/clubs/[id]` | `/api/clubs/[id]/logo` |
| Logos | — | — | `/api/club-logos/[fileId]` |

Les créations utilisent `POST`. Les modifications utilisent `PATCH`. Les erreurs fonctionnelles doivent être retournées sous forme de messages compréhensibles par l’utilisateur.

## 9. Gestion des états et anomalies

- Les valeurs historiques vides restent affichées comme non renseignées ; elles ne sont pas complétées automatiquement.
- Les relations indisponibles ne doivent jamais être remplacées par des données fictives.
- Les identifiants historiques dupliqués doivent rester visibles sans provoquer de collision de clés dans l’interface.
- Les lignes sans identifiant ne doivent pas être rendues modifiables tant qu’elles ne peuvent pas être ciblées sans ambiguïté.
- La modification d’une ligne possédant un identifiant dupliqué reste un risque de données à arbitrer avant toute correction en masse.

## 10. Exigences non fonctionnelles

### 10.1 Responsive

- Le tableau est visible à partir du format tablette/ordinateur.
- Une carte compacte remplace chaque ligne sur mobile.
- Les volets occupent toute la largeur utile sur petit écran et restent limités sur grand écran.

### 10.2 Accessibilité

- Chaque bouton avec icône possède un libellé accessible.
- Les champs sont associés à des libellés explicites.
- Les erreurs sont lisibles et ne reposent pas uniquement sur la couleur.
- La navigation au clavier et la fermeture des volets par Échap sont assurées par les primitives Radix.
- Les statuts doivent rester compréhensibles textuellement.

### 10.3 Robustesse

- Aucun écran ne doit planter si une relation secondaire est indisponible.
- Les écritures sont validées côté serveur, indépendamment des contrôles HTML.
- Un fichier logo invalide ou trop volumineux est refusé côté serveur.
- Les routes de lecture des logos vérifient que le fichier demandé appartient bien à un club connu.

## 11. Critères d’acceptation

Le bloc est accepté lorsque :

- les trois entrées de navigation ouvrent leurs listes respectives ;
- le header reflète la liste ou la fiche affichée ;
- les listes ne contiennent ni KPI supérieur ni colonne non demandée ;
- les recherches, filtres et paginations fonctionnent ;
- les formulaires de création et de modification s’ouvrent latéralement ;
- les règles d’unicité et de rattachement sont contrôlées côté serveur ;
- le pseudo de l’entente est affiché dans la liste et la fiche Club ;
- un logo de club valide peut être ajouté puis remplacé ;
- les fiches détaillées affichent uniquement les relations réellement déduites ;
- un clic sur l’entrée active du menu ramène d’une fiche à sa liste ;
- les vues ordinateur et mobile sont utilisables ;
- ESLint, TypeScript et le build Next.js terminent sans erreur ;
- aucune donnée fictive et aucune écriture de test en production ne sont introduites.

## 12. Points de vigilance avant mise en production

- Arbitrer les identifiants historiques dupliqués dans `CLUBS`, notamment les codes construits avec `N/A`.
- Valider fonctionnellement les créations et modifications sur un environnement de recette.
- Vérifier les variables OAuth Google Drive et le dossier dédié aux clubs ; à défaut, le dossier racine configuré est utilisé.
- Confirmer les formats de date attendus par les responsables métier.
- Vérifier que les colonnes de responsables de ligue et les coordonnées d’entente sont effectivement alimentées dans les sources.
- Réaliser une recette visuelle sur ordinateur, tablette et mobile.
