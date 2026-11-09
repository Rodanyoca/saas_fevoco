"use client"

import { useId } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchSelect } from "@/components/ui/search-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { LigueContactDraft, LigueContactEditorData } from "@/lib/ligue-contact-editor-model"

export function LigueResponsablesFields({ data, onChange, disabled }: {
  data: LigueContactEditorData; onChange: (contacts: LigueContactDraft[]) => void; disabled: boolean
}) {
  const prefix = useId()
  const change = (index: number, patch: Partial<LigueContactDraft>) => onChange(data.contacts.map((row, i) => i === index ? { ...row, ...patch } : row))
  return <fieldset disabled={disabled} className="space-y-4 border-t pt-5">
    <legend className="px-1 font-semibold">Responsables</legend>
    <p className="text-sm text-muted-foreground">Choisissez les personnes dans le référentiel Acteurs. Leurs coordonnées restent en lecture seule. Retirer une désignation existante la désactive lors de l’enregistrement.</p>
    {data.contacts.length === 0 && <p className="text-sm text-muted-foreground">Aucun responsable désigné.</p>}
    {data.contacts.map((contact, index) => {
      const actors = data.actorsByType[contact.idTypeActeur] ?? []
      const actor = actors.find(item => item.id === contact.idActeur)
      const options = actors.map(item => ({ id: item.id, label: item.nomComplet }))
      if (contact.idActeur && !actor) options.unshift({ id: contact.idActeur, label: `Référence introuvable (${contact.idActeur})` })
      const fieldId = `${prefix}-${index}`
      return <div key={contact.id || contact.clientKey} className="space-y-4 rounded-xl border border-border/80 p-4">
        <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">Responsable {index + 1}</h3><Button type="button" variant="ghost" size="icon" disabled={disabled} aria-label={`Retirer le responsable ${index + 1}`} onClick={() => onChange(data.contacts.filter((_, i) => i !== index))}><Trash2 className="size-4" /></Button></div>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-type`}>Catégorie d’acteur *</Label><Select disabled={disabled} value={contact.idTypeActeur} onValueChange={idTypeActeur => change(index, { idTypeActeur, idActeur: "" })}><SelectTrigger id={`${fieldId}-type`}><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger><SelectContent>{contact.idTypeActeur && !data.types.some(type => type.id === contact.idTypeActeur) && <SelectItem value={contact.idTypeActeur}>Type introuvable ({contact.idTypeActeur})</SelectItem>}{data.types.map(type => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-actor`}>Personne *</Label><SearchSelect id={`${fieldId}-actor`} disabled={disabled || !contact.idTypeActeur} value={contact.idActeur} onValueChange={idActeur => change(index, { idActeur })} options={options} placeholder="Rechercher une personne…" /></div>
        {contact.idActeur && !actor && <p className="text-sm text-destructive" role="status">Fiche acteur introuvable : {contact.idTypeActeur} / {contact.idActeur}. Sélectionnez une autre personne ou désactivez la désignation.</p>}
        <div className="space-y-2"><Label htmlFor={`${fieldId}-role`}>Fonction auprès de la ligue *</Label><Input id={`${fieldId}-role`} required maxLength={200} value={contact.fonction} onChange={event => change(index, { fonction: event.target.value })} /></div>
        <dl className="space-y-2 text-sm"><div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">Téléphone</dt><dd className="break-all text-right">{actor?.telephone || "Non renseigné"}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">E-mail</dt><dd className="break-all text-right">{actor?.email || "Non renseigné"}</dd></div></dl>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-status`}>Statut</Label><Select disabled={disabled} value={contact.statut} onValueChange={(statut: "ACTIF" | "INACTIF") => change(index, { statut, ...(statut === "INACTIF" ? { principal: false } : {}) })}><SelectTrigger id={`${fieldId}-status`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div>
        <div className="flex items-center gap-2"><Checkbox id={`${fieldId}-principal`} disabled={disabled || contact.statut !== "ACTIF"} checked={contact.principal} onCheckedChange={checked => onChange(data.contacts.map((row, i) => ({ ...row, principal: i === index ? checked === true : checked === true ? false : row.principal })))} /><Label htmlFor={`${fieldId}-principal`}>Contact principal</Label></div>
        <div className="space-y-2"><Label htmlFor={`${fieldId}-observation`}>Observation</Label><Textarea id={`${fieldId}-observation`} value={contact.observation} onChange={event => change(index, { observation: event.target.value })} /></div>
      </div>
    })}
    <Button type="button" variant="outline" disabled={disabled} onClick={() => onChange([...data.contacts, { id: "", clientKey: crypto.randomUUID(), idTypeActeur: "", idActeur: "", fonction: "", principal: false, statut: "ACTIF", observation: "" }])}><Plus className="size-4" />Ajouter un responsable</Button>
  </fieldset>
}
