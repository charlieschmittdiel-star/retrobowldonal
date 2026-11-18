'use strict';
// Animation: a smoother running cycle (knee lift, arm pump, leaning in at speed and sitting back when slowing down),
// more end-zone celebrations with teammates running over for chest bumps and the other team hanging its head,
// sideline reactions for both teams, and pre-snap life (the QB points out the defense, players settle and shift).
{const add=[['Presentation','run2','Smoother running','More knee lift and arm pump, leaning in at full speed and sitting back when slowing down.'],
 ['Presentation','cel2','More celebrations','New end-zone celebrations, teammates run over for chest bumps, and the other team hangs its head.'],
 ['Presentation','side2','Sideline reactions','The bench and coaches react to bad plays too: hands on helmets when the other team scores.'],
 ['Presentation','pre2','Pre-snap life','Before the snap the QB points out the defense, receivers and backs settle, linemen adjust and defensive backs bounce.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const CEL2=['salute','bow','shuffle','point','leap'];
{const _ps=pose;pose=function(p,t,line){const o=_ps(p,t,line);try{
 const ph=G?G.phase:'',b=P&&P.b,an=p.an&&p.an.t<p.an.d?p.an:null,sp=Math.hypot(p.vx||0,p.vy||0),pre=ph=='pre'||ph=='motion';
 // running
 if(feat('run2')&&!pre&&sp>.6&&!an&&!p.eng&&!p.fall&&!(p.hs>0)&&ph!='kick'&&!(G.cel&&ph=='post'&&G.cel.p===p)){
  const w=t*(5+Math.min(sp,9)*.95)+p.i*1.7,amp=Math.min(1,sp/7);for(let j=0;j<2;j++){const a=w+j*Math.PI,s=Math.sin(a),lf=Math.max(0,Math.cos(a));o.F[j]=[s*(1.2+1*amp),lf*(.8+1.1*amp)];
   const s2=-s;if(o.ball!==j&&o.A[j][1][1]<9.5)o.A[j]=[[s2*(.5+.6*amp)+.3,6.9+Math.max(0,s2)*.5*amp],[s2*(1+1*amp)+.9,5.9+Math.max(0,s2)*1.6*amp]]}
  const prev=p._psp==null?sp:p._psp;p._psp=sp;const dec=clamp((prev-sp)*30,0,1);p._dec=(p._dec||0)*.85+dec*.15;
  o.d=Math.abs(Math.sin(w))*.32*amp+p._dec*.6;o.l=clamp(.45+sp*.08,.45,1.3)-p._dec*1.1}
 else p._psp=sp;
 // celebrations: the scorer's new moves, teammates bumping, the other team down
 if(feat('cel2')&&G.cel&&ph=='post'&&G.cel.p){const c=G.cel,ct=c.t||0,up=[[1,10.8],[1.3,13]],up0=[[.3,10.9],[.5,13.2]];
  if(c.p===p&&CEL2.includes(c.ty)){
   if(c.ty=='salute'){o.A[1]=[[1.6,9.4],[.9,11.2]];o.A[0]=[[-.3,6.7],[-.6,5.4]];o.l=-.3}
   else if(c.ty=='bow'){const k=Math.min(1,ct*1.5);o.l=2.6*k;o.d=.6*k;o.A[1]=[[1.2,7],[1.6,5.6]];o.A[0]=[[-1.6,8.2],[-2.8,8.6]]}
   else if(c.ty=='shuffle'){const k=Math.sin(ct*14);o.F=[[.9+k*.8,Math.max(0,k)*.6],[-.7+k*.8,Math.max(0,-k)*.6]];o.A[1]=[[1+k,7.4],[1.6+k*1.2,8.6]];o.A[0]=[[-.4-k,7.4],[-.9-k*1.2,8.6]];o.d=.4}
   else if(c.ty=='point'){o.A[1]=[[1.8,10],[2.8,12.6]];o.A[0]=[[-.4,6.8],[-.6,5.4]]}
   else if(c.ty=='leap'){o.A[1]=up;o.A[0]=up0;o.F=[[.6,.9],[-.6,.5]]}}
  else if(p.t===c.p.t&&p!==c.p&&!p.fall&&p._bump){o.A[1]=up;o.A[0]=up0;o.l=-.6}
  else if(p.t!==c.p.t&&!p.fall&&p._sad){if(p._sad==1){o.l=1.9;o.d=1.2;o.A[1]=[[1.4,5.6],[1.6,3.6]];o.A[0]=[[.4,5.6],[.6,3.6]]}else{o.A[1]=[[1.6,10],[.6,11.2]];o.A[0]=[[-1,10],[0,11.2]]}}}
 // pre-snap life
 if(feat('pre2')&&ph=='pre'&&P&&!P.kk&&!line){const h=(p.i*37+(p.s=='O'?0:11))%7;
  if(P.off[0]===p&&p.s=='O'){const k=(t*.4+h*.13)%1;if(k<.22){const ax=k<.11?1:0;o.A[1]=[[1.8,8.6],[3.3,8.9-ax*.4]]}}
  else if(p.s=='O'&&p.i<6){o.d+=Math.sin(t*1.6+h)*.12}
  else if(p.s=='D'&&p.i>=7){const k=Math.sin(t*5.5+h);o.d=Math.max(0,o.d+k*.18);o.F=[[.9,Math.max(0,k)*.35],[-.7,Math.max(0,-k)*.35]]}
  else if(p.s=='D'&&p.i>=4){const k=Math.sin(t*2.2+h);if(Math.abs(k)>.92)o.F=[[.9+k*.4,.3],[-.7,0]]}}
 if(feat('pre2')&&ph=='pre'&&P&&!P.kk&&line){const h=(p.i*13)%5;if(((t*.3+h*.2)%1)<.06){o.F=[[.9,.4],[-1.5,0]]}}
 }catch(e){}return o}}
// pick a new celebration sometimes; teammates run over, opponents hang their heads
{const _pst=postStep;postStep=function(dt){_pst(dt);try{const c=G&&G.cel;if(!feat('cel2')||!c||!c.p||!P)return;
 if(!c._x){c._x=1;if(rnd()<.55)c.ty=CEL2[rnd()*CEL2.length|0];[...P.off,...P.def].forEach(q=>{q._bump=0;q._sad=0;if(q.t!==c.p.t&&!q.fall)q._sad=rnd()<.6?1:2})}
 c.t=(c.t||0);P.off.concat(P.def).forEach(q=>{if(q===c.p||q.fall||q.t!==c.p.t)return;const dd=dist(q,c.p);if(dd<16&&dd>1.4){mv(q,c.p.x,c.p.y,5,dt);q._bump=0}else if(dd<=1.4){q._bump=1;q.jz=Math.max(0,Math.sin((c.t*6+q.i)%Math.PI))*.6}})}catch(e){}}}
