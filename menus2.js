'use strict';
// Menus: team-colored menus with a banner, player cards, OVR badges and charts; a drag-and-drop depth chart;
// player development (weekly progress, a training focus for each player, growth charts); and a league news feed.
// Each has its own switch on the Game features page.
{const add=[['Presentation','lobby2','Team-colored menus','Menus take on your team colors, with a team banner, player cards, rating bars and charts.'],
 ['Franchise','dnd','Drag-and-drop depth chart','Drag players up and down the depth chart (the arrows still work too).'],
 ['Franchise','dev2','Player development','Players 26 and under improve during the season. Pick a training focus for each one and watch growth charts.'],
 ['Franchise','news2','League news feed','Weekly headlines from around the league: upsets, blowouts, streaks, players of the week, milestones and injuries.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
(()=>{const ins=(a,after,item)=>{if(a.some(x=>x[0]==item[0]))return;const i=a.findIndex(x=>x[0]==after);a.splice(i<0?a.length:i+1,0,item)};
 ins(NAVF,'depth',['dev','devUI()','Player development']);ins(NAVF,'rank',['lnews','newsUI()','League news']);ins(NAVC,'rank',['lnews','newsUI()','League news'])})();
// ---------- team colors ----------
function mRGB(h){h=String(h||'#000').replace('#','');if(h.length==3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16)||0;return[n>>16&255,n>>8&255,n&255]}
function mLum(h){const[r,g,b]=mRGB(h);return(.299*r+.587*g+.114*b)/255}
function mMix(h,t,k){const a=mRGB(h),b=mRGB(t);return'#'+a.map((v,i)=>Math.round(v+(b[i]-v)*k).toString(16).padStart(2,'0')).join('')}
function mRGBA(h,a){const[r,g,b]=mRGB(h);return`rgba(${r},${g},${b},${a})`}
let mCssOn=false;
function mTheme(){const on=feat('lobby2')&&R&&R.lg;document.body.classList.toggle('tc',!!on);if(!on)return;
 if(!mCssOn){mCssOn=true;const s=document.createElement('style');s.textContent=`
body.tc .side{background:linear-gradient(180deg,var(--t2a),#0b1410 300px)}
body.tc .side .logo{background:linear-gradient(var(--t1),var(--t2));border-color:var(--t3)}
body.tc .side .ni.on{background:var(--t1a);color:var(--t3);box-shadow:inset 3px 0 0 var(--t3)}
body.tc .main{background-image:linear-gradient(180deg,var(--t1b),transparent 340px)}
body.tc .cardx{border-top:3px solid var(--t1)}
body.tc .cardx h4{color:var(--t3)}
.tbanner{display:flex;align-items:center;gap:16px;padding:14px 18px;border-radius:12px;margin-bottom:14px;background:linear-gradient(110deg,var(--t2,#1e3a8a),var(--t1,#2563eb));box-shadow:0 4px 14px #0006;flex-wrap:wrap}
.tbanner .tl{width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:900 21px "Trebuchet MS",sans-serif;color:#fff;background:var(--t2,#1e3a8a);border:3px solid var(--t3,#ffd84d);flex:none}
.tbanner h1{margin:0;font-size:28px;color:#fff}.tbanner .sub{color:#ffffffdd;font-size:13px;margin-top:2px}
.tbanner .chips{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}
.tbanner .chip{background:#00000045;border-radius:8px;padding:6px 11px;text-align:center;color:#fff;min-width:64px}
.tbanner .chip b{display:block;font:800 18px "Trebuchet MS",sans-serif}.tbanner .chip span{font-size:11px;opacity:.85}
.ovb{display:inline-block;min-width:26px;text-align:center;padding:1px 5px;border-radius:5px;font-weight:800;color:#0b1410;font-size:12px}
.ovb.t5{background:#c4b5fd}.ovb.t4{background:#4ade80}.ovb.t3{background:#facc15}.ovb.t2{background:#fb923c}.ovb.t1{background:#94a3b8}
.ovb.big{font-size:18px;padding:3px 9px;border-radius:8px;vertical-align:middle;margin-left:8px}
.pcrd{display:flex;gap:10px;align-items:center;background:#00000030;border-radius:8px;padding:6px 8px;margin-bottom:6px}
.pcrd .nm{flex:1;min-width:0}.pcrd .nm a{font-weight:700}.pcrd .nm span{display:block;font-size:11px;color:#9fb5a8}
.pcrd img.face,td img.face{border-radius:6px;image-rendering:pixelated;vertical-align:middle}
.rbars{max-width:560px;margin:6px 0 4px}
.rbar{display:grid;grid-template-columns:110px 1fr 74px;gap:10px;align-items:center;margin:7px 0;font-size:13px}
.rbar .tr{height:12px;background:#ffffff14;border-radius:6px;position:relative;overflow:hidden}
.rbar .tr i{position:absolute;left:0;top:0;bottom:0;background:var(--t1,#2563eb);border-radius:6px}
.rbar .tr u{position:absolute;top:0;bottom:0;width:3px;background:#ffd84d}
.rbar.can{cursor:pointer}.rbar.can:hover .tr{outline:2px solid #ffd84d}
table.dnd tr[draggable="true"]{cursor:grab}table.dnd tr.over td{box-shadow:inset 0 3px 0 #ffd84d}table.dnd tr.drag{opacity:.35}
.grip{color:#94a3b8;cursor:grab;user-select:none;font-size:15px;letter-spacing:-2px}
.xpb{height:8px;width:90px;background:#ffffff18;border-radius:4px;display:inline-block;vertical-align:middle;overflow:hidden}.xpb i{display:block;height:100%;background:#4ade80}
.ntag{display:inline-block;font:700 10px sans-serif;padding:2px 6px;border-radius:4px;margin-right:6px;letter-spacing:.5px;text-transform:uppercase;color:#0b1410;vertical-align:1px}
.ntag.upset{background:#f9a8d4}.ntag.blow{background:#fdba74}.ntag.streak{background:#93c5fd}.ntag.potw{background:#fde047}.ntag.inj{background:#fca5a5}.ntag.mile{background:#86efac}.ntag.you{background:#e5e7eb}.ntag.thr{background:#c4b5fd}
.nrow{padding:7px 0;border-bottom:1px solid #ffffff10;font-size:14px}.nwk{margin:14px 0 2px;font:700 12px "Trebuchet MS",sans-serif;letter-spacing:1px;text-transform:uppercase;color:#9fc7ad}
.mchart text{font-family:sans-serif}`;document.head.appendChild(s)}
 const c=teamCol(0),t1=c[0],t2=mLum(c[1])<.12?c[1]:mMix(c[1],'#000000',.35),cand=[c[2],c[0]].filter(x=>mLum(x)>.42),t3=cand[0]||mMix(c[0],'#ffffff',.55),rs=document.documentElement.style;
 rs.setProperty('--t1',t1);rs.setProperty('--t2',t2);rs.setProperty('--t3',t3);rs.setProperty('--t1a',mRGBA(t1,.22));rs.setProperty('--t1b',mRGBA(t1,.16));rs.setProperty('--t2a',mRGBA(t1,.28))}
{const _sh=shellHTML;shellHTML=function(h){try{mTheme()}catch(e){}return _sh(h)}}
const mTier=o=>o>=85?5:o>=75?4:o>=65?3:o>=55?2:1,mBadge=(o,big)=>`<span class="ovb t${mTier(o)}${big?' big':''}">${o}</span>`;
// ---------- small SVG charts ----------
function mLine(series,w,h,o){o=o||{};const all=series.flatMap(s=>s.v).filter(v=>v!=null);if(!all.length)return'';const mn=o.mn!=null?o.mn:Math.min(...all)-1,mx=o.mx!=null?o.mx:Math.max(...all)+1,n=Math.max(2,...series.map(s=>s.v.length)),L=o.lab?22:2,B=o.xl?14:2;
 const X_=i=>(L+6+i/(n-1)*(w-L-20)).toFixed(1),Y_=v=>(h-B-(v-mn)/(mx-mn||1)*(h-B-6)-2).toFixed(1);let s='';
 if(o.lab)[mn,Math.round((mn+mx)/2),mx].forEach(v=>{s+=`<line x1="${L}" x2="${w}" y1="${Y_(v)}" y2="${Y_(v)}" stroke="#ffffff14"/><text x="${L-4}" y="${+Y_(v)+3}" font-size="9" fill="#9fb5a8" text-anchor="end">${Math.round(v)}</text>`});
 if(o.xl)o.xl.forEach(([i,t])=>{s+=`<text x="${X_(i)}" y="${h-2}" font-size="9" fill="#9fb5a8" text-anchor="middle">${t}</text>`});
 series.forEach(sr=>{const pts=sr.v.map((v,i)=>v==null?null:`${X_(i)},${Y_(v)}`).filter(Boolean);if(pts.length<2&&!sr.flat)return;s+=`<polyline points="${pts.join(' ')}" fill="none" stroke="${sr.c}" stroke-width="${sr.w||2}" ${sr.d?'stroke-dasharray="4 3"':''} stroke-linejoin="round"/>`;if(sr.dot&&pts.length){const l=pts[pts.length-1].split(',');s+=`<circle cx="${l[0]}" cy="${l[1]}" r="3" fill="${sr.c}"/>`}});
 return`<svg class="mchart" viewBox="0 0 ${w} ${h}" ${o.full?'width="100%"':`width="${w}" height="${h}"`} style="max-width:${o.full?'680px':'100%'}">${s}</svg>`}
function mSeasonChart(){const res=(R.lg.res||[]).slice(-17);if(!res.length)return'<p class="dim">Play a game to start the chart.</p>';const w=320,h=130,n=res.length,mx=Math.max(21,...res.map(r=>Math.max(r.a,r.b))),slot=(w-16)/n,bw=Math.min(12,slot*.38);let s='';
 res.forEach((r,i)=>{const x=8+i*slot+slot/2,ha=r.a/mx*(h-30),hb=r.b/mx*(h-30),c=r.a>r.b?'#4ade80':r.a<r.b?'#f87171':'#cbd5e1';
  s+=`<rect x="${(x-bw-1).toFixed(1)}" y="${(h-16-ha).toFixed(1)}" width="${bw.toFixed(1)}" height="${ha.toFixed(1)}" rx="2" fill="var(--t1,#2563eb)"/><rect x="${(x+1).toFixed(1)}" y="${(h-16-hb).toFixed(1)}" width="${bw.toFixed(1)}" height="${hb.toFixed(1)}" rx="2" fill="#64748b"/><text x="${x.toFixed(1)}" y="${h-3}" font-size="10" font-weight="700" fill="${c}" text-anchor="middle">${r.a>r.b?'W':r.a<r.b?'L':'T'}</text>`});
 const pf=res.reduce((a,r)=>a+r.a,0),pa=res.reduce((a,r)=>a+r.b,0);
 return`<svg class="mchart" viewBox="0 0 ${w} ${h}" width="100%" style="max-height:150px">${s}</svg><p class="small"><span style="color:var(--t1,#2563eb)">&#9632;</span> scored &nbsp;<span style="color:#64748b">&#9632;</span> allowed &nbsp;·&nbsp; point differential <b class="${pf>=pa?'w':'l'}">${pf>=pa?'+':''}${pf-pa}</b></p>`}
function mStreak(){const res=R.lg.res||[];if(!res.length)return'-';const k=r=>r.a>r.b?'W':r.a<r.b?'L':'T',l=k(res[res.length-1]);let n=0;for(let i=res.length-1;i>=0&&k(res[i])==l;i--)n++;return l+n}
// ---------- home screen ----------
{const _dh=dashHome;dashHome=function(...a){const r=_dh.apply(this,a);try{mHome()}catch(e){console.error(e)}return r}}
function mHome(){const d=$('modal').querySelector('.dash');if(!d)return;const me=R.lg.t[0],cards=()=>[...d.querySelectorAll('section.cardx')],h4=s=>(s.querySelector('h4')||{}).textContent||'';
 if(feat('lobby2')){const hd=$('modal').querySelector('.hdr');if(hd){const msg=hd.querySelector('p')?hd.querySelector('p').innerHTML:'',rk=rankOf(0,teamR);
   hd.outerHTML=`<div class="tbanner"><div class="tl">${esc(tAbbr(me.n).slice(0,3))}</div><div><h1>${esc(me.n)}</h1><div class="sub">${msg||`Season ${R.season}`}</div></div><div class="chips"><div class="chip"><b>${rec3(me)}</b><span>record</span></div><div class="chip"><b>${mStreak()}</b><span>streak</span></div><div class="chip"><b>${Math.round(teamR(0))}</b><span>team OVR (${nth(rk)})</span></div><div class="chip"><b>${R.lg.po?RD[R.lg.po.rd]||'Playoffs':R.stage?'Off':'W'+Math.min(R.lg.wk+1,R.lg.sched.length)}</b><span>${R.lg.po?'playoffs':R.stage?'season':'week'}</span></div></div></div>`}
  const top=teamPl(0).filter(p=>!p.inj).sort((x,y)=>ovr(y)-ovr(x)).slice(0,4);
  const pc=card('Top players',top.map(p=>`<div class="pcrd">${typeof pface=='function'?pface(p,38):''}<div class="nm">${plink(p,esc(p.n))}<span>${p.g} · age ${p.age} · POT ${ovr(p,1)}</span></div>${mBadge(ovr(p))}</div>`).join('')+`<div class="btns">${B('rosterUI(0)','Full roster')}</div>`);
  const sc=card('Season so far',mSeasonChart());const ref=cards()[1];if(ref){ref.insertAdjacentHTML('afterend',sc+pc)}else d.insertAdjacentHTML('beforeend',sc+pc)}
 if(feat('news2')){const L=(R.lnews||[]).slice(0,6),nc=card('Around the league',(L.length?L.map(n=>`<p class="news"><span class="ntag ${n.k}">${NTAG[n.k]||n.k}</span>${esc(n.t)}</p>`).join(''):'<p class="dim">Headlines from around the league show up here after each week.</p>')+`<div class="btns">${B('newsUI()','All news')}</div>`);
  const nw=cards().find(s=>h4(s)=='News');if(nw)nw.insertAdjacentHTML('afterend',nc);else d.insertAdjacentHTML('beforeend',nc)}}
// ---------- roster and player page ----------
{const _ru=rosterUI;rosterUI=function(...a){const r=_ru.apply(this,a);try{if(feat('lobby2'))mRosterDeco()}catch(e){console.error(e)}return r}}
function mRosterDeco(){const m=$('modal');m.querySelectorAll('table').forEach(t=>{const hr=t.querySelector('tr');if(!hr)return;const hs=[...hr.children].map(c=>c.textContent.trim().replace(/[▲▼▴▾]/g,'').trim());const io=hs.indexOf('OVR'),ip=hs.indexOf('POT');if(io<0)return;
 [...t.querySelectorAll('tr')].slice(1).forEach(tr=>{const td=tr.children;[io,ip].forEach(i=>{const c=td[i];if(!c||c.querySelector('.ovb'))return;const v=parseInt(c.textContent,10);if(v>0)c.innerHTML=mBadge(v)});
  if(typeof pface=='function'){const a=tr.querySelector('a[onclick^="pp("]');if(a&&!tr.querySelector('img.face')){const id=+(a.getAttribute('onclick').match(/pp\((\d+)/)||[])[1],p=R.pl.find(q=>q.id===id);if(p)a.insertAdjacentHTML('beforebegin',pface(p,20)+' ')}}})})}
{const _pp=pp;pp=function(id,...a){const r=_pp(id,...a);try{mPlayer(id)}catch(e){console.error(e)}return r}}
function mPlayer(id){const p=R.pl.find(q=>q.id==id),m=$('modal');if(!p)return;const mine=p.tid===0,est=p.tid==-2;
 if(feat('lobby2')&&!est){const h=m.querySelector('h1');if(h&&!h.querySelector('.ovb'))h.insertAdjacentHTML('beforeend',`${mBadge(ovr(p),1)}<span class="small dim" style="margin-left:8px;font-weight:400">POT ${ovr(p,1)}</span>`);
  const h3=[...m.querySelectorAll('h3')].find(x=>/^Ratings/.test(x.textContent)),tb=h3&&h3.nextElementSibling;
  if(tb&&tb.tagName=='TABLE')tb.outerHTML=`<div class="rbars">${ST.map(k=>{const nm=k=='skl'?(SKN[p.g]||'Skill'):({spd:'Speed',str:'Strength',awr:'Awareness'})[k],can=mine&&R.pts>0&&p.sk[k]<p.mx[k];
   return`<div class="rbar${can?' can':''}" ${mine?`onclick="trn(${p.id},'${k}')"`:''} title="${can?'Tap to train (1 point)':''}"><b>${nm}</b><div class="tr"><i style="width:${p.sk[k]}%"></i><u style="left:${Math.min(99.5,p.mx[k])}%"></u></div><span>${p.sk[k]} <span class="dim">/ ${p.mx[k]}</span></span></div>`}).join('')}</div>`}
 if(feat('dev2')&&p.tid>=0&&!est){const at=[...m.querySelectorAll('h3')].find(x=>/^Stats/.test(x.textContent));if(!at)return;const oh=(p.oh||[]).slice(-60);let h='<h3>Growth</h3>';
  if(oh.length>=2){const xl=[];oh.forEach((e,i)=>{if(i==0||oh[i-1][0]!=e[0])xl.push([i,'S'+e[0]])});h+=mLine([{v:oh.map(e=>e[2]),c:'var(--t3,#ffd84d)',dot:1,w:2.5},{v:oh.map(()=>ovr(p,1)),c:'#64748b',d:1,w:1.5}],560,140,{lab:1,xl,full:1})+'<p class="small dim">Overall by week (solid) and his potential (dashed).</p>'}
  else h+='<p class="small dim">His growth chart fills in as weeks are played.</p>';
  if(mine){const room=ST.some(k=>p.sk[k]<p.mx[k]);h+=`<p>Training focus: ${mFocSel(p)} ${p.age<=26?(room?`<span class="xpb" title="Progress to the next +1"><i style="width:${Math.min(100,(p.dxp||0)/DEVN*100)}%"></i></span> <span class="small dim">next +1 in about ${Math.max(1,Math.ceil((DEVN-(p.dxp||0))/devRate(p)))} wk</span>`:'<span class="small dim">at his ceiling</span>'):'<span class="small dim">26 and over: no weekly growth</span>'}</p>`}
  at.insertAdjacentHTML('beforebegin',h)}}
// ---------- drag-and-drop depth chart ----------
{const _du=depthUI;depthUI=function(g){const r=_du(g);try{if(feat('dnd'))mDnd(VW.dg)}catch(e){console.error(e)}return r}}
function mDnd(g){const m=$('modal'),tb=m.querySelector('#mainpg table')||m.querySelector('table');if(!tb)return;const rows=[...tb.querySelectorAll('tr')],a=depthOrder(0,g);if(rows.length!=a.length)return;tb.classList.add('dnd');
 const hint=[...m.querySelectorAll('p')].find(x=>/starts?\./.test(x.textContent));if(hint&&!hint.querySelector('.dndh'))hint.insertAdjacentHTML('beforeend',' <span class="small dndh">Drag a player to move him.</span>');
 let from=-1;rows.forEach((tr,i)=>{tr.draggable=true;tr.dataset.i=i;const c=tr.children[0];if(c)c.innerHTML=`<span class="grip">⋮⋮</span> ${c.innerHTML}`;
  tr.addEventListener('dragstart',e=>{from=i;tr.classList.add('drag');try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(i))}catch(_){}});
  tr.addEventListener('dragend',()=>{tr.classList.remove('drag');rows.forEach(x=>x.classList.remove('over'))});
  tr.addEventListener('dragover',e=>{e.preventDefault();rows.forEach(x=>x.classList.toggle('over',x===tr))});
  tr.addEventListener('drop',e=>{e.preventDefault();let f=from;if(f<0){try{f=+e.dataTransfer.getData('text/plain')}catch(_){}}if(!(f>=0)||f===i)return;mDepthMove(g,f,i)})})}
function mDepthMove(g,f,t){const ids=depthOrder(0,g).map(p=>p.id);if(f<0||f>=ids.length||t<0||t>=ids.length)return;const [x]=ids.splice(f,1);ids.splice(t,0,x);R.depth[g]=ids;R.dAuto[g]=false;save();depthUI(g)}
// ---------- player development ----------
const DEVN=6,devRate=p=>p.age<=23?1.5:1;
function mFocSel(p){return`<select onchange="devFoc(${p.id},this.value)"><option value="">Auto</option>${ST.map(k=>`<option value="${k}" ${p.foc==k?'selected':''}>${k=='skl'?(SKN[p.g]||'Skill'):({spd:'Speed',str:'Strength',awr:'Awareness'})[k]}</option>`).join('')}</select>`}
function devFoc(id,k){const p=R.pl.find(q=>q.id==id);if(!p)return;p.foc=ST.includes(k)?k:null;save()}
function devPick(p){const room=ST.filter(k=>p.sk[k]<p.mx[k]);if(!room.length)return null;if(p.foc&&room.includes(p.foc))return p.foc;return room.sort((a,b)=>(p.mx[b]-p.sk[b])-(p.mx[a]-p.sk[a]))[0]}
function devWeek(){const gains=[];R.pl.forEach(p=>{if(p.tid<0||p.age>26||p.inj)return;const k0=devPick(p);if(!k0)return;p.dxp=(p.dxp||0)+devRate(p);if(p.dxp<DEVN)return;p.dxp-=DEVN;p.sk[k0]++;if(p.tid===0)gains.push(`${p.n} +1 ${k0=='skl'?(SKN[p.g]||'skill').toLowerCase():({spd:'speed',str:'strength',awr:'awareness'})[k0]}`)});
 if(gains.length)addNews(`Development: ${gains.slice(0,4).join(', ')}${gains.length>4?` and ${gains.length-4} more`:''}.`)}
function devSnap(w){teamPl(0).forEach(p=>{const o=ovr(p),h=p.oh=p.oh||[],l=h[h.length-1];if(l&&l[0]==R.season&&l[1]==w)l[2]=o;else h.push([R.season,w,o]);if(h.length>80)h.splice(0,h.length-80)})}
{const _nsn=newSeason;newSeason=function(...a){const r=_nsn.apply(this,a);try{devSnap(-1)}catch(e){}return r}}
function devUI(){VW.page='dev';ctx='hub';if(CAR())return modal(`${nav()}<h1>Player development</h1><p>Player development is for franchise mode.</p>`);
 if(!feat('dev2'))return modal(`${nav()}<h1>Player development</h1><p>Player development is switched off on the Game features page.</p>`);
 const pl=teamPl(0).slice().sort((a,b)=>a.age-b.age||ovr(b,1)-ovr(a,1)),cur=pl.map(p=>{const s=(p.oh||[]).filter(e=>e[0]==R.season);return{p,s,d:s.length?ovr(p)-s[0][2]:0}});
 const wk={};pl.forEach(p=>(p.oh||[]).forEach(e=>{if(e[0]!=R.season)return;(wk[e[1]]=wk[e[1]]||[0,0]);wk[e[1]][0]+=e[2];wk[e[1]][1]++}));const ks=Object.keys(wk).map(Number).sort((a,b)=>a-b);
 const tchart=ks.length>=2?mLine([{v:ks.map(k=>wk[k][0]/wk[k][1]),c:'var(--t3,#ffd84d)',dot:1,w:2.5}],600,130,{lab:1,full:1,xl:ks.map((k,i)=>[i,k<0?'Pre':'W'+(k+1)])}):'<p class="small dim">The team chart fills in as weeks are played.</p>';
 const best=cur.filter(x=>x.d>0).sort((a,b)=>b.d-a.d).slice(0,3);
 modal(`${nav()}<h1>Player development</h1><p>Each week, players 26 and under build progress toward +1 in their training focus (up to their ceiling). Players 23 and under grow faster. Pick <b>Auto</b> to work on whatever has the most room. Training points and training camp still work as before.</p>
 <div class="dash">${card('Team average overall this season',tchart,'wide')}${card('Most improved this season',best.length?best.map(x=>`<div class="pcrd">${typeof pface=='function'?pface(x.p,32):''}<div class="nm">${plink(x.p,esc(x.p.n))}<span>${x.p.g} · age ${x.p.age}</span></div><b class="w">+${x.d}</b></div>`).join(''):'<p class="dim">No gains yet this season.</p>')}</div>
 <table><tr><th>Player</th><th>Pos</th><th>Age</th><th>OVR</th><th>POT</th><th>Season</th><th>Growth</th><th>Focus</th><th>Progress</th></tr>${cur.map(({p,s,d})=>{const room=ST.some(k=>p.sk[k]<p.mx[k]),young=p.age<=26;
  return`<tr><td>${typeof pface=='function'?pface(p,20)+' ':''}${plink(p,esc(p.n))}${p.inj?' <span class="inj">INJ</span>':''}</td><td>${p.g}</td><td>${p.age}</td><td>${mBadge(ovr(p))}</td><td>${mBadge(ovr(p,1))}</td><td class="${d>0?'w':d<0?'l':'dim'}">${d>0?'+':''}${d}</td><td>${mLine([{v:(p.oh||[]).slice(-20).map(e=>e[2]),c:d>0?'#4ade80':'#94a3b8',w:1.6}],90,24)||'<span class="dim small">-</span>'}</td>
  <td>${young&&room?mFocSel(p):'<span class="dim small">-</span>'}</td><td>${young?(room?`<span class="xpb"><i style="width:${Math.min(100,(p.dxp||0)/DEVN*100)}%"></i></span>`:'<span class="small dim">at ceiling</span>'):'<span class="small dim">veteran</span>'}</td></tr>`}).join('')}</table>`)}
// ---------- league news ----------
const NTAG={upset:'Upset',blow:'Blowout',streak:'Streak',potw:'Player of the week',inj:'Injury',mile:'Milestone',you:'Your team',thr:'Thriller'};
let NSNAP=null;
{const _rs=result;result=function(...a){try{NSNAP=feat('news2')&&!R.lg.po?nSnap():null}catch(e){NSNAP=null}return _rs.apply(this,a)}}
{const _wk=weekly;weekly=function(...a){const r=_wk.apply(this,a);try{if(feat('dev2')){devWeek();devSnap(R.lg.wk)}}catch(e){console.error(e)}try{if(NSNAP&&feat('news2'))nGen(NSNAP,R.lg.wk)}catch(e){console.error(e)}NSNAP=null;return r}}
const NK=['py','ptd','ry','rtd','ty','tt','sk','in','tk'];
function nSnap(){const ss=new Map();R.pl.forEach(p=>{if(p.tid>=0)ss.set(p.id,NK.map(k=>p.ss[SI[k]]||0))});return{T:R.lg.t.map(t=>[t.w,t.l,t.t,t.pf,t.pa]),inj:new Set(R.pl.filter(p=>p.inj>0).map(p=>p.id)),ss}}
function nAdd(k,t,ids,wk){R.lnews=R.lnews||[];R.lnews.unshift({s:R.season,w:wk,k,t,ids:ids||[]});if(R.lnews.length>150)R.lnews.length=150}
function nGen(sn,wk){const T=R.lg.t,games=R.lg.sched[wk]||[],ups=[],blows=[],thr=[];R.nstk=R.nstk&&R.nstk.length==T.length&&R.nstkS==R.season?R.nstk:T.map(()=>0);R.nstkS=R.season;
 games.forEach(m=>{const[a,b]=m,da=T[a].pf-sn.T[a][3],db=T[b].pf-sn.T[b][3];if(da==null||db==null)return;
  [[a,da,db],[b,db,da]].forEach(([t,x,y])=>{const s=R.nstk[t];R.nstk[t]=x>y?(s>0?s+1:1):x<y?(s<0?s-1:-1):0});
  if(da==db)return;const wi=da>db?a:b,li=wi==a?b:a,ws=Math.max(da,db),ls=Math.min(da,db),rw=teamR(wi),rl=teamR(li);
  if(rl-rw>=4)ups.push([rl-rw,`Upset! The ${T[wi].n} (${Math.round(rw)} OVR) stun the ${T[li].n} (${Math.round(rl)}), ${ws}-${ls}.`,[wi,li]]);
  else if(ws-ls>=28)blows.push([ws-ls,`The ${T[wi].n} crush the ${T[li].n} ${ws}-${ls}.`,[wi,li]]);
  else if(ws-ls<=3)thr.push([ws+ls,`Thriller: the ${T[wi].n} edge the ${T[li].n} ${ws}-${ls}.`,[wi,li]])});
 const out=[];ups.sort((x,y)=>y[0]-x[0]).slice(0,2).forEach(x=>out.push(['upset',x[1],x[2]]));blows.sort((x,y)=>y[0]-x[0]).slice(0,1).forEach(x=>out.push(['blow',x[1],x[2]]));thr.sort((x,y)=>y[0]-x[0]).slice(0,1).forEach(x=>out.push(['thr',x[1],x[2]]));
 const stk=[];T.forEach((t,i)=>{const s=R.nstk[i],unb=t.l==0&&t.t==0;if(s>=4&&s%2==0&&!unb)stk.push(['streak',`${i==0?'Your team, the ':'The '}${t.n} have won ${s} straight.`,[i]]);else if(s<=-5&&s%2!=0)stk.push(['streak',`${i==0?'Your team, the ':'The '}${t.n} have lost ${-s} in a row.`,[i]]);
  const gp=t.w+t.l+t.t;if(unb&&t.w>=6&&t.w%2==0)stk.push(['streak',`The ${t.n} are still unbeaten at ${t.w}-0.`,[i]]);if(t.w==0&&t.l>=6&&t.l%2==0&&gp==t.l)stk.push(['streak',`The ${t.n} are still looking for their first win (0-${t.l}).`,[i]])});
 stk.sort((x,y)=>(y[2][0]===0)-(x[2][0]===0)||Math.abs(R.nstk[y[2][0]])-Math.abs(R.nstk[x[2][0]])).slice(0,3).forEach(x=>out.push(x));
 // players of the week and milestones
 let bo=null,bd=null;const mile=[];R.pl.forEach(p=>{if(p.tid<0)return;const o=sn.ss.get(p.id);if(!o)return;const v=NK.map(k=>p.ss[SI[k]]||0),d=v.map((x,i)=>x-o[i]);
  const so=d[0]/300+d[1]*.25+d[2]/110+d[3]*.3+d[4]/110+d[5]*.3-0,sd=d[6]/1.5+d[7]*.7+d[8]/14;if(so>(bo?bo.s:1.2))bo={p,d,s:so};if(sd>(bd?bd.s:1.3))bd={p,d,s:sd};
  [[0,4000],[0,5000],[2,1000],[2,1500],[4,1000],[4,1500],[6,10],[6,15]].forEach(([i,th])=>{if(o[i]<th&&v[i]>=th)mile.push([p,i,th])})});
 const tn=p=>T[p.tid]?T[p.tid].n:'';
 if(bo){const p=bo.p,d=bo.d,line=d[0]>=d[2]&&d[0]>=d[4]?`threw for ${d[0]} yards and ${d[1]} TD${d[1]==1?'':'s'}`:d[2]>=d[4]?`ran for ${d[2]} yards${d[3]?` and ${d[3]} TD${d[3]==1?'':'s'}`:''}`:`caught passes for ${d[4]} yards${d[5]?` and ${d[5]} TD${d[5]==1?'':'s'}`:''}`;out.push(['potw',`Offensive player of the week: ${p.g} ${p.n} (${tn(p)}) ${line}.`,[p.tid]])}
 if(bd){const p=bd.p,d=bd.d,bits=[];if(d[6])bits.push(`${d[6]} sack${d[6]==1?'':'s'}`);if(d[7])bits.push(`${d[7]} interception${d[7]==1?'':'s'}`);if(d[8])bits.push(`${d[8]} tackles`);out.push(['potw',`Defensive player of the week: ${p.g} ${p.n} (${tn(p)}) with ${bits.join(', ')}.`,[p.tid]])}
 mile.slice(0,3).forEach(([p,i,th])=>out.push(['mile',`${p.g} ${p.n} (${tn(p)}) passes ${th.toLocaleString()} ${['passing yards','','rushing yards','','receiving yards','','sacks'][i]} for the season.`,[p.tid]]));
 R.pl.filter(p=>p.tid>0&&p.inj>0&&!sn.inj.has(p.id)&&ovr(p)>=76).sort((x,y)=>ovr(y)-ovr(x)).slice(0,2).forEach(p=>out.push(['inj',`The ${tn(p)} lose ${p.g} ${p.n} (${ovr(p)} OVR) for ${p.inj} week${p.inj==1?'':'s'}.`,[p.tid]]));
 out.reverse().forEach(x=>nAdd(x[0],x[1],x[2],wk))}
function newsUI(f){VW.page='lnews';ctx='hub';f=VW.nf=f||VW.nf||'all';const on=feat('news2');
 const L=(R.lnews||[]).map(n=>({...n,o:0})),Y=(R.news||[]).map((n,i)=>({s:n.s,w:n.w,k:'you',t:n.t,ids:[0],o:1}));let all=f=='lg'?L:f=='you'?L.filter(n=>n.ids.includes(0)).concat(Y):L.concat(Y);
 all=all.map((n,i)=>({n,i})).sort((a,b)=>b.n.s-a.n.s||b.n.w-a.n.w||a.n.o-b.n.o||a.i-b.i).map(x=>x.n);let h='',last='';
 all.slice(0,120).forEach(n=>{const g=`Season ${n.s} · Week ${n.w+1}`;if(g!=last){h+=`<div class="nwk">${g}</div>`;last=g}h+=`<div class="nrow"><span class="ntag ${n.k}">${NTAG[n.k]||n.k}</span>${esc(n.t)}</div>`});
 modal(`${nav()}<h1>League news</h1>${on?'':'<p class="warn">The league news feed is switched off on the Game features page, so only your own team\'s news is collected.</p>'}<div class="row">${[['all','Everything'],['lg','Around the league'],['you','Your team']].map(([k,n])=>`<button class="${f==k?'on':''}" onclick="newsUI('${k}')">${n}</button>`).join('')}</div>${h||'<p class="dim">No news yet. Play or sim a week.</p>'}`)}
