"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Users,
  UserCheck,
  Flag,
  Shield,
  Stethoscope,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Network,
  UserCog,
} from "lucide-react"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Provinces", href: "/provinces", icon: MapPin },
  { name: "Ligues", href: "/ligues", icon: Building2 },
  { name: "Ententes", href: "/ententes", icon: Network },
  { name: "Clubs", href: "/clubs", icon: Shield },
  { name: "Athletes", href: "/athletes", icon: Users },
  { name: "Coachs", href: "/coachs", icon: UserCheck },
  { name: "Arbitres", href: "/arbitres", icon: Flag },
  { name: "Medecins", href: "/medecins", icon: Stethoscope },
  { name: "Officiels", href: "/officiels", icon: UserCog },
  { name: "Qualite donnees", href: "/qualite", icon: ClipboardCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header avec logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <Image
          src="/logo-fevoco.png"
          alt="FEVOCO"
          width={40}
          height={40}
          className="flex-shrink-0"
        />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-wide text-sidebar-foreground">FEVOCO</span>
            <span className="text-[10px] text-sidebar-foreground/70 truncate">
              Federation de Volleyball du Congo
            </span>
          </div>
        )}
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Signature DS Concept */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed ? (
          <p className="text-[10px] text-sidebar-foreground/50 text-center">
            Propulse par <span className="font-semibold">DS Concept</span>
          </p>
        ) : (
          <p className="text-[8px] text-sidebar-foreground/50 text-center">DS</p>
        )}
      </div>

      {/* Toggle collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-20 -right-3 bg-sidebar border border-sidebar-border rounded-full p-1 hover:bg-sidebar-accent transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
        )}
      </button>
    </aside>
  )
}
