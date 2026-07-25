"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Coach, CoachAffiliation } from "@/lib/types"

export type CoachStructureOption = { key: string; id: string; nom: string; type: string }

export function CoachAffiliationFormDialog({ coach, structures, onSaved }: {
  coach: Coach
  structures: CoachStructureOption[]
  onSaved: (affiliation: CoachAffiliation) => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    saison: "", typeAffiliation: "", structureKey: "", fonction: "",
    dateDebut: "", dateFin: "", statutAffiliation: "actif", observation: "",
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const response = await fetch(`/api/coachs/${encodeURIComponent(coach.idCoach)}/affiliations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Création impossible.")
      onSaved(result.affiliation)
      toast.success(result.message)
      setOpen(false)
      setForm({ saison: "", typeAffiliation: "", structureKey: "", fonction: "", dateDebut: "", dateFin: "", statutAffiliation: "actif", observation: "" })
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Création impossible."
      setError(message)
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">Ajouter une affiliation</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Affilier {coach.nomComplet}</DialogTitle><DialogDescription>L’identifiant est généré automatiquement selon la saison.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Saison *</Label><Input required value={form.saison} onChange={(e) => setForm({ ...form, saison: e.target.value })} placeholder="2026-2027" /></div>
            <div className="space-y-2"><Label>Type d’affiliation *</Label><Input required value={form.typeAffiliation} onChange={(e) => setForm({ ...form, typeAffiliation: e.target.value })} /></div>
            <div className="space-y-2"><Label>Structure *</Label><Select required value={form.structureKey} onValueChange={(value) => setForm({ ...form, structureKey: value })} disabled={!structures.length}><SelectTrigger><SelectValue placeholder={structures.length ? "Sélectionner une structure" : "Aucune structure disponible"} /></SelectTrigger><SelectContent>{structures.map((item) => <SelectItem key={item.key} value={item.key}>{item.nom} — {item.type}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Fonction *</Label><Input required value={form.fonction} onChange={(e) => setForm({ ...form, fonction: e.target.value })} /></div>
            <div className="space-y-2"><Label>Date de début *</Label><Input required type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} /></div>
            <div className="space-y-2"><Label>Date de fin</Label><Input type="date" min={form.dateDebut || undefined} value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} /></div>
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statutAffiliation} onValueChange={(value) => setForm({ ...form, statutAffiliation: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem><SelectItem value="en attente">En attente</SelectItem></SelectContent></Select></div>
            <div className="space-y-2 sm:col-span-2"><Label>Observation</Label><Input value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} /></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending || !structures.length}>{pending ? "Enregistrement..." : "Créer l’affiliation"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
