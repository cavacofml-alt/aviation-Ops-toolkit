
/* ============================================================================
   AIRLINE MESSAGE TOOLKIT — UI wiring
   ============================================================================ */
function amRenderTable(containerId, headers, rows){
  var el = $(containerId);
  if(!rows.length){ el.innerHTML = '<div class="empty">No records found.</div>'; return; }
  el.innerHTML = '<div style="overflow:auto;max-height:520px;border:1px solid var(--line);border-radius:var(--radius-sm)">'+
    '<table><thead><tr>'+headers.map(function(h){ return '<th style="position:sticky;top:0;background:var(--panel2);text-align:left;padding:8px 10px;font-size:10.5px;color:var(--dim);text-transform:uppercase;border-bottom:1px solid var(--line)">'+esc(h)+'</th>'; }).join("")+
    '</tr></thead><tbody>'+rows.map(function(r){
      return '<tr>'+headers.map(function(h){
        return '<td style="padding:7px 10px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:12px;white-space:nowrap" title="'+esc(r[h])+'">'+esc(r[h])+'</td>';
      }).join("")+'</tr>';
    }).join("")+'</tbody></table></div>';
}

function amSwitchTab(t){
  AM.activeTab = t;
  ["prl","pax","pnl"].forEach(function(k){
    $("am"+k[0].toUpperCase()+k.slice(1)).hidden = (k!==t);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-act="am-tab"]'), function(b){
    b.setAttribute("aria-selected", b.getAttribute("data-t")===t ? "true" : "false");
  });
}
document.addEventListener("click", function(e){
  var b = e.target.closest ? e.target.closest('[data-act="am-tab"]') : null;
  if(b) amSwitchTab(b.getAttribute("data-t"));
});
amSwitchTab("prl");

/* ---------- PRL ---------- */
function amRunPrl(){
  var rows = parsePRL($("amPrlInput").value);
  AM.prlRows = rows; AM.prlCsv = makeCsv(prlHeaders, rows);
  amRenderTable("amPrlResult", prlHeaders, rows);
  $("amPrlDownload").disabled = !rows.length;
}
$("amPrlParse").addEventListener("click", amRunPrl);
$("amPrlClear").addEventListener("click", function(){
  $("amPrlInput").value = ""; AM.prlRows = []; AM.prlCsv = "";
  $("amPrlResult").innerHTML = '<div class="empty">No result yet.</div>';
  $("amPrlDownload").disabled = true;
});
$("amPrlDownload").addEventListener("click", function(){ downloadText(AM.prlCsv, "PRL_output.csv"); });
$("amPrlFile").addEventListener("change", function(e){
  var f = e.target.files[0]; if(!f) return;
  var r = new FileReader();
  r.onload = function(ev){ $("amPrlInput").value = ev.target.result; amRunPrl(); };
  r.readAsText(f); e.target.value = "";
});

/* ---------- PAX ---------- */
function amRunPax(){
  var rows = parsePAX($("amPaxInput").value);
  AM.paxRows = rows; AM.paxCsv = makeCsv(paxHeaders, rows);
  amRenderTable("amPaxResult", paxHeaders, rows);
  $("amPaxDownload").disabled = !rows.length;
}
$("amPaxParse").addEventListener("click", amRunPax);
$("amPaxClear").addEventListener("click", function(){
  $("amPaxInput").value = ""; AM.paxRows = []; AM.paxCsv = "";
  $("amPaxResult").innerHTML = '<div class="empty">No result yet.</div>';
  $("amPaxDownload").disabled = true;
});
$("amPaxDownload").addEventListener("click", function(){ downloadText(AM.paxCsv, "PAXLST_output.csv"); });
$("amPaxFile").addEventListener("change", function(e){
  var f = e.target.files[0]; if(!f) return;
  var r = new FileReader();
  r.onload = function(ev){ $("amPaxInput").value = ev.target.result; amRunPax(); };
  r.readAsText(f); e.target.value = "";
});

