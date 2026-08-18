/* ============================================================================
   CRYPTO PRIMITIVES — pure JS, no dependencies, no WebCrypto requirement.
   WebCrypto (crypto.subtle) is unavailable on plain http:// intranet pages,
   so everything needed for WinZip AES-256 is implemented here:
   SHA-1, HMAC-SHA1, PBKDF2-HMAC-SHA1, AES-256, AES-CTR (WinZip variant), CRC32.
   ============================================================================ */

/* ---------- SHA-1 ---------- */
function sha1(bytes){
  var ml = bytes.length;
  var withOne = new Uint8Array(((ml + 8) >> 6 << 6) + 64);
  withOne.set(bytes);
  withOne[ml] = 0x80;
  var bitLenHi = Math.floor(ml / 536870912);      // (ml*8) >> 32
  var bitLenLo = (ml << 3) >>> 0;
  var dv = new DataView(withOne.buffer);
  dv.setUint32(withOne.length - 8, bitLenHi);
  dv.setUint32(withOne.length - 4, bitLenLo);

  var h0=0x67452301, h1=0xEFCDAB89, h2=0x98BADCFE, h3=0x10325476, h4=0xC3D2E1F0;
  var w = new Int32Array(80);
  for(var i=0; i<withOne.length; i+=64){
    for(var j=0;j<16;j++) w[j] = dv.getInt32(i + j*4);
    for(j=16;j<80;j++){ var n = w[j-3]^w[j-8]^w[j-14]^w[j-16]; w[j] = (n<<1)|(n>>>31); }
    var a=h0,b=h1,c=h2,d=h3,e=h4;
    for(j=0;j<80;j++){
      var f,k;
      if(j<20){ f=(b&c)|((~b)&d); k=0x5A827999; }
      else if(j<40){ f=b^c^d; k=0x6ED9EBA1; }
      else if(j<60){ f=(b&c)|(b&d)|(c&d); k=0x8F1BBCDC; }
      else { f=b^c^d; k=0xCA62C1D6; }
      var t = (((a<<5)|(a>>>27)) + f + e + k + w[j])|0;
      e=d; d=c; c=(b<<30)|(b>>>2); b=a; a=t;
    }
    h0=(h0+a)|0; h1=(h1+b)|0; h2=(h2+c)|0; h3=(h3+d)|0; h4=(h4+e)|0;
  }
  var out = new Uint8Array(20), odv = new DataView(out.buffer);
  odv.setInt32(0,h0); odv.setInt32(4,h1); odv.setInt32(8,h2); odv.setInt32(12,h3); odv.setInt32(16,h4);
  return out;
}

/* ---------- HMAC-SHA1 ---------- */
function hmacSha1(key, msg){
  var block = 64;
  if(key.length > block) key = sha1(key);
  var k = new Uint8Array(block); k.set(key);
  var ipad = new Uint8Array(block + msg.length);
  var opad = new Uint8Array(block + 20);
  for(var i=0;i<block;i++){ ipad[i] = k[i] ^ 0x36; opad[i] = k[i] ^ 0x5c; }
  ipad.set(msg, block);
  opad.set(sha1(ipad), block);
  return sha1(opad);
}

/* ---------- PBKDF2-HMAC-SHA1 ---------- */
function pbkdf2Sha1(pass, salt, iterations, dkLen){
  var out = new Uint8Array(dkLen), off = 0, block = 1;
  while(off < dkLen){
    var msg = new Uint8Array(salt.length + 4);
    msg.set(salt);
    msg[salt.length]   = (block >>> 24) & 0xff;
    msg[salt.length+1] = (block >>> 16) & 0xff;
    msg[salt.length+2] = (block >>> 8) & 0xff;
    msg[salt.length+3] = block & 0xff;
    var u = hmacSha1(pass, msg);
    var t = u.slice(0);
    for(var i=1;i<iterations;i++){
      u = hmacSha1(pass, u);
      for(var j=0;j<20;j++) t[j] ^= u[j];
    }
    var take = Math.min(20, dkLen - off);
    out.set(t.subarray(0, take), off);
    off += take; block++;
  }
  return out;
}

