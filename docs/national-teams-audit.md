# Audit Équipes nationales FEVOCO

## Existant

- Route actuelle : `/equipe-nationale`.
- Interface monolithique liste/détail fondée sur l’ancien modèle saisonnier.
- Anciens lecteurs : `EQUIPE_NATIONALE`, `EQUIPE_NATIONALE_SELECTIONS`, `EQUIPE_NATIONALE_STAFF`, `EQUIPE_NATIONALE_COMPETITIONS`, `EQUIPE_NATIONALE_RESULTATS`.
- Composants réutilisables : `DashboardLayout`, `Header`, `DataTable`, `StatusBadge`, `Sheet`, champs de date centralisés.

## Contrat réel vérifié

| Feuille | Relation |
|---|---|
| `EQUIPES_NATIONALES` | Identité permanente |
| `EQUIPES_NATIONALES_SAISONS` | Équipe permanente + saison |
| `CAMPAGNES_EQUIPES_NATIONALES` | Activation saisonnière + campagne |
| `SELECTIONS_ATHLETES` | Campagne + athlète |
| `AFFECTATIONS_STAFF` | Activation saisonnière + acteur |

Les en-têtes correspondent au cahier des charges. Les cinq feuilles métier sont vides au moment de l’audit. Les deux anciennes feuilles Compétitions/Résultats sont supprimées et ne doivent plus être lues.

## Référentiels

Les référentiels annoncés sont présents. `POSTES` ne contient actuellement que son en-tête : une sélection ne pourra pas proposer un poste contrôlé avant alimentation de cette feuille.

## Risques et migration

- Les anciens getters sont consommés par le dashboard et certains formulaires d’affiliation : leur suppression immédiate provoquerait des régressions.
- Le nouveau service est introduit en parallèle ; la route Équipes nationales migre en premier.
- Aucun nom d’acteur, d’équipe ou de saison ne sera écrit dans une relation.
- Les affectations nationales ne seront jamais écrites comme affiliations de club.
