
/* ============================================================================
   PERSISTENCE — autosave for the load planner
   Two backends, because the toolkit runs in two places: the artifact sandbox
   offers window.storage, a downloaded file offers localStorage. Whichever is
   there gets used; if neither is, the unsaved-changes guard still protects you.
   ============================================================================ */
var Store = (function(){
  var mode = "none";
  try {
    if (typeof window !== "undefined" && window.storage && window.storage.get) mode = "artifact";
  } catch(e){}
  if (mode === "none") {
    try {
      var k = "__ops_probe";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      mode = "local";
    } catch(e){ mode = "none"; }
  }
  return {
    available: mode !== "none",
    mode: mode,
    get: function(key){
      try {
        if (mode === "artifact") return window.storage.get(key).then(function(r){ return r ? r.value : null; });
        if (mode === "local")    return Promise.resolve(window.localStorage.getItem(key));
      } catch(e){}
      return Promise.resolve(null);
    },
    set: function(key, value){
      try {
        if (mode === "artifact") return window.storage.set(key, value);
        if (mode === "local"){ window.localStorage.setItem(key, value); return Promise.resolve(); }
      } catch(e){}
      return Promise.resolve();
    },
    del: function(key){
      try {
        if (mode === "artifact") return window.storage.delete(key);
        if (mode === "local"){ window.localStorage.removeItem(key); return Promise.resolve(); }
      } catch(e){}
      return Promise.resolve();
    }
  };
})();

var ULD_KEY = "uld_workspace";
var uldDirty = false, uldSaveTimer = null, uldLastSaved = null;

function uldSnapshot(){
  return JSON.stringify({
    v: 1,
    savedAt: new Date().toISOString(),
    ulds: U.ulds,
    compartments: U.compartments,
    bulk: U.bulk,
    refStation: U.refStation
  });
}
function uldHasWork(){ return U.ulds.length > 0 || U.compartments.length > 0; }

function setSaveState(state, when){
  var el = document.getElementById("uldSaveState");
  if(!el) return;
  if(state === "saved"){
    el.className = "savestate ok";
    el.textContent = "Saved " + (when || "");
  } else if(state === "saving"){
    el.className = "savestate"; el.textContent = "Saving…";
  } else if(state === "dirty"){
    el.className = "savestate warn"; el.textContent = "Unsaved changes";
  } else {
    el.className = "savestate"; el.textContent = "";
  }
}

/* Called by every action that changes the workspace. */
function uldTouch(){
  uldDirty = true;
  if(!Store.available){ setSaveState("dirty"); return; }
  setSaveState("dirty");
  clearTimeout(uldSaveTimer);
  uldSaveTimer = setTimeout(uldSaveNow, 800);   // settles after typing stops
}
function uldSaveNow(){
  if(!Store.available) return;
  setSaveState("saving");
  Store.set(ULD_KEY, uldSnapshot()).then(function(){
    uldDirty = false;
    uldLastSaved = new Date();
    setSaveState("saved", uldLastSaved.toTimeString().slice(0,5));
  }).catch(function(){ setSaveState("dirty"); });
}

/* Offer to bring back the previous session, never silently overwrite. */
function uldRestorePrompt(){
  if(!Store.available) return;
  Store.get(ULD_KEY).then(function(raw){
    if(!raw || uldHasWork()) return;
    var data;
    try { data = JSON.parse(raw); } catch(e){ return; }
    var n = (data.compartments||[]).reduce(function(s,c){
      return s + (c.uldGroups||[]).reduce(function(k,g){ return k + g.positions.length; }, 0); }, 0);
    if(!(data.ulds||[]).length && !n) return;
    var when = data.savedAt ? new Date(data.savedAt) : null;
    var bar = document.getElementById("uldRestore");
    if(!bar) return;
    bar.hidden = false;
    bar.innerHTML =
      '<span>Previous session found — ' + (data.ulds||[]).length + ' ULDs, ' +
      (data.compartments||[]).length + ' compartments, ' + n + ' positions' +
      (when ? ' (saved ' + when.toLocaleString() + ')' : '') + '.</span>' +
      '<span style="display:flex;gap:8px">' +
        '<button class="btn small primary" id="btnUldRestore">Restore</button>' +
        '<button class="btn small quiet" id="btnUldDiscard">Discard</button>' +
      '</span>';
    document.getElementById("btnUldRestore").addEventListener("click", function(){
      U.ulds = data.ulds || [];
      U.compartments = data.compartments || [];
      U.bulk = data.bulk || [];
      U.refStation = data.refStation || "";
      var rs = document.getElementById("refStation"); if(rs) rs.value = U.refStation;
      U.step = 0; U.layouts = null; U.activeComp = 0;
      bar.hidden = true;
      uldRender();
      setSaveState("saved", when ? when.toTimeString().slice(0,5) : "");
    });
    document.getElementById("btnUldDiscard").addEventListener("click", function(){
      Store.del(ULD_KEY); bar.hidden = true; setSaveState("none");
    });
  });
}

/* Last line of defence: the browser's own confirmation on close or reload. */
window.addEventListener("beforeunload", function(e){
  if(!uldDirty || !uldHasWork()) return;
  e.preventDefault();
  e.returnValue = "";     // browsers show their own wording
  return "";
});
