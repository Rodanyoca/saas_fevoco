"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BaseActorLicence, Medecin } from "@/lib/types"

export function MedecinLicenceFormDialog({ medecin, hasAffiliation, onSaved }: {
  medecin: Medecin
  hasAffiliation: boolean
  onSaved: (licence: BaseActorLicence, deactivatedLicenceId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ numeroLicence: "", dateDelivrance: "", dateFinValidite: "", statutLicence: "actif" })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const response = await fetch(`/api/medecins/${encodeURIComponent(medecin.idMedecin)}/licences`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Création impossible.")
      onSaved(result.licence, result.deactivatedLicenceId || "")
      toast.success(result.message)
      setOpen(false)
      setForm({ numeroLicence: "", dateDelivrance: "", dateFinValidite: "", statutLicence: "actif" })
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
      <DialogTrigger asChild><Button variant="outline" disabled={!hasAffiliation}>Ajouter une licence</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Créer une licence pour {medecin.nomComplet}</DialogTitle><DialogDescription>{hasAffiliation ? "La licence sera rattachée au médecin affilié." : "Créez d’abord une affiliation pour ce médecin."}</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Numéro de licence *</Label><Input required value={form.numeroLicence} onChange={(event) => setForm({ ...form, numeroLicence: event.target.value })} /></div>
            <div className="space-y-2"><Label>Date de délivrance *</Label><Input required type="date" value={form.dateDelivrance} onChange={(event) => setForm({ ...form, dateDelivrance: event.target.value })} /></div>
            <div className="space-y-2"><Label>Fin de validité *</Label><Input required type="date" min={form.dateDelivrance || undefined} value={form.dateFinValidite} onChange={(event) => setForm({ ...form, dateFinValidite: event.target.value })} /></div>
            <div className="space-y-2 sm:col-span-2"><Label>Statut</Label><Select value={form.statutLicence} onValueChange={(value) => setForm({ ...form, statutLicence: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="en attente">En attente</SelectItem><SelectItem value="inactif">Inactif</SelectItem><SelectItem value="expiré">Expiré</SelectItem></SelectContent></Select></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending || !hasAffiliation}>{pending ? "Enregistrement..." : "Créer la licence"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
