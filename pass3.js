'use strict';
// Passing and contact upgrades: your throws from the pocket go where you aim them and throws on the run are more accurate;
// open receivers catch the ball; tipped balls pop up over everyone's heads; an interception off a tip can be returned;
// you can call a fair catch on kickoffs; and a truck runs the tackler over. Each part has its own switch.
{const add=[['On the field','acc2','Pinpoint passing','Your throws from the pocket go where you aim them. Throws on the run are more accurate too (but still less than from the pocket).'],
 ['On the field','catch2','Open receivers catch it','A catchable ball thrown to a receiver with no defender close by is caught.'],
 ['On the field','tip2','High tipped balls','A tipped pass pops up high over the players\' heads and drifts a little before it comes down.'],
 ['On the field','tipint','Returnable tipped picks','An interception off a tipped ball can be run back, like any other interception.'],
 ['On the field','kofc','Kickoff fair catch','Press F while a kickoff is in the air to call a fair catch. A fair catch inside your 25 puts the ball at the 25.'],
 ['On the field','truck2','Stronger truck','A truck runs the tackler over unless he is much stronger than the ball carrier.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const p3User=()=>G&&G.poss=='U'&&typeof qbIsMe=='function'&&qbIsMe()&&!(typeof autoMode=='function'&&autoMode());
// ---------- accuracy: the spread of your throws ----------
{const _ac=accSc;accSc=function(q,dd,tx,ty,pr){const sc=_ac(q,dd,tx,ty,pr);try{if(!feat('acc2')||!p3User()||!P)return sc;
  const sp=P.dropping?0:Math.hypot(q.vx||0,q.vy||0),run=sp>2||P.sd;return sc*(run?.45:pr?.55:.25)}catch(e){return sc}}}
// ---------- an open receiver catches a catchable ball ----------
{const _rs=resolve;resolve=function(...a){try{P.sure=0;const b=P.b,r=b.tgt;if(feat('catch2')&&b.st=='air'&&r&&!r.fall&&!(b.mis&&b.mis.bad&&feat('miss2'))){const l={x:b.tx,y:b.ty};
   const m=Math.min(99,...P.def.filter(p=>!p.eng&&!p.fall&&!p.gone).map(p=>Math.min(dist(p,l),dist(p,r))));if(dist(r,l)<2.4&&m>=3.2)P.sure=1}}catch(e){}
  try{return _rs.apply(this,a)}finally{if(P)P.sure=0}}}
// ---------- tipped balls go up high and drift ----------
{const _tp=tip;tip=function(l){_tp(l);try{if(!feat('tip2'))return;const b=P.b,a=rnd()*Math.PI*2,r=1+rnd()*2.5;
  Object.assign(b,{T2:1.15,tipH:6.5,sx:l.x,sy:l.y,tx:clamp(l.x+Math.cos(a)*r,1,119),ty:clamp(l.y+Math.sin(a)*r,1,52)});G.msg='Tipped! The ball pops up!'}catch(e){}}}
{const _st=step;step=function(dt){_st(dt);try{const b=P&&P.b;if(b&&b.st=='tip'&&b.tipH&&b.sx!=null){const k=Math.min(1,b.tt/b.T2);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k}}catch(e){}}}
// ---------- kickoffs: fair catch ----------
const kofcUser=()=>feat('kofc')&&G&&G.live&&G.phase=='play'&&P&&P.kf&&G.poss=='U'&&!(typeof autoMode=='function'&&autoMode())&&(!CAR()||(P.kf.ret&&P.kf.ret.pid===R.me));
addEventListener('keydown',e=>{try{if(e.repeat||e.key.toLowerCase()!='f'||!kofcUser()||!$('modal').hidden)return;const f=P.kf;f.fc=!f.fc;G.msg=f.fc?'Fair catch called: he will wave and catch it.':'Fair catch called off. Get ready to return it.';ui();e.preventDefault();e.stopImmediatePropagation()}catch(err){}},true);
function kofcEnd(r){const d=G.dir,own=d>0?10:110,x=(r.x-own)*d<25?own+d*25:r.x;P.fcK=1;endPlay('tackle',x);
 const yl=Math.round(Math.abs(G.nl-own));G.msg=`Fair catch. Ball at the ${yl}.`;if(typeof xLog=='function'&&feat('pbp'))xLog(G.msg);ui()}
{const _st=step;step=function(dt){const f=P&&P.kf;if(f&&!f.cpuD&&G.poss!='U'&&feat('kofc')){f.cpuD=1;const d=G.dir,own=d>0?10:110,y=(f.tx-own)*d;if(y>=0&&y<14&&rnd()<.55)f.fc=1}
  if(f&&f.t===0&&G.poss=='U'&&kofcUser()&&!f.hint){f.hint=1;G.msg='Kickoff! Get under it - press F for a fair catch.';ui()}
  _st(dt);try{if(f&&f.fc&&P&&!P.kf&&P.b&&P.b.st=='carry'&&P.b.c===f.ret&&!P.over&&feat('kofc'))kofcEnd(f.ret)}catch(e){console.error(e)}}}
// ---------- a stronger truck ----------
{const _tm=tackleMod;tackleMod=function(p,h){if(!feat('truck2')||!(h&&h.trk>0))return _tm(p,h);const t=h.trk;h.trk=0;let m;try{m=_tm(p,h)}finally{h.trk=t}
  const sh=RK(h).str,sp=RK(p).str,edge=(sh-sp)/35,front=Math.cos(Math.atan2(p.y-h.y,p.x-h.x)-Math.atan2(h.vy||0,h.vx||1e-6))>-.2;
  if(front)p.stun=Math.max(p.stun||0,.6);return m*clamp((front?.16:.4)-edge*.45,.04,.6)*(p.hs>0?1.8:1)}}
{const _cm=cmove;cmove=function(c,m,...a){const r=_cm(c,m,...a);try{if(m=='truck'&&feat('truck2')&&c&&c.trk>0)c.trk=Math.max(c.trk,.85)}catch(e){}return r}}
