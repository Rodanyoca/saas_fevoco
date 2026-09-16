"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Ligue } from "@/lib/types"
import { Building2, Eye } from "lucide-react"

export function LiguesTable({ ligues, totalCount, onViewLigue, relationsReady }: { ligues: Ligue[]; totalCount: number; onViewLigue: (ligue: Ligue) => void; relationsReady: boolean }) {
  return <Card>
    <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="size-5 text-primary" />Liste des ligues</CardTitle><Badge variant="outline">{totalCount} ligue(s)</Badge></div></CardHeader>
    <CardContent>
      {!relationsReady && <p className="mb-3 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground" role="status">Les compteurs territoriaux sont temporairement indisponibles.</p>}
      <Table className="min-w-[840px]"><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Ligue</TableHead><TableHead>Province</TableHead><TableHead className="text-center">Ententes</TableHead><TableHead className="text-center">Clubs</TableHead><TableHead className="text-center">Athlètes</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{ligues.map((ligue) => <TableRow key={ligue.idLigue}><TableCell className="font-mono text-xs">{ligue.idLigue || "Non renseigné"}</TableCell><TableCell><button type="button" className="font-semibold text-primary hover:underline" onClick={() => onViewLigue(ligue)}>{ligue.nomLigue || "Non renseignée"}</button></TableCell><TableCell>{ligue.nomProvince || "Non renseignée"}</TableCell><TableCell className="text-center font-semibold">{relationsReady ? ligue.ententes ?? 0 : "—"}</TableCell><TableCell className="text-center font-semibold">{relationsReady ? ligue.clubs ?? 0 : "—"}</TableCell><TableCell className="text-center font-semibold">{relationsReady ? ligue.athletes ?? 0 : "—"}</TableCell><TableCell><Badge variant={ligue.statut === "active" ? "default" : "secondary"}>{ligue.statut || "Non renseigné"}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => onViewLigue(ligue)}><Eye /><span className="sr-only">Voir {ligue.nomLigue}</span></Button></TableCell></TableRow>)}{!ligues.length && <TableRow><TableCell colSpan={8} className="h-28 text-center text-muted-foreground">Aucune ligue ne correspond aux critères.</TableCell></TableRow>}</TableBody>
      </Table>
    </CardContent>
  </Card>
}
