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



if(inBuild("airmsg")) try {
  eval(fileOf("src/modules/airmsg/airmsg.js") +
       ";AM_LIB = {parsePRL, prlHeaders, parsePAX, paxHeaders, parseDelimited, normalizeFlightNumber, " +
       "pnlDate, flightDateDDMMM, buildPnl, validatePnlRows, makeCsv};");

  const prlMsg = [
    "1SILVA/JOAOMR .L/ABC123",
    ".R/SEAT HK1 12A",
    ".R/DOCS HK1/P/PRT/123456789/PRT/01JAN90/M/01JAN30/SILVA"
  ].join("\n");
  const prlRows = AM_LIB.parsePRL(prlMsg);
  ok("PRL parser reads a passenger with one document",
     prlRows.length === 1 && prlRows[0].RecordLocator === "ABC123" && prlRows[0].DocumentNumber === "123456789",
     JSON.stringify(prlRows));

  const paxMsg = [
    "UNH*1*PAXLST", "NAD*FL*1*1*SILVA:JOAO", "ATT*2**M", "DTM*329:900101",
    "NAT*2*PRT", "RFF*AVF:ABC123", "RFF*SEA:12A",
    "DOC*P*123456789", "DTM*182:200101", "DTM*36:300101", "LOC*91*PRT"
  ].join("'");
  const paxRows = AM_LIB.parsePAX(paxMsg);
  ok("PAXLST parser reads a passenger with one document",
     paxRows.length === 1 && paxRows[0].Surname === "SILVA" && paxRows[0].RecordLocator === "ABC123" &&
     paxRows[0].DocumentType === "P", JSON.stringify(paxRows));

  ok("parseDelimited auto-detects the ; separator",
     JSON.stringify(AM_LIB.parseDelimited("A;B\n1;2")) === JSON.stringify([{A:"1",B:"2"}]));
  ok("parseDelimited auto-detects the , separator",
     JSON.stringify(AM_LIB.parseDelimited("A,B\n1,2")) === JSON.stringify([{A:"1",B:"2"}]));

  ok("normalizeFlightNumber pads short numeric flight numbers",
     AM_LIB.normalizeFlightNumber("7") === "007");
  ok("normalizeFlightNumber keeps a trailing letter suffix",
     AM_LIB.normalizeFlightNumber("123A") === "123A");
  ok("pnlDate formats an ISO date as DDMMMYY", AM_LIB.pnlDate("2026-08-25") === "25AUG26");

  const pnlRow = { Surname:"SILVA", GivenName:"JOAO", Gender:"M", DateOfBirth:"1990-01-01",
    Nationality:"PRT", RecordLocator:"ABC123", Seat:"12A", DocumentType:"P", DocumentNumber:"123456789",
    DocumentIssueCountry:"PRT", DocumentIssueDate:"2020-01-01", DocumentExpiryDate:"2030-01-01", BCN:"" };
  const pnl = AM_LIB.buildPnl([pnlRow], {airline:"XC", flight:"7", date:"2026-08-25", origin:"LIS", destination:"OPO", defaultClass:"Y"});
  ok("buildPnl produces a well-formed PNL for one passenger",
     pnl.text.startsWith("PNL\r\nXC007/25AUG LIS PART1") && pnl.text.trim().endsWith("ENDPNL") &&
     pnl.passengers === 1 && pnl.documents === 1, pnl.text);
  ok("buildPnl rejects a passenger list missing required columns",
     (() => { try{ AM_LIB.validatePnlRows([{Surname:"X"}]); return false; } catch(e){ return true; } })());

  // A blank RecordLocator (or Seat/BCN) must drop the whole optional field,
  // not print a trailing qualifier with nothing after it (".L/" alone).
  const bareRow = { Surname:"AMERICA", GivenName:"CAPTAIN", Gender:"", DateOfBirth:"", Nationality:"",
    RecordLocator:"", Seat:"", DocumentType:"", DocumentNumber:"", DocumentIssueCountry:"",
    DocumentIssueDate:"", DocumentExpiryDate:"", BCN:"" };
  const barePnl = AM_LIB.buildPnl([bareRow], {airline:"XA", flight:"878", date:"2026-08-25", origin:"QYI", destination:"AMS", defaultClass:"C"});
  ok("buildPnl omits .L/ entirely when RecordLocator is blank",
     barePnl.text.includes("1AMERICA/CAPTAINMR") && !barePnl.text.includes(".L/"), barePnl.text);

  ok("buildPnl converts DocumentIssueCountry to ISO-2, same as Nationality",
     pnl.text.includes(".R/DOCS HK1/P/PT/123456789/PT/"), pnl.text);

  // Two different passengers sharing a name with no PNR assigned yet (both
  // RecordLocator blank) must not collapse into one passenger and lose a
  // passport line — DateOfBirth in the dedupe key tells them apart.
  const twinA = { Surname:"SILVA", GivenName:"JOAO", Gender:"M", DateOfBirth:"1990-01-01",
    Nationality:"PRT", RecordLocator:"", Seat:"1A", DocumentType:"P", DocumentNumber:"111111111",
    DocumentIssueCountry:"PRT", DocumentIssueDate:"2020-01-01", DocumentExpiryDate:"2030-01-01", BCN:"" };
  const twinB = { Surname:"SILVA", GivenName:"JOAO", Gender:"M", DateOfBirth:"1985-05-05",
    Nationality:"PRT", RecordLocator:"", Seat:"2B", DocumentType:"P", DocumentNumber:"222222222",
    DocumentIssueCountry:"PRT", DocumentIssueDate:"2020-01-01", DocumentExpiryDate:"2030-01-01", BCN:"" };
  const twinsPnl = AM_LIB.buildPnl([twinA, twinB], {airline:"XC", flight:"7", date:"2026-08-25", origin:"LIS", destination:"OPO", defaultClass:"Y"});
  ok("buildPnl keeps two same-named passengers (blank PNR) as separate entries",
     twinsPnl.passengers === 2 && twinsPnl.text.includes("111111111") && twinsPnl.text.includes("222222222"),
     twinsPnl.text);
} catch(e){ ok("Airline Message Toolkit module loads", false, e.message); }

