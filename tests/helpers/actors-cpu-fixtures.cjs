function actorLicenceFixture(count = 100) {
  return {
    licences: Array.from({ length: count }, (_, i) => ({ id_licence: `LIC-${i}`, id_acteur: `C-${i}`, id_type_acteur: 'TAC002', id_cycle_licence: 'CY1', id_statut_licence: 'ST1', id_affiliation_acteur: `AF-${i}`, numero_licence: `NUM-${i}`, date_debut_validite: '2026-01-01', date_fin_validite: '2026-12-31', date_delivrance: '2026-01-01' })),
    actors: { COACHS: Array.from({ length: count }, (_, i) => ({ id_coach: `C-${i}`, nom_complet: `Test ${i}`, statut: 'ACTIF' })) },
    affiliations: { COACH_AFFILIATIONS: Array.from({ length: count }, (_, i) => ({ id_affiliation_coach: `AF-${i}`, id_coach: `C-${i}`, id_club: `CL-${i}`, id_statut_affiliation: 'SAF001', date_debut: '2026-01-01', date_fin: '' })) },
    structures: { CLUBS: Array.from({ length: count }, (_, i) => ({ id_club: `CL-${i}`, nom_club: `Club ${i}` })) },
    refs: { TYPES_ACTEURS: [{ id_type_acteur: 'TAC002', nom_type_acteur: 'Coach' }], STATUT_LICENCE: [{ id_statut_licence: 'ST1', nom_statut_licence: 'ACTIF' }], STATUTS_AFFILIATION: [{ id_statut_affiliation: 'SAF001', nom_statut_affiliation: 'ACTIF' }], CYCLES_LICENCES: [{ id_cycle_licence: 'CY1', nom_cycle_licence: 'Annuel' }] },
  }
}
module.exports = { actorLicenceFixture }
