"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, CheckCircle, AlertCircle } from "lucide-react"
import { dataQualityIssues, dataQualityStats, type DataQualityIssue } from "@/lib/data/demo-data"

interface QualiteTableProps {
  onViewIssue: (issue: DataQualityIssue) => void
}

export function QualiteTable({ onViewIssue }: QualiteTableProps) {
  const getPrioriteBadge = (priorite: string) => {
    switch (priorite) {
      case "haute":
        return <Badge variant="destructive">Haute</Badge>
      case "moyenne":
        return <Badge className="bg-accent text-accent-foreground">Moyenne</Badge>
      case "basse":
        return <Badge variant="secondary">Basse</Badge>
      default:
        return <Badge variant="outline">{priorite}</Badge>
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "resolu":
        return <Badge className="bg-green-100 text-green-800">Résolu</Badge>
      case "en_cours":
        return <Badge className="bg-accent text-accent-foreground">En cours</Badge>
      case "non_resolu":
        return <Badge variant="destructive">Non résolu</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getEntiteBadge = (entite: string) => {
    const colors: Record<string, string> = {
      athlete: "bg-primary/10 text-primary",
      club: "bg-secondary/10 text-secondary",
      coach: "bg-accent/10 text-accent-foreground",
      arbitre: "bg-green-100 text-green-800",
      medecin: "bg-purple-100 text-purple-800",
    }
    return (
      <Badge className={colors[entite] || "bg-muted text-muted-foreground"}>
        {entite.charAt(0).toUpperCase() + entite.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tableau de complétude par entité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Complétude par Type d&apos;Entité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dataQualityStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 font-medium text-sm">{stat.entite}</div>
                <div className="flex-1">
                  <Progress value={stat.tauxCompletude} className="h-2" />
                </div>
                <div className="w-16 text-right text-sm font-medium">
                  {stat.tauxCompletude}%
                </div>
                <div className="w-24 text-right text-xs text-muted-foreground">
                  {stat.complets}/{stat.total}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tableau des problèmes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Problèmes de Qualité Détectés</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entité</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Champ Manquant</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataQualityIssues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>{getEntiteBadge(issue.entite)}</TableCell>
                  <TableCell className="font-medium">{issue.entiteNom}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-secondary" />
                      {issue.champManquant}
                    </div>
                  </TableCell>
                  <TableCell>{issue.province}</TableCell>
                  <TableCell>{getPrioriteBadge(issue.priorite)}</TableCell>
                  <TableCell>{getStatutBadge(issue.statut)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(issue.dateDetection).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewIssue(issue)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Marquer résolu
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
