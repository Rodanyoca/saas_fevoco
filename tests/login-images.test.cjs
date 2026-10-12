/* global require, Proxy */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness loads the transpiled page and Next internals. */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { getImgProps } = require('next/dist/shared/lib/get-img-props')
const { imageConfigDefault } = require('next/dist/shared/lib/image-config')
const defaultLoader = require('next/dist/shared/lib/image-loader').default

function renderImages(unoptimized) {
 const module = { exports: {} }
 const source = ts.transpileModule(fs.readFileSync('app/login/page.tsx','utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText
 const customRequire = name => {
  if (name === 'next/image') return function TestImage(props) { return React.createElement('img', getImgProps(props,{defaultLoader,imgConf:{...imageConfigDefault,unoptimized}}).props) }
  if (name.endsWith('.css')) return new Proxy({}, { get: (_,key) => key === '__esModule' ? false : String(key) })
  if (name.startsWith('@/components/')) return new Proxy({}, {get: (_,key)=> key === 'Button' ? 'button' : key === 'Input' ? 'input' : 'label'})
  if (name.startsWith('@/lib/')) return {}
  return require(name)
 }
 vm.runInNewContext(source,{require:customRequire,module,exports:module.exports})
 return renderToStaticMarkup(React.createElement(module.exports.default)).match(/<img\b[^>]*>/g)
}
test('login images have identical attributes with server and client image configuration',()=>{
 assert.deepEqual(renderImages(false),renderImages(true))
})
