
/* ============================================================================
   CSV → PNL
   ============================================================================ */
function parseCSV(text){
  var rows = [], row = [], field = "", inQ = false;
  text = String(text||"").replace(/\r\n/g,"\n").replace(/\r/g,"\n");
  // Work out the separator from the header line only. Assuming several at once
  // splits values that legitimately contain one — "KSML;VGML" is a single cell.
  var head = text.split("\n")[0] || "";
  var counts = { ",": (head.match(/,/g)||[]).length,
                 ";": (head.match(/;/g)||[]).length,
                 "\t":(head.match(/\t/g)||[]).length };
  var sep = ",";
  if(counts[";"] > counts[sep]) sep = ";";
  if(counts["\t"] > counts[sep]) sep = "\t";
  for(var i=0;i<text.length;i++){
    var c = text[i];
    if(inQ){
      if(c === '"'){ if(text[i+1] === '"'){ field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if(c === '"') inQ = true;
    else if(c === sep){ row.push(field); field = ""; }
    else if(c === '\n'){ row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if(field !== "" || row.length){ row.push(field); rows.push(row); }
  return rows.filter(function(r){ return r.some(function(x){ return String(x).trim() !== ""; }); });
}

/* Header names we recognise, in the order we try them. */
var CSV_FIELDS = {
  surname: ["surname","last name","lastname","family name","apelido","nome proprio"],
  given:   ["given","given name","first name","firstname","name","nome"],
  title:   ["title","titulo","título"],
  dest:    ["dest","destination","to","arrival","destino"],
  cls:     ["class","cls","cabin","classe","rbd"],
  pnr:     ["pnr","record locator","locator","booking","reserva"],
  ssr:     ["ssr","service","special","ssrs","servico","serviço"],
  seat:    ["seat","lugar","assento"]
};
function mapColumns(header){
  var map = {};
  header.forEach(function(h, i){
    var k = String(h||"").trim().toLowerCase();
    Object.keys(CSV_FIELDS).forEach(function(f){
      if(map[f] === undefined && CSV_FIELDS[f].indexOf(k) >= 0) map[f] = i;
    });
  });
  return map;
}

/* Build a standards-compliant PNL from rows. */
function buildPNL(rows, opts){
  var problems = [];
  if(!rows.length) return { error:"The CSV has no rows." };
  var header = rows[0], map = mapColumns(header), body = rows.slice(1);
  if(map.surname === undefined || map.given === undefined)
    return { error:"Could not find a surname and a given-name column. Expected headers such as: surname, given name, destination, class." };

  var pax = [];
  body.forEach(function(r, i){
    var sur = String(r[map.surname]||"").trim().toUpperCase().replace(/[^A-Z0-9 '\-]/g,"");
    var giv = String(r[map.given]||"").trim().toUpperCase().replace(/[^A-Z0-9 '\-]/g,"");
    if(!sur || !giv){ problems.push("Row " + (i+2) + " skipped: missing surname or given name."); return; }
    var title = map.title !== undefined ? String(r[map.title]||"").trim().toUpperCase().replace(/[^A-Z]/g,"") : "";
    var dest  = map.dest  !== undefined ? String(r[map.dest]||"").trim().toUpperCase().replace(/[^A-Z]/g,"") : (opts.defaultDest||"");
    var cls   = map.cls   !== undefined ? String(r[map.cls]||"").trim().toUpperCase().replace(/[^A-Z]/g,"")  : (opts.defaultCls||"Y");
    if(dest.length !== 3){ problems.push("Row " + (i+2) + ": destination \"" + dest + "\" is not a 3-letter airport code."); return; }
    if(cls.length !== 1){ cls = (opts.defaultCls||"Y"); }
    pax.push({
      surname: sur.replace(/\s+/g," "),
      given: (giv + title).replace(/\s+/g,""),
      dest: dest, cls: cls,
      pnr: map.pnr !== undefined ? String(r[map.pnr]||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"") : "",
      ssr: map.ssr !== undefined ? String(r[map.ssr]||"").trim().toUpperCase() : "",
      seat: map.seat !== undefined ? String(r[map.seat]||"").trim().toUpperCase() : ""
    });
  });
  if(!pax.length) return { error:"No usable rows.", problems: problems };

  // group by destination + class, alphabetise by surname (RP 1707b §2.9)
  var groups = {};
  pax.forEach(function(p){
    var k = p.dest + "|" + p.cls;
    (groups[k] = groups[k] || []).push(p);
  });

  var out = [];
  out.push("PNL");
  out.push(opts.flight);

  var groupSeq = 0;
  Object.keys(groups).sort().forEach(function(k){
    var members = groups[k].slice().sort(function(a,b){
      return a.surname.localeCompare(b.surname) || a.given.localeCompare(b.given);
    });
    var d = k.split("|");
    out.push("-" + d[0] + String(members.length).replace(/^(\d)$/,"0$1") + d[1]);

    // passengers sharing a PNR become a party/group
    var byPnr = {};
    members.forEach(function(p){ if(p.pnr) (byPnr[p.pnr] = byPnr[p.pnr] || []).push(p); });
    var gid = {};
    Object.keys(byPnr).forEach(function(pnr){
      if(byPnr[pnr].length > 1){
        var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var id = groupSeq < 26 ? letters[groupSeq]
               : letters[Math.floor(groupSeq/26)-1] + letters[groupSeq%26];
        gid[pnr] = id + byPnr[pnr].length;
        groupSeq++;
      }
    });

    var pnrDone = {};
    members.forEach(function(p){
      var line = "1" + p.surname.replace(/\s/g,"") + "/" + p.given;
      if(p.pnr && gid[p.pnr]) line += "-" + gid[p.pnr];
      var els = [];
      if(p.pnr && !pnrDone[p.pnr]){ els.push(".L/" + p.pnr); pnrDone[p.pnr] = 1; }
      if(p.seat) els.push(".R/RQST HK1 " + p.seat);
      (p.ssr ? p.ssr.split(/[;,\s]+/) : []).filter(Boolean).forEach(function(code){
        if(/^[A-Z]{4}$/.test(code)) els.push(".R/" + code + " HK1");
        else problems.push(p.surname + "/" + p.given + ": \"" + code + "\" is not a 4-letter SSR code — left out.");
      });
      // keep every line within the 64-character limit (RP 1707b Sec.2 Note 3)
      var first = line;
      var spill = [];
      els.forEach(function(e){
        if((first + " " + e).length <= 64) first += " " + e;
        else spill.push(e);
      });
      out.push(first);
      spill.forEach(function(e){ out.push(e); });
    });
  });

  out.push("ENDPNL");
  return { text: out.join("\n"), problems: problems, count: pax.length };
}

