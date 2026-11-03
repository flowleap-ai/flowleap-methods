# FlowLeap methods

Fifteen patent work methods (skills) for FlowLeap Patent AI agents. Each method is a folder `skills/<name>/` with a `SKILL.md` and, where needed, a `references/` folder. The methods call the FlowLeap patent tools by name (`search_patents`, `get_claims`, `get_family`, `examiner_baseline`, …). They never run a command-line tool.

| Method | Task |
|---|---|
| `recipe-prior-art-search` | Prior-art and novelty search; holds the search method the other methods use (`references/search-method.md`) |
| `recipe-find-better` | Closer prior art than the examiners cited against a granted patent |
| `recipe-invalidity-analysis` | Invalidity case with the Fallback Ladder and search rounds |
| `recipe-freedom-to-operate` | Freedom-to-operate clearance for a product |
| `recipe-patent-landscape` | Patents of a technology area: players, trends, white space |
| `recipe-claim-analysis` | Claims broken into elements, keywords and queries |
| `recipe-claim-drafting` | Claims drafted against the closest prior art |
| `recipe-infringement-charting` | Element-by-element infringement chart |
| `recipe-office-action-response` | Analysis of an EP or US office action with response options |
| `recipe-invention-disclosure` | Invention disclosure form with a novelty check |
| `recipe-maintenance-fees` | US maintenance-fee status and deadlines |
| `recipe-patent-to-report` | Dossier of one patent |
| `recipe-academic-literature-review` | Published research against filed patents |
| `recipe-audit-report` | Auditable record of AI-assisted patent research |
| `recipe-custom-dashboard` | Self-contained HTML dashboard from verified patent data |

## Install

**FlowLeap Patent AI app (firm OS and desktop).** The app ships these methods: its image and its desktop build copy `skills/` at a fixed commit of this repository. Its office tools are built in; `patent_analytics`, `get_fulltext` and the PATSTAT tools need FlowLeap Data.

**Claude Code.** Add this repository as a marketplace and install the plugin. The methods need the FlowLeap patent tools, for example from the FlowLeap connector (the `flowleap` plugin of `flowleap-ai/flowleap-plugins`).

```text
/plugin marketplace add flowleap-ai/flowleap-methods
/plugin install flowleap-methods@flowleap-methods
```

**DeepSeek Harness (dsh).** The repository is a dsh bundle (`package.json` `dsh.bundle`): `dsh/index.js` publishes the methods on `ctx.skills`. It is plain ESM with no build step, so the install needs no build permission. Pin a commit:

```bash
dsh plugin add github:flowleap-ai/flowleap-methods#<commit>
```

## Develop

```bash
npm ci
npm test
```

The tests parse every frontmatter as YAML, check each description, and check that no method names a command-line tool, the CLI or a skill outside this repository. They also check that every method carries the two fixed paragraphs of `tests/paragraphs.json`, that the dsh bundle and the Claude Code manifest publish the same 15 methods, and that the dashboard templates pass their smoke test. CI runs them on every pull request.

## License

MIT. See [LICENSE](LICENSE).
