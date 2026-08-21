# Context for picking this up again

I keep no memory between conversations. This file is what a future session needs
in order not to redo work, and — more importantly — not to reintroduce mistakes
that were already found and fixed.

---

## What to hand over

| What | Why it matters |
|---|---|
| **`aviation-ops-project.zip`** | The whole project: source, build, tests, docs, and the built files |
| **`PSCRM.pdf`** (30th ed.) | Every validation rule traces to it. Without it I cannot check a claim, only guess |
| **`AIRIMP34.pdf`** (34th ed.) | The SSR matrix and the DOCS field order come from here |
| **This file** | The reasoning behind the decisions, which is not visible in the code |

The manuals matter more than they look. Several times in this project a rule
"felt right" and turned out to be wrong when read against the text. Without the
PDFs I can write plausible code and cite clauses I have not verified — which is
worse than saying I do not know.

---

## What the project is

Six tools for ground and passenger operations, distributed as self-contained HTML
files. No dependencies, no network, no installation.

- **Message Validator** — validates IATA teletype messages (PNL, ADL, PSM, PTM,
  PFS, PIL, SOM, SPM, FTL, PRL, ETL, MVT, DIV, SSM, ASM), flagging problems
  character by character with the manual clause behind each one. The telex
  printout is directly editable (`contenteditable` per line) — click a
  highlighted character to place the cursor there and fix it in place; the
  finding list re-validates 450ms after typing stops. Layout: input on the
  left, editable telex on the right, findings list full-width below.
- **ULD Layout Generator** — every valid ULD position layout per compartment,
  with index and weight, no overlaps.
- **Secure ZIP** — AES-256 encrypted archives with a strong random password.
- **AHM Audit** — a shortcut to a local application.
- **PNL/ADL Reconcile** — applies ADLs to a PNL and shows the resulting list.
  *Currently off; being tested as its own file.*
- **PNL Builder** — CSV to PNL. *Currently off; being tested as its own file.*

---

## Decisions that should not be relitigated

Each of these cost real effort to establish. The manual reference is given so a
future session can verify rather than take my word.

### Severity is a judgement, and it was tuned deliberately

- **Error** — violates the standard beyond doubt.
- **Warning** — likely wrong, or subject to bilateral agreement.
- **Info** — legitimate but unusual.

The bias is deliberate: a false error on a real message is worse than a missed
warning, because it trains people to ignore the tool. When in doubt, warn.

### Rules that were wrong at first and are now right

