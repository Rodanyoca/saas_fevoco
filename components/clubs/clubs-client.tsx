"use client"

import { useEffect, useMemo, useState } from "react"
import type { Athlete, Club, Entente } from "@/lib/types"
import { ClubDetail } from "@/components/clubs/club-detail"
import { ClubsFilters } from "@/components/clubs/clubs-filters"
import { ClubsStats } from "@/components/clubs/clubs-stats"
import { ClubsTable } from "@/components/clubs/clubs-table"
import { ClubFormDialog } from "@/components/clubs/club-form-dialog"
import type { SavedClub } from "@/components/clubs/club-form-dialog"
import { compareLabels } from "@/lib/sort-utils"
import type { ClubReferenceOption } from "@/lib/club-references"

function belongsToClub(athlete: Pick<Athlete, "clubId" | "clubNom">, club: Club) {
  return Boolean(
    (athlete.clubId && athlete.clubId === club.idClub) ||
      (athlete.clubNom && athlete.clubNom === club.nomClub),
  )
}

export function ClubsClient({
  clubs,
  athletes,
  ententes,
  categories,
  versions,
}: {
  clubs: Club[]
  athletes: Athlete[]
  ententes: Entente[]
  categories: ClubReferenceOption[]
  versions: ClubReferenceOption[]
}) {
  const [rows, setRows] = useState(clubs)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [search, setSearch] = useState("")
  const [ligue, setLigue] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(clubs), [clubs])

  const applySavedClub = (saved: SavedClub) => {
    const previousId = saved.previousIdClub || saved.idClub
    setRows((current) => {
      const existing = current.find((club) => club.idClub === previousId)
      const merged: Club = {
        provinceId: "", provinceNom: "",
        personneContactNom: "", personneContactTelephone: "",
        presidentId: "", presidentNom: "", presidentTelephone: "", presidentEmail: "",
        adresse: "",
        ...existing, ...saved,
        id: saved.idClub, numeroOrdre: saved.codeClub, nom: saved.nomClub,
        ligueId: saved.idLigue, ligueNom: saved.nomLigue,
        ententeId: saved.idEntente, ententeNom: saved.nomEntente,
        dateAffiliation: saved.dateAffiliationClub,
      }
      return existing
        ? current.map((club) => club.idClub === previousId ? merged : club)
        : [merged, ...current]
    })
    setSelectedClub((current) => current?.idClub === previousId
      ? {
          ...current, ...saved,
          id: saved.idClub, numeroOrdre: saved.codeClub, nom: saved.nomClub,
          ligueId: saved.idLigue, ligueNom: saved.nomLigue,
          ententeId: saved.idEntente, ententeNom: saved.nomEntente,
          dateAffiliation: saved.dateAffiliationClub,
        }
      : current)
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((club) => {
      if (ligue !== "all" && club.ligueNom !== ligue) return false
      if (statut !== "all" && club.statut !== statut) return false

      if (s) {
        const haystack =
          `${club.id} ${club.nom} ${club.categorie} ${club.ligueNom} ${club.ententeNom} ${club.pseudoEntente} ${club.version} ${club.statut} ${club.observations}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomClub, right.nomClub))
  }, [rows, ligue, search, statut])

  if (selectedClub) {
    return (
      <ClubDetail
        club={selectedClub}
        athletes={athletes.filter((athlete) => belongsToClub(athlete, selectedClub))}
        ententes={ententes}
        categories={categories}
        versions={versions}
        onBack={() => setSelectedClub(null)}
        onUpdated={applySavedClub}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ClubFormDialog ententes={ententes} categories={categories} versions={versions} onSaved={applySavedClub} />
      </div>
      <ClubsStats clubs={rows} />
      <ClubsFilters
        clubs={rows}
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
