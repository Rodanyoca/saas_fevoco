"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateAgeFromSheetDate, formatSheetDate, parseSheetDate } from "@/lib/date-utils"
import type { Coach, CoachAffiliation } from "@/lib/types"
import {
  Activity,
  ArrowLeft,
  Briefcase,
  Edit,
  GraduationCap,
  Phone,
  User,
} from "lucide-react"

interface CoachDetailProps {
  coach: Coach
  affiliations: CoachAffiliation[]
  onBack: () => void
}

export function CoachDetail({ coach, affiliations, onBack }: CoachDetailProps) {
  const age = calculateAgeFromSheetDate(coach.dateNaissance)
  const activeAffiliations = affiliations.filter((affiliation) => affiliation.statut === "actif")
  const teamsCount = new Set(
    affiliations.map((affiliation) => affiliation.equipeId || affiliation.equipeNom).filter(Boolean)
  ).size

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "C"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }

  const formatGender = (genre: string) => {
    if (genre === "M") return "Masculin"
    if (genre === "F") return "Féminin"
    return genre || "-"
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut || "Non défini"}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">{coach.nomComplet}</h1>
            <p className="text-sm text-muted-foreground">Fiche coach</p>
          </div>
        </div>

        <Button className="shrink-0">
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {getInitials(coach.nomComplet)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 min-w-0">
                <h2 className="text-xl font-semibold text-foreground">{coach.nomComplet}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{coach.specialisation || "Spécialisation non définie"}</p>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {getStatutBadge(coach.statut)}
                {coach.niveau ? <Badge variant="outline">{coach.niveau}</Badge> : null}
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="min-w-0">
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="profil">Profil</TabsTrigger>
              <TabsTrigger value="parcours">Parcours</TabsTrigger>
            </TabsList>

            <TabsContent value="infos" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Identité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("ID coach", coach.id)}
                    {infoRow("Nom complet", coach.nomComplet)}
                    {infoRow("Genre", formatGender(coach.genre))}
                    {infoRow("Nationalité", coach.nationalite)}
                    {infoRow("Date de naissance", formatSheetDate(coach.dateNaissance))}
                    {infoRow("Lieu de naissance", coach.lieuNaissance)}
                    {infoRow("Âge", age !== null ? `${age} ans` : "-")}
                    {infoRow("Statut", coach.statut)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Phone className="h-4 w-4" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Téléphone", coach.telephone)}
                    {infoRow("Email", coach.email)}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profil" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="h-4 w-4" />
                      Profil professionnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Niveau", coach.niveau)}
                    {infoRow("Spécialisation", coach.specialisation)}
                    {infoRow("Date affiliation", formatSheetDate(coach.dateAffiliation))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Activity className="h-4 w-4" />
                      Couverture
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Affiliations actives", String(activeAffiliations.length))}
                    {infoRow("Équipes suivies", String(teamsCount))}
                    {infoRow("Total parcours", String(affiliations.length))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="parcours" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="h-4 w-4" />
                    Parcours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {affiliations.length > 0 ? (
                    affiliations.map((affiliation, index) => (
                      <div key={`${affiliation.id || "affiliation"}-${affiliation.coachId || "sans-coach"}-${index}`} className="rounded-md border p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {affiliation.equipeNom || affiliation.equipeId || "Équipe non définie"}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">{affiliation.role || "Rôle non défini"}</p>
                          </div>
                          {getStatutBadge(affiliation.statut)}
                        </div>
                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          {infoRow("Début", formatSheetDate(affiliation.dateDebut))}
                          {infoRow("Fin", affiliation.dateFin ? formatSheetDate(affiliation.dateFin) : "En cours")}
                          {infoRow("Durée", formatDuration(affiliation.dateDebut, affiliation.dateFin))}
                          {infoRow("Rôle", affiliation.role)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Aucun parcours enregistré pour ce coach.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function formatDuration(dateDebut: string, dateFin: string) {
  const start = parseSheetDate(dateDebut)
  if (!start) return "-"

  const end = parseSheetDate(dateFin) ?? new Date()
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) -
    (end.getDate() < start.getDate() ? 1 : 0)

  if (months < 0) return "-"
  if (months < 1) return "Moins d'un mois"

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  return [
    years > 0 ? `${years} an${years > 1 ? "s" : ""}` : "",
    remainingMonths > 0 ? `${remainingMonths} mois` : "",
  ]
    .filter(Boolean)
    .join(" ")
}

function infoRow(label: string, value: string) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-foreground">{value || "-"}</span>
    </div>
  )
}
