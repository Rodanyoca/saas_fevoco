"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"
import {
  ArrowLeft,
  Building2,
  Mail,
  Network,
  Phone,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react"

interface LigueDetailProps {
  ligue: Ligue
  ententes: Entente[]
  clubs: Club[]
  athletes: Athlete[]
  onBack: () => void
}

function belongsToLigue(item: { ligueId: string; ligueNom: string }, ligue: Ligue) {
  return Boolean(
    (item.ligueId && item.ligueId === ligue.id) ||
      (item.ligueNom && item.ligueNom === ligue.nom),
  )
}

function normalizeValue(value: string | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[1rem_minmax(7rem,auto)_minmax(0,1fr)] items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium leading-relaxed text-foreground">
        {value || "-"}
      </span>
    </div>
  )
}

export function LigueDetail({ ligue, ententes, clubs, athletes, onBack }: LigueDetailProps) {
  const ligueEntentes = ententes.filter((entente) => belongsToLigue(entente, ligue))
  const ligueClubs = clubs.filter((club) => belongsToLigue(club, ligue))
  const ligueAthletes = athletes.filter((athlete) => belongsToLigue(athlete, ligue))
  const clubsMasculins = ligueClubs.filter((club) => normalizeValue(club.version) === "masculin").length
  const clubsFeminins = ligueClubs.filter((club) => normalizeValue(club.version) === "feminin").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{ligue.nom}</h1>
            <p className="text-muted-foreground">Détails de la ligue</p>
          </div>
        </div>
        <Badge
          className={
            ligue.statut === "active"
              ? "bg-green-500/10 text-green-700 hover:bg-green-500/10"
              : "bg-muted text-muted-foreground"
          }
        >
          {ligue.statut === "active" ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{ligue.nom}</h2>
              <p className="text-muted-foreground">{ligue.provinceNom}</p>

              <div className="mt-6 w-full space-y-3 text-left">
                <InfoRow icon={Mail} label="Email ligue:" value={ligue.emailLigue} />
              </div>

            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-5 w-5 text-primary" />
              Président de la ligue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={UserCheck} label="Nom:" value={ligue.presidentNom} />
            <InfoRow icon={Phone} label="Téléphone:" value={ligue.presidentTelephone} />
            <InfoRow icon={Mail} label="Email:" value={ligue.presidentEmail} />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="h-5 w-5 text-primary" />
              Secrétaire général
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={UserCheck} label="Nom:" value={ligue.secretaireNom} />
            <InfoRow icon={Phone} label="Téléphone:" value={ligue.secretaireTelephone} />
            <InfoRow icon={Mail} label="Email:" value={ligue.secretaireEmail} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Statistiques de la Ligue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border/50 p-4 text-center">
              <Network className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">{ligueEntentes.length}</p>
              <p className="text-xs text-muted-foreground">Ententes</p>
            </div>
            <div className="rounded-lg border border-border/50 p-4 text-center">
              <Shield className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">{ligueClubs.length}</p>
              <p className="text-xs text-muted-foreground">Clubs</p>
            </div>
            <div className="rounded-lg border border-border/50 p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-green-600" />
              <p className="text-2xl font-bold text-foreground">{ligueAthletes.length}</p>
              <p className="text-xs text-muted-foreground">Athlètes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Éléments complémentaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border/50 p-4">
              <p className="text-sm text-muted-foreground">Clubs masculins</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{clubsMasculins}</p>
            </div>
            <div className="rounded-lg border border-border/50 p-4">
              <p className="text-sm text-muted-foreground">Clubs féminins</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{clubsFeminins}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
