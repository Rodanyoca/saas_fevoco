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
import { getEquipeNationale, getEquipeNationaleSuivi } from "@/lib/data"
import { CalendarCheck, Medal, Target, Trophy } from "lucide-react"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isWin(value: string) {
  const normalized = normalize(value)
  return normalized.startsWith("v") || normalized.includes("gagne")
}

function isLoss(value: string) {
  const normalized = normalize(value)
  return normalized.startsWith("d") || normalized.includes("perdu")
}

export default async function SuiviEquipeNationalePage() {
  const [selections, suivis] = await Promise.all([getEquipeNationale(), getEquipeNationaleSuivi()])
  const competitions = new Set(suivis.map((suivi) => suivi.idCompetition).filter(Boolean))
  const victoires = suivis.filter((suivi) => isWin(suivi.resultatMatch)).length
  const defaites = suivis.filter((suivi) => isLoss(suivi.resultatMatch)).length
  const points = suivis.reduce((total, suivi) => total + (suivi.pointsSuivi ?? 0), 0)

  const cards = [
    { label: "Membres", value: selections.length, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Competitions", value: competitions.size, icon: Trophy, color: "bg-blue-500/10 text-blue-700" },
    { label: "Matchs suivis", value: suivis.length, icon: CalendarCheck, color: "bg-amber-500/10 text-amber-700" },
    { label: "Points suivi", value: points, icon: Medal, color: "bg-green-500/10 text-green-700" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Performance equipe nationale" subtitle="Synthese par competition et par match suivi" />

        <div className="grid gap-4 md:grid-cols-4">
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

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Victoires</p>
              <p className="text-3xl font-bold text-green-700">{victoires}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Defaites</p>
              <p className="text-3xl font-bold text-red-700">{defaites}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Matchs suivis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Competition</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Adversaire</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Resultat</TableHead>
                    <TableHead className="text-center">Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suivis.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                        Aucun suivi disponible.
                      </TableCell>
                    </TableRow>
                  ) : (
                    suivis.map((suivi, index) => (
                      <TableRow key={`${suivi.idSuivi || "suivi"}-${suivi.idSelection || "sans-selection"}-${index}`}>
                        <TableCell>
                          <p className="font-medium">{suivi.nomAthlete || "-"}</p>
                          <p className="font-mono text-xs text-muted-foreground">{suivi.idAthlete || "-"}</p>
                        </TableCell>
                        <TableCell>{suivi.nomCompetition || "-"}</TableCell>
                        <TableCell>{suivi.dateMatch || "-"}</TableCell>
                        <TableCell>{suivi.adversaire || "-"}</TableCell>
                        <TableCell className="font-mono">{suivi.scoreGlobal || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{suivi.resultatMatch || "-"}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{suivi.pointsSuivi ?? 0}</TableCell>
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
