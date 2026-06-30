"use client"

import type { ComponentType } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Edit,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react"
import type { Officiel } from "@/lib/types"
import { calculateAgeFromSheetDate, formatSheetDate, parseSheetDate } from "@/lib/date-utils"

interface OfficielDetailProps {
  officiel: Officiel
  onBack: () => void
}

export function OfficielDetail({ officiel, onBack }: OfficielDetailProps) {
  const age = calculateAgeFromSheetDate(officiel.dateNaissance)
  const mandatDuration = calculateDuration(officiel.dateNomination, officiel.dateFinMandat)
  const federalEntity = getFederalEntity(officiel)

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]?.charAt(0) ?? ""
    const second = parts[1]?.charAt(0) ?? parts[0]?.charAt(1) ?? ""
    return `${first}${second}`.toUpperCase()
  }

  const getStatutBadge = (statut: Officiel["statut"]) => {
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
            <h1 className="truncate text-2xl font-bold text-foreground">{officiel.nomComplet}</h1>
            <p className="text-sm text-muted-foreground">Fiche officiel</p>
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
                  {getInitials(officiel.nomComplet)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 min-w-0">
                <h2 className="text-xl font-semibold text-foreground">{officiel.nomComplet}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{officiel.fonction || "Fonction non définie"}</p>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {getStatutBadge(officiel.statut)}
                {officiel.niveau ? <Badge variant="outline">{officiel.niveau}</Badge> : null}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Âge" value={age !== null ? age : "-"} />
              <MiniStat label="Niveau" value={officiel.niveau || "-"} />
              <MiniStat label="Mandat" value={mandatDuration} />
            </div>

            <div className="mt-6 space-y-4">
              <ContactLine icon={Phone} value={officiel.telephone || "-"} />
              <ContactLine icon={Mail} value={officiel.email || "-"} />
              <ContactLine icon={Briefcase} value={officiel.fonction || "-"} />
              <ContactLine icon={Building2} value={federalEntity} />
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0">
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="mandat">Mandat</TabsTrigger>
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
                    {infoRow("ID officiel", officiel.id)}
                    {infoRow("Nom complet", officiel.nomComplet)}
                    {infoRow("Date de naissance", formatSheetDate(officiel.dateNaissance))}
                    {infoRow("Âge", age !== null ? `${age} ans` : "-")}
                    {infoRow("Genre", formatGender(officiel.genre))}
                    {infoRow("Statut", officiel.statut)}
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
                    {infoRow("Téléphone", officiel.telephone)}
                    {infoRow("Email", officiel.email)}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="mandat" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Briefcase className="h-4 w-4" />
                      Fonction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Fonction", officiel.fonction)}
                    {infoRow("Niveau", officiel.niveau)}
                    {infoRow("Date nomination", formatSheetDate(officiel.dateNomination))}
                    {infoRow("Fin de mandat", officiel.dateFinMandat ? formatSheetDate(officiel.dateFinMandat) : "En cours")}
                    {infoRow("Durée", mandatDuration)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Entité membre fédérale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Entité fédérale", federalEntity)}
                    {infoRow("Province", officiel.provinceNom)}
                    {infoRow("Entente", officiel.ententeNom)}
                    {infoRow("Club", officiel.clubNom)}
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

function getFederalEntity(officiel: Officiel) {
  return officiel.equipeFederal || officiel.clubNom || officiel.ententeNom || officiel.provinceNom || "-"
}

function calculateDuration(dateDebut: string, dateFin: string) {
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

function formatGender(genre: string) {
  if (genre === "M") return "Masculin"
  if (genre === "F") return "Féminin"
  return genre || "-"
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
