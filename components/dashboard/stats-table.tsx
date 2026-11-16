import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Province } from "@/lib/types"

export function StatsTable({ provinces }: { provinces: Province[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Repartition par province</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Province</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ligues</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Clubs</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Athletes</th>
              </tr>
            </thead>
            <tbody>
              {provinces.map((province, index) => (
                <tr key={`${province.id || "province"}-${province.nom || "sans-nom"}-${index}`} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{province.nom}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{province.ligues}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{province.clubs}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{province.athletes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
