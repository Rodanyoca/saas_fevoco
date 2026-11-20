import "server-only"
import { createGoogleSportsStore, type SportsStore } from "@/lib/sports-atomic-store"
import { operation, SportsError, sportsToday, type SportsBook, type SportsOperation, type SportsPlan, type SportsRow, type SportsSnapshot } from "@/lib/sports-model"
import { modifySportsLicence } from "@/lib/sports-licences-domain"
import { runAthleteAttachment } from "@/lib/athlete-attachment"
import { planAthleteTransfer } from "@/lib/athlete-transfers-domain"

export function sportsCommand(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new SportsError("VALIDATION", "Commande invalide.", 422)
  const object = input as Record<string, unknown>
  const strings: SportsRow = {}
  for (const [key, value] of Object.entries(object)) {
    if (key === "id_affiliations_athletes") continue
    if (typeof value !== "string") throw new SportsError("VALIDATION", "Valeur de formulaire invalide.", 422, { [key]: "Texte attendu." })
    strings[key] = value.trim()
  }
  const ids = object.id_affiliations_athletes
  if (ids !== undefined && (!Array.isArray(ids) || ids.some(id => typeof id !== "string" || !id.trim()))) throw new SportsError("VALIDATION", "Sélection invalide.", 422)
  return { strings, ids: ids as string[] | undefined }
}

// No expiring lease: an unconfirmed write cannot let a later owner race a delayed Google request.
export async function executeSportsMutation(store: SportsStore, book: SportsBook, op: SportsOperation, actorIds: string[], planner: (snapshot: SportsSnapshot) => Promise<SportsPlan> | SportsPlan) {
  const existing = await store.completed(book, op)
  if (existing) { await store.recoverCompleted(actorIds, op); return existing }
  if (!actorIds.length || actorIds.some(id => !id)) throw new SportsError("ACTEUR_REQUIS", "Athlète manquant.", 422)
  const lease = await store.acquire(actorIds, op)
  let keepLease = false
  const work = async () => {
    const replay = await store.completed(book, op)
    if (replay) return replay
    for (let attempt = 0; attempt < 3; attempt++) {
      const snapshot = await store.load(book === "affiliations" ? "affiliation" : "licence")
      const plan = await planner(snapshot)
      try { return await store.commit(op, plan) }
      catch (error) {
        if (error instanceof SportsError && error.uncertain) { keepLease = true; throw error }
        if (error instanceof SportsError && error.code === "RESERVATION_EXISTANTE" && attempt < 2) { await new Promise(resolve => setTimeout(resolve, 150 * 2 ** attempt)); continue }
        if (!(error instanceof SportsError)) { keepLease = true; throw new SportsError("RESULTAT_INDETERMINE", "Résultat non confirmé. Reprenez la même tentative.", 503, {}, true) }
        throw error
      }
    }
    throw new SportsError("CONCURRENCE", "Une attribution concurrente doit être réessayée.")
  }
  let result: SportsRow[] | undefined, failure: unknown
  try { result = await work() } catch (error) { failure = error }
  if (!keepLease) {
    try { await store.release(lease) }
    catch { throw new SportsError("LIBERATION_A_REPRENDRE", "Traitement effectué, mais libération de la réservation non confirmée. Vérifiez avec la même clé avant toute nouvelle opération.", 503, {}, true) }
  }
  if (failure) throw failure
  if (!result) throw new SportsError("RESULTAT_ABSENT", "Aucun résultat confirmé.", 503)
  return result
}

export async function mutateAthleteTransfer(actorId: string, input: unknown, currentId?: string, userId = "") {
  const { strings } = sportsCommand(input), store = createGoogleSportsStore()
  const op = operation(strings.idempotency_key, { actorId, currentId, ...strings })
  if (!currentId) {
    const result = await runAthleteAttachment(store, op, actorId, strings, sportsToday(), undefined, userId)
    return { ...result.affiliation, numero_licence: result.licence.numero_licence, id_saison_licence: result.licence.id_saison }
  }
  const rows = await executeSportsMutation(store, "affiliations", op, [actorId], async snapshot => planAthleteTransfer(snapshot, actorId, strings, sportsToday(), currentId, currentId ? await store.contextFor(currentId) : undefined))
  return rows[0]
}

export async function mutateSeasonalLicence(input: unknown, id?: string) {
  if (!id) throw new SportsError("RATTACHEMENT_REQUIS", "La licence est créée automatiquement depuis un nouveau rattachement sportif.", 410)
  const { strings } = sportsCommand(input), store = createGoogleSportsStore()
  const op = operation(strings.idempotency_key, { id, ...strings })
  // Resolve the immutable owner, then reload the mutation snapshot under its durable lock.
  const source = await store.load("licence")
  const actorId = source.licences.find(row => row.id_licence === id)?.id_athlete || ""
  return executeSportsMutation(store, "licences", op, [actorId], snapshot => modifySportsLicence(snapshot, id, strings))
}
