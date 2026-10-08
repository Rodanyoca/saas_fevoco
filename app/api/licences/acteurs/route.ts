import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createActorLicence, updateActorLicence, transitionActorLicence } from "@/lib/actor-licence-creation"
import { LicenceDomainError } from "@/lib/licences-domain"

async function mutate(request: Request, method: "POST" | "PUT" | "PATCH") {
  let input: unknown
  try { input = await request.json() } catch { return NextResponse.json({ message: "Requête JSON invalide." }, { status: 400 }) }
  try {
    let licence
    if (method === "POST") licence = await createActorLicence(input)
    else {
      if (!input || typeof input !== "object" || !("id" in input) || typeof input.id !== "string" || !input.id.trim()) return NextResponse.json({ message: "Licence manquante." }, { status: 422 })
      if (method === "PATCH") {
        if (!("action" in input) || typeof input.action !== "string") return NextResponse.json({ message: "Action manquante." }, { status: 422 })
        licence = await transitionActorLicence(input.id, input.action)
      } else licence = await updateActorLicence(input.id, input)
    }
    for (const path of ["/licences/entourage", "/coachs", "/officiels", "/arbitres", "/medecins", "/clubs"]) revalidatePath(path)
    return NextResponse.json({ licence }, { status: method === "POST" ? 201 : 200 })
  } catch (error) {
    if (error instanceof LicenceDomainError) return NextResponse.json({ message: error.message, fields: error.fields }, { status: error.status })
    return NextResponse.json({ message: "Enregistrement temporairement indisponible. Réessayez après actualisation." }, { status: 503 })
  }
}
export const POST = (request: Request) => mutate(request, "POST")
export const PUT = (request: Request) => mutate(request, "PUT")
export const PATCH = (request: Request) => mutate(request, "PATCH")
