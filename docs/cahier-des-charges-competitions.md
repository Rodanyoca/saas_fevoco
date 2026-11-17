# Cahier des charges détaillé — Module Compétitions FEVOCO

Version : 1.0 — Date : 16 novembre 2026  
Périmètre : application FEVOCO, section Compétitions.  
Statut : spécification de travail fondée sur le code du dépôt ; arbitrages fédéraux et recette à valider.

## 1. Objet et portée du document

Ce document décrit le fonctionnement attendu du module Compétitions, les fonctions présentes dans le dépôt, les données utilisées, les contrôles métier, les contraintes de performance et les conditions de réception. Il sert de base à la validation métier, au développement et à la recette.

Les constats portent sur le code analysé. Ils ne certifient ni les en-têtes du classeur de production, ni la qualité de ses données, ni une conformité réglementaire FIVB. Les règles sportives calculées par l'application doivent être approuvées par FEVOCO pour chaque format de compétition concerné.

Les termes suivants distinguent explicitement les engagements :

| Mention | Sens |
| --- | --- |
| Existant | Comportement identifié dans le code actuel ; une recette reste nécessaire. |
| Exigence | Comportement demandé pour considérer le module conforme à ce cahier des charges. |
| Écart | Différence identifiée entre l'existant et une exigence. |
| À arbitrer | Décision métier ou technique indispensable avant mise en œuvre. |

Les exigences identifiées par `COMP-*`, les écarts `E-*` et les scénarios `REC-*` permettent de suivre la livraison. Ce document n'autorise aucune modification des applications de référence, des règles d'authentification ou des données de production.

## 2. Finalités métier

Le module doit permettre de préparer une édition, définir ses épreuves, engager les unités autorisées, organiser les phases et les groupes, programmer les rencontres, enregistrer les résultats par sets, calculer les classements, tracer les qualifications et archiver une compétition clôturée.

Il doit garantir :

- une identité unique et stable de chaque objet métier ;
- la cohérence des relations entre édition, épreuve, phase, groupe, unité et match ;
- l'utilisation exclusive des données FEVOCO et des référentiels effectivement disponibles ;
- des résultats et des classements reproductibles à partir de règles connues ;
- la protection des archives contre toute modification ;
- une utilisation fluide avec un nombre limité d'appels aux sources ;
- la conservation de la navigation et du bandeau supérieur en cas d'échec du chargement.

## 3. Périmètre fonctionnel

### 3.1 Fonctions comprises

1. Liste et consultation des éditions.
2. Création et modification des informations générales d'une édition ouverte.
3. Création et gestion des épreuves.
4. Définition des phases et des groupes.
5. Engagement des clubs et des paires.
6. Consultation des unités nationales saisonnières déjà représentées dans les données, sous réserve de cohérence des référentiels.
7. Affectation des personnes intervenant dans une compétition.
8. Programmation des matchs.
9. Saisie et contrôle des résultats.
10. Calcul et consultation des classements.
11. Qualification des unités vers une phase suivante.
12. Attribution de distinctions.
13. Contrôle de clôture et consultation historique.
14. États de chargement, d'absence de données, d'erreur et d'indisponibilité.

### 3.2 Fonctions exclues ou soumises à une demande distincte

- Modification de la connexion, des sessions, des utilisateurs, des rôles et des permissions.
- Création d'une entité territoriale permanente « Équipe ».
- Gestion des paiements, billetterie, retransmission, arbitrage vidéo ou chronométrage en direct.
- Génération automatique d'un calendrier complet, tirage au sort, optimisation des terrains et gestion des reports : non constatés comme livrés.
- Export homologué, feuille officielle signée, publication publique ou notifications : à spécifier séparément.
- Réouverture d'une compétition terminée et suppression définitive des données : non prévues par les routes analysées.
- Activation des rubriques générales Activités et Documents.

## 4. Modèle métier et vocabulaire

| Objet | Définition et règle |
| --- | --- |
| Compétition / édition | Organisation rattachée à une saison, avec identité, période, lieu et statut. |
| Épreuve | Déclinaison sportive d'une édition : discipline, catégorie d'âge et sexe. |
| Phase | Étape ordonnée d'une épreuve, définie par un type et un mode. |
| Groupe | Sous-ensemble d'une phase lorsque son mode autorise les groupes. |
| Participation | Inscription administrative d'une unité à une épreuve. |
| Unité engagée | Objet qui dispute les matchs : club, paire ou unité nationale saisonnière autorisée. |
| Affectation de phase | Lien entre une unité et une phase, avec groupe éventuel et origine de l'affectation. |
| Intervenant | Personne affectée à la compétition ou à une unité, avec type et rôle. |
| Match | Rencontre entre deux unités d'une même phase et, si nécessaire, d'un même groupe. |
| Résultat | Décision sportive du match, scores par sets et agrégats calculés. |
| Classement | Situation calculée d'une unité dans un groupe. |
| Qualification | Nouvelle affectation vers une phase ultérieure, avec traçabilité de la source. |
| Distinction | Récompense référencée attribuée à une unité ou à une personne admissible. |

**COMP-001 — Structure territoriale.** La seule hiérarchie territoriale est `Ligue → Entente → Club`. Les athlètes sont directement rattachés au club. Une unité engagée ne crée aucun niveau territorial supplémentaire.

**COMP-002 — Unités sportives.** En indoor, l'unité engagée est un club. En beach-volley, elle est une paire. Une sélection nationale doit correspondre à une activation saisonnière explicitement autorisée. Le mot « équipe » dans un libellé d'interface ne doit jamais entraîner la création d'une entité permanente `EQUIPE`.

**COMP-003 — Relations.** Une phase appartient à une épreuve ; un groupe appartient à une phase ; un match utilise des unités affectées à sa phase. Chaque relation doit être contrôlée côté serveur, même si les listes de choix de l'interface la restreignent déjà.

**COMP-004 — Identifiants.** Les identifiants sont générés côté serveur, préfixés `VOL-*`, uniques et non modifiables. Aucun identifiant, barème ou jeu de données basketball ne doit être importé.

### 4.1 Parcours nominal

`Édition → Épreuves → Engagements → Phases et groupes → Matchs → Résultats → Classements → Qualifications → Distinctions → Clôture`.

Une phase initiale doit exister avant l'engagement puisque l'inscription actuelle crée immédiatement une affectation initiale. Le parcours visuel peut regrouper les étapes, mais doit expliquer cette dépendance à l'opérateur.

## 5. Navigation et présentation

### 5.1 Routes et onglets existants

| Écran | Route / paramètre | Contenu |
| --- | --- | --- |
| Liste | `/competitions` | Éditions et accès à la création. |
| Détail | `/competitions/[id]` | Édition et neuf onglets. |
| Général | `tab=general` | Fiche générale et modification. |
| Épreuves | `tab=epreuves` | Déclinaisons sportives. |
| Phases | `tab=structure` | Phases et groupes. |
| Équipes | `tab=unites` | Unités engagées et inscription. |
| Participants | `tab=intervenants` | Personnes et rôles. |
| Matchs | `tab=matchs` | Rencontres programmées. |
| Résultats | `tab=resultats` | Saisie et consultation. |
| Classement | `tab=classements` | Classements et qualifications. |
| Distinctions | `tab=distinctions` | Attributions et historique. |

