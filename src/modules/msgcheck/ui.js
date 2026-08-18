/* ============================================================================
   MESSAGE VALIDATOR — UI
   ============================================================================ */
var SEV_LABEL = { err:"ERROR", warn:"WARNING", info:"INFO" };
var sevFilter = "all";
var lastFindings = [];

var liveOn = false;         // starts after the first manual validation
function runValidation(keepFilter){
  var raw = $("msgInput").value.replace(/\r/g,"");
  if(!raw.trim()){
    $("summary").hidden = true;
    $("findings").innerHTML = '<div class="empty">The message is empty.</div>';
    $("telex").innerHTML = '<div class="empty">The validated message is printed here.</div>';
    lastFindings = []; return;
  }
  lastFindings = validate(raw);
  lastFindings.forEach(function(f,i){ f._i = i; });   // stable id for cross-linking
  if(!keepFilter) sevFilter = "all";
  renderSummary(); renderFindings(); renderTelex(raw);
  var rb = $("btnReport"); if(rb) rb.hidden = false;
  var tc = $("btnTelexCopy"); if(tc) tc.hidden = false;
  liveOn = true;
  $("liveFlag").textContent = "live";
}

/* re-validate shortly after typing stops, keeping the active severity tab */
var liveTimer = null;
$("msgInput").addEventListener("input", function(){
  if(!liveOn) return;
  clearTimeout(liveTimer);
  $("liveFlag").textContent = "typing…";
  liveTimer = setTimeout(function(){ runValidation(true); }, 450);
});

function renderSummary(){
  var f = lastFindings.filter(function(x){return !x.dup;});
  var e = f.filter(function(x){return x.sev==="err";}).length;
  var w = f.filter(function(x){return x.sev==="warn";}).length;
  var i = f.filter(function(x){return x.sev==="info";}).length;
  var s = $("summary"); s.hidden = false;
  if(e+w+i===0){
    sevFilter = "all";
    s.innerHTML = '<div class="ok-banner">&#10003; NO EXCEPTIONS — COMPLIANT</div>';
    return;
  }
  var counts = { all:e+w+i, err:e, warn:w, info:i };
  if(counts[sevFilter]===0) sevFilter = "all";
  function tab(key, cls, label){
    var n = counts[key];
    return '<button class="tab '+cls+'" data-sev="'+key+'" role="tab" aria-selected="'+(sevFilter===key)+'"'+
      (n===0?" disabled":"")+'>'+label+'</button>';
  }
  s.innerHTML = '<div class="tabs" role="tablist">'+
    tab("all","all","All ("+counts.all+")")+
    tab("err","err",e+" error"+(e!==1?"s":""))+
    tab("warn","warn",w+" warning"+(w!==1?"s":""))+
    tab("info","info",i+" info")+
    '</div>';
  Array.prototype.forEach.call(s.querySelectorAll(".tab"), function(b){
    b.addEventListener("click", function(){
      if(b.disabled) return;
      sevFilter = b.getAttribute("data-sev");
      renderSummary(); renderFindings();
    });
  });
}

function renderFindings(){
  var box = $("findings");
  var all = lastFindings.filter(function(x){return !x.dup;});
  if(all.length===0){
    box.innerHTML = '<div class="empty">&#10003; No issues found — message compliant with the IATA standard.</div>';
    return;
  }
  var list = sevFilter==="all" ? all : all.filter(function(x){return x.sev===sevFilter;});
  if(list.length===0){ box.innerHTML = '<div class="empty">No entries in this category.</div>'; return; }
  box.innerHTML = '<div class="findings">' + list.map(function(f){
    return '<div class="finding '+f.sev+'" data-f="'+f._i+'" data-line="'+f.line+'" '+
      'title="Select to jump to this spot in the telex printout">'+
      '<span class="loc">L'+f.line+':'+f.col+' <span class="jump">&#8629;</span></span>'+
      '<span class="msg"><b class="lvl">'+SEV_LABEL[f.sev]+'</b> — '+f.msg+
      (f.ref? '<span class="ref">'+esc(f.ref)+'</span>' : '')+
      '</span></div>';
  }).join("") + '</div>';
}

