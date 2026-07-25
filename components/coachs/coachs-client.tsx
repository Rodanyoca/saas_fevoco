"use client"

import { useEffect, useMemo, useState } from "react"
import type { BaseActorLicence, Coach, CoachAffiliation } from "@/lib/types"
import { CoachsStats } from "@/components/coachs/coachs-stats"
import { CoachsFilters } from "@/components/coachs/coachs-filters"
import { CoachsTable } from "@/components/coachs/coachs-table"
import { CoachDetail } from "@/components/coachs/coach-detail"
import { CoachFormDialog } from "@/components/coachs/coach-form-dialog"
import type { SavedCoach } from "@/components/coachs/coach-form-dialog"
import type { ActorSexOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"
import type { CoachStructureOption } from "@/components/coachs/coach-affiliation-form-dialog"

export function CoachsClient({
  coachs,
  affiliations,
  licences,
  sexes,
  structures,
}: {
  coachs: Coach[]
  affiliations: CoachAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  structures: CoachStructureOption[]
}) {
  const [rows, setRows] = useState(coachs)
  const [affiliationRows, setAffiliationRows] = useState(affiliations)
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null)
  const [search, setSearch] = useState("")
  const [niveau, setNiveau] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(coachs), [coachs])
  useEffect(() => setAffiliationRows(affiliations), [affiliations])

  const applySavedCoach = (saved: SavedCoach) => {
    setRows((current) => {
      const existing = current.find((coach) => coach.idCoach === saved.idCoach)
      const merged: Coach = {
        avatarDriveId: "", avatarDriveUrl: "", lieuNaissance: "", specialisation: "", dateAffiliation: "",
        ...existing, ...saved, id: saved.idCoach, genre: saved.sexe,
      }
      return existing ? current.map((coach) => coach.idCoach === saved.idCoach ? merged : coach) : [merged, ...current]
    })
    setSelectedCoach((current) => current?.idCoach === saved.idCoach
      ? { ...current, ...saved, id: saved.idCoach, genre: saved.sexe }
      : current)
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((coach) => {
      if (niveau !== "all" && coach.niveau !== niveau) return false
      if (statut !== "all" && coach.statut !== statut) return false

      if (s) {
        const haystack =
          `${coach.idCoach} ${coach.nomComplet} ${coach.idNational} ${coach.idFivb} ${coach.sexe} ${coach.nationalite} ${coach.telephone} ${coach.email} ${coach.adresse} ${coach.statut} ${coach.niveau}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [rows, niveau, search, statut])

  return (
    <div className="space-y-6">
      {selectedCoach ? (
        <CoachDetail coach={selectedCoach} affiliations={affiliationRows} licences={licences} sexes={sexes} structures={structures} onAffiliationCreated={(affiliation) => setAffiliationRows((current) => [affiliation, ...current])} onUpdated={applySavedCoach} onBack={() => setSelectedCoach(null)} />
      ) : (
        <>
          <div className="flex justify-end"><CoachFormDialog sexes={sexes} onSaved={applySavedCoach} /></div>
          <CoachsStats coachs={rows} />
          <CoachsFilters
            coachs={rows}
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