Un onglet inconnu retombe actuellement sur Général. Le nom technique `COMPETITIONS_PARTICIPANTS` désigne les inscriptions, tandis que l'onglet Participants désigne les personnes : cette différence doit être documentée et ne pas produire de confusion dans les formulaires.

### 5.2 Exigences d'interface

**COMP-005.** Respecter la structure et les composants harmonisés du projet : titres, espacements, tableaux, formulaires, boutons, états et accents dorés. Les adaptations métier doivent conserver l'identité FEVOCO.

**COMP-006.** Présenter les informations générales en fiche de synthèse ; présenter les collections dans des tableaux distincts avec leur propre titre. Ne pas fusionner des données de nature différente dans un tableau unique.

**COMP-007.** Sur petit écran, utiliser les adaptations existantes en cartes ou un défilement horizontal limité au tableau. La page entière ne doit pas déborder horizontalement.

**COMP-008.** Conserver l'onglet courant après une action réussie. Afficher un état d'enregistrement, empêcher le double clic et restituer les erreurs près des champs concernés sans effacer les valeurs saisies.

**COMP-009.** Différencier « aucune donnée », « filtre sans résultat », « chargement », « données partiellement indisponibles » et « service indisponible ». Une erreur ne doit pas être transformée en zéro statistique ou en liste vide présentée comme fiable.

**COMP-010.** Pendant une panne, la navigation et le bandeau supérieur restent visibles. Le menu affiché peut reprendre le dernier contexte autorisé confirmé selon le mécanisme de l'application ; cet affichage n'accorde aucun droit de mutation supplémentaire.

**COMP-011.** Les indicateurs de progression actuels sont des indications de présence de données. Ne pas les présenter comme une homologation ou une validation complète de l'étape.

**COMP-012.** Assurer la navigation clavier, les libellés explicites, le retour du focus après fermeture d'un dialogue et des statuts compréhensibles sans dépendre uniquement de la couleur.

## 6. Gestion des éditions

### 6.1 Données générales

| Champ | Obligation | Contrôle |
| --- | --- | --- |
| Identifiant | Automatique | Format serveur `VOL-COMP-AAAA-NNN`, immuable. |
| Numéro d'édition | Selon données | Règle d'unicité et caractère obligatoire à arbitrer. |
| Nom | Obligatoire | Valeur non vide après nettoyage. |
| Type de compétition | Obligatoire | Référence existante. |
| Discipline | Obligatoire | Référence existante. |
| Saison | Obligatoire | Référence existante ; sert au contexte de l'édition. |
| Date de début | Obligatoire | Date civile réelle. |
| Date de fin | Obligatoire | Supérieure ou égale à la date de début. |
| Pays | Obligatoire | Valeur requise par le validateur actuel. |
| Lieu | Facultatif actuellement | Texte descriptif ; ne remplace pas un modèle de terrains. |
| Statut | Contrôlé | `PLANIFIEE`, `EN_COURS`, `TERMINEE`, `ANNULEE`. |
| Observations | Facultatif | Texte conservé sans exécution de contenu. |

**COMP-013.** La création produit une édition ouverte. Il est interdit de créer directement une édition `TERMINEE` ou de lui affecter ce statut par la modification générale : la clôture dédiée est obligatoire.

**COMP-014.** Une modification de saison, de discipline ou de période avec des données dépendantes doit faire l'objet d'un contrôle d'impact. Le validateur général actuel ne démontre pas la couverture de tous ces impacts.

**COMP-015.** La génération des identifiants doit résister à deux créations simultanées. L'algorithme actuel recherche une séquence disponible dans les lignes lues ; cela ne constitue pas une garantie d'unicité distribuée.

### 6.2 Cycle de vie

| Situation | Existant | Exigence / décision |
| --- | --- | --- |
| `PLANIFIEE` | Statut accepté. | Édition en préparation ; conditions de démarrage à préciser. |
| `EN_COURS` | Statut accepté. | Opérations sportives permises selon droits existants. |
| `ANNULEE` | Statut accepté ; pas de verrou global équivalent à `TERMINEE` démontré. | Définir les opérations encore autorisées et les conditions d'annulation. |
| `TERMINEE` | Verrou métier présent dans les mutations analysées. | Lecture seule dans toutes les interfaces et toutes les mutations serveur. |
| Nouvelle clôture d'une édition terminée | Réponse idempotente prévue. | Aucun nouvel effet sur les données. |
| Réouverture | Pas de route dédiée constatée. | Interdite tant qu'une procédure n'est pas spécifiée et autorisée. |

La matrice complète des transitions autres que la clôture doit être approuvée avant de rendre ces transitions plus permissives ou plus restrictives.

## 7. Épreuves

**COMP-016.** Une épreuve contient un nom, une discipline, une catégorie d'âge et un sexe issus des référentiels, ainsi qu'un statut et des observations.

**COMP-017.** L'édition doit exister et être ouverte. Les références doivent exister ; aucune valeur libre ne remplace un identifiant référencé.

Les codes de discipline reconnus par la création actuelle sont `DISC061` pour l'indoor, `DISC009` pour le beach-volley et `DISC099` pour Autre. L'acceptation d'Autre à la création ne signifie pas qu'un calcul sportif automatique est disponible.

**COMP-018.** La modification actuelle porte sur le nom, le statut `ACTIF/INACTIF` et les observations. Un changement de catégorie, sexe ou discipline après engagement exige une procédure distincte de contrôle des dépendances.

**COMP-019.** La désactivation doit préserver les historiques. Les nouvelles opérations utilisant une épreuve inactive doivent être refusées lorsque son activité est requise.

À arbitrer : unicité d'une combinaison discipline/catégorie/sexe, doublons de noms, limites d'âge et date de référence pour déterminer l'éligibilité d'un athlète.

## 8. Phases et groupes

### 8.1 Création d'une phase

| Champ | Contrôle |
| --- | --- |
| Épreuve | Appartient à l'édition et est active. |
| Type de phase | Référence existante dans `TYPES_PHASES`. |
| Mode | Référence existante dans `MODES_PHASES`. |
| Numéro | Entier strictement positif. |
| Nom | Obligatoire. |
| Statut | Actif à la création. |
| Observations | Facultatives. |

**COMP-020.** L'ordre des phases doit permettre les qualifications vers une phase ultérieure. L'unicité des numéros par épreuve et les règles de renumérotation sont à définir ; leur couverture n'est pas démontrée par les contrôles actuels.

### 8.2 Création d'un groupe

**COMP-021.** Le groupe doit appartenir à une phase active utilisant le mode groupes, actuellement `MPH001`. Son nom est obligatoire. La création dans un autre mode doit être refusée.

**COMP-022.** Les sélecteurs d'engagement, de match et de qualification doivent proposer uniquement les groupes compatibles avec la phase sélectionnée. Une phase sans groupes ne doit recevoir aucun identifiant de groupe.

**COMP-023.** Les tableaux doivent distinguer les phases, leurs groupes, les unités affectées et les qualifications entrantes. Aucun lien historique ne doit être supprimé pour simplifier l'affichage.

