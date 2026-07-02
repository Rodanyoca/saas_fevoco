"use client"

import { useMemo, useState } from "react"
import { TransfertsFilters } from "@/components/transferts/transferts-filters"
import { TransfertsStats } from "@/components/transferts/transferts-stats"
import { TransfertsTable } from "@/components/transferts/transferts-table"
import type { Transfert } from "@/lib/types"

export function TransfertsClient({ transferts }: { transferts: Transfert[] }) {
  const [search, setSearch] = useState("")
  const [statut, setStatut] = useState("all")
  const [type, setType] = useState("all")

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return transferts.filter((transfert) => {
      if (statut !== "all" && transfert.statut !== statut) return false
      if (type !== "all" && transfert.typeTransfert !== type) return false

      if (s) {
        const haystack =
          `${transfert.id} ${transfert.athleteId} ${transfert.athleteNom} ${transfert.clubOrigineId} ${transfert.clubOrigineNom} ${transfert.clubBeneficiaireId} ${transfert.clubBeneficiaireNom} ${transfert.typeTransfert} ${transfert.saison} ${transfert.observation} ${transfert.statut}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [search, statut, transferts, type])

  return (
    <div className="space-y-6">
      <TransfertsStats transferts={transferts} />
      <TransfertsFilters
        transferts={transferts}
        search={search}
        statut={statut}
        type={type}
        onSearchChange={setSearch}
        onStatutChange={setStatut}
        onTypeChange={setType}
      />
      <TransfertsTable transferts={filtered} totalCount={filtered.length} />
    </div>
  )
}
