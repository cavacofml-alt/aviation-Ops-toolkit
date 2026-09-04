
/* ============================================================================
   ULD LAYOUT GENERATOR — vanilla port
   State is mutated in place by input handlers (no re-render while typing, so
   the caret never jumps); render() runs only on structural changes.
   ============================================================================ */
var ULD_TYPES = ["LD3","L3P/PKC","LD7/P88","LD7/P96","LD8","PLA","LD1","LD2","LD4","LD6","LD9","LD11"];
/* typical figures per type — used only as field hints */
var ULD_TYPE_HINTS = {
  "LD3":{iata:"AKE", mw:"1587", tare:"63"},   "L3P/PKC":{iata:"PKC", mw:"1587", tare:"37"},
  "LD7/P88":{iata:"PAG", mw:"4626", tare:"110"},
  "LD7/P96":{iata:"PMC", mw:"6033", tare:"120"}, "LD8":{iata:"DQF", mw:"2450", tare:"110"},
  "PLA":{iata:"PLA", mw:"3175", tare:"105"},  "LD1":{iata:"AMA", mw:"1588", tare:"77"},
  "LD2":{iata:"AKH", mw:"1225", tare:"57"},   "LD4":{iata:"ALP", mw:"2449", tare:"84"},
  "LD6":{iata:"ALF", mw:"3175", tare:"120"},  "LD9":{iata:"AAP", mw:"4626", tare:"130"},
  "LD11":{iata:"AQP", mw:"3175", tare:"100"}
};
/* one colour per ULD type, carried through group box, badge and buttons */
var GROUP_COLORS = { "LD3":"var(--cyan)", "L3P/PKC":"var(--cyan)", "LD7/P88":"var(--green)", "LD7/P96":"var(--teal)",
                     "LD8":"var(--amber)", "PLA":"var(--amber)", "LD6":"var(--magenta)" };
function groupColor(t){ return GROUP_COLORS[t] || "var(--dim)"; }
/* Types that sit as a left/right half-bay pair, so they get the "+ L/R pair"
   form and the L<->R auto-mirror: the LD3 family (AKE, PKC, QKE, AKC, RKN…),
   PKC when the operator codes it as its own L3P/PKC type, and LD2 (AKH, DPE).
   Everything else (LD7 pallets, LD8/PLA/LD6 half pallets) occupies a whole
   bay and takes single positions. */
var LR_PAIR_TYPES = { "LD3":1, "L3P/PKC":1, "LD2":1 };
function isPairType(t){ return !!LR_PAIR_TYPES[t]; }
/* Type codes that name the same physical base. Only pairs the operator's own
   manuals put at identical positions with identical values belong here:
   L3P/PKC is their coding for a PKC pallet in an LD3 bay (the B777-300 book
   types that same PKC as plain "LD3"). Anything not listed is its own base,
   which is what makes a merged slot of two different bases — LD3 and LD2,
   say — name both type codes instead of borrowing the first one's. */
var ULD_BASE = { "L3P/PKC":"LD3" };
function uldBase(t){ return ULD_BASE[t] || t; }

/* The ULD a group was declared with, and every ULD in the catalog that shares
   its type — they have the same base, so they are loaded in the same
   positions, and the group's label names all of them. Derived rather than
   stored, so adding a ULD to the catalog updates the groups already built. */
function uldDefFor(g){
  return U.ulds.filter(function(u){ return u.uldType===g.uldType && u.iata===g.iata; })[0];
}
function iatasOfType(type){
  return U.ulds.filter(function(u){ return u.uldType===type; })
    .map(function(u){ return u.iata; });
}
/* Which ULDs of the type this group is actually certified for — the ticks in
   its header. A group that has never been touched carries none, and stands
   for every ULD of its type: the manuals are often not explicit, and the
   operator's judgement is what settles it. Untick to narrow it. */
function iatasOf(g){
  var all = iatasOfType(g.uldType);
  if(!g.iatas || !g.iatas.length) return all;
  var ticked = g.iatas.filter(function(i){ return all.indexOf(i) >= 0; });
  return ticked.length ? ticked : all;
}
function isTicked(g, iata){ return iatasOf(g).indexOf(iata) >= 0; }
function setTicked(g, iata, on){
  var all = iatasOfType(g.uldType);
  var now = iatasOf(g).slice();
  var i = now.indexOf(iata);
  if(on && i < 0) now.push(iata);
  else if(!on && i >= 0) now.splice(i, 1);
  if(!now.length) return false;              // a group with nothing ticked is not a group
  // keep the catalog's order, so the label reads the same way every time
  g.iatas = all.filter(function(x){ return now.indexOf(x) >= 0; });
  return true;
}
/* the ULDs behind the ticks, and the one that limits the group: a position
   certified for more than the lightest of them is worth flagging */
