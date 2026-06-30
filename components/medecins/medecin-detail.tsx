"use client"

import type { ComponentType } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  ArrowLeft,
  Award,
  Building2,
  Edit,
  FileText,
  Mail,
  Phone,
  Stethoscope,
  User,
} from "lucide-react"
import type { Medecin } from "@/lib/types"
import { calculateAgeFromSheetDate, formatSheetDate } from "@/lib/date-utils"

interface MedecinDetailProps {
  medecin: Medecin
  onBack: () => void
}

export function MedecinDetail({ medecin, onBack }: MedecinDetailProps) {
  const age = calculateAgeFromSheetDate(medecin.dateNaissance)
  const activeAffiliations = medecin.affiliations.filter((affiliation) => affiliation.statut === "actif")
  const clubsCount = new Set(
    medecin.affiliations.map((affiliation) => affiliation.clubId || affiliation.clubNom).filter(Boolean)
  ).size

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.charAt(0) ?? ""
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? ""
    return `${first}${second}`.toUpperCase()
  }

  const getStatutBadge = (statut: Medecin["statut"]) => {
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
            <h1 className="truncate text-2xl font-bold text-foreground">Dr. {medecin.nomComplet}</h1>
            <p className="text-sm text-muted-foreground">Fiche médecin</p>
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
                  {getInitials(medecin.nomComplet)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 min-w-0">
                <h2 className="text-xl font-semibold text-foreground">Dr. {medecin.nomComplet}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{medecin.specialite || "Spécialité non définie"}</p>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {getStatutBadge(medecin.statut)}
                {medecin.niveau ? <Badge variant="outline">{medecin.niveau}</Badge> : null}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Âge" value={age !== null ? age : "-"} />
              <MiniStat label="Clubs" value={clubsCount} />
              <MiniStat label="Actives" value={activeAffiliations.length} />
            </div>

            <div className="mt-6 space-y-4">
              <ContactLine icon={Phone} value={medecin.telephone || "-"} />
              <ContactLine icon={Mail} value={medecin.email || "-"} />
              <ContactLine icon={Award} value={medecin.numeroOrdre ? `Ordre ${medecin.numeroOrdre}` : "-"} />
              <ContactLine icon={Building2} value={medecin.clubNom || "-"} />
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0">
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="affiliation">Affiliation</TabsTrigger>
              <TabsTrigger value="historique">Historique</TabsTrigger>
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
                    {infoRow("ID médecin", medecin.id)}
                    {infoRow("Nom complet", medecin.nomComplet)}
                    {infoRow("Date de naissance", formatSheetDate(medecin.dateNaissance))}
                    {infoRow("Âge", age !== null ? `${age} ans` : "-")}
                    {infoRow("Genre", medecin.genre)}
                    {infoRow("Statut", medecin.statut)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Stethoscope className="h-4 w-4" />
                      Profil médical
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Spécialité", medecin.specialite)}
                    {infoRow("Niveau", medecin.niveau)}
                    {infoRow("N° ordre des médecins", medecin.numeroOrdre)}
                    {infoRow("Téléphone", medecin.telephone)}
                    {infoRow("Email", medecin.email)}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="affiliation" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4" />
                      Affiliation active
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Ligue", medecin.ligueNom)}
                    {infoRow("Entente", medecin.ententeNom)}
                    {infoRow("Pseudo entente", medecin.pseudoEntente)}
                    {infoRow("Club", medecin.clubNom)}
                    {infoRow("Date de début", formatSheetDate(medecin.dateAffiliation))}
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
                    {infoRow("Clubs suivis", String(clubsCount))}
                    {infoRow("Total affiliations", String(medecin.affiliations.length))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="historique" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Historique des affiliations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {medecin.affiliations.length > 0 ? (
                    medecin.affiliations.map((affiliation, index) => (
                      <div
                        key={`${affiliation.medecinId}-${affiliation.clubId}-${index}`}
                        className="rounded-md border p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">
                              {affiliation.clubNom || "Club non défini"}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              {affiliation.pseudoEntente || affiliation.ententeNom || "Structure non définie"}
                            </p>
                          </div>
                          {getStatutBadge(affiliation.statut)}
                        </div>
                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          {infoRow("Ligue", affiliation.ligueNom)}
                          {infoRow("Entente", affiliation.ententeNom)}
                          {infoRow("Début", formatSheetDate(affiliation.dateDebut))}
                          {infoRow("Fin", formatSheetDate(affiliation.dateFin))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      Aucune affiliation enregistrée.
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

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border bg-muted/20 px-2 py-3">
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function ContactLine({
  icon: Icon,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 break-words text-left">{value}</span>
    </div>
  )
}

function infoRow(label: string, value: string) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-foreground">{value || "-"}</span>
    </div>
  )
}
