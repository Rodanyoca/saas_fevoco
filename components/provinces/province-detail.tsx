"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  MapPin,
  Building2,
  Users,
  Phone,
  Mail,
  Edit,
  UserCheck,
  Flag,
  Stethoscope,
  TrendingUp,
  Shield,
} from "lucide-react"
import { type Province, ligues, ententes, clubs } from "@/lib/data/demo-data"

interface ProvinceDetailProps {
  province: Province
  onBack: () => void
}

export function ProvinceDetail({ province, onBack }: ProvinceDetailProps) {
  const provinceLigues = ligues.filter(l => l.province === province.nom)
  const provinceEntentes = ententes.filter(e => e.province === province.nom)
  const provinceClubs = clubs.filter(c => c.province === province.nom)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{province.nom}</h1>
            <p className="text-muted-foreground">Détails de la province</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/50 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-4">
                <MapPin className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{province.nom}</h2>
              <p className="text-muted-foreground">Chef-lieu: {province.chefLieu}</p>
              <Badge
                className={`mt-2 ${
                  province.statut === "active"
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {province.statut === "active" ? "Active" : "Inactive"}
              </Badge>

              <div className="mt-6 w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Responsable:</span>
                  <span className="font-medium text-foreground ml-auto">{province.responsable}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Téléphone:</span>
                  <span className="font-medium text-foreground ml-auto">{province.telephone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground ml-auto text-xs">{province.email}</span>
                </div>
              </div>

              {/* Completude */}
              <div className="mt-6 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Complétude des données</span>
                  <span className="text-sm font-medium">{province.completude}%</span>
                </div>
                <Progress value={province.completude} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Details */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Statistiques de la Province
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div className="rounded-lg border border-border/50 p-4 text-center">
                <Building2 className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.ligues}</p>
                <p className="text-xs text-muted-foreground">Ligues</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4 text-center">
                <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.ententes}</p>
                <p className="text-xs text-muted-foreground">Ententes</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4 text-center">
                <Building2 className="h-6 w-6 mx-auto text-accent-foreground mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.clubs}</p>
                <p className="text-xs text-muted-foreground">Clubs</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4 text-center">
                <Users className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.athletes}</p>
                <p className="text-xs text-muted-foreground">Athlètes</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4 text-center">
                <UserCheck className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.coachs}</p>
                <p className="text-xs text-muted-foreground">Coachs</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4 text-center">
                <Flag className="h-6 w-6 mx-auto text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.arbitres}</p>
                <p className="text-xs text-muted-foreground">Arbitres</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4 text-center">
                <Stethoscope className="h-6 w-6 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.medecins}</p>
                <p className="text-xs text-muted-foreground">Médecins</p>
              </div>
              <div className="rounded-lg border border-border/50 p-4 text-center bg-primary/5">
                <TrendingUp className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{province.completude}%</p>
                <p className="text-xs text-muted-foreground">Complétude</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ligues" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="ligues">Ligues ({provinceLigues.length})</TabsTrigger>
          <TabsTrigger value="ententes">Ententes ({provinceEntentes.length})</TabsTrigger>
          <TabsTrigger value="clubs">Clubs ({provinceClubs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="ligues" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Ligues de {province.nom}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-center">Ententes</TableHead>
                    <TableHead className="text-center">Clubs</TableHead>
                    <TableHead className="text-center">Athlètes</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provinceLigues.length > 0 ? (
                    provinceLigues.map((ligue) => (
                      <TableRow key={ligue.id}>
                        <TableCell className="font-medium">{ligue.nom}</TableCell>
                        <TableCell className="text-center">{ligue.ententes}</TableCell>
                        <TableCell className="text-center">{ligue.clubs}</TableCell>
                        <TableCell className="text-center">{ligue.athletes}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              ligue.statut === "active"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {ligue.statut === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucune ligue enregistrée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ententes" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Ententes de {province.nom}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Nom</TableHead>
                    <TableHead>Ligue</TableHead>
                    <TableHead className="text-center">Clubs</TableHead>
                    <TableHead className="text-center">Athlètes</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provinceEntentes.length > 0 ? (
                    provinceEntentes.map((entente) => (
                      <TableRow key={entente.id}>
                        <TableCell className="font-medium">{entente.nom}</TableCell>
                        <TableCell className="text-muted-foreground">{entente.ligue}</TableCell>
                        <TableCell className="text-center">{entente.clubs}</TableCell>
                        <TableCell className="text-center">{entente.athletes}</TableCell>
                        <TableCell className="text-muted-foreground">{entente.responsable}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              entente.statut === "active"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {entente.statut === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Aucune entente enregistrée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clubs" className="mt-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Clubs de {province.nom}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Nom</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Entente</TableHead>
                    <TableHead className="text-center">Athlètes</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provinceClubs.length > 0 ? (
                    provinceClubs.map((club) => (
                      <TableRow key={club.id}>
                        <TableCell className="font-medium">{club.nom}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{club.genre}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{club.entente}</TableCell>
                        <TableCell className="text-center">{club.athletes}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              club.statut === "actif"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {club.statut === "actif" ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucun club enregistré
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