function uldDefsOf(g){
  return iatasOf(g).map(function(i){
    return U.ulds.filter(function(u){ return u.uldType===g.uldType && u.iata===i; })[0];
  }).filter(Boolean);
}
function groupLabel(g){
  var iatas = iatasOf(g);
  return iatas.length ? g.uldType+" — "+iatas.join("/") : (g.label || g.uldType);
}
var ULD_TYPE_LABELS = {
  "LD3":"LD3 (AKE)", "L3P/PKC":"L3P/PKC (Pallet)", "LD7/P88":"LD7/P88 (PAG)", "LD7/P96":"LD7/P96 (PMC)",
  "LD8":"LD8", "PLA":"PLA", "LD1":"LD1 (AMA)", "LD2":"LD2 (AKH / DPE)",
  "LD4":"LD4 (ALP)", "LD6":"LD6 (ALF)", "LD9":"LD9 (AAP / P6P)", "LD11":"LD11 (AQP / DQF)"
};
var STEP_LABELS = ["ULDs","Compartments & Zones","Layouts"];
var uid = function(){
  if(typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().slice(0,8);
  if(typeof crypto !== "undefined" && crypto.getRandomValues){
    var b = new Uint8Array(4); crypto.getRandomValues(b);
    return Array.prototype.map.call(b, function(x){ return ("0"+x.toString(16)).slice(-2); }).join("");
  }
  return Math.random().toString(36).slice(2,10);
};

var U = { step:0, ulds:[], compartments:[], bulk:[], refStation:"", activeComp:0,
          layouts:null, activeLayoutComp:0, editUld:null, pairForm:null, addType:"",
          collapsed:{}, openLayout:{}, layoutLimit:{}, signAck:false, tplName:null,
          undo:[], myTemplates:[], mergeIdentical:true };

function emptyPos(name){
  return { name:name||"", fwd:"", aft:"", left:"0", right:"0", index:"", maxWeight:"" };
}

/* index sanity check — mirrors the reference station convention.
   Faithful to the original rules, including the zero case and the
   no-reference-station fallback. */
function validateIndex(val, fwd, refStation){
  if(val === "" || val == null) return null;
  var n = parseFloat(val);
  if(isNaN(n)) return "Invalid index";
  if(n === 0) return "Index = 0? Confirm the value";
  if(refStation !== "" && refStation != null && fwd !== "" && fwd != null &&
     !isNaN(parseFloat(refStation)) && !isNaN(parseFloat(fwd))){
    var isFwd = parseFloat(fwd) < parseFloat(refStation);
    if(isFwd && n > 0)  return "Positive index in a forward position? Check the sign";
    if(!isFwd && n < 0) return "Negative index in an aft position? Check the sign";
  } else {
    // no reference station set: only a positive index is treated as suspicious
    if(n > 0) return "Positive index? Check the sign";
  }
  return null;
}

var uldRenderArmed = false;   // set after boot, so opening the app is not a change

/* ---------- rendering ---------- */
function uldRender(){
  if(typeof uldTouch === "function" && uldRenderArmed) uldTouch();
  // template badge in the panel header
  var badge = $("uldTplBadge");
  if(badge){
    if(U.tplName){ badge.textContent = U.tplName; badge.style.display = ""; }
    else { badge.style.display = "none"; badge.textContent = ""; }
  }
  var ub = $("btnUndo");
  if(ub){
    var last = (U.undo||[])[ (U.undo||[]).length - 1 ];
    ub.disabled = !last;
    ub.title = (last ? "Undo: "+last.label : "Nothing to undo")+" (Ctrl+Z)";
  }
  renderStepbar();
  var host = $("uldStep");
  if(U.step===0) host.innerHTML = viewStep1();
  else if(U.step===1) host.innerHTML = viewStep2();
  else host.innerHTML = viewStep3();
  bindStep();
  var canNext = [
    U.ulds.length>0,
    U.compartments.length>0 && U.compartments.every(function(c){
      return c.uldGroups && c.uldGroups.length>0 &&
             c.uldGroups.every(function(g){ return g.positions.length>0; }); }),
    true
  ];
  $("btnPrev").disabled = U.step===0;
  $("btnNext").style.display = U.step<2 ? "" : "none";
  $("btnNext").disabled = !canNext[U.step];
  $("nextHint").textContent = canNext[U.step] ? "" :
    (U.step===0 ? "Add at least 1 ULD" : "Add positions to every group");
}
function stepReady(i){
  if(i<=0) return true;
  if(i===1) return U.ulds.length>0;
  return U.compartments.length>0 && U.compartments.every(function(c){
    return c.uldGroups && c.uldGroups.length>0 &&
           c.uldGroups.every(function(g){ return g.positions.length>0; }); });
}
function renderStepbar(){
  $("stepbar").innerHTML = STEP_LABELS.map(function(l,i){
    var can = stepReady(i);
    var tip = can ? "" : (i===1 ? "Add at least one ULD first" : "Give every group at least one position first");
    return '<button class="st stepbar-btn" data-act="goto-step" data-s="'+i+'" '+
      'data-on="'+(U.step===i?1:0)+'" data-done="'+(U.step>i?1:0)+'"'+
      (can?'':' disabled title="'+esc(tip)+'"')+'>'+
      '<span class="num">'+(U.step>i?"&#10003;":(i+1))+'</span><span class="lb">'+esc(l)+'</span></button>';
  }).join("");
  var bar = $("stepbar");
  Array.prototype.forEach.call(bar.querySelectorAll("[data-act=\'goto-step\']"), function(b){
    b.addEventListener("click", function(){
      if(b.disabled) return;
      U.step = +b.getAttribute("data-s");
      uldRender();
    });
  });
}
function typeOptions(sel){
  return ULD_TYPES.map(function(t){
    return '<option value="'+esc(t)+'"'+(t===sel?" selected":"")+'>'+esc(ULD_TYPE_LABELS[t]||t)+'</option>';
  }).join("");
}

/* ---------- STEP 1 : ULDs ---------- */
function viewStep1(){
  var sortedUlds = U.ulds.slice().sort(function(a,b){
    return a.uldType===b.uldType ? (a.iata<b.iata?-1:a.iata>b.iata?1:0) : (a.uldType<b.uldType?-1:1);
  });
  var rows = sortedUlds.map(function(u,i){
    var editing = U.editUld===u.id;
    var c = groupColor(u.uldType);
    var main = '<tr>'+
      '<td><span class="type-chip" style="--gc:'+c+'">'+esc(u.uldType)+'</span></td>'+
      '<td><span class="badge solid" style="--gc:'+c+'">'+esc(u.iata)+'</span></td>'+
      '<td>'+esc(u.maxWeight)+' kg</td>'+
      '<td>'+esc(u.tare)+' kg</td>'+
      '<td><div style="display:flex;gap:6px;justify-content:flex-end">'+
        '<button class="btn small fill-cyan" data-act="edit-uld" data-id="'+u.id+'">'+(editing?"Close":"&#9998; Edit")+'</button>'+
        '<button class="btn small fill-red" data-act="del-uld" data-id="'+u.id+'">&times; Remove</button>'+
      '</div></td></tr>';
    if(!editing) return main;
    return main + '<tr><td colspan="5" style="background:var(--panel)">'+
      '<div class="sec" style="margin-bottom:10px">Edit ULD</div>'+
      '<div class="grid-form" style="grid-template-columns:1.5fr .8fr 1fr 1fr">'+
        fieldSel("e_type","ULD Type", u.uldType)+
        fieldInp("e_iata","IATA", u.iata, "text")+
        fieldInp("e_mw","Max weight (kg)", u.maxWeight, "number")+
        fieldInp("e_tare","Tare (kg)", u.tare, "number")+
      '</div>'+
      '<div style="display:flex;gap:8px">'+
        '<button class="btn small primary" data-act="save-uld" data-id="'+u.id+'">&#10003; Apply changes</button>'+
        '<button class="btn small quiet" data-act="cancel-uld">Cancel</button>'+
        '<span class="note" style="align-self:center">Nothing changes until you apply.</span>'+
      '</div></td></tr>';
  }).join("");

  var hint = ULD_TYPE_HINTS[U.addType] || {iata:"e.g. AKE", mw:"e.g. 1587", tare:"e.g. 63"};
  return '<div class="card"><h3>Add ULD</h3>'+
    '<div class="grid-form" style="grid-template-columns:1.5fr .8fr 1fr 1fr">'+
      fieldSel("a_type","ULD Type",U.addType||"")+
      fieldInp("a_iata","IATA","","text",hint.iata)+
      fieldInp("a_mw","Max weight (kg)","","number",hint.mw)+
      fieldInp("a_tare","Tare (kg)","","number",hint.tare)+
    '</div>'+
    '<button class="btn primary" data-act="add-uld">+ Add ULD</button></div>'+
    (U.ulds.length? '<div style="border:1px solid var(--line);border-radius:2px;overflow:hidden">'+
      '<table><thead><tr><th>ULD type</th><th>IATA</th><th>Max weight</th><th>Tare</th><th></th></tr></thead>'+
      '<tbody>'+rows+'</tbody></table></div>' : '<div class="empty">No ULDs defined yet.</div>');
}
function fieldInp(id,label,val,type,ph){
  return '<div class="field"><label for="'+id+'">'+esc(label)+'</label>'+
    '<input id="'+id+'" type="'+(type||"text")+'" value="'+esc(val)+'"'+
    (ph?' placeholder="'+esc(ph)+'"':'')+'></div>';
}
function fieldSel(id,label,val){
  return '<div class="field"><label for="'+id+'">'+esc(label)+'</label>'+
    '<select id="'+id+'"><option value="">Select…</option>'+typeOptions(val)+'</select></div>';
}

/* ---------- STEP 2 : compartments & groups ---------- */
function viewStep2(){
  if(!U.compartments.length){
    return '<div class="empty">No compartments yet.</div>'+
      '<button class="btn primary" data-act="add-comp">+ Compartment</button>';
  }
  if(U.activeComp >= U.compartments.length) U.activeComp = 0;
  var comp = U.compartments[U.activeComp];
  var tabs = U.compartments.map(function(c,i){
    return '<button class="comp-tab" data-act="pick-comp" data-i="'+i+'" aria-selected="'+(i===U.activeComp)+'">'+
      'Compartment '+c.number+' <span style="opacity:.6">('+c.uldGroups.length+')</span></button>';
  }).join("") + '<button class="comp-tab" data-act="add-comp">+ Compartment</button>';

  var usedTypes = comp.uldGroups.map(function(g){return g.uldType;});
  var avail = ULD_TYPES.filter(function(t){
    return usedTypes.indexOf(t)<0 && U.ulds.some(function(u){return u.uldType===t;});
  });

  var groups = comp.uldGroups.map(function(g,gi){ return groupBox(comp,g,gi); }).join("");

  return aircraftPanel(comp.number, "edit")+
    '<div class="comp-tabs">'+tabs+'</div>'+
    '<div class="card"><div class="gh" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'+
      '<h3 style="margin:0">Compartment '+comp.number+'</h3>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        (comp.uldGroups.length>1 ? '<button class="btn small" data-act="expand-all">Expand all</button>'+
          '<button class="btn small" data-act="collapse-all">Collapse all</button>' : '')+
        '<button class="btn small danger" data-act="del-comp">&times; Remove compartment</button>'+
      '</div></div>'+
      (avail.length?
        '<div style="display:flex;gap:8px;align-items:end;margin-top:14px;flex-wrap:wrap">'+
        '<div class="field" style="min-width:220px"><label for="newGroupType">Add ULD group</label>'+
        '<select id="newGroupType">'+avail.map(function(t){
          return '<option value="'+esc(t)+'">'+esc(ULD_TYPE_LABELS[t]||t)+'</option>'; }).join("")+'</select></div>'+
        '<button class="btn small" data-act="add-group">+ Add group</button></div>'
        : '<div class="note" style="margin-top:12px">All ULD types available have already been added.</div>')+
    '</div>'+ (groups || '');
}

