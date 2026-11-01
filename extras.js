'use strict';
// Game-day extras: weather, penalties, live fumbles, bullet/lob passes, diving catches, QB slides, hot routes, injuries,
// momentum, instant replay, play-by-play, sound, celebrations, team uniforms, night games, jersey numbers and box scores.
// Each one can be switched off on the Game features page (feat(k)). This file only wraps existing functions.
// ---------- small helpers ----------
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
function xNm(p){if(!p)return'';const m=G&&G.nmap&&G.nmap[p.pid];if(m)return m.n;const r=p.pid&&R.pl.find(q=>q.id===p.pid);return r?r.n.split(' ').pop():(p.pos||'')}
const xClk=()=>{const m=Math.max(0,Math.ceil(G.clk));return`${m/60|0}:${String(m%60).padStart(2,'0')}`};
function xLog(t){if(!G)return;(G.pbp=G.pbp||[]).push(`${G.q>=5?'OT':'Q'+G.q} ${xClk()} - ${t}`);if(G.pbp.length>400)G.pbp.shift();G.pbT=4.5}
function xMom(u,dm){if(!feat('mom')||!G)return;G.mom=clamp((G.mom||0)*.92+(u?1:-1)*dm,-100,100)}
function xBanner(t,s,cls){const e=$('res');if(!e)return;e.className='';void e.offsetWidth;e.querySelector('.t').textContent=t;e.querySelector('.s').textContent=s||'';e.className='show '+(cls||'inc')}
const wxName=w=>({rain:'Rain',snow:'Snow',wind:'Windy',clear:'Clear'})[w]||'Clear';
// ---------- team colors, uniforms, numbers ----------
const XPAL=[['#2563eb','#1e3a8a','#facc15'],['#dc2626','#7f1d1d','#111827'],['#15803d','#14532d','#f8fafc'],['#f97316','#9a3412','#1f2937'],['#7c3aed','#4c1d95','#facc15'],['#0891b2','#164e63','#f8fafc'],['#ca8a04','#713f12','#111827'],['#db2777','#831843','#f8fafc'],['#475569','#1e293b','#f97316'],['#0d9488','#134e4a','#fde047'],['#b91c1c','#450a0a','#fbbf24'],['#1e40af','#172554','#ef4444'],['#65a30d','#365314','#111827'],['#9333ea','#3b0764','#22d3ee'],['#ea580c','#431407','#e5e7eb'],['#0f766e','#042f2e','#f97316']];
function teamCol(i){const t=R.lg.t[i];if(t&&t.col)return t.col;const a=XPAL[i%16];return i<16?a:[a[1],a[0],a[2]]}
const XDEF={U:Object.assign({},TEAM.U,{num:'#fff',ez:'#1e4e8c'}),C:Object.assign({},TEAM.C,{num:'#fff',ez:'#8a1b2a'})};
function uniforms(){const sb=$('sb'),css=(k,v)=>{if(sb&&sb.style&&sb.style.setProperty)sb.style.setProperty(k,v)},s2=$('sb2');
 if(!feat('unif')||!G||!G.opp){Object.assign(TEAM.U,XDEF.U);Object.assign(TEAM.C,XDEF.C)}
 else{const set=(k,i,home)=>{const[a,b,c]=teamCol(i);Object.assign(TEAM[k],home?{j:a,j2:b,h:b,pt:'#e5e7eb',st:c,num:'#fff'}:{j:'#f1f5f9',j2:a,h:b,pt:a,st:c,num:a},{ez:a})};set('U',0,G.home=='U');set('C',G.opp.i,G.home!='U')}
 const cu=feat('unif')&&G&&G.opp?teamCol(0):['#2563eb','#1e3a8a'],cc=feat('unif')&&G&&G.opp?teamCol(G.opp.i):['#dc2626','#7f1d1d'];
 [[sb,css],[s2,(k,v)=>{if(s2&&s2.style&&s2.style.setProperty)s2.style.setProperty(k,v)}]].forEach(([el,f])=>{if(!el)return;f('--u1',cu[0]);f('--u2',cu[1]);f('--c1',cc[0]);f('--c2',cc[1])})}
const JR={QB:[[1,19]],WR:[[10,19],[80,89]],TE:[[80,89]],RB:[[20,39]],OL:[[60,79]],DL:[[90,99],[50,59]],LB:[[40,59]],CB:[[20,39]],S:[[20,49]],K:[[1,9]],P:[[1,9]]};
function jNum(p,used){const r=JR[p.g]||[[1,99]];let h=(p.id*2654435761)>>>0;for(let k=0;k<40;k++){const a=r[(h+k)%r.length],n=a[0]+(((h>>>8)+k*7)%(a[1]-a[0]+1));if(!used||!used.has(n)){if(used)used.add(n);return n}}return 1+(h%99)}
// ---------- weather and atmosphere ----------
function wxPick(){G.wx='clear';G.wind={x:0,y:0,m:0};if(!feat('weather'))return;const late=!!R.lg.po||R.lg.wk>=11,r=rnd();
 if(r<.13)G.wx='rain';else if(late&&r<.25)G.wx='snow';else if(r<.39)G.wx='wind';
 const m=G.wx=='wind'?10+rnd()*14:G.wx=='clear'?rnd()*6:3+rnd()*9,a=rnd()*Math.PI*2;G.wind={x:Math.cos(a)*m,y:Math.sin(a)*m,m:Math.round(m)}}
function xNewGame(){G.mom=0;G.pbp=[];G.tt=G.tt||'n';G.lastP=null;G.cel=null;G.flag=null;wxPick();
 const po=R.lg.po;G.night=feat('night')&&(po?rnd()<.6:R.lg.wk%4==3);
 G.home=po?(R.lg.t[0].w>=R.lg.t[G.opp.i].w?'U':'C'):((R.lg.wk+G.opp.i)%2?'C':'U');
 G.nmap={};[0,G.opp.i].forEach(t=>{const used=new Set();R.pl.filter(p=>p.tid===t).sort((a,b)=>a.id-b.id).forEach(p=>G.nmap[p.id]={n:p.n.split(' ').pop(),j:jNum(p,used)})});
 uniforms();XWX.length=0;xRV=null;if(G.live!==undefined)xLog(`${G.opp.n} ${G.home=='U'?'at':'host'} ${R.lg.t[0].n}. ${wxName(G.wx)}${G.wind.m>=5?', wind '+G.wind.m+' mph':''}${G.night?', under the lights':''}.`)}
{const _ng=newGame;newGame=function(o){_ng(o);try{xNewGame()}catch(e){console.error(e)}}}
// players run a little slower in snow and rain; the team with momentum a little faster
{const _mv=mv;mv=function(p,tx,ty,sp,dt){let f=1;if(G){if(feat('weather')){if(G.wx=='snow')f=.93;else if(G.wx=='rain')f=.97}if(G.mom&&feat('mom'))f*=1+(p.t=='U'?1:-1)*G.mom/100*.03}return _mv(p,tx,ty,sp*f,dt)}}
// ---------- sound (generated, no audio files) ----------
let AC=null,XNB=null,XCG=null,xRoar=0;
function sInit(){if(AC||!feat('sound'))return;const A=globalThis.AudioContext||globalThis.webkitAudioContext;if(!A)return;
 try{AC=new A();const n=AC.sampleRate*2,bf=AC.createBuffer(1,n,AC.sampleRate),dd=bf.getChannelData(0);for(let i=0;i<n;i++)dd[i]=Math.random()*2-1;XNB=bf;
  const src=AC.createBufferSource(),f=AC.createBiquadFilter();src.buffer=XNB;src.loop=true;f.type='bandpass';f.frequency.value=650;f.Q.value=.5;XCG=AC.createGain();XCG.gain.value=0;src.connect(f);f.connect(XCG);XCG.connect(AC.destination);src.start()}catch(e){AC=null}}
