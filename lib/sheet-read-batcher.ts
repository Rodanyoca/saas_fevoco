type Pending<T> = { ranges: string[]; resolve: (value: Record<string, T[]>) => void; reject: (error: unknown) => void }
const sheet = (range: string) => range.split("!", 1)[0]
const width = (column: string) => [...column].reduce((value, char) => value * 26 + char.charCodeAt(0) - 64, 0)

// Réunit les lectures simultanées par classeur, y compris les plages A:C / A:ZZ
// d'un même onglet. Aucun cache supplémentaire : invalidation et TTL restent chez l'appelant.
export function createSheetReadBatcher<T>(read: (id: string, ranges: string[]) => Promise<Record<string, T[]>>, invalidRange: (error: unknown) => boolean) {
  const pending = new Map<string, Pending<T>[]>()
  async function flush(id: string) {
    const requests = pending.get(id) || []
    pending.delete(id)
    const ranges = new Map<string, string>()
    for (const request of requests) for (const range of request.ranges) {
      const match = range.match(/^(.+)!A:([A-Z]+)$/)
      const key = match ? match[1] : range
      const previous = ranges.get(key)
      if (!previous || (match && width(match[2]) > width(previous.split(":").at(-1)!))) ranges.set(key, range)
    }
    const merged = [...ranges.values()].sort()
    try {
      const rows = await read(id, merged)
      requests.forEach(request => request.resolve(Object.fromEntries(request.ranges.map(range => [sheet(range), rows[sheet(range)] || []]))))
    } catch (error) {
      if (merged.length < 2 || !invalidRange(error)) { requests.forEach(request => request.reject(error)); return }
      // Un onglet facultatif absent ne doit pas faire échouer les onglets valides.
      const results = new Map<string, { rows?: T[]; error?: unknown }>(await Promise.all(merged.map(async range => {
        try { return [sheet(range), { rows: (await read(id, [range]))[sheet(range)] || [] }] as const }
        catch (failure) { return [sheet(range), { error: failure }] as const }
      })))
      for (const request of requests) {
        const failed = request.ranges.map(range => results.get(sheet(range))!).find(result => "error" in result)
        if (failed && "error" in failed) request.reject(failed.error)
        else request.resolve(Object.fromEntries(request.ranges.map(range => [sheet(range), results.get(sheet(range))!.rows || []])))
      }
    }
  }
  return (id: string, ranges: string[]) => new Promise<Record<string, T[]>>((resolve, reject) => {
    const requests = pending.get(id)
    if (requests) requests.push({ ranges, resolve, reject })
    else {
      pending.set(id, [{ ranges, resolve, reject }])
      setImmediate(() => { void flush(id) })
    }
  })
}
