"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Eye, Award, MapPin, Phone } from "lucide-react"
import { athletes, type Athlete } from "@/lib/data/demo-data"

interface AthletesGridProps {
  onViewAthlete: (athlete: Athlete) => void
}

export function AthletesGrid({ onViewAthlete }: AthletesGridProps) {
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      case "blesse":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Blessé</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {athletes.map((athlete) => (
        <Card key={athlete.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {athlete.prenom[0]}{athlete.nom[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {athlete.prenom} {athlete.nom}
                  </h3>
                  <p className="text-sm text-muted-foreground">{athlete.poste}</p>
                </div>
              </div>
              {athlete.selectionNationale && (
                <Award className="h-5 w-5 text-accent" />
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-2 mb-3">
              {getStatusBadge(athlete.statut)}
              <Badge variant="outline" className={athlete.genre === "M" ? "border-primary text-primary" : "border-pink-500 text-pink-500"}>
                {athlete.genre === "M" ? "Masculin" : "Féminin"}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{athlete.club}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{athlete.telephone}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{calculateAge(athlete.dateNaissance)} ans</span>
                <span>{athlete.taille} cm / {athlete.poids} kg</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onViewAthlete(athlete)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir le profil
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