## 9. Engagements et unités

### 9.1 Engagement d'un club

**COMP-024.** Sélectionner une épreuve et une phase actives compatibles, un club actif, un groupe si nécessaire et une date d'inscription valide.

**COMP-025.** Dans le formulaire de nouvel engagement, masquer les clubs d?j? engag?s et non inactifs dans l??preuve s?lectionn?e. Actualiser la liste lors du changement d??preuve et apr?s un enregistrement r?ussi, sans requ?te Sheets suppl?mentaire. En beach-volley, conserver les clubs disponibles pour permettre plusieurs paires distinctes.

Refuser un deuxième engagement actif du même club dans la même épreuve selon la règle actuelle. Toute règle autorisant plusieurs représentations d'un club doit faire l'objet d'un modèle approuvé, sans création d'une équipe territoriale.

La liste historique peut afficher les clubs inactifs déjà enregistrés ; la sélection pour un nouvel engagement doit utiliser les clubs admissibles. La normalisation des statuts des sources doit être vérifiée sur les données réelles.

### 9.2 Engagement d'une paire

**COMP-026.** Pour le beach-volley, sélectionner exactement deux athlètes actifs et distincts. Refuser la même paire déjà engagée dans l'épreuve, quel que soit l'ordre des deux membres.

**COMP-027.** Contrôler la compatibilité du sexe avec l'épreuve, en tenant compte du cas mixte référencé. Une donnée de sexe absente ne doit pas être assimilée à une preuve d'éligibilité ; la politique de rejet ou de contrôle manuel reste à approuver.

**COMP-028.** Les membres d'une paire ne se modifient pas indirectement depuis le formulaire général des intervenants. Un troisième membre doit être refusé.

À arbitrer : participation d'un athlète à plusieurs paires de la même épreuve, remplacement d'un membre, représentation de deux clubs différents et règles de surclassement.

### 9.3 Écritures associées

Une inscription actuelle crée, dans un lot d'écriture :

1. une ligne dans `COMPETITIONS_PARTICIPANTS` ;
2. une ligne dans `COMPETITIONS_UNITES` ;
3. une affectation initiale `TAP001` dans `COMPETITIONS_PHASES_UNITES` ;
4. pour une paire, deux lignes d'athlètes dans `COMPETITIONS_INTERVENANTS`.

**COMP-029.** Ces enregistrements doivent rester cohérents en cas de réessai ou d'erreur partielle. Un envoi groupé à Sheets ne doit pas être présenté comme une transaction métier garantissant à lui seul toutes les contraintes concurrentes.

### 9.4 Modification d'une unité

**COMP-030.** Conserver les identifiants de participation, d'unité et d'affectation. Contrôler simultanément les trois objets liés.

**COMP-031.** Bloquer les modifications structurelles lorsqu'il existe des dépendances incompatibles : match, affectation supplémentaire, classement, distinction ou intervenant. Le formulaire doit expliquer le blocage.

**COMP-032.** La date d'inscription ne peut devenir postérieure à un match déjà associé. La réactivation exige de vérifier de nouveau les références et l'activité de l'épreuve, de la phase et du club.

**COMP-033.** Une unité nationale saisonnière ne doit pas être transformée en club. La création complète de ces unités n'est pas démontrée par le formulaire d'engagement analysé et reste un chantier distinct.

## 10. Personnes et rôles

### 10.1 Sources et sélection

Le chargement des personnes exploite les athlètes, entraîneurs, arbitres, officiels et médecins, leurs familles de licences et, lorsque le référentiel le déclare, les autres acteurs. Les affiliations des athlètes servent à déterminer les clubs admissibles dans le contexte de la compétition.

**COMP-034.** Affecter une personne par son identifiant réel et son type référencé. Le rôle est obligatoire. L'unité associée, si nécessaire, appartient à la compétition.

**COMP-035.** Refuser les doublons actifs de personne/type/unité selon la règle du module. Préserver les affectations inactives pour l'historique.

**COMP-036.** Un athlète engagé avec un club doit être compatible avec son rattachement métier applicable. Le module ne doit pas inventer une affiliation ou modifier le club de l'acteur pour accepter l'inscription.

**COMP-037.** Une personne ou un type historique introuvable reste visible avec un identifiant explicite. La modification doit être bloquée lorsque les références indispensables ne peuvent être résolues.

### 10.2 Licences

L'existant présente une indication de licence et confronte sa période au contexte de la compétition. Les états observés comprennent `VALIDE`, `À VÉRIFIER` et `NON RENSEIGNÉE`.

**COMP-038.** Distinguer information de licence et autorisation de participation. Dans l'existant analysé, une licence absente, inactive ou à vérifier n'est pas un blocage systématique de l'affectation.

La fédération doit décider : catégories soumises à licence obligatoire, statut accepté, date de référence, couverture de toute la compétition ou du seul match, cas de renouvellement, contrôle médical et dérogations. Aucun de ces arbitrages ne doit être remplacé par une règle implicite.

### 10.3 Interface

**COMP-039.** Afficher des listes par type de personne avec recherche et pagination. Le sélecteur de recherche limite actuellement les candidats affichés ; il doit permettre de retrouver une personne sans charger ou rendre inutilement l'ensemble du référentiel dans chaque ligne.

## 11. Programmation des matchs

**COMP-040.** Un match associe deux unités différentes, actives et affectées à la même phase active.

**COMP-041.** En mode groupes, les deux unités doivent appartenir au même groupe actif de la phase. Dans les autres modes, le groupe doit être vide.

**COMP-042.** La date est validée selon les règles centralisées. L'heure utilise `HH:MM`, de `00:00` à `23:59`.

**COMP-043.** Le module actuel refuse une confrontation non annulée déjà existante entre les deux unités dans la même phase et le même groupe, indépendamment de l'ordre A/B. Un format aller-retour exige une évolution explicite de cette clé métier.

**COMP-044.** Un nouveau match reçoit un identifiant serveur et le statut `PROGRAMME`. Les noms des unités sont résolus à la lecture.

Exigences complémentaires à implémenter après arbitrage : limites de dates de l'édition, chevauchement des matchs d'une unité, délai de récupération, terrains, sites, officiels affectés et procédure de report. Le modèle de match actuellement analysé ne comporte pas de terrain dédié ; ne pas prétendre que ces contrôles sont livrés.

## 12. Résultats et calcul des scores

### 12.1 Contrat de saisie

**COMP-045.** Un résultat appartient à un match de l'édition. L'édition est ouverte. Un deuxième résultat pour le même match est refusé par la création actuelle.

**COMP-046.** Le statut du résultat provient du référentiel. Pour un résultat normal, les scores sont des entiers non négatifs, saisis par paires A/B sans trou entre les sets.

**COMP-047.** Le vainqueur, le nombre de sets gagnés et les totaux de points sont calculés côté serveur à partir des sets. L'interface ne constitue jamais une source fiable de ces agrégats.

### 12.2 Paramètres du calcul actuel

