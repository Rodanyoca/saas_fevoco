import { NextResponse } from "next/server"
import { getAthleteAffiliations } from "@/lib/actor-records"
import { isAffiliationsGoogleSheetsConfigured } from "@/lib/env"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAffiliationsGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur Affiliations n’est pas configuré." }, { status: 503 })
  }
  const { id } = await context.params
  const athleteId = decodeURIComponent(id)
  const affiliations = (await getAthleteAffiliations()).filter((item) => item.actorId === athleteId)
  return NextResponse.json({ affiliations })
}
