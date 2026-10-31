'use strict';
// Player moves: ball-carrier specials, quarterback jukes in the backfield, pass-rush moves and receiver moves.
// Success comes from ratings (speed, strength, awareness, skill) against the defender's, never from difficulty.
const RK=p=>p.sk||{spd:p.o,str:p.o,awr:p.o,skl:p.o};
const say=(p,t)=>{if(p.t=='U')G.msg=t};
// ----- ball carrier: juke (existing), spin, truck, hurdle -----
function cmove(c,m){if(!c||(c.mc||0)>0)return;const s=c.stm==null?100:c.stm;if(s<10)return say(c,'Too tired!');const r=RK(c);
 if(m=='juke')return juke(c);
 c.mc=1.3;c.ml=.6;c.mv=m;
 if(m=='spin'){c.spin=.55;c.stm=s-14;const n=P.def.reduce((a,p)=>dist(p,c)<dist(a,c)?p:a),fx=Math.cos(c.fa),fy=Math.sin(c.fa),qx=-fy,qy=fx,side=((n.x-c.x)*qx+(n.y-c.y)*qy)>0?-1:1;
  c.jm={t:0,d:.45,x:fx*.9+qx*side*1.4,y:fy*.9+qy*side*1.4,tr:[],k:'spin'};
  P.def.forEach(p=>{if(!p.eng&&dist(p,c)<2.6&&rnd()<clamp(.5+((r.spd+r.awr)/2-RK(p).awr)/120,.2,.88)){p.bite=.45;p.cool=Math.max(p.cool,.45)}});say(c,'Spin move!')}
 if(m=='truck'){c.trk=.65;c.stm=s-12;say(c,'Truck!')}
 if(m=='hurdle'){c.hrd=.45;c.stm=s-12;say(c,'Hurdle!')}}
// How much a move changes a tackle attempt on the ball carrier h by defender p.
function tackleMod(p,h){let m=1;
 if(h.spin>0)m*=.5;
 if(h.trk>0){const edge=(RK(h).str-RK(p).str)/35;m*=clamp(.5-edge,.1,.9);if(rnd()<.5)p.stun=Math.max(p.stun||0,.6)}
 if(h.hrd>0)m*=p.hs>0?.12:.65;
 return m}
const moveSpd=p=>(p.trk>0?.88:1)*(p.spin>0?.85:1)*(p.burst>0?1.15:1)*(p.hrdL>0?.8:1);
// The CPU (and your AI teammates) pick a move when a tackler gets close.
function aiMove(c,n,iq){const k0=G.msg;aiMove2(c,n,iq);if(c.t=='U')G.msg=k0}
function aiMove2(c,n,iq){if((c.mc||0)>0||(c.jc||0)>0)return;const r=RK(c),d=RK(n),front=((n.x-c.x)*G.dir)>0;
 if(rnd()>.3+.7*iq)return juke(c);
 if(n.hs>0&&front)return cmove(c,'hurdle');if(front&&r.str>d.str+6)return cmove(c,'truck');if(front&&rnd()<.5)return cmove(c,'spin');juke(c)}
