"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Edit,
  Phone,
  Stethoscope,
  Trophy,
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

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "M"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }

  const getStatutBadge = (statut: Medecin["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut || "Non defini"}</Badge>
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
            <p className="text-sm text-muted-foreground">Fiche medecin</p>
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
                <p className="mt-1 font-mono text-xs text-muted-foreground">{medecin.id || "-"}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {medecin.specialite || "Specialite non definie"}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {getStatutBadge(medecin.statut)}
                {medecin.niveau ? <Badge variant="outline">{medecin.niveau}</Badge> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Informations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {infoRow("ID medecin", medecin.id)}
              {infoRow("Nom complet", medecin.nomComplet)}
              {infoRow("Date de naissance", formatSheetDate(medecin.dateNaissance))}
              {infoRow("Age", age !== null ? `${age} ans` : "-")}
              {infoRow("Genre", medecin.genre)}
              {infoRow("Statut", medecin.statut)}
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
              {infoRow("Telephone", medecin.telephone)}
              {infoRow("Email", medecin.email)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-4 w-4" />
                Profil medical
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {infoRow("Specialite", medecin.specialite)}
              {infoRow("Niveau", medecin.niveau)}
              {infoRow("Numero d'ordre", medecin.numeroOrdre)}
              {infoRow("Date affiliation", formatSheetDate(medecin.dateAffiliation))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4" />
                Equipe nationale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {infoRow("Equipe nationale", medecin.equipeNationale)}
            </CardContent>
          </Card>
        </div>
      </div>
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
