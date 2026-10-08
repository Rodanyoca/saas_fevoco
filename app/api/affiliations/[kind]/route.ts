import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { isAffiliationKind } from "@/lib/actor-affiliation-schema"
import { AffiliationDomainError } from "@/lib/affiliations-domain"
import { listActorAffiliations, saveActorAffiliation } from "@/lib/actor-affiliations"

export const runtime = "nodejs"
const paths = ["/athletes", "/coachs", "/medecins", "/officiels", "/autres-acteurs", "/clubs", "/ligues", "/ententes", "/licences", "/transferts", "/"]
function failure(error: unknown) {
  if (error instanceof AffiliationDomainError) return NextResponse.json({ message: error.message, code: error.code, fields: error.fields }, { status: error.status })
  return NextResponse.json({ message: "Les affiliations sont temporairement indisponibles. Réessayez.", code: "SOURCE_INDISPONIBLE" }, { status: 503 })
}
export async function GET(request: Request, context: { params: Promise<{ kind: string }> }) {
  const { kind } = await context.params
  if (!isAffiliationKind(kind)) return NextResponse.json({ message: "Type d’acteur non pris en charge." }, { status: 404 })
  try { return NextResponse.json(await listActorAffiliations(kind, new URL(request.url).searchParams.get("actorId") || "")) } catch (error) { return failure(error) }
}
async function mutate(request: Request, context: { params: Promise<{ kind: string }> }, update: boolean) {
  const { kind } = await context.params
  if (!isAffiliationKind(kind)) return NextResponse.json({ message: "Type d’acteur non pris en charge." }, { status: 404 })
  let body: Record<string, unknown>
  try { body = await request.json(); if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error() } catch { return NextResponse.json({ message: "Requête invalide." }, { status: 400 }) }
  if (update && (typeof body.id !== "string" || !body.id)) return NextResponse.json({ message: "Affiliation manquante." }, { status: 422 })
  try {
    const result = await saveActorAffiliation(kind, typeof body.actorId === "string" ? body.actorId : "", body, update ? String(body.id) : undefined)
    paths.forEach(path => revalidatePath(path))
    return NextResponse.json({ ...result, message: update ? "Affiliation modifiée." : "Affiliation enregistrée." }, { status: result.created ? 201 : 200 })
  } catch (error) { return failure(error) }
}
export const POST = (request: Request, context: { params: Promise<{ kind: string }> }) => mutate(request, context, false)
export const PUT = (request: Request, context: { params: Promise<{ kind: string }> }) => mutate(request, context, true)
