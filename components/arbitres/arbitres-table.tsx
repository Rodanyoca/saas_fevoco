"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { arbitres, type Arbitre } from "@/lib/data/demo-data"

interface ArbitresTableProps {
  onViewArbitre: (arbitre: Arbitre) => void
}

export function ArbitresTable({ onViewArbitre }: ArbitresTableProps) {
  const getStatutBadge = (statut: Arbitre["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      case "suspendu":
        return <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20">Suspendu</Badge>
    }
  }

  const getGradeBadge = (grade: Arbitre["grade"]) => {
    switch (grade) {
      case "International":
        return <Badge className="bg-accent/20 text-accent-foreground">International</Badge>
      case "National":
        return <Badge className="bg-primary/10 text-primary">National</Badge>
      case "Provincial":
        return <Badge variant="outline">Provincial</Badge>
      case "Local":
        return <Badge variant="secondary">Local</Badge>
    }
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Liste des Arbitres</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Arbitre</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Specialite</TableHead>
              <TableHead>Ligue</TableHead>
              <TableHead className="text-center">Matchs</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arbitres.map((arbitre) => (
              <TableRow 
                key={arbitre.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewArbitre(arbitre)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {arbitre.prenom[0]}{arbitre.nom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {arbitre.prenom} {arbitre.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {calculateAge(arbitre.dateNaissance)} ans - {arbitre.genre === "M" ? "Homme" : "Femme"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getGradeBadge(arbitre.grade)}</TableCell>
                <TableCell className="text-muted-foreground">{arbitre.specialite}</TableCell>
                <TableCell className="text-muted-foreground">{arbitre.ligue}</TableCell>
                <TableCell className="text-center font-medium">{arbitre.matchsArbitres}</TableCell>
                <TableCell>{getStatutBadge(arbitre.statut)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewArbitre(arbitre); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
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
  )
}
