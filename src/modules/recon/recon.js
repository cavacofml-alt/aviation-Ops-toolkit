
/* ============================================================================
   MESSAGE MODEL — a light parser that turns PNL/ADL text into passengers.
   Separate from the validator engine on purpose: that one judges a message,
   this one has to understand what it *means* across several messages.
   ============================================================================ */
var RXO = {
  id:   /^(PNL|ADL)$/,
  flt:  /^([A-Z]{2}[A-Z0-9]?)(\d{1,4})([A-Z]?)\/(\d{2})([A-Z]{3})\s+([A-Z]{3})(?:\s+PART\s*(\d{1,2}))?$/,
  tot:  /^-([A-Z]{3})(\d{1,3})([A-Z])(?:-PAD(\d+))?$/,
  sec:  /^(DEL|ADD|CHG)$/,
  end:  /^END(PNL|ADL|PART\s*\d{1,2})$/,
  name: /^(\d{1,3})([A-Z][^-]*)(?:-([A-Z]{1,2})(\d{1,3}))?(.*)$/,
  nonames: /^(\d{1,3})NONAMES(?:-([A-Z]{1,2})(\d{1,3}))?$/
};
var TITLES_RX = /(MSTR|MISS|MRS|MS|MR|DR|PROF|CAPT|SIR|LADY|REV)$/;

function stripTitleTok(s){
  var t = String(s||"").replace(/\s+/g,"").toUpperCase();
  var m = t.match(TITLES_RX);
  return m && t.length > m[1].length ? t.slice(0, -m[1].length) : t;
}
function paxKey(surname, given){
  return (surname||"").replace(/[^A-Z0-9]/gi,"").toUpperCase() + "/" +
         stripTitleTok(given).replace(/[^A-Z0-9]/gi,"");
}

/* Split raw text into messages, each with its sections and entries. */
function parseOps(raw){
  var lines = String(raw||"").replace(/\r/g,"").split("\n");
  var msgs = [], cur = null, section = null, dest = null, entry = null;

  function pushEntry(e){ if(cur && e) cur.entries.push(e); }

  lines.forEach(function(rawLine, idx){
    var line = rawLine.trim().toUpperCase();
    if(!line) return;
    var m;

    if(RXO.id.test(line)){
      entry = null;
      cur = { type: line, flight: null, part: null, entries: [], line: idx+1 };
      msgs.push(cur);
      section = (line === "PNL") ? "BASE" : null;
      dest = null;
      return;
    }
    if(!cur) return;

    if((m = line.match(RXO.flt))){
      cur.flight = m[1] + m[2] + (m[3]||"") + "/" + m[4] + m[5] + " " + m[6];
      cur.part = m[7] ? parseInt(m[7],10) : 1;
      entry = null; return;
    }
    if((m = line.match(RXO.tot))){
      dest = { ap: m[1], cls: m[3], declared: parseInt(m[2],10), pad: m[4]?parseInt(m[4],10):0 };
      cur.totals = cur.totals || [];
      cur.totals.push(dest);
      entry = null; return;
    }
    if(RXO.sec.test(line)){ section = line; entry = null; return; }
    if(RXO.end.test(line)){ entry = null; return; }

    if((m = line.match(RXO.nonames))){
      pushEntry({ kind:"NONAMES", count:parseInt(m[1],10), group:m[2]||null,
                  dest:dest, section:section, line:idx+1, els:[] });
      entry = null; return;
    }

    if((m = line.match(RXO.name)) && /\//.test(m[2])){
      var namePart = m[2].trim();
      var rest = (m[5]||"").trim();
      // inline elements live after the name, separated by a space
      var elsInline = [];
      var cut = namePart.search(/\s\./);
      if(cut >= 0){ elsInline.push(namePart.slice(cut+1).trim()); namePart = namePart.slice(0,cut).trim(); }
      if(rest && rest.charAt(0) === ".") elsInline.push(rest);

      var segs = namePart.split("/");
      var surname = segs[0];
      var givens = segs.slice(1).filter(function(x){ return x !== ""; });
      entry = { kind:"NAMES", count:parseInt(m[1],10), surname:surname, givens:givens,
                group:m[3]||null, groupTotal:m[4]?parseInt(m[4],10):null,
                dest:dest, section:section, line:idx+1, els:[] };
      elsInline.forEach(function(e){ entry.els.push(e); });
      pushEntry(entry);
      return;
    }

    // element lines attach to the entry above
    if(line.charAt(0) === "." && entry){ entry.els.push(line); return; }
  });
  return msgs;
}