// ----- pass rush: your defender, while blocked -----
const RUSH={bull:'anchor',swim:'punch',rip:'slide'};
// A tackle attempt that fails during a move: the defender gets run over, spun off or jumped over.
function brokeTackle(p,h){if(h.trk>0){p.stun=.9;p.cool=.9;if(h.t=='U')G.msg='Ran him over!'}else if(h.spin>0){p.cool=.6;p.bite=.3}else if(h.hrd>0){p.cool=.7;p.stun=.4}}
function rushMove(m){const p=cd;if(!p||!p.eng){if(p)G.msg='Rush moves work while you are blocked';return}if((p.rm||0)>0){G.msg='Recovering...';return}
 const o=p.eng,a=RK(p),b=RK(o);p.rm=1.1;p.mv=m;p.ml=.7;o.mv=['anchor','punch','slide'][rnd()*3|0];o.ml=.7;
 const base={bull:(a.str-b.str)/55,swim:((a.spd+a.skl)/2-(b.awr+b.skl)/2)/55,rip:(a.skl-b.skl)/55+(a.str-b.str)/120,spin:(a.spd-b.spd)/45}[m];
 const ch=clamp(.24+base+(m=='spin'?-.06:0)-(RUSH[m]==o.mv?.22:0)+(o.helper?-.15:0),.06,.8);
 if(rnd()<ch){if(m=='bull'&&rnd()<.5){const q=P.off[0],k=Math.hypot(q.x-o.x,q.y-o.y)||1;o.x+=(q.x-o.x)/k*2;o.y+=(q.y-o.y)/k*2;p.x+=(q.x-p.x)/k*2;p.y+=(q.y-p.y)/k*2;G.msg='Bull rush! Driving him back'}
  else{if(o.helper){o.helper.help=null;o.helper=null}o.eng=p.eng=null;p.cool=.1;o.cool=.7;p.boost=.7;o.stun=.4;o.fa+=Math.PI*.7;G.msg=({bull:'Bull rush',swim:'Swim move',rip:'Rip move',spin:'Spin move'}[m])+' - you beat him!'}}
 else{p.stun=m=='spin'?.55:.3;G.msg=RUSH[m]==o.mv?`He was ready for the ${m}.`:`The ${m} didn't work.`}}
// ----- receivers: head fake, burst, release (your receiver in career mode; AI receivers fake at times too) -----
function wrMove(r,m){if(!r||(r.fk||0)>0)return;if(P.b.st=='carry'&&P.b.c===r)return;const a=RK(r),s=r.stm==null?100:r.stm;r.mv=m;r.ml=.6;
 if(m=='fake'){r.fk=2.2;r.brk=.55;P.def.forEach(p=>{if((p.cover===r||p.on===r||dist(p,r)<3)&&!p.rush&&rnd()<clamp(.45+((a.awr+a.skl)/2-RK(p).awr)/140,.15,.82))p.bite=.35});say(r,'Head fake!')}
 if(m=='burst'){if(s<20)return say(r,'Too tired to burst');r.fk=1.6;r.burst=1.1;r.stm=s-18;say(r,'Burst!')}
 if(m=='release'){if(P.t>1.6)return say(r,'Release works right after the snap');r.fk=1.5;
  if(r.stun>0&&rnd()<clamp(.4+((a.spd+a.str)/2-60)/100,.25,.85)){r.stun=0;r.burst=.5;say(r,'Clean release!')}else if(r.stun>0)say(r,'Jammed anyway');else{r.burst=.4;say(r,'Quick release')}}}
function aiWrFake(r){const a=RK(r);if((r.fk||0)<=0&&rnd()<(a.skl-50)/200){const k=G.msg;wrMove(r,'fake');G.msg=k}}
// ----- on-screen move buttons (phones) -----
let MVK='';
function moveBar(){const el=$('mv');if(!el)return;let k='';const u=G.poss=='U',b=P.b,ph=G.phase=='play';
 if(ph&&!(typeof autoMode=='function'&&autoMode())){const me=typeof careerMe=='function'?careerMe():null,car=typeof CAR=='function'&&CAR();
  if(u&&b.st=='carry'&&(!car||b.c===me))k='carry';else if(u&&b.st=='qb'&&(!car||(me&&me===P.off[0])))k='qb';
  else if(u&&car&&me&&P.off.includes(me)&&me!==P.off[0])k='wr';else if(!u&&cd&&cd.eng)k='rush'}
 if(k===MVK)return;MVK=k;
 const B2=(key,t)=>`<button data-k="${key}">${t}</button>`;
 el.innerHTML={carry:B2('z','Spin')+B2('x','Truck')+B2('c','Hurdle'),qb:B2('q','Juke L')+B2('e','Juke R'),wr:B2('z','Fake')+B2('x','Burst')+B2('c','Release'),rush:B2('1','Bull')+B2('2','Swim')+B2('3','Rip')+B2('4','Spin')}[k]||'';el.style.display=k?'flex':'none'}
