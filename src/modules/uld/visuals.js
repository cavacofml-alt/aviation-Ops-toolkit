
/* ============================================================================
   AIRCRAFT DIAGRAM — side view with the compartments drawn in place,
   positioned along the fuselage by their real FWD/AFT stations.
   ============================================================================ */
function aircraftPanel(activeNum, mode){
  // mode "edit"    → clicking a hold selects it and its zone grid is shown below
  // mode "layouts" → clicking a hold switches the layout tab
  var act = (mode === "layouts") ? "pick-lcomp" : "pick-comp";
  var comps = U.compartments.filter(function(c){
    return c.uldGroups && c.uldGroups.some(function(g){ return g.positions.length; });
  });
  if(!comps.length) return "";

  var all = [];
  comps.forEach(function(c){ c.uldGroups.forEach(function(g){ g.positions.forEach(function(p){
    var f = parseFloat(p.fwd), a = parseFloat(p.aft);
    if(!isNaN(f) && !isNaN(a)) all.push([f,a]);
  }); }); });
  if(!all.length) return "";
  var minSt = Math.min.apply(null, all.map(function(x){return x[0];}));
  var maxSt = Math.max.apply(null, all.map(function(x){return x[1];}));
  if(!(maxSt > minSt)) return "";

  var W = 900, H = 200, noseX = 40, tailX = 860;
  var holdY = 128, holdH = 30;
  var span = maxSt - minSt, pad = span * 0.30;
  var st2x = function(st){ return noseX + ((st - (minSt - pad)) / (span + pad*2)) * (tailX - noseX); };

  var refX = null, refOff = 0;
  var refSt = parseFloat(U.refStation);
  if(!isNaN(refSt)){
    if(refSt >= minSt-pad && refSt <= maxSt+pad) refX = st2x(refSt);
    else refOff = refSt < minSt-pad ? -1 : 1;
  }

  var accent = ["var(--cyan)","var(--green)","var(--amber)","var(--magenta)"];
  var blocks = comps.map(function(c,i){
    var fs = [], as = [];
    c.uldGroups.forEach(function(g){ g.positions.forEach(function(p){
      var f=parseFloat(p.fwd), a=parseFloat(p.aft);
      if(!isNaN(f)) fs.push(f); if(!isNaN(a)) as.push(a);
    }); });
    if(!fs.length) return "";
    var x1 = st2x(Math.min.apply(null,fs)), x2 = st2x(Math.max.apply(null,as));
    var col = accent[i % accent.length];
    var nPos = c.uldGroups.reduce(function(s,g){ return s + g.positions.length; }, 0);
    var on = (c.number === activeNum);
    var idx = U.compartments.indexOf(c);
    return '<g class="hold" data-act="'+act+'" data-i="'+idx+'" data-n="'+i+'" style="cursor:pointer">'+
      '<title>Compartment '+c.number+' — '+nPos+' positions</title>'+
      '<rect x="'+x1.toFixed(1)+'" y="'+(on?holdY-3:holdY)+'" width="'+Math.max(2,(x2-x1)).toFixed(1)+'" '+
        'height="'+(on?holdH+6:holdH)+'" fill="'+col+'" fill-opacity="'+(on?0.34:0.16)+'" '+
        'stroke="'+col+'" stroke-width="'+(on?2.5:1.3)+'" rx="2"></rect>'+
      '<text x="'+((x1+x2)/2).toFixed(1)+'" y="'+(holdY+holdH/2+4)+'" text-anchor="middle" '+
        'style="fill:'+col+'" font-size="'+(on?14:12)+'" font-weight="'+(on?"700":"400")+'" '+
        'font-family="monospace">'+c.number+'</text>'+
      '<text x="'+((x1+x2)/2).toFixed(1)+'" y="'+(holdY+holdH+18)+'" text-anchor="middle" '+
        'style="fill:'+(on?col:"var(--dim)")+'" font-size="9" font-family="monospace">'+nPos+' pos</text>'+
    '</g>';
  }).join("");

  var svg = '<div style="overflow-x:auto">'+
    '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:1100px;height:auto;display:block;margin:0 auto" role="img" '+
      'aria-label="Side view of the aircraft with cargo compartments">'+
      '<path d="M '+noseX+' 100 C '+(noseX+30)+' 62, '+(noseX+120)+' 48, 300 48 '+
        'L 690 48 C 760 48, 800 56, '+(tailX-40)+' 66 L '+tailX+' 74 L '+(tailX-26)+' 92 '+
        'C '+(tailX-60)+' 112, 700 132, 620 138 L 210 140 C 130 140, '+(noseX+20)+' 126, '+noseX+' 100 Z" '+
        'style="fill:var(--panel);stroke:var(--line-2)" stroke-width="1.6"></path>'+
      '<path d="M 700 50 L 742 8 L 772 8 L 762 50 Z" style="fill:var(--panel);stroke:var(--line-2)" stroke-width="1.4"></path>'+
      '<path d="M 430 132 L 520 132 L 588 176 L 520 176 Z" style="fill:var(--panel2);stroke:var(--line-2)" stroke-width="1.4"></path>'+
      '<line x1="150" y1="80" x2="690" y2="76" style="stroke:var(--line)" stroke-width="1"></line>'+
      '<line x1="90" y1="'+holdY+'" x2="'+(tailX-40)+'" y2="'+holdY+'" style="stroke:var(--line)" stroke-width="1"></line>'+
      blocks +
      (refX!==null
        ? '<line x1="'+refX.toFixed(1)+'" y1="40" x2="'+refX.toFixed(1)+'" y2="182" style="stroke:var(--magenta)" '+
          'stroke-width="1" stroke-dasharray="4 3"></line>'+
          '<text x="'+refX.toFixed(1)+'" y="194" text-anchor="middle" style="fill:var(--magenta)" font-size="9" '+
          'font-family="monospace">REF '+esc(U.refStation)+'</text>'
        : (refOff!==0
          ? '<text x="'+(refOff>0? (tailX-4) : (noseX+4))+'" y="194" text-anchor="'+(refOff>0?"end":"start")+'" '+
            'style="fill:var(--magenta)" font-size="9" font-family="monospace">'+
            (refOff>0? 'REF '+esc(U.refStation)+' \u25b8 off scale' : '\u25c2 REF '+esc(U.refStation)+' off scale')+'</text>'
          : ''))+
      '<text x="'+noseX+'" y="184" style="fill:var(--faint)" font-size="9" font-family="monospace">FWD</text>'+
      '<text x="'+tailX+'" y="184" text-anchor="end" style="fill:var(--faint)" font-size="9" font-family="monospace">AFT</text>'+
    '</svg></div>';

  var active = U.compartments.filter(function(c){ return c.number===activeNum; })[0];
  var zone = (mode !== "layouts" && active) ? zoneGrid(active) : "";

  return '<div class="card" style="padding:14px 16px">'+
    '<div class="sec" style="margin-bottom:8px">Aircraft — compartment layout'+
      '<span class="note" style="margin-left:10px;text-transform:none;letter-spacing:0">'+
      'select a hold to work on it</span></div>'+
    svg +
    '<div class="note" style="margin-top:2px">Compartments are drawn to scale between stations '+
      esc(minSt)+' and '+esc(maxSt)+'.'+
      (refOff!==0 ? ' Reference station '+esc(U.refStation)+' lies '+(refOff>0?'aft of':'forward of')+
        ' the drawn span.' : '')+'</div>'+
    zone +
  '</div>';
}

