"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatSheetDate } from "@/lib/date-utils"
import type { EquipeNationale, EquipeNationaleSelection } from "@/lib/types"
import { ArrowLeft, Eye, Medal, Target, Trophy, Users } from "lucide-react"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isActive(value: string) {
  const v = normalize(value)
  return v.includes("actif") || v.includes("active") || v.includes("retenu") || v.includes("selection")
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  )
}

export function EquipeNationaleClient({
  equipes,
  selections,
}: {
  equipes: EquipeNationale[]
  selections: EquipeNationaleSelection[]
}) {
  const [selectedEquipe, setSelectedEquipe] = useState<EquipeNationale | null>(null)

  const equipesActives = equipes.filter((equipe) => isActive(equipe.statutEquipe)).length
  const selectionsActives = selections.filter((selection) => isActive(selection.statutSelection)).length

  const selectedSelections = useMemo(() => {
    if (!selectedEquipe) return []
    return selections.filter((selection) => selection.idEquipeNationale === selectedEquipe.idEquipeNationale)
  }, [selectedEquipe, selections])

  if (selectedEquipe) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedEquipe(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-foreground">
                {selectedEquipe.nomEquipeNationale || "Equipe nationale"}
              </h1>
              <p className="font-mono text-sm text-muted-foreground">{selectedEquipe.idEquipeNationale || "-"}</p>
            </div>
          </div>
          <Badge variant="outline">{selectedEquipe.statutEquipe || "-"}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Discipline</p>
              <p className="font-semibold">{selectedEquipe.discipline || "-"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Categorie</p>
              <p className="font-semibold">{selectedEquipe.categorie || "-"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Genre</p>
              <p className="font-semibold">{selectedEquipe.genre || "-"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Saison</p>
              <p className="font-semibold">{selectedEquipe.saison || "-"}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Membres selectionnes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSelections.length === 0 ? (
                    <EmptyRow colSpan={5} label="Aucun membre selectionne pour cette equipe." />
                  ) : (
                    selectedSelections.map((selection, index) => (
                      <TableRow key={`${selection.idSelection || "selection"}-${index}`}>
                        <TableCell className="font-medium">{selection.nomAthlete || "-"}</TableCell>
                        <TableCell>{selection.poste || "-"}</TableCell>
                        <TableCell>{selection.nomClub || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatSheetDate(selection.dateDebutSelection)} - {formatSheetDate(selection.dateFinSelection)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{selection.statutSelection || "-"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cards = [
    { label: "Equipes", value: equipes.length, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Equipes actives", value: equipesActives, icon: Trophy, color: "bg-green-500/10 text-green-700" },
    { label: "Membres", value: selections.length, icon: Users, color: "bg-blue-500/10 text-blue-700" },
    { label: "Membres actifs", value: selectionsActives, icon: Medal, color: "bg-amber-500/10 text-amber-700" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Equipes nationales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Saison</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipes.length === 0 ? (
                  <EmptyRow colSpan={8} label="Aucune equipe nationale disponible." />
                ) : (
                  equipes.map((equipe, index) => (
                    <TableRow key={`${equipe.idEquipeNationale || "equipe"}-${index}`}>
                      <TableCell className="font-mono text-muted-foreground">
                        {equipe.idEquipeNationale || "-"}
                      </TableCell>
                      <TableCell className="font-medium">{equipe.nomEquipeNationale || "-"}</TableCell>
                      <TableCell>{equipe.discipline || "-"}</TableCell>
                      <TableCell>{equipe.categorie || "-"}</TableCell>
                      <TableCell>{equipe.genre || "-"}</TableCell>
                      <TableCell>{equipe.saison || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{equipe.statutEquipe || "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedEquipe(equipe)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir les details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
