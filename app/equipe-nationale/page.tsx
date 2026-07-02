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
import {
  getEquipeNationale,
  getEquipeNationaleCompetitions,
  getEquipeNationaleResultats,
  getEquipeNationaleSelections,
} from "@/lib/data"
import { formatSheetDate, parseSheetDate } from "@/lib/date-utils"
import { CalendarCheck, Medal, Target, Trophy, Users } from "lucide-react"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isWin(value: string) {
  const v = normalize(value)
  return v.startsWith("v") || v.includes("gagne")
}

function isActive(value: string) {
  const v = normalize(value)
  return v.includes("actif") || v.includes("active") || v.includes("retenu") || v.includes("selection")
}

function sortByDateDesc<T extends { dateMatch?: string; dateDebut?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const dateA = parseSheetDate(a.dateMatch || a.dateDebut || "")?.getTime() ?? 0
    const dateB = parseSheetDate(b.dateMatch || b.dateDebut || "")?.getTime() ?? 0
    return dateB - dateA
  })
}

export default async function EquipeNationalePage() {
  const [equipes, selections, competitions, resultats] = await Promise.all([
    getEquipeNationale(),
    getEquipeNationaleSelections(),
    getEquipeNationaleCompetitions(),
    getEquipeNationaleResultats(),
  ])

  const selectionsActives = selections.filter((selection) => isActive(selection.statutSelection)).length
  const victoires = resultats.filter((resultat) => isWin(resultat.resultatMatch)).length
  const equipesActives = equipes.filter((equipe) => isActive(equipe.statutEquipe)).length

  const cards = [
    { label: "Equipes", value: equipes.length, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Equipes actives", value: equipesActives, icon: Trophy, color: "bg-green-500/10 text-green-700" },
    { label: "Selections", value: selections.length, icon: Users, color: "bg-blue-500/10 text-blue-700" },
    { label: "Selections actives", value: selectionsActives, icon: Medal, color: "bg-amber-500/10 text-amber-700" },
    { label: "Competitions", value: competitions.length, icon: CalendarCheck, color: "bg-violet-500/10 text-violet-700" },
    { label: "Resultats", value: resultats.length, icon: Trophy, color: "bg-slate-500/10 text-slate-700" },
  ]

  const recentCompetitions = sortByDateDesc(competitions).slice(0, 8)
  const recentResultats = sortByDateDesc(resultats).slice(0, 10)

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Equipe nationale" subtitle="Suivi des Leopards RDC par equipe, selection, competition et resultat" />

        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
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
              <p className="text-sm text-muted-foreground">Autres resultats</p>
              <p className="text-3xl font-bold text-muted-foreground">{Math.max(resultats.length - victoires, 0)}</p>
            </CardContent>
          </Card>
        </div>

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
                        <TableCell className="font-mono text-muted-foreground">{equipe.idEquipeNationale || "-"}</TableCell>
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

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Selections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Equipe</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead>Type</TableHead>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Competitions recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCompetitions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                          Aucune competition EN disponible.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentCompetitions.map((competition, index) => (
                        <TableRow key={`${competition.idParticipationEn || "participation"}-${index}`}>
                          <TableCell>{competition.nomEquipeNationale || "-"}</TableCell>
                          <TableCell>
                            <p className="font-medium">{competition.nomCompetition || "-"}</p>
                            <p className="text-xs text-muted-foreground">{competition.niveauCompetition || "-"}</p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatSheetDate(competition.dateDebut)} - {formatSheetDate(competition.dateFin)}
                          </TableCell>
                          <TableCell>{competition.lieu || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{competition.statutParticipation || "-"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Derniers resultats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Adversaire</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Resultat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentResultats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                          Aucun resultat EN disponible.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentResultats.map((resultat, index) => (
                        <TableRow key={`${resultat.idResultatEn || "resultat"}-${index}`}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatSheetDate(resultat.dateMatch)}
                          </TableCell>
                          <TableCell>{resultat.nomEquipeNationale || "-"}</TableCell>
                          <TableCell>
                            <p className="font-medium">{resultat.adversaire || "-"}</p>
                            <p className="text-xs text-muted-foreground">{resultat.paysAdversaire || "-"}</p>
                          </TableCell>
                          <TableCell className="font-mono">{resultat.scoreGlobal || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{resultat.resultatMatch || "-"}</Badge>
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
      </div>
    </DashboardLayout>
  )
}
