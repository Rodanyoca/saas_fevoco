# Lot V1 — Fondations persistantes et navigation

Date : 25 septembre 2026  
Branche : `design/harmonisation-febaco`  
Périmètre : `fevoco-cible` uniquement

## Références appliquées

- **FEBACO** : vérité visuelle — tokens, fond global, sidebar de 256 px, mode réduit de 64 px, header de 64 px, groupes repliables, icônes de 20 px, espacements et états de focus.
- **COC** : référence secondaire — adaptation des libellés et intégration du déclencheur mobile dans le header.
- **FEVOCO** : vérité métier — routes, données, relations et identité institutionnelle.

Les règles durables sont consignées dans [`AGENTS.md`](../AGENTS.md). Elles interdisent notamment toute modification de FEBACO/COC, les données de démonstration, les équipes territoriales et les interventions sur l’authentification.

## Inventaire des composants visuels

| Domaine | FEBACO | Équivalent FEVOCO | État V1 |
|---|---|---|---|
| Tokens et fond | `app/globals.css` | `app/globals.css` | Aligné, avec primaire FEVOCO bleu ciel |
| Police | Geist / Geist Mono | `app/layout.tsx`, `app/globals.css` | Aligné |
| Structure desktop | layout dashboard + sidebar fixe | `DashboardLayout` | Largeurs et hauteur alignées ; contenu s’adapte au mode réduit |
| Sidebar | `components/dashboard/sidebar.tsx` | même chemin | Structure, dimensions, groupes, icônes et focus alignés |
| Header | `components/dashboard/header.tsx` | même chemin | Hauteur, fond, bordure, ombre et typo alignés |
| Navigation mobile | adaptation nécessaire | `DashboardLayout`, `Header`, `Sheet` | Drawer intégré au bouton du header, fermeture après navigation |
| Navigation métier | routes FEBACO basketball | `lib/navigation.ts` | Adaptée aux modules FEVOCO sans route Équipes territoriales |
| Pages provisoires | non applicable | `/activites`, `/documents` | « Bientôt disponible », sans données fictives ni feuille inexistante |
| Boutons/cartes/tables/formulaires | composants UI FEBACO | composants UI FEVOCO | Hors lot V1 ; à contrôler au lot V2 |

## Navigation FEVOCO livrée

- Tableau de bord
- Structure territoriale : Ligues, Ententes, Clubs
- Acteurs : Athlètes, Entraîneurs, Médecins, Arbitres, Officiels
- Mouvements
- Compétitions
- Équipes nationales : Sélections, Performances
- Activités
- Documents

Les groupes sont repliables. Le mode compact desktop conserve des infobulles natives via `title`. L’élément actif utilise le bleu ciel FEVOCO déjà validé ; les survols, le bouton mobile et le bouton de réduction utilisent l’or de marque. Un clic sur une entrée ferme le drawer mobile et déclenche aussi la remise à zéro des vues locales concernées, notamment le retour de la fiche Ligue vers sa liste.

## Dépendances

Les dépendances visuelles requises sont déjà présentes dans FEVOCO : Radix UI, Lucide, Tailwind CSS 4, `class-variance-authority`, `clsx`, `tailwind-merge`, Sonner et Geist via Next.js. Aucune dépendance n’a été installée.

## Contrôles exécutés

- `npm run lint` : réussi.
- `npx tsc --noEmit` : réussi.
- `npm run build` : réussi ; 13 pages statiques/dynamiques générées, dont `/activites` et `/documents`.
- Test HTTP de `/ligues` sur FEVOCO : réponse `200`, HTML français rendu.
- Tests automatisés : aucun script de test n’est déclaré dans `package.json`.

## Vérification visuelle demandée

La comparaison par captures aux formats 1440×900, 1280×800, 768×1024 et 390×844 n’a pas pu être exécutée dans cette session : le runtime navigateur intégré requis n’est pas disponible. FEBACO ne peut par ailleurs pas être lancé localement sans installation, car ses dépendances ne sont pas présentes ; conformément au périmètre, aucune installation n’a été effectuée dans le dépôt de référence. FEVOCO est joignable sur le port 3000.

Le lot ne doit donc pas être considéré comme visuellement certifié tant que ces huit captures comparatives et les interactions réelles (réduction, groupes, drawer, fermeture après navigation, focus clavier) n’ont pas été contrôlées dans un navigateur disponible.

## Écarts restant à vérifier

- Parité pixel à pixel aux quatre dimensions imposées.
- Rendu réel des textes longs et du défilement vertical de la sidebar.
- Ouverture/fermeture et largeur du drawer à 768 px et 390 px.
- États hover/focus actifs sur un navigateur réel.
- Absence d’erreurs console et réseau pendant les navigations.

Le lot V2 n’a pas été commencé dans le cadre de cette reprise.
