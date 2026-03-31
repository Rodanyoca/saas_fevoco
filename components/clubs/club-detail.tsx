"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Athlete, type Club, athletes } from "@/lib/data/demo-data"
import { AthleteDetail } from "@/components/athletes/athlete-detail"
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Building2,
  Pencil,
  UserPlus,
  Eye
} from "lucide-react"

interface ClubDetailProps {
  club: Club
  onBack: () => void
}

export function ClubDetail({ club, onBack }: ClubDetailProps) {
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)

  // Filtrer les athlètes de ce club
  const clubAthletes = athletes.filter(a => a.club === club.nom)

  const handleViewAthlete = (athlete: Athlete) => {
    setSelectedAthlete(athlete)
  }

  const handleBackToClub = () => {
    setSelectedAthlete(null)
  }

  const getGenreBadgeColor = (genre: string) => {
    switch (genre) {
      case "Masculin":
        return "bg-blue-100 text-blue-800"
      case "Féminin":
        return "bg-pink-100 text-pink-800"
      case "Mixte":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (selectedAthlete) {
    return <AthleteDetail athlete={selectedAthlete} onBack={handleBackToClub} />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{club.nom}</h1>
            <p className="text-muted-foreground">Détails du club</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Ajouter Athlète
          </Button>
        </div>
      </div>

      {/* Infos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte principale */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Informations du Club
              </CardTitle>
              <Badge
                variant={club.statut === "actif" ? "default" : "secondary"}
                className={
                  club.statut === "actif"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {club.statut === "actif" ? "Actif" : "Inactif"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Entente</p>
                    <p className="font-medium">{club.entente}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ligue / Province</p>
                    <p className="font-medium">{club.ligue}</p>
                    <p className="text-sm text-muted-foreground">{club.province}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date de création</p>
                    <p className="font-medium">{new Date(club.dateCreation).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Responsable</p>
                    <p className="font-medium">{club.responsable}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{club.telephone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{club.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium">{club.adresse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Athlètes</p>
                  <p className="text-2xl font-bold">{club.athletes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getGenreBadgeColor(club.genre)}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Catégorie</p>
                  <p className="text-2xl font-bold">{club.genre}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/30">
                  <Calendar className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ancienneté</p>
                  <p className="text-2xl font-bold">
                    {new Date().getFullYear() - new Date(club.dateCreation).getFullYear()} ans
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Liste des athlètes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Athlètes du Club
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {clubAthletes.length} athlètes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {clubAthletes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Date de Naissance</TableHead>
                    <TableHead className="text-center">Sélection Nationale</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubAthletes.map((athlete) => (
                    <TableRow key={athlete.id}>
                      <TableCell className="font-medium">{athlete.nom}</TableCell>
                      <TableCell>{athlete.prenom}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={athlete.genre === "M" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}>
                          {athlete.genre === "M" ? "Masculin" : "Féminin"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(athlete.dateNaissance).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-center">
                        {athlete.selectionNationale ? (
                          <Badge className="bg-accent text-accent-foreground">Oui</Badge>
                        ) : (
                          <Badge variant="outline">Non</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewAthlete(athlete)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir détails</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun athlète enregistré pour ce club
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
