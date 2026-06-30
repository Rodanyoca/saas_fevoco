"use client"

import { useMemo, useState } from "react"
import type { Officiel } from "@/lib/types"
import { OfficielsStats } from "@/components/officiels/officiels-stats"
import { OfficielsFilters } from "@/components/officiels/officiels-filters"
import { OfficielsTable } from "@/components/officiels/officiels-table"
import { OfficielDetail } from "@/components/officiels/officiel-detail"

export function OfficielsClient({ officiels }: { officiels: Officiel[] }) {
  const [selectedOfficiel, setSelectedOfficiel] = useState<Officiel | null>(null)
  const [search, setSearch] = useState("")
  const [province, setProvince] = useState("all")
  const [fonction, setFonction] = useState("all")
  const [statut, setStatut] = useState("all")

  const filteredOfficiels = useMemo(() => {
    const term = search.trim().toLowerCase()

    return officiels.filter((officiel) => {
      if (province !== "all" && officiel.provinceNom !== province) return false
      if (fonction !== "all" && officiel.fonction !== fonction) return false
      if (statut !== "all" && officiel.statut !== statut) return false

      if (term) {
        const haystack = [
          officiel.id,
          officiel.nomComplet,
          officiel.genre,
          officiel.fonction,
          officiel.niveau,
          officiel.provinceNom,
          officiel.ententeNom,
          officiel.clubNom,
          officiel.equipeFederal,
          officiel.telephone,
          officiel.email,
          officiel.statut,
        ]
          .join(" ")
          .toLowerCase()

        if (!haystack.includes(term)) return false
      }

      return true
    })
  }, [fonction, officiels, province, search, statut])

  return (
    <div className="space-y-6">
      {selectedOfficiel ? (
        <OfficielDetail officiel={selectedOfficiel} onBack={() => setSelectedOfficiel(null)} />
      ) : (
        <>
          <OfficielsStats officiels={officiels} />
          <OfficielsFilters
            officiels={officiels}
            search={search}
            province={province}
            fonction={fonction}
            statut={statut}
            onSearchChange={setSearch}
            onProvinceChange={setProvince}
            onFonctionChange={setFonction}
            onStatutChange={setStatut}
          />
          <OfficielsTable officiels={filteredOfficiels} onViewOfficiel={setSelectedOfficiel} />
        </>
      )}
    </div>
  )
}
