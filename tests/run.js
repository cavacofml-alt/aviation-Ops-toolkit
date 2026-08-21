#!/usr/bin/env node
/*
 * Regression suite for the built distribution.
 *
 *     node tests/run.js
 *
 * Every check here exists because something once broke. Run it after any
 * change: the whole point of the source tree is that a mistake in one module
 * should not be able to hide in 290 KB of concatenated script.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIST = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, "dist", "aviation-ops-toolkit.html");
console.log("Testing " + path.relative(ROOT, DIST));

let pass = 0, fail = 0;
const failures = [];
function ok(name, cond, detail){
  if(cond){ pass++; console.log("  \u2713 " + name); }
  else { fail++; failures.push(name + (detail ? " — " + detail : "")); console.log("  \u2717 " + name + (detail ? " — " + detail : "")); }
}
function section(t){ console.log("\n" + t); console.log("-".repeat(t.length)); }

if(!fs.existsSync(DIST)){ console.error("No build found. Run: python3 build.py"); process.exit(1); }
const HTML = fs.readFileSync(DIST, "utf8");
const SCRIPT = HTML.split("<script>")[1].split("</script>")[0];

/* Which modules are in this particular build? The suite runs against the full
   suite and against single-module variants, and a check for something that was
   never included is noise, not a failure. */
const present = {};
// A module is in this build when its panel is: file paths lie, because some
// module folders also hold files that belong to core (msgcheck/examples.js).
[...HTML.matchAll(/<section id="panel-([a-z]+)"/g)].forEach(m => { if(m[1] !== "home") present[m[1]] = true; });
const inBuild = id => !!present[id];
console.log("Modules in this build: " + Object.keys(present).join(", ") + "\n");

/* ---------- load pieces by their build sentinel ---------- */
function fileOf(rel){
  const tag = "/*==== FILE: " + rel + " ====*/";
  const a = SCRIPT.indexOf(tag);
  if(a < 0) return "";
  const b = SCRIPT.indexOf("/*==== FILE:", a + tag.length);
  return SCRIPT.slice(a + tag.length, b < 0 ? SCRIPT.length : b);
}
const engineSrc = fileOf("src/core/engine.js") + fileOf("src/modules/msgcheck/examples.js");
let API = {};
try {
  eval(engineSrc + ";API_OUT = {validate, EX_OK, EX_BAD, EX_BY_TYPE, EX_BAD_BY_TYPE};");
  API = API_OUT;
} catch(e){ console.error("Engine failed to load: " + e.message); process.exit(1); }

section("Validation engine");
ok("engine loads", typeof API.validate === "function");
const okFindings = API.validate(API.EX_OK).filter(f => !f.dup);
ok("clean example is clean", okFindings.length === 0, okFindings.length + " findings");
const badFindings = API.validate(API.EX_BAD).filter(f => !f.dup);
ok("faulty example produces findings", badFindings.length > 20, badFindings.length + " findings");

section("Examples, one per message type");
let cleanCount = 0;
Object.entries(API.EX_BY_TYPE).forEach(([type, msg]) => {
  const f = API.validate(msg).filter(x => !x.dup && x.sev !== "info");
  if(f.length === 0) cleanCount++;
  else ok(type + " example is clean", false, f[0].msg.replace(/<[^>]+>/g, "").slice(0, 60));
});
ok("all 14 clean examples validate clean", cleanCount === 14, cleanCount + "/14");
let badCount = 0;
Object.entries(API.EX_BAD_BY_TYPE).forEach(([type, msg]) => {
  if(API.validate(msg).filter(x => !x.dup).length > 0) badCount++;
  else ok(type + " faulty example produces findings", false);
});
ok("all 14 faulty examples produce findings", badCount === 14, badCount + "/14");

section("Rules that were once wrong");
const P = "PNL\nTP1234/16JUL LIS PART1\n-OPO01Y\n";
function has(msg, needle){ return API.validate(msg).some(f => f.msg.indexOf(needle) >= 0); }

ok("ADL lists only what changed — no error on a partial group",
   !has("ADL\nIZ1294/04AUG TLV PART1\n-OTP168Y\nADD\n1A/BMR-ZZ20\nENDADL", "identifier indicates"));
ok("a group larger than declared is still an error",
   has("ADL\nIZ1294/04AUG TLV PART1\n-OTP168Y\nADD\n3A/BMR/CMR/DMR-ZZ2\nENDADL", "listed but the booking holds"));
ok("PNL keeps the strict group rule",
   has("PNL\nTP1234/16JUL LIS PART1\n-OPO04Y\n1A/BMR-C4\n1C/DMR-C4\nENDPNL", "identifier indicates"));
