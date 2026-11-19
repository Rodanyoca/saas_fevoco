import { managedLicenceEditRequest } from "@/lib/record-management-api"
import { NextResponse } from "next/server"
import { createAthleteLicence, renewClubLicences, updateAthleteLicence, athleteLicenceCandidates } from "@/lib/athlete-licence-creation"
import { getSession, canAccess } from "@/lib/auth"
import { isMutationOriginAllowed } from "@/lib/auth/request-origin"
import { revalidatePath } from "next/cache"
import { LicenceDomainError } from "@/lib/licences-domain"
import { isLicencesGoogleSheetsConfigured } from "@/lib/env"
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
    const query = new URL(request.url).searchParams
    const result = await athleteLicenceCandidates({ clubId: query.get("club") || "", seasonId: query.get("season") || "", date: query.get("date") || "" })
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    const failure = error instanceof SportsError ? error : new SportsError("SOURCE_INDISPONIBLE", "Impossible de vérifier les licences existantes. Réessayez avant toute création.", 503)
    return NextResponse.json({ message: failure.message, code: failure.code }, { status: failure.status, headers: { "Cache-Control": "private, no-store" } })
  }
}

export async function POST(request: Request) {
  try {
    await authorize(request)
    if (!isLicencesGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur des licences n’est pas configuré." }, { status: 503 })
    const input = await request.json()
    if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ message: "Commande invalide." }, { status: 422 })
    if (request.headers.get("Idempotency-Key")) input.idempotency_key = request.headers.get("Idempotency-Key")
    const licence = input.mode === "CLUB" ? await renewClubLicences(input) : await createAthleteLicence(input)
    for (const path of ["/licences", "/athletes", "/clubs"]) revalidatePath(path)
    return NextResponse.json({ licence }, { status: 201 })
  } catch (error) {
    if (error instanceof LicenceDomainError || error instanceof SportsError) return NextResponse.json({ message: error.message, code: error.code, fields: error.fields, uncertain: "uncertain" in error && error.uncertain }, { status: error.status })
    return NextResponse.json({ message: "Création non confirmée. Vérifiez la même tentative.", uncertain: true }, { status: 503 })
  }
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
