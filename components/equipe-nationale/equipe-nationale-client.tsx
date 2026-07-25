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
import type { EquipeNationale, EquipeNationaleCompetition, EquipeNationaleResultat, EquipeNationaleSelection, EquipeNationaleStaff } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Medal, Search, Target, Trophy, Users } from "lucide-react"

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
  staff,
  competitions,
  resultats,
}: {
  equipes: EquipeNationale[]
  selections: EquipeNationaleSelection[]
  staff: EquipeNationaleStaff[]
  competitions: EquipeNationaleCompetition[]
  resultats: EquipeNationaleResultat[]
}) {
  const [selectedEquipe, setSelectedEquipe] = useState<EquipeNationale | null>(null)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ discipline: "all", categorie: "all", genre: "all", saison: "all", statutEquipe: "all" })

  const equipesActives = equipes.filter((equipe) => isActive(equipe.statutEquipe)).length
  const selectionsActives = selections.filter((selection) => isActive(selection.statutSelection)).length
  const filterValues = (field: keyof EquipeNationale) =>
    Array.from(new Set(equipes.map((item) => String(item[field] || "")).filter(Boolean))).sort()
  const filteredEquipes = equipes.filter((equipe) => {
    const text = `${equipe.nomEquipeNationale} ${equipe.discipline} ${equipe.categorie} ${equipe.genre} ${equipe.saison}`.toLowerCase()
    if (search && !text.includes(search.trim().toLowerCase())) return false
    return Object.entries(filters).every(([key, selected]) => selected === "all" || String(equipe[key as keyof EquipeNationale]) === selected)
  })

  const selectedSelections = useMemo(() => {
    if (!selectedEquipe) return []
    return selections.filter((selection) => selection.idEquipeNationale === selectedEquipe.idEquipeNationale)
  }, [selectedEquipe, selections])
  const selectedStaff = selectedEquipe ? staff.filter((item) => item.idEquipeNationale === selectedEquipe.idEquipeNationale) : []
  const selectedCompetitions = selectedEquipe ? competitions.filter((item) => item.idEquipeNationale === selectedEquipe.idEquipeNationale) : []
  const selectedResultats = selectedEquipe ? resultats.filter((item) => item.idEquipeNationale === selectedEquipe.idEquipeNationale) : []

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

        <Tabs defaultValue="selections" className="gap-4">
          <TabsList className="grid h-auto w-full grid-cols-4">
            <TabsTrigger value="selections">Athlètes</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="competitions">Compétitions</TabsTrigger>
            <TabsTrigger value="resultats">Résultats</TabsTrigger>
          </TabsList>
          <TabsContent value="selections">
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
                    <TableHead>Maillot</TableHead>
                    <TableHead>Capitaine</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSelections.length === 0 ? (
                    <EmptyRow colSpan={7} label="Aucun membre selectionne pour cette equipe." />
                  ) : (
                    selectedSelections.map((selection, index) => (
                      <TableRow key={`${selection.idSelection || "selection"}-${index}`}>
                        <TableCell className="font-medium">{selection.nomAthlete || "-"}</TableCell>
                        <TableCell>{selection.nomPoste || "-"}</TableCell>
                        <TableCell>{selection.nomClub || "-"}</TableCell>
                        <TableCell>{selection.numeroMaillot || "-"}</TableCell>
                        <TableCell>{selection.capitaine || "-"}</TableCell>
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
          </TabsContent>
          <TabsContent value="staff">
            <Card><CardHeader><CardTitle>Staff</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto"><Table><TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Fonction</TableHead><TableHead>Période</TableHead><TableHead>Statut</TableHead>
              </TableRow></TableHeader><TableBody>
                {selectedStaff.length === 0 ? <EmptyRow colSpan={5} label="Aucun membre du staff." /> : selectedStaff.map((item) => (
                  <TableRow key={item.idStaffSelection}><TableCell className="font-medium">{item.nomActeur || "-"}</TableCell><TableCell>{item.typeActeur || "-"}</TableCell><TableCell>{item.fonction || "-"}</TableCell><TableCell>{formatSheetDate(item.dateDebut)} - {formatSheetDate(item.dateFin)}</TableCell><TableCell><Badge variant="outline">{item.statutStaff || "-"}</Badge></TableCell></TableRow>
                ))}
              </TableBody></Table></div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="competitions">
            <Card><CardHeader><CardTitle>Compétitions</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto"><Table><TableHeader><TableRow>
                <TableHead>Compétition</TableHead><TableHead>Niveau</TableHead><TableHead>Saison</TableHead><TableHead>Période</TableHead><TableHead>Lieu</TableHead><TableHead>Statut</TableHead>
              </TableRow></TableHeader><TableBody>
                {selectedCompetitions.length === 0 ? <EmptyRow colSpan={6} label="Aucune compétition." /> : selectedCompetitions.map((item) => (
                  <TableRow key={item.idParticipationEquipeNationale}><TableCell className="font-medium">{item.nomCompetition || "-"}</TableCell><TableCell>{item.niveauCompetition || "-"}</TableCell><TableCell>{item.saison || "-"}</TableCell><TableCell>{formatSheetDate(item.dateDebut)} - {formatSheetDate(item.dateFin)}</TableCell><TableCell>{item.lieu || "-"}</TableCell><TableCell><Badge variant="outline">{item.statutParticipation || "-"}</Badge></TableCell></TableRow>
                ))}
              </TableBody></Table></div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="resultats">
            <Card><CardHeader><CardTitle>Résultats</CardTitle></CardHeader><CardContent className="space-y-3">
              {selectedResultats.length === 0 ? <p className="rounded-md border p-8 text-center text-sm text-muted-foreground">Aucun résultat.</p> : selectedResultats.map((item) => (
                <div key={item.idResultatEquipeNationale} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div><p className="font-medium">{item.nomCompetition || "-"}</p><p className="text-sm text-muted-foreground">{formatSheetDate(item.dateMatch)} · {item.phase || "-"}</p></div>
                  <p className="font-mono text-lg font-semibold">RDC {item.scoreGlobal || "—"} {item.adversaire || "-"}</p>
                  <Badge variant="outline">{item.resultatMatch || item.statutMatch || "-"}</Badge>
                </div>
              ))}
            </CardContent></Card>
          </TabsContent>
        </Tabs>
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
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une équipe..." className="pl-9" />
            </div>
            {([
              ["discipline", "Discipline"], ["categorie", "Catégorie"], ["genre", "Genre"],
              ["saison", "Saison"], ["statutEquipe", "Statut"],
            ] as const).map(([field, label]) => (
              <Select key={field} value={filters[field]} onValueChange={(value) => setFilters((current) => ({ ...current, [field]: value }))}>
                <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {filterValues(field).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
          </div>
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
                {filteredEquipes.length === 0 ? (
                  <EmptyRow colSpan={8} label="Aucune equipe nationale disponible." />
                ) : (
                  filteredEquipes.map((equipe, index) => (
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
