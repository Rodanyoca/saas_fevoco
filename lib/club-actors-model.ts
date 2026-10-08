type Row = Record<string, unknown>
export type ClubActorKind = "athletes" | "coachs" | "medecins" | "officiels" | "autres"
export type ClubActor = { id: string; nomComplet: string; sexe: string; telephone: string; email: string; statut: string; fonction: string }
export type ClubActorGroups = Record<ClubActorKind, ClubActor[]>
export type ClubActorsBundle = { byClub: Record<string, ClubActorGroups>; available: boolean; ignoredRelations: number }
const text = (value: unknown) => String(value ?? "").trim()
const normalize = (value: unknown) => text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
export const emptyClubActors = (): ClubActorGroups => ({ athletes: [], coachs: [], medecins: [], officiels: [], autres: [] })
const definitions = [
  { kind: "athletes", sheet: "ATHLETES", id: "id_athlete", affiliations: "ATHLETE_AFFILIATIONS", club: "id_club" },
  { kind: "coachs", sheet: "COACHS", id: "id_coach", affiliations: "COACH_AFFILIATIONS", club: "id_club" },
  { kind: "medecins", sheet: "MEDECINS", id: "id_medecin", affiliations: "MEDECIN_AFFILIATIONS", club: "id_club" },
  { kind: "officiels", sheet: "OFFICIELS", id: "id_officiel", affiliations: "OFFICIELS_AFFILIATIONS", club: "id_entite" },
  { kind: "autres", sheet: "AUTRES", id: "id_autre_acteur", affiliations: "AUTRES_AFFILIATIONS", club: "id_entite" },
] as const

export function buildClubActorIndex(sources: { actors: Record<string, Row[]>; affiliations: Record<string, Row[]>; references: Record<string, Row[]> }, today: string, canonicalDate: (value: string) => string): ClubActorsBundle {
  const labels = (sheet: string, id: string, name: string) => new Map((sources.references[sheet] || []).map(row => [text(row[id]), text(row[name])]))
  const sexes = labels("SEXES", "id_sexe", "nom_sexe")
  const statuses = labels("STATUTS_AFFILIATION", "id_statut_affiliation", "nom_statut_affiliation")
  const structureTypes = labels("TYPES_STRUCTURES", "id_type_structure", "nom_type_structure")
  const actorTypes = labels("TYPES_ACTEURS", "id_type_acteur", "nom_type_acteur")
  const functions = labels("FONCTION_OFFICIEL", "id_fonction", "nom_fonction")
  const otherTypes = labels("TYPES_AUTRES_ACTEURS", "id_type_autre_acteur", "nom_type_autre_acteur")
  const byClub: Record<string, ClubActorGroups> = Object.create(null)
  let ignoredRelations = 0
  const current = (row: Row) => {
    const statusId = text(row.id_statut_affiliation)
    const status = statusId ? statuses.get(statusId) : text(row.statut_affiliation || row.statut_mandat)
    if (!["ACTIF", "ACTIVE", "EN COURS"].includes(normalize(status))) return false
    try {
      const start = canonicalDate(text(row.date_debut)), end = canonicalDate(text(row.date_fin))
      return (!start || start <= today) && (!end || end >= today) && (!start || !end || start <= end)
    } catch { ignoredRelations++; return false }
  }
  for (const def of definitions) {
    const identities = new Map((sources.actors[def.sheet] || []).filter(row => text(row[def.id])).map(row => [text(row[def.id]), row]))
    const relations = [...(sources.affiliations[def.affiliations] || [])]
    // Les mandats historiques restent une source de rattachement des officiels.
    if (def.kind === "officiels") relations.push(...(sources.affiliations.MANDATS || []).filter(row => normalize(actorTypes.get(text(row.id_type_acteur))) === "OFFICIEL"))
    for (const relation of relations) {
      const mandate = def.kind === "officiels" && Boolean(text(relation.id_mandat))
      const clubId = text(mandate ? relation.id_structure : relation[def.club])
      if (!clubId) continue
      if (["officiels", "autres"].includes(def.kind) && normalize(structureTypes.get(text(mandate ? relation.id_type_structure : relation.id_type_entite))) !== "CLUB") continue
      if (!current(relation)) continue
      const id = text(mandate ? relation.id_acteur : relation[def.id]), actor = identities.get(id)
      if (!actor) { ignoredRelations++; continue }
      const group = (byClub[clubId] ??= emptyClubActors())[def.kind]
      const fonction = def.kind === "officiels" ? functions.get(text(relation.id_fonction)) || "" : def.kind === "autres" ? otherTypes.get(text(actor.id_type_autre_acteur)) || "" : ""
      const previous = group.find(item => item.id === id)
      if (previous) { if (fonction && !previous.fonction.split(" · ").includes(fonction)) previous.fonction = [previous.fonction, fonction].filter(Boolean).join(" · "); continue }
      group.push({ id, nomComplet: text(actor.nom_complet), sexe: sexes.get(text(actor.id_sexe)) || "", telephone: text(actor.telephone), email: text(actor.email), statut: text(actor.statut), fonction })
    }
  }
  Object.values(byClub).forEach(groups => Object.values(groups).forEach(rows => rows.sort((a, b) => a.nomComplet.localeCompare(b.nomComplet, "fr"))))
  return { byClub: { ...byClub }, available: true, ignoredRelations }
}

export function clubActorKpis(groups: ClubActorGroups) {
  const athletes = groups.athletes.length
  const staff = groups.coachs.length + groups.medecins.length + groups.officiels.length + groups.autres.length
  const active = Object.values(groups).flat().filter(actor => ["ACTIF", "ACTIVE"].includes(normalize(actor.statut))).length
  return { total: athletes + staff, athletes, staff, active }
}
