import "server-only"

import { Readable } from "node:stream"
import { google } from "googleapis"

const MAX_LOGO_SIZE = 5 * 1024 * 1024
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

const requiredEnv = (name: string) => {
  const value = (process.env[name] ?? "").trim()
  if (!value) throw new Error(`Configuration Google incomplète : ${name} est obligatoire.`)
  return value
}

export async function uploadClubLogo(clubId: string, file: File) {
  const extension = extensions[file.type]
  if (!extension) throw new Error("Le logo doit être une image JPEG, PNG ou WebP.")
  if (!file.size) throw new Error("Le fichier image est vide.")
  if (file.size > MAX_LOGO_SIZE) throw new Error("Le logo ne peut pas dépasser 5 Mo.")
  const auth = new google.auth.OAuth2(requiredEnv("GOOGLE_CLIENT_ID"), requiredEnv("GOOGLE_CLIENT_SECRET"))
  auth.setCredentials({ refresh_token: requiredEnv("GOOGLE_REFRESH_TOKEN") })
  const folderId = (process.env.GOOGLE_DRIVE_CLUBS_FOLDER_ID ?? "").trim() || requiredEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID")
  const drive = google.drive({ version: "v3", auth })
  const result = await drive.files.create({
    supportsAllDrives: true,
    requestBody: { name: `${clubId}.${extension}`, parents: [folderId], appProperties: { entityType: "club", entityId: clubId, mediaType: "logo" } },
    media: { mimeType: file.type, body: Readable.from(Buffer.from(await file.arrayBuffer())) },
    fields: "id,name,mimeType,size",
  })
  if (!result.data.id) throw new Error("Google Drive n’a pas retourné l’identifiant du logo.")
  return { driveFileId: result.data.id, logoUrl: `/api/club-logos/${encodeURIComponent(result.data.id)}` }
}
