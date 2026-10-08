# Classement des variables d’environnement FEVOCO

Les 22 variables existantes de `.env.local` sont regroupées et commentées par usage :

1. Compte de service Google Sheets.
2. Classeurs FEVOCO : référentiels, structure territoriale, acteurs, affiliations, licences, compétitions, équipes nationales, activités et documents.
3. Accès OAuth Google Drive.
4. Dossiers Drive : racine, avatars par type d’acteur, logos et documents.

Les commentaires expliquent les usages et les replis existants. L’alias historique `FEVOCO_AFFILIATIONS_LICENCES_SPREADSHEET_ID` conserve son nom et sa valeur ; le commentaire précise que les licences disposent de leur propre variable et que `FEVOCO_AFFILIATIONS_SPREADSHEET_ID` est prioritaire si configurée. Aucun nom, valeur ou mécanisme de lecture n’est modifié.

Un fichier `.env.local.example` reprend les mêmes 22 noms, les mêmes sections et les mêmes commentaires, avec toutes les valeurs vides. Il peut servir de modèle de configuration sans contenir de secret.

Vérifications : comparaison des 22 valeurs effectives avant/après avec le parseur Next.js `@next/env`, identité stricte confirmée ; absence de doublon ; exemple analysable avec 22 valeurs vides ; `.env.local` reste ignoré par Git. Aucune valeur sensible n’a été affichée dans les sorties. Aucun changement applicatif ou visuel ; un build n’est pas nécessaire pour des commentaires et un ordre de variables dont les valeurs effectives sont identiques.

Fichiers : `.env.local` (local, ignoré), `.env.local.example` (nouveau modèle), ce rapport. Aucun composant porté ni écart fonctionnel. Aucun commit ni push.

`git diff --stat` ne présente pas de changement suivi pour ce lot : le fichier réel est ignoré et le modèle/rapport sont nouveaux. État des fichiers du lot :

```text
?? .env.local.example
?? docs/lot-variables-environnement.md
```

Les modifications applicatives des lots précédents sont conservées.