ok("long PNR locator is a warning, not an error",
   API.validate(P + "1A/BMR\n.L/ABCDEFGHIJ\nENDPNL").filter(f => f.msg.indexOf("PNR address") >= 0 && f.sev === "warn").length === 1);
ok("the continuation completes the association, not the document",
   !has("ADL\nIZ1294/04AUG TLV PART1\n-OTP168Y\nADD\n1KALU/SAMUELJOHNBOSCOMR-ZT20\n" +
        ".R/DOCS HK1//////M//KALU/SAMUELJOHNBOSCO-1KALU/SAMUELJOHNBOSCOM\n.RN/R\nENDADL", "does not match"));
ok("a document belonging to someone else is caught",
   has(P + "1SILVA/JOAOMR\n.R/DOCS HK1/P/PRT/K123456/PRT/12MAY80/M/01JAN30/CURRIE/MARIE\nENDPNL", "does not match"));
ok("DOCS with trailing -1SURNAME/ and given name on .RN/ — no hyphen warning",
   !has("PNL\nTP1234/16JUL LIS PART1\n-OPO01Y\n1ABDO/PERIMISSMRS\n" +
        ".R/DOCS HK1/P/SY/123456789/SY/01JAN80/F/01JAN30/ABDO/PERI-1ABDO/\n" +
        ".RN/PERIMISS\nENDPNL", "Hyphen in the Remarks"));
ok("hyphen before digits in free text is flagged (not a name association)",
   has(P + "1SILVA/JOAOMR\n.R/OTHS HK1 REF-12345\nENDPNL", "Hyphen in the Remarks"));
ok("bare .R/DOCS with status+fields entirely on .RN/ is not a false status error",
   !has(P + "1DAAL/JEMYRAMRS\n.R/DOCS\n" +
        ".RN/ HK1/P/NLD/123456789/NLD/25DEC01/F/19APR90/DAAL/JEMYRAJESS\n" +
        ".RN/ICA/-1DAAL/JEMYRAMRS\nENDPNL", "without status"));
ok("bare .R/DOCS with no .RN/ continuation is still flagged (no false negative)",
   has(P + "1SILVA/JOAOMR\n.R/DOCS\nENDPNL", "without status"));
ok("DOCS with a short free text (fewer than 8 fields) does not crash posOf",
   (()=>{ try{ API.validate(P + "1SILVA/JOAOMR\n.R/DOCS HK1 /I/ESP/\nENDPNL"); return true; }catch(e){ return false; } })());
ok("DOCS expiry date split across .RN/ is completed, not falsely flagged",
   !has(P + "1CORONEL/MARIAMRS\n.R/DOCS HK1 /P/ESP//ESP//F/11OCT\n.RN/27/CORONEL/MARIA\nENDPNL",
        "invalid document expiry"));
ok("a genuinely invalid DOCS expiry is still caught (no continuation involved)",
   has(P + "1SILVA/JOAOMR\n.R/DOCS HK1 /P/ESP//ESP//F/99XXX\nENDPNL", "invalid document expiry"));
ok("the last passenger is checked even without an END element",
   has(P + "1SILVA/JOAOMR\n.R/DOCS HK1/P/PRT/K123456/PRT/12MAY80/M/01JAN20/SILVA/JOAO", "expired"));
ok("elements run together are caught",
   has(P + "1DUARTE/CARLOSMR .L/X9Y8Z7.R/TKNE HK1 0471234567890/1\nENDPNL", "Missing space between"));
ok("a dot inside free text is not an element",
   !has(P + "1A/BMR .R/STCR KK1 BROKEN HIP.NEEDS HELP\nENDPNL", "without the mandatory slash"));
ok("a class outside the RBD is caught",
   has("PNL\nTP1234/16JUL LIS PART1\nRBD J/JCD Y/YBHKM\n-OPO01Z\n1A/BMR\nENDPNL", "is not in the"));
ok("INFT on a CHLD passenger is an error",
   has(P + "1COSTA/TIAGOMSTR .R/CHLD HK1 12MAY21 .R/INFT HK1 COSTA/BABY 10JAN23\nENDPNL",
       "care of an adult"));
ok("INFT on a single adult (no CHLD) is not flagged",
   !has(P + "1COSTA/ANAMRS .R/INFT HK1 COSTA/BABY 10JAN23\nENDPNL",
        "care of an adult"));
ok("INFT+CHLD on a multi-count element is not flagged (ambiguous — different passengers)",
   !has(P + "2COSTA/ANAMRS/TIAGOMSTR .R/CHLD HK1 12MAY21 .R/INFT HK1 COSTA/BABY 10JAN23\nENDPNL",
        "care of an adult"));
