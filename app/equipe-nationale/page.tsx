import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEquipeNationale, getEquipeNationaleSelections } from "@/lib/data"
import { formatSheetDate } from "@/lib/date-utils"
import { Medal, Target, Trophy, Users } from "lucide-react"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

export default async function EquipeNationalePage() {
  const [equipes, selections] = await Promise.all([
    getEquipeNationale(),
    getEquipeNationaleSelections(),
  ])

  const equipesActives = equipes.filter((equipe) => isActive(equipe.statutEquipe)).length
  const selectionsActives = selections.filter((selection) => isActive(selection.statutSelection)).length

  const cards = [
    { label: "Equipes", value: equipes.length, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Equipes actives", value: equipesActives, icon: Trophy, color: "bg-green-500/10 text-green-700" },
    { label: "Selections", value: selections.length, icon: Users, color: "bg-blue-500/10 text-blue-700" },
    { label: "Selections actives", value: selectionsActives, icon: Medal, color: "bg-amber-500/10 text-amber-700" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Leopards RDC" subtitle="Equipes nationales et historique des selections" />

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

        <Tabs defaultValue="equipes" className="w-full">
          <TabsList className="grid h-10 w-full grid-cols-2">
            <TabsTrigger value="equipes">Equipes nationales</TabsTrigger>
            <TabsTrigger value="selections">Selections</TabsTrigger>
          </TabsList>

          <TabsContent value="equipes" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Equipes nationales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Equipe</TableHead>
                        <TableHead>Discipline</TableHead>
                        <TableHead>Categorie</TableHead>
                        <TableHead>Genre</TableHead>
                        <TableHead>Saison</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                            Aucune equipe nationale disponible.
                          </TableCell>
                        </TableRow>
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
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="selections" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Selections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[1120px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Athlete</TableHead>
                        <TableHead>Equipe</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Club</TableHead>
                        <TableHead>Periode</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Observation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selections.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                            Aucune selection disponible.
                          </TableCell>
                        </TableRow>
                      ) : (
                        selections.map((selection, index) => (
                          <TableRow key={`${selection.idSelection || "selection"}-${index}`}>
                            <TableCell>
                              <p className="font-medium">{selection.nomAthlete || "-"}</p>
                              <p className="font-mono text-xs text-muted-foreground">{selection.idAthlete || "-"}</p>
                            </TableCell>
                            <TableCell>{selection.nomEquipeNationale || "-"}</TableCell>
                            <TableCell>{selection.poste || "-"}</TableCell>
                            <TableCell>
                              <p>{selection.nomClub || "-"}</p>
                              <p className="font-mono text-xs text-muted-foreground">{selection.idClub || "-"}</p>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatSheetDate(selection.dateDebutSelection)} - {formatSheetDate(selection.dateFinSelection)}
                            </TableCell>
                            <TableCell>{selection.typeSelection || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{selection.statutSelection || "-"}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[260px] text-muted-foreground">
                              {selection.observation || "-"}
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
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
