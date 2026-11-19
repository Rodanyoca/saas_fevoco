"use client"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import type { RecordTarget, Dependency, ActorFamily } from "@/lib/record-management-model"

const url = (target: RecordTarget) => "/api/actors/records?" + new URLSearchParams(target)
export const licenceFamily = (type: string): ActorFamily => ({ TAC001: "athlete", TAC002: "coach", TAC003: "officiel", TAC004: "arbitre", TAC005: "medecin" } as Record<string, ActorFamily>)[type] || "autre"
export function useRecordVersion(entity: RecordTarget["entity"], family: ActorFamily, id: string, open: boolean) {
  const [version, setVersion] = useState(""), [error, setError] = useState("")
  useEffect(() => {
    setVersion(""); setError("")
    if (!open || !id) return
    const controller = new AbortController()
    fetch(url({ entity, family, id }) + "&check=version", { cache: "no-store", signal: controller.signal }).then(async response => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Vérification indisponible.")
      if (!controller.signal.aborted) setVersion(result.version)
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Vérification indisponible.") })
    return () => controller.abort()
  }, [entity, family, id, open])
  return { version, error }
}
export function DeleteRecordButton({ entity, family, id, label, onDeleted, iconOnly = false }: RecordTarget & { label: string; onDeleted?: () => void; iconOnly?: boolean }) {
  const router = useRouter(), [open, setOpen] = useState(false), [pending, setPending] = useState(false), [error, setError] = useState("")
  const [preview, setPreview] = useState<{ version: string; label: string; blocked: boolean; operationError: string; dependencies: Dependency[] } | null>(null)
  const [uncertain, setUncertain] = useState(false), guard = useRef(false), operation = useRef("")
  useEffect(() => {
    if (!open || uncertain) return
    const controller = new AbortController()
    setPreview(null); setError(""); operation.current = crypto.randomUUID()
    fetch(url({ entity, family, id }), { cache: "no-store", signal: controller.signal }).then(async response => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Contrôle indisponible.")
      if (!controller.signal.aborted) setPreview(result)
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Contrôle indisponible.") })
    return () => controller.abort()
  }, [open, entity, family, id, uncertain])
  async function remove() {
    if (guard.current || !preview || preview.blocked) return
    guard.current = true; setPending(true); setError("")
    try {
      const response = await fetch("/api/actors/records", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, family, id, version: preview.version, operation: operation.current }) }).catch(() => { setUncertain(true); throw new Error("La réponse n'a pas été reçue. Vérifiez cette même tentative.") })
      const result = await response.json().catch(() => { setUncertain(true); throw new Error("La réponse est illisible. Vérifiez cette même tentative.") })
      if (!response.ok) { setUncertain(Boolean(result.uncertain) || response.status >= 500); if (result.dependencies?.length) setPreview({ ...preview, blocked: true, dependencies: result.dependencies }); throw new Error(result.message || "Suppression refusée.") }
      if (!result.deleted) throw new Error("La suppression n'est pas confirmée.")
      setUncertain(false); setOpen(false); toast.success(result.message)
      window.dispatchEvent(new CustomEvent("fevoco:record-deleted", { detail: { entity, family, id } }))
      onDeleted?.(); router.refresh()
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Résultat non confirmé : vérifiez la même tentative."); if (!(reason instanceof Error)) setUncertain(true) }
    finally { guard.current = false; setPending(false) }
  }
  return <><Button type="button" variant={iconOnly ? "ghost" : "outline"} size={iconOnly ? "icon-sm" : "sm"} className={iconOnly ? "text-destructive hover:bg-destructive/10 hover:text-destructive" : "text-destructive"} aria-label={`Supprimer ${label}`} title={iconOnly ? `Supprimer ${label}` : undefined} onClick={() => setOpen(true)}><Trash2 className="size-4" />{iconOnly ? <span className="sr-only">Supprimer</span> : "Supprimer"}</Button>
    <AlertDialog open={open} onOpenChange={next => { if (!pending && !uncertain) setOpen(next) }}><AlertDialogContent className="max-h-[90dvh] overflow-y-auto">
      <AlertDialogHeader><AlertDialogTitle>Supprimer définitivement</AlertDialogTitle><AlertDialogDescription>{preview?.label || label} · {entity === "actor" ? "Fiche acteur" : entity === "affiliation" ? "Affiliation" : "Licence"}. La ligne métier sera retirée. Aucun autre enregistrement ni fichier Drive ne sera supprimé. Les réservations restent conservées.</AlertDialogDescription></AlertDialogHeader>
      {!preview && !error && <p role="status">Vérification des dépendances…</p>}
      {preview?.dependencies.length ? <div role="alert" className="space-y-2 text-sm"><p>Suppression bloquée par :</p><ul className="list-disc pl-5">{preview.dependencies.map(item => <li key={`${item.book}:${item.table}`}>{item.table} : {item.count} référence(s){item.href && <> · <a className="underline" href={item.href}>Ouvrir</a></>}</li>)}</ul></div> : null}
      {preview?.operationError && <p role="alert">{preview.operationError}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {uncertain && <p role="status" className="text-sm">Conservez cette tentative pour vérifier son résultat avant toute autre suppression.</p>}
      <AlertDialogFooter><AlertDialogCancel disabled={pending || uncertain}>Annuler</AlertDialogCancel><Button variant="destructive" type="button" disabled={pending || !preview || preview.blocked} onClick={() => void remove()}>{pending ? "Vérification…" : uncertain ? "Vérifier cette suppression" : "Supprimer définitivement"}</Button></AlertDialogFooter>
    </AlertDialogContent></AlertDialog></>
}
