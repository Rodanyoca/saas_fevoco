"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AthletesTable } from "@/components/athletes/athletes-table"
import type { Athlete, Club } from "@/lib/types"
import {
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Network,
  Phone,
  Shield,
  User,
  Users,
} from "lucide-react"

interface ClubDetailProps {
  club: Club
  athletes: Athlete[]
  onBack: () => void
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield
  label: string
  value: string | number
}) {
  return (
    <div className="grid grid-cols-[1rem_minmax(8rem,auto)_minmax(0,1fr)] items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium leading-relaxed text-foreground">
        {value || "-"}
      </span>
    </div>
  )
}

function formatDate(value: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("fr-FR")
}

export function ClubDetail({ club, athletes, onBack }: ClubDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{club.nom}</h1>
            <p className="text-muted-foreground">Détails du club</p>
          </div>
        </div>
        <Badge
          variant={club.statut === "actif" ? "default" : "secondary"}
          className={
            club.statut === "actif"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-gray-100 text-gray-600 hover:bg-gray-100"
          }
        >
          {club.statut === "actif" ? "Actif" : "Inactif"}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{club.nom}</h2>
              <p className="text-muted-foreground">{club.version || "-"}</p>

              <div className="mt-6 w-full space-y-3 text-left">
                <InfoRow icon={Shield} label="ID club:" value={club.id} />
                <InfoRow icon={Building2} label="Ligue:" value={club.ligueNom} />
                <InfoRow icon={Shield} label="Categorie:" value={club.categorie} />
                <InfoRow icon={Network} label="Entente:" value={club.ententeNom} />
                <InfoRow icon={Network} label="Pseudo entente:" value={club.pseudoEntente} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-primary" />
              Personne contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={User} label="Nom:" value={club.personneContactNom} />
            <InfoRow icon={Phone} label="Téléphone:" value={club.personneContactTelephone} />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-primary" />
              Affiliation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={Calendar} label="Date affiliation:" value={formatDate(club.dateAffiliation)} />
            <InfoRow icon={Users} label="Athlètes:" value={club.athletes ?? 0} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-5 w-5 text-primary" />
            Adresse du club
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="break-words text-sm font-medium leading-relaxed text-foreground">
            {club.adresse || "-"}
          </p>
        </CardContent>
      </Card>

      <AthletesTable
        athletes={athletes}
        title={`Athlètes du club (${athletes.length})`}
      />
    </div>
  )
}
