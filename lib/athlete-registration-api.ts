import "server-only"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { canAccess, getSession } from "@/lib/auth"
import { isMutationOriginAllowed } from "@/lib/auth/request-origin"
import { registerAthlete, RegistrationFailure, loadRegistrationOptions } from "@/lib/athlete-registration"
import { SportsError } from "@/lib/sports-model"

async function user() {
  const session = await getSession()
  if (!session || session.doitChangerMotDePasse) throw new SportsError("SESSION_INVALIDE", "Session invalide ou à activer.", 401)
  // All three existing policies require the same sporting WRITE authorization.
  if (!await canAccess("AUT-SPT", "WRITE")) throw new SportsError("DROITS_INSUFFISANTS", "Le droit d'écriture du bloc sportif est requis pour les trois créations.", 403)
  return session.idUser
}
function failure(error: unknown) {
  const domain = error instanceof SportsError ? error : new SportsError("SOURCE_INDISPONIBLE", "Le parcours est temporairement indisponible. Conservez votre tentative.", 503, {}, true)
  const state = error instanceof RegistrationFailure ? error.state : domain.uncertain ? "UNCERTAIN" : "REJECTED"
  return NextResponse.json({ state, code: domain.code, message: domain.message, fields: domain.fields, ...(error instanceof RegistrationFailure && error.existingAthleteId ? { existingAthleteId: error.existingAthleteId } : {}) }, { status: domain.status, headers: { "Cache-Control": "private, no-store" } })
}
export async function registrationGET() {
  try { await user(); return NextResponse.json(await loadRegistrationOptions(), { headers: { "Cache-Control": "private, no-store" } }) }
  catch (error) { return failure(error) }
}
export async function registrationPOST(request: Request) {
  try {
    if (!isMutationOriginAllowed(request)) throw new SportsError("ORIGINE_INTERDITE", "Origine de la requête refusée.", 403)
    const userId = await user()
    let input: unknown
    try { input = await request.json() } catch { throw new SportsError("JSON_INVALIDE", "Formulaire invalide.", 400) }
    const result = await registerAthlete(userId, input)
    for (const path of ["/athletes", "/clubs", "/licences", "/transferts", "/ligues", "/ententes", "/"]) revalidatePath(path)
    return NextResponse.json({ ...result, message: `Athlète, première affiliation et licence enregistrés. Licence ${result.numeroLicence}.` }, { status: 201, headers: { "Cache-Control": "private, no-store" } })
  } catch (error) { return failure(error) }
}
