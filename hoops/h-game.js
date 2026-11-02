'use strict';
// The game on the court: 5 on 5, dribbling, passing, a shot meter, layups and dunks, blocks, steals, rebounds,
// fouls and free throws, the shot clock, quarters, substitutions and fatigue. Offense and defense AI for both teams;
// you control the ball handler on offense and one defender on defense. Difficulty only changes CPU decisions.
const CW=94,CH=50,RIM=10,HX=[5.25,88.75],G3=23.75,G3C=22;
let G=null;
const ftOf=p=>p.ht/12;
const hoopX=s=>s>0?HX[1]:HX[0];                         // attacking direction s=+1 shoots at the right hoop
// difficulty only changes how smart the CPU team plays; your teammates always play at a solid level
const IQ=k=>(k===1||(G&&G.auto))?([.45,.7,.88,.98][G&&G.diff!=null?G.diff:(R?R.diff:1)]||.7):.8;
function newGame(home,away,opt){opt=opt||{};const tm=[0,home===0?away:home];const ql=(opt.qlen||R.qlen||4)*60;
 G={tm,home,ent:[],sc:[0,0],q:1,clk:ql,ql,shot:24,poss:0,dir:[1,-1],phase:'tip',b:{st:'dead',x:47,y:25,z:4},bx:{},st:{},tf:[0,0],to:[4,4],msg:'',msgT:0,live:1,ot:0,ctl:null,dead:null,
  lastTouch:0,asst:null,stOn:{},log:[],diff:R.diff,bench:[[],[]],pt:0,tipWin:0,ev:[],pauseT:0,secs:{}};
 G.rot=[[],[]];tm.forEach((t,k)=>{fixNums(t);const rot=rotation(t);G.rot[k]=rot.map(p=>p.id);G.bench[k]=rot.slice(5).map(p=>p.id);rot.forEach(p=>{G.bx[p.id]=newSS();G.st[p.id]=100});rot.slice(0,5).forEach((p,i)=>G.ent.push(mkEnt(p,k,i)));rot.slice(0,5).forEach(p=>G.bx[p.id][SI.gs]=1)});
 assignMen();tipOff();return G}
function mkEnt(p,k,i){return{p,t:k,i,x:47,y:25,vx:0,vy:0,fa:0,z:0,vz:0,act:null,cd:{},spot:null,man:null,bite:0,stun:0,jx:0}}
const onT=k=>G.ent.filter(e=>e.t===k);
// hooks other files fill in (playbook, momentum, halftime plans); these defaults change nothing
const OM0={need:0,drive:1,three:1,screen:1,spots:null},DM0={sag:1,ball:1,stl:1,help:1,sw:0,zone:0,press:0,foul:1};
function offMod(k){return OM0}function defMod(k){return DM0}function shotAdj(e,typ,info){return 0}
const opp=k=>1-k;
function assignMen(){const A=onT(0),B=onT(1);const ord=e=>POS.indexOf(e.p.pos)*10+e.i;const a=A.slice().sort((x,y)=>ord(x)-ord(y)),b=B.slice().sort((x,y)=>ord(x)-ord(y));a.forEach((e,i)=>{e.man=b[i];b[i].man=e})}
function say(s,t){G.msg=s;G.msgT=t||1.8}
function bx(e,k,n){const a=G.bx[e.p.id];if(a)a[SI[k]]+=n==null?1:n}
// ---------- setting up possessions ----------
function tipOff(){const d=G.dir;G.ent.forEach(e=>{const s=d[e.t],own=e.t==0?-1:1;e.x=47-s*(e.p.pos=='C'?1.5:6+e.i*2);e.y=e.p.pos=='C'?25:[12,38,6,44,25][e.i]||25;e.vx=e.vy=0;e.z=0});
 G.phase='tip';G.pt=1.2;G.b={st:'toss',x:47,y:25,z:6,t:0};say('Tip-off!')}
function giveBall(k,where,shotReset){// where: 'base' (after a score), 'side' (out of bounds / foul), 'top'
 const s=G.dir[k],hx=hoopX(s),own=hoopX(-s),T=onT(k),D=onT(opp(k));G.poss=k;G.shot=feat('shotclk')?(shotReset||24):99;
 const pg=T.slice().sort((a,b)=>POS.indexOf(a.p.pos)-POS.indexOf(b.p.pos))[0];
 if(where=='base'){pg.x=own+s*5;pg.y=clamp(pg.y,14,36)}else if(where=='side'){pg.x=clamp(G.b.x,10,84);pg.y=G.b.y<25?2:48;pg.x=clamp(pg.x,s>0?40:10,s>0?84:54)}
 G.b={st:'held',h:pg,x:pg.x,y:pg.y,z:3,t:0};G.lastTouch=k;G.asst=null;G.phase='live';G.pt=0;D.forEach(e=>{e.bite=0});setCtl();G.ev.push('poss')}
