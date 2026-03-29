"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { coachs, type Coach } from "@/lib/data/demo-data"

interface CoachsTableProps {
  onViewCoach: (coach: Coach) => void
}

export function CoachsTable({ onViewCoach }: CoachsTableProps) {
  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getCertificationBadge = (niveau: string) => {
    switch (niveau) {
      case "National":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">National</Badge>
      case "Provincial":
        return <Badge className="bg-accent/10 text-accent-foreground hover:bg-accent/10">Provincial</Badge>
      case "Local":
        return <Badge variant="outline">Local</Badge>
      default:
        return <Badge variant="outline">{niveau}</Badge>
    }
  }

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Coachs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coach</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Spécialité</TableHead>
              <TableHead>Certification</TableHead>
              <TableHead>Expérience</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coachs.map((coach) => (
              <TableRow key={coach.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={coach.genre === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}>
                        {getInitials(coach.nom, coach.prenom)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{coach.prenom} {coach.nom}</p>
                      <p className="text-sm text-muted-foreground">{coach.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{coach.club}</TableCell>
                <TableCell>{coach.specialite}</TableCell>
                <TableCell>{getCertificationBadge(coach.niveauCertification)}</TableCell>
                <TableCell>{coach.experience} ans</TableCell>
                <TableCell>{getStatutBadge(coach.statut)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewCoach(coach)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
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