ok("INFT exactly 2 calendar years old on flight date is caught (float fix)",
   has(P + "1COSTA/ANAMRS .R/INFT HK1 COSTA/BABY 05MAR22\nENDPNL".replace("TP1234/16JUL","TP1234/05MAR"),
       "INFT"));
ok("ADL multi-dest DEL,DEL,ADD is not flagged (reset per block)",
   !has("ADL\nTP1234/16JUL LIS PART1\n-OPO04J\nDEL\n1ALMEIDA/RUIMR\n-OPO04Y\nDEL\n1FERREIRA/JOAOMR\nADD\n1COSTA/PEDROMR\nENDADL",
        "out of order"));
ok("ADL single block DEL,ADD,DEL is still flagged",
   has("ADL\nTP1234/16JUL LIS PART1\n-OPO04Y\nDEL\n1ALMEIDA/RUIMR\nADD\n1COSTA/PEDROMR\nDEL\n1FERREIRA/JOAOMR\nENDADL",
       "out of order"));
ok("FQT tier suffix /SEN is accepted",
   !has(P + "1COSTA/ANAMRS .F/LH 12345678/SEN\nENDPNL", "Malformed Frequent"));
ok("FQT tier suffix -EMER is accepted",
   !has(P + "1COSTA/ANAMRS .F/BA 1234567-EMER\nENDPNL", "Malformed Frequent"));

section("Deduplication");
const dupMsg = "PNL\nTP1234/16JUL LIS PART1\n-OPO04Y\n" +
  "1A/BMR .R/VGGL HK1\n1C/DMR .R/VGGL HK1\n1E/FMR .R/VGGL HK1\n1G/HMR .R/VGGL HK1\nENDPNL";
const unk = API.validate(dupMsg).filter(f => f.tag === "ssrunk");
ok("repeated findings collapse to one entry", unk.filter(f => !f.dup).length === 1);
ok("every occurrence is still marked in the telex", unk.filter(f => f.dup).length === 3);

/* ---------- module logic, still without a DOM ---------- */
section("Modules");
global.esc = x => String(x == null ? "" : x);
global.$ = () => ({ value: "", querySelector: () => null, querySelectorAll: () => [] });



if(inBuild("securezip")) try {
  global.crypto = require("crypto").webcrypto;
  eval(fileOf("src/core/crypto.js") + ";CRY = {sha1, hmacSha1, pbkdf2Sha1, aesExpandKey, aesEncryptBlock, crc32, buildEncryptedZip};");
  const hex = b => Buffer.from(b).toString("hex");
  const str = s => new Uint8Array(Buffer.from(s, "utf8"));
  ok("SHA-1 matches the published vector",
     hex(CRY.sha1(str("abc"))) === "a9993e364706816aba3e25717850c26c9cd0d89d");
  ok("PBKDF2 matches RFC 6070",
     hex(CRY.pbkdf2Sha1(str("password"), str("salt"), 4096, 20)) === "4b007901b765489abead49d926f721d065a429c1");
  ok("AES-256 matches FIPS-197 C.3",
     hex(CRY.aesEncryptBlock(CRY.aesExpandKey(new Uint8Array(Buffer.from("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f","hex"))),
        new Uint8Array(Buffer.from("00112233445566778899aabbccddeeff","hex")))) === "8ea2b7ca516745bfeafc49904b496089");
  const big = new Uint8Array(70000); for(let i=0;i<big.length;i++) big[i] = (i*7+13) & 0xff;
  const zip = CRY.buildEncryptedZip([{name:"t.bin", data:big, deflated:null}], "pw");
  ok("encrypted ZIP is produced for data past the counter rollover", zip.length > big.length);
} catch(e){ ok("crypto module loads", false, e.message); }

