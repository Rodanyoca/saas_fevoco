"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Club } from "@/lib/types"
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Building2,
  
} from "lucide-react"

interface ClubDetailProps {
  club: Club
  onBack: () => void
}

export function ClubDetail({ club, onBack }: ClubDetailProps) {
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
                    <p className="font-medium">{club.ententeNom}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ligue / Province</p>
                    <p className="font-medium">{club.ligueNom}</p>
                    <p className="text-sm text-muted-foreground">{club.provinceNom}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date d&apos;affiliation</p>
                    <p className="font-medium">
                      {club.dateAffiliation ? new Date(club.dateAffiliation).toLocaleDateString("fr-FR") : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Responsable</p>
                    <p className="font-medium">{club.presidentNom}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{club.presidentTelephone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{club.presidentEmail}</p>
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
                  <p className="text-2xl font-bold">{club.athletes ?? 0}</p>
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
                    {club.dateAffiliation
                      ? `${new Date().getFullYear() - new Date(club.dateAffiliation).getFullYear()} ans`
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
