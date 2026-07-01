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
import { getEquipeNationale } from "@/lib/data"
import { Target, Users } from "lucide-react"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export default async function EquipeNationalePage() {
  const selections = await getEquipeNationale()
  const membresActifs = selections.filter((selection) => {
    const statut = selection.statutSelection.toLowerCase()
    return statut.includes("actif") || statut.includes("selection") || statut.includes("retenu")
  }).length
  const entites = Array.from(new Set(selections.map((selection) => selection.entiteNationale).filter(Boolean)))

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Equipe nationale" subtitle="Membres selectionnes et rattachements actuels" />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total membres</p>
                <p className="text-2xl font-bold">{selections.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-green-500/10 p-3 text-green-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{membresActifs}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-blue-500/10 p-3 text-blue-700">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entites</p>
                <p className="text-2xl font-bold">{entites.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Entite</TableHead>
                    <TableHead>Saison</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                        Aucune selection disponible.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selections.map((selection, index) => (
                      <TableRow key={`${selection.idSelection || "selection"}-${selection.idAthlete || "sans-athlete"}-${index}`}>
                        <TableCell>
                          <p className="font-medium">{selection.nomAthlete || "-"}</p>
                          <p className="font-mono text-xs text-muted-foreground">{selection.idAthlete}</p>
                        </TableCell>
                        <TableCell>{selection.discipline || "-"}</TableCell>
                        <TableCell>{selection.poste || "-"}</TableCell>
                        <TableCell>
                          <p>{selection.nomClub || "-"}</p>
                          <p className="font-mono text-xs text-muted-foreground">{selection.idClub || "-"}</p>
                        </TableCell>
                        <TableCell>{selection.entiteNationale || "-"}</TableCell>
                        <TableCell>{selection.saison || "-"}</TableCell>
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
    </DashboardLayout>
  )
}
