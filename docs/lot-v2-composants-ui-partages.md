# Lot V2 — Composants UI partagés

Date : 25 septembre 2026  
Branche : `design/harmonisation-febaco`  
Périmètre : composants génériques uniquement

## Résultat

La base UI FEVOCO utilise maintenant les composants FEBACO actuels pour les éléments structurants du lot V2. Aucune donnée métier ni règle territoriale n’a été modifiée.

## Composants portés depuis FEBACO

| Composant | Fichier FEVOCO | Résultat |
|---|---|---|
| Button | `components/ui/button.tsx` | Variantes, tailles, focus, disabled et loading-compatible alignés |
| Input | `components/ui/input.tsx` | Dimensions, fond, bordure, focus et état invalide alignés |
| Card | `components/ui/card.tsx` | Rayon, densité, bordure, ombre et espacements alignés |
| Badge | `components/ui/badge.tsx` | Forme, typographie, variantes et focus alignés |
| Table | `components/ui/table.tsx` | En-têtes, hauteur des lignes, sélection et responsive alignés |
| SearchSelect | `components/ui/search-select.tsx` | Composant de recherche/sélection FEBACO ajouté |
| DataTable | `components/dashboard/data-table.tsx` | Recherche, filtres, compteur, pagination, actions, table desktop et cartes mobiles alignés |
| DetailCard | `components/dashboard/detail-card.tsx` | Présentation des informations et formatage des dates alignés |
| StatCard | `components/dashboard/stat-card.tsx` | Densité, icône, survol, détail, tendance et lien alignés |
| StatusBadge | `components/dashboard/status-badge.tsx` | États actifs, inactifs, suspendus, en attente et licences alignés |
| Date formatting | `lib/date-format.ts` | Affichage homogène des dates dans tables et fiches |

## Composants déjà identiques à FEBACO

- Select
- Textarea
- Checkbox
- Radio group
- Dropdown menu
- Alert dialog
- Tooltip
- Skeleton
- Sonner / Toast / Toaster
- Empty state

## Adaptations FEVOCO conservées

- `Dialog` garde son défilement vertical et ses marges mobiles pour éviter les contenus coupés.
- `Dialog` et `Sheet` utilisent le libellé accessible français « Fermer ».
- `PaginationLink` conserve le rendu explicite de ses enfants, nécessaire au fonctionnement réel des liens.
- La couleur primaire reste le bleu ciel FEVOCO. Les actions explicitement institutionnelles peuvent continuer à utiliser l’or de marque avec une classe dédiée.

Ces différences sont techniques ou institutionnelles et ne créent pas une direction visuelle distincte.

## États couverts

- normal, hover, focus visible, disabled et invalide sur les contrôles ;
- recherche vide ou renseignée ;
- filtres et réinitialisation de page ;
- pagination et taille de page ;
- tableau desktop et cartes mobiles ;
- état vide ;
- badges de statut ;
- dialog, sheet et alert dialog ;
- skeletons et notifications.

## Contrôles

- `npm run lint` : réussi.
- `npx tsc --noEmit` : réussi.
- `npm run build` : réussi.
- `git diff --check` : à exécuter dans le contrôle final du lot.
- Tests automatisés : aucun script de test n’est déclaré dans `package.json`.

## Limite de vérification visuelle

Le runtime `node_repl` nécessaire au navigateur intégré n’est pas disponible dans cette session. Les captures comparatives FEBACO/FEVOCO aux quatre dimensions prescrites ne peuvent donc pas être produites et le lot ne doit pas être présenté comme certifié visuellement. La vérification du code, des variantes et du build est complète ; la parité rendue et les interactions restent à contrôler dans un navigateur disponible.

## Hors périmètre

- aucune nouvelle page métier ;
- aucune modification du login ou des permissions ;
- aucune donnée fictive ;
- aucun travail du lot V3 ;
- aucun commit et aucun push.
