"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditEntenteDialog, type SavedEntente } from "@/components/ententes/entente-form-dialog"
import { normalize } from "@/lib/sheet-values"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"
import { ArrowLeft, Shield, Users } from "lucide-react"

const shown = (value: unknown, fallback = "Non renseigné") => String(value ?? "").trim() || fallback
const active = (value: string) => ["ACTIF", "ACTIVE"].includes(normalize(value))

export function EntenteDetail({ entente, ligues, clubs, athletes, onBack, onUpdated }: { entente: Entente; ligues: Ligue[]; clubs: Club[]; athletes: Athlete[]; onBack: () => void; onUpdated: (entente: SavedEntente) => void }) {
  const relatedClubs = clubs.filter((club) => club.idEntente === entente.idEntente)
  const clubIds = new Set(relatedClubs.map((club) => club.idClub))
  const relatedAthletes = athletes.filter((athlete) => clubIds.has(athlete.clubId))

  return <div className="space-y-6">
    <section className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
      <div className="flex items-start gap-3"><Button variant="outline" size="icon" onClick={onBack}><ArrowLeft /><span className="sr-only">Retour à la liste des ententes</span></Button><div><p className="font-mono text-xs text-muted-foreground">{shown(entente.idEntente)}</p><h2 className="text-2xl font-bold tracking-tight">{shown(entente.nomEntente, "Entente")}</h2><p className="mt-1 text-sm text-muted-foreground">{shown(entente.pseudoEntente, "Sans pseudo")}</p></div></div>
      <div className="flex items-center gap-2"><Badge variant={active(entente.statut) ? "default" : "secondary"}>{shown(entente.statut)}</Badge><EditEntenteDialog entente={entente} ligues={ligues} onSaved={onUpdated} /></div>
    </section>

    <Card><CardHeader><CardTitle>Informations générales</CardTitle></CardHeader><CardContent className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">{[["Identifiant", entente.idEntente], ["Nom", entente.nomEntente], ["Pseudo", entente.pseudoEntente], ["Ligue", entente.nomLigue], ["Adresse e-mail", entente.emailEntente], ["Statut", entente.statut], ["Observations", entente.observations]].map(([label, value]) => <div key={label} className="border-b pb-3"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-1 break-words font-medium">{shown(value)}</p></div>)}</CardContent></Card>

    <section className="grid gap-4 sm:grid-cols-2" aria-label="Résumé"><Card><CardContent className="flex items-center gap-3 p-4"><Shield className="size-5 text-primary" /><div><p className="text-2xl font-bold">{relatedClubs.length}</p><p className="text-xs text-muted-foreground">Clubs</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><Users className="size-5 text-primary" /><div><p className="text-2xl font-bold">{relatedAthletes.length}</p><p className="text-xs text-muted-foreground">Athlètes</p></div></CardContent></Card></section>

    <Card><CardHeader><CardTitle>Clubs ({relatedClubs.length})</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Club</TableHead><TableHead>Catégorie</TableHead><TableHead className="text-center">Athlètes</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader><TableBody>{relatedClubs.map((club) => <TableRow key={club.idClub}><TableCell className="font-mono text-xs">{shown(club.idClub)}</TableCell><TableCell className="font-semibold">{shown(club.nomClub)}</TableCell><TableCell>{shown(club.categorie)}</TableCell><TableCell className="text-center">{relatedAthletes.filter((athlete) => athlete.clubId === club.idClub).length}</TableCell><TableCell><Badge variant={active(club.statut) ? "default" : "secondary"}>{shown(club.statut)}</Badge></TableCell></TableRow>)}{!relatedClubs.length && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Aucun club rattaché à cette entente.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
  </div>
}
