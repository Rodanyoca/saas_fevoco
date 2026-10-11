import { NextResponse } from "next/server"
import { updateCompetitionEntry } from "@/lib/competition-entry-edit"
import { asDomainResponse } from "@/lib/competition-structure"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; unitId: string }> }) {
  try {
    const { id, unitId } = await params
    return NextResponse.json(await updateCompetitionEntry(id, unitId, await request.json()))
  } catch (error) {
    const response = asDomainResponse(error)
    return NextResponse.json(response.body, { status: response.status })
  }
}
