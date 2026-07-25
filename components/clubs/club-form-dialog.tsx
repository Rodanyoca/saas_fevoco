"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Club, Entente } from "@/lib/types"
import type { ClubReferenceOption } from "@/lib/club-references"

export type SavedClub = Pick<Club, "idClub" | "codeClub" | "nomClub" | "categorie" | "version" | "dateAffiliationClub" | "idEntente" | "nomEntente" | "pseudoEntente" | "idLigue" | "nomLigue" | "statut" | "observations"> & {
  previousIdClub?: string
}

export function ClubFormDialog({ club, ententes, categories, versions, onSaved }: {
  club?: Club
  ententes: Entente[]
  categories: ClubReferenceOption[]
  versions: ClubReferenceOption[]
  onSaved: (club: SavedClub) => void
}) {
  const editing = Boolean(club)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    codeClub: club?.codeClub ?? "",
    nomClub: club?.nomClub ?? "",
    categorie: categories.some((option) => option.nom === club?.categorie) ? club?.categorie ?? "" : "",
    version: versions.some((option) => option.nom === club?.version) ? club?.version ?? "" : "",
    dateAffiliationClub: club?.dateAffiliationClub ?? "",
    idEntente: club?.idEntente ?? "",
    statut: club?.statut || "actif",
    observations: club?.observations ?? "",
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const response = await fetch(editing ? `/api/clubs/${encodeURIComponent(club!.idClub)}` : "/api/clubs", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      onSaved(result.club)
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
      <DialogTrigger asChild>
        <Button variant={editing ? "outline" : "default"}>{editing ? "Modifier le club" : "Créer un club"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier le club" : "Créer un club"}</DialogTitle>
          <DialogDescription>
            {editing ? "Modifiez uniquement les informations générales du club." : "L’identifiant sera généré avec l’identifiant de l’entente et le code du club."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={club!.idClub} disabled /></div>}
            <div className="space-y-2"><Label>Code du club *</Label><Input required disabled={editing} value={form.codeClub} onChange={(event) => setForm({ ...form, codeClub: event.target.value })} placeholder="Ex. 01" /></div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Entente *</Label>
              <Select required value={form.idEntente} onValueChange={(value) => setForm({ ...form, idEntente: value })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une entente" /></SelectTrigger>
                <SelectContent>{ententes.map((entente) => <SelectItem key={entente.idEntente} value={entente.idEntente}>{entente.nomEntente || entente.pseudoEntente}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2"><Label>Nom du club *</Label><Input required value={form.nomClub} onChange={(event) => setForm({ ...form, nomClub: event.target.value })} /></div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={form.categorie} onValueChange={(value) => setForm({ ...form, categorie: value })} disabled={categories.length === 0}>
                <SelectTrigger><SelectValue placeholder={categories.length ? "Sélectionner une catégorie" : "Référentiel non configuré"} /></SelectTrigger>
                <SelectContent>{categories.map((option) => <SelectItem key={option.id} value={option.nom}>{option.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Version</Label>
              <Select value={form.version} onValueChange={(value) => setForm({ ...form, version: value })} disabled={versions.length === 0}>
                <SelectTrigger><SelectValue placeholder={versions.length ? "Sélectionner une version" : "Référentiel non configuré"} /></SelectTrigger>
                <SelectContent>{versions.map((option) => <SelectItem key={option.id} value={option.nom}>{option.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Date d’affiliation</Label><Input value={form.dateAffiliationClub} onChange={(event) => setForm({ ...form, dateAffiliationClub: event.target.value })} placeholder="JJ/MM/AAAA" /></div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2"><Label>Observations</Label><Textarea value={form.observations} onChange={(event) => setForm({ ...form, observations: event.target.value })} /></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" disabled={pending}>{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer le club"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
