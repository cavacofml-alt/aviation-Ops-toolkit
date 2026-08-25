
/* ============================================================================
   SHELL — sidebar navigation + tool registry
   Add a tool: append to TOOLS and add a <section id="panel-{id}"> in the markup.
   ============================================================================ */
var TOOLS = [
  { id:"airmsg", name:"Airline Message Toolkit", badge:"PAX OPS", code:"PAX", accent:"cyan", wide:true,
    blurb:"Parse PRL and APIS PAXLST messages, review passenger documents, and build PSCRM PNL messages from a CSV or XLSX passenger list. Everything runs locally in the browser.",
    sources:"LOCAL TOOL: PRL · APIS PAXLST · PSCRM PNL" },
  { id:"msgcheck", name:"Message Validator", badge:"MSGCHECK", code:"MSG", accent:"green", wide:true,
    blurb:"Validate IATA teletype messages against the standard — PNL, ADL, PSM and 11 more. Findings are flagged character by character with the manual rule behind each one.",
    sources:"SOURCES: PSCRM 30th (RP 1707b·1708·1711·1712·1715·1716·1718·1719a/b/c) · AIRIMP 34th · AHM 780/730 · SSIM" },
  { id:"securezip", name:"Secure ZIP", badge:"AES-256", code:"ZIP", accent:"magenta", wide:true,
    blurb:"Attach files or paste text and get them back as a single AES-256 encrypted .zip, with a strong random password. Everything happens in your browser — nothing is uploaded.",
    sources:"WinZip AE-2 · PBKDF2-HMAC-SHA1 · AES-256-CTR · HMAC-SHA1" },
  { id:"ahm", name:"AHM Audit", badge:"SHORTCUT", code:"AHM", accent:"amber",
    blurb:"Opens the AHM Audit application running on the local network. It keeps its own sign-in page.",
    sources:"Local network application · nothing stored by this toolkit" },
  { id:"uld", name:"ULD Layout Generator", badge:"LOAD PLANNING", code:"ULD", accent:"cyan", wide:true,
    blurb:"Define ULDs and per-compartment groups, then generate every valid position layout with index and weight — no overlaps. Exports CSV.",
    sources:"SOURCES: IATA ULD types · station index" }
];

var $ = function(id){ return document.getElementById(id); };
var esc = function(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };

function openTool(id){
  var isHome = (id === "home");
  // panels
  var homePanel = $("panel-home");
  if(homePanel) homePanel.className = isHome ? "panel-fill" : "panel-hidden";
  var FILL_PANELS = {"msgcheck":1,"securezip":1,"ahm":1,"recon":1};
  TOOLS.forEach(function(t){
    var p = $("panel-"+t.id);
    if(!p) return;
    if(t.id===id){
      p.className = FILL_PANELS[t.id] ? "panel-fill" : "";
    } else {
      p.className = "panel-hidden";
    }
  });
  // sidebar state (home included)
  Array.prototype.forEach.call(document.querySelectorAll(".sb-item"), function(b){
    if(b.getAttribute("data-id")===id) b.setAttribute("aria-current","page");
    else b.removeAttribute("aria-current");
  });

  var tool = TOOLS.filter(function(t){return t.id===id;})[0];
  if(isHome){
    $("toolTitle").textContent = "Aviation Ops Toolkit";
    $("toolBadge").textContent = "HOME";
    $("toolBadge").style.color = "var(--text)";
    $("toolBlurb").style.display = "none";
    $("toolSources").style.display = "none";
    $("toolPanel").setAttribute("data-accent", "green");
  } else {
    tool = tool || TOOLS[0];
    $("toolTitle").textContent = tool.name;
    $("toolBadge").textContent = tool.badge;
    $("toolBadge").style.color = "var(--"+tool.accent+")";
    $("toolBlurb").style.display = "";
    $("toolBlurb").textContent = tool.blurb;
    $("toolSources").style.display = "";
    $("toolSources").innerHTML = esc(tool.sources) +
      "<br>Rules reformulated as validation logic; no part of the manuals is reproduced.";
    $("toolPanel").setAttribute("data-accent", tool.accent);
  }
  var mainEl = document.querySelector("main");
  if(mainEl) mainEl.setAttribute("data-wide", (isHome || (tool && tool.wide)) ? "1" : "0");
  closeNav();
  try { window.scrollTo({top:0, behavior:"smooth"}); }
  catch(e){ try { window.scrollTo(0,0); } catch(e2){} }
}
function closeNav(){ $("sidebar").setAttribute("data-open","0"); $("scrim").setAttribute("data-open","0"); }
function buildNav(){
  var nav = $("sbNav");
  TOOLS.forEach(function(t){
    var b = document.createElement("button");
    b.className = "sb-item"; b.setAttribute("data-id", t.id); b.setAttribute("data-accent", t.accent);
    b.innerHTML = '<span class="code">'+esc(t.code)+'</span><span class="label">'+esc(t.name)+'</span>';
    b.addEventListener("click", function(){ openTool(t.id); });
    nav.appendChild(b);
  });
  var homeBtn = nav.querySelector('.sb-item[data-id="home"]');
  if(homeBtn) homeBtn.addEventListener("click", function(){ openTool("home"); });
}
function buildHome(){
  var grid = $("homeGrid");
  if(!grid) return;
  grid.innerHTML = TOOLS.map(function(t){
    return '<button class="home-card" data-open="'+esc(t.id)+'" data-accent="'+esc(t.accent)+'">'+
      '<span class="hc-code" style="color:var(--'+t.accent+')">'+esc(t.code)+' &middot; '+esc(t.badge)+'</span>'+
      '<span class="hc-name">'+esc(t.name)+'</span>'+
      '<p class="hc-blurb">'+esc(t.blurb)+'</p>'+
      '<span class="hc-foot"><span class="hc-src">'+esc(t.sources.replace(/^SOURCES: /,""))+'</span>'+
      '<span class="hc-go" style="color:var(--'+t.accent+')">OPEN &#9656;</span></span>'+
    '</button>';
  }).join("");
  Array.prototype.forEach.call(grid.querySelectorAll(".home-card"), function(c){
    c.addEventListener("click", function(){ openTool(c.getAttribute("data-open")); });
  });
}
buildNav();
buildHome();
$("sbHome").addEventListener("click", function(){ openTool("home"); });
$("hdrHome").addEventListener("click", function(){ openTool("home"); });

/* ---------- theme ---------- */
/* Not persisted: artifact sandboxes block browser storage, so the choice lasts
   for the session. Honours the operating system preference on first load. */
function applyTheme(mode){
  document.documentElement.setAttribute("data-theme", mode);
  var b = $("themeBtn");
  if(b){
    b.innerHTML = mode === "light" ? "&#9789;" : "&#9681;";
    b.title = mode === "light" ? "Switch to dark" : "Switch to daylight";
  }
}
var prefersLight = false;
try { prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches; } catch(e){}
applyTheme(prefersLight ? "light" : "dark");
$("themeBtn").addEventListener("click", function(){
  var now = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
  applyTheme(now);
});
$("burger").addEventListener("click", function(){
  $("sidebar").setAttribute("data-open","1"); $("scrim").setAttribute("data-open","1");
});
$("scrim").addEventListener("click", closeNav);

