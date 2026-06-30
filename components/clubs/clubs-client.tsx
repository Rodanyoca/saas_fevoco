"use client"

import { useMemo, useState } from "react"
import type { Athlete, Club } from "@/lib/types"
import { ClubDetail } from "@/components/clubs/club-detail"
import { ClubsFilters } from "@/components/clubs/clubs-filters"
import { ClubsStats } from "@/components/clubs/clubs-stats"
import { ClubsTable } from "@/components/clubs/clubs-table"

function belongsToClub(athlete: Pick<Athlete, "clubId" | "clubNom">, club: Club) {
  return Boolean(
    (athlete.clubId && athlete.clubId === club.id) ||
      (athlete.clubNom && athlete.clubNom === club.nom),
  )
}

export function ClubsClient({
  clubs,
  athletes,
}: {
  clubs: Club[]
  athletes: Athlete[]
}) {
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [search, setSearch] = useState("")
  const [ligue, setLigue] = useState("all")
  const [statut, setStatut] = useState("all")

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return clubs.filter((club) => {
      if (ligue !== "all" && club.ligueNom !== ligue) return false
      if (statut !== "all" && club.statut !== statut) return false

      if (s) {
        const haystack =
          `${club.id} ${club.nom} ${club.ligueNom} ${club.ententeNom} ${club.pseudoEntente} ${club.version} ${club.personneContactNom} ${club.personneContactTelephone} ${club.adresse}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [clubs, ligue, search, statut])

  if (selectedClub) {
    return (
      <ClubDetail
        club={selectedClub}
        athletes={athletes.filter((athlete) => belongsToClub(athlete, selectedClub))}
        onBack={() => setSelectedClub(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <ClubsStats clubs={clubs} />
      <ClubsFilters
        clubs={clubs}
        search={search}
        ligue={ligue}
        statut={statut}
        onSearchChange={setSearch}
        onLigueChange={setLigue}
        onStatutChange={setStatut}
      />
      <ClubsTable clubs={filtered} onViewClub={setSelectedClub} />
    </div>
  )
}
