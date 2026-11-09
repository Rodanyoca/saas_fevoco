import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isAffiliationsGoogleSheetsConfigured } from "@/lib/env"
import { createAthleteAffiliation } from "@/lib/athlete-affiliation-mutations"

import { SportsError } from "@/lib/sports-model"

export async function POST(request: Request) {
  if (!isAffiliationsGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Affiliations n’est pas configuré." }, { status: 503 })
  try {
    const result = await createAthleteAffiliation(await request.json())
    revalidatePath("/transferts")
    revalidatePath("/athletes")
    return NextResponse.json({ message: "L’affiliation a été créée avec succès.", ...result }, { status: 201 })
  } catch (error) {
    if (error instanceof SportsError) return NextResponse.json({ message: error.message, code: error.code, fields: error.fields }, { status: error.status })
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: 400 })
  }
}
