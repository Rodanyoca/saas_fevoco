import { parseSheetDate } from "@/lib/date-utils"

export function normalizeMetricValue(value: unknown): string {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export const isMetricActive = (value: unknown) =>
  ["actif", "active", "en cours"].includes(normalizeMetricValue(value))

export const isMetricPlanned = (value: unknown) => {
  const status = normalizeMetricValue(value)
  return ["prevu", "programme", "planifie"].some((item) => status.includes(item))
}

export const isMetricDone = (value: unknown) => {
  const status = normalizeMetricValue(value)
  return ["termine", "cloture", "complete"].some((item) => status.includes(item))
}

export const isMetricWin = (value: unknown) => {
  const result = normalizeMetricValue(value)
  return result.startsWith("v") || result.includes("gagne")
}

export const isDateExpired = (value: string) => {
  const date = parseSheetDate(value)
  return date ? date.getTime() < Date.now() : false
}

export function calculateTerritorialMetrics(
  provinces: unknown[], ligues: unknown[], ententes: unknown[], clubs: unknown[],
) {
  return {
    provinces: provinces.length,
    ligues: ligues.length,
    ententes: ententes.length,
    clubs: clubs.length,
    averageClubsPerLeague: ligues.length ? clubs.length / ligues.length : 0,
    averageEntentesPerLeague: ligues.length ? ententes.length / ligues.length : 0,
  }
}

export function calculateActorMetrics(
  athletes: unknown[], coachs: unknown[], arbitres: unknown[], medecins: unknown[], officiels: unknown[],
) {
  return {
    athletes: athletes.length,
    coachs: coachs.length,
    arbitres: arbitres.length,
    medecins: medecins.length,
    officiels: officiels.length,
    encadreurs: coachs.length + arbitres.length + medecins.length + officiels.length,
  }
}

export function calculateLicenceMetrics<T extends { statutLicence: string; dateFinValidite: string }>(
  licences: T[], now = Date.now(),
) {
  let active = 0, expired = 0
  for (const item of licences) {
    const date = parseSheetDate(item.dateFinValidite)
    const isExpired = date ? date.getTime() < now : false
    if (isExpired) expired++
    if (!isExpired && isMetricActive(item.statutLicence)) active++
  }
  return { total: licences.length, active, expired }
}

export function summarizeDashboardActors(rows: Array<{ genre: string; statut: string }>) {
  let men = 0, women = 0, active = 0
  for (const row of rows) {
    const gender = normalizeMetricValue(row.genre)
    if (["m", "masculin", "homme"].includes(gender)) men++
    if (["f", "feminin", "femme"].includes(gender)) women++
    if (isMetricActive(row.statut)) active++
  }
  return { total: rows.length, men, women, active, inactive: rows.length - active }
}

// Keep at most five entries rather than copying and sorting the entire source.
// Equal dates keep their original order, matching the previous stable sort.
export function latestDashboardRows<T>(rows: T[], date: (row: T) => string): T[] {
  const latest: T[] = []
  for (const row of rows) {
    const key = date(row)
    const index = latest.findIndex(item => key.localeCompare(date(item)) > 0)
    if (index !== -1) latest.splice(index, 0, row)
    else if (latest.length < 5) latest.push(row)
    if (latest.length > 5) latest.pop()
  }
  return latest
}
