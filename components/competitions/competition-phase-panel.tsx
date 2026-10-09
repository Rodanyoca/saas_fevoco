"use client"

import { useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"

const text = (row: SheetRow, key: string) => String(row[key] ?? "").trim()
type Props = { competitionId: string; closed: boolean; references: Record<string, Option[]>; events: SheetRow[]; phases: SheetRow[]; groups: SheetRow[]; assignments: SheetRow[]; matches: SheetRow[] }

export function CompetitionPhasePanel({ competitionId, closed, references, events, phases, groups, assignments, matches }: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<Record<string, string>>({})
  const [group, setGroup] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const [error, setError] = useState("")
  const groupPhases = phases.filter(row => text(row, "id_mode_phase") === "MPH001" && text(row, "statut") === "ACTIF")
  const label = (sheet: string, id: string) => references[sheet]?.find(item => item.id === id)?.label.replaceAll("_", " ") || id
  async function submit(event: FormEvent, kind: "phase" | "group") {
    event.preventDefault()
    if (busy.current || closed) return
    busy.current = true; setPending(true); setError("")
    try {
      const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/structure`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...(kind === "phase" ? phase : group), kind }) })
      const payload = await response.json()
      if (!response.ok) throw new Error([payload.error, ...Object.values(payload.fields ?? {})].filter(Boolean).join(" ") || "Enregistrement impossible.")
      if (kind === "phase") setPhase({}); else setGroup({})
      toast.success(kind === "phase" ? "Phase créée" : "Groupe créé"); router.refresh()
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Enregistrement impossible.") }
    finally { busy.current = false; setPending(false) }
  }
  return <div className="space-y-5">
    <p className="text-sm text-muted-foreground">Les phases sont rattachées à une épreuve. Les groupes sont réservés au mode GROUPES.</p>
    {!closed && <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Créer une phase</CardTitle></CardHeader><CardContent><form className="grid gap-3 sm:grid-cols-2" onSubmit={event => submit(event, "phase")}>
        <div className="sm:col-span-2"><Choice label="Épreuve" value={phase.id_epreuve_competition} options={events.filter(row => text(row, "statut") === "ACTIF").map(row => ({ id: text(row, "id_epreuve_competition"), label: text(row, "nom_epreuve") }))} onChange={value => setPhase({ ...phase, id_epreuve_competition: value })} /></div>
        <Choice label="Type" value={phase.id_type_phase} options={references.TYPES_PHASES ?? []} onChange={value => setPhase({ ...phase, id_type_phase: value })} />
        <Choice label="Mode" value={phase.id_mode_phase} options={references.MODES_PHASES ?? []} onChange={value => setPhase({ ...phase, id_mode_phase: value })} />
        <Label className="grid gap-2">Ordre<Input required inputMode="numeric" value={phase.numero_phase ?? ""} onChange={event => setPhase({ ...phase, numero_phase: event.target.value.replace(/\D/g, "") })} /></Label>
        <Label className="grid gap-2">Nom affiché<Input required value={phase.nom_phase ?? ""} onChange={event => setPhase({ ...phase, nom_phase: event.target.value })} /></Label>
        <Button disabled={pending || !phase.id_epreuve_competition || !phase.id_type_phase || !phase.id_mode_phase || !phase.numero_phase || !phase.nom_phase?.trim()} className="sm:col-span-2"><Plus className="size-4" />Ajouter la phase</Button>
      </form></CardContent></Card>
      <Card><CardHeader><CardTitle>Créer un groupe</CardTitle></CardHeader><CardContent><form className="grid gap-3" onSubmit={event => submit(event, "group")}>
        <Choice label="Phase de groupes" value={group.id_phase_competition} options={groupPhases.map(row => ({ id: text(row, "id_phase_competition"), label: `${events.find(item => text(item, "id_epreuve_competition") === text(row, "id_epreuve_competition"))?.nom_epreuve ?? ""} · ${text(row, "nom_phase")}` }))} onChange={value => setGroup({ ...group, id_phase_competition: value })} />
        <div className="flex gap-2"><Input aria-label="Nom du groupe" required placeholder="Ex. Groupe A" value={group.nom_groupe ?? ""} onChange={event => setGroup({ ...group, nom_groupe: event.target.value })} /><Button disabled={pending || !group.id_phase_competition || !group.nom_groupe?.trim()}><Plus className="size-4" />Ajouter</Button></div>
      </form></CardContent></Card>
    </div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {events.map(event => <section key={text(event, "id_epreuve_competition")} className="space-y-3"><h2 className="font-semibold">{text(event, "nom_epreuve")}</h2><div className="grid gap-4 md:grid-cols-2">
      {phases.filter(row => text(row, "id_epreuve_competition") === text(event, "id_epreuve_competition")).sort((a, b) => Number(a.numero_phase) - Number(b.numero_phase)).map(row => {
        const id = text(row, "id_phase_competition")
        const phaseGroups = groups.filter(group => text(group, "id_phase_competition") === id)
        const count = new Set(assignments.filter(item => text(item, "id_phase_competition") === id && text(item, "statut") === "ACTIF").map(item => text(item, "id_unite_competition"))).size
        return <Card key={id}><CardHeader><CardTitle>{text(row, "numero_phase")}. {text(row, "nom_phase")}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted-foreground">{label("TYPES_PHASES", text(row, "id_type_phase"))} · {label("MODES_PHASES", text(row, "id_mode_phase"))} · {text(row, "statut")}</p><p>{count} unité(s) · {matches.filter(match => text(match, "id_phase_competition") === id).length} match(s)</p>{text(row, "id_mode_phase") === "MPH001" ? phaseGroups.length ? <div className="flex flex-wrap gap-2">{phaseGroups.map(group => <Badge variant="outline" className="rounded-full" key={text(group, "id_groupe")}>{text(group, "nom_groupe")}{text(group, "statut") !== "ACTIF" ? " · Inactif" : ""}</Badge>)}</div> : <p className="text-amber-700">Aucun groupe configuré.</p> : <p className="text-muted-foreground">Aucun groupe requis.</p>}</CardContent></Card>
      })}
    </div>{!phases.some(row => text(row, "id_epreuve_competition") === text(event, "id_epreuve_competition")) && <p className="text-sm text-muted-foreground">Aucune phase configurée.</p>}</section>)}
    {!events.length && <p className="text-sm text-muted-foreground">Commencez par créer une épreuve.</p>}
  </div>
}

function Choice({ label, value, options, onChange }: { label: string; value?: string; options: Option[]; onChange: (value: string) => void }) {
  return <div className="grid gap-2"><Label>{label}</Label><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger aria-label={label} className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map(item => <SelectItem key={item.id} value={item.id}>{item.label.replaceAll("_", " ")}</SelectItem>)}</SelectContent></Select></div>
}
