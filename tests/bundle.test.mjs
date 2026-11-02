// The dsh bundle and the Claude Code plugin publish the same 15 methods.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { parse } from 'yaml'
import { apply, inject, name, provider } from '../dsh/index.js'
import { ROOT, skillNames } from './helpers.mjs'

const json = (path) => JSON.parse(readFileSync(join(ROOT, path), 'utf8'))
const pkg = json('package.json')

test('package.json declares the dsh bundle, its patch, the dsh-plugin keyword and the files it ships', () => {
  assert.equal(pkg.dsh.bundle.patch, './dsh/cordis.patch.yml')
  assert.ok(pkg.keywords.includes('dsh-plugin'))
  for (const file of pkg.files) assert.ok(existsSync(join(ROOT, file)), file)
})

test('the bundle patch inserts the plugin row of this package', () => {
  const patch = parse(readFileSync(join(ROOT, 'dsh/cordis.patch.yml'), 'utf8'))
  const rows = patch.flatMap((entry) => entry.insert ?? [])
  assert.deepEqual(rows, [{ id: 'flowleap-methods', name: pkg.name }])
  assert.equal(name, 'flowleap-methods')
  assert.deepEqual(inject, ['skills'])
})

test('apply registers the provider on ctx.skills', () => {
  const registered = []
  apply({ skills: { registerProvider: (create) => registered.push(create({})) } })
  assert.deepEqual(registered, [provider])
})

test('the provider lists every method with its description and loads its body without frontmatter', async () => {
  const candidates = await provider.list({})
  assert.deepEqual(candidates.map((c) => c.name), skillNames())
  for (const candidate of candidates) {
    assert.equal(candidate.provider, 'flowleap-methods')
    assert.ok(candidate.description.includes('Use it when'), candidate.name)
    assert.ok(existsSync(candidate.path), candidate.path)
    assert.ok(existsSync(candidate.resourceBase.path), candidate.resourceBase.path)
    const definition = await provider.get(candidate, {})
    assert.equal(definition.name, candidate.name)
    assert.ok(!definition.content.startsWith('---'), candidate.name)
    assert.ok(definition.content.includes('**Tools.**'), candidate.name)
  }
})

test('the provider answers undefined for a skill that no longer exists', async () => {
  assert.equal(await provider.get({ locator: 'recipe-missing' }, {}), undefined)
})

test('the Claude Code manifest names the package and its version', () => {
  const plugin = json('.claude-plugin/plugin.json')
  assert.equal(plugin.name, pkg.name)
  assert.equal(plugin.version, pkg.version)
  const market = json('.claude-plugin/marketplace.json')
  assert.deepEqual(market.plugins.map((p) => [p.name, p.source]), [[pkg.name, './']])
})