/* group box — header, column titles, position rows, L/R pair form */
function groupBox(comp,g,gi){
  var isLD3 = isPairType(g.uldType);
  var baseEx = String(comp.number)+"1";
  // the max-weight hint is this group's own ULD, not a guess from the type:
  // an LD2 group hinting 1587 (an LD3's weight) invites the wrong number
  var def = U.ulds.filter(function(u){ return u.uldType===g.uldType && u.iata===g.iata; })[0];
  var ph = isLD3 ? {pos:baseEx, mw:"1587"}
        : (g.uldType.indexOf("LD7")===0 ? {pos:baseEx+"P", mw:"4626"} : {pos:baseEx, mw:"3174"});
  if(def && def.maxWeight) ph.mw = String(def.maxWeight);

  var allValid = g.positions.every(function(p){
    return p.name && p.fwd && p.aft && p.index && p.maxWeight &&
           !validateIndex(p.index, p.fwd, U.refStation);
  });

  // groups start collapsed: a compartment can hold dozens of positions
  var open = U.collapsed[g.id] === false;
  var gc = groupColor(g.uldType);
  var header = '<div class="gh" data-act="toggle-group" data-gid="'+esc(g.id)+'">'+
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+
      '<span class="chev" data-open="'+(open?1:0)+'">&#9656;</span>'+
      '<span class="badge" style="color:var(--cyan)">'+esc(g.uldType)+'</span>'+
      '<span class="gt" style="color:var(--cyan)">'+esc(groupLabel(g))+'</span>'+
      '<span class="note">'+g.positions.length+' position'+(g.positions.length!==1?"s":"")+'</span>'+
      (g.include===false
        ? '<span class="badge" style="color:var(--dim)">excluded</span>'
        : (g.exclusive ? '<span class="badge" style="color:var(--amber)">only on its own</span>' : ''))+
      (open? '' : '<span class="collapsed-hint">select to edit</span>')+
      '<span class="idx-warn" data-gwarn="'+gi+'"'+((!allValid && g.positions.length)?'':' style="display:none"')+'>'+
        '&#9888; invalid index blocks saving</span>'+
    '</div>'+
    '<button class="btn small danger" data-act="del-group" data-g="'+gi+'">&times; Remove group</button></div>';

  var colHead = g.positions.length
    ? '<div class="posrow" style="grid-template-columns:1.1fr .9fr .9fr .7fr .7fr 1.1fr 1fr auto;margin-bottom:2px">'+
      ["Position","FWD stat","AFT stat","Left","Right","Index","Max wt (kg)"].map(function(h){
        return '<div style="font-family:var(--mono);font-size:9px;letter-spacing:1.2px;'+
          'text-transform:uppercase;color:var(--dim)">'+esc(h)+'</div>'; }).join("")+
      '<div></div></div>'
    : '';

  var rows = g.positions.map(function(p,pi){
    var warn = p.index ? validateIndex(p.index, p.fwd, U.refStation) : null;
    var mwWarn = maxWeightIssue(g, p);
    return '<div class="posrow" style="grid-template-columns:1.1fr .9fr .9fr .7fr .7fr 1.2fr 1fr auto">'+
      posInp(gi,pi,"name",p.name,"text",ph.pos)+
      posInp(gi,pi,"fwd",p.fwd,"number","FWD")+
      posInp(gi,pi,"aft",p.aft,"number","AFT")+
      posInp(gi,pi,"left",p.left,"number","0")+
      posInp(gi,pi,"right",p.right,"number","0")+
      posInp(gi,pi,"index",p.index,"number","-0.00500",warn)+
      posInp(gi,pi,"maxWeight",p.maxWeight,"number",ph.mw,mwWarn)+
      '<button class="btn small danger" data-act="del-pos" data-g="'+gi+'" data-p="'+pi+'" '+
        'style="align-self:start;margin-top:1px">&times;</button>'+
    '</div>';
  }).join("");

  var pairForm = "";
  if(isLD3 && U.pairForm===g.id){
    pairForm = '<div style="border:1px solid var(--cyan);background:var(--cyan-soft);border-radius:2px;padding:12px;margin:10px 0">'+
      '<div class="sec" style="color:var(--cyan);margin-bottom:10px">Add L/R pair — fill the common values, L and R are created automatically</div>'+
      '<div class="grid-form" style="grid-template-columns:.8fr 1fr 1fr .9fr 1.1fr 1fr">'+
        pairInp("pf_base","Base (e.g. "+baseEx+")","text",baseEx)+
        pairInp("pf_fwd","FWD stat","number","FWD")+
        pairInp("pf_aft","AFT stat","number","AFT")+
        pairInp("pf_off","Offset L/R","number","2.82")+
        pairInp("pf_index","Index","number","-0.00500")+
        pairInp("pf_mw","Max wt (kg)","number",ph.mw)+
      '</div>'+
      '<div class="note" id="pairPreview" style="margin-bottom:10px"></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<button class="btn small primary" data-act="create-pair" data-g="'+gi+'">&#10003; Create L/R pair</button>'+
        '<button class="btn small quiet" data-act="cancel-pair">Cancel</button>'+
      '</div></div>';
  }

  var singleBtn = '<button class="btn small" data-act="add-pos" data-g="'+gi+'" '+
    'style="border-color:'+gc+';color:'+gc+'" title="One container filling the bay on its own — '+
    'give it the lateral arms if it does not sit on the centreline">+ Position</button>';
  var addBtn = isLD3
    ? '<button class="btn small" data-act="open-pair" data-g="'+gi+'" style="border-color:'+gc+';color:'+gc+'"'+
      (U.pairForm===g.id?" disabled":"")+'>+ L/R pair</button>'+singleBtn
    : singleBtn;

  if(!open) return '<div class="group-box" data-collapsed="1" style="--gc:'+gc+'">'+header+'</div>';
  var included = g.include !== false;
  var opts = '<div class="gen-opts">'+
    '<label><input type="checkbox" data-opt="include" data-g="'+gi+'"'+(included?' checked':'')+'>'+
      '<span>Use in layout generation</span></label>'+
    '<label'+(included?'':' class="off" title="Only applies when the type is used in generation"')+'>'+
      '<input type="checkbox" data-opt="exclusive" data-g="'+gi+'"'+(g.exclusive?' checked':'')+
      (included?'':' disabled')+'>'+
      '<span>Only on its own — never mixed with other types</span>'+
      '<i title="Layouts using this type will contain nothing else">&#9432;</i></label>'+
    '<span class="gen-state">'+
      (!included ? '<b style="color:var(--dim)">Excluded — produces no layouts</b>'
       : g.exclusive ? '<b style="color:var(--amber)">Single-type layouts only</b>'
       : '<b style="color:var(--green)">Combines with the other types</b>')+
    '</span>'+
  '</div>'+
  /* which ULDs of this type these positions are certified for. All of them
     to begin with — untick what does not belong on this aircraft. */
  '<div class="gen-opts" style="border-top:1px dashed var(--line);padding-top:8px;margin-top:2px">'+
    '<span class="note" style="letter-spacing:1px">CERTIFIED ULDS</span>'+
    iatasOfType(g.uldType).map(function(iata){
      var on = isTicked(g, iata);
      return '<label title="'+esc(iata)+' is certified for these positions">'+
        '<input type="checkbox" data-iata-tick="'+esc(iata)+'" data-g="'+gi+'"'+(on?' checked':'')+'>'+
        '<span style="'+(on?'':'color:var(--faint)')+'">'+esc(iata)+'</span></label>';
    }).join("")+
    (iatasOfType(g.uldType).length < 2
      ? '<span class="note">the only '+esc(g.uldType)+' in the catalog</span>' : '')+
  '</div>';
  return '<div class="group-box" style="--gc:'+gc+'">'+header+'<div class="gbody">'+opts+colHead+
    (rows || '<div class="note" style="margin-bottom:8px">No positions yet.</div>')+
    pairForm+
    '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">'+addBtn+'</div></div></div>';
}
function pairInp(id,label,type,ph){
  return '<div class="field"><label for="'+id+'">'+esc(label)+'</label>'+
    '<input id="'+id+'" type="'+type+'" placeholder="'+esc(ph)+'" data-pair="1"></div>';
}

function posInp(gi,pi,key,val,type,ph,err){
  return '<div class="field"><input type="'+type+'" value="'+esc(val)+'" '+
    (err?'class="bad" ':'')+
    'placeholder="'+esc(ph||"")+'" data-pos="1" data-g="'+gi+'" data-p="'+pi+'" data-k="'+key+'">'+
    '<span class="fielderr" data-warn="'+gi+'-'+pi+'-'+key+'"'+(err?'':' style="display:none"')+'>'+
      (err? esc(err) : '')+'</span></div>';
}

/* ---------- STEP 3 : layouts ---------- */
function viewStep3(){
  var iss = indexIssues();
  var blocked = iss.hard.length > 0 || (iss.sign.length > 0 && !U.signAck);

  var gate = "";
  if(iss.hard.length){
    gate = '<div class="warnbox" style="border-color:var(--red);background:var(--red-soft);color:var(--red)">'+
      '<b>&#9888; Cannot generate — '+iss.hard.length+' position'+(iss.hard.length!==1?"s":"")+' with unusable data</b>'+
      '<div style="margin-top:6px;color:var(--dim)">Every position must carry a name, FWD and AFT stations, '+
      'an index and a max weight. Loading against a wrong or missing index would put the centre of gravity '+
      'out by exactly the amount of the error.</div>'+
      issueList(iss.hard, "red")+
    '</div>';
  } else if(iss.sign.length){
    gate = '<div class="warnbox">'+
      '<b>&#9888; '+iss.sign.length+' index value'+(iss.sign.length!==1?"s":"")+' disagree with the reference station</b>'+
      '<div style="margin-top:6px;color:var(--dim)">Against station <b>'+esc(U.refStation||"—")+'</b>, these signs look '+
      'inverted. Index sign conventions differ between operators and aircraft types, so this is not blocked outright — '+
      'but generating layouts from a wrong sign would shift the centre of gravity the wrong way.</div>'+
      issueList(iss.sign, "amber")+
      '<label style="display:flex;align-items:center;gap:8px;margin-top:12px;cursor:pointer;color:var(--text)">'+
        '<input type="checkbox" id="signAck"'+(U.signAck?" checked":"")+'>'+
        '<span style="font-size:13px">I have checked these against the aircraft index convention — generate anyway</span>'+
      '</label>'+
    '</div>';
  }
  // shown alongside whatever the gate says, and never blocking: these are
  // figures worth a second look, not data the generator cannot use
  if(iss.warn.length){
    gate += '<div class="warnbox" style="margin-top:'+(gate?"12px":"0")+'">'+
      '<b>&#9888; '+iss.warn.length+' position'+(iss.warn.length!==1?"s":"")+' worth checking</b>'+
      '<div style="margin-top:6px;color:var(--dim)">These generate fine, but the numbers look off — a position '+
      'certified for more than the ULD itself carries, or a decimal point out of place. Manuals do carry '+
      'surprising figures, so nothing is blocked here.</div>'+
      issueList(iss.warn, "amber")+
    '</div>';
  }

  /* Two types certified for the same bay with the same station, index and
     max weight are one physical slot — but whether the file should say so
     depends on the system reading it, so it is the operator's call, not
     ours. On (the default) they share a slot: "2LD3/LD2", one row listing
     both. Off, each type gets its own layout, and the bay is loaded once
     per type. */
  var mergeOn = U.mergeIdentical !== false;
  var mergeBox = '<div style="margin-bottom:16px">'+
    '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--text)">'+
      '<input type="checkbox" id="mergeIdentical"'+(mergeOn?" checked":"")+'>'+
      '<span style="font-size:13px">Combine ULDs certified for the same position</span>'+
    '</label>'+
    '<div class="note" style="margin-top:4px">'+
      (mergeOn
        ? 'Types sharing a bay’s station, index and max weight are offered as one slot — <b>2LD3/LD2</b>, one layout naming both.'
        : 'Each type gets its own layout even where the numbers are identical — <b>2LD3</b> and <b>2LD2</b> separately.')+
    '</div></div>';

  var head = '<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">'+
    '<button class="btn primary" data-act="generate"'+(blocked?" disabled":"")+'>&#9889; Generate all layouts</button>'+
    (U.layouts && !blocked ? '<button class="btn" data-act="xlsx-all">&#8595; Export all (Excel)</button>':'')+
    (U.layouts && !blocked ? '<button class="btn small quiet" data-act="csv-all">CSV (all)</button>':'')+'</div>' + mergeBox + gate+
    (U.layouts && U.layoutsStale && !blocked ? '<div class="warnbox" style="margin-bottom:14px">'+
      '<b>&#9888; Data changed since these layouts were generated</b>'+
      '<div style="margin-top:4px;color:var(--dim)">A position was edited after the layouts below were computed — '+
      'they still describe the old numbers. Click <b>Generate all layouts</b> again to bring them up to date.</div>'+
    '</div>' : '');

  if(blocked) return head;
  if(!U.layouts) return head +
    '<div class="empty">Select <b>Generate all layouts</b> to compute every valid combination.</div>'+
    aircraftPanel(null, "layouts");

  var nums = U.compartments.map(function(c){return c.number;});
  var stats = '<div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">'+
    nums.map(function(n){
      return '<div class="stat"><div class="v">'+((U.layouts[n]||[]).length)+'</div>'+
        '<div class="l">layouts — comp '+n+'</div></div>';
    }).join("")+'</div>';

  var tabs = '<div class="comp-tabs">'+nums.map(function(n,i){
    return '<button class="comp-tab" data-act="pick-lcomp" data-i="'+i+'" aria-selected="'+(i===U.activeLayoutComp)+'">Compartment '+n+'</button>';
  }).join("")+'</div>';

  var n = nums[U.activeLayoutComp];
  var list = U.layouts[n] || [];
  var warns = crossCompartmentWarnings();
  var warnHtml = warns.map(function(w){
    return '<div class="warnbox"><b>&#9888; Physical conflicts between compartments</b><br>'+
      'Compartment '+w.n1+' &harr; Compartment '+w.n2+': '+w.conflicting.length+' invalid layout combinations.'+
      '<div style="color:var(--dim);margin-top:4px">Example: '+esc(w.conflicting[0])+'</div>'+
      '<div style="color:var(--dim);margin-top:4px">These layouts can be used individually, but not simultaneously on the same flight.</div></div>';
  }).join("");

  var body = '<div style="border:1px solid var(--line);border-radius:2px;overflow:hidden">'+
    '<div style="padding:12px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'+
      '<b>Compartment '+n+' — '+list.length+' layouts</b>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
      '<button class="btn small" data-act="xlsx-one">&#8595; Excel compartment '+n+'</button>'+
      '<button class="btn small quiet" data-act="csv-one">CSV</button></div></div>'+
    (list.length? renderLayoutList(n, list) : '<div class="empty">No valid layouts for this compartment.</div>')+
    '</div>';
  return head + aircraftPanel(nums[U.activeLayoutComp], "layouts") + stats + warnHtml + tabs + body;
}

