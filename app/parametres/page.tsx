import { getUnavailableModule } from "@/lib/module-availability"
import { ComingSoonPage } from "@/components/dashboard/coming-soon-page"
import { Header } from "@/components/dashboard/header"
import { SettingsClient } from "@/components/settings/settings-client"
import { loadSettings } from "@/lib/settings"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export default async function ParametresPage() {
  const unavailable = getUnavailableModule("/parametres")
  if (unavailable) return <ComingSoonPage {...unavailable} />
 const data = await loadSettings(); return <><Header title="Paramètres" subtitle="Gérez votre profil et les paramètres généraux du système." /><main className="p-4 sm:p-6"><SettingsClient {...data} /></main></> }
