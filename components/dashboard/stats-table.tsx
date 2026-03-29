import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { provinces } from "@/lib/data/demo-data"

export function StatsTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Répartition par Province</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Province</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Ligues</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Clubs</th>
                <th className="text-center py-3 px-4 font-medium text-muted-foreground">Athlètes</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Complétude</th>
              </tr>
            </thead>
            <tbody>
              {provinces.map((province) => (
                <tr key={province.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{province.nom}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{province.ligues}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{province.clubs}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground">{province.athletes}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Progress value={province.completude} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10">{province.completude}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
