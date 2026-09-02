
/* ============================================================================
   ULD LAYOUT GENERATOR — BETA wiring

   The shipped module is loaded whole and left alone: its generator, export,
   validation, undo, templates and aircraft diagram all still run. Only the
   compartment editor is replaced, by assigning over viewStep2 — an
   assignment, not a second declaration, so nothing is defined twice.

   UB holds the positions-first model. Everything downstream still expects
   groups, so ubSync() projects UB into U before anything reads it.
   ============================================================================ */
var UB = { compartments: [], cellOpen: {} };

/* U.ulds and UB share one array: step 1 (the catalog) is the shipped editor,
   and its edits must land in both. */
function ubAdopt(comps){
  UB.compartments = comps;
  ubSync();
}
function ubSync(){
  var projected = (UB.compartments||[]).map(function(c){ return ubToGroups(c, U.ulds||[]); });
  // marks this exact array as ours; anything written from outside is a new
  // array without it. Extra properties on an array are dropped by
  // JSON.stringify, so the export and the autosave never see this.
  Object.defineProperty(projected, "__fromUB", { value:true, enumerable:false });
  U.compartments = projected;
}

/* Anything that writes U.compartments from outside this editor — a template,
   an imported file, the autosave restore — arrives in the old group shape and
   is adopted on the next render. The projection ubSync() writes is stamped,
   so it is not mistaken for one of those and round-tripped: a bay typed but
   not yet ticked has no groups to project into, and would be lost. */
uldRender = (function(shipped){
  return function(){
    var c0 = (U.compartments||[])[0];
    if(c0 && c0.uldGroups && !U.compartments.__fromUB)
      UB.compartments = U.compartments.map(function(c){ return ubFromGroups(c, U.ulds||[]); });
    ubSync();
    shipped();
  };
})(uldRender);

