# Recherche des athlètes dans une licence

Intervention locale dans `data/monosport/fevoco-managment`, sur les travaux en cours de la branche `feature/competitions-fevoco`. Aucun commit ni changement des travaux parallèles. Signalement : après sélection d’un club dans Enregistrer une licence, l’athlète attendu n’apparaît pas.

## Diagnostic

Les sources Affiliations et Acteurs ont été vérifiées en lecture seule sur les identifiants fournis par l’utilisateur, sans copie de noms, contacts ou autres données personnelles dans les preuves. Le rattachement ciblé existe, est actif, débute avant la date courante et n’a pas de fin. Le club ciblé n’a pas de compteur A_VERIFIER. Aucune réparation de données n’est nécessaire pour ce rattachement.

Sources consultées : [Affiliations](https://docs.google.com/spreadsheets/d/1ibsyycExJF5IMlNlWKzkTwX5ug13nnwgUhCYHd6lTMs/edit), [Acteurs](https://docs.google.com/spreadsheets/d/1CdtZDlfEAlxBeC0XkwiH_OayXajBUN_N05TQuAJvbZI/edit), [Compteurs](https://docs.google.com/spreadsheets/d/1vPsu-Vog5d4CK_f7BK4e4BaU72QTQwz-jPypE22iUYo/edit). Métadonnées et en-têtes vérifiés avant recherches bornées ; aucune écriture Google.

Le banc initial avec un seul club sélectionné passait : il ne couvrait pas le retour rapide dans un champ ni le changement de club. Le scénario étendu échouait en attendant le résultat du deuxième club. Après instrumentation synthétique, le texte recherché était présent mais le menu était fermé : un ancien timeout de blur fermait la liste après que le champ avait retrouvé le focus. Le code effaçait aussi la nouvelle requête lorsqu’une saisie vidait une sélection existante. Enfin, une recherche d’athlète non sélectionnée pouvait subsister lors d’un changement de club.

Aucune exception JavaScript ni erreur réseau précise correspondant au signalement n’a été reproduite : les défauts confirmés concernent les états du sélecteur. L’accès automatisé à l’onglet réel n’a pas permis de reproduire le formulaire authentifié complet ; les preuves de correction sont celles des composants réels avec API simulées.

## Corrections

- `components/ui/search-select.tsx` : suppression du délai de fermeture : le blur ferme immédiatement et le focus ouvre immédiatement ; les boutons de résultat conservent le focus au mouse-down pour que le clic sélectionne correctement ; conservation de la saisie lorsqu’elle sert à remplacer une sélection. La saisie rouvre les résultats même si le champ a conservé le focus après la sélection précédente. Les changements externes de sélection continuent de synchroniser le libellé. Les options et le seuil de deux caractères restent inchangés.
- `components/licences/athlete-licence-editor.tsx` : réinitialisation du sélecteur d’athlète par clé du club ; indication du nombre d’affiliations disponibles, consigne de recherche par nom ou identifiant et message distinct quand le club n’a aucune affiliation. Le lien enregistré reste l’identifiant d’affiliation, pas l’identifiant d’athlète.
- `scripts/verify-sports-ui.cjs` : deux clubs avec athlètes synthétiques distincts et un club vide ; changement rapide de champ, remplacement d’un club sélectionné, remise à zéro de l’ancienne recherche, recherche par identifiant, exclusion des autres clubs et absence de nouvelles lectures/écritures pendant la recherche. Le mode `--reuse-bundle` est réservé au diagnostic après compilation du banc ; la validation finale utilise une compilation fraîche.

La sélection du club et la recherche utilisent uniquement les options déjà chargées. Aucun nouvel appel Google, cache, endpoint ou changement de permissions/mutation n’est ajouté. Le composant partagé reste dans le seul dépôt FEVOCO.

## Validation

`node scripts/verify-sports-ui.cjs` exerce les composants réels à 1440×1000 et 390×844. Le scénario conserve aussi les tests de numéro non éditable, date compacte et reprise identique après 503 simulée. Les preuves synthétiques sont actualisées sous `docs/performance/sports-ui-2026-11-05/` ; elles ne contiennent pas les données de l’athlète réel.

Lint ciblé et TypeScript indépendant sont exécutés ; résultats finaux indiqués ci-dessous. Le build complet du lot sportif reste non validé après sa tentative isolée interrompue, documentée dans [le rapport du lot](transferts-licences-sportives-2026-11-05.md). Aucun succès de build ni validation réelle d’écriture Google n’est revendiqué pour ce correctif.

Retour arrière ciblé : retirer les trois changements de cycle de recherche dans SearchSelect, la clé/les messages du champ athlète et les scénarios associés. Ne pas restaurer intégralement les fichiers, qui contiennent les travaux sportifs précédents. Aucun rollback de données à effectuer.

Résultat navigateur final : **PASS**, zéro erreur JavaScript, une seule lecture initiale du panneau et zéro nouvelle requête lors des changements de club/recherches. Deux écritures simulées uniquement lors du test de soumission et de sa reprise, jamais dans Google. Lint ciblé sans avertissement ; contrôle TypeScript final **réussi** avec cache `.licence-club-verification.tsbuildinfo` isolé, ensuite supprimé. `git diff --check` réussi. Les fichiers modifiés de ce correctif sont les deux composants cités, le banc UI, ses preuves et ce rapport ; les autres fichiers du statut Git restent les travaux préexistants. Le diff Git cumulé des deux composants est de 41 insertions/25 suppressions et inclut aussi les changements du lot sportif précédent dans l'éditeur : il ne représente pas ce seul correctif.
