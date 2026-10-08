"use client"

import { useEffect, useMemo, useState } from "react"
import type { Athlete, AthleteLicence } from "@/lib/types"
import { AthletesFilters } from "@/components/athletes/athletes-filters"
import { AthletesTable } from "@/components/athletes/athletes-table"
import { AthleteDetail } from "@/components/athletes/athlete-detail"
import { AthleteFormDialog } from "@/components/athletes/athlete-form-dialog"
import type { SavedAthlete } from "@/components/athletes/athlete-form-dialog"
import type { ActorSexOption } from "@/lib/actor-references"
import { activeActorLicenceNumbers } from "@/lib/active-actor-licences"
import { compareLabels } from "@/lib/sort-utils"

export function AthletesClient({
  athletes,
  licences,
  sexes,
}: {
  athletes: Athlete[]
  licences: AthleteLicence[]
  sexes: ActorSexOption[]
}) {
  const [rows, setRows] = useState(athletes)
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [search, setSearch] = useState("")
  const [club, setClub] = useState("all")
  const [genre, setGenre] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(athletes), [athletes])
  useEffect(() => {
    const returnToList = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "/athletes") {
        setSelectedAthlete(null)
      }
    }

    window.addEventListener("fevoco:navigate", returnToList)
    return () => window.removeEventListener("fevoco:navigate", returnToList)
  }, [])

  const applySavedAthlete = (saved: SavedAthlete) => {
    setRows((current) => {
      const existing = current.find((item) => item.idAthlete === saved.idAthlete)
      const merged: Athlete = {
        numeroOrdre: "", provinceId: "", provinceNom: "", ligueId: "", ligueNom: "",
        ententeId: "", ententeNom: "", clubId: "", clubNom: "", disciplineActive: "",
        posteIndoor: "", posteBeach: "", numero: "", taille: null, poids: null,
        ...existing, ...saved,
        id: saved.idAthlete, dateNaissance: saved.dateDeNaissance,
        genre: saved.sexe,
      }
      return existing
        ? current.map((item) => item.idAthlete === saved.idAthlete ? merged : item)
        : [merged, ...current]
    })
    setSelectedAthlete((current) => current?.idAthlete === saved.idAthlete
      ? { ...current, ...saved, id: saved.idAthlete, dateNaissance: saved.dateDeNaissance, genre: saved.sexe }
      : current)
  }

  const activeLicenceNumbers = useMemo(() => activeActorLicenceNumbers(licences,
    new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())), [licences])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((athlete) => {
      if (club !== "all" && athlete.clubNom !== club) return false
      if (genre !== "all" && athlete.genre !== genre) return false
      if (statut !== "all" && athlete.statut !== statut) return false

      if (s) {
        const haystack = `${athlete.idAthlete} ${athlete.nomComplet} ${athlete.idNational} ${athlete.idFivb} ${activeLicenceNumbers.get(athlete.idAthlete) || ""}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [rows, activeLicenceNumbers, club, genre, search, statut])

  return (
    <div className="space-y-6">
      {selectedAthlete ? (
        <AthleteDetail athlete={selectedAthlete} licences={licences} sexes={sexes} onUpdated={applySavedAthlete} onBack={() => setSelectedAthlete(null)} />
      ) : (
        <>
          <div className="flex justify-end"><AthleteFormDialog sexes={sexes} onSaved={applySavedAthlete} /></div>
          <AthletesFilters
            athletes={rows}
            search={search}
            club={club}
            genre={genre}
            statut={statut}
            onSearchChange={setSearch}
            onClubChange={setClub}
            onGenreChange={setGenre}
            onStatutChange={setStatut}
          />
          <AthletesTable athletes={filtered} activeLicenceNumbers={activeLicenceNumbers} onViewAthlete={setSelectedAthlete} />
        </>
      )}
    </div>
  )
}
