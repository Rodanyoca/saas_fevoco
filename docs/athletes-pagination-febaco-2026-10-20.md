# Liste Athlètes — pagination et filtres FEBACO

## Comparaison préalable

Référence : `febaco-reference/app/dashboard/athletes/page.tsx` et `components/dashboard/data-table.tsx`, lus uniquement.

| Élément | FEBACO | FEVOCO avant | Adaptation prévue |
|---|---|---|---|
| Pagination | 10 lignes par défaut, choix 10/25/50/100, précédent/suivant et numéro de page | Tous les athlètes rendus ensemble | Même pagination sur les résultats filtrés, ordinateur et mobile |
| Compteur bas de liste | Nombre de résultats filtrés | Compteur ActorTable explicitement désactivé, aucun pied de liste | Plage affichée, nombre filtré et total des athlètes chargés |
| Recherche | Largeur plafonnée max-w-md, label visible | flex-1 sans largeur maximale | Recherche compacte 320 px sur écran large, pleine largeur sur mobile |
| Filtres | Labels persistants et alignement en bas des champs | Aucun label ; deux sélecteurs affichent « Tous » sans contexte | Labels Club/Sexe/Statut, options explicites, clubs triés, réinitialisation |

Périmètre : liste FEVOCO seulement, aucun changement de données, permissions ou formulaire de fiche. Filtrage avant pagination, retour en première page après une recherche/filtre/changement de taille, borne de page après actualisation des données, état vide 0–0 et boutons désactivés. Retour depuis une fiche conservant filtres/page. Compteur fondé sur les données réellement chargées, sans appel Sheets par page.

Validation visuelle non réalisée à ce stade : aucun navigateur disponible dans la session. Contrôles prévus : tests de pagination, lint, TypeScript et build.

## Réalisation et contrôles

- `components/athletes/athletes-client.tsx` : pagination après filtrage et tri, dix lignes initiales, choix 10/25/50/100, compteur plage/résultats/total des athlètes chargés en bas, précédent/suivant accessibles. Table et cartes mobiles reçoivent la même tranche.
- `components/athletes/athletes-filters.tsx` : recherche plafonnée à 320 px dès `sm`, champs pleine largeur sous `sm`, labels persistants associés par useId, options Club/Sexe/Statut explicites, clubs triés et réinitialisation. Sexe et statut utilisent les valeurs réellement présentes plutôt que des options codées qui pouvaient ne correspondre à aucune ligne.
- `components/athletes/athletes-table.tsx` : message vide adapté aux filtres, sans modifier le tableau partagé des autres familles.
- `lib/list-pagination.ts` et `tests/unit/list-pagination.test.ts` : calcul borné de la tranche, quatre tests couvrant dernière page, absence de doublons/pertes, réduction des données, état vide et changement de taille sans mutation de source.

Les quatre tests, ESLint ciblé, TypeScript sans émission, `git diff --check` et build de production réussissent. Le build Next ignore les types dans la configuration existante ; la vérification TypeScript a été exécutée séparément. Vérification React : hooks stables, données dérivées sans effet de synchronisation, réinitialisation dans les actions utilisateur, libellés et commandes clavier accessibles.

La validation visuelle ordinateur/mobile, le focus et la manipulation réelle des filtres en navigateur restent ouverts ; aucune capture ni contrôle visuel revendiqué. Aucun commit, push ou déploiement. Les changements de navigation du lot précédent et les fichiers préexistants sont conservés.

## État du dépôt

Les sorties suivantes incluent aussi les modifications préexistantes et le lot navigation précédent.

```text
git diff --stat
 app/layout.tsx                            | 12 +++-
 components/athletes/athletes-client.tsx   | 35 ++++++++++--
 components/athletes/athletes-filters.tsx  | 91 +++++++++++++------------------
 components/athletes/athletes-table.tsx    |  4 +-
 components/dashboard/dashboard-layout.tsx | 43 ++++++++-------
 5 files changed, 106 insertions(+), 79 deletions(-)
```

```text
git status --short
 M app/layout.tsx
 M components/athletes/athletes-client.tsx
 M components/athletes/athletes-filters.tsx
 M components/athletes/athletes-table.tsx
 M components/dashboard/dashboard-layout.tsx
 M tsconfig.json
?? docs/arbitres-qa/
?? docs/athletes-pagination-febaco-2026-10-20.md
?? docs/athletes-qa/
?? docs/audit-visuel-competitions/
?? docs/autres-acteurs-qa/
?? docs/clubs-version-qa/
?? docs/coachs-qa/
?? docs/competition-detail-qa/
?? docs/competition-distinctions-cnac-qa/
?? docs/competition-equipes-affichage-qa/
?? docs/competition-equipes-colonnes-qa/
?? docs/competition-equipes-modification-qa/
?? docs/competition-equipes-qa/
?? docs/competition-phases-qa/
?? docs/diagnostic-navigation-2026-10-20.md
?? docs/entourage-qa/
?? docs/medecins-qa/
?? docs/navigation-persistante-febaco-2026-10-20.md
?? docs/officiels-qa/
?? lib/list-pagination.ts
?? test-results/
?? tests/unit/dashboard-navigation-lifecycle.test.ts
?? tests/unit/list-pagination.test.ts
```

Ajustement demandé : pied gauche limité au total des athlètes ; plage et nombre filtré retirés. Choix du nombre par page regroupé à droite avec les commandes de pagination. ESLint ciblé réussi.

Ajustement suivant : suppression du bouton Réinitialiser, de sa prop onReset, du gestionnaire resetFilters et du calcul hasFilters. Les filtres restent modifiables individuellement.

Dernier ajustement visuel demandé : disposition FEBACO du pied de liste (Afficher + sélecteur 70 px + total atténué à gauche, chevrons outline sm et numéro de page à droite, gap 8 px). Le total reste la seule information de comptage, sans plage ni compteur filtré. Retour à la ligne conservé sur petits écrans. ESLint ciblé et diff check réussis ; validation navigateur non réalisée.
