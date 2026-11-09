import "server-only"

import { env, isTerritorialGoogleSheetsConfigured, isActeursGoogleSheetsConfigured } from "@/lib/env"
import { getSheetDataFrom, getSheetsDataFrom } from "@/lib/google-sheets"
import { loadLigueResponsables } from "@/lib/ligue-responsables-model"

export function getLigueResponsables() {
  return loadLigueResponsables({
    assignments: async () => {
      if (!isTerritorialGoogleSheetsConfigured()) throw new Error("Source territoriale indisponible.")
      return getSheetDataFrom(env.googleSheets.territorialSpreadsheetId, "PERSONNES_CONTACT_ENTITES!A:I")
    },
    actorTypes: async () => {
      if (!env.googleSheets.referentielsSpreadsheetId) throw new Error("Référentiel des acteurs indisponible.")
      return getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, "TYPES_ACTEURS!A:Z")
    },
    actors: async sheets => {
      if (!isActeursGoogleSheetsConfigured()) throw new Error("Source acteurs indisponible.")
      return getSheetsDataFrom(env.googleSheets.acteursSpreadsheetId, sheets.map(sheet => `${sheet}!A:ZZ`))
    },
  })
}