/* A position cannot be certified for more than the ULD itself carries: the
   bay's ceiling and the ULD's own rating both apply, and the lower one wins.
   Returned as a message rather than thrown, so it can sit under the field. */
function maxWeightIssue(g, p){
  // measured against the lightest ULD ticked here: if the position states
  // more than that one carries, at least one certified ULD cannot take it
  var defs = uldDefsOf(g);
  if(!defs.length || p.maxWeight === "" || p.maxWeight == null) return null;
  var def = defs.slice().sort(function(a,b){ return parseFloat(a.maxWeight)-parseFloat(b.maxWeight); })[0];
  var pos = parseFloat(p.maxWeight), uld = parseFloat(def.maxWeight);
  if(isNaN(pos) || isNaN(uld) || pos <= uld) return null;
  return "above the "+def.iata+"'s own "+def.maxWeight+" kg";
}

/* Sanity limits for the gross-error alerts. Nothing here is a real ULD or a
   real index: they catch a decimal point in the wrong place, or a weight in
   pounds, before those numbers reach a loadsheet. */
var GROSS_MAX_WEIGHT = 20000;   // kg — heavier than any single ULD
/* The index scale is the operator's, not ours: it falls out of their own C
   constant, so no fixed ceiling holds across fleets. A misplaced decimal
   point shows up against the compartment's own numbers instead — every
   position in a hold shares an order of magnitude. */
var GROSS_INDEX_FACTOR = 50;
var GROSS_INDEX_MIN_SAMPLE = 4;
function grossIndexLimit(comp){
  var mags = [];
  (comp.uldGroups||[]).forEach(function(g){
    (g.positions||[]).forEach(function(p){
      var n = Math.abs(parseFloat(p.index));
      if(!isNaN(n) && n > 0) mags.push(n);
    });
  });
  if(mags.length < GROSS_INDEX_MIN_SAMPLE) return null;
  mags.sort(function(a,b){ return a-b; });
  var median = mags[Math.floor(mags.length/2)];
  return median > 0 ? median * GROSS_INDEX_FACTOR : null;
}

/* Safety gate before generating layouts.
   Three classes of problem, deliberately treated differently:
     hard  — the value cannot be used at all (missing, not a number, or a bay
             with no length). Blocks.
     sign  — the index sign disagrees with the reference-station convention.
             Index sign conventions differ between operators and aircraft, so this
             cannot be a hard block; it requires an explicit acknowledgement.
     warn  — the data is usable but looks wrong: a position certified for more
             than the ULD carries, or a number orders of magnitude off.
             Shown, never blocks —
             the manuals do carry surprising figures, and this tool is not the
             authority on them. */
function indexIssues(){
  var hard = [], sign = [], warn = [];
  U.compartments.forEach(function(c, ci){
    var idxLimit = grossIndexLimit(c);
    (c.uldGroups||[]).forEach(function(g){
      /* Deleting the last ULD of a type from the catalog leaves any group of
         that type with nothing certified, and a group with nothing certified
         generates nothing: its positions simply stop appearing, in the
         layouts and in the export alike. The positions themselves are fine,
         so this is not a hard stop — but it must be said, or a hold quietly
         empties. */
      if(g.include !== false && (g.positions||[]).length && !uldDefsOf(g).length){
        warn.push({ comp:c.number, ci:ci, gid:g.id, type:g.uldType,
          name:(g.positions[0].name||"(unnamed)"),
          reason:"no "+g.uldType+" left in the ULD catalog — this group generates nothing" });
      }
      (g.positions||[]).forEach(function(p){
        var where = { comp:c.number, ci:ci, gid:g.id, name:p.name||"(unnamed)", type:g.uldType };
        if(!p.name || p.fwd==="" || p.aft==="" || p.index==="" || p.maxWeight===""){
          hard.push(Object.assign({reason:"incomplete — name, FWD, AFT, index and max weight are all required"}, where));
          return;
        }
        if(isNaN(parseFloat(p.index))){
          hard.push(Object.assign({reason:"index is not a number"}, where)); return;
        }
        if(isNaN(parseFloat(p.fwd)) || isNaN(parseFloat(p.aft))){
          hard.push(Object.assign({reason:"FWD/AFT station is not a number"}, where)); return;
        }
        var fwd = parseFloat(p.fwd), aft = parseFloat(p.aft), mw = parseFloat(p.maxWeight);
        if(aft <= fwd){
          hard.push(Object.assign({reason:"AFT station is not behind FWD — the bay has no length"}, where)); return;
        }
        if(isNaN(mw) || mw <= 0){
          hard.push(Object.assign({reason:"max weight is not a usable number"}, where)); return;
        }
        var w = validateIndex(p.index, p.fwd, U.refStation);
        if(w) sign.push(Object.assign({reason:w}, where));

        var mwIssue = maxWeightIssue(g, p);
        if(mwIssue) warn.push(Object.assign({reason:p.maxWeight+" kg is "+mwIssue}, where));
        if(mw > GROSS_MAX_WEIGHT)
          warn.push(Object.assign({reason:"max weight of "+p.maxWeight+" kg — heavier than any ULD"}, where));
        // positions are numbered after their hold (11L, 21P, 33…), so a 41L
        // sitting in compartment 1 is almost always a typed digit
        var lead = String(p.name).match(/^(\d)/);
        if(lead && String(c.number).length === 1 && lead[1] !== String(c.number))
          warn.push(Object.assign({reason:"named for compartment "+lead[1]+" but sits in "+c.number}, where));
        if(idxLimit && Math.abs(parseFloat(p.index)) > idxLimit)
          warn.push(Object.assign({reason:"index of "+p.index+" — far outside the range of this compartment, "+
            "check the decimal point"}, where));
      });
      // No overlap check between positions of one group: P bays legitimately
      // share space in these manuals (the A330-300's 32P and 33P overlap by
      // 18 cm, the B787's 42 and 43 by a tenth of an inch), and the
      // generator already treats overlapping options as mutually exclusive.
    });
    nameCollisions(c, ci).forEach(function(w){ warn.push(w); });
  });
  return { hard:hard, sign:sign, warn:warn };
}

/* Two groups of one type, certified for the same ULDs, describing the same
   bay with different numbers, both generate an option — and both options
   are named the same thing ("2LD3"), because the name is made of types and
   IATAs, not of stations and weights. Identical names collapse at the end
   of generation, so the second set of numbers is dropped without a word.
   No shipped template does this; a hand-built or imported compartment can.
   Flagged rather than resolved: which of the two numbers is right is the
   operator's to say, and unticking one group down to its own ULD names the
   layouts apart ("2LD3(AKE)" / "2LD3(PKC)") and keeps both. */
function nameCollisions(c, ci){
  var offers = {}, out = [];
  (c.uldGroups||[]).forEach(function(g){
    if(g.include === false) return;
    var positions = g.positions || [];
    var byBase = {};
    positions.forEach(function(p){
      var base = String(p.name||"").replace(/[LRP]$/,"") || String(p.name||"");
      (byBase[base] = byBase[base] || []).push(p);
    });
    // the layout name carries the type and, when narrowed, the ticked IATAs
    var nameKey = g.uldType + " " + iatasOf(g).slice().sort().join(",");
    Object.keys(byBase).forEach(function(base){
      var list = byBase[base].slice().sort(function(a,b){
        return String(a.name) < String(b.name) ? -1 : 1; });
      var sig = list.map(function(p){
        return [p.fwd,p.aft,p.left,p.right,p.index,p.maxWeight].join("|"); }).join("+");
      var key = base + " " + list.length + " " + nameKey;
      if(offers[key] === undefined) { offers[key] = sig; return; }
      if(offers[key] === sig) return;          // the same offer twice: harmless
      out.push({ comp:c.number, ci:ci, gid:g.id, name:list[0].name||"(unnamed)", type:g.uldType,
        reason:"bay "+base+" is also described by another "+g.uldType+" group with different "+
               "numbers — both layouts would be named the same, so only one is generated" });
    });
  });
  return out;
}

function issueList(items, tone){
  return '<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px">'+
    items.slice(0,12).map(function(it){
      return '<button class="btn small" data-act="fix-pos" data-c="'+it.ci+'" data-gid="'+esc(it.gid)+'" '+
        'style="text-align:left;text-transform:none;letter-spacing:0;font-family:var(--mono);font-size:11.5px;'+
        'border-color:var(--'+tone+');color:var(--'+tone+')">'+
        'Compartment '+it.comp+' &middot; '+esc(it.name)+' ('+esc(it.type)+') — '+esc(it.reason)+' &#8594;</button>';
    }).join("")+
    (items.length>12 ? '<span class="note">…and '+(items.length-12)+' more</span>' : '')+
  '</div>';
}

/* Layouts are collapsed by default and shown in pages: one compartment can
   produce hundreds of valid combinations, and an open list is unusable. */
