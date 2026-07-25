import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Database } from "lucide-react"

export function ActorsConfigNotice() {
  return (
    <Alert>
      <Database className="h-4 w-4" />
      <AlertTitle>Référentiel non connecté</AlertTitle>
      <AlertDescription>
        Le référentiel des acteurs n’est pas encore connecté.
      </AlertDescription>
    </Alert>
  )
}