function renderTelex(raw){
  var lines = raw.split("\n");
  var byLine = {};
  lastFindings.forEach(function(f){
    (byLine[f.line] = byLine[f.line] || []).push(f);
  });
  var ruler = "";
  for(var c=1;c<=64;c++){
    if(c%10===0) ruler += "<b>"+(c/10)+"</b>";
    else if(c%5===0) ruler += "&middot;";
    else ruler += " ";
  }
  var rank = { err:3, warn:2, info:1 };
  var html = '<div class="ruler">'+ruler+'</div>';
  lines.forEach(function(text, idx){
    var marks = byLine[idx+1] || [];
    var body;
    if(!marks.length){ body = esc(text) || "&nbsp;"; }
    else {
      var per = new Array(Math.max(text.length,1));
      var tip = new Array(Math.max(text.length,1));
      var ref = new Array(Math.max(text.length,1));
      marks.forEach(function(m){
        var len = m.len || 1;
        for(var k=m.col-1; k<m.col-1+len; k++){
          if(k<0 || k>=per.length) continue;
          if(!per[k] || rank[m.sev] > rank[per[k]]){
            per[k] = m.sev; tip[k] = m.msg.replace(/<[^>]+>/g,""); ref[k] = m._i;
          }
        }
      });
      var chars = (text.length? text : " ").split("");
      var out = "", i2 = 0;
      while(i2 < chars.length){
        var sev = per[i2], j = i2;
        while(j<chars.length && per[j]===sev) j++;
        var seg = esc(chars.slice(i2,j).join(""));
        out += sev
          ? '<mark class="'+sev+'" data-f="'+(ref[i2]==null?"":ref[i2])+'" data-tip="'+esc(tip[i2]||"")+'">'+seg+'</mark>'
          : seg;
        i2 = j;
      }
      body = out;
    }
    html += '<div class="row" data-line="'+(idx+1)+'"><span class="n">'+(idx+1)+'</span><span class="t" contenteditable="true" spellcheck="false" autocorrect="off" autocapitalize="off">'+body+'</span></div>';
  });
  $("telex").innerHTML = html;
}

