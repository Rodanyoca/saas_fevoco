// Match Array.find semantics: the first occurrence wins, including empty keys.
export function firstIndex<T>(rows: readonly T[], key: (row: T) => string): Map<string, T> {
  const index = new Map<string, T>()
  for (const row of rows) {
    const id = key(row)
    if (!index.has(id)) index.set(id, row)
  }
  return index
}