| Paramètre | Indoor `DISC061` | Beach-volley `DISC009` |
| --- | --- | --- |
| Sets gagnants | 3 | 2 |
| Maximum de sets | 5 | 3 |
| Seuil ordinaire | 25 points | 21 points |
| Set décisif | Cinquième, 15 points | Troisième, 15 points |
| Écart minimal | 2 points | 2 points |
| Types de résultat calculés | `TRV001` : 3–0 ; `TRV002` : 3–1 ; `TRV003` : 3–2 | `TRV004` : 2–0 ; `TRV005` : 2–1 |

Ces valeurs décrivent le moteur actuel et doivent être validées pour le règlement FEVOCO de l'épreuve. Les formats aménagés ne doivent pas être forcés dans ce moteur.

**COMP-048.** Refuser un set à égalité, un score inférieur au seuil de victoire, une marge insuffisante, un match inachevé et tout set joué après la victoire finale.

**COMP-049.** Vérifier également qu'un set s'arrête au premier score qui remplit la condition de victoire. Le validateur actuel vérifie le minimum et la marge, mais ne démontre pas ce contrôle complet : par exemple, un score de 30–0 ne doit pas être accepté dans un set ordinaire à 25 points selon cette exigence.

**COMP-050.** Refuser le calcul automatique normal pour une discipline non prise en charge. L'acceptation d'une épreuve `DISC099` ne justifie aucun calcul par défaut.

### 12.3 Résultats particuliers

**COMP-051.** Les cas forfait, abandon, annulation et autres décisions doivent utiliser les statuts réellement présents dans le référentiel. Le statut `STR099` exige actuellement des observations. Un vainqueur indiqué doit être une des deux unités du match.

Les points de classement, scores administratifs et conséquences de chaque statut particulier sont à approuver. Le moteur de classement actuel ne traite automatiquement que les résultats normaux `STR001`.

### 12.4 Cohérence et rectification

Après création du résultat, le code tente de mettre le match à `ANNULE` pour `STR005`, sinon à `TERMINE`. Cette mise à jour est séparée de la création ; une erreur peut laisser un résultat enregistré avec un statut de match non synchronisé.

**COMP-052.** Prévoir une écriture cohérente ou une reprise détectable, sans doublon et sans annoncer à tort que toutes les opérations ont réussi.

**COMP-053.** Une correction de résultat doit définir les droits existants applicables, la justification, l'historique et l'impact sur classements et qualifications. Aucune route dédiée de correction n'a été constatée : cette procédure constitue une exigence à réaliser, pas une fonction livrée.

## 13. Classements

### 13.1 Périmètre du recalcul

**COMP-054.** Le recalcul actuel concerne une phase active en mode groupes et un groupe actif. Les unités proviennent des affectations actives de ce groupe, les résultats des matchs de ce périmètre.

**COMP-055.** Le barème provient des champs `points_classement_vainqueur` et `points_classement_perdant` des types de résultats. Ne pas substituer un barème universel codé en dur.

### 13.2 Indicateurs

| Indicateur | Définition |
| --- | --- |
| Matchs joués | Rencontres prises en compte par le moteur. |
| Victoires / défaites | Déterminées à partir du vainqueur du résultat. |
| Sets gagnés / perdus | Somme des sets par unité. |
| Différence de sets | Sets gagnés moins sets perdus. |
| Points pour / contre | Somme des points des sets. |
| Différence de points | Points pour moins points contre. |
| Ratio de sets | Sets gagnés divisés par sets perdus, avec convention de dénominateur nul. |
| Ratio de points | Points pour divisés par points contre, avec convention de dénominateur nul. |
| Points de classement | Barème du référentiel appliqué aux résultats pris en compte. |
| Rang | Ordre issu des critères de départage. |

### 13.3 Départage actuel et arbitrage

Le tri actuel applique successivement : victoires décroissantes, points de classement décroissants, ratio de sets décroissant, ratio de points décroissant puis identifiant d'unité comme dernier ordre technique. Lorsque le dénominateur est nul, le moteur retourne actuellement le numérateur pour le ratio.

**COMP-056.** FEVOCO doit approuver l'ordre des critères, le traitement des dénominateurs nuls et le départage final. L'ordre technique par identifiant ne doit pas être présenté comme un départage sportif homologué. Le face-à-face n'est pas démontré comme critère actuel.

**COMP-057.** Un résultat modifié ou une affectation devenue incohérente doit rendre visible la nécessité d'un recalcul. Une consultation ne doit pas réécrire silencieusement les classements.

**COMP-058.** Le recalcul doit gérer les anciennes lignes devenues hors périmètre, éviter les doublons et produire un résultat reproductible. L'existant effectue des mises à jour ligne par ligne et ne démontre pas le retrait explicite de toutes les lignes obsolètes.

## 14. Qualifications

**COMP-059.** La phase source et la phase cible appartiennent à la même épreuve. La cible est active et son numéro est supérieur à celui de la source.

**COMP-060.** L'unité est active dans la phase source. Elle ne doit pas être déjà affectée activement à la cible, même dans un autre groupe.

**COMP-061.** Le groupe cible est obligatoire ou interdit selon le mode de la phase cible. La date d'affectation respecte les règles de date.

**COMP-062.** Si un match source est fourni, il appartient à la phase source et son résultat désigne l'unité qualifiée comme vainqueur.

**COMP-063.** Écrire une nouvelle ligne `TAP002` dans `COMPETITIONS_PHASES_UNITES`, avec phase source et match source éventuel. Ne jamais créer une nouvelle inscription administrative pour simuler la qualification.

Sans match source, le code permet une qualification opérateur sans démontrer un contrôle obligatoire du rang qualificatif. Le nombre de qualifiés, les meilleurs troisièmes, exemptions et repêchages doivent être définis avant toute automatisation.

**COMP-064.** Une qualification inactive ou dont la source n'est plus cohérente reste traçable et porte un avertissement. Ne pas requalifier automatiquement une autre unité après correction d'un résultat.

## 15. Distinctions

**COMP-065.** Sélectionner un type de distinction actif et respecter sa cible autorisée : unité, athlète, entraîneur ou autre acteur selon le référentiel.

**COMP-066.** Exiger un bénéficiaire réel. Les épreuves, phases et matchs facultatifs doivent appartenir au même contexte et être compatibles entre eux.

**COMP-067.** Pour une cible athlète ou entraîneur, vérifier le type de la personne. Un libellé ressemblant à un type métier ne doit pas remplacer durablement un identifiant de type contrôlé.

**COMP-068.** Refuser un doublon actif exact de type, bénéficiaire et contexte. Pour le type Autre `DST099`, imposer des observations.

**COMP-069.** La modification actuelle porte sur le statut et les observations ; elle ne change pas librement le bénéficiaire. La date d'attribution est canonique côté stockage.

À arbitrer : portée de `UNITE_OU_ACTEUR` lorsqu'une unité et une personne sont toutes deux renseignées, distinctions multiples d'un même type et validation officielle des palmarès.

## 16. Clôture et archives

### 16.1 Contrôles actuellement identifiés

- présence d'au moins une épreuve ;
- cohérence de rattachement des phases et des groupes ;
- absence de match déclaré terminé sans résultat ;
- présence de groupes actifs pour une phase active en mode groupes ;
- présence d'un classement pour les unités actives affectées aux groupes concernés.

