"use client"

import { useMemo, useState } from "react"
import type { Arbitre } from "@/lib/types"
import { ArbitresStats } from "@/components/arbitres/arbitres-stats"
import { ArbitresFilters } from "@/components/arbitres/arbitres-filters"
import { ArbitresTable } from "@/components/arbitres/arbitres-table"
import { ArbitreDetail } from "@/components/arbitres/arbitre-detail"

export function ArbitresClient({ arbitres }: { arbitres: Arbitre[] }) {
  const [selectedArbitre, setSelectedArbitre] = useState<Arbitre | null>(null)
  const [search, setSearch] = useState("")
  const [ligue, setLigue] = useState("all")
  const [grade, setGrade] = useState("all")
  const [statut, setStatut] = useState("all")

  const filteredArbitres = useMemo(() => {
    const term = search.trim().toLowerCase()

    return arbitres.filter((arbitre) => {
      if (ligue !== "all" && arbitre.ligueNom !== ligue) return false
      if (grade !== "all" && arbitre.grade !== grade) return false
      if (statut !== "all" && arbitre.statut !== statut) return false

      if (term) {
        const haystack = [
          arbitre.id,
          arbitre.nomComplet,
          arbitre.genre,
          arbitre.grade,
          arbitre.ligueNom,
          arbitre.telephone,
          arbitre.email,
          arbitre.equipeNational,
          arbitre.statut,
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    })
  }, [arbitres, grade, ligue, search, statut])

  return (
    <div className="space-y-6">
      {selectedArbitre ? (
        <ArbitreDetail arbitre={selectedArbitre} onBack={() => setSelectedArbitre(null)} />
      ) : (
        <>
          <ArbitresStats arbitres={arbitres} />
          <ArbitresFilters
            arbitres={arbitres}
            search={search}
            ligue={ligue}
            grade={grade}
            statut={statut}
            onSearchChange={setSearch}
            onLigueChange={setLigue}
            onGradeChange={setGrade}
            onStatutChange={setStatut}
          />
          <ArbitresTable arbitres={filteredArbitres} onViewArbitre={setSelectedArbitre} />
        </>
      )}
    </div>
  )
}
