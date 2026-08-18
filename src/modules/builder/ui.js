
/* ============================================================================
   PNL BUILDER — UI
   ============================================================================ */
/* ---------- PNL builder ---------- */
var CSV_EXAMPLE = [
  "Surname,Given name,Title,Destination,Class,PNR,SSR,Seat",
  "Silva,Joao,MR,OPO,Y,ABC123,VGML,12A",
  "Silva,Maria,MRS,OPO,Y,ABC123,,12B",
  "Almeida,Rui,MR,OPO,Y,,WCHR,",
  "Braga,Luisa,MS,FAO,Y,XYZ789,,",
  "Costa,Ana,MRS,FAO,J,,KSML,"
].join("\n");

function runBuild(){
  var flight = ($("bFlight").value||"").trim().toUpperCase() + "/" +
               ($("bDate").value||"").trim().toUpperCase() + " " +
               ($("bOrigin").value||"").trim().toUpperCase() +
               " PART" + (parseInt($("bPart").value,10) || 1);
  var r = buildPNL(parseCSV($("csvInput").value), {
    flight: flight, defaultCls: ($("bCls").value||"Y").trim().toUpperCase()
  });
  var box = $("buildOut");
  if(r.error){
    box.innerHTML = '<div class="warnbox" style="border-color:var(--red);background:var(--red-soft);color:var(--red)">'+
      esc(r.error)+'</div>';
    return;
  }
  // the generator is judged by our own validator — no special treatment
  var findings = validate(r.text).filter(function(f){ return !f.dup; });
  var errs = findings.filter(function(f){ return f.sev==="err"; });

  box.innerHTML =
    '<div class="sec mt">Generated message</div>'+
    '<div class="telex" style="max-height:360px;overflow:auto">'+
      r.text.split("\n").map(function(l,i){
        return '<div class="row"><span class="n">'+(i+1)+'</span><span class="t">'+esc(l)+'</span></div>';
      }).join("")+
    '</div>'+
    '<div class="controls">'+
      '<button class="btn primary" id="btnBuildCopy">&#8595; Export message</button>'+
      '<button class="btn" id="btnBuildToValidator">Open in validator</button>'+
      '<span class="note">'+r.count+' passengers · '+r.text.split("\\n").length+' lines</span>'+
    '</div>'+
    '<div style="margin-top:6px" class="'+(errs.length?'warnbox':'')+'">'+
      (findings.length===0
        ? '<span style="color:var(--green);font-family:var(--mono);font-size:12px">&#10003; CHECKED AGAINST THE VALIDATOR — NO FINDINGS</span>'
        : '<b>'+findings.length+' finding'+(findings.length!==1?"s":"")+' from the validator:</b>'+
          '<ul style="margin:8px 0 0 18px;padding:0;font-size:12.5px;line-height:1.7">'+
          findings.slice(0,10).map(function(f){
            return '<li>L'+f.line+': '+esc(f.msg.replace(/<[^>]+>/g,""))+'</li>'; }).join("")+'</ul>')+
    '</div>'+
    (r.problems.length ?
      '<div class="warnbox"><b>Rows needing attention</b><ul style="margin:8px 0 0 18px;padding:0;font-size:12.5px;line-height:1.7">'+
      r.problems.map(function(p){ return '<li>'+esc(p)+'</li>'; }).join("")+'</ul></div>' : '');

  document.getElementById("btnBuildCopy").addEventListener("click", function(){
    showTextModal("Generated PNL", r.text, "pnl.txt");
  });
  document.getElementById("btnBuildToValidator").addEventListener("click", function(){
    $("msgInput").value = r.text;
    openTool("msgcheck");
    runValidation(false);
  });
}
$("btnBuild").addEventListener("click", runBuild);
$("btnCsvExample").addEventListener("click", function(){ $("csvInput").value = CSV_EXAMPLE; runBuild(); });
$("btnBuildClear").addEventListener("click", function(){ $("csvInput").value = ""; $("buildOut").innerHTML = ""; });
$("csvFile").addEventListener("change", function(e){
  var f = e.target.files[0]; if(!f) return;
  var rd = new FileReader();
  rd.onload = function(ev){ $("csvInput").value = ev.target.result; runBuild(); };
  rd.readAsText(f);
  e.target.value = "";
});
