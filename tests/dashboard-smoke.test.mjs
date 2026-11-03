// Runs the recipe-custom-dashboard template smoke test, a zero-dependency Node
// script that renders each template from recorded tool answers and checks the
// numbers-from-code, provenance and input-check rules. See
// skills/recipe-custom-dashboard/references/smoke.mjs for the assertions.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { test } from 'node:test'
import { SKILLS } from './helpers.mjs'

test('the dashboard templates pass their smoke test', () => {
  const run = spawnSync(process.execPath, [join(SKILLS, 'recipe-custom-dashboard', 'references', 'smoke.mjs')], { encoding: 'utf8' })
  assert.equal(run.status, 0, `${run.stdout}\n${run.stderr}`)
})
