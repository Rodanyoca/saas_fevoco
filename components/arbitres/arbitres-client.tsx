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
  const [equipeNationale, setEquipeNationale] = useState("all")
  const [grade, setGrade] = useState("all")
  const [statut, setStatut] = useState("all")

  const filteredArbitres = useMemo(() => {
    const term = search.trim().toLowerCase()

    return arbitres.filter((arbitre) => {
      if (equipeNationale !== "all" && arbitre.equipeNational !== equipeNationale) return false
      if (grade !== "all" && arbitre.grade !== grade) return false
      if (statut !== "all" && arbitre.statut !== statut) return false

      if (term) {
        const haystack = [
          arbitre.id,
          arbitre.nomComplet,
          arbitre.genre,
          arbitre.grade,
          arbitre.telephone,
          arbitre.email,
          arbitre.equipeNational,
          arbitre.dateHomologation,
          arbitre.statut,
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    })
  }, [arbitres, equipeNationale, grade, search, statut])

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
            equipeNationale={equipeNationale}
            grade={grade}
            statut={statut}
            onSearchChange={setSearch}
            onEquipeNationaleChange={setEquipeNationale}
            onGradeChange={setGrade}
            onStatutChange={setStatut}
          />
          <ArbitresTable arbitres={filteredArbitres} onViewArbitre={setSelectedArbitre} />
        </>
      )}
    </div>
  )
}
