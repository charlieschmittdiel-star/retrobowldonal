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
 let rb=null,sv=null;try{if(f&&f.flea&&!P.fleaDone&&!P.kr&&G.phase=='play'&&P.b.st=='carry'&&P.b.c===P.off[P.ho||5]){rb=P.b.c;sv=[rb.x,rb.y]}}catch(e){}
 _st(dt);
 try{if(!P||G.phase!='play'||P.over)return;const b=P.b,d=G.dir,L=P.L,O=P.off,q=O[0];
  if(rb&&sv&&!P.fleaDone&&b.st=='carry'&&b.c===rb){rb.x=sv[0];rb.y=sv[1];mv(rb,L-d*1.3,rb.y+(26.5-rb.y)*.1,rb.spd*.6,dt);
   if(P.t>=.92){P.fleaDone=1;P.run=0;P.scr=0;P.rusher=null;b.st='qb';b.c=null;b.x=q.x;b.y=q.y;P.sd=0;if(G.box&&rb.pid&&G.box[rb.pid])G.box[rb.pid][SI.ra]=Math.max(0,(G.box[rb.pid][SI.ra]||0)-1);
    P.def.forEach((p,i)=>{if(i>=4&&rnd()<.65)p.bite=.55});if(G.poss=='U')G.msg='Flea flicker! Pitched back to the QB - throw it deep!'}}
  if(f&&f.rpo&&!P.rpoDone&&!P.kr&&P.run&&b.st=='qb'&&P.t>=.38&&!(G.poss=='U'&&qbIsMe()&&!autoMode())){P.rpoDone=1;const box=P.def.filter(p=>Math.abs(p.x-L)<5.5&&p.y>18&&p.y<35).length;if(rnd()<(box>=8?.85:box==7?.3:.06)){P.run=0;throwTo(O[1])}}
 }catch(e){console.error(e)}}}
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P&&G.phase=='play'&&P.pf&&P.pf.rpo&&G.poss=='U'&&qbIsMe()&&!autoMode())G.msg=TOUCH()?'RPO: tap the field before the handoff to keep it and throw, or let him run.':'RPO: pull back on the field (or press 1-5) before the handoff to keep it and throw, or let him run.'}catch(e){}return r}}
// Read option: the end on the running back's side is left unblocked and either crashes down on the back or stays wide.
// When you're the QB the read is yours: press Space before the handoff to keep it, or do nothing to hand off.
// The CPU QB reads him: if he crashes, it keeps it and runs; if he stays wide, it hands off.
function roDE(){const D=P.def,rb=P.off[P.ho||5];return [D[0],D[3]].filter(Boolean).reduce((a,p)=>!a||dist(p,rb)<dist(a,rb)?p:a,null)}
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P&&G.phase=='play'&&P.pf&&P.pf.opt&&P.run){const de=roDE();P.roDE=de;const iq=typeof IQ=='function'?IQ():.5;P.roCrash=rnd()<(G.poss=='U'?.5-.15*iq:.45);
  if(G.poss=='U'&&qbIsMe()&&!autoMode())G.msg='Read option: watch the end. Press Space to keep it with the QB, or do nothing to hand off.'}}catch(e){}return r}}
{const _st=step;step=function(dt){try{if(P&&G.phase=='play'&&P.pf&&P.pf.opt&&P.roUser&&!P.optDone&&P.b.st=='qb'&&P.t>=.46)P.optDone=1}catch(e){}let de=null,sv=null;try{if(P&&G.phase=='play'&&P.pf&&P.pf.opt&&!P.optDone&&!P.kr&&P.b.st=='qb'&&P.roDE&&!(G.poss!='U'&&P.roDE===cd&&!autoMode())){de=P.roDE;if(de.eng){if(de.eng.eng===de)de.eng.eng=null;de.eng=null}sv=[de.x,de.y];de.bite=dt*1.01}}catch(e){}
 _st(dt);
 try{if(de&&sv&&G.phase=='play'){const d=G.dir,L=P.L,rb=P.off[P.ho||5],q=P.off[0];de.x=sv[0];de.y=sv[1];de.bite=0;
  if(P.roCrash)mv(de,rb.x+d*.6,rb.y,de.spd*.95,dt);else{const side=Math.sign(de.y-26.5)||1;mv(de,L-d*1.5,clamp(q.y+side*4.5,2,51),de.spd*.7,dt)}
  if(P.t>=.44&&!P.optDone&&P.b.st=='qb'&&G.poss=='U'&&qbIsMe()&&!autoMode()){P.roUser=1}
  else if(P.t>=.44&&!P.optDone&&P.b.st=='qb'){const aw=(q.sk&&q.sk.awr)||65,right=rnd()<clamp(.72+(aw-60)/120,.6,.95),keep=right?P.roCrash:!P.roCrash;P.optDone=1;if(keep){roKeep();G.msg=G.poss=='U'?'The end crashed - QB keeps it!':'Read option: the QB keeps it!'}}}}catch(e){console.error(e)}}}
function roKeep(){const b=P.b,q=P.off[0];P.optDone=1;b.st='carry';b.c=q;P.scr=1;P.rusher=q;sRec(q,'ra');G.msg='You kept it!'}
{const _h=hit;hit=function(k,...a){try{if(k==' '&&G&&G.phase=='play'&&G.poss=='U'&&P&&P.pf&&P.pf.opt&&!P.optDone&&P.run&&P.b.st=='qb'&&qbIsMe()&&!autoMode()&&$('modal').hidden)return roKeep()}catch(e){}return _h(k,...a)}}
