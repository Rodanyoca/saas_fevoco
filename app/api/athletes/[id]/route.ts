import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { updateAthlete } from "@/lib/athlete-mutations"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const athlete = await updateAthlete(decodeURIComponent(id), await request.json())
    revalidatePath("/athletes")
    return NextResponse.json({ message: "L’athlète a été modifié avec succès.", athlete })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message === "Athlète introuvable." ? 404 : 400 })
  }
}