addEventListener('pointerdown',sInit);addEventListener('keydown',sInit);
function crowd(v){if(!AC||!XCG)return;try{XCG.gain.setTargetAtTime(feat('sound')?v:0,AC.currentTime,.5)}catch(e){}}
function tone(type,f0,f1,dur,vol,t0){const t=AC.currentTime+(t0||0),o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+.03)}
function nz(dur,freq,vol,t0){const t=AC.currentTime+(t0||0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=XNB;f.type='lowpass';f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t,Math.random());s.stop(t+dur+.03)}
function whistle(t0){const t=AC.currentTime+(t0||0),o=AC.createOscillator(),l=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain();o.frequency.value=2900;l.frequency.value=38;lg.gain.value=160;l.connect(lg);lg.connect(o.frequency);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.02);g.gain.setValueAtTime(.09,t+.3);g.gain.linearRampToValueAtTime(0,t+.36);o.connect(g);g.connect(AC.destination);o.start(t);l.start(t);o.stop(t+.4);l.stop(t+.4)}
function sfx(n){if(!AC||!feat('sound'))return;try{
 if(n=='whistle')whistle();else if(n=='flag'){whistle();whistle(.45)}
 else if(n=='hit'){nz(.16,500,.45);tone('sine',120,45,.18,.45)}else if(n=='big'){nz(.26,750,.8);tone('sine',140,40,.26,.7)}
 else if(n=='hike'){tone('square',190,150,.08,.06);nz(.05,2200,.12)}else if(n=='kick'){tone('sine',170,55,.13,.7);nz(.06,1600,.35)}
 else if(n=='catch'){tone('triangle',900,520,.06,.14)}
 else if(n=='horn'){[196,247,294,392].forEach(f=>tone('sawtooth',f,0,1.4,.045));sfx('roar')}
 else if(n=='roar'&&XCG){const t=AC.currentTime;XCG.gain.cancelScheduledValues(t);XCG.gain.setValueAtTime(XCG.gain.value,t);XCG.gain.linearRampToValueAtTime(.42,t+.3);XCG.gain.setTargetAtTime(.1,t+1.6,.8);xRoar=2.6}}catch(e){}}
{const _rt=ragTackle;ragTackle=function(p,h){_rt(p,h);const big=p.hs>0||h.trk>0;sfx(big?'big':'hit');if(p.t=='U'||h.t=='U')buzz(big?45:20)}}
// ---------- penalties ----------
function penRoll(k,x){const d=G.dir,O=P.off,D=P.def,gain=Math.round(((x==null?P.L:x)-P.L)*d),r=rnd();
 if((k=='tackle'||k=='td')&&gain>0&&O.slice(6).some(o=>o.eng)&&r<.022)return{s:'O',n:'Holding',y:10};
 if(k=='inc'&&P.lastTgt&&P.lastTgt.r){const l=P.lastTgt.l,t=P.lastTgt.r,dd=D.reduce((a,p)=>dist(p,l)<dist(a,l)?p:a);if(dist(dd,l)<1.6&&dist(t,l)<2.6&&r<.16)return{s:'D',n:'Pass interference',spot:l.x,first:1}}
 if((k=='inc'||k=='sack')&&r>.985)return{s:'D',n:'Defensive holding',y:5,first:1};
 if(k=='inc'&&P.passer&&r>.975&&r<=.985)return{s:'D',n:'Roughing the passer',y:15,first:1};
 if(k=='tackle'&&P.tkl&&r>.993)return{s:'D',n:'Facemask',y:15,first:1,from:x};
 return null}
function penApply(pn,k,x){const d=G.dir,L=P.L,own=d>0?10:110,gl=d>0?110:10,u=G.poss=='U',fx=P.b.x||L,fy=P.b.y||26.5;
 if(pn.from!=null&&k)recordPlay(k,x);
 P.over=1;P.b.st='dead';G.run=false;let txt;
 if(pn.s=='O'){const y=Math.max(0,Math.min(pn.y,Math.floor((L-own)*d/2)));G.nl=L-d*y;G.ytg+=y;txt=`${pn.n} on the offense. ${y} yards, replay ${ord(G.down)} down.`}
 else{let nl;if(pn.spot!=null){nl=clamp(pn.spot,11,109);if((nl-gl)*d>=-1)nl=gl-d}else{const base=pn.from!=null?pn.from:L,tg=(gl-base)*d;nl=base+d*Math.min(pn.y,tg/2)}
  const yd=Math.round((nl-L)*d);G.nl=nl;if(pn.first||yd>=G.ytg){G.down=1;G.ytg=Math.max(1,Math.min(10,Math.round((gl-nl)*d)))}else G.ytg-=yd;
  txt=`${pn.n} on the defense. ${Math.max(0,yd)} yards${pn.first?', automatic first down':''}.`}
 G.next='same';G.msg='FLAG: '+txt;G.flag={x:fx,y:fy,t:0};G.phase='post';G.pt=2.4;P.rEnd=P.rT||0;
 xLog(`Flag: ${pn.n} on ${pn.s=='O'?(u?'your offense':G.opp.n):(u?G.opp.n:'your defense')}.`);xMom(pn.s=='O'?u:!u,-5);sfx('flag');save();ui()}
// ---------- live fumbles ----------
function xFumRoll(k){const c=k=='sack'?P.off[0]:P.b.c;if(!c||P.dv)return false;let p=.009-((c.sk&&c.sk.str||60)-60)*.00012+(feat('weather')?(G.wx=='rain'?.012:G.wx=='snow'?.006:0):0);if(k=='sack')p+=.03;return rnd()<Math.max(.003,p)}
function looseStart(c,k){const a=rnd()*Math.PI*2,s=3+rnd()*4;P.b={st:'loose',x:c.x,y:c.y,vx:Math.cos(a)*s+(c.vx||0)*.3,vy:Math.sin(a)*s*.7+(c.vy||0)*.3,t:0,z:.8,fum:c};P.lt=0;P.sackFum=k=='sack'?1:0;
 G.msg='FUMBLE! The ball is loose!';sfx('roar');xLog(`${xNm(c)} fumbles! The ball is loose!`);
 const b=P.b;P.lctl=P.off.filter(p=>!p.gone&&!p.fall).reduce((a,p)=>!a||dist(p,b)<dist(a,b)?p:a,null);
 if(G.poss!='U'&&!CAR())cd=P.def.filter(p=>!p.fall).reduce((a,p)=>!a||dist(p,b)<dist(a,b)?p:a,null)||cd;ui()}