var LAYOUT_PAGE = 25;
function renderLayoutList(compNum, list){
  var limit = U.layoutLimit[compNum] || LAYOUT_PAGE;
  var shown = list.slice(0, limit);
  var html = shown.map(function(l, i){
    var key = compNum + ":" + i;
    var open = !!U.openLayout[key];
    var body = open
      ? deckStrip(l) +
        '<div style="overflow-x:auto;margin-top:8px"><table><thead><tr><th>Position</th><th>ULD</th>'+
        '<th>Certified ULDs</th><th>FWD</th><th>AFT</th><th>Index</th><th>Max wt</th></tr></thead><tbody>'+
        l.positions.map(function(p){
          var pc = groupColor(p.uldType);
          var cert = (p.certified||[{type:p.uldType,iata:p.uld}]).map(function(c){ return esc(c.type+" ("+c.iata+")"); }).join(", ");
          return '<tr><td>'+esc(p.name)+'</td><td><span class="badge" style="color:'+pc+'">'+
            esc(p.uld)+'</span> <span style="color:'+pc+'">'+esc(p.uldType)+'</span></td>'+
            '<td style="color:var(--dim)">'+cert+'</td>'+
            '<td>'+esc(p.fwd)+'</td><td>'+esc(p.aft)+'</td><td>'+esc(p.index)+'</td><td>'+esc(p.maxWeight)+'</td></tr>';
        }).join("")+'</tbody></table></div>'
      : '';
    return '<div class="layout-item">'+
      '<div class="layout-name" data-act="toggle-layout" data-k="'+esc(key)+'">'+
        '<span class="chev" data-open="'+(open?1:0)+'">&#9656;</span>'+
        '<span>'+esc(l.name).split("/").map(function(part){
            var t = /LD7.?P88/.test(part) ? "LD7/P88" : /LD7.?P96/.test(part) ? "LD7/P96"
                  : /LD8/.test(part) ? "LD8" : /LD3/.test(part) ? "LD3" : null;
            return t ? '<span style="color:'+groupColor(t)+'">'+part+'</span>' : part;
          }).join('<span style="color:var(--faint)">/</span>')+'</span>'+
        '<span class="collapsed-hint" style="margin-left:auto">'+l.positions.length+' pos</span>'+
      '</div>'+ body +'</div>';
  }).join("");
  if(list.length > limit){
    html += '<button class="showmore" data-act="more-layouts" data-n="'+compNum+'">'+
      'Show '+Math.min(LAYOUT_PAGE, list.length-limit)+' more &middot; '+
      (list.length-limit)+' remaining</button>';
  }
  return html;
}

/* ---------- layout generation (algorithm preserved verbatim) ---------- */
function generateLayouts(){
  var allLayouts = {};
  U.compartments.forEach(function(comp){
    var zoneOptionsMap = {};
    // The signature says how a bay is filled, not only where it is: an AKE
    // sitting alone across the middle and a pair of them side by side share a
    // station and a weight, but they are two different offers, and folding
    // one into the other would lose it. Hence the position count and the
    // lateral arms in the key.
    // Two groups can certify the same fwd/aft/index/max-weight at a zone
    // (e.g. AKE and PKC, when they haven't been derated relative to each
    // other) — that's one physical slot with more than one certified ULD,
    // not two competing layouts. The first group to reach a signature keeps
    // the slot; every later group with the identical signature is folded
    // into its "certified" list instead of creating a look-alike duplicate.
    // A genuinely different signature (PKC derated below AKE) still creates
    // a separate, mutually exclusive option, as before.
    //
    // Whether that folding happens at all is the operator's call: some
    // systems want one slot naming every ULD certified for it, others want
    // one layout per type even when the numbers are identical. With
    // "combine" off the group joins the key, so each group keeps its own
    // offer — the group stays the unit either way, so a group ticked for
    // several ULDs still lists them all at one slot. Two groups that end up
    // truly identical (same type, same ticks) name their layouts the same
    // and are dropped by the by-name dedupe at the end, so turning this off
    // never produces a duplicate.
    var mergeIdentical = U.mergeIdentical !== false;
    var zoneBySignature = {};
    function addOption(base, sig, positions, gid){
      if(!zoneBySignature[base]) zoneBySignature[base] = {};
      var key = mergeIdentical ? sig : sig + "\u0000" + gid;
      var existing = zoneBySignature[base][key];
      if(existing){
        // the same ULD can reach a slot twice — two groups of one type, or a
        // group ticked for a ULD another group also names. It is one ULD
        // either way, and must be listed once.
        var already = existing.certified.some(function(c){
          return c.type === positions[0].uldType && c.iata === positions[0].uld; });
        if(!already) existing.certified.push({type:positions[0].uldType, iata:positions[0].uld});
        return;
      }
      var certified = [{type:positions[0].uldType, iata:positions[0].uld}];
      positions.forEach(function(p){ p.certified = certified; });
      // label is finalized below, once every group has had a chance to add
      // to this signature's certified list — a merged slot's name must show
      // every certified IATA ("2LD3(AKE/PKC)"), not just whichever group
      // happened to reach it first.
      var opt = { positions:positions, certified:certified };
      zoneBySignature[base][key] = opt;
      if(!zoneOptionsMap[base]) zoneOptionsMap[base]=[];
      zoneOptionsMap[base].push(opt);
    }
    comp.uldGroups.forEach(function(group, gi){
      if(group.include === false) return;         // excluded from generation
      // a group built before ids existed, or one hand-written in a config
      // file, still has to key distinctly from the group beside it
      var gid = group.id || ("#" + gi);
      // Whether a bay is filled by a pair or by one container is a property
      // of the position, not of the group: an AKE 70 wide in a hold 100 wide
      // fills its bay alone, off the centreline, and the group next to it
      // still pairs 11L with 11R. Deciding this per group meant one single
      // position anywhere silenced every other one in that group.
      var uldDefs = uldDefsOf(group);
      if(!uldDefs.length) return;
      var positions = group.positions || [];
      var mate = function(p){
        var m = String(p.name||"").match(/^(.*)([LR])$/);
        if(!m) return null;
        var want = m[1] + (m[2] === "L" ? "R" : "L");
        return positions.filter(function(q){ return q.name === want; })[0] || null;
      };
      var offer = function(base, sig, posList){
        uldDefs.forEach(function(uldDef){
          addOption(base, sig, posList.map(function(p){
            return Object.assign({}, p, {uld:uldDef.iata, uldType:group.uldType});
          }), gid);
        });
      };
      // side by side: every L with an R of its own
      positions.forEach(function(posL){
        if(!/L$/.test(posL.name)) return;
        var posR = mate(posL);
        if(!posR) return;
        var base = posL.name.slice(0,-1);
        var mw = Math.min(parseFloat(posL.maxWeight||0), parseFloat(posR.maxWeight||0));
        offer(base, posL.fwd+"|"+posL.aft+"|"+posL.index+"|"+mw+
              "|2|"+posL.left+"/"+posL.right+"+"+posR.left+"/"+posR.right, [posL, posR]);
      });
      // and one container to a bay: a whole-bay position, a P bay, or a
      // half-bay position with no other half defined
      positions.forEach(function(pos){
        if(/[LR]$/.test(pos.name) && mate(pos)) return;     // already offered as a pair
        var base = String(pos.name||"").replace(/[LRP]$/,"") || pos.name;
        offer(base, pos.fwd+"|"+pos.aft+"|"+pos.index+"|"+pos.maxWeight+
              "|1|"+pos.left+"/"+pos.right, [pos]);
      });
    });
    Object.keys(zoneOptionsMap).forEach(function(base){
      zoneOptionsMap[base].forEach(function(opt){
        var iatas = [], types = [], bases = [];
        opt.certified.forEach(function(c){
          iatas.push(c.iata);
          if(types.indexOf(c.type) < 0) types.push(c.type);
          if(bases.indexOf(uldBase(c.type)) < 0) bases.push(uldBase(c.type));
        });
        // One base — the shared type code says it all: 2LD3.
        // Different bases in the same slot — name both, or the second ULD
        // reads as if it were the first one's type: 2LD3/LD2.
        var typePart = bases.length > 1 ? types.join("/") : types[0];
        // The ULDs are only spelled out when the slot is narrower than the
        // type: every LD3 in the catalog certified here says nothing that
        // "2LD3" does not, while "2LD3(AKE/PKC)" says two of the five.
        var narrowed = types.some(function(t){
          var here = opt.certified.filter(function(c){ return c.type === t; })
                                  .map(function(c){ return c.iata; });
          return iatasOfType(t).some(function(i){ return here.indexOf(i) < 0; });
        });
        opt.label = opt.positions.length + typePart + (narrowed ? "("+iatas.join("/")+")" : "");
      });
    });

    var allOptions = [];
    Object.keys(zoneOptionsMap).forEach(function(base){
      zoneOptionsMap[base].forEach(function(opt){
        var fwds = opt.positions.map(function(p){ return parseFloat(p.fwd); });
        var afts = opt.positions.map(function(p){ return parseFloat(p.aft); });
        allOptions.push(Object.assign({}, opt, { base:base,
          fwd: Math.min.apply(null,fwds), aft: Math.max.apply(null,afts) }));
      });
    });
    allOptions.sort(function(a,b){ return (a.fwd-b.fwd) || (a.aft-b.aft); });

    var conflict = function(a,b){ return a.fwd < b.aft && b.fwd < a.aft; };
    var results = [];
    var walk = function(idx, chosen){
      if(idx === allOptions.length){
        if(chosen.length===0) return;
        var canAdd = allOptions.some(function(o){
          return chosen.indexOf(o)<0 && !chosen.some(function(c){ return conflict(c,o); });
        });
        if(!canAdd) results.push(chosen.slice());
        return;
      }
      var opt = allOptions[idx];
      if(!chosen.some(function(c){ return conflict(c,opt); })){
        chosen.push(opt); walk(idx+1, chosen); chosen.pop();
      }
      walk(idx+1, chosen);
    };
    walk(0, []);

    var allCombos = results.map(function(chosen){
      var positions = [];
      chosen.forEach(function(o){ positions = positions.concat(o.positions); });
      return { name: chosen.map(function(o){return o.label;}).join("/"), positions: positions };
    });

    // types flagged "do not mix" may only appear in single-type layouts
    var exclusiveTypes = comp.uldGroups.filter(function(g){ return g.exclusive && g.include!==false; })
                                       .map(function(g){ return g.uldType; });
    if(exclusiveTypes.length){
      allCombos = allCombos.filter(function(l){
        var types = {};
        l.positions.forEach(function(p){ types[p.uldType] = 1; });
        var list = Object.keys(types);
        var touches = list.filter(function(t){ return exclusiveTypes.indexOf(t)>=0; });
        return touches.length === 0 || list.length === 1;
      });
    }

    // Intermixing (which types may sit at a string's end) is deliberately
    // NOT enforced here — on request, generation returns every physically
    // non-overlapping combination and leaves that constraint to whatever
    // downstream program consumes the export.
    var rank = function(layout){
      var labels = layout.name.split("/");
      var hasLR = labels.some(function(l){ return l.charAt(0)==="2"; });
      var hasP = labels.some(function(l){ return l.indexOf("LD7")>=0; });
      var hasSimple = labels.some(function(l){ return l.indexOf("LD8")>=0; });
      if( hasLR && !hasP && !hasSimple) return 0;
      if(!hasLR &&  hasP && !hasSimple) return 1;
      if(!hasLR && !hasP &&  hasSimple) return 2;
      if( hasLR && !hasP &&  hasSimple) return 3;
      if( hasLR &&  hasP && !hasSimple) return 4;
      return 5;
    };
    allCombos.sort(function(a,b){ return rank(a)-rank(b); });

    var seen = {};
    allLayouts[comp.number] = allCombos.filter(function(l){
      if(seen[l.name]) return false; seen[l.name]=1; return true;
    });
  });
  U.layouts = allLayouts;
  U.layoutsStale = false;
  U.activeLayoutComp = 0;
}

