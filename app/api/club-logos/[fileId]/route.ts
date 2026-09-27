import { NextResponse } from "next/server"
import { getClubs } from "@/lib/data"
import { downloadDriveAvatar } from "@/lib/google-actor-avatar"

export const runtime = "nodejs"

export async function GET(_request: Request, context: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await context.params
    const driveFileId = decodeURIComponent(fileId)
    if (!(await getClubs()).some((club) => club.logoDriveId === driveFileId)) return NextResponse.json({ message: "Logo introuvable." }, { status: 404 })
    const logo = await downloadDriveAvatar(driveFileId)
    return new NextResponse(logo.content, { headers: { "Content-Type": logo.mimeType, "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400", "X-Content-Type-Options": "nosniff" } })
  } catch {
    return NextResponse.json({ message: "Chargement du logo impossible." }, { status: 502 })
  }
}