function setCtl(){const b=G.b;if(G.auto){G.ctl=null;return}if(G.poss===0){if(b.st=='held'&&b.h.t===0)G.ctl=b.h}else{if(!G.ctl||G.ctl.t!==0){const h=b.st=='held'?b.h:null;G.ctl=h&&h.man?h.man:onT(0)[0]}}}
function deadBall(t,fn){G.phase='dead';G.dead={t,fn}}
// ---------- the clock and quarters ----------
function endQuarter(){const q=G.q;say(q<4?`End of the ${['1st','2nd','3rd'][q-1]} quarter`:q==4&&G.sc[0]!=G.sc[1]?'Final':'End of regulation');
 if(q>=4&&G.sc[0]!=G.sc[1]){G.phase='over';G.live=0;return}
 G.q++;G.tf=[0,0];if(G.q==3){G.dir=[G.dir[1],G.dir[0]];G.to=[Math.min(G.to[0]+1,4),Math.min(G.to[1]+1,4)]}
 if(G.q>=5){G.ot++;G.clk=Math.max(60,Math.round(G.ql*5/12))}else G.clk=G.ql;
 subs(true);deadBall(1.4,()=>{if(G.q>=5)tipOff();else giveBall(G.q%2==0?opp(G.tipWin):G.tipWin,'base')})}
// ---------- shooting ----------
function shotInfo(e,x,y){const s=G.dir[e.t],hx=hoopX(s),d=Math.hypot(x-hx,y-25),corner=(y<3||y>47)&&Math.abs(x-hx)<14,three=corner?Math.abs(y-25)>=G3C:d>=G3;return{d,three,corner,hx}}
function makeProb(e,info,q){const s=e.p.sk,d=info.d,D=onT(opp(e.t));let cd=99,cdE=null;D.forEach(x=>{const k=dist(x,e);if(k<cd){cd=k;cdE=x}});
 let p,typ;if(d<4.5){typ=e.act&&e.act.k=='dunk'?'dunk':'rim';p=typ=='dunk'?.9+(s.dnk-65)*.004:.71+(s.lay-64)*.006}else if(d<14){typ='close';p=.46+(s.mid*.5+s.lay*.5-64)*.005}else if(!info.three){typ='mid';p=.43+(s.mid-64)*.0055}else{typ='three';p=(info.corner?.38:.356)+(s.thr-66)*.0055}
 if(d>27)p-=(d-27)*.03;
 // the closest defender
 if(cdE){const jump=cdE.z>.6,htd=(ftOf(cdE.p)-ftOf(e.p));let c=cd>6?.05:cd>4?.015:cd>2.5?-.025:-.06;if(jump&&cd<4)c-=.035;if(d<6){c*=.6;if(cd<4)c-=htd*.025+(cdE.p.sk.id-60)*.0012}if(d>=6&&cd<5)c-=(cdE.p.sk.pd-60)*.0012;p+=c}
 const sp=Math.hypot(e.vx,e.vy);if(typ!='rim'&&typ!='dunk'&&sp>9)p-=.05;
 if(feat('fatigue'))p*=.95+.05*(G.st[e.p.id]||100)/100;p+=(q||0)+shotAdj(e,typ,info);if(!feat('realism'))p+=.04;return{p:clamp(p,.03,.97),typ,cd,cdE}}
function shoot(e,q){const b=G.b;if(b.st!='held'||b.h!==e||G.phase!='live')return;const info=shotInfo(e,e.x,e.y),mp=makeProb(e,info,q),hx=info.hx;
 let foul=false;if(feat('fouls')&&mp.cdE&&mp.cd<4){const fp=(mp.typ=='rim'||mp.typ=='dunk'?.23:mp.typ=='close'?.12:.035)*(mp.cdE.z>.6?1.4:1)*(1+(60-mp.cdE.p.sk.pd)/150)*defMod(mp.cdE.t).foul;if(rnd()<fp)foul=mp.cdE}
 // blocks
 let blk=null;if(mp.cdE&&mp.cd<3.6){const de=mp.cdE,bp=(info.d<10?.13:.025)*Math.pow(de.p.sk.blk/60,1.6)*(1+(ftOf(de.p)-ftOf(e.p))*.25+(de.p.sk.vert-60)/120)*(de.z>.4?1.6:1);if(rnd()<bp&&!foul)blk=de}
 let make=rnd()<mp.p*(foul?.42:1);if(blk)make=false;
 const sz=mp.typ=='dunk'?9.6:ftOf(e.p)+1.2,T=mp.typ=='dunk'?.32:mp.typ=='rim'?.55:.75+info.d*.022;
 b.st='shot';Object.assign(b,{ast:G.asst&&G.asst.t>0&&G.asst.e!==e&&G.asst.e.t===e.t?G.asst.e:null,sh:e,sx:e.x,sy:e.y,sz,t:0,T,make,pts:info.three?3:2,blk,foul,typ:mp.typ,ap:mp.typ=='dunk'?10.5:Math.max(13,11+info.d*.22),hx,dd:info.d,qq:q});
 e.act={k:mp.typ=='dunk'?'dunk':mp.typ=='rim'?'lay':'shot',t:0};e.vz=mp.typ=='dunk'?13:mp.typ=='rim'?9:7.5;e.z=.01;
 bx(e,'fga');if(info.three)bx(e,'tpa');G.ev.push('shot');
 // defenders near him try to contest
 onT(opp(e.t)).forEach(d=>{if(dist(d,e)<5.5&&d.z<=0&&!(d===G.ctl&&G.poss===1&&G.ctlInput)&&rnd()<.75*IQ(d.t)+.15){d.vz=8+d.p.sk.vert*.05;d.z=.01;d.act={k:'jump',t:0}}})}