/* ---------- the matrix ---------- */
function ubViewStep2(){
  if(!U.ulds.length) return '<div class="empty">Add at least one ULD first.</div>';
  if(!UB.compartments.length){
    return aircraftPanel(null, "edit") +
      '<div class="empty">No compartments yet.</div>'+
      '<button class="btn primary" data-act="ub-add-comp">+ Compartment</button>';
  }
  var nums = UB.compartments.map(function(c){ return c.number; });
  if(U.activeComp >= UB.compartments.length) U.activeComp = 0;
  var comp = UB.compartments[U.activeComp];

  var tabs = '<div class="comp-tabs">'+ nums.map(function(n,i){
      return '<button class="comp-tab" data-act="ub-pick-comp" data-i="'+i+'" aria-selected="'+
        (i===U.activeComp)+'">Compartment '+n+' ('+UB.compartments[i].positions.length+')</button>';
    }).join("")+
    '<button class="comp-tab" data-act="ub-add-comp">+ Compartment</button></div>';

  var m = ubMatrix(comp, U.ulds);
  var head = '<tr>'+
    '<th style="text-align:left;min-width:64px;padding:6px 8px">Bay</th>'+
    ['FWD','AFT','L','R','Index'].map(function(h){
      return '<th style="text-align:left;min-width:56px;padding:6px 8px">'+esc(h)+'</th>'; }).join("")+
    m.ulds.map(function(u){
      return '<th style="text-align:center;min-width:62px;padding:6px 4px" title="'+esc(u.uldType)+' · '+u.maxWeight+' kg">'+
        '<span class="badge solid" style="--gc:'+groupColor(u.uldType)+'">'+esc(u.iata)+'</span></th>';
    }).join("")+
    '<th></th></tr>';

  var rows = m.rows.map(function(r, ri){
    var cells = r.cells.map(function(cell, ci){
      var open = UB.cellOpen[comp.id+"|"+ri+"|"+cell.iata];
      var body = '<label style="display:flex;justify-content:center;cursor:pointer">'+
        '<input type="checkbox" data-ub="tick" data-r="'+ri+'" data-iata="'+esc(cell.iata)+'"'+
        (cell.on?" checked":"")+'></label>';
      if(cell.on){
        var eff = ubEffective(r.pos, cell.tick, U.ulds);
        body += '<div style="margin-top:4px;text-align:center">'+
          '<button class="btn small quiet" data-ub="cell" data-r="'+ri+'" data-iata="'+esc(cell.iata)+'" '+
            'style="padding:1px 6px;font-size:10px;letter-spacing:0;'+
            (cell.overrides.length?'border-color:var(--amber);color:var(--amber)':'')+'" '+
            'title="'+(cell.overrides.length? 'manual differs: '+esc(cell.overrides.join(", ")) : 'from the catalog')+'">'+
            esc(eff.maxWeight)+' kg'+(cell.overrides.length?' *':'')+'</button></div>';
        if(open){
          body += '<div style="margin-top:4px;display:flex;flex-direction:column;gap:3px;min-width:92px">'+
            ["maxWeight","fwd","aft","index"].map(function(k){
              var lbl = {maxWeight:"max wt", fwd:"FWD", aft:"AFT", index:"index"}[k];
              return '<input type="text" data-ub="ovr" data-r="'+ri+'" data-iata="'+esc(cell.iata)+'" data-k="'+k+'" '+
                'value="'+esc(cell.tick[k]==null?"":cell.tick[k])+'" placeholder="'+esc(lbl+" "+eff[k])+'" '+
                'style="font-size:10.5px;padding:3px 5px">';
            }).join("")+
            '<span class="note" style="font-size:9.5px">blank = from the catalog / the bay</span></div>';
        }
      }
      return '<td style="vertical-align:top;text-align:center;padding:4px">'+body+'</td>';
    }).join("");

    return '<tr>'+
      ["name","fwd","aft","left","right","index"].map(function(k){
        return '<td style="vertical-align:top;padding:4px"><input type="'+(k==="name"?"text":"number")+'" '+
          'data-ub="pos" data-r="'+ri+'" data-k="'+k+'" value="'+esc(r.pos[k]==null?"":r.pos[k])+'" '+
          'placeholder="'+esc(k==="name"?String(comp.number)+"1L":k.toUpperCase())+'" '+
          'style="width:'+(k==="name"?"64":(k==="left"||k==="right"?"46":"72"))+'px;'+
          'font-size:11.5px;padding:4px 5px"></td>';
      }).join("")+
      cells+
      '<td style="vertical-align:top"><button class="btn small danger" data-ub="del-pos" data-r="'+ri+'">&times;</button></td>'+
    '</tr>';
  }).join("");

  var ticks = (comp.positions||[]).reduce(function(s,p){ return s + (p.ulds||[]).length; }, 0);

  return aircraftPanel(comp.number, "edit")+
    tabs+
    '<div class="card" style="padding:14px 16px">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">'+
        '<div><b>Compartment '+comp.number+'</b>'+
        '<div class="note">'+comp.positions.length+' bays · '+ticks+' ULDs certified. '+
          'Tick a ULD to certify it for that bay; the weight under the tick comes from the catalog. '+
          'Select it to state what the manual says differently.</div></div>'+
        '<button class="btn small danger" data-act="ub-del-comp">&times; Remove compartment</button>'+
      '</div>'+
      (comp.positions.length
        ? '<div style="overflow-x:auto"><table style="width:max-content">'+
            '<thead>'+head+'</thead><tbody>'+rows+'</tbody></table></div>'
        : '<div class="empty">No bays yet.</div>')+
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'+
        '<button class="btn small" data-act="ub-add-pos">+ Bay</button>'+
        '<button class="btn small" data-act="ub-add-pair">+ L/R pair</button>'+
      '</div>'+
    '</div>';
}
viewStep2 = ubViewStep2;

/* ---------- events ---------- */
function ubComp(){ return UB.compartments[U.activeComp]; }
function ubRow(r){ var c = ubComp(); return c && c.positions[+r]; }

