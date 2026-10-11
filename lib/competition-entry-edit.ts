import { formatDateForSheet } from "@/lib/compact-date"
import { competitionEntryOptions } from "@/lib/competition-entries"
import { CompetitionDomainError } from "@/lib/competition-structure"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { env } from "@/lib/env"
import { updateSheetRecordsBatch } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()

export async function updateCompetitionEntry(competitionId: string, unitId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle()
  const detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const unit = detail.unites.find(row => text(row.id_unite_competition) === unitId)
  if (!unit) throw new CompetitionDomainError("Engagement introuvable dans cette compétition.", 404)
  const participation = detail.participants.find(row => text(row.id_participation) === text(unit.id_participation))
  const assignment = detail.phasesUnites.find(row => text(row.id_unite_competition) === unitId && text(row.id_type_affectation_phase) === "TAP001")
  if (!participation || !assignment) throw new CompetitionDomainError("Inscription ou affectation initiale manquante. Vérifiez le référentiel de cet engagement.", 409)

  const clubId = text(input.id_club), phaseId = text(input.id_phase_competition), groupId = text(input.id_groupe)
  const status = text(input.statut), observations = text(input.observations)
  const fields: Record<string, string> = {}
  let date = ""
  try { date = formatDateForSheet(text(input.date_inscription)) } catch { fields.date_inscription = "Saisissez une date civile valide au format JJ/MM/AAAA." }
  if (!["ACTIF", "INACTIF"].includes(status)) fields.statut = "Statut invalide."
  if (Object.keys(fields).length) throw new CompetitionDomainError("Veuillez corriger les champs indiqués.", 400, fields)
  if (status === "ACTIF" && text(unit.statut) !== "ACTIF") {
    const event = detail.epreuves.find(row => text(row.id_epreuve_competition) === text(unit.id_epreuve_competition))
    const phase = detail.phases.find(row => text(row.id_phase_competition) === phaseId)
    if (text(event?.statut) !== "ACTIF" || text(phase?.statut) !== "ACTIF") throw new CompetitionDomainError("L’épreuve et la phase doivent être actives pour réactiver l’engagement.", 409)
  }

  const clubChanged = clubId !== text(unit.id_club)
  const assignmentChanged = phaseId !== text(assignment.id_phase_competition) || groupId !== text(assignment.id_groupe)
  const statusChanged = status !== text(unit.statut) || status !== text(participation.statut_participation)
  const matches = detail.matches.filter(row => text(row.id_unite_a) === unitId || text(row.id_unite_b) === unitId)
  const dependent = matches.length || detail.phasesUnites.some(row => text(row.id_unite_competition) === unitId && text(row.id_phase_unite) !== text(assignment.id_phase_unite))
    || detail.classements.some(row => text(row.id_unite_competition) === unitId)
    || detail.distinctions.some(row => text(row.id_unite_competition) === unitId)
    || detail.intervenants.some(row => text(row.id_unite_competition) === unitId)
  if (dependent && (clubChanged || assignmentChanged || statusChanged)) throw new CompetitionDomainError("Des matchs, qualifications ou intervenants utilisent cet engagement. Le club, l’affectation et le statut sont verrouillés.", 409)
  for (const match of matches) {
    const matchDate = text(match.date_match)
    if (date && matchDate && date > formatDateForSheet(matchDate)) throw new CompetitionDomainError("L’inscription doit précéder les matchs de l’équipe.", 400, { date_inscription: "Date postérieure à un match existant." })
  }
  if (clubChanged || (status === "ACTIF" && text(unit.statut) !== "ACTIF")) {
    if (text(unit.id_equipe_nationale_saison)) throw new CompetitionDomainError("Une équipe nationale ne peut pas être remplacée par un club.", 409)
    const options = await competitionEntryOptions()
    if ((!clubId && text(unit.id_type_unite_competition) !== "TUC002") || (clubId && !options.clubs.some(row => row.id === clubId))) throw new CompetitionDomainError("Club invalide ou inactif.", 400, { id_club: "Sélectionnez un club actif." })
    if (clubId && text(unit.id_type_unite_competition) !== "TUC002" && detail.unites.some(row => text(row.id_unite_competition) !== unitId && text(row.id_epreuve_competition) === text(unit.id_epreuve_competition) && text(row.id_club) === clubId && text(row.statut) !== "INACTIF")) throw new CompetitionDomainError("Ce club est déjà engagé dans cette épreuve.", 409, { id_club: "Engagement déjà existant." })
  }
  if (assignmentChanged || (status === "ACTIF" && text(unit.statut) !== "ACTIF")) {
    const phase = detail.phases.find(row => text(row.id_phase_competition) === phaseId && text(row.id_epreuve_competition) === text(unit.id_epreuve_competition) && text(row.statut) === "ACTIF")
    if (!phase) throw new CompetitionDomainError("Phase invalide pour cette épreuve.", 400, { id_phase_competition: "Sélectionnez une phase active de l’épreuve." })
    if (text(phase.id_mode_phase) === "MPH001") {
      if (!detail.groupes.some(row => text(row.id_groupe) === groupId && text(row.id_phase_competition) === phaseId && text(row.statut) === "ACTIF")) throw new CompetitionDomainError("Groupe invalide pour cette phase.", 400, { id_groupe: "Sélectionnez un groupe actif de la phase." })
    } else if (groupId) throw new CompetitionDomainError("Cette phase n’accepte pas de groupe.", 400, { id_groupe: "Aucun groupe autorisé." })
  }
  if (status === "ACTIF" && text(unit.statut) !== "ACTIF" && text(unit.id_type_unite_competition) !== "TUC002" && detail.unites.some(row => text(row.id_unite_competition) !== unitId && text(row.id_epreuve_competition) === text(unit.id_epreuve_competition) && text(row.id_club) === clubId && text(row.statut) === "ACTIF")) throw new CompetitionDomainError("Un engagement actif existe déjà pour ce club dans l’épreuve.", 409)
  await updateSheetRecordsBatch(env.googleSheets.competitionsSpreadsheetId, [
    { sheetName: "COMPETITIONS_UNITES", idHeader: "id_unite_competition", id: unitId, record: { id_club: clubId, statut: status, observations } },
    { sheetName: "COMPETITIONS_PARTICIPANTS", idHeader: "id_participation", id: text(participation.id_participation), record: { id_club: clubId, date_inscription: date, statut_participation: status, observations }, dateHeaders: ["date_inscription"] },
    { sheetName: "COMPETITIONS_PHASES_UNITES", idHeader: "id_phase_unite", id: text(assignment.id_phase_unite), record: { id_phase_competition: phaseId, id_groupe: groupId, date_affectation: date, statut: status }, dateHeaders: ["date_affectation"] },
  ])
  return { id: unitId }
}
