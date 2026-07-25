"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ActorSexOption } from "@/lib/actor-references"
import type { Arbitre } from "@/lib/types"

export type SavedArbitre = Pick<Arbitre, "idArbitre" | "idNational" | "idFivb" | "nomComplet" | "sexe" | "dateDeNaissance" | "nationalite" | "niveau" | "telephone" | "email" | "adresse" | "dateAffiliation" | "statut"> & {
  avatarDriveId?: string
  avatarDriveUrl?: string
}

export function ArbitreFormDialog({ arbitre, sexes, onSaved }: {
  arbitre?: Arbitre
  sexes: ActorSexOption[]
  onSaved: (arbitre: SavedArbitre) => void
}) {
  const editing = Boolean(arbitre)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    idNational: arbitre?.idNational ?? "", idFivb: arbitre?.idFivb ?? "",
    nomComplet: arbitre?.nomComplet ?? "",
    sexe: sexes.some((option) => option.nom === arbitre?.sexe) ? arbitre?.sexe ?? "" : "",
    dateDeNaissance: arbitre?.dateDeNaissance ?? "", nationalite: arbitre?.nationalite ?? "",
    niveau: arbitre?.niveau ?? "", telephone: arbitre?.telephone ?? "",
    email: arbitre?.email ?? "", adresse: arbitre?.adresse ?? "",
    dateAffiliation: arbitre?.dateAffiliation ?? "", statut: arbitre?.statut || "actif",
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const response = await fetch(editing ? `/api/arbitres/${encodeURIComponent(arbitre!.idArbitre)}` : "/api/arbitres", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      onSaved(result.arbitre)
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
      <DialogTrigger asChild><Button variant={editing ? "outline" : "default"}>{editing ? "Modifier l’arbitre" : "Créer un arbitre"}</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{editing ? "Modifier l’arbitre" : "Créer un arbitre"}</DialogTitle><DialogDescription>Le nom et le sexe sont obligatoires. L’identifiant est généré automatiquement.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={arbitre!.idArbitre} disabled /></div>}
            <div className="space-y-2"><Label>Nom *</Label><Input required value={form.nomComplet} onChange={(e) => setForm({ ...form, nomComplet: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sexe *</Label><Select required value={form.sexe} onValueChange={(value) => setForm({ ...form, sexe: value })} disabled={!sexes.length}><SelectTrigger><SelectValue placeholder={sexes.length ? "Sélectionner le sexe" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.nom}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>ID national</Label><Input value={form.idNational} onChange={(e) => setForm({ ...form, idNational: e.target.value })} /></div>
            <div className="space-y-2"><Label>ID FIVB</Label><Input value={form.idFivb} onChange={(e) => setForm({ ...form, idFivb: e.target.value })} /></div>
            <div className="space-y-2"><Label>Date de naissance</Label><Input value={form.dateDeNaissance} onChange={(e) => setForm({ ...form, dateDeNaissance: e.target.value })} placeholder="JJ/MM/AAAA" /></div>
            <div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(e) => setForm({ ...form, nationalite: e.target.value })} /></div>
            <div className="space-y-2"><Label>Niveau</Label><Input value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })} /></div>
            <div className="space-y-2"><Label>Date d’affiliation</Label><Input value={form.dateAffiliation} onChange={(e) => setForm({ ...form, dateAffiliation: e.target.value })} placeholder="JJ/MM/AAAA" /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse e-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem></SelectContent></Select></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending}>{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer l’arbitre"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
