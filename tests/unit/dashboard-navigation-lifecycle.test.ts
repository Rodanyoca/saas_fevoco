import test from "node:test"
import type { ElementType } from "react"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { runInNewContext } from "node:vm"

const require = createRequire(import.meta.url)
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")
const ts = require("typescript")
const path = "../../components/dashboard/dashboard-layout.tsx"
const source = readFileSync(new URL(path, import.meta.url), "utf8")
const items = [{ name: "Athlètes", href: "/athletes", icon: "athlete" }]

function loadLayout(pathname = "/athletes") {
  const navigationContext = React.createContext(null)
  const container = ({ children }: { children: unknown }) => React.createElement("div", null, children)
  const modules: Record<string, unknown> = {
    react: React,
    "react/jsx-runtime": require("react/jsx-runtime"),
    "next/navigation": { usePathname: () => pathname },
    "@/lib/auth/navigation-access": require("../../lib/auth/navigation-access.ts"),
    "@/lib/navigation": require("../../lib/navigation.ts"),
    "@/lib/api/client": { apiFetch: () => { throw new Error("No client session fetch expected") } },
    "./dashboard-navigation-context": { DashboardNavigationProvider: navigationContext.Provider },
    "./sidebar": { Sidebar: ({ navigation }: { navigation: { name: string }[] }) => React.createElement("aside", null, navigation.map(item => item.name).join(",")) },
    "@/components/ui/sheet": { Sheet: container, SheetContent: () => null, SheetTitle: container, SheetDescription: container },
  }
  const module = { exports: {} as Record<string, ElementType> }
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
  runInNewContext(js, { module, exports: module.exports, require: (name: string) => {
    assert.ok(name in modules, `Unknown dependency: ${name}`)
    return modules[name]
  } })
  return module.exports
}

test("les liens autorisés sont présents au premier rendu sans requête de session navigateur", () => {
  const { DashboardLayout } = loadLayout()
  const html = renderToStaticMarkup(React.createElement(DashboardLayout, { navigation: items }, "page"))
  assert.match(html, /<aside>Athlètes<\/aside>/)
  assert.doesNotMatch(source, /apiFetch|\/api\/auth\/session/)
})

test("un ancien wrapper de page ne remonte pas un deuxième cadre de navigation", () => {
  const { DashboardLayout } = loadLayout()
  const html = renderToStaticMarkup(React.createElement(DashboardLayout, { navigation: items },
    React.createElement(DashboardLayout, null, "contenu")))
  assert.equal((html.match(/<aside>/g) || []).length, 1)
  assert.match(html, /contenu/)
})

test("les pages publiques conservent leur présentation sans sidebar", () => {
  for (const pathname of ["/login", "/activation", "/service-indisponible", "/acces-refuse", "/mon-compte"]) {
    const { DashboardShell } = loadLayout(pathname)
    assert.ok(DashboardShell)
    const html = renderToStaticMarkup(React.createElement(DashboardShell, { navigation: items }, "page"))
    assert.doesNotMatch(html, /<aside>/)
  }
})

test("le layout racine fournit la navigation filtrée par les droits existants", () => {
  const root = readFileSync(new URL("../../app/layout.tsx", import.meta.url), "utf8")
  assert.match(root, /<DashboardShell navigation=\{navigation\}/)
  assert.match(root, /filterNavigation\(dashboardNavigation,/)
  assert.match(root, /getNavigationAccess\(session\)/)
})