Un échec renvoie un conflit et des anomalies détaillées. Une réussite affecte `TERMINEE` à l'édition.

### 16.2 Exigences de clôture cible

**COMP-070.** Afficher les anomalies avant confirmation et permettre d'accéder à leur contexte. La confirmation doit porter sur une édition identifiée et sur des données revalidées côté serveur.

**COMP-071.** Définir explicitement si tous les matchs doivent être terminés ou annulés, si un vainqueur final est obligatoire, si les classements doivent être à jour et si les qualifications doivent être entièrement résolues. Ces garanties ne découlent pas des seuls contrôles actuels.

**COMP-072.** Une fois terminée, l'édition est en lecture seule pour les informations générales, épreuves, engagements, personnes, phases, groupes, matchs, résultats, classements, qualifications et distinctions. Masquer les commandes dans l'interface et rejeter les appels directs aux mutations.

**COMP-073.** Recontrôler l'état terminal au moment effectif d'une écriture afin de traiter le cas où un opérateur clôture pendant qu'un autre a encore un formulaire ouvert.

**COMP-074.** Préserver les références et les données historiques nécessaires à la compréhension de l'édition ; une référence devenue inactive ne doit pas faire disparaître un résultat ancien.

## 17. Dates : contrat obligatoire

**COMP-075.** Chaque champ de date créé ou modifié utilise une saisie texte, `inputMode="numeric"`, `maxLength={10}` et le placeholder `JJMMAAAA`.

À chaque frappe : supprimer les caractères non numériques, conserver au maximum huit chiffres et afficher progressivement `JJ/MM/AAAA`. La valeur contrôlée et envoyée est `JJ/MM/AAAA`. Le motif HTML est `[0-9]{2}/[0-9]{2}/[0-9]{4}`.

**COMP-076.** Réutiliser exclusivement les fonctions de `lib/compact-date.ts` : `sanitizeDateInput`, `formatCompactDateInput`, `parseCompactDate`, `formatDateForSheet` et `formatDateForDisplay`, selon leur rôle. Ne pas dupliquer une logique de dates dans chaque composant.

**COMP-077.** Le serveur revalide la complétude, la date civile, les années bissextiles et les contraintes chronologiques. Une validation HTML ou JavaScript du navigateur ne suffit pas.

**COMP-078.** Toute nouvelle écriture Sheets utilise `YYYY-MM-DD`, une absence reste `""` et le format de cellule est `yyyy-mm-dd`. Les formats anciens sont seulement des alias de lecture.

La recette doit vérifier la saisie progressive, le collage avec séparateurs, le rejet d'une date impossible et la valeur réellement persistée. Les dates concernées incluent la période d'édition, l'inscription, le match, l'affectation et l'attribution d'une distinction.

## 18. Données Google Sheets

### 18.1 Feuilles métier chargées

Le chargeur actuel connaît les treize feuilles suivantes. Les colonnes ci-dessous décrivent les clés utilisées par les services analysés ; elles ne remplacent pas un relevé exhaustif et validé des en-têtes du classeur réel.

| Feuille | Identité et champs principaux |
| --- | --- |
| `COMPETITIONS` | `id_competition`, `numero_edition`, `nom_competition`, `id_type_competition`, `id_discipline`, `id_saison`, `date_debut`, `date_fin`, `pays`, `lieu`, `statut`, `observations`. |
| `COMPETITIONS_EPREUVES` | `id_epreuve_competition`, édition, nom, discipline, catégorie d'âge, sexe, statut, observations. |
| `COMPETITIONS_PHASES` | `id_phase_competition`, édition/épreuve, type, mode, numéro, nom, statut, observations. |
| `COMPETITIONS_GROUPES` | `id_groupe`, phase, nom, statut, observations. |
| `COMPETITIONS_PARTICIPANTS` | `id_participation`, édition, épreuve, type d'unité, club, `date_inscription`, `statut_participation`, observations. |
| `COMPETITIONS_UNITES` | `id_unite_competition`, édition, épreuve, type d'unité, club, `id_equipe_nationale_saison`, participation, statut, observations. |
| `COMPETITIONS_PHASES_UNITES` | `id_phase_unite`, phase, groupe, unité, `id_type_affectation_phase`, `id_phase_source`, `id_match_source`, `date_affectation`, statut, observations. |
| `COMPETITIONS_GROUPES_UNITES` | Anciennes affectations : lecture historique uniquement. |
| `COMPETITIONS_INTERVENANTS` | `id_intervenant_competition`, édition, `type_participant`, type d'acteur, acteur, unité, fonction, club, rôle, statut, observations. |
| `COMPETITIONS_MATCHS` | `id_match`, édition, phase, groupe, unités A/B, `date_match`, `heure_match`, `statut_match`, observations. |
| `COMPETITIONS_RESULTATS` | `id_resultat`, match, statut/type de résultat, vainqueur, sets gagnés A/B, points totaux A/B, `set_1_a` à `set_5_b`, observations. |
| `COMPETITIONS_CLASSEMENT` | `id_classement`, édition/phase/groupe/unité, matchs, victoires, défaites, sets, points, différences, ratios, points de classement, rang, observations. |
| `COMPETITIONS_DISTINCTIONS` | Identité, édition, type, bénéficiaires, contexte épreuve/phase/match, date, statut, observations. |

### 18.2 Référentiels chargés

`TYPES_COMPETITIONS`, `DISCIPLINES`, `SAISON`, `CATEGORIES_AGE`, `SEXES`, `TYPES_ACTEURS`, `TYPES_PHASES`, `MODES_PHASES`, `TYPES_UNITES_COMPETITION`, `TYPES_AFFECTATIONS_PHASES`, `STATUTS_RESULTATS`, `TYPES_RESULTATS`, `TYPES_DISTINCTIONS`.

Les clubs, personnes, affiliations et licences sont chargés par leurs services métier. Leur présence dans le modèle ne signifie pas qu'ils doivent être rechargés pour chaque onglet.

### 18.3 Exigences d'intégrité

**COMP-079.** Mapper exclusivement par noms d'en-têtes. Vérifier les en-têtes réels et le référentiel avant tout nouveau mapper ou formulaire. Une colonne déplacée ne doit pas changer la signification d'une donnée.

**COMP-080.** Ne pas dupliquer dans les feuilles métier les libellés disponibles par identifiant. Résoudre les noms à la lecture et afficher un remplacement explicite lorsqu'une référence manque.

**COMP-081.** Écrire toute nouvelle affectation dans `COMPETITIONS_PHASES_UNITES`. Ne pas alimenter `COMPETITIONS_GROUPES_UNITES` ; toute reprise historique doit être contrôlée et traçable.

**COMP-082.** Vérifier les clés étrangères, les doublons et les références inactives. Aucune donnée fictive ne doit être insérée pour rendre une interface utilisable.

Le lecteur générique de certains référentiels infère actuellement des colonnes `id_*` et `nom_*`. Cette heuristique doit être confrontée aux en-têtes réels et remplacée par un contrat explicite là où plusieurs colonnes seraient ambiguës.

## 19. Contrats des API existantes

