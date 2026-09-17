# Log — 14 Fixes from real projects

## 2026-09-17
- Developer: "mark any issues and solve them with the next groundwork update", plus a report from
  another agent's project, plus "fix: Updating skills" and, mid-build, a screenshot of the consumer's inbox
  with the name column far too wide (C1).
- Triaged every issue against source (spec table). Plan decisions in plan.md; developer's instruction
  taken as the go-ahead.

## Evidence — done when
- **A1** `src/commands/check.test.ts` (4 tests): light theme without `.dark` fails naming `.dark`;
  marker passes; marker doesn't excuse missing `:root` tokens; full theme passes. CLI prints the marker
  hint when `.dark` is missing. `neutral.css` header and `/docs/tokens` updated; `grep -c "tokens
  light-only" packages/tokens/themes/*.css` → 0 in every theme (so importers don't inherit it).
- **A2** `src/commands/doctor.test.ts` (4 kickoff tests): pending before any feature folder; missing
  file fails once `context/features/01-homepage/` exists, naming `01-interview`; missing sections listed;
  complete outputs (numbered headings included) pass. Real project: `kit doctor` in the consumer project reports
  missing `project-overview.md` and missing architecture/build-plan sections.
- **A3** `src/registry.retry.test.ts` (3 tests): 503 twice then success → 3 calls; 404 → 1 call, no
  retry; refused connection → "after 3 attempts … usually transient". `/docs` setup note for the `bunx`
  download.
- **A4 A5 A6** `/docs` setup step 1 notes (repo root, sandbox `TMPDIR`/`BUN_INSTALL_CACHE_DIR`,
  transient `ConnectionRefused`) and step 2 notes (typegen, `.gitignore` collision);
  `knowledge/nextjs-app-router.md` typegen bullet. Site build passes.
- **A7** `apps/registry/registry/groundwork/ui/native-select.tsx` + registry entry 1.0.0 + example in
  `primitives.tsx`; `registry:build` versioned it; `bun run check` lint passes on it. Install into a blank
  app: see Publish below.
- **A8** `src/commands/list.test.ts` (2 tests): inside a project marks locked items; outside a project
  against `--url`. Real run: `kit list` in the consumer project prints the registry with tier/latest/installed.
- **A9** `doctor.test.ts`: no rule → pass; bare `.claude` committed → fails naming
  `.claude/skills/review/SKILL.md` and `git check-ignore -v`, not `kit.lock.json`. consumer project: "✓ kit's
  files aren't git-ignored".
- **A10** `/docs/loop` "Without slash commands" section (5 steps) and `skills/README.md` section.
- **B1** `lock.test.ts`: `--force keeps the skills kit init locked` passes.
- **B2** `src/commands/skills.test.ts` (4 tests): status sorts outdated/edited/missing/new/retired;
  update installs outdated+missing+new, skips edited, re-locks; `--force` + names; refuses without lock
  or unknown name. Real run in the consumer project: `kit skills status` → app-ui and architect "update available".
- **B3** `src/commands/init.test.ts`: empty dir → throws "create-next-app", no `context/` or
  `.claude/` written.
- **B4** `grep -rn "overview.md" skills prompts templates | grep -v project-overview.md` → nothing.
- **B5 B6** `table-card` 1.0.3 (`relative` container + sizing comment), `button` 1.1.0 (`icon-sm`,
  `icon-xs`, link guidance); `registry:build` "Versioned 25 items".
- **B9** `knowledge/{nextjs-app-router,shadcn-registry,bun}.md` appended, new `insforge.md`, README table.
- **C1** `app-ui` §5 column-sizing rule; `DataTable` `columns` comment. Consumer resize: see its log.
- **check** `bun run check` exit 0: 83 kit tests, registry:build 25 items.
- A stale local `public/r/v/table-card@1.0.3.json` (built before the C1 comment, never committed or
  deployed) blocked `registry:build`; deleted and rebuilt.
