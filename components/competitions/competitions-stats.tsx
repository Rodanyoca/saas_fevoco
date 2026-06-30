import { BadgeCheck, ClipboardList, Trophy, UserRound } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { Competition, CompetitionResult, CompetitionUnite } from "@/lib/types"

function isActive(statut: string) {
  const value = statut.trim().toLowerCase()
  return value === "active" || value === "actif" || value === "en cours"
}

export function CompetitionsStats({
  competitions,
  unites,
  results,
}: {
  competitions: Competition[]
  unites: CompetitionUnite[]
  results: CompetitionResult[]
}) {
  const stats = [
    {
      label: "Competitions",
      value: competitions.length,
      icon: Trophy,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "En cours",
      value: competitions.filter((competition) => isActive(competition.statut)).length,
      icon: BadgeCheck,
      color: "text-green-700",
      bg: "bg-green-500/10",
    },
    {
      label: "Matchs",
      value: results.length,
      icon: ClipboardList,
      color: "text-blue-700",
      bg: "bg-blue-500/10",
    },
    {
      label: "Unites",
      value: unites.length,
      icon: UserRound,
      color: "text-amber-700",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
