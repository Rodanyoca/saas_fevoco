export function licenceNumbersByActor<T extends { actorId: string; numeroLicence: string }>(rows: T[]): Map<string, string> {
  const groups = new Map<string, string[]>()
  for (const row of rows) {
    const group = groups.get(row.actorId)
    if (group) group.push(row.numeroLicence)
    else groups.set(row.actorId, [row.numeroLicence])
  }
  return new Map([...groups].map(([id, numbers]) => [id, numbers.join(" ")]))
}
