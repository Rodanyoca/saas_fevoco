"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { TransfertDetail } from "@/components/transferts/transfert-detail"
import { TransfertsFilters } from "@/components/transferts/transferts-filters"
import { TransfertsTable } from "@/components/transferts/transferts-table"
import type { Athlete, Transfert } from "@/lib/types"

import { TransfertFormDialog } from "@/components/transferts/transfert-form-dialog"

export function TransfertsClient({ transferts, athletes }: {
  transferts: Transfert[]
  athletes: Athlete[]
}) {
  const router = useRouter()
  const [rows, setRows] = useState(transferts)
  const [selectedTransfert, setSelectedTransfert] = useState<Transfert | null>(null)
  const [search, setSearch] = useState("")
  const [statut, setStatut] = useState("all")
  const [saison, setSaison] = useState("all")
  useEffect(() => setRows(transferts), [transferts])

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()

    return rows.filter((transfert) => {
      if (statut !== "all" && transfert.statut !== statut) return false
      if (saison !== "all" && transfert.saison !== saison) return false

      if (s) {
        const haystack =
          `${transfert.id} ${transfert.athleteId} ${transfert.athleteNom} ${transfert.clubOrigineId} ${transfert.clubOrigineNom} ${transfert.clubBeneficiaireId} ${transfert.clubBeneficiaireNom} ${transfert.typeTransfert} ${transfert.saison} ${transfert.observation} ${transfert.statut}`.toLowerCase()
        if (!haystack.includes(s)) return false
      }

      return true
    })
  }, [rows, saison, search, statut])

  if (selectedTransfert) {
    return <TransfertDetail transfert={selectedTransfert} onBack={() => setSelectedTransfert(null)} />
  }

  return (
    <div className="space-y-6">
      <TransfertFormDialog athletes={athletes} onChanged={async () => { router.refresh() }} />
      <TransfertsFilters
        transferts={rows}
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
