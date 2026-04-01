import { Card, CardContent } from "@/components/ui/card"
import { Building2, Users, CheckCircle2, XCircle } from "lucide-react"
import type { Ligue } from "@/lib/types"

export function LiguesStats({ ligues }: { ligues: Ligue[] }) {
  const totalAthletes = ligues.reduce((sum, l) => sum + (l.athletes ?? 0), 0)

  const liguesActives = ligues.filter((l) => {
    const v = String(l.statut ?? "").trim().toLowerCase()
    return v === "active" || v === "actif"
  }).length

  const liguesInactives = ligues.filter((l) => {
    const v = String(l.statut ?? "").trim().toLowerCase()
    return v === "inactive" || v === "inactif"
  }).length

  const stats = [
    {
      label: "Total Ligues",
      value: ligues.length,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Ligues actives",
      value: liguesActives,
      icon: CheckCircle2,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Ligues inactives",
      value: liguesInactives,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      label: "Total Athlètes",
      value: totalAthletes,
      icon: Users,
      color: "text-accent-foreground",
      bg: "bg-accent/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
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
