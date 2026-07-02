"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  MapPin,
  User,
  Ruler,
  Building2,
  FileText,
  Activity,
} from "lucide-react"
import type { Athlete, Transfert } from "@/lib/types"
import { calculateAgeFromSheetDate, formatSheetDate } from "@/lib/date-utils"

interface AthleteDetailProps {
  athlete: Athlete
  transferts: Transfert[]
  onBack: () => void
}

export function AthleteDetail({ athlete, transferts, onBack }: AthleteDetailProps) {
  const age = calculateAgeFromSheetDate(athlete.dateNaissance)
  const athleteTransferts = transferts.filter((transfert) => {
    const athleteId = athlete.id.trim().toLowerCase()
    const athleteName = athlete.nomComplet.trim().toLowerCase()

    return (
      transfert.athleteId.trim().toLowerCase() === athleteId ||
      transfert.id.trim().toLowerCase() === athleteId ||
      (athleteName && transfert.athleteNom.trim().toLowerCase() === athleteName)
    )
  })

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "A"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }

  const formatGender = (genre: string) => {
    if (genre === "M") return "Masculin"
    if (genre === "F") return "Féminin"
    return genre || "-"
  }

  const formatNumber = (value: number | null, suffix: string) => (
    value !== null ? `${value} ${suffix}` : "-"
  )

  const infoRow = (label: string, value: string | number | null | undefined) => (
    <div className="grid gap-1 text-sm md:grid-cols-[10.5rem_minmax(0,1fr)] md:items-start">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-medium text-foreground md:text-right">
        {value !== null && value !== undefined && value !== "" ? value : "-"}
      </span>
    </div>
  )

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "actif":
      case "active":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>
      case "inactif":
      case "inactive":
        return <Badge variant="secondary">Inactif</Badge>
      case "blesse":
      case "blessé":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Blessé</Badge>
      default:
        return <Badge variant="outline">{statut || "-"}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-foreground">
              {athlete.nomComplet}
            </h1>
            <p className="truncate text-muted-foreground">{athlete.disciplineActive || "-"} - {athlete.clubNom || "-"}</p>
          </div>
        </div>
        <Button className="self-start sm:self-auto">
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
        <Card>
          <CardContent className="pt-6">
            <div className="flex min-w-0 flex-col items-center text-center">
              <Avatar className="mb-4 h-24 w-24">
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {getInitials(athlete.nomComplet)}
                </AvatarFallback>
              </Avatar>
              <h2 className="w-full break-words text-xl font-semibold">{athlete.nomComplet}</h2>
              <p className="text-muted-foreground">{athlete.disciplineActive || "-"}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{athlete.id || "-"}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {getStatusBadge(athlete.statut)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0">
          <Tabs defaultValue="infos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
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
                    {infoRow("ID athlète", athlete.id)}
                    {infoRow("Nom complet", athlete.nomComplet)}
                    {infoRow("Date de naissance", formatSheetDate(athlete.dateNaissance))}
                    {infoRow("Lieu de naissance", athlete.lieuNaissance)}
                    {infoRow("Âge", age !== null ? `${age} ans` : "-")}
                    {infoRow("Genre", formatGender(athlete.genre))}
                    {infoRow("Nationalité", athlete.nationalite)}
                    {infoRow("Statut", athlete.statut)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MapPin className="h-4 w-4" />
                      Contact et adresse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Téléphone", athlete.telephone)}
                    {infoRow("Email", athlete.email)}
                    {infoRow("Adresse", athlete.adresse)}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4" />
                      Affiliation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {infoRow("Ligue", athlete.ligueNom)}
                    {infoRow("Entente", athlete.ententeNom)}
                    {infoRow("Club", athlete.clubNom)}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Ruler className="h-4 w-4" />
                      Profil sportif
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 lg:grid-cols-2">
                    {infoRow("Discipline active", athlete.disciplineActive)}
                    {infoRow("Poste indoor", athlete.posteIndoor)}
                    {infoRow("Poste beach", athlete.posteBeach)}
                    {infoRow("Numéro", athlete.numero)}
                    {infoRow("Taille", formatNumber(athlete.taille, "cm"))}
                    {infoRow("Poids", formatNumber(athlete.poids, "kg"))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="h-4 w-4" />
                    Statistiques de performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Statistiques bientot disponibles.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historique" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    Historique des activités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Periode</TableHead>
                          <TableHead>Saison</TableHead>
                          <TableHead>Club d'origine</TableHead>
                          <TableHead>Matricule</TableHead>
                          <TableHead>Observation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {athleteTransferts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                              Aucun transfert disponible.
                            </TableCell>
                          </TableRow>
                        ) : (
                          athleteTransferts.map((transfert, index) => (
                            <TableRow key={`${transfert.id || "transfert"}-${transfert.clubOrigineId || "sans-club"}-${index}`}>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {formatSheetDate(transfert.dateDebut)} - {formatSheetDate(transfert.dateFin)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {transfert.saison || "-"}
                              </TableCell>
                              <TableCell className="font-medium">
                                {transfert.clubOrigineNom || "-"}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground">
                                {transfert.id || "-"}
                              </TableCell>
                              <TableCell className="max-w-[240px] whitespace-normal text-sm text-muted-foreground">
                                {transfert.observation || "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
