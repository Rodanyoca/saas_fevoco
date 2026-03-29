import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { recentActivities } from "@/lib/data/demo-data"
import { Users, Shield, Building2, Network } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap = {
  athlete: Users,
  club: Shield,
  ligue: Building2,
  entente: Network,
}

const colorMap = {
  athlete: "bg-primary/10 text-primary",
  club: "bg-secondary/10 text-secondary",
  ligue: "bg-accent/20 text-accent-foreground",
  entente: "bg-muted text-muted-foreground",
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Activité Récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.map((activity) => {
          const Icon = iconMap[activity.type]
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg flex-shrink-0", colorMap[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {new Date(activity.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
