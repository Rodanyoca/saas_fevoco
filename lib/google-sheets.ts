import { env, isGoogleSheetsConfigured } from "@/lib/env"

export type SheetRow = Record<string, string | number | boolean | null>

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
  const n = Number(s)
  if (!Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(s)) return n
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

export async function getSheetData(sheetName: string): Promise<SheetRow[]> {
  if (!isGoogleSheetsConfigured()) return []

  try {
    const { google } = await import("googleapis")

    const auth = new google.auth.JWT({
      email: env.googleSheets.clientEmail,
      key: env.googleSheets.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const range = `${sheetName}!A:ZZ`

    const res = await withTimeout(
      sheets.spreadsheets.values.get({
        spreadsheetId: env.googleSheets.spreadsheetId,
        range,
      }),
      10_000,
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
  } catch {
    return []
  }
}
