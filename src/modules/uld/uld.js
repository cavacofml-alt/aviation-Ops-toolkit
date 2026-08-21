
/* ============================================================================
   ULD LAYOUT GENERATOR — vanilla port
   State is mutated in place by input handlers (no re-render while typing, so
   the caret never jumps); render() runs only on structural changes.
   ============================================================================ */
var ULD_TYPES = ["LD3","LD7/P88","LD7/P96","LD8","PLA","LD1","LD2","LD4","LD6","LD9","LD11"];
/* typical figures per type — used only as field hints */
var ULD_TYPE_HINTS = {
  "LD3":{iata:"AKE", mw:"1587", tare:"63"},   "LD7/P88":{iata:"PAG", mw:"4626", tare:"110"},
  "LD7/P96":{iata:"PMC", mw:"6033", tare:"120"}, "LD8":{iata:"DQF", mw:"2450", tare:"110"},
  "PLA":{iata:"PLA", mw:"3175", tare:"105"},  "LD1":{iata:"AMA", mw:"1588", tare:"77"},
  "LD2":{iata:"AKH", mw:"1225", tare:"57"},   "LD4":{iata:"ALP", mw:"2449", tare:"84"},
  "LD6":{iata:"ALF", mw:"3175", tare:"120"},  "LD9":{iata:"AAP", mw:"4626", tare:"130"},
  "LD11":{iata:"AQP", mw:"3175", tare:"100"}
};
/* one colour per ULD type, carried through group box, badge and buttons */
var GROUP_COLORS = { "LD3":"var(--cyan)", "LD7/P88":"var(--green)", "LD7/P96":"var(--teal)",
                     "LD8":"var(--amber)", "PLA":"var(--amber)" };
function groupColor(t){ return GROUP_COLORS[t] || "var(--dim)"; }
var ULD_TYPE_LABELS = {
  "LD3":"LD3 (AKE / PKC)", "LD7/P88":"LD7/P88 (PAG)", "LD7/P96":"LD7/P96 (PMC)",
  "LD8":"LD8", "PLA":"PLA", "LD1":"LD1 (AMA)", "LD2":"LD2 (AKH / DPE)",
  "LD4":"LD4 (ALP)", "LD6":"LD6 (ALF)", "LD9":"LD9 (AAP / P6P)", "LD11":"LD11 (AQP / DQF)"
};
/* intermixing (AIRIMP §3 "ULD Configurations" style manuals): within a K/L/P
   bay string, only these rigid-wall types may sit against a fwd/aft restraint
   — a pallet or half-pallet at the end of a string has nothing holding it. */
