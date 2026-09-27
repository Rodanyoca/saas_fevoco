# Design QA — fiche Club FEVOCO

## Référence et état contrôlé

- Source visuelle : `docs/design-qa-assets/febaco-club-detail-1440.png`
- Implémentation : `docs/design-qa-assets/fevoco-club-detail-after-1440.png`
- Viewport : 1440 × 900, densité 1
- État : fiche du club « Volley Club Kinshasa », relations athlètes vides

## Comparaison

La fiche FEVOCO reprend la composition de la fiche FEBACO : barre d’actions, carte d’identité, deux cartes de renseignements, quatre tuiles de synthèse et tableau associé. Les espacements, rayons, bordures, hiérarchie typographique et dimensions des composants suivent les mêmes primitives visuelles.

Les accents interactifs et les pictogrammes de la fiche sont dorés. Aucun accent bleu n’est utilisé dans cette vue. Le pseudo de l’entente est affiché, conformément au référentiel FEVOCO.

## Adaptations métier intentionnelles

- « Version » est adapté en « Sexe » selon le référentiel FEVOCO.
- La date de création disponible dans FEVOCO est conservée dans la carte Affiliation.
- La section « Équipes du club » de FEBACO n’est pas reproduite : FEVOCO ne possède pas cette relation territoriale et aucune donnée métier artificielle n’est introduite.
- Les sections FEBACO dépendant des équipes (staff et compétitions rattachées via une équipe) ne sont pas inventées dans FEVOCO.

## Résultat

passed