/* zone grid for one compartment — rendered inside the aircraft panel */
function zoneGrid(comp){
  var groups = comp.uldGroups || [];
  var nums = [];
  groups.forEach(function(g){ g.positions.forEach(function(p){
    var n = p.name.replace(/[LRP]/g,"");
    if(n && nums.indexOf(n)<0) nums.push(n);
  }); });
  nums.sort(function(a,b){ return parseInt(a,10)-parseInt(b,10); });
  if(!nums.length) return "";

  var lr = groups.filter(function(g){ return g.uldType==="LD3"; })[0];
  var ps = groups.filter(function(g){ return g.uldType.indexOf("LD7")===0; });
  var sg = groups.filter(function(g){ return g.uldType==="LD8"; })[0];
  var lrNums = lr ? lr.positions.map(function(p){ return p.name.replace(/[LR]/g,""); }) : [];
  var sNums  = sg ? sg.positions.map(function(p){ return p.name; }) : [];

  function cell(tone, label, exists){
    var c = "var(--"+tone+")", soft = "var(--"+tone+"-soft)";
    return '<div style="width:46px;height:32px;border:1.5px solid '+(exists?c:"var(--line)")+';'+
      'background:'+(exists?soft:"transparent")+';border-radius:2px;display:flex;align-items:center;'+
      'justify-content:center;font-family:var(--mono);font-size:11px;'+
      'color:'+(exists?c:"var(--faint)")+'">'+(exists?esc(label):"")+'</div>';
  }
  function row(label, labelColor, cells){
    return '<div style="display:flex;gap:4px;align-items:center">'+
      '<div style="width:42px;text-align:right;padding-right:8px;font-family:var(--mono);'+
      'font-size:10px;color:'+labelColor+'">'+esc(label)+'</div>'+cells+'</div>';
  }

  var out = "";
  if(lr) out += row("R","var(--cyan)", nums.map(function(n){
    return cell("cyan", n+"R", lrNums.indexOf(n)>=0); }).join(""));
  ps.forEach(function(pg){
    var tone = pg.uldType==="LD7/P88" ? "green" : "teal";
    out += row(pg.uldType==="LD7/P88"?"P88":"P96","var(--"+tone+")", nums.map(function(n){
      var exists = pg.positions.some(function(p){ return p.name===n+"P"; });
      return cell(tone, n+"P", exists); }).join(""));
  });
  if(sg) out += row("PLA","var(--amber)", nums.map(function(n){
    return cell("amber", n, sNums.indexOf(n)>=0); }).join(""));
  if(lr) out += row("L","var(--cyan)", nums.map(function(n){
    return cell("cyan", n+"L", lrNums.indexOf(n)>=0); }).join(""));

  var legend = [];
  if(lr) legend.push(['cyan','L/R (LD3)']);
  ps.forEach(function(pg){ legend.push([pg.uldType==="LD7/P88"?'green':'teal', pg.uldType]); });
  if(sg) legend.push(['amber','Single (LD8)']);

  return '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">'+
    '<div class="sec" style="margin-bottom:10px">Compartment '+comp.number+' — zone view</div>'+
    '<div style="overflow-x:auto"><div style="display:inline-flex;flex-direction:column;gap:4px;min-width:max-content">'+
      out +
      '<div style="display:flex;gap:4px;align-items:center;margin-top:2px">'+
        '<div style="width:42px"></div>'+
        nums.map(function(n){
          return '<div style="width:46px;text-align:center;font-family:var(--mono);font-size:9px;color:var(--faint)">'+esc(n)+'</div>';
        }).join("")+
      '</div>'+
    '</div></div>'+
    '<div class="zone-legend">'+ legend.map(function(l){
      return '<span style="color:var(--'+l[0]+')"><i style="background:var(--'+l[0]+'-soft);'+
        'border:1px solid var(--'+l[0]+')"></i>'+esc(l[1])+'</span>';
    }).join("")+'</div>'+
  '</div>';
}

