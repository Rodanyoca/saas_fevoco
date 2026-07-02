"use client"

import { useMemo, useState } from "react"
import type { Medecin } from "@/lib/types"
import { MedecinsStats } from "@/components/medecins/medecins-stats"
import { MedecinsFilters } from "@/components/medecins/medecins-filters"
import { MedecinsTable } from "@/components/medecins/medecins-table"
import { MedecinDetail } from "@/components/medecins/medecin-detail"

export function MedecinsClient({ medecins }: { medecins: Medecin[] }) {
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin | null>(null)
  const [search, setSearch] = useState("")
  const [niveau, setNiveau] = useState("all")
  const [specialite, setSpecialite] = useState("all")
  const [statut, setStatut] = useState("all")

  const filteredMedecins = useMemo(() => {
    const term = search.trim().toLowerCase()

    return medecins.filter((medecin) => {
      if (niveau !== "all" && medecin.niveau !== niveau) return false
      if (specialite !== "all" && medecin.specialite !== specialite) return false
      if (statut !== "all" && medecin.statut !== statut) return false

      if (term) {
        const haystack = [
          medecin.id,
          medecin.nomComplet,
          medecin.telephone,
          medecin.email,
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
    })
  }, [medecins, niveau, search, specialite, statut])

  return (
    <div className="space-y-6">
      {selectedMedecin ? (
        <MedecinDetail medecin={selectedMedecin} onBack={() => setSelectedMedecin(null)} />
      ) : (
        <>
          <MedecinsStats medecins={medecins} />
          <MedecinsFilters
            medecins={medecins}
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