if(inBuild("uld")) try {
  const uldAll = fileOf("src/modules/uld/templates.js") + fileOf("src/modules/uld/uld.js");
  const uld = uldAll.split("/* ---------- events ---------- */")[0];
  eval(uld.replace(/function uldRender\(\)[\s\S]*?\n}\n/, "").replace(/function renderStepbar\(\)[\s\S]*?\n}\n/, "") +
       ";ULD = {TEMPLATES, U, generateLayouts, validateIndex, indexIssues};");
  ok("all aircraft templates load", ULD.TEMPLATES.length === 3);
  ok("index sign against the reference station",
     ULD.validateIndex("0.006", "19", "36") !== null && ULD.validateIndex("-0.006", "19", "36") === null);
  ok("a zero index asks for confirmation", ULD.validateIndex("0", "19", "36") !== null);
  const t = ULD.TEMPLATES[1];
  ULD.U.ulds = JSON.parse(JSON.stringify(t.ulds));
  ULD.U.compartments = JSON.parse(JSON.stringify(t.compartments));
  ULD.U.refStation = t.refStation;
  ok("a correct template raises no blocking issue", ULD.indexIssues().hard.length === 0);
  ULD.generateLayouts();
  const counts = ULD.U.compartments.map(c => (ULD.U.layouts[c.number] || []).length);
  ok("A330 template generates layouts in every compartment", counts.every(n => n > 0), counts.join("/"));

  const b = ULD.TEMPLATES[0];
  ULD.U.ulds = JSON.parse(JSON.stringify(b.ulds));
  ULD.U.compartments = JSON.parse(JSON.stringify(b.compartments));
  ULD.U.refStation = b.refStation;
  ok("B787 template has all 4 compartments", ULD.U.compartments.length === 4,
     ULD.U.compartments.length + '/4');
  ok("B787 raises no blocking index issue", ULD.indexIssues().hard.length === 0);
  ULD.generateLayouts();
  const b787counts = ULD.U.compartments.map(c => (ULD.U.layouts[c.number] || []).length);
  ok("B787 template generates layouts in every compartment", b787counts.every(n => n > 0), b787counts.join("/"));

  const g = ULD.TEMPLATES[2];
  ULD.U.ulds = JSON.parse(JSON.stringify(g.ulds));
  ULD.U.compartments = JSON.parse(JSON.stringify(g.compartments));
  ULD.U.refStation = g.refStation;
  ok("B777 template has all 4 compartments", ULD.U.compartments.length === 4,
     ULD.U.compartments.length + '/4');
  ok("B777 raises no blocking index issue", ULD.indexIssues().hard.length === 0);
  ULD.generateLayouts();
  const b777counts = ULD.U.compartments.map(c => (ULD.U.layouts[c.number] || []).length);
  ok("B777 template generates layouts in every compartment", b777counts.every(n => n > 0), b777counts.join("/"));
} catch(e){ ok("ULD module loads", false, e.message); }

if(inBuild("recon")) try {
  eval(fileOf("src/modules/recon/recon.js") + ";RECON = reconcile;");
  const msg = ["PNL","TP1/16JUL LIS PART1","-OPO02Y","1ALMEIDA/RUIMR .L/AAA111","1BRAGA/LUISAMS .R/WCHR HK1","ENDPNL",
               "ADL","TP1/16JUL LIS PART1","-OPO01Y","DEL","1ALMEIDA/RUIMR","ENDADL"].join("\n");
  const r = RECON(msg);
  ok("reconcile applies DEL", r.list.length === 1 && r.list[0].surname === "BRAGA");
  const amb = ["PNL","TP1/16JUL LIS PART1","-OPO02Y","1SILVA/JOAOMR .L/AAA111","1SILVA/JOAOMR .L/BBB222","ENDPNL",
               "ADL","TP1/16JUL LIS PART1","-OPO01Y","DEL","1SILVA/JOAOMR","ENDADL"].join("\n");
  const r2 = RECON(amb);
  ok("an ambiguous DEL removes nobody", r2.list.length === 2 && r2.warnings.length > 0);
  ok("a PNR resolves the ambiguity",
     RECON(amb.replace("DEL\n1SILVA/JOAOMR", "DEL\n1SILVA/JOAOMR .L/BBB222")).list.length === 1);
} catch(e){ ok("recon module loads", false, e.message); }

if(inBuild("builder")) try {
  eval(fileOf("src/modules/builder/builder.js") + ";BUILD = {buildPNL, parseCSV};");
  const csv = ["Surname,Given name,Title,Destination,Class,PNR,SSR,Seat",
               "Silva,Joao,MR,OPO,Y,ABC123,VGML,12A",
               "Silva,Maria,MRS,OPO,Y,ABC123,,12B",
               "Almeida,Rui,MR,OPO,Y,,WCHR,"].join("\n");
  const built = BUILD.buildPNL(BUILD.parseCSV(csv), { flight:"TP1234/16JUL LIS PART1", defaultCls:"Y" });
  ok("builder produces a message", !!built.text);
  ok("the generated PNL passes our own validator",
     API.validate(built.text).filter(f => !f.dup).length === 0);
  ok("no generated line exceeds 64 characters", built.text.split("\n").every(l => l.length <= 64));
  ok("a shared PNR becomes a party/group", /-A2/.test(built.text));
} catch(e){ ok("builder module loads", false, e.message); }