function shotLand(){const b=G.b,e=b.sh,k=e.t;
 if(b.blk){return}
 if(b.make){const pts=b.pts;G.sc[k]+=pts;bx(e,'fgm');bx(e,'pts',pts);if(pts==3)bx(e,'tpm');if(b.ast)bx(b.ast,'ast');
  const and1=!!b.foul;say((b.typ=='dunk'?'Dunk! ':pts==3?'Three! ':'')+(and1?'And one!':`${e.p.ln} scores`),1.6);G.ev.push(pts==3?'three':b.typ=='dunk'?'dunk':'score');
  b.st='net';b.t=0;b.x=b.hx;b.y=25;b.z=9.5;
  if(and1){foulOn(b.foul,e);return ftStart(e,1)}
  deadBall(1.1,()=>giveBall(opp(k),'base'));return}
 if(b.foul){foulOn(b.foul,e);bx(e,'fga',-1);if(b.pts==3)bx(e,'tpa',-1);say('Shooting foul!');return ftStart(e,b.pts)}
 // miss: off the rim
 G.ev.push('rim');missBounce(b,k,b.sx,b.sy)}
// who gets a rebound: weighted by rebounding ratings and how close each player is (defenders get most, as in the NBA),
// then the ball caroms toward that player
function rebPick(k,hx){const c=G.ent.map(e=>{const d=Math.hypot(e.x-hx,e.y-25),off=e.t===k;const w=Math.pow((off?e.p.sk.orb:e.p.sk.drb)/60,2)*Math.max(.03,1-d/17)*(off?(feat('realism')?.36:.45):1)*(1+(ftOf(e.p)-6.5)*.3);return[e,w]});
 let s=c.reduce((a,x)=>a+x[1],0),q=rnd()*s;for(const [e,w] of c){q-=w;if(q<=0)return e}return c[0][0]}
function missBounce(b,k,sx,sy){const hx=b.hx,w=rebPick(k,hx);let ang=Math.atan2(w.y-25,w.x-hx)+(rnd()-.5)*.5;const dd=clamp(Math.hypot(w.x-hx,w.y-25),3,11),sp=dd*1.05+rnd()*1.5;
 Object.assign(b,{st:'loose',x:hx+Math.cos(ang)*.9,y:25+Math.sin(ang)*.9,z:10,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,vz:3+rnd()*3,reb:k,t:0,tgt:w})}
function foulOn(d,v){bx(d,'pf');G.tf[d.t]++;G.ev.push('whistle');const n=G.bx[d.p.id][SI.pf];if(n>=6){say(`${d.p.ln} fouled out!`,2);d.fouledOut=1}}
// ---------- free throws ----------
function ftStart(e,n){G.ft={e,n,k:0,made:0,meter:null};G.phase='ft';G.pt=1;const s=G.dir[e.t],hx=hoopX(s);e.x=hx-s*15;e.y=25;e.vx=e.vy=0;b0(e);
 const lane=[[7,17],[7,33],[11,17],[11,33],[14.5,17],[14.5,33]];let li=0;G.ent.forEach(o=>{if(o===e)return;if(li<lane.length&&(o.p.pos=='C'||o.p.pos=='PF'||o.p.pos=='SF'||li<4)){const L=lane[li++];o.x=hx-s*L[0];o.y=L[1]}else{o.x=hx-s*(28+rnd()*4);o.y=10+rnd()*30}o.vx=o.vy=0});subs(true)}
function b0(e){G.b={st:'held',h:e,x:e.x,y:e.y,z:3}}
function ftShoot(q){const f=G.ft,e=f.e,s=e.p.sk;let p=clamp(.81+(s.ft-62)*.006,.4,.96)+(q||0);if(feat('fatigue'))p*=.95+.05*(G.st[e.p.id]||100)/100;const mk=rnd()<p;f.k++;bx(e,'fta');G.ev.push('shot');
 const hx=hoopX(G.dir[e.t]);G.b={st:'ftb',sx:e.x,sy:e.y,sz:ftOf(e.p)+1,t:0,T:.85,hx,make:mk};f.last=mk}
function ftResolve(){const f=G.ft,e=f.e,mk=f.last;if(mk){bx(e,'ftm');bx(e,'pts');G.sc[e.t]++;f.made++;G.ev.push('swish')}else G.ev.push('rim');
 if(f.k<f.n){G.pt=.8;G.b={st:'held',h:e,x:e.x,y:e.y,z:3};return}
 G.ft=null;if(mk){deadBall(.9,()=>giveBall(opp(e.t),'base'))}else{const hx=hoopX(G.dir[e.t]);G.b={hx};missBounce(G.b,e.t,e.x,25);G.phase='live'}}
// ---------- passing ----------
function passTo(e,r,lob){const b=G.b;if(b.st!='held'||b.h!==e||r===e||r.t!==e.t||G.phase!='live')return;const lead=.35,tx=r.x+r.vx*lead,ty=r.y+r.vy*lead,d=Math.hypot(tx-e.x,ty-e.y),sp=lob?34:46+(e.p.sk.pas-60)*.2,T=Math.max(.18,d/sp);
 Object.assign(b,{st:'pass',fr:e,to:r,sx:e.x,sy:e.y,tx:clamp(tx,1,93),ty:clamp(ty,1,49),t:0,T,lob:!!lob});e.act={k:'pass',t:0};G.asst={e,t:4.5};G.ev.push('pass')}
