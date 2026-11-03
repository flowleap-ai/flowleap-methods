// Every skill's frontmatter is valid YAML with the fields that skill readers
// need. A reader such as the dsh skill reader skips a skill whose frontmatter
// does not parse, so no agent of that host gets the skill.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parse } from 'yaml'
import { frontmatterBlock, skillNames, skillText } from './helpers.mjs'

test('every frontmatter parses as YAML with name, description and boolean invocation keys', () => {
  const errors = []
  for (const name of skillNames()) {
    const block = frontmatterBlock(skillText(name))
    if (block === undefined) { errors.push(`${name}: no frontmatter block`); continue }
    let doc
    try { doc = parse(block) } catch (e) { errors.push(`${name}: ${e.message.split('\n')[0]}`); continue }
    if (doc?.name !== name) errors.push(`${name}: name is not the folder name`)
    if (typeof doc?.description !== 'string' || !doc.description.trim()) errors.push(`${name}: description is not a non-empty string`)
    for (const key of ['user-invocable', 'disable-model-invocation']) {
      if (key in (doc ?? {}) && typeof doc[key] !== 'boolean') errors.push(`${name}: ${key} is not a boolean`)
    }
  }
  assert.deepEqual(errors, [])
})

test('every description routes: at most 1024 characters, with a "Use it when" clause', () => {
  const errors = []
  for (const name of skillNames()) {
    const description = parse(frontmatterBlock(skillText(name))).description
    if (description.length > 1024) errors.push(`${name}: description has ${description.length} characters`)
    if (!description.includes('Use it when')) errors.push(`${name}: description lacks a "Use it when" routing clause`)
  }
  assert.deepEqual(errors, [])
})
