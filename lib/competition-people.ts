import { getArbitreLicences, getAthleteLicences, getCoachLicences, getMedecinLicences, getOfficielLicences } from "@/lib/actor-records"
import { getArbitres, getAthletes, getCoachs, getMedecins, getOfficiels } from "@/lib/data"
import { env } from "@/lib/env"
import { appendSheetRecord, updateSheetRecordById, getSheetDataFrom } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle, type CompetitionBundle } from "@/lib/competitions-v2"
import { CompetitionDomainError } from "@/lib/competition-structure"
import { formatDateForSheet } from "@/lib/compact-date"
import { competitionAthleteClubs, competitionAffiliationDate } from "@/lib/competition-person-affiliations"
import type { BaseActorLicence } from "@/lib/types"

const clean = (value: unknown) => String(value ?? "").trim()
const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
export type CompetitionPersonOption = { id: string; label: string; typeId: string; typeLabel: string; clubId: string; licenceNumber: string; licenceStatus: string }

function currentLicence(licences: BaseActorLicence[], actorId: string, start: string, end: string) {
  const date = (value: string | undefined) => { try { return formatDateForSheet(value || "") } catch { return "" } }
  const from = date(start), to = date(end)
  const candidates = licences.filter((item) => item.actorId === actorId).sort((a, b) => date(b.dateDelivrance).localeCompare(date(a.dateDelivrance)))
  const licence = candidates.find((item) => (!item.dateDelivrance || date(item.dateDelivrance) <= to) && (!item.dateFinValidite || date(item.dateFinValidite) >= from)) ?? candidates[0]
  if (!licence) return { licenceNumber: "—", licenceStatus: "NON RENSEIGNÉE" }
  const issued = date(licence.dateDelivrance), validFrom = date(licence.dateDebutValidite || licence.dateDelivrance), validUntil = date(licence.dateFinValidite)
  const valid = Boolean(from && to && issued && validFrom && issued <= to && validFrom <= to && (!licence.dateFinValidite || validUntil && validUntil >= from) && ["STL001", "ACTIF", "ACTIVE"].includes(normalized(licence.idStatutLicence || licence.statutLicence)))
  return { licenceNumber: licence.numeroLicence || "—", licenceStatus: valid ? "VALIDE" : "À VÉRIFIER" }
}

export async function competitionPeopleOptions(competitionId: string, loadedBundle?: CompetitionBundle, readOptions: { fresh?: boolean } = {}) {
  const bundle = loadedBundle ?? await loadCompetitionBundle(), competition = bundle.competitions.find((item) => item.id === competitionId)
  if (!competition) return []
  const [athletes, coaches, referees, officials, doctors, athleteLicences, coachLicences, refereeLicences, officialLicences, doctorLicences, otherRows, athleteAffiliations] = await Promise.all([getAthletes(), getCoachs(), getArbitres(), getOfficiels(), getMedecins(), getAthleteLicences(), getCoachLicences(), getArbitreLicences(), getOfficielLicences(), getMedecinLicences(), (bundle.references.TYPES_ACTEURS || []).some(item => normalized(item.label).includes("AUTRE")) ? getSheetDataFrom(env.googleSheets.acteursSpreadsheetId, "AUTRES!A:Z") : Promise.resolve([]), getSheetDataFrom(env.googleSheets.affiliationsSpreadsheetId, "ATHLETE_AFFILIATIONS!A:ZZ", readOptions)])
  const athleteClubs = competitionAthleteClubs(athleteAffiliations, competitionAffiliationDate())
  const types = bundle.references.TYPES_ACTEURS ?? []
  const type = (terms: string[]) => types.find((item) => terms.some((term) => normalized(item.label).includes(term)))
  const groups: Array<{ ref?: { id: string; label: string }; actors: Array<{ id: string; name: string; clubId?: string }>; licences: BaseActorLicence[] }> = [
    { ref: type(["ATHLETE", "JOUEUR"]), actors: athletes.map((item) => ({ id: item.idAthlete, name: item.nomComplet, clubId: athleteClubs.get(item.idAthlete) || "" })), licences: athleteLicences },
    { ref: type(["COACH", "ENTRAINEUR"]), actors: coaches.map((item) => ({ id: item.idCoach, name: item.nomComplet })), licences: coachLicences },
    { ref: type(["ARBITRE"]), actors: referees.map((item) => ({ id: item.idArbitre, name: item.nomComplet })), licences: refereeLicences },
    { ref: type(["OFFICIEL"]), actors: officials.map((item) => ({ id: item.idOfficiel, name: item.nomComplet })), licences: officialLicences },
    { ref: type(["MEDECIN", "SANTE"]), actors: doctors.map((item) => ({ id: item.idMedecin, name: item.nomComplet })), licences: doctorLicences },
  ]
  const otherType = type(["AUTRE"])
  if (otherType) groups.push({ ref: otherType, actors: otherRows.filter(row => clean(row.id_autre_acteur)).map(row => ({ id: clean(row.id_autre_acteur), name: clean(row.nom_complet) || clean(row.id_autre_acteur) })), licences: [] })
  return groups.flatMap(({ ref, actors, licences }) => ref ? actors.map((actor) => ({ id: actor.id, label: actor.name, typeId: ref.id, typeLabel: ref.label, clubId: actor.clubId ?? "", ...(normalized(ref.label).includes("AUTRE") ? { licenceNumber: "—", licenceStatus: "NON APPLICABLE" } : currentLicence(licences, actor.id, competition.dateDebut, competition.dateFin)) })) : [])
}

