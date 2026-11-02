'use strict';
// QB eyes that turn at a speed set by awareness (with a short cooldown before switching targets), detailed game
// numbers on every player page, receivers who block downfield after a catch, and a better in-game lobby.
{const add=[['On the field','qbeyes','QB eye speed','The QB\'s eyes (his vision cone) turn at a speed set by his awareness, with a short cooldown before he switches to a new target.'],
 ['On the field','blk2','Downfield blocking','After a catch, the other receivers block the defenders in front of the ball carrier.'],
 ['Presentation','gstats','Detailed player numbers','Player pages show the numbers the game actually uses: vision cone width and length, eye speed, throw power and accuracy, top speed, cut sharpness and more.'],
 ['Presentation','glob2','Better game lobby','The in-game lobby shows the scoreboard, game stats, player of the game, your QB\'s vision and the latest plays.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- QB eyes ----------
const eyeN=q=>clamp(((q.sk&&q.sk.awr||60)-50)/49,0,1),eyeRate=q=>2.7+1.3*eyeN(q),eyeCd=q=>.26-.14*eyeN(q);
{const _f=face;face=function(p,ang,rate,dt){try{if(feat('qbeyes')&&P&&G.phase=='play'&&p===P.off[0]&&P.b&&P.b.st=='qb'&&!P.run&&(rate==3||rate==4||rate==5)){
 p.eyT=(p.eyT||0)+dt;if(p.eyA==null)p.eyA=p.fa;let df=ang-p.eyA;df=Math.atan2(Math.sin(df),Math.cos(df));
 if(Math.abs(df)<.44)p.eyA=ang;else if(p.eyT>=eyeCd(p)){p.eyA=ang;p.eyT=0}return _f(p,p.eyA,eyeRate(p),dt)}}catch(e){}return _f(p,ang,rate,dt)}}
{const _c=cpuQB;cpuQB=function(dt){const old=P.look;P.lkT=(P.lkT||0)+dt;const r=_c(dt);try{if(feat('qbeyes')&&P.b.st=='qb'&&P.look!==old){if(old&&P.look&&!old.eng&&P.lkT<eyeCd(P.off[0])*1.6)P.look=old;else P.lkT=0}}catch(e){}return r}}
// ---------- the numbers behind each player ----------
function gNums(p){const s=p.sk,g=p.g,o=ovr(p),rows=[],mph=v=>(v*2.045).toFixed(1),q={sk:s,o};
 const top=g=='OL'?4.6+s.spd*.012:(g=='DL'?.85:g=='CB'?1.08:1.15)*(5.6+s.spd*.03);rows.push(['Top speed',`${top.toFixed(1)} yd/s (${mph(top)} mph)`,top/9.6,'How fast he runs flat out.']);
 if(g=='QB'){const cw=coneHalf(q)*2*180/Math.PI,cl=Math.min(34+(s.str-60)*.7,45)*.8,er=eyeRate(q)*180/Math.PI,cd=eyeCd(q),mx=34+(o-60)*.7,bs=18+22*.5+(s.str-70)*.15,sc=1.2+Math.max(0,80-s.skl)*.08;
  rows.push(['Vision cone width',`${Math.round(cw)}°`,cw/80,'How wide he sees. Throws outside the cone are much less accurate.'],['Vision cone length',`${Math.round(cl)} yd`,cl/36,'How far down the field the cone reaches.'],
   ['Eye speed',`${Math.round(er)}°/s`,er/210,'How fast his eyes (the cone) turn toward your aim.'],['Eye switch cooldown',`${cd.toFixed(2)} s`,1-(cd-.12)/.2,'How long before he can snap his eyes to a new target.'],
   ['Max throw',`${Math.round(mx)} yd`,mx/60,'The farthest you can aim.'],['Ball speed',`${bs.toFixed(1)} yd/s (${mph(bs)} mph)`,bs/34,'On a 22-yard throw. Faster balls are harder to jump.'],
   ['Throw scatter',`±${sc.toFixed(1)} yd`,1-(sc-1.2)/3,'Miss distance on a 22-yard throw with set feet and no pressure.'])}
 if(['WR','TE','RB'].includes(g)){const tr=(9+(s.skl-60)/12)*180/Math.PI;rows.push(['Cut sharpness',`${Math.round(tr)}°/s`,tr/700,'How quickly he changes direction on route breaks.'])}
 if(['RB','WR','TE','QB'].includes(g)){const ex=clamp((s.str-65)/25+.15,0,2.2);rows.push(['Yards after contact',`+${ex.toFixed(1)} yd`,ex/2.2,'Extra yards he drives forward against an average tackler.'])}
 if(['DL','LB','CB','S'].includes(g)){const pr=clamp(.55+(o-70)/160,.25,.9);rows.push(['Tackle chance',`${Math.round(pr*100)}%`,pr,'Chance to bring down an average (70 OVR) ball carrier on contact.'])}
 if(['LB','CB','S'].includes(g)){const pi=clamp(.17+((s.awr+s.skl)/2-60)/220,.08,.34);rows.push(['Route jump',`${Math.round(pi*100)}% pick · 38% breakup`,pi/.34,'When he gets into the passing lane of a low throw.'])}
 if(g=='OL'||g=='DL')rows.push(['Line strength',`${s.str}`,s.str/99,'Wins and losses at the line are decided mostly by strength and overall.']);
 if(g=='K'){const c=58+(s.str-60)*.5;rows.push(['Full-power carry',`${Math.round(c)} yd`,c/80,'How far a perfect kick travels (about '+Math.round(c-12)+'-yard field goals). Wind changes it.'])}
 if(g=='P'){const g0=(56+(s.str-70)*.45)*1.07;rows.push(['Full-power punt',`${Math.round(g0-14)} yd`,g0/75,'Distance from the line of scrimmage on a perfect punt. Wind changes it.'])}
 return rows}
{const _pp=pp;pp=function(id,...a){const r=_pp(id,...a);try{if(feat('gstats'))gPanel(id)}catch(e){console.error(e)}return r}}
function gPanel(id){const p=R.pl.find(q=>q.id==id),m=$('modal');if(!p||p.tid==-2||m.querySelector('.gnums'))return;const at=[...m.querySelectorAll('h3')].find(x=>/^(Growth|Stats)/.test(x.textContent));if(!at)return;
 at.insertAdjacentHTML('beforebegin',`<h3>Game numbers</h3><div class="gnums">${gNums(p).map(([n,v,f,d])=>`<div class="gn"><b>${n}</b><div class="tr"><i style="width:${Math.round(clamp(f,.03,1)*100)}%"></i></div><span>${v}</span><small>${d}</small></div>`).join('')}</div>`)}
// ---------- downfield blocking after a catch ----------
function wbOn(){const b=P&&P.b;if(!feat('blk2')||!b||P.run||P.kr||P.over)return null;
 if(b.st=='air'&&b.tgt&&b.T-b.t<.45){const i=P.off.indexOf(b.tgt);return i>=1&&i<=5?{x:b.tx,y:b.ty,pre:b.tgt}:null}
 const c=b.st=='carry'?b.c:null;if(!c||c===P.off[0])return null;const i=P.off.indexOf(c);return i>=1&&i<=5?c:null}
function wbMine(r,i,c){return i>=1&&i<=5&&r!==c&&r!==c.pre&&!r.fall&&!r.gone&&(i<4||r.route.length>0)&&!(CAR()&&r.pid===R.me)&&(!r.eng||r.wb)}
function wbPre(){const c=wbOn();if(!c)return;P.off.forEach((r,i)=>{r.wbsv=wbMine(r,i,c)?[r.x,r.y,r.fa]:null})}
function wbPost(dt){const c=wbOn(),d=G.dir,O=P.off,D=P.def;
 O.forEach(r=>{if(!r.wb)return;const t=r.eng;r.wb.t+=dt;const gone=!c||!t||t.fall||t.gone||P.over||r.fall||r.wb.t>r.wb.hold||dist(t,c)>18||(t.x-c.x)*d<-4;
  if(gone){if(t&&t.eng===r)t.eng=null;if(t){t.cool=.5}r.eng=null;r.cool=.6;r.wb=null;return}
  const k=Math.hypot(t.x-c.x,t.y-c.y)||1,ux=(t.x-c.x)/k,uy=(t.y-c.y)/k;t.x=clamp(t.x+ux*.9*dt,.5,119.5);t.y=clamp(t.y+uy*.9*dt,.4,52.9);r.x=t.x-ux*1.1;r.y=t.y-uy*1.1;r.fa=Math.atan2(uy,ux)});
 if(!c){O.forEach(r=>r.wbsv=null);return}
 P.wbT=(P.wbT||0)-dt;if(P.wbT<=0){P.wbT=.2;const bl=O.filter((r,i)=>wbMine(r,i,c)&&!r.eng),thr=D.filter(p=>!p.eng&&!p.fall&&!p.gone&&!(G.poss!='U'&&p===cd)&&!(CAR()&&p.pid===R.me)&&dist(p,c)<14&&(p.x-c.x)*d>-3),pairs=[];
  bl.forEach(r=>thr.forEach(p=>{const dd=dist(r,p);if(dd<16)pairs.push([dd+.5*dist(p,c),r,p])}));pairs.sort((a,b)=>a[0]-b[0]);const ur=new Set(),up=new Set();bl.forEach(r=>r.wbt=null);
  pairs.forEach(([,r,p])=>{if(ur.has(r)||up.has(p))return;ur.add(r);up.add(p);r.wbt=p})}
 O.forEach(r=>{if(!r.wbsv)return;const sv=r.wbsv;r.wbsv=null;if(r.eng)return;const t=r.wbt;if(!t||t.eng||t.fall){return}
  r.x=sv[0];r.y=sv[1];r.fa=sv[2];const k=Math.hypot(c.x-t.x,c.y-t.y)||1;mv(r,t.x+(c.x-t.x)/k*.7,t.y+(c.y-t.y)/k*.7,r.spd,dt);
  if(!c.pre&&dist(r,t)<2.4&&!t.eng&&(r.cool||0)<=0&&(t.cool||0)<=0){r.eng=t;t.eng=r;t.mt=9;r.wb={t:0,hold:clamp(.7+(((r.sk&&r.sk.str)||60)-((t.sk&&t.sk.str)||60))/40+rnd()*.5,.35,1.8)}}})}
{const _st=step;step=function(dt){const on=G.phase=='play'&&P&&!P.over;if(on)try{wbPre()}catch(e){console.error(e)}_st(dt);if(G.phase=='play'&&P)try{wbPost(dt)}catch(e){console.error(e)}}}
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P){P.wbT=0;P.lkT=0;P.off.forEach(o=>{o.wb=null;o.wbt=null;o.eyA=null;o.eyT=9})}}catch(e){}return r}}
// ---------- the in-game lobby ----------
let g2Css=false;
function g2Style(){if(g2Css)return;g2Css=true;const s=document.createElement('style');s.textContent=`
.glb{max-width:1100px;margin:0 auto}
.gsb{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;border-radius:14px;overflow:hidden;box-shadow:0 6px 18px #0007;margin-bottom:14px}
.gsb .tm{display:flex;align-items:center;gap:12px;padding:14px 18px;color:#fff}.gsb .tm.r{justify-content:flex-end;text-align:right}
.gsb .tl{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:900 17px "Trebuchet MS",sans-serif;border:3px solid #ffffffcc;flex:none;background:#0003}
.gsb .nm{font:800 18px "Trebuchet MS",sans-serif;line-height:1.1}.gsb .nm span{display:block;font:600 11px sans-serif;opacity:.85;letter-spacing:.5px}
.gsb .sc{font:900 40px "Trebuchet MS",sans-serif;padding:0 8px}
.gsb .mid{background:#0b1410;color:#fff;text-align:center;padding:10px 18px;min-width:150px;height:100%;display:flex;flex-direction:column;justify-content:center}
.gsb .mid b{font:800 20px "Trebuchet MS",sans-serif;color:#ffd84d}.gsb .mid span{font-size:12px;color:#cbd5e1}
.gsb .to{display:flex;gap:4px;margin-top:4px}.gsb .tm.r .to{justify-content:flex-end}.gsb .to i{width:14px;height:5px;border-radius:2px;background:#ffd84d}.gsb .to i.u{background:#ffffff40}
.gbig{display:block;width:100%;font:800 20px "Trebuchet MS",sans-serif;padding:14px;border-radius:12px;background:#d6402f;color:#fff;margin:0 0 14px;cursor:pointer;border:0;box-shadow:0 4px 12px #0006}
.gbig:hover{filter:brightness(1.1)}
.gmenu{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:0 0 14px}
.gmenu button{display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;padding:12px 14px;border-radius:10px;background:#18291f;color:#e8f0ea;border:1px solid #ffffff18;font:700 14px "Trebuchet MS",sans-serif;cursor:pointer}
.gmenu button:hover{border-color:#ffd84d;background:#1f3a2c}.gmenu button span{font:400 11px sans-serif;color:#9fb5a8}.gmenu button em{font-style:normal;font-size:20px;line-height:1}
.gpbp p{margin:3px 0;font-size:13px;color:#d6e4da}.gpbp p:first-child{color:#fff;font-weight:700}
.gnums{max-width:640px}.gn{display:grid;grid-template-columns:150px 1fr 170px;gap:4px 12px;align-items:center;margin:8px 0;font-size:13px}
.gn .tr{height:10px;background:#ffffff14;border-radius:5px;overflow:hidden}.gn .tr i{display:block;height:100%;background:var(--t1,#2563eb);border-radius:5px}
.gn small{grid-column:1/-1;color:#9fb5a8;font-size:11px;margin-top:-3px}
@media (max-width:700px){.gsb .sc{font-size:28px}.gsb .tl{display:none}.gn{grid-template-columns:110px 1fr 120px}}`;document.head.appendChild(s)}
{const _gl=gameLobby;gameLobby=function(...a){if(!feat('glob2')||!G||!G.live)return _gl.apply(this,a);try{return g2Lobby()}catch(e){console.error(e);return _gl.apply(this,a)}}}
function g2Lobby(){ctx='game';g2Style();const car=R.mode=='career',me=R.lg.t[0],op=G.opp,cu=teamCol(0),co=teamCol(op.i),to=G.to||[3,3],ab=n=>esc(tAbbr(n).slice(0,3));
 const tos=n=>`<div class="to">${[0,1,2].map(i=>`<i class="${i<n?'':'u'}"></i>`).join('')}</div>`,clk=typeof xClk=='function'?xClk():Math.ceil(G.clk||0)+'s',q=G.q>=5?'OT':ord(G.q);
 const yl=G.los<=60?G.los-10:110-G.los,side=G.los==60?'':G.los<60?tAbbr(me.n):tAbbr(op.n),dn=G.ytg&&G.down?`${ord(G.down)} & ${((G.dir>0?110:10)-G.los)*G.dir<=G.ytg?'Goal':G.ytg}`:'';
 const sb=`<div class="gsb"><div class="tm" style="background:linear-gradient(110deg,${cu[1]},${cu[0]})"><div class="tl">${ab(me.n)}</div><div class="nm">${esc(me.n)}<span>${rec3(me)}${G.poss=='U'?' · &#127944; BALL':''}</span>${tos(to[0])}</div><div class="sc">${G.sc[0]}</div></div>
  <div class="mid"><b>${q} ${clk}</b><span>${dn}${side?` · ball on ${esc(side)} ${yl}`:' · midfield'}</span><span>${esc(G.po||('Week '+(R.lg.wk+1)))}</span></div>
  <div class="tm r" style="background:linear-gradient(250deg,${co[1]},${co[0]})"><div class="sc">${G.sc[1]}</div><div class="nm">${esc(op.n)}<span>${G.poss=='C'?'BALL &#127944; · ':''}${rec3(R.lg.t[op.i])}</span>${tos(to[1])}</div><div class="tl">${ab(op.n)}</div></div></div>`;
 const it=[];const add=(ic,n,d,f)=>it.push(`<button onclick="${f}"><em>${ic}</em>${n}<span>${d}</span></button>`);
 if(!car||myPos()=='QB')add('&#128203;',car?'Playbook':'Offensive playbook','Edit and add plays','editor()');if(!car){add('&#128737;','Defensive playbook','Coverages and blitzes','deditor()');add('&#128101;','Roster','Ratings and player pages','rosterUI(0)');add('&#8693;','Depth chart','Who starts','depthUI()');add('&#127891;','Coaching staff','Coordinators and upgrades','staff()')}
 add('&#9881;','Game features','Turn features on or off','featUI()');add('&#128295;','Settings','Controls, sound, saves','settingsUI()');
 const qb=(()=>{try{const L=lineup(0);return L&&L.O&&L.O[0]}catch(e){return null}})(),qn=qb?gNums(qb):[],pick=n=>(qn.find(x=>x[0]==n)||[])[1]||'-';
 const qc=qb?card('Your QB',`<div class="pcrd">${typeof pface=='function'?pface(qb,38):''}<div class="nm">${esc(qb.n)}<span>QB · ${ovr(qb)} OVR</span></div></div><table class="mini"><tr><td class="dim">Vision cone</td><td class="num">${pick('Vision cone width')} wide · ${pick('Vision cone length')}</td></tr><tr><td class="dim">Eye speed</td><td class="num">${pick('Eye speed')}</td></tr><tr><td class="dim">Switch cooldown</td><td class="num">${pick('Eye switch cooldown')}</td></tr><tr><td class="dim">Max throw</td><td class="num">${pick('Max throw')}</td></tr></table>`):'';
 const pbp=(G.pbp||[]).slice(-7).reverse(),pc=card('Latest plays',pbp.length?`<div class="gpbp">${pbp.map(t=>`<p>${esc(t)}</p>`).join('')}</div>`:'<p class="dim">No plays yet.</p>');
 let st='';try{if(typeof mStats=='function')st=mStats()}catch(e){}
 modal(`<div class="glb">${sb}<button class="gbig" onclick="closeLobby()">&#9654; Back to the game <span style="font:400 12px sans-serif;opacity:.8">(Esc)</span></button><div class="gmenu">${it.join('')}</div>${st}<div class="dash" style="margin-top:14px">${qc}${pc}${card('Training points',`<div class="big">${R.pts}</div><p class="dim">Spend them on a player page.</p>`)}</div></div>`)}
try{g2Style()}catch(e){}
