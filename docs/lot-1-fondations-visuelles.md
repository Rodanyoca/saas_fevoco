# Lot 1 — Fondations visuelles

Date : 25 septembre 2026  
Branche : `design/harmonisation-febaco`

## Objectif

Aligner les primitives visuelles FEVOCO sur les conventions éprouvées de FEBACO
et du COC sans reprendre leurs couleurs et sans modifier le métier.

## Rapport d’écart avant intervention

- FEVOCO possédait déjà une palette institutionnelle bleu, rouge et or et des
  composants shadcn/ui réutilisables.
- Le rayon global était plus serré que les références et les ombres n’étaient
  pas définies comme tokens.
- Les cartes, champs, tableaux et overlays n’avaient pas tous une surface ou une
  profondeur cohérente.
- Les cibles tactiles mobiles pouvaient rester à 32 ou 36 px.
- Deux fichiers `globals.css` existaient, mais seul `app/globals.css` était importé.
- Le libellé accessible du bouton de fermeture des modales était en anglais.

## Modifications

- Conservation intégrale des couleurs institutionnelles FEVOCO.
- Rayon global porté à `0.625rem`, cohérent avec FEBACO/COC.
- Ajout de tokens d’ombres pour surfaces, cartes et overlays.
- Amélioration de la typographie, du rendu et du comportement de focus.
- Uniformisation des surfaces de champs et sélecteurs.
- Boutons plus lisibles, avec poids renforcé et retour d’interaction discret.
- Badges en forme de pilule pour mieux distinguer les statuts.
- En-têtes et cellules de tableaux rendus plus respirants.
- Cibles tactiles de 44 px minimum sur mobile pour les contrôles principaux.
- Libellé de fermeture de modale traduit en français.
- Suppression de `styles/globals.css`, non importé et divergent.

## Hors périmètre

- aucune page métier modifiée ;
- aucune navigation modifiée ;
- aucune donnée, feuille Google Sheets, colonne, route API ou règle métier modifiée ;
- aucune couleur FEBACO ou COC imposée à FEVOCO.

## Contrôles

- `npm.cmd run lint` : réussi.
- `npm.cmd run build` : réussi, toutes les routes ont été compilées.
- Script `typecheck` : absent du `package.json`.
- Script `test` : absent du `package.json`; aucun test automatisé dans le dépôt.
- Vérification visuelle navigateur : non exécutable dans cette session, car le
  runtime du navigateur intégré n’est pas disponible. La validation responsive
  finale reste donc à effectuer sur un navigateur réel.

## État de clôture

- Feuilles Google Sheets créées ou adaptées : aucune.
- Colonnes ajoutées : aucune.
- Mappings modifiés : aucun.
- Métier, API et navigation modifiés : aucun.
- Commit et push : aucun.
