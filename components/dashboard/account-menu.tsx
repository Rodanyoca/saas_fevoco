"use client"
import { useState } from "react"
import { LogOut } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
export function AccountMenu() {
  const [busy, setBusy] = useState(false), [error, setError] = useState("")
  async function logout() {
    if (busy) return
    setBusy(true);setError("")
    try {
      const response = await apiFetch("/api/auth/logout", { method: "POST" })
      if (!response.ok) throw new Error()
      window.location.replace("/login")
    } catch { setError("Déconnexion impossible. Réessayez.");setBusy(false) }
  }
  return <div className="flex shrink-0 items-center gap-2">
    <button type="button" onClick={logout} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-brand-gold bg-brand-gold px-3 text-sm font-semibold text-[#071c32] transition-colors hover:bg-brand-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50" aria-label="Se déconnecter"><LogOut className="size-4" /><span className="hidden sm:inline">{busy ? "Déconnexion…" : "Déconnexion"}</span></button>
    {error && <p role="alert" className="max-w-40 text-xs text-destructive">{error}</p>}
  </div>
}