function fallAdv(p,dt){const f=p.fall;f.t+=dt;const ft=f.t-f.lag;if(f.wrap&&ft<.14){const w=f.wrap,a=Math.min(1,dt*9);p.x+=(w.x+f.ox-p.x)*a;p.y+=(w.y+f.oy-p.y)*a;return}
 const kk=Math.exp(-4.5*dt);f.vx*=kk;f.vy*=kk;p.x=clamp(p.x+f.vx*dt,.5,119.5);p.y=clamp(p.y+f.vy*dt,.4,52.6);if(!f.landed&&ft>=f.dur){f.landed=1;puff(p.x,p.y,4,.8)}p.vx=p.vy=0}
function looseStep(dt){const b=P.b,[ix,iy,im]=inp();P.t+=dt;P.lt+=dt;clockTick(dt);b.t+=dt;
 const k=Math.exp(-1.6*dt);b.vx*=k;b.vy*=k;if(rnd()<dt*3){b.vx+=(rnd()-.5)*3;b.vy+=(rnd()-.5)*3}
 b.x=clamp(b.x+b.vx*dt,.5,119.5);b.y+=b.vy*dt;b.z=Math.abs(Math.sin(b.t*9))*Math.max(0,.9-b.t*.4);
 if(b.y<.2||b.y>53.1){b.y=clamp(b.y,.3,53);P.oob=1;return looseDead(null)}
 const all=P.off.concat(P.def).filter(p=>!p.gone);
 all.forEach(p=>{if(p.fall)return fallAdv(p,dt);
  const me=CAR()?p.pid===R.me&&!autoMode():(G.poss=='U'?p===P.lctl:p===cd);
  if(me&&im)return mv(p,p.x+ix*5,p.y+iy*5,p.spd,dt);
  if(dist(p,b)<22&&!(p.stun>0))mv(p,b.x+b.vx*.2,b.y+b.vy*.2,p.spd*(.9+.1*rnd()),dt);else{p.vx*=.9;p.vy*=.9}});
 const near=all.filter(p=>!p.fall&&dist(p,b)<.9).sort((a,c)=>dist(a,b)-dist(c,b));
 if(near.length)looseDead(near[rnd()<.7||near.length<2?0:1]);else if(P.lt>4.5)looseDead(all.filter(p=>!p.fall).sort((a,c)=>dist(a,b)-dist(c,b))[0]||null)}
function looseDead(w){const b=P.b;
 if(!w||P.off.includes(w)){const sp=w?w.x:b.x;P.b={st:'carry',c:w||b.fum,x:sp,y:w?w.y:b.y};P.lfok=1;const sk=P.sackFum&&(!w||w===P.off[0]);
  endPlay(sk?'sack':'tackle',sp);G.msg=(w?'Fumble recovered by the offense. ':'Fumble out of bounds. ')+G.msg;return}
 fumbleReturn(w)}
function fumbleReturn(dd){const d0=G.dir,tmp=P.off;P.off=P.def;P.def=tmp;G.poss=G.poss=='U'?'C':'U';G.dir=-d0;G.down=1;G.ytg=10;
 P.L=dd.x;G.los=clamp(dd.x,11,109);G.nl=G.los;P.kr=1;P.scr=1;P.run=0;P.sd=0;P.aim=null;P.t=0;P.over=0;P.look=null;P.rec=null;P.rusher=null;P.passer=null;
 P.off.forEach(p=>{p.route=[];p.ri=0;p.mo=null;p.eng=null;p.blk=-1;p.tg=null;p.stun=0;p.fa=G.dir>0?0:Math.PI});
 P.def.forEach(p=>{p.rush=false;p.cover=null;p.zone=null;p.eng=null;p.ly=p.y;p.bite=0;p.fa=G.dir>0?Math.PI:0;p.cool=Math.max(p.cool||0,.6)});
 P.b={st:'carry',c:dd,x:dd.x,y:dd.y};if(G.poss!='U'&&!CAR())cd=P.def.filter(p=>!p.fall&&!p.gone).reduce((a,p)=>dist(p,dd)<dist(a,dd)?p:a);
 if(G.poss=='U')R.pts+=2;xMom(G.poss=='U',18);sfx('roar');
 G.msg=G.poss=='U'?'FUMBLE RECOVERY! Run it back!':'They recovered the fumble - chase him down!';xLog(`${xNm(dd)} recovers the fumble!`);ui()}
// ---------- the play loop hooks ----------
{const _st=step;step=function(dt){if(P.b.st=='loose'){looseStep(dt);xRec(dt);return}
 const fl=P.off.concat(P.def).filter(p=>p.fall),sv=fl.map(p=>[p.x,p.y]);_st(dt);fl.forEach((p,i)=>{p.x=sv[i][0];p.y=sv[i][1];p.vx=p.vy=0;fallAdv(p,dt)});
 if(G.phase=='play'&&!P.over)xCpuSlide(dt);xRec(dt)}}
{const _ps=postStep;postStep=function(dt){_ps(dt);if(G.cel&&P)celStep(dt);if(P&&P.rf&&(P.rT||0)-(P.rEnd||0)<1.3)xRec(dt)}}
{const _sn=snap;snap=function(){const was=G.phase;_sn();if(was!='play'&&G.phase=='play'&&P.b.st=='qb'){xRecStart();sfx('hike');
 if(feat('pen')&&!G.two&&!P.kr&&!P.knl&&!P.spk){const r=rnd();if(r<.009)penApply({s:'O',n:'False start',y:5});else if(r<.016)penApply({s:'D',n:'Offside',y:5})}}}}
$('snap').onclick=()=>snap();
{const _su=setup;setup=function(){const old=P;if(G){G.fake=null;G.cel=null;G.flag=null}_su();if(old&&old!==P&&old.rf&&old.rf.length>12)G.lastP=old;MVK='?'}}
{const _at=autoTick;autoTick=function(dt){if(G.phase=='kick')return kickTick(dt);if(G.phase=='replay')return rpEnd();return _at(dt)}}
{const _ep=endPlay;endPlay=function(k,x){if(!P||P.over)return;
 if(P.lfok){P.lfok=0;const u=G.poss=='U',L0=P.L,d=G.dir;_ep(k,x);try{xAfter(k,x,u,L0,d)}catch(e){console.error(e)}return}
 if(P.b.st=='loose')return;
 if(feat('fumble')&&!P.knl&&!P.spk&&!P.slid&&!G.two&&(k=='fum'||((k=='tackle'||k=='sack')&&!P.oob&&xFumRoll(k)))){const c=k=='sack'?P.off[0]:P.b.c;if(c&&!c.gone)return looseStart(c,k)}
 if(feat('pen')&&!P.kr&&!G.two&&!P.knl&&!P.spk&&!P.slid){const pn=penRoll(k,x);if(pn)return penApply(pn,k,x)}
 const u=G.poss=='U',L0=P.L,d=G.dir;_ep(k,x);try{xAfter(k,x,u,L0,d)}catch(e){console.error(e)}}}
{const _ir=intReturn;intReturn=function(l,dd){const u=G.poss=='U',q=P.passer||P.off[0];_ir(l,dd);xMom(u,-20);sfx('roar');xLog(`${xNm(q)} is picked off by ${xNm(dd)}!`)}}
function xAfter(k,x,u,L0,d){P.rEnd=P.rT||0;if(feat('pbp'))xCall(k,x,u,L0,d);sfx('whistle');
 if(k=='td'){sfx('horn');xMom(u,22);if(u)xConf();buzz(60);const c=P.b.c;if(feat('celeb')&&c&&!c.fall){G.cel={p:c,t:0,ty:['jump','spike','dance','spin','flex'][rnd()*5|0]};G.pt=Math.max(G.pt,3)}}
 else{const g=Math.round(((x==null?L0:x)-L0)*d),m=G.msg;let dm=k=='sack'?-7:k=='inc'?-1:k=='tackle'?(g>=20?10:g>=10?4:g<0?-2:1):0;
  if(/FIRST DOWN/.test(m))dm+=3;if(/TURNOVER ON DOWNS/.test(m))dm=-14;if(/SAFETY/.test(m))dm=-18;if(P.kr&&k=='tackle')dm=g>=25?9:2;xMom(u,dm)}
 if(feat('inj')&&(k=='tackle'||k=='sack')&&!P.slid&&!P.knl)[k=='sack'?P.off[0]:P.b.c,P.tkl].forEach(p=>{if(!p||!p.pid||p.pid===R.me||rnd()>=(P.tkl&&P.tkl.hs>0?.008:.0025))return;
  const pl=R.pl.find(q=>q.id===p.pid);if(!pl||pl.inj)return;const n=rnd()<.6?1:2+(rnd()*4|0);pl.inj=n;const t=`${pl.g} ${pl.n} is hurt (${n==1?'out for the rest of the game':'out '+(n-1)+' more week'+(n>2?'s':'')}).`;
  G.msg+=' '+t;xLog(t);if(pl.tid===0)addNews(`${pl.g} ${pl.n} was hurt during the game (${n==1?'day to day':(n-1)+' wk'}).`)})}
