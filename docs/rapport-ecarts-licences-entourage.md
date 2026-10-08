# Licences de l’entourage : écarts FEBACO / FEVoco et adaptation

Date : 8 octobre 2026. Périmètre : `/licences/entourage` dans FEVoco, avec FEBACO comme référence d’interface. FEBACO est consulté en lecture seule. Les modifications locales préexistantes sont conservées.

## Résultat

FEVoco reprend la structure de FEBACO : bouton d’enregistrement, six indicateurs, répartition par type, échéances, tableau encadré, filtres et panneau latéral. Le parcours permet l’enregistrement, la consultation avec historique, la modification, le renouvellement et les transitions de statut. Les règles FEVoco sont appliquées côté serveur et les écritures ciblent `ACTEURS_LICENCES` dans le classeur des licences.

## Méthode et limites de la comparaison

La comparaison associe lecture du code, captures Playwright des composants réels et consultation Google Sheets en lecture seule. La compétence d’audit Product Design a guidé la comparaison visuelle. Le navigateur intégré n’était pas disponible ; l’utilisateur a autorisé Playwright et des serveurs temporaires, à arrêter après vérification.

Les captures FEBACO et FEVoco avant/après sont réalisées dans un banc isolé, aux mêmes dimensions (1440 × 1000 et 390 × 844). FEBACO est rendu sans modifier ni démarrer son projet : données de liste vides, références vérifiées et rôle fédéral simulé pour afficher son bouton d’ajout. Il ne s’agit pas d’un audit d’une session FEBACO authentifiée ni de ses données de production. La liste vide correspond à l’état réel observé dans `ACTEURS_LICENCES` de FEVoco.

La page FEVoco finale a également été ouverte depuis le build de production local avec ses sources Google réelles. Aucune licence de test n’a été écrite dans Google : les mutations sont testées séparément avec les routes et services réels et un transport Sheets simulé.

## Parcours et preuves

1. **Liste avant adaptation — incomplète** : quatre indicateurs, trois filtres issus des licences présentes, aucun ajout ni action de ligne. [Desktop avant](entourage-qa/before-desktop.png), [mobile avant](entourage-qa/before-mobile.png).
2. **Référence FEBACO — parcours plus complet** : six indicateurs, deux synthèses, filtre d’échéance, panneau d’enregistrement et actions de ligne. [Desktop FEBACO](entourage-qa/basket-desktop.png), [mobile FEBACO](entourage-qa/basket-mobile.png), [formulaire FEBACO](entourage-qa/basket-form.png).
3. **FEVoco adapté — structure harmonisée** : même ordre des sections, dimensions de grille et panneau latéral ; vocabulaire et contraintes d’affiliation FEVoco conservés. [Desktop adapté](entourage-qa/after-desktop.png), [mobile adapté](entourage-qa/after-mobile.png), [formulaire adapté](entourage-qa/after-form.png).
4. **FEVoco avec Google réel — lecture vérifiée** : page chargée, référentiels disponibles, dates progressives et exception des arbitres vérifiées. [Page réelle](entourage-qa/live-desktop.png), [mobile réel](entourage-qa/live-mobile.png), [formulaire réel](entourage-qa/live-form.png).
5. **Mutations — vérifiées en stockage simulé** : création, date impossible refusée sans écriture, consultation, modification, suspension, renouvellement, actualisation, recherche, état d’erreur et rendu mobile. Ce test ne valide pas une écriture réelle Google.

Chaque capture référencée a été ouverte et inspectée. Les premières captures de panneaux prises pendant l’animation ont été remplacées par des captures stables.

## Tableau des écarts

| Élément | FEBACO | FEVoco avant | Adaptation réalisée |
|---|---|---|---|
| Ajout | Bouton et panneau latéral | Absent sur cette page | Bouton doré et panneau d’enregistrement |
| Indicateurs | Total, valides, à venir, expirées, suspendues, expiration ≤ 30 j | Quatre indicateurs | Six indicateurs calculés sur les lignes filtrées |
| Synthèses | Répartition par type et échéances à 30/60/90 jours | Absentes | Deux blocs avec les mêmes grilles |
| Filtres | Recherche, type, statut, cycle, échéance, réinitialisation | Type/cycle/statut déduits des lignes | Options issues des référentiels même si la liste est vide |
| Tableau | Numéro, acteur et identifiant, type, cycle, délivrance, début, expiration, statut, actions | Colonnes d’affiliation et période, sans actions | Ordre FEBACO ; affiliation et statut enregistré accessibles dans le panneau |
| Consultation | Panneau et historique de l’acteur | Absente | Consultation en lecture seule et historique par couple type/acteur |
| Modification / renouvellement | Actions de ligne | Absents | Modification conservant l’identité ; renouvellement créant une nouvelle période |
| Statuts | Suspendre, réactiver, clôturer, annuler | Aucun contrôle depuis la page | Actions confirmées et transitions validées côté serveur |
| Affiliation | Indépendance vis-à-vis d’une affiliation | Donnée affichée, parcours absent | Affiliation active obligatoire pour coach/officiel/médecin ; interdite pour arbitre |
| Dates | Champs date natifs dans le formulaire de référence | Pas de formulaire | `CompactDateInput`, saisie JJMMAAAA, affichage JJ/MM/AAAA et validation serveur |
| Mobile | Cartes de licences | Tableau horizontal | Cartes mobiles, actions conservées, absence de débordement vérifiée |
| Lecture / écriture | Service unifié de licences acteurs | Lecture ACTEURS_LICENCES ; anciens services d’écriture séparés | Nouveau parcours unifié sur ACTEURS_LICENCES |

