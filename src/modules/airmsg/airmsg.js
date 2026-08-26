
/* ============================================================================
   AIRLINE MESSAGE TOOLKIT — pure parsing/building logic (no DOM here).
   Three independent tools: PRL parser, APIS PAXLST parser, PSCRM PNL builder
   from a CSV/XLSX passenger list. Everything runs client-side; no message,
   file or password ever leaves the browser.
   ============================================================================ */
var AM = { prlRows:[], prlCsv:"", paxRows:[], paxCsv:"", pnlRows:[], pnlText:"", activeTab:"prl" };

function amClean(v){ return String(v==null?"":v).trim(); }

/* ---------- CSV (semicolon-delimited, matches the source PSCRM tooling) ---------- */
function csvCell(v){
  v = String(v==null?"":v);
  return /[;"\r\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v;
}
function makeCsv(headers, rows){
  return "﻿"+[headers].concat(rows.map(function(r){ return headers.map(function(h){ return r[h]==null?"":r[h]; }); }))
    .map(function(r){ return r.map(csvCell).join(";"); }).join("\r\n");
}

/* ---------- PNL passenger-list template ----------
   A worked example covering the two document rows a real passenger list
   needs: one passport ("P") plus a second, non-passport document ("V") for
   the same person, sharing the same RecordLocator/Seat/BCN — so anyone
   building their own list can see the shape before they start. */
var PNL_TEMPLATE_CSV =
  "Surname;GivenName;Gender;DateOfBirth;Nationality;RecordLocator;Seat;DocumentType;DocumentNumber;DocumentIssueCountry;DocumentIssueDate;DocumentExpiryDate;BCN;BookingClass\n"+
  "AMERICA;CAPTAIN;M;1982-03-28;USA;WJ939H;15B;P;8888888888;USA;;2030-12-02;102;C\n"+
  "AMERICA;CAPTAIN;M;1982-03-28;USA;WJ939H;15B;V;VI1234567;DEU;01/01/2026;2026-10-20;102;C\n"+
  "LIGHTYEAR;BUZZ;M;1940-11-01;USA;SLZW9B;12A;P;1111111111;USA;;2030-11-01;;Y\n"+
  "SIMPSON;HOMER;M;1935-05-13;USA;TEQRHG;15C;P;9999999999;USA;;2030-05-13;104;Y\n"+
  "SIMPSON;HOMER;M;1935-05-13;USA;TEQRHG;15C;V;VI1111111;DEU;;2030-12-30;104;Y\n"+
  "TEST;JIM;F;1945-12-01;USA;MA7LBX;12F;P;2323232323;USA;;2030-12-30;106;\n"+
  "TEST;JIM;F;1945-12-01;USA;MA7LBX;12F;V;VI222222;DEU;06/06/2025;2030-12-30;106;";
function pnlTemplateRows(){ return parseDelimited(PNL_TEMPLATE_CSV); }

/* ---------- PRL parser ----------
   Reads a PSCRM PRL message: one passenger header line ending in ".L/<PNR>",
   followed by .R/SEAT, .R/DOCO and one or more .R/DOCS lines (each DOCS
   line is one travel document) and an optional .RN/ override name. */
var prlHeaders = ["ReservationName","RecordLocator","Seat","Status","DocumentType","Nationality",
  "DocumentNumber","IssueCountry","DateOfBirth","Gender","ExpiryDate","DOCO"];
function parsePRL(source){
  var lines = String(source||"").replace(/\r/g,"").split("\n");
  var passengers = [], cur = null;
  lines.forEach(function(raw){
    var line = raw.trim();
    if(!line) return;
    var m;
    if(/^\d+\S+\/\S+.*\.L\//i.test(line)){
      m = line.match(/\.L\/([^\s]+)/i);
      cur = { ReservationName: line.split(/\s+\.L\//i)[0].replace(/^\d+/,""),
              RecordLocator: m?m[1]:"", Seat:"", DOCO:"", docs:[] };
      passengers.push(cur);
      return;
    }
    if(!cur) return;
    if((m = line.match(/^\.R\/SEAT\s+(?:HK1\s+)?([^\s-]+)/i))) cur.Seat = m[1];
    else if((m = line.match(/^\.R\/DOCO\s+(.+)/i))) cur.DOCO = m[1];
    else if((m = line.match(/^\.R\/DOCS\s+(.+)/i))) cur.docs.push(m[1].split("/"));
    else if((m = line.match(/^\.RN\/(.+)/i)) && amClean(m[1]).toUpperCase()!=="N") cur.ReservationName = amClean(m[1]);
  });
  var rows = [];
  passengers.forEach(function(p){
    p.docs.forEach(function(x){
      rows.push({ ReservationName:p.ReservationName, RecordLocator:p.RecordLocator, Seat:p.Seat,
        Status:x[0]||"", DocumentType:x[1]||"", Nationality:x[2]||"", DocumentNumber:x[3]||"",
        IssueCountry:x[4]||"", DateOfBirth:x[5]||"", Gender:x[6]||"", ExpiryDate:x[7]||"", DOCO:p.DOCO });
    });
  });
  return rows;
}

/* ---------- APIS PAXLST parser (EDIFACT-style segments) ---------- */
var paxHeaders = ["MessagePart","Surname","GivenName","Gender","DateOfBirth","Nationality","RecordLocator",
  "Seat","BoardingLocation","ArrivalLocation","DocumentSequence","DocumentType","DocumentNumber",
  "DocumentIssueCountry","DocumentIssueDate","DocumentExpiryDate"];
function getPaxlstSegments(source){
  return String(source||"").split(/[\r\n'$]+/)
    .map(function(s){ return s.replace(/[\r\n'$]/g,"").trim().replace(/^\.+/,""); })
    .filter(Boolean);
}
function parsePAX(source){
  var passengers = [], cur = null, doc = null, part = 0;
  function saveDoc(){ if(cur && doc) cur.documents.push(doc); doc = null; }
  function savePax(){ saveDoc(); if(cur) passengers.push(cur); cur = null; }
  getPaxlstSegments(source).forEach(function(raw){
    var p = raw.split("*").map(amClean), tag = (p[0]||"").toUpperCase(), q = p[1]||"";
    if(tag==="UNH"){ savePax(); part++; return; }
    if(tag==="NAD" && q.toUpperCase()!=="FL"){ savePax(); return; }
    if(tag==="NAD" && q.toUpperCase()==="FL"){
      savePax();
      var last = p[p.length-1];
      var n = (p.slice(4).filter(Boolean)[0] || last || "").split(":");
      cur = { MessagePart:part||1, Surname:n[0]||"", GivenName:n.slice(1).join(" "), Gender:"",
        DateOfBirth:"", Nationality:"", RecordLocator:"", Seat:"", BoardingLocation:"",
        ArrivalLocation:"", documents:[] };
      return;
    }
    if(!cur) return;
    if(tag==="ATT" && q==="2") cur.Gender = p[p.length-1]||"";
    else if(tag==="DTM"){
      var d = q.split(":");
      if(d[0]==="329") cur.DateOfBirth = d[1]||"";
      else if(doc && d[0]==="182") doc.DocumentIssueDate = d[1]||"";
      else if(doc && d[0]==="36") doc.DocumentExpiryDate = d[1]||"";
    }
    else if(tag==="NAT" && q==="2") cur.Nationality = p[2]||"";
    else if(tag==="RFF"){
      var r = q.split(":"), qual = r.shift(), val = r.join(":");
      if(qual==="AVF") cur.RecordLocator = val;
      else if(qual==="SEA") cur.Seat = val;
    }
    else if(tag==="LOC"){
      if(q==="178") cur.BoardingLocation = p[2]||"";
      else if(q==="179") cur.ArrivalLocation = p[2]||"";
      else if(q==="91" && doc) doc.DocumentIssueCountry = p[2]||"";
    }
    else if(tag==="DOC"){
      saveDoc();
      doc = { DocumentType:q.split(":")[0]||"", DocumentNumber:p[2]||"", DocumentIssueCountry:"",
        DocumentIssueDate:"", DocumentExpiryDate:"" };
    }
  });
  savePax();
  var rows = [];
  passengers.forEach(function(x){
    x.documents.forEach(function(d, i){
      var row = {}; for(var k in x) if(k!=="documents") row[k] = x[k];
      row.DocumentSequence = i+1;
      for(var k2 in d) row[k2] = d[k2];
      rows.push(row);
    });
  });
  return rows;
}

/* ---------- delimited (CSV/TSV, auto-detects ; vs ,) and XLSX readers,
   for the passenger list fed into the PNL builder ---------- */
function parseDelimited(text){
  var lines = String(text||"").replace(/^﻿/,"").replace(/\r/g,"").split("\n").filter(function(x){ return x.trim(); });
  if(!lines.length) return [];
  var semis = (lines[0].match(/;/g)||[]).length, commas = (lines[0].match(/,/g)||[]).length;
  var delim = semis >= commas ? ";" : ",";
  function parseRow(s){
    var a = [], v = "", quoted = false;
    for(var i=0;i<s.length;i++){
      var c = s[i];
      if(c==='"' && s[i+1]==='"' && quoted){ v+='"'; i++; }
      else if(c==='"') quoted = !quoted;
      else if(c===delim && !quoted){ a.push(v); v=""; }
      else v += c;
    }
    a.push(v);
    return a;
  }
  var headers = parseRow(lines.shift()).map(amClean);
  return lines.map(function(line){
    var vals = parseRow(line), row = {};
    headers.forEach(function(h,i){ row[h] = amClean(vals[i]); });
    return row;
  });
}
/* minimal ZIP reader (store + deflate-raw via DecompressionStream) — just
   enough to pull xl/sharedStrings.xml and the first worksheet out of an
   .xlsx, mirroring the writer in core/ui.js but in reverse. */
function unzipXlsx(buffer){
  var bytes = new Uint8Array(buffer), files = {}, pos = 0;
  var jobs = [];
  while(pos+30 < bytes.length){
    if(!(bytes[pos]===0x50 && bytes[pos+1]===0x4b && bytes[pos+2]===0x03 && bytes[pos+3]===0x04)){ pos++; continue; }
    var view = new DataView(bytes.buffer, bytes.byteOffset+pos);
    var method = view.getUint16(8,true), size = view.getUint32(18,true);
    var nameLen = view.getUint16(26,true), extraLen = view.getUint16(28,true);
    var nameStart = pos+30;
    var name = new TextDecoder().decode(bytes.slice(nameStart, nameStart+nameLen));
    var dataStart = nameStart+nameLen+extraLen;
    var raw = bytes.slice(dataStart, dataStart+size);
    if(method===0) files[name] = raw;
    else if(method===8) jobs.push({name:name, raw:raw});
    pos = dataStart+size;
  }
  if(!jobs.length) return Promise.resolve(files);
  return Promise.all(jobs.map(function(j){
    var ds = new DecompressionStream("deflate-raw");
    return new Response(new Blob([j.raw]).stream().pipeThrough(ds)).arrayBuffer().then(function(buf){
      files[j.name] = new Uint8Array(buf);
    });
  })).then(function(){ return files; });
}
function parseXlsx(file){
  return file.arrayBuffer().then(unzipXlsx).then(function(files){
    var decode = function(b){ return new TextDecoder().decode(b||new Uint8Array()); };
    var shared = [];
    if(files["xl/sharedStrings.xml"]){
      var sxml = new DOMParser().parseFromString(decode(files["xl/sharedStrings.xml"]), "text/xml");
      Array.prototype.forEach.call(sxml.querySelectorAll("si"), function(si){
        shared.push(Array.prototype.map.call(si.querySelectorAll("t"), function(t){ return t.textContent; }).join(""));
      });
    }
    var sheet = files["xl/worksheets/sheet1.xml"];
    if(!sheet) throw new Error("The first XLSX worksheet could not be found.");
    var xml = new DOMParser().parseFromString(decode(sheet), "text/xml");
    var grid = [];
    Array.prototype.forEach.call(xml.querySelectorAll("row"), function(row){
      var arr = [];
      Array.prototype.forEach.call(row.querySelectorAll("c"), function(c){
        var ref = c.getAttribute("r")||"A1";
        var letters = ref.match(/[A-Z]+/)[0];
        var col = 0; for(var i=0;i<letters.length;i++) col = col*26 + letters.charCodeAt(i)-64;
        col -= 1;
        var type = c.getAttribute("t");
        if(type==="inlineStr"){
          // openpyxl and some other writers (including this toolkit's own
          // XLSX export) inline the text as <is><t>…</t></is> instead of
          // pointing into sharedStrings.xml — real files use both.
          var isEl = c.querySelector("is");
          var tEls = isEl ? isEl.querySelectorAll("t") : [];
          arr[col] = Array.prototype.map.call(tEls, function(t){ return t.textContent; }).join("");
        } else {
          var vEl = c.querySelector("v");
          var raw = vEl ? vEl.textContent : "";
          arr[col] = type==="s" ? (shared[+raw]||"") : raw;
        }
      });
      grid.push(arr);
    });
    if(!grid.length) return [];
    var headers = grid.shift().map(amClean);
    return grid.map(function(arr){
      var row = {}; headers.forEach(function(h,i){ row[h] = amClean(arr[i]); }); return row;
    });
  });
}

/* ---------- PSCRM PNL builder ---------- */
var requiredPnl = ["Surname","GivenName","Gender","DateOfBirth","Nationality","RecordLocator","Seat",
  "DocumentType","DocumentNumber","DocumentIssueCountry","DocumentIssueDate","DocumentExpiryDate","BCN"];
function validatePnlRows(rows){
  if(!rows.length) throw new Error("The passenger file is empty.");
  var missing = requiredPnl.filter(function(h){ return !(h in rows[0]); });
  if(missing.length) throw new Error("Missing columns: "+missing.join(", "));
}
function bookingClassFrom(row){
  return amClean(row.BookingClass || row["Booking Class"] || row.Class || row.RBD).toUpperCase();
}
var MONTHS3 = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
function pnlDate(value){
  var s = amClean(value);
  if(!s) return "";
  var d;
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)){
    var p1 = s.split("-"); d = new Date(Date.UTC(+p1[0], +p1[1]-1, +p1[2]));
  } else if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)){
    var p2 = s.split("/"); d = new Date(Date.UTC(+p2[2], +p2[1]-1, +p2[0]));
  } else {
    d = new Date(s);
    if(isNaN(d.getTime())) return s.toUpperCase();
  }
  return String(d.getUTCDate()).padStart(2,"0") + MONTHS3[d.getUTCMonth()] + String(d.getUTCFullYear()).slice(-2);
}
function normalizeFlightNumber(value){
  var raw = amClean(value).toUpperCase().replace(/\s+/g,"");
  if(!/^(?:\d{1,4}|\d{1,3}[A-Z])$/.test(raw))
    throw new Error("Flight number must contain 1 to 4 digits, or 1 to 3 digits followed by one letter.");
  var suffix = /[A-Z]$/.test(raw) ? raw.slice(-1) : "";
  var digits = suffix ? raw.slice(0,-1) : raw;
  return digits.padStart(3,"0") + suffix;
}
function flightDateDDMMM(value){ var full = pnlDate(value); return full ? full.slice(0,5) : ""; }
var AM_ISO2 = { USA:"US",GBR:"GB",CAN:"CA",DEU:"DE",MMR:"MM",PRT:"PT",ESP:"ES",FRA:"FR",ITA:"IT",
  NLD:"NL",BEL:"BE",CHE:"CH",AUT:"AT",TUR:"TR" };
function buildPnl(rows, flightData){
  validatePnlRows(rows);
  var airline = flightData.airline, flight = flightData.flight, date = flightData.date,
      origin = flightData.origin, destination = flightData.destination, defaultClass = flightData.defaultClass;
  if(!/^[A-Z0-9]{1,3}$/.test(airline)) throw new Error("Airline must have 1 to 3 letters or numbers.");
  var normalizedFlight = normalizeFlightNumber(flight);
  if(!date) throw new Error("Flight date is mandatory.");
  if(!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination))
    throw new Error("Origin and destination must have exactly 3 letters.");
  if(!/^[A-Z0-9]$/.test(defaultClass)) throw new Error("Default booking class must contain one letter or number.");

  var passengers = new Map();
  rows.forEach(function(r){
    // DateOfBirth is in the key too, not just Surname/GivenName/RecordLocator —
    // two different passengers who share a name and haven't been assigned a
    // PNR yet (both RecordLocator blank) would otherwise collapse into one
    // passenger and silently lose one of their passport lines.
    var key = [r.Surname, r.GivenName, r.RecordLocator, r.DateOfBirth].join("|");
    if(!passengers.has(key)) passengers.set(key, { documents:[], bookingClass:"" });
    var p = passengers.get(key);
    p.documents.push(r);
    var cls = bookingClassFrom(r);
    if(cls){
      if(p.bookingClass && p.bookingClass!==cls)
        throw new Error("Conflicting booking classes for "+r.Surname+"/"+r.GivenName+".");
      p.bookingClass = cls;
    }
  });
  var classes = new Map();
  passengers.forEach(function(p){
    var cls = p.bookingClass || defaultClass;
    if(!/^[A-Z0-9]$/.test(cls)) throw new Error("Invalid booking class "+cls+".");
    if(!classes.has(cls)) classes.set(cls, []);
    classes.get(cls).push(p.documents);
  });

  var lines = ["PNL", airline+normalizedFlight+"/"+flightDateDDMMM(date)+" "+origin+" PART1"];
  classes.forEach(function(group, cls){
    lines.push("-"+destination+String(group.length).padStart(3,"0")+cls);
    group.forEach(function(docs){
      var r = docs[0];
      var title = amClean(r.Gender).toUpperCase()==="F" ? "MRS" : "MR";
      var name = "1"+r.Surname+"/"+r.GivenName+title;
      lines.push(amClean(r.RecordLocator) ? name+" .L/"+r.RecordLocator : name);
      if(r.Seat) lines.push(".R/SEAT HK1 "+r.Seat+"-"+name);
      if(r.BCN) lines.push(".R/CHKD HK1 "+r.BCN);
      var passport = docs.filter(function(d){ return amClean(d.DocumentType).toUpperCase()==="P"; })[0];
      if(passport){
        lines.push(".R/DOCS HK1/P/"+(AM_ISO2[passport.Nationality]||passport.Nationality)+"/"+
          passport.DocumentNumber+"/"+(AM_ISO2[passport.DocumentIssueCountry]||passport.DocumentIssueCountry)+"/"+
          pnlDate(passport.DateOfBirth)+"/"+
          passport.Gender+"/"+pnlDate(passport.DocumentExpiryDate)+"/"+passport.Surname);
        lines.push(".RN//"+passport.GivenName+"/-"+name);
      }
      docs.filter(function(d){ return amClean(d.DocumentType).toUpperCase()!=="P"; }).forEach(function(d){
        lines.push(".R/DOCO HK1//"+d.DocumentType+"/"+d.DocumentNumber+"//"+pnlDate(d.DocumentIssueDate)+
          "/"+d.DocumentIssueCountry+"//"+pnlDate(d.DocumentExpiryDate));
      });
    });
  });
  lines.push("ENDPNL");
  return { text: lines.join("\r\n"), passengers: passengers.size, classes: classes.size, documents: rows.length };
}
