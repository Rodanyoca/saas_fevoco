"use client"

import type { ComponentType } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Award,
  Building2,
  Edit,
  Mail,
  Phone,
  Shield,
  Trophy,
  User,
} from "lucide-react"
import type { Arbitre } from "@/lib/types"
import { calculateAgeFromSheetDate, formatSheetDate, parseSheetDate } from "@/lib/date-utils"

interface ArbitreDetailProps {
  arbitre: Arbitre
  onBack: () => void
}

export function ArbitreDetail({ arbitre, onBack }: ArbitreDetailProps) {
  const age = calculateAgeFromSheetDate(arbitre.dateNaissance)
  const experience = calculateExperience(arbitre.dateHomologation)
  const isEquipeNationale = isNationalTeam(arbitre.equipeNational)

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.charAt(0) ?? ""
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? ""
    return `${first}${second}`.toUpperCase()
  }

  const getStatutBadge = (statut: Arbitre["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      case "suspendu":
        return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">Suspendu</Badge>
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
            <h1 className="truncate text-2xl font-bold text-foreground">{arbitre.nomComplet}</h1>
            <p className="text-sm text-muted-foreground">Fiche arbitre</p>
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
                  {getInitials(arbitre.nomComplet)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 min-w-0">
                <h2 className="text-xl font-semibold text-foreground">{arbitre.nomComplet}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{arbitre.grade || "Grade non défini"}</p>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {getStatutBadge(arbitre.statut)}
                {arbitre.grade ? <Badge variant="outline">{arbitre.grade}</Badge> : null}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Âge" value={age !== null ? age : "-"} />
              <MiniStat label="Exp." value={experience} />
              <MiniStat label="EN" value={isEquipeNationale ? "Oui" : "Non"} />
            </div>

            <div className="mt-6 space-y-4">
              <ContactLine icon={Phone} value={arbitre.telephone || "-"} />
              <ContactLine icon={Mail} value={arbitre.email || "-"} />
              <ContactLine icon={Award} value={arbitre.grade || "-"} />
              <ContactLine icon={Building2} value={arbitre.ligueNom || "-"} />
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0">
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="profil">Profil arbitral</TabsTrigger>
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
                    {infoRow("ID arbitre", arbitre.id)}
                    {infoRow("Nom complet", arbitre.nomComplet)}
                    {infoRow("Date de naissance", formatSheetDate(arbitre.dateNaissance))}
                    {infoRow("Âge", age !== null ? `${age} ans` : "-")}
                    {infoRow("Genre", formatGender(arbitre.genre))}
                    {infoRow("Statut", arbitre.statut)}
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
                    {infoRow("Téléphone", arbitre.telephone)}
                    {infoRow("Email", arbitre.email)}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profil" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      Homologation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Grade", arbitre.grade)}
                    {infoRow("Ligue", arbitre.ligueNom)}
                    {infoRow("Date homologation", formatSheetDate(arbitre.dateHomologation))}
                    {infoRow("Expérience", experience)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Trophy className="h-4 w-4" />
                      Sélection
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Équipe nationale", arbitre.equipeNational || "-")}
                    {infoRow("Statut", isEquipeNationale ? "Oui" : "Non")}
                    {infoRow("Statut arbitre", arbitre.statut)}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function calculateExperience(dateHomologation: string) {
  const start = parseSheetDate(dateHomologation)
  if (!start) return "-"

  const today = new Date()
  let years = today.getFullYear() - start.getFullYear()
  const monthDelta = today.getMonth() - start.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < start.getDate())) {
    years--
  }

  if (years <= 0) return "Moins d'un an"
  return `${years} an${years > 1 ? "s" : ""}`
}

function formatGender(genre: string) {
  if (genre === "M") return "Masculin"
  if (genre === "F") return "Féminin"
  return genre || "-"
}

function isNationalTeam(value: string) {
  return ["oui", "yes", "true", "1", "x"].includes(value.trim().toLowerCase())
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
      <span className="min-w-0 whitespace-normal break-words text-left [overflow-wrap:anywhere]">{value}</span>
    </div>
  )
}

function infoRow(label: string, value: string) {
  return (
    <div className="grid min-w-0 gap-1 text-sm sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 whitespace-normal break-words font-medium text-foreground [overflow-wrap:anywhere] sm:text-right">
        {value || "-"}
      </span>
    </div>
  )
}
