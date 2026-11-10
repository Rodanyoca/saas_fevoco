/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports -- Render the real editor with its Sheet portal exposed. */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")

function editor() {
  const cache = new Map()
  const sheet = Object.fromEntries(["SheetContent", "SheetHeader", "SheetFooter", "SheetTitle", "SheetDescription"].map(name => [name, ({ children, ...props }) => React.createElement("div", { ...props, "data-slot": name }, children)]))
  sheet.Sheet = ({ children }) => children
  function load(file) {
    file = path.resolve(file)
    if (cache.has(file)) return cache.get(file)
    const exports = {}
    cache.set(file, exports)
    const req = name => {
      if (name === "@/components/ui/sheet") return sheet
      if (!name.startsWith("@/")) return require(name)
      const base = path.resolve(name.slice(2))
      return load(fs.existsSync(base + ".ts") ? base + ".ts" : base + ".tsx")
    }
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
    vm.runInNewContext(code, { exports, require: req, console })
    return exports
  }
  return load("components/licences/actor-licence-editor.tsx").ActorLicenceEditor
}

test("Entourage renewal keeps the action bar outside the constrained scrolling form body", () => {
  const Editor = editor()
  const html = renderToStaticMarkup(React.createElement(Editor, {
    open: true, onOpenChange() {}, mode: "renew", licence: null, history: [], onSaved() {},
    references: { types: [], actors: [], affiliations: [], cycles: [], statuses: [] },
  }))
  const panel = html.match(/<div[^>]*data-slot="SheetContent"[^>]*>/)?.[0]
  const footer = html.match(/<div[^>]*data-slot="SheetFooter"[^>]*>/)?.[0]
  const scroll = html.match(/<div[^>]*data-slot="actor-licence-scroll-area"[^>]*>/)?.[0]
  assert.ok(panel.includes("h-dvh") && panel.includes("overflow-hidden"), "The panel must stay within the dynamic viewport")
  assert.ok(scroll, "Only the form body should scroll")
  assert.ok(scroll.includes("min-h-0") && scroll.includes("overflow-y-auto") && scroll.includes("flex-1"))
  assert.ok(footer.includes("shrink-0"), "Actions must retain their height")
  assert.doesNotMatch(footer, /\b(?:absolute|fixed)\b/, "Actions must not overlay the scrolling fields")
  assert.match(html, /<\/fieldset><\/div><div[^>]*data-slot="SheetFooter"/, "Actions are siblings of the scroll region")
  assert.ok(html.includes("Renouveler la licence"))
})