export async function addCompetitionPerson(competitionId: string, input: Record<string, unknown>, currentId?: string) {
  const bundle = await loadCompetitionBundle({ fresh: true }), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const current = currentId ? detail.intervenants.find(row => clean(row.id_intervenant_competition) === currentId) : undefined
  if (currentId && !current) throw new CompetitionDomainError("Participant introuvable dans cette compétition.", 404)
  const options = await competitionPeopleOptions(competitionId, bundle, { fresh: true })
  const actorId = clean(input.id_acteur), typeId = clean(input.id_type_acteur), unitId = clean(input.id_unite_competition), clubId = clean(input.id_club), role = clean(input.role_participant), observations = clean(input.observations)
  const actor = options.find((item) => item.id === actorId && item.typeId === typeId)
  if (!actor) throw new CompetitionDomainError("Acteur ou type d’acteur invalide.", 400)
  if (current && (clean(current.id_acteur) !== actorId || clean(current.id_type_acteur) !== typeId)) throw new CompetitionDomainError("L’identité du participant est immuable.", 422)
  if (!role) throw new CompetitionDomainError("Le rôle est obligatoire.", 400, { role_participant: "Rôle obligatoire." })
  const unit = detail.unites.find(row => clean(row.id_unite_competition) === unitId)
  const unchangedUnit = Boolean(current && clean(current.id_unite_competition) === unitId)
  if (current && !unchangedUnit && detail.unites.some(row => clean(row.id_unite_competition) === clean(current.id_unite_competition) && clean(row.id_type_unite_competition) === "TUC002")) throw new CompetitionDomainError("Les membres d’une paire ne se déplacent pas depuis le formulaire des participants.", 409)
  if (unitId && (!unit || (!unchangedUnit && clean(unit.statut) !== "ACTIF"))) throw new CompetitionDomainError("Unité étrangère ou inactive.", 422, { id_unite_competition: "Choisissez une unité engagée active." })
  if (/ATHLETE|JOUEUR/.test(normalized(actor.typeLabel)) && !unchangedUnit) {
    if (!unitId) throw new CompetitionDomainError("Sélectionnez l’unité engagée de l’athlète.", 422, { id_unite_competition: "Unité obligatoire pour un athlète." })
    if (clean(unit?.id_type_unite_competition) === "TUC004" && clean(unit?.id_club) !== actor.clubId) throw new CompetitionDomainError("L’athlète n’est pas rattaché au club engagé.", 422)
    if (clean(unit?.id_type_unite_competition) === "TUC002") throw new CompetitionDomainError("Les membres d’une paire sont définis lors de son engagement.", 409)
  }
  if (detail.intervenants.some((row) => clean(row.id_acteur) === actorId && clean(row.id_type_acteur) === typeId && clean(row.id_unite_competition) === unitId && clean(row.id_intervenant_competition) !== currentId && clean(row.statut) === "ACTIF")) throw new CompetitionDomainError("Cet intervenant actif est déjà enregistré pour cette unité.", 409)
  const record = { type_participant: actor.typeLabel, id_acteur: actorId, id_type_acteur: typeId, id_unite_competition: unitId, id_fonction: clean(input.id_fonction ?? current?.id_fonction), id_club: clean(unit?.id_club) || actor.clubId || (current ? clean(current.id_club) : clubId), role_participant: role, statut: current ? clean(current.statut) : "ACTIF", observations }
  if (currentId) { await updateSheetRecordById(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_INTERVENANTS", "id_intervenant_competition", currentId, record); return { id: currentId, licenceStatus: actor.licenceStatus, row: { ...current, ...record } } }
  const match = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/), prefix = `VOL-INV-${match?.[1] ?? new Date().getUTCFullYear()}-${match?.[2] ?? "000"}-`, used = new Set(detail.intervenants.map((row) => clean(row.id_intervenant_competition)))
  let sequence = Math.max(0, ...[...used].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length)) || 0)) + 1, id = `${prefix}${String(sequence).padStart(3, "0")}`; while (used.has(id)) id = `${prefix}${String(++sequence).padStart(3, "0")}`
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_INTERVENANTS", { id_intervenant_competition: id, id_competition: competitionId, ...record })
  return { id, licenceStatus: actor.licenceStatus, row: { id_intervenant_competition: id, id_competition: competitionId, ...record } }
}