| Rule | What was wrong | What the manual says |
|---|---|---|
| Group count in ADL | Required the listed names to equal the group total | RP 1708 §3.2.1's own example shows group `-B28` with 13 names in one ADD section and 4 in another. Only an excess is an error |
| Totals by destination in ADL | Same mistake | Totals are the running figure for the flight, not the count in that message |
| `.L/` length | Anything outside 5–8 characters was an error | RP 1707b §3.18 describes 5–8; longer locators are used bilaterally, so it is a warning |
| `.L/` in ADL DEL/CHG | Believed mandatory | RP 1708 §2.14.1: *"This element is optional."* The manual's own DEL and CHG examples appear both with and without it |
| `.U/` element | Had a plausible invented definition | It is NOT IN USE in RP 1707b Sec.3 |
| Name alphabetisation | Check existed, then was silently lost in a refactor (`REF.alpha` was defined but never used) | RP 1707b §2.9: *"When multiple Name Elements appear together, alphabetise by surname."* Applies to PNL/ADL only — PFS groups by category, PIL orders by seat |
| `.RN/` continuation | Appended to the document fields | A continuation resumes the END of the element. If the passenger association had already started, it continues that |
| Passenger coherence | Skipped entirely when a message ended without `END` | The context must be flushed at the end of every block |
| INFT age | Float division by 365.2425 misses a 2-year-old exactly on the flight date (730/365.2425 = 1.9986 < 2) | Now calendar-based (`calYrs`): full years/months/days, not milliseconds |
| ADL headers DEL/ADD/CHG order | One global accumulator for the whole message | RP 1708: the sequence resets per destination/compartment block. A legitimate multi-leg ADL can show DEL,DEL,ADD across two blocks without being out of order |
| FQT tier suffix | Rejected `.F/LH 12345678/SEN` or `-EMER` | Alliance/carrier tier suffixes on frequent-flyer accounts are common industry practice; the account-number pattern now allows a trailing `/XX` or `-XX` |
| MVT time `2400` | Rejected as invalid HHMM/DDHHMM | `2400` is the standard end-of-day convention (midnight of the day ending, not the day starting) |
| MVT registration hyphen | Treated as a hard error | Downgraded to warning — ACARS may transmit the full civil registration with hyphen even though AHM 780 el.4 says no hyphen in teletype |
| INFT on a CHLD passenger | Flagged unconditionally | AIRIMP §3.16.1: an infant must be on an adult's lap. But guarded to `pax.count===1` — when a Name Element covers more than one passenger (e.g. `2SILVA/JOAOMRS/PEDROMSTR`), the engine cannot tell which SSR belongs to which person, so it does not guess |
| PAXID trailing slash | `-1ABDO/` (given name continuing on `.RN/`) was treated as a malformed hyphen and broke DOCS given-name parsing | `PAXID` regex changed `[A-Z]+` → `[A-Z]*` after the slash — a name association is allowed to end mid-name when the rest is on the continuation |
| TKNE on an infant | `INF4470000747042/1-1AL KARAD/AREEJMS` flagged as invalid ticket | `stripPax` didn't handle a name with a space (Arabic-style two-word surnames). Fixed by extracting the ticket number from the *front* of the free text instead of relying on stripping the association from the end |
| `.R/DOCS` entirely empty, payload on `.RN/` | Flagged "without status/action code" | RP1707b: continuation can resume anywhere, including right after the bare code. Now deferred when the next physical line is `.RN/` |
| DOCS field split across `.RN/` (e.g. expiry `11OCT` + `27` on the next line) | Field validated against the truncated value only | Added `firstRNChunk()` — peeks the leading chunk of the next `.RN/` line (up to the next dot-element boundary) and merges it **only for field-parsing**, never touching `rec.raw`/`rec.assoc`, which the continuation still fills normally when processed as its own line |
| DOCS `posOf()` crash | `f[k].length` on `undefined` when the free text has fewer than 8 `/`-separated fields (e.g. `.R/DOCS HK1 /I/ESP/`) threw and silently killed the *entire* validation run with no output | `posOf` now sums `(f[k]||"").length` — safe regardless of how short the field array is |
| CTCA/CTCE/CTCM/CTCR | Fell into the generic "not in matrix — may be bilateral" warning | Added to `pnlCodes` on the strength of real operational PNLs (status always present). Field-level format (digit count, country code) is **not** validated — no primary source for the newer construction (referenced informally as "IATA Resolution 830d") was available; inventing the rule would repeat the same mistake this list is full of fixing |
| CHN passport pattern | Only accepted 1 letter + 8 digits | Added the expanded 2-letter + 7-digit form (`EA1234567`) used once single-letter prefixes ran out. Still a heuristic warning, not normative — see below |

### Claims that were checked and rejected — hold the line unless given a primary source

- **CFG with a slash between compartments** (`CFG/016J/156Y`) — PSCRM shows six
  examples of the Seat Configuration Element, all concatenated with no separator
  between compartments (`CFG/020F179Y`, `CFG/028P036J130Y`). The `/` only
  precedes an optional aircraft type. A DCS that emits the slash form is not
  standard-compliant, even if that DCS's own parser tolerates it.
- **`.R/FQTR HK1 IB00000082270497`** (status code kept, no space before the
  account number) — PSCRM §2.12.6 shows the raw SSR *does* carry a status
  (`SSR FQTV AI HK1 AI43214321`), but its own worked example of the **PNL/ADL
  .R/ conversion** drops the status and reinstates the space:
  `1FOX/ALANMR .R/FQTV AI 43214321`. Two independent sections (§3.38.1 and
  §2.12.6) agree. A DCS that keeps the status in the `.R/` form is not
  RP1707b-compliant.
- **CHN passport number `EJ456779`** — the fix above (accepting the 2-letter
  form) is correct and stays, but this specific number is 8 characters
  (2 letters + 6 digits), not the 9 required by either the standard or expanded
  Chinese format. It should still be flagged unless proven otherwise. Checked
  against PRADO (consilium.europa.eu) — could not find the number-format spec
  there either; PRADO's public pages describe physical/security features, not
  the MRZ number pattern. If a primary source surfaces, revisit.

### Things that look like bugs but are not

- **The AIRIMP "Free Text" column is not used in the "not permitted" direction.**
  For codes such as CHLD, DOCS and SEAT the data is structured, not free text.
  Enforcing it would flag valid messages.
- **The status requirement follows the AIRIMP matrix**, so `.R/ETLP` and
  `.R/MEDA` without a status are accepted. This fixed false positives on real
  messages.
- **Passport number patterns are heuristics**, kept in an editable table at the
  top of `engine.js`, and always warnings. They are not in the manuals: ICAO 9303
  standardises the field, not each state's numbering.
- **The telex printout shows every finding** regardless of the active filter tab.
  The list is for working through; the printout is for seeing the whole message.

