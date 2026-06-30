"use client"

import { useMemo, useState } from "react"
import type { Entente } from "@/lib/types"
import { EntentesFilters } from "@/components/ententes/ententes-filters"
import { EntentesTable } from "@/components/ententes/ententes-table"

export function EntentesClient({ ententes }: { ententes: Entente[] }) {
  const [search, setSearch] = useState("")
  const [ligue, setLigue] = useState("all")
  const [statut, setStatut] = useState("all")

  const liguesOptions = useMemo(() => {
    return Array.from(new Set(ententes.map((e) => e.ligueNom).filter(Boolean)))
  }, [ententes])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return ententes.filter((entente) => {
      if (ligue !== "all" && entente.ligueNom !== ligue) return false
      if (statut !== "all" && entente.statut !== statut) return false

      if (s) {
        const haystack =
          `${entente.id} ${entente.nom} ${entente.pseudo} ${entente.ligueNom} ${entente.personneContactNom} ${entente.personneContactTelephone}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [ententes, ligue, search, statut])

  return (
    <div className="space-y-6">
      <EntentesFilters
        search={search}
        ligue={ligue}
        statut={statut}
        ligues={liguesOptions}
        onSearchChange={setSearch}
        onLigueChange={setLigue}
        onStatutChange={setStatut}
      />

      <EntentesTable ententes={filtered} totalCount={filtered.length} />
    </div>
  )
}