/* RP 1708 §2.14.3: within a PNL — and within each ADL section — the PNR address
   appears only once per PNR, on the first alphabetical surname. So an entry
   without .L/ may still belong to a PNR stated on a sibling entry of the same
   party. Group identifiers are what tie them together. */
function entryPnr(e){
  var m = null;
  e.els.some(function(el){ var x = el.match(/^\.L\/([A-Z0-9]{4,12})/); if(x){ m = x[1]; return true; } });
  return m;
}
function spreadPnrs(msgs){
  msgs.forEach(function(m){
    var byGroup = {};
    m.entries.forEach(function(e){
      e.pnr = entryPnr(e);
      if(e.group && e.pnr) byGroup[(e.section||"") + "|" + e.group] = e.pnr;
    });
    m.entries.forEach(function(e){
      if(!e.pnr && e.group){
        var k = (e.section||"") + "|" + e.group;
        if(byGroup[k]) e.pnr = byGroup[k];
      }
    });
  });
}

/* Expand entries into individual passengers. */
function entryPassengers(e){
  if(e.kind === "NONAMES") return [];
  var out = [];
  e.givens.forEach(function(g){
    out.push({
      key: paxKey(e.surname, g),
      pnr: e.pnr || null,
      surname: e.surname, given: g,
      dest: e.dest ? e.dest.ap : null,
      cls:  e.dest ? e.dest.cls : null,
      group: e.group, els: e.els.slice(), line: e.line
    });
  });
  return out;
}

/* ============================================================================
   RECONCILIATION — apply the ADLs to the PNL, in the order given.
   ============================================================================ */
