// The FlowLeap Patent AI app ships only methods. It has no `flowleap` command
// and none of the FlowLeap CLI manual or persona skills, so a method names
// tools, never a command, the CLI, or a skill that is not in this repository.
// Two paragraphs, pinned in paragraphs.json, tell the agent how tool names and
// missing keys work in every host.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { markdownFiles, skillNames, skillText } from './helpers.mjs'

const PARAGRAPHS = JSON.parse(readFileSync(new URL('./paragraphs.json', import.meta.url), 'utf8'))

/** The skills of the FlowLeap CLI pack that the app does not ship. */
const UNSHIPPED = [
  'flowleap', 'flowleap-academic', 'flowleap-auth', 'flowleap-citation', 'flowleap-keys', 'flowleap-legal',
  'flowleap-npl', 'flowleap-ops', 'flowleap-patent', 'flowleap-patstat', 'flowleap-patstat-graph',
  'flowleap-shared', 'flowleap-tools', 'flowleap-uspto',
  'persona-ip-analyst', 'persona-patent-attorney', 'persona-researcher', 'persona-startup-founder',
]

test('the repository holds the 15 methods, all recipe-*', () => {
  const names = skillNames()
  assert.equal(names.length, 15, names.join(', '))
  assert.deepEqual(names.filter((n) => !n.startsWith('recipe-')), [])
})

test('methods name no command, no CLI and no unshipped skill', () => {
  const offenders = []
  for (const name of skillNames()) {
    for (const [path, text] of markdownFiles(name)) {
      text.split('\n').forEach((line, i) => {
        const lower = line.toLowerCase()
        const command = line.includes('`flowleap ') || line.trimStart().startsWith('flowleap ') || line.includes('$ flowleap ')
        const cli = line.split(/[^A-Za-z0-9]/).includes('CLI')
        const skill = UNSHIPPED.some((s) => lower.includes(`\`${s}\``) || lower.includes(`"${s}"`))
        if (command || cli || skill) offenders.push(`${path}:${i + 1}: ${line}`)
      })
    }
  }
  assert.deepEqual(offenders, [])
})

test('methods carry the Tools and Missing keys paragraphs word for word', () => {
  const missing = []
  for (const name of skillNames()) {
    const text = skillText(name)
    if (!text.includes(PARAGRAPHS.tools)) missing.push(`${name}: Tools`)
    if (!text.includes(PARAGRAPHS.missingKeys)) missing.push(`${name}: Missing keys`)
  }
  assert.deepEqual(missing, [])
})

test('the methods that read claims state the family-member workaround', () => {
  const missing = ['recipe-freedom-to-operate', 'recipe-prior-art-search', 'recipe-claim-analysis', 'recipe-invalidity-analysis']
    .filter((name) => !skillText(name).includes('read a family member'))
  assert.deepEqual(missing, [])
})

test('freedom to operate never clears a claim it did not read', () => {
  const text = skillText('recipe-freedom-to-operate')
  for (const phrase of ['claims not readable here', "member text, not the office's claims"]) assert.ok(text.includes(phrase), phrase)
})