function catchBall(r){const b=G.b;G.b={st:'held',h:r,x:r.x,y:r.y,z:3};G.lastTouch=r.t;if(G.poss!==r.t)changePoss(r.t);setCtl()}
function changePoss(k){G.poss=k;G.shot=feat('shotclk')?24:99;G.asst=null;onT(opp(k)).forEach(e=>e.bite=0)}
// ---------- steals and turnovers ----------
function stealTry(d){const b=G.b;if(b.st!='held'||b.h.t===d.t||(d.cd.st||0)>0)return false;const h=b.h,dd=dist(d,h);d.cd.st=.9;d.act={k:'reach',t:0};if(dd>3.4){return false}
 const p=clamp(.085+(d.p.sk.stl-h.p.sk.han)/230-(dd-2)*.04,.02,.2);if(rnd()<p){bx(d,'stl');bx(h,'tov');say(`Stolen by ${d.p.ln}!`);G.ev.push('steal');G.b={st:'loose',x:h.x,y:h.y,z:2,vx:(d.x-h.x)*2+(rnd()-.5)*4,vy:(d.y-h.y)*2+(rnd()-.5)*4,vz:2,t:0,stl:d};return true}
 if(feat('fouls')&&rnd()<.075*(1.2-d.p.sk.stl/120)){foulOn(d,h);say('Reach-in foul');if(G.tf[d.t]>=5)return ftStart(h,2),true;deadBall(.8,()=>giveBall(h.t,'side',Math.max(G.shot,14)));return true}return false}
function turnover(e,why){bx(e,'tov');say(why);G.ev.push('whistle');deadBall(.9,()=>giveBall(opp(e.t),'side'))}
// ---------- substitutions and fatigue ----------
function fitSc(c,e){const d=Math.abs(POS.indexOf(c.pos)-POS.indexOf(e.p.pos)),ri=(G.rot[e.t]||[]).indexOf(c.id);return ovr(c)-(d==0?0:d==1?6:16)-(ri>=10||ri<0?8:0)+(G.st[c.id]||100)*.05}
function subs(force){[0,1].forEach(k=>{if(k===0&&R.autoSub===false&&!force)return;const on=onT(k);on.forEach(e=>{const st=G.st[e.p.id],pf=G.bx[e.p.id][SI.pf],trouble=G.q<=3&&pf>=G.q+2;
  if(!(e.fouledOut||(feat('fatigue')&&st<52)||trouble))return;const cand=G.bench[k].map(id=>R.pl.find(p=>p.id===id)).filter(p=>p&&!p.inj&&(G.st[p.id]||100)>72&&(G.bx[p.id][SI.pf]<6)).sort((a,b)=>fitSc(b,e)-fitSc(a,e));
  const c=cand[0];if(!c)return;G.bench[k]=G.bench[k].filter(id=>id!==c.id).concat([e.p.id]);const ne=mkEnt(c,k,e.i);ne.x=e.x;ne.y=e.y;const idx=G.ent.indexOf(e);G.ent[idx]=ne;if(G.b.h===e)G.b.h=ne;if(G.ctl===e)G.ctl=ne;if(G.ft&&G.ft.e===e)G.ft.e=ne})});assignMen()}
// ---------- the AI ----------
function spotsFor(k){const s=G.dir[k],hx=hoopX(s),U=(u,y)=>[hx-s*u,y],M=offMod(k);if(M.spots)return M.spots(U);return{PG:U(26,25),SG:U(21,42),SF:U(4,4),PF:U(15,33),C:U(6,18)}}
function offAI(e,dt){const b=G.b,s=G.dir[e.t],hx=hoopX(s),T=onT(e.t),D=onT(opp(e.t));
 if(b.st=='held'&&b.h===e)return handlerAI(e,dt);
 // the man the pass is going to moves to meet it
 if(b.st=='pass'&&b.to===e)return seek(e,b.tx,b.ty,1);
 // a loose ball or rebound: go get it
 if(b.st=='loose'){const near=T.slice().sort((a,c)=>dist(a,b)-dist(c,b));if(b.tgt===e||near.indexOf(e)<1||dist(e,b)<6)return seek(e,b.x+b.vx*.3,b.y+b.vy*.3,1);}
 if(b.st=='shot'&&b.t>b.T*.35){if(e.p.pos=='C'||(e.p.pos=='PF'&&rnd()<.7)||dist(e,{x:hx,y:25})<9)return seek(e,hx-s*5,25+(e.y-25)*.3,.9);return seek(e,hoopX(-s)+s*44,e.y,.7)}
 // screen call
 if(e.scr&&b.st=='held'&&b.h.t===e.t){const h=b.h,m=h.man;if(m){const tx=m.x+(h.x-m.x)*.15+(m.y<h.y?-1.6:1.6)*0,ty=m.y+(m.y<25?2.2:-2.2);seek(e,m.x-s*.5,m.y+(h.y>m.y?-1.6:1.6),1);e.scr-=dt;if(e.scr<=0){e.scr=0;e.roll=1.4}return}}
 if(e.roll>0){e.roll-=dt;return seek(e,hx-s*4,25,1)}
 // cutting when his man ball-watches
 e.cd.cut=(e.cd.cut||0)-dt;if(e.cut>0){e.cut-=dt;return seek(e,hx-s*3,25+(e.y-25)*.15,1)}
 if(e.cd.cut<=0&&b.st=='held'&&b.h.t===e.t){e.cd.cut=1.2;const m=e.man;if(m&&dist(m,e)>5.5&&rnd()<.25*IQ(e.t)+.05)e.cut=1.1}
 const sp=spotsFor(e.t)[e.p.pos]||[hx-s*20,25];let tx=sp[0],ty=sp[1];
 // fast break / transition: get up the floor
 if(b.st=='held'&&b.h.t===e.t&&Math.abs(b.h.x-hx)>40){tx=hx-s*clamp(Math.abs(sp[0]-hx)+6,8,30)}
 // spacing: don't stand next to the ball handler
 if(b.st=='held'&&b.h.t===e.t&&Math.hypot(tx-b.h.x,ty-b.h.y)<9){ty=ty<25?ty+10:ty-10}
 seek(e,tx,ty,.75)}