function xCall(k,x,u,L0,d){const b=P.b,g=Math.round(((x==null?L0:x)-L0)*d),n=xNm,side=u?tAbbr(R.lg.t[0].n):tAbbr(G.opp.n),m=G.msg;let t='';
 if(/Two-point/.test(m))t=m;
 else if(P.kr){t=k=='td'?`${n(b.c)} takes it all the way back for a touchdown!`:`${n(b.c)} returns it to the ${ylab(G.nl)}${P.tkl?', brought down by '+n(P.tkl):''}.`}
 else if(k=='td')t=P.rec?`${n(P.passer)} hits ${n(P.rec)} for a ${g}-yard touchdown!`:`${n(P.rusher||b.c)} scores from ${g} yard${g==1?'':'s'} out!`;
 else if(k=='sack')t=`${n(P.off[0])} is sacked${P.tkl?' by '+n(P.tkl):''} for a loss of ${Math.max(0,-g)}.`;
 else if(k=='inc')t=P.spk?'Spiked to stop the clock.':`${n(P.passer||P.off[0])}'s pass${P.lastTgt&&P.lastTgt.r?' for '+n(P.lastTgt.r):''} falls incomplete.`;
 else if(k=='tackle'){if(P.knl)t='Kneel down.';else{const who=P.rec?`${n(P.passer)} to ${n(P.rec)}`:`${n(P.rusher||b.c)} runs`;t=`${who} for ${g>=0?g:'a loss of '+(-g)} yard${Math.abs(g)==1?'':'s'}${P.tkl&&!P.oob?', tackled by '+n(P.tkl):P.oob?', out of bounds':''}.`}}
 else if(k=='int'||k=='fum')t=k=='int'?'Intercepted!':'Fumble, recovered by the defense.';
 if(/FIRST DOWN/.test(m)&&k!='td')t+=' First down!';if(/SAFETY/.test(m))t+=' Safety!';if(/TURNOVER ON DOWNS/.test(m))t+=' Turnover on downs.';
 xLog(`${side}: ${t}`)}
// ---------- catches: dives, toe taps, slippery balls; and bullet / lob passes ----------
{const _rs=resolve;resolve=function(){const b=P.b,r=b.tgt,l={x:b.tx,y:b.ty};P.lastTgt={r,l};let dv=0;
 if(feat('dive')&&r&&!r.fall){const rd=dist(r,l);if(rd>2.4&&rd<3.7&&rnd()<.3+((r.sk?r.sk.skl:60)-60)/200){const dx=l.x-r.x,dy=l.y-r.y,m=Math.hypot(dx,dy)||1;r.dox=r.x;r.doy=r.y;r.x=l.x-dx/m*.6;r.y=l.y-dy/m*.6;r.dvx=dx/m;r.dvy=dy/m;dv=1}}
 if(feat('weather')&&G.wx=='rain'&&r&&dist(r,l)<2.4&&rnd()<.06){b.st='dead';endPlay('inc');if(!/^FLAG/.test(G.msg))G.msg='Dropped! The ball is slick. '+G.msg;return}
 _rs();let spot=r?r.x:0;
 if(dv){spot=r.x;const dd=Math.hypot(r.x-r.dox,r.y-r.doy),v=dd*4.5+1.5;r.x=r.dox;r.y=r.doy;r.vx=r.vy=0;r.an={k:'dive',t:0,d:2.5};r.fall={t:0,lag:0,dur:.32,vx:r.dvx*v,vy:r.dvy*v};FALLS.push(r);puff(r.x+r.dvx*dd,r.y+r.dvy*dd,6,1.1)}
 if(b.st=='carry'&&r&&b.c===r){sfx('catch');const gl=G.dir>0?110:10,end=(spot-gl)*G.dir>=0?'td':'tackle';
  if(dv){P.dv=1;endPlay(end,spot);if(!/^FLAG/.test(G.msg))G.msg=(end=='td'?'TOUCHDOWN! DIVING CATCH! ':'DIVING CATCH! ')+G.msg.replace('TOUCHDOWN!','').trim();xLog('What a diving catch!')}
  else if(feat('dive')&&(r.y<1.6||r.y>51.7)&&Math.abs(r.vy)>1&&Math.sign(r.vy)==(r.y<26.5?-1:1)){P.oob=1;r.an={k:'toetap',t:0,d:1.2};if(feat('slowmo')&&!(CAR()&&autoMode()))G.slow=.75;puff(r.x,r.y,5,.7);endPlay(end,r.x);if(!/^FLAG/.test(G.msg))G.msg=(end=='td'?'TOUCHDOWN! TOE-TAP CATCH! ':'TOE-TAP CATCH! ')+G.msg.replace('TOUCHDOWN!','').trim();xLog('Toe-tap catch on the sideline!')}}}}
{const _ta=throwAt;throwAt=function(tx,ty){const q=P.off[0],tt=feat('throwT')&&G.poss=='U'&&qbIsMe()?(G.tt||'n'):'n',dd=Math.hypot(tx-q.x,ty-q.y);
 if(feat('weather')&&G.wind&&G.wind.m>3){const f=dd/40*.08*(.7+rnd()*.6);tx+=G.wind.x*f;ty+=G.wind.y*f}
 if(tt=='bul'){const e=dd/22*.7;tx+=(rnd()-.5)*e;ty+=(rnd()-.5)*e}
 const was=P.b.st;_ta(tx,ty);const b=P.b;if(was=='qb'&&b.st=='air'){b.tt=tt;if(tt=='bul'){b.T*=.72;b.arc=.45}else if(tt=='lob'){b.T*=1.4;b.arc=1.9}}}}