if(inBuild("securezip")) try {
  global.crypto = require("crypto").webcrypto;
  eval(fileOf("src/core/crypto.js") + ";CRY = {sha1, hmacSha1, pbkdf2Sha1, aesExpandKey, aesEncryptBlock, crc32, buildEncryptedZip, buildZipCryptoZip};");
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

  /* ZipCrypto — the weak legacy format, offered because it is the only one
     Windows Explorer opens unaided. Decrypted here straight from the spec
     (init keys from the password, XOR with the keystream, advance the keys
     on the plaintext), so a writer that advanced them on the ciphertext, or
     wrote the header wrong, would fail this. */
  const zcPlain = str("PNL\r\nTP1234/16JUL LIS PART1\r\nENDPNL\r\n");
  const zcZip = CRY.buildZipCryptoZip([{name:"m.txt", data:zcPlain, deflated:null}], "pw12345");
  const dv = new DataView(zcZip.buffer, zcZip.byteOffset);
  const zcFlags = dv.getUint16(6, true), zcMethod = dv.getUint16(8, true);
  const zcCrc = dv.getUint32(14, true), zcComp = dv.getUint32(18, true), zcUncomp = dv.getUint32(22, true);
  const zcNameLen = dv.getUint16(26, true);
  const body = zcZip.subarray(30 + zcNameLen, 30 + zcNameLen + zcComp);
  ok("ZipCrypto header marks the entry encrypted and sizes it with the 12-byte prefix",
     (zcFlags & 1) === 1 && zcMethod === 0 && zcUncomp === zcPlain.length &&
     zcComp === zcPlain.length + 12 && zcCrc === CRY.crc32(zcPlain),
     "flags " + zcFlags + " comp " + zcComp + " uncomp " + zcUncomp);

  const T = [];
  for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c = (c&1) ? (0xEDB88320 ^ (c>>>1)) : (c>>>1); T[n]=c>>>0; }
  const keys = [0x12345678, 0x23456789, 0x34567890];
  const upd = b => {
    keys[0] = (T[(keys[0] ^ b) & 0xff] ^ (keys[0] >>> 8)) >>> 0;
    keys[1] = (keys[1] + (keys[0] & 0xff)) >>> 0;
    keys[1] = (Math.imul(keys[1], 134775813) + 1) >>> 0;
    keys[2] = (T[(keys[2] ^ (keys[1] >>> 24)) & 0xff] ^ (keys[2] >>> 8)) >>> 0;
  };
  Buffer.from("pw12345", "utf8").forEach(upd);
  const plain = new Uint8Array(body.length);
  for(let i=0;i<body.length;i++){
    const t = (keys[2] | 2) & 0xffff;
    plain[i] = (body[i] ^ ((Math.imul(t, t ^ 1) >>> 8) & 0xff)) & 0xff;
    upd(plain[i]);
  }
  ok("ZipCrypto content decrypts back to the original with the right password",
     Buffer.from(plain.subarray(12)).toString("utf8") === Buffer.from(zcPlain).toString("utf8"),
     Buffer.from(plain.subarray(12)).toString("utf8").slice(0, 30));
  ok("ZipCrypto check byte is the CRC's high byte, so a wrong password is rejected early",
     plain[11] === ((zcCrc >>> 24) & 0xff), plain[11] + " vs " + ((zcCrc >>> 24) & 0xff));
} catch(e){ ok("crypto module loads", false, e.message); }

