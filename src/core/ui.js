
/* ============================================================================
   SHARED UI HELPERS — used by several modules, so they live in core rather
   than inside whichever module happened to need them first.
   ============================================================================ */
function showTextModal(title, content, filename){
  var host = $("modalHost");
  host.innerHTML = '<div class="modal-back"><div class="modal">'+
    '<div class="mh"><b>'+esc(title)+'</b><button class="btn small quiet" data-act="close-modal">Close</button></div>'+
    '<div class="mb"><p class="note">Use <b>Download</b>, or select the text and copy it into a <b>'+
      esc((filename||"file").split(".").pop())+'</b> file.</p>'+
    '<textarea id="modalText" spellcheck="false"></textarea>'+
    '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">'+
      '<button class="btn small primary" data-act="dl-file" data-name="'+esc(filename||"export.txt")+'">&#8595; Download</button>'+
      '<button class="btn small" data-act="select-all">&#128203; Select all</button>'+
    '</div></div></div></div>';
  $("modalText").value = content;
  host.querySelector('[data-act="close-modal"]').addEventListener("click", function(){ host.innerHTML=""; });
  host.querySelector('[data-act="select-all"]').addEventListener("click", function(){
    var t=$("modalText"); t.focus(); t.select();
  });
  host.querySelector('[data-act="dl-file"]').addEventListener("click", function(){
    downloadText($("modalText").value, filename||"export.txt");
  });
  host.querySelector(".modal-back").addEventListener("click", function(e){
    if(e.target===this) host.innerHTML="";
  });
}
function downloadText(text, filename){
  try{
    var blob = new Blob([text], {type:"text/plain;charset=utf-8"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  } catch(e){ alert("Download not available here — select the text and copy it instead."); }
}
