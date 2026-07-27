"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ActorSexOption } from "@/lib/actor-references"
import type { Officiel } from "@/lib/types"
import { AvatarFileField, uploadAvatarFile } from "@/components/actors/avatar-file-field"

export type SavedOfficiel = Pick<Officiel, "idOfficiel" | "idNational" | "idFivb" | "nomComplet" | "sexe" | "dateDeNaissance" | "nationalite" | "telephone" | "email" | "adresse" | "statut"> & {
  avatarDriveId?: string
  avatarDriveUrl?: string
}

export function OfficielFormDialog({ officiel, sexes, onSaved }: {
  officiel?: Officiel
  sexes: ActorSexOption[]
  onSaved: (officiel: SavedOfficiel) => void
}) {
  const editing = Boolean(officiel)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    idNational: officiel?.idNational ?? "", idFivb: officiel?.idFivb ?? "",
    nomComplet: officiel?.nomComplet ?? "",
    sexe: sexes.some((option) => option.nom === officiel?.sexe) ? officiel?.sexe ?? "" : "",
    dateDeNaissance: officiel?.dateDeNaissance ?? "", nationalite: officiel?.nationalite ?? "",
    telephone: officiel?.telephone ?? "", email: officiel?.email ?? "",
    adresse: officiel?.adresse ?? "", statut: officiel?.statut || "actif",
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const response = await fetch(editing ? `/api/officiels/${encodeURIComponent(officiel!.idOfficiel)}` : "/api/officiels", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      let savedOfficiel: SavedOfficiel = result.officiel
      if (avatarFile) {
        try {
          savedOfficiel = { ...savedOfficiel, ...await uploadAvatarFile("officiel", savedOfficiel.idOfficiel, avatarFile) }
        } catch (avatarError) {
          onSaved(savedOfficiel)
          toast.warning(`${result.message} ${avatarError instanceof Error ? avatarError.message : "L’avatar n’a pas pu être enregistré."}`)
          setOpen(false); setAvatarFile(null); return
        }
      }
      onSaved(savedOfficiel)
      toast.success(result.message)
      setOpen(false); setAvatarFile(null)
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
      <DialogTrigger asChild><Button variant={editing ? "outline" : "default"}>{editing ? "Modifier l’officiel" : "Créer un officiel"}</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{editing ? "Modifier l’officiel" : "Créer un officiel"}</DialogTitle><DialogDescription>Le nom complet et le sexe sont obligatoires. L’identifiant est généré automatiquement.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={officiel!.idOfficiel} disabled /></div>}
            <div className="space-y-2"><Label>Nom complet *</Label><Input required value={form.nomComplet} onChange={(e) => setForm({ ...form, nomComplet: e.target.value })} /></div>
            <div className="space-y-2"><Label>Sexe *</Label><Select required value={form.sexe} onValueChange={(value) => setForm({ ...form, sexe: value })} disabled={!sexes.length}><SelectTrigger><SelectValue placeholder={sexes.length ? "Sélectionner le sexe" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.nom}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>ID national</Label><Input value={form.idNational} onChange={(e) => setForm({ ...form, idNational: e.target.value })} /></div>
            <div className="space-y-2"><Label>ID FIVB</Label><Input value={form.idFivb} onChange={(e) => setForm({ ...form, idFivb: e.target.value })} /></div>
            <div className="space-y-2"><Label>Date de naissance</Label><Input value={form.dateDeNaissance} onChange={(e) => setForm({ ...form, dateDeNaissance: e.target.value })} placeholder="JJ/MM/AAAA" /></div>
            <div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(e) => setForm({ ...form, nationalite: e.target.value })} /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse e-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
            <AvatarFileField editing={editing} onFileChange={setAvatarFile} />
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem></SelectContent></Select></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending}>{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer l’officiel"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
