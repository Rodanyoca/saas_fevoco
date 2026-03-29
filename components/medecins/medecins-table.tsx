"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Eye, Pencil, Trash2, Phone } from "lucide-react"
import { medecins, type Medecin } from "@/lib/data/demo-data"

interface MedecinsTableProps {
  onViewMedecin: (medecin: Medecin) => void
}

export function MedecinsTable({ onViewMedecin }: MedecinsTableProps) {
  const getStatutBadge = (statut: Medecin["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "inactif":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getSpecialiteBadge = (specialite: Medecin["specialite"]) => {
    switch (specialite) {
      case "Médecine du sport":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Sport</Badge>
      case "Traumatologie":
        return <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/10">Trauma</Badge>
      case "Kinésithérapie":
        return <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20">Kiné</Badge>
      case "Médecine générale":
        return <Badge className="bg-muted text-muted-foreground hover:bg-muted">Général</Badge>
      default:
        return <Badge variant="outline">{specialite}</Badge>
    }
  }

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Liste des Médecins ({medecins.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground">Médecin</TableHead>
              <TableHead className="text-muted-foreground">Spécialité</TableHead>
              <TableHead className="text-muted-foreground">Ligue</TableHead>
              <TableHead className="text-muted-foreground">Hôpital</TableHead>
              <TableHead className="text-muted-foreground">N° Ordre</TableHead>
              <TableHead className="text-muted-foreground text-center">Athlètes Suivis</TableHead>
              <TableHead className="text-muted-foreground">Statut</TableHead>
              <TableHead className="text-muted-foreground w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medecins.map((medecin) => (
              <TableRow 
                key={medecin.id} 
                className="border-border hover:bg-muted/50 cursor-pointer"
                onClick={() => onViewMedecin(medecin)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {getInitials(medecin.nom, medecin.prenom)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        Dr. {medecin.prenom} {medecin.nom}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {medecin.telephone}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getSpecialiteBadge(medecin.specialite)}</TableCell>
                <TableCell className="text-foreground">{medecin.ligue}</TableCell>
                <TableCell className="text-foreground text-sm">{medecin.hopital}</TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono">{medecin.numeroOrdre}</TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold text-foreground">{medecin.athletesSuivis}</span>
                </TableCell>
                <TableCell>{getStatutBadge(medecin.statut)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewMedecin(medecin); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
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
