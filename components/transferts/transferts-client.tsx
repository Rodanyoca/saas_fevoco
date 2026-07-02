"use client"

import { useMemo, useState } from "react"
import { TransfertDetail } from "@/components/transferts/transfert-detail"
import { TransfertsFilters } from "@/components/transferts/transferts-filters"
import { TransfertsStats } from "@/components/transferts/transferts-stats"
import { TransfertsTable } from "@/components/transferts/transferts-table"
import type { Transfert } from "@/lib/types"

export function TransfertsClient({ transferts }: { transferts: Transfert[] }) {
  const [selectedTransfert, setSelectedTransfert] = useState<Transfert | null>(null)
  const [search, setSearch] = useState("")
  const [statut, setStatut] = useState("all")
  const [saison, setSaison] = useState("all")

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return transferts.filter((transfert) => {
      if (statut !== "all" && transfert.statut !== statut) return false
      if (saison !== "all" && transfert.saison !== saison) return false

      if (s) {
        const haystack =
          `${transfert.id} ${transfert.athleteId} ${transfert.athleteNom} ${transfert.clubOrigineId} ${transfert.clubOrigineNom} ${transfert.clubBeneficiaireId} ${transfert.clubBeneficiaireNom} ${transfert.typeTransfert} ${transfert.saison} ${transfert.observation} ${transfert.statut}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [saison, search, statut, transferts])

  if (selectedTransfert) {
    return <TransfertDetail transfert={selectedTransfert} onBack={() => setSelectedTransfert(null)} />
  }

  return (
    <div className="space-y-6">
      <TransfertsStats transferts={transferts} />
      <TransfertsFilters
        transferts={transferts}
        search={search}
        statut={statut}
        saison={saison}
        onSearchChange={setSearch}
        onStatutChange={setStatut}
        onSaisonChange={setSaison}
      />
      <TransfertsTable
        transferts={filtered}
        totalCount={filtered.length}
        onViewTransfert={setSelectedTransfert}
      />
    </div>
  )
}
