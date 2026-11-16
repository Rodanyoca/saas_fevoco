// Keep the existing all-fields, case-insensitive search semantics, including
// empty objects and String(null/undefined). No persistent index or duplicate data.
export function filterDataTableRows<T extends object>(data: T[], search: string, values: Record<string, string>, idKey = "id"): T[] {
  const query = search.toLowerCase()
  const filters = Object.entries(values).filter(([, value]) => value && value !== "all")
  return data.filter(item => {
    for (const [key, value] of filters) {
      if (String(item[key as keyof T]) !== value) return false
    }
    if (!query) {
      // Normal domain rows have an enumerable identity. Keep the historical
      // empty-object behavior without enumerating all fields of every profile.
      return Object.prototype.propertyIsEnumerable.call(item, idKey) || Object.keys(item).length > 0
    }
    return Object.values(item).some(value => String(value).toLowerCase().includes(query))
  })
}
