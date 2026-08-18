# Aviation Ops Toolkit

Six tools for ground and passenger operations, in one self-contained HTML file.
No dependencies, no network, no installation — it runs from a double-click.

| Tool | What it does |
|---|---|
| **Message Validator** | Validates IATA teletype messages (PNL, ADL, PSM and 11 more) against PSCRM / AIRIMP, flagging errors character by character |
| **PNL/ADL Reconcile** | Applies a flight's ADLs to its PNL and shows the resulting passenger list |
| **PNL Builder** | Turns a CSV passenger list into a valid PNL, then checks it with the validator |
| **Secure ZIP** | AES-256 encrypted archives with a strong random password, generated in the browser |
| **ULD Layout Generator** | Every valid ULD position layout per compartment, with index and weight |
| **AHM Audit** | Shortcut to the AHM Audit application on the local network |

## Build

```bash
python3 build.py --check
```

Produces `dist/aviation-ops-toolkit.html` and runs the regression suite.
**Picking this up in a new conversation?** Start with
`docs/CONTEXT-FOR-NEXT-SESSION.md` — it holds the reasoning that the code does
not show, and lists what else to hand over.

See `docs/ARCHITECTURE.md` to add a module, and `docs/PROTECTING-THE-CODE.md`
before deciding how to distribute it.

## Sources

Rules derive from PSCRM 30th Edition (RP 1707b, 1708, 1711, 1712, 1715, 1716,
1718, 1719 and related), AIRIMP 34th Edition, AHM 780/730 and SSIM. They are
reformulated as validation logic with clause references; no part of the manuals
is reproduced.

Copyright (c) 2026 Luís Cavaco. All rights reserved.