/* ---------- AES (128/192/256) block cipher ---------- */
var AES_SBOX = (function(){
  var sbox = new Uint8Array(256), p = 1, q = 1;
  do {
    p = p ^ ((p << 1) & 0xff) ^ ((p & 0x80) ? 0x1b : 0);
    q ^= q << 1; q ^= q << 2; q ^= q << 4; q &= 0xff;
    if(q & 0x80) q ^= 0x09;
    var x = (q ^ ((q<<1)|(q>>>7)) ^ ((q<<2)|(q>>>6)) ^ ((q<<3)|(q>>>5)) ^ ((q<<4)|(q>>>4))) & 0xff;
    sbox[p] = x ^ 0x63;
  } while(p !== 1);
  sbox[0] = 0x63;
  return sbox;
})();
function xtime(a){ return ((a<<1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff; }

function aesExpandKey(key){
  var Nk = key.length / 4, Nr = Nk + 6;
  var w = new Uint8Array(16 * (Nr + 1));
  w.set(key);
  var rcon = 1;
  for(var i = Nk; i < 4 * (Nr + 1); i++){
    var t = [w[(i-1)*4], w[(i-1)*4+1], w[(i-1)*4+2], w[(i-1)*4+3]];
    if(i % Nk === 0){
      t = [AES_SBOX[t[1]] ^ rcon, AES_SBOX[t[2]], AES_SBOX[t[3]], AES_SBOX[t[0]]];
      rcon = xtime(rcon);
    } else if(Nk > 6 && i % Nk === 4){
      t = [AES_SBOX[t[0]], AES_SBOX[t[1]], AES_SBOX[t[2]], AES_SBOX[t[3]]];
    }
    for(var j=0;j<4;j++) w[i*4+j] = w[(i-Nk)*4+j] ^ t[j];
  }
  return { w:w, Nr:Nr };
}

function aesEncryptBlock(ks, block){
  var s = block.slice(0), w = ks.w, Nr = ks.Nr, i, r;
  for(i=0;i<16;i++) s[i] ^= w[i];
  for(r=1;r<=Nr;r++){
    for(i=0;i<16;i++) s[i] = AES_SBOX[s[i]];
    // ShiftRows (column-major state: byte index = col*4 + row)
    var t1=s[1]; s[1]=s[5]; s[5]=s[9]; s[9]=s[13]; s[13]=t1;
    var t2=s[2], t6=s[6]; s[2]=s[10]; s[6]=s[14]; s[10]=t2; s[14]=t6;
    var t15=s[15]; s[15]=s[11]; s[11]=s[7]; s[7]=s[3]; s[3]=t15;
    if(r < Nr){
      for(var c=0;c<4;c++){
        var o=c*4, a0=s[o], a1=s[o+1], a2=s[o+2], a3=s[o+3];
        var all = a0^a1^a2^a3;
        s[o]   = a0 ^ all ^ xtime(a0^a1);
        s[o+1] = a1 ^ all ^ xtime(a1^a2);
        s[o+2] = a2 ^ all ^ xtime(a2^a3);
        s[o+3] = a3 ^ all ^ xtime(a3^a0);
      }
    }
    for(i=0;i<16;i++) s[i] ^= w[r*16 + i];
  }
  return s;
}

/* ---------- AES-CTR, WinZip flavour: 128-bit little-endian counter from 1 ---------- */
function winzipCtrCrypt(key, data){
  var ks = aesExpandKey(key);
  var out = new Uint8Array(data.length);
  var ctr = new Uint8Array(16);
  for(var off=0; off<data.length; off+=16){
    // increment little-endian counter first (first block uses 1)
    // NB: ++ctr[i] on a Uint8Array yields 256 (pre-wrap), so the carry must be
    // tested on the stored value, not on the expression result.
    for(var i=0;i<16;i++){ ctr[i] = (ctr[i] + 1) & 0xff; if(ctr[i] !== 0) break; }
    var ksBlock = aesEncryptBlock(ks, ctr);
    var n = Math.min(16, data.length - off);
    for(var j=0;j<n;j++) out[off+j] = data[off+j] ^ ksBlock[j];
  }
  return out;
}

/* ---------- CRC32 ---------- */
var CRC_TABLE = (function(){
  var t = new Uint32Array(256);
  for(var n=0;n<256;n++){
    var c = n;
    for(var k=0;k<8;k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes){
  var c = 0xFFFFFFFF;
  for(var i=0;i<bytes.length;i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/* ---------- random ---------- */
function randomBytes(n){
  var b = new Uint8Array(n);
  if(typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(b);
  else throw new Error("No secure random source available in this browser.");
  return b;
}

/* ============================================================================
   ZIP writer — WinZip AES-256 (AE-2)
   Layout per entry: salt(16) | passwordVerify(2) | ciphertext | authCode(10)
   ============================================================================ */
function utf8(str){
  var out = [], i, c;
  for(i=0;i<str.length;i++){
    c = str.charCodeAt(i);
    if(c < 0x80) out.push(c);
    else if(c < 0x800){ out.push(0xc0|(c>>6), 0x80|(c&63)); }
    else if(c >= 0xd800 && c <= 0xdbff){
      var c2 = str.charCodeAt(++i);
      var cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      out.push(0xf0|(cp>>18), 0x80|((cp>>12)&63), 0x80|((cp>>6)&63), 0x80|(cp&63));
    }
    else { out.push(0xe0|(c>>12), 0x80|((c>>6)&63), 0x80|(c&63)); }
  }
  return new Uint8Array(out);
}

function dosDateTime(d){
  var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time:time & 0xffff, date:date & 0xffff };
}

/* entries: [{name, data:Uint8Array, deflated:Uint8Array|null}] */
function buildEncryptedZip(entries, password){
  var passBytes = utf8(password);
  var chunks = [], central = [], offset = 0;
  var now = dosDateTime(new Date());

  entries.forEach(function(entry){
    var raw = entry.data;
    var useDeflate = !!entry.deflated;
    var payload = useDeflate ? entry.deflated : raw;
    var method = useDeflate ? 8 : 0;

    // key derivation: 32B enc + 32B auth + 2B verifier
    var salt = randomBytes(16);
    var dk = pbkdf2Sha1(passBytes, salt, 1000, 32 + 32 + 2);
    var encKey = dk.subarray(0, 32);
    var authKey = dk.subarray(32, 64);
    var pv = dk.subarray(64, 66);

    var cipher = winzipCtrCrypt(encKey, payload);
    var mac = hmacSha1(authKey, cipher).subarray(0, 10);

    var body = new Uint8Array(16 + 2 + cipher.length + 10);
    body.set(salt, 0); body.set(pv, 16); body.set(cipher, 18);
    body.set(mac, 18 + cipher.length);

    var nameBytes = utf8(entry.name);
    var crc = crc32(raw);            // AE-2 stores 0 in the header, CRC kept for reference
    var compSize = body.length;
    var uncompSize = raw.length;

    // AES extra field (0x9901)
    var extra = new Uint8Array(11);
    var edv = new DataView(extra.buffer);
    edv.setUint16(0, 0x9901, true);  // header id
    edv.setUint16(2, 7, true);       // data size
    edv.setUint16(4, 2, true);       // AE-2
    extra[6] = 0x41; extra[7] = 0x45; // "AE"
    extra[8] = 3;                    // AES-256
    edv.setUint16(9, method, true);  // real compression method

    var lh = new Uint8Array(30 + nameBytes.length + extra.length);
    var ldv = new DataView(lh.buffer);
    ldv.setUint32(0, 0x04034b50, true);
    ldv.setUint16(4, 51, true);        // version needed 5.1
    ldv.setUint16(6, 0x0801, true);    // bit0 encrypted + bit11 UTF-8 names
    ldv.setUint16(8, 99, true);        // method 99 = AES
    ldv.setUint16(10, now.time, true);
    ldv.setUint16(12, now.date, true);
    ldv.setUint32(14, 0, true);        // CRC = 0 for AE-2
    ldv.setUint32(18, compSize, true);
    ldv.setUint32(22, uncompSize, true);
    ldv.setUint16(26, nameBytes.length, true);
    ldv.setUint16(28, extra.length, true);
    lh.set(nameBytes, 30);
    lh.set(extra, 30 + nameBytes.length);

    chunks.push(lh, body);

    var ch = new Uint8Array(46 + nameBytes.length + extra.length);
    var cdv = new DataView(ch.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 51, true);        // version made by
    cdv.setUint16(6, 51, true);        // version needed
    cdv.setUint16(8, 0x0801, true);
    cdv.setUint16(10, 99, true);
    cdv.setUint16(12, now.time, true);
    cdv.setUint16(14, now.date, true);
    cdv.setUint32(16, 0, true);        // CRC = 0 for AE-2
    cdv.setUint32(20, compSize, true);
    cdv.setUint32(24, uncompSize, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, extra.length, true);
    cdv.setUint16(32, 0, true);        // comment length
    cdv.setUint16(34, 0, true);        // disk number
    cdv.setUint16(36, 0, true);        // internal attrs
    cdv.setUint32(38, 0, true);        // external attrs
    cdv.setUint32(42, offset, true);
    ch.set(nameBytes, 46);
    ch.set(extra, 46 + nameBytes.length);
    central.push(ch);

    offset += lh.length + body.length;
    entry._crc = crc;
  });

  var cdSize = central.reduce(function(s,c){ return s + c.length; }, 0);
  var eocd = new Uint8Array(22);
  var v = new DataView(eocd.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, entries.length, true);
  v.setUint16(10, entries.length, true);
  v.setUint32(12, cdSize, true);
  v.setUint32(16, offset, true);

  var total = chunks.reduce(function(s,c){ return s + c.length; }, 0) + cdSize + 22;
  var out = new Uint8Array(total), p = 0;
  chunks.forEach(function(c){ out.set(c, p); p += c.length; });
  central.forEach(function(c){ out.set(c, p); p += c.length; });
  out.set(eocd, p);
  return out;
}
