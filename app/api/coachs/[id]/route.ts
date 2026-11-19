import { managedEditRequest } from "@/lib/record-management-api"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { updateCoach } from "@/lib/coach-mutations"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

async function patchIdentity(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const coach = await updateCoach(decodeURIComponent(id), await request.json())
    revalidatePath("/coachs")
    return NextResponse.json({ message: "Le coach a été modifié avec succès.", coach })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message === "Coach introuvable." ? 404 : 400 })
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
 const {id} = await context.params
 return managedEditRequest(request, {entity:"actor",family:"coach",id:decodeURIComponent(id)}, () => patchIdentity(request, context))
}
