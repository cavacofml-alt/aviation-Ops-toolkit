# Modules: on, off, and on their own

Each module owns its folder:

```
src/modules/<id>/
├── panel.html     markup — injected into the shell at build time
├── <id>.js        logic
└── ui.js          wiring (DOM ids, event handlers)
```

Nothing outside that folder knows the module exists, apart from two lines: an
entry in `build.manifest.json` and one in `TOOLS` (`src/shell/shell-core.js`).
The sidebar and the home page read the registry, so neither has a list to update.

## Builds

```bash
python3 build.py                  # the full suite
python3 build.py --check          # build, then test
python3 build.py --only recon     # that module on its own → dist/aviation-ops-recon.html
python3 build.py --only builder   # likewise
node tests/run.js dist/<file>     # test any build
```

A single-module build still carries the shell, the validation engine and the
shared helpers — so a standalone PNL Builder can still check its own output
against the validator.

## Switching a module off

Move its entry from `"modules"` to `"disabled"`, and remove its `TOOLS` entry.
The build refuses to proceed if you do one and forget the other:

```
Module "recon" is disabled but still listed in TOOLS (src/shell/shell-core.js).
```

The manifest keeps the exact `TOOLS` entry under `"tools_entry"`, so bringing a
module back is copy and paste rather than reconstruction from memory.

## Currently off

| Module | Why | Standalone build |
|---|---|---|
| `recon` — PNL/ADL Reconcile | under test on its own | `dist/aviation-ops-recon.html` |
| `builder` — PNL Builder | under test on its own | `dist/aviation-ops-builder.html` |

To fold either back into the suite: move its manifest entry into `"modules"`,
paste `tools_entry` back into `TOOLS`, then `python3 build.py --check`.

## What made this possible

Two things had to move first, and both were in the wrong place to begin with:

- `showTextModal` lived in `uld.js`, so every module that exported a file
  depended on the load planner being present. It is now in `src/core/ui.js`.
- The validator's UI and the AHM shortcut lived in the shell, so any build
  carried them whether or not they were wanted. They are now in their own
  modules, and the shell holds only navigation and the theme.
