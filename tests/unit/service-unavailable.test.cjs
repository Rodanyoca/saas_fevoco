const test = require('node:test')
const assert = require('node:assert/strict')
const { harness } = require('../helpers/dashboard-harness.cjs')

function find(node, predicate) {
  if (!node || typeof node !== 'object') return null
  if (node.props && predicate(node.props)) return node.props
  const children = node.props?.children
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = find(child, predicate)
    if (found) return found
  }
  return null
}

test('le message conserve le bandeau et la commande de reprise', () => {
  const { ServiceUnavailable } = harness().load('components/dashboard/service-unavailable.tsx')
  let calls = 0
  const tree = ServiceUnavailable({ retry: () => { calls++ } })
  assert.ok(find(tree, props => props.title === 'Service indisponible'))
  assert.ok(find(tree, props => props.role === 'alert'))
  find(tree, props => typeof props.onClick === 'function').onClick()
  assert.equal(calls, 1)
})

test('la reprise de la page dediee ne precharge aucune destination', () => {
  const { ServiceUnavailable } = harness().load('components/dashboard/service-unavailable.tsx')
  const tree = ServiceUnavailable({})
  const link = find(tree, props => props.href === '/')
  assert.equal(link.prefetch, false)
})

test('une erreur du layout racine conserve un cadre et un menu minimal', () => {
  const GlobalError = harness({}, new Set(), {}, { './globals.css': {} }).load('app/global-error.tsx').default
  const tree = GlobalError({ retry: () => {} })
  assert.equal(tree.type, 'html')
  const frame = find(tree, props => props.navigation?.length === 1)
  assert.equal(frame.navigation[0].href, '/')
})