// ---------- QB slides ----------
function qbSlide(){const b=P.b,q=P.off[0];if(!feat('slide')||G.phase!='play'||G.poss!='U'||b.st!='carry'||b.c!==q||!qbIsMe()||P.kr)return;xSlide(q)}
function xSlide(q){q.fall={t:0,lag:0,dur:.4,vx:(q.vx||0)*.7,vy:(q.vy||0)*.7};FALLS.push(q);P.slid=1;endPlay('tackle',q.x+(q.vx||0)*.12);G.msg='QB slide. '+G.msg}
function xCpuSlide(dt){const b=P.b,q=P.off[0];if(!feat('slide')||b.st!='carry'||b.c!==q||!P.scr||P.kr||(G.poss=='U'&&qbIsMe()))return;
 const gain=(q.x-P.L)*G.dir;if(gain<2||!P.def.some(p=>!p.eng&&dist(p,q)<2.3))return;if(rnd()<dt*6*(G.poss=='C'?IQ():.8))xSlide(q)}
// ---------- hot routes ----------
const HOT=[['Go',[[28,0]]],['Slant',[[2,0],[9,6]]],['Out',[[6,0],[6,-9]]],['In',[[7,0],[7,9]]],['Curl',[[11,0],[9,1]]],['Post',[[11,0],[25,9]]],['Corner',[[11,0],[23,-9]]],['Flat',[[1,-7]]],['Block',[]]];
function hotRoute(i){const r=P.off[i];if(!r||i<1||i>5||!feat('hot'))return;r.hi=((r.hi==null?-1:r.hi)+1)%HOT.length;let h=HOT[r.hi];if(h[0]=='Block'&&i<4){r.hi=0;h=HOT[0]}
 const d=G.dir,m=r.y<26.5?1:-1,s0=r.mo&&r.mo.length?r.mo[r.mo.length-1]:[r.sx,r.sy];r.route=h[1].map(([a,b])=>[s0[0]+d*a,clamp(s0[1]+b*m,1,52)]);r.ri=0;r.hot=h[0];
 G.msg=`Hot route: ${xNm(r)} runs a ${h[0].toLowerCase()}${h[0]=='Block'?'':' route'}.`}
let xTap=null;
C.addEventListener('pointerdown',e=>{xTap=null;if(!$('modal').hidden)return;if(G.phase=='replay'){rpEnd();return}if(G.phase=='kick'){kickTap();return}
 if(G.phase=='pre'&&G.poss=='U'&&!G.ch&&qbIsMe()&&feat('hot')&&!(CAR()&&!myUnitOn()))xTap=wp(e)});
C.addEventListener('pointerup',e=>{const t=xTap;xTap=null;if(!t||G.phase!='pre')return;const p=wp(e);if(Math.hypot(p[0]-t[0],p[1]-t[1])>12)return;
 let bi=-1,bd=1e9;P.off.forEach((r,i)=>{if(i<1||i>5)return;const f=P2(r.x,r.y);if(Math.abs(t[0]-f[0])<17&&t[1]>f[1]-46&&t[1]<f[1]+10){const dd=Math.abs(t[0]-f[0]);if(dd<bd){bd=dd;bi=i}}});
 if(bi>=0&&!(P.run&&bi==(P.ho||5))){hotRoute(bi);ui()}});
// ---------- celebrations ----------
const XCONF=[];
function xConf(){if(!feat('celeb'))return;const cs=[TEAM.U.j,TEAM.U.st,'#fff','#facc15'];for(let i=0;i<90;i++)XCONF.push({x:rnd()*W,y:-10-rnd()*120,vx:(rnd()-.5)*40,vy:60+rnd()*90,r:rnd()*6,c:cs[i%4],t:0})}
function celStep(dt){const c=G.cel,p=c.p;c.t+=dt;if(p.fall)return;const mates=(P.off.includes(p)?P.off:P.def).filter(q=>q!==p&&!q.fall&&!q.gone);
 if(c.t>.5)mates.slice(0,6).forEach(q=>{const dx=p.x-q.x,dy=p.y-q.y,m=Math.hypot(dx,dy)||1;if(m>2.2){q.x+=dx/m*3*dt;q.y+=dy/m*3*dt;q.vx=dx/m*3;q.vy=dy/m*3;q.fa=Math.atan2(dy,dx)}else q.vx=q.vy=0});
 p.vx=p.vy=0;const b=P.b;
 if(c.ty=='jump')p.jz=Math.abs(Math.sin(c.t*7))*1.3;
 else if(c.ty=='dance'){p.fa=Math.floor(c.t*5)%2?0:Math.PI;p.vx=Math.sin(c.t*30)*.7}
 else if(c.ty=='spin')p.fa+=dt*14;
 else if(c.ty=='flex')p.jz=c.t<.6?Math.sin(c.t/.6*Math.PI)*1.6:0;
 else{b.st='cel';if(c.t<.35){b.x=p.x;b.y=p.y+.1;b.z=1.4-c.t*4}else{const t=c.t-.35;b.x=p.x+t*2.2;b.y=p.y+.3;b.z=Math.abs(Math.sin(t*7))*Math.max(0,1.1-t*.5)}}}
// ---------- instant replay ----------
let xRV=null;
function xRecStart(){if(!P)return;P.rf=[];P.rp=P.off.concat(P.def);P.rT=0;P.rEnd=1e9}
function xRec(dt){if(!(feat('replay')||feat('hl'))||!P||!P.rf||P.rf.length>1600)return;P.rT=(P.rT||0)+(dt||0);const L=P.rp,a=new Float32Array(L.length*6);
 L.forEach((p,j)=>{const o=j*6;a[o]=p.x;a[o+1]=p.y;a[o+2]=p.fa;a[o+3]=p.vx||0;a[o+4]=p.vy||0;a[o+5]=p.fall?p.fall.t:-1});P.rf.push({t:P.rT,a,b:Object.assign({},P.b),jz:P.rp.map(p=>p.jz||0)})}
function rpStart(){const src=G.phase=='post'?P:G.phase=='pre'?G.lastP:null;if(!feat('replay')||!src||!src.rf||src.rf.length<12||G.phase=='replay'||!$('modal').hidden)return;
 G.rp={P:src,t:src.rf[0].t,i:0,ph:G.phase,msg:G.msg,hold:0};G.phase='replay';$('res').className='';ui()}
