"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Flag,
  Target,
  TrendingUp,
} from "lucide-react"
import { type Arbitre } from "@/lib/data/demo-data"

interface ArbitreDetailProps {
  arbitre: Arbitre
  onBack: () => void
}

export function ArbitreDetail({ arbitre, onBack }: ArbitreDetailProps) {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getStatutBadge = (statut: Arbitre["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-600">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      case "suspendu":
        return <Badge className="bg-secondary/10 text-secondary">Suspendu</Badge>
    }
  }

  const getGradeBadge = (grade: Arbitre["grade"]) => {
    switch (grade) {
      case "International":
        return <Badge className="bg-accent/20 text-accent-foreground">{grade}</Badge>
      case "National":
        return <Badge className="bg-primary/10 text-primary">{grade}</Badge>
      case "Provincial":
        return <Badge variant="outline">{grade}</Badge>
      case "Local":
        return <Badge variant="secondary">{grade}</Badge>
    }
  }

  const yearsOfExperience = () => {
    const gradeDate = new Date(arbitre.dateObtentionGrade)
    const today = new Date()
    return today.getFullYear() - gradeDate.getFullYear()
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
              {arbitre.prenom} {arbitre.nom}
            </h1>
            <p className="text-muted-foreground">Fiche arbitre</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-28 w-28">
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  {arbitre.prenom[0]}{arbitre.nom[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                {getStatutBadge(arbitre.statut)}
                {getGradeBadge(arbitre.grade)}
              </div>
            </div>
            
            <Separator orientation="vertical" className="hidden md:block h-auto" />
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{arbitre.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telephone</p>
                  <p className="text-sm font-medium">{arbitre.telephone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Adresse</p>
                  <p className="text-sm font-medium">{arbitre.adresse}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date de naissance</p>
                  <p className="text-sm font-medium">
                    {formatDate(arbitre.dateNaissance)} ({calculateAge(arbitre.dateNaissance)} ans)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{arbitre.matchsArbitres}</p>
                <p className="text-xs text-muted-foreground">Matchs arbitres</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Award className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{arbitre.grade}</p>
                <p className="text-xs text-muted-foreground">Grade actuel</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{yearsOfExperience()} ans</p>
                <p className="text-xs text-muted-foreground">Experience au grade</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Flag className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold truncate text-sm">{arbitre.specialite}</p>
                <p className="text-xs text-muted-foreground">Specialite</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="informations" className="w-full">
        <TabsList className="w-full justify-start bg-muted/50">
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="statistiques">Statistiques</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="informations" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Informations professionnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Ligue</p>
                  <p className="font-medium">{arbitre.ligue}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Province</p>
                  <p className="font-medium">{arbitre.province}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialite</p>
                  <p className="font-medium">{arbitre.specialite}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date obtention du grade</p>
                  <p className="font-medium">{formatDate(arbitre.dateObtentionGrade)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Genre</p>
                  <p className="font-medium">{arbitre.genre === "M" ? "Masculin" : "Feminin"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Identifiant</p>
                  <p className="font-medium font-mono">{arbitre.id.toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistiques" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Statistiques de carriere</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-3xl font-bold text-primary">{arbitre.matchsArbitres}</p>
                  <p className="text-sm text-muted-foreground">Total matchs arbitres</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-3xl font-bold text-green-600">{Math.round(arbitre.matchsArbitres * 0.85)}</p>
                  <p className="text-sm text-muted-foreground">Matchs sans incident</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-3xl font-bold text-accent-foreground">{yearsOfExperience()}</p>
                  <p className="text-sm text-muted-foreground">Annees d&apos;experience</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium mb-4">Progression de grade</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span className="font-medium">{arbitre.grade}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDate(arbitre.dateObtentionGrade)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historique" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Historique des activites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Obtention du grade {arbitre.grade}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(arbitre.dateObtentionGrade)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-medium">Affectation a {arbitre.ligue}</p>
                    <p className="text-sm text-muted-foreground">Province de {arbitre.province}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                  <div>
                    <p className="font-medium">Specialisation en {arbitre.specialite}</p>
                    <p className="text-sm text-muted-foreground">Formation completee</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
