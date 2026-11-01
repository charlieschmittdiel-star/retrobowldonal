'use strict';
// More football: jump balls on deep throws, more penalties (intentional grounding, roughing the passer, face masks,
// late hits, offensive pass interference), a smarter pocket (QBs step up and slide away from pressure,
// blockers pick up blitzers) and defensive disguises (yours and the CPU's). Each has its own switch.
{const add=[['On the field','jumpb','Jump balls','On deep throws the receiver and a nearby defender both leap. Skill, strength and awareness decide who comes down with it.'],
 ['On the field','pen2','More penalties','Intentional grounding, roughing the passer on late hits, face masks on big hits, late hits out of bounds and offensive pass interference. Needs Penalties on.'],
 ['On the field','pocket2','Smarter pocket','CPU quarterbacks step up and slide away from pressure, and blockers pick up free blitzers.'],
 ['On the field','disg2','Defensive disguises','Before the snap the CPU can show a different look than it plays. On defense, use the Disguise button (or X) to show blitz, rotate your safeties or press.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- jump balls ----------
{const _rs=resolve;resolve=function(...a){try{const b=P.b,r=b.tgt;P.cTight=0;if(b.st=='air'&&r&&!r.fall){const l={x:b.tx,y:b.ty},rd=dist(r,l);let dd=null,m=99;P.def.forEach(p=>{if(p.eng||p.fall||p.gone)return;const q=dist(p,l);if(q<m){m=q;dd=p}});
 P.cTight=rd<2.4&&m<1.3;
 if(feat('jumpb')&&Math.hypot(b.tx-b.sx,b.ty-b.sy)>=20&&(b.arc||1)>=.9&&rd<1.6&&m<1.5&&!(G.poss!='U'&&dd===cd&&cd.swat>0)){
  const rs=r.sk||{skl:60,str:60,spd:60,awr:60},ds=dd.sk||{skl:60,str:60,spd:60,awr:60},hawk=G.poss!='U'&&dd===cd&&cd.hawk>0?12:0;
  const sr=rs.skl*.45+rs.str*.25+rs.spd*.1+8+rnd()*30,sd=ds.awr*.3+ds.skl*.35+ds.str*.2+hawk+rnd()*30+(m<rd?3:0),df=sr-sd;
  r.an={k:'overtop',t:0,d:.65};dd.an={k:'overtop',t:0,d:.6};if(feat('slowmo')&&!(CAR()&&autoMode()))G.slow=.7;P.jb=1;
  if(df>2){const sv=[];P.def.forEach(p=>{if(dist(p,l)<2.6){sv.push([p,p.x,p.y]);p.x=-60;p.y=-60}});let res;try{res=_rs.apply(this,a)}finally{sv.forEach(([p,x,y])=>{p.x=x;p.y=y})}
   if(P.b.st=='carry'&&P.b.c===r){G.msg='JUMP BALL! He comes down with it! '+(G.msg||'');jbLog(`${jbN(r)} wins the jump ball over ${jbN(dd)}.`)}return res}
  b.st='dead';if(df<-18){jbLog(`${jbN(dd)} high-points it for the interception!`);G.msg='JUMP BALL! Picked off!';return intReturn(l,dd)}
  jbLog(`${jbN(dd)} knocks away the jump ball.`);if(rnd()<.3){const t=tip(l);G.msg='JUMP BALL! Tipped up for grabs!';return t}const t=endPlay('inc');G.msg='JUMP BALL! Knocked away. Incomplete.';return t}}}catch(e){console.error(e)}return _rs.apply(this,a)}}
const jbN=p=>typeof xNm=='function'?xNm(p):p.pos,jbLog=t=>{if(typeof xLog=='function'&&feat('pbp'))xLog(t)};
// ---------- more penalties ----------
{const _pr=penRoll;penRoll=function(k,x){const r0=_pr(k,x);if(r0||!feat('pen2'))return r0;const d=G.dir,r=rnd(),gain=Math.round(((x==null?P.L:x)-P.L)*d);
 if(k=='inc'&&P.ground&&G.down<4&&r<.7){P.ground=0;return{s:'O',n:'Intentional grounding',y:10,lod:1}}
 if(P.rtp&&(k=='inc'||k=='tackle'||k=='td')&&r<.3){P.rtp=0;return{s:'D',n:'Roughing the passer',y:15,first:1,from:k=='inc'?null:x}}
 if((k=='tackle'||k=='sack')&&P.tkl&&P.tkl.hs>0&&r<.05)return{s:'D',n:'Face mask',y:15,first:1,from:x};
 if(k=='tackle'&&P.oob&&P.tkl&&r<.05)return{s:'D',n:'Unnecessary roughness (late hit)',y:15,first:1,from:x};
 if((k=='tackle'||k=='td')&&P.rec&&P.cTight&&gain>=12&&r<.06)return{s:'O',n:'Offensive pass interference',y:10};
 return null}}
{const _pa=penApply;penApply=function(pn,...a){const r=_pa(pn,...a);try{if(pn&&pn.lod&&G.down<4){G.down++;G.msg=G.msg.replace(/replay \w+ down/,`loss of down, ${ord(G.down)} down`)}}catch(e){}return r}}
{const _ta=throwAt;throwAt=function(tx,ty,...a){try{if(P){P.thrT=P.t;const qb=P.off[0];P.ground=!P.sd&&!P.scr&&P.def.some(p=>p.rush&&!p.eng&&dist(p,qb)<2.2)&&Math.min(...P.off.slice(1,6).map(r=>Math.hypot(r.x-tx,r.y-ty)))>5}}catch(e){}return _ta.call(this,tx,ty,...a)}}
{const _sn=snap;snap=function(...a){
 const r=_sn.apply(this,a);try{if(P&&G.phase=='play'){P.rtp=0;P.thrT=null;P.jb=0;P.cTight=0;P.ground=0;dsSnap()}}catch(e){console.error(e)}return r}}
// ---------- smarter pocket and blitz pickup ----------
function pkMove(dt){const O=P.off,qb=O[0],d=G.dir,L=P.L,b=P.b;if(b.st!='qb'||P.run||P.scr||P.t<.9)return;
 const fr=P.def.filter(p=>p.rush&&!p.eng&&!p.fall&&!p.gone).sort((a,c)=>dist(a,qb)-dist(c,qb)),n=fr[0];if(!n||dist(n,qb)>4.8)return;
 const ax=qb.x-n.x,ay=qb.y-n.y,m=Math.hypot(ax,ay)||1,behind=(n.x-qb.x)*d<.6;let vx=ax/m,vy=ay/m;if(behind){vx=vx*.4+d*.8;vy*=1.1}
 const hx=L-7*d,tx=qb.x+vx*3,ty=qb.y+vy*3,cx=clamp(tx,Math.min(hx-d*1.5,L-d*3),Math.max(hx-d*1.5,L-d*3)),cy=clamp(ty,22,31);
 if(Math.hypot(cx-hx,cy-qb.sy)>4.2)return;mv(qb,cx,cy,qb.spd*.55,dt)}
{const _c=cpuQB;cpuQB=function(dt){try{if(feat('pocket2'))pkMove(dt)}catch(e){console.error(e)}try{if(P.dsgHold>0){P.dsgHold-=dt;const qb=P.off[0];if(!P.def.some(p=>p.rush&&!p.eng&&dist(p,qb)<2.6))return}}catch(e){}return _c(dt)}}
function pkPickup(){if(P.run||P.scr||P.kr||P.b.st!='qb')return;const O=P.off,qb=O[0],D=P.def,isB=(o,i)=>i>=6||((i==4||i==5)&&!o.route.length);
 const free=D.filter(p=>p.rush&&!p.eng&&!p.fall&&dist(p,qb)<10).sort((a,c)=>dist(a,qb)-dist(c,qb));
 free.forEach(p=>{if(O.some((o,i)=>isB(o,i)&&o.tg===p&&!o.eng))return;const o=O.filter((o,i)=>isB(o,i)&&!o.eng&&!o.help&&!o.fall&&(!o.tg||(o.tg.eng&&o.tg.eng!==o))&&dist(o,p)<6).sort((a,c)=>dist(a,p)-dist(c,p))[0];if(o){o.tg=p;o.rt=.35}})}
// ---------- defensive disguises ----------
const DSG=['None','Show blitz','Rotate safeties','Press'];
function dsDeep(){const dp=P.dp;if(!dp)return[];return[9,10].filter(i=>{const e=dp.p[i];return e&&e[2]=='z'&&Math.abs(e[3][0])>=12})}
function dsApply(kind){const d=G.dir,L=P.L,D=P.def,set=(i,x,y)=>{const p=D[i];if(!p)return;p.x=p.sx=x;p.y=p.sy=clamp(y,1.5,51.5)};
 if(kind=='Show blitz'){[4,5,6].forEach(i=>set(i,L+d*1.6,D[i].y));const j=rnd()<.5?9:10;set(j,L+d*3,D[j].y)}
 else if(kind=='Rotate safeties'){const dp=dsDeep();if(dp.length>=2){const i=rnd()<.5?9:10;set(i,L+d*7,26.5+(i==9?-3:3))}else{set(9,L+d*12,17.5);set(10,L+d*12,35.5)}}
 else if(kind=='Press'){[7,8].forEach(i=>{const p=D[i];if(p)set(i,L+d*(Math.abs(p.x-L)>3?1.2:7),p.y)})}}
function dsSnap(){P.dsgHold=0;if(!feat('disg2'))return;if(G.poss!='U'&&G.dsg&&G.dsg!='None')P.dsgHold=G.dsg=='Rotate safeties'?.4:.3}
{const _su=setup;setup=function(...a){const r=_su.apply(this,a);try{if(feat('disg2')&&P&&P.dp&&!P.kk){if(G.poss=='U'){const iq=IQ();if(rnd()<.15+.35*iq){const k=DSG[1+(rnd()*3|0)];dsApply(k);P.hint=k=='Show blitz'?'they are showing blitz':k=='Rotate safeties'?'watch the safeties':'corners changing their depth'}}else if(G.dsg&&G.dsg!='None')dsApply(G.dsg)}}catch(e){console.error(e)}return r}}
{const _ad=applyDef;applyDef=function(...a){const r=_ad.apply(this,a);try{if(feat('disg2')&&G.poss!='U'&&G.dsg&&G.dsg!='None'&&G.phase=='pre')dsApply(G.dsg)}catch(e){}return r}}
function dsCycle(){if(!feat('disg2')||G.poss=='U'||G.phase!='pre')return;const i=DSG.indexOf(G.dsg||'None');G.dsg=DSG[(i+1)%DSG.length];if(P.dpn)applyDef(P.dpn);if(G.dsg!='None')dsApply(G.dsg);G.msg=`Disguise: ${G.dsg}`;ui()}
{const _ui=ui;ui=function(...a){const r=_ui.apply(this,a);try{if(feat('disg2')&&G&&P&&G.phase=='pre'&&G.poss!='U'&&!G.ch&&!CAR()){const pl=$('plays');if(pl&&!pl.querySelector('[data-a="dsg"]'))pl.insertAdjacentHTML('afterbegin',`<button data-a="dsg" class="${G.dsg&&G.dsg!='None'?'on':''}">Disguise: ${G.dsg||'None'}</button>`)}}catch(e){}return r}}
$('plays').addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-a="dsg"]');if(el)dsCycle()});
{const _h=hit;hit=function(k,...a){if(k=='x'&&G&&G.phase=='pre'&&G.poss!='U'&&feat('disg2')&&$('modal').hidden&&!CAR())return dsCycle();return _h(k,...a)}}
// ---------- per-frame hooks ----------
{const _st=step;step=function(dt){_st(dt);try{if(G.phase=='play'&&P&&!P.over){
 if(P.b.st=='air'&&P.thrT!=null&&P.t-P.thrT<.35&&!P.rtp){const qb=P.off[0];if(P.def.some(p=>p.rush&&!p.eng&&!p.fall&&dist(p,qb)<1.2))P.rtp=1}
 if(feat('pocket2'))pkPickup()}}catch(e){console.error(e)}}}