if(inBuild("uld")) try {
  // store.js reaches for window/document as it loads: with neither storage
  // backend present it settles on "none", which is what we want here — the
  // undo stack lives in memory either way.
  global.window = global.window || { addEventListener(){} };
  global.document = global.document || { getElementById: () => null };
  const uldAll = fileOf("src/core/crypto.js") + fileOf("src/core/ui.js") +
    fileOf("src/core/store.js") + fileOf("src/modules/uld/templates.js") + fileOf("src/modules/uld/uld.js");
  const uld = uldAll.split("/* ---------- events ---------- */")[0];
  eval(uld.replace(/function uldRender\(\)[\s\S]*?\n}\n/, "").replace(/function renderStepbar\(\)[\s\S]*?\n}\n/, "") +
       ";ULD = {TEMPLATES, U, generateLayouts, validateIndex, indexIssues, csvLines, csvAll, " +
       "buildXlsxFile, allLayoutRows, EXPORT_HEADERS, isPairType, pairSourceFor, pairAtBase, pairOffsetOf, clampDecimals, exportIndex, uldBase, groupLabel, maxWeightIssue, pushUndo, undoLast};");
  ok("all aircraft templates load", ULD.TEMPLATES.length === 5);
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

  // The operator's own upload system expects a fixed "D3" sheet name on any
  // .xlsx it accepts, for any aircraft (confirmed against
  // 6H_A330243_TEMPLATE.xlsx) — not related to compartment numbering. Read
  // it back out of the raw ZIP bytes (everything here is stored, method 0,
  // so no deflate support is needed to check it).
  function readStoredZipEntry(bytes, name){
    const nameBytes = Buffer.from(name, "utf8");
    for(let pos=0; pos+30<bytes.length; ){
      if(!(bytes[pos]===0x50&&bytes[pos+1]===0x4b&&bytes[pos+2]===0x03&&bytes[pos+3]===0x04)){ pos++; continue; }
      const size = bytes.readUInt32LE(pos+18), nameLen = bytes.readUInt16LE(pos+26), extraLen = bytes.readUInt16LE(pos+28);
      const nameStart = pos+30, dataStart = nameStart+nameLen+extraLen;
      if(bytes.slice(nameStart, nameStart+nameLen).equals(nameBytes))
        return bytes.slice(dataStart, dataStart+size).toString("utf8");
      pos = dataStart+size;
    }
    return null;
  }
  const xlsxBytes = Buffer.from(ULD.buildXlsxFile("D3", ULD.EXPORT_HEADERS, ULD.allLayoutRows()));
  const workbookXml = readStoredZipEntry(xlsxBytes, "xl/workbook.xml");
  ok("ULD XLSX export uses the upload system's required sheet name D3",
     !!workbookXml && workbookXml.includes('name="D3"'), workbookXml);

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

  // Intermixing (which types may sit at a string's end) is deliberately not
  // enforced — the caller's downstream program controls that constraint, so
  // generation must offer every physically non-overlapping combination,
  // including a non-rigid type (PLA) at a string's fwd/aft end.
  const c1PlaAtEnd = (ULD.U.layouts[1] || []).some(l =>
    l.positions.some(p => p.name === "11" && p.uldType === "PLA"));
  ok("B777: PLA at a string end (11) is generated, not filtered out", c1PlaAtEnd);

  // Comp1: AKE and PKC certify the same weight at every position there —
  // that's one slot with two certified ULDs, not two competing layouts, so
  // a position filled by AKE must list PKC as also-certified (and only one
  // generated option should exist per zone, not a look-alike duplicate).
  const c1_11L = (ULD.U.layouts[1] || [])
    .map(l => l.positions.find(p => p.name === "11L")).find(Boolean);
  const c1CertTypes = c1_11L ? c1_11L.certified.map(c => c.iata).sort() : [];
  ok("B777 comp1: 11L lists both AKE and PKC as certified (identical there)",
     c1CertTypes.join(",") === "AKE,PKC", c1CertTypes.join(","));

  // The layout name itself must reflect every certified IATA at a merged
  // zone ("2LD3(AKE/PKC)") — not just whichever group happened to reach it
  // first, which would misrepresent the layout as AKE-only.
  const c1MergedName = (ULD.U.layouts[1] || []).find(l => l.name.indexOf("2LD3(AKE/PKC)") >= 0
    || l.name.indexOf("2LD3(PKC/AKE)") >= 0);
  ok("B777 comp1: merged-zone layout names list every certified IATA", !!c1MergedName,
     (ULD.U.layouts[1]||[]).slice(0,3).map(l=>l.name).join(" | "));

  // The "/" in a two-part type code (L3P/PKC) must survive into the layout
  // name, not be stripped into an unreadable run-together "L3PPKC".
  const c4PkcName = (ULD.U.layouts[4] || []).some(l => l.name.indexOf("2L3P/PKC(PKC)") >= 0);
  ok("B777 comp4: L3P/PKC keeps its slash in the layout name", c4PkcName);

  // Comp4: PKC is derated below AKE at every position there — a genuinely
  // different number must still surface as its own option somewhere in the
  // generated results, not get silently merged away.
  const c4Weights41 = new Set();
  (ULD.U.layouts[4] || []).forEach(l => l.positions.forEach(p => {
    if(p.name === "41L") c4Weights41.add(p.uld + ":" + p.maxWeight);
  }));
  ok("B777 comp4: AKE(1587) and PKC(1478) at 41L both appear as separate generated options",
     c4Weights41.has("AKE:1587") && c4Weights41.has("PKC:1478"), [...c4Weights41].join(", "));

  // PLA and ALF occupy a bay in its entirety (unlike AKE/PKC, which pair two
  // to a bay) — their positions carry no L/R suffix, and a generated PLA/ALF
  // option must be a single position, not a pair.
  const plaSingle = (ULD.U.layouts[1] || []).some(l =>
    l.positions.some(p => p.name === "12" && p.uldType === "PLA")) &&
    !(ULD.U.layouts[1] || []).some(l => l.positions.some(p => /^12[LR]$/.test(p.name) && p.uldType === "PLA"));
  ok("B777 comp1: PLA occupies a whole bay as a single position, not an L/R pair", plaSingle);

  // CSV export distinguishes the PKC pallet from the AKE container with its
  // own type code ("L3P/PKC") instead of the bare "LD3" both would otherwise
  // share.
  // Comp4 is where PKC genuinely diverges from AKE, so it still surfaces as
  // its own standalone position (comp1's are merged into AKE's certified list).
  const csv = ULD.csvLines(4).join("\n");
  ok("B777 CSV export: PKC positions are coded L3P/PKC, not bare LD3",
     csv.includes('"L3P/PKC,LA"'));
  ok("B777 CSV export: AKE positions stay coded as plain LD3",
     csv.includes('"LD3,LA"'));

  // Comp1 merges AKE and PKC into one option per zone — the CSV must still
  // list both certified types for that slot, not just the winning one.
  const csvC1 = ULD.csvLines(1).join("\n");
  ok("B777 CSV export: a merged zone lists every certified type",
     csvC1.includes('"LD3,LA;L3P/PKC,LA"'));

  // A330-200: appended last in TEMPLATES so this and the B777 checks above
  // never need to track each other's array index.
  const a2 = ULD.TEMPLATES[3];
  ULD.U.ulds = JSON.parse(JSON.stringify(a2.ulds));
  ULD.U.compartments = JSON.parse(JSON.stringify(a2.compartments));
  ULD.U.refStation = a2.refStation;
  ok("A330-200 template has all 4 compartments", ULD.U.compartments.length === 4,
     ULD.U.compartments.length + '/4');
  ok("A330-200 raises no blocking index issue", ULD.indexIssues().hard.length === 0);
  ULD.generateLayouts();
  const a2counts = ULD.U.compartments.map(c => (ULD.U.layouts[c.number] || []).length);
  ok("A330-200 template generates layouts in every compartment", a2counts.every(n => n > 0), a2counts.join("/"));

  // Comp3 has only one K-size zone (33) and a single PAG-only P-zone (32P,
  // no PMC there) per the source manual — confirm that lopsided shape
  // survived unmangled rather than silently padded out.
  const c3 = ULD.U.compartments.find(c => c.number === 3);
  const c3ZoneBases = new Set();
  c3.uldGroups.forEach(g => g.positions.forEach(p => c3ZoneBases.add(p.name.replace(/[LR]$/, ""))));
  ok("A330-200 comp3: only zones 33 and 32P exist, matching the source table",
     [...c3ZoneBases].sort().join(",") === "32P,33");

  // B777-300: appended last in TEMPLATES, same reasoning as A330-200 above.
  const b3 = ULD.TEMPLATES[4];
  ULD.U.ulds = JSON.parse(JSON.stringify(b3.ulds));
  ULD.U.compartments = JSON.parse(JSON.stringify(b3.compartments));
  ULD.U.bulk = JSON.parse(JSON.stringify(b3.bulk));
  ULD.U.refStation = b3.refStation;
  ok("B777-300 template has all 4 compartments", ULD.U.compartments.length === 4,
     ULD.U.compartments.length + '/4');
  ok("B777-300 raises no blocking index issue", ULD.indexIssues().hard.length === 0);
  ULD.generateLayouts();
  const b3counts = ULD.U.compartments.map(c => (ULD.U.layouts[c.number] || []).length);
  ok("B777-300 template generates layouts in every compartment", b3counts.every(n => n > 0), b3counts.join("/"));

  // 25P/31P carry a position-specific max weight override for PAG/PMC per
  // the manual's remarks (5102/6350 instead of the catalog default 4626/5102).
  const c2 = ULD.U.compartments.find(c => c.number === 2);
  const pag25P = c2.uldGroups.find(g => g.iata === "PAG").positions.find(p => p.name === "25P");
  const pmc25P = c2.uldGroups.find(g => g.iata === "PMC").positions.find(p => p.name === "25P");
  ok("B777-300 comp2: 25P carries the manual's restrictive PAG/PMC max weight",
     pag25P.maxWeight === "5102" && pmc25P.maxWeight === "6350");

  // PLA is coded as its own "PLA" type here (per the operator's own catalog
  // table), not "LD8" like the other templates.
  const c1 = ULD.U.compartments.find(c => c.number === 1);
  ok("B777-300 comp1: PLA is coded as type PLA, not LD8",
     c1.uldGroups.find(g => g.iata === "PLA").uldType === "PLA");

  // Bulk holds (loose cargo) are not part of generateLayouts() — they're
  // static rows appended straight into the combined export.
  const bulkCsv = ULD.csvAll();
  ok("B777-300 bulk holds appear in the combined export as static BULK rows",
     bulkCsv.includes("5,BULK,51,") && bulkCsv.includes("5,BULK,52,"));

  // AKE and PKC are both plain "LD3" here (unlike B777-200, where PKC is
  // "L3P/PKC") — a merged slot must dedupe by type code, not list "LD3,LA"
  // twice.
  const b3csvC1 = ULD.csvLines(1).join("\n");
  ok("B777-300 comp1: a merged AKE/PKC slot lists LD3,LA once, not twice",
     b3csvC1.includes('"LD3,LA"') && !b3csvC1.includes('"LD3,LA;LD3,LA"'));

  // AKE and PKC are certified identically at every position on this aircraft
  // and share the same type code, so the template carries one LD3 group, not
  // two byte-identical ones. The export is unchanged either way.
  const b3ld3Groups = ULD.U.compartments.reduce(function(n,c){
    return n + c.uldGroups.filter(function(g){ return g.uldType === "LD3"; }).length; }, 0);
  ok("B777-300 has one LD3 group per compartment, not an AKE/PKC duplicate",
     b3ld3Groups === 4, b3ld3Groups + " LD3 groups");

  // L/R bays: LD3 (AKE/PKC/QKE…), the operator's own L3P/PKC coding, and LD2
  // (AKH/DPE) all sit as left/right halves and get the pair form + mirroring.
  // Pallets and half pallets take the whole bay and stay single positions.
  ok("L/R pair handling covers LD3, L3P/PKC and LD2 — not the pallet types",
     ULD.isPairType("LD3") && ULD.isPairType("L3P/PKC") && ULD.isPairType("LD2") &&
     !ULD.isPairType("LD7/P88") && !ULD.isPairType("PLA") && !ULD.isPairType("LD8"));

  // Naming a whole-bay position picks up the station and index of the L/R
  // pair of the same zone — same bay, same numbers.
  const b3c1 = ULD.U.compartments.find(c => c.number === 1);
  const inherited = ULD.pairSourceFor(b3c1, {name:"12", fwd:"", aft:"", index:""});
  ok("a new whole-bay position inherits FWD/AFT/index from its L/R pair",
     !!inherited && inherited.fwd === "299.1" && inherited.aft === "360.1" && inherited.index === "-0.003095",
     JSON.stringify(inherited));
  ok("inheriting never overwrites values already entered",
     ULD.pairSourceFor(b3c1, {name:"12", fwd:"1", aft:"2", index:"-0.001"}) === null);
  ok("inheriting only applies to whole-bay names, not L/R or P positions",
     ULD.pairSourceFor(b3c1, {name:"12L", fwd:"", aft:"", index:""}) === null &&
     ULD.pairSourceFor(b3c1, {name:"12P", fwd:"", aft:"", index:""}) === null);

  // LD11 (DQF/DQP/FQA) sit in the P bays alongside the pallets, on the
  // PMC's stations and index, but capped at their own 2449 certification
  // rather than the bay ceiling the PMC is given.
  const b3c1pmc = b3c1.uldGroups.find(g => g.iata === "PMC").positions.find(p => p.name === "11P");
  const b3c1ld11 = b3c1.uldGroups.find(g => g.uldType === "LD11").positions.find(p => p.name === "11P");
  ok("B777-300 LD11 takes the PMC's station and index at the same P bay",
     !!b3c1ld11 && b3c1ld11.fwd === b3c1pmc.fwd && b3c1ld11.aft === b3c1pmc.aft &&
     b3c1ld11.index === b3c1pmc.index, JSON.stringify(b3c1ld11));
  ok("B777-300 LD11 keeps its own 2449 max weight, not the bay's",
     b3c1ld11.maxWeight === "2449" && b3c1pmc.maxWeight === "5102");
  ok("B777-300 LD11 is offered at the P bays of every compartment",
     ULD.U.compartments.every(c => c.uldGroups.some(g => g.uldType === "LD11" && g.positions.length)),
     ULD.U.compartments.map(c => (c.uldGroups.find(g => g.uldType === "LD11")||{positions:[]}).positions.length).join("/"));

  /* A group's label names every ULD of its type in the catalog — they share
     a base, so they are loaded in the same positions. Derived, so adding a
     ULD to the catalog updates groups that already exist. */
  ok("a group is labelled with every ULD of its type",
     ULD.groupLabel({uldType:"LD3", iata:"AKE"}) === "LD3 — AKE/QKE/PKC/RKN/AKC" &&
     ULD.groupLabel({uldType:"LD11", iata:"DQF"}) === "LD11 — DQP/DQF/FQA",
     ULD.groupLabel({uldType:"LD3", iata:"AKE"}));

  /* A position cannot be certified for more than the ULD itself carries. It
     is a warning, not a block: the manuals do it — the B777-300's own 25P
     certifies 6350 kg of PMC against a 5102 kg catalog rating. */
  const pmcGroup = {uldType:"LD7/P96", iata:"PMC"};
  ok("a position above the ULD's own rating is flagged",
     /above the PMC's own 5102 kg/.test(ULD.maxWeightIssue(pmcGroup, {maxWeight:"6350"})||""),
     ULD.maxWeightIssue(pmcGroup, {maxWeight:"6350"}));
  ok("a position at or below the ULD's rating is not flagged",
     ULD.maxWeightIssue(pmcGroup, {maxWeight:"5102"}) === null &&
     ULD.maxWeightIssue(pmcGroup, {maxWeight:"2449"}) === null);

  /* Gross errors: a bay with no length or no weight cannot be used at all;
     a decimal point in the wrong place still can, so it is only flagged. */
  const gp = (n,f,a,i,mw) => ({name:n,fwd:f,aft:a,left:"0",right:"48",index:i,maxWeight:mw});
  ULD.U.compartments = [{id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD3",iata:"AKE",label:"x",positions:[
      gp("11L","300","200","-0.003","1587"),   // aft ahead of fwd
      gp("12L","300","360","-0.003","0"),      // no weight
      gp("13L","300","360","-0.5","1587"),     // index off by 100x
      gp("14L","300","360","-0.003","50000")   // weight off
    ]}
  ]}];
  const gross = ULD.indexIssues();
  const reasons = gross.hard.concat(gross.warn).map(x => x.name + ": " + x.reason);
  ok("a bay with no length blocks generation",
     gross.hard.some(x => x.name === "11L" && /no length/.test(x.reason)), reasons.join(" | "));
  ok("a position with no usable weight blocks generation",
     gross.hard.some(x => x.name === "12L" && /max weight/.test(x.reason)), reasons.join(" | "));
  ok("an index off by orders of magnitude is flagged, not blocked",
     gross.warn.some(x => x.name === "13L" && /decimal point/.test(x.reason)) &&
     !gross.hard.some(x => x.name === "13L"), reasons.join(" | "));
  ok("a weight heavier than any ULD is flagged, not blocked",
     gross.warn.some(x => x.name === "14L" && /heavier than any ULD/.test(x.reason)), reasons.join(" | "));

  // Overlapping positions inside one group are normal in these manuals (the
  // A330-300's 32P and 33P overlap by 18 cm) — flagging them was a false
  // positive on the operator's own data.
  const tplIssues = ULD.TEMPLATES.map(t => {
    ULD.U.ulds = JSON.parse(JSON.stringify(t.ulds));
    ULD.U.compartments = JSON.parse(JSON.stringify(t.compartments));
    ULD.U.refStation = t.refStation;
    const i = ULD.indexIssues();
    return { name:t.name, hard:i.hard.length, warn:i.warn.length };
  });
  ok("no shipped template is blocked by the gate",
     tplIssues.every(t => t.hard === 0), JSON.stringify(tplIssues));
  ok("the templates only warn where the manual really does exceed the ULD",
     tplIssues.every(t => t.warn === 0 || /787|777-300/.test(t.name)), JSON.stringify(tplIssues));

  // The operator's system carries 5 decimal places; the manuals print 6. The
  // editor keeps the manual's value, the export rounds it on the way out.
  ok("export rounds the index to 5 decimals",
     ULD.exportIndex("-0.003422") === -0.00342 && ULD.exportIndex("0.002808") === 0.00281 &&
     ULD.exportIndex("-0.00803") === -0.00803 && ULD.exportIndex("") === 0);
  const b3rounded = ULD.csvLines(1).join("\n");
  ok("B777-300 comp1 CSV carries the rounded index, not the 6-decimal source",
     b3rounded.includes(",-0.00342,") && !b3rounded.includes(",-0.003422,"),
     b3rounded.split("\n")[0]);
  const bulkRounded = ULD.csvAll().split("\n").filter(l => l.indexOf(",BULK,") >= 0);
  ok("bulk hold rows are rounded the same way",
     bulkRounded.some(l => l.includes(",0.00281,")) && bulkRounded.some(l => l.includes(",0.00309,")),
     bulkRounded.join(" | "));
  // the working data itself must be untouched — only the export rounds
  ok("rounding on export leaves the editor's own values alone",
     b3c1.uldGroups[0].positions[0].index === "-0.003422",
     b3c1.uldGroups[0].positions[0].index);

  /* LD2 (AKH/DPE) and LD3 (AKE/PKC…) have different bases but are loaded in
     the same bays. The rule is about the numbers, not the type: same index
     and max weight at a zone means one slot certified for both; a different
     index or max weight means two mutually exclusive options for that bay,
     each free to combine with whatever sits in the other zones. */
  const mkPos = (n,f,a,l,r,i,mw) => ({name:n,fwd:f,aft:a,left:l,right:r,index:i,maxWeight:mw});
  ULD.U.ulds = [{id:"u1",uldType:"LD3",iata:"AKE",maxWeight:1587,tare:63},
                {id:"u2",uldType:"LD2",iata:"DPE",maxWeight:1224,tare:72}];
  ULD.U.bulk = []; ULD.U.refStation = "1258";
  ULD.U.compartments = [{id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD3",iata:"AKE",label:"LD3 — AKE",positions:[
      mkPos("11L","201.1","261.7","0","48","-0.00342","1587"), mkPos("11R","201.1","261.7","48","0","-0.00342","1587"),
      mkPos("12L","299.1","360.1","0","48","-0.00310","1587"), mkPos("12R","299.1","360.1","48","0","-0.00310","1587")]},
    {id:"g2",uldType:"LD2",iata:"DPE",label:"LD2 — DPE",positions:[
      mkPos("11L","201.1","261.7","0","48","-0.00342","1587"), mkPos("11R","201.1","261.7","48","0","-0.00342","1587"),
      mkPos("12L","299.1","360.1","0","48","-0.00310","1224"), mkPos("12R","299.1","360.1","48","0","-0.00310","1224")]}
  ]}];
  ULD.generateLayouts();
  const mixCsv = ULD.csvLines(1);
  const z11 = mixCsv.filter(l => l.indexOf(",11L,") >= 0);
  const z12 = mixCsv.filter(l => l.indexOf(",12L,") >= 0);
  ok("LD2 and LD3 share one slot when index and max weight match",
     z11.length > 0 && z11.every(l => l.indexOf('"LD3,LA;LD2,LA"') >= 0), z11[0]);
  ok("LD2 and LD3 split into separate options when the max weight differs",
     z12.some(l => l.indexOf('"LD3,LA"') >= 0) && z12.some(l => l.indexOf('"LD2,LA"') >= 0),
     z12.join(" | "));
  ok("the split options still combine with the other zones",
     ULD.U.layouts[1].length === 2 &&
     ULD.U.layouts[1].every(l => l.positions.some(p => p.name === "11L") &&
                                 l.positions.some(p => p.name === "12L")),
     ULD.U.layouts[1].map(l => l.name).join(" | "));

  // A slot shared by two different bases names both type codes — calling it
  // "2LD3(AKE/DPE)" would read as if the DPE were an LD3 too. Types that
  // share a base (LD3 and the operator's L3P/PKC coding) still name one,
  // which is what keeps the B777-200's "2LD3(AKE/PKC)" above unchanged.
  ok("a slot shared by two bases names both types",
     ULD.U.layouts[1].every(l => l.name.indexOf("2LD3/LD2(AKE/DPE)") === 0),
     ULD.U.layouts[1].map(l => l.name).join(" | "));
  ok("types sharing a base still name just the one",
     ULD.uldBase("L3P/PKC") === ULD.uldBase("LD3") && ULD.uldBase("LD2") !== ULD.uldBase("LD3"));

  // The "+ L/R pair" form (the only way LD2/LD3 positions are added) fills
  // itself from an existing pair of the same bay, offset included — an L
  // position carries it on the right, an R position on the left.
  const pairSrc = ULD.pairAtBase(ULD.U.compartments[0], "11");
  ok("the L/R pair form finds an existing pair by its base",
     !!pairSrc && pairSrc.fwd === "201.1" && pairSrc.aft === "261.7" && pairSrc.index === "-0.00342",
     JSON.stringify(pairSrc));
  ok("the offset comes off whichever side was found",
     ULD.pairOffsetOf({name:"11L", left:"0", right:"48"}) === "48" &&
     ULD.pairOffsetOf({name:"11R", left:"48", right:"0"}) === "48");
  ok("an unknown base fills nothing", ULD.pairAtBase(ULD.U.compartments[0], "99") === null);

  // The index field took anything a number input allowed, including
  // -0.00271155555555555555. Capped at what the manuals actually print.
  ok("the index is capped at 6 decimals",
     ULD.clampDecimals("-0.00271155555555555555", 6) === "-0.002711" &&
     ULD.clampDecimals("-0.003422", 6) === "-0.003422" &&
     ULD.clampDecimals("-0.00803", 6) === "-0.00803");
  ok("capping leaves whole numbers and half-typed values alone",
     ULD.clampDecimals("1587", 6) === "1587" && ULD.clampDecimals("-0.", 6) === "-0." &&
     ULD.clampDecimals("", 6) === "");

  /* A P bay is a bay, whatever is certified for it: an LD11 (DQF/DQP/FQA)
     at 11P sits where the PMC sits. Keying that off the type — LD7 only —
     filed the LD11 under a base of its own, so it could never merge with,
     or be recognised as the same slot as, the pallet next to it. */
  ULD.U.ulds = [{id:"u1",uldType:"LD7/P96",iata:"PMC",maxWeight:5102,tare:110},
                {id:"u2",uldType:"LD11",iata:"DQF",maxWeight:2449,tare:150},
                {id:"u3",uldType:"LD11",iata:"DQP",maxWeight:2449,tare:120}];
  ULD.U.bulk = []; ULD.U.refStation = "1258";
  ULD.U.compartments = [{id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD7/P96",iata:"PMC",label:"LD7/P96 — PMC",positions:[
      mkPos("11P","201.1","297.3","0","0","-0.003363","5102")]},
    {id:"g2",uldType:"LD11",iata:"DQF",label:"LD11 — DQF",positions:[
      mkPos("11P","201.1","297.3","0","0","-0.003363","2449")]},
    {id:"g3",uldType:"LD11",iata:"DQP",label:"LD11 — DQP",positions:[
      mkPos("11P","201.1","297.3","0","0","-0.003363","2449")]}
  ]}];
  ULD.generateLayouts();
  const pNames = ULD.U.layouts[1].map(l => l.name).sort();
  ok("an LD11 in a P bay is one option against the pallet, not a bay of its own",
     pNames.length === 2 && pNames.indexOf("1LD7/P96(PMC)") >= 0, pNames.join(" | "));
  ok("two LD11s certified alike at that bay merge into one option",
     pNames.indexOf("1LD11(DQF/DQP)") >= 0, pNames.join(" | "));
  /* Positions are numbered after their hold, so a 41L in compartment 1 is a
     typed digit. A warning, not a block — the numbering is a convention. */
  ULD.U.compartments = [{id:"c1",number:1,uldGroups:[
    {id:"g1",uldType:"LD3",iata:"AKE",label:"x",positions:[
      gp("11L","300","360","-0.003","1587"),
      gp("41L","300","360","-0.003","1587")
    ]}
  ]}];
  const numbering = ULD.indexIssues();
  ok("a position numbered for another compartment is flagged",
     numbering.warn.some(x => x.name === "41L" && /named for compartment 4 but sits in 1/.test(x.reason)) &&
     !numbering.warn.some(x => x.name === "11L"),
     numbering.warn.map(x => x.name+": "+x.reason).join(" | "));

  /* Undo carries the whole workspace, so removing a group and taking it back
     restores its positions too — an autosave of the version without them is
     what makes this worth having. */
  ULD.U.ulds = [{id:"u1",uldType:"LD3",iata:"AKE",maxWeight:1587,tare:65}];
  ULD.U.bulk = [{number:5, positions:[{name:"51",fwd:"1",aft:"2",index:"0.001",volume:"6",maxWeight:"100"}]}];
  ULD.U.undo = [];
  ULD.pushUndo("removed a group");
  ULD.U.compartments = [];
  ULD.U.bulk = [];
  const undone = ULD.undoLast();
  ok("undo restores compartments and bulk holds together",
     undone === "removed a group" && ULD.U.compartments.length === 1 &&
     ULD.U.compartments[0].uldGroups[0].positions.length === 2 && ULD.U.bulk.length === 1,
     undone + " / " + ULD.U.compartments.length + " comps / " + ULD.U.bulk.length + " bulk");
  ok("undo empties out rather than repeating the last state",
     ULD.undoLast() === null && ULD.U.undo.length === 0);


  /* The beta's position-first model must be a lossless re-shaping of the
     same data: convert each template into it and back, and the generator has
     to produce the identical export. This is the whole safety argument for
     ever adopting it, so it is checked here rather than only by hand. */
  const betaSrc = fs.readFileSync(path.join(ROOT, "src/modules/uldbeta/model.js"), "utf8");
  eval(betaSrc + ";UBM = {ubFromTemplate, ubToOldModel, ubFromGroups, ubEffective};");
  const exportOf = t => {
    ULD.U.ulds = JSON.parse(JSON.stringify(t.ulds||[]));
    ULD.U.compartments = JSON.parse(JSON.stringify(t.compartments||[]));
    ULD.U.bulk = JSON.parse(JSON.stringify(t.bulk||[]));
    ULD.U.refStation = t.refStation;
    ULD.generateLayouts();
    return ULD.csvAll();
  };
  const roundTrips = ULD.TEMPLATES.map(t => {
    const before = exportOf(t);
    const after  = exportOf(UBM.ubToOldModel(UBM.ubFromTemplate(t)));
    return { name: t.name, same: before === after };
  });
  ok("the beta model round-trips every template with an identical export",
     roundTrips.every(r => r.same),
     roundTrips.filter(r => !r.same).map(r => r.name).join(", "));

  // and it does collapse the duplication it exists to remove
  const b3beta = UBM.ubFromTemplate(ULD.TEMPLATES[4]);
  const bays = b3beta.compartments.reduce((s,c) => s + c.positions.length, 0);
  const stored = ULD.TEMPLATES[4].compartments.reduce((s,c) =>
    s + c.uldGroups.reduce((k,g) => k + g.positions.length, 0), 0);
  ok("the beta model stores each bay once, not once per ULD",
     bays < stored && bays === 80 && stored === 108, bays + " bays vs " + stored + " rows");

  // a tick with no override takes the catalog weight; one with an override wins
  const catalog = [{uldType:"LD3", iata:"AKE", maxWeight:1587}];
  const bay = {name:"11L", fwd:"1", aft:"2", left:"0", right:"48", index:"-0.003"};
  ok("a ticked ULD takes its weight from the catalog",
     UBM.ubEffective(bay, {iata:"AKE"}, catalog).maxWeight === "1587");
  ok("an override on the tick wins over the catalog",
     UBM.ubEffective(bay, {iata:"AKE", maxWeight:"1478"}, catalog).maxWeight === "1478");
  ok("an override on the tick wins over the bay's own station",
     UBM.ubEffective(bay, {iata:"AKE", aft:"297.3"}, catalog).aft === "297.3" &&
     UBM.ubEffective(bay, {iata:"AKE"}, catalog).aft === "2");
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