### Safety decisions in the ULD module

- **Layout generation is blocked** when a position has no index, or a
  non-numeric one. Loading against a wrong index moves the centre of gravity by
  exactly the size of the error.
- **A disagreeing index sign is not blocked outright** — it requires an explicit
  acknowledgement, because sign conventions differ between operators and
  aircraft. Editing any index, FWD or AFT clears that acknowledgement.
- **Changing a ULD's max weight never propagates silently** to positions. The
  position limit comes from the aircraft structure (AHM), not from the container;
  the tool offers, explains, and only acts if told to.
- **Intermixing is enforced, not just generated.** In a K/L/P bay string, only
  the two end positions touch the restraint net; only rigid-wall types
  (`ROBUST_STRING_TYPES` = LD-1/3/5/6/10/11) may sit there, and an LD-2 must
  be next to another LD-2 or LD-3. `generateLayouts()` filters out any combo
  that would leave a pallet unrestrained at either end, per aircraft manuals'
  "ULD Configurations / Intermixing" section. L/R pairs share one station, so
  they collapse to a single slot before the string is walked end to end; the
  P row (size M/A/N/Q) is a separate longitudinal string and is excluded from
  this check entirely.
- **Two ULDs of the same type (e.g. AKE and PKC, both "LD3") are scoped by
  IATA code, not just type.** `generateLayouts()` used to pick a candidate
  from the whole `U.ulds` catalog filtered only by `uldType`, so a group
  declared as PKC could silently end up offering AKE's identity (or vice
  versa) whenever their weights happened to collide, and could leak in a
  weight tier that belonged to a different IATA code entirely. Fixed by
  matching `uldType` **and** `iata` to the group's own declaration.
- **Every ULD group stays its own option, even where two types certify the
  same weight.** AKE and PKC match exactly at some B777-200 bays, but they're
  never merged into one generated option — the layout list always offers a
  "full AKE" and a "full PKC" compartment layout as distinct, explicit
  choices, each combining normally with the compartment's other ULD types.
  An earlier version collapsed numerically-identical options into one to
  avoid look-alike duplicates; reverted on request — since PKC diverges from
  AKE at some bays anyway (comp3/comp4), keeping them always separate is the
  more predictable rule than one that behaves differently per compartment.
- **PKC has its own catalog type, `L3P/PKC`, not `LD3`.** It's an LD-3 by the
  manual's numeric type code (`ROBUST_STRING_TYPES` still treats it as
  rigid-wall for the intermixing check), but the pallet form is a different
  product from the AKE container, with its own CSV export code
  (`L3P/PKC,LA`, not the bare `LD3,LA`) and its own entry in the ULD type
  dropdown — it only shows as `L3P/PKC` where a group explicitly declares
  `uldType:"L3P/PKC"`; anything still declared plain `"LD3"` (B787/A330's
  merged AKE/PKC groups, which never needed the split — their weights never
  diverge) is unaffected.
