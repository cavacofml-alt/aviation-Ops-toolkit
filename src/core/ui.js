
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
function downloadBytes(bytes, filename, mime){
  try{
    var blob = new Blob([bytes], {type: mime || "application/octet-stream"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  } catch(e){ alert("Download not available here."); }
}

/* ============================================================================
   Minimal .xlsx writer — a real Excel workbook (typed cells, no delimiter
   to guess) built from a header row + array-of-arrays, so opening it never
   depends on the OS's regional list-separator the way a raw .csv does.
   Numbers are written as numeric cells; everything else as inline strings.
   ============================================================================ */
function xlsxEsc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function xlsxColLetter(n){
  var s = "";
  while(n > 0){ var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}
function xlsxCell(val, colIdx, rowIdx){
  var ref = xlsxColLetter(colIdx + 1) + rowIdx;
  if(typeof val === "number" && isFinite(val)) return '<c r="'+ref+'"><v>'+val+'</v></c>';
  var s = val == null ? "" : String(val);
  return '<c r="'+ref+'" t="inlineStr"><is><t xml:space="preserve">'+xlsxEsc(s)+'</t></is></c>';
}
function xlsxSheetXml(headers, rows){
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
  var r = 1;
  xml += '<row r="'+r+'">' + headers.map(function(h,i){ return xlsxCell(h,i,r); }).join("") + '</row>';
  rows.forEach(function(row){
    r++;
    xml += '<row r="'+r+'">' + row.map(function(v,i){ return xlsxCell(v,i,r); }).join("") + '</row>';
  });
  xml += '</sheetData></worksheet>';
  return xml;
}
function buildXlsxFile(sheetName, headers, rows){
  var contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
    '<Default Extension="xml" ContentType="application/xml"/>'+
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
    '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'+
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
    '</Types>';
  var rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'+
    '</Relationships>';
  var workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '+
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
    '<sheets><sheet name="'+xlsxEsc(sheetName||"Sheet1")+'" sheetId="1" r:id="rId1"/></sheets></workbook>';
  var workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'+
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+
    '</Relationships>';
  var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
    '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'+
    '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'+
    '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'+
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
    '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'+
    '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'+
    '</styleSheet>';
  var sheet = xlsxSheetXml(headers, rows);

  var entries = [
    { name:"[Content_Types].xml", data:utf8(contentTypes) },
    { name:"_rels/.rels", data:utf8(rootRels) },
    { name:"xl/workbook.xml", data:utf8(workbook) },
    { name:"xl/_rels/workbook.xml.rels", data:utf8(workbookRels) },
    { name:"xl/worksheets/sheet1.xml", data:utf8(sheet) },
    { name:"xl/styles.xml", data:utf8(styles) }
  ];
  return buildPlainZip(entries);
}
function downloadXlsx(sheetName, headers, rows, filename){
  downloadBytes(buildXlsxFile(sheetName, headers, rows), filename,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}
