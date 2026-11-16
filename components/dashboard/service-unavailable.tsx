"use client"

import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "./header"

export function ServiceUnavailable({ retry, description = "Le service est momentanément indisponible. Réessayez dans quelques instants." }: {
  retry?: () => void
  description?: string
}) {
  return <><Header title="Service indisponible" /><main className="grid min-h-[calc(100dvh-4rem)] w-full place-items-center bg-background p-4 sm:p-6">
    <Card role="alert" aria-labelledby="system-unavailable-title" className="w-full max-w-md border-border/80">
      <CardHeader className="text-center">
        <AlertTriangle aria-hidden="true" className="mx-auto mb-2 size-10 text-brand-gold" />
        <CardTitle id="system-unavailable-title">Service momentanément indisponible</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {retry ? <Button onClick={retry} className="bg-brand-gold text-[#071c32] hover:bg-brand-gold/90"><RefreshCw aria-hidden="true" className="size-4" />Réessayer</Button> : <Button asChild className="bg-brand-gold text-[#071c32] hover:bg-brand-gold/90"><Link href="/" prefetch={false}><RefreshCw aria-hidden="true" className="size-4" />Réessayer</Link></Button>}
      </CardContent>
    </Card>
  </main></>
}
