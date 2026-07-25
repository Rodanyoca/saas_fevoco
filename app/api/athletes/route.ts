import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { createAthlete } from "@/lib/athlete-mutations"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const athlete = await createAthlete(await request.json())
    revalidatePath("/athletes")
    return NextResponse.json({ message: "L’athlète a été créé avec succès.", athlete }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message.includes("existe déjà") ? 409 : 400 })
  }
}