if(inBuild("msgcheck")) try {
  eval(fileOf("src/modules/msgcheck/report.js").split("/* ---------- wiring ---------- */")[0] + ";REPORT = buildReport;");
  ok("report includes the manual reference", REPORT("PNL\n", []).indexOf("PSCRM") >= 0);
} catch(e){ ok("report builder loads", false, e.message); }

/* ---------- the whole script must actually run ----------
   This is the check that was missing when the build order changed and every
   module broke: the pieces all passed their own tests, but nothing had ever
   executed the bundle from top to bottom. */
section("Boot");
try {
  const ids = [...HTML.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const store = {};
  const el = id => (store[id] = store[id] || {
    id, value:"", disabled:false, hidden:false, files:[], _html:"", _text:"",
    style:new Proxy({}, {get:()=>"", set:()=>true}),
    classList:{add(){}, remove(){}, contains(){return false;}}, dataset:{},
    get innerHTML(){return this._html;}, set innerHTML(v){this._html=v;},
    get textContent(){return this._text;}, set textContent(v){this._text=v;},
    setAttribute(){}, removeAttribute(){}, getAttribute(){return null;},
    addEventListener(){}, appendChild(){}, remove(){}, focus(){}, select(){}, click(){},
    querySelector(){return el("q");}, querySelectorAll(){return [];}, closest(){return null;}
  });
  ids.forEach(el);
  global.document = {
    documentElement: el("html"), body: el("body"),
    getElementById: el, querySelector: s => store[s] || el(s),
    querySelectorAll: () => [], createElement: el,
    addEventListener(){}, removeEventListener(){}
  };
  global.window = {
    storage: undefined, scrollTo(){}, addEventListener(){}, isSecureContext:true,
    matchMedia: () => ({ matches:false }),
    getComputedStyle: () => ({ lineHeight:"20px", fontSize:"13px" }),
    localStorage: { getItem:()=>null, setItem(){}, removeItem(){} },
    innerWidth:1200, pageYOffset:0, pageXOffset:0, location:{}
  };
  global.alert = () => {};
  global.navigator = { clipboard:{ writeText:()=>Promise.resolve() } };
  global.URL = global.URL || function(){};
  global.Blob = function(){};
  global.FileReader = function(){ this.readAsText = () => {}; this.readAsArrayBuffer = () => {}; };
  global.CompressionStream = undefined;
  global.Response = function(){};

  eval(SCRIPT);
  ok("the whole bundle runs without throwing", true);

  const tools = (SCRIPT.match(/\{ id:"[a-z]+", name:"/g) || []).length;
  const panels = (HTML.match(/<section id="panel-[a-z]+"/g) || []).length;
  ok("every registered tool has a panel", panels === tools + 1, tools + " tools, " + panels + " panels (home included)");
} catch(e){
  ok("the whole bundle runs without throwing", false, e.message);
}

/* ---------- packaging ---------- */
section("Distribution");
ok("no external scripts or styles", (HTML.match(/src="http/g) || []).length === 0 &&
   (HTML.match(/href="http/g) || []).length === 0);
ok("document is well formed", HTML.startsWith("<!DOCTYPE html>") && HTML.trim().endsWith("</html>"));
ok("copyright banner present", HTML.indexOf("All rights reserved") > 0);
const decls = SCRIPT.split("\n")
  .filter(l => /^(var|let|const|function)\s/.test(l))
  .map(l => l.match(/^(?:var|let|const|function)\s+([A-Za-z_$][\w$]*)/))
  .filter(Boolean).map(m => m[1]);
const dups = decls.filter((d, i) => decls.indexOf(d) !== i);
ok("no duplicate top-level declarations", dups.length === 0, dups.join(", "));

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "build.manifest.json"), "utf8"));
(manifest.disabled || []).forEach(m => {
  if(!inBuild(m.id))
    ok('disabled module "' + m.id + '" leaves nothing behind',
       HTML.indexOf('id="panel-' + m.id + '"') < 0 && SCRIPT.indexOf('id:"' + m.id + '"') < 0);
});
manifest.modules.concat(manifest.disabled || []).forEach(m => {
  if(inBuild(m.id))
    ok('module "' + m.id + '" has its panel in the build', HTML.indexOf('id="panel-' + m.id + '"') > 0);
});

console.log("\n" + "=".repeat(46));
console.log(pass + " passed, " + fail + " failed");
if(fail){ console.log("\nFailures:"); failures.forEach(f => console.log("  - " + f)); }
process.exit(fail ? 1 : 0);
