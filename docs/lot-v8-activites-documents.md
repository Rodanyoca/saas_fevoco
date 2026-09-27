# Lot V8 — Activités et Documents

## Périmètre

Le lot V8 maintient volontairement les modules **Activités** et **Documents** en état « Bientôt disponible », conformément aux règles persistantes du projet. Aucune modélisation métier, donnée ou mutation n’est ajoutée sans autorisation fonctionnelle.

Routes concernées :

- `/activites` ;
- `/documents`.

## Fichiers concernés

- `app/activites/page.tsx`
- `app/documents/page.tsx`
- `components/dashboard/coming-soon-page.tsx`
- `lib/navigation.ts` pour la présence des deux entrées dans la navigation.

## Changements et contrôles réalisés

### Gabarit visuel

- utilisation du layout et du header communs à FEVOCO ;
- header replacé hors du conteneur de contenu, comme sur les pages harmonisées ;
- marges responsives cohérentes avec les autres modules ;
- carte centrale reprenant les bordures, rayons, ombres, couleurs et typographie partagés ;
- icône propre à chaque module ;
- mise en évidence avec la couleur institutionnelle déjà définie, sans nouvelle direction graphique.

### État fonctionnel

- libellé explicite « Module en préparation » ;
- titre « Bientôt disponible » ;
- explication indiquant que l’activation dépend de données et services FEVOCO validés ;
- aucun bouton factice ;
- aucun compteur, tableau, graphique ou formulaire fictif ;
- aucun appel réseau, Google Sheets ou API ;
- aucune donnée de démonstration.

### Navigation

Les entrées **Activités** et **Documents** restent visibles dans la navigation principale et pointent vers leurs routes respectives. Le comportement actif et mobile repose sur la navigation partagée harmonisée lors du lot V1.

### Accessibilité

- la carte d’attente expose un rôle de statut ;
- son titre est associé par `aria-labelledby` ;
- les icônes décoratives sont ignorées par les technologies d’assistance.

## Vérifications

- recherche d’appels `fetch`, de services de données, de Google Sheets, mocks ou fixtures dans le périmètre : aucun résultat ;
- `npm.cmd run lint` : réussi ;
- `npx.cmd tsc --noEmit` : réussi ;
- `npm.cmd run build` : réussi ;
- `/activites` et `/documents` sont confirmées comme pages statiques pré-rendues dans la sortie Next.js.

La capture et la comparaison visuelles automatisées dans le navigateur ne sont pas disponibles dans cette session. L’alignement a été contrôlé à partir des composants partagés déjà harmonisés et des validations techniques ci-dessus.

## Écarts restants et hors périmètre

- la modélisation fonctionnelle des Activités reste à autoriser ;
- la modélisation fonctionnelle des Documents reste à autoriser ;
- aucun stockage ou service n’a été créé ;
- le dashboard général n’est pas modifié dans ce lot ;
- le lot V9 n’est pas commencé ;
- aucun commit et aucun push.
