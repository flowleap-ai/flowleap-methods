/**
 * FlowLeap methods as a DeepSeek Harness (dsh) plugin.
 *
 * Registers one `ctx.skills` provider that publishes every `skills/<name>/SKILL.md`
 * of this package. The FlowLeap Patent AI app does not load this plugin: its
 * image and its desktop build copy `skills/` into the folder that its own
 * filesystem skill row reads. This plugin is for any other dsh install
 * (`dsh plugin add github:flowleap-ai/flowleap-methods`).
 *
 * Plain ESM with no build step and no `@deepseek-ai/*` dependency: dsh installs
 * a git plugin from source, and an in-box package installed a second time drifts
 * from the host's copy. The provider implements the `list`/`get` contract of
 * `ctx.skills` directly.
 */

import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const PROVIDER_NAME = 'flowleap-methods'
/** Rank of the `bundled` discovery source in dsh's own skill provider. */
const BUNDLED_SKILL_RANK = 600
const SKILLS_DIR_URL = new URL('../skills/', import.meta.url)
const INVOCATION = { modelInvocable: true, userInvocable: true }

/**
 * Split a SKILL.md into its frontmatter fields and its body.
 *
 * The frontmatter of every method is flat scalars (`name`, a one-line
 * `description`) plus a `metadata` block that the provider does not need, and
 * `tests/frontmatter.test.mjs` parses each file as YAML, so a line reader is
 * enough here.
 *
 * @param {string} text - the raw SKILL.md contents.
 * @returns {{ name?: string, description?: string, body: string } | undefined} the fields and body, or undefined without frontmatter.
 */
export function parseSkill(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return undefined
  const field = (key) => {
    const line = new RegExp(`^${key}:[ \\t]*(.+)$`, 'm').exec(match[1])
    if (!line) return undefined
    const raw = line[1].trim()
    if (raw.length > 1 && raw.startsWith('"') && raw.endsWith('"')) return raw.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    if (raw.length > 1 && raw.startsWith("'") && raw.endsWith("'")) return raw.slice(1, -1).replace(/''/g, "'")
    return raw
  }
  return { name: field('name'), description: field('description'), body: text.slice(match[0].length) }
}

/**
 * Read one method, or `undefined` when its SKILL.md cannot be used.
 *
 * @param {string} dirName - the skill folder name.
 * @param {AbortSignal | undefined} signal - lookup cancellation.
 * @returns {Promise<{ name: string, description: string, body: string, path: string, dir: string } | undefined>} the method.
 */
async function readSkill(dirName, signal) {
  const dirUrl = new URL(`${dirName}/`, SKILLS_DIR_URL)
  const fileUrl = new URL('SKILL.md', dirUrl)
  let text
  try {
    text = await readFile(fileUrl, { encoding: 'utf8', signal })
  } catch (error) {
    // A folder without SKILL.md is not a method; an abort propagates.
    if (signal?.aborted) throw error
    return undefined
  }
  const parsed = parseSkill(text)
  if (parsed?.name !== dirName || !parsed.description) return undefined
  return { name: parsed.name, description: parsed.description, body: parsed.body, path: fileURLToPath(fileUrl), dir: fileURLToPath(dirUrl) }
}

/**
 * Every method of the package, sorted by name.
 *
 * @param {AbortSignal | undefined} signal - lookup cancellation.
 * @returns {Promise<Array<{ name: string, description: string, body: string, path: string, dir: string }>>} the methods.
 */
export async function readSkills(signal) {
  const entries = await readdir(SKILLS_DIR_URL, { withFileTypes: true })
  const names = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()
  const skills = await Promise.all(names.map((n) => readSkill(n, signal)))
  return skills.filter((s) => s !== undefined)
}

const summary = (skill) => ({
  path: skill.path,
  name: skill.name,
  description: skill.description,
  invocation: INVOCATION,
  provider: PROVIDER_NAME,
  source: 'bundled',
  resourceBase: { kind: 'directory', path: skill.dir },
})

/** The `ctx.skills` provider of the package. */
export const provider = {
  name: PROVIDER_NAME,
  async list(options = {}) {
    const skills = await readSkills(options.signal)
    return skills.map((skill) => ({ ...summary(skill), rank: BUNDLED_SKILL_RANK, locator: skill.name }))
  },
  async get(candidate, options = {}) {
    const skill = await readSkill(candidate.locator, options.signal)
    if (skill === undefined) return undefined
    return { ...summary(skill), content: skill.body }
  },
}

/** Cordis plugin name. */
export const name = 'flowleap-methods'
/** The registry this plugin contributes to. */
export const inject = ['skills']

/**
 * Register the packaged methods on `ctx.skills`.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx - the plugin context.
 */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}
