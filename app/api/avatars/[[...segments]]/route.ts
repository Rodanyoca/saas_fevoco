import { NextResponse } from "next/server"
import { getArbitres, getAthletes, getCoachs, getMedecins, getOfficiels } from "@/lib/data"
import { downloadDriveAvatar, isAvatarEntityType, type AvatarEntityType } from "@/lib/google-actor-avatar"

export const runtime = "nodejs"

async function avatarBelongsToActor(entityType: AvatarEntityType, driveFileId: string) {
  if (entityType === "athlete") return (await getAthletes()).some((item) => item.avatarDriveId === driveFileId)
  if (entityType === "coach") return (await getCoachs()).some((item) => item.avatarDriveId === driveFileId)
  if (entityType === "arbitre") return (await getArbitres()).some((item) => item.avatarDriveId === driveFileId)
  if (entityType === "medecin") return (await getMedecins()).some((item) => item.avatarDriveId === driveFileId)
  return (await getOfficiels()).some((item) => item.avatarDriveId === driveFileId)
}

async function avatarBelongsToAnyActor(driveFileId: string) {
  const actorGroups = await Promise.all([
    getAthletes(),
    getCoachs(),
    getArbitres(),
    getMedecins(),
    getOfficiels(),
  ])
  return actorGroups.some((actors) => actors.some((item) => item.avatarDriveId === driveFileId))
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ segments?: string[] }> },
) {
  try {
    const { segments = [] } = await context.params
    const isLegacyAthleteUrl = segments.length === 1
    const entityType = isLegacyAthleteUrl ? "athlete" : segments[0]
    const encodedDriveFileId = isLegacyAthleteUrl ? segments[0] : segments[1]

    if (
      (segments.length !== 1 && segments.length !== 2) ||
      !isAvatarEntityType(entityType) ||
      !encodedDriveFileId
    ) {
      return NextResponse.json({ message: "Chemin d’avatar invalide." }, { status: 400 })
    }

    const driveFileId = decodeURIComponent(encodedDriveFileId)
    const belongsToActor = isLegacyAthleteUrl
      ? await avatarBelongsToAnyActor(driveFileId)
      : await avatarBelongsToActor(entityType, driveFileId)
    if (!belongsToActor) {
      return NextResponse.json({ message: "Avatar introuvable." }, { status: 404 })
    }

    const avatar = await downloadDriveAvatar(driveFileId)
    return new NextResponse(avatar.content, {
      headers: {
        "Content-Type": avatar.mimeType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return NextResponse.json({ message: "Chargement de l’avatar impossible." }, { status: 502 })
  }
}
