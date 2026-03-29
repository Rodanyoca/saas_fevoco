import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

const alerts = [
  { id: 1, type: "warning", message: "3 clubs sans athlètes enregistrés" },
  { id: 2, type: "warning", message: "12 athlètes avec données incomplètes" },
  { id: 3, type: "success", message: "Ligue de Kinshasa 100% complète" },
  { id: 4, type: "warning", message: "2 ententes en attente de validation" },
]

export function AlertsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Alertes Qualité</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
          >
            {alert.type === "warning" ? (
              <AlertTriangle className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-foreground">{alert.message}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
