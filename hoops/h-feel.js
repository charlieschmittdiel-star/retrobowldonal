'use strict';
// Smarter CPU offense: shot selection like a real team (take the open look early, pass up a contested one for a
// teammate who is open, kick out when help comes on a drive) and floor spacing (players off the ball stop crowding
// each other). Applies to both teams; the difficulty still sets how sharp the other team is. It has its own switch.
{const add=[['On the court','off3','Smarter offense','Teams take open shots early, swing the ball when they are covered, kick out to open shooters when help comes on a drive, and spread the floor instead of bunching up.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const userHas=e=>G&&!G.auto&&e===G.ctl&&e.t===0;
// expected points for a shot from where this player stands right now
function o3EP(r){const info=shotInfo(r,r.x,r.y),mp=makeProb(r,info,0);return{ep:mp.p*(info.three?3:2),info,mp}}
function o3Open(e){const T=onT(e.t).filter(r=>r!==e&&!(r.z>0));let best=null,bs=-9;T.forEach(r=>{const o=openness(r),risk=passRisk(e,r);if(o<5.5||risk>.3)return;const q=o3EP(r);if(q.info.d>26)return;const sc=q.ep+Math.min(o,10)*.03-risk;if(sc>bs){bs=sc;best={r,ep:q.ep,o}}});return best}
{const _h=handlerAI;handlerAI=function(e,dt){try{if(feat('off3')&&G.phase=='live'&&!userHas(e)&&G.b.st=='held'&&G.b.h===e){const s=G.dir[e.t],hx=hoopX(s),iq=IQ(e.t);
   const B=G.b;if(B._h!==e){B._h=e;B._ht=0}else B._ht=(B._ht||0)+dt;const held=B._ht;e.cd.o3=(e.cd.o3||0)-dt;const far=Math.abs(e.x-hx)>42;
   if(!far&&e.cd.o3<=0){e.cd.o3=.3+(1-iq)*.25;const el=feat('shotclk')?24-G.shot:6,me=o3EP(e),cd=me.mp.cd,sk=e.p.sk;
    // on a drive and the help has come: kick it out
    if(e.drv>0&&me.info.d<16){const help=onT(opp(e.t)).filter(d=>d!==e.man&&dist(d,e)<5.5).length;if(help){const o=o3Open(e);if(o&&o.o>=7&&o.ep>=.95&&rnd()<.55+iq*.4){e.drv=0;passTo(e,o.r);return}}}
    else if(!(e.drv>0)&&el>1.5&&G.shot>3){
     // an open look in his range: take it
     const good=me.info.three?sk.thr>=62:me.info.d>=14?sk.mid>=60:true;
     if(cd>=5.5&&good&&me.info.d<25&&me.ep>=(me.info.three?1.02:.9)&&rnd()<.35+iq*.6){e.cd.dec=.3;return shoot(e,gauss()*.04+(iq-.7)*.04)}
     // covered: swing it to an open teammate with a better look
     if(cd<4&&G.shot>5&&held>.8){const o=o3Open(e);if(o&&o.ep>=me.ep+.12&&o.ep>=.95&&rnd()<.5+iq*.45){e.cd.dec=.35;passTo(e,o.r);return}}}}}}catch(err){console.error(err)}return _h(e,dt)}}
// spacing: players off the ball keep about 12 feet from each other in the half court
{const _o=offAI;offAI=function(e,dt){const r=_o(e,dt);try{if(!feat('off3')||G.phase!='live'||userHas(e))return r;const b=G.b;if(b.st!='held'||b.h.t!==e.t||b.h===e)return r;
  if(e.scr>0||e.roll>0||e.cut>0)return r;const s=G.dir[e.t],hx=hoopX(s);if(Math.abs(b.h.x-hx)>40)return r;
  let px=0,py=0;onT(e.t).forEach(o=>{if(o===e)return;const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy)||.01,R0=o===b.h?10:11;if(d<R0){const k=(R0-d)/R0;px+=dx/d*k;py+=dy/d*k}});
  if(px||py){const v=topSpd(e)*.8,l=Math.hypot(px,py);let tx=(e.tx||0)+px/l*v*Math.min(1,l*1.6),ty=(e.ty||0)+py/l*v*Math.min(1,l*1.6);
   // stay on the floor and in the half court
   if(e.y<2.5&&ty<0)ty=0;if(e.y>47.5&&ty>0)ty=0;if(Math.abs(e.x-hx)>32&&(e.x-hx)*s<0&&tx*s<0)tx=0;if(Math.abs(e.x-hx)<1.5&&tx*s>0)tx=0;
   const m=Math.hypot(tx,ty),cap=topSpd(e)*.85;if(m>cap){tx*=cap/m;ty*=cap/m}e.tx=tx;e.ty=ty}}catch(err){}return r}}
