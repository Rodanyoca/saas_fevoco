import { Card, CardContent } from "@/components/ui/card"
import { ligues, statsGlobales } from "@/lib/data/demo-data"
import { Building2, Users, Shield, CheckCircle, XCircle } from "lucide-react"

export function LiguesStats() {
  const liguesActives = ligues.filter((l) => l.statut === "active").length
  const liguesInactives = ligues.filter((l) => l.statut === "inactive").length
  const totalEntentes = ligues.reduce((sum, l) => sum + l.ententes, 0)
  const totalAthletes = ligues.reduce((sum, l) => sum + l.athletes, 0)

  const stats = [
    {
      label: "Total Ligues",
      value: statsGlobales.totalLigues,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Ligues Actives",
      value: liguesActives,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    {
      label: "Ligues Inactives",
      value: liguesInactives,
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-500/10",
    },
    {
      label: "Total Ententes",
      value: totalEntentes,
      icon: Shield,
      color: "text-secondary",
      bg: "bg-secondary/10",
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                {stat.label === "Total Ligues" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Actives: {liguesActives} • Inactives: {liguesInactives}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
