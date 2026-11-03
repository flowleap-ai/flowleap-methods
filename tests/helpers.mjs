// Readers shared by the tests: the skill folders and the files of each one.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const SKILLS = join(ROOT, 'skills')

/** Every skill folder name, sorted. */
export const skillNames = () => readdirSync(SKILLS).filter((n) => statSync(join(SKILLS, n)).isDirectory()).sort()

/** The SKILL.md text of one skill. */
export const skillText = (name) => readFileSync(join(SKILLS, name, 'SKILL.md'), 'utf8')

/** Every Markdown file of one skill folder (SKILL.md and references/), as [relative path, text]. */
export function markdownFiles(name) {
  const out = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith('.md')) out.push([relative(ROOT, path), readFileSync(path, 'utf8')])
    }
  }
  walk(join(SKILLS, name))
  return out
}

/** The frontmatter block of a SKILL.md, or undefined. */
export const frontmatterBlock = (text) => /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1]
