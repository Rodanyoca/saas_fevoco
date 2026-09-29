# Audit initial — module Compétitions FEVOCO

Branche de travail : `feature/competitions-fevoco`.

## État initial

- Le dépôt contenait uniquement `test-results/` non suivi ; ce dossier est laissé intact.
- FEBACO est consulté en lecture seule depuis `febaco-reference`.
- FEVOCO utilisait une fiche monolithique sans route détaillée et cinq anciennes feuilles seulement.
- Les anciens mappers lisaient notamment `nom_discipline`, `statut_competition` et `format_competition`, incompatibles avec le contrat actuel.

## Correspondance principale

| FEBACO | FEVOCO cible |
| --- | --- |
| `app/dashboard/competitions/page.tsx` | `app/competitions/page.tsx` |
| `app/dashboard/competitions/[id]/page.tsx` | `app/competitions/[id]/page.tsx` |
| `app/api/competitions/**` | `app/api/competitions/**` |
| `components/dashboard/competition-*.tsx` | `components/competitions/competition-*.tsx` |
| `lib/competitions.ts` | `lib/competitions.ts` |
| `lib/competition-{catalog,structure,participants,people,play,distinctions}.ts` | mêmes modules adaptés au volleyball |

## Contrat vérifié dans Google Sheets

- 13 feuilles métier, de `COMPETITIONS` à `COMPETITIONS_DISTINCTIONS`.
- Référentiels vérifiés : disciplines, saisons, sexes, catégories, types de phases, modes, unités, affectations, statuts et types de résultats, distinctions.
- Valeurs FEVOCO structurantes : `DISC061` indoor, `DISC009` beach, `TUC002` paire, `TUC004` club, `TUC005` équipe nationale.
- Les résultats possèdent cinq paires de scores de set et leurs totaux ; aucun champ de quart-temps.

## Dette repérée

- Mappers et types de compétition basés sur l'ancien schéma.
- Aucune route API de mutation pour le module.
- Détail affiché dans la liste au lieu d'une URL stable avec onglet actif.
- Référentiels incomplets et labels parfois déduits des anciennes colonnes.
- Aucun script `test` ni `typecheck` déclaré dans `package.json` ; `tsc --noEmit` reste exécutable directement.

## Fichiers prévus

- Pages et chargements : `app/competitions/**`.
- API : `app/api/competitions/**`.
- UI : `components/competitions/**`.
- Domaine et Sheets : `lib/competitions*.ts`, `lib/google-sheets.ts`, `lib/types.ts`.
- Tests unitaires : fichiers `*.test.mjs` ou mécanisme existant du dépôt.
