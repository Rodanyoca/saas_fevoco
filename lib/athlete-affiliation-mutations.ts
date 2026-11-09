import 'server-only'
import { saveActorAffiliation } from '@/lib/actor-affiliations'

// Legacy import retained; every sports write now traverses the same guarded protocol.
export async function createAthleteAffiliation(payload: Record<string, unknown>) {
  return saveActorAffiliation('athlete', String(payload.actorId ?? payload.idAthlete ?? ''), payload)
}
