// @ts-expect-error Explicit extensions are required by the Node test runner.
import { SportsError, affiliationAt, allocatableClub, canonicalDate, checkConfiguration, nextTechnicalIds, type SportsPlan, type SportsRow, type SportsSnapshot } from "./sports-model.ts"

export type SportsLicenceInput = { id_saison: string; date_delivrance: string; id_statut_licence: string; numero_licence?: string; mode?: string; id_affiliations_athletes?: string[]; id_affiliation_athlete?: string; id_athlete?: string; id_club?: string; observations?: string }
export function allocateSportsLicences(s: SportsSnapshot, input: SportsLicenceInput): SportsPlan {
  checkConfiguration(s)
  const season = s.seasons.find(row => row.id_saison === input.id_saison)
  if (!season) throw new SportsError("SAISON_INTROUVABLE", "Saison introuvable.", 422)
  const date = canonicalDate(input.date_delivrance, "date_delivrance")
  const start = canonicalDate(season.date_debut, "id_saison"), end = canonicalDate(season.date_fin, "id_saison")
  if (date < start || date > end) throw new SportsError("HORS_SAISON", "La délivrance doit appartenir à la saison choisie.", 422, { date_delivrance: "Date hors saison." })
  if (!s.licenceStatuses.some(row => row.id_statut_licence === input.id_statut_licence)) throw new SportsError("STATUT_INVALIDE", "Statut de licence inconnu.", 422)
  if (input.numero_licence) throw new SportsError("NUMERO_AUTOMATIQUE", "Le numéro est attribué par le serveur ; aucune saisie manuelle n’est acceptée.", 422)
  const ids = input.mode === "CLUB" ? input.id_affiliations_athletes : [input.id_affiliation_athlete]
  if (!ids?.length || new Set(ids).size !== ids.length) throw new SportsError("SELECTION_INVALIDE", "Sélectionnez des affiliations distinctes.", 422)
  const affiliations = new Map(s.affiliations.map(row => [row.id_affiliation_athlete, row]))
  const selected = ids.map(id => {
    const row = affiliations.get(id || "")
    if (!row || !affiliationAt(row, date) || (input.mode !== "CLUB" && row.id_athlete !== input.id_athlete) || (input.mode === "CLUB" && row.id_club !== input.id_club)) throw new SportsError("AFFILIATION_INADMISSIBLE", "Une affiliation du bon athlète, valable à la délivrance, est obligatoire.", 409)
    allocatableClub(s, row.id_club)
    if (!s.athletes.some(actor => actor.id_athlete === row.id_athlete)) throw new SportsError("ATHLETE_INTROUVABLE", "Athlète introuvable.", 404)
    if (s.affiliations.filter(other => other.id_athlete === row.id_athlete && affiliationAt(other, date)).length !== 1) throw new SportsError("RATTACHEMENT_AMBIGU", "Plusieurs rattachements sont effectifs à cette date.")
    return row
  })
  if (new Set(selected.map(row => row.id_athlete)).size !== selected.length) throw new SportsError("DOUBLON", "Un athlète ne peut être sélectionné qu’une fois.")
  const seasonRows = s.licences.filter(row => row.id_saison === input.id_saison)
  const people = new Set<string>(), numbers = new Set<string>()
  for (const row of seasonRows) {
    if (people.has(row.id_athlete) || (row.numero_licence && numbers.has(row.numero_licence))) throw new SportsError("HISTORIQUE_DOUBLON", "L’historique de la saison contient un doublon à vérifier.")
    people.add(row.id_athlete); if (row.numero_licence) numbers.add(row.numero_licence)
  }
  const counters = new Map<string, { row: SportsRow; original?: SportsRow; next: bigint }>()
  for (const aff of selected) {
    if (people.has(aff.id_athlete)) throw new SportsError("LICENCE_EXISTANTE", "Cet athlète possède déjà une licence pour cette saison.")
    if (input.mode === "CLUB" && !s.licences.some(row => row.id_athlete === aff.id_athlete && row.id_saison !== input.id_saison)) throw new SportsError("PREMIERE_LICENCE", "Enregistrez la première licence individuellement.")
    if (counters.has(aff.id_club)) continue
    const existing = s.counters.filter(row => row.id_club === aff.id_club && row.id_saison === input.id_saison)
    if (existing.length > 1) throw new SportsError("COMPTEUR_DOUBLON", "Plusieurs compteurs existent pour ce club et cette saison.")
    const original = existing[0]
    if (original && (original.statut_compteur !== "PRET" || original.id_compteur_licence !== `CPT-${input.id_saison}-${aff.id_club}`)) throw new SportsError("COMPTEUR_BLOQUE", "Compteur A_VERIFIER ou non conforme : attribution bloquée, sans saisie manuelle.")
    let maximum = BigInt(0)
    for (const row of seasonRows) {
      const attribution = row.id_club_attribution || affiliations.get(row.id_affiliation_athlete)?.id_club
      if (!attribution) throw new SportsError("ATTRIBUTION_INCONNUE", "Un club d’attribution historique doit être vérifié.")
      if (attribution !== aff.id_club) continue
      const suffix = row.numero_licence?.startsWith(attribution) ? row.numero_licence.slice(attribution.length) : ""
      if (!/^\d{3,}$/.test(suffix) || BigInt(suffix) <= BigInt(0)) throw new SportsError("HISTORIQUE_HORS_FORMAT", "Des numéros historiques empêchent l’initialisation sûre du compteur.")
      if (row.compteur_saison && (!/^\d+$/.test(row.compteur_saison) || BigInt(row.compteur_saison) !== BigInt(suffix))) throw new SportsError("COMPTEUR_INCOHERENT", "Un compteur historique ne correspond pas au numéro.")
      if (BigInt(suffix) > maximum) maximum = BigInt(suffix)
    }
    if (original && (!/^\d+$/.test(original.dernier_compteur) || BigInt(original.dernier_compteur) < maximum)) throw new SportsError("COMPTEUR_INCOHERENT", "Le compteur est inférieur aux numéros déjà réservés.")
    const next = original ? BigInt(original.dernier_compteur) : maximum
    counters.set(aff.id_club, { original, next, row: original || { id_compteur_licence: `CPT-${input.id_saison}-${aff.id_club}`, id_club: aff.id_club, id_saison: input.id_saison, dernier_compteur: maximum.toString(), statut_compteur: "PRET", observations: "Initialisé après vérification de l’historique." } })
  }
  const technicalIds = nextTechnicalIds(s.licences, "id_licence", `VOL-LIC-${date.slice(0, 4)}`, selected.length)
  const claims: string[] = [], rows = selected.map((aff, index) => {
    const counter = counters.get(aff.id_club)!
    counter.next += BigInt(1)
    const number = aff.id_club + counter.next.toString().padStart(3, "0")
    if (numbers.has(number)) throw new SportsError("NUMERO_EXISTANT", "Ce numéro est déjà réservé pour la saison.")
    numbers.add(number)
    claims.push(`counter:${input.id_saison}:${aff.id_club}:${counter.next}`, `athlete-season:${aff.id_athlete}:${input.id_saison}`, `number:${input.id_saison}:${number}`, `record:ATHLETE_LICENCES:${technicalIds[index]}`)
    return { id_licence: technicalIds[index], id_athlete: aff.id_athlete, id_saison: input.id_saison, id_affiliation_athlete: aff.id_affiliation_athlete, numero_licence: number, date_delivrance: date, id_statut_licence: input.id_statut_licence, observations: input.observations || "", id_club_attribution: aff.id_club, compteur_saison: counter.next.toString() }
  })
  return { book: "licences", table: "ATHLETE_LICENCES", claims, resultIds: technicalIds, inserts: { ATHLETE_LICENCES: rows, COMPTEURS_LICENCES: [...counters.values()].filter(c => !c.original).map(c => ({ ...c.row, dernier_compteur: c.next.toString() })) }, updates: [...counters.values()].filter(c => c.original).map(c => ({ table: "COMPTEURS_LICENCES", key: "id_compteur_licence", id: c.row.id_compteur_licence, fields: { ...c.row, dernier_compteur: c.next.toString() } })) }
}