function rpEnd(){if(!G.rp)return;const r=G.rp;G.rp=null;G.phase=r.ph;G.msg=r.msg;if(G.phase=='post')G.pt=Math.max(G.pt,.9);ui();if(r.after)r.after()}
function rpDraw(dt,dr){const r=G.rp,rf=r.P.rf;r.t+=dt*.5;while(r.i<rf.length-1&&rf[r.i+1].t<=r.t)r.i++;if(r.i>=rf.length-1){r.hold+=dt;if(r.hold>1)rpEnd()}
 const f=rf[r.i],live=P,lc=cd,ls=sel,L=r.P.rp,sv=L.map(p=>[p.x,p.y,p.fa,p.vx,p.vy,p.fall,p.fall?p.fall.t:0,p.stun,p.bite,p.ml,p.jz]);P=r.P;cd=null;sel=-1;const bs=P.b,aim=P.aim;
 L.forEach((p,j)=>{const o=j*6,ft=f.a[o+5];p.x=f.a[o];p.y=f.a[o+1];p.fa=f.a[o+2];p.vx=f.a[o+3];p.vy=f.a[o+4];if(ft<0)p.fall=null;else if(p.fall)p.fall.t=ft;p.stun=0;p.bite=0;p.ml=0;p.jz=f.jz?f.jz[j]:0});
 P.b=f.b;P.aim=null;G.phase='play';G.msg='';
 try{dr()}finally{L.forEach((p,j)=>{const s=sv[j];p.x=s[0];p.y=s[1];p.fa=s[2];p.vx=s[3];p.vy=s[4];p.fall=s[5];if(s[5])s[5].t=s[6];p.stun=s[7];p.bite=s[8];p.ml=s[9];p.jz=s[10]});P.b=bs;P.aim=aim;P=live;cd=lc;sel=ls;if(G.rp)G.phase='replay';else if(G.phase=='play'&&r.ph)G.phase=r.ph}
 X.fillStyle='#000b';X.fillRect(10,H-40,190,28);X.fillStyle='#ef4444';X.beginPath();X.arc(26,H-26,6,0,7);X.fill();X.fillStyle='#fff';X.font='bold 14px "Trebuchet MS",sans-serif';X.textAlign='left';X.fillText('REPLAY',38,H-21);X.font='11px sans-serif';X.fillStyle='#cbd5e1';X.fillText(TOUCH()?'tap to skip':'any key to skip',100,H-21)}
// ---------- the frame hook: ticks, extra drawing, HUD bits ----------
let xLast=0;const XWX=[];
{const _df=drawField;drawField=function(){_df();try{xField()}catch(e){console.error(e)}}}
function xField(){gPosts();const now=performance.now()/1000;
 if(G.night){X.fillStyle='rgba(4,8,24,.6)';X.fillRect(0,0,W,TOP-6);const off=-((camX*S*.8)%400)-200;for(let x=off+120;x<W+400;x+=400){const g=X.createRadialGradient?X.createRadialGradient(x+2,4,2,x+2,4,60):null;if(g&&g.addColorStop){g.addColorStop(0,'rgba(255,246,200,.55)');g.addColorStop(1,'rgba(255,246,200,0)');X.fillStyle=g;X.fillRect(x-60,0,124,64)}X.fillStyle='#fffbe6';X.fillRect(x-14,0,32,8)}X.fillStyle='rgba(8,14,40,.2)';X.fillRect(0,TOP-6,W,H)}
 if(feat('weather')){if(G.wx=='snow'){X.fillStyle='rgba(240,245,255,.3)';X.fillRect(0,TOP-6,W,H)}else if(G.wx=='rain'){X.fillStyle='rgba(20,30,60,.16)';X.fillRect(0,0,W,H)}}
 if(R.lg.po&&G.live&&feat('night')){X.fillStyle='#facc15';X.font='bold 15px "Trebuchet MS",sans-serif';X.textAlign='center';X.fillText(RD[R.lg.po.rd].toUpperCase(),W/2,TOP-16);X.textAlign='left';
  for(let i=0;i<4;i++)if(rnd()<.35){X.fillStyle='#fff';X.fillRect(rnd()*W,26+rnd()*(TOP-46),2,2)}}
 if(G.flag&&G.phase=='post'){const s=P2(G.flag.x,G.flag.y),w=Math.sin(now*9)*1.5;X.fillStyle='#facc15';X.beginPath();X.moveTo(s[0],s[1]);X.lineTo(s[0]+8,s[1]-3+w);X.lineTo(s[0]+1,s[1]-7);X.closePath();X.fill()}}
{const _sp=sprite;sprite=function(p,t){if(p.gone)return 0;const jz=p.jz||0,k=scY(p.y);if(jz){X.save();X.translate(0,-jz*GZ*k)}const hy=_sp(p,t);
 if(feat('names')&&G.nmap){const m=G.nmap[p.pid];if(m){const s=P2(p.x,p.y),c=TEAM[p.t]||TEAM.C;X.fillStyle=c.num||'#fff';X.font=`bold ${Math.max(6,Math.round(7*k))}px sans-serif`;X.textAlign='center';X.fillText(m.j,s[0],Math.round(s[1])-5.2*2.6*k);X.textAlign='left'}}
 if(jz)X.restore();return hy-jz*GZ*k}}
{const _draw=draw;draw=function(){const now=performance.now()/1000,dt=Math.min(.05,xLast?now-xLast:0);xLast=now;
 try{xTick(dt)}catch(e){console.error(e)}
 if(G.phase=='replay'&&G.rp)rpDraw(dt,_draw);else _draw();
 try{xOverlay(dt)}catch(e){console.error(e)}}}
function xTick(dt){if(G.phase=='kick'&&!(CAR()&&autoMode()))kickTick(dt);
 if(xRoar>0)xRoar-=dt;else if(AC){G.cv=(G.cv||0)-dt;if(G.cv<=0){G.cv=.5;crowd(!G.live?0:.05+(G.phase=='play'?.04:0)+(R.lg.po?.04:0)+(G.night?.015:0)+Math.abs(G.mom||0)/100*.05)}}
 if(G.pbT>0)G.pbT-=dt;tipCheck()}