/* ============================================================================
   DECKS — a visual strip of one generated layout's positions, ordered by
   station. Each tile carries a native tooltip listing every ULD certified
   for that exact slot (an L/R pair can be certified for more than one type
   when two ULDs match the same fwd/aft/index/max-weight there).
   ============================================================================ */
function deckStrip(layout){
  var positions = layout.positions.slice().sort(function(a,b){
    return parseFloat(a.fwd)-parseFloat(b.fwd) || (a.name<b.name?-1:1);
  });
  var tiles = positions.map(function(p){
    var col = groupColor(p.uldType);
    var cert = (p.certified||[{type:p.uldType,iata:p.uld}])
      .map(function(c){ return c.type+" ("+c.iata+")"; }).join(", ");
    return '<div title="Certified ULDs: '+esc(cert)+'" style="min-width:56px;height:40px;'+
      'border:1.5px solid '+col+';background:color-mix(in srgb, '+col+' 14%, transparent);'+
      'border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;'+
      'font-family:var(--mono);cursor:default">'+
      '<span style="font-size:11px;color:'+col+'">'+esc(p.name)+'</span>'+
      '<span style="font-size:9px;color:var(--dim)">'+esc(p.uld)+'</span>'+
    '</div>';
  }).join("");
  return '<div style="display:flex;gap:6px;flex-wrap:wrap;padding:10px;background:var(--panel2);'+
    'border-radius:3px;margin-top:8px">'+tiles+'</div>';
}

/* ============================================================================
   TEMPLATES modal
   ============================================================================ */
function openTemplates(){
  var host = $("modalHost");
  var cards = TEMPLATES.map(function(t,i){
    var pos = (t.compartments||[]).reduce(function(s,c){
      return s + (c.uldGroups||[]).reduce(function(k,g){ return k+g.positions.length; },0); },0);
    return '<div class="preset-card">'+
      '<div><b style="color:var(--cyan)">'+esc(t.name)+'</b>'+
      '<div class="note">'+(t.ulds||[]).length+' ULDs · '+(t.compartments||[]).length+
        ' compartments · '+pos+' positions · ref. '+esc(t.refStation||"—")+'</div></div>'+
      '<button class="btn small" data-act="load-tpl" data-i="'+i+'">Load</button></div>';
  }).join("");

  host.innerHTML = '<div class="modal-back"><div class="modal">'+
    '<div class="mh"><b>Aircraft templates</b>'+
      '<button class="btn small quiet" data-act="close">Close</button></div>'+
    '<div class="mb">'+ cards +
      '<p class="note" style="margin-top:12px">Loading a template <b>replaces</b> the ULDs, compartments and '+
      'reference station you have now. To keep the current setup, close this and use <b>Export file</b> first — '+
      'it downloads everything to a file you can bring back later with <b>Load</b>.</p>'+
    '</div></div></div>';

  host.querySelector('[data-act="close"]').addEventListener("click", function(){ host.innerHTML=""; });
  host.querySelector(".modal-back").addEventListener("click", function(e){ if(e.target===this) host.innerHTML=""; });
  Array.prototype.forEach.call(host.querySelectorAll('[data-act="load-tpl"]'), function(b){
    b.addEventListener("click", function(){
      var t = TEMPLATES[+b.getAttribute("data-i")];
      U.ulds = JSON.parse(JSON.stringify(t.ulds||[]));
      U.compartments = JSON.parse(JSON.stringify(t.compartments||[]));
      U.refStation = t.refStation||"";
      $("refStation").value = U.refStation;
      U.tplName = t.name||null;
      U.step = 0; U.layouts = null; U.activeComp = 0; U.editUld = null;
      host.innerHTML = ""; uldRender();
    });
  });
}