function handlerAI(e,dt){const b=G.b,s=G.dir[e.t],hx=hoopX(s),T=onT(e.t),D=onT(opp(e.t)),iq=IQ(e.t);e.cd.dec=(e.cd.dec||0)-dt;
 const info=shotInfo(e,e.x,e.y);
 if(e.drv>0){e.drv-=dt;seek(e,hx-s*2.5,25+(e.y-25)*.3,1.05);const help=D.filter(d=>d!==e.man&&dist(d,e)<5).length;if(help&&info.d>6&&info.d<20&&rnd()<dt*3*IQ(e.t)&&passBest(e,-.5)){e.drv=0;return}
  if(info.d<6.5){const mp=makeProb(e,info,0);if(info.d<4.2||(mp.p>.5&&info.d<5.5)||G.shot<2){e.act={k:feat('alley')&&e.p.sk.dnk>66&&info.d<4.5&&mp.cd>2.3?'dunk':'lay',t:0};return shoot(e,gauss()*.03)}}
  const wall=D.filter(d=>dist(d,e)<2.6&&((d.x-e.x)*s>0)&&!(d.stun>0));if(wall.length&&rnd()<dt*4){const d0=wall[0],sk=e.p.sk,bp=clamp(.42+((sk.han+sk.spd)/2-(d0===e.man?d0.p.sk.pd:d0.p.sk.id))/70-(wall.length-1)*.15,.08,.75);
   if(rnd()<bp){d0.stun=.55;d0.bite=.4;e.drv=Math.max(e.drv,.6);return}
   if(feat('fouls')&&rnd()<.16){foulOn(d0,e);say('Blocking foul');if(G.tf[d0.t]>=5)return ftStart(e,2);return deadBall(.8,()=>giveBall(e.t,'side',Math.max(G.shot,14)))}
   e.drv=0;e.cd.dec=.35;
   if(feat('fouls')&&rnd()<.045*(1.2-e.p.sk.han/150)){const d=wall[0];bx(e,'pf');G.tf[e.t]++;return turnover(e,`Charge! ${d.p.ln} takes it`)}
   if(rnd()<.5&&passBest(e,-.3))return;const mp=makeProb(e,info,0);if(mp.p>.34&&info.d<18)return shoot(e,gauss()*.04);if(passBest(e,-.3))return;e.back=.6}return}
 if(e.back>0){e.back-=dt;return seek(e,e.x-s*12,e.y+(25-e.y)*-.2,.8)}
 if(e.cd.dec>0){holdBall(e,dt);return}
 e.cd.dec=.25+(1-iq)*.25+rnd()*.15;
 const full=Math.abs(e.x-hx)>42;if(full){holdBall(e,dt,1);return}
 const mp=makeProb(e,info,0),late=G.shot<3.5,el=(feat('shotclk')?24-G.shot:(e.held=(e.held||0)+.3)),urg=clamp((el-8)/12,0,1);
 if(rnd()<.002*(1.35-e.p.sk.han/100))return turnover(e,pick(['Traveling','Lost the handle','Offensive foul','Bad pass out of bounds']));
 let sEP=mp.p*(info.three?3:2)*(info.d>26?.8:1);
 const lane=D.filter(d=>{const u=(d.x-e.x)*s;if(u<-1||u>Math.abs(hx-e.x)+2)return false;const ly=e.y+(25-e.y)*clamp(u/Math.max(1,Math.abs(hx-e.x)),0,1);return Math.abs(d.y-ly)<4}).length;
 const beat=e.man?((e.man.x-e.x)*s<0||dist(e.man,e)>6?1:0):0;
 const OM=offMod(e.t);const dEP=clamp(.6+(e.p.sk.lay-64)*.006+(e.p.sk.han-60)*.003-lane*.13+beat*.18,.15,.85)*2.1*OM.drive;
 const need=1.3-urg*.62+OM.need+(el<5&&info.d>8&&onT(opp(e.t)).filter(d=>(d.x-e.x)*s>0).length>=4?.32:0);
 if(late)return shoot(e,gauss()*.05);
 const noise=()=>(1-iq)*(rnd()-.5)*.5;
 if(info.three)sEP*=(e.p.sk.thr<58?.74:e.p.sk.thr<66?.9:.97)*OM.three;else if(info.d>8)sEP*=e.p.sk.mid>=e.p.sk.thr?1.16:1.06;
 if(sEP+noise()>=need&&sEP>=dEP+(info.three?.02:.05)&&info.d<29)return shoot(e,gauss()*.04+(iq-.7)*.04);
 const swing=()=>{const o=T.filter(r=>r!==e&&passRisk(e,r)<.25&&openness(r)>3).sort((a,c)=>openness(c)-openness(a)+(rnd()-.5)*4)[0];if(o){passTo(e,o);return true}return false};
 if(el<9&&!beat&&rnd()<.6&&swing())return;
 if(dEP+noise()>need*.92&&info.d<32&&rnd()<.45+urg*.3){e.drv=1.5;return}
 if(feat('screens')&&e.p.pos=='PG'&&!G.scrUsed&&el>3&&el<14&&rnd()<.22*iq*OM.screen){const big=T.find(x=>(x.p.pos=='C'||x.p.pos=='PF')&&x!==e);if(big){big.scr=1.2;G.scrUsed=1}}
 if(passBest(e,.12-urg*.2))return;
 // keep the ball moving early in the clock
 if(el<14&&rnd()<.45&&swing())return;
 if(urg>.85&&info.d<28&&rnd()<.5)return shoot(e,gauss()*.05);
 holdBall(e,dt)}