function xOverlay(dt){
 // weather particles
 if(feat('weather')&&(G.wx=='rain'||G.wx=='snow')){const rain=G.wx=='rain',n=rain?130:90,wx=G.wind?G.wind.x:0;while(XWX.length<n)XWX.push({x:rnd()*W,y:rnd()*H,v:.5+rnd()*.5});
  X.strokeStyle='rgba(190,210,255,.42)';X.fillStyle='rgba(255,255,255,.85)';X.lineWidth=1;X.beginPath();
  XWX.forEach(p=>{if(rain){p.y+=dt*700*p.v;p.x+=dt*wx*12;X.moveTo(p.x,p.y);X.lineTo(p.x+wx*.4,p.y+10*p.v)}else{p.y+=dt*70*p.v;p.x+=dt*(wx*5+Math.sin(p.y*.05)*20)}if(p.y>H){p.y=-10;p.x=rnd()*W}if(p.x>W)p.x-=W;if(p.x<0)p.x+=W});X.stroke();
  if(!rain)XWX.forEach(p=>X.fillRect(p.x,p.y,1+2*p.v,1+2*p.v))}
 // confetti
 for(let i=XCONF.length-1;i>=0;i--){const q=XCONF[i];q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.r+=dt*8;X.fillStyle=q.c;X.fillRect(q.x,q.y,5*Math.abs(Math.cos(q.r)),4);if(q.y>H||q.t>4)XCONF.splice(i,1)}
 // name tags on the key players, hot route tags before the snap
 if(feat('names')&&P&&G.phase!='replay'){const b=P.b,tag=(p,txt,col)=>{if(!p||p.gone)return;const s=P2(p.x,p.y),k=scY(p.y);X.font='bold 10px sans-serif';X.textAlign='center';const w=X.measureText?X.measureText(txt).width||txt.length*6:txt.length*6;X.fillStyle='#000a';X.fillRect(s[0]-w/2-3,s[1]-50*k-11,w+6,13);X.fillStyle=col||'#fff';X.fillText(txt,s[0],s[1]-50*k-1);X.textAlign='left'};
  if(G.phase=='play'&&b.st=='carry')tag(b.c,xNm(b.c));if(G.phase=='play'&&b.st=='air'&&b.tgt)tag(b.tgt,xNm(b.tgt),'#ffd84d');
  if(G.phase=='pre'&&G.poss=='U'&&qbIsMe())P.off.slice(1,6).forEach(r=>tag(r,r.hot?`${xNm(r)} · ${r.hot.toUpperCase()}`:xNm(r),r.hot?'#ffd84d':'#fff'))}
 else if(P&&G.phase=='pre'&&G.poss=='U')P.off.slice(1,6).forEach(r=>{if(!r.hot)return;const s=P2(r.x,r.y);X.fillStyle='#ffd84d';X.font='bold 10px sans-serif';X.textAlign='center';X.fillText(r.hot.toUpperCase(),s[0],s[1]-50*scY(r.y));X.textAlign='left'});
 if(P&&P.b.st=='loose'&&G.poss=='U'&&P.lctl&&!CAR())gring(P.lctl.x,P.lctl.y,1.6,'#ffd84d',3);
 if(P)kDraw(dt);
 // HUD: momentum and weather strip, play-by-play ticker, replay button
 const s2=$('sb2');if(s2){const mo=feat('mom')&&G.live,w=feat('weather')&&G.wx&&(G.wx!='clear'||(G.wind&&G.wind.m>=5)),m=Math.round(G.mom||0),sig=[mo?m:'x',w?G.wx+G.wind.m:'',G.phase=='replay'].join('|');
  if(sig!==s2.dataset.s){s2.dataset.s=sig;s2.innerHTML=(mo?`<div class="mom" title="Momentum"><i class="u" style="width:${Math.max(0,m)/2}%"></i><i class="c" style="width:${Math.max(0,-m)/2}%"></i></div>`:'')+(w?`<span>${wxName(G.wx).toUpperCase()}${G.wind.m>=5?` · WIND ${G.wind.m} MPH ${G.wind.x>=0?'→':'←'}`:''}</span>`:'');s2.style.display=(mo||w)&&G.phase!='replay'?'':'none'}}
 const pb=$('pbp');if(pb){const v=feat('pbp')&&G.pbT>0&&G.pbp&&G.pbp.length&&G.phase!='replay',t=v?G.pbp[G.pbp.length-1]:'';if(pb.textContent!==t)pb.textContent=t;const o=v?String(Math.min(1,G.pbT)):'0';if(pb.style.opacity!==o)pb.style.opacity=o}
 const rv=!!(feat('replay')&&$('modal').hidden&&!(CAR()&&autoMode())&&((G.phase=='post'&&P.rf&&P.rf.length>12)||(G.phase=='pre'&&!G.ch&&G.lastP)));if(rv!==xRV){xRV=rv;$('rpb').style.display=rv?'':'none'}}
// ---------- buttons: throw type, slide, fakes, onside, replay ----------
moveBar=function(){const el=$('mv');if(!el)return;let k='';const u=G.poss=='U',b=P.b,ph=G.phase=='play';
 if(ph&&!autoMode()){const me=careerMe(),car=CAR();
  if(u&&b.st=='carry'&&(!car||b.c===me))k=b.c===P.off[0]&&feat('slide')&&!P.kr?'qbc':'carry';
  else if(u&&b.st=='qb'&&(!car||(me&&me===P.off[0])))k=!P.run&&feat('throwT')?'qbt'+(G.tt||'n'):'qb';
  else if(u&&car&&me&&P.off.includes(me)&&me!==P.off[0])k='wr';else if(!u&&cd&&cd.eng)k='rush'}
 if(k===MVK)return;MVK=k;const B2=(key,t)=>`<button data-k="${key}">${t}</button>`,tt={n:'Normal',bul:'Bullet',lob:'Lob'}[G.tt||'n'],run3=B2('z','Spin')+B2('x','Truck')+B2('c','Hurdle');
 el.innerHTML=k=='carry'?run3:k=='qbc'?B2('v','Slide')+run3:k.startsWith('qbt')?B2('t','Throw: '+tt)+B2('q','Juke L')+B2('e','Juke R'):k=='qb'?B2('q','Juke L')+B2('e','Juke R'):k=='wr'?B2('z','Fake')+B2('x','Burst')+B2('c','Release'):k=='rush'?B2('1','Bull')+B2('2','Swim')+B2('3','Rip')+B2('4','Spin'):'';el.style.display=k?'flex':'none'};
{const _h=hit;hit=function(k){if(!$('modal').hidden)return _h(k);
 if(G.phase=='replay'){rpEnd();return}if(G.phase=='kick'){if(k==' '||k=='enter')kickTap();return}
 if(k=='v'&&G.phase=='play')return qbSlide();
 if(k=='t'&&G.poss=='U'&&feat('throwT')&&(G.phase=='pre'||(G.phase=='play'&&P.b.st=='qb'))){G.tt={n:'bul',bul:'lob',lob:'n'}[G.tt||'n'];MVK='?';if(G.phase=='pre')ui();G.msg=G.phase=='play'?'Throw: '+{n:'normal',bul:'bullet',lob:'lob'}[G.tt]:G.msg;return}
 if(k=='p'&&(G.phase=='post'||G.phase=='pre'))return rpStart();
 return _h(k)}}
{const _ui=ui;ui=function(){_ui();try{xUI()}catch(e){console.error(e)}}}
function xUI(){if(!G||!P)return;const pl=$('plays'),u=G.poss=='U',pre=G.phase=='pre',car=CAR();
 if(G.ch&&G.ch.k=='ko'){pl.innerHTML='<button data-a="deep">Kick it deep</button><button data-a="onside">Onside kick</button>';$('hint').textContent=G.msg;return}
 if(!pre||G.ch||(car&&!myUnitOn()))return;
 if(u&&qbIsMe()){let b='';if(!P.run&&feat('throwT'))b+=`<button data-a="tt">Throw: ${{n:'Normal',bul:'Bullet',lob:'Lob'}[G.tt||'n']}</button>`;
  if(G.down==4&&feat('fakes')&&!G.two&&!G.fake)b+='<button data-a="fakep">Fake punt</button><button data-a="fakefg">Fake FG</button>';
  if(b)pl.insertAdjacentHTML('beforeend',b);if(G.fake)$('hint').textContent=(G.fake=='punt'?'Fake punt! ':'Fake field goal! ')+$('hint').textContent}}
$('plays').addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
 if(a=='deep')chDeep();else if(a=='onside')chOnside();else if(a=='tt'){G.tt={n:'bul',bul:'lob',lob:'n'}[G.tt||'n'];ui()}else if(a=='fakep')fakeSet('punt');else if(a=='fakefg')fakeSet('fg')});
{const _sr=showRes;showRes=function(){const m=G.msg;
 if(/^FLAG/.test(m))return xBanner('FLAG',m.replace(/^FLAG: /,''),'flag');
 const sp=m.match(/^(?:TOUCHDOWN! )?(DIVING CATCH|TOE-TAP CATCH)! (.*)$/);if(sp&&!/^TOUCHDOWN/.test(m))return xBanner(sp[1],sp[2].replace(/ - FIRST DOWN/,', first down'),G.poss=='U'?'good':'bad');
 if(/^QB slide/.test(m)){_sr();return}
 if(/^Fumble recovered by the offense/.test(m))return xBanner('FUMBLE - RECOVERED',m.replace(/^Fumble recovered by the offense\. /,''),G.poss=='U'?'good':'bad');
 if(/^Dropped!/.test(m))return xBanner('DROPPED','',G.poss=='U'?'bad':'good');
 if(/^Punt downed|^Fair catch|^Punt goes out|^Punt into/.test(m))return xBanner(m.split(/[.!]/)[0].toUpperCase(),'','inc');
 if(/BLOCKED/.test(m))return xBanner('BLOCKED!','',G.poss=='U'?'bad':'good');
 return _sr()}}
