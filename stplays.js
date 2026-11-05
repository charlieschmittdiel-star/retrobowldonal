'use strict';
// Special teams in the playbook: on offense, Punt and Field Goal are plays you can call; on defense, FG Block and
// Punt Return are calls. If the CPU kicks into your FG Block, the block has a real chance; if it punts into your Punt
// Return, the punt is always fielded and returned (no fair catch, not downed). If you call one and the CPU goes for it
// instead, your special teams unit is on the field (FG Block plays like a goal-line rush, Punt Return like a prevent).
{const add=[['Playbook','stplays','Special teams plays','Punt, Field Goal, FG Block and Punt Return are plays in the playbook.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const STD={'FG Block':{k:'fgb',fb:'Goal Line D'},'Punt Return':{k:'pr',fb:'Prevent'}};
function stSVG(kind){const L='<line x1="2" y1="58" x2="110" y2="58" stroke="#7cc4ff" stroke-width="1.5"/>',o=(x,y)=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#fff"/>`,x=(cx,cy)=>`<g stroke="#ff5a4d" stroke-width="1.8"><line x1="${cx-2.4}" y1="${cy-2.4}" x2="${cx+2.4}" y2="${cy+2.4}"/><line x1="${cx+2.4}" y1="${cy-2.4}" x2="${cx-2.4}" y2="${cy+2.4}"/></g>`;
 let s='';const line=[...Array(7)].map((_,i)=>36+i*6.5);
 if(kind=='punt'){line.forEach(v=>s+=o(v,62));s+=o(56,72)+o(48,66)+o(64,66)+o(8,62)+o(104,62)+`<path d="M56 72 Q56 10 56 6" fill="none" stroke="#ffd84d" stroke-width="1.8" stroke-dasharray="3 3"/>`}
 else if(kind=='fg'){line.forEach(v=>s+=o(v,62));s+=o(30,63)+o(82,63)+o(56,70)+o(52,76)+`<path d="M52 76 Q54 30 56 6" fill="none" stroke="#ffd84d" stroke-width="1.8"/><path d="M48 6 L48 2 M64 6 L64 2 M48 6 L64 6" stroke="#fde047" stroke-width="1.6" fill="none"/>`}
 else if(kind=='fgb'){[30,38,46,54,62,70,78,86].forEach(v=>{s+=x(v,54)+`<line x1="${v}" y1="54" x2="${v+(56-v)*.25}" y2="${60}" stroke="#ff5a4d" stroke-width="1.6" marker-end=""/>`});s+=x(44,46)+x(68,46)+x(56,40)}
 else{[36,46,56,66,76].forEach(v=>s+=x(v,52));s+=x(24,40)+x(88,40)+x(44,30)+x(68,30)+x(56,10)+`<path d="M56 10 L56 4" stroke="#ffd84d" stroke-width="1.8"/>`}
 return`<svg viewBox="0 0 112 80">${L}${s}</svg>`}
// cards added to the playbook
{const _pb=pbHTML;pbHTML=function(u){let h=_pb(u);try{if(!feat('stplays'))return h;
  const card=(attr,svg,name,on)=>`<button class="card st ${on?'on':''}" ${attr}>${svg}<span>${name}</span></button>`;
  let add='';if(u){const fd=typeof fgDist=='function'?fgDist():0;add=card('data-a="punt"',stSVG('punt'),'Punt')+card('data-a="fg"',stSVG('fg'),`Field Goal (${fd} yd)`)}
  else add=card('data-d="FG Block"',stSVG('fgb'),'FG Block',G.stc=='fgb')+card('data-d="Punt Return"',stSVG('pr'),'Punt Return',G.stc=='pr');
  if(G.stc&&!u)h=h.replace(/(<button class="card) on(")/g,'$1$2');
  const i=h.lastIndexOf('</div>');h=i>=0?h.slice(0,i)+add+h.slice(i):h+add}catch(e){console.error(e)}return h}}
// calling FG Block / Punt Return: the unit lines up like a goal-line rush or a prevent shell
{const _ad=applyDef;applyDef=function(n,...a){const s=STD[n];if(s&&feat('stplays')){const r=_ad(s.fb,...a);G.stc=s.k;G.stcN=n;return r}if(G&&G.poss!='U')G.stc=null;return _ad(n,...a)}}
{const _se=setup;setup=function(...a){if(G){G.stc=null;G.stcN=null}if(P)P.prc=0;return _se.apply(this,a)}}
{const _ui=ui;ui=function(...a){const r=_ui.apply(this,a);try{if(G&&G.stc&&G.poss!='U'&&G.phase=='pre'&&!G.ch&&!CAR()){const h=$('hint');if(h&&!G.pbOpen)h.textContent=`${G.stcN}: press Snap when you're set.`}}catch(e){}return r}}
// the CPU decides at the snap: what happens with your call
{const _ks=kickStart;kickStart=function(kind,...a){const call=G&&G.poss=='C'?G.stc:null;const r=_ks(kind,...a);try{if(P&&P.kk&&call&&feat('stplays')){P.kk.stc=call;
   if(call=='pr'&&kind=='punt'){P.prc=1;G.msg='Punt return is set. Field it and run it back!'}
   else if(call=='fgb'&&kind=='fg')G.msg='FG block! Everyone rushes the kick.';
   else if(call=='fgb'&&kind=='punt'){P.prc=1;G.msg='They punt into your block team. Nobody is back to return it.'}
   ui()}}catch(e){console.error(e)}return r}}
{const _kl=kLaunch;kLaunch=function(...a){const r=_kl.apply(this,a);try{const kk=P.kk;if(!kk||!kk.stc||kk.blk)return r;
   const dl=P.def.slice(0,7).reduce((s,p)=>s+(p.sk?p.sk.str:60),0)/7,ks=kk.k&&kk.k.sk?kk.k.sk.skl:60;
   if(kk.stc=='fgb')kk.blk=rnd()<(kk.kind=='punt'?.06:clamp(.12+(dl-70)*.004-(ks-70)*.003,.08,.25));
   if(kk.stc=='pr'&&kk.kind!='punt')kk.blk=rnd()<.005}catch(e){}return r}}
// the block team surges at the kicker
{const _kt=kickTick;kickTick=function(dt,...a){const r=_kt(dt,...a);try{const kk=P&&P.kk;if(kk&&kk.stc=='fgb'&&(kk.st=='snap'||kk.st=='plant')&&G.phase=='kick'){const d=G.dir,L=P.L;P.def.forEach((p,i)=>{if(i>8)return;mv(p,L-d*(kk.kind=='punt'?4:2.5),p.y+(26.5-p.y)*.35,2.6,dt)})}}catch(e){}return r}}
// a punt into your block team is not returned: it rolls dead
{const _ke=kEnd;kEnd=function(...a){const kk=P&&P.kk;if(kk&&kk.stc=='fgb'&&kk.kind=='punt'){const r0=kReturn;kReturn=function(lx){kReturn=r0;const d=G.dir,recvGoal=d>0?110:10;G.nl=clamp(lx,11,109);G.msg=`Nobody back to return it. The punt rolls dead at the ${Math.round(Math.abs(lx-recvGoal))}.`;G.phase='post';G.pt=2;save();ui()};try{return _ke(...a)}finally{kReturn=r0}}return _ke(...a)}}
// they went for it instead
{const _sn=snap;snap=function(...a){const call=G&&G.poss=='C'&&G.phase=='pre'?G.stc:null;const r=_sn.apply(this,a);try{if(call&&G.phase=='play'&&!P.kk&&feat('stplays'))G.msg=call=='pr'?'They are going for it! Your punt return unit is on the field.':'They are going for it! Your block team is on the field.'}catch(e){}return r}}