function reconcile(raw){
  var msgs = parseOps(raw);
  if(!msgs.length) return { error:"No PNL or ADL found. Paste the PNL followed by its ADLs." };
  spreadPnrs(msgs);

  var flights = {};
  msgs.forEach(function(m){ if(m.flight) flights[m.flight] = 1; });
  var flightList = Object.keys(flights);

  var pax = {};        // name key -> array of passengers (names are not unique)
  var log = [];        // change log
  var nonames = {};    // dest -> count
  var counts = { pnl:0, adl:0 };
  var warnings = [];

  msgs.forEach(function(m, mi){
    var label = m.type + (m.part ? " part " + m.part : "") + " (#" + (mi+1) + ")";
    if(m.type === "PNL") counts.pnl++; else counts.adl++;

    m.entries.forEach(function(e){
      var sec = e.section || (m.type === "PNL" ? "BASE" : null);

      if(e.kind === "NONAMES"){
        var dk = e.dest ? e.dest.ap + "/" + e.dest.cls : "?";
        if(sec === "DEL") nonames[dk] = Math.max(0, (nonames[dk]||0) - e.count);
        else nonames[dk] = (nonames[dk]||0) + e.count;
        log.push({ msg:label, section:sec||"—", action:sec==="DEL"?"removed":"added",
                   who:e.count + " NONAMES", dest:dk });
        return;
      }

      if(e.count !== e.givens.length){
        warnings.push(label + " line " + e.line + ": element says " + e.count +
                      " but lists " + e.givens.length + " name(s) — using the names listed.");
      }

      entryPassengers(e).forEach(function(p){
        var bucket = pax[p.key] || [];

        /* Matching. The PNR address is optional (RP 1708 §2.14.1), so a DEL or
           CHG may carry nothing but the name. That is fine while the name is
           unique; when it is not, only the PNR can tell two people apart, and
           guessing would silently act on the wrong passenger. */
        function pick(){
          if(!bucket.length) return { hit:null, why:"none" };
          if(bucket.length === 1) return { hit:bucket[0], why:"name" };
          if(p.pnr){
            var byPnr = bucket.filter(function(x){ return x.pnr === p.pnr; });
            if(byPnr.length === 1) return { hit:byPnr[0], why:"pnr" };
            if(byPnr.length > 1)   return { hit:null, why:"ambiguous-pnr" };
          }
          return { hit:null, why:"ambiguous" };
        }

        if(sec === "DEL"){
          var d = pick();
          if(d.hit){
            pax[p.key] = bucket.filter(function(x){ return x !== d.hit; });
            if(!pax[p.key].length) delete pax[p.key];
            log.push({ msg:label, section:sec, action:"removed", who:p.surname+"/"+p.given,
                       dest:p.dest, by:d.why, pnr:p.pnr });
          } else if(d.why === "none"){
            log.push({ msg:label, section:sec, action:"removed (not found)", who:p.surname+"/"+p.given, dest:p.dest });
            warnings.push(label + ": DEL for " + p.surname + "/" + p.given + " but that passenger was not on the list.");
          } else {
            log.push({ msg:label, section:sec, action:"NOT APPLIED — ambiguous", who:p.surname+"/"+p.given, dest:p.dest });
            warnings.push(label + ": " + bucket.length + " passengers named " + p.surname + "/" + p.given +
              (p.pnr ? " share PNR " + p.pnr : " and the DEL carries no PNR (.L/)") +
              " — nothing was removed, because acting on the wrong one is worse than acting on none.");
          }
        } else if(sec === "CHG"){
          var c = pick();
          if(c.hit){
            c.hit.els = p.els.slice();
            if(p.dest){ c.hit.dest = p.dest; c.hit.cls = p.cls; }
            if(p.pnr) c.hit.pnr = p.pnr;
            log.push({ msg:label, section:sec, action:"changed", who:p.surname+"/"+p.given,
                       dest:p.dest, by:c.why, pnr:p.pnr });
          } else if(c.why === "none"){
            pax[p.key] = bucket.concat([p]);
            log.push({ msg:label, section:sec, action:"changed (added)", who:p.surname+"/"+p.given, dest:p.dest });
            warnings.push(label + ": CHG for " + p.surname + "/" + p.given + " who was not on the list — treated as an addition.");
          } else {
            log.push({ msg:label, section:sec, action:"NOT APPLIED — ambiguous", who:p.surname+"/"+p.given, dest:p.dest });
            warnings.push(label + ": " + bucket.length + " passengers named " + p.surname + "/" + p.given +
              (p.pnr ? " share PNR " + p.pnr : " and the CHG carries no PNR (.L/)") +
              " — nothing was changed; the PNR address would tell them apart.");
          }
        } else {
          var dup = bucket.some(function(x){ return x.pnr && p.pnr && x.pnr === p.pnr; });
          if(bucket.length && sec === "ADD"){
            warnings.push(label + ": ADD for " + p.surname + "/" + p.given +
              (dup ? " who is already listed under the same PNR." :
                     " — another passenger with that name is already listed; keeping both."));
            log.push({ msg:label, section:sec, action: dup ? "added (duplicate)" : "added (same name)",
                       who:p.surname+"/"+p.given, dest:p.dest, pnr:p.pnr });
          } else {
            log.push({ msg:label, section:sec||"PNL", action:"added", who:p.surname+"/"+p.given,
                       dest:p.dest, pnr:p.pnr });
          }
          pax[p.key] = bucket.concat([p]);
        }
      });
    });
  });

  // final figures
  var list = [];
  Object.keys(pax).forEach(function(k){ pax[k].forEach(function(p){ list.push(p); }); });
  list.sort(function(a,b){
    var d = (a.dest||"").localeCompare(b.dest||"");
    if(d) return d;
    var s = a.surname.localeCompare(b.surname);
    return s || a.given.localeCompare(b.given);
  });

  var byDest = {};
  list.forEach(function(p){
    var k = (p.dest||"?") + "/" + (p.cls||"?");
    byDest[k] = byDest[k] || { dest:p.dest, cls:p.cls, pax:0, nonames:0 };
    byDest[k].pax++;
  });
  Object.keys(nonames).forEach(function(k){
    if(!nonames[k]) return;
    byDest[k] = byDest[k] || { dest:k.split("/")[0], cls:k.split("/")[1], pax:0, nonames:0 };
    byDest[k].nonames = nonames[k];
  });

  // declared totals from the last message that stated them
  var declared = {};
  msgs.forEach(function(m){
    (m.totals||[]).forEach(function(t){ declared[t.ap + "/" + t.cls] = t.declared; });
  });

  // SSR tally over the final list
  var ssr = {};
  list.forEach(function(p){
    p.els.forEach(function(el){
      var mm = el.match(/^\.R\/([A-Z]{4})\b/);
      if(mm) ssr[mm[1]] = (ssr[mm[1]]||0) + 1;
    });
  });

  return {
    flights: flightList, messages: msgs.length, counts: counts,
    list: list, byDest: byDest, declared: declared, ssr: ssr,
    log: log, warnings: warnings
  };
}
