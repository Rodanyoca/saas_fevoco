import { Card, CardContent } from "@/components/ui/card"
import { Network, Shield, Users, CheckCircle } from "lucide-react"
import type { Entente } from "@/lib/types"

export function EntentesStats({ ententes }: { ententes: Entente[] }) {
  const totalEntentes = ententes.length
  const ententesActives = ententes.filter((e) => e.statut === "active").length
  const totalClubs = ententes.reduce((acc, e) => acc + (e.clubs ?? 0), 0)
  const totalAthletes = ententes.reduce((acc, e) => acc + (e.athletes ?? 0), 0)

  const stats = [
    {
      title: "Total Ententes",
      value: totalEntentes,
      icon: Network,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Ententes Actives",
      value: ententesActives,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Clubs Affiliés",
      value: totalClubs,
      icon: Shield,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Athlètes Inscrits",
      value: totalAthletes,
      icon: Users,
      color: "text-accent-foreground",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