$("uldStep").addEventListener("input", function(e){
  var el = e.target.closest ? e.target.closest("[data-ub]") : null;
  if(!el) return;
  var kind = el.getAttribute("data-ub");
  var pos = ubRow(el.getAttribute("data-r"));
  if(!pos) return;
  if(kind === "pos"){
    pos[el.getAttribute("data-k")] = el.value;
  } else if(kind === "ovr"){
    var tick = ubUldDef(pos.ulds, el.getAttribute("data-iata"));
    if(!tick) return;
    var k = el.getAttribute("data-k");
    if(el.value === "") delete tick[k]; else tick[k] = el.value;
  } else return;
  ubSync();
  U.layouts = null;
  if(typeof uldTouch === "function") uldTouch();
});

$("uldStep").addEventListener("change", function(e){
  var el = e.target.closest ? e.target.closest('[data-ub="tick"]') : null;
  if(!el) return;
  var pos = ubRow(el.getAttribute("data-r"));
  if(!pos) return;
  if(typeof pushUndo === "function")
    pushUndo((el.checked?"certified ":"un-certified ")+el.getAttribute("data-iata")+" at "+pos.name);
  ubToggle(pos, el.getAttribute("data-iata"), el.checked);
  ubSync();
  U.layouts = null;
  uldRender();
});

$("uldStep").addEventListener("click", function(e){
  var cell = e.target.closest ? e.target.closest('[data-ub="cell"]') : null;
  if(cell){
    var key = ubComp().id+"|"+cell.getAttribute("data-r")+"|"+cell.getAttribute("data-iata");
    UB.cellOpen[key] = !UB.cellOpen[key];
    uldRender();
    return;
  }
  var del = e.target.closest ? e.target.closest('[data-ub="del-pos"]') : null;
  if(del){
    var comp = ubComp(), i = +del.getAttribute("data-r");
    if(typeof pushUndo === "function") pushUndo("removed bay "+((comp.positions[i]||{}).name||""));
    comp.positions.splice(i,1);
    ubSync(); U.layouts = null; uldRender();
  }
});

/* the toolbar actions that belong to this editor */
document.addEventListener("click", function(e){
  var b = e.target.closest ? e.target.closest("[data-act]") : null;
  if(!b) return;
  var act = b.getAttribute("data-act");
  var comp = ubComp();
  if(act === "ub-pick-comp"){ U.activeComp = +b.getAttribute("data-i"); uldRender(); }
  else if(act === "ub-add-comp"){
    UB.compartments.push({ id:uid(), number:UB.compartments.length+1, positions:[] });
    U.activeComp = UB.compartments.length-1; ubSync(); uldRender();
  }
  else if(act === "ub-del-comp"){
    if(!comp) return;
    if(typeof pushUndo === "function") pushUndo("removed compartment "+comp.number);
    UB.compartments.splice(U.activeComp,1);
    UB.compartments.forEach(function(c,i){ c.number = i+1; });
    U.activeComp = Math.max(0, U.activeComp-1);
    ubSync(); U.layouts = null; uldRender();
  }
  else if(act === "ub-add-pos"){
    if(!comp) return;
    comp.positions.push({ id:uid(), name:"", fwd:"", aft:"", left:"0", right:"0", index:"", ulds:[] });
    ubSync(); uldRender();
  }
  else if(act === "ub-add-pair"){
    if(!comp) return;
    var base = (prompt("Bay number for the pair (e.g. "+comp.number+"1)")||"").trim().toUpperCase();
    if(!base) return;
    // the pair shares everything but the side it sits on
    var src = comp.positions.filter(function(p){ return String(p.name).replace(/[LR]$/,"") === base; })[0];
    var common = src ? {fwd:src.fwd, aft:src.aft, index:src.index} : {fwd:"", aft:"", index:""};
    var off = src ? (/L$/.test(src.name) ? src.right : src.left) : "0";
    ["L","R"].forEach(function(side){
      if(comp.positions.some(function(p){ return p.name === base+side; })) return;
      comp.positions.push({ id:uid(), name:base+side, fwd:common.fwd, aft:common.aft,
        left: side==="L" ? "0" : off, right: side==="L" ? off : "0", index:common.index, ulds:[] });
    });
    ubSync(); uldRender();
  }
});

/* ---------- boot ---------- */
uldRender();
