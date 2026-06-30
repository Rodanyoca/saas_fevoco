"use client"

import { useMemo, useState } from "react"
import type { Athlete } from "@/lib/types"
import { AthletesStats } from "@/components/athletes/athletes-stats"
import { AthletesFilters } from "@/components/athletes/athletes-filters"
import { AthletesTable } from "@/components/athletes/athletes-table"
import { AthleteDetail } from "@/components/athletes/athlete-detail"
import type { Transfert } from "@/lib/types"

export function AthletesClient({
  athletes,
  transferts,
}: {
  athletes: Athlete[]
  transferts: Transfert[]
}) {
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [search, setSearch] = useState("")
  const [club, setClub] = useState("all")
  const [genre, setGenre] = useState("all")
  const [statut, setStatut] = useState("all")

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return athletes.filter((athlete) => {
      if (club !== "all" && athlete.clubNom !== club) return false
      if (genre !== "all" && athlete.genre !== genre) return false
      if (statut !== "all" && athlete.statut !== statut) return false

      if (s) {
        const haystack =
          `${athlete.id} ${athlete.nomComplet} ${athlete.clubNom} ${athlete.ententeNom} ${athlete.ligueNom} ${athlete.numero} ${athlete.disciplineActive} ${athlete.posteIndoor} ${athlete.posteBeach}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [athletes, club, genre, search, statut])

  return (
    <div className="space-y-6">
      {selectedAthlete ? (
        <AthleteDetail
          athlete={selectedAthlete}
          transferts={transferts}
          onBack={() => setSelectedAthlete(null)}
        />
      ) : (
        <>
          <AthletesStats athletes={athletes} />
          <AthletesFilters
            athletes={athletes}
            search={search}
            club={club}
            genre={genre}
            statut={statut}
            onSearchChange={setSearch}
            onClubChange={setClub}
            onGenreChange={setGenre}
            onStatutChange={setStatut}
          />
          <AthletesTable athletes={filtered} onViewAthlete={setSelectedAthlete} />
        </>
      )}
    </div>
  )
}
