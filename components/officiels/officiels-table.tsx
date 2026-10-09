"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge } from "@/lib/date-utils"
import { activeActorLicenceNumbers } from "@/lib/active-actor-licences"
import { normalize } from "@/lib/sheet-values"
import type { BaseActorLicence, Officiel } from "@/lib/types"

const shown = (value: unknown) => String(value ?? "").trim() || "-"
const initials = (name: string) => { const parts = name.trim().split(/\s+/).filter(Boolean); return parts.length ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase() : "OF" }
const sex = (value: string) => { const v = normalize(value); return v === "M" || v === "MASCULIN" ? "M" : v === "F" || v === "FEMININ" ? "F" : "-" }

export function OfficielsTable({ officiels, licences, onViewOfficiel }: { officiels: Officiel[]; licences: BaseActorLicence[]; onViewOfficiel: (item: Officiel) => void }) {
  const activeLicenceNumbers = useMemo(() => activeActorLicenceNumbers(licences,
    new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kinshasa", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())), [licences])
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(officiels.length / pageSize))
  useEffect(() => setPage(1), [officiels, pageSize])
  const rows = useMemo(() => officiels.slice((page - 1) * pageSize, page * pageSize), [officiels, page, pageSize])

  const identity = (item: Officiel) => {
    const avatar = getActorAvatarUrl(item.avatarDriveUrl, item.avatarDriveId)
    return <div className="flex min-w-0 items-center gap-3"><Avatar className="size-10 shrink-0"><AvatarImage src={avatar || undefined} alt={item.nomComplet || "Avatar"} /><AvatarFallback className="text-xs">{initials(item.nomComplet)}</AvatarFallback></Avatar><span className="min-w-0 whitespace-normal break-words font-medium leading-snug">{shown(item.nomComplet)}</span></div>
  }
  const sexAge = (item: Officiel) => { const age = calculateAge(item.dateDeNaissance); return <div className="space-y-1"><span className="block">{sex(item.sexe)}</span><span className="block text-xs text-muted-foreground">{age === null ? "-" : `${age} ans`}</span></div> }

  return <section className="space-y-4" aria-label="Liste des officiels">
    <h2 className="sr-only">Liste des officiels</h2>
    <div className="grid gap-3 md:hidden">{rows.map(item => <article key={item.idOfficiel} className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3">{identity(item)}<StatusBadge status={item.statut} /></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div className="col-span-2"><p className="text-xs text-muted-foreground">Licence</p><p className="break-all font-mono">{shown(activeLicenceNumbers.get(item.idOfficiel))}</p></div><div><p className="text-xs text-muted-foreground">Sexe / Âge</p>{sexAge(item)}</div><div><p className="text-xs text-muted-foreground">ID national</p><p className="break-all font-mono text-xs">{shown(item.idNational)}</p></div><div><p className="text-xs text-muted-foreground">ID FIVB</p><p className="break-all font-mono text-xs">{shown(item.idFivb)}</p></div></div><div className="mt-3 flex justify-end"><Button variant="ghost" size="icon" onClick={() => onViewOfficiel(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button></div></article>)}{!rows.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun officiel enregistré.</p>}</div>
    <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(1,10,20,0.12)] md:block"><Table className="min-w-[980px] table-fixed"><TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead className="w-[11%]">Licence</TableHead><TableHead className="w-[27%]">Nom complet</TableHead><TableHead className="w-[12%]">Sexe / Âge</TableHead><TableHead className="w-[16%]">ID national</TableHead><TableHead className="w-[15%]">ID FIVB</TableHead><TableHead className="w-[10%]">Statut</TableHead><TableHead className="w-[9%] text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map(item => <TableRow key={item.idOfficiel} className="hover:bg-muted/30"><TableCell className="break-all font-mono">{shown(activeLicenceNumbers.get(item.idOfficiel))}</TableCell><TableCell>{identity(item)}</TableCell><TableCell>{sexAge(item)}</TableCell><TableCell className="whitespace-nowrap font-mono text-xs">{shown(item.idNational)}</TableCell><TableCell className="whitespace-nowrap font-mono text-xs">{shown(item.idFivb)}</TableCell><TableCell><StatusBadge status={item.statut} /></TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => onViewOfficiel(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button></TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Aucun officiel enregistré.</TableCell></TableRow>}</TableBody></Table></div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Afficher</span><Select value={String(pageSize)} onValueChange={value => { setPageSize(Number(value)); setPage(1) }}><SelectTrigger className="w-[70px]" aria-label="Nombre de lignes"><SelectValue /></SelectTrigger><SelectContent>{[10, 25, 50, 100].map(size => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}</SelectContent></Select><span>sur {officiels.length} résultat{officiels.length > 1 ? "s" : ""}</span></div>
      <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(value => value - 1)} aria-label="Page précédente"><ChevronLeft className="size-4" /></Button><span className="text-sm text-muted-foreground">Page {page} sur {pageCount}</span><Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(value => value + 1)} aria-label="Page suivante"><ChevronRight className="size-4" /></Button></div>
    </div>
  </section>
}
