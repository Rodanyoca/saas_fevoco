"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Pencil,
} from "lucide-react"
import type { Officiel } from "@/lib/types"

interface OfficielDetailProps {
  officiel: Officiel
  onBack: () => void
}

export function OfficielDetail({ officiel, onBack }: OfficielDetailProps) {
  const formatOfficielId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(8, "0")
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date()
    const birth = new Date(dateNaissance)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age -= 1
    }
    return age
  }

  const getStatutBadge = (statut: Officiel["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-600">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {officiel.nomComplet}
            </h1>
            <p className="text-muted-foreground">Fiche officiel</p>
            <p className="text-xs text-muted-foreground font-mono mt-1">{formatOfficielId(officiel.id)}</p>
          </div>
        </div>

        <Button className="bg-primary hover:bg-primary/90">
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                {getStatutBadge(officiel.statut)}
                <Badge variant="outline">{officiel.fonction}</Badge>
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
                  <p className="text-sm font-medium">{officiel.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="text-sm font-medium">{officiel.telephone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Province</p>
                  <p className="text-sm font-medium">{officiel.provinceNom}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Club</p>
                  <p className="text-sm font-medium">{officiel.clubNom}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Poste</p>
                  <p className="text-sm font-medium">{officiel.fonction}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date de naissance</p>
                  <p className="text-sm font-medium">{officiel.dateNaissance} ({calculateAge(officiel.dateNaissance)} ans)</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <p className="text-sm text-muted-foreground">Province</p>
                  <p className="font-medium">{officiel.provinceNom}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fonction</p>
                  <p className="font-medium">{officiel.fonction}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <p className="font-medium">{officiel.statut === "actif" ? "Actif" : "Inactif"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Niveau</p>
                  <p className="font-medium">{officiel.niveau}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">{officiel.dateNaissance}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Âge</p>
                  <p className="font-medium">{calculateAge(officiel.dateNaissance)} ans</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de nomination</p>
                  <p className="font-medium">{officiel.dateNomination || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de fin de mandat</p>
                  <p className="font-medium">{officiel.dateFinMandat || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistiques" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historique" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Historique</CardTitle>
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
