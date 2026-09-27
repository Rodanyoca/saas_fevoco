# Lot V9 — fiche détaillée d’un club

## Objectif

Aligner la fiche détaillée d’un club FEVOCO sur l’interface FEBACO, tout en conservant le modèle métier propre au volleyball congolais.

## Réalisation

- en-tête dynamique `Fiche Club: …` et sous-titre basé sur le pseudo de l’entente ;
- barre d’actions identique à FEBACO avec retour à gauche et modification dorée à droite ;
- carte d’identité avec logo, initiales de secours, nom et identifiant ;
- cartes `Informations générales` et `Affiliation` disposées sur deux colonnes ;
- pictogrammes et actions en or, sans mise en évidence bleue ;
- quatre tuiles de synthèse reprenant la densité et la composition FEBACO ;
- tableau des athlètes intégré dans une carte pleine largeur ;
- formulaire de modification conservé dans le volet latéral commun aux clubs.

## Mapping affiché

| Libellé | Source FEVOCO |
| --- | --- |
| ID Club | `idClub` |
| Nom du club | `nomClub` |
| Ligue | `nomLigue` |
| Entente | `pseudoEntente` |
| Ville | `idVille` |
| Catégorie | `categorie` |
| Sexe | `version` |
| Date de création | `dateCreation` |
| Date d’affiliation | `dateAffiliationClub` |

## Limite métier assumée

La fiche ne crée pas de section « Équipes du club ». Cette relation appartient au modèle FEBACO mais ne doit pas être ajoutée artificiellement à FEVOCO. La fidélité recherchée porte donc sur le système visuel et les composants applicables, pas sur l’invention de relations absentes du référentiel.

## Validation

La comparaison visuelle Playwright à 1440 × 900 est consignée dans `design-qa.md`. Les captures source et cible sont conservées dans `docs/design-qa-assets/`.