Les chemins ci-dessous sont relatifs à `/api/competitions`. Les contrôles d'accès existants de l'application restent applicables. Cette liste décrit les méthodes métier constatées et ne constitue pas une certification autonome de leur sécurité.

| Chemin | Méthode | Opération |
| --- | --- | --- |
| `/` | GET | Charger le bundle de compétitions. |
| `/` | POST | Créer une édition. |
| `/[id]` | GET | Lire une édition. |
| `/[id]` | PATCH | Modifier les informations générales d'une édition ouverte. |
| `/[id]/epreuves` | POST | Créer une épreuve. |
| `/[id]/epreuves/[eventId]` | PATCH | Modifier nom, statut et observations. |
| `/[id]/structure` | POST | `kind="group"` : groupe ; autre valeur actuellement : phase. |
| `/[id]/participants` | POST | Créer un engagement, son unité et son affectation initiale. |
| `/[id]/unites/[unitId]` | PATCH | Modifier un engagement selon les dépendances. |
| `/[id]/people` | À vérifier dans le module de route | Gestion des personnes ; ne pas déduire une méthode de la seule existence du fichier. |
| `/[id]/play` | POST | Programmer un match. |
| `/[id]/results` | POST | Créer un résultat. |
| `/[id]/standings` | POST | `action="qualify"` : qualifier ; autre valeur actuellement : recalculer. |
| `/[id]/distinctions` | POST | Créer une distinction. |
| `/[id]/distinctions/[distinctionId]` | PATCH | Modifier statut et observations. |
| `/[id]/close` | POST | Contrôler puis clôturer. |

**COMP-083.** Les discriminateurs `kind` et `action` doivent être validés explicitement. Une valeur inconnue ne devrait pas provoquer par défaut une autre mutation.

**COMP-084.** Les contrats cibles documentent les champs requis, types, valeurs autorisées et erreurs par champ. Les erreurs métier utilisent un message compréhensible et, lorsque pertinent, un objet `fields`.

| Code | Utilisation attendue |
| --- | --- |
| 200 | Lecture ou modification réussie selon l'opération. |
| 201 | Création réussie selon les routes concernées. |
| 400 | Entrée invalide ou référence non admissible. |
| 401 / 403 | Refus par le dispositif d'accès existant, selon son contrat. |
| 404 | Édition ou objet absent du périmètre demandé. |
| 409 | Édition clôturée, doublon ou dépendance incompatible. |
| 503 | Source ou service indisponible ; message utilisateur sans secret technique. |

L'uniformisation complète de ces codes reste à vérifier route par route. Une erreur technique ne doit exposer ni jeton, ni configuration, ni contenu confidentiel du classeur.

## 20. Performance, appels et consommation CPU

### 20.1 Contraintes

**COMP-085.** Lire les feuilles par lots et filtrer en mémoire. Interdire une lecture Sheets par carte, ligne, match, unité ou libellé.

**COMP-086.** Construire des index réutilisables par identifiant pour les relations fréquemment consultées. Éviter de rechercher dans toutes les lignes à chaque cellule ou à chaque rendu.

**COMP-087.** Charger les personnes et licences uniquement lorsque l'onglet ou l'action les exige. Éviter de charger les options d'engagement pour un onglet qui ne les utilise pas.

**COMP-088.** Utiliser une politique explicite de cache et d'invalidation : portée de la donnée, durée, fraîcheur nécessaire avant mutation et invalidation après succès. Une donnée en cache ne doit pas autoriser une écriture sur une édition clôturée depuis sa lecture.

**COMP-089.** Regrouper les écritures de classement au lieu d'une requête par unité. Éviter un rechargement intégral des référentiels après chaque petite mutation lorsque des invalidations ciblées sont possibles.

**COMP-090.** Ne pas utiliser de polling permanent sans besoin démontré. Les recherches, tris et paginations locales ne déclenchent pas d'écriture ni de lecture Sheets supplémentaire.

### 20.2 Mesures à produire avant et après optimisation

| Mesure | Protocole de réception |
| --- | --- |
| Appels Sheets | Compter les requêtes réseau réelles, distinguer lecture groupée, feuilles et appels de services. |
| Temps serveur | Mesurer médiane et percentile 95 sur un jeu réel autorisé, à cache froid puis chaud. |
| CPU serveur | Comparer temps de calcul et profil des fonctions de filtrage/calcul. |
| CPU navigateur | Profiler chargement, recherche, changement d'onglet et ouverture d'un formulaire. |
| Volume | Relever lignes, taille transférée, nombre de matchs et unités ; conserver le même périmètre entre mesures. |
| Écritures | Vérifier qu'un recalcul ne produit pas une croissance du nombre de requêtes proportionnelle aux unités. |

Budget structurel cible : aucun appel par ligne rendue ; nombre de lectures réseau borné par les lots nécessaires au parcours ; aucune activité réseau répétitive sur une page au repos. Les seuils chiffrés de latence et de CPU devront être fixés après une mesure de référence, pas annoncés comme acquis.

### 20.3 Points déjà visibles dans le code

Le chargeur principal lit les feuilles métier et référentielles par lots. La page de détail limite le chargement des personnes aux onglets concernés. Elle charge toutefois les options d'engagement parallèlement au bundle, y compris sur d'autres onglets. Le recalcul des classements effectue encore des écritures individuelles. Ces points doivent guider une étude de performance mesurée.

## 21. Fiabilité, concurrence et traçabilité

**COMP-091.** Une même action rejouée après une interruption ne doit pas créer un second engagement, une seconde qualification ou un second résultat. La protection du bouton côté navigateur complète les contrôles serveur ; elle ne les remplace pas.

**COMP-092.** Définir une stratégie pour les créations concurrentes, les collisions d'identifiants et les mises à jour fondées sur une version périmée. Sheets ne fournit pas, à lui seul, un verrou métier sur toute la durée d'une opération.

**COMP-093.** Une erreur partielle doit être détectable et réparable. Journaliser un identifiant d'opération, la nature de l'action, les objets concernés et son issue, sans exposer de données sensibles dans l'interface.

**COMP-094.** Conserver une trace des corrections et décisions sportives importantes selon une politique approuvée : acteur, date, justification, ancienne et nouvelle valeur lorsque nécessaire. Une piste d'audit complète n'est pas démontrée pour toutes les opérations actuelles.

**COMP-095.** Les erreurs partielles de référentiels doivent dégrader seulement la fonction concernée lorsque la lecture historique reste sûre. Une source indisponible ne doit jamais entraîner la création de valeurs de remplacement fictives.

## 22. Rapport d'écart

Priorités proposées : P0 = intégrité ou archive ; P1 = conformité fonctionnelle ; P2 = confort et optimisation. Elles ne constituent pas un ordre de livraison approuvé.

