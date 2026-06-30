export function parseSheetDate(value: string): Date | null {
  const raw = value.trim()
  if (!raw) return null

  const frenchDateMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (frenchDateMatch) {
    const [, day, month, year] = frenchDateMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date
}

export function calculateAgeFromSheetDate(value: string): number | null {
  const birthDate = parseSheetDate(value)
  if (!birthDate) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDelta = today.getMonth() - birthDate.getMonth()

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function formatSheetDate(value: string): string {
  const date = parseSheetDate(value)
  if (!date) return value || "-"

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
