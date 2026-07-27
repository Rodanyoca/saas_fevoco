import { parseSheetDate } from "@/lib/date-utils"

export function assertValidDate(value: string, label: string, required = false) {
  if (!value) {
    if (required) throw new Error(`${label} est obligatoire.`)
    return
  }
  if (!parseSheetDate(value)) throw new Error(`${label} est invalide.`)
}

export function assertDateOrder(start: string, end: string, message: string) {
  if (!start || !end) return
  const startDate = parseSheetDate(start)
  const endDate = parseSheetDate(end)
  if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
    throw new Error(message)
  }
}