var ROBUST_STRING_TYPES = ["LD3","LD6","LD1","LD5","LD10","LD11"];
var STEP_LABELS = ["ULDs","Compartments & Zones","Layouts"];
var uid = function(){
  if(typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().slice(0,8);
  if(typeof crypto !== "undefined" && crypto.getRandomValues){
    var b = new Uint8Array(4); crypto.getRandomValues(b);
    return Array.prototype.map.call(b, function(x){ return ("0"+x.toString(16)).slice(-2); }).join("");
  }
  return Math.random().toString(36).slice(2,10);
};

var U = { step:0, ulds:[], compartments:[], refStation:"", activeComp:0,
          layouts:null, activeLayoutComp:0, editUld:null, pairForm:null, addType:"",
          collapsed:{}, openLayout:{}, layoutLimit:{}, signAck:false, tplName:null };

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
  var rows = U.ulds.map(function(u,i){
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
  var isLD3 = g.uldType==="LD3";
  var baseEx = String(comp.number)+"1";
  var ph = isLD3 ? {pos:baseEx, mw:"1587"}
        : (g.uldType.indexOf("LD7")===0 ? {pos:baseEx+"P", mw:"4626"} : {pos:baseEx, mw:"3174"});

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
      '<span class="gt" style="color:var(--cyan)">'+esc(g.label||g.uldType)+'</span>'+
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
    return '<div class="posrow" style="grid-template-columns:1.1fr .9fr .9fr .7fr .7fr 1.2fr 1fr auto">'+
      posInp(gi,pi,"name",p.name,"text",ph.pos)+
      posInp(gi,pi,"fwd",p.fwd,"number","FWD")+
      posInp(gi,pi,"aft",p.aft,"number","AFT")+
      posInp(gi,pi,"left",p.left,"number","0")+
      posInp(gi,pi,"right",p.right,"number","0")+
      posInp(gi,pi,"index",p.index,"number","-0.00500",warn)+
      posInp(gi,pi,"maxWeight",p.maxWeight,"number",ph.mw)+
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

  var addBtn = isLD3
    ? '<button class="btn small" data-act="open-pair" data-g="'+gi+'" style="border-color:'+gc+';color:'+gc+'"'+
      (U.pairForm===g.id?" disabled":"")+'>+ L/R pair</button>'
    : '<button class="btn small" data-act="add-pos" data-g="'+gi+'" style="border-color:'+gc+';color:'+gc+'">+ Position</button>';

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
    '<span class="fielderr" data-warn="'+gi+'-'+pi+'"'+(err?'':' style="display:none"')+'>'+
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

  var head = '<div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">'+
    '<button class="btn primary" data-act="generate"'+(blocked?" disabled":"")+'>&#9889; Generate all layouts</button>'+
    (U.layouts && !blocked ? '<button class="btn" data-act="csv-all">&#8595; Export all</button>':'')+'</div>' + gate+
    (U.layouts && !blocked ? '<div class="note" style="margin-bottom:14px">Intermixing rule applied: each bay '+
      'string only keeps layouts where the two end positions are a rigid-wall type ('+ROBUST_STRING_TYPES.join(", ")+
      ') and any LD2 sits next to another LD2 or LD3 — layouts that would leave a pallet unrestrained at either '+
      'end are not generated.</div>' : '');

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
      '<button class="btn small" data-act="csv-one">&#8595; CSV compartment '+n+'</button></div>'+
    (list.length? renderLayoutList(n, list) : '<div class="empty">No valid layouts for this compartment.</div>')+
    '</div>';
  return head + aircraftPanel(nums[U.activeLayoutComp], "layouts") + stats + warnHtml + tabs + body;
}

/* Safety gate before generating layouts.
   Two classes of problem, deliberately treated differently:
     hard  — the value cannot be used at all (missing, or not a number). Blocks.
     sign  — the index sign disagrees with the reference-station convention.
             Index sign conventions differ between operators and aircraft, so this
             cannot be a hard block; it requires an explicit acknowledgement. */
function indexIssues(){
  var hard = [], sign = [];
  U.compartments.forEach(function(c, ci){
    (c.uldGroups||[]).forEach(function(g){
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
        var w = validateIndex(p.index, p.fwd, U.refStation);
        if(w) sign.push(Object.assign({reason:w}, where));
      });
    });
  });
  return { hard:hard, sign:sign };
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
      ? '<div style="overflow-x:auto;margin-top:8px"><table><thead><tr><th>Position</th><th>ULD</th>'+
        '<th>FWD</th><th>AFT</th><th>Index</th><th>Max wt</th></tr></thead><tbody>'+
        l.positions.map(function(p){
          var pc = groupColor(p.uldType);
          return '<tr><td>'+esc(p.name)+'</td><td><span class="badge" style="color:'+pc+'">'+
            esc(p.uld)+'</span> <span style="color:'+pc+'">'+esc(p.uldType)+'</span></td>'+
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
    // Every group stays its own option at every zone, even where two ULD
    // types (e.g. AKE and PKC) happen to certify the same weight — so a
    // "full AKE" and a "full PKC" compartment layout are always both
    // offered as distinct, explicit choices, never silently collapsed just
    // because their numbers matched in that particular compartment.
    function addOption(base, opt){
      if(!zoneOptionsMap[base]) zoneOptionsMap[base]=[];
      zoneOptionsMap[base].push(opt);
    }
    comp.uldGroups.forEach(function(group){
      if(group.include === false) return;         // excluded from generation
      // L/R pairing is a property of the position names, not of any one ULD
      // type — PLA and LD6 (half pallets) also sit in L/R bays and must be
      // pairable the same way LD3 is, or a bare L/R suffix conflict check
      // would treat the two sides as mutually exclusive instead of side by
      // side, and only ever offer one side at a time.
      var cfgType = group.positions.some(function(p){ return /[LR]$/.test(p.name); }) ? "LR"
        : (group.uldType.indexOf("LD7")===0 ? "P" : "Simple");
      // Scoped to this group's own declared ULD (type + IATA code) — not just
      // type — so a group never silently borrows another group's identity or
      // weight tier when two ULDs of the same type are in the fleet catalog
      // (e.g. AKE and PKC both being "LD3").
      var uldDef = U.ulds.filter(function(u){ return u.uldType===group.uldType && u.iata===group.iata; })[0];
      if(!uldDef) return;
      if(cfgType==="LR"){
        var Ls = group.positions.filter(function(p){ return /L$/.test(p.name); });
        var Rs = group.positions.filter(function(p){ return /R$/.test(p.name); });
        Ls.forEach(function(posL){
          var base = posL.name.slice(0,-1);
          var posR = Rs.filter(function(p){ return p.name===base+"R"; })[0];
          if(!posR) return;
          // the IATA code rides in the label so two combos that differ only by
          // which ULD filled a zone never collapse into one at the final
          // name-based dedup below — that would silently discard whichever
          // alternative sorted second, even though both are valid layouts.
          addOption(base, { label:"2"+group.uldType.replace("/","")+"("+uldDef.iata+")",
            positions:[ Object.assign({},posL,{uld:uldDef.iata,uldType:group.uldType}),
                        Object.assign({},posR,{uld:uldDef.iata,uldType:group.uldType}) ] });
        });
      } else if(cfgType==="P"){
        group.positions.forEach(function(pos){
          var base = pos.name.replace(/P$/,"");
          addOption(base, { label:"1"+group.uldType.replace("/","")+"("+uldDef.iata+")",
            positions:[ Object.assign({},pos,{uld:uldDef.iata,uldType:group.uldType}) ] });
        });
      } else {
        group.positions.forEach(function(pos){
          var base = pos.name;
          addOption(base, { label:"1"+group.uldType+"("+uldDef.iata+")",
            positions:[ Object.assign({},pos,{uld:uldDef.iata,uldType:group.uldType}) ] });
        });
      }
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

    // ULD intermixing: the K/L/P bay row (positions not ending "P" — the P row
    // is a separate longitudinal string) is only held at each end by the
    // restraint net. A slot is one L/R pair or one simple bay; slots sharing a
    // side-by-side pair share a station, so they collapse to one slot before
    // checking string order.
    allCombos = allCombos.filter(function(l){
      var slotMap = {};
      l.positions.forEach(function(p){
        if(/P$/.test(p.name)) return;
        var base = p.name.replace(/[LR]$/,"");
        if(!slotMap[base]) slotMap[base] = { fwd: parseFloat(p.fwd), uldType: p.uldType };
      });
      var slots = Object.keys(slotMap).map(function(k){ return slotMap[k]; })
        .sort(function(a,b){ return a.fwd - b.fwd; });
      if(!slots.length) return true;
      if(ROBUST_STRING_TYPES.indexOf(slots[0].uldType) < 0) return false;
      if(ROBUST_STRING_TYPES.indexOf(slots[slots.length-1].uldType) < 0) return false;
      return slots.every(function(s,i){
        if(s.uldType !== "LD2") return true;
        var prevOk = i>0 && (slots[i-1].uldType==="LD2" || slots[i-1].uldType==="LD3");
        var nextOk = i<slots.length-1 && (slots[i+1].uldType==="LD2" || slots[i+1].uldType==="LD3");
        return prevOk || nextOk;
      });
    });

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

/* ---------- CSV ---------- */
var CSV_HEADER = "Compartment,Layout,Position,Certified ULDs,FWD Stat,AFT Stat,Left,Right,Index,Volume,Max weight";
function csvLines(compNum){
  var lines = [];
  (U.layouts[compNum]||[]).forEach(function(layout){
    layout.positions.forEach(function(pos){
      // PKC is the pallet form of an LD3 — CSV type codes distinguish it from
      // the AKE container as "L3P/PKC" rather than the bare "LD3".
      var csvType = pos.uld==="PKC" ? "L3P/PKC" : pos.uldType;
      lines.push([compNum, layout.name, pos.name, '"'+csvType+',LA"', pos.fwd, pos.aft,
        (pos.left===""||pos.left==null)?0:pos.left,
        (pos.right===""||pos.right==null)?0:pos.right,
        pos.index, 0, pos.maxWeight].join(","));
    });
  });
  return lines;
}
function csvOne(n){ return [CSV_HEADER].concat(csvLines(n)).join("\n"); }
function csvAll(){
  var out=[CSV_HEADER];
  U.compartments.forEach(function(c){ out = out.concat(csvLines(c.number)); });
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
      pos[k] = inp.value;
      refreshWarn(g, p);
      if(typeof uldTouch === "function") uldTouch();
      if(k==="index" || k==="fwd" || k==="aft"){ U.signAck = false; }
      // auto-mirror L -> R for LD3 pairs (fwd/aft/index/max weight shared, left/right swapped)
      if(group.uldType==="LD3" && /L$/.test(pos.name||"")){
        var base = pos.name.slice(0,-1);
        var ri = -1;
        group.positions.forEach(function(q,qi){ if(q.name===base+"R") ri = qi; });
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
    inp.addEventListener("input", updatePairPreview);
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
    var w = pos.index ? validateIndex(pos.index, pos.fwd, U.refStation) : null;
    var el = host.querySelector('.fielderr[data-warn="'+gi+'-'+pi+'"]');
    if(el){
      el.textContent = w || "";
      el.style.display = w ? "" : "none";
    }
    var inp2 = host.querySelector('input[data-pos][data-g="'+gi+'"][data-p="'+pi+'"][data-k="index"]');
    if(inp2){ if(w) inp2.classList.add("bad"); else inp2.classList.remove("bad"); }
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
    U.ulds = U.ulds.filter(function(u){return u.id!==did;}); uldRender(); }
  else if(act==="add-comp"){
    U.compartments.push({ id:uid(), number:U.compartments.length+1, uldGroups:[] });
    U.activeComp = U.compartments.length-1; uldRender();
  }
  else if(act==="pick-comp"){ U.activeComp = +b.getAttribute("data-i"); uldRender(); }
  else if(act==="del-comp"){
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
  else if(act==="del-group"){ comp.uldGroups.splice(+b.getAttribute("data-g"),1); uldRender(); }
  else if(act==="add-pos"){ comp.uldGroups[+b.getAttribute("data-g")].positions.push(emptyPos()); uldRender(); }
  else if(act==="open-pair"){ U.pairForm = comp.uldGroups[+b.getAttribute("data-g")].id; uldRender(); }
  else if(act==="cancel-pair"){ U.pairForm = null; uldRender(); }
  else if(act==="create-pair"){
    var g2 = comp.uldGroups[+b.getAttribute("data-g")];
    var base = (($("pf_base")||{}).value||"").toUpperCase().trim();
    var fwd  = ($("pf_fwd")||{}).value, aft = ($("pf_aft")||{}).value;
    var off  = ($("pf_off")||{}).value || "0";
    var ix   = ($("pf_index")||{}).value, mw = ($("pf_mw")||{}).value;
    if(!base || !fwd || !aft || !ix || !mw){ alert("Fill base, FWD, AFT, index and max weight."); return; }
    if(validateIndex(ix, fwd, U.refStation)){ alert(validateIndex(ix, fwd, U.refStation)); return; }
    g2.positions.push({name:base+"L", fwd:fwd, aft:aft, left:"0", right:off, index:ix, maxWeight:mw});
    g2.positions.push({name:base+"R", fwd:fwd, aft:aft, left:off, right:"0", index:ix, maxWeight:mw});
    U.pairForm = null; uldRender();
  }
  else if(act==="del-pos"){
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
}

$("btnPrev").addEventListener("click", function(){ if(U.step>0){U.step--; uldRender();} });
$("btnNext").addEventListener("click", function(){ if(U.step<2){U.step++; uldRender();} });
$("refStation").addEventListener("input", function(){
  U.refStation = this.value;
  if(typeof uldTouch === "function") uldTouch();
  // every index warning is measured against the reference station
  var comp = U.compartments[U.activeComp];
  if(comp) comp.uldGroups.forEach(function(g,gi){ g.positions.forEach(function(p,pi){ refreshWarn(gi,pi); }); });
});
$("btnSaveCfg").addEventListener("click", function(){
  if(typeof uldSaveNow === "function") uldSaveNow();
  showTextModal("Export configuration",
    JSON.stringify({ulds:U.ulds, compartments:U.compartments, refStation:U.refStation}, null, 2),
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
      if(d.refStation!==undefined){ U.refStation = d.refStation; $("refStation").value = d.refStation; }
      U.tplName = null;
      U.step = 0; U.layouts = null; uldRender();
      if(typeof uldSaveNow === "function") uldSaveNow();
    } catch(err){ alert("Invalid file"); }
  };
  r.readAsText(file); e.target.value = "";
});
$("btnPresets").addEventListener("click", openTemplates);
$("btnReset").addEventListener("click", function(){
  if(!U.ulds.length && !U.compartments.length){ return; }
  if(!confirm("Clear everything and start from scratch?\n\nThis removes all ULDs, compartments and generated layouts. "+
              "Use Export file first if you want to keep the current setup.")) return;
  U.ulds = []; U.compartments = []; U.refStation = ""; U.layouts = null;
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
openTool("home");
