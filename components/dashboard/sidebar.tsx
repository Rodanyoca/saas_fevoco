"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { ElementType } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  UserCheck,
  Flag,
  Shield,
  Stethoscope,
  ClipboardCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Network,
  Trophy,
  UserCog,
  ArrowRightLeft,
} from "lucide-react"
import { useState } from "react"

const mainNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
]

const groupedNavigation = [
  {
    name: "Structure territoriale",
    icon: Building2,
    items: [
      { name: "Ligues", href: "/ligues", icon: Building2 },
      { name: "Ententes", href: "/ententes", icon: Network },
      { name: "Clubs", href: "/clubs", icon: Shield },
    ],
  },
  {
    name: "Acteurs",
    icon: Users,
    items: [
      { name: "Athletes", href: "/athletes", icon: Users },
      { name: "Coachs", href: "/coachs", icon: UserCheck },
      { name: "Medecins", href: "/medecins", icon: Stethoscope },
      { name: "Arbitres", href: "/arbitres", icon: Flag },
      { name: "Officiels", href: "/officiels", icon: UserCog },
    ],
  },
]

const secondaryNavigation = [
  { name: "Competitions", href: "/competitions", icon: Trophy },
  { name: "Transferts", href: "/transferts", icon: ArrowRightLeft },
  { name: "Qualite donnees", href: "/qualite", icon: ClipboardCheck },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Structure territoriale": true,
    Acteurs: true,
  })

  const renderLink = (item: { name: string; href: string; icon: ElementType }, nested = false) => {
    const isActive = pathname === item.href

    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md text-sm font-medium transition-colors",
          nested && !collapsed ? "px-3 py-2 pl-9" : "px-3 py-2.5",
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
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
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
        {mainNavigation.map((item) => renderLink(item))}

        {groupedNavigation.map((group) => {
          const isGroupActive = group.items.some((item) => pathname === item.href)
          const isOpen = openGroups[group.name] || isGroupActive

          if (collapsed) {
            return (
              <div key={group.name} className="space-y-1">
                {group.items.map((item) => renderLink(item))}
              </div>
            )
          }

          return (
            <div key={group.name} className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (!collapsed) {
                    setOpenGroups((current) => ({
                      ...current,
                      [group.name]: !current[group.name],
                    }))
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isGroupActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? group.name : undefined}
                aria-expanded={isOpen}
              >
                <group.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{group.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition-transform",
                        isOpen ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </>
                )}
              </button>

              {!collapsed && isOpen && (
                <div className="space-y-1">
                  {group.items.map((item) => renderLink(item, true))}
                </div>
              )}
            </div>
          )
        })}

        {secondaryNavigation.map((item) => renderLink(item))}
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
