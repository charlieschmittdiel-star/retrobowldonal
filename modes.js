'use strict';
// Save slots (keep several leagues and switch between them; the extra leagues are kept in the browser's larger
// IndexedDB storage) and an end-of-season recap slideshow. Each has a switch on the Game features page.
{const add=[['Franchise','slots','Save slots','Keep up to 4 leagues (or careers) and switch between them from Settings.'],
 ['Franchise','recap','Season recap','A slideshow at the end of each season: your record, best wins, top players, awards and best plays.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- save slots ----------
const SLN=4,slotKey=n=>MODE+':'+n,slotAct=()=>+(lsGet('gdslot_'+MODE)||1);
function slotDB(){return new Promise((ok,no)=>{try{const q=indexedDB.open('gridiron-slots',1);q.onupgradeneeded=()=>{q.result.createObjectStore('slots')};q.onsuccess=()=>ok(q.result);q.onerror=()=>no(q.error)}catch(e){no(e)}})}
async function slotGet(n){const db=await slotDB();return new Promise((ok,no)=>{const t=db.transaction('slots','readonly').objectStore('slots').get(slotKey(n));t.onsuccess=()=>ok(t.result||null);t.onerror=()=>no(t.error)})}
async function slotPut(n,v){const db=await slotDB();return new Promise((ok,no)=>{const tx=db.transaction('slots','readwrite');tx.objectStore('slots').put(v,slotKey(n));tx.oncomplete=()=>ok(true);tx.onerror=()=>no(tx.error)})}
async function slotDel(n){const db=await slotDB();return new Promise((ok,no)=>{const tx=db.transaction('slots','readwrite');tx.objectStore('slots').delete(slotKey(n));tx.oncomplete=()=>ok(true);tx.onerror=()=>no(tx.error)})}
function slotInfo(r){try{const T=r.lg.t[0];return{name:r.mode=='career'&&r.pl?((r.pl.find(p=>p.id===r.me)||{}).n||T.n):T.n,team:T.n,season:r.season,rec:`${T.w}-${T.l}${T.t?'-'+T.t:''}`}}catch(e){return{name:'League',season:'?',rec:''}}}
async function slotStoreCurrent(){if(typeof saveFlush=='function')saveFlush();save();const s=lsGet(SAVE_KEY);if(!s)return;const n=slotAct();
 await slotPut(n,{data:s,bak1:lsGet(SAVE_KEY+'_bak1'),bak2:lsGet(SAVE_KEY+'_bak2'),info:slotInfo(R),when:Date.now()})}
async function slotSwitch(n,fresh){try{if(G&&G.live){alert('Finish or leave the current game first.');return}await slotStoreCurrent();
 if(!fresh){const v=await slotGet(n);if(!v||!v.data){alert('That slot is empty.');return}if(!lsSet(SAVE_KEY,v.data)){alert('Could not load that league: browser storage is full.');return}
  [['_bak1',v.bak1],['_bak2',v.bak2]].forEach(([k,d])=>{if(d)lsSet(SAVE_KEY+k,d);else lsDel(SAVE_KEY+k)})}
 else{lsDel(SAVE_KEY);lsDel(SAVE_KEY+'_bak1');lsDel(SAVE_KEY+'_bak2')}
 lsSet('gdslot_'+MODE,String(n));location.reload()}catch(e){console.error(e);alert('Switching leagues failed: '+(e&&e.message||e))}}
async function slotRemove(n){if(n==slotAct())return;if(!confirm('Delete the league in slot '+n+'? This cannot be undone.'))return;try{await slotDel(n)}catch(e){}slotFill()}
async function slotFill(){const box=$('slotbox');if(!box)return;const a=slotAct();let rows='';
 for(let n=1;n<=SLN;n++){let v=null;if(n!=a){try{v=await slotGet(n)}catch(e){}}const i=n==a?slotInfo(R):v&&v.info;
  rows+=`<tr class="${n==a?'me':''}"><td><b>Slot ${n}</b></td><td>${i?`${esc(i.name)}${i.name!=i.team?' <span class="dim small">('+esc(i.team)+')</span>':''}`:'<span class="dim">Empty</span>'}</td><td class="small">${i?`Season ${i.season} · ${i.rec}`:''}</td>
  <td>${n==a?'<b class="w">Playing now</b>':`${i?B(`slotSwitch(${n})`,'Switch to this league'):''}${B(`if(${i?'confirm(\'Start a new league in slot '+n+'? The league there will be replaced.\')':'true'})slotSwitch(${n},1)`,i?'Start over here':'Start a new league here')}${i?B(`slotRemove(${n})`,'Delete'):''}`}</td></tr>`}
 box.innerHTML=`<table>${rows}</table><p class="small">Your current league is saved into its slot when you switch, then the page reloads with the other league. Playbooks are shared by all slots.</p>`}
{const _st=settingsUI;settingsUI=function(...a){const r=_st.apply(this,a);try{if(feat('slots')&&typeof indexedDB!='undefined'){const h=[...$('modal').querySelectorAll('h3')].find(x=>/^Your save/.test(x.textContent));
 if(h){h.insertAdjacentHTML('beforebegin',`<h3>${MODE=='career'?'Career':'League'} slots</h3><div id="slotbox"><p class="dim">Loading...</p></div>`);slotFill()}}}catch(e){console.error(e)}return r}}
// ---------- season recap ----------
const RCK=['py','ptd','ry','rtd','ty','tt','tk','sk','in'];
{const _fs=finishSeason;finishSeason=function(...a){let rc=null;try{if(feat('recap'))rc=rcGather()}catch(e){console.error(e)}const r=_fs.apply(this,a);
 try{if(rc){const A=(R.awards||[]).slice(-1)[0];if(A&&A.s==rc.s){rc.aw=A.list.filter(x=>x.tid===0).map(x=>({a:x.a,n:x.n,g:x.g,line:x.line,id:x.id}));rc.champ=A.champ!=null?T_()[A.champ].n:''}
  R.recaps=R.recaps||[];R.recaps.push(rc);if(R.recaps.length>12)R.recaps.shift();save();const g=$('modal').querySelector('.grid');if(g)g.insertAdjacentHTML('afterbegin',`<button class="big" style="background:#facc15;color:#111" onclick="recapUI(${R.recaps.length-1})">&#9654; Watch the season recap</button>`)}}catch(e){console.error(e)}return r}}
function rcGather(){const lg=R.lg,T=lg.t,me=T[0],res=(lg.res||[]).slice(),po=lg.po,s=k=>p=>p.ss[SI[k]]||0;
 const mine=R.pl.filter(p=>p.tid===0&&p.ss[0]>0),best=(k,f)=>mine.filter(p=>s(k)(p)>0).sort((a,b)=>s(k)(b)-s(k)(a))[0];
 const card=(p,l,line)=>p?{id:p.id,n:p.n,g:p.g,l,line}:null,qb=best('py'),rb=best('ry'),wr=best('ty'),df=mine.slice().sort((a,b)=>(s('tk')(b)+s('sk')(b)*4+s('in')(b)*5)-(s('tk')(a)+s('sk')(a)*4+s('in')(a)*5))[0];
 const tops=[card(qb,'Passing',qb&&`${s('py')(qb)} yds, ${s('ptd')(qb)} TD`),card(rb,'Rushing',rb&&`${s('ry')(rb)} yds, ${s('rtd')(rb)} TD`),card(wr,'Receiving',wr&&`${s('ty')(wr)} yds, ${s('tt')(wr)} TD`),card(df,'Defense',df&&`${s('tk')(df)} tkl, ${s('sk')(df)} sacks, ${s('in')(df)} INT`)].filter(Boolean);
 const won=res.filter(r=>r.a>r.b).sort((x,y)=>(y.a-y.b)-(x.a-x.b))[0],lost=res.filter(r=>r.a<r.b).sort((x,y)=>(x.a-x.b)-(y.a-y.b))[0],gm=r=>r?{o:T[r.o].n,a:r.a,b:r.b}:null;
 const ab=tAbbr(me.n),plays=[];(R.box||[]).filter(b=>b.s==R.season).forEach(b=>(b.pbp||[]).forEach(l=>{if(l.includes(ab+':')&&/touchdown|scores from|INTERCEPT|takes it all the way/i.test(l)){const m=l.match(/(\d+)-yard|from (\d+) yard/),y=m?+(m[1]||m[2]):0;plays.push({t:l.replace(/^[^-]*- /,'').replace(ab+': ',''),y,o:b.on})}}));
 plays.sort((a,b)=>b.y-a.y);const fin=po?(po.champ===0?'Champions!':po.al&&po.sd&&po.sd[0]!=null?'Made the playoffs':'Missed the playoffs'):'';
 return{s:R.season,team:me.n,col:teamCol(0),w:me.w,l:me.l,t:me.t,pf:me.pf,pa:me.pa,seq:res.map(r=>r.a>r.b?'W':r.a<r.b?'L':'T'),won:gm(won),lost:gm(lost),tops,plays:plays.slice(0,5),fin,rk:rankOf(0,teamR)}}
let RCT=null;
function recapUI(i){const rc=(R.recaps||[])[i];if(!rc)return;clearInterval(RCT);rcCss();const c=rc.col||['#2563eb','#1e3a8a','#facc15'],face=id=>{const p=R.pl.find(q=>q.id===id);return p&&typeof pface=='function'?pface(p,64):''};
 const sl=[];sl.push(`<div class="rcs t"><div class="rcl">${esc(tAbbr(rc.team).slice(0,3))}</div><h2>Season ${rc.s}</h2><h1>${esc(rc.team)}</h1><div class="rcn"><b data-n="${rc.w}">0</b>-<b data-n="${rc.l}">0</b>${rc.t?'-<b data-n="'+rc.t+'">0</b>':''}</div><p>${esc(rc.fin||'')}</p></div>`);
 sl.push(`<div class="rcs"><h2>The season, game by game</h2><div class="rcq">${rc.seq.map((x,k)=>`<i class="${x}" style="animation-delay:${k*.12}s">${x}</i>`).join('')}</div><div class="rcn small2"><span>Points scored <b data-n="${rc.pf}">0</b></span><span>Points allowed <b data-n="${rc.pa}">0</b></span></div><p>Finished ${nth(rc.rk)} in team rating</p></div>`);
 if(rc.won||rc.lost)sl.push(`<div class="rcs"><h2>Best and worst</h2>${rc.won?`<div class="rcg w"><span>Biggest win</span><b>${rc.won.a}-${rc.won.b}</b><em>vs ${esc(rc.won.o)}</em></div>`:''}${rc.lost?`<div class="rcg l"><span>Toughest loss</span><b>${rc.lost.a}-${rc.lost.b}</b><em>vs ${esc(rc.lost.o)}</em></div>`:''}</div>`);
 if(rc.tops.length)sl.push(`<div class="rcs"><h2>Top performers</h2><div class="rcp">${rc.tops.map((p,k)=>`<div style="animation-delay:${k*.25}s">${face(p.id)}<b>${esc(p.n)}</b><span>${p.g} · ${p.l}</span><em>${esc(p.line)}</em></div>`).join('')}</div></div>`);
 if(rc.aw&&rc.aw.length)sl.push(`<div class="rcs"><h2>Awards</h2>${rc.aw.map(x=>`<div class="rca">&#127942; <b>${esc(x.a)}</b><span>${x.g} ${esc(x.n)}</span></div>`).join('')}</div>`);
 if(rc.plays.length)sl.push(`<div class="rcs"><h2>Best plays</h2>${rc.plays.map((p,k)=>`<p class="rcpl" style="animation-delay:${k*.3}s">${esc(p.t)} <span class="dim">vs ${esc(p.o||'')}</span></p>`).join('')}</div>`);
 sl.push(`<div class="rcs t"><h2>${rc.champ?'League champion: '+esc(rc.champ):'Season '+rc.s+' is in the books'}</h2><h1>On to season ${rc.s+1}</h1><div class="btns">${B('recapUI('+i+')','Watch again')}${B("clearInterval(RCT);lobby()",'Continue','go')}</div></div>`);
 modal(`<div class="rcw" style="--c1:${c[0]};--c2:${c[1]};--c3:${c[2]}"><div class="rcb">${sl.map((h,k)=>`<section class="${k?'':'on'}">${h}</section>`).join('')}</div><div class="rcc"><button onclick="rcGo(-1)">&#9664;</button><span class="rcd">${sl.map((_,k)=>`<i class="${k?'':'on'}"></i>`).join('')}</span><button onclick="rcGo(1)">&#9654;</button><button onclick="rcPause()" id="rcpz">Pause</button><button onclick="clearInterval(RCT);lobby()">Close</button></div></div>`);
 RC.i=0;RC.n=sl.length;RC.pz=0;rcCount();RCT=setInterval(()=>{if(!RC.pz&&RC.i<RC.n-1)rcGo(1);if(!$('modal').querySelector('.rcw'))clearInterval(RCT)},4800)}
const RC={i:0,n:0,pz:0};
function rcGo(dir){const ss=[...$('modal').querySelectorAll('.rcb section')],ds=[...$('modal').querySelectorAll('.rcd i')];if(!ss.length)return;RC.i=clamp(RC.i+dir,0,ss.length-1);ss.forEach((s,k)=>s.classList.toggle('on',k==RC.i));ds.forEach((s,k)=>s.classList.toggle('on',k==RC.i));rcCount()}
function rcPause(){RC.pz=!RC.pz;const b=$('rcpz');if(b)b.textContent=RC.pz?'Play':'Pause'}
function rcCount(){const s=$('modal').querySelector('.rcb section.on');if(!s)return;s.querySelectorAll('[data-n]').forEach(e=>{const n=+e.dataset.n,t0=performance.now(),f=()=>{const k=Math.min(1,(performance.now()-t0)/900);e.textContent=Math.round(n*k);if(k<1)requestAnimationFrame(f)};f()})}
let rcC=false;function rcCss(){if(rcC)return;rcC=true;const s=document.createElement('style');s.textContent=`
.rcw{max-width:900px;margin:0 auto;background:radial-gradient(circle at 30% 0,var(--c1),var(--c2) 70%);border-radius:16px;padding:18px;box-shadow:0 8px 30px #000a;color:#fff;min-height:440px;display:flex;flex-direction:column}
.rcb{position:relative;flex:1;min-height:360px}.rcb section{position:absolute;inset:0;opacity:0;transform:translateX(40px);transition:opacity .5s,transform .5s;pointer-events:none;display:flex;align-items:center;justify-content:center}
.rcb section.on{opacity:1;transform:none;pointer-events:auto}.rcs{text-align:center;width:100%}.rcs h1{font:900 40px "Trebuchet MS",sans-serif;margin:4px 0}.rcs h2{font:800 16px "Trebuchet MS",sans-serif;letter-spacing:2px;text-transform:uppercase;color:var(--c3);margin:0 0 12px}
.rcl{width:84px;height:84px;margin:0 auto 10px;border-radius:50%;border:4px solid var(--c3);display:flex;align-items:center;justify-content:center;font:900 26px "Trebuchet MS",sans-serif;background:#0003}
.rcn{font:900 56px "Trebuchet MS",sans-serif}.rcn.small2{font-size:20px;display:flex;gap:30px;justify-content:center;margin-top:16px}.rcn.small2 b{font-size:34px;display:block}
.rcq{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}.rcq i{font:800 16px sans-serif;font-style:normal;width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;animation:rcpop .4s both}.rcq i.W{background:#22c55e}.rcq i.L{background:#ef4444}.rcq i.T{background:#94a3b8}
@keyframes rcpop{from{transform:scale(0);opacity:0}to{transform:none;opacity:1}}
.rcg{display:inline-flex;flex-direction:column;margin:8px 20px;padding:14px 22px;border-radius:12px;background:#0004;animation:rcpop .5s both}.rcg span{font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:.8}.rcg b{font:900 40px "Trebuchet MS",sans-serif}.rcg.w b{color:#86efac}.rcg.l b{color:#fca5a5}
.rcp{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}.rcp div{background:#0004;border-radius:12px;padding:12px;width:170px;display:flex;flex-direction:column;align-items:center;gap:3px;animation:rcpop .5s both}.rcp img{border-radius:10px;image-rendering:pixelated}.rcp span{font-size:12px;opacity:.8}.rcp em{font-style:normal;color:var(--c3);font-weight:700;font-size:13px}
.rca{font-size:18px;margin:8px 0}.rca span{display:block;font-size:13px;opacity:.85}.rcpl{background:#0004;border-radius:8px;padding:8px 12px;margin:6px auto;max-width:620px;animation:rcpop .5s both}
.rcc{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px}.rcd{display:flex;gap:6px;margin:0 6px}.rcd i{width:9px;height:9px;border-radius:50%;background:#fff5}.rcd i.on{background:#fff}`;document.head.appendChild(s)}
{const _hu=historyUI;historyUI=function(...a){const r=_hu.apply(this,a);try{const L=R.recaps||[];if(feat('recap')&&L.length){const h=$('modal').querySelector('h1');if(h)h.insertAdjacentHTML('afterend',`<div class="row">${L.map((x,i)=>`<button onclick="recapUI(${i})">&#9654; Season ${x.s} recap</button>`).join('')}</div>`)}}catch(e){}return r}}