function openness(r){return Math.min(...onT(opp(r.t)).map(d=>dist(d,r)))}
function passBest(e,minGain){const T=onT(e.t).filter(r=>r!==e),D=onT(opp(e.t)),iq=IQ(e.t);let best=null,bs=-9;
 T.forEach(r=>{const info=shotInfo(r,r.x,r.y),mp=makeProb(r,info,0),ep=mp.p*(info.three?3:2),lane=passRisk(e,r);const sc=ep+(r.cut>0||r.roll>0?.25:0)-lane*2.2*iq-(1-iq)*rnd()*.6;if(sc>bs){bs=sc;best=r}});
 const mine=makeProb(e,shotInfo(e,e.x,e.y),0).p*(shotInfo(e,e.x,e.y).three?3:2);if(best&&bs>mine+minGain&&passRisk(e,best)<.35){passTo(e,best,feat('alley')&&best.roll>0&&best.p.sk.dnk>68&&rnd()<.3);return true}return false}
function passRisk(e,r){let risk=0;onT(opp(e.t)).forEach(d=>{const ax=r.x-e.x,ay=r.y-e.y,l2=ax*ax+ay*ay||1,u=clamp(((d.x-e.x)*ax+(d.y-e.y)*ay)/l2,0,1),px=e.x+ax*u,py=e.y+ay*u,dd=Math.hypot(d.x-px,d.y-py);if(dd<3)risk+=(3-dd)/3*(.4+d.p.sk.stl/200)});return risk}
function holdBall(e,dt,push){const s=G.dir[e.t],hx=hoopX(s);const sp=spotsFor(e.t)[e.p.pos]||[hx-s*22,25];if(push){const back=onT(opp(e.t)).filter(d=>(d.x-e.x)*s>0).length,fwd=onT(e.t).filter(o=>(o.x-e.x)*s>=0).length;return seek(e,hx-s*24,e.y+(25-e.y)*.4,back<fwd?.95:.6)}
 e.wob=(e.wob||0)+dt;seek(e,sp[0]+Math.sin(e.wob*.9)*3,sp[1]+Math.cos(e.wob*.7)*4,.55)}
function defAI(e,dt){const b=G.b,k=e.t,s=G.dir[opp(k)],hx=hoopX(s),m=e.man;if(!m)return;const iq=IQ(e.t);
 if(b.st=='loose'){const near=onT(k).slice().sort((a,c)=>dist(a,b)-dist(c,b));if(b.tgt===e||near.indexOf(e)<1||dist(e,b)<6)return seek(e,b.x+b.vx*.3,b.y+b.vy*.3,1)}
 if(b.st=='shot'&&b.t>b.T*.3){// box out: stay between my man and the rim
  return seek(e,m.x+(hx-m.x)*.4,m.y+(25-m.y)*.4,1)}
 const hasB=b.st=='held'&&b.h===m;let tx,ty;
 const DM=defMod(k);
 if(hasB){const d=(3.1-(e.p.sk.pd-60)*.02)*DM.ball;const ux=hx-m.x,uy=25-m.y,l=Math.hypot(ux,uy)||1;tx=m.x+ux/l*d;ty=m.y+uy/l*d}
 else{const bxp=b.st=='held'?b.h:b,dball=Math.hypot(m.x-bxp.x,m.y-bxp.y),sag=clamp(dball/5,2,8)*(m.p.sk.thr>70&&shotInfo(m,m.x,m.y).three?.55:1)*DM.sag;const ux=hx-m.x,uy=25-m.y,l=Math.hypot(ux,uy)||1;tx=m.x+ux/l*sag+(bxp.x-m.x)*.08;ty=m.y+uy/l*sag+(bxp.y-m.y)*.12}
 // help on drives
 if(feat('help')&&b.st=='held'&&b.h!==m&&b.h.t!==k){const h=b.h,dh=Math.hypot(h.x-hx,h.y-25),hm=h.man;if(dh<13&&hm&&Math.hypot(hm.x-hx,hm.y-25)>dh+1.5){const helpers=onT(k).filter(x=>x!==hm).sort((a,c)=>dist(a,h)-dist(c,h));if(helpers[0]===e&&rnd()<(.6+.4*iq)*DM.help){tx=h.x+(hx-h.x)*.25;ty=h.y+(25-h.y)*.25}}}
 if(e.bite>0){e.bite-=dt;return}
 seek(e,tx,ty,hasB?1:.9);
 // reach for steals sometimes
 if(hasB&&dist(e,m)<3&&rnd()<dt*.1*(e.p.sk.stl/65)*(.5+iq*.5)*DM.stl)stealTry(e)}
