# Autres acteurs FEVoco : liste et fiche selon FEBACO

9 octobre 2026. Perimetre corrige a la precision utilisateur : autres acteurs. Les modifications des officiels du lot precedent sont conservees dans le travail local ; ce lot modifie uniquement les trois composants autres-acteurs.

References FEBACO lues sans modification : app/dashboard/autres/page.tsx, app/dashboard/autres/[id]/page.tsx et components/dashboard/data-table.tsx.

Liste : colonnes ID, Nom complet, Sexe, Telephone, Statut, Actions, comme FEBACO. Retrait des compteurs, du type et de l'age en liste, ainsi que des filtres supplementaires absents de la reference. Recherche compacte conservee et pagination 10/25/50/100 avec compteur de resultats. ID et nom peuvent revenir a la ligne pour les longues valeurs. Le type reste dans la fiche et participe a la recherche. Presentation du conteneur alignee sur DataTable FEBACO. Les cartes mobiles reprennent les memes informations et les boutons de consultation existants.

Fiche : nom de l'acteur en titre, trois DetailCard Identite, Coordonnees, Observations et grille a deux colonnes comme la reference. Correction du libelle General qui affichait des points d'interrogation. Lieu de naissance et informations de passeport conserves pour FEVoco. L'onglet Affiliations, absent de la fiche FEBACO, reste disponible pour le parcours metier FEVoco. Aucun changement du formulaire, des mappers, API, chargements ou ecritures Google. Aucun nouveau composant global porte.

Fichiers modifies : components/autres-acteurs/autres-acteurs-table.tsx, components/autres-acteurs/autres-acteurs-client.tsx et components/autres-acteurs/autre-acteur-detail.tsx.

Validation : ESLint cible, TypeScript independant, build et git diff --check reussis. Playwright sur application reelle controle les six en-tetes, l'etat vide, le choix 25 lignes, la recherche et le rendu bureau 1440x1000/mobile 390x844 sans debordement de page ni erreur JavaScript. Aucune requete API de donnees supplementaire. Captures liste-desktop.png et liste-mobile.png inspectees dans docs/autres-acteurs-qa.

Limite : aucun autre acteur renvoye par l'application lors du controle. Le premier test a signale l'impossibilite d'ouvrir une fiche reelle ; son controle n'est donc pas declare reussi. La fiche est comparee au code de reference et validee par lint/typecheck/build, mais sa verification visuelle avec donnees reelles reste a faire lorsqu'un acteur sera disponible. Aucune donnee fictive ni ecriture Google pour contourner cette limite. Serveur temporaire arrete. Aucun commit ni push.

Le relevé Git ci-dessous comprend les lots precedents conserves.
 
## git diff --stat
```text
 app/api/officiels/[id]/licences/route.ts           | 19 ------
 components/actors/affiliations-panel.tsx           |  5 +-
 components/actors/record-sections.tsx              |  6 +-
 components/autres-acteurs/autre-acteur-detail.tsx  |  3 +-
 .../autres-acteurs/autres-acteurs-client.tsx       | 20 +-----
 components/autres-acteurs/autres-acteurs-table.tsx | 22 ++++---
 components/medecins/medecins-client.tsx            | 12 ++--
 components/medecins/medecins-table.tsx             |  3 +-
 components/officiels/officiel-detail.tsx           | 24 +++-----
 .../officiels/officiel-licence-form-dialog.tsx     | 64 -------------------
 components/officiels/officiels-client.tsx          |  2 +-
 components/officiels/officiels-filters.tsx         |  2 +-
 components/officiels/officiels-table.tsx           | 29 +++++----
 lib/actor-affiliation-schema.ts                    |  5 +-
 lib/actor-affiliations.ts                          |  3 +-
 lib/actor-licences-model.test.ts                   | 10 +++
 lib/actor-licences-model.ts                        |  5 +-
 lib/actor-records.ts                               |  9 ++-
 lib/affiliations-domain.test.ts                    | 17 +++++
 lib/affiliations-domain.ts                         | 11 ++--
 lib/officiel-licence-mutations.ts                  | 72 ----------------------
 lib/types.ts                                       |  1 +
 22 files changed, 115 insertions(+), 229 deletions(-)
```
## git status --short
```text
 D app/api/officiels/[id]/licences/route.ts
 M components/actors/affiliations-panel.tsx
 M components/actors/record-sections.tsx
 M components/autres-acteurs/autre-acteur-detail.tsx
 M components/autres-acteurs/autres-acteurs-client.tsx
 M components/autres-acteurs/autres-acteurs-table.tsx
 M components/medecins/medecins-client.tsx
 M components/medecins/medecins-table.tsx
 M components/officiels/officiel-detail.tsx
 D components/officiels/officiel-licence-form-dialog.tsx
 M components/officiels/officiels-client.tsx
 M components/officiels/officiels-filters.tsx
 M components/officiels/officiels-table.tsx
 M lib/actor-affiliation-schema.ts
 M lib/actor-affiliations.ts
 M lib/actor-licences-model.test.ts
 M lib/actor-licences-model.ts
 M lib/actor-records.ts
 M lib/affiliations-domain.test.ts
 M lib/affiliations-domain.ts
 D lib/officiel-licence-mutations.ts
 M lib/types.ts
?? docs/arbitres-qa/
?? docs/athletes-qa/
?? docs/autres-acteurs-qa/
?? docs/coachs-qa/
?? docs/entourage-qa/
?? docs/lot-autres-acteurs-febaco.md
?? docs/lot-medecins-licence-valide.md
?? docs/lot-officiels-colonne-licence.md
?? docs/medecins-qa/
?? docs/officiels-qa/
?? test-results/
```
