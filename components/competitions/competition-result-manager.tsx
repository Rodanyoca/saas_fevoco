"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"

const clean = (value: unknown) => String(value ?? "").trim()
export function CompetitionResultManager({ competitionId, closed, matches, results, phases, events, units, statuses, unitLabels }: { competitionId: string; closed: boolean; matches: SheetRow[]; results: SheetRow[]; phases: SheetRow[]; events: SheetRow[]; units: SheetRow[]; statuses: Option[]; unitLabels: Record<string, string> }) {
  const router = useRouter(), [pending, setPending] = useState(false), [form, setForm] = useState<Record<string, string>>({ id_statut_resultat: "STR001" })
  const completed = useMemo(() => new Set(results.map((row) => clean(row.id_match))), [results]), available = matches.filter((row) => !completed.has(clean(row.id_match)))
  const match = available.find((row) => clean(row.id_match) === form.id_match), phase = phases.find((row) => clean(row.id_phase_competition) === clean(match?.id_phase_competition)), event = events.find((row) => clean(row.id_epreuve_competition) === clean(phase?.id_epreuve_competition)), beach = clean(event?.id_discipline) === "DISC009", normal = form.id_statut_resultat === "STR001", maximum = beach ? 3 : 5
  const unitLabel = (id: string) => { const unit = units.find((row) => clean(row.id_unite_competition) === id); return unitLabels[id] || clean(unit?.id_club) || clean(unit?.id_equipe_nationale_saison) || id || "—" }
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value, ...(key === "id_match" ? Object.fromEntries(Array.from({ length: 5 }, (_, i) => [[`set_${i + 1}_a`, ""], [`set_${i + 1}_b`, ""]]).flat()) : {}) }))
  const score = Array.from({ length: maximum }, (_, index) => { const a = form[`set_${index + 1}_a`], b = form[`set_${index + 1}_b`]; return a !== undefined && a !== "" && b !== undefined && b !== "" ? `${a}–${b}` : "" }).filter(Boolean).join(", ")
  async function submit(eventSubmit: FormEvent) { eventSubmit.preventDefault(); setPending(true); try { const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/results`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Enregistrement impossible."); toast.success("Résultat enregistré"); setForm({ id_statut_resultat: "STR001" }); router.refresh() } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Enregistrement impossible.") } finally { setPending(false) } }
  if (closed || !available.length) return null
  return <Card className="w-full"><CardHeader className="pb-2"><CardTitle>Enregistrer un résultat</CardTitle></CardHeader><CardContent>
  <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
    <Choice label="Match" value={form.id_match} options={available.map((row) => ({ id: clean(row.id_match), label: `${unitLabel(clean(row.id_unite_a))} — ${unitLabel(clean(row.id_unite_b))}` }))} onChange={(value) => set("id_match", value)} /><Choice label="Statut" value={form.id_statut_resultat} options={statuses} onChange={(value) => set("id_statut_resultat", value)} />
    {match ? <div className="rounded-lg border bg-muted/30 p-3 text-sm sm:col-span-2"><p className="font-semibold">{unitLabel(clean(match.id_unite_a))} contre {unitLabel(clean(match.id_unite_b))}</p><p className="text-muted-foreground">{beach ? "Beach-volley · meilleur des 3 sets" : "Indoor · meilleur des 5 sets"}</p></div> : null}
    {normal && match ? <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-5">{Array.from({ length: maximum }, (_, index) => <div key={index} className="min-w-0 rounded-lg border bg-muted/20 p-3"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Set {index + 1}</p><div className="grid grid-cols-2 gap-2"><ScoreInput value={form[`set_${index + 1}_a`] ?? ""} onChange={(value) => set(`set_${index + 1}_a`, value)} label={unitLabel(clean(match.id_unite_a))} /><ScoreInput value={form[`set_${index + 1}_b`] ?? ""} onChange={(value) => set(`set_${index + 1}_b`, value)} label={unitLabel(clean(match.id_unite_b))} /></div></div>)}</div> : null}
    {!normal && match && form.id_statut_resultat !== "STR005" ? <Choice label="Vainqueur officiel (facultatif)" value={form.id_unite_vainqueur} options={[{ id: clean(match.id_unite_a), label: unitLabel(clean(match.id_unite_a)) }, { id: clean(match.id_unite_b), label: unitLabel(clean(match.id_unite_b)) }]} onChange={(value) => set("id_unite_vainqueur", value)} /> : null}
    {score ? <div className="rounded-lg border border-brand-gold/30 bg-brand-gold/5 p-3 text-sm sm:col-span-2"><span className="text-muted-foreground">Récapitulatif : </span>{score}</div> : null}<Field label="Observations" wide><Textarea value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} /></Field>
    <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={pending || !match} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Validation..." : "Enregistrer et recalculer"}</Button></div>
  </form></CardContent></Card>
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "min-w-0 space-y-2 sm:col-span-2" : "min-w-0 space-y-2"}><Label>{label}</Label>{children}</div> }
function Choice({ label, value, options, onChange }: { label: string; value?: string; options: Option[]; onChange: (value: string) => void }) { return <Field label={label}><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger className="w-full min-w-0"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field> }
function ScoreInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) { return <div className="space-y-1"><Label className="line-clamp-1 text-xs text-muted-foreground">{label}</Label><Input inputMode="numeric" min="0" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 3))} /></div> }
