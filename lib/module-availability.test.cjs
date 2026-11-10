/* global require, process */
/* eslint-disable @typescript-eslint/no-require-imports -- Runs actual pages, proxy and sidebar with isolated infrastructure. */
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

function load(file, imports = {}, globals = {}) {
  const module = { exports: {} }
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  vm.runInNewContext(js, { module, exports: module.exports, require: name => {
    if (name in imports) return imports[name]
    if (name === 'react/jsx-runtime') return require(name)
    return new Proxy({}, { get: (_, key) => { if (key === '__esModule') return false; return () => { throw new Error(`Disabled module executed ${name}.${String(key)}`) } } })
  }, ...globals })
  return module.exports
}
const availability = load('lib/module-availability.ts')

test('module boundaries include nested pages and API aliases without blocking other sections', () => {
  for (const path of ['/equipe-nationale', '/suivi-equipe-nationale', '/activites', '/activities', '/documents', '/parametres']) {
    assert.ok(availability.getUnavailableModule(path))
    assert.ok(availability.getUnavailableModule(`${path}/detail`))
    assert.ok(availability.getUnavailableModule(`/api${path}/detail`))
    assert.equal(availability.getUnavailableModule(`${path}-other`), undefined)
  }
  for (const path of ['/', '/ligues', '/ententes', '/clubs', '/athletes', '/competitions', '/mon-compte', '/api/auth/session']) assert.equal(availability.getUnavailableModule(path), undefined)
})

for (const route of ['equipe-nationale', 'suivi-equipe-nationale', 'activites', 'activites/[id]', 'documents', 'parametres']) test(`${route}: only the coming-soon screen renders and no business source is read`, async () => {
  const placeholder = () => null
  const page = load(`app/${route}/page.tsx`, {
    '@/lib/module-availability': availability,
    '@/components/dashboard/coming-soon-page': { ComingSoonPage: placeholder },
  })
  const result = await page.default({ params: Promise.resolve({ id: 'test' }) })
  assert.equal(result.type, placeholder)
  assert.ok(result.props.title)
})

test('all unavailable APIs refuse reads and mutations even for super-admins', async () => {
  const policy = load('lib/auth/route-policy.ts')
  const proxy = load('proxy.ts', {
    'next/server': { NextResponse: {
      next: () => ({ kind: 'next', headers: new Map() }),
      json: (body, options) => ({ kind: 'json', body, ...options }),
    } },
    '@/lib/auth/session-cookie': { SESSION_COOKIE_NAME: 'test-session' },
    '@/lib/auth/session-policy': { isPendingPasswordRouteAllowed: () => false },
    '@/lib/auth/session-resolution': { resolveSession: async () => ({ ok: true, requiresActivation: false, user: { idUser: 'test', estSuperAdmin: true } }) },
    '@/lib/auth/authorization': { authorizeWithSource: async () => ({ allowed: true }) },
    '@/lib/auth/route-policy': policy,
    '@/lib/auth/request-origin': { isMutationOriginAllowed: () => true },
    '@/lib/users/data': {},
    '@/lib/auth/failure-navigation': {},
    '@/lib/module-availability': availability,
  }, { process: { env: { AUTH_SECRET: 'test-only-secret-with-at-least-32-characters' } } })
  for (const path of ['/api/activities', '/api/activities/test/entities', '/api/activities/test/participants', '/api/documents/test', '/api/parametres', '/api/equipe-nationale', '/api/suivi-equipe-nationale']) {
    for (const method of ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']) {
      const response = await proxy.proxy({ nextUrl: { pathname: path }, method, cookies: { get: () => ({ value: 'test-token' }) } })
      assert.equal(response.status, 403, `${method} ${path}`)
      assert.equal(response.body.code, 'MODULE_UNAVAILABLE')
    }
  }
  assert.equal((await proxy.proxy({ nextUrl: { pathname: '/api/ligues' }, method: 'GET', cookies: { get: () => ({ value: 'test-token' }) } })).kind, 'next')
})

test('expanded and mobile sidebar markup contains disabled labels without module links', () => {
  const navigation = load('lib/navigation.ts')
  const Icon = props => React.createElement('svg', props)
  const children = ({ children }) => React.createElement(React.Fragment, null, children)
  const sidebar = load('components/dashboard/sidebar.tsx', {
    react: React,
    'next/image': props => React.createElement('img', { src: props.src, alt: props.alt }),
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
    'next/navigation': { usePathname: () => '/' },
    'lucide-react': new Proxy({}, { get: () => Icon }),
    '@/components/ui/tooltip': { Tooltip: children, TooltipTrigger: children, TooltipContent: children },
    '@/lib/navigation': navigation,
    '@/lib/module-availability': availability,
    '@/lib/utils': { cn: (...args) => args.filter(Boolean).join(' ') },
  })
  for (const collapsible of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(sidebar.Sidebar, { navigation: navigation.dashboardNavigation, collapsible }))
    assert.equal((html.match(/aria-disabled="true"/g) || []).length, 4)
    for (const href of ['/equipe-nationale', '/activites', '/documents', '/parametres']) assert.equal(html.includes(`href="${href}"`), false)
    assert.ok(html.includes('href="/ligues"'))
    assert.ok(html.includes('Bientôt disponible'))
  }
})