/* ---------- cross-navigation: findings <-> telex ---------- */
function flash(el){
  if(!el) return;
  el.classList.add("flash");
  setTimeout(function(){ el.classList.remove("flash"); }, 1500);
}
/* place the caret on the offending characters so the fix can be typed right away */
function jumpToInput(f){
  var ta = $("msgInput");
  var lines = ta.value.replace(/\r/g,"").split("\n");
  if(f.line < 1 || f.line > lines.length) return;
  var start = 0;
  for(var i=0; i<f.line-1; i++) start += lines[i].length + 1;
  start += Math.max(0, f.col - 1);
  var len = Math.max(1, f.len || 1);
  var lineLen = lines[f.line-1].length;
  var end = Math.min(start + len, start + Math.max(0, lineLen - (f.col-1)));
  if(end <= start) end = start;
  ta.focus();
  try { ta.setSelectionRange(start, end); } catch(e){}
  // centre the line vertically inside the textarea
  var cs = window.getComputedStyle(ta);
  var lh = parseFloat(cs.lineHeight);
  if(isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.6;
  ta.scrollTop = Math.max(0, (f.line - 1) * lh - ta.clientHeight/2 + lh/2);
  ta.scrollIntoView({block:"nearest", behavior:"smooth"});
}

function jumpToTelex(f){
  var tel = $("telex");
  var row = tel.querySelector('.row[data-line="'+f.line+'"]');
  if(!row) return;
  // "nearest" only scrolls the minimum needed to bring the row into view — if
  // it's already visible (or close to the top/bottom), nothing jumps. "center"
  // would always force the row to the exact middle of the screen, which for a
  // finding near the start of the message drags the whole page up to the top.
  row.scrollIntoView({block:"nearest", behavior:"smooth"});
  flash(row);
  var mk = row.querySelector('mark[data-f="'+f._i+'"]') || row.querySelector("mark");
  if(mk && tel.scrollWidth > tel.clientWidth){
    tel.scrollLeft = Math.max(0, mk.offsetLeft - tel.clientWidth/2);
  }
}
function jumpToFinding(idx){
  var f = lastFindings[idx];
  if(!f) return;
  if(f.dup){
    // Deduped marks are not listed on their own. Tagged families (unknown SSR,
    // unknown element, trailing spaces…) collapse into one entry we can point at;
    // the aggregate checks (duplicate seat, reused group, repeated passenger)
    // carry no tag, so there is nothing reliable to jump to — the tooltip already
    // carries the full text.
    if(!f.tag) return;
    var principal = lastFindings.filter(function(x){
      return !x.dup && x.tag===f.tag && x.code===f.code; })[0];
    if(!principal) return;
    f = principal;
  }
  if(sevFilter !== "all" && sevFilter !== f.sev){ sevFilter = "all"; renderSummary(); renderFindings(); }
  var row = $("findings").querySelector('.finding[data-f="'+f._i+'"]');
  if(row){ row.scrollIntoView({block:"center", behavior:"smooth"}); flash(row); }
}

/* ---------- tooltip that also works on touch ---------- */
var tipEl = null;
function showTip(target, text){
  if(!tipEl){
    tipEl = document.createElement("div");
    tipEl.className = "tipbox";
    document.body.appendChild(tipEl);
  }
  tipEl.textContent = text;
  tipEl.style.display = "block";
  var r = target.getBoundingClientRect();
  var top = r.bottom + 8 + window.pageYOffset;
  tipEl.style.top = top + "px";
  tipEl.style.left = "0px";
  var w = tipEl.offsetWidth;
  var left = r.left + r.width/2 - w/2 + window.pageXOffset;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  tipEl.style.left = left + "px";
}
function hideTip(){ if(tipEl) tipEl.style.display = "none"; }

function jumpToTelexCaret(f){
  // Place the editing cursor in the telex at the exact column of the finding.
  var tel = $("telex");
  var row = tel.querySelector('.row[data-line="'+f.line+'"]');
  if(!row) return;
  var t = row.querySelector(".t");
  if(!t) return;
  telexEditRow = f.line;
  telexEditOffset = Math.max(0, (f.col||1) - 1);
  t.focus();
  setCaretOffset(t, telexEditOffset);
  telexEditRow = null;
}

$("findings").addEventListener("click", function(e){
  var row = e.target.closest ? e.target.closest(".finding") : null;
  if(!row) return;
  var f = lastFindings[+row.getAttribute("data-f")];
  if(!f) return;
  jumpToTelex(f);       // scroll + flash
  jumpToTelexCaret(f);  // place cursor in the telex row, ready to edit
});
$("telex").addEventListener("click", function(e){
  var mk = e.target.closest ? e.target.closest("mark") : null;
  if(!mk) return;
  showTip(mk, mk.getAttribute("data-tip") || "");
  var idx = mk.getAttribute("data-f");
  if(idx !== "" && idx != null){
    jumpToFinding(+idx);
    // No longer redirect focus to msgInput — the telex is editable directly.
  }
});
$("telex").addEventListener("mouseover", function(e){
  var mk = e.target.closest ? e.target.closest("mark") : null;
  if(mk) showTip(mk, mk.getAttribute("data-tip") || "");
});
$("telex").addEventListener("mouseout", function(e){
  if(e.target.closest && e.target.closest("mark")) hideTip();
});
document.addEventListener("click", function(e){
  if(tipEl && !(e.target.closest && e.target.closest("mark"))) hideTip();
});

/* ---------- telex inline editing ---------- */
var telexEditRow = null, telexEditOffset = 0, telexLiveTimer = null;

function getCaretOffset(el){
  if(!el || !window.getSelection) return 0;
  var sel = window.getSelection();
  if(!sel || !sel.rangeCount) return 0;
  var range = sel.getRangeAt(0).cloneRange();
  range.setStart(el, 0);
  return range.toString().length;
}

function setCaretOffset(el, offset){
  if(!el || !window.getSelection) return;
  el.focus();
  var NF = (typeof NodeFilter !== "undefined") ? NodeFilter.SHOW_TEXT : 4;
  var walker = document.createTreeWalker(el, NF, null, false);
  var rem = offset, node;
  while((node = walker.nextNode())){
    if(rem <= node.nodeValue.length){
      var r = document.createRange();
      r.setStart(node, rem); r.collapse(true);
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(r); return;
    }
    rem -= node.nodeValue.length;
  }
  var r = document.createRange();
  r.selectNodeContents(el); r.collapse(false);
  var sel = window.getSelection();
  sel.removeAllRanges(); sel.addRange(r);
}

function telexLinesToMsgInput(){
  var rows = $("telex").querySelectorAll(".row");
  var lines = Array.prototype.map.call(rows, function(r){
    return (r.querySelector(".t") || {}).textContent || "";
  });
  $("msgInput").value = lines.join("\n");
}

function restoreTelexCaret(){
  if(telexEditRow === null) return;
  var row = $("telex").querySelector('.row[data-line="'+telexEditRow+'"]');
  var savedRow = telexEditRow, savedOff = telexEditOffset;
  telexEditRow = null;
  if(!row) return;
  var t = row.querySelector(".t");
  if(!t) return;
  setCaretOffset(t, savedOff);
}

$("telex").addEventListener("input", function(e){
  var t = e.target.closest ? e.target.closest(".t") : null;
  if(!t || !t.getAttribute("contenteditable")) return;
  var row = t.parentElement;
  telexEditRow = +row.getAttribute("data-line");
  telexEditOffset = getCaretOffset(t);
  telexLinesToMsgInput();
  clearTimeout(telexLiveTimer);
  $("liveFlag").textContent = "typing…";
  telexLiveTimer = setTimeout(function(){
    runValidation(true);
    restoreTelexCaret();
  }, 450);
});

$("telex").addEventListener("keydown", function(e){
  var t = e.target.closest ? e.target.closest(".t") : null;
  if(!t || !t.getAttribute("contenteditable")) return;
  if(e.key === "Enter"){
    e.preventDefault();
    var row = t.parentElement;
    var lineN = +row.getAttribute("data-line");
    var offset = getCaretOffset(t);
    var lineText = t.textContent;
    var rows = $("telex").querySelectorAll(".row");
    var lines = Array.prototype.map.call(rows, function(r){
      return (r.querySelector(".t") || {}).textContent || "";
    });
    lines[lineN-1] = lineText.slice(0, offset);
    lines.splice(lineN, 0, lineText.slice(offset));
    $("msgInput").value = lines.join("\n");
    telexEditRow = lineN + 1; telexEditOffset = 0;
    clearTimeout(telexLiveTimer);
    runValidation(true); restoreTelexCaret();
  }
  if(e.key === "Backspace"){
    // if caret is at col 0, merge with the previous row
    var row = t.parentElement;
    var lineN = +row.getAttribute("data-line");
    if(lineN <= 1) return;
    if(getCaretOffset(t) === 0){
      e.preventDefault();
      var rows = $("telex").querySelectorAll(".row");
      var lines = Array.prototype.map.call(rows, function(r){
        return (r.querySelector(".t") || {}).textContent || "";
      });
      var prevLen = lines[lineN-2].length;
      lines[lineN-2] = lines[lineN-2] + lines[lineN-1];
      lines.splice(lineN-1, 1);
      $("msgInput").value = lines.join("\n");
      telexEditRow = lineN - 1; telexEditOffset = prevLen;
      clearTimeout(telexLiveTimer);
      runValidation(true); restoreTelexCaret();
    }
  }
});

$("telex").addEventListener("paste", function(e){
  var t = e.target.closest ? e.target.closest(".t") : null;
  if(!t || !t.getAttribute("contenteditable")) return;
  e.preventDefault();
  var text = (e.clipboardData || window.clipboardData).getData("text/plain");
  if(!text) return;
  var row = t.parentElement;
  var lineN = +row.getAttribute("data-line");
  var offset = getCaretOffset(t);
  var lineText = t.textContent;
  var rows = $("telex").querySelectorAll(".row");
  var lines = Array.prototype.map.call(rows, function(r){
    return (r.querySelector(".t") || {}).textContent || "";
  });
  var pasteLines = text.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split("\n");
  var before = lineText.slice(0, offset);
  var after  = lineText.slice(offset);
  var newLines = [before + pasteLines[0]].concat(pasteLines.slice(1));
  newLines[newLines.length-1] += after;
  lines.splice.apply(lines, [lineN-1, 1].concat(newLines));
  $("msgInput").value = lines.join("\n");
  telexEditRow = lineN + pasteLines.length - 1;
  telexEditOffset = (before + pasteLines[0]).length +
    (pasteLines.length > 1 ? pasteLines.slice(1, -1).reduce(function(s,l){ return s+l.length; }, 0) +
    pasteLines[pasteLines.length-1].length : 0);
  clearTimeout(telexLiveTimer);
  runValidation(true); restoreTelexCaret();
});

$("btnValidate").addEventListener("click", function(){ runValidation(false); });
$("btnExample").addEventListener("click", function(){
  $("msgInput").value = EX_BY_TYPE[$("msgtype").value] || EX_OK;
  if(liveOn){ runValidation(false); return; }
  if(liveOn){ runValidation(false); return; }
  $("summary").hidden = true;
  $("findings").innerHTML = '<div class="empty">Paste a message and select <b>Validate</b>.</div>';
  $("telex").innerHTML = '<div class="empty">The validated message is printed here.</div>';
});
$("btnExampleBad").addEventListener("click", function(){
  var t = $("msgtype").value;
  $("msgInput").value = (typeof EX_BAD_BY_TYPE !== "undefined" && EX_BAD_BY_TYPE[t]) || EX_BAD;
  $("summary").hidden = true;
  $("findings").innerHTML = '<div class="empty">Paste a message and select <b>Validate</b>.</div>';
  $("telex").innerHTML = '<div class="empty">The validated message is printed here.</div>';
});
$("btnClear").addEventListener("click", function(){
  $("msgInput").value = ""; $("summary").hidden = true; lastFindings = []; sevFilter = "all";
  liveOn = false; $("liveFlag").textContent = "";
  $("findings").innerHTML = '<div class="empty">Paste a message and select <b>Validate</b>.</div>';
  $("telex").innerHTML = '<div class="empty">The validated message is printed here.</div>';
  var tc = $("btnTelexCopy"); if(tc){ tc.hidden = true; }
});

/* --- Copy message button (telex) --- */
$("btnTelexCopy") && $("btnTelexCopy").addEventListener("click", function(){
  var text = $("msgInput").value;
  if(!text) return;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){
      var btn = $("btnTelexCopy");
      var prev = btn.innerHTML;
      btn.innerHTML = "&#10003; Copied";
      btn.disabled = true;
      setTimeout(function(){ btn.innerHTML = prev; btn.disabled = false; }, 1500);
    });
  } else {
    // fallback: select msgInput and copy
    var ta = $("msgInput");
    ta.select();
    document.execCommand("copy");
  }
});

