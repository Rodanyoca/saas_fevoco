"use client"

import { useEffect, useMemo, useState } from "react"
import type { Arbitre, BaseActorLicence } from "@/lib/types"
import { ArbitresFilters } from "@/components/arbitres/arbitres-filters"
import { ArbitresTable } from "@/components/arbitres/arbitres-table"
import { ArbitreDetail } from "@/components/arbitres/arbitre-detail"
import { ArbitreFormDialog } from "@/components/arbitres/arbitre-form-dialog"
import type { SavedArbitre } from "@/components/arbitres/arbitre-form-dialog"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { licenceNumbersByActor } from "@/lib/actor-search-index"
import { compareLabels } from "@/lib/sort-utils"

export function ArbitresClient({ arbitres, licences, sexes, grades }: {
  arbitres: Arbitre[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
  grades: CoachReferenceOption[]
}) {
  const [rows, setRows] = useState(arbitres)
  useEffect(() => {
    const deleted = (event: Event) => { const target = (event as CustomEvent<{entity:string;family:string;id:string}>).detail; if (target.entity === "actor" && target.family === "arbitre") setRows(current => current.filter(row => row.idArbitre !== target.id)) }
    window.addEventListener("fevoco:record-deleted", deleted)
    return () => window.removeEventListener("fevoco:record-deleted", deleted)
  }, [])

  const [selectedArbitre, setSelectedArbitre] = useState<Arbitre | null>(null)
  const [search, setSearch] = useState("")
  const [equipeNationale, setEquipeNationale] = useState("all")
  const [grade, setGrade] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(arbitres), [arbitres])

  const applySavedArbitre = (saved: SavedArbitre) => {
    setRows((current) => {
      const existing = current.find((arbitre) => arbitre.idArbitre === saved.idArbitre)
      const merged: Arbitre = {
        avatarDriveId: "", avatarDriveUrl: "", provinceId: "", provinceNom: "",
        ligueId: "", ligueNom: "", ententeId: "", ententeNom: "",
        dateHomologation: "", equipeNational: "", experience: "",
        ...existing, ...saved, id: saved.idArbitre, dateNaissance: saved.dateDeNaissance,
        genre: saved.sexe, grade: saved.grade, dateAffiliation: existing?.dateAffiliation ?? "",
      }
      return existing
        ? current.map((arbitre) => arbitre.idArbitre === saved.idArbitre ? merged : arbitre)
        : [merged, ...current]
    })
    setSelectedArbitre((current) => current?.idArbitre === saved.idArbitre
      ? { ...current, ...saved, id: saved.idArbitre, dateNaissance: saved.dateDeNaissance, genre: saved.sexe, grade: saved.grade }
      : current)
  }

  const licenceSearch = useMemo(() => licenceNumbersByActor(licences), [licences])
  const sortedRows = useMemo(() => [...rows].sort((left, right) => compareLabels(left.nomComplet, right.nomComplet)), [rows])

  const filteredArbitres = useMemo(() => {
    const term = search.trim().toLowerCase()

    return sortedRows.filter((arbitre) => {
      if (equipeNationale !== "all" && arbitre.equipeNational !== equipeNationale) return false
      if (grade !== "all" && arbitre.grade !== grade) return false
      if (statut !== "all" && arbitre.statut !== statut) return false

      if (term) {
        const licenceNumbers = licenceSearch.get(arbitre.idArbitre) || ""
        const haystack = `${arbitre.nomComplet} ${licenceNumbers}`.toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    })
  }, [sortedRows, licenceSearch, equipeNationale, grade, search, statut])

  return (
    <div className="space-y-6">
      {selectedArbitre ? (
        <ArbitreDetail arbitre={selectedArbitre} licences={licences} sexes={sexes} grades={grades} onUpdated={applySavedArbitre} onBack={() => setSelectedArbitre(null)} />
      ) : (
        <>
          <div className="flex justify-end"><ArbitreFormDialog sexes={sexes} grades={grades} onSaved={applySavedArbitre} /></div>
          <ArbitresFilters
            arbitres={rows}
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
