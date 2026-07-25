"use client"

import { useEffect, useMemo, useState } from "react"
import type { Entente, Ligue } from "@/lib/types"
import type { SavedEntente } from "@/components/ententes/entente-form-dialog"
import { CreateEntenteDialog } from "@/components/ententes/entente-form-dialog"
import { EntentesFilters } from "@/components/ententes/ententes-filters"
import { EntentesStats } from "@/components/ententes/ententes-stats"
import { EntentesTable } from "@/components/ententes/ententes-table"
import { compareLabels } from "@/lib/sort-utils"

export function EntentesClient({ ententes, ligues }: { ententes: Entente[]; ligues: Ligue[] }) {
  const [rows, setRows] = useState(ententes)
  const [search, setSearch] = useState("")
  const [ligue, setLigue] = useState("all")
  const [statut, setStatut] = useState("all")

  useEffect(() => setRows(ententes), [ententes])

  const applySavedEntente = (saved: SavedEntente) => {
    setRows((current) => {
      const previousId = saved.previousIdEntente || saved.idEntente
      const existing = current.find((item) => item.idEntente === previousId)
      const merged: Entente = {
        ...existing,
        ...saved,
        id: saved.idEntente,
        numeroOrdre: saved.codeEntente,
        nom: saved.nomEntente,
        pseudo: saved.pseudoEntente,
        ligueId: saved.idLigue,
        ligueNom: saved.nomLigue,
      }
      return existing
        ? current.map((item) => item.idEntente === previousId ? merged : item)
        : [merged, ...current]
    })
  }

  const liguesOptions = useMemo(() => {
    return Array.from(new Set(rows.map((e) => e.ligueNom).filter(Boolean)))
  }, [rows])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((entente) => {
      if (ligue !== "all" && entente.ligueNom !== ligue) return false
      if (statut !== "all" && entente.statut !== statut) return false

      if (s) {
        const haystack =
          `${entente.id} ${entente.nom} ${entente.pseudo} ${entente.ligueNom} ${entente.emailEntente} ${entente.statut}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    }).sort((left, right) =>
      compareLabels(left.nomEntente || left.pseudoEntente, right.nomEntente || right.pseudoEntente),
    )
  }, [rows, ligue, search, statut])

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateEntenteDialog ligues={ligues} onSaved={applySavedEntente} />
      </div>
      <EntentesStats ententes={rows} />
      <EntentesFilters
        search={search}
        ligue={ligue}
        statut={statut}
        ligues={liguesOptions}
        onSearchChange={setSearch}
        onLigueChange={setLigue}
        onStatutChange={setStatut}
      />

      <EntentesTable ententes={filtered} ligues={ligues} totalCount={filtered.length} onSaved={applySavedEntente} />
    </div>
  )
}
