import { managedEditRequest } from "@/lib/record-management-api"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { updateMedecin } from "@/lib/medecin-mutations"

async function patchIdentity(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const medecin = await updateMedecin(decodeURIComponent(id), await request.json())
    revalidatePath("/medecins")
    return NextResponse.json({ message: "Le médecin a été modifié avec succès.", medecin })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message === "Médecin introuvable." ? 404 : 400 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
 const {id} = await context.params
 return managedEditRequest(request, {entity:"actor",family:"medecin",id:decodeURIComponent(id)}, () => patchIdentity(request, context))
}
