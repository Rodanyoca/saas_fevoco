import { createHash, randomUUID } from "node:crypto"
import type { LigueContactDraft, LigueContactEditorData } from "./ligue-contact-editor-model"
import type { SheetRow, SheetRecordMutation } from "./google-sheets"

export const LIGUE_CONTACT_SHEET = "PERSONNES_CONTACT_ENTITES"
const text = (value: unknown) => String(value ?? "").trim()
export const ligueContactRows = (rows: SheetRow[], id: string) => rows.filter(row => text(row.id_type_structure) === "STR001" && text(row.id_entite) === id)
export const contactDraft = (row: SheetRow): LigueContactDraft => ({
  id: text(row.id_contact_entite), idTypeActeur: text(row.id_type_acteur), idActeur: text(row.id_acteur),
  fonction: text(row.fonction_contact), principal: text(row.est_contact_principal).toUpperCase() === "TRUE",
  statut: text(row.statut) === "ACTIF" ? "ACTIF" : "INACTIF", observation: text(row.observation),
})
export function ligueContactsRevision(rows: SheetRow[], id: string) {
  const contacts = ligueContactRows(rows, id).map(contactDraft).sort((a, b) => a.id.localeCompare(b.id))
  return createHash("sha256").update(JSON.stringify(contacts)).digest("hex")
}

export function planLigueContacts(idLigue: string, payload: unknown, revision: unknown, rows: SheetRow[], catalog: Pick<LigueContactEditorData, "actorsByType">): SheetRecordMutation[] {
  if (typeof revision !== "string" || revision !== ligueContactsRevision(rows, idLigue)) throw new Error("Les responsables ont changé. Fermez puis rouvrez le formulaire avant de réessayer.")
  if (!Array.isArray(payload) || payload.length > 100) throw new Error("La liste des responsables est invalide (100 maximum).")
  const existing = ligueContactRows(rows, idLigue)
  if (existing.some(row => !text(row.id_contact_entite)) || new Set(existing.map(row => text(row.id_contact_entite))).size !== existing.length) throw new Error("Identifiants des désignations absents ou dupliqués.")
  const seen = new Set<string>(), activeActors = new Set<string>()
  let principalCount = 0
  const mutations: SheetRecordMutation[] = payload.map(value => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Désignation invalide.")
    const input = value as Record<string, unknown>
    for (const key of ["id", "idTypeActeur", "idActeur", "fonction", "statut", "observation"]) if (typeof input[key] !== "string") throw new Error("Les identifiants et libellés doivent être des chaînes.")
    if (typeof input.principal !== "boolean") throw new Error("Le contact principal doit être coché ou décoché.")
    const id = text(input.id), type = text(input.idTypeActeur), actor = text(input.idActeur), role = text(input.fonction), status = text(input.statut)
    const original = id ? existing.find(row => text(row.id_contact_entite) === id) : undefined
    if (id && (!original || seen.has(id))) throw new Error("Désignation étrangère à cette ligue ou dupliquée.")
    if (id) seen.add(id)
    if (!role || role.length > 200) throw new Error("La fonction est obligatoire (200 caractères maximum).")
    if (!["ACTIF", "INACTIF"].includes(status)) throw new Error("Le statut doit être ACTIF ou INACTIF.")
    const found = Object.hasOwn(catalog.actorsByType, type) && catalog.actorsByType[type].filter(item => item.id === actor).length === 1
    const unchangedInactive = status === "INACTIF" && original && text(original.id_type_acteur) === type && text(original.id_acteur) === actor
    if (!found && !unchangedInactive) throw new Error("La personne est introuvable dans la catégorie sélectionnée.")
    const principal = input.principal && status === "ACTIF"
    if (status === "ACTIF") {
      const key = JSON.stringify([type, actor])
      if (activeActors.has(key)) throw new Error("Cette personne possède déjà une désignation active pour la ligue.")
      activeActors.add(key)
      if (principal && ++principalCount > 1) throw new Error("Un seul responsable actif peut être contact principal.")
    }
    const savedId = id || `VOL-CONTACT-${randomUUID()}`
    return { sheetName: LIGUE_CONTACT_SHEET, idHeader: "id_contact_entite", id: savedId, create: !id, record: {
      id_contact_entite: savedId, id_type_structure: "STR001", id_entite: idLigue,
      id_type_acteur: type, id_acteur: actor, fonction_contact: role, est_contact_principal: principal,
      statut: status, observation: text(input.observation),
    } }
  })
  for (const row of existing) if (!seen.has(text(row.id_contact_entite))) mutations.push({
    sheetName: LIGUE_CONTACT_SHEET, idHeader: "id_contact_entite", id: text(row.id_contact_entite),
    record: { statut: "INACTIF", est_contact_principal: false },
  })
  return mutations
}
