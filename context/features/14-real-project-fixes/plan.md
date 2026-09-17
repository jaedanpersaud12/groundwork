# Plan — 14 Fixes from real projects

## Decisions
- **Triage against source before accepting anything.** Each reported issue was reproduced or read in
  the code; the spec's table records how. Environmental issues get docs, not code.
- **Light-only is an explicit marker, not a relaxed default.** `.dark` stays required unless a theme
  says otherwise, because every registry component carries `dark:` variants. The marker text is kept
  out of `neutral.css` — projects import it, and would inherit the marker.
- **Kickoff outputs are pending until work starts.** A freshly initialised project hasn't run the
  prompts yet; failing doctor there would make `kit init` → `kit doctor` red by design. The first
  `context/features/NN-*` folder is the evidence kickoff should be done.
- **Section checks read the prompts' own Output sections**, matched as markdown headings (numbered or
  not), so a prompt change and a doctor change are the same edit.
- **Git decides what's ignored** (`git check-ignore --no-index`), so nested `.gitignore`, `info/exclude`
  and global excludes all count, and a skill that doesn't exist yet is still checked.
- **`kit skills` mirrors `sync`'s shape** (status, update) but overwrites instead of 3-way merging:
  skills are prose read by an agent, and a project's edit to one is a decision to keep, so edited
  skills need `--force`.
- **`native-select`, not a custom listbox, for A7** — the gap both projects hand-rolled is a form field
  on phones; the animated `Dropdown` listbox is stage 16.
- **Retry lives in `getJson`** with an injectable delay list, so the test runs in milliseconds.