## Analyse Google et mapping vérifié

Les en-têtes et les référentiels ont été lus directement dans Google le 8 octobre 2026. `ACTEURS_LICENCES` possède les onze colonnes ci-dessous et ne contenait aucune licence lors de l’analyse.

| En-tête réel | Origine / contrôle |
|---|---|
| `id_licence` | Généré côté serveur : `VOL-ACL-AAAA-NNNNNN`, conservé en modification |
| `id_type_acteur` | `TYPES_ACTEURS` : TAC002 coach, TAC003 officiel, TAC004 arbitre, TAC005 médecin |
| `id_acteur` | Identité existante dans COACHS, OFFICIELS, ARBITRES ou MEDECINS, selon le type |
| `id_affiliation_acteur` | Affiliation du même acteur et du même type ; vide pour arbitre |
| `id_cycle_licence` | `CYCLES_LICENCES` : CYC001 SPORTIF, CYC002 ADMINISTRATIF |
| `numero_licence` | Numéro officiel obligatoire, distinct de l’identifiant technique |
| `date_delivrance` | Date civile obligatoire, au plus tard au début de validité |
| `date_debut_validite` | Date civile obligatoire ; affiliation active à cette date |
| `date_fin_validite` | Date civile obligatoire, supérieure ou égale au début |
| `id_statut_licence` | `STATUT_LICENCE` : STL001 ACTIVE, STL002 EXPIREE, STL003 SUSPENDUE, STL004 CLOTUREE, STL005 ANNULEE, STL099 AUTRE |
| `observations` | Texte facultatif |

Les identités sont jointes par `id_coach`, `id_officiel`, `id_arbitre`, `id_medecin`. Les affiliations utilisent `id_affiliation_coach`, `id_affiliation_officiel`, `id_affiliation_medecin`. Coachs et médecins pointent vers `id_club` ; les officiels vers `id_type_entite` et `id_entite`. Les libellés sont résolus depuis les structures et référentiels, sans duplication dans la feuille des licences.

La fédération utilise les en-têtes réels `id_federation` et `nom_officiel`. Aucun champ ou identifiant basketball n’est ajouté, même si certains en-têtes historiques du référentiel contiennent déjà des termes basketball.

Les dates historiques peuvent être numériques (exemple observé : `45323`) : conversion à la lecture via `formatDateFromSheet`. Les nouvelles écritures passent par `formatDateForSheet`, au format `YYYY-MM-DD`, avec format de cellule `yyyy-mm-dd`. Une date historique invalide est signalée comme `DATES_INVALIDES`, sans faux statut valide.

## Logique serveur

- API commune : `POST`, `PUT`, `PATCH /api/licences/acteurs`.
- Réutilisation du domaine existant, complété pour modification et transitions.
- Vérification des identités, références, affiliation active et existence de la structure ; exception explicite de l’arbitre.
- Refus des périodes chevauchantes pour le même type/acteur, bornes inclusives ; les licences annulées sont exclues du contrôle de chevauchement.
- Renouvellement : nouvelle licence, numéro conservé par défaut et début proposé au lendemain de l’expiration. Aucune modification automatique de l’ancienne période.
- Relecture fraîche des licences avant mutation ; file de mutations pour une instance serveur ; invalidation du cache et actualisation des pages concernées.
- Statut effectif calculé selon les dates, sans écraser le statut administratif enregistré.

## Vérifications

