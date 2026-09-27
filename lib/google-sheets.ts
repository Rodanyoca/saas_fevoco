import { env, isGoogleSheetsConfigured } from "@/lib/env"
import { revalidateTag, unstable_cache } from "next/cache"
export { asText, normalize } from "@/lib/sheet-values"

export type SheetRow = Record<string, string | number | boolean | null>

const READ_CACHE_TTL_SECONDS = 30

type SheetsClient = Awaited<ReturnType<typeof createSheetsClient>>
let sharedSheetsClient: Promise<SheetsClient> | undefined

async function createSheetsClient() {
  const { google } = await import("googleapis")
  const auth = new google.auth.JWT({
    email: env.googleSheets.clientEmail,
    key: env.googleSheets.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  return google.sheets({ version: "v4", auth })
}

function sheetsClient(): Promise<SheetsClient> {
  sharedSheetsClient ??= createSheetsClient().catch((error) => {
    sharedSheetsClient = undefined
    throw error
  })
  return sharedSheetsClient
}

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

function valuesToRows(values: unknown[][]): SheetRow[] {
  if (values.length === 0) return []
  const headers = (values[0] ?? []).map(normalizeHeader)
  const mapped: SheetRow[] = []
  for (const row of values.slice(1)) {
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
    const sheets = await sheetsClient()

    const res = await withTimeout(
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      }),
      20_000,
    )

    return valuesToRows((res.data.values ?? []) as unknown[][])
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Erreur inconnue"
    console.warn(`Google Sheets indisponible pour ${range}: ${reason}`)
    throw new Error(`Impossible de lire Google Sheets (${range}) : ${reason}`, { cause: error })
  }
}

async function fetchSheetsDataFrom(spreadsheetId: string, ranges: string[]) {
  if (!spreadsheetId.trim() || !env.googleSheets.clientEmail || !env.googleSheets.privateKey) return {}
  try {
    const sheets = await sheetsClient()
    const response = await withTimeout(
      sheets.spreadsheets.values.batchGet({ spreadsheetId, ranges }),
      20_000,
    )
    return Object.fromEntries(ranges.map((range, index) => [
      range.split("!", 1)[0],
      valuesToRows((response.data.valueRanges?.[index]?.values ?? []) as unknown[][]),
    ])) as Record<string, SheetRow[]>
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Erreur inconnue"
    console.warn(`Google Sheets indisponible pour la lecture groupée: ${reason}`)
    throw new Error(`Impossible de lire Google Sheets en lecture groupée : ${reason}`, { cause: error })
  }
}

export async function getSheetDataFrom(
  spreadsheetId: string,
  range: string,
): Promise<SheetRow[]> {
  if (!spreadsheetId.trim() || !env.googleSheets.clientEmail || !env.googleSheets.privateKey) {
    return []
  }
  const sheetName = range.split("!", 1)[0]
  return unstable_cache(
    () => fetchSheetDataFrom(spreadsheetId, range),
    ["google-sheet", spreadsheetId, range],
    {
      revalidate: READ_CACHE_TTL_SECONDS,
      tags: [sheetCacheTag(spreadsheetId, sheetName)],
    },
  )()
}

export async function getSheetsDataFrom(
  spreadsheetId: string,
  ranges: string[],
): Promise<Record<string, SheetRow[]>> {
  if (!spreadsheetId.trim() || !ranges.length || !env.googleSheets.clientEmail || !env.googleSheets.privateKey) return {}
  const stableRanges = [...ranges]
  return unstable_cache(
    () => fetchSheetsDataFrom(spreadsheetId, stableRanges),
    ["google-sheets-batch", spreadsheetId, ...stableRanges],
    {
      revalidate: READ_CACHE_TTL_SECONDS,
      tags: stableRanges.map((range) => sheetCacheTag(spreadsheetId, range.split("!", 1)[0])),
    },
  )()
}

function sheetCacheTag(spreadsheetId: string, sheetName: string) {
  return `google-sheet:${spreadsheetId}:${sheetName}`
}

function invalidateSheet(spreadsheetId: string, sheetName: string) {
  revalidateTag(sheetCacheTag(spreadsheetId, sheetName), { expire: 0 })
}

export async function getSheetData(sheetName: string): Promise<SheetRow[]> {
  if (!isGoogleSheetsConfigured()) return []
  return getSheetDataFrom(env.googleSheets.spreadsheetId, `${sheetName}!A:ZZ`)
}

export async function getSheetCell(range: string): Promise<string> {
  if (!isGoogleSheetsConfigured()) return ""

  try {
    const sheets = await sheetsClient()

    const res = await withTimeout(
      sheets.spreadsheets.values.get({
        spreadsheetId: env.googleSheets.spreadsheetId,
        range,
      }),
      20_000,
    )

    const value = res.data.values?.[0]?.[0]
    return value === null || value === undefined ? "" : String(value).trim()
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Erreur inconnue"
    throw new Error(`Impossible de lire Google Sheets (${range}) : ${reason}`, { cause: error })
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
  return sheetsClient()
}

export async function appendSheetRecord(
  spreadsheetId: string,
  sheetName: string,
  record: Record<string, string>,
  insertDataOption: "INSERT_ROWS" | "OVERWRITE" = "INSERT_ROWS",
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
    insertDataOption,
    requestBody: { values: [headers.map((header) => record[header] ?? "")] },
  })
  invalidateSheet(spreadsheetId, sheetName)
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
  const matchingIndexes = values.slice(1)
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => String(row[idIndex] ?? "").trim() === id)
  if (!matchingIndexes.length) throw new Error(`${sheetName}: identifiant ${id} introuvable`)
  if (matchingIndexes.length > 1) {
    throw new Error(`${sheetName}: identifiant ${id} dupliqué (${matchingIndexes.length} lignes). Mise à jour refusée.`)
  }
  const dataIndex = matchingIndexes[0].index
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
  invalidateSheet(spreadsheetId, sheetName)
}

export async function formatSheetDateColumn(
  spreadsheetId: string,
  sheetName: string,
  headerName: string,
  pattern = "dd/mm/yyyy",
): Promise<void> {
  const sheets = await writableSheets()
  const [spreadsheet, headerResult] = await Promise.all([
    sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties(sheetId,title)",
    }),
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    }),
  ])
  const sheetId = spreadsheet.data.sheets?.find((sheet) => sheet.properties?.title === sheetName)?.properties?.sheetId
  if (sheetId === null || sheetId === undefined) throw new Error(`Onglet ${sheetName} introuvable`)

  const headers = (headerResult.data.values?.[0] ?? []).map(normalizeHeader)
  const columnIndex = headers.indexOf(normalizeHeader(headerName))
  if (columnIndex < 0) throw new Error(`Colonne ${headerName} absente dans ${sheetName}`)

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        repeatCell: {
          range: {
            sheetId,
            startRowIndex: 1,
            startColumnIndex: columnIndex,
            endColumnIndex: columnIndex + 1,
          },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: "DATE", pattern },
            },
          },
          fields: "userEnteredFormat.numberFormat",
        },
      }],
    },
  })
}
