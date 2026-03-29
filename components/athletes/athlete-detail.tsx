"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  User,
  Ruler,
  Weight,
  Building2,
  FileText,
  Activity,
} from "lucide-react"
import type { Athlete } from "@/lib/data/demo-data"

interface AthleteDetailProps {
  athlete: Athlete
  onBack: () => void
}

export function AthleteDetail({ athlete, onBack }: AthleteDetailProps) {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {athlete.prenom} {athlete.nom}
            </h1>
            <p className="text-muted-foreground">{athlete.poste} - {athlete.club}</p>
          </div>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Profile Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {athlete.prenom[0]}{athlete.nom[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{athlete.prenom} {athlete.nom}</h2>
              <p className="text-muted-foreground">{athlete.poste}</p>
              <div className="flex items-center gap-2 mt-3">
                {getStatusBadge(athlete.statut)}
                {athlete.selectionNationale && (
                  <Badge className="bg-accent text-accent-foreground">
                    <Award className="h-3 w-3 mr-1" />
                    Sélection Nationale
                  </Badge>
                )}
              </div>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{athlete.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{athlete.telephone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{athlete.adresse}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
              <TabsTrigger value="historique">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="infos" className="mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Informations Personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Genre</span>
                      <span className="font-medium">{athlete.genre === "M" ? "Masculin" : "Féminin"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date de naissance</span>
                      <span className="font-medium">{formatDate(athlete.dateNaissance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age</span>
                      <span className="font-medium">{calculateAge(athlete.dateNaissance)} ans</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Ruler className="h-4 w-4" />
                      Caractéristiques Physiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taille</span>
                      <span className="font-medium">{athlete.taille} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Poids</span>
                      <span className="font-medium">{athlete.poids} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IMC</span>
                      <span className="font-medium">
                        {(athlete.poids / Math.pow(athlete.taille / 100, 2)).toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Affiliation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Club</span>
                      <span className="font-medium">{athlete.club}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ligue</span>
                      <span className="font-medium">{athlete.ligue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">{athlete.version}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Inscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date inscription</span>
                      <span className="font-medium">{formatDate(athlete.dateInscription)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Statut</span>
                      {getStatusBadge(athlete.statut)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sélection nationale</span>
                      <span className="font-medium">{athlete.selectionNationale ? "Oui" : "Non"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Statistiques de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">24</p>
                      <p className="text-sm text-muted-foreground">Matchs joués</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">156</p>
                      <p className="text-sm text-muted-foreground">Points marqués</p>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-3xl font-bold text-primary">87%</p>
                      <p className="text-sm text-muted-foreground">Efficacité</p>
                    </div>
                  </div>
                  <p className="text-center text-muted-foreground mt-4 text-sm">
                    Les statistiques détaillées seront disponibles avec la connexion à la base de données.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historique" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Historique des Activités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 pb-4 border-b">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="font-medium">Inscription au club {athlete.club}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(athlete.dateInscription)}</p>
                      </div>
                    </div>
                    {athlete.selectionNationale && (
                      <div className="flex items-start gap-4 pb-4 border-b">
                        <div className="h-2 w-2 rounded-full bg-accent mt-2" />
                        <div>
                          <p className="font-medium">Sélection en équipe nationale</p>
                          <p className="text-sm text-muted-foreground">Janvier 2024</p>
                        </div>
                      </div>
                    )}
                    <p className="text-center text-muted-foreground text-sm">
                      L&apos;historique complet sera disponible avec la connexion à la base de données.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
