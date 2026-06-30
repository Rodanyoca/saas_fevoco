"use client"

import { useMemo, useState } from "react"
import type { Coach, CoachAffiliation } from "@/lib/types"
import { CoachsStats } from "@/components/coachs/coachs-stats"
import { CoachsFilters } from "@/components/coachs/coachs-filters"
import { CoachsTable } from "@/components/coachs/coachs-table"
import { CoachDetail } from "@/components/coachs/coach-detail"

export function CoachsClient({
  coachs,
  affiliations,
}: {
  coachs: Coach[]
  affiliations: CoachAffiliation[]
}) {
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [search, setSearch] = useState("")
  const [niveau, setNiveau] = useState("all")
  const [statut, setStatut] = useState("all")

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return coachs.filter((coach) => {
      if (niveau !== "all" && coach.niveau !== niveau) return false
      if (statut !== "all" && coach.statut !== statut) return false

      if (s) {
        const haystack =
          `${coach.id} ${coach.nomComplet} ${coach.telephone} ${coach.email} ${coach.niveau} ${coach.specialisation}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [coachs, niveau, search, statut])

  return (
    <div className="space-y-6">
      {selectedCoach ? (
        <CoachDetail
          coach={selectedCoach}
          affiliations={affiliations.filter((affiliation) => affiliation.coachId === selectedCoach.id)}
          onBack={() => setSelectedCoach(null)}
        />
      ) : (
        <>
          <CoachsStats coachs={coachs} />
          <CoachsFilters
            coachs={coachs}
            search={search}
            niveau={niveau}
            statut={statut}
            onSearchChange={setSearch}
            onNiveauChange={setNiveau}
            onStatutChange={setStatut}
          />
          <CoachsTable coachs={filtered} onViewCoach={setSelectedCoach} />
        </>
      )}
    </div>
  )
}
