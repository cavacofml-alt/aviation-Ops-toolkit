/* =====================================================================
   EDITABLE TABLE — usual passport number patterns by country
   ---------------------------------------------------------------------
   NOT in the IATA manuals: RP1707b/AIRIMP define the field only
   as alphanumeric. These patterns are heuristic (formats change and
   old passports remain valid for up to 10 years), so they always
   produce a WARNING, never an error. To add a country just append the
   line; to disable one, delete or comment out the line.
   Applies only to type P documents (passport).
   ===================================================================== */
const PASSPORT_PATTERNS={
  PRT:{re:/^[A-Z]{1,2}\d{6}$/,      ex:"K123456"},
  ESP:{re:/^[A-Z]{2,3}\d{6}$/,      ex:"ABC123456"},
  GBR:{re:/^\d{9}$/,                ex:"123456789"},
  IRL:{re:/^[A-Z0-9]{2}\d{7}$/,     ex:"XN1234567"},
  FRA:{re:/^\d{2}[A-Z]{2}\d{5}$/,   ex:"12AB34567"},
  DEU:{re:/^[CFGHJKLMNPRTVWXYZ0-9]{9}$/, ex:"C01X00T47"},
  ITA:{re:/^[A-Z]{2}\d{7}$/,        ex:"YA1234567"},
  NLD:{re:/^[A-Z]{2}[A-Z0-9]{6}\d$/,ex:"NX12A3456"},
  BEL:{re:/^[A-Z]{2}\d{6}$/,        ex:"EM123456"},
  CHE:{re:/^[A-Z]\d{7}$/,           ex:"X1234567"},
  POL:{re:/^[A-Z]{2}\d{7}$/,        ex:"AB1234567"},
  SWE:{re:/^\d{8}$/,                ex:"12345678"},
  NOR:{re:/^\d{8}$/,                ex:"12345678"},
  DNK:{re:/^\d{9}$/,                ex:"123456789"},
  USA:{re:/^(\d{9}|[A-Z]\d{8})$/,   ex:"123456789 ou A12345678"},
  CAN:{re:/^[A-Z]{2}\d{6}$/,        ex:"AB123456"},
  BRA:{re:/^[A-Z]{2}\d{6}$/,        ex:"AB123456"},
  AUS:{re:/^[A-Z]{1,2}\d{7}$/,      ex:"PA1234567"},
  IND:{re:/^[A-Z]\d{7}$/,           ex:"A1234567"},
  CHN:{re:/^([A-Z]\d{8}|[A-Z]{2}\d{7})$/, ex:"E12345678 ou EA1234567"},
  ZAF:{re:/^[A-Z]\d{8}$/,           ex:"A12345678"},
  AGO:{re:/^[A-Z]{1,2}\d{6}$/,      ex:"N123456"},
  MOZ:{re:/^[A-Z]{2}\d{7}$/,        ex:"AB1234567"},
  CPV:{re:/^[A-Z]{1,2}\d{6}$/,      ex:"N123456"}
};
// equivalências alpha-2 -> alpha-3 (o DOCS admite ambos)
const ISO2TO3={PT:"PRT",ES:"ESP",GB:"GBR",UK:"GBR",IE:"IRL",FR:"FRA",DE:"DEU",IT:"ITA",
  NL:"NLD",BE:"BEL",CH:"CHE",PL:"POL",SE:"SWE",NO:"NOR",DK:"DNK",US:"USA",CA:"CAN",
  BR:"BRA",AU:"AUS",IN:"IND",CN:"CHN",ZA:"ZAF",AO:"AGO",MZ:"MOZ",CV:"CPV"};

/* ---- utilitários de data (DDMMMYY) ---- */
const MON3={JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};
function parseDDMMMYY(s,dir){ // dir: "past" | "future"
  const m=(s||"").match(/^(\d{2})([A-Z]{3})(\d{2})$/); if(!m) return null;
  const mi=MON3[m[2]]; if(mi===undefined) return null;
  const dd=parseInt(m[1],10), yy=parseInt(m[3],10); if(dd<1||dd>31) return null;
  const now=new Date();
  let year=2000+yy;
  if(dir==="past"  && year>now.getFullYear()) year-=100;   // nascimento nunca é futuro
  if(dir==="future"&& year<now.getFullYear()-10) year+=100; // validade
  const d=new Date(Date.UTC(year,mi,dd));
  return (d.getUTCDate()===dd && d.getUTCMonth()===mi) ? d : null;
}
function resolveFlightDate(dd,mmm){ // o Flight Element não traz ano
  const mi=MON3[mmm]; if(mi===undefined) return null;
  const now=new Date(), y=now.getUTCFullYear();
  let best=null, bestDiff=Infinity;
  [y-1,y,y+1].forEach(yy=>{
    const d=new Date(Date.UTC(yy,mi,parseInt(dd,10)));
    const diff=d-now;
    const score=diff>=-90*864e5 ? Math.abs(diff) : Infinity; // preferir data futura/recente
    if(score<bestDiff){ bestDiff=score; best=d; }
  });
  return best;
}
const fmtD=d=>d?d.toISOString().slice(0,10).split("-").reverse().join("/"):"";

/* =====================================================================
   SSR MATRIX — AIRIMP 34th ed. §2.11.6.7 (extracted from the manual)
   Each entry has 2 letters: [Action Code][Free Text In Request]
     M = Mandatory · O = Optional · N = Not permitted
   ===================================================================== */
const SSR_MATRIX={
  ADTK:"NM", AOXY:"MO", ASVC:"MM", ASVX:"NN", AUTK:"MN", AVIH:"MM",
  AVML:"MN", BBML:"MN", BIKE:"MO", BLML:"MN", BLND:"MO", BSCT:"MN",
  BULK:"MM", CBBG:"MM", CHLD:"MN", CHML:"MO", CKIN:"OM", CLID:"MN",
  COUR:"MO", CRUZ:"MO", DBML:"MN", DCRW:"MO", DEAF:"MO", DEPA:"MO",
  DEPU:"MO", DOCA:"MN", DOCO:"MN", DOCS:"MN", DPNA:"MM", EPAY:"MO",
  ETLP:"NN", EXST:"MM", FOID:"MM", FPML:"MN", FQTR:"MO", FQTS:"MO",
  FQTU:"MO", FQTV:"MO", FRAG:"MM", FRAV:"MN", GFML:"MN", GPST:"MO",
  GRPF:"OO", GRPK:"MM", GRPS:"OO", HNML:"MN", INFT:"MM", IROP:"MO",
  KSML:"MN", LANG:"MM", LCML:"MN", LFML:"MN", LSML:"MN", MAAS:"MM",
  MCOA:"MM", MEDA:"OM", MEQT:"MM", MOML:"MN", NAME:"NM", NLML:"MN",
  NOML:"MN", NRSB:"MN", NSSA:"MN", NSSB:"MN", NSSR:"MO", NSST:"MO",
  NSSW:"MN", OTHS:"OM", PCTC:"MO", PETC:"MM", POXY:"MO", PPOC:"MO",
  RLOC:"NM", RQST:"MM", RVML:"MN", SEAT:"MM", SEMN:"MM", SFML:"MN",
  SLPR:"MN", SMSA:"MN", SMSB:"MN", SMSR:"MO", SMST:"MO", SMSW:"MN",
  SPEQ:"MM", SPML:"MM", STCR:"MN", TKNA:"MM", TKNC:"MM", TKNE:"MM",
  TKNM:"MM", TKNR:"MM", TKNX:"NN", TKTL:"MN", TLAC:"NO", TWOV:"MO",
  UMNR:"MM", VGML:"MN", VJML:"MN", VLML:"MN", VOML:"MN", WCBD:"MO",
  WCBW:"MO", WCHC:"MO", WCHR:"MO", WCHS:"MO", WCMP:"MO", WCOB:"MO",
  WEAP:"MM", XBAG:"MM"
};

/* =====================================================================
   RULES (derived from: PSCRM RP1708 + RP1707b · AIRIMP §2.11.6.7)
   ===================================================================== */