export function modifySportsLicence(s: SportsSnapshot, id: string, input: SportsRow): SportsPlan {
  const row = s.licences.find(item => item.id_licence === id)
  if (!row) throw new SportsError("LICENCE_INTROUVABLE", "Licence introuvable.", 404)
  for (const key of ["numero_licence", "id_athlete", "id_saison", "id_affiliation_athlete", "id_club_attribution", "compteur_saison"]) if (input[key] !== undefined && input[key] !== row[key]) throw new SportsError("LICENCE_IMMUABLE", "Le numéro, la saison, l’attribution et les références de licence sont immuables.", 422)
  if (!s.licenceStatuses.some(item => item.id_statut_licence === input.id_statut_licence)) throw new SportsError("STATUT_INVALIDE", "Statut de licence inconnu.", 422)
  const fields = { date_delivrance: canonicalDate(input.date_delivrance, "date_delivrance"), id_statut_licence: input.id_statut_licence, observations: input.observations || "" }
  if (fields.date_delivrance !== canonicalDate(row.date_delivrance, "date_delivrance")) throw new SportsError("DATE_ATTRIBUTION_IMMUABLE", "La date d’attribution historique ne peut pas être déplacée.", 422)
  return { book: "licences", table: "ATHLETE_LICENCES", claims: [], resultIds: [id], inserts: {}, updates: [{ table: "ATHLETE_LICENCES", key: "id_licence", id, fields }] }
}
