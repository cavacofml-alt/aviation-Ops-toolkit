
/* ============================================================================
   UI — reconcile, PNL builder, findings report
   ============================================================================ */

/* ---------- reconcile ---------- */
var RECON_EXAMPLE = [
  "PNL","TP1234/16JUL LIS PART1","-OPO03Y",
  "1ALMEIDA/RUIMR .L/A1B2C3",
  "2COSTA/ANAMRS/TIAGOMSTR .R/CHLD HK1 12MAY19-1COSTA/TIAGOMSTR",
  "-FAO02Y",
  "1BRAGA/LUISAMS .R/WCHR HK1",
  "1DUARTE/CARLOSMR .L/X9Y8Z7",
  "ENDPNL",
  "ADL","TP1234/16JUL LIS PART1","-OPO02Y","DEL",
  "1ALMEIDA/RUIMR",
  "ADD",
  "1MOTA/INESMS .R/VGML HK1",
  "ENDADL",
  "ADL","TP1234/16JUL LIS PART1","-FAO02Y","CHG",
  "1BRAGA/LUISAMS .R/WCHC HK1",
  "ENDADL"
].join("\n");

function renderRecon(r){
  var box = $("reconOut");
  if(r.error){ box.innerHTML = '<div class="empty">'+esc(r.error)+'</div>'; return; }

  var destRows = Object.keys(r.byDest).sort().map(function(k){
    var d = r.byDest[k], dec = r.declared[k];
    var total = d.pax + d.nonames;
    var match = (dec === undefined) ? "" :
      (dec === total ? '<span style="color:var(--green)">matches</span>'
                     : '<span style="color:var(--amber)">telex says '+dec+'</span>');
    return '<tr><td class="mini">'+esc(k)+'</td><td class="mini">'+d.pax+'</td>'+
      '<td class="mini">'+(d.nonames||"—")+'</td><td class="mini">'+total+'</td>'+
      '<td class="mini">'+match+'</td></tr>';
  }).join("");

  var ssrRows = Object.keys(r.ssr).sort().map(function(c){
    return '<span class="tag" style="color:var(--cyan);margin:0 6px 6px 0">'+esc(c)+' &times;'+r.ssr[c]+'</span>';
  }).join("") || '<span class="note">none</span>';

  var paxRows = r.list.map(function(p){
    var ssrs = p.els.filter(function(e){ return /^\.R\//.test(e); })
                    .map(function(e){ return e.replace(/^\.R\//,"").split(" ")[0]; });
    var pnr = (p.els.filter(function(e){ return /^\.L\//.test(e); })[0]||"").replace(/^\.L\//,"");
    return '<tr><td class="mini">'+esc(p.dest||"?")+'/'+esc(p.cls||"?")+'</td>'+
      '<td><b>'+esc(p.surname)+'</b>/'+esc(p.given)+'</td>'+
      '<td class="mini">'+esc(pnr||"—")+'</td>'+
      '<td class="mini">'+(ssrs.length? ssrs.map(function(s){
        return '<span class="tag" style="color:var(--cyan)">'+esc(s)+'</span>'; }).join(" ") : "—")+'</td></tr>';
  }).join("");

  var logRows = r.log.map(function(l){
    var cls = /removed/.test(l.action) ? "del" : /changed/.test(l.action) ? "chg"
            : l.section==="BASE"||l.section==="PNL" ? "base" : "add";
    return '<tr><td class="mini">'+esc(l.msg)+'</td>'+
      '<td><span class="tag '+cls+'">'+esc(l.section)+'</span></td>'+
      '<td class="mini">'+esc(l.action)+(l.by?' <span class="note">(by '+esc(l.by)+')</span>':'')+'</td>'+
      '<td>'+esc(l.who)+(l.pnr?' <span class="tag" style="color:var(--dim)">'+esc(l.pnr)+'</span>':'')+'</td></tr>';
  }).join("");

  box.innerHTML =
    '<div class="result-grid">'+
      '<div class="result-box"><h4>Flight</h4><div style="font-size:17px;font-weight:600">'+
        esc(r.flights.join(", ")||"—")+'</div><div class="note">'+r.messages+' messages · '+
        r.counts.pnl+' PNL, '+r.counts.adl+' ADL</div></div>'+
      '<div class="result-box"><h4>Final list</h4><div style="font-size:28px;font-weight:700;color:var(--cyan);font-family:var(--mono)">'+
        r.list.length+'</div><div class="note">named passengers after every change</div></div>'+
      '<div class="result-box"><h4>Special services</h4><div style="margin-top:4px">'+ssrRows+'</div></div>'+
    '</div>'+
    (r.warnings.length ?
      '<div class="warnbox"><b>&#9888; '+r.warnings.length+' point'+(r.warnings.length!==1?"s":"")+' to check</b>'+
      '<ul style="margin:8px 0 0 18px;padding:0;color:var(--dim);font-size:12.5px;line-height:1.7">'+
      r.warnings.map(function(w){ return '<li>'+esc(w)+'</li>'; }).join("")+'</ul></div>' : '')+

    '<div class="sec mt">Totals by destination</div>'+
    '<div style="border:1px solid var(--line);border-radius:var(--radius);overflow:hidden">'+
    '<table><thead><tr><th>Dest/Class</th><th>Named</th><th>NONAMES</th><th>Total</th><th>Against telex</th></tr></thead>'+
    '<tbody>'+destRows+'</tbody></table></div>'+

    '<div class="sec mt">Final passenger list</div>'+
    '<div style="border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;max-height:420px;overflow-y:auto">'+
    '<table><thead><tr><th>Dest</th><th>Name</th><th>PNR</th><th>Services</th></tr></thead>'+
    '<tbody>'+(paxRows||'<tr><td colspan="4" class="note">No passengers left after the changes.</td></tr>')+'</tbody></table></div>'+

    '<div class="sec mt">What each message did</div>'+
    '<div style="border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;max-height:340px;overflow-y:auto">'+
    '<table><thead><tr><th>Message</th><th>Section</th><th>Action</th><th>Passenger</th></tr></thead>'+
    '<tbody>'+logRows+'</tbody></table></div>'+

    '<div class="controls"><button class="btn small" id="btnReconExport">&#8595; Export list</button></div>';

  var ex = document.getElementById("btnReconExport");
  if(ex) ex.addEventListener("click", function(){
    var out = ["Dest,Class,Surname,Given,PNR,Services"];
    r.list.forEach(function(p){
      var ssrs = p.els.filter(function(e){ return /^\.R\//.test(e); })
                      .map(function(e){ return e.replace(/^\.R\//,"").split(" ")[0]; }).join(" ");
      var pnr = (p.els.filter(function(e){ return /^\.L\//.test(e); })[0]||"").replace(/^\.L\//,"");
      out.push([p.dest||"",p.cls||"",p.surname,p.given,pnr,ssrs].join(","));
    });
    showTextModal("Final passenger list", out.join("\n"), "final-list.csv");
  });
}

$("btnRecon").addEventListener("click", function(){
  renderRecon(reconcile($("reconInput").value));
});
$("btnReconExample").addEventListener("click", function(){
  $("reconInput").value = RECON_EXAMPLE;
  renderRecon(reconcile(RECON_EXAMPLE));
});
$("btnReconClear").addEventListener("click", function(){
  $("reconInput").value = ""; $("reconOut").innerHTML = "";
});

