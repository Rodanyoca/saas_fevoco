"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MapPin } from "lucide-react"
import { provinces, type Province } from "@/lib/data/demo-data"

interface ProvincesTableProps {
  onViewProvince: (province: Province) => void
}

export function ProvincesTable({ onViewProvince }: ProvincesTableProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Liste des Provinces ({provinces.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Province</TableHead>
                <TableHead className="font-semibold text-center">Ligues</TableHead>
                <TableHead className="font-semibold text-center">Ententes</TableHead>
                <TableHead className="font-semibold text-center">Clubs</TableHead>
                <TableHead className="font-semibold text-center">Athlètes</TableHead>
                <TableHead className="font-semibold">Complétude</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provinces.map((province) => (
                <TableRow key={province.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{province.nom}</p>
                      <p className="text-xs text-muted-foreground">{province.responsable}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">{province.ligues}</TableCell>
                  <TableCell className="text-center font-medium">{province.ententes}</TableCell>
                  <TableCell className="text-center font-medium">{province.clubs}</TableCell>
                  <TableCell className="text-center font-medium">{province.athletes}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={province.completude} className="h-2 w-20" />
                      <span className="text-sm font-medium">{province.completude}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={province.statut === "active" ? "default" : "secondary"}
                      className={
                        province.statut === "active"
                          ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {province.statut === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewProvince(province)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
