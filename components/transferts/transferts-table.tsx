"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Transfert } from "@/lib/types"
import { ArrowRight, ArrowRightLeft } from "lucide-react"

function formatDate(value: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getStatusClass(statut: string) {
  const value = statut.trim().toLowerCase()
  if (value === "valide" || value === "validé" || value === "active" || value === "actif") {
    return "bg-green-100 text-green-800 hover:bg-green-100"
  }
  if (value === "en attente") {
    return "bg-amber-100 text-amber-800 hover:bg-amber-100"
  }
  if (value === "rejete" || value === "rejeté" || value === "refuse" || value === "refusé") {
    return "bg-red-100 text-red-800 hover:bg-red-100"
  }
  return "bg-slate-100 text-slate-700 hover:bg-slate-100"
}

export function TransfertsTable({
  transferts,
  totalCount,
}: {
  transferts: Transfert[]
  totalCount: number
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            Liste des transferts
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalCount} transferts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead>Athlete</TableHead>
                <TableHead>Origine</TableHead>
                <TableHead className="w-[56px] text-center"></TableHead>
                <TableHead>Beneficiaire</TableHead>
                <TableHead>Type / duree</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transferts.map((transfert, index) => (
                <TableRow key={`${transfert.id || "transfert"}-${transfert.athleteId || "sans-athlete"}-${index}`}>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{transfert.athleteNom || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{transfert.clubOrigineNom || "-"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{transfert.athleteId || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <ArrowRight className="mx-auto h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{transfert.clubBeneficiaireNom || "-"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{transfert.clubBeneficiaireId || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{transfert.typeTransfert || "-"}</span>
                      <span className="text-xs text-muted-foreground">{transfert.duree || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(transfert.dateDebut)} - {formatDate(transfert.dateFin)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(transfert.dateValidation)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusClass(transfert.statut)}>{transfert.statut || "-"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
