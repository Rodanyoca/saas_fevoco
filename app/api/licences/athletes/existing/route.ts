import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession, canAccess } from "@/lib/auth"
import { isMutationOriginAllowed } from "@/lib/auth/request-origin"
import { createGoogleSportsStore } from "@/lib/sports-atomic-store"
import { SportsError } from "@/lib/sports-model"
import { existingAthleteLicenceOptions, deliverExistingAthleteLicence, ExistingLicenceFailure } from "@/lib/existing-athlete-licence"
export const runtime = "nodejs"
async function authorize(request: Request) {
  if (!isMutationOriginAllowed(request)) throw new SportsError("ORIGINE_INTERDITE", "Origine refusée.", 403)
  const session = await getSession()
  if (!session || session.doitChangerMotDePasse) throw new SportsError("SESSION_INVALIDE", "Session invalide.", 401)
  if (!await canAccess("AUT-SPT", "WRITE")) throw new SportsError("DROITS_INSUFFISANTS", "Le droit d'écriture sportif est requis.", 403)
  return session.idUser
}
function failure(error: unknown) {
  const cause = error instanceof SportsError ? error : new SportsError("SOURCE_INDISPONIBLE", "La vérification n'est pas disponible. Aucune absence de données ne peut être déduite.", 503, {}, true)
  return NextResponse.json({ code: cause.code, message: cause.message, fields: cause.fields, uncertain: cause.uncertain, state: error instanceof ExistingLicenceFailure ? error.state : cause.uncertain ? "UNCERTAIN" : "REJECTED" }, { status: cause.status, headers: { "Cache-Control": "private, no-store" } })
}
export async function GET(request: Request) {
  try {
    await authorize(request)
    const query = new URL(request.url).searchParams
    return NextResponse.json(await existingAthleteLicenceOptions(createGoogleSportsStore(), { actorId: query.get("actor") || "", clubId: query.get("club") || "", seasonId: query.get("season") || "" }), { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) { return failure(error) }
}
export async function POST(request: Request) {
  try {
    const userId = await authorize(request), result = await deliverExistingAthleteLicence(userId, await request.json())
    for (const path of ["/athletes", "/licences", "/clubs", "/transferts", "/ligues", "/ententes", "/"]) revalidatePath(path)
    return NextResponse.json(result, { status: 201, headers: { "Cache-Control": "private, no-store" } })
  } catch (error) { return failure(error) }
}
