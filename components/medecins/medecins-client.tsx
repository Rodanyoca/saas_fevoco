"use client"

import { useEffect, useMemo, useState } from "react"
import type { BaseActorLicence, Medecin, MedecinAffiliation } from "@/lib/types"
import { MedecinsStats } from "@/components/medecins/medecins-stats"
import { MedecinsFilters } from "@/components/medecins/medecins-filters"
import { MedecinsTable } from "@/components/medecins/medecins-table"
import { MedecinDetail } from "@/components/medecins/medecin-detail"
import { MedecinFormDialog } from "@/components/medecins/medecin-form-dialog"
import type { SavedMedecin } from "@/components/medecins/medecin-form-dialog"
import type { ActorSexOption } from "@/lib/actor-references"
import { compareLabels } from "@/lib/sort-utils"

export function MedecinsClient({ medecins, affiliations, licences, sexes }: {
  medecins: Medecin[]
  affiliations: MedecinAffiliation[]
  licences: BaseActorLicence[]
  sexes: ActorSexOption[]
}) {
  const [rows, setRows] = useState(medecins)
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)
  const [search, setSearch] = useState("")
  const [niveau, setNiveau] = useState("all")
  const [specialite, setSpecialite] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(medecins), [medecins])

  const applySavedMedecin = (saved: SavedMedecin) => {
    setRows((current) => {
      const existing = current.find((medecin) => medecin.idMedecin === saved.idMedecin)
      const merged: Medecin = {
        avatarDriveId: "", avatarDriveUrl: "", niveau: "", numeroOrdre: "", equipeNationale: "",
        provinceId: "", provinceNom: "", ligueId: "", ligueNom: "", ententeId: "", ententeNom: "",
        pseudoEntente: "", clubId: "", clubNom: "", equipeId: "", equipeNom: "",
        dateAffiliation: "", affiliations: [],
        ...existing, ...saved, id: saved.idMedecin, dateNaissance: saved.dateDeNaissance, genre: saved.sexe,
      }
      return existing
        ? current.map((medecin) => medecin.idMedecin === saved.idMedecin ? merged : medecin)
        : [merged, ...current]
    })
    setSelectedMedecin((current) => current?.idMedecin === saved.idMedecin
      ? { ...current, ...saved, id: saved.idMedecin, dateNaissance: saved.dateDeNaissance, genre: saved.sexe }
      : current)
  }

  const filteredMedecins = useMemo(() => {
    const term = search.trim().toLowerCase()

    return rows.filter((medecin) => {
      if (niveau !== "all" && medecin.niveau !== niveau) return false
      if (specialite !== "all" && medecin.specialite !== specialite) return false
      if (statut !== "all" && medecin.statut !== statut) return false

      if (term) {
        const haystack = [
          medecin.id,
          medecin.nomComplet,
          medecin.idNational,
          medecin.idFivb,
          medecin.sexe,
          medecin.nationalite,
          medecin.telephone,
          medecin.email,
          medecin.adresse,
          medecin.numeroOrdre,
          medecin.specialite,
          medecin.niveau,
          medecin.dateAffiliation,
          medecin.equipeNationale,
          medecin.statut,
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomComplet, right.nomComplet))
  }, [rows, niveau, search, specialite, statut])

  return (
    <div className="space-y-6">
      {selectedMedecin ? (
        <MedecinDetail medecin={selectedMedecin} affiliations={affiliations} licences={licences} sexes={sexes} onUpdated={applySavedMedecin} onBack={() => setSelectedMedecin(null)} />
      ) : (
        <>
          <div className="flex justify-end"><MedecinFormDialog sexes={sexes} onSaved={applySavedMedecin} /></div>
          <MedecinsStats medecins={rows} />
          <MedecinsFilters
            medecins={rows}
            search={search}
            niveau={niveau}
            specialite={specialite}
            statut={statut}
            onSearchChange={setSearch}
            onNiveauChange={setNiveau}
            onSpecialiteChange={setSpecialite}
            onStatutChange={setStatut}
          />
          <MedecinsTable medecins={filteredMedecins} onViewMedecin={setSelectedMedecin} />
        </>
      )}
    </div>
  )
}
