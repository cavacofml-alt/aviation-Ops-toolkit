
/* ============================================================================
   SECURE ZIP — attach files or paste text, get an AES-256 encrypted .zip
   plus a strong random password.
   ============================================================================ */
var SZ = { files: [], zipBlobUrl: null, lastName: "" };

/* password generator — crypto.getRandomValues, rejection sampling (no modulo bias) */
/* ambiguous glyphs (0 O 1 l I) are left out so the password can be read aloud */
var PW_SETS = {
  strong: "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*-_=+?",
  alnum:  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789",
  words:  null
};
var WORDS = ("able acid aged airy army atom aunt away axis baby back bald bank bare barn base beam bean bear beat beef bell belt bend bent best bike bill bind bird bite blue boat body boil bold bolt bond bone book boot bore born boss both bowl bulk bull burn bush busy cage cake calm camp cane card care cart case cash cast cave cell chat chef chin chip city clay clip club coal coat code coin cold colt comb cook cool copy cord core cork corn cost cove crew crop cube cuff cure curl cusp dark dart dash data date dawn deal dean dear debt deck deed deep deer dent desk dial dice diet dime dine dirt dish disk dive dock does dome done doom door dose dove down drag draw drew drop drum dual duck dust duty each earl earn ease east easy echo edge exit face fact fade fail fair fall fame farm fast fate fear feed feel fell felt fern file fill film find fine fire firm fish fist five flag flat flax fled flew flex flip flow foam fold folk fond food foot ford fork form fort four fuel full fund gain gala game gate gave gear gene gift girl give glad glen glow goal goat gold golf gone good gown grab gray grew grid grim grip grow gulf hail hair half hall halt hand hang hard harm hawk haze head heal heap hear heat heel held helm help herb herd here hero hide high hill hint hire hive hold hole holy home hood hoof hook hope horn host hour huge hull hunt hurt icon idea idle inch iron isle item jade jazz jeep join joke jump junk jury just keen keep kelp kept kick kind king kite knee knew knot know lace lake lamb lamp land lane last late lawn lead leaf leak lean leap left lend lens less life lift like limb lime line link lion list live load loan lock loft logo lone long look loop lord lose loud love luck lump lung made mail main make male mall malt mane many maps mare mark mars mash mask mast mate math maze mead meal mean meat meet melt mend menu mesh mile milk mill mind mine mint miss mist mode mold mole monk mood moon more moss most moth move much mule myth nail name nave near neat neck need neon nest news next nice nine node none noon norm nose note noun oath oats obey odds oily omit once only onto open oral oval oven over pace pack page paid pain pair pale palm park part pass past path peak pear peat peel pens perk pest pick pier pike pile pine pink pipe plan play plot plug plum plus poem poet pole poll pond pool poor pore port pose post pour pray prep prey prim prop pull pump pure push quit quiz race rack raft rage raid rail rain rake ramp rank rare rate read real reap rear reed reef reel rely rent rest rice rich ride rift ring rise risk road roam robe rock rode role roll roof room root rope rose rosy ruby rule rush rust sail salt same sand save scan seal seam seat seed seek seem seen self sell send sent shed ship shoe shop shot show shut side sign silk sill silo sing sink site size skin skip sky slab sled slid slim slip slot slow snap snow soak soap sock soft soil sold sole solo some song soon sort soul soup sour span spin spot spur star stay stem step stir stop stow such suit sung sunk sure surf swan swap swim tail take tale talk tall tank tape task team tear tech teem tell tend tent term test text than that thaw them then they thin this thus tide tidy tier tile till tilt time tiny tide toad toil told toll tomb tone tool torn tour town trap tray tree trim trip true tube tuna tune turf turn twin type unit upon urge used user vain vale vane vast veal veil vein vent verb very vest vibe view vine visa void volt vote wade wage wait wake walk wall wand want ward warm warn wash wasp wave weak wear weed week weep well went were west what when whip whom wide wife wild will wind wine wing wink wipe wire wise wish with wolf wood wool word wore work worm worn wrap wrist yard yarn yawn year yell yoga your zeal zero zinc zone zoom").split(" ");

function genPassword(mode, len){
  if(mode === "words"){
    var n = 6, parts = [];
    var idx = randomBytes(n*2);
    for(var i=0;i<n;i++){
      var v = (idx[i*2] << 8 | idx[i*2+1]) % WORDS.length;
      parts.push(WORDS[v]);
    }
    var d = randomBytes(2);
    return parts.join("-") + "-" + ((d[0]<<8|d[1]) % 9000 + 1000);
  }
  var set = PW_SETS[mode] || PW_SETS.strong;
  var out = "";
  var max = 256 - (256 % set.length);        // rejection sampling → uniform
  while(out.length < len){
    var buf = randomBytes(len * 2);
    for(var k=0; k<buf.length && out.length<len; k++){
      if(buf[k] < max) out += set.charAt(buf[k] % set.length);
    }
  }
  return out;
}