// move toward a point with acceleration, at a share of top speed
function topSpd(e){let v=17+(e.p.sk.spd-60)*.12;if(feat('fatigue'))v*=.9+.1*Math.min(1,(G.st[e.p.id]||100)/60);if(G.b.st=='held'&&G.b.h===e)v*=.9-(70-e.p.sk.han)*.002;return v}
function seek(e,tx,ty,f){if(G.b.st=='held'&&G.b.h===e){tx=clamp(tx,2,CW-2);ty=clamp(ty,2,CH-2)}else{tx=clamp(tx,-1,CW+1);ty=clamp(ty,-1,CH+1)}const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),v=topSpd(e)*(f||1)*(e.spr?1.15:1),want=d<.4?0:Math.min(v,d*4);const wx=d?dx/d*want:0,wy=d?dy/d*want:0;e.tx=wx;e.ty=wy}
// ---------- the main step ----------
const KEYS={};let PAD=null;
function hStep(dt){if(!G||!G.live)return;G.msgT-=dt;if(G.asst)G.asst.t-=dt;
 // dead-ball pauses
 if(G.phase=='dead'){G.dead.t-=dt;moveAll(dt,true);if(G.dead.t<=0){const f=G.dead.fn;G.dead=null;G.phase='live';subs();f()}return}
 if(G.phase=='tip'){G.pt-=dt;const b=G.b;b.t+=dt;b.z=6+Math.sin(Math.min(1,b.t/1.2)*Math.PI)*8;if(G.pt<=0){const c=G.ent.filter(e=>e.p.pos=='C'||e.i==4).slice(0,2);const sc=x=>x.p.sk.vert+x.p.ht*1.5+rnd()*25;const w=c.length==2?(sc(c[0])>sc(c[1])?c[0]:c[1]):G.ent[0];G.tipWin=w.t;giveBall(w.t,'top');G.b.h.x=47;say('Tip won by '+R.t[G.tm[w.t]].ab)}return}
 if(G.phase=='ft')return ftStep(dt);
 if(G.phase=='over')return;
 // clocks
 G.clk-=dt;if(feat('shotclk')&&(G.b.st=='held'||G.b.st=='pass'))G.shot-=dt;
 G.ent.forEach(e=>{G.secs[e.p.id]=(G.secs[e.p.id]||0)+dt;const sp=Math.hypot(e.vx,e.vy);if(feat('fatigue')){const dr=(e.spr?2.2:sp>6?1:.45)*.11*(12*60/G.ql)*(1.3-e.p.sk.sta/120);G.st[e.p.id]=Math.max(0,(G.st[e.p.id]||100)-dr*dt)}});
 G.bench.forEach(l=>l.forEach(id=>{G.st[id]=Math.min(100,(G.st[id]||100)+.2*(12*60/G.ql)*dt)}));
 if(G.clk<=0){G.clk=0;if(G.b.st=='shot'){}else return endQuarter()}
 if(G.shot<=0&&G.b.st!='shot'&&G.b.st!='net'){const h=G.b.st=='held'?G.b.h:onT(G.poss)[0];G.shot=24;return turnover(h,'Shot clock violation')}
 // decisions
 G.ent.forEach(e=>{e.tx=0;e.ty=0;e.cd.st=(e.cd.st||0)-dt;if(e.stun>0)e.stun-=dt;
  if(e===G.ctl&&userControls(e,dt))return;
  if(G.ctl2&&e===G.ctl2&&userControls2(e,dt))return;
  if(e.t===G.poss)offAI(e,dt);else defAI(e,dt)});
 moveAll(dt);ballStep(dt);
 if(G.b.st=='held'){const h=G.b.h;if(h.x<0||h.x>CW||h.y<0||h.y>CH)return turnover(h,'Out of bounds')}}
function moveAll(dt,slow){G.ent.forEach(e=>{const a=26+(e.p.sk.acc-60)*.25,k=Math.min(1,a*dt/Math.max(1,Math.hypot((e.tx||0)-e.vx,(e.ty||0)-e.vy)));
  if(e.stun>0){e.tx*=.3;e.ty*=.3}e.vx+=((e.tx||0)-e.vx)*Math.min(1,k*3);e.vy+=((e.ty||0)-e.vy)*Math.min(1,k*3);if(slow){e.vx*=.9;e.vy*=.9}
  e.x=clamp(e.x+e.vx*dt,-3,CW+3);e.y=clamp(e.y+e.vy*dt,-3,CH+3);if(Math.hypot(e.vx,e.vy)>1)e.fa=Math.atan2(e.vy,e.vx);
  if(e.z>0||e.vz>0){e.z+=e.vz*dt;e.vz-=32*dt;if(e.z<=0){e.z=0;e.vz=0}}if(e.act){e.act.t+=dt;if(e.act.t>.9)e.act=null}});
 // players don't overlap
 for(let i=0;i<G.ent.length;i++)for(let j=i+1;j<G.ent.length;j++){const a=G.ent[i],b=G.ent[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),m=1.7;if(d<m&&d>0){const p=(m-d)/2,ux=dx/d,uy=dy/d;a.x-=ux*p;a.y-=uy*p;b.x+=ux*p;b.y+=uy*p}}
 // screens: a defender who runs into a screener is held up
 if(feat('screens'))G.ent.forEach(sc=>{if(!sc.scr&&!(sc.roll>0))return;G.ent.forEach(d=>{if(d.t===sc.t||d.bite>0)return;if(dist(d,sc)<2.1&&G.b.st=='held'&&d.man===G.b.h){if(defMod(d.t).sw&&sc.man){const o=sc.man;o.man=G.b.h;d.man=sc;G.b.h.man=o;sc.man=d;sc.scr=0;return}d.bite=.55;G.ev.push('screen')}})})}
