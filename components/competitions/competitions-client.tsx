"use client"

import { useMemo, useState } from "react"
import { CompetitionDetail } from "@/components/competitions/competition-detail"
import { CompetitionsFilters } from "@/components/competitions/competitions-filters"
import { CompetitionsStats } from "@/components/competitions/competitions-stats"
import { CompetitionsTable } from "@/components/competitions/competitions-table"
import { parseSheetDate } from "@/lib/date-utils"
import type { Competition, CompetitionClassement, CompetitionParticipant, CompetitionResult, CompetitionUnite } from "@/lib/types"

export function CompetitionsClient({
  competitions,
  participants,
  unites,
  results,
  classements,
}: {
  competitions: Competition[]
  participants: CompetitionParticipant[]
  unites: CompetitionUnite[]
  results: CompetitionResult[]
  classements: CompetitionClassement[]
}) {
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [search, setSearch] = useState("")
  const [discipline, setDiscipline] = useState("all")
  const [statut, setStatut] = useState("all")

  const statuts = useMemo(
    () =>
      Array.from(
        new Set(
          competitions
            .map((competition) => competition.statut)
            .filter((value) => value.trim().length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [competitions],
  )

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return competitions
      .filter((competition) => {
        if (discipline !== "all" && competition.discipline !== discipline) return false
        if (statut !== "all" && competition.statut !== statut) return false

        if (s) {
          const haystack =
            `${competition.id} ${competition.nomCompetition} ${competition.discipline} ${competition.lieu} ${competition.niveau} ${competition.statut}`.toLowerCase()
          if (!haystack.includes(s)) return false
        }

        return true
      })
      .sort((a, b) => {
        const dateA = parseSheetDate(a.dateDebut)?.getTime() ?? 0
        const dateB = parseSheetDate(b.dateDebut)?.getTime() ?? 0
        return dateB - dateA
      })
  }, [competitions, discipline, search, statut])

  if (selectedCompetition) {
    return (
      <CompetitionDetail
        competition={selectedCompetition}
        participants={participants}
        unites={unites}
        results={results}
        classements={classements}
        onBack={() => setSelectedCompetition(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <CompetitionsStats competitions={competitions} unites={unites} results={results} />
      <CompetitionsFilters
        search={search}
        discipline={discipline}
        statut={statut}
        statuts={statuts}
        onSearchChange={setSearch}
        onDisciplineChange={setDiscipline}
        onStatutChange={setStatut}
      />
      <CompetitionsTable
        competitions={filtered}
        unites={unites}
        results={results}
        totalCount={filtered.length}
        onViewCompetition={setSelectedCompetition}
      />
    </div>
  )
}
