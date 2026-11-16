type Row = { athleteId: string; seasonId: string; clubId: string; sexe: string; statut: string }
export const emptyAthleteLicenceSummary = Object.freeze({ total: 0, hommes: 0, femmes: 0, actives: 0, nonActives: 0 })

function summarize(rows: Iterable<Row>) {
  const result = { ...emptyAthleteLicenceSummary }
  for (const row of rows) {
    result.total++
    if (/^(M|MASCULIN|HOMME)$/i.test(row.sexe.trim())) result.hommes++
    if (/^(F|FÉMININ|FEMININ|FEMME)$/i.test(row.sexe.trim())) result.femmes++
    if (/^(ACTIF|ACTIVE|VALIDE)$/i.test(row.statut.trim())) result.actives++
    else result.nonActives++
  }
  return result
}

export function athleteLicenceSummaries<T extends Row>(rows: T[]) {
  const all = new Map<string, Row>(), clubs = new Map<string, Map<string, Row>>()
  for (const row of rows) {
    // Preserve the original last-row-wins athlete/season key, globally and per club.
    const key = `${row.athleteId}:${row.seasonId}`
    all.set(key, row)
    let group = clubs.get(row.clubId)
    if (!group) { group = new Map(); clubs.set(row.clubId, group) }
    group.set(key, row)
  }
  return { totals: summarize(all.values()), byClub: new Map([...clubs].map(([id, group]) => [id, summarize(group.values())])) }
}
