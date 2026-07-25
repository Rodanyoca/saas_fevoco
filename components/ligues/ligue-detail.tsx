"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatSheetDate } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { Athlete, Club, Entente, Ligue, Province } from "@/lib/types"
import { ArrowLeft, Building2, Network, Shield, Users } from "lucide-react"
import { LigueFormDialog } from "@/components/ligues/ligue-form-dialog"
import type { SavedLigue } from "@/components/ligues/ligue-form-dialog"

interface LigueDetailProps {
  ligue: Ligue
  ententes: Entente[]
  clubs: Club[]
  athletes: Athlete[]
  provinces: Province[]
  onBack: () => void
  onUpdated: (ligue: SavedLigue) => void
}

const shown = (value: unknown, fallback = "Non renseigné") => {
  const text = value === null || value === undefined ? "" : String(value).trim()
  return text || fallback
}

export function LigueDetail({ ligue, ententes, clubs, athletes, provinces, onBack, onUpdated }: LigueDetailProps) {
  const [ententeSearch, setEntenteSearch] = useState("")
  const [clubSearch, setClubSearch] = useState("")
  const ligueEntentes = ententes.filter((item) => item.idLigue === ligue.idLigue)
  const ligueClubs = clubs.filter((item) => item.idLigue === ligue.idLigue)
  const ligueAthletes = athletes.filter((item) => item.ligueId === ligue.idLigue)

  const visibleEntentes = useMemo(() => {
    const query = ententeSearch.trim().toLowerCase()
    if (!query) return ligueEntentes
    return ligueEntentes.filter((item) =>
      `${item.idEntente} ${item.codeEntente} ${item.nomEntente} ${item.pseudoEntente} ${item.emailEntente} ${item.statut}`
        .toLowerCase().includes(query),
    )
  }, [ententeSearch, ligueEntentes])

  const visibleClubs = useMemo(() => {
    const query = clubSearch.trim().toLowerCase()
    if (!query) return ligueClubs
    return ligueClubs.filter((item) =>
      `${item.idClub} ${item.nomClub} ${item.categorie} ${item.version} ${item.nomEntente} ${item.pseudoEntente} ${item.statut}`
        .toLowerCase().includes(query),
    )
  }, [clubSearch, ligueClubs])

  const indicators = [
    ["Nombre d’ententes", ligueEntentes.length, Network],
    ["Nombre de clubs", ligueClubs.length, Shield],
    ["Clubs masculins", ligueClubs.filter((club) => normalize(club.version) === "MASCULIN").length, Users],
    ["Clubs féminins", ligueClubs.filter((club) => normalize(club.version) === "FEMININ").length, Users],
    ["Clubs actifs", ligueClubs.filter((club) => normalize(club.statut) === "ACTIF" || normalize(club.statut) === "ACTIVE").length, Shield],
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{shown(ligue.nomLigue, "Ligue")}</h1>
            <p className="font-mono text-sm text-muted-foreground">{shown(ligue.idLigue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LigueFormDialog
            ligue={ligue}
            provinces={provinces}
            onSaved={onUpdated}
          />
          <Badge variant={normalize(ligue.statut) === "ACTIF" || normalize(ligue.statut) === "ACTIVE" ? "default" : "secondary"}>{shown(ligue.statut)}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {indicators.map(([label, value, Icon]) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-5 w-5 text-primary" />
              <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="informations" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl p-1.5 md:grid-cols-4">
          <TabsTrigger className="min-h-11 w-full whitespace-normal px-3 py-2 text-center leading-tight" value="informations">Informations générales</TabsTrigger>
          <TabsTrigger className="min-h-11 w-full whitespace-normal px-3 py-2 text-center leading-tight" value="ententes">Ententes ({ligueEntentes.length})</TabsTrigger>
          <TabsTrigger className="min-h-11 w-full whitespace-normal px-3 py-2 text-center leading-tight" value="clubs">Clubs ({ligueClubs.length})</TabsTrigger>
          <TabsTrigger className="min-h-11 w-full whitespace-normal px-3 py-2 text-center leading-tight" value="athletes">Athlètes ({ligueAthletes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="informations">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />Informations générales</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {[
                ["Identifiant", ligue.idLigue],
                ["Nom de la ligue", ligue.nomLigue],
                ["Province", ligue.nomProvince],
                ["Adresse e-mail", ligue.emailLigue],
                ["Statut", ligue.statut],
                ["Observations", ligue.observations],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 break-words font-medium">{shown(value)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ententes">
          <Card>
            <CardHeader><CardTitle>Ententes rattachées</CardTitle><Input value={ententeSearch} onChange={(e) => setEntenteSearch(e.target.value)} placeholder="Rechercher une entente..." /></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nom de l’entente</TableHead><TableHead>Pseudo</TableHead><TableHead>Adresse e-mail</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                <TableBody>
                  {visibleEntentes.map((item) => <TableRow key={item.idEntente}><TableCell>{shown(item.idEntente)}</TableCell><TableCell>{shown(item.nomEntente)}</TableCell><TableCell>{shown(item.pseudoEntente)}</TableCell><TableCell>{shown(item.emailEntente)}</TableCell><TableCell>{shown(item.statut)}</TableCell></TableRow>)}
                  {visibleEntentes.length === 0 && <TableRow><TableCell colSpan={5} className="h-24 text-center">Aucune entente enregistrée pour cette ligue.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clubs">
          <Card>
            <CardHeader><CardTitle>Clubs rattachés</CardTitle><Input value={clubSearch} onChange={(e) => setClubSearch(e.target.value)} placeholder="Rechercher un club..." /></CardHeader>
            <CardContent className="overflow-x-auto">
              <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Club</TableHead><TableHead>Catégorie</TableHead><TableHead>Version</TableHead><TableHead>Entente</TableHead><TableHead>Statut</TableHead><TableHead>Date d’affiliation</TableHead></TableRow></TableHeader>
                <TableBody>
                  {visibleClubs.map((item) => <TableRow key={item.idClub}><TableCell>{shown(item.idClub)}</TableCell><TableCell>{shown(item.nomClub)}</TableCell><TableCell>{shown(item.categorie)}</TableCell><TableCell>{shown(item.version)}</TableCell><TableCell>{shown(item.pseudoEntente)}</TableCell><TableCell>{shown(item.statut)}</TableCell><TableCell>{formatSheetDate(item.dateAffiliationClub) === "-" ? "Non renseignée" : formatSheetDate(item.dateAffiliationClub)}</TableCell></TableRow>)}
                  {visibleClubs.length === 0 && <TableRow><TableCell colSpan={7} className="h-24 text-center">Aucun club enregistré pour cette ligue.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="athletes">
          <Card><CardContent className="flex min-h-32 items-center justify-center p-6 text-center text-muted-foreground">
            {ligueAthletes.length ? `${ligueAthletes.length} athlète(s) disponible(s).` : "Le référentiel des athlètes n’est pas encore connecté."}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