- TypeScript sans émission : réussi, indépendamment du build qui ignore les erreurs de types par configuration préexistante.
- ESLint ciblé sur les fichiers du lot : réussi.
- Tests métier et mapping : 30 tests réussis, incluant les contrôles de dates et de rattachement club ; test d’intégration des routes : réussi. Dernier passage ciblé licences : 20 tests réussis.
- Build de production : réussi ; nouvelle route de licences acteurs présente.
- Playwright, composants réels et stockage simulé : création, consultation, modification, suspension, renouvellement, recherche, actualisation, erreur et mobile réussis.
- Playwright, application réelle et Google en lecture seule : chargement, références, dates progressives, exception arbitre, desktop/mobile réussis ; toute tentative de mutation interceptée.
- Captures inspectées et comparaison effectuée aux mêmes dimensions. Aucun débordement horizontal de page observé.
- Accessibilité : labels associés aux nouveaux champs, erreurs de formulaire annoncées par `role=alert`, actions nommées. Navigation clavier complète et audit lecteur d’écran non réalisés ; aucune conformité globale n’est revendiquée.

## Limites et écarts conservés

- L’authentification et les permissions de FEVoco restent celles du projet. Le rôle fédéral FEBACO n’est pas importé ni simulé dans l’application FEVoco.
- Les anciennes routes spécifiques aux acteurs et leurs services historiques ne sont pas migrés dans ce lot. Ils ne sont pas appelés par le nouveau parcours Entourage ; leur suppression ou migration constitue un travail distinct. Les nouvelles créations depuis cette page ciblent exclusivement le classeur des licences.
- La sérialisation des mutations couvre une instance serveur ; Google Sheets ne fournit pas ici de transaction ni de verrou distribué entre plusieurs instances.
- Les écritures réelles Google et leurs autorisations de modification n’ont pas été éprouvées par création d’une donnée de test. Les en-têtes et données réelles ont été lus ; le transport d’écriture est validé en simulation.
- Aucun commit ni push. Les serveurs temporaires ont été arrêtés ; la vérification finale ne trouve aucun processus Node des projets SNDS ni serveur en écoute sur les ports 3000–3009 et 3100.

## Fichiers du lot et état Git

Interfaces : `app/licences/entourage/page.tsx`, `components/licences/actor-licences-client.tsx`, nouveau `components/licences/actor-licence-editor.tsx`.

Serveur et mapping : nouveau `app/api/licences/acteurs/route.ts`, nouveaux `lib/actor-licence-creation.ts` et `lib/actor-licences-model.ts`, évolution de `lib/licences-domain.ts`, délégation de la lecture entourage dans `lib/licences-overview.ts`.

Tests : `lib/licences-domain.test.ts`, nouveaux `lib/actor-licences-model.test.ts` et `lib/actor-licence-api.test.cjs`. Preuves : ce rapport et `docs/entourage-qa/`. Les scripts temporaires de contrôle restent dans `node_modules/.cache/entourage-ui/`, hors Git.

Composants réutilisés : Card, DataTable, StatusBadge, Sheet, Select, SearchSelect et CompactDateInput. Structure portée depuis FEBACO : six indicateurs, synthèses, filtres, colonnes et panneau latéral.

`git diff --numstat` ciblé observé avant le rapport (inclut les modifications préexistantes dans les fichiers déjà modifiés ; les fichiers nouveaux ne figurent pas dans ce diff) :

```text
7   2   app/licences/entourage/page.tsx
51  7   components/licences/actor-licences-client.tsx
100 0   lib/licences-domain.test.ts
60  3   lib/licences-domain.ts
5   11  lib/licences-overview.ts
```

État ciblé : les cinq fichiers ci-dessus sont modifiés ; la route, l’éditeur, le service, le modèle, les deux nouveaux tests et les captures sont non suivis. Cet état inclut les travaux préexistants ; aucune autre modification n’est attribuée à ce lot.

`git diff --stat` ciblé final :

```text
 app/licences/entourage/page.tsx               |   9 ++-
 components/licences/actor-licences-client.tsx |  58 +++++++++++++--
 lib/licences-domain.test.ts                   | 100 ++++++++++++++++++++++++++
 lib/licences-domain.ts                        |  63 +++++++++++++++-
 lib/licences-overview.ts                      |  16 ++---
 5 files changed, 223 insertions(+), 23 deletions(-)
```

`git status --short` ciblé final, hors ce rapport et les captures :

```text
 M app/licences/entourage/page.tsx
 M components/licences/actor-licences-client.tsx
 M lib/licences-domain.test.ts
 M lib/licences-domain.ts
 M lib/licences-overview.ts
?? app/api/licences/acteurs/
?? components/licences/actor-licence-editor.tsx
?? lib/actor-licence-api.test.cjs
?? lib/actor-licence-creation.ts
?? lib/actor-licences-model.test.ts
?? lib/actor-licences-model.ts
```