// ---------- box scores ----------
function boxLine(s){const v=k=>s[SI[k]]||0,a=[];if(v('pa'))a.push(`${v('pc')}/${v('pa')}, ${v('py')} yds${v('ptd')?', '+v('ptd')+' TD':''}${v('pi')?', '+v('pi')+' INT':''}`);
 if(v('ra'))a.push(`${v('ra')} car, ${v('ry')} yds${v('rtd')?', '+v('rtd')+' TD':''}`);if(v('rc'))a.push(`${v('rc')} rec, ${v('ty')} yds${v('tt')?', '+v('tt')+' TD':''}`);
 const df=[v('tk')?v('tk')+' tkl':'',v('sk')?v('sk')+' sk':'',v('in')?v('in')+' INT':''].filter(Boolean).join(', ');if(df)a.push(df);if(v('fga'))a.push(`${v('fgm')}/${v('fga')} FG`);return a.join('; ')}
function xBox(){const lg=R.lg,by={};R.pl.forEach(p=>by[p.id]=p);const lines=[[],[]],tot=[{py:0,ry:0,int:0,sk:0},{py:0,ry:0,int:0,sk:0}],v=(s,k)=>s[SI[k]]||0;
 for(const id in G.box){const p=by[id];if(!p)continue;const s=G.box[id],t=p.tid===0?0:1;tot[t].py+=v(s,'py');tot[t].ry+=v(s,'ry');tot[t].int+=v(s,'pi');tot[t].sk+=v(s,'sk');const l=boxLine(s);if(l)lines[t].push([p.id,p.n,p.g,l])}
 const ord2=['QB','RB','WR','TE','OL','DL','LB','CB','S','K','P'];lines.forEach(a=>a.sort((x,y)=>ord2.indexOf(x[2])-ord2.indexOf(y[2])));
 R.box=R.box||[];R.box.push({s:R.season,w:lg.wk,po:lg.po?RD[lg.po.rd]:'',o:G.opp.i,on:G.opp.n,a:G.sc[0],b:G.sc[1],wx:G.wx||'clear',night:G.night?1:0,tot,lines,pbp:(G.pbp||[]).slice(-90)});
 if(R.box.length>24)R.box.splice(0,R.box.length-24)}
{const _eg=endGame;endGame=function(){if(G&&G.live&&G.box){try{xBox()}catch(e){console.error(e)}}return _eg()}}
function boxUI(i){VW.page='box';const g=(R.box||[])[i];if(!g)return boxesUI();const tn=[R.lg.t[0].n,g.on];
 const tbl=t=>`<table class="mini">${g.lines[t].map(l=>`<tr><td class="dim">${l[2]}</td><td><a href="#" onclick="pp(${l[0]});return false">${esc(l[1])}</a></td><td>${l[3]}</td></tr>`).join('')||'<tr><td class="dim">No stats recorded.</td></tr>'}</table>`;
 const tr=(n,k)=>`<tr><td>${n}</td><td class="num">${g.tot[0][k]}</td><td class="num">${g.tot[1][k]}</td></tr>`;
 modal(`${nav()}<div class="hdr"><h1>${g.a>g.b?'W':g.a<g.b?'L':'T'} ${g.a}-${g.b} vs ${esc(g.on)}</h1><p class="dim">Season ${g.s} · ${g.po||'Week '+(g.w+1)} · ${wxName(g.wx)}${g.night?' · night game':''}</p></div>
 <div class="btns">${B('boxesUI()','All box scores')}</div>
 <div class="dash">${card('Team stats',`<table class="mini"><tr><th></th><th class="num">${esc(tAbbr(tn[0]))}</th><th class="num">${esc(tAbbr(tn[1]))}</th></tr>${tr('Passing yards','py')}${tr('Rushing yards','ry')}${tr('Interceptions thrown','int')}${tr('Sacks','sk')}</table>`)}
 ${card(esc(tn[0]),tbl(0))}${card(esc(tn[1]),tbl(1))}${card('Play-by-play',g.pbp.length?`<div class="pbpl">${g.pbp.map(x=>`<p>${esc(x)}</p>`).join('')}</div>`:'<p class="dim">Play-by-play was switched off for this game.</p>','wide')}</div>`)}
function boxesUI(){VW.page='box';const a=(R.box||[]).map((g,i)=>[g,i]).reverse();
 modal(`${nav()}<h1>Box scores</h1><p class="dim">Games you played yourself (simulated games don't have box scores). The last 24 are kept.</p>
 <table>${a.map(([g,i])=>`<tr><td>Season ${g.s}</td><td>${g.po||'Week '+(g.w+1)}</td><td><a href="#" onclick="boxUI(${i});return false">${g.a>g.b?'W':g.a<g.b?'L':'T'} ${g.a}-${g.b} vs ${esc(g.on)}</a></td><td class="dim">${wxName(g.wx)}${g.night?', night':''}</td></tr>`).join('')||'<tr><td class="dim">No games played yet.</td></tr>'}</table>`)}
[NAVF,NAVC].forEach(a=>{const i=a.findIndex(x=>x[0]=='sched');if(!a.some(x=>x[0]=='box'))a.splice(i+1,0,['box','boxesUI()','Box scores'])});
{const _dh=dashHome;dashHome=function(...a){const r=_dh.apply(this,a);try{const g=(R.box||[]).slice(-1)[0],sec=[...$('modal').querySelectorAll('section.cardx')].find(s=>s.querySelector('h4')&&s.querySelector('h4').textContent=='Last game');
 const lr=(R.lg.res||[]).slice(-1)[0];if(sec&&g&&g.s==R.season&&lr&&lr.a==g.a&&lr.b==g.b)sec.insertAdjacentHTML('beforeend',`<div class="btns">${B(`boxUI(${R.box.length-1})`,'Box score')}</div>`)}catch(e){}return r}}
{const _sc=schedUI;schedUI=function(...a){const r=_sc.apply(this,a);try{const rows=$('modal').querySelectorAll('#mainpg table tr, .pg table tr');(R.box||[]).forEach((g,i)=>{if(g.s!=R.season||g.po)return;const tr=rows[g.w];const td=tr&&tr.children[3];if(td&&td.textContent.trim())td.innerHTML=`<a href="#" onclick="boxUI(${i});return false">${td.innerHTML}</a>`})}catch(e){}return r}}
// ---------- DOM bits ----------
(()=>{const w=$('wrap');if(!w||!w.insertAdjacentHTML)return;w.insertAdjacentHTML('beforeend','<div id="sb2"></div><div id="pbp"></div><button id="rpb">Replay</button>');const b=$('rpb');if(b)b.onclick=()=>rpStart()})();
if(G&&!G.wind)try{xNewGame()}catch(e){}
if(!$('modal').hidden&&!(G&&G.live))lobby();
