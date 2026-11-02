'use strict';
// A deeper, quicker QB drop-back, and kickoffs that are always returned: the returner fields the kick, and if he's in the
// end zone he can take a knee (back up / move toward the back of the end zone) for a touchback.
{const add=[['On the field','drop2','Deeper drop-back','The quarterback drops back farther and faster after the snap.'],
 ['On the field','ko2','Kick returns, no touchback menu','Kickoffs are always fielded and returned. Catch it in the end zone and back up to take a knee for a touchback.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- drop-back ----------
{const _st=step;step=function(dt){const q=P&&P.off&&P.off[0],on=feat('drop2')&&q&&G.phase=='play'&&!P.run&&!P.kr&&P.b&&P.b.st=='qb'&&P.t<1.05;const x0=q?q.x:0;
 _st(dt);try{if(!on||P.run||P.b.st!='qb'||P.off[0]!==q)return;const d=G.dir,tgt=P.L-d*7.5,dep=(q.x-tgt)*d;if(dep<=0)return;q.x=x0-d*Math.min((x0-tgt)*d,6.5*dt);q.fa=d>0?0:Math.PI}catch(e){}}}
// ---------- kick returns ----------
{const _st=step;step=function(dt){_st(dt);try{if(!feat('ko2')||!P||!P.kr||!P.koEZ||G.phase!='play'||P.over)return;const b=P.b,c=b.st=='carry'?b.c:null;if(!c)return;const d=G.dir,own=d>0?10:110,inEZ=(c.x-own)*d<0;
 if(!inEZ){P.koEZ=0;return}const user=G.poss=='U'&&!(typeof autoMode=='function'&&autoMode())&&(!CAR()||c.pid===R.me);
 if(user){const v=inp();if(P.t>.15&&v[2]&&v[0]*d<-.5)return koKneel(c)}
 else if(!P.koDec&&P.t>.3){P.koDec=1;if((c.x-own)*d<=-3&&rnd()<.85)return koKneel(c)}}catch(e){console.error(e)}}}
function koKneel(c){P.knl=1;endPlay('tackle',c.x);G.msg='Kneel in the end zone: touchback, ball at the 25.';if(typeof xLog=='function'&&feat('pbp'))xLog('Kneel in the end zone for a touchback.')}
{const _kr=krSetup;krSetup=function(lx,d,kind,...a){const r=_kr.call(this,lx,d,kind,...a);try{if(P){P.koDec=0;if(kind=='ko'&&feat('ko2')&&(lx-(d>0?10:110))*d<0){P.koEZ=1;if(G.poss=='U')G.msg='Kickoff fielded in the end zone. Run it out, or back up to take a knee for a touchback.'}}}catch(e){}return r}}
// with the deeper drop, a rusher who has beaten his man closes on the quarterback a little faster (keeps sack rates real)
{const _st=step;step=function(dt){_st(dt);try{if(!feat('drop2')||!P||G.phase!='play'||P.run||P.kr||P.b.st!='qb')return;const q=P.off[0];P.def.forEach(p=>{if(!p.rush||p.eng||p.fall||p.bite>0||p.stun>0||(p.cool||0)>0)return;const dd=dist(p,q);if(dd<1||dd>12)return;const k=Math.min(dd-.9,p.spd*.35*dt);p.x+=(q.x-p.x)/dd*k;p.y+=(q.y-p.y)/dd*k})}catch(e){}}}
