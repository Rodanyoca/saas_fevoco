import type { BaseActorAffiliation, BaseActorLicence } from "@/lib/types"

const timestamp = (value: string) => {
  const frenchDate = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (frenchDate) {
    const [, day, month, year] = frenchDate
    return new Date(Number(year), Number(month) - 1, Number(day)).getTime()
  }

  const time = Date.parse(value)
  return Number.isNaN(time) ? 0 : time
}

export const affiliationHistory = <T extends BaseActorAffiliation>(
  items: T[],
  actorId: string,
) =>
  items
    .filter((item) => item.actorId === actorId)
    .sort((a, b) => timestamp(b.dateDebut) - timestamp(a.dateDebut))

export function getCurrentAffiliationForActor<T extends BaseActorAffiliation>(
  items: T[],
  actorId: string,
): T | undefined {
  const today = Date.now()
  const active = affiliationHistory(items, actorId).filter((item) => {
    const status = item.statutAffiliation.trim().toUpperCase()
    const begins = !item.dateDebut || timestamp(item.dateDebut) <= today
    const ends = !item.dateFin || timestamp(item.dateFin) >= today
    return (
      begins &&
      ends &&
      !["INACTIF", "INACTIVE", "TERMINE", "TERMINEE", "ANNULE", "ANNULEE"].includes(status)
    )
  })

  if (active.length > 1) {
    console.warn(`Plusieurs affiliations actives pour l'acteur ${actorId}`)
  }

  return active[0]
}

export const licenceHistory = <T extends BaseActorLicence>(
  items: T[],
  actorId: string,
) =>
  items
    .filter((item) => item.actorId === actorId)
    .sort((a, b) => timestamp(b.dateDelivrance) - timestamp(a.dateDelivrance))
