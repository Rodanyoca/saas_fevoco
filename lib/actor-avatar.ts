export function getActorAvatarUrl(
  avatarDriveUrl: string,
  avatarDriveId: string,
): string | undefined {
  const url = avatarDriveUrl.trim()
  if (/^https?:\/\//i.test(url)) return url

  const id = avatarDriveId.trim()
  return id
    ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}`
    : undefined
}
