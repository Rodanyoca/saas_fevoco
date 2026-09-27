const COMPACT_DATE = /^(\d{2})(\d{2})(\d{4})$/
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const FRENCH_DATE = /^(\d{2})[./-](\d{2})[./-](\d{4})$/

export type DateParts = { day: number; month: number; year: number }

export function sanitizeDateInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8)
}

export function formatCompactDateInput(value: string): string {
  const digits = sanitizeDateInput(value)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function validParts(day: number, month: number, year: number): DateParts | null {
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return null
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? { day, month, year }
    : null
}

export function parseCompactDate(value: string): DateParts | null {
  const match = sanitizeDateInput(value).match(COMPACT_DATE)
  return match ? validParts(Number(match[1]), Number(match[2]), Number(match[3])) : null
}

function parseKnownDate(value: string): DateParts | null {
  const raw = value.trim()
  const compact = raw.match(COMPACT_DATE)
  if (compact) return validParts(Number(compact[1]), Number(compact[2]), Number(compact[3]))
  const iso = raw.match(ISO_DATE)
  if (iso) return validParts(Number(iso[3]), Number(iso[2]), Number(iso[1]))
  const french = raw.match(FRENCH_DATE)
  if (french) return validParts(Number(french[1]), Number(french[2]), Number(french[3]))
  return null
}

export function formatDateForSheet(value: string): string {
  if (!value.trim()) return ""
  const parts = parseKnownDate(value)
  if (!parts) throw new Error("Date invalide.")
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`
}

export function formatDateForDisplay(value: string): string {
  if (!value.trim()) return ""
  const parts = parseKnownDate(value)
  if (!parts) return value.trim()
  return `${String(parts.day).padStart(2, "0")}/${String(parts.month).padStart(2, "0")}/${String(parts.year).padStart(4, "0")}`
}

export function compactDateFromSheet(value: string): string {
  const parts = parseKnownDate(value)
  if (!parts) return ""
  return `${String(parts.day).padStart(2, "0")}/${String(parts.month).padStart(2, "0")}/${String(parts.year).padStart(4, "0")}`
}

export function validateBirthDate(value: string, today = new Date()): string | null {
  if (!value) return null
  const parts = parseKnownDate(value)
  if (!parts) return "Saisissez une date valide sur 8 chiffres (JJMMAAAA)."
  const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  const birthKey = parts.year * 10000 + parts.month * 100 + parts.day
  return birthKey > todayKey ? "La date de naissance ne peut pas être future." : null
}

export function compareDateValues(left: string, right: string): number | null {
  const leftIso = left ? formatDateForSheet(left) : ""
  const rightIso = right ? formatDateForSheet(right) : ""
  if (!leftIso || !rightIso) return null
  return leftIso.localeCompare(rightIso)
}
