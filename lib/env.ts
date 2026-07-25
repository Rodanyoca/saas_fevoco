// Local development: create a `.env.local` file from `.env.local.example`.
// Production (e.g. Vercel): set the same variables in the project's Environment Variables.

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim()
}

const spreadsheetId = readEnv("GOOGLE_SHEETS_SPREADSHEET_ID")
const clientEmail = readEnv("GOOGLE_CLIENT_EMAIL")
const territorialSpreadsheetId = readEnv(
  "FEVOCO_STRUCTURE_TERRITORIALE_SPREADSHEET_ID",
)
const acteursSpreadsheetId = readEnv("FEVOCO_ACTEURS_SPREADSHEET_ID")
const affiliationsSpreadsheetId =
  readEnv("FEVOCO_AFFILIATIONS_SPREADSHEET_ID") ||
  readEnv("FEVOCO_AFFILIATIONS_LICENCES_SPREADSHEET_ID")
const competitionsSpreadsheetId = readEnv("FEVOCO_COMPETITIONS_SPREADSHEET_ID")
const equipeNationaleSpreadsheetId = readEnv("FEVOCO_EQUIPE_NATIONALE_SPREADSHEET_ID")
const referentielsSpreadsheetId = readEnv("FEVOCO_REFERENTIELS_SPREADSHEET_ID")

function normalizePrivateKey(raw: string): string {
  // Supports both formats:
  // - Key pasted with literal `\n`
  // - Key pasted with real newlines
  return raw.replace(/\\n/g, "\n")
}

const privateKeyRaw = readEnv("GOOGLE_PRIVATE_KEY")
const privateKey = privateKeyRaw ? normalizePrivateKey(privateKeyRaw) : ""

export const env = {
  googleSheets: {
    spreadsheetId,
    territorialSpreadsheetId,
    acteursSpreadsheetId,
    affiliationsSpreadsheetId,
    competitionsSpreadsheetId,
    equipeNationaleSpreadsheetId,
    referentielsSpreadsheetId,
    clientEmail,
    privateKey,
  },
} as const

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(
    env.googleSheets.spreadsheetId &&
      env.googleSheets.clientEmail &&
      env.googleSheets.privateKey,
  )
}

export function isTerritorialGoogleSheetsConfigured(): boolean {
  return Boolean(
    env.googleSheets.territorialSpreadsheetId &&
      env.googleSheets.clientEmail &&
      env.googleSheets.privateKey,
  )
}

export function isActeursGoogleSheetsConfigured(): boolean {
  return Boolean(
    env.googleSheets.acteursSpreadsheetId &&
      env.googleSheets.clientEmail &&
      env.googleSheets.privateKey,
  )
}

export function isAffiliationsGoogleSheetsConfigured(): boolean {
  return Boolean(
    env.googleSheets.affiliationsSpreadsheetId &&
      env.googleSheets.clientEmail &&
      env.googleSheets.privateKey,
  )
}

export function isCompetitionsGoogleSheetsConfigured(): boolean {
  return Boolean(
    env.googleSheets.competitionsSpreadsheetId &&
      env.googleSheets.clientEmail &&
      env.googleSheets.privateKey,
  )
}

export function isEquipeNationaleGoogleSheetsConfigured(): boolean {
  return Boolean(
    env.googleSheets.equipeNationaleSpreadsheetId &&
      env.googleSheets.clientEmail &&
      env.googleSheets.privateKey,
  )
}
