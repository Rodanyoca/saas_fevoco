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
  const [ligue, setLigue] = useState("all")
  const [club, setClub] = useState("all")
  const [statut, setStatut] = useState("all")

  const filteredMedecins = useMemo(() => {
    const term = search.trim().toLowerCase()

    return medecins.filter((medecin) => {
      if (ligue !== "all" && medecin.ligueNom !== ligue) return false
      if (club !== "all" && medecin.clubNom !== club) return false
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
          medecin.ligueNom,
          medecin.ententeNom,
          medecin.pseudoEntente,
          medecin.clubNom,
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    })
  }, [club, ligue, medecins, search, statut])

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
            ligue={ligue}
            club={club}
            statut={statut}
            onSearchChange={setSearch}
            onLigueChange={setLigue}
            onClubChange={setClub}
            onStatutChange={setStatut}
          />
          <MedecinsTable medecins={filteredMedecins} onViewMedecin={setSelectedMedecin} />
        </>
      )}
    </div>
  )
}