/* entropy estimate, in bits */
function pwEntropy(mode, len){
  if(mode === "words") return Math.round(6 * Math.log2(WORDS.length) + Math.log2(9000));
  var set = PW_SETS[mode] || PW_SETS.strong;
  return Math.round(len * Math.log2(set.length));
}

function szRender(){
  var list = SZ.files.length
    ? '<div style="border:1px solid var(--line);border-radius:2px;overflow:hidden;margin-bottom:14px">'+
      '<table><thead><tr><th>File</th><th>Size</th><th></th></tr></thead><tbody>'+
      SZ.files.map(function(f,i){
        return '<tr><td style="font-family:var(--mono);font-size:12px">'+esc(f.name)+'</td>'+
          '<td style="font-family:var(--mono);font-size:12px;color:var(--dim)">'+fmtSize(f.data.length)+'</td>'+
          '<td><button class="btn small danger" data-sz="del" data-i="'+i+'">&times;</button></td></tr>';
      }).join("")+'</tbody></table></div>'
    : '<div class="empty">No files added yet — attach files or paste text below.</div>';

  $("szList").innerHTML = list;
  var total = SZ.files.reduce(function(s,f){ return s + f.data.length; }, 0);
  $("szTotal").textContent = SZ.files.length
    ? SZ.files.length + " file" + (SZ.files.length!==1?"s":"") + " · " + fmtSize(total)
    : "";
  $("btnSzMake").disabled = SZ.files.length === 0;
}
function fmtSize(n){
  if(n < 1024) return n + " B";
  if(n < 1048576) return (n/1024).toFixed(1) + " KB";
  return (n/1048576).toFixed(2) + " MB";
}

/* deflate via CompressionStream when the browser offers it; otherwise store */
function maybeDeflate(bytes){
  if(typeof CompressionStream === "undefined" || bytes.length === 0) return Promise.resolve(null);
  try{
    var cs = new CompressionStream("deflate-raw");
    var stream = new Blob([bytes]).stream().pipeThrough(cs);
    return new Response(stream).arrayBuffer().then(function(buf){
      var out = new Uint8Array(buf);
      return out.length < bytes.length ? out : null;   // only if it actually helps
    }).catch(function(){ return null; });
  } catch(e){ return Promise.resolve(null); }
}

function szMakeZip(){
  var mode = $("szPwMode").value;
  var aes = ($("szCipher")||{}).value === "aes";
  var len = parseInt($("szPwLen").value, 10) || 24;
  var pw;
  try { pw = genPassword(mode, len); }
  catch(e){ alert("This browser has no secure random source available."); return; }

  $("btnSzMake").disabled = true;
  $("szStatus").textContent = "Compressing and encrypting…";

  Promise.all(SZ.files.map(function(f){
    return maybeDeflate(f.data).then(function(def){
      return { name:f.name, data:f.data, deflated:def };
    });
  })).then(function(entries){
    var zipBytes;
    try { zipBytes = aes ? buildEncryptedZip(entries, pw) : buildZipCryptoZip(entries, pw); }
    catch(err){ $("szStatus").textContent = "Failed: " + err.message; $("btnSzMake").disabled = false; return; }

    var stamp = new Date().toISOString().slice(0,10).replace(/-/g,"");
    var base = SZ.files.length === 1
      ? SZ.files[0].name.replace(/\.[^.]+$/,"")
      : "secure-" + stamp;
    var fname = base + ".zip";

    if(SZ.zipBlobUrl) URL.revokeObjectURL(SZ.zipBlobUrl);
    var blob = new Blob([zipBytes], {type:"application/zip"});
    SZ.zipBlobUrl = URL.createObjectURL(blob);
    SZ.lastName = fname;

    var bits = pwEntropy(mode, len);
    $("szResult").hidden = false;
    $("szResult").innerHTML =
      '<div style="border:1px solid var(--green);background:var(--green-soft);border-radius:2px;padding:16px">'+
        '<div class="sec" style="color:var(--green);margin-bottom:12px">&#10003; Encrypted archive ready</div>'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px">'+
          '<a class="btn primary" id="szDownload" download="'+esc(fname)+'" href="'+SZ.zipBlobUrl+'" '+
            'style="text-decoration:none;display:inline-block">&#8595; Download '+esc(fname)+'</a>'+
          '<span class="note">'+fmtSize(zipBytes.length)+' &middot; '+(aes?"AES-256":"ZipCrypto")+'</span>'+
        '</div>'+
        '<div class="field" style="margin-bottom:10px">'+
          '<label>Password — store it now, it is not saved anywhere</label>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
            '<input id="szPwOut" readonly value="'+esc(pw)+'" '+
              'style="flex:1;min-width:240px;font-size:14px;color:var(--green);letter-spacing:.5px">'+
            '<button class="btn small" data-sz="copy">&#128203; Copy</button>'+
          '</div>'+
        '</div>'+
        '<div class="note" style="line-height:1.7">'+
          'Password strength: about <b style="color:var(--green)">'+bits+' bits</b> of entropy. '+
          'Send the password through a <b>different channel</b> from the file — not in the same email. '+
          (aes
            ? 'Opens with 7-Zip, WinRAR, macOS Keka, or any tool supporting WinZip AES — <b>not</b> with '+
              'the Windows Explorer built-in extractor, which does not read AES.'
            : 'Opens anywhere, including the Windows Explorer built-in extractor. '+
              '<b style="color:var(--amber)">ZipCrypto is weak</b>: someone holding part of a file\'s '+
              'original content can recover the rest without the password. Use AES-256 for anything sensitive.')+
        '</div>'+
      '</div>';
    $("szStatus").textContent = "";
    $("btnSzMake").disabled = false;
    $("szResult").scrollIntoView({block:"nearest"});
  });
}