| ID | Priorité | Constat actuel | Cible / décision | Source principale |
| --- | --- | --- | --- | --- |
| E-01 | P0 | Identifiants calculés à partir des lignes lues. | Garantir l'unicité sous concurrence. | `lib/competition-structure.ts`, `lib/competitions-v2.ts` |
| E-02 | P0 | Plusieurs mutations utilisent un bundle sans fraîcheur explicitement forcée. | Garantir le verrou terminal au moment de l'écriture. | Services métier et chargeur |
| E-03 | P0 | Résultat puis statut de match écrits séparément ; échec de synchronisation possible. | Cohérence ou reprise fiable et signalée. | `lib/competition-results.ts` |
| E-04 | P1 | Validation du seuil et de l'écart de set sans contrôle complet du premier score gagnant. | Rejeter les dépassements incompatibles avec l'arrêt du set. | `lib/volleyball-results.ts` |
| E-05 | P1 | Clôture sans preuve que tous les matchs sont résolus. | Approuver et implémenter la liste complète des préconditions. | `lib/competition-closure-rules.ts` |
| E-06 | P1 | Départage final technique par identifiant ; ratios nuls conventionnels. | Règlement FEVOCO approuvé et explicite. | `lib/standings-calculation.ts` |
| E-07 | P1 | Résultats particuliers exclus du calcul automatique normal. | Définir forfaits, abandons et décisions administratives. | Résultats et classement |
| E-08 | P1 | Pas de route dédiée de correction de résultat constatée. | Procédure contrôlée avec impacts et historique. | API résultats |
| E-09 | P1 | Qualification sans match source ne prouve pas un rang admissible. | Distinguer décision opérateur et qualification réglementaire automatique. | `lib/competition-standings.ts` |
| E-10 | P1 | Discipline Autre acceptée ; engagement non beach traité comme club. | Définir les formats autorisés et bloquer les automatismes non spécifiés. | Structure et engagements |
| E-11 | P1 | Licence affichée sans blocage systématique. | Arbitrer les critères fédéraux d'éligibilité. | `lib/competition-people.ts` |
| E-12 | P1 | Création complète des unités nationales non constatée. | Définir activation saisonnière et engagement. | `lib/competition-entries.ts` |
| E-13 | P1 | Doublon de confrontation interdit même pour un aller-retour. | Décider les formats de calendrier pris en charge. | `lib/competition-matches.ts` |
| E-14 | P1 | Contrôles de terrains, chevauchements et bornes calendaires non démontrés. | Spécifier puis implémenter les contraintes retenues. | Programmation des matchs |
| E-15 | P1 | Certaines références sont lues par heuristique d'en-têtes. | Contrats explicites validés sur le classeur réel. | `lib/competitions-v2.ts` |
| E-16 | P1 | Modifications générales sans contrôle complet des dépendances. | Protéger discipline, saison et période déjà exploitées. | API édition |
| E-17 | P2 | Options d'engagement chargées sur tous les onglets de détail. | Chargement conditionnel et mesure avant/après. | Page détail |
| E-18 | P2 | Classement écrit ligne par ligne ; anciennes lignes à contrôler. | Écriture groupée et gestion du périmètre obsolète. | `lib/competition-standings.ts` |
| E-19 | P2 | Libellé Équipes pour des clubs et paires ; Participants pour les personnes. | Valider des libellés explicites sans changer le modèle métier. | Détail compétition |
| E-20 | P1 | Une valeur de discriminateur inconnue déclenche une action par défaut. | Valider strictement les actions API. | API structure et standings |

## 23. Plan de recette détaillé

Chaque scénario doit être exécuté avec des données réelles autorisées ou dans un environnement de test isolé. Les données de recette ne doivent pas être injectées dans les feuilles métier de production pour masquer une absence de données.

| ID | Mise en situation et action | Résultat attendu |
| --- | --- | --- |
| REC-01 | Ouvrir la liste avec des éditions existantes. | Noms, saisons, périodes et statuts résolus correctement. |
| REC-02 | Ouvrir une liste réellement vide. | État vide explicite et action autorisée de création. |
| REC-03 | Simuler une panne Sheets. | Message d'indisponibilité ; navigation et bandeau toujours présents. |
| REC-04 | Rechercher une édition absente des résultats filtrés. | État « aucun résultat » distinct d'une erreur. |
| REC-05 | Créer une édition sans champ obligatoire. | Refus serveur et erreur associée au champ. |
| REC-06 | Envoyer une référence inexistante directement à l'API. | Refus sans écriture. |
| REC-07 | Saisir progressivement huit chiffres de date. | Affichage progressif avec séparateurs et valeur finale `JJ/MM/AAAA`. |
| REC-08 | Coller une date avec séparateurs. | Normalisation correcte sans perte de chiffres. |
| REC-09 | Envoyer le 31 février et un 29 février non bissextile. | Rejet serveur. |
| REC-10 | Renseigner une fin antérieure au début. | Rejet et message chronologique. |
| REC-11 | Lire la cellule après enregistrement d'une date. | Valeur canonique `YYYY-MM-DD`, format de cellule conforme. |
| REC-12 | Créer deux éditions simultanément. | Identifiants distincts et aucune perte d'écriture. |
| REC-13 | Créer une épreuve avec une référence inconnue. | Refus. |
| REC-14 | Créer une phase avec numéro nul ou non entier. | Refus. |
| REC-15 | Créer un groupe dans une phase sans mode groupes. | Refus. |
| REC-16 | Engager un club actif dans une phase compatible. | Participation, unité et affectation initiale cohérentes. |
| REC-17 | Réengager le même club dans la même épreuve. | Refus selon la règle de doublon. |
| REC-18 | Engager une paire avec deux fois le même athlète. | Refus. |
| REC-19 | Réengager la même paire en inversant ses membres. | Refus. |
| REC-20 | Engager une paire avec sexe incompatible. | Refus selon le règlement validé ; absence de sexe traitée explicitement. |
| REC-21 | Modifier la structure d'une unité déjà liée à un match. | Blocage explicite sans altération des liens. |
| REC-22 | Reporter l'inscription après un match existant. | Refus. |
| REC-23 | Affecter une personne à une unité d'une autre édition. | Refus serveur. |
| REC-24 | Ajouter un troisième membre à une paire via Participants. | Refus. |
| REC-25 | Afficher une personne sans licence connue. | État exact ; blocage ou avertissement conforme à l'arbitrage fédéral. |
| REC-26 | Programmer une unité contre elle-même. | Refus. |
| REC-27 | Programmer deux unités de groupes différents. | Refus en mode groupes. |
| REC-28 | Envoyer une heure hors de `00:00–23:59`. | Refus. |
| REC-29 | Créer un match normal indoor terminé en trois, quatre puis cinq sets. | Calcul du vainqueur et agrégats exacts. |
| REC-30 | Créer un match beach terminé en deux puis trois sets. | Calcul exact avec seuil du set décisif approprié. |
| REC-31 | Envoyer un set à égalité, incomplet, négatif ou décimal. | Refus. |
| REC-32 | Envoyer un trou dans la série de sets ou un set après victoire. | Refus. |
| REC-33 | Envoyer un score dépassant le premier score gagnant, par exemple 30–0. | Refus selon COMP-049. |
| REC-34 | Envoyer des agrégats client différents des sets. | Le serveur calcule les agrégats de référence. |
| REC-35 | Enregistrer deux fois le résultat du même match. | Aucun doublon, y compris en concurrence. |
| REC-36 | Provoquer un échec entre résultat et mise à jour du match. | Incohérence signalée ou reprise assurée, sans second résultat. |
| REC-37 | Recalculer un groupe avec un barème réel connu. | Valeurs reproductibles et conformes au référentiel. |
| REC-38 | Départager des unités à égalité. | Ordre conforme au règlement approuvé et explicable. |
| REC-39 | Retirer une unité active puis recalculer. | Aucune ancienne ligne présentée comme classement courant. |
| REC-40 | Qualifier vers une phase d'une autre épreuve ou antérieure. | Refus. |
| REC-41 | Qualifier deux fois la même unité vers deux groupes de la cible. | Refus du second lien actif. |
| REC-42 | Utiliser un match source dont l'unité n'est pas vainqueur. | Refus. |
| REC-43 | Modifier la source d'une qualification existante. | Avertissement de cohérence, aucune requalification silencieuse. |
| REC-44 | Attribuer une distinction à une cible incompatible. | Refus. |
| REC-45 | Attribuer deux fois une distinction strictement identique. | Refus du doublon actif. |
| REC-46 | Clôturer une édition présentant une anomalie bloquante. | Conflit détaillé ; statut inchangé. |
| REC-47 | Clôturer une édition valide puis répéter la clôture. | Lecture seule ; second appel sans nouvel effet. |
| REC-48 | Appeler chaque mutation directement après clôture. | Refus serveur, même si le formulaire était déjà ouvert. |
| REC-49 | Réordonner les colonnes d'une feuille de test. | Mapping inchangé par noms d'en-têtes. |
| REC-50 | Rendre une référence historique indisponible. | Identifiant visible, erreur explicite, historique conservé. |
| REC-51 | Tester à 1440, 1024, 390 et 320 pixels de largeur. | Contenu utilisable et aucun débordement de page. |
| REC-52 | Parcourir dialogues et tableaux au clavier. | Focus visible, libellés lisibles et actions accessibles. |
| REC-53 | Profiler recherche, tri et pagination. | Aucun appel Sheets par ligne ni réécriture silencieuse. |
| REC-54 | Laisser la page au repos. | Aucun polling ou calcul répétitif injustifié. |
| REC-55 | Envoyer un `kind` ou une `action` inconnu à l'API. | Rejet explicite sans mutation par défaut. |

