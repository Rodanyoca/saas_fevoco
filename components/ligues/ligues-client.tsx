"use client"

import { useEffect, useMemo, useState } from "react"
import type { Athlete, Club, Entente, Ligue, Province } from "@/lib/types"
import { LigueDetail } from "@/components/ligues/ligue-detail"
import { LiguesFilters } from "@/components/ligues/ligues-filters"
import { LiguesStats } from "@/components/ligues/ligues-stats"
import { LiguesTable } from "@/components/ligues/ligues-table"
import { LigueFormDialog } from "@/components/ligues/ligue-form-dialog"
import type { SavedLigue } from "@/components/ligues/ligue-form-dialog"
import { compareLabels } from "@/lib/sort-utils"

export function LiguesClient({
  ligues,
  ententes,
  clubs,
  athletes,
  provinceOptions,
}: {
  ligues: Ligue[]
  ententes: Entente[]
  clubs: Club[]
  athletes: Athlete[]
  provinceOptions: Province[]
}) {
  const [rows, setRows] = useState(ligues)
  const [search, setSearch] = useState("")
  const [province, setProvince] = useState("all")
  const [statut, setStatut] = useState("all")
  const [selectedLigue, setSelectedLigue] = useState<Ligue | null>(null)
  useEffect(() => setRows(ligues), [ligues])

  const applySavedLigue = (saved: SavedLigue) => {
    setRows((current) => {
      const existing = current.find((item) => item.idLigue === saved.idLigue)
      const merged: Ligue = {
        presidentId: "", presidentNom: "", presidentTelephone: "", presidentEmail: "",
        secretaireId: "", secretaireNom: "", secretaireTelephone: "", secretaireEmail: "",
        ...existing, ...saved,
        id: saved.idLigue, nom: saved.nomLigue,
        provinceId: saved.idProvince, provinceNom: saved.nomProvince,
      }
      return existing
        ? current.map((item) => item.idLigue === saved.idLigue ? merged : item)
        : [merged, ...current]
    })
    setSelectedLigue((current) => current?.idLigue === saved.idLigue
      ? { ...current, ...saved, id: saved.idLigue, nom: saved.nomLigue, provinceId: saved.idProvince, provinceNom: saved.nomProvince }
      : current)
  }
  const provinces = useMemo(
    () => Array.from(new Set(rows.map((ligue) => ligue.provinceNom).filter(Boolean))).sort(),
    [rows],
  )

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((ligue) => {
      if (statut !== "all" && ligue.statut !== statut) return false
      if (province !== "all" && ligue.provinceNom !== province) return false

      if (s) {
        const haystack =
          `${ligue.id} ${ligue.nom} ${ligue.provinceNom} ${ligue.emailLigue} ${ligue.statut}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    }).sort((left, right) => compareLabels(left.nomLigue, right.nomLigue))
  }, [rows, province, search, statut])

  if (selectedLigue) {
    return (
      <LigueDetail
        ligue={selectedLigue}
        ententes={ententes}
        clubs={clubs}
        athletes={athletes}
        provinces={provinceOptions}
        onBack={() => setSelectedLigue(null)}
        onUpdated={applySavedLigue}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <LigueFormDialog provinces={provinceOptions} onSaved={applySavedLigue} />
      </div>
      <LiguesStats ligues={rows} />

      <LiguesFilters
        search={search}
        province={province}
        statut={statut}
        provinces={provinces}
        onSearchChange={setSearch}
        onProvinceChange={setProvince}
        onStatutChange={setStatut}
      />

      <LiguesTable
        ligues={filtered}
        totalCount={filtered.length}
        onViewLigue={setSelectedLigue}
      />
    </div>
  )
}
