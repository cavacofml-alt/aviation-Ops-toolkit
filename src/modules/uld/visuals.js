
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

  var W = 900, H = 240, noseX = 40, tailX = 860;
  var holdY = 108, holdH = 68;
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
    var y = on?holdY-3:holdY, h = on?holdH+6:holdH;

    return '<g class="hold" data-act="'+act+'" data-i="'+idx+'" data-n="'+i+'" style="cursor:pointer">'+
      '<title>Compartment '+c.number+' — '+nPos+' positions</title>'+
      '<rect x="'+x1.toFixed(1)+'" y="'+y+'" width="'+Math.max(2,(x2-x1)).toFixed(1)+'" '+
        'height="'+h+'" fill="'+col+'" fill-opacity="'+(on?0.34:0.16)+'" '+
        'stroke="'+col+'" stroke-width="'+(on?2.5:1.3)+'" rx="2"></rect>'+
      '<text x="'+((x1+x2)/2).toFixed(1)+'" y="'+(y+h/2+4)+'" text-anchor="middle" '+
        'style="fill:'+col+'" font-size="'+(on?14:12)+'" font-weight="'+(on?"700":"400")+'" '+
        'font-family="monospace">'+c.number+'</text>'+
      '<text x="'+((x1+x2)/2).toFixed(1)+'" y="'+(y+h+18)+'" text-anchor="middle" '+
        'style="fill:'+(on?col:"var(--dim)")+'" font-size="9" font-family="monospace">'+nPos+' pos</text>'+
    '</g>';
  }).join("");

  var svg = '<div style="overflow-x:auto">'+
    '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;max-width:1100px;height:auto;display:block;margin:0 auto" role="img" '+
      'aria-label="Side view of the aircraft with cargo compartments">'+
      '<path d="M '+noseX+' 120 C '+(noseX+30)+' 74.4, '+(noseX+120)+' 57.6, 300 57.6 '+
        'L 690 57.6 C 760 57.6, 800 67.2, '+(tailX-40)+' 79.2 L '+tailX+' 88.8 L '+(tailX-26)+' 110.4 '+
        'C '+(tailX-60)+' 134.4, 700 158.4, 620 165.6 L 210 168 C 130 168, '+(noseX+20)+' 151.2, '+noseX+' 120 Z" '+
        'style="fill:var(--panel);stroke:var(--line-2)" stroke-width="1.6"></path>'+
      '<path d="M 700 60 L 742 9.6 L 772 9.6 L 762 60 Z" style="fill:var(--panel);stroke:var(--line-2)" stroke-width="1.4"></path>'+
      '<path d="M 430 158.4 L 520 158.4 L 588 211.2 L 520 211.2 Z" style="fill:var(--panel2);stroke:var(--line-2)" stroke-width="1.4"></path>'+
      '<line x1="150" y1="96" x2="690" y2="91.2" style="stroke:var(--line)" stroke-width="1"></line>'+
      '<line x1="90" y1="'+holdY+'" x2="'+(tailX-40)+'" y2="'+holdY+'" style="stroke:var(--line)" stroke-width="1"></line>'+
      blocks +
      (refX!==null
        ? '<line x1="'+refX.toFixed(1)+'" y1="48" x2="'+refX.toFixed(1)+'" y2="'+(holdY+holdH+16)+'" style="stroke:var(--magenta)" '+
          'stroke-width="1" stroke-dasharray="4 3"></line>'+
          '<text x="'+refX.toFixed(1)+'" y="'+(holdY+holdH+30)+'" text-anchor="middle" style="fill:var(--magenta)" font-size="9" '+
          'font-family="monospace">REF '+esc(U.refStation)+'</text>'
        : (refOff!==0
          ? '<text x="'+(refOff>0? (tailX-4) : (noseX+4))+'" y="'+(holdY+holdH+30)+'" text-anchor="'+(refOff>0?"end":"start")+'" '+
            'style="fill:var(--magenta)" font-size="9" font-family="monospace">'+
            (refOff>0? 'REF '+esc(U.refStation)+' \u25b8 off scale' : '\u25c2 REF '+esc(U.refStation)+' off scale')+'</text>'
          : ''))+
      '<text x="'+noseX+'" y="'+(holdY+holdH+20)+'" style="fill:var(--faint)" font-size="9" font-family="monospace">FWD</text>'+
      '<text x="'+tailX+'" y="'+(holdY+holdH+20)+'" text-anchor="end" style="fill:var(--faint)" font-size="9" font-family="monospace">AFT</text>'+
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