function crossCompartmentWarnings(){
  if(!U.layouts) return [];
  var nums = Object.keys(U.layouts).map(Number).sort(function(a,b){return a-b;});
  var warnings = [];
  for(var i=0;i<nums.length;i++){
    for(var j=i+1;j<nums.length;j++){
      var n1=nums[i], n2=nums[j];
      var L1=U.layouts[n1]||[], L2=U.layouts[n2]||[];
      if(!L1.length || !L2.length) continue;
      var afts=[], fwds=[];
      L1.forEach(function(l){ l.positions.forEach(function(p){ afts.push(parseFloat(p.aft)); }); });
      L2.forEach(function(l){ l.positions.forEach(function(p){ fwds.push(parseFloat(p.fwd)); }); });
      var maxAft1 = Math.max.apply(null,afts), minFwd2 = Math.min.apply(null,fwds);
      if(minFwd2 < maxAft1){
        var conflicting = [];
        L1.forEach(function(l1){
          var a1 = Math.max.apply(null, l1.positions.map(function(p){return parseFloat(p.aft);}));
          L2.forEach(function(l2){
            var f2 = Math.min.apply(null, l2.positions.map(function(p){return parseFloat(p.fwd);}));
            if(f2 < a1) conflicting.push('C'+n1+':"'+l1.name+'" \u2194 C'+n2+':"'+l2.name+'"');
          });
        });
        if(conflicting.length) warnings.push({n1:n1,n2:n2,conflicting:conflicting});
      }
    }
  }
  return warnings;
}

/* A whole-bay position (11, 12, 21…) sits at the same station as the L/R
   pair of the same zone, so its FWD/AFT/index are the same numbers. Finds
   that pair anywhere in the compartment, so naming a new position can fill
   itself in. Max weight is a property of the ULD, not the bay, so it is not
   part of this. Returns null when the position already carries values (never
   overwrite), when the name is not a whole-bay name, or when no pair exists. */
function pairAtBase(comp, base){
  var name = String(base==null?"":base).trim().toUpperCase();
  if(!name) return null;
  var src = null;
  (comp.uldGroups||[]).forEach(function(q){
    (q.positions||[]).forEach(function(o){
      if(!src && (o.name===name+"L" || o.name===name+"R") && o.fwd && o.aft && o.index) src = o;
    });
  });
  return src;
}
function pairSourceFor(comp, pos){
  var name = (pos.name||"").trim().toUpperCase();
  if(!name || /[LRP]$/.test(name)) return null;
  if(pos.fwd || pos.aft || pos.index) return null;
  return pairAtBase(comp, name);
}
/* The L/R offset is carried on whichever side we found: an L position holds
   it on the right, an R position on the left. */
function pairOffsetOf(pos){ return /L$/.test(pos.name||"") ? pos.right : pos.left; }

/* Index precision. The manuals go to 6 decimals; the operator's system takes
   5 (the export rounds there). Without a cap the number field happily takes
   -0.00271155555555555555, which is neither. */
var MAX_INDEX_DECIMALS = 6;
function clampDecimals(v, max){
  var s = String(v==null?"":v);
  var m = s.match(/^(-?\d*\.)(\d+)$/);
  if(!m) return s;
  return m[2].length > max ? m[1]+m[2].slice(0, max) : s;
}

/* The operator's system carries index values to 5 decimal places (…-0.00803,
   0.00281), while the manuals we transcribe often print 6 (-0.003422,
   0.002808). The editor keeps whatever the manual says — rounding only
   happens on the way out, so nothing is lost in the working data. */
var EXPORT_INDEX_DECIMALS = 5;
function exportIndex(v){
  var n = parseFloat(v);
  if(isNaN(n)) return 0;
  var f = Math.pow(10, EXPORT_INDEX_DECIMALS);
  return Math.round(n * f) / f;
}

/* ---------- CSV ---------- */
// Header and field order match the operator's own upload template exactly
// (YU_B777200ER_TEMPLATE.xlsx) — including ";" joining multiple certified
// ULDs inside one quoted "Certified ULDs" field, confirmed against that
// template's own row (12R: "LD3,LA;L3P/PKC,LA"). Do not swap the join
// character for anything else without re-checking that template: the
// upload system reads this format directly, and Excel merely mis-previewing
// a raw .csv under certain regional settings is a separate, cosmetic
// concern that must never drive a change to the actual exported format.
var CSV_HEADER = "Compartment,Layout,Position,Certified ULDs,FWD Stat,AFT Stat,Left,Right,Index,Volume,Max weight";
var EXPORT_HEADERS = CSV_HEADER.split(",");
// Shared by the CSV and XLSX exports — one row per position, in the
// operator's own upload-template column order.
function layoutRows(compNum){
  var rows = [];
  (U.layouts[compNum]||[]).forEach(function(layout){
    layout.positions.forEach(function(pos){
      // A merged slot (e.g. AKE and PKC certified identically there) lists
      // every certified type, not just whichever one the layout happened to
      // be built with — pos.uldType/pos.uld alone would silently drop PKC.
      // Two certified IATAs can share the same type code (e.g. B777-300's
      // AKE and PKC are both plain "LD3") — dedupe by type code so the
      // field lists "LD3,LA" once instead of twice.
      var seenTypes = {}, certTypes = (pos.certified||[{type:pos.uldType}])
        .filter(function(c){ if(seenTypes[c.type]) return false; return seenTypes[c.type]=true; })
        .map(function(c){ return c.type+",LA"; }).join(";");
      rows.push([compNum, layout.name, pos.name, certTypes, +pos.fwd, +pos.aft,
        (pos.left===""||pos.left==null)?0:+pos.left,
        (pos.right===""||pos.right==null)?0:+pos.right,
        exportIndex(pos.index), 0, +pos.maxWeight]);
    });
  });
  return rows;
}
// Bulk holds carry loose cargo, not ULDs: one static row per sub-compartment
// (no Certified ULDs/Left/Right), included in the combined export only —
// there's no per-compartment tab for a bulk hold to hang a button off.
function bulkRows(){
  var out = [];
  (U.bulk||[]).forEach(function(h){
    (h.positions||[]).forEach(function(p){
      out.push([h.number, "BULK", p.name, "", +p.fwd, +p.aft, "", "", exportIndex(p.index), +p.volume, +p.maxWeight]);
    });
  });
  return out;
}
function allLayoutRows(){
  var out = [];
  U.compartments.forEach(function(c){ out = out.concat(layoutRows(c.number)); });
  return out.concat(bulkRows());
}
function rowToCsvLine(r){
  return [r[0], r[1], r[2], '"'+r[3]+'"', r[4], r[5], r[6], r[7], r[8], r[9], r[10]].join(",");
}
function csvLines(compNum){
  return layoutRows(compNum).map(rowToCsvLine);
}
function csvOne(n){ return [CSV_HEADER].concat(csvLines(n)).join("\n"); }
function csvAll(){
  var out=[CSV_HEADER];
  U.compartments.forEach(function(c){ out = out.concat(csvLines(c.number)); });
  out = out.concat(bulkRows().map(rowToCsvLine));
  return out.join("\n");
}

/* ---------- download / preset modals ---------- */

