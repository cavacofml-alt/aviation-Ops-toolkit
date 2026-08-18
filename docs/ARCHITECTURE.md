# Aviation Ops Toolkit — how the project is put together

## Why there is a source tree at all

The thing you ship is a single HTML file. The thing you *work on* should not be:
at 290 KB, a change in one corner can quietly break another, and the file is too
large to review in one pass. So the source lives in modules and a build step
concatenates them.

```
aviation-ops/
├── build.manifest.json      what gets bundled, and in what order
├── build.py                 the bundler
├── src/
│   ├── core/                shared by every module
│   │   ├── engine.js        IATA validation rules (the valuable part)
│   │   ├── crypto.js        SHA-1, HMAC, PBKDF2, AES-256, ZIP writer
│   │   └── store.js         autosave, with fallbacks
│   ├── shell/
│   │   ├── index.html       markup, CSS, every tool panel
│   │   └── shell.js         navigation, theme, tool registry
│   └── modules/
│       ├── msgcheck/        message validator (examples; engine is in core)
│       ├── uld/             load planner
│       ├── securezip/       encrypted archives
│       ├── recon/           PNL/ADL reconciliation + shared module UI
│       ├── builder/         CSV → PNL
│       └── ahm/             shortcut (lives in the shell, no logic)
├── tests/run.js             regression suite
├── dist/                    the built file — this is what you distribute
└── docs/
```

## Commands

```bash
python3 build.py            # build dist/aviation-ops-toolkit.html
python3 build.py --check    # build, then run every test
node tests/run.js           # tests only, against the last build
```

Run `--check` before sending the file to anyone. It takes seconds and it has
already caught real mistakes: a duplicated function, a leaked line of interface
code, rules that were quietly dropped during a refactor.

## Adding a module

1. `mkdir src/modules/<name>/` and write `<name>.js` there.
2. Add a `<section id="panel-<name>" class="panel-hidden">` to
   `src/shell/index.html` with your markup.
3. Add one entry to `TOOLS` in `src/shell/shell.js`:

```js
{ id:"<name>", name:"Human name", badge:"CATEGORY", code:"ABC", accent:"cyan",
  blurb:"One sentence describing what it does.",
  sources:"Where its rules come from" }
```

4. List the file in `build.manifest.json` under `modules`.
5. Add a handful of checks to `tests/run.js`.

The sidebar and the home page pick it up on their own — neither has a hard-coded
list.

## Order matters

Everything ends up in one `<script>`, so a file may only use what an earlier file
defined. The manifest declares that order explicitly rather than leaving it to
chance. Two rules of thumb:

- **`shell-core.js` comes first.** It defines `$()` and the `TOOLS` registry
  that every module uses. Putting it last once broke every tool at load — the
  modules were fine, nothing had run the bundle end to end. That is now a test.
- **All UI wiring comes last** (`shell-ui.js`), because it binds to DOM ids and
  to helpers such as `showTextModal`, defined in `uld.js`.
- **Logic before UI**, module by module.

The bundler writes a sentinel before each file:

```js
/*==== FILE: src/modules/uld/uld.js ====*/
```

This makes the built file navigable, and lets the tests load one module at a time
instead of guessing where it starts and ends.

## What the tests cover

- The engine loads, and the 14 clean examples validate clean.
- The 14 faulty examples still produce findings.
- Every rule that was once wrong, as a named case — so it cannot regress twice.
- Crypto primitives against the published vectors (FIPS-197, RFC 6070, RFC 2202).
- The load planner generates layouts from both templates.
- Reconciliation applies DEL/ADD/CHG, and refuses to guess when a name is
  ambiguous.
- The PNL builder's output passes the validator, with no line over 64 characters.
- The bundle has no external dependencies and no duplicate declarations.

When you fix a bug, add the case. That is what turns a fix into a guarantee.
