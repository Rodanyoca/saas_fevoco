"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Stethoscope,
  Users,
  FileText,
  Award,
  Pencil,
  Activity,
} from "lucide-react"
import type { Medecin } from "@/lib/types"

interface MedecinDetailProps {
  medecin: Medecin
  onBack: () => void
}

export function MedecinDetail({ medecin, onBack }: MedecinDetailProps) {
  const formatMedecinId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(8, "0")
  }

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.charAt(0) ?? ""
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? ""
    return `${first}${second}`.toUpperCase()
  }

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

  const getSpecialiteBadge = (specialite: string) => {
    return <Badge variant="outline">{specialite}</Badge>
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

  const calculateYearsAffiliated = (dateAffiliation: string) => {
    if (!dateAffiliation) return 0
    const today = new Date()
    const affiliationDate = new Date(dateAffiliation)
    return today.getFullYear() - affiliationDate.getFullYear()
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
              Dr. {medecin.nomComplet}
            </h1>
            <p className="text-muted-foreground">Fiche médecin</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{formatMedecinId(medecin.id)}</p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getInitials(medecin.nomComplet)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Dr. {medecin.nomComplet}
                </h2>
                {getStatutBadge(medecin.statut)}
                {getSpecialiteBadge(medecin.specialite)}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{medecin.telephone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{medecin.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{medecin.provinceNom}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{medecin.clubNom ? 1 : 0}</p>
            <p className="text-sm text-muted-foreground">Clubs</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-foreground">{calculateYearsAffiliated(medecin.dateAffiliation)}</p>
            <p className="text-sm text-muted-foreground">Années FEVOCO</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-foreground">{medecin.niveau || "—"}</p>
            <p className="text-sm text-muted-foreground">Niveau</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <p className="text-2xl font-bold text-foreground">{medecin.numeroOrdre || "—"}</p>
            <p className="text-sm text-muted-foreground">N° ordre</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="informations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="clubs">Clubs</TabsTrigger>
          <TabsTrigger value="activites">Activités</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Informations Professionnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spécialité</span>
                  <span className="font-medium text-foreground">{medecin.specialite}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N° Ordre des Médecins</span>
                  <span className="font-medium text-foreground font-mono">{medecin.numeroOrdre}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date d&apos;affiliation</span>
                  <span className="font-medium text-foreground">
                    {medecin.dateAffiliation ? new Date(medecin.dateAffiliation).toLocaleDateString("fr-FR") : "—"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ligue assignée</span>
                  <span className="font-medium text-foreground">{medecin.ligueNom}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Affiliation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entente</span>
                  <span className="font-medium text-foreground">{medecin.ententeNom}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Club</span>
                  <span className="font-medium text-foreground">{medecin.clubNom}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Équipe</span>
                  <span className="font-medium text-foreground">{medecin.equipeNom}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-muted-foreground text-sm">Genre</span>
                    <p className="font-medium text-foreground">
                      {medecin.genre === "M" ? "Masculin" : "Féminin"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Âge</span>
                    <p className="font-medium text-foreground">{calculateAge(medecin.dateNaissance)} ans</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Date de naissance</span>
                    <p className="font-medium text-foreground">
                      {new Date(medecin.dateNaissance).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clubs" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Clubs suivis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activites" className="mt-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Historique des activités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
