import { NextResponse } from "next/server"
import { createAthleteLicence, renewClubLicences, updateAthleteLicence } from "@/lib/athlete-licence-creation"
import { revalidatePath } from "next/cache"
import { LicenceDomainError } from "@/lib/licences-domain"
import { isLicencesGoogleSheetsConfigured } from "@/lib/env"

export async function POST(request: Request) {
  if (!isLicencesGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur des licences n’est pas configuré." }, { status: 503 })
  try {
    const input = await request.json()
    const licence = input.mode === "CLUB" ? await renewClubLicences(input) : await createAthleteLicence(input)
    for (const path of ["/licences", "/athletes", "/clubs"]) revalidatePath(path)
    return NextResponse.json({ licence }, { status: 201 })
  } catch (error) {
    if (error instanceof LicenceDomainError) return NextResponse.json({ message: error.message, fields: error.fields }, { status: error.status })
    return NextResponse.json({ message: error instanceof Error ? error.message : "Création de la licence impossible." }, { status: 400 })
  }
}

export async function PUT(request: Request) {
  if (!isLicencesGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur des licences n’est pas configuré." }, { status: 503 })
  try {
    const input = await request.json()
    if (!input || typeof input.id !== "string" || !input.id.trim()) return NextResponse.json({ message: "Licence manquante." }, { status: 422 })
    const licence = await updateAthleteLicence(input.id, input)
    for (const path of ["/licences", "/athletes", "/clubs"]) revalidatePath(path)
    return NextResponse.json({ licence })
  } catch (error) {
    if (error instanceof LicenceDomainError) return NextResponse.json({ message: error.message, fields: error.fields }, { status: error.status })
    return NextResponse.json({ message: "Modification temporairement indisponible." }, { status: 503 })
  }
}
