import { NextResponse } from "next/server"
import { getAthleteAffiliations } from "@/lib/actor-records"
import { isAffiliationsGoogleSheetsConfigured } from "@/lib/env"
import { POST as createAffiliation } from "@/app/api/affiliations/[kind]/route"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  let body: Record<string, unknown>
  try { body = await request.json(); if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error() } catch { return NextResponse.json({ message: "Requête invalide." }, { status: 400 }) }
  return createAffiliation(new Request(request.url, { method: "POST", headers: request.headers, body: JSON.stringify({ ...body, actorId: decodeURIComponent(id) }) }), { params: Promise.resolve({ kind: "athlete" }) })
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAffiliationsGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur Affiliations n’est pas configuré." }, { status: 503 })
  }
  const { id } = await context.params
  const athleteId = decodeURIComponent(id)
  const affiliations = (await getAthleteAffiliations()).filter((item) => item.actorId === athleteId)
  return NextResponse.json({ affiliations })
}
