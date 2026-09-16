"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LigueFormDialog, type SavedLigue } from "@/components/ligues/ligue-form-dialog"
import { calculateAge } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import { buildLigueHierarchy } from "@/lib/territorial-hierarchy"
import type { Athlete, Club, Entente, Ligue, Province } from "@/lib/types"
import { ArrowLeft, Building2, Network, Shield, Users } from "lucide-react"

const shown = (value: unknown, fallback = "Non renseigné") => String(value ?? "").trim() || fallback
const active = (value: string) => ["ACTIF", "ACTIVE"].includes(normalize(value))

export function LigueDetail({ ligue, ententes, clubs, athletes, provinces, onBack, onUpdated, relationsReady }: {
  ligue: Ligue
  ententes: Entente[]
  clubs: Club[]
  athletes: Athlete[]
  provinces: Province[]
  onBack: () => void
  onUpdated: (ligue: SavedLigue) => void
  relationsReady: boolean
}) {
  const [ententeSearch, setEntenteSearch] = useState("")
  const [clubSearch, setClubSearch] = useState("")
  const [athleteSearch, setAthleteSearch] = useState("")
  const hierarchy = useMemo(() => buildLigueHierarchy(ligue, ententes, clubs, athletes), [ligue, ententes, clubs, athletes])
  const ententesById = useMemo(() => new Map(hierarchy.ententes.map((item) => [item.idEntente, item])), [hierarchy.ententes])

  const visibleEntentes = hierarchy.ententes.filter((item) => `${item.idEntente} ${item.nomEntente} ${item.pseudoEntente}`.toLowerCase().includes(ententeSearch.toLowerCase()))
  const visibleClubs = hierarchy.clubs.filter((item) => `${item.idClub} ${item.nomClub} ${ententesById.get(item.idEntente)?.nomEntente ?? ""} ${item.categorie}`.toLowerCase().includes(clubSearch.toLowerCase()))
  const visibleAthletes = hierarchy.athletes.filter((item) => `${item.idAthlete} ${item.nomComplet} ${item.clubNom} ${item.ententeNom}`.toLowerCase().includes(athleteSearch.toLowerCase()))

  return <div className="space-y-6">
    <section className="flex flex-wrap items-start justify-between gap-4 border-b pb-5" aria-labelledby="ligue-title">
      <div className="flex min-w-0 items-start gap-3"><Button variant="outline" size="icon" onClick={onBack}><ArrowLeft /><span className="sr-only">Retour à la liste des ligues</span></Button><div><p className="font-mono text-xs text-muted-foreground">{shown(ligue.idLigue)}</p><h2 id="ligue-title" className="text-2xl font-bold tracking-tight">{shown(ligue.nomLigue, "Ligue")}</h2><p className="mt-1 text-sm text-muted-foreground">{shown(ligue.nomProvince, "Province non renseignée")}</p></div></div>
      <div className="flex items-center gap-2"><Badge variant={active(ligue.statut) ? "default" : "secondary"}>{shown(ligue.statut)}</Badge><LigueFormDialog ligue={ligue} provinces={provinces} onSaved={onUpdated} /></div>
    </section>

    <Card id="informations"><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="size-5 text-primary" />Informations générales</CardTitle></CardHeader><CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{[["Identifiant", ligue.idLigue], ["Nom", ligue.nomLigue], ["Province", ligue.nomProvince], ["Président / responsable", ligue.presidentNom], ["Téléphone", ligue.presidentTelephone], ["Adresse e-mail", ligue.emailLigue || ligue.presidentEmail], ["Statut", ligue.statut], ["Observations", ligue.observations]].map(([label, value]) => <div key={label} className="border-b pb-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words font-medium">{shown(value)}</p></div>)}</CardContent></Card>

    <section className="grid gap-4 sm:grid-cols-3" aria-label="Résumé statistique">
      <Card><CardContent className="flex items-center gap-3 p-4"><Network className="size-5 text-primary" /><div><p className="text-2xl font-bold">{relationsReady ? hierarchy.ententes.length : "—"}</p><p className="text-xs text-muted-foreground">Ententes</p></div></CardContent></Card>
      <Card><CardContent className="flex items-center gap-3 p-4"><Shield className="size-5 text-primary" /><div><p className="text-2xl font-bold">{relationsReady ? hierarchy.clubs.length : "—"}</p><p className="text-xs text-muted-foreground">Clubs</p></div></CardContent></Card>
      <Card><CardContent className="flex items-center gap-3 p-4"><Users className="size-5 text-primary" /><div><p className="text-2xl font-bold">{relationsReady ? hierarchy.athletes.length : "—"}</p><p className="text-xs text-muted-foreground">Athlètes</p></div></CardContent></Card>
    </section>

    {!relationsReady && <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground" role="status">Certaines données territoriales n’ont pas pu être chargées. Les compteurs indisponibles ne sont pas remplacés par zéro.</p>}

    <Card id="ententes" className="scroll-mt-20"><CardHeader><CardTitle>Ententes ({hierarchy.ententes.length})</CardTitle><Input value={ententeSearch} onChange={(event) => setEntenteSearch(event.target.value)} placeholder="Rechercher par identifiant ou nom…" aria-label="Rechercher une entente" /></CardHeader><CardContent><Table className="min-w-[620px]"><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Entente</TableHead><TableHead className="text-center">Clubs</TableHead><TableHead className="text-center">Athlètes</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{visibleEntentes.map((item) => { const relatedClubs = hierarchy.clubsByEntenteId.get(item.idEntente) ?? []; const count = relatedClubs.reduce((sum, club) => sum + (hierarchy.athletesByClubId.get(club.idClub)?.length ?? 0), 0); return <TableRow key={item.idEntente}><TableCell className="font-mono text-xs">{shown(item.idEntente)}</TableCell><TableCell className="font-semibold">{shown(item.nomEntente)}</TableCell><TableCell className="text-center">{relatedClubs.length}</TableCell><TableCell className="text-center">{count}</TableCell><TableCell><Badge variant={active(item.statut) ? "default" : "secondary"}>{shown(item.statut)}</Badge></TableCell></TableRow>})}{!visibleEntentes.length && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucune entente enregistrée pour cette ligue.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>

    <Card id="clubs" className="scroll-mt-20"><CardHeader><CardTitle>Clubs ({hierarchy.clubs.length})</CardTitle><Input value={clubSearch} onChange={(event) => setClubSearch(event.target.value)} placeholder="Rechercher par identifiant, club, entente ou catégorie…" aria-label="Rechercher un club" /></CardHeader><CardContent><Table className="min-w-[780px]"><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Club</TableHead><TableHead>Entente</TableHead><TableHead>Catégorie</TableHead><TableHead className="text-center">Athlètes</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{visibleClubs.map((item) => <TableRow key={item.idClub}><TableCell className="font-mono text-xs">{shown(item.idClub)}</TableCell><TableCell className="font-semibold">{shown(item.nomClub)}</TableCell><TableCell>{shown(ententesById.get(item.idEntente)?.nomEntente, `Entente ${item.idEntente}`)}</TableCell><TableCell>{shown(item.categorie)}</TableCell><TableCell className="text-center">{hierarchy.athletesByClubId.get(item.idClub)?.length ?? 0}</TableCell><TableCell><Badge variant={active(item.statut) ? "default" : "secondary"}>{shown(item.statut)}</Badge></TableCell></TableRow>)}{!visibleClubs.length && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucun club rattaché aux ententes de cette ligue.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>

    <Card id="athletes" className="scroll-mt-20"><CardHeader><CardTitle>Athlètes ({hierarchy.athletes.length})</CardTitle><Input value={athleteSearch} onChange={(event) => setAthleteSearch(event.target.value)} placeholder="Rechercher par identifiant, nom, club ou entente…" aria-label="Rechercher un athlète" /></CardHeader><CardContent><Table className="min-w-[920px]"><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nom complet</TableHead><TableHead>Sexe / âge</TableHead><TableHead>Club</TableHead><TableHead>Entente</TableHead><TableHead>Discipline</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{visibleAthletes.map((item) => { const club = hierarchy.clubs.find((entry) => entry.idClub === item.clubId); const age = calculateAge(item.dateDeNaissance); return <TableRow key={item.idAthlete}><TableCell className="font-mono text-xs">{shown(item.idAthlete)}</TableCell><TableCell className="font-semibold">{shown(item.nomComplet)}</TableCell><TableCell>{shown(item.sexe, "—")} · {age === null ? "âge non renseigné" : `${age} ans`}</TableCell><TableCell>{shown(club?.nomClub || item.clubNom)}</TableCell><TableCell>{shown(club?.nomEntente || item.ententeNom)}</TableCell><TableCell>{shown(item.disciplineActive, "—")}</TableCell><TableCell><Badge variant={active(item.statut) ? "default" : "secondary"}>{shown(item.statut)}</Badge></TableCell></TableRow>})}{!visibleAthletes.length && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Aucun athlète directement lié aux clubs de cette ligue.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
  </div>
}
