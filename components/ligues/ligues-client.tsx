"use client"

import { useMemo, useState } from "react"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"
import { LigueDetail } from "@/components/ligues/ligue-detail"
import { LiguesFilters } from "@/components/ligues/ligues-filters"
import { LiguesStats } from "@/components/ligues/ligues-stats"
import { LiguesTable } from "@/components/ligues/ligues-table"

export function LiguesClient({
  ligues,
  ententes,
  clubs,
  athletes,
}: {
  ligues: Ligue[]
  ententes: Entente[]
  clubs: Club[]
  athletes: Athlete[]
}) {
  const [search, setSearch] = useState("")
  const [statut, setStatut] = useState("all")
  const [selectedLigue, setSelectedLigue] = useState<Ligue | null>(null)

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return ligues.filter((ligue) => {
      if (statut !== "all" && ligue.statut !== statut) return false

      if (s) {
        const haystack = `${ligue.id} ${ligue.nom} ${ligue.provinceNom}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [ligues, search, statut])

  if (selectedLigue) {
    return (
      <LigueDetail
        ligue={selectedLigue}
        ententes={ententes}
        clubs={clubs}
        athletes={athletes}
        onBack={() => setSelectedLigue(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <LiguesStats ligues={ligues} />

      <LiguesFilters
        search={search}
        statut={statut}
        onSearchChange={setSearch}
        onStatutChange={setStatut}
      />

      <LiguesTable
        ligues={filtered}
        totalCount={filtered.length}
        onViewLigue={setSelectedLigue}
      />
    </div>
  )
}
