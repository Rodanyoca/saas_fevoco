# Correspondance COC → FEVOCO — Activités et Documents

| Élément COC | Présent dans FEVOCO | Écart constaté | Décision |
|---|---:|---|---|
| Types d’activités | Oui, `TYPES_ACTIVITE` | Libellés FEVOCO, en-têtes singuliers | Conserver et résoudre par ID |
| Rôles des entités | Oui, `ROLES_ENTITE_ACTIVITE` | Aucun doublon de libellé dans les activités | Conserver |
| Activités | Oui, `ACTIVITES` | FEVOCO utilise `statut` et `observations` | Mapper les en-têtes FEVOCO |
| Participants | Oui, `ACTIVITES_PARTICIPANTS` | FEVOCO stocke type et ID acteur | Conserver ce modèle plus explicite |
| Entités associées | Oui, `ACTIVITES_ENTITES` | Relation séparée | Conserver |
| Types de documents | Oui, `TYPES_DOCUMENT` | Aucun référentiel de catégorie utilisé | Conserver un seul type contrôlé |
| Documents | Oui, `DOCUMENTS` | Métadonnées séparées des fichiers | Conserver |
| Fichiers | Oui, `DOCUMENTS_FICHIERS` | Plus normalisé que le COC | Conserver, fichier binaire dans Drive |
| Relations | Oui, `DOCUMENTS_RELATIONS` | Relation polymorphe contrôlée | Conserver |
| Stockage Drive | Variable ajoutée | Non branché auparavant | Connecter sans rendre les fichiers publics |

## En-têtes canoniques constatés

- `ACTIVITES`: `id_activite`, `id_type_activite`, `id_entite_organisatrice`, `nom_activite`, `titre_public`, `resume`, `date_debut`, `date_fin`, `pays`, `ville`, `lieu`, `statut`, `observations`.
- `ACTIVITES_ENTITES`: `id_activite_entite`, `id_activite`, `id_entite`, `id_role_entite_activite`, `statut_participation`, `observations`.
- `ACTIVITES_PARTICIPANTS`: `id_participation`, `id_activite`, `id_type_acteur`, `id_acteur`, `role_participation`, `statut_participation`, `observations`.
- `DOCUMENTS`: `id_document`, `id_type_document`, `titre_document`, `numero_reference`, `date_document`, `date_reception`, `date_expiration`, `description`, `statut`, `observations`.
- `DOCUMENTS_FICHIERS`: `id_fichier`, `id_document`, `nom_fichier`, `type_fichier`, `url_fichier`, `id_fichier_drive`, `date_ajout`, `observations`.
- `DOCUMENTS_RELATIONS`: `id_relation_document`, `id_document`, `id_type_entite`, `id_entite`, `type_relation`, `observations`.

Les statuts restent des valeurs métier enregistrées comme dans le COC : aucun onglet de statut inutilisé n’est créé. Les dates sont saisies en `JJ/MM/AAAA` avec séparateurs automatiques puis écrites en `yyyy-mm-dd`.
