// @ts-expect-error Explicit extensions are required by the Node test runner.
import { SportsError, affiliationAt, allocatableClub, assertNoOverlap, canonicalDate, checkConfiguration, dayAfter, nextTechnicalIds, period, type SportsPlan, type SportsRow, type SportsSnapshot, type TransferContext } from "./sports-model.ts"

export function transferRole(row: SportsRow, byId: Map<string, SportsRow>) {
  if (!row.id_type_transfert) return "LEGACY"
  if (row.id_type_transfert !== "TRF002") return row.id_type_transfert
  const previous = byId.get(row.id_affiliation_precedente)
  if (previous?.id_club === row.id_club) return "SUSPENSION"
  if (previous?.id_type_transfert === "TRF002" && byId.get(previous.id_affiliation_precedente)?.id_club === row.id_club) return "RETOUR"
  return "CESSION"
}

export function planAthleteTransfer(s: SportsSnapshot, actorId: string, input: SportsRow, today: string, currentId?: string, editContext?: TransferContext): SportsPlan {
  checkConfiguration(s)
  if (!s.athletes.some(row => row.id_athlete === actorId)) throw new SportsError("ACTEUR_INTROUVABLE", "Athlète introuvable.", 404)
  const rows = s.affiliations.filter(row => row.id_athlete === actorId), byId = new Map(rows.map(row => [row.id_affiliation_athlete, row]))
  const current = currentId ? byId.get(currentId) : undefined
  if (currentId && !current) throw new SportsError("INTROUVABLE", "Rattachement introuvable pour cet athlète.", 404)
  const start = canonicalDate(input.date_debut, "date_debut"), end = canonicalDate(input.date_fin, "date_fin", true)
  if (end && end < start) throw new SportsError("PERIODE_INVALIDE", "La fin précède le début.", 422, { date_fin: "Fin antérieure au début." })
  const type = input.id_type_transfert || "", isReturn = input.action === "RETURN"
  if (type && !s.transferTypes.some(row => row.id_type_transfert === type)) throw new SportsError("TYPE_TRANSFERT_INVALIDE", "Type de transfert inconnu.", 422)
  if (!type && !current) throw new SportsError("TYPE_TRANSFERT_REQUIS", "Sélectionnez un type d’opération.", 422, { id_type_transfert: "Type obligatoire." })
  const status = input.id_statut_affiliation || "SAF001"
  if (!["SAF001", "SAF002", "SAF003", "SAF004", "SAF099"].includes(status)) throw new SportsError("STATUT_INVALIDE", "Statut d’affiliation inconnu.", 422)
  if (status === "SAF002" && !end) throw new SportsError("FIN_REQUISE", "Une fin est obligatoire pour un rattachement terminé.", 422)
  if (status === "SAF099" && !input.observations) throw new SportsError("PRECISION_REQUISE", "Précisez le statut Autre.", 422)
  const inserts: SportsRow[] = [], changes = new Map<string, SportsRow>(), claims: string[] = []
  const ids = nextTechnicalIds(s.affiliations, "id_affiliation_athlete", "AFA", 3)
  let generated = 0
  const make = (fields: SportsRow) => {
    const row = { id_affiliation_athlete: ids[generated++], id_athlete: actorId, observations: input.observations || "", ...fields }
    inserts.push(row); claims.push(`record:ATHLETE_AFFILIATIONS:${row.id_affiliation_athlete}`)
    return row
  }
  const change = (row: SportsRow, fields: SportsRow) => changes.set(row.id_affiliation_athlete, { ...row, ...fields })
  let main: SportsRow, context: TransferContext | undefined
  if (isReturn) {
    if (current) throw new SportsError("RETOUR_INVALIDE", "Utilisez l’action de retour sur la cession.", 422)
    const loan = byId.get(input.id_affiliation_precedente), origin = loan && byId.get(loan.id_affiliation_precedente)
    if (!loan || !origin || transferRole(loan, byId) !== "CESSION" || !loan.date_fin || loan.id_statut_affiliation === "SAF004") throw new SportsError("CESSION_INTROUVABLE", "Cession et rattachement d’origine requis.")
    const finish = period(loan).end
    if (start < dayAfter(finish)) throw new SportsError("RETOUR_PREMATURE", "Le retour ne peut pas précéder le lendemain de la fin de cession.", 422)
    const suspensions = rows.filter(row => row.id_affiliation_precedente === origin.id_affiliation_athlete && row.id_club === origin.id_club && row.id_type_transfert === "TRF002" && row.id_statut_affiliation === "SAF003")
    if (suspensions.length !== 1) throw new SportsError("RETOUR_A_VERIFIER", "L’interruption d’origine doit être vérifiée avant retour.")
    const suspension = suspensions[0], suspendedPeriod = period(suspension)
    if ((suspendedPeriod.end && start > suspendedPeriod.end) || rows.some(row => row.id_affiliation_precedente === loan.id_affiliation_athlete && row.id_statut_affiliation !== "SAF004")) throw new SportsError("RETOUR_CONFLIT", "Un autre mouvement ou la fin du rattachement empêche ce retour.")
    change(suspension, { date_fin: dayAfter(start, -1) })
    main = make({ id_club: origin.id_club, date_debut: start, date_fin: suspendedPeriod.end, id_statut_affiliation: "SAF001", id_type_transfert: "TRF002", id_affiliation_precedente: loan.id_affiliation_athlete })
  } else if (current) {
    if (input.id_club !== current.id_club) throw new SportsError("CLUB_IMMUABLE", "Un changement de club exige un nouveau transfert, sans remplacer le rattachement historique.", 422)
    if ((type || "") !== (current.id_type_transfert || "") || (input.id_affiliation_precedente || "") !== (current.id_affiliation_precedente || "")) throw new SportsError("RELATION_IMMUABLE", "Le type et le précédent ne se remplacent pas par une modification.", 422)
    if (rows.some(row => row.id_affiliation_precedente === currentId)) {
      const old = period(current)
      if (start !== old.start || end !== old.end || status !== current.id_statut_affiliation) throw new SportsError("MOUVEMENT_REFERENCE", "Ce mouvement possède des suites : ses dates et son état nécessitent une vérification de la chaîne.")
      return { book: "affiliations", table: "ATHLETE_AFFILIATIONS", inserts: {}, updates: [{ table: "ATHLETE_AFFILIATIONS", key: "id_affiliation_athlete", id: current.id_affiliation_athlete, fields: { observations: input.observations || "" } }], claims: [], resultIds: [current.id_affiliation_athlete] }
    }
    const role = transferRole(current, byId)
    if (role === "SUSPENSION" && status !== current.id_statut_affiliation) throw new SportsError("INTERRUPTION_PROTEGEE", "Une interruption se traite par un retour contrôlé, sans réactivation directe.", 422)
    if (["SUSPENSION", "RETOUR"].includes(role) && (start !== current.date_debut || end !== current.date_fin || input.id_club !== current.id_club)) throw new SportsError("SEGMENT_PROTEGE", "Les bornes d’une interruption ou d’un retour se corrigent avec leur chaîne d’origine.")
    if ((type === "TRF002" || type === "TRF003") && role !== "RETOUR" && role !== "SUSPENSION") {
      const previous = byId.get(current.id_affiliation_precedente)
      if (!previous || !editContext) throw new SportsError("CONTEXTE_MANQUANT", "Le contexte confirmé de l’opération doit être retrouvé avant modification.")
      const previousPeriod = period(previous)
      if (start <= previousPeriod.start || (editContext.previousEnd && start > editContext.previousEnd)) throw new SportsError("PERIODE_INVALIDE", "Le changement doit rester dans la période d’origine.", 422)
      if (type === "TRF002" && (!end || (editContext.previousEnd && end > editContext.previousEnd))) throw new SportsError("FIN_CESSION_REQUISE", "La cession nécessite une fin compatible avec la période d’origine.", 422)
      if (input.id_club === previous.id_club) throw new SportsError("MEME_CLUB", "Le club bénéficiaire doit différer du club d’origine.", 422)
      change(previous, { date_fin: status === "SAF004" ? editContext.previousEnd : dayAfter(start, -1), id_statut_affiliation: status === "SAF004" ? editContext.previousStatus : start > today ? "SAF001" : "SAF002" })
      if (editContext.suspensionId) {
        const suspension = byId.get(editContext.suspensionId)
        if (!suspension) throw new SportsError("INTERRUPTION_ABSENTE", "Interruption introuvable.")
        change(suspension, { date_debut: start, date_fin: editContext.previousEnd, id_statut_affiliation: status === "SAF004" ? "SAF004" : "SAF003" })
      }
      context = editContext
    }
    main = { ...current, id_club: input.id_club, date_debut: start, date_fin: end, id_statut_affiliation: status, observations: input.observations || "" }
    change(current, main)
  } else if (type === "TRF001") {
    if (input.id_affiliation_precedente || rows.some(row => row.id_statut_affiliation !== "SAF004")) throw new SportsError("PREMIERE_AFFILIATION_INVALIDE", "Un historique existe déjà : ne le reclassez pas comme première affiliation.")
    allocatableClub(s, input.id_club)
    main = make({ id_club: input.id_club, date_debut: start, date_fin: end, id_statut_affiliation: status, id_type_transfert: type, id_affiliation_precedente: "" })
  } else {
    if (status !== "SAF001") throw new SportsError("STATUT_OPERATION", "Un changement de club se crée actif ; les suspensions sont des actions distinctes.", 422)
    const previous = byId.get(input.id_affiliation_precedente)
    if (!previous || !affiliationAt(previous, dayAfter(start, -1))) throw new SportsError("PRECEDENT_INVALIDE", "Sélectionnez le rattachement effectif la veille du changement.")
    const previousPeriod = period(previous)
    if (start <= previousPeriod.start) throw new SportsError("DEBUT_INVALIDE", "Le rattachement précédent doit conserver une période réelle.", 422)
    allocatableClub(s, input.id_club)
    if (input.id_club === previous.id_club) throw new SportsError("MEME_CLUB", "Les clubs d’origine et bénéficiaire doivent différer.", 422)
    if (type === "TRF002" && (!end || (previousPeriod.end && end > previousPeriod.end))) throw new SportsError("FIN_CESSION_REQUISE", "La cession nécessite une fin compatible avec le rattachement d’origine.", 422, { date_fin: "Fin de cession obligatoire." })
    context = { previousEnd: previousPeriod.end, previousStatus: previous.id_statut_affiliation }
    change(previous, { date_fin: dayAfter(start, -1), id_statut_affiliation: start > today ? "SAF001" : "SAF002" })
    main = make({ id_club: input.id_club, date_debut: start, date_fin: end, id_statut_affiliation: "SAF001", id_type_transfert: type, id_affiliation_precedente: previous.id_affiliation_athlete })
    if (type === "TRF002") {
      const suspension = make({ id_club: previous.id_club, date_debut: start, date_fin: previousPeriod.end, id_statut_affiliation: "SAF003", id_type_transfert: type, id_affiliation_precedente: previous.id_affiliation_athlete })
      context.suspensionId = suspension.id_affiliation_athlete
    } else if (previous.id_type_transfert === "TRF002") {
      for (const row of rows.filter(row => row.id_type_transfert === "TRF002" && row.id_affiliation_precedente === previous.id_affiliation_precedente && row.id_statut_affiliation === "SAF003")) change(row, { date_fin: dayAfter(start, -1), id_statut_affiliation: "SAF003" })
    }
  }
  const finalRows = [...rows.map(row => changes.get(row.id_affiliation_athlete) || row), ...inserts]
  assertNoOverlap(finalRows)
  // Dates of an already attributed licence cannot be silently removed from its linked history.
  for (const row of changes.values()) for (const licence of s.licences.filter(item => item.id_affiliation_athlete === row.id_affiliation_athlete)) {
    const delivery = canonicalDate(licence.date_delivrance, "date_delivrance"), p = period(row)
    if (delivery < p.start || (p.end && delivery > p.end)) throw new SportsError("REFERENCE_LICENCE", "Ces dates excluraient la délivrance d’une licence liée. Vérifiez la correction historique.")
  }
  return { book: "affiliations", table: "ATHLETE_AFFILIATIONS", inserts: { ATHLETE_AFFILIATIONS: inserts }, updates: [...changes].map(([id, fields]) => ({ table: "ATHLETE_AFFILIATIONS", key: "id_affiliation_athlete", id, fields })), claims, resultIds: [main.id_affiliation_athlete], context }
}
