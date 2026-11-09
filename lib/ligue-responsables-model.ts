type Row = Record<string, string | number | boolean | null>

export type LigueResponsable = {
  role: string
  nomComplet: string
  telephone: string
  email: string
  referenceIntrouvable: string | null
}
export type LigueResponsables = Record<string, LigueResponsable[]>

const text = (row: Row, key: string) => String(row[key] ?? "").trim()
export const actorIdColumns: Record<string, string> = {
  ATHLETES: "id_athlete", COACHS: "id_coach", OFFICIELS: "id_officiel",
  ARBITRES: "id_arbitre", MEDECINS: "id_medecin", AUTRES: "id_autre_acteur",
}

export async function loadLigueResponsables(source: {
  assignments: () => Promise<Row[]>
  actorTypes: () => Promise<Row[]>
  actors: (sheets: string[]) => Promise<Record<string, Row[]>>
}): Promise<LigueResponsables> {
  const rows = await source.assignments()
  const required = ["id_type_structure", "id_entite", "id_type_acteur", "id_acteur", "fonction_contact", "est_contact_principal", "statut"]
  if (rows.some(row => required.some(key => !(key in row)))) throw new Error("En-têtes des désignations invalides.")
  const active = rows.filter(row => text(row, "id_type_structure") === "STR001" && text(row, "statut") === "ACTIF" && text(row, "id_entite"))
  if (!active.length) return {}
  const types = await source.actorTypes()
  if (types.some(row => !("id_type_acteur" in row) || !("source_donnees" in row))) throw new Error("En-têtes des types d’acteurs invalides.")
  const sourceByType = new Map(types.map(row => [text(row, "id_type_acteur"), text(row, "source_donnees")]))
  const sheets = [...new Set(active.map(row => sourceByType.get(text(row, "id_type_acteur")) || "").filter(sheet => Object.hasOwn(actorIdColumns, sheet)))]
  const actors = sheets.length ? await source.actors(sheets) : {}
  const indexes = new Map(sheets.map(sheet => {
    if (!actors[sheet]) throw new Error("Lecture des acteurs incomplète.")
    const idColumn = actorIdColumns[sheet]
    if (actors[sheet].some(row => [idColumn, "nom_complet", "telephone", "email"].some(key => !(key in row)))) throw new Error("En-têtes des acteurs invalides.")
    return [sheet, new Map(actors[sheet].filter(row => text(row, idColumn)).map(row => [text(row, idColumn), row]))] as const
  }))
  const byLigue: LigueResponsables = {}
  const principal = (row: Row) => text(row, "est_contact_principal").toUpperCase() === "TRUE"
  for (const row of active.sort((a, b) => Number(principal(b)) - Number(principal(a)))) {
    const type = text(row, "id_type_acteur"), id = text(row, "id_acteur")
    const actor = indexes.get(sourceByType.get(type) || "")?.get(id)
    const ligue = text(row, "id_entite")
    const contact: LigueResponsable = {
      role: text(row, "fonction_contact") || "Fonction non renseignée",
      nomComplet: actor ? text(actor, "nom_complet") || "Non renseigné" : "Fiche acteur introuvable",
      telephone: actor ? text(actor, "telephone") || "Non renseigné" : "Non renseigné",
      email: actor ? text(actor, "email") || "Non renseigné" : "Non renseigné",
      referenceIntrouvable: actor ? null : `${type || "Type non renseigné"} / ${id || "Identifiant non renseigné"}`,
    }
    if (!Object.hasOwn(byLigue, ligue)) Object.defineProperty(byLigue, ligue, { value: [], enumerable: true })
    byLigue[ligue].push(contact)
  }
  return byLigue
}