/* ---------- events ---------- */
function readForm(prefix){
  return { uldType: ($(prefix+"type")||{}).value || "",
           iata: (($(prefix+"iata")||{}).value||"").toUpperCase(),
           maxWeight: ($(prefix+"mw")||{}).value || "",
           tare: ($(prefix+"tare")||{}).value || "" };
}
function bindStep(){
  var host = $("uldStep");
  var ack = host.querySelector("#signAck");
  if(ack) ack.addEventListener("change", function(){ U.signAck = ack.checked; uldRender(); });
  /* Regenerated on the spot when there are already results: the setting
     only means anything through the layouts, so showing the old ones under
     the new label would be the one reading nobody could trust. Which rows
     are expanded is keyed by list position, so those are dropped — the
     lists either side of the switch are not the same lists. */
  var merge = host.querySelector("#mergeIdentical");
  if(merge) merge.addEventListener("change", function(){
    U.mergeIdentical = merge.checked;
    if(U.layouts){
      var keepComp = U.activeLayoutComp;
      U.openLayout = {}; U.layoutLimit = {};
      generateLayouts();
      U.activeLayoutComp = Math.min(keepComp, Math.max(0, U.compartments.length-1));
    }
    if(typeof uldTouch === "function") uldTouch();
    uldRender();
  });
  Array.prototype.forEach.call(host.querySelectorAll('input[data-opt]'), function(cb){
    cb.addEventListener("change", function(){
      var comp = U.compartments[U.activeComp];
      var g = comp && comp.uldGroups[+cb.getAttribute("data-g")];
      if(!g) return;
      if(cb.getAttribute("data-opt")==="include") g.include = cb.checked;
      else g.exclusive = cb.checked;
      U.layouts = null;          // previous results no longer describe these rules
      uldRender();
    });
  });
  // which ULDs of the type this group is certified for
  Array.prototype.forEach.call(host.querySelectorAll('input[data-iata-tick]'), function(cb){
    cb.addEventListener("change", function(){
      var comp = U.compartments[U.activeComp];
      var g = comp && comp.uldGroups[+cb.getAttribute("data-g")];
      if(!g) return;
      var iata = cb.getAttribute("data-iata-tick");
      if(typeof pushUndo === "function")
        pushUndo((cb.checked?"certified ":"un-certified ")+iata+" for "+groupLabel(g));
      if(!setTicked(g, iata, cb.checked)){
        // the last one cannot be unticked: a group certified for nothing
        // would silently stop producing layouts
        cb.checked = true;
        return;
      }
      U.layouts = null;          // previous results named the older list
      if(typeof uldTouch === "function") uldTouch();
      uldRender();
    });
  });
  var typeSel = host.querySelector("#a_type");
  if(typeSel) typeSel.addEventListener("change", function(){
    U.addType = typeSel.value;
    var h = ULD_TYPE_HINTS[U.addType] || {iata:"e.g. AKE", mw:"e.g. 1587", tare:"e.g. 63"};
    var i = host.querySelector("#a_iata"), m = host.querySelector("#a_mw"), t = host.querySelector("#a_tare");
    if(i) i.placeholder = h.iata;
    if(m) m.placeholder = h.mw;
    if(t) t.placeholder = h.tare;
  });
  // live edits on position fields — mutate state without re-rendering (caret stays put)
  Array.prototype.forEach.call(host.querySelectorAll('input[data-pos]'), function(inp){
    inp.addEventListener("input", function(){
      var g = +inp.getAttribute("data-g"), p = +inp.getAttribute("data-p"), k = inp.getAttribute("data-k");
      var comp = U.compartments[U.activeComp];
      if(!comp || !comp.uldGroups[g] || !comp.uldGroups[g].positions[p]) return;
      var group = comp.uldGroups[g], pos = group.positions[p];
      if(k === "index"){
        var capped = clampDecimals(inp.value, MAX_INDEX_DECIMALS);
        if(capped !== inp.value) inp.value = capped;
      }
      pos[k] = inp.value;
      refreshWarn(g, p);
      if(U.layouts) U.layoutsStale = true;   // generated results no longer describe this data
      if(typeof uldTouch === "function") uldTouch();
      if(k==="index" || k==="fwd" || k==="aft"){ U.signAck = false; }
      // Naming a whole-bay position picks up FWD/AFT/index from the L/R pair
      // of the same zone, if that pair is already defined in this compartment.
      if(k==="name"){
        var src = pairSourceFor(comp, pos);
        if(src){
          ["fwd","aft","index"].forEach(function(f){ pos[f] = src[f]; mirrorDom(g, p, f, src[f]); });
          refreshWarn(g, p);
        }
      }
      // auto-mirror L/R pairs both ways (fwd/aft/index/max weight shared,
      // left/right swapped) — editing either side keeps the other in sync.
      if(isPairType(group.uldType) && /[LR]$/.test(pos.name||"")){
        var side = pos.name.slice(-1), otherSide = side==="L" ? "R" : "L";
        var base = pos.name.slice(0,-1);
        var ri = -1;
        group.positions.forEach(function(q,qi){ if(q.name===base+otherSide) ri = qi; });
        if(ri>=0){
          var r = group.positions[ri];
          if(k==="fwd"||k==="aft"||k==="index"||k==="maxWeight"){ r[k] = inp.value; mirrorDom(g,ri,k,inp.value); }
          else if(k==="left"){ r.right = inp.value; mirrorDom(g,ri,"right",inp.value); }
          else if(k==="right"){ r.left = inp.value; mirrorDom(g,ri,"left",inp.value); }
          refreshWarn(g, ri);
        }
      }
    });
  });
  // live preview of the L/R pair being created
  Array.prototype.forEach.call(host.querySelectorAll('input[data-pair]'), function(inp){
    inp.addEventListener("input", function(){
      if(inp.id === "pf_base") fillPairFormFromBase();
      if(inp.id === "pf_index"){
        var capped = clampDecimals(inp.value, MAX_INDEX_DECIMALS);
        if(capped !== inp.value) inp.value = capped;
      }
      updatePairPreview();
    });
  });
  updatePairPreview();
  host.addEventListener("click", onUldClick);
}
/* Rows are not re-rendered while typing (so the caret stays put), therefore the
   index warning has to be refreshed in place. */
function refreshWarn(gi, pi){
  var comp = U.compartments[U.activeComp];
  if(!comp || !comp.uldGroups[gi]) return;
  var group = comp.uldGroups[gi], pos = group.positions[pi];
  var host = $("uldStep");
  if(pos){
    // index against the reference station, and max weight against the ULD's
    // own rating — both shown under their own field
    [["index", pos.index ? validateIndex(pos.index, pos.fwd, U.refStation) : null],
     ["maxWeight", maxWeightIssue(group, pos)]].forEach(function(pair){
      var key = pair[0], w = pair[1];
      var el = host.querySelector('.fielderr[data-warn="'+gi+'-'+pi+'-'+key+'"]');
      if(el){
        el.textContent = w || "";
        el.style.display = w ? "" : "none";
      }
      var inp2 = host.querySelector('input[data-pos][data-g="'+gi+'"][data-p="'+pi+'"][data-k="'+key+'"]');
      if(inp2){ if(w) inp2.classList.add("bad"); else inp2.classList.remove("bad"); }
    });
  }
  // group-level indicator
  var allValid = group.positions.every(function(p){
    return p.name && p.fwd && p.aft && p.index && p.maxWeight &&
           !validateIndex(p.index, p.fwd, U.refStation);
  });
  var gel = host.querySelector('.idx-warn[data-gwarn="'+gi+'"]');
  if(gel) gel.style.display = (!allValid && group.positions.length) ? "" : "none";
}
function mirrorDom(g,p,k,val){
  var sel = 'input[data-pos][data-g="'+g+'"][data-p="'+p+'"][data-k="'+k+'"]';
  var el = $("uldStep").querySelector(sel);
  if(el) el.value = val;
}
/* Typing a base whose L/R pair already exists elsewhere in the compartment
   fills the rest of the form from it — the same bay, so the same station and
   index. Blanks only, so anything already typed stands. */