/* zone grid for one compartment — rendered inside the aircraft panel.
   Generic over every ULD group in the compartment (not just LD3/LD7/LD8),
   so PKC, PLA and LD6/ALF get their own row exactly like any other type —
   a group with L/R-suffixed positions becomes two rows (R, L) so each
   column still holds exactly one cell; a P-suffixed or plain-named group
   is one row. */
function zoneGrid(comp){
  var groups = (comp.uldGroups||[]).filter(function(g){ return g.positions.length; });
  var nums = [];
  groups.forEach(function(g){ g.positions.forEach(function(p){
    var n = p.name.replace(/[LRP]/g,"");
    if(n && nums.indexOf(n)<0) nums.push(n);
  }); });
  nums.sort(function(a,b){ return parseInt(a,10)-parseInt(b,10); });
  if(!nums.length) return "";

  function cell(color, label, exists){
    return '<div style="width:46px;height:32px;border:1.5px solid '+(exists?color:"var(--line)")+';'+
      'background:'+(exists?'color-mix(in srgb, '+color+' 12%, transparent)':"transparent")+';'+
      'border-radius:2px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);'+
      'font-size:11px;color:'+(exists?color:"var(--faint)")+'">'+(exists?esc(label):"")+'</div>';
  }
  function row(label, color, cells){
    return '<div style="display:flex;gap:4px;align-items:center">'+
      '<div style="width:50px;text-align:right;padding-right:8px;font-family:var(--mono);'+
      'font-size:10px;color:'+color+'">'+esc(label)+'</div>'+cells+'</div>';
  }

  var rows = "", legend = [];
  groups.forEach(function(g){
    var color = groupColor(g.uldType);
    var iata = g.iata || g.uldType;
    var hasLR = g.positions.some(function(p){ return /[LR]$/.test(p.name); });
    var hasP  = g.positions.some(function(p){ return /P$/.test(p.name); });
    if(hasLR){
      var rSet = g.positions.filter(function(p){ return /R$/.test(p.name); }).map(function(p){ return p.name; });
      var lSet = g.positions.filter(function(p){ return /L$/.test(p.name); }).map(function(p){ return p.name; });
      rows += row(iata+" R", color, nums.map(function(n){ return cell(color, n+"R", rSet.indexOf(n+"R")>=0); }).join(""));
      rows += row(iata+" L", color, nums.map(function(n){ return cell(color, n+"L", lSet.indexOf(n+"L")>=0); }).join(""));
    } else if(hasP){
      var pSet = g.positions.map(function(p){ return p.name; });
      rows += row(iata+" P", color, nums.map(function(n){ return cell(color, n+"P", pSet.indexOf(n+"P")>=0); }).join(""));
    } else {
      var sSet = g.positions.map(function(p){ return p.name; });
      rows += row(iata, color, nums.map(function(n){ return cell(color, n, sSet.indexOf(n)>=0); }).join(""));
    }
    legend.push([color, g.label || (g.uldType+" ("+iata+")")]);
  });

  return '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">'+
    '<div class="sec" style="margin-bottom:10px">Compartment '+comp.number+' — zone view</div>'+
    '<div style="overflow-x:auto"><div style="display:inline-flex;flex-direction:column;gap:4px;min-width:max-content">'+
      rows +
      '<div style="display:flex;gap:4px;align-items:center;margin-top:2px">'+
        '<div style="width:50px"></div>'+
        nums.map(function(n){
          return '<div style="width:46px;text-align:center;font-family:var(--mono);font-size:9px;color:var(--faint)">'+esc(n)+'</div>';
        }).join("")+
      '</div>'+
    '</div></div>'+
    '<div class="zone-legend">'+ legend.map(function(l){
      return '<span style="color:'+l[0]+'"><i style="background:color-mix(in srgb, '+l[0]+' 12%, transparent);'+
        'border:1px solid '+l[0]+'"></i>'+esc(l[1])+'</span>';
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
