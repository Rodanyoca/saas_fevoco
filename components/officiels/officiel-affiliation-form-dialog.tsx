"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CoachReferenceOption } from "@/lib/actor-references"
import type { Officiel, OfficielAffiliation } from "@/lib/types"
import { cn } from "@/lib/utils"

export type OfficielStructureOption = { key: string; id: string; nom: string; type: "LIGUE" | "ENTENTE" | "CLUB" | "EQUIPE" }

export function OfficielAffiliationFormDialog({ officiel, structures, functions, onSaved }: {
  officiel: Officiel
  structures: OfficielStructureOption[]
  functions: CoachReferenceOption[]
  onSaved: (affiliation: OfficielAffiliation, deactivatedAffiliationId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [structureOpen, setStructureOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ structureType: "", structureKey: "", fonction: "", dateDebut: "", dateFin: "", statutAffiliation: "actif", observation: "" })
  const matchingStructures = structures.filter((item) => item.type === form.structureType)
  const selectedStructure = matchingStructures.find((item) => item.key === form.structureKey)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setPending(true); setError("")
    try {
      const response = await fetch(`/api/officiels/${encodeURIComponent(officiel.idOfficiel)}/affiliations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Création impossible.")
      onSaved(result.affiliation, result.deactivatedAffiliationId || "")
      toast.success(result.message); setOpen(false)
      setForm({ structureType: "", structureKey: "", fonction: "", dateDebut: "", dateFin: "", statutAffiliation: "actif", observation: "" })
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Création impossible."
      setError(message); toast.error(message)
    } finally { setPending(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">Ajouter une affiliation</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Affilier {officiel.nomComplet}</DialogTitle><DialogDescription>La dernière affiliation existante sera rendue inactive.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Type de structure *</Label><Select required value={form.structureType} onValueChange={(value) => setForm({ ...form, structureType: value, structureKey: "" })}><SelectTrigger><SelectValue placeholder="Sélectionner le type" /></SelectTrigger><SelectContent><SelectItem value="LIGUE">Ligue</SelectItem><SelectItem value="ENTENTE">Entente</SelectItem><SelectItem value="CLUB">Club</SelectItem><SelectItem value="EQUIPE">Équipe nationale</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Structure *</Label><Popover open={structureOpen} onOpenChange={setStructureOpen}><PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" disabled={!matchingStructures.length} className="w-full justify-between font-normal"><span className="truncate">{selectedStructure ? `${selectedStructure.id} — ${selectedStructure.nom}` : form.structureType ? "Rechercher par ID ou nom" : "Sélectionnez d’abord le type"}</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start"><Command><CommandInput placeholder="Rechercher un ID ou un nom..." /><CommandList><CommandEmpty>Aucune structure trouvée.</CommandEmpty><CommandGroup>{matchingStructures.map((item) => <CommandItem key={item.key} value={`${item.id} ${item.nom}`} onSelect={() => { setForm({ ...form, structureKey: item.key }); setStructureOpen(false) }}><Check className={cn("mr-2 h-4 w-4", form.structureKey === item.key ? "opacity-100" : "opacity-0")} /><span className="font-mono text-xs">{item.id}</span><span className="ml-2">{item.nom}</span></CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent></Popover></div>
            <div className="space-y-2"><Label>Fonction *</Label><Select required value={form.fonction} onValueChange={(value) => setForm({ ...form, fonction: value })} disabled={!functions.length}><SelectTrigger><SelectValue placeholder={functions.length ? "Sélectionner la fonction" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{functions.map((item) => <SelectItem key={`${item.id}:${item.nom}`} value={item.nom}>{item.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Date de début *</Label><Input required type="date" value={form.dateDebut} onChange={(event) => setForm({ ...form, dateDebut: event.target.value })} /></div>
            <div className="space-y-2"><Label>Date de fin</Label><Input type="date" min={form.dateDebut || undefined} value={form.dateFin} onChange={(event) => setForm({ ...form, dateFin: event.target.value })} /></div>
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statutAffiliation} onValueChange={(value) => setForm({ ...form, statutAffiliation: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem><SelectItem value="en attente">En attente</SelectItem></SelectContent></Select></div>
            <div className="space-y-2 sm:col-span-2"><Label>Observation</Label><Input value={form.observation} onChange={(event) => setForm({ ...form, observation: event.target.value })} /></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending || !matchingStructures.length || !functions.length}>{pending ? "Enregistrement..." : "Créer l’affiliation"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
