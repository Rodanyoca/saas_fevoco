import type { BaseActorLicence } from "./types"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { formatDateFromSheet } from "./compact-date.ts"

export function activeActorLicenceNumbers(items: BaseActorLicence[], today: string): Map<string, string> {
  const selected = new Map<string, { start: string; id: string; number: string }>()
  for (const item of items) {
    if (!["STL001", "ACTIVE", "ACTIF"].includes((item.idStatutLicence || item.statutLicence).trim().toUpperCase())) continue
    try {
      const start = formatDateFromSheet(item.dateDebutValidite || "")
      const end = formatDateFromSheet(item.dateFinValidite)
      if (!start || !end || start > end || start > today || end < today || !item.numeroLicence.trim()) continue
      const previous = selected.get(item.actorId)
      // Déterministe même si la source contient des périodes actives qui se chevauchent.
      if (!previous || start > previous.start || (start === previous.start && item.idLicence > previous.id)) {
        selected.set(item.actorId, { start, id: item.idLicence, number: item.numeroLicence.trim() })
      }
    } catch { /* Une date source invalide ne constitue pas une licence active. */ }
  }
  return new Map([...selected].map(([id, item]) => [id, item.number]))
}
