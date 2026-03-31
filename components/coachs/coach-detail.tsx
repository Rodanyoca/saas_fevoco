"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Award,
  Pencil,
  Briefcase,
  Clock,
  Users,
} from "lucide-react"
import { type Coach, clubs, athletes } from "@/lib/data/demo-data"

interface CoachDetailProps {
  coach: Coach
  onBack: () => void
}

export function CoachDetail({ coach, onBack }: CoachDetailProps) {
  const formatCoachId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(9, "0")
  }

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`
  }

  const getAge = (dateNaissance: string) => {
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

  // Trouver les athlètes du club du coach
  const clubAthletes = athletes.filter(a => a.club === coach.club)
  const clubInfo = clubs.find(c => c.nom === coach.club)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profil du Coach</h1>
            <p className="text-muted-foreground">Détails et informations</p>
          </div>
        </div>
        <Button>
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Profil Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar et infos principales */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarFallback className={`text-2xl ${coach.genre === "F" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}>
                  {getInitials(coach.nom, coach.prenom)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold">{coach.prenom} {coach.nom}</h2>
                <p className="text-muted-foreground">{coach.specialite}</p>
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-muted-foreground font-mono">{formatCoachId(coach.id)}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  {getStatutBadge(coach.statut)}
                  {getCertificationBadge(coach.niveauCertification)}
                </div>
              </div>
            </div>

            {/* Infos de contact */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{coach.telephone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{coach.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Adresse</p>
                  <p className="font-medium">{coach.adresse}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Âge</p>
                  <p className="font-medium">{getAge(coach.dateNaissance)} ans</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">{formatDate(coach.dateNaissance)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="informations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="club">Club</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations professionnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Carrière
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Spécialité:</span>
                      <span className="font-medium">{coach.specialite}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Certification:</span>
                      <span className="font-medium">{coach.niveauCertification}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Expérience:</span>
                      <span className="font-medium">{coach.experience} ans</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Date embauche:</span>
                      <span className="font-medium">{formatDate(coach.dateEmbauche)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Affiliation
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Club:</span>
                      <span className="font-medium">{coach.club}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Ligue:</span>
                      <span className="font-medium">{coach.ligue}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Athlètes encadrés:</span>
                      <span className="font-medium">{clubAthletes.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="club" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Club - {coach.club}</CardTitle>
            </CardHeader>
            <CardContent>
              {clubInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Genre</p>
                      <p className="text-xl font-bold">{clubInfo.genre}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Athlètes</p>
                      <p className="text-xl font-bold">{clubInfo.athletes}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Province</p>
                      <p className="text-xl font-bold">{clubInfo.province}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <p className="text-xl font-bold capitalize">{clubInfo.statut}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Information du club non disponible</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground text-sm py-10">
                Coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
