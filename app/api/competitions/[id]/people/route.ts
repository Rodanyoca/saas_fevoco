import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { addCompetitionPerson } from "@/lib/competition-people"
import { asDomainResponse, CompetitionDomainError } from "@/lib/competition-structure"
async function save(request: Request, params: Promise<{ id: string }>, update: boolean) {
  try {
    const { id } = await params
    let input: Record<string, unknown>
    try { input = await request.json(); if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error() } catch { throw new CompetitionDomainError("Requête invalide.", 400) }
    if (update && (typeof input.id !== "string" || !input.id.trim())) throw new CompetitionDomainError("Participant manquant.", 422)
    const result = await addCompetitionPerson(decodeURIComponent(id), input, update ? String(input.id) : undefined)
    revalidatePath('/competitions/'+encodeURIComponent(decodeURIComponent(id)))
    return NextResponse.json(result, { status: update ? 200 : 201, headers: { "Cache-Control": "private, no-store" } })
  } catch (error) { const response = asDomainResponse(error); return NextResponse.json(response.body, { status: response.status, headers: { "Cache-Control": "private, no-store" } }) }
}
export const POST = (request: Request, { params }: { params: Promise<{ id: string }> }) => save(request, params, false)
export const PUT = (request: Request, { params }: { params: Promise<{ id: string }> }) => save(request, params, true)
