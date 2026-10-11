# Distinctions : colonne beneficiaire separee

11 octobre 2026.

Reference lue uniquement : febaco-reference/components/dashboard/competition-distinctions-panel.tsx, DistinctionList. FEBACO separe la distinction du nom de son beneficiaire.

Fichier modifie : components/competitions/competition-distinction-manager.tsx. Suppression du nom sous le badge de distinction ; ajout de la colonne Beneficiaire apres Epreuve. Colonnes Club, Phase ou match, Statut et Actions conservees. Colspan de l'etat vide adapte aux competitions ouvertes et fermees. Aucun nouveau mapping, appel reseau ou changement metier.

Validation : ESLint cible, TypeScript independant, build et git diff --check reussis. Playwright 1440x1000 et 390x1000 : sept en-tetes, ligne reelle CHAMPION / LA LOI avec distinction et beneficiaire dans deux cellules distinctes ; panneau, dates et annulation verifies, sauvegarde valide interceptee sans ecriture Google. Aucune erreur JavaScript. Serveur temporaire 3100 arrete.

Ecart restant hors demande : FEBACO comporte aussi Type et Date et des cartes mobiles ; ce lot corrige seulement la separation du nom et de la distinction.

Git diff --stat : un composant, 4 insertions et 3 suppressions. Git status --short (code suivi) : M components/competitions/competition-distinction-manager.tsx. Present rapport et captures QA locales non suivis. Aucun nouveau commit ou push pour cette correction.
