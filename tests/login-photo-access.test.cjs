/* global require, Map, URL */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness executes the actual proxy with isolated dependencies. */
const assert = require('node:assert/strict')
const { test } = require('node:test')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
test('login photo is accessible without a session', async () => {
 const module = { exports: {} }
 const source=ts.transpileModule(fs.readFileSync('proxy.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText
 const load=name=>name==='next/server'?{NextResponse:{next:()=>({kind:'next'}),redirect:()=>({kind:'redirect',headers:new Map()})}}:name.endsWith('request-origin')?{isMutationOriginAllowed:()=>true,publicRequestOrigin:()=> 'http://localhost:3000'}:name.endsWith('failure-navigation')?{authenticationFailurePath:()=>'/login'}:{}
 vm.runInNewContext(source,{require:load,module,exports:module.exports,URL})
 const result=await module.exports.proxy({nextUrl:{pathname:'/img-20250901-wa01791.jpg'},method:'GET',cookies:{get:()=>undefined}})
 assert.equal(result.kind,'next','The photo must not redirect to login')
})
