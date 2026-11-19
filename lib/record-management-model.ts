import { createHash } from "node:crypto"

export type ActorFamily = "athlete" | "coach" | "arbitre" | "medecin" | "officiel" | "autre"
export type RecordEntity = "actor" | "affiliation" | "licence"
export type BusinessRow = Record<string, string>
export const families = {
  athlete: { table: "ATHLETES", key: "id_athlete", route: "athletes", type: "TAC001", label: "Athlète", affiliation: "ATHLETE_AFFILIATIONS", affiliationKey: "id_affiliation_athlete" },
  coach: { table: "COACHS", key: "id_coach", route: "coachs", type: "TAC002", label: "Entraîneur", affiliation: "COACH_AFFILIATIONS", affiliationKey: "id_affiliation_coach" },
  officiel: { table: "OFFICIELS", key: "id_officiel", route: "officiels", type: "TAC003", label: "Officiel", affiliation: "OFFICIELS_AFFILIATIONS", affiliationKey: "id_affiliation_officiel" },
  arbitre: { table: "ARBITRES", key: "id_arbitre", route: "arbitres", type: "TAC004", label: "Arbitre", affiliation: "", affiliationKey: "" },
  medecin: { table: "MEDECINS", key: "id_medecin", route: "medecins", type: "TAC005", label: "Médecin", affiliation: "MEDECIN_AFFILIATIONS", affiliationKey: "id_affiliation_medecin" },
  autre: { table: "AUTRES", key: "id_autre_acteur", route: "autres-acteurs", type: "", label: "Autre acteur", affiliation: "AUTRES_AFFILIATIONS", affiliationKey: "id_affiliation" },
} as const
export type RecordTarget = { entity: RecordEntity; family: ActorFamily; id: string }
export type TableSnapshot = { book: string; table: string; headers: string[]; rows: BusinessRow[] }
export class RecordManagementError extends Error {
  constructor(public code: string, message: string, public status = 409, public dependencies: Dependency[] = [], public uncertain = false) { super(message) }
}
export type Dependency = { book: string; table: string; count: number; href?: string }
export function targetSchema(target: RecordTarget) {
  const family = families[target.family]
  if (!Object.hasOwn(families, target.family) || !family || typeof target.id !== "string" || !target.id || !["actor", "affiliation", "licence"].includes(target.entity)) throw new RecordManagementError("CIBLE_INVALIDE", "Enregistrement invalide.", 422)
  if (target.entity === "affiliation" && !family.affiliation) throw new RecordManagementError("AFFILIATION_INTERDITE", "Un arbitre n'a pas d'affiliation.", 422)
  return target.entity === "actor" ? { book: "actors", table: family.table, key: family.key }
    : target.entity === "affiliation" ? { book: "affiliations", table: family.affiliation, key: family.affiliationKey }
      : { book: "licences", table: target.family === "athlete" ? "ATHLETE_LICENCES" : "ACTEURS_LICENCES", key: "id_licence" }
}
export function recordVersion(row: BusinessRow) {
  return createHash("sha256").update(JSON.stringify(Object.entries(row).sort(([a], [b]) => a.localeCompare(b)))).digest("hex")
}
const typeMatches = (row: BusinessRow, target: RecordTarget) => {
  const type = row.id_type_acteur || row.type_acteur || row.type_participant || row.type_proprietaire || ""
  if (!type) return true // Ambiguous generic references are blockers, never ignored.
  const family = families[target.family]
  if (target.family === "autre") return !Object.values(families).some(config => config.type && config.type === type) || /AUTRE/i.test(type)
  return [family.type, target.family.toUpperCase(), family.table, family.label.toUpperCase()].includes(type.toUpperCase())
}
export function rowReferences(row: BusinessRow, target: RecordTarget) {
  const family = families[target.family]
  if (target.entity === "actor") {
    if (row[family.key] === target.id) return true
    return Object.entries(row).some(([key, value]) => value === target.id && (/^(id_(?:acteur|actor|entourage)(?:_.*)?|(?:actor)_id)$/.test(key) ? typeMatches(row, target) : /^id_|_id$/.test(key)))
  }
  const prefix = target.entity === "licence" ? /licen[cs]e/ : /affiliation|predecesseur|precedent|origine/
  return Object.entries(row).some(([key, value]) => /^id_|_id$/.test(key) && (prefix.test(key) || /^id_(?:objet|entite|cible|reference|source)/.test(key)) && value === target.id)
}
export function incomingDependencies(target: RecordTarget, tables: TableSnapshot[]): Dependency[] {
  const source = targetSchema(target)
  return tables.flatMap(table => {
    const count = table.rows.filter(row => !(table.book === source.book && table.table === source.table && row[source.key] === target.id) && rowReferences(row, target)).length
    const href = table.table.startsWith("COMPETITIONS") ? "/competitions" : table.table.includes("LICENCE") ? "/licences" : table.table.includes("AFFILIATION") ? `/${families[target.family].route}` : table.table.includes("NATION") || table.book === "national" ? "/equipe-nationale" : undefined
    return count ? [{ book: table.book, table: table.table, count, ...(href ? { href } : {}) }] : []
  })
}
export function assertEditableVersion(row: BusinessRow, expected: string | null) {
  if (!expected || expected !== recordVersion(row)) throw new RecordManagementError("VERSION_CONFLIT", "Les informations ont changé. Rechargez l'enregistrement avant de réessayer.", 409)
}
