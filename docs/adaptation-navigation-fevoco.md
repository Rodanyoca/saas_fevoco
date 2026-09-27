# Adaptation complète de la navigation FEVOCO

## Références consultées

### FEBACO — vérité visuelle

- `components/dashboard/sidebar.tsx`
- `components/dashboard/header.tsx`
- `app/dashboard/layout.tsx`
- `components/ui/tooltip.tsx`
- `components/ui/sheet.tsx`
- `app/globals.css`

### COC — adaptation secondaire

- `components/dashboard/sidebar.tsx`
- `components/dashboard/header.tsx`
- `lib/navigation/dashboard-navigation.ts`
- `app/dashboard/layout.tsx`

### FEVOCO — routes et identité métier

- `components/dashboard/sidebar.tsx`
- `components/dashboard/header.tsx`
- `components/dashboard/dashboard-layout.tsx`
- `components/dashboard/dashboard-navigation-context.tsx`
- `lib/navigation.ts`
- `app/globals.css`
- `public/logo-fevoco.png`

## Fichiers FEVOCO modifiés

- `components/dashboard/sidebar.tsx`
- `components/dashboard/header.tsx`
- `components/dashboard/dashboard-layout.tsx`
- `lib/navigation.ts`

Les pages minimales `app/activites/page.tsx`, `app/documents/page.tsx` et le composant `components/dashboard/coming-soon-page.tsx`, déjà préparés lors de l’harmonisation, ont été contrôlés mais n’ont pas nécessité de nouvelle logique métier.

## Composants adaptés

### Sidebar

- conservation des largeurs FEBACO : `w-64` ouverte et `w-16` réduite ;
- identité FEVOCO avec le logo existant et le lien vers le tableau de bord ;
- fond, bordure, ombre, séparateur institutionnel et dimensions d’icônes alignés ;
- état actif or via `brand-gold`, avec un texte sombre contrasté ;
- survol neutre, sans appliquer l’état actif au titre du groupe ;
- focus clavier visible ;
- état réduit mémorisé dans `localStorage` ;
- déplacement naturel du contenu grâce au layout flex ;
- infobulles Radix accessibles en mode réduit ;
- scroll vertical masqué visuellement mais fonctionnel ;
- suppression de l’ancien usage du simple attribut `title` comme seule infobulle.

### Groupes et sous-menus

- chevron animé unique ;
- `aria-expanded` et `aria-controls` ;
- indentation et bordure verticale des sous-menus ;
- titre de groupe toujours neutre, même lorsqu’un enfant est actif ;
- mise en évidence or réservée à l’entrée réellement active ;
- ouverture automatique du groupe contenant la route active après navigation ou actualisation ;
- conservation des vrais liens Next.js ;
- correspondance centralisée des routes enfants avec `isNavigationItemActive`.

### Header

- structure sticky, hauteur minimale, fond translucide, bordure et ombre alignés sur FEBACO ;
- liseré du titre et interactions du bouton mobile en or ;
- bouton mobile connecté au drawer ;
- suppression du bouton « Déconnexion » factice qui ne possédait aucune logique d’authentification ;
- aucune modification de l’authentification ou des utilisateurs.

### Mobile

- sidebar desktop masquée sous `lg` ;
- drawer Radix avec overlay, animation, focus trap et fermeture par Échap ;
- largeur `w-64`, limitée à `88vw`, identique à la navigation ouverte ;
- fermeture du drawer après sélection d’une route ;
- groupes, états actifs et identité FEVOCO conservés ;
- bouton de fermeture natif accessible.

## Structure finale du menu

```text
Tableau de bord                       /

Structure territoriale
  Ligues                              /ligues
  Ententes                            /ententes
  Clubs                               /clubs

Acteurs
  Athlètes                            /athletes
  Entraîneurs                         /coachs
  Arbitres                            /arbitres
  Médecins                            /medecins
  Officiels                           /officiels

Mouvements                            /transferts
Compétitions                          /competitions

Équipes nationales
  Sélections                          /equipe-nationale
  Performances                        /suivi-equipe-nationale

Activités                             /activites
Documents                             /documents
```

Il n’existe aucun module « Autres acteurs » dans FEVOCO ; il n’a donc pas été ajouté. Aucune équipe territoriale n’apparaît entre Club et Athlète.

## Routes et intégrité

- les quinze routes configurées possèdent toutes un fichier `page.tsx` FEVOCO ;
- aucun lien `#`, préfixe FEBACO/COC ou chemin basketball n’est présent ;
- la fonction de correspondance active couvre la route exacte et ses segments enfants ;
- les paramètres de recherche n’altèrent pas `usePathname` ;
- le clic sur une entrée utilise `next/link`, sans rechargement complet ;
- l’événement local `fevoco:navigate` est préservé pour permettre à la vue détaillée Ligues de revenir à sa liste lorsqu’on reclique sur Ligues.

## Dépendances

Aucune dépendance n’a été ajoutée. La navigation réutilise les dépendances déjà installées :

- Next.js `Link`, `Image` et `usePathname` ;
- Lucide React ;
- Radix Dialog via le composant `Sheet` ;
- Radix Tooltip via le composant `Tooltip` ;
- Tailwind CSS et les tokens FEVOCO existants.

## Accessibilité

- liens réels avec `aria-current="page"` ;
- boutons de groupe avec état développé exposé ;
- association des boutons aux sous-menus ;
- libellés accessibles en mode réduit ;
- focus visible sur liens, groupes, logo et bouton de réduction ;
- icônes décoratives masquées aux technologies d’assistance ;
- zones interactives d’au moins 40 px pour les liens principaux ;
- drawer mobile gérant focus, overlay et touche Échap via Radix.

## Vérifications techniques

- branche : `design/harmonisation-febaco` ;
- `npm.cmd run lint` : réussi ;
- `npx.cmd tsc --noEmit` : réussi ;
- `npm.cmd run build` : réussi ;
- `git diff --check` : aucune erreur ;
- recherche `FEBACO|Basket|Basketball|BKB|COC` dans le périmètre de navigation : aucun résultat ;
- recherche de liens `#` : aucun résultat ;
- serveur de production local lancé sur un port de contrôle puis arrêté.

Résultats HTTP du contrôle de démarrage :

- HTTP 200 : `/`, `/ligues`, `/athletes`, `/coachs`, `/arbitres`, `/medecins`, `/officiels`, `/transferts`, `/competitions`, `/equipe-nationale`, `/suivi-equipe-nationale`, `/activites`, `/documents` ;
- HTTP 500 : `/ententes` et `/clubs` à cause de leur chargement métier actuel. Les routes et leurs liens de navigation existent ; la correction des services ou contenus de ces pages est explicitement hors du périmètre navigation.

## Contrôle visuel

Le navigateur intégré nécessaire aux captures comparatives Product Design n’est pas exposé dans cette session. Les dimensions 1440 × 900, 1280 × 800, 768 × 1024 et 390 × 844 n’ont donc pas pu être certifiées par capture.

La fidélité a été contrôlée par comparaison directe des sources FEBACO, COC et FEVOCO, ainsi que par les contrôles de compilation, routes et accessibilité statique. Le rendu visuel final reste à confirmer dans une session disposant du navigateur intégré.

## Éléments non modifiés

- contenu métier des pages ;
- tableaux, cartes, formulaires et vues détaillées ;
- tableau de bord ;
- Google Sheets, mappers et référentiels ;
- routes API et actions serveur ;
- connexion, authentification, rôles, permissions et utilisateurs ;
- aucun commit et aucun push.
