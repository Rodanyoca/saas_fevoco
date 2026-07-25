"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Ligue, Province } from "@/lib/types"

export type SavedLigue = Pick<Ligue, "idLigue" | "nomLigue" | "emailLigue" | "idProvince" | "nomProvince" | "statut" | "observations">

export function LigueFormDialog({ provinces, ligue, onSaved }: {
  provinces: Province[]
  ligue?: Ligue
  onSaved: (ligue: SavedLigue) => void
}) {
  const editing = Boolean(ligue)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nomLigue: ligue?.nomLigue ?? "",
    emailLigue: ligue?.emailLigue ?? "",
    idProvince: ligue?.idProvince ?? "",
    statut: ligue?.statut || "active",
    observations: ligue?.observations ?? "",
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setPending(true)
    try {
      const response = await fetch(editing ? `/api/ligues/${encodeURIComponent(ligue!.idLigue)}` : "/api/ligues", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      onSaved(result.ligue)
      toast.success(result.message)
      setOpen(false)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Enregistrement impossible."
      setError(message)
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant={editing ? "outline" : "default"}>{editing ? "Modifier la ligue" : "Créer une ligue"}</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier la ligue" : "Créer une ligue"}</DialogTitle>
          <DialogDescription>{editing ? `Mettez à jour les informations de ${ligue?.nomLigue || "la ligue sélectionnée"}.` : "L’identifiant sera généré automatiquement côté serveur."}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={ligue?.idLigue ?? ""} disabled /></div>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="nom-ligue">Nom de la ligue *</Label><Input id="nom-ligue" required value={form.nomLigue} onChange={(event) => setForm({ ...form, nomLigue: event.target.value })} /></div>
            <div className="space-y-2"><Label>Province *</Label><Select required value={form.idProvince} onValueChange={(value) => setForm({ ...form, idProvince: value })}><SelectTrigger><SelectValue placeholder="Sélectionner une province" /></SelectTrigger><SelectContent>{provinces.map((province) => <SelectItem key={province.idProvince} value={province.idProvince}>{province.nomProvince}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="email-ligue">Adresse e-mail</Label><Input id="email-ligue" type="email" value={form.emailLigue} onChange={(event) => setForm({ ...form, emailLigue: event.target.value })} /></div>
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="observations-ligue">Observations</Label><Textarea id="observations-ligue" value={form.observations} onChange={(event) => setForm({ ...form, observations: event.target.value })} /></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={pending}>{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer la ligue"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