- **A position can be certified for more than one ULD type at once.** When two
  groups reach the exact same fwd/aft/index/max-weight at a zone (AKE and PKC
  where they haven't diverged), that's one physical slot with two certified
  ULDs, not two competing layouts — `generateLayouts()` keeps a single option
  there and records every matching type in `position.certified` (an array of
  `{type, iata}`). Genuinely different numbers (PKC derated below AKE at some
  bays) still produce separate, mutually exclusive options, same as before.
  The expanded layout view shows this both as a `deckStrip()` of tiles (each
  with a native tooltip listing every certified ULD) and as a "Certified
  ULDs" column in the position table.
- **Layout names now carry the IATA code** (e.g. `2LD3(AKE)` vs `2LD3(PKC)`),
  not just the type. Without it, two full-compartment combinations that used
  different containers at a divergent bay could still produce the exact same
  name string and one would vanish at the final `seen[name]` dedup — a real
  layout silently discarded, not just a cosmetic duplicate.

### Layout: full-height, full-width per tool

- `.app` uses `height:100vh; overflow:hidden` — **not** `min-height:100vh`.
  `min-height` does not give flex children a definite size to resolve `flex:1`
  against; only `height` does. This was the root cause of panels stopping
  halfway down the page.
- Each visible panel gets a `.panel-fill` class (`flex:1; display:flex;
  flex-direction:column`) applied **by JS in `openTool()`**, not via a CSS ID
  selector. An ID selector (`#panel-x{display:flex}`) has higher specificity
  than `.panel-hidden{display:none}` and silently overrides it — every panel
  showed at once. `.panel-hidden` now carries `!important` as a second line of
  defence.
- `wide:true` on a `TOOLS` entry removes `main`'s `max-width:1140px`. Applied to
  Message Validator, Secure ZIP, ULD, and Home. **Not** applied to AHM Audit —
  its content is a single small centred card; going full-width just leaves
  empty space on both sides with no benefit.
- The aircraft SVG in the ULD module has an explicit `max-width` (bumped from
  760px to 1100px on request) — its `viewBox` has a fixed aspect ratio, so
  letting it stretch to the wide panel's full width would make it enormous;
  the cap keeps it large but bounded.
- **The SVG hold box stays simple** (a coloured rectangle with the
  compartment number and position count) — two attempts to draw position
  detail *inside* it (zone-number ticks, then a full per-group grid) were
  both tried and both reverted on request. Detail belongs in `zoneGrid()`,
  the HTML panel below the SVG.
- **`zoneGrid()` is generic over every ULD group**, not hardcoded to
  LD3/LD7/LD8. It used to silently drop any group whose `uldType` wasn't
  one of those three — B777-200's PKC, PLA and LD6/ALF groups never showed
  up in the "zone view" panel at all. A group with L/R-suffixed positions
  becomes two rows (labelled "IATA R" / "IATA L", e.g. "AKE R" / "PKC L")
  so each column still holds exactly one cell; a P-suffixed group is one
  "IATA P" row; a plain-named group (PLA, ALF) is one row under its IATA.
  Colours and the legend come straight from `groupColor(uldType)` — added
  LD6 as its own tone (magenta) so ALF doesn't collide with PLA's amber.
  Cell/legend backgrounds use `color-mix()` instead of a fixed set of
  `--tone-soft` CSS variables, so a future group's colour doesn't need a
  matching soft variable declared in the theme to render correctly.

### Reconciliation

- **Matching is by name, with the PNR as the tiebreaker.** When two passengers
  share a name and the ADL carries no `.L/`, **nothing is applied** and a warning
  explains why. Acting on the wrong passenger produces a list that looks right
  and is wrong.
- RP 1708 §2.14.3: within each ADL section the PNR appears once per booking, on
  the first alphabetical surname — so the tool spreads it across a party by
  group identifier.

### Architecture

- One `<script>`, so **order matters**: shell core (defines `$()` and `TOOLS`),
  then core libraries, then module logic, then module UI. Declared in
  `build.manifest.json`, never inferred.
- Each module owns `panel.html`, its logic and its `ui.js`. Nothing else knows it
  exists apart from the manifest and one `TOOLS` entry.
- **Shared helpers belong in core.** `showTextModal` once lived in `uld.js`,
  which made every exporting module depend on the load planner.

---

## How to work on this

```bash
python3 build.py --check          # build the suite and run every test
python3 build.py --only recon     # one module as its own file
node tests/run.js dist/<file>     # test any build
```

**Run `--check` before handing any file over.** It has already caught: a
duplicated function, a leaked line of interface code, rules dropped in a
refactor, and a build order that broke every module at load.

**When you fix a bug, add the case to `tests/run.js`.** That is what turns a fix
into a guarantee. Every check in there exists because something once broke.

---

## Open items

- **The B787-900 template has only compartment 1** (21 positions). Completing it
  needs real station and index figures from the aircraft's weight and balance
  manual. **Do not invent them** — index values are specific to the operator's
  reference station and formula constant.
- **AHM Audit is a shortcut, not a login.** The address field has no default
  value now (repo is public) — enter the local server's address, e.g.
  `http://<server-address>:5000/Account/Login`. If that application exposes an
  authentication endpoint, the form could post to it properly.
- **Code protection is unresolved.** Browser code cannot be hidden; the only real
  option is moving the engine behind an API, at the cost of offline use and of
  sending passenger data to a server. See `docs/PROTECTING-THE-CODE.md`.
- **Reconcile and Builder are switched off** in the suite while being tested
  separately. `docs/MODULES.md` explains how to fold them back in; their `TOOLS`
  entries are preserved in the manifest under `tools_entry`.

---

## Rules that were never in doubt

- Everything runs locally. No message, file or password leaves the browser.
- The manuals are **reformulated as logic and cited**, never reproduced. They are
  copyrighted; a tool that copied them would have a bigger problem than a tool
  that is copied.
- The interface is English throughout, because the tools are shared between
  people.
- **The person I work with communicates in European Portuguese and wants
  answers only** — no visible reasoning, no thinking-out-loud. Keep replies to
  the point: what was found, what was fixed, what's confirmed vs. still open.

---

## Current state

- Build version: **v1.2.22** (auto-incremented on every full `build.py` run —
  see `bump_version()` in `build.py`)
- Test count: **57 passing**, 0 failing
- Last verified: `python3 build.py --check` clean