/* ---------- PNL ---------- */
$("amPnlTemplateCsv").addEventListener("click", function(){
  downloadText("﻿"+PNL_TEMPLATE_CSV.replace(/\n/g,"\r\n")+"\r\n", "PNL_Builder_Template.csv");
});
$("amPnlTemplateXlsx").addEventListener("click", function(){
  var rows = pnlTemplateRows();
  var headers = Object.keys(rows[0]||{});
  downloadXlsx("PNL Template", headers, rows.map(function(r){ return headers.map(function(h){ return r[h]; }); }), "PNL_Builder_Template.xlsx");
});
function amLoadPnlFile(file){
  var status = $("amPnlStatus");
  if(!file){ status.textContent = "No passenger file selected."; status.style.color = "var(--red)"; return; }
  var isXlsx = /\.xlsx$/i.test(file.name);
  var p = isXlsx ? parseXlsx(file) : file.text().then(parseDelimited);
  p.then(function(rows){
    validatePnlRows(rows);
    AM.pnlRows = rows;
    status.textContent = "Loaded "+rows.length+" document rows.";
    status.style.color = "var(--green)";
  }).catch(function(e){
    AM.pnlRows = [];
    status.textContent = e.message;
    status.style.color = "var(--red)";
  });
}
$("amPnlFile").addEventListener("change", function(e){ amLoadPnlFile(e.target.files[0]); e.target.value = ""; });
function amBuildPnl(){
  var status = $("amPnlStatus");
  try{
    var result = buildPnl(AM.pnlRows, {
      airline: $("amAirline").value.trim().toUpperCase(),
      flight: $("amFlight").value.trim().toUpperCase(),
      date: $("amFlightDate").value,
      origin: $("amOrigin").value.trim().toUpperCase(),
      destination: $("amDestination").value.trim().toUpperCase(),
      defaultClass: ($("amDefaultClass").value||"Y").trim().toUpperCase()
    });
    AM.pnlText = result.text;
    $("amPnlOutput").value = result.text;
    $("amPnlCopy").disabled = false; $("amPnlDownload").disabled = false;
    $("amPnlMetrics").innerHTML = [
      [result.passengers,"Passengers"], [result.documents,"Document rows"],
      [result.classes,"Booking classes"], [flightDateDDMMM($("amFlightDate").value),"Flight date"]
    ].map(function(m){ return '<div class="stat"><div class="v">'+esc(m[0])+'</div><div class="l">'+esc(m[1])+'</div></div>'; }).join("");
    status.textContent = "PNL created successfully."; status.style.color = "var(--green)";
  } catch(e){
    status.textContent = e.message; status.style.color = "var(--red)";
  }
}
$("amPnlBuild").addEventListener("click", amBuildPnl);
$("amPnlClear").addEventListener("click", function(){
  AM.pnlRows = []; AM.pnlText = "";
  $("amPnlFile").value = ""; $("amPnlOutput").value = ""; $("amPnlStatus").textContent = "";
  $("amPnlMetrics").innerHTML = ""; $("amPnlCopy").disabled = true; $("amPnlDownload").disabled = true;
});
$("amPnlCopy").addEventListener("click", function(){
  if(!AM.pnlText) return;
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(AM.pnlText);
  else { var ta=$("amPnlOutput"); ta.focus(); ta.select(); document.execCommand("copy"); }
});
$("amPnlDownload").addEventListener("click", function(){ downloadText(AM.pnlText, "PNL.txt"); });

var amFlightField = $("amFlight");
amFlightField.addEventListener("input", function(){
  this.value = this.value.toUpperCase().replace(/[^0-9A-Z]/g,"").slice(0,4);
});
amFlightField.addEventListener("blur", function(){
  if(this.value){ try{ this.value = normalizeFlightNumber(this.value); } catch(e){} }
});
