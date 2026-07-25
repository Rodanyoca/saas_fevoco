import { env, isGoogleSheetsConfigured } from "@/lib/env"
export { asText, normalize } from "@/lib/sheet-values"

export type SheetRow = Record<string, string | number | boolean | null>

const SHEET_CACHE_TTL_MS = 60_000
const sheetCache = new Map<string, { rows: SheetRow[]; expiresAt: number }>()
const pendingSheetReads = new Map<string, Promise<SheetRow[]>>()

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
}

function toCellValue(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  if (s === "") return ""
  if (s === "true") return true
  if (s === "false") return false
  return s
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Google Sheets request timeout")), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

async function fetchSheetDataFrom(
  spreadsheetId: string,
  range: string,
): Promise<SheetRow[]> {
  if (!spreadsheetId.trim() || !env.googleSheets.clientEmail || !env.googleSheets.privateKey) {
    return []
  }

  try {
    const { google } = await import("googleapis")

    const auth = new google.auth.JWT({
      email: env.googleSheets.clientEmail,
      key: env.googleSheets.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await withTimeout(
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      }),
      20_000,
    )

    const values = res.data.values ?? []
    if (values.length === 0) return []

    const rawHeaders = values[0] ?? []
    const headers = rawHeaders.map(normalizeHeader)

    const rows = values.slice(1)

    const mapped: SheetRow[] = []

    for (const row of rows) {
      const obj: SheetRow = {}
      let hasAnyValue = false

      for (let i = 0; i < headers.length; i++) {
        const key = headers[i]
        if (!key) continue
        const cellValue = toCellValue(row?.[i])
        obj[key] = cellValue
        if (cellValue !== null && cellValue !== "") hasAnyValue = true
      }

      if (hasAnyValue) mapped.push(obj)
    }

    return mapped
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Erreur inconnue"
    console.warn(`Google Sheets indisponible pour ${range}: ${reason}`)
    return []
  }
}

export async function getSheetDataFrom(
  spreadsheetId: string,
  range: string,
): Promise<SheetRow[]> {
  if (!spreadsheetId.trim() || !env.googleSheets.clientEmail || !env.googleSheets.privateKey) {
    return []
  }

  const key = `${spreadsheetId}:${range}`
  const cached = sheetCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.rows

  const pending = pendingSheetReads.get(key)
  if (pending) return pending

  const request = fetchSheetDataFrom(spreadsheetId, range)
    .then((rows) => {
      sheetCache.set(key, { rows, expiresAt: Date.now() + SHEET_CACHE_TTL_MS })
      return rows
    })
    .finally(() => pendingSheetReads.delete(key))

  pendingSheetReads.set(key, request)
  return request
}

export function invalidateSheetCache(spreadsheetId: string, sheetName?: string) {
  const prefix = `${spreadsheetId}:`
  for (const key of sheetCache.keys()) {
    if (key.startsWith(prefix) && (!sheetName || key.startsWith(`${prefix}${sheetName}!`))) {
      sheetCache.delete(key)
    }
  }
}

export async function getSheetData(sheetName: string): Promise<SheetRow[]> {
  if (!isGoogleSheetsConfigured()) return []
  return getSheetDataFrom(env.googleSheets.spreadsheetId, `${sheetName}!A:ZZ`)
}

export async function getSheetCell(range: string): Promise<string> {
  if (!isGoogleSheetsConfigured()) return ""

  try {
    const { google } = await import("googleapis")

    const auth = new google.auth.JWT({
      email: env.googleSheets.clientEmail,
      key: env.googleSheets.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const res = await withTimeout(
      sheets.spreadsheets.values.get({
        spreadsheetId: env.googleSheets.spreadsheetId,
        range,
      }),
      20_000,
    )

    const value = res.data.values?.[0]?.[0]
    return value === null || value === undefined ? "" : String(value).trim()
  } catch {
    return ""
  }
}

function columnLetter(index: number): string {
  let value = index + 1
  let result = ""
  while (value > 0) {
    value -= 1
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

async function writableSheets() {
  const { google } = await import("googleapis")
  const auth = new google.auth.JWT({
    email: env.googleSheets.clientEmail,
    key: env.googleSheets.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  return google.sheets({ version: "v4", auth })
}

export async function appendSheetRecord(
  spreadsheetId: string,
  sheetName: string,
  record: Record<string, string>,
): Promise<void> {
  const sheets = await writableSheets()
  const headerResult = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  })
  const headers = (headerResult.data.values?.[0] ?? []).map(normalizeHeader)
  if (!headers.length) throw new Error(`En-têtes absents dans ${sheetName}`)
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:${columnLetter(headers.length - 1)}`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [headers.map((header) => record[header] ?? "")] },
  })
  invalidateSheetCache(spreadsheetId, sheetName)
}

export async function updateSheetRecordById(
  spreadsheetId: string,
  sheetName: string,
  idHeader: string,
  id: string,
  record: Record<string, string>,
): Promise<void> {
  const sheets = await writableSheets()
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  })
  const values = result.data.values ?? []
  const headers = (values[0] ?? []).map(normalizeHeader)
  const idIndex = headers.indexOf(idHeader)
  if (idIndex < 0) throw new Error(`Colonne ${idHeader} absente dans ${sheetName}`)
  const dataIndex = values.slice(1).findIndex((row) => String(row[idIndex] ?? "").trim() === id)
  if (dataIndex < 0) throw new Error(`${sheetName}: identifiant ${id} introuvable`)
  const rowIndex = dataIndex + 2
  const existing = values[rowIndex - 1] ?? []
  const row = headers.map((header, index) =>
    Object.prototype.hasOwnProperty.call(record, header) ? record[header] : String(existing[index] ?? ""),
  )
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowIndex}:${columnLetter(headers.length - 1)}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  })
  invalidateSheetCache(spreadsheetId, sheetName)
}
