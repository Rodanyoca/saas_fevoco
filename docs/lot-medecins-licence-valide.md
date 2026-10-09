# Médecins : numéro de licence valide dans la liste

9 octobre 2026.

Colonne Licence ajoutée au tableau et aux cartes mobiles existantes. Le client utilise les licences déjà chargées avec la page et la fonction commune `activeActorLicenceNumbers` : statut actif, dates valides, période contenant le jour courant à Kinshasa, bornes incluses. Sans licence valide, le tableau affiche son tiret habituel et la carte « Non renseigné ». La recherche reconnaît aussi le numéro affiché. La pagination est conservée.

Lors d'un remplacement local depuis le formulaire existant, l'ancien identifiant de statut actif est effacé de la licence désactivée, afin que sa valeur ne contredise pas son nouveau statut inactif lors du calcul de la colonne.

Aucun nouveau chargeur, endpoint ou appel Google ajouté. La sélection est calculée en mémoire une fois pour les licences chargées, puis consultée par identifiant médecin.

## Vérification

- Trois tests de la fonction commune passent : périodes et bornes, exclusions par statut/dates, sélection déterministe lors d'un renouvellement.
- TypeScript indépendant, ESLint ciblé, build de production et contrôle du diff réussis.
- Playwright sur l'application réelle avec Google en lecture seule : bureau 1440 × 1000 et mobile 390 × 844, aucun débordement ni erreur JavaScript, zéro requête API de données supplémentaire. Les avatars restent chargés séparément.
- La source ne contient aucune licence médecin valide au moment du contrôle. Le navigateur vérifie donc l'état vide ; l'affichage d'un numéro valide et sa recherche ne sont pas exercés sur des données réelles de médecins. Leur sélection est couverte par la fonction commune testée.
- Aucune écriture Google. Serveur temporaire 3100 arrêté après vérification.

Limite observée : la page affiche aussi son avertissement de données partiellement indisponibles. Le journal serveur identifie une lecture préexistante échouant sur `EQUIPE_NATIONALE!A:Z` ; elle ne concerne pas le nouveau calcul des licences. Ce chargeur n'a pas été modifié dans ce lot.

Captures inspectées : [bureau](medecins-qa/licence-desktop.png), [mobile](medecins-qa/licence-mobile.png).

Fichiers modifiés : `components/medecins/medecins-client.tsx`, `components/medecins/medecins-table.tsx`, ce rapport. Réutilisation d'ActorTable ; aucun composant porté. Aucun commit ni push pour ce lot. L'état Git suivant inclut les captures locales des lots précédents.

### git diff --stat

```text
 components/medecins/medecins-client.tsx | 12 ++++++++----
 components/medecins/medecins-table.tsx  |  3 ++-
 2 files changed, 10 insertions(+), 5 deletions(-)
```

### git status --short

```text
 M components/medecins/medecins-client.tsx
 M components/medecins/medecins-table.tsx
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/coachs-qa/
?? docs/entourage-qa/
?? docs/lot-medecins-licence-valide.md
?? docs/medecins-qa/
?? test-results/
```
