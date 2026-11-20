import { managedLicenceEditRequest } from "@/lib/record-management-api"
import { NextResponse } from "next/server"
import { updateAthleteLicence } from "@/lib/athlete-licence-creation"
import { getSession, canAccess } from "@/lib/auth"
import { isMutationOriginAllowed } from "@/lib/auth/request-origin"
import { revalidatePath } from "next/cache"
import { LicenceDomainError } from "@/lib/licences-domain"
import { isLicencesGoogleSheetsConfigured } from "@/lib/env"
import { recordVersion } from "@/lib/record-management-model"
import { env } from "@/lib/env"
import { getSheetsDataFrom } from "@/lib/google-sheets"
import { SportsError } from "@/lib/sports-model"

async function authorize(request: Request) {
  if (!isMutationOriginAllowed(request)) throw new SportsError("ORIGINE_INTERDITE", "Origine refusée.", 403)
  const session = await getSession()
  if (!session || session.doitChangerMotDePasse) throw new SportsError("SESSION_INVALIDE", "Session invalide.", 401)
  if (!await canAccess("AUT-SPT", "WRITE")) throw new SportsError("DROITS_INSUFFISANTS", "Le droit d'écriture sportif est requis.", 403)
}
export async function GET(request: Request) {
  try {
    await authorize(request)
    const id = new URL(request.url).searchParams.get("edit")
    if (!id) return NextResponse.json({ code: "PARCOURS_RETIRE", message: "La licence accompagne le nouveau rattachement sportif." }, {status:410})
    const data = await getSheetsDataFrom(env.googleSheets.licencesSpreadsheetId, ["ATHLETE_LICENCES!A:ZZ"], {fresh:true})
    const licence = data.ATHLETE_LICENCES?.find(row => String(row.id_licence) === id)
    if (!licence) return NextResponse.json({message:"Licence introuvable."}, {status:404})
    const refs = await getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["STATUT_LICENCE!A:ZZ"])
    return NextResponse.json({version:recordVersion(Object.fromEntries(Object.entries(licence).map(([key,value]) => [key,String(value ?? "").trim()]))),date:String(licence.date_delivrance),statuses:(refs.STATUT_LICENCE || []).map(row => ({id:String(row.id_statut_licence),label:String(row.nom_statut_licence || row.id_statut_licence)})),observations:String(licence.observations || ""),status:String(licence.id_statut_licence)}, {headers:{"Cache-Control":"private, no-store"}})
  } catch (error) { const cause = error instanceof SportsError ? error : new SportsError("SOURCE_INDISPONIBLE", "Lecture indisponible.", 503); return NextResponse.json({message:cause.message},{status:cause.status}) }
}
export async function POST(request: Request) {
  try { await authorize(request) } catch (error) { const cause = error as SportsError; return NextResponse.json({message:cause.message}, {status:cause.status}) }
  return NextResponse.json({code:"RATTACHEMENT_REQUIS",message:"Enregistrez un nouveau rattachement sportif pour obtenir sa licence."}, {status:410})
}

async function updateLicence(request: Request) {
  if (!isLicencesGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur des licences n’est pas configuré." }, { status: 503 })
  try {
    const input = await request.json()
    if (!input || typeof input.id !== "string" || !input.id.trim()) return NextResponse.json({ message: "Licence manquante." }, { status: 422 })
    if (request.headers.get("Idempotency-Key")) input.idempotency_key = request.headers.get("Idempotency-Key")
    const licence = await updateAthleteLicence(input.id, input)
    for (const path of ["/licences", "/athletes", "/clubs"]) revalidatePath(path)
    return NextResponse.json({ licence })
  } catch (error) {
    if (error instanceof LicenceDomainError || error instanceof SportsError) return NextResponse.json({ message: error.message, code: error.code, fields: error.fields }, { status: error.status })
    return NextResponse.json({ message: "Modification temporairement indisponible." }, { status: 503 })
  }
}

export const PUT = (request: Request) => managedLicenceEditRequest(request, true, () => updateLicence(request))