function ballStep(dt){const b=G.b;
 if(b.st=='held'){const h=b.h;b.x=h.x+Math.cos(h.fa+.9)*.9;b.y=h.y+Math.sin(h.fa+.9)*.5;b.z=h.act&&h.act.k=='shot'?ftOf(h.p)+1:Math.abs(Math.sin(performance.now()/130))*2.6+.4;
  if(h.t!==G.poss)changePoss(h.t);return}
 if(b.st=='pass'){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;b.z=3+(b.lob?Math.sin(k*Math.PI)*9:Math.sin(k*Math.PI)*1.2);
  // interceptions and deflections
  if(b.z<8)for(const d of onT(opp(b.fr.t))){if(Math.hypot(d.x-b.x,d.y-b.y)<1.5&&!(d.cd.ic>0)){d.cd.ic=.5;const p=.22*(d.p.sk.stl/60)*(1.2-b.fr.p.sk.pas/150);if(rnd()<p){bx(d,'stl');bx(b.fr,'tov');say(`Picked off by ${d.p.ln}!`);G.ev.push('steal');G.b={st:'held',h:d,x:d.x,y:d.y,z:3};changePoss(d.t);setCtl();return}
    if(rnd()<p*.6){bx(b.fr,'tov');G.b={st:'loose',x:b.x,y:b.y,z:b.z,vx:(rnd()-.5)*12,vy:(rnd()-.5)*12,vz:3,t:0,stl:d};say('Deflected!');return}}}
  if(k>=1){const r=b.to;if(dist(r,b)<4&&r.z<4)return catchBall(r);G.b={st:'loose',x:b.x,y:b.y,z:b.z,vx:(b.tx-b.sx)/b.T*.35,vy:(b.ty-b.sy)/b.T*.35,vz:0,t:0}}return}
 if(b.st=='shot'){b.t+=dt;const k=Math.min(1,b.t/b.T);
  if(b.blk&&k>.12){bx(b.blk,'blk');say(`Blocked by ${b.blk.p.ln}!`,1.8);G.ev.push('block');const s=G.dir[b.sh.t];G.b={st:'loose',x:b.x,y:b.y,z:b.z,vx:-s*(8+rnd()*8),vy:(rnd()-.5)*14,vz:5,t:0,reb:b.sh.t};return}
  b.x=b.sx+(b.hx-b.sx)*k;b.y=b.sy+(25-b.sy)*k;const ap=b.ap;b.z=b.sz+(RIM-b.sz)*k+4*(ap-Math.max(b.sz,RIM))*k*(1-k);if(k>=1)shotLand();return}
 if(b.st=='net'){b.t+=dt;b.z=Math.max(0,9.5-b.t*14);return}
 if(b.st=='loose'){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.vz-=32*dt;if(b.z<=0){b.z=0;b.vz=-b.vz*.55;if(b.vz<1.5)b.vz=0;b.vx*=.86;b.vy*=.86}
  if(b.x<0||b.x>CW||b.y<0||b.y>CH){const k2=b.stl?b.stl.t:opp(G.lastTouch);G.b.x=clamp(b.x,1,93);G.b.y=clamp(b.y,1,49);say('Out of bounds');deadBall(.8,()=>giveBall(k2,'side'));return}
  // someone grabs it
  let best=null,bs=0;G.ent.forEach(e=>{if(b.tgt&&e!==b.tgt&&b.t<.6&&b.z>1.5)return;const reach=ftOf(e.p)+1.3+e.z,d=Math.hypot(e.x-b.x,e.y-b.y);if(d<2.2&&b.z<=reach){const w=(e.p.sk[b.reb!=null?(e.t===b.reb?'orb':'drb'):'stl']||60)/60*(1+e.z*.3)*(2.3-d)*(e.t===b.reb?.7:1.25)*(.6+rnd()*.8)*(b.tgt===e?4:1);if(w>bs){bs=w;best=e}}});
  if(best&&(b.t>.12||b.z<7)){if(b.reb!=null){bx(best,best.t===b.reb?'orb':'drb');if(best.t===b.reb){G.shot=Math.max(feat('shotclk')?14:99,G.shot>14?G.shot:14)}G.ev.push('reb')}
   const k3=best.t,same=k3===G.poss;G.b={st:'held',h:best,x:best.x,y:best.y,z:3};G.lastTouch=k3;if(!same)changePoss(k3);else if(b.reb!=null&&feat('shotclk'))G.shot=14;setCtl();G.scrUsed=0}
  // jump for rebounds
  if(b.reb!=null&&b.z>6&&b.vz<0)G.ent.forEach(e=>{if(e.z<=0&&Math.hypot(e.x-b.x,e.y-b.y)<3.5&&rnd()<dt*6&&e!==G.ctl){e.vz=7+e.p.sk.vert*.05;e.z=.01}})}}
function ftStep(dt){const f=G.ft;if(!f)return;G.pt-=dt;const b=G.b;
 if(b.st=='ftb'){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.hx-b.sx)*k;b.y=b.sy+(25-b.sy)*k;b.z=b.sz+(RIM-b.sz)*k+4*(14-RIM)*k*(1-k);if(k>=1)ftResolve();return}
 if(G.pt>0)return;
 // the shooter: you (with the meter) or the computer
 if(f.e.t===0&&feat('meter')&&!autoPlay()){if(!f.meter)G.wantFT=1;return}
 ftShoot(gauss()*.02)}
function autoPlay(){return !!G.auto}
function userControls2(e,dt){return false}
