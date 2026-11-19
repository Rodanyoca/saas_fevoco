import "server-only"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession, canAccess } from "@/lib/auth"
import { isMutationOriginAllowed } from "@/lib/auth/request-origin"
import { previewManagedRecord, deleteManagedRecord, readManagedTarget } from "@/lib/record-management"
import { withBusinessWrite } from "@/lib/business-write-guard"
import { RecordManagementError, assertEditableVersion, type RecordTarget } from "@/lib/record-management-model"
import { families } from "@/lib/record-management-model"
import { env } from "@/lib/env"
import { getSheetDataFrom } from "@/lib/google-sheets"

export function recordFailure(error: unknown) {
  const e = error instanceof RecordManagementError ? error : new RecordManagementError("SOURCE_INCOMPLETE", "Le contrôle n'a pas pu être terminé. Aucune suppression n'est confirmée.", 503)
  return NextResponse.json({ message: e.message, code: e.code, dependencies: e.dependencies, uncertain: e.uncertain }, { status: e.status, headers: { "Cache-Control": "private, no-store" } })
}
async function authorize(request: Request) {
  if (!isMutationOriginAllowed(request)) throw new RecordManagementError("ORIGINE_INTERDITE", "Origine refusée.", 403)
  const session = await getSession()
  if (!session || session.doitChangerMotDePasse) throw new RecordManagementError("SESSION_INVALIDE", "Session invalide.", 401)
  if (!await canAccess("AUT-SPT", "WRITE")) throw new RecordManagementError("DROITS_INSUFFISANTS", "Le droit d'écriture sportif est requis.", 403)
  return session.idUser
}
export async function managedEditRequest(request: Request, target: RecordTarget, run: () => Promise<Response>) {
  try {
    await authorize(request)
    return await withBusinessWrite(async () => {
      const current = await readManagedTarget(target)
      assertEditableVersion(current.row, request.headers.get("If-Match"))
      return run()
    })
  } catch (error) { return recordFailure(error) }
}
export async function managedLicenceEditRequest(request: Request, athlete: boolean, run: () => Promise<Response>) {
  try {
    await authorize(request)
    const input = await request.clone().json()
    let family: RecordTarget["family"] = "athlete"
    if (!athlete) {
      const rows = await getSheetDataFrom(env.googleSheets.licencesSpreadsheetId, "ACTEURS_LICENCES!A:ZZ", { fresh: true })
      const row = rows.find(item => String(item.id_licence) === input.id)
      const found = Object.entries(families).find(([, config]) => config.type && config.type === row?.id_type_acteur)
      if (!found) throw new RecordManagementError("INTROUVABLE", "Licence introuvable.", 404)
      family = found[0] as RecordTarget["family"]
    }
    return managedEditRequest(request, { entity: "licence", family, id: String(input.id || "") }, run)
  } catch (error) { return recordFailure(error) }
}
export async function recordGET(request: Request) {
  try {
    await authorize(request)
    const query = new URL(request.url).searchParams
    const target = { entity: query.get("entity"), family: query.get("family"), id: query.get("id") } as RecordTarget
    return NextResponse.json(await previewManagedRecord(target, query.get("check") === "version"), { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) { return recordFailure(error) }
}
export async function recordDELETE(request: Request) {
  try {
    const user = await authorize(request), body = await request.json()
    if (!body || Object.keys(body).some(key => !["entity", "family", "id", "version", "operation"].includes(key)) || Object.values(body).some(value => typeof value !== "string")) throw new RecordManagementError("COMMANDE_INVALIDE", "Commande invalide.", 422)
    const result = await deleteManagedRecord({ entity: body.entity, family: body.family, id: body.id }, body.version, body.operation, user)
    for (const path of ["/athletes", "/coachs", "/arbitres", "/medecins", "/officiels", "/autres-acteurs", "/licences", "/licences/entourage", "/clubs", "/ligues", "/ententes", "/transferts", "/"]) revalidatePath(path)
    return NextResponse.json({ ...result, message: "Enregistrement supprimé définitivement." }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) { return recordFailure(error) }
}
