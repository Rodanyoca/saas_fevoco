"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Building2,
  User,
  FileText,
  History,
} from "lucide-react"
import { type DataQualityIssue } from "@/lib/data/demo-data"

interface QualiteDetailProps {
  issue: DataQualityIssue
  onBack: () => void
}

export function QualiteDetail({ issue, onBack }: QualiteDetailProps) {
  const getPrioriteBadge = (priorite: string) => {
    switch (priorite) {
      case "haute":
        return <Badge variant="destructive">Haute</Badge>
      case "moyenne":
        return <Badge className="bg-accent text-accent-foreground">Moyenne</Badge>
      case "basse":
        return <Badge variant="secondary">Basse</Badge>
      default:
        return <Badge variant="outline">{priorite}</Badge>
    }
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "resolu":
        return <Badge className="bg-green-100 text-green-800">Résolu</Badge>
      case "en_cours":
        return <Badge className="bg-accent text-accent-foreground">En cours</Badge>
      case "non_resolu":
        return <Badge variant="destructive">Non résolu</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getEntiteLabel = (entite: string) => {
    const labels: Record<string, string> = {
      athlete: "Athlète",
      club: "Club",
      coach: "Coach",
      arbitre: "Arbitre",
      medecin: "Médecin",
    }
    return labels[entite] || entite
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Problème de Qualité
            </h1>
            {getPrioriteBadge(issue.priorite)}
            {getStatutBadge(issue.statut)}
          </div>
          <p className="text-muted-foreground mt-1">
            {getEntiteLabel(issue.entite)} - {issue.entiteNom}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Mettre en cours
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <CheckCircle className="mr-2 h-4 w-4" />
            Marquer résolu
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-secondary" />
                Détails du Problème
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg bg-secondary/10 p-4 border border-secondary/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-secondary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Champ manquant: {issue.champManquant}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Le champ &quot;{issue.champManquant}&quot; est requis pour compléter le profil 
                        de {issue.entiteNom}. Veuillez mettre à jour les informations.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type d&apos;entité</p>
                      <p className="font-medium">{getEntiteLabel(issue.entite)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Identifiant</p>
                      <p className="font-medium">{issue.entiteId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Province</p>
                      <p className="font-medium">{issue.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ligue</p>
                      <p className="font-medium">{issue.ligue}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Onglets */}
          <Card className="mt-6">
            <CardContent className="p-0">
              <Tabs defaultValue="actions" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="actions"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Actions Recommandées
                  </TabsTrigger>
                  <TabsTrigger
                    value="historique"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Historique
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="actions" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className="p-2 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Accéder au profil</h4>
                        <p className="text-sm text-muted-foreground">
                          Naviguez vers la page de l&apos;entité concernée pour modifier ses informations.
                        </p>
                        <Button variant="link" className="p-0 h-auto mt-2 text-primary">
                          Voir le profil de {issue.entiteNom}
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className="p-2 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Ajouter le champ manquant</h4>
                        <p className="text-sm text-muted-foreground">
                          Complétez le champ &quot;{issue.champManquant}&quot; avec les informations correctes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className="p-2 rounded-full bg-primary/10">
                        <span className="text-sm font-bold text-primary">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium">Valider la correction</h4>
                        <p className="text-sm text-muted-foreground">
                          Une fois les informations mises à jour, marquez ce problème comme résolu.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="historique" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Problème détecté</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(issue.dateDetection).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {issue.statut === "en_cours" && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-accent/20">
                          <Clock className="h-4 w-4 text-accent-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Mise en cours de résolution</p>
                          <p className="text-sm text-muted-foreground">
                            En attente de correction
                          </p>
                        </div>
                      </div>
                    )}
                    {issue.statut === "resolu" && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Problème résolu</p>
                          <p className="text-sm text-muted-foreground">
                            Le champ a été complété avec succès
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Date de détection</p>
                <p className="font-medium">
                  {new Date(issue.dateDetection).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Priorité</p>
                <div className="mt-1">{getPrioriteBadge(issue.priorite)}</div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Statut actuel</p>
                <div className="mt-1">{getStatutBadge(issue.statut)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ce problème affecte la complétude des données de la province 
                <span className="font-medium text-foreground"> {issue.province}</span> et 
                peut impacter les rapports et statistiques de la FEVOCO.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
