"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditEntenteDialog, type SavedEntente } from "@/components/ententes/entente-form-dialog"
import type { Entente, Ligue } from "@/lib/types"
import { Eye, Network } from "lucide-react"

export function EntentesTable({ ententes, ligues, totalCount, onSaved, onView }: { ententes: Entente[]; ligues: Ligue[]; totalCount: number; onSaved: (entente: SavedEntente) => void; onView: (entente: Entente) => void }) {
  return <Card>
    <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2 text-lg"><Network className="size-5 text-primary" />Liste des ententes</CardTitle><Badge variant="outline">{totalCount} entente(s)</Badge></div></CardHeader>
    <CardContent><Table className="min-w-[860px]"><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Entente</TableHead><TableHead>Pseudo</TableHead><TableHead>Ligue</TableHead><TableHead>Adresse e-mail</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
      <TableBody>{ententes.map((entente) => <TableRow key={entente.idEntente}><TableCell className="font-mono text-xs text-muted-foreground">{entente.idEntente || "Non renseigné"}</TableCell><TableCell><button type="button" className="font-semibold text-primary hover:underline" onClick={() => onView(entente)}>{entente.nomEntente || "Non renseignée"}</button></TableCell><TableCell>{entente.pseudoEntente || "Non renseigné"}</TableCell><TableCell>{entente.nomLigue || "Non renseignée"}</TableCell><TableCell>{entente.emailEntente || "Non renseignée"}</TableCell><TableCell><Badge variant={entente.statut === "active" ? "default" : "secondary"}>{entente.statut || "Non renseigné"}</Badge></TableCell><TableCell className="text-right"><div className="flex justify-end gap-1"><Button type="button" size="icon" variant="ghost" onClick={() => onView(entente)}><Eye /><span className="sr-only">Voir {entente.nomEntente}</span></Button><EditEntenteDialog entente={entente} ligues={ligues} onSaved={onSaved} /></div></TableCell></TableRow>)}{!ententes.length && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Aucune donnée disponible.</TableCell></TableRow>}</TableBody>
    </Table></CardContent>
  </Card>
}