function fillPairFormFromBase(){
  var comp = U.compartments[U.activeComp];
  if(!comp) return;
  var src = pairAtBase(comp, ($("pf_base")||{}).value);
  if(!src) return;
  [["pf_fwd", src.fwd], ["pf_aft", src.aft], ["pf_index", src.index],
   ["pf_off", pairOffsetOf(src)]].forEach(function(pair){
    var el = $(pair[0]);
    if(el && !el.value && pair[1] !== "" && pair[1] != null) el.value = pair[1];
  });
}
function updatePairPreview(){
  var box = $("uldStep").querySelector("#pairPreview");
  if(!box) return;
  var base = (($("pf_base")||{}).value||"").toUpperCase();
  var off = ($("pf_off")||{}).value || "0";
  box.innerHTML = base
    ? 'Will create <b style="color:var(--cyan)">'+esc(base)+'L</b> (left=0, right='+esc(off)+')'+
      ' and <b style="color:var(--cyan)">'+esc(base)+'R</b> (left='+esc(off)+', right=0)'
    : 'Enter a base number to preview the pair.';
}
function onUldClick(e){
  var b = e.target.closest("[data-act]"); if(!b) return;
  var act = b.getAttribute("data-act");
  var comp = U.compartments[U.activeComp];

  if(act==="add-uld"){
    var f = readForm("a_");
    if(!f.uldType || !f.iata || !f.maxWeight) return;
    U.ulds.push({ id:uid(), uldType:f.uldType, iata:f.iata,
      maxWeight:parseFloat(f.maxWeight), tare:parseFloat(f.tare||0) });
    U.addType = "";
    uldRender();
  }
  else if(act==="edit-uld"){ U.editUld = (U.editUld===b.getAttribute("data-id")? null : b.getAttribute("data-id")); uldRender(); }
  else if(act==="cancel-uld"){ U.editUld=null; uldRender(); }
  else if(act==="save-uld"){
    var id=b.getAttribute("data-id"), f2=readForm("e_");
    var before = U.ulds.filter(function(u){ return u.id===id; })[0];
    var newMax = parseFloat(f2.maxWeight);
    U.ulds = U.ulds.map(function(u){
      return u.id!==id ? u : { id:u.id, uldType:f2.uldType, iata:f2.iata,
        maxWeight:newMax, tare:parseFloat(f2.tare||0) };
    });
    // The position limit comes from the aircraft structure, not from the ULD, so
    // this is never silent — it is offered, and only for positions that still
    // carry the old value.
    if(before && !isNaN(newMax) && before.maxWeight !== newMax){
      var affected = [];
      U.compartments.forEach(function(c){
        (c.uldGroups||[]).forEach(function(g){
          if(g.uldType !== f2.uldType) return;
          g.positions.forEach(function(p){
            if(parseFloat(p.maxWeight) === before.maxWeight) affected.push(p);
          });
        });
      });
      if(affected.length && confirm(
          "Max weight changed from "+before.maxWeight+" to "+newMax+" kg.\n\n"+
          affected.length+" position"+(affected.length!==1?"s":"")+" of type "+f2.uldType+
          " still carry the old figure.\n\nUpdate them too?\n\n"+
          "Only do this if the position limit follows the ULD. Position limits normally come "+
          "from the aircraft structure (AHM), not from the container.")){
        affected.forEach(function(p){ p.maxWeight = String(newMax); });
        U.layouts = null;
      }
    }
    U.editUld=null; uldRender();
  }
  else if(act==="del-uld"){ var did=b.getAttribute("data-id");
    var gone = U.ulds.filter(function(u){return u.id===did;})[0];
    pushUndo("removed the "+((gone&&gone.iata)||"ULD"));
    U.ulds = U.ulds.filter(function(u){return u.id!==did;}); uldRender(); }
  else if(act==="add-comp"){
    U.compartments.push({ id:uid(), number:U.compartments.length+1, uldGroups:[] });
    U.activeComp = U.compartments.length-1; uldRender();
  }
  else if(act==="pick-comp"){ U.activeComp = +b.getAttribute("data-i"); uldRender(); }
  else if(act==="del-comp"){
    pushUndo("removed compartment "+((U.compartments[U.activeComp]||{}).number||""));
    U.compartments.splice(U.activeComp,1);
    U.compartments.forEach(function(c,i){ c.number=i+1; });
    U.activeComp = Math.max(0,U.activeComp-1); uldRender();
  }
  else if(act==="add-group"){
    var t = ($("newGroupType")||{}).value; if(!t||!comp) return;
    var def = U.ulds.filter(function(u){ return u.uldType===t; })[0];
    if(!def) return;
    comp.uldGroups.push({ id:uid(), uldType:t, iata:def.iata,
      label:t+" \u2014 "+def.iata, positions:[] }); uldRender();
  }
  else if(act==="toggle-group"){
    var gid = b.getAttribute("data-gid");
    // `false` means open; anything else (including undefined) means collapsed
    U.collapsed[gid] = (U.collapsed[gid] === false);
    uldRender();
  }
  else if(act==="expand-all"){
    comp.uldGroups.forEach(function(g){ U.collapsed[g.id] = false; }); uldRender();
  }
  else if(act==="collapse-all"){
    comp.uldGroups.forEach(function(g){ U.collapsed[g.id] = true; }); uldRender();
  }
  else if(act==="del-group"){
    var goneG = comp.uldGroups[+b.getAttribute("data-g")];
    pushUndo("removed "+(goneG?groupLabel(goneG)+" ("+goneG.positions.length+" positions)":"a group"));
    comp.uldGroups.splice(+b.getAttribute("data-g"),1); uldRender();
  }
  else if(act==="add-pos"){ comp.uldGroups[+b.getAttribute("data-g")].positions.push(emptyPos()); uldRender(); }
  else if(act==="open-pair"){ U.pairForm = comp.uldGroups[+b.getAttribute("data-g")].id; uldRender(); }
  else if(act==="cancel-pair"){ U.pairForm = null; uldRender(); }
  else if(act==="create-pair"){
    var g2 = comp.uldGroups[+b.getAttribute("data-g")];
    var base = (($("pf_base")||{}).value||"").toUpperCase().trim();
    var fwd  = ($("pf_fwd")||{}).value, aft = ($("pf_aft")||{}).value;
    var off  = ($("pf_off")||{}).value || "0";
    var ix   = clampDecimals(($("pf_index")||{}).value, MAX_INDEX_DECIMALS), mw = ($("pf_mw")||{}).value;
    if(!base || !fwd || !aft || !ix || !mw){ alert("Fill base, FWD, AFT, index and max weight."); return; }
    if(validateIndex(ix, fwd, U.refStation)){ alert(validateIndex(ix, fwd, U.refStation)); return; }
    g2.positions.push({name:base+"L", fwd:fwd, aft:aft, left:"0", right:off, index:ix, maxWeight:mw});
    g2.positions.push({name:base+"R", fwd:fwd, aft:aft, left:off, right:"0", index:ix, maxWeight:mw});
    U.pairForm = null; uldRender();
  }
  else if(act==="del-pos"){
    var gp2 = comp.uldGroups[+b.getAttribute("data-g")].positions[+b.getAttribute("data-p")];
    pushUndo("removed position "+((gp2&&gp2.name)||""));
    comp.uldGroups[+b.getAttribute("data-g")].positions.splice(+b.getAttribute("data-p"),1); uldRender();
  }
  else if(act==="generate"){
    var iss2 = indexIssues();
    if(iss2.hard.length || (iss2.sign.length && !U.signAck)) return;   // gate, belt and braces
    generateLayouts(); uldRender();
  }
  else if(act==="fix-pos"){
    U.step = 1;
    U.activeComp = +b.getAttribute("data-c");
    U.collapsed[b.getAttribute("data-gid")] = false;
    uldRender();
  }
  else if(act==="pick-lcomp"){
    var i2 = +b.getAttribute("data-i");
    // from the aircraft the index is the compartment index; from the tabs it is the layout index
    if(b.tagName && b.tagName.toLowerCase()==="g"){
      var num = U.compartments[i2] && U.compartments[i2].number;
      var order = U.compartments.map(function(c){ return c.number; });
      i2 = Math.max(0, order.indexOf(num));
    }
    U.activeLayoutComp = i2; uldRender();
  }
  else if(act==="toggle-layout"){
    var k = b.getAttribute("data-k");
    U.openLayout[k] = !U.openLayout[k]; uldRender();
  }
  else if(act==="more-layouts"){
    var cn = +b.getAttribute("data-n");
    U.layoutLimit[cn] = (U.layoutLimit[cn] || LAYOUT_PAGE) + LAYOUT_PAGE;
    uldRender();
  }
  else if(act==="csv-one"){
    var n = U.compartments.map(function(c){return c.number;})[U.activeLayoutComp];
    showTextModal("CSV — compartment "+n, csvOne(n), "compartment"+n+"_layouts.csv");
  }
  else if(act==="csv-all"){ showTextModal("CSV — all compartments", csvAll(), "all_layouts.csv"); }
  else if(act==="xlsx-one"){
    // "D3" is a fixed sheet name the operator's own upload system expects on
    // every .xlsx it accepts, for any aircraft — confirmed against
    // 6H_A330243_TEMPLATE.xlsx. Not related to compartment numbering.
    var n2 = U.compartments.map(function(c){return c.number;})[U.activeLayoutComp];
    downloadXlsx("D3", EXPORT_HEADERS, layoutRows(n2), "compartment"+n2+"_layouts.xlsx");
  }
  else if(act==="xlsx-all"){
    downloadXlsx("D3", EXPORT_HEADERS, allLayoutRows(), "all_layouts.xlsx");
  }
}

$("btnPrev").addEventListener("click", function(){ if(U.step>0){U.step--; uldRender();} });
$("btnNext").addEventListener("click", function(){ if(U.step<2){U.step++; uldRender();} });
$("refStation").addEventListener("input", function(){
  U.refStation = this.value;
  if(typeof uldTouch === "function") uldTouch();
  // every index warning is measured against the reference station
  var comp = U.compartments[U.activeComp];
  if(comp) comp.uldGroups.forEach(function(g,gi){ g.positions.forEach(function(p,pi){ refreshWarn(gi,pi); }); });
  // the aircraft diagram draws the REF marker, so redraw just that panel —
  // a full uldRender() here would take the caret out of this input
  var panel = $("uldAircraft");
  if(panel && AIRCRAFT_VIEW) panel.outerHTML = aircraftPanel(AIRCRAFT_VIEW.num, AIRCRAFT_VIEW.mode);
});
$("btnSaveCfg").addEventListener("click", function(){
  if(typeof uldSaveNow === "function") uldSaveNow();
  showTextModal("Export configuration",
    JSON.stringify({ulds:U.ulds, compartments:U.compartments, bulk:U.bulk,
                    refStation:U.refStation, mergeIdentical:U.mergeIdentical !== false}, null, 2),
    "uld_config.json");
});
$("fileCfg").addEventListener("change", function(e){
  var file = e.target.files[0]; if(!file) return;
  var r = new FileReader();
  r.onload = function(ev){
    try{
      var d = JSON.parse(ev.target.result);
      if(d.ulds) U.ulds = d.ulds;
      if(d.compartments) U.compartments = d.compartments;
      U.bulk = d.bulk || [];
      // a file written before the setting existed carries none: it was
      // exported with the types combined, so it comes back that way
      U.mergeIdentical = d.mergeIdentical !== false;
      if(d.refStation!==undefined){ U.refStation = d.refStation; $("refStation").value = d.refStation; }
      U.tplName = null;
      U.step = 0; U.layouts = null; uldRender();
      if(typeof uldSaveNow === "function") uldSaveNow();
    } catch(err){ alert("Invalid file"); }
  };
  r.readAsText(file); e.target.value = "";
});
$("btnPresets").addEventListener("click", openTemplates);
/* The toolbar sits at the top, and the positions being edited run well past
   the fold — by the time a group is removed, the button that takes it back is
   off screen. So the result is said where the work is, and the keyboard
   reaches it from anywhere. */
function uldToast(text, tone){
  var el = $("uldToast");
  if(!el){
    el = document.createElement("div");
    el.id = "uldToast";
    el.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:60;"+
      "padding:10px 18px;border-radius:var(--radius-sm);font-family:var(--mono);font-size:12.5px;"+
      "box-shadow:var(--shadow);pointer-events:none;transition:opacity .25s";
    document.body.appendChild(el);
  }
  el.style.background = tone==="none" ? "var(--panel2)" : "var(--green-soft)";
  el.style.border = "1px solid "+(tone==="none" ? "var(--line-2)" : "var(--green)");
  el.style.color = tone==="none" ? "var(--dim)" : "var(--green)";
  el.textContent = text;
  el.style.opacity = "1";
  clearTimeout(uldToast._t);
  uldToast._t = setTimeout(function(){ el.style.opacity = "0"; }, 2600);
}
function doUndo(){
  var what = undoLast();
  if(!what){ uldToast("Nothing left to undo", "none"); return; }
  U.editUld = null; U.pairForm = null;
  uldRender();
  var el = $("uldSaveState");
  if(el){ el.className = "savestate"; el.textContent = "Undone: "+what; }
  uldToast("↶ Undone: "+what);
}
$("btnUndo").addEventListener("click", doUndo);
/* Ctrl+Z / Cmd+Z, but never while typing: inside a field that shortcut is the
   browser's own undo for the text, and taking it over would leave no way to
   take back a keystroke. */
document.addEventListener("keydown", function(e){
  if(e.key !== "z" && e.key !== "Z") return;
  if(!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;
  var panel = $("panel-uld");
  if(!panel || panel.classList.contains("panel-hidden")) return;
  var t = e.target;
  if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  e.preventDefault();
  doUndo();
});
$("btnReset").addEventListener("click", function(){
  if(!U.ulds.length && !U.compartments.length){ return; }
  if(!confirm("Clear everything and start from scratch?\n\nThis removes all ULDs, compartments and generated layouts. "+
              "Use Export file first if you want to keep the current setup.")) return;
  pushUndo("reset everything");
  U.ulds = []; U.compartments = []; U.bulk = []; U.refStation = ""; U.layouts = null;
  U.tplName = null;
  U.step = 0; U.activeComp = 0; U.activeLayoutComp = 0; U.editUld = null; U.pairForm = null; U.addType = "";
  $("refStation").value = "";
  uldRender();
  if(typeof Store !== "undefined" && Store.available){ Store.del(ULD_KEY); }
  if(typeof setSaveState === "function") setSaveState("none");
  uldDirty = false;
});

/* ---------- boot ---------- */
uldRender();
uldRenderArmed = true;
if(typeof uldRestorePrompt === "function") uldRestorePrompt();
// the operator's saved aircraft, read once so the templates modal can render
// them synchronously like the built-in ones
if(typeof myTemplatesLoad === "function") myTemplatesLoad();
openTool("home");
