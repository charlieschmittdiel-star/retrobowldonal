'use strict';
// Trick play fixes. RPO: your QB now gets a real choice. Hand off by doing nothing, or pull the ball back out of the
// running back's belly (pull back on the field, or press 1-5) before he reaches the line, and throw. The CPU QB reads the
// box. Flea flicker: the running back now always runs the fake toward the line and pitches it back to the QB, even if
// you're steering (he used to get tackled or cross the line first, so the pitch never happened).
function rpoWindow(){const b=P&&P.b;if(!P||G.phase!='play'||G.poss!='U'||!P.pf||!P.pf.rpo||P.rpoX||!qbIsMe()||autoMode())return false;
 if(b.st=='qb')return P.run;if(b.st=='carry'&&P.run&&b.c===P.off[P.ho||5]&&P.t<1){const rb=b.c;return (rb.x-P.L)*G.dir<-.5}return false}
function rpoPull(){const b=P.b,rb=b.st=='carry'?b.c:null,q=P.off[0];P.rpoDone=1;P.rpoX=1;P.run=0;P.scr=0;P.rusher=null;
 if(rb){b.st='qb';b.c=null;b.x=q.x;b.y=q.y;if(G.box&&rb.pid&&G.box[rb.pid])G.box[rb.pid][SI.ra]=Math.max(0,(G.box[rb.pid][SI.ra]||0)-1)}
 P.sd=0;P.def.forEach((p,i)=>{if(i>=4&&i<=6&&rnd()<.55)p.bite=.4});G.msg='RPO: pulled it! Throw it.'}
C.addEventListener('pointerdown',e=>{try{if(rpoWindow())rpoPull()}catch(err){}},true);
{const _h=hit;hit=function(k,...a){try{if(/^[1-5]$/.test(k)&&rpoWindow())rpoPull()}catch(e){}return _h(k,...a)}}
// CPU QB: usually hands off, but throws when the box is loaded (7-8 defenders close to the line)
{const _st=step;step=function(dt){const f=P&&P.pf;
 // flea flicker: take the running back's fake run out of your hands until he pitches it back
 let rb=null,sv=null;try{if(f&&f.flea&&!P.fleaDone&&G.phase=='play'&&P.b.st=='carry'&&P.b.c===P.off[P.ho||5]){rb=P.b.c;sv=[rb.x,rb.y]}}catch(e){}
 _st(dt);
 try{if(!P||G.phase!='play'||P.over)return;const b=P.b,d=G.dir,L=P.L,O=P.off,q=O[0];
  if(rb&&sv&&!P.fleaDone&&b.st=='carry'&&b.c===rb){rb.x=sv[0];rb.y=sv[1];mv(rb,L-d*1.3,rb.y+(26.5-rb.y)*.1,rb.spd*.6,dt);
   if(P.t>=.92){P.fleaDone=1;P.run=0;P.scr=0;P.rusher=null;b.st='qb';b.c=null;b.x=q.x;b.y=q.y;P.sd=0;if(G.box&&rb.pid&&G.box[rb.pid])G.box[rb.pid][SI.ra]=Math.max(0,(G.box[rb.pid][SI.ra]||0)-1);
    P.def.forEach((p,i)=>{if(i>=4&&rnd()<.65)p.bite=.55});if(G.poss=='U')G.msg='Flea flicker! Pitched back to the QB - throw it deep!'}}
  if(f&&f.rpo&&!P.rpoDone&&P.run&&b.st=='qb'&&P.t>=.38&&!(G.poss=='U'&&qbIsMe()&&!autoMode())){P.rpoDone=1;const box=P.def.filter(p=>Math.abs(p.x-L)<5.5&&p.y>18&&p.y<35).length;if(rnd()<(box>=8?.85:box==7?.3:.06)){P.run=0;throwTo(O[1])}}
 }catch(e){console.error(e)}}}
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P&&G.phase=='play'&&P.pf&&P.pf.rpo&&G.poss=='U'&&qbIsMe()&&!autoMode())G.msg=TOUCH()?'RPO: tap the field before the handoff to keep it and throw, or let him run.':'RPO: pull back on the field (or press 1-5) before the handoff to keep it and throw, or let him run.'}catch(e){}return r}}
