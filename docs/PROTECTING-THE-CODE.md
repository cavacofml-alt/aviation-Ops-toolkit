# Protecting the code

## The uncomfortable part first

**Code that runs in a browser cannot be hidden.** Anything the browser executes,
the browser received — and anyone can read it with `Ctrl+U` or the developer
tools. This is not a weakness of this project; it is how the web works.

Minifying and obfuscating are worth being clear about: they raise the effort a
little and lower *your* ability to maintain the thing a lot. Automatic
deobfuscators exist and are good. Anyone motivated enough to want your rule
engine will not be stopped by renamed variables.

So the question is not "how do I lock the file" but **"what is actually worth
protecting, and what would it cost to protect it?"**

## What is valuable here

Not the interface. Any competent developer can rebuild the screens.

The value is in `src/core/engine.js`: several hundred checks derived from the
PSCRM and AIRIMP, each tied to the clause it comes from, plus the judgement calls
about severity — what is an error, what is a warning, what is bilateral and must
not be flagged at all. That took reading the manuals carefully and being
corrected by real messages. It is not reproducible in an afternoon.

## The options, honestly

| Approach | Real protection | What it costs you |
|---|---|---|
| **Split: engine on a server, UI in the browser** | **Yes.** The rules never leave your machine | Needs a server; the offline single file goes away |
| Desktop app (Electron, Tauri) | Little — the code sits inside the package, extractable | A build pipeline per platform |
| Obfuscation | No. Slows a curious person by minutes | Makes debugging and maintenance harder |
| Copyright notice and a licence | Not technically, but **legally yes** | Nothing |

## If you want real protection

Move the engine behind an API:

```
Browser (UI only)                     Your server
  paste message  ──── POST /validate ────▶  engine.js runs here
  render findings ◀─── findings JSON  ────
```

The browser gets the interface and the results, never the rules. Two side
benefits worth having: you fix a rule once and everyone has it immediately, and
you can see which rules fire most often in practice.

Two costs worth stating plainly: it stops working offline, and passenger data
would start travelling to a server — which turns a tool that today keeps
everything on the operator's machine into one that needs a privacy assessment.
For a tool handling names and passport data, that is not a small change.

## The pragmatic minimum, today

1. **Keep the copyright banner.** The build writes it into every file:
   `Copyright (c) <year> <author>. All rights reserved.`
2. **Add a licence file** stating what recipients may and may not do.
3. **Decide who owns it.** If this was built for work, your employer very likely
   owns the copyright regardless of what the file says. That is a conversation to
   have before distribution, not after.
4. **Distribute deliberately.** A file sent to a colleague is a file that can be
   forwarded. If that matters, host it somewhere with access control instead of
   emailing it around.

## A note on the manuals

The engine reformulates rules as validation logic and cites the clauses; it does
not reproduce the PSCRM or AIRIMP text. Keep it that way. Those manuals are
themselves copyrighted, and a tool that copied them would have a much bigger
problem than someone copying the tool.
