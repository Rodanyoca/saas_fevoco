"use client"

import { useMemo, useState } from "react"
import { QualiteStats } from "@/components/qualite/qualite-stats"
import { QualiteFilters } from "@/components/qualite/qualite-filters"
import { QualiteTable } from "@/components/qualite/qualite-table"
import type { QualityStat } from "@/lib/quality"

export function QualiteClient({ stats }: { stats: QualityStat[] }) {
  const [search, setSearch] = useState("")
  const [entity, setEntity] = useState("all")

  const filteredStats = useMemo(() => {
    const term = search.trim().toLowerCase()

    return stats.filter((stat) => {
      if (entity !== "all" && stat.entite !== entity) return false
      if (term && !stat.entite.toLowerCase().includes(term)) return false
      return true
    })
  }, [entity, search, stats])

  return (
    <>
      <QualiteStats stats={filteredStats} />
      <QualiteFilters
        stats={stats}
        search={search}
        entity={entity}
        onSearchChange={setSearch}
        onEntityChange={setEntity}
      />
      <QualiteTable stats={filteredStats} />
    </>
  )
}
