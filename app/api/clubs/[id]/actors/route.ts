import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { getSheetsDataFrom } from "@/lib/google-sheets"
import { loadClubActors } from "@/lib/club-actors"
import { emptyClubActors } from "@/lib/club-actors-model"

export const runtime = "nodejs"

// Le proxy applique à chaque appel la politique READ AUT-SPT et les droits frais.
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store" }
  const { id } = await context.params
  const config = env.googleSheets
  if (!config.territorialSpreadsheetId || !config.clientEmail || !config.privateKey) {
    return NextResponse.json({ message: "Les sources territoriales ne sont pas configurées." }, { status: 503, headers })
  }
  try {
    // Réutiliser le lot territorial déjà mis en cache par la liste, sans remapper la hiérarchie.
    const territorial = await getSheetsDataFrom(config.territorialSpreadsheetId, ["LIGUES!A:ZZ", "ENTENTES!A:ZZ", "CLUBS!A:ZZ"])
    if (!(territorial.CLUBS || []).some(row => String(row.id_club ?? "").trim() === id)) {
      return NextResponse.json({ message: "Club introuvable." }, { status: 404, headers })
    }
    const result = await loadClubActors(id)
    return NextResponse.json({ actors: result.byClub[id] || emptyClubActors(), ignoredRelations: result.ignoredRelations }, { headers })
  } catch {
    return NextResponse.json({ message: "Les rattachements du club sont temporairement indisponibles." }, { status: 503, headers })
  }
}