/* ---------- events ---------- */
var SZ_MAX_FILE = 64 * 1024 * 1024;    // per file
var SZ_MAX_TOTAL = 128 * 1024 * 1024;  // whole archive — everything is held in RAM
$("szFiles").addEventListener("change", function(e){
  var files = Array.prototype.slice.call(e.target.files || []);
  if(!files.length) return;
  var current = SZ.files.reduce(function(s,f){ return s + f.data.length; }, 0);
  var incoming = files.reduce(function(s,f){ return s + f.size; }, 0);
  var tooBig = files.filter(function(f){ return f.size > SZ_MAX_FILE; });
  if(tooBig.length){
    alert("These files are too large to encrypt in the browser (limit "+fmtSize(SZ_MAX_FILE)+" each):\n\n"+
      tooBig.map(function(f){ return "\u00b7 "+f.name+" ("+fmtSize(f.size)+")"; }).join("\n"));
    files = files.filter(function(f){ return f.size <= SZ_MAX_FILE; });
  }
  if(current + incoming > SZ_MAX_TOTAL){
    alert("That would exceed the total limit of "+fmtSize(SZ_MAX_TOTAL)+
      ". Encryption runs entirely in memory, so very large archives can crash the tab.");
    e.target.value = ""; return;
  }
  if(!files.length){ e.target.value = ""; return; }
  var pending = files.length;
  files.forEach(function(file){
    var r = new FileReader();
    r.onload = function(ev){
      SZ.files.push({ name:file.name, data:new Uint8Array(ev.target.result) });
      if(--pending === 0) szRender();
    };
    r.onerror = function(){ if(--pending === 0) szRender(); };
    r.readAsArrayBuffer(file);
  });
  e.target.value = "";
});
$("btnSzAddText").addEventListener("click", function(){
  var text = $("szText").value;
  if(!text.trim()){ alert("Nothing to add — paste some text first."); return; }
  var name = ($("szTextName").value || "").trim() || "message.txt";
  if(!/\.[A-Za-z0-9]+$/.test(name)) name += ".txt";
  SZ.files.push({ name:name, data:utf8(text) });
  $("szText").value = "";
  szRender();
});
$("btnSzClear").addEventListener("click", function(){
  SZ.files = []; $("szResult").hidden = true; $("szText").value = "";
  if(SZ.zipBlobUrl){ URL.revokeObjectURL(SZ.zipBlobUrl); SZ.zipBlobUrl = null; }
  szRender();
});
$("btnSzMake").addEventListener("click", szMakeZip);
$("szPwMode").addEventListener("change", function(){
  $("szPwLenWrap").style.display = this.value === "words" ? "none" : "";
});
/* the trade-off between the two formats is the whole decision here, so it is
   spelled out next to the selector rather than buried in the notes below */
function szCipherNote(){
  var el = $("szCipherNote"), sel = $("szCipher");
  if(!el || !sel) return;
  el.innerHTML = sel.value === "aes"
    ? "Strong, but the recipient needs 7-Zip, WinRAR or Keka — the Windows built-in extractor cannot open it."
    : "<b style=\"color:var(--amber)\">Weak encryption.</b> Keeps a file away from a casual reader, "+
      "but not from anyone who holds part of its original content. Switch to AES-256 for sensitive data.";
}
$("szCipher") && $("szCipher").addEventListener("change", szCipherNote);
szCipherNote();
function legacyCopy(inp, done){
  inp.focus(); inp.select();
  try { if(document.execCommand("copy")) done(); } catch(err){}
}
document.addEventListener("click", function(e){
  var b = e.target.closest ? e.target.closest("[data-sz]") : null;
  if(!b) return;
  var act = b.getAttribute("data-sz");
  if(act === "del"){ SZ.files.splice(+b.getAttribute("data-i"), 1); szRender(); }
  else if(act === "copy"){
    var inp = $("szPwOut"); if(!inp) return;
    var ok = function(){ b.textContent = "\u2713 Copied";
      setTimeout(function(){ b.innerHTML = "&#128203; Copy"; }, 1600); };
    // modern API first; execCommand is the fallback for plain-http intranet pages,
    // where navigator.clipboard is unavailable (it needs a secure context)
    if(navigator.clipboard && window.isSecureContext){
      navigator.clipboard.writeText(inp.value).then(ok, function(){ legacyCopy(inp, ok); });
    } else legacyCopy(inp, ok);
  }
});
szRender();
