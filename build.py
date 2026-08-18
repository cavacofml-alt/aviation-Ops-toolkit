#!/usr/bin/env python3
"""
Build the single-file distribution from the source tree.

    python3 build.py            build
    python3 build.py --check    build, then run the test suite

Everything is concatenated into one <script>, so order is declared in
build.manifest.json rather than inferred. Nothing is minified: the output is
meant to stay readable and auditable, and minifying would not protect it anyway
(see docs/PROTECTING-THE-CODE.md).
"""
import json, os, sys, subprocess, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))

def read(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        raise SystemExit("Missing file listed in the manifest: " + rel)
    with open(path, encoding="utf-8") as f:
        return f.read()

def bump_version(v):
    """Increment the patch segment: 1.2.3 -> 1.2.4"""
    parts = v.split(".")
    parts[-1] = str(int(parts[-1]) + 1)
    return ".".join(parts)

def build(only=None):
    """only: list of module ids to build on their own, or None for the full suite."""
    man  = json.loads(read("build.manifest.json"))
    all_mods = man["modules"] + man.get("disabled", [])

    if only:
        mods = [m for m in all_mods if m["id"] in only]
        missing = set(only) - {m["id"] for m in mods}
        if missing:
            raise SystemExit("Unknown module(s): " + ", ".join(sorted(missing)))
        out_name = "dist/aviation-ops-%s.html" % "-".join(only)
        title = man["name"] + " — " + ", ".join(m["name"] for m in mods)
    else:
        # Increment build number only on the main suite build
        man["version"] = bump_version(man["version"])
        manifest_path = os.path.join(ROOT, "build.manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as _mf:
            json.dump(man, _mf, indent=2)
        mods = man["modules"]
        out_name = man["output"]
        title = man["name"]

    parts, order = [], []
    def add(rel):
        parts.append("\n/*==== FILE: %s ====*/\n" % rel)
        parts.append(read(rel))
        order.append(rel)

    add(man["shell"]["core"])
    for rel in man["core"]:
        add(rel)
    for mod in mods:
        for rel in mod.get("logic", []):
            add(rel)
    for mod in mods:
        for rel in mod.get("ui", []):
            add(rel)

    html = read(man["shell"]["html"])
    if "<!-- MODULE PANELS -->" not in html:
        raise SystemExit("The shell is missing the <!-- MODULE PANELS --> marker.")
    html = html.replace("<!-- MODULE PANELS -->",
                        "\n".join(read(m["panel"]) for m in mods if m.get("panel")))

    shell_js = read(man["shell"]["core"])
    if only:
        # a variant carries only the tools it was asked for
        entries = ",\n  ".join(m["tools_entry"] for m in mods if m.get("tools_entry")) \
                  if all(m.get("tools_entry") for m in mods) else None
        if entries:
            start = shell_js.index("var TOOLS = [")
            end   = shell_js.index("];", start) + 2
            shell_js = shell_js[:start] + "var TOOLS = [\n  " + entries + "\n];" + shell_js[end:]
            parts[1] = shell_js          # replace the shell we already queued
    else:
        for mod in man.get("disabled", []):
            if 'id:"%s"' % mod["id"] in shell_js:
                raise SystemExit(
                    'Module "%s" is disabled but still listed in TOOLS (src/shell/shell-core.js). '
                    'Remove its entry, or move it back into "modules".' % mod["id"])

    banner = ("/*! %s v%s — %s\n"
              "    Built %s from the source tree; see build.manifest.json.\n"
              "    Copyright (c) %s %s. All rights reserved. */\n") % (
        title, man["version"], man["author"], datetime.date.today().isoformat(),
        datetime.date.today().year, man["author"])

    out = html + "\n<script>\n" + banner + "\n" + "\n".join(parts) + "\n</script>\n</body>\n</html>\n"
    out = out.replace("<!-- BUILD_VERSION -->", "v" + man["version"])
    dst = os.path.join(ROOT, out_name)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "w", encoding="utf-8") as f:
        f.write(out)

    print("built %s — %.0f KB" % (out_name, len(out)/1024))
    print("  modules: %s" % ", ".join(m["id"] for m in mods))
    if not only:
        off = man.get("disabled", [])
        if off: print("  off: %s" % ", ".join(m["id"] for m in off))
    return dst

if __name__ == "__main__":
    only = None
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1].split(",")
    dst = build(only)
    if "--check" in sys.argv:
        print()
        r = subprocess.run(["node", os.path.join(ROOT, "tests", "run.js"), dst], cwd=ROOT)
        sys.exit(r.returncode)
