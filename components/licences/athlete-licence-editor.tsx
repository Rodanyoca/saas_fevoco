"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { DeleteRecordButton } from "@/components/actors/record-management"
import type { AthleteLicence } from "@/lib/types"
export function AthleteLicenceActions({ licence }: { licence: AthleteLicence }) {
  const router = useRouter(), [open, setOpen] = useState(false), [status, setStatus] = useState(licence.idStatutLicence || ""), [notes, setNotes] = useState("")
  const [options, setOptions] = useState<Array<{id:string;label:string}>>([]), [error, setError] = useState(""), [saving, setSaving] = useState(false), [uncertain, setUncertain] = useState(false)
  const [version, setVersion] = useState(""), [deliveryDate, setDeliveryDate] = useState(licence.dateDelivrance)
  const guard = useRef(false), submitted = useRef<string | null>(null)
  useEffect(() => {
    if (!open) return
    setVersion(""); setOptions([])
    const controller = new AbortController()
    fetch("/api/licences/athletes?edit=" + encodeURIComponent(licence.idLicence), {signal:controller.signal,cache:"no-store"}).then(async response => {const data = await response.json(); if (!response.ok) throw new Error(data.message); if (!controller.signal.aborted) {setVersion(data.version);setDeliveryDate(data.date);setOptions(data.statuses);setNotes(data.observations || "");setStatus(data.status)} }).catch(failure => {if (!controller.signal.aborted) setError(failure.message)})
    return () => controller.abort()
  }, [open, licence.idLicence])
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (guard.current || !version) return
    guard.current = true; setSaving(true); setError("")
    submitted.current ||= JSON.stringify({id:licence.idLicence,date_delivrance:deliveryDate,id_statut_licence:status,observations:notes,idempotency_key:crypto.randomUUID()})
    try {
      const response = await fetch("/api/licences/athletes", {method:"PUT",headers:{"Content-Type":"application/json","If-Match":version},body:submitted.current}), result = await response.json()
      if (!response.ok) {setUncertain(Boolean(result.uncertain) || response.status >= 500); if (!result.uncertain && response.status < 500) submitted.current = null; setError(result.message || "Modification non confirmée."); return}
      setUncertain(false);setOpen(false);toast.success("Licence modifiée.");router.refresh()
    } catch (failure) {setUncertain(true);setError(failure instanceof Error ? failure.message : "Résultat non confirmé.")} finally {guard.current=false;setSaving(false)}
  }
  return <><div className="flex gap-1"><Button variant="ghost" size="icon-sm" aria-label={`Modifier la licence ${licence.numeroLicence}`} onClick={() => {setError("");submitted.current=null;setOpen(true)}}><Pencil /></Button><DeleteRecordButton entity="licence" family="athlete" id={licence.idLicence} label={`${licence.numeroLicence} ${licence.saison}`} iconOnly /></div><Sheet open={open} onOpenChange={value => {if (!saving && !uncertain) setOpen(value)}}><SheetContent className="w-full overflow-y-auto sm:max-w-lg"><form onSubmit={submit}><SheetHeader><SheetTitle>Modifier la licence {licence.numeroLicence}</SheetTitle><SheetDescription>{licence.saison} · {licence.nomClub}. Le propriétaire, l’affiliation, le numéro et la date de délivrance restent inchangés.</SheetDescription></SheetHeader><fieldset disabled={saving || uncertain} className="space-y-4 p-4"><Label htmlFor={`lic-status-${licence.idLicence}`}>Statut</Label><Select value={status} onValueChange={setStatus}><SelectTrigger id={`lic-status-${licence.idLicence}`}><SelectValue /></SelectTrigger><SelectContent>{options.map(item => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select><Label htmlFor={`lic-notes-${licence.idLicence}`}>Observations</Label><Textarea id={`lic-notes-${licence.idLicence}`} value={notes} onChange={event => setNotes(event.target.value)} /></fieldset>{error && <p role="alert" className="px-4 text-sm text-destructive">{error}</p>}<SheetFooter><Button type="button" variant="outline" disabled={saving || uncertain} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={saving || !options.length || !version}>{saving ? "Enregistrement…" : uncertain ? "Reprendre" : "Enregistrer"}</Button></SheetFooter></form></SheetContent></Sheet></>
}
