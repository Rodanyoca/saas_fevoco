const test = require('node:test')
const assert = require('node:assert/strict')
const { harness } = require('../helpers/dashboard-harness.cjs')
const { createSessionToken } = require('../../lib/auth/session-token.ts')

test('le dernier menu confirme survit a la panne sans remplacer les controles frais', async () => {
  const previous = process.env.AUTH_SECRET
  process.env.AUTH_SECRET = 'unavailable-navigation-flow-test-secret-32'
  try {
    const token = await createSessionToken({ idUser: 'U1', sessionVersion: 1, secret: process.env.AUTH_SECRET })
    const user = { idUser: 'U1', typeUser: 'VIEWER', estSuperAdmin: false, statut: 'ACTIF', sessionVersion: 1, doitChangerMotDePasse: false }
    let offline = false, revoked = false, userReads = 0, authorizationReads = 0
    const cookies = new Map([['fevoco_session', token]])
    const mocks = {
      '@/lib/users/data': {
        getUserById: async () => { userReads++; if (offline) throw Error('Unavailable'); return { ...user, sessionVersion: revoked ? 2 : 1 } },
        getAuthorizationsForUser: async () => { authorizationReads++; return [{ idUser: 'U1', idBlocAutorisation: 'AUT-SPT', statut: 'ACTIF', dateDebut: '2000-01-01', dateFin: null }] },
      },
      'next/headers': { cookies: async () => ({ get: name => cookies.has(name) ? { value: cookies.get(name) } : undefined }) },
      'next/server': { NextResponse: {
        next: options => ({ kind: 'next', options, headers: new Headers(), cookies: { set: (name, value) => cookies.set(name, value) } }),
        redirect: url => ({ kind: 'redirect', url: String(url), headers: new Headers() }),
        json: (body, options) => Response.json(body, options),
      } },
    }
    const h = harness({}, new Set(), {}, mocks), { proxy } = h.load('proxy.ts')
    const request = (path, method = 'GET') => { const url = new URL(path, 'https://example.invalid'); return { url: url.href, nextUrl: url, method, headers: new Headers({ origin: url.origin, 'x-fevoco-unavailable-page': '1' }), cookies: { get: name => cookies.has(name) ? { value: cookies.get(name) } : undefined } } }
    const allowed = await proxy(request('/athletes'))
    assert.equal(allowed.kind, 'next')
    assert.equal(allowed.options.request.headers.get('x-fevoco-unavailable-page'), '0')
    assert.ok(cookies.has('fevoco_navigation'))
    assert.equal(userReads, 1)
    assert.equal(authorizationReads, 1)
    offline = true
    assert.equal(new URL((await proxy(request('/clubs'))).url).pathname, '/service-indisponible')
    const page = await proxy(request('/service-indisponible'))
    assert.equal(page.options.request.headers.get('x-fevoco-unavailable-page'), '1')
    const beforeReads = userReads
    const menu = await h.load('lib/unavailable-navigation.ts').getUnavailableNavigation()
    assert.equal(userReads, beforeReads)
    assert.ok(menu.some(item => item.name === 'Acteurs'))
    assert.ok(menu.some(item => item.name === 'Structure territoriale'))
    assert.equal(menu.some(item => item.href === '/parametres'), false)
    const rootHarness = harness({}, new Set(), {}, {
      ...mocks,
      'next/headers': { ...mocks['next/headers'], headers: async () => page.options.request.headers },
      'next/font/local': { default: () => ({ variable: 'font-test' }) },
      '@vercel/analytics/next': { Analytics: () => null },
      './globals.css': {},
      '@/lib/auth': { getSession: () => { throw Error('Failed source must not be reread') }, getNavigationAccess: () => { throw Error('Failed source must not be reread') } },
    })
    const root = await rootHarness.load('app/layout.tsx').default({ children: 'Unavailable' })
    const rootMenu = root.props.children.props.children[0].props.navigation
    assert.ok(rootMenu.some(item => item.name === 'Acteurs'))
    assert.equal(userReads, beforeReads)
    assert.equal((await proxy(request('/api/athletes'))).status, 503)
    offline = false
    assert.equal((await proxy(request('/api/athletes', 'POST'))).status, 403)
    revoked = true
    assert.equal(new URL((await proxy(request('/clubs'))).url).pathname, '/login')
  } finally {
    if (previous === undefined) delete process.env.AUTH_SECRET
    else process.env.AUTH_SECRET = previous
  }
})
