# Correction du Select de création de licence

Une ligne CLUBS sans `id_club` pouvait être conservée lors de la construction des options. Le formulaire transmettait alors `value=""` à SelectItem, valeur réservée par Radix à l’effacement de la sélection et au placeholder.

Correction : exclure les clubs sans identifiant à la source et filtrer les identifiants vides ou composés d’espaces dans les quatre listes du formulaire (clubs, saisons, affiliations et statuts). Aucun identifiant de remplacement ni donnée fictive n’est introduit.

Fichiers : `lib/athlete-licence-creation.ts`, `components/licences/athlete-licence-form.tsx`. Composants concernés : AthleteLicenceForm, options de création. Aucun changement de schéma Sheets ou de permissions.

Le test navigateur isolé `node_modules/.cache/club-actors-ui/verify-licence-selects.cjs` injecte des options vides et des espaces : chaque liste ne propose que l’option valide et les quatre sélections fonctionnent sans erreur runtime. ESLint ciblé réussi. Les tests ne font aucune écriture Google.

État Git du lot : les deux fichiers existaient déjà comme non suivis avant cette correction, donc ils n’apparaissent pas dans `git diff --stat`.

```text
?? components/licences/athlete-licence-form.tsx
?? lib/athlete-licence-creation.ts
?? docs/correction-select-licences.md
```

Aucun commit ni push. Les travaux précédents sont conservés.
