/* ============================================================================
   FINDINGS REPORT — something you can paste into an email
   ============================================================================ */
function buildReport(raw, findings){
  var shown = findings.filter(function(f){ return !f.dup; });
  var e = shown.filter(function(f){ return f.sev==="err"; }).length;
  var w = shown.filter(function(f){ return f.sev==="warn"; }).length;
  var i = shown.filter(function(f){ return f.sev==="info"; }).length;
  var lines = raw.replace(/\r/g,"").split("\n");

  // identify the message for the header
  var type = "", flight = "";
  lines.forEach(function(l){
    var t = l.trim().toUpperCase();
    if(!type && /^(PNL|ADL|PSM|PTM|PFS|PIL|SOM|SPM|FTL|PRL|ETL|MVT|DIV|SSM|ASM)$/.test(t)) type = t;
    if(!flight){
      var m = t.match(/^([A-Z]{2}[A-Z0-9]?\d{1,4}[A-Z]?\/\d{2}[A-Z]{3}(?:\s+[A-Z]{3})?)/);
      if(m && type) flight = m[1];
    }
  });

  var out = [];
  out.push("IATA MESSAGE VALIDATION REPORT");
  out.push("==============================");
  out.push("Message type : " + (type || "not identified"));
  if(flight) out.push("Flight       : " + flight);
  out.push("Checked      : " + new Date().toLocaleString());
  out.push("Result       : " + e + " error(s), " + w + " warning(s), " + i + " advisory");
  out.push("");
  if(!shown.length){
    out.push("No issues found — the message complies with the standard.");
  } else {
    ["err","warn","info"].forEach(function(sev){
      var group = shown.filter(function(f){ return f.sev===sev; });
      if(!group.length) return;
      out.push(({err:"ERRORS", warn:"WARNINGS", info:"ADVISORY"})[sev] + " (" + group.length + ")");
      out.push("-".repeat(60));
      group.forEach(function(f){
        var src = lines[f.line-1] || "";
        out.push("Line " + f.line + ", column " + f.col);
        out.push("  " + src.trim());
        out.push("  " + " ".repeat(Math.max(0, f.col-1)) + "^");
        out.push("  " + f.msg.replace(/<[^>]+>/g, ""));
        if(f.ref) out.push("  Reference: " + f.ref);
        out.push("");
      });
    });
  }
  out.push("");
  out.push("Checked against PSCRM 30th Edition (RP 1707b / 1708 and related) and");
  out.push("AIRIMP 34th Edition. Rules are applied as validation logic; no part of");
  out.push("the manuals is reproduced here.");
  return out.join("\n");
}

/* ---------- wiring ---------- */
$("btnReport").addEventListener("click", function(){
  var raw = $("msgInput").value.replace(/\r/g,"");
  if(!lastFindings.length && !raw.trim()) return;
  showTextModal("Validation report", buildReport(raw, lastFindings), "validation-report.txt");
});
