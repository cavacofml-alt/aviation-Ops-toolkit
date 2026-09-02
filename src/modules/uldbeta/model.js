
/* ============================================================================
   ULD LAYOUT GENERATOR — BETA, position-first model

   The shipped tool stores a compartment as one group per ULD type, each
   carrying its own copy of the bay: 11L exists once inside the AKE group,
   again inside the PKC group, again inside the LD2 group. That is the shape
   of the generator, not the shape of the manual — the operator's own
   compatibility table is positions down the side and ULD codes across the
   top, ticked where they are certified.

   This beta stores that table instead:

     compartment.positions = [
       { id, name:"11L", fwd, aft, left, right, index,
         ulds: [ {iata:"AKE"},                       // catalog values
                 {iata:"PKC", maxWeight:"1478"} ] }  // manual differs here
     ]

   A ULD ticked on a position takes its max weight from the catalog, and its
   stations and index from the position. Anything the manual states
   differently is carried as an override on that tick, and nothing else is
   stored twice.

   Nothing here touches the shipped module: this file is built on its own
   (python3 build.py --only uldbeta). The generator is reached by projecting
   back to the old group shape, so the algorithm — and the hundred-odd tests
   behind it — stay exactly as they are while the editing model is tried out.
   ============================================================================ */

var UB_OVERRIDABLE = ["fwd","aft","left","right","index","maxWeight"];

/* ---------- effective values for one ticked ULD at one position ---------- */
function ubUldDef(ulds, iata){
  return (ulds||[]).filter(function(u){ return u.iata === iata; })[0] || null;
}
function ubEffective(pos, tick, catalog){
  var def = ubUldDef(catalog, tick.iata);
  return {
    name: pos.name,
    fwd:  tick.fwd  != null && tick.fwd  !== "" ? tick.fwd  : pos.fwd,
    aft:  tick.aft  != null && tick.aft  !== "" ? tick.aft  : pos.aft,
    left: tick.left != null && tick.left !== "" ? tick.left : pos.left,
    right:tick.right!= null && tick.right!== "" ? tick.right: pos.right,
    index:tick.index!= null && tick.index!== "" ? tick.index: pos.index,
    // the whole point of the model: the weight comes from the catalog unless
    // the manual says otherwise for this exact position
    maxWeight: tick.maxWeight != null && tick.maxWeight !== ""
      ? tick.maxWeight
      : (def ? String(def.maxWeight) : "")
  };
}
/* which fields this tick states differently from the position/catalog — used
   by the editor to show only the overrides that exist */
function ubOverrides(tick){
  return UB_OVERRIDABLE.filter(function(k){ return tick[k] != null && tick[k] !== ""; });
}

/* ---------- old shape → new ----------
   Positions with the same name inside a compartment are one bay. The first
   group to mention it sets the bay's own stations and index; later groups
   contribute a tick, plus an override for whatever they state differently
   (the P bays are the usual case: a PAG's 11P ends at 289.3, a PMC's at
   297.3). */
function ubFromGroups(comp, catalog){
  var byName = {}, order = [];
  (comp.uldGroups||[]).forEach(function(g){
    (g.positions||[]).forEach(function(p){
      var pos = byName[p.name];
      if(!pos){
        pos = byName[p.name] = { id:(p.id||("p_"+p.name+"_"+order.length)), name:p.name,
          fwd:p.fwd, aft:p.aft, left:p.left, right:p.right, index:p.index, ulds:[] };
        order.push(p.name);
      }
      var tick = { iata:g.iata };
      ["fwd","aft","left","right","index"].forEach(function(k){
        if(String(p[k]) !== String(pos[k])) tick[k] = p[k];
      });
      var def = ubUldDef(catalog, g.iata);
      if(!def || String(p.maxWeight) !== String(def.maxWeight)) tick.maxWeight = p.maxWeight;
      // a group excluded from generation carries that through to its ticks
      if(g.include === false) tick.include = false;
      if(g.exclusive) tick.exclusive = true;
      pos.ulds.push(tick);
    });
  });
  return { id:comp.id, number:comp.number, positions: order.map(function(n){ return byName[n]; }) };
}
function ubFromTemplate(t){
  return {
    name: t.name,
    refStation: t.refStation,
    ulds: JSON.parse(JSON.stringify(t.ulds||[])),
    bulk: JSON.parse(JSON.stringify(t.bulk||[])),
    compartments: (t.compartments||[]).map(function(c){ return ubFromGroups(c, t.ulds||[]); })
  };
}

/* ---------- new shape → old ----------
   Only for the generator: it thinks in groups, and it is the piece worth not
   rewriting. One group per ULD that is ticked anywhere in the compartment,
   holding the effective values of each tick. */
function ubToGroups(comp, catalog){
  var groups = {}, order = [];
  (comp.positions||[]).forEach(function(pos){
    (pos.ulds||[]).forEach(function(tick){
      var def = ubUldDef(catalog, tick.iata);
      if(!def) return;
      var key = def.uldType + "|" + tick.iata;
      var g = groups[key];
      if(!g){
        g = groups[key] = { id:"g_"+key.replace(/\W/g,"_"), uldType:def.uldType, iata:tick.iata,
                            label:def.uldType+" — "+tick.iata, positions:[] };
        if(tick.include === false) g.include = false;
        if(tick.exclusive) g.exclusive = true;
        order.push(key);
      }
      g.positions.push(ubEffective(pos, tick, catalog));
    });
  });
  return { id:comp.id, number:comp.number, uldGroups: order.map(function(k){ return groups[k]; }) };
}
function ubToOldModel(state){
  return {
    name: state.name,
    refStation: state.refStation,
    ulds: state.ulds,
    bulk: state.bulk,
    compartments: (state.compartments||[]).map(function(c){ return ubToGroups(c, state.ulds||[]); })
  };
}

/* ---------- the matrix the editor draws ----------
   Every ULD in the catalog against every position of a compartment, with the
   tick and its overrides where they exist. */
function ubMatrix(comp, catalog){
  return {
    ulds: (catalog||[]).map(function(u){ return { iata:u.iata, uldType:u.uldType, maxWeight:u.maxWeight }; }),
    rows: (comp.positions||[]).map(function(pos){
      return {
        pos: pos,
        cells: (catalog||[]).map(function(u){
          var tick = ubUldDef(pos.ulds, u.iata);
          return { iata:u.iata, on:!!tick, tick:tick||null,
                   overrides: tick ? ubOverrides(tick) : [] };
        })
      };
    })
  };
}
function ubToggle(pos, iata, on){
  pos.ulds = pos.ulds || [];
  var i = -1;
  pos.ulds.forEach(function(t,k){ if(t.iata === iata) i = k; });
  if(on && i < 0) pos.ulds.push({ iata:iata });
  else if(!on && i >= 0) pos.ulds.splice(i,1);
  return pos.ulds;
}