Les scénarios portant sur une exigence cible encore absente sont des critères de réception futurs ; ils ne sont pas présentés comme réussis.

## 24. Arbitrages à obtenir

| Sujet | Décision attendue | Effet sur la livraison |
| --- | --- | --- |
| Règlements par discipline et catégorie | Format des matchs, variantes et seuils. | Paramétrage et validation des résultats. |
| Barèmes et départages | Points, ratios, face-à-face, égalités persistantes. | Homologation des classements. |
| Résultats particuliers | Forfait, abandon, annulation et sanctions. | Scores administratifs et classement. |
| Admissibilité | Licences, affiliations, âge, sexe, contrôle médical, dérogations. | Blocages à l'engagement et au match. |
| Paires | Remplacement et participation multiple. | Contrôles d'effectif. |
| Sélections nationales | Activation saisonnière et composition. | Parcours d'engagement dédié. |
| Calendrier | Aller-retour, terrains, conflits et reports. | Modèle de match et programmation. |
| Qualifications | Rangs, quotas, repêchages, exemptions. | Automatisation éventuelle. |
| Annulation et clôture | Transitions et liste complète des préconditions. | Verrous métier. |
| Corrections | Acteurs habilités existants, motifs, effets et traçabilité. | Rectification des résultats et palmarès. |
| Présentation | Libellés Unités engagées / Équipes et Participants / Intervenants. | Compréhension sans ambiguïté. |
| Service attendu | Volumétrie et objectifs mesurés de latence. | Budget de performance et recette. |

## 25. Découpage de livraison recommandé

### Lot 1 — Contrats et intégrité

Valider les règles fédérales, inventorier les en-têtes réels, formaliser les clés et transitions, traiter les identifiants concurrents, le verrou de clôture et les écritures partielles. Livrable : contrats approuvés et tests serveur des invariants.

### Lot 2 — Préparation et engagements

Finaliser édition, épreuves, phases, groupes, clubs, paires et personnes. Vérifier les dates et les limites de modification. Livrable : parcours complet de préparation sans donnée fictive.

### Lot 3 — Déroulement sportif

Finaliser programmation, validation des sets, résultats particuliers et correction contrôlée. Livrable : scénarios sportifs reproductibles et synchronisation match/résultat.

### Lot 4 — Classements, qualifications et palmarès

Appliquer le règlement approuvé, gérer les classements obsolètes, tracer les qualifications et finaliser les distinctions. Livrable : classement explicable et historique cohérent.

### Lot 5 — Performance, états et clôture

Mesurer les appels et le CPU, supprimer les chargements inutiles, regrouper les écritures, vérifier les états d'indisponibilité et exécuter la recette responsive puis la clôture complète.

Pour chaque lot : lister les fichiers et composants concernés, documenter les écarts restants, exécuter lint, contrôle TypeScript, tests pertinents et build disponibles, vérifier les interfaces dans le navigateur aux dimensions retenues, puis joindre `git diff --stat` et `git status --short`. Aucun commit ou push sans autorisation explicite.

## 26. Critères de réception globale

Le module est recevable lorsque les règles sportives sont approuvées, les exigences du lot sont couvertes par des preuves, les contrôles serveur résistent aux appels directs et les anomalies d'intégrité bloquantes sont résolues.

Le dossier de réception comprend : version du code, décisions métier, schéma réel des feuilles, résultats de tests, captures des écrans, mesures avant/après de performance, liste des anomalies résiduelles et procédure de reprise des erreurs partielles. Les éditions clôturées doivent rester consultables et non modifiables.

## 27. Sources du dépôt et limites de cette rédaction

Principales sources consultées :

- [Règles et contexte métier](../CONTEXT.md).
- [Page de liste](../app/competitions/page.tsx) et [page de détail](../app/competitions/[id]/page.tsx).
- [Chargeur et modèle des compétitions](../lib/competitions-v2.ts).
- [Structure des épreuves, phases et groupes](../lib/competition-structure.ts).
- [Engagements](../lib/competition-entries.ts) et [modification des unités](../lib/competition-entry-edit.ts).
- [Personnes et licences](../lib/competition-people.ts).
- [Programmation des matchs](../lib/competition-matches.ts).
- [Résultats](../lib/competition-results.ts) et [validation des sets](../lib/volleyball-results.ts).
- [Calcul des classements](../lib/standings-calculation.ts), [mutations et qualifications](../lib/competition-standings.ts), [lecture des classements](../lib/competition-standings-view.ts).
- [Cycle de vie](../lib/competition-lifecycle.ts) et [règles de clôture](../lib/competition-closure-rules.ts).
- [Distinctions](../lib/competition-distinctions.ts).
- [Fonctions centralisées de dates](../lib/compact-date.ts).
- [Rapport historique personnes, poules et qualifications](competitions-participants-poules-qualifications-2026-11-05.md).

Cette livraison est documentaire. Elle n'ajoute aucune fonction à l'application et ne certifie aucun scénario comme exécuté pendant sa rédaction. Les constats de code, les exigences futures et les décisions à prendre sont volontairement séparés pour permettre une validation précise.