const RULES = {
  maxLine: 64, // RP1707b Sec.2 Nota 3
  months: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
  // Matriz SSR — AIRIMP 34ª ed. §2.11.6.7
  // União: RP1708 §2.12.7 (Table of SSR Codes) + AIRIMP 34ª ed. §2.11.6.7 (Matriz SSR) + extensões locais (CHKD)
  // CTCA/CTCE/CTCM/CTCR (contact address/e-mail/mobile/refused): confirmados como
  // códigos reais em uso operacional (observados em PNLs reais da Iberia, sempre
  // com status HK1/etc.), correspondem à Contact Information do AIRIMP §2.11.7.4
  // (que só documenta a forma OSI: OSI <cia> CTC<letra> <ponto> <dados>) — a nossa
  // AIRIMP 34ª ed. (2010) não cobre a construção SSR .R/ mais recente citada como
  // Resolução IATA 830d. Por isso reconhecemos o código (deixa de dar aviso de
  // "possível bilateral") mas NÃO validamos o formato do texto livre (nº de
  // dígitos, indicativo, etc.) — sem o texto da 830d isso seria inventar regra.
  pnlCodes: new Set(["ADTK","AOXY","ASVC","ASVX","AUTK","AVIH","AVML","BBML","BIKE","BLML","BLND","BSCT","BULK","CBBG","CHLD","CHML","CKIN","CLID","COUR","CRUZ","CTCA","CTCE","CTCM","CTCR","DBML","DCRW","DEAF","DEPA","DEPU","DOCA","DOCO","DOCS","DPNA","EPAY","ETLP","EXST","FOID","FPML","FQTR","FQTS","FQTU","FQTV","FRAG","FRAV","GFML","GPST","GRPF","GRPK","GRPS","HNML","INFT","IROP","KSML","LANG","LCML","LFML","LSML","MAAS","MCOA","MEDA","MEQT","MOML","NAME","NLML","NOML","NRSB","NSSA","NSSB","NSSR","NSST","NSSW","OTHS","PCTC","PETC","POXY","PPOC","RLOC","RQST","RVML","SEAT","SEMN","SFML","SLPR","SMSA","SMSB","SMSR","SMST","SMSW","SPEQ","SPML","STCR","TKNA","TKNC","TKNE","TKNM","TKNR","TKNX","TKTL","TLAC","TWOV","UMNR","VGML","VJML","VLML","VOML","WCBD","WCBW","WCHC","WCHR","WCHS","WCMP","WCOB","WEAP","XBAG","SVC","CHKD"]),
  // RP1708 §2.12.8 — OSI/AUX admitidos em .R/ (contagem opcional antes do código, ex.: 2VIP)
  psmCodes: new Set(["ASVC","BLND","DEAF","DEPA","DEPU","DPNA","EMIG","INAD","LANG","MAAS","MEDA","PPOC","STCR","SVC","TWOV","UMNR","VIP","WCHC","WCHR","WCHS","WEAP"]),
  statusRequired: new Set(["CHKD"]), // extensões locais: status+contagem obrigatórios
  osiCodes: new Set(["DIPL","EMIG","ETLP","INAD","LEGL","LEGR","LEGB","OXYG","SVC","TKNO","VIP","CHD"]),
  statusCodes: new Set(["HK","KK","NN","UN","NO","XX","HN","TK","PN","UC","US","HX","SA","GK","KL","TL"]),
  // Elementos .X/ definidos (RP1707b Sec.3); NOT IN USE: A,B,E,G,H,J,K,P,Q
  dotElements: new Set([".BG",".C",".D",".DBC",".DG1",".DG2",".F",".I",".ID1",".ID2",".L",".M",".N",".O",".R",".RN",".RG1",".RG2",".S",".SN",".W",".WL"]),
  dotNotInUse: new Set([".A",".B",".E",".G",".H",".J",".K",".P",".Q",".U",".V",".X",".Y",".Z"]), // RP1707b Sec.3 (NOT IN USE)
  categories: new Set(["CFMWL","FQTVN","NOSHO","OFFLK","OFFLN","NOREC","GOSHN","GOSHO","CHGCL","INVOL","CHGSG","CHGFL","IDPAD","APIPX","OFLD","REGRET"]),
  titles: ["MRS","MSTR","MISS","MR","MS","DR","PROF","CHD","INF","REV","SIR","LADY","CAPT"],
  charset: /[^A-Z0-9 .\/\-=()?:,+']/g // conjunto telex admitido
};

const REF = {
  len:"RP 1707b Sec.2 Note 3 (64 char./line limit)",
  addr:"RP 1708 §2.1 / RP 1707b §2.1 (Address Element)",
  comms:"RP 1708 §2.2 / RP 1707b §2.2 (Communications Reference)",
  msgid:"RP 1707b §2.3 (Message Identifier)",
  flight:"RP 1708 §2.4 / RP 1707b §2.4 (Flight Element)",
  totals:"RP 1708 §2.5 / RP 1707b §2.5 (Totals by Destination)",
  name:"RP 1707b §2.9 (Name Element) · AIRIMP §2.11.6.1",
  group:"RP 1707b §2.9.2 (Party/Group Identification)",
  remarks:"RP 1707b §3.24 (.R/ Remarks Element)",
  rn:"RP 1707b §3.24.8–3.27 (.RN/ continuation)",
  ssr:"AIRIMP §2.11.6.7 (SSR code matrix)",
  status:"AIRIMP §2.11.6 (Action/Status/Advice Codes)",
  elem:"RP 1707b Sec.3 (Data Elements .X/)",
  end:"RP 1707b §3.1 (End Element) / RP 1708",
  adl:"RP 1707b §2.7 (DEL/ADD/CHG — ADL only)",
  rbd:"RP 1707b §2.10 (Class Codes Element RBD)",
  cfg:"RP 1707b §2.12 (Seat Configuration CFG)",
  mvt:"AHM 780 (Aircraft Movement Message) / AHM 730 (DIV)",
  ssim:"SSIM ch. 2 (SSM/ASM) — via Avinor xwiki",
  charset:"SCR Manual / telex — permitted character set",
  space:"Telex format — significant spacing",
};

/* ============================ VALIDADOR ============================ */
function validate(raw){
  const findings = [];
  const add=(line,col,len,sev,msg,ref,meta)=>findings.push(Object.assign({line,col,len,sev,msg,ref},meta||{}));
  const lines = raw.replace(/\r\n/g,"\n").replace(/\r/g,"\n").split("\n");

  // localizar blocos de mensagem: cada bloco começa numa linha PNL/ADL isolada.
  // Tudo o que estiver fora de um bloco (endereços, referência do emissor,
  // trailers = / NNNN / ZCZC) é ignorado sem validação.
  const idRe=/^(PNL|ADL|PSM|PTM|PFS|PIL|SOM|SPM|FTL|PRL|ETL|MVT|DIV|SSM|ASM|PASSENGER INFORMATION LIST)\s*$/i;
  const blocks=[];
  lines.forEach((l,i)=>{ if(idRe.test(l.trim())) blocks.push({start:i}); });
  if(blocks.length===0){
    add(1,1,Math.max((lines[0]||"").length,1),"err","Message identifier <b>PNL</b> or <b>ADL</b> not found (on its own line).",REF.msgid);
    return findings;
  }
  blocks.forEach((b,k)=>{ b.limit = (k+1<blocks.length ? blocks[k+1].start : lines.length); });
  const fltKey=l=>{ const m=(l||"").toUpperCase().trim().match(/^([A-Z0-9]{2}[A-Z]?\d{1,4}[A-Z]?)\/(\d{2})([A-Z]{3})/); return m?m[1]+"/"+m[2]+m[3]:null; };
  blocks.forEach(b=>{ b.key=fltKey(lines[b.start+1]); });
  blocks.forEach(b=>{ const t=(lines[b.start]||'').trim().toUpperCase(); b.type=(t==='PASSENGER INFORMATION LIST')?'PIL':t; });
  // um único voo por validação (PNL/ADL): partes do MESMO voo podem vir juntas; voos diferentes não
  // um único voo por validação; ADLs múltiplos do mesmo voo são legítimos, PNLs múltiplos não
  const pnls=blocks.filter(b=>b.type==='PNL' && b.key);
  const pnladl=blocks.filter(b=>(b.type==='PNL'||b.type==='ADL') && b.key);
  if(pnls.length>1)
    add(pnls[1].start+1,1,(lines[pnls[1].start]||'').length||1,"warn","Multiple PNLs pasted together — for the same flight, only the parts of a single PNL should be validated together.",REF.flight);
  if(pnladl.length>1){
    const first=pnladl[0].key;
    pnladl.slice(1).forEach(b=>{
      if(b.key!==first)
        add(b.start+2,1,(lines[b.start+1]||'').length||1,"err",`Message for another flight (<b>${b.key}</b>) in the same validation — PNL/ADL is validated one flight at a time (first flight: <b>${first}</b>). Validate separately.`,REF.flight);
    });
  }

  // estado partilhado entre partes da mesma mensagem
  const shared={ dest:{}, groups:{}, parts:[] };
  // pré-filtrar: se houver blocos de voos diferentes, valida-se apenas o primeiro voo
  const primaryKey=blocks.find(b=>b.key)?.key||null;
  const toValidate=blocks.filter(b=>!b.key||b.key===primaryKey||(b.type!=='PNL'&&b.type!=='ADL'));
  toValidate.forEach((b,k)=>validateBlock(lines,b,k===toValidate.length-1,add,shared));

  /* ---- verificações agregadas (todas as partes) ---- */
  Object.values(shared.dest).forEach(d=>{
    // Totals by Destination carry the running figure for the flight. On a PNL the
    // listing is complete, so the two must agree; on an ADL only what changed is
    // listed (RP 1708 §3.2), so fewer names is normal — only an excess is wrong.
    if(blocks.some(b=>b.type==="ADL")){
      if(d.sum>d.declared)
        add(d.line,1,0,"warn",`Destination <b>${d.key}</b>: ${d.sum} Name Elements listed but the declared total is ${d.declared}.`,REF.totals);
    } else if(d.declared!==d.sum){
      add(d.line,1,0,"warn",`Destination <b>${d.key}</b>: declared total ${d.declared}, sum of Name Elements ${d.sum}. Please check (ZZ/NONAMES seats count towards the total).`,REF.totals);
    }
  });
  // ---- lugares duplicados (PNL) ----
  if(shared.seats) Object.entries(shared.seats).forEach(([seat,list])=>{
    if(list.length<2) return;
    list.forEach((s,i)=>add(s.line,s.col,s.len,"err",
      i===0 ? `Seat <b>${seat}</b> assigned to ${list.length} passengers (${list.map(x=>x.pax).join(", ")}) — assignment conflict.`
            : `Seat <b>${seat}</b> duplicated (see first occurrence).`,
      REF.remarks, i===0?undefined:{dup:true}));
  });

  // ---- SSR que bloqueia lugares sem placeholder 1ZZ/ (PSCRM §2.9) ----
  if(shared.zzNeed) shared.zzNeed.forEach(r=>{
    if(!r.grp){
      add(r.line,r.col,r.len,"warn",`SSR <b>${r.code}</b> blocks seat(s) but the passenger has no group identifier — without a group the <b>1ZZ/${r.code}</b> Name Element for the blocked seats cannot be linked.`,REF.group);
      return;
    }
    const set=shared.zz&&shared.zz[r.grp];
    if(!set||!set.has(r.code))
      add(r.line,r.col,r.len,"warn",`SSR <b>${r.code}</b> in group <b>-${r.grp}</b> without the blocked-seats Name Element — missing <b>nZZ/${r.code}-${r.grp}</b> under the Totals by Destination.`,REF.group);
  });

  // ---- passageiro listado duas vezes no mesmo destino ----
  if(shared.paxNames) Object.entries(shared.paxNames).forEach(([k,list])=>{
    if(list.length<2) return;
    const dest=(k.split("|")[1]||"")+"/"+(k.split("|")[2]||"");
    list.forEach((p,i)=>add(p.line,p.col,p.len,"warn",
      i===0 ? `Passenger <b>${p.label}</b> listed ${list.length} times in the same destination/class (${dest}) — check whether it is a duplicate or a namesake.`
            : `Passenger <b>${p.label}</b> repeated in the same destination (see first occurrence).`,
      REF.name, i===0?undefined:{dup:true}));
  });

  // ---- coerência CFG × RBD × Totals ----
  if(shared.cfg){
    const RANK={P:1,F:1,A:1,J:2,C:2,D:2,I:2,Z:2,W:3,S:3,Y:4,M:4,B:4,K:4};
    // (a) compartimento do CFG que não consta do RBD
    if(shared.rbd){
      const unknown=shared.cfg.order.filter((c,i,a)=>a.indexOf(c)===i && !shared.rbd.comp.has(c));
      if(unknown.length)
        add(shared.cfg.line,1,shared.cfg.raw.length,"warn",`Compartment(s) <b>${unknown.join(", ")}</b> in configuration <b>${shared.cfg.raw}</b> are not in the <b>${shared.rbd.raw}</b> element (line ${shared.rbd.line}) — check consistency between CFG and RBD.`,REF.cfg);
    }
    // (b) ordem descendente dos compartimentos (RP 1707b §2.12.3)
    for(let i=1;i<shared.cfg.order.length;i++){
      const a=RANK[shared.cfg.order[i-1]], b=RANK[shared.cfg.order[i]];
      if(a!==undefined && b!==undefined && b<a){
        add(shared.cfg.line,1,shared.cfg.raw.length,"warn",`Compartments out of order in <b>${shared.cfg.raw}</b> — the configuration is listed in descending cabin order (F→C→Y), RP 1707b §2.12.3.`,REF.cfg);
        break;
      }
    }
    // (c) passageiros por compartimento vs lugares instalados
    if(shared.paxByClass){
      Object.entries(shared.paxByClass).forEach(([cls,pax])=>{
        const fitted=shared.cfg.seats[cls];
        if(fitted!==undefined && pax>fitted)
          add(shared.cfg.line,1,shared.cfg.raw.length,"err",`Compartment <b>${cls}</b>: the Totals by Destination sum to <b>${pax}</b> passengers, but configuration <b>${shared.cfg.raw}</b> has only <b>${fitted}</b> seats.`,REF.cfg);
      });
    }
  }

  Object.values(shared.groups).forEach(g=>{
    if(g.declared==null) return;
    // (A) identificador de grupo reutilizado em reservas diferentes -> ERRO com highlight em todos os membros
    if(g.pnrs && g.pnrs.size>1){
      const pnrList=[...g.pnrs].join(", ");
      const hasZZ=g.members.some(mb=>mb.isZZ);
      g.members.forEach((mb,i)=>{
        const first=i===0;
        const zzMsg=`Placeholder <b>1ZZ/</b> and the real passenger in group <b>-${g.id}${g.declared}</b> have different PNRs (<b>${pnrList}</b>) — the blocked-seat placeholder shares the real passenger PNR (PSCRM §2.9 Block Seats Indicator).`;
        const dupMsg=`Group identifier <b>-${g.id}${g.declared}</b> reused across different bookings (<b>${pnrList}</b>) — the identifier is unique per booking. Assign a different identifier to each PNR.`;
        add(mb.line,mb.col,mb.len,"err",
          first ? (hasZZ?zzMsg:dupMsg)
                : (hasZZ?`Placeholder/passenger of group <b>-${g.id}${g.declared}</b> with a different PNR (see first occurrence).`
                        :`Group identifier <b>-${g.id}${g.declared}</b> reused in another booking (see first occurrence).`),
          REF.group,
          first?undefined:{dup:true});
      });
      return; // não gerar também o erro de soma (é consequência disto)
    }
    // (B) sum vs declared total.
    // In an ADL only what changed is listed, so a section legitimately carries
    // fewer names than the booking holds — RP 1708 §3.2.1 shows group -B28 with
    // 13 names in one ADD section and 4 in another. Only an excess is impossible.
    if(g.msgType==="ADL"){
      if(g.sum>g.declared)
        add(g.lines[0],1,0,"err",`Group <b>-${g.id}${g.declared}</b>${g.section?" in ADL "+g.section:""}: ${g.sum} passengers listed but the booking holds only ${g.declared}.`,REF.group);
    } else if(g.sum!==g.declared){
      add(g.lines[0],1,0,"err",`Group <b>-${g.id}${g.declared}</b>: the identifier indicates ${g.declared} passenger(s) in the booking, but ${g.sum} were listed.`,REF.group);
    }
  });
  // partes por voo: a ORDEM é irrelevante (o processamento só arranca com todas);
  // alertar apenas para partes EM FALTA, duplicadas, e ausência da parte final.
  // ADL: cada mensagem é independente (a mesma PART pode aparecer em ADLs diferentes).
  const byFlight={};
  shared.parts.filter(p=>p.num!==null).forEach(p=>{
    const bk=blocks.find(b=>b.start<p.line && p.line<=b.limit);
    const scope=(bk && bk.type==='ADL')?("#"+bk.start):"";
    const key=(p.key||"?")+scope;
    (byFlight[key]=byFlight[key]||[]).push(p);
  });
  Object.values(byFlight).forEach(pn=>{
    const nums=pn.map(p=>p.num);
    const set=[...new Set(nums)].sort((a,b)=>a-b);
    const max=set[set.length-1];
    const missing=[]; for(let i=1;i<=max;i++) if(!set.includes(i)) missing.push("PART"+i);
    if(missing.length)
      add(pn[0].line,1,0,"warn",`Missing <b>${missing.join(", ")}</b> for this flight — without all parts, processing cannot start (and totals/group sums stay incomplete).`,REF.flight);
    const dups=set.filter(v=>nums.filter(x=>x===v).length>1);
    if(dups.length)
      add(pn[0].line,1,0,"warn",`Duplicate part(s): <b>PART${dups.join(", PART")}</b>.`,REF.flight);
    const fin=pn.find(p=>p.final);
    if(fin && fin.num!==max)
      add(fin.line,1,0,"err",`The final part (type END) is <b>PART${fin.num}</b>, but <b>PART${max}</b> exists — the part with the type END must be the last one.`,REF.end);
    if(!fin && pn.length)
      add(pn[0].line,1,0,"warn",`No part ends with the type END (all use ENDPARTn) — part(s) after PART${max} are missing.`,REF.end);
  });

  // dedupe: se há um erro específico de espaçamento no mesmo sítio, o aviso genérico é redundante
  const dedup=findings.filter(f=>!(f.sev==="warn" && /espaços consecutivos/.test(f.msg) &&
    findings.some(e=>e.sev==="err" && e.line===f.line && e.col===f.col && /espaços consecutivos/.test(e.msg))));
  dedup.sort((a,b)=>a.line-b.line || a.col-b.col);
  // avisos de SSR/elemento desconhecido: uma entrada na lista por código (todas as ocorrências continuam marcadas no telex)
  const firstByCode={};
  dedup.forEach(f=>{
    if(!["ssrunk","elemunk","titlespace","trailws","ppfmt","natissuer","inftdocs","adlpnr"].includes(f.tag)) return;
    const k=f.tag+"|"+f.code;
    if(firstByCode[k]){ f.dup=true; firstByCode[k].more=(firstByCode[k].more||0)+1; }
    else firstByCode[k]=f;
  });
  Object.values(firstByCode).forEach(f=>{ if(f.more) f.msg+=` <b>(${f.more+1} occurrences — listed once; all marked in the telex printout)</b>`; });
  return dedup;
}

function validateBlock(lines, block, isLastBlock, add, shared){
  // delimitar o bloco: do identificador até ao END (inclusive); o que vier
  // depois (trailer, cabeçalho da parte seguinte) fica fora do escopo
  let endIdx = -1;
  for(let i=block.start;i<block.limit;i++){
    if(/^END(PNL|ADL|PSM|PTM|PFS|PIL|SOM|SPM|FTL|PRL|ETL|PART\s*\d{1,2})\s*$/i.test(lines[i].trim())){ endIdx=i; break; }
  }
  const scopeEnd = endIdx>=0 ? endIdx+1 : block.limit;

  const blkId=(lines[block.start]||'').trim().toUpperCase();
  const blkType=(blkId==='PASSENGER INFORMATION LIST')?'PIL':blkId;
  /* ---- passagem 1: caracteres e espaçamento (só dentro do bloco) ---- */
  for(let i=block.start;i<scopeEnd;i++){
    const ln=lines[i], n=i+1;
    if(ln.length>RULES.maxLine)
      add(n,RULES.maxLine+1,ln.length-RULES.maxLine,"err",`Line has ${ln.length} characters — exceeds the 64-character limit.`,REF.len);
    let m;
    // Minúsculas são normalizadas silenciosamente (não geram erro)
    const upper = ln.toUpperCase();
    const inv = /[^A-Z0-9 .\/\-=()?:,+']/g;
    while((m=inv.exec(upper))!==null){
      const ch = m[0]==='\t' ? 'TAB' : m[0];
      add(n,m.index+1,1,"err",`Invalid character <b>${ch}</b> — outside the permitted telex character set.`,REF.charset);
    }
    const tr = ln.match(/[ \t]+$/);
    if(tr && ln.trim()!=="")
      add(n,tr.index+1,tr[0].length,"warn","Trailing space(s) at end of line.",REF.space,{tag:"trailws",code:"trailws"});
    const ld = ln.match(/^ +/);
    if(ld && ln.trim()!==""){
      if(blkType==='PSM' && ld[0].length===1){/* onward connection começa com 1 espaço (RP1715 §2.9.5) */}
      else add(n,1,ld[0].length,"err","Leading space(s) — elements start at column 1"+(blkType==='PSM'?" (exception: PSM onward connection takes exactly 1 space)":"")+".",REF.space);
    }
    const dbl=/ {2,}/g;
    while((m=dbl.exec(ln))!==null){
      if(ld && m.index < ld[0].length) continue;
      if(tr && m.index >= tr.index) continue;
      if(blkType==='PSM' && m[0].length===2){/* dois espaços antes do nº de lugar (RP1715 §2.8.3) */}
      else add(n,m.index+1,m[0].length,"warn",`${m[0].length} consecutive spaces — the standard separator is a single space (exceptions: AVAIL/TRANSIT tables; 2 spaces before the seat in PSM).`,REF.space);
    }
    if(ln.trim()==="")
      add(n,1,1,"err","Blank line within the message body.",REF.space);
  }

  /* ---- passagem 2: estrutura do bloco ---- */
  let idx=block.start;
  const U=lines;
  // identificador
  const raw0=U[idx].trim().toUpperCase();
  const msgType=(raw0==='PASSENGER INFORMATION LIST')?'PIL':raw0;
  idx++;
  // ramificação: PIL e PTM têm estruturas próprias
  if(msgType==='PIL'){ return validatePIL(U,block,scopeEnd,idx,add,shared,isLastBlock); }
  if(msgType==='PTM'){ return validatePTM(U,block,scopeEnd,idx,add,shared,isLastBlock); }
  if(msgType==='MVT'){ return validateMVT(U,block,scopeEnd,idx,add); }
  if(msgType==='DIV'){ return validateDIV(U,block,scopeEnd,idx,add); }
  if(msgType==='SSM'||msgType==='ASM'){ return validateSCHED(msgType,U,block,scopeEnd,idx,add); }
  // PNL / ADL / PSM / PFS: flight element standard
  let declaredPart=null, partRec=null;
  if(idx<scopeEnd){
    const f=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    const RXF=/^([A-Z0-9]{2}[A-Z]?)(\d{1,4})([A-Z])?\/(\d{2})([A-Z]{3}) ([A-Z]{3}) PART(\d{1,2})$/;
    const fm=f.match(RXF);
    if(!fm){
      if(!spacingDiag(f,RXF,n,add,REF.flight,"Flight Element"))
        add(n,1,U[idx].length||1,"err","Invalid Flight Element — format: <b>XX999/DDMMM AAA PARTn</b> (e.g. KL774/06JUN ZRH PART1).",REF.flight);
    }else{
      const day=parseInt(fm[4],10);
      if(day<1||day>31) add(n,f.indexOf("/")+2,2,"err",`Invalid day <b>${fm[4]}</b> (01–31).`,REF.flight);
      if(!RULES.months.includes(fm[5])) add(n,f.indexOf("/")+4,3,"err",`Invalid month <b>${fm[5]}</b> — use JAN…DEC.`,REF.flight);
      declaredPart=parseInt(fm[7],10);
      shared.flightDate=resolveFlightDate(fm[4],fm[5]);
      partRec={num:declaredPart,line:n,key:fm[1]+fm[2]+(fm[3]||"")+"/"+fm[4]+fm[5]};
      shared.parts.push(partRec);
    }
    idx++;
  }

  let sawTotals=false, sawEnd=false, endToken="";
  let currentKey=null; const adlHeaders=[]; let adlBlockLine=1;
  let lastWasR=false, inSI=false, psmSvc=false, lastNameCount=null;
  let paxCtx=null; // acumula DOCS/SSR do passageiro corrente
  const flushPax=()=>{
    if(!paxCtx) return;
    // RP 1708 §2.6.1.4: in DEL the PNR address is the only required associated
    // element; §2.6.3.2: CHG carries all currently applicable elements. It is
    // what tells two identically named passengers apart.
    if(msgType==="ADL" && (adlSection==="DEL"||adlSection==="CHG") && paxCtx.name!=="NONAMES"){
      if(paxCtx.hasPnr) sectionHasPnr=true;
      else if(!sectionHasPnr)
        add(paxCtx.line,1,paxCtx.name.length+1,"warn",
          `<b>${adlSection}</b> without a <b>.L/</b> PNR address — RP 1708 ${adlSection==="DEL"?"§2.6.1.4 makes it the only required associated element":"§2.6.3.2 requires all currently applicable elements"}. Without it two passengers with the same name cannot be told apart (members of one PNR carry it once per section, §2.14.3).`,
          REF.elem, {tag:"adlpnr", code:adlSection});
    }
    checkPaxCoherence(paxCtx,add,shared.flightDate); paxCtx=null;
  };
  let adlSection=null; // "ADD" | "CHG" | "DEL"
  let sectionHasPnr=false;   // a PNR address is shown once per PNR per section
  const scopeId=(msgType==="ADL")?("ADL#"+block.start):("BLK#"+block.start);
  let lastGroupMember=null, lastGroupObj=null; // para atribuir .L/ standalone ao passageiro anterior

  for(; idx<scopeEnd; idx++){
    const rawLine=U[idx]; const line=rawLine.toUpperCase().trimEnd(); const n=idx+1;
    if(line==="") continue;

    let m;
    // Supplementary Information: depois de SI, texto livre até ao END
    if(inSI && !/^END/.test(line)) continue;

    /* ---------- linhas específicas do PSM (RP 1715) ---------- */
    if(msgType==="PSM"){
      // recap por destino: -DTW 5PAX/8SSR  |  -FAR NIL
      if((m=line.match(/^-([A-Z]{3}) (NIL|(\d{1,3})PAX ?\/ ?(\d{1,3})SSR)$/))){ lastWasR=false; continue; }
      if(line.startsWith("-")){
        add(n,1,line.length,"err","Invalid PSM destination recap — <b>-AAA nPAX/nSSR</b> or <b>-AAA NIL</b> (RP 1715 §2.5).",REF.elem);
        continue;
      }
      // compartimento: F CLASS 5PAX/7SSR | F CLASS NIL | F CLASS 2PAX / 3SSR
      if((m=line.match(/^([A-Z]) CLASS (NIL|(\d{1,3})PAX ?\/ ?(\d{1,3})SSR)$/))){ lastWasR=false; continue; }
      if(/^[A-Z] CLASS/.test(line)){
        add(n,1,line.length,"err","Invalid PSM compartment line — <b>X CLASS nPAX/nSSR</b> or <b>X CLASS NIL</b> (RP 1715 §2.7).",REF.elem);
        continue;
      }
      // onward connection: 1 espaço + voo (sem .O/)
      if(/^ \S/.test(rawLine)){
        const oc=line.trim();
        if(!RX.fltinfo.test(oc))
          add(n,2,oc.length,"err","Malformed PSM onward connection — flight data without the .O/ ID (RP 1715 §2.9, e.g. SR1234F27ZRH).",REF.elem);
        lastWasR=false; continue;
      }
      // linha de serviço/contagens: CODE [nnnC nnnC…] | CODE texto livre
      if((m=line.match(/^([A-Z]{3,4})( .*)?$/)) && !/^\d/.test(line) && line!=="SI" && line!=="NIL" && !/^END/.test(line)){
        const code=m[1];
        const rest=(m[2]||"").trim();
        if(!RULES.psmCodes.has(code)){
          add(n,1,code.length,"warn",`<b>${code}</b> is not in the PSM list (RP 1715 §2.6.5) — may be a bilateral code; confirm with the recipient.`,REF.ssr,{tag:"ssrunk",code});
        }
        // se seguem contagens por compartimento, validar o formato nnnC
        if(rest && /^\d/.test(rest)){
          rest.split(/ +/).forEach(tok=>{
            if(!/^\d{3}[A-Z]$/.test(tok))
              add(n,line.indexOf(tok)+1,tok.length,"err",`Invalid count <b>${tok}</b> — three digits + compartment (e.g. 003F), RP 1715 §2.6.4.`,REF.elem);
          });
        }
        checkHyphens(line, n, 0, add, code);
        psmSvc=true; lastWasR=false; continue;
      }
      // continuação (overflow) do free text de um serviço na linha seguinte
      if(psmSvc && !/^\d/.test(line) && !line.startsWith("-") && !/^END/.test(line) && line!=="SI"){
        continue;
      }
      // nome + lugar: 1APELIDO/NOME[TITULO]  22A  (RP1715 §2.8)
      if(/^\d/.test(line)){
        if(!/-([A-Z]{1,2})(\d{1,3})/.test(line)){ lastGroupMember=null; lastGroupObj=null; }

        psmSvc=false;
        const nmP=line.match(/^(\d{1,3})([A-Z]+(?:\/[A-Z]+(?: [A-Z]+)*)+)( {1,2}(\d{1,3}[A-Z]{1,2}))?$/);
        if(!nmP){
          add(n,1,line.length,"err","Invalid PSM Name Element — <b>1SURNAME/NAME[TITLE]</b> + optionally two spaces and the seat (RP 1715 §2.8, e.g. 1MILLER/JACKMR  23D).",REF.name);
        }else{
          if(parseInt(nmP[1],10)!==1)
            add(n,1,nmP[1].length,"err","In PSM each passenger takes its own line — the count is always <b>1</b> (RP 1715 §2.8.5).",REF.name);
        }
        lastWasR=false; continue;
      }
      psmSvc=false;
    }

    /* ---------- linhas específicas de SPM/SOM (RP 1711/1712) ---------- */
    if(msgType==="SPM"||msgType==="SOM"){
      // -AAA.06EF 14ABC — lugares por destino
      if((m=line.match(/^-([A-Z]{3})\.(.+)$/))){
        m[2].split(/ +/).forEach(tok=>{
          if(!/^\d{1,3}[A-Z]{1,7}$/.test(tok))
            add(n,line.indexOf(tok)+1,tok.length,"err",`Invalid seat <b>${tok}</b> — row (1–3 digits) + column letter(s), e.g. 06EF 14ABC (RP 171${msgType==="SPM"?"1":"2"} §2.5).`,REF.elem);
        });
        lastWasR=false; continue;
      }
      if(line.startsWith("-")){
        add(n,1,line.length,"err",`Invalid ${msgType} Seats by Destination — <b>-AAA.seats</b> (e.g. -DEN.06EF 14ABC).`,REF.elem);
        continue;
      }
      // categorias AHM 510 (SOM): SOC, PAD, CAT, XCR — linha isolada ou com lugares
      if((m=line.match(/^(SOC|PAD|CAT|XCR)( .+)?$/))){
        if(m[2]) m[2].trim().split(/ +/).forEach(tok=>{
          if(!/^\d{1,3}[A-Z]{1,7}$/.test(tok))
            add(n,line.indexOf(tok)+1,tok.length,"err",`Invalid seat <b>${tok}</b> in category ${m[1]}.`,REF.elem);
        });
        lastWasR=false; continue;
      }
    }

    /* ---------- ETL: cabeçalho de não embarcados (RP 1719c) ---------- */
    if(msgType==="ETL" && line==="NOT BOARDED"){ lastWasR=false; continue; }

    /* ---------- linhas específicas do PFS (RP 1719) ---------- */
    if(msgType==="PFS"){
      // Numerics by Destination: FCO 13/047/032 PAD0/2/1
      if((m=line.match(/^([A-Z]{3}) (\d{1,3}(\/\d{1,3})*)( PAD\d{1,3}(\/\d{1,3})*)?$/))){ lastWasR=false; continue; }
    }

    if((m=line.match(/^END(PNL|ADL|PSM|PFS|SOM|SPM|FTL|PRL|ETL|PART\s*(\d{1,2}))$/))){
      flushPax(); lastGroupMember=null; lastGroupObj=null;
      sawEnd=true; endToken=line;
      if(m[1].startsWith("PART")){
        const p=parseInt(m[2],10);
        if(declaredPart!==null && p!==declaredPart)
          add(n,4,line.length-3,"err",`<b>${line}</b> does not match this part's header (PART${declaredPart}).`,REF.end);
      }else{
        if(m[1]!==msgType)
          add(n,1,line.length,"err",`<b>${line}</b> does not match message type <b>${msgType}</b>.`,REF.end);
        if(partRec) partRec.final=true;
      }
      lastWasR=false;
      continue;
    }

    if(/^ANA\/\d{3,6}$/.test(line)){
      if(msgType==="PNL") add(n,1,line.length,"warn","The ANA element is used in ADL/CAL parts, not in PNL.",REF.elem);
      lastWasR=false; continue;
    }
    if(line.startsWith("RBD")){
      if(!/^RBD( [A-Z]\/[A-Z]+)+$/.test(line))
        add(n,1,line.length,"err","Invalid Class Codes Element — format: <b>RBD F/FA J/JCD Y/YBK…</b> (compartment/classes, space-separated).",REF.rbd);
      else{
        // RP1707b §2.10: compartimento / fare classes (RBD) associadas
        const comp=new Set(), fare=new Set();
        line.slice(3).trim().split(/ +/).forEach(pair=>{
          const [c,f]=pair.split("/");
          if(c) comp.add(c);
          if(f) f.split("").forEach(x=>fare.add(x));
        });
        shared.rbd={comp,fare,line:n,raw:line};
      }
      lastWasR=false; continue;
    }
    if(line.startsWith("CFG")){
      if(!/^CFG\/[A-Z0-9]{2,}(\/[A-Z0-9]{2,3})?( [A-Z]{3} [A-Z0-9]{2,}(\/[A-Z0-9]{2,3})?)*$/.test(line))
        add(n,1,line.length,"err","Invalid Seat Configuration — e.g. <b>CFG/020F179Y</b> or <b>CFG/044F133Y/733 GVA 044F122Y/MD8</b>.",REF.cfg);
      else{
        // RP1707b §2.12: contagem + código do compartimento, por ordem descendente.
        // Só o primeiro troço (embarque); aceita 020F e F20.
        const seg=line.slice(4).split(" ")[0].split("/")[0];
        const seats={}; const order=[];
        const rx=/(\d{1,3})([A-Z])|([A-Z])(\d{1,3})/g; let cm;
        while((cm=rx.exec(seg))!==null){
          const code=cm[2]||cm[3], cnt=parseInt(cm[1]||cm[4],10);
          seats[code]=(seats[code]||0)+cnt; order.push(code);
        }
        if(order.length) shared.cfg={seats,order,line:n,raw:line};
      }
      lastWasR=false; continue;
    }
    if(/^STD\//.test(line)){ if(!/^STD\/([01]\d|2[0-3])[0-5]\d$/.test(line)) add(n,5,4,"err","Invalid STD time — 24-hour clock (HHMM).",REF.elem); lastWasR=false; continue; }
    if(/^ATD\//.test(line)){ if(!/^ATD\/(\d{2})?([01]\d|2[0-3])[0-5]\d$/.test(line)) add(n,5,6,"err","Invalid ATD — HHMM or DDHHMM format.",REF.elem); lastWasR=false; continue; }
    if(line==="SI"){ inSI=true; lastWasR=false; continue; }
    if(/^(FQT |AVAIL$|TRANSIT$|NIL$)/.test(line)){ lastWasR=false; continue; }

    if(line==="DEL"||line==="ADD"||line==="CHG"){
      if(msgType!=="ADL")
        add(n,1,3,"err",`Header <b>${line}</b> is only allowed in ADL messages.`,REF.adl);
      adlHeaders.push(line); adlSection=line; lastSurname=null; sectionHasPnr=false; flushPax(); lastWasR=false; continue;
    }

    if(line.startsWith("-")){
      // ADL: check the sequence for the block we just finished, then reset for next block
      if(msgType==="ADL" && adlHeaders.length>0){
        const seq2=adlHeaders.join(",");
        const exp2=["DEL","ADD","CHG"].filter(h=>adlHeaders.includes(h)).join(",");
        if(seq2!==exp2)
          add(adlBlockLine,1,1,"err",`ADL headers out of order (${seq2}) — the sequence is DEL, ADD, CHG (each appears only if it has entries).`,REF.adl);
        adlHeaders.length=0;
      }
      adlBlockLine=n;
      flushPax(); lastGroupMember=null; lastGroupObj=null; lastSurname=null;
      const tm=line.match(/^-([A-Z]{3})(\d{2,3})([A-Z])(-PAD(\d{1,3}))?$/);
      const cm=line.match(/^-([A-Z]{3})$/);
      if(tm){
        sawTotals=true;
        // RP1708 §2.5: a construção é por compartimento OU por fare class — em qualquer
        // caso o código tem de constar do Class Codes Element (RBD) da mensagem
        if(shared.rbd){
          const cls=tm[3];
          if(!shared.rbd.comp.has(cls) && !shared.rbd.fare.has(cls)){
            const col=5+tm[2].length;
            add(n,col,1,"err",`Class <b>${cls}</b> is not in the <b>${shared.rbd.raw}</b> element (line ${shared.rbd.line}) — the Totals by Destination code must be a declared compartment or fare class (RP 1708 §2.5 · RP 1707b §2.10).`,REF.totals);
          }
        }
        if(msgType==="PNL"||msgType==="ADL"){
          const key=tm[1]+String(parseInt(tm[2],10)).padStart(2,"0")+tm[3];
          const declared=parseInt(tm[2],10);
          // ADL: agregar por bloco (cada mensagem ADL é independente); PNL: agregado por voo
          const dk=(msgType==="ADL"?scopeId:"PNL")+"|"+tm[1]+"|"+tm[3];
          const d=shared.dest[dk] || (shared.dest[dk]={key,declared,sum:0,line:n,msgType});
          if(d.declared!==declared)
            add(n,2,line.length-1,"warn",`Totals for <b>${tm[1]}/${tm[3]}</b> redeclared with a different value (${d.declared} vs ${declared}) in another part.`,REF.totals);
          currentKey=dk;
          if(msgType==="PNL"){
            shared.paxByClass=shared.paxByClass||{};
            shared.paxByClass[tm[3]]=(shared.paxByClass[tm[3]]||0)+parseInt(tm[2],10);
          }
        }
      }else if(cm){
        currentKey=null;
      }else{
        add(n,1,line.length,"err","Invalid Totals by Destination — format: <b>-AAA99C</b> (optional <b>-PADnn</b>), e.g. -FRA03F-PAD15.",REF.totals);
      }
      lastWasR=false; continue;
    }

    if((m=line.match(/^([A-Z]{4,6}) (\d{1,3})([A-Z])$/))){
      if(!RULES.categories.has(m[1]))
        add(n,1,m[1].length,"warn",`Unrecognised category <b>${m[1]}</b> (expected NOSHO/GOSHO…).`,REF.elem);
      lastWasR=false; continue;
    }

    if(line.startsWith(".")){
      // colheita retroativa de .L/ standalone (posição do .L/ não é semântica)
      if(lastGroupMember && lastGroupObj){
        (line.match(/\.L\/[A-Z0-9]+(\/[A-Z0-9]{2,3})?/g)||[]).forEach(x=>{
          const pnr=x.replace(/^\.L\//,"");
          lastGroupMember.pnrs.push(pnr);
          lastGroupObj.pnrs.add(pnr.split("/")[0]);
        });
      }
      validateDotElements(rawLine, n, 0, add, {standalone:true, lastWasR, elemCount:lastNameCount, msgType, paxCtx, rnNext:U[idx+1]});
      if(/^\.RN\//.test(line)){
        if(!lastWasR) add(n,1,4,"err",".RN/ (remarks continuation) without a .R/ element immediately before.",REF.rn);
      } else {
        lastWasR = /(^| )\.R\//.test(line);
      }
      continue;
    }

    if(/^\d/.test(line)){
      // fronteira de colheita retroativa: se este Name Element não pertence ao mesmo
      // identificador de grupo do anterior, terminar aqui (os .L/ seguintes já não são do grupo)
      const nextGrp=line.match(/-([A-Z]{1,2})(\d{1,3})/);
      if(lastGroupObj && (!nextGrp || nextGrp[1]!==lastGroupObj.id)){ lastGroupMember=null; lastGroupObj=null; }
      flushPax();   // close the previous passenger before starting this one
      const nm=rawLine.toUpperCase().trimEnd();
      const nmMatch=nm.match(/^(\d{1,3})(NONAMES|[A-Z]+(?:[ \/][A-Z]+)*)(-([A-Z]{1,2})(\d{1,3}))?(?=( ?\.|$))/);
      if(!nmMatch){
        // diagnóstico dirigido ao problema real
        const grpBad=nm.match(/^(\d{1,3}[A-Z]+(?:[ \/][A-Z]+)*)-([A-Z]{1,2})(?![0-9])/);
        if(grpBad){
          const col=grpBad[1].length+2;
          add(n,col,grpBad[2].length,"err",`Incomplete group identifier <b>-${grpBad[2]}</b> — missing passenger count (e.g. <b>-${grpBad[2]}2</b> for a 2-pax booking).`,REF.group);
        } else if(!/^\d+[A-Z]/.test(nm)){
          add(n,1,rawLine.length,"err","Invalid Name Element — must start with digit(s) followed by the surname (e.g. <b>1CURRIE/MARIE MRS</b>).",REF.name);
        } else if(!/\//.test(nm.split(" ")[0])){
          add(n,1,rawLine.length,"err","Name Element without separator — surname and given name are separated by <b>/</b> (e.g. 1CURRIE/MARIE MRS).",REF.name);
        } else {
          add(n,1,rawLine.length,"err","Invalid Name Element — format: <b>9SURNAME/NAME[ TITLE][/NAME2…][-Xn]</b> (e.g. 1CURRIE/MARIE MRS, 2COSTA/ANAMRS/TIAGOMSTR).",REF.name);
        }
        lastWasR=false; continue;
      }
      const count=parseInt(nmMatch[1],10);
      const namePart=nmMatch[2];
      const grpId=nmMatch[4], grpTotal=nmMatch[5]?parseInt(nmMatch[5],10):null;
      if((msgType==="PNL"||msgType==="ADL") && currentKey && shared.dest[currentKey]) shared.dest[currentKey].sum+=count;

      if(namePart.startsWith("ZZ/")||namePart==="ZZ"){
        const zcode=namePart.split("/")[1]||"";
        if(grpId){ (shared.zz=shared.zz||{}); (shared.zz[grpId]=shared.zz[grpId]||new Set()).add(zcode); }
      } else if(namePart!=="NONAMES"){
        // registo de nomes por destino (deteção de duplicados)
        const sg=namePart.split("/");
        sg.slice(1).forEach(g=>{
          const key=(currentKey||"?")+"|"+sg[0]+"/"+stripTitle(g);
          shared.paxNames=shared.paxNames||{};
          (shared.paxNames[key]=shared.paxNames[key]||[]).push({line:n,col:1,len:nm.length,label:sg[0]+"/"+g});
        });
      }
      if(namePart!=="NONAMES" && !namePart.startsWith("ZZ/")){
        const segs=namePart.split("/");
        if(segs.length<2)
          add(n,nmMatch[1].length+1,namePart.length,"err","Name Element without given name — expected SURNAME/NAME…",REF.name);
        else{
          const given=segs.length-1;
          if(given!==count)
            add(n,1,nmMatch[1].length,"err",`Count <b>${count}</b> does not match the number of names listed in the element (<b>${given}</b>).`,REF.name);
          if(msgType!=="PFS") segs.slice(1).forEach(s=>{
            if(!RULES.titles.some(t=>s.endsWith(t)))
              add(n,nm.indexOf(s)+1,s.length,"info",`Name <b>${s}</b> has no recognised title (MR/MRS/MS/MSTR/MISS/DR…).`,REF.name);
            else{
              const sp=s.match(/ (M(R|RS|S|STR|ISS)|DR|PROF|CHD|INF|REV|SIR|LADY|CAPT)$/);
              if(sp)
                add(n,nm.indexOf(s)+1+sp.index,sp[0].length,"info","Title separated by a space — accepted, but the classic manual form is attached to the name (e.g. MARIEMRS).",REF.name,{tag:"titlespace",code:"titlespace"});
            }
          });
        }
      }
      if(grpId){
        // escopo: PNL -> agregado por voo; ADL -> por secção (ADD/CHG/DEL) dentro deste bloco
        const scopeKey=(msgType==="ADL"?scopeId+"#"+(adlSection||"?"):"PNL")+"|"+grpId;
        const sectionLbl=(msgType==="ADL"&&adlSection)?` in section ${adlSection}`:"";
        const keyLbl=currentKey?currentKey.split("|").slice(-2).join("/"):null;
        // extrair o(s) .L/ deste elemento (PNR address) para depois detetar reutilização
        const pnrs=[];
        (rawLine.toUpperCase().match(/\.L\/[A-Z0-9]+(\/[A-Z0-9]{2,3})?/g)||[]).forEach(x=>pnrs.push(x.replace(/^\.L\//,"")));
        const g=shared.groups[scopeKey]||(shared.groups[scopeKey]={id:grpId,section:adlSection,msgType,declared:grpTotal,sum:0,lines:[],key:currentKey,keyLbl,pnrs:new Set(),members:[]});
        g.sum+=count; g.lines.push(n);
        // 1ZZ/ é placeholder de lugar bloqueado (PSCRM §2.9 Block Seats Indicator):
        // o PNR é herdado do passageiro real do mesmo grupo. Se traz .L/ próprio, tem de bater.
        const isZZ=namePart.startsWith("ZZ/") || namePart==="ZZ";
        const memberRec={line:n,col:1,len:nm.length,pnrs,isZZ};
        g.members.push(memberRec);
        pnrs.forEach(p=>g.pnrs.add(p.split("/")[0]));
        lastGroupMember=memberRec; lastGroupObj=g;
        if(g.declared!==grpTotal)
          add(n,1,nm.length,"warn",`Group <b>-${grpId}</b> with mismatching totals${sectionLbl} (${g.declared} vs ${grpTotal}).`,REF.group);
        if(currentKey && g.key && currentKey!==g.key)
          add(n,1,nm.length,"err",`Group <b>-${grpId}${grpTotal??""}</b> appears in <b>${keyLbl}</b> but other members are in <b>${g.keyLbl}</b> — passengers in the same booking cannot be in different classes/destinations.`,REF.group);
        if(currentKey && !g.key){ g.key=currentKey; g.keyLbl=keyLbl; }
      }

      paxCtx={line:n, name:namePart, count, docs:[], ssrs:[], shared, msgType, grpId:grpId||null, hasPnr:false,
              names:(namePart==="NONAMES"?[]:namePart.split("/")), dest:currentKey};
      const rest=nm.slice(nmMatch[0].length);
      if(rest.length){
        if(msgType==="PSM"){
          // RP1715 §2.8.3: nome + dois espaços + lugar (aceitamos 1–2 na prática de extração)
          if(!/^ {1,2}\d{1,3}[A-Z]{1,2}$/.test(rest))
            add(n,nmMatch[0].length+1,rest.length,"err","After the name in PSM only the seat number may follow (two spaces + seat, RP 1715 §2.8.3, e.g. 1MILLER/JACKMR  23D).",REF.name);
        }else{
          if(rest.startsWith(".")){
            const el=(rest.match(/^\.[A-Z0-9]{1,3}\//)||[rest.slice(0,3)])[0];
            add(n,nmMatch[0].length+1,1,"err",
              grpId
                ? `Missing space between group identifier <b>-${grpId}${grpTotal}</b> and element <b>${el}</b> — .X/ elements are separated from the name by a space.`
                : `Missing space between the name and element <b>${el}</b> — .X/ elements are separated from the name by a space.`,
              REF.name);
          } else if(!rest.startsWith(" ."))
            add(n,nmMatch[0].length+1,rest.length,"err","After the name, .X/ elements are separated by a space.",REF.name);
          validateDotElements(rawLine, n, nmMatch[0].length, add, {standalone:false, elemCount:count, msgType, paxCtx, rnNext:U[idx+1]});
        }
      }
      lastNameCount=count;
      lastWasR=/ \.R\//.test(nm);
      continue;
    }

    add(n,1,line.length,"err","Unrecognised line — does not match any standard PNL/ADL element.",REF.elem);
    lastWasR=false;
  }

  /* ---- verificações finais do bloco ---- */
  if(!sawEnd)
    add(scopeEnd,1,Math.max((U[scopeEnd-1]||"").length,1),"err",`Missing End Element (END${msgType} / ENDPARTn) in this part.`,REF.end);
  if(msgType==="PNL" && !sawTotals && !U.slice(block.start,scopeEnd).some(l=>l.trim()==="NIL"))
    add(block.start+1,1,1,"warn","No Totals by Destination (-AAA99C) nor NIL — a PNL always shows totals, even at zero.",REF.totals);
  if(msgType==="ADL" && adlHeaders.length>0){
    // Check the final destination block (not yet checked because no - line followed it)
    const seq=adlHeaders.join(",");
    const expected=["DEL","ADD","CHG"].filter(h=>adlHeaders.includes(h)).join(",");
    if(seq!==expected)
      add(adlBlockLine,1,1,"err",`ADL headers out of order (${seq}) — the sequence is DEL, ADD, CHG (each appears only if it has entries).`,REF.adl);
  }
  // The last passenger is normally closed by the END element; a message that
  // stops short would otherwise skip every coherence check for that passenger.
  flushPax();
}



/* ============================ VALIDADOR MVT (AHM 780) ============================ */
const T4=/^([01]\d|2[0-3])[0-5]\d$|^2400$/;    // HHMM (2400 = end-of-day convention)
const T6=/^(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])[0-5]\d$|^(0[1-9]|[12]\d|3[01])2400$/; // DDHHMM
function tOK(s){ return s.length===4?T4.test(s):T6.test(s); }
function validateMVT(U,block,scopeEnd,idx,add){
  // linha do voo: XX999/DD[.REG][.STATION]
  if(idx<scopeEnd){
    const f=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    const fm=f.match(/^([A-Z0-9]{2}[A-Z]?\d{1,4}[A-Z]?)\/(\d{2})(\.([A-Z0-9]{2,10}))?(\.([A-Z]{3}))?$/);
    if(!fm)
      add(n,1,U[idx].length||1,"err","Invalid MVT flight identifier — <b>XX999/DD[.REGISTRATION][.STN]</b> (AHM 780 el. 3–4, e.g. TEF402/27.LNDIG.TRF). The registration has no hyphen.",REF.mvt);
    else{
      const d=parseInt(fm[2],10);
      if(d<1||d>31) add(n,f.indexOf("/")+2,2,"err",`Invalid day <b>${fm[2]}</b> (01–31).`,REF.mvt);
      if(fm[4]&&/-/.test(fm[4])) add(n,f.indexOf(fm[4])+1,fm[4].length,"warn","Registration includes a hyphen — AHM 780 el. 4 requires no hyphen in teletype, but ACARS may transmit the full civil registration. Verify the source system.",REF.mvt);
    }
    idx++;
  }
  let inSI=false;
  for(; idx<scopeEnd; idx++){
    const line=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    if(line==="") continue;
    if(inSI) continue;
    if(line==="SI"||line.startsWith("SI ")){ inSI=true; continue; }
    let m;
    // AD (off-block[/airborne]) [EA hhmm AAA]
    if((m=line.match(/^AD(\d{4}|\d{6})(\/(\d{4}|\d{6}))?( EA(\d{4}|\d{6}) ([A-Z]{3}))?$/))){
      [m[1],m[3],m[5]].forEach((t,i)=>{ if(t&&!tOK(t)) add(n,line.indexOf(t)+1,t.length,"err",`Invalid time <b>${t}</b> (HHMM 24h or DDHHMM).`,REF.mvt); });
      continue;
    }
    // EA / EB isolados
    if((m=line.match(/^(EA|EB)(\d{4}|\d{6})( ([A-Z]{3}))?$/))){
      if(!tOK(m[2])) add(n,3,m[2].length,"err",`Invalid time <b>${m[2]}</b>.`,REF.mvt);
      continue;
    }
    // AA touchdown/on-block: AA1218/1225 | AA/1225 | AA032355/040005
    if((m=line.match(/^AA(\d{4}|\d{6})?\/(\d{4}|\d{6})( FLD\d{2})?$/))){
      [m[1],m[2]].forEach(t=>{ if(t&&!tOK(t)) add(n,line.indexOf(t)+1,t.length,"err",`Invalid time <b>${t}</b>.`,REF.mvt); });
      continue;
    }
    if(/^AA/.test(line)){ add(n,1,line.length,"err","Invalid AA element — <b>AA[touchdown]/onblock</b> (AHM 780 el. 9, e.g. AA1218/1225, AA/1225).",REF.mvt); continue; }
    // ED / NI — começam SEMPRE com a data (DDHHMM)
    if((m=line.match(/^(ED|NI)(\d+)$/))){
      if(!T6.test(m[2])) add(n,3,m[2].length,"err",`Invalid <b>${m[1]}${m[2]}</b> — ED/NI always start with the date: DDHHMM (AHM 780).`,REF.mvt);
      continue;
    }
    // RR / FR
    if((m=line.match(/^(RR|FR)(\d{4}|\d{6})(\/(\d{4}|\d{6}))?$/))){
      [m[2],m[4]].forEach(t=>{ if(t&&!tOK(t)) add(n,line.indexOf(t)+1,t.length,"err",`Invalid time <b>${t}</b>.`,REF.mvt); });
      continue;
    }
    // DL / EDL — atrasos: DL72/0120 | DL13/81/0020/0015
    if((m=line.match(/^(E?DL)([A-Z0-9]{2})(\/([A-Z0-9]{2}))?\/(\d{4})(\/(\d{4}))?$/))){
      if((m[4]&&!m[7])||(m[7]&&!m[4])) add(n,1,line.length,"err","The number of delay codes and durations must match — <b>DLcc/hhhh</b> or <b>DLcc/cc/hhhh/hhhh</b> (AHM 780 el. 7).",REF.mvt);
      continue;
    }
    if(/^E?DL\d/.test(line)===false && /^E?DL/.test(line) && !/^DLA/.test(line)){
      add(n,1,line.length,"err","Invalid delay element — <b>DLcc/hhhh</b> or <b>DLcc/cc/hhhh/hhhh</b> (AHM 780 el. 7).",REF.mvt); continue;
    }
    // PX
    if((m=line.match(/^PX\d{1,3}(\/\d{1,3})*$/))){ continue; }
    if(/^PX/.test(line)){ add(n,1,line.length,"err","Invalid PX element — <b>PXn[/n…]</b> (AHM 780 el. 8, e.g. PX57, PX163/47).",REF.mvt); continue; }
    // elementos bilaterais conhecidos (DLA…) e restantes
    add(n,1,line.length,"warn",`Line <b>${line.slice(0,12)}${line.length>12?"…":""}</b> is not a standard AHM 780 MVT element — may be bilateral (e.g. DLA).`,REF.mvt);
  }
}

/* ============================ VALIDADOR DIV (AHM 730) ============================ */
function validateDIV(U,block,scopeEnd,idx,add){
  if(idx<scopeEnd){
    const f=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    if(!/^([A-Z0-9]{2}[A-Z]?\d{1,4}[A-Z]?)\/(\d{2})(\.[A-Z0-9]{2,10})?(\.[A-Z]{3})?$/.test(f))
      add(n,1,U[idx].length||1,"err","Invalid DIV flight identifier — <b>XX999/DD[.REGISTRATION][.ORIGINALDEST]</b> (AHM 730, e.g. TEF0981/13.LNDIG.HFT).",REF.mvt);
    idx++;
  }
  let inSI=false;
  for(; idx<scopeEnd; idx++){
    const line=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    if(line==="") continue;
    if(inSI) continue;
    if(line==="SI"||line.startsWith("SI ")){ inSI=true; continue; }
    let m;
    if((m=line.match(/^EA(\d{4}|\d{6}) ([A-Z]{3})$/))){
      if(!tOK(m[1])) add(n,3,m[1].length,"err",`Invalid time <b>${m[1]}</b>.`,REF.mvt);
      continue;
    }
    if(/^EA/.test(line)){ add(n,1,line.length,"err","Invalid DIV EA element — <b>EAhhmm AAA</b> (new destination), e.g. EA0432 TOS.",REF.mvt); continue; }
    if((m=line.match(/^([A-Z]{4}) PX(\d{1,3})$/))){ continue; }
    add(n,1,line.length,"warn","Unrecognised DIV line — expected <b>EAhhmm AAA</b> and <b>REASON PXnnn</b> (e.g. DRWT PX023).",REF.mvt);
  }
}

/* ==================== VALIDADOR SSM / ASM (SSIM cap. 2 via Avinor) ==================== */
const SCHED_REASONS=new Set(["AIRS","ARPT","COMM","CREW","DAMA","EQUI","FUEL","HDLG","HOLI","INDU","OPER","PERF","POLI","POSI","REPO","ROTA","RTNS","RUNW","TECH","WEAT"]);
const SSM_ACTIONS=new Set(["NEW","CNL","RPL","TIM","FLT","SKD","EQT","ADM","CON"]);
const ASM_ACTIONS=new Set(["NEW","CNL","RPL","RRT","TIM","RIN","ADM","FLT","CON","EQT"]);
const RX_FLTDES=/^[A-Z0-9]{2}[A-Z]?\d{1,4}[A-Z]?$/;
const RX_FLTDT=/^[A-Z0-9]{2}[A-Z]?\d{1,4}[A-Z]?\/\d{2}[A-Z]{3}\d{2}$/;
const RX_LEG=/^([A-Z]{3})(\d{2})?([01]\d|2[0-3])[0-5]\d(\/[1-9])? ([A-Z]{3})(\d{2})?([01]\d|2[0-3])[0-5]\d(\/[1-9])?$/;
const RX_EQUIP=/^[A-Z] [A-Z0-9]{3} [A-Z0-9]+(\.[A-Z0-9]+)*( [A-Z][A-Z0-9]{0,2}-?[A-Z0-9]{1,9})?( \d{1,2}\/\S+)*$/;
const RX_PERIOD=/^(\d{2})([A-Z]{3})(\d{2})?( (\d{2})([A-Z]{3})(\d{2})?)?( ([1-7]{1,7})(\/W[1-9])?)?$/;
function validateSCHED(kind,U,block,scopeEnd,idx,add){
  const ACT=(kind==="SSM")?SSM_ACTIONS:ASM_ACTIONS;
  // time mode opcional
  if(idx<scopeEnd && /^(UTC|LT)$/.test(U[idx].trim().toUpperCase())) idx++;
  else if(idx<scopeEnd) add(idx+1,1,U[idx].trim().length||1,"warn","No Time Mode (<b>UTC</b> or <b>LT</b>) after the identifier — recommended in SSIM.",REF.ssim);

  let expect="action";
  for(; idx<scopeEnd; idx++){
    const line=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    if(line==="") continue;
    if(line==="//"){ expect="action"; continue; }
    if(line==="SI"||line.startsWith("SI ")){ expect="free"; continue; }
    if(expect==="free") continue;

    if(expect==="action"){
      const am=line.match(/^([A-Z]{3})( ([A-Z]{4}))?$/);
      if(!am||!ACT.has(am[1])){
        add(n,1,line.length,"err",`Invalid ${kind} Action Identifier — expected ${[...ACT].join(", ")}${kind==="SSM"?"":" (optionally + XASM or reason)"} (SSIM ch. 2).`,REF.ssim);
        expect="flight"; continue;
      }
      if(am[3] && am[3]!=="XASM" && !SCHED_REASONS.has(am[3]))
        add(n,5,am[3].length,"err",`<b>${am[3]}</b> is neither XASM nor a valid Change Reason (SSIM 2.6: AIRS, ARPT, COMM, CREW, …, WEAT).`,REF.ssim);
      expect="flight"; continue;
    }
    if(expect==="flight"){
      if(kind==="SSM"){
        if(!RX_FLTDES.test(line))
          add(n,1,line.length,"err","Invalid SSM Flight Designator — <b>XX999[suffix]</b> (e.g. TEF9999).",REF.ssim);
        expect="period"; continue;
      }else{
        // ASM: FLT/DDMMMYY [DEIs]  (ação FLT: dois pares na mesma linha)
        const two=line.match(/^(\S+) (\S+)$/);
        if(two && RX_FLTDT.test(two[1]) && RX_FLTDT.test(two[2])){ expect="body"; continue; }
        const fdm=line.match(/^(\S+)((?: \d{1,2}\/\S+)*)$/);
        if(!fdm || !RX_FLTDT.test(fdm[1]))
          add(n,1,line.length,"err","Invalid ASM Flight Identifier — <b>XX999/DDMMMYY</b> optionally followed by DEIs (e.g. FZ021/25JUL26 6/FZ022/25).",REF.ssim);
        else{
          const dt=fdm[1].match(/\/(\d{2})([A-Z]{3})(\d{2})$/);
          if(dt){
            const dd=parseInt(dt[1],10);
            if(dd<1||dd>31) add(n,line.indexOf("/")+2,2,"err",`Invalid day <b>${dt[1]}</b> (01–31).`,REF.ssim);
            if(!RULES.months.includes(dt[2])) add(n,line.indexOf("/")+4,3,"err",`Invalid month <b>${dt[2]}</b> — use JAN…DEC.`,REF.ssim);
          }
        }
        expect="body"; continue;
      }
    }
    if(expect==="period"){
      const pm=line.match(RX_PERIOD);
      if(pm){
        if(!RULES.months.includes(pm[2])) add(n,3,3,"err",`Invalid month <b>${pm[2]}</b>.`,REF.ssim);
        if(pm[6]&&!RULES.months.includes(pm[6])) add(n,line.indexOf(pm[6]),3,"err",`Invalid month <b>${pm[6]}</b>.`,REF.ssim);
        if(pm[9]){
          const days=pm[9];
          for(let i=1;i<days.length;i++) if(days[i]<=days[i-1]){
            add(n,line.indexOf(days)+1,days.length,"err",`Operating days <b>${days}</b> — digits 1–7 in ascending order, no repeats (SSIM).`,REF.ssim);
            break;
          }
        }
        expect="body"; continue;
      }
      // ação FLT do SSM: depois do período vem novo designator — cai no body
      add(n,1,line.length,"err","Invalid period/frequency — <b>DDMMM[YY] [DDMMM[YY]] [days][/Wn]</b> (e.g. 04APR24 03MAY24 1234567).",REF.ssim);
      expect="body"; continue;
    }
    // body: equipamento, legs, DEI/rotas, designator novo (FLT)
    if(RX_LEG.test(line)) continue;
    if(RX_EQUIP.test(line)) continue;
    if(RX_FLTDES.test(line)) continue;                      // novo designator (FLT)
    if(RX_PERIOD.test(line)) continue;                      // período extra (TIM/FLT em SSM)
    if(/^[A-Z]{6} .+$/.test(line)) continue;                // rota + DEI (OSLKKN 10/XY1234/YX432)
    if(/^ANA\/\d+$/.test(line)) continue;
    add(n,1,line.length,"err",`Unrecognised ${kind} line — expected leg (<b>OSL1455 KKN1550</b>), equipment (<b>J 738 C16M165VV738B</b>), route+DEI or //.`,REF.ssim);
  }
}

/* Diagnóstico: se o elemento fica válido depois de normalizar espaços,
   o problema é espaçamento — apontar o sítio exato em vez de erro genérico */
function spacingDiag(f,rx,n,add,ref,label){
  const norm=f.replace(/ {2,}/g," ").replace(/ +$/,"").replace(/^ +/,"");
  if(!rx.test(norm)) return false;
  const ms=f.match(/ {2,}/);
  if(ms){ add(n,ms.index+1,ms[0].length,"err",`${ms[0].length} consecutive spaces in the ${label} — the separator is a single space.`,ref); return true; }
  const tr=f.match(/ +$/);
  if(tr){ add(n,tr.index+1,tr[0].length,"err",`Extra trailing space(s) in the ${label}.`,ref); return true; }
  const ld=f.match(/^ +/);
  if(ld){ add(n,1,ld[0].length,"err",`Space(s) before the ${label}.`,ref); return true; }
  return false;
}

/* ============================ VALIDADOR PIL ============================
   RP 1716 — PIL não tem Address/Comms; começa em PIL (ou identificador extenso).
   Flight Element: XX999/DDMMM AAA [PARTnn] — PARTnn só quando enviado em partes */
function validatePIL(U,block,scopeEnd,idx,add,shared,isLastBlock){
  let declaredPart=null, partRec=null;
  if(idx<scopeEnd){
    const f=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    const RXF=/^([A-Z0-9]{2}[A-Z]?)(\d{1,4})([A-Z])?\/(\d{2})([A-Z]{3}) ([A-Z]{3})( PART\s*(\d{1,2}))?$/;
    const fm=f.match(RXF);
    if(!fm){
      if(!spacingDiag(f,RXF,n,add,REF.flight,"Flight Element"))
        add(n,1,U[idx].length||1,"err","Invalid PIL Flight Element — <b>XX999/DDMMM AAA</b> or <b>XX999/DDMMM AAA PARTn</b> when in parts (RP 1716 §2.2).",REF.flight);
    }else{
      const day=parseInt(fm[4],10);
      if(day<1||day>31) add(n,f.indexOf("/")+2,2,"err",`Invalid day <b>${fm[4]}</b> (01–31).`,REF.flight);
      if(!RULES.months.includes(fm[5])) add(n,f.indexOf("/")+4,3,"err",`Invalid month <b>${fm[5]}</b> — use JAN…DEC.`,REF.flight);
      if(fm[8]){ declaredPart=parseInt(fm[8],10); partRec={num:declaredPart,line:n,key:fm[1]+fm[2]+(fm[3]||"")+"/"+fm[4]+fm[5]}; shared.parts.push(partRec); }
    }
    idx++;
  }
  let sawEnd=false, inCompartment=false, curSeats=new Set(), lastSeat=null, lastComp=null;
  for(; idx<scopeEnd; idx++){
    const rawLine=U[idx]; const line=rawLine.toUpperCase().trimEnd(); const n=idx+1;
    if(line==="") continue;
    let m;
    if((m=line.match(/^END(PIL|PART\s*(\d{1,2}))$/))){
      sawEnd=true;
      if(m[1].startsWith("PART")){
        const p=parseInt(m[2],10);
        if(declaredPart!==null&&p!==declaredPart)
          add(n,4,line.length-3,"err",`<b>${line}</b> does not match this part's header (PART${declaredPart}).`,REF.end);
      }else if(partRec){ partRec.final=true; }
      continue;
    }
    if(sawEnd){ add(n,1,line.length,"warn","Content after the End Element.",REF.end); continue; }
    // Cabeçalho de compartimento: FCLASS (colado, RP1716 §2.3) ou F CLASS
    if((m=line.match(/^([A-Z]) ?CLASS$/))){
      const comp=m[1];
      const RANK={P:1,F:1,A:1,J:2,C:2,D:2,I:2,Z:2,W:3,Y:4};
      if(lastComp && (RANK[comp]!==undefined) && (RANK[lastComp]!==undefined) && RANK[comp]<RANK[lastComp])
        add(n,1,line.length,"warn",`Compartment <b>${comp}</b> after <b>${lastComp}</b> — compartments are listed in descending cabin order (F→C→Y, RP 1716 §2.4 Note 3).`,REF.elem);
      lastComp=comp; inCompartment=true; curSeats=new Set(); lastSeat=null;
      continue;
    }
    if(line==="NIL"){
      if(!inCompartment) add(n,1,3,"err","NIL outside a compartment header (RP 1716 §2.4 Note 2).",REF.elem);
      continue;
    }
    // Linha de continuação: indentação de 8 espaços (RP 1716 §2.4 Nota 4)
    if(/^ {8}\S/.test(rawLine)) continue;
    if(!inCompartment){
      add(n,1,line.length,"err","Passenger line without a preceding compartment header (e.g. FCLASS, YCLASS).",REF.elem);
      continue;
    }
    // Passageiro: seat [dest] [NOME/PROPRIO...] [texto livre]; seat sozinho = lugar vago
    const pm=line.match(/^(\d{1,3}[A-Z]{1,2})( ([A-Z]{3}))?( ([A-Z]+\/[A-Z]+(\/[A-Z]+)*))?( .+)?$/);
    if(!pm){
      add(n,1,line.length,"err","Malformed PIL passenger line — <b>seat [dest] [SURNAME/NAME] [SSR/text]</b> (RP 1716 §2.4, e.g. 17D BKK BROWN/JOHN WCHC OWN).",REF.elem);
      continue;
    }
    const seat=pm[1];
    const seatNum=parseInt(seat.match(/^\d+/)[0],10);
    if(lastSeat!==null && seatNum<lastSeat)
      add(n,1,seat.length,"warn",`Seat <b>${seat}</b> out of ascending seat-number order (RP 1716 §2.4).`,REF.elem);
    lastSeat=seatNum;
    if(curSeats.has(seat))
      add(n,1,seat.length,"err",`Seat <b>${seat}</b> duplicated in this compartment.`,REF.elem);
    curSeats.add(seat);
    // nome com número antes do apelido é proibido no PIL
    if(pm[4]===undefined && pm[7]===undefined && pm[2]===undefined){/* lugar vago */}
    if(/ \d+[A-Z]+\//.test(line))
      add(n,1,line.length,"err","In PIL the name does NOT take a number before the surname (RP 1716 §2.4: BROWN/JOHN, not 1BROWN/JOHN).",REF.name);
  }
  if(!sawEnd) add(scopeEnd,1,1,"err","Missing ENDPIL / ENDPARTn (RP 1716 §2.5).",REF.end);
}

/* ============================ VALIDADOR PTM ============================
   RP 1718 — Flight Element com par de estações: XX999/DDMMM AAABBB PARTn */
function validatePTM(U,block,scopeEnd,idx,add,shared,isLastBlock){
  let declaredPart=null, partRec=null;
  if(idx<scopeEnd){
    const f=U[idx].toUpperCase().trimEnd(); const n=idx+1;
    const RXF=/^([A-Z0-9]{2}[A-Z]?)(\d{1,4})([A-Z])?\/(\d{2})([A-Z]{3}) ([A-Z]{3})([A-Z]{3}) PART\s*(\d{1,2})$/;
    const fm=f.match(RXF);
    if(!fm){
      if(!spacingDiag(f,RXF,n,add,REF.flight,"Flight Element"))
        add(n,1,U[idx].length||1,"err","Invalid PTM Flight Element — <b>XX999/DDMMM AAABBB PARTn</b> (origin+destination pair joined, RP 1718 §2.4, e.g. SK347/24NOV ARNJFK PART1).",REF.flight);
    }else{
      const day=parseInt(fm[4],10);
      if(day<1||day>31) add(n,f.indexOf("/")+2,2,"err",`Invalid day <b>${fm[4]}</b> (01–31).`,REF.flight);
      if(!RULES.months.includes(fm[5])) add(n,f.indexOf("/")+4,3,"err",`Invalid month <b>${fm[5]}</b> — use JAN…DEC.`,REF.flight);
      declaredPart=parseInt(fm[8],10);
      partRec={num:declaredPart,line:n,key:fm[1]+fm[2]+(fm[3]||"")+"/"+fm[4]+fm[5]};
      shared.parts.push(partRec);
    }
    idx++;
  }
  let sawEnd=false, sawNil=false, sawEntry=false;
  for(; idx<scopeEnd; idx++){
    const rawLine=U[idx]; const line=rawLine.toUpperCase().trimEnd(); const n=idx+1;
    if(line==="") continue;
    let m;
    if((m=line.match(/^END(PTM|PART\s*(\d{1,2}))$/))){
      sawEnd=true;
      if(m[1].startsWith("PART")){
        const p=parseInt(m[2],10);
        if(declaredPart!==null&&p!==declaredPart)
          add(n,4,line.length-3,"err",`<b>${line}</b> does not match this part's header (PART${declaredPart}).`,REF.end);
      }else if(partRec){ partRec.final=true; }
      continue;
    }
    if(sawEnd){ add(n,1,line.length,"warn","Content after the End Element.",REF.end); continue; }
    if(line==="NIL"){ sawNil=true; continue; }
    if(line==="SI"){ sawEntry=true; continue; }
    // Entrada: FLT[suf][/DD][/S|N] DEST[/S|N] nC nB[peso K|L] [NOME/PROPRIO...] [.CHDn][.INFn][.RQ|.SA]
    const em=line.match(/^([A-Z0-9]{2}[A-Z]?\d{1,4})([A-Z])?(\/(\d{2}))?(\/([SN]))? ([A-Z]{3})(\/([SN]))? (\d{1,3})([A-Z]) (\d{1,3})B(\d{1,4}[KL])?((\.(CHD|INF)\d{1,2}|\.(RQ|SA))*)( [A-Z]+(\/[A-Z]+)+((\.(CHD|INF)\d{1,2}|\.(RQ|SA))*))?$/);
    if(!em){
      add(n,1,line.length,"err","Invalid PTM entry — <b>FLT[/DD][/S|N] DEST nX nB[weight K|L] [SURNAME/NAME] [.CHDn][.INFn][.RQ|.SA]</b> (RP 1718 §2.5–2.7).",REF.elem);
      continue;
    }
    sawEntry=true;
    if(em[4] && (parseInt(em[4],10)<1||parseInt(em[4],10)>31))
      add(n,line.indexOf("/"+em[4])+2,2,"err",`Invalid connection day <b>${em[4]}</b> (01–31).`,REF.elem);
  }
  if(!sawEnd) add(scopeEnd,1,1,"err","Missing ENDPTM / ENDPARTn (RP 1718 §2.8).",REF.end);
  if(!sawEntry && !sawNil)
    add(block.start+1,1,3,"warn","PTM with no transfer entries and no <b>NIL</b> — with no transfers, the body is a single NIL line (RP 1718 §2.4 Note).",REF.elem);
}

/* ---- validação dos elementos .X/ numa linha (inline ou isolados) ---- */
/* Construções da RP1707b Secção 3; códigos da RP1708 §2.12.7/§2.12.8 + AIRIMP §2.11.6.7 */
const RX={
  fltinfo:/^([A-Z0-9]{2}[A-Z]?\d{1,4}[A-Z]?)([A-Z])(\d{2})([A-Z]{3})([A-Z]{3})?(\d{4})?([+-][12])?([A-Z]{2})?$/, // .I/ .O/
  mkt:/^([A-Z0-9]{2}[A-Z]?\d{1,4}[A-Z]?)([A-Z])(\d{2})([A-Z]{3})([A-Z]{3})(\d{4})?([A-Z]{2})?$/,               // .M/
  pnr:/^[A-Z0-9]{5,8}(\/[A-Z0-9]{2,3})?$/,                                                                      // .L/
  prio:/^[A-Z0-9]{1,8}(-\d{2}[A-Z]{3}\d{2})?$/,                                                                 // .DG .ID .RG
  fqt:/^[A-Z0-9]{2} [A-Z0-9]{1,20}([\/\-][A-Z0-9]{1,10})?$/,                                                    // .F/
  bagN:/^\d{10}\d{3}\/[A-Z]{3}$/, bagA:/^[A-Z0-9]{2,15}\/\d{1,3}\/[A-Z]{3}$/,                                   // .N/
  dbc:/^(V|I)(\/.+)?$/,                                                                                          // .DBC/
  bg:/^\d{3}$/,                                                                                                  // .BG/
  wl:/^[A-Z0-9]{1,8}$/,                                                                                          // .WL/
  sec:/^[A-Z]{2}(\/|$)/,                                                                                         // .S/ começa por país ISO
  date:/^\d{2}(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\d{2}$/,
  seatTok:/^(\d{1,3}[A-Z]{1,7}|\d{1,3}[A-Z]?-\d{1,3}[A-Z](-[A-Z])?|\d{1,3}[A-Z]-[A-Z]|\d{1,3}ROW|ALL|REST|NIL)$/,
  status:/^([A-Z]{2})(\d{1,3})$/
};
const PAXID=/-\d{0,2}[A-Z]+(\/[A-Z]*)*\s*$/; // associação -1NOME/APELIDO no fim (/ final aceite — given name pode continuar no .RN/)

// Devolve o texto inicial de uma linha .RN/ até ao próximo elemento .XX/ (ou
// fim de linha). Usado para "espreitar" a continuação ao validar um campo do
// .R/ anterior que pode ter sido cortado a meio (ex.: uma data DDMMMYY
// partida entre a linha .R/DOCS e a .RN/ seguinte). Não consome nem marca a
// linha — esta continua a ser processada normalmente pelo loop principal.
function firstRNChunk(nextRawLine){
  if(!nextRawLine) return "";
  const l = nextRawLine.toUpperCase().replace(/\s+$/,"");
  const re=/\.(RN|RG1|RG2|ID1|ID2|DG1|DG2|DBC|BG|SN|WL|O[2-9]?|[A-Z])(\/)?/g;
  const m0=re.exec(l);
  if(!m0 || m0[1]!=="RN" || !m0[2]) return "";
  const start=m0.index+m0[0].length;
  re.lastIndex=start;
  const m1=re.exec(l);
  const end=m1?m1.index:l.length;
  return l.slice(start,end).replace(/\s+$/,"");
}

function stripPax(s){ return s.replace(PAXID,"").replace(/\s+$/,""); }

function validateDotElements(rawLine, n, fromIdx, add, opts){
  const line = rawLine.toUpperCase().replace(/\s+$/,"");
  // apanhar QUALQUER .XXX (com ou sem barra) — a validação decide depois
  const re=/\.(RN|RG1|RG2|ID1|ID2|DG1|DG2|DBC|BG|SN|WL|O[2-9]?|[A-Z])(\/)?/g;
  re.lastIndex = fromIdx;
  const hits=[];
  let m;
  while((m=re.exec(line))!==null){
    // "element position": start of line, or preceded by a space.
    // Um ponto colado a texto (ex.: free text ".TRUNKS") não é elemento.
    const atStart = m.index===0 || m.index===fromIdx;
    const prevCh  = m.index>0 ? line[m.index-1] : " ";
    const spaced  = atStart || prevCh===" ";
    if(!m[2]){
      // elemento sem a barra obrigatória (ex.: .WLSAL, .RSEAT, .ID2N2)
      // — only when in element position; otherwise it is free text
      if(spaced)
        add(n,m.index+1,m[0].length,"err",`Element <b>.${m[1]}</b> without the mandatory slash — the construction is <b>.${m[1]}/value</b> (RP 1707b Sec.3).`,REF.elem);
      continue;
    }
    // elemento colado ao anterior, sem o espaço separador
    if(!spaced) hits.push({tag:m[1], idx:m.index, len:m[0].length, glued:true});
    else hits.push({tag:m[1], idx:m.index, len:m[0].length});
  }
  // reportar elementos não separados por espaço
  hits.forEach((h,k)=>{
    if(!h.glued) return;
    const prev = k>0 ? "."+hits[k-1].tag+"/" : "the previous element";
    add(n,h.idx+1,1,"err",`Missing space between <b>${prev}</b> and <b>.${h.tag}/</b> — elements are always separated by a space (RP 1707b Sec.2/3).`,REF.elem);
  });
  let lCount=0, lNoDesignator=0, lFirstCol=0;

  hits.forEach((h,k)=>{
    const col=h.idx+1;
    const start=h.idx+h.len;
    const endIdx=(k+1<hits.length)?hits[k+1].idx:line.length;
    let content=line.slice(start,endIdx).replace(/\s+$/,"");
    const tag=h.tag;

    const bad=(len,msg,ref)=>add(n,start+1,Math.max(len,1),"err",msg,ref||REF.elem);

    if(RULES.dotNotInUse.has("."+tag)){
      add(n,col,h.len,"warn",`Element <b>.${tag}/</b> is not in use in the standard (RP1707b Sec.3) — may be bilateral usage; confirm with the recipient.`,REF.elem,{tag:"elemunk",code:"."+tag+"/"});
      return;
    }

    switch(true){
      case tag==="R": validateRemark(content,n,start,add,opts&&opts.elemCount,opts&&opts.msgType,opts&&opts.paxCtx,opts&&opts.rnNext); break;
      case tag==="RN": {
        checkHyphens(content,n,start,add,null);
        const pc=opts&&opts.paxCtx;
        if(pc&&pc.pendingDocs){
          // A continuation resumes whatever the 64-character limit cut off, which
          // is the END of the element. If the association (-1SURNAME/NAME) had
          // already started, the continuation completes THAT, not the document
          // fields — e.g. ".R/DOCS …-1KALU/SAMUELJOHNBOSCOM" + ".RN/R".
          const rec = pc.pendingDocs;
          const a = content.match(PAXID);
          if(rec.assoc)      rec.assoc += content;
          else if(a){        rec.raw += content.slice(0, a.index); rec.assoc = content.slice(a.index); }
          else               rec.raw += content;
        }
        break;
      } // continuação: texto livre
      case tag==="SN": break; // continuação de .S/
      case tag==="L": {
        lCount++; if(lCount===1) lFirstCol=col;
        if(opts&&opts.paxCtx) opts.paxCtx.hasPnr=true;
        const c=stripPax(content);
        if(RX.pnr.test(c)){ if(!/\//.test(c)) lNoDesignator++; }
        else {
          // A locator outside the 5–8 range is not necessarily wrong: several
          // systems issue longer references. Only a bad character set is an error.
          const m=c.match(/^([A-Z0-9]+)(\/[A-Z0-9]{2,3})?$/);
          if(m)
            add(n,start+1,content.length,"warn",
              `PNR address <b>${m[1]}</b> has ${m[1].length} characters — RP 1707b §3.18 describes 5–8. Longer locators are used bilaterally; confirm with the recipient.`,REF.elem);
          else
            bad(content.length,"Malformed .L/ element (PNR address) — alphanumeric locator, optionally /XX(X) airline (e.g. .L/ABC123/JD).");
        }
        break;
      }
      case tag==="I": {
        const c=stripPax(content);
        if(!RX.fltinfo.test(c)) bad(content.length,"Malformed Inbound Connection .I/ — flight+class+day+airport[+airport][+time][+date-var][+status] (e.g. .I/SR559F07MUC, .I/NZ040X27AKL0651-1HK).");
        break;
      }
      case /^O[2-9]?$/.test(tag): {
        const c=stripPax(content);
        if(!RX.fltinfo.test(c)) bad(content.length,`Onward Connection .${tag}/ malformado — voo+classe+dia[+embarque]+destino[+hora][+status] (ex.: .O/BA012C26LHR1500HK).`);
        break;
      }
      case tag==="M": {
        const c=stripPax(content);
        if(!RX.mkt.test(c)) bad(content.length,"Malformed Marketing Flight .M/ — flight+class+day+origin+destination[+time][+status] (e.g. .M/UA3517F16FRAJFK1000HK).");
        break;
      }
      case tag==="F": {
        if(!RX.fqt.test(stripPax(content))) bad(content.length,"Malformed Frequent Traveller .F/ — airline (2 char.) + space + account number (e.g. .F/KL 123456789).");
        break;
      }
      case tag==="N": {
        const c=stripPax(content);
        if(!RX.bagN.test(c) && !RX.bagA.test(c)) bad(content.length,"Malformed Baggage Tag .N/ — numeric: 10 digits+3 digits/DES (e.g. .N/0074123456005/SFO) or alphanumeric: TAG/n/DES (e.g. .N/KL123456/5/SFO).");
        break;
      }
      case tag==="BG": {
        if(!RX.bg.test(stripPax(content))) bad(content.length,"Malformed Baggage Pooling .BG/ — 3-digit reference number (e.g. .BG/001).");
        break;
      }
      case tag==="DBC": {
        if(!RX.dbc.test(stripPax(content))) bad(content.length,"Malformed Denied Boarding Compensation .DBC/ — V or I, optionally /text (e.g. .DBC/V/USD200 PAID IN CASH).");
        break;
      }
      case /^(DG1|DG2|ID1|ID2|RG1|RG2)$/.test(tag): {
        if(!RX.prio.test(stripPax(content))) bad(content.length,`Malformed .${tag}/ element — priority code, optionally -seniority date (e.g. .${tag}/PSN49-08AUG91).`);
        else{
          const d=stripPax(content).match(/-(\d{2}[A-Z]{3}\d{2})$/);
          if(d && !RX.date.test(d[1])) add(n,start+1+stripPax(content).indexOf(d[1]),d[1].length,"err",`Invalid seniority date <b>${d[1]}</b> — DDMMMYY format.`,REF.elem);
        }
        break;
      }
      case tag==="W": {
        const c=stripPax(content);
        if(!/^(P\/\d{1,3}|[KL]\/\d{1,3}\/\d{1,4})$/.test(c))
          bad(content.length,"Malformed Pieces/Weight .W/ — <b>.W/P/n</b> (pieces) or <b>.W/K|L/pieces/weight</b> (e.g. .W/K/2/20), RP 1707b.");
        break;
      }
      case tag==="WL": {
        if(!RX.wl.test(stripPax(content))) bad(content.length,"Malformed Wait List .WL/ (e.g. .WL/AB84).");
        break;
      }
      case tag==="C": case tag==="D": {
        if(!stripPax(content).length) bad(1,`Elemento .${tag}/ sem conteúdo.`);
        break;
      }
      case tag==="S": {
        const c=stripPax(content);
        if(!RX.sec.test(c)) bad(content.length,"Malformed Security Information .S/ — starts with the 2-letter ISO country code, fields separated by / (e.g. .S/US/8972657824).");
        /* oblíquas finais vazias aceites — surgem nos exemplos oficiais (.S/US/123454321///, RP1719b) */
        break;
      }
      case tag==="T": add(n,col,h.len,"warn","Element .T/ is reserved (electronic ticketing) — must not be used.",REF.elem); break;
      default:
        add(n,col,h.len,"warn",`Unknown element <b>.${tag}/</b> — not in RP1707b Sec.3; may be bilateral, confirm with the recipient.`,REF.elem,{tag:"elemunk",code:"."+tag+"/"});
    }
  });

  // múltiplos .L/ no mesmo passageiro exigem designador de companhia em todos
  if(lCount>1 && lNoDesignator>0)
    add(n,lFirstCol,3,"err","Multiple .L/ elements on the same passenger — the airline designator (/XX) is mandatory on all (RP1707b §3.18).",REF.elem);
}

/* Hífens no conteúdo de .R//.RN/: o hífen está reservado para a associação
   a passageiro no FIM do elemento (RP1707b §3.24/§3.37). Qualquer outro hífen
   no free text pode ser interpretado pelo sistema recetor como início da
   identificação de passageiro. Exceção: intervalos de lugares (§2.22) nos
   SSR de lugar (21A-C, 21-24A-D…). */
const SEAT_SSRS=["SEAT","RQST","NSST","NSSA","NSSB","NSSW","GPST","SMST","SMSA","SMSB","SMSW","SMSR","NSSR"];
function checkHyphens(content,n,start,add,code){
  // associação a passageiro válida no fim do elemento
  const pax=content.match(PAXID);
  const paxIdx=pax?content.length-pax[0].length:-1;
  const seatOk=code&&SEAT_SSRS.includes(code);
  for(let i=0;i<content.length;i++){
    if(content[i]!=="-") continue;
    if(i===paxIdx) continue; // início da associação a passageiro
    if(i>paxIdx&&paxIdx>=0) continue; // dentro da associação
    if(seatOk){
      // hífen dentro de um token de lugares válido (ex.: 21A-C)?
      const ts=content.lastIndexOf(" ",i)+1;
      let te=content.indexOf(" ",i); if(te<0)te=content.length;
      if(RX.seatTok.test(content.slice(ts,te))) continue;
    }
    add(n,start+1+i,1,"err","Hyphen in the Remarks Element free text — the hyphen is reserved for passenger association at the end of the element (e.g. -1SILVA/JOAOMR) and may be misinterpreted by the receiving system. Reword the text without a hyphen.",REF.remarks);
  }
}

/* Remove o título do nome próprio (MARYLYNMRS -> MARYLYN) */
function stripTitle(s){
  const t=(s||"").replace(/\s+/g,"");
  let best=t;
  RULES.titles.forEach(x=>{ if(t.length>x.length && t.endsWith(x)){ const c=t.slice(0,-x.length); if(c.length<best.length) best=c; } });
  return best;
}
/* Tolerante a truncagem: aceita quando um é prefixo do outro */
function nameMatches(a,b){
  a=(a||"").replace(/[^A-Z0-9]/g,""); b=(b||"").replace(/[^A-Z0-9]/g,"");
  if(!a||!b) return true;
  return a.startsWith(b)||b.startsWith(a);
}

/* Coerência ao nível do passageiro: documentos, datas, INFT/CHLD, género.
   Fontes: AIRIMP §3.13 (DOCS) e §2.11.6.7 (matriz SSR); a tabela de padrões
   de passaporte é heurística e externa aos manuais (ver topo do ficheiro). */
function checkPaxCoherence(pax,add,flightDate){
  if(!pax) return;
  const today=new Date();
  const has=c=>pax.ssrs.includes(c);

  pax.docs.forEach(d=>{
    const col=x=>d.base+d.posOf(x);
    // --- nome do documento vs Name Element (AIRIMP §3.13.2) ---
    if(d.raw){
      const fs=d.raw.split("/").map(x=>x.trim());
      const dSur=fs[8]||"", dGiv=(fs[9]||"").replace(/^H$/,"");
      if(dSur){
        let tSur=pax.names[0]||"", tGiv=pax.names[1]||"";
        if(d.assoc){ // associação -1APELIDO/NOME identifica o passageiro
          const am=d.assoc.replace(/^-\d*/,"").split("/");
          if(am[0]) tSur=am[0];
          if(am[1]) tGiv=am[1];
        } else if(pax.count>1){ tSur=null; } // ambíguo: vários pax sem associação
        if(tSur){
          if(!nameMatches(dSur,tSur))
            add(d.line,d.col,dSur.length,"err",`Surname in DOCS (<b>${dSur}</b>) does not match the passenger (<b>${tSur}</b>) — document associated with the wrong passenger (AIRIMP §3.13.2).`,REF.remarks);
          else if(dGiv && !nameMatches(dGiv,stripTitle(tGiv)))
            add(d.line,d.col,dSur.length+1+dGiv.length,"err",`Given name in DOCS (<b>${dGiv}</b>) does not match the passenger (<b>${stripTitle(tGiv)}</b>) — check the document association.`,REF.remarks);
        }
      }
    }
    // --- nascimento ---
    const birth=parseDDMMMYY(d.birth,"past");
    if(birth){
      const age=(today-birth)/(365.2425*864e5);
      if(age<0)
        add(d.line,col(5),d.birth.length,"err",`DOCS: date of birth <b>${d.birth}</b> is in the future.`,REF.remarks);
      else if(flightDate && birth>flightDate)
        add(d.line,col(5),d.birth.length,"err",`DOCS: date of birth <b>${d.birth}</b> (${fmtD(birth)}) is after the flight date (${fmtD(flightDate)}).`,REF.remarks);
    }

    // --- validade vs data do voo ---
    const exp=parseDDMMMYY(d.expiry,"future");
    if(exp && flightDate && exp<flightDate)
      add(d.line,col(7),d.expiry.length,"err",`Document expired at the flight date — expiry <b>${d.expiry}</b> (${fmtD(exp)}) before the flight on ${fmtD(flightDate)}.`,REF.remarks);

    // --- nacionalidade vs país emissor ---
    if(d.nat && d.issuer && d.nat!==d.issuer)
      add(d.line,col(4),d.nat.length,"info",`Nationality <b>${d.nat}</b> differs from issuing country <b>${d.issuer}</b> — legitimate, but unusual; please confirm.`,REF.remarks,{tag:"natissuer",code:"natissuer"});

    // --- padrão do nº de passaporte por país (apenas tipo P) ---
    if(d.type==="P" && d.num){
      const key=PASSPORT_PATTERNS[d.issuer]?d.issuer:(ISO2TO3[d.issuer]||null);
      const pat=key?PASSPORT_PATTERNS[key]:null;
      if(pat && !pat.re.test(d.num))
        add(d.line,col(3),d.num.length,"warn",`Passport number <b>${d.num}</b> does not match the usual pattern for <b>${key}</b> (e.g. ${pat.ex}) — please confirm. Formats vary over time; heuristic check, not normative.`,REF.remarks,{tag:"ppfmt",code:"ppfmt:"+key});
    }

    // --- género infantil vs SSR ---
    const inf=/^(MI|FI)$/.test(d.gender);
    if(inf && !has("INFT"))
      add(d.line,col(6),d.gender.length,"warn",`DOCS with gender <b>${d.gender}</b> (infant) but the passenger has no associated <b>INFT</b> SSR.`,REF.remarks);
    if(!inf && d.gender && has("INFT") && pax.docs.length===1)
      add(d.line,col(6),d.gender.length,"info",`Passenger with <b>INFT</b> SSR but no infant DOCS (gender MI/FI) — check whether the infant document is missing.`,REF.remarks,{tag:"inftdocs",code:"inftdocs"});
  });

  // --- idade vs INFT / CHLD ---
  // Calendar-based comparison — avoids float boundary error where
  // 730 / 365.2425 = 1.9986 (< 2), silently passing a 2-year-old as INFT.
  function calYrs(d1, d2){
    // Complete calendar years from Date d1 to Date d2
    let y = d2.getUTCFullYear() - d1.getUTCFullYear();
    if( d2.getUTCMonth() < d1.getUTCMonth() ||
       (d2.getUTCMonth()===d1.getUTCMonth() && d2.getUTCDate() < d1.getUTCDate()) ) y--;
    return y;
  }
  const docBirth=(pax.docs.find(d=>/^(MI|FI)$/.test(d.gender))||{}).birth;
  if(flightDate){
    const iRec=pax.inftDate, cRec=pax.chldDate;
    const iRaw=(iRec&&iRec.raw)||docBirth;
    if(has("INFT") && iRaw){
      const b=parseDDMMMYY(iRaw,"past");
      if(b){
        const age=calYrs(b,flightDate);
        if(age>=2)
          add((iRec&&iRec.line)||pax.line,(iRec&&iRec.col)||1,(iRec&&iRec.len)||1,"err",`SSR <b>INFT</b> with birth <b>${iRaw}</b> — the infant would be ${age} year${age===1?"":"s"} old at the flight date; INFT applies to under-2s.`,REF.remarks);
        else if(age<0)
          add((iRec&&iRec.line)||pax.line,(iRec&&iRec.col)||1,(iRec&&iRec.len)||1,"err",`SSR <b>INFT</b> with birth <b>${iRaw}</b> after the flight date.`,REF.remarks);
      }
    }
    if(has("CHLD") && cRec && cRec.raw){
      const b=parseDDMMMYY(cRec.raw,"past");
      if(b){
        const age=calYrs(b,flightDate);
        if(age>=12)
          add(cRec.line,cRec.col,cRec.len,"warn",`SSR <b>CHLD</b> with birth <b>${cRec.raw}</b> — the child would be ${age} years old at the flight date; CHLD applies from 2 to 11.`,REF.remarks);
        else if(age<2)
          add(cRec.line,cRec.col,cRec.len,"warn",`SSR <b>CHLD</b> with birth <b>${cRec.raw}</b> — under 2 years at the flight date; should be <b>INFT</b>.`,REF.remarks);
      }
    }
  }

  // --- INFT associado a CHLD (AIRIMP §3.16.1) ---
  // O SSR INFT deve estar no registo do adulto responsavel pelo infant
  // ("the adult on whose lap the infant will be seated"). Um passageiro CHLD
  // nao e um adulto e nao pode ser responsavel por um infant.
  // Guard: only check when count===1. Multi-count name elements share the same
  // paxCtx, so CHLD and INFT can legitimately belong to different passengers
  // (e.g. 2SILVA/JOAOMRS/PEDROMSTR where the adult has INFT and the child has CHLD).
  // When count>1 the engine cannot resolve which SSR belongs to which person.
  if(has("INFT") && has("CHLD") && pax.count===1){
    const iRec=pax.inftDate;
    add((iRec&&iRec.line)||pax.line,(iRec&&iRec.col)||1,(iRec&&iRec.len)||1,
      "err","SSR <b>INFT</b> on a <b>CHLD</b> passenger — an infant must be in the care of an adult. Move the SSR INFT to the adult passenger’s record (AIRIMP §3.16.1).",
      REF.ssr);
  }
}

/* .R/ Remarks (RP1707b §3.24 + RP1708 §2.12) */
function validateRemark(content,n,start,add,elemCount,msgType,paxCtx,rnNext){
  const nextIsRN=/^\s*\.RN\//i.test(rnNext||"");
  const mm=content.match(/^(\d{1,2})?([A-Z]+)/);
  if(!mm){
    add(n,start+1,Math.max(content.length,1),"err","Remarks Element .R/ without a code — expected an SSR/OSI code (e.g. VGML, WCHR, VIP).",REF.remarks);
    return;
  }
  const cntLen=(mm[1]||"").length;
  const letters=mm[2];
  let code=null, attached=false, statusEnd=0;
  if(letters.length===6 && RULES.pnlCodes.has(letters.slice(0,4)) &&
     RULES.statusCodes.has(letters.slice(4,6)) && /^\d/.test(content.slice(cntLen+6))){
    code=letters.slice(0,4); attached=true;
    const cm=content.slice(cntLen+6).match(/^\d{1,3}/);
    statusEnd=cntLen+6+cm[0].length;
  }else{
    code=letters;
    statusEnd=cntLen+code.length;
  }
  const codeCol=start+1+cntLen;
  const isOsi=RULES.osiCodes.has(code);
  if(!RULES.pnlCodes.has(code) && !isOsi){
    let hint="";
    if(code==="TOP") hint=" In the standard the tour operator is shown in the <b>.D/</b> element (e.g. .D/AIR2000).";
    if(code==="CHD") hint=" The CHD code was discontinued (31MAY08) — use SSR <b>CHLD</b>.";
    add(n,codeCol,code.length,"warn",`<b>${code}</b> is not in RP1708 §2.12.7/§2.12.8 nor the AIRIMP §2.11.6.7 matrix — it may be a bilateral code; confirm with the recipient.${hint}`,REF.ssr,{tag:"ssrunk",code});
  }
  if(code==="CHD" )
    add(n,codeCol,code.length,"warn","OSI code <b>CHD</b> discontinued since 31MAY08 — use SSR <b>CHLD</b>.",REF.ssr);
  if(cntLen && !isOsi && code!=="CHD")
    add(n,start+1,cntLen,"err",`A count before the code is only allowed on OSI codes (e.g. 2VIP) — <b>${mm[1]}${code}</b> is not valid.`,REF.remarks);

  // status/action code — exceto FQT*: o free text começa pela companhia (ex.: KL), nunca é status
  let free="";
  let hasStatus=attached;
  const noStatus=/^FQT[VRSU]$/.test(code);
  if(noStatus){
    free=content.slice(statusEnd).replace(/^ +/,"");
  }else if(!attached){
    let after=content.slice(statusEnd);
    const hadSpace=/^ /.test(after);
    after=after.replace(/^ +/,"");
    const st=after.match(/^([A-Z]{1,2})(\d{1,3})?(?=[ \/\-]|$)/);
    let consumed=0;
    if(st){
      const L=st[1], D=st[2];
      const looksStatus=(D!==undefined && L.length<=2)||RULES.statusCodes.has(L);
      if(looksStatus){
        const stCol=start+1+statusEnd+(hadSpace?1:0);
        if(!RULES.statusCodes.has(L))
          add(n,stCol,L.length+(D||"").length,"err",`Invalid status/action code <b>${L}${D||""}</b> — expected 2 letters (HK, KK, NN, UN, NO, XX…) + count (e.g. HK1).`,REF.status);
        else if(D===undefined)
          add(n,stCol,L.length,"err",`Status <b>${L}</b> without seat count — expected e.g. <b>${L}1</b>.`,REF.status);
        else hasStatus=true;
        consumed=st[0].length;
      }
    }
    free=after.slice(consumed).replace(/^ +/,"");
  }else{
    free=content.slice(statusEnd).replace(/^ +/,"");
  }
  // hífen no free text: reservado para associação a passageiro (-1NOME/APELIDO)
  checkHyphens(content,n,start,add,code);
  free=stripPax(free);

  // ambiguidade: elemento com vários passageiros, remark para menos, sem associação
  if(elemCount>1){
    const hasPax=PAXID.test(content);
    const stC=(function(){ const s=content.match(/\b[A-Z]{2}(\d{1,3})(?=[ \/\-]|$)/); return s?parseInt(s[1],10):null; })();
    if(!hasPax && stC!==null && stC<elemCount)
      add(n,start+1,content.length,"warn",`Remark for ${stC} passenger(s) in an element with ${elemCount} — without association (<b>-1SURNAME/NAME</b>) the receiving system cannot tell whom it applies to (RP 1707b §3.24/§3.37).`,REF.remarks);
  }

  // status obrigatório: em PNL/ADL todos os SSR levam status+contagem (regra operacional);
  // exceções: códigos OSI (VIP…), FQT* (o texto começa pela companhia) e códigos desconhecidos (já erraram)
  const pnladl=(msgType==="PNL"||msgType==="ADL");
  const mx=SSR_MATRIX[code];               // [action][freeTextRequest]
  const actionRule=mx?mx[0]:null;          // M | O | N
  const ftRule=mx?mx[1]:null;
  // Elemento inteiramente vazio (nada além do código) com .RN/ a seguir de imediato:
  // o status e o payload completos vêm na continuação — não é status em falta.
  const deferredToRN = nextIsRN && statusEnd===content.length && !hasStatus;
  if(!hasStatus && !noStatus && !isOsi && !deferredToRN){
    // Só exigir status quando a matriz do AIRIMP o marca como Mandatory.
    // Para códigos fora da matriz mantém-se a regra operacional do PNL/ADL.
    const required = pnladl && (mx ? actionRule==="M" : RULES.pnlCodes.has(code));
    if(required || RULES.statusRequired.has(code))
      add(n,codeCol,code.length,"err",`SSR <b>${code}</b> without status/action code — the AIRIMP matrix (§2.11.6.7) marks the action code as mandatory for this code (e.g. ${code} HK1).`,REF.status);
  }
  // free text obrigatório segundo a matriz
  if(ftRule==="M" && !free && !noStatus && pnladl && !deferredToRN)
    add(n,codeCol,code.length,"warn",`SSR <b>${code}</b> without text/data after the status — the AIRIMP matrix (§2.11.6.7) marks the free text as mandatory for this code.`,REF.ssr);

  // registar no contexto do passageiro (para verificações de coerência)
  if(paxCtx){
    paxCtx.ssrs.push(code);
    const sh=paxCtx.shared;
    // lugares atribuídos (deteção de duplicados) — só PNL
    if(sh && paxCtx.msgType==="PNL" && SEAT_SSRS.includes(code) && free){
      free.split(/ +/).forEach(tok=>{
        if(/^\d{1,3}[A-Z]$/.test(tok)){
          sh.seats=sh.seats||{};
          const p=content.indexOf(tok);
          (sh.seats[tok]=sh.seats[tok]||[]).push({line:n,col:start+1+(p>=0?p:0),len:tok.length,pax:paxCtx.name});
        }
      });
    }
    // SSRs que bloqueiam lugares exigem placeholder 1ZZ/ no mesmo grupo (PSCRM §2.9)
    if(sh && ["CBBG","STCR","EXST"].includes(code)){
      sh.zzNeed=sh.zzNeed||[];
      sh.zzNeed.push({code,line:n,col:codeCol,len:code.length,pax:paxCtx.name,grp:paxCtx.grpId||null});
    }
    if(code==="INFT"||code==="CHLD"){
      const dm=free.match(/\b(\d{2}[A-Z]{3}\d{2})\b/);
      if(dm) paxCtx[code==="INFT"?"inftDate":"chldDate"]={raw:dm[1],line:n,col:start+1+content.indexOf(dm[1]),len:dm[1].length};
    }
  }

  // validação do free text de SSRs estruturados
  if(["SEAT","RQST","NSST","NSSA","NSSB","NSSW","GPST","SMST","SMSA","SMSB","SMSW"].includes(code) && free){
    free.split(/ +/).forEach(tok=>{
      if(!RX.seatTok.test(tok)){
        const p=content.indexOf(tok);
        add(n,start+1+(p>=0?p:0),tok.length,"err",`Invalid seat indication <b>${tok}</b> — formats: 4C, 20AC, 21A-C, 21-23A, 25ROW, ALL, REST, NIL (RP1707b §2.22).`,REF.remarks);
      }
    });
  }
  if(code==="TKNE" && free){
    // Extract ticket number from the front of free — name associations may contain spaces
    // (e.g. Arabic surnames: -1AL KARAD/AREEJMS) so stripPax does not always remove them.
    // Only the leading (INF)?<digits>[/coupon] matters; anything after it is name/flight data.
    const tknePfx = free.match(/^((INF)?\d{13,14}(?:\/\d{1,4})?)/);
    if(!tknePfx){
      const p=content.indexOf(free);
      const disp=free.split(/[-\s]/)[0]||free;
      add(n,start+1+(p>=0?p:0),disp.length,"err",`TKNE with invalid ticket <b>${disp}</b> — ticket number (13–14 digits) optionally /coupon (e.g. 0122106026463/2).`,REF.remarks);
    }
  }
  if(code==="DOCS" && free){
    if(!/^\//.test(free))
      add(n,start+1+content.indexOf(free),free.length,"err","Malformed DOCS — document fields start with / after the status (e.g. /P/CA/939822373/…).",REF.remarks);
    else{
      // RP1707b: a continuação .RN/ retoma exactamente onde o elemento foi
      // cortado — incluindo a meio de um campo (ex.: validade DDMMMYY partida
      // entre ".R/DOCS …/F/11OCT" e ".RN/27/…"). Para validar os campos
      // correctamente juntamos aqui o início da continuação; isto NÃO afecta
      // rec.raw/rec.assoc, que continuam a ser preenchidos normalmente quando
      // essa linha .RN/ for processada por si própria mais abaixo no loop.
      const freeFull = nextIsRN ? free+firstRNChunk(rnNext) : free;
      const f=freeFull.split("/");
      // Ordem oficial (AIRIMP §3.13.2 — Construction Rules and Sequence of Components):
      // [1]=tipo [2]=país emissor [3]=nº documento [4]=nacionalidade [5]=nascimento
      // [6]=género [7]=validade [8..]=apelido / nome(s)
      const base=start+1+content.indexOf(free);
      // f[] pode ter menos campos do que os 8-9 esperados quando o DOCS termina
      // cedo (restante em .RN/) ou tem campos finais vazios/omitidos — posOf tem
      // de somar com segurança mesmo além do fim do array, sem rebentar.
      const posOf=i=>{ let p=0; for(let k=0;k<i;k++) p+=(f[k]||"").length+1; return p; };
      const isCountry=x=>/^[A-Z]{2,3}$/.test(x);
      const isDocNum =x=>/[0-9]/.test(x) && /^[A-Z0-9<]{4,15}$/.test(x);
      const isDate   =x=>RX.date.test(x);

      if(f[1] && !/^(P|I|A|C|F|V|D|AC|IP)$/.test(f[1]))
        add(n,base+posOf(1),f[1].length,"err",`DOCS: invalid document type <b>${f[1]}</b> (P, I, A, C, F, V, D, AC).`,REF.remarks);

      // [2] país emissor — se parecer o número do documento, os campos estão trocados
      if(f[2]!==undefined && f[2]!==""){
        if(!isCountry(f[2])){
          if(isDocNum(f[2]) && f[3] && isCountry(f[3]))
            add(n,base+posOf(2),f[2].length,"err",`DOCS: fields out of order — <b>${f[2]}</b> looks like the document number, but position 2 is the <b>issuing country</b>. Order: /type/<b>issuing-country</b>/number/nationality/birth/gender/expiry/surname/name (AIRIMP §3.13.2).`,REF.remarks);
          else
            add(n,base+posOf(2),f[2].length,"err",`DOCS: invalid issuing country <b>${f[2]}</b> — 2–3 letter ISO code (AIRIMP §3.13.2).`,REF.remarks);
        }
      }
      // [3] número do documento
      if(f[3]!==undefined && f[3]!=="" && !/^[A-Z0-9<]{1,15}$/.test(f[3]))
        add(n,base+posOf(3),f[3].length,"err",`DOCS: invalid document number <b>${f[3]}</b> — up to 15 alphanumeric characters.`,REF.remarks);
      // [4] nacionalidade
      if(f[4]!==undefined && f[4]!=="" && !isCountry(f[4]))
        add(n,base+posOf(4),f[4].length,"err",`DOCS: invalid nationality <b>${f[4]}</b> — 2–3 letter ISO code (position 4).`,REF.remarks);
      // [5] data de nascimento
      if(f[5]!==undefined && f[5]!=="" && !isDate(f[5]))
        add(n,base+posOf(5),f[5].length,"err",`DOCS: invalid date of birth <b>${f[5]}</b> — DDMMMYY format (position 5).`,REF.remarks);
      // [6] género
      if(f[6]!==undefined && f[6]!=="" && !/^(M|F|MI|FI|U|X)$/.test(f[6]))
        add(n,base+posOf(6),f[6].length,"err",`DOCS: invalid gender <b>${f[6]}</b> — M, F, MI, FI, U or X (position 6).`,REF.remarks);
      // [7] validade
      if(f[7]!==undefined && f[7]!=="" && !isDate(f[7]))
        add(n,base+posOf(7),f[7].length,"err",`DOCS: invalid document expiry <b>${f[7]}</b> — DDMMMYY format (position 7).`,REF.remarks);

      if(paxCtx){
        const assocM=content.match(PAXID);
        const rec={type:f[1]||"", issuer:f[2]||"", num:f[3]||"", nat:f[4]||"",
          birth:f[5]||"", gender:f[6]||"", expiry:f[7]||"", raw:free,
          assoc:assocM?assocM[0]:null, line:n, base, posOf, col:base+posOf(8)};
        paxCtx.docs.push(rec); paxCtx.pendingDocs=rec;
      }
    }
  }
  if(code==="DOCA" && free){
    if(!/^\/(R|D)(\/|$)/.test(free))
      add(n,start+1+content.indexOf(free),free.length,"err","Malformed DOCA — first field is R (residence) or D (destination): /R/US/1600 SMITH STREET/… (RP1707b).",REF.remarks);
  }
  if(code==="FQTV"||code==="FQTR"||code==="FQTS"||code==="FQTU"){
    if(free && !/^[A-Z0-9]{2} ?[A-Z0-9]{1,20}$/.test(free))
      add(n,start+1+content.indexOf(free),free.length,"err",`Malformed ${code} — airline (2 char.) + account number (e.g. FQTV AI 43211).`,REF.remarks);
  }
}
