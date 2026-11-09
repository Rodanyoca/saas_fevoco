import "server-only"

import { env, isActeursGoogleSheetsConfigured, isTerritorialGoogleSheetsConfigured } from "@/lib/env"
import { getSheetDataFrom, getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import { actorIdColumns } from "@/lib/ligue-responsables-model"
import { contactDraft, ligueContactRows, ligueContactsRevision, planLigueContacts, LIGUE_CONTACT_SHEET } from "@/lib/ligue-contact-rules"
import type { LigueContactEditorData } from "@/lib/ligue-contact-editor-model"

const text = (row: SheetRow, key: string) => String(row[key] ?? "").trim()

async function sources(idLigue: string) {
  if (!isTerritorialGoogleSheetsConfigured() || !isActeursGoogleSheetsConfigured() || !env.googleSheets.referentielsSpreadsheetId) throw new Error("Les sources des responsables ne sont pas configurées.")
  const [territorial, types] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, ["LIGUES!A:ZZ", `${LIGUE_CONTACT_SHEET}!A:ZZ`], { fresh: true }),
    getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, "TYPES_ACTEURS!A:Z", { fresh: true }),
  ])
  if (!territorial.LIGUES?.some(row => text(row, "id_ligue") === idLigue)) throw new Error("Ligue introuvable.")
  const rows = territorial[LIGUE_CONTACT_SHEET]
  if (!rows) throw new Error("Les désignations sont indisponibles.")
  const contactHeaders = ["id_contact_entite", "id_type_structure", "id_entite", "id_type_acteur", "id_acteur", "fonction_contact", "est_contact_principal", "statut", "observation"]
  if (rows.some(row => contactHeaders.some(header => !(header in row)))) throw new Error("Les en-têtes des désignations sont invalides.")
  const supported = types.filter(row => Object.hasOwn(actorIdColumns, text(row, "source_donnees")) && text(row, "id_type_acteur"))
  if (!supported.length) throw new Error("Le référentiel des catégories d’acteurs est indisponible.")
  const sheets = [...new Set(supported.map(row => text(row, "source_donnees")))]
  const actors = await getSheetsDataFrom(env.googleSheets.acteursSpreadsheetId, sheets.map(sheet => `${sheet}!A:ZZ`), { fresh: true })
  const actorsByType = Object.fromEntries(supported.map(type => {
    const sheet = text(type, "source_donnees"), idColumn = actorIdColumns[sheet]
    if (!actors[sheet]) throw new Error("Une catégorie d’acteurs est indisponible.")
    if (actors[sheet].some(row => [idColumn, "nom_complet", "telephone", "email"].some(header => !(header in row)))) throw new Error("Les en-têtes des acteurs sont invalides.")
    return [text(type, "id_type_acteur"), actors[sheet].filter(row => text(row, idColumn)).map(row => ({
      id: text(row, idColumn), nomComplet: text(row, "nom_complet") || "Non renseigné",
      telephone: text(row, "telephone"), email: text(row, "email"),
    })).sort((a, b) => a.nomComplet.localeCompare(b.nomComplet, "fr"))]
  }))
  const data: LigueContactEditorData = {
    contacts: ligueContactRows(rows, idLigue).map(contactDraft),
    types: supported.map(row => ({ id: text(row, "id_type_acteur"), label: text(row, "nom_type_acteur") })),
    actorsByType, revision: ligueContactsRevision(rows, idLigue),
  }
  return { rows, data }
}

export async function getLigueContactEditor(idLigue: string) {
  return (await sources(idLigue)).data
}

export async function prepareLigueContactChanges(idLigue: string, payload: unknown, revision: unknown) {
  const { rows, data } = await sources(idLigue)
  const records = planLigueContacts(idLigue, payload, revision, rows, data)
  return {
    records,
    validateRows: (tables: Record<string, SheetRow[]>) => {
      if (ligueContactsRevision(tables[LIGUE_CONTACT_SHEET] ?? [], idLigue) !== data.revision) throw new Error("Les responsables ont changé pendant l’enregistrement. Rouvrez le formulaire.")
    },
  }
}
