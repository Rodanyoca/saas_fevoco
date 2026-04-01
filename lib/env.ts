// Local development: create a `.env.local` file from `.env.local.example`.
// Production (e.g. Vercel): set the same variables in the project's Environment Variables.

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim()
}

const spreadsheetId = readEnv("GOOGLE_SHEETS_SPREADSHEET_ID")
const clientEmail = readEnv("GOOGLE_CLIENT_EMAIL")

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
