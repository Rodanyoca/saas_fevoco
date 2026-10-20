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
import { paginateRows } from "@/lib/list-pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
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

  const pagination = paginateRows(filtered, page, pageSize)

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
            onSearchChange={(value) => { setSearch(value); setPage(1) }}
            onClubChange={(value) => { setClub(value); setPage(1) }}
            onGenreChange={(value) => { setGenre(value); setPage(1) }}
            onStatutChange={(value) => { setStatut(value); setPage(1) }}
          />
          <AthletesTable athletes={pagination.items} activeLicenceNumbers={activeLicenceNumbers} onViewAthlete={setSelectedAthlete} emptyMessage={rows.length ? "Aucun athlète ne correspond aux filtres." : "Aucun athlète enregistré."} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <label htmlFor="athlete-page-size">Afficher</label>
              <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1) }}>
                <SelectTrigger id="athlete-page-size" className="w-[70px]" aria-label="Athlètes par page"><SelectValue /></SelectTrigger>
                <SelectContent>{[10, 25, 50, 100].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent>
              </Select>
              <span aria-live="polite" aria-atomic="true">Total : {rows.length} athlète{rows.length > 1 ? "s" : ""}</span>
            </div>
            <nav aria-label="Pagination des athlètes" className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" aria-label="Page précédente" onClick={() => setPage(pagination.page - 1)} disabled={pagination.page === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm text-muted-foreground">Page {pagination.page} sur {pagination.pageCount}</span>
              <Button type="button" variant="outline" size="sm" aria-label="Page suivante" onClick={() => setPage(pagination.page + 1)} disabled={pagination.page === pagination.pageCount}><ChevronRight className="h-4 w-4" /></Button>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
