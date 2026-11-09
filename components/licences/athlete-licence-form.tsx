"use client"
import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AthleteLicenceEditor, type LicenceReferences } from "./athlete-licence-editor"

// Legacy entry point uses the same protected sports editor; no manual-number fallback.
export function AthleteLicenceForm(props: LicenceReferences & { onSaved: () => void }) {
 const [open,setOpen] = useState(false)
 return <><Button onClick={()=>setOpen(true)} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90"><Plus />Enregistrer une licence</Button><AthleteLicenceEditor open={open} onOpenChange={setOpen} references={props} rows={[]} editing={null} readOnly={false} mode="ATHLETE" initialSeason={props.seasons[0]?.id || ""} onSaved={props.onSaved} /></>
}
