'use strict';
// Career training: drills you play on the real field between games (40-yard dash, cone drill, sled push, conditioning,
// and drills for your position). They use the real field, players, running, moves, tackling and slingshot throwing
// from the game; only the drill rules are new. You get a few training sessions each week. Good grades give XP and
// can raise the ratings the drill trains, never past your ceiling (the potential marks).
// This file wraps existing functions and leaves the originals alone. Load it after career.js, gm.js, keys.js and stats2.js.
{const add=[['Career','drills','Training drills','Between games, practice on the field: 40-yard dash, cone drill, sled push, conditioning and drills for your position. Good grades give XP and can raise your ratings.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const TRWK=3;                                    // training sessions per week (perks from the Fame & sponsors page add more)
const trOn=()=>feat('drills')&&CAR()&&!!R.me;
function trS(){if(!R.trn||typeof R.trn!='object')R.trn={};const s=R.trn;if(s.e==null)s.e=trMax();s.pb=s.pb||{};s.gr=s.gr||{};s.n=s.n||0;return s}
function trMax(){return TRWK+(typeof lifePerk=='function'?lifePerk('sess'):0)}
const tFmt=v=>(+v).toFixed(2),GRN=['No grade','Bronze','Silver','Gold'],GRC=['#94a3b8','#d97706','#cbd5e1','#facc15'];
const trPos=k=>{const d=TRD[k],g=myPos();return!d.pos||d.pos.includes(g)};
// ---------- the drills ----------
// Every drill: n name, st the detailed ratings it trains, reps, d description, keys controls,
// init(D) once, rep(D) before each rep, tick(D,dt) while live, key(D,k) for keys, grade(D) 0-3, res(D) the score to save.
const TRD={
 dash:{n:'40-yard dash',st:['spd','acc'],reps:2,low:1,d:'Sprint from the blue line to the yellow line. Don\'t move before GO, run straight, and use your burst at the right moment.',
  keys:'WASD to run · Space: burst (once per run)',
  init(D){D.L=30;P.L=D.L;G.ytg=40;D.best=null;D.mv0=null},
  rep(D){D.fs=0;trPlace(D.me,D.L-.6,26.5,0);D.cones=[[D.L,23.5],[D.L,29.5],[D.L+40,23.5],[D.L+40,29.5],[D.L+20,23],[D.L+20,30]];D.bu=0;D.mv0=null;D.cd=1.8+rnd()*.8;D.big='SET...'},
  cdTick(D){if(inp()[2]&&D.t>.3){D.fs=(D.fs||0)+1;trPlace(D.me,D.L-.6,26.5,0);if(D.fs>=2){D.fs=0;D.big='';return trRep(D,'Second false start: that run does not count.',0)}D.big='FALSE START';D.msg='You moved before GO. Let go of the keys and wait for GO.';D.t=-.6}},
  key(D,k){if(k==' '&&D.st=='go'&&!D.bu){D.bu=1;D.me.burst=1.1;D.me.stm=Math.max(0,D.me.stm-12);puff(D.me.x-.5,D.me.y,5,.9);D.msg='Burst!'}},
  tick(D,dt){const me=D.me;if(trRun(D,dt)&&D.mv0==null)D.mv0=D.t;D.cx=me.x;
   if(me.y<22||me.y>31)return trRep(D,'Out of your lane. That run does not count.',0);
   if(me.x>=D.L+40){const t=D.t,ft=t-(D.mv0||0);if(D.best==null||t<D.best){D.best=t;D.best40=ft;D.react=D.mv0||0}return trRep(D,`${tFmt(tr40(ft))} seconds (reaction ${tFmt(D.mv0||0)})`,0)}
   if(D.t>12)trRep(D,'Too slow. Keep running to the yellow line.',0)},
  grade(D){if(D.best==null)return 0;const r=D.best/trIdeal(D.me,40);return r<=1.05?3:r<=1.11?2:r<=1.22?1:0},
  res(D){return D.best40!=null?tr40(D.best40):null},show:v=>tFmt(v)+' s'},
 cones:{n:'Cone drill',st:['agi','acc'],reps:2,low:1,d:'Weave through the cones: run through each glowing gate in order, then cross the last one. A juke gives you a sharp cut.',
  keys:'WASD to run · ↑ ↓ (or Q E): juke left / right',
  init(D){D.L=36;P.L=-60;G.ytg=0;D.best=null},
  rep(D){const L=D.L;trPlace(D.me,L-1,26.5,0);D.gt=[[L+6,19],[L+12,34],[L+18,19],[L+24,34],[L+30,19],[L+36,26.5]].map(a=>[a[0]+(rnd()-.5)*1.5,a[1]]);D.i=0;D.cd=1.3;D.big='READY'},
  key(D,k){if(D.st!='go')return;const s={arrowup:-1,q:-1,arrowdown:1,e:1}[k];if(s)juke(D.me,s)},
  tick(D,dt){const me=D.me;trRun(D,dt);D.cx=me.x;const g=D.gt[D.i];
   if(g&&Math.hypot(me.x-g[0],me.y-g[1])<1.7){D.i++;puff(g[0],g[1],4,.6);if(D.i>=D.gt.length){const t=D.t;if(D.best==null||t<D.best)D.best=t;return trRep(D,`${tFmt(t)} seconds`,0)}}
   if(D.t>22)trRep(D,'Out of time.',0)},
  grade(D){if(D.best==null)return 0;let len=0,a=[D.L-1,26.5];D.gt.forEach(g=>{len+=Math.hypot(g[0]-a[0],g[1]-a[1]);a=g});const r=D.best/(.3+len/D.me.spd*1.12+trAccLoss(D.me));return r<=1.06?3:r<=1.14?2:r<=1.28?1:0},
  res(D){return D.best},show:v=>tFmt(v)+' s'},
 sled:{n:'Sled push',st:['pow'],reps:1,low:1,d:'Drive the sled to the yellow line. Hold D (toward the yellow line) to push. When an arrow pops up, press that arrow key before its ring closes for a big surge. A wrong key or a late one stalls you.',
  keys:'Hold D to drive · press the arrow key that pops up',
  init(D){D.L=30;P.L=D.L;G.ytg=15;D.co=trScout(D,['O',0],['D',4]);D.sx=D.L+1.1;trPlace(D.me,D.sx-1.25,26.5,0);trPlace(D.co,D.sx+1.7,26.5,Math.PI);D.me.eng=D.co;D.tl=16;D.pr=null;D.nextP=1;D.np=0;D.hits=0;D.miss=0;D.surge=0;D.stall=0;D.fin=null},
  rep(D){D.cd=1.6;D.big='SET...'},
  key(D,k){if(D.st!='go'||!D.pr||!k.startsWith('arrow'))return;if(k==D.pr.k){D.surge=.34;D.hits++;D.msg='Drive!';puff(D.me.x,D.me.y,5,.8)}else{D.stall=.5;D.miss++;D.msg='Wrong key!'}D.pr=null;D.nextP=D.t+.4+rnd()*.5},
  tick(D,dt){const me=D.me,[ix]=inp();
   if(!D.pr&&D.t>=D.nextP){D.pr={k:['arrowup','arrowdown','arrowleft','arrowright'][rnd()*4|0],t:0,w:Math.max(.5,.8-D.np*.012)};D.np++}
   if(D.pr){D.pr.t+=dt;if(D.pr.t>D.pr.w){D.pr=null;D.miss++;D.stall=.35;D.nextP=D.t+.35+rnd()*.4;D.msg='Too late!'}}
   D.stall-=dt;let v=0;if(ix>0&&D.stall<=0)v=trSledV(me);if(D.surge>0){v+=3.1;D.surge-=dt}
   const sm=me.stm==null?100:me.stm;if(sm<20)v*=.5+sm/40;me.stm=Math.max(0,sm-(v>0?3.2:-4)*dt);
   D.sx+=v*dt;me.x=D.sx-1.25;me.y=26.5;me.fa=0;me.vx=v;me.vy=0;D.co.x=D.sx+1.7;D.co.y=26.5;D.co.vx=v;D.co.vy=0;D.cx=me.x;
   const yd=Math.min(15,D.sx-D.L-1.1);D.info=`${yd.toFixed(1)} / 15 yds · ${Math.max(0,D.tl-D.t).toFixed(1)} s`;
   if(yd>=15){D.fin=D.t;return trRep(D,`Sled at the line in ${tFmt(D.t)} seconds (${D.hits} surges)`,0)}
   if(D.t>=D.tl){D.yd=yd;return trRep(D,`Time! You pushed it ${yd.toFixed(1)} yards`,0)}},
  grade(D){if(D.fin==null)return(D.yd||0)>=11?1:0;const r=D.fin/(15/(trSledV(D.me)+.95));return r<=1.12?3:r<=1.3?2:1},
  res(D){return D.fin},show:v=>tFmt(v)+' s'},
 gass:{n:'Conditioning (gassers)',st:['sta'],reps:1,d:'Run sideline to sideline four times. Each run has a time limit, and the limits get shorter. Hold Space to sprint (burns stamina fast); without it you jog. Standing still at a line gets your breath back. Below 20 stamina you slow way down.',
  keys:'WASD to run · hold Space to sprint',
  init(D){D.L=50;P.L=-60;G.ytg=0;trPlace(D.me,D.L,2.2,Math.PI/2);D.me.stm=100;D.leg=0;D.lt=0;D.made=0;D.spare=0;D.rest=0;const b=49/(D.me.spd*.78);D.lim=[1.08,1,.93,.88].map(k=>b*k)},
  rep(D){D.cd=1.6;D.big='READY'},
  tick(D,dt){const me=D.me,sp=!!keys[' '],ty=D.leg%2?2.2:50.8;D.cx=me.x;
   if(D.rest>0){D.rest-=dt;me.vx=me.vy=0;me.stm=Math.min(100,me.stm+9*dt);D.info=`Next run in ${D.rest.toFixed(1)} s`;return}
   D.lt+=dt;const mvd=trRun(D,dt,sp?1.12:.78);if(mvd)me.stm=Math.max(0,me.stm-(sp?10:1.2)*dt*(1.45-fs(me,'sta')/130));else me.stm=Math.min(100,me.stm+4*dt);
   const lim=D.lim[D.leg];if(D.lt>lim+5)return trRep(D,`Out of gas on run ${D.leg+1}. ${D.made} of 4 on time.`,0);D.info=`Run ${D.leg+1} of 4 · ${Math.max(0,lim-D.lt).toFixed(1)} s left`;
   if(Math.abs(me.y-ty)<1){const ok=D.lt<=lim;if(ok){D.made++;D.spare+=lim-D.lt}D.msg=ok?`Run ${D.leg+1}: made it with ${(lim-D.lt).toFixed(1)} s to spare.`:`Run ${D.leg+1}: too slow by ${(D.lt-lim).toFixed(1)} s.`;
    D.leg++;D.lt=0;if(D.leg>=4)return trRep(D,`${D.made} of 4 runs on time${D.made==4?`, ${D.spare.toFixed(1)} s to spare`:''}`,0);D.rest=2.2}},
  grade(D){return D.made==4&&D.spare>=1.6?3:D.made==4?2:D.made==3?1:0},res(D){return D.made+D.spare/100},show:v=>`${Math.floor(v)}/4 runs`},
 tgt:{n:'Target practice',pos:['QB'],st:['sac','dac','tor'],reps:8,d:'Hit the rings: 3 points for the bullseye, 2 for the middle ring, 1 for the outside. Pull back on the field to aim and let go to throw, like in a game. Some targets are on a moving receiver. You have 4 seconds for each throw.',
  keys:'Pull back on the field, let go to throw · WASD to move · T: throw type',
  init(D){D.L=30;P.L=D.L;G.ytg=0;D.wr=P.off[1];const L=D.L,r=(a,b)=>a+rnd()*(b-a);
   D.tg=[{x:L+r(7,11),y:r(16,22)},{x:L+r(12,16),y:r(33,40)},{mv:'out'},{x:L+r(18,24),y:r(22,31)},{x:L+r(26,32),y:r(9,15)},{mv:'slant'},{x:L+r(34,40),y:r(32,42)},{mv:'go'}]},
  rep(D){const L=D.L,me=D.me,T=D.tg[D.rep];trPlace(me,L-5,26.5,0);P.b={st:'qb',x:me.x,y:me.y};P.aim=null;P.run=0;P.scr=0;P.pump=0;P.t=2;D.cur=T;D.cd=1;D.big=`THROW ${D.rep+1}`;
   const w=D.wr;if(T.mv){const s=rnd()<.5?1:-1,y0=s>0?12:41;trPlace(w,L-.5,y0,0);w.park=0;w.route=trRoute(T.mv,L,y0,s);w.ri=0}else trHide([w])},
  tick(D,dt){const me=D.me,b=P.b,T=D.cur,w=D.wr;D.cx=D.L+10;if(T.mv&&!w.park)trFollow(w,dt,.92);
   if(b.st=='qb'){trRun(D,dt,.95);if(P.aim){const t=aimT();face(me,Math.atan2(t[1]-me.y,t[0]-me.x),4,dt)}else if(!inp()[2])face(me,0,3,dt);D.info=`${Math.max(0,4-D.t).toFixed(1)} s · ${({bul:'Bullet',lob:'Lob'})[G.tt]||'Normal'} throw`;if((D.t>4&&!P.aim)||D.t>5.5){P.aim=null;return trRep(D,'Too late! The horn went.',0)}}
   else if(b.st=='air'){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;if(k>=1){const c=T.mv?{x:w.x,y:w.y}:T,d=Math.hypot(b.tx-c.x,b.ty-c.y),e=T.mv?.5:0,pts=d<1+e?3:d<2+e?2:d<3.2+e?1:0;
     if(T.mv&&pts){P.b={st:'carry',c:w,x:w.x,y:w.y};w.route=[]}else b.st='dead';return trRep(D,pts==3?'Bullseye! +3':pts?`+${pts}`:`Missed by ${d.toFixed(1)} yards`,pts)}}},
  grade(D){const f=D.score/24;return f>=.55?3:f>=.35?2:f>=.2?1:0},res(D){return D.score},show:v=>`${v} pts`},
 gaunt:{n:'Gauntlet',pos:['RB','WR','TE'],st:['elu','btk','cvi'],reps:3,d:'Carry the ball to the yellow line through four tacklers. Use your moves (juke, spin, truck, hurdle, stiff arm) and stay between the cones. 1 point for each tackler you get past, 2 more for reaching the line.',
  keys:'WASD to run · arrows: ↑ ↓ juke, → truck, ← spin · F stiff arm · C hurdle',
  init(D){D.L=30;P.L=D.L;G.ytg=35;D.dfs=[P.def[4],P.def[5],P.def[7],P.def[9]];D.cones=[];for(let x=0;x<=35;x+=7)D.cones.push([D.L+x,15.5],[D.L+x,37.5])},
  rep(D){const me=D.me;trPlace(me,D.L,26.5,0);P.b={st:'carry',c:me,x:me.x,y:me.y};D.b=0;D.cd=1.3;D.big=`REP ${D.rep+1}`;
   D.dfs.forEach((p,i)=>{trPlace(p,D.L+8+i*7,18+rnd()*17,Math.PI);p.park=0;p.act=0;p.beat=0})},
  key(D,k){trCarryKey(D,k)},
  tick(D,dt){const me=D.me,c=me;trRun(D,dt,.95*(me.jk>0?1.15:1));D.cx=me.x;D.info=`Tacklers beaten: ${D.b}`;
   for(const p of D.dfs){if(p.fall)continue;if(!p.act&&me.x>p.x-7)p.act=1;if(!p.beat&&me.x>p.x+1.3){p.beat=1;D.b++}
    if(p.act){if(p.bite>0){p.vx=p.vy=0}else{const dc=dist(p,c),lt=Math.min(.6,dc/(p.spd*2));mv(p,dc<3?c.x:c.x+c.vx*lt,dc<3?c.y:c.y+c.vy*lt,p.spd*(p.beat?.68:.84),dt)}
     if(p.cool<=0&&!(p.bite>0)&&dist(p,c)<1.3){p.cool=.3;let pr=clamp(.42+(TK(p)-BT(c))/160,.18,.75);if(c.jk>0)pr*=.25;pr*=tackleMod(p,c);
      if(rnd()<pr){ragTackle(p,c);P.b.st='dead';return trRep(D,`Tackled. ${D.b} beaten`,D.b)}brokeTackle(p,c);p.cool=Math.max(p.cool,.9);D.msg='Broke the tackle!'}}}
   if(me.y<15||me.y>38)return trRep(D,`Stepped out. ${D.b} beaten`,D.b);
   if(me.x>=D.L+35){D.dfs.forEach(p=>{if(!p.beat){p.beat=1;D.b++}});return trRep(D,`Made it! ${D.b} beaten +2`,D.b+2)}},
  grade(D){const f=D.score/18;return f>=.6?3:f>=.4?2:f>=.22?1:0},res(D){return D.score},show:v=>`${v} pts`},
 jugs:{n:'Jugs machine',pos:['RB','WR','TE'],st:['cth','cit'],reps:10,d:'The machine fires balls all over the field. Get under each one before it lands: the ring shows where it is coming down. Burst helps you get there.',
  keys:'WASD to run · → or F: burst',
  init(D){D.L=30;P.L=-60;G.ytg=0;D.mx=D.L-3;D.my=26.5;trPlace(D.me,D.L+10,26.5,Math.PI)},
  rep(D){D.cd=.9;D.big=`BALL ${D.rep+1}`;P.b={st:'dead',x:D.mx,y:D.my};const me=D.me;let tx,ty;
   for(let k=0;k<20;k++){const a=rnd()*Math.PI*2,r=6+rnd()*9;tx=clamp(me.x+Math.cos(a)*r,D.L+3,D.L+38);ty=clamp(me.y+Math.sin(a)*r,6,47);if(Math.hypot(tx-me.x,ty-me.y)>5)break}D.land=[tx,ty]},
  go(D){const[tx,ty]=D.land,dd=Math.hypot(tx-D.mx,ty-D.my);P.b={st:'air',sx:D.mx,sy:D.my,x:D.mx,y:D.my,tx,ty,t:0,T:1.35+dd/26+rnd()*.25,arc:1.2}},
  key(D,k){if(D.st=='go'&&(k=='x'||k=='arrowright'||k=='f'))wrMove(D.me,'burst')},
  tick(D,dt){const me=D.me,b=P.b;trRun(D,dt);D.cx=D.L+12;D.info=`Caught ${D.score} of ${D.rep}`;
   if(b.st=='air'){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;if(k<1)return;
    const d=Math.hypot(me.x-b.tx,me.y-b.ty);if(d<1.75){const pc=clamp(.66+(fs(me,'cth')-60)/90-Math.max(0,d-1.05)*.45,.2,.97);
     if(rnd()<pc){P.b={st:'carry',c:me,x:me.x,y:me.y};me.an={k:'catch',t:0,d:.35};return trRep(D,'Caught it!',1,.9)}b.st='dead';return trRep(D,'Dropped it!',0,.9)}
    b.st='dead';return trRep(D,`Too far away (${d.toFixed(1)} yds)`,0,.9)}},
  grade(D){return D.score>=8?3:D.score>=6?2:D.score>=4?1:0},res(D){return D.score},show:v=>`${v}/10`},
 tack:{n:'Open-field tackling',pos:['DL','LB','CB','S'],st:['tak','pur','hpw'],reps:5,d:'A ball carrier comes at you. Bring him down before he reaches the yellow line behind you. The hit stick brings him down more often, but if you whiff he is gone.',
  keys:'WASD to move · F or →: hit stick · ↑ ↓ shuffle · ← backpedal',
  init(D){D.L=40;P.L=D.L;G.ytg=12;D.c=P.off[5];D.cones=[[D.L,14],[D.L,39],[D.L+12,14],[D.L+12,39]]},
  rep(D){const me=D.me,c=D.c;trPlace(me,D.L+7,26.5,Math.PI);trPlace(c,D.L-6,17+rnd()*19,0);c.park=0;P.b={st:'carry',c,x:c.x,y:c.y};D.cd=1.2;D.big=`REP ${D.rep+1}`;D.pl=rnd()<.5?1:-1;D.rt=0},
  key(D,k){const me=D.me;if(D.st=='go'&&k=='f'&&!(me.hcool>0)){me.hs=.35;me.hcool=1.4;D.msg='Hit stick!'}},
  tick(D,dt){const me=D.me,c=D.c;trRun(D,dt,1.05*(me.hs>0?1.4:1));D.cx=D.L+4;
   if(!c.fall){D.rt-=dt;if(D.rt<=0){D.rt=.35;const side=Math.sign(c.y-me.y)||D.pl;D.ty=clamp(me.y+side*(6+rnd()*4),16,37)}
    if(c.bite>0){c.vx=c.vy=0}else mv(c,D.L+14,D.ty,c.spd*.92,dt);if(dist(c,me)<3.6&&!(c.mc>0)&&!(c.jc>0)&&rnd()<dt*3)aiMove(c,me,typeof IQ=='function'?IQ():.6)}
   if(!c.fall&&me.cool<=0&&dist(me,c)<(me.hs>0?1.8:1.3)){me.cool=.3;let pr=clamp(.55+(TK(me)-BT(c))/160,.25,.95);if(c.jk>0)pr*=me.hs>0?.5:.25;if(me.hs>0)pr=Math.min(.97,pr+.3);pr*=tackleMod(me,c);
    if(rnd()<pr){const big=me.hs>0,pts=Math.min(3,2+(big?1:0)+(c.x<D.L+2?1:0));ragTackle(me,c);P.b.st='dead';return trRep(D,big?`Big hit! +${pts}`:`Tackle! +${pts}`,pts)}
    brokeTackle(me,c);if(me.hs>0){me.stun=.6;D.msg='Whiffed the big hit!'}else D.msg='Broke your tackle!'}
   if(c.x>=D.L+12)return trRep(D,'He got by you.',0);if(c.y<14||c.y>39)return trRep(D,'Forced him out. +1',1)},
  grade(D){const f=D.score/15;return f>=.7?3:f>=.5?2:f>=.3?1:0},res(D){return D.score},show:v=>`${v} pts`},
 cov:{n:'Coverage drill',pos:['LB','CB','S'],st:['man','zon','bsk'],reps:6,d:'Stay with the receiver. When the ball is in the air, press E to go for the interception or R to swat it away (time it as the ball arrives). Watch the QB\'s eyes: he looks at his target just before he throws.',
  keys:'WASD to move · E intercept · R swat · ↑ ↓ shuffle · ← backpedal',
  init(D){D.L=35;P.L=D.L;G.ytg=0;D.wr=P.off[1];D.q=P.off[0]},
  rep(D){const L=D.L,me=D.me,w=D.wr,q=D.q,y0=[12,41,18,35][rnd()*4|0],s=y0<26.5?1:-1;trPlace(q,L-5,26.5,0);trPlace(w,L-.5,y0,0);w.park=0;q.park=0;
   w.route=trRoute(['slant','out','go','curl','post','in'][rnd()*6|0],L,y0,s);w.ri=0;trPlace(me,L+(myPos()=='CB'?2.5:6),y0+s*.8,Math.PI);
   P.b={st:'qb',x:q.x,y:q.y};P.run=0;P.scr=0;P.look=null;P.t=2;D.tt=1.8+rnd()*1.2;D.cd=1.2;D.big=`REP ${D.rep+1}`;me.hawk=me.swat=0},
  key(D,k){const me=D.me;if(D.st!='go')return;if(k=='e'&&!(me.hk>0)){me.hawk=.5;me.hk=1.2;D.msg=P.b.st=='air'?'Hands up!':'Time it as the ball arrives'}if(k=='r'&&!(me.swk>0)){me.swat=.45;me.swk=1;D.msg=P.b.st=='air'?'Swat!':'Time the swat as the ball arrives'}},
  tick(D,dt){const me=D.me,w=D.wr,q=D.q,b=P.b;trRun(D,dt,1.05);trFollow(w,dt,.95);D.cx=D.L+6;
   if(b.st=='qb'){face(q,Math.atan2(w.y-q.y,w.x-q.x),3,dt);if(D.t>D.tt-.55)P.look={x:w.x,y:w.y};if(D.t>=D.tt){P.look=null;const dd=dist(q,w),T=dd/thr(q,dd);throwAt(w.x+w.vx*T,w.y+w.vy*T)}return}
   if(b.st!='air')return;b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;if(k<1)return;
   const l={x:b.tx,y:b.ty},m=dist(me,l),rd=dist(w,l),bs=fs(me,'bsk');
   if(me.hawk>0&&m<2.6){if(rnd()<clamp(.4+(bs-60)/90+(2.6-m)*.12,.08,.85)){P.b={st:'carry',c:me,x:me.x,y:me.y};w.route=[];return trRep(D,'INTERCEPTION! +3',3)}D.msg='Dropped the pick!'}
   else if(me.swat>0&&m<2.9&&rnd()<clamp(.55+(bs-60)/100,.3,.9)){b.st='dead';return trRep(D,'Swatted away! +2',2)}
   if(rd<2.4){const cc=clamp(.85-clamp(1-m/3,0,1)*.6+(fs(w,'cth')-fs(me,'man'))/200,.1,.95);if(rnd()<cc){P.b={st:'carry',c:w,x:w.x,y:w.y};w.route=[];return trRep(D,'Caught. He beat you.',0)}b.st='dead';return trRep(D,'Incomplete: tight coverage. +1',1)}
   b.st='dead';return trRep(D,'Incomplete. +1',1)},
  grade(D){const f=D.score/18;return f>=.6?3:f>=.4?2:f>=.22?1:0},res(D){return D.score},show:v=>`${v} pts`},
 rush:{n:'Pass-rush moves',pos:['DL','LB'],st:['prp','prf','bsh'],reps:5,d:'Beat the blocker and get to the QB before he throws (about 3.5 seconds). When the blocker has you, use a move: 1 bull rush, 2 swim, 3 rip, 4 spin. He guesses a counter each time, so mix them up. 3 points for a sack, 1 for pressure.',
  keys:'WASD to move · 1 bull · 2 swim · 3 rip · 4 spin',
  init(D){D.L=40;P.L=D.L;G.ytg=0;D.o=P.off[6];D.q=P.off[0]},
  rep(D){const L=D.L,me=D.me,o=D.o,q=D.q;trPlace(q,L-5,26.5,0);trPlace(o,L-1.2,31.5,0);trPlace(me,L+1,33.5,Math.PI);o.park=0;q.park=0;o.eng=me.eng=null;o.helper=null;o.cool=0;me.cool=0;me.rm=0;
   P.b={st:'qb',x:q.x,y:q.y};P.run=0;P.scr=0;P.t=2;D.cd=1.2;D.big=`REP ${D.rep+1}`;cd=me},
  key(D,k){if(D.st!='go'||!'1234'.includes(k)||k.length!=1)return;cd=D.me;if(!D.me.eng){D.msg='Moves work while he is blocking you';return}rushMove({1:'bull',2:'swim',3:'rip',4:'spin'}[k]);D.msg=G.msg},
  tick(D,dt){const me=D.me,o=D.o,q=D.q,L=D.L;cd=me;D.cx=L;mv(q,L-7.5,26.5,3,dt);face(q,0,3,dt);D.info=`${Math.max(0,3.5-D.t).toFixed(1)} s`;
   if(me.eng){const f=clamp(.08+(fs(me,'pow')-fs(o,'pbk'))/150,0,.3),k=Math.hypot(q.x-me.x,q.y-me.y)||1;mv(me,q.x,q.y,me.spd*f,dt);o.x=me.x+(q.x-me.x)/k*1.2;o.y=me.y+(q.y-me.y)/k*1.2;face(o,Math.atan2(me.y-o.y,me.x-o.x),6,dt)}
   else{trRun(D,dt);if(o.cool<=0&&!(o.stun>0)){const k=Math.hypot(q.x-me.x,q.y-me.y)||1;mv(o,me.x+(q.x-me.x)/k*1.3,me.y+(q.y-me.y)/k*1.3,o.spd*1.05,dt);if(dist(o,me)<1.6&&me.cool<=0){o.eng=me;me.eng=o;me.mt=1}}else mv(o,o.x,o.y,0,dt)}
   if(dist(me,q)<1.4){me.eng=o.eng=null;ragTackle(me,q);return trRep(D,'SACK! +3',3)}
   if(D.t>=3.5){const pr=dist(me,q)<3.6;me.eng=o.eng=null;q.an={k:'throw',t:0,d:.4};return trRep(D,pr?'He got it off, but you got pressure. +1':'Blocked. He got the throw off.',pr?1:0)}},
  grade(D){const f=D.score/15;return f>=.47?3:f>=.27?2:f>=.13?1:0},res(D){return D.score},show:v=>`${v} pts`}};
const TRALL=['dash','cones','sled','gass'];
const TRSQ=60;                                   // the practice squad players you drill against are rated about this
const trList=()=>Object.keys(TRD).filter(k=>TRALL.includes(k)||trPos(k));
// ---------- helpers used by the drills ----------
function trPlace(p,x,y,fa){p.x=p.sx=x;p.y=p.sy=y;p.vx=p.vy=0;if(fa!=null)p.fa=fa;p.fall=null;p.jm=null;p.an=null;p.eng=null;p.stun=0;p.cool=0;p.bite=0;p.park=0}
function trPark(keep){const k0=keep||[];P.off.concat(P.def).forEach((p,k)=>{if(k0.includes(p))return;p.x=p.sx=-40-(k%5)*3;p.y=p.sy=5+(k*7)%44;p.vx=p.vy=0;p.park=1;p.route=[];p.eng=null;p.fall=null})}
function trHide(a){a.forEach((p,k)=>{if(!p)return;p.x=p.sx=-60-k*3;p.y=p.sy=26;p.vx=p.vy=0;p.park=1;p.route=[];p.eng=null;p.fall=null})}
function trScout(D,...slots){for(const[s,i]of slots){const p=(s=='O'?P.off:P.def)[i];if(p&&p!==D.me)return p}return P.off[2]}
function trAccT(p){return clamp(1.25-(fs(p,'acc')-50)*.012,.5,1.3)}
const trAccLoss=p=>trAccT(p)*.29;
// a 40 time on the NFL scale (the game field runs a little slower than real life)
const tr40=t=>4.22+(t-4.2)*.62;
function trIdeal(p,yd){return .25+trAccLoss(p)+yd/p.spd-.12}
const trSledV=p=>.3+fs(p,'pow')/210;
// run with WASD like in a game: your real speed, turning and stamina, plus a short speed-up from a standing start (acceleration)
function trRun(D,dt,k){const me=D.me,[ix,iy,im]=inp();if(!im){me.vx=me.vy=0;D.acc=0;return 0}D.acc=(D.acc||0)+dt;const ramp=Math.min(1,.42+.58*D.acc/trAccT(me));
 mv(me,me.x+ix*5,me.y+iy*5,me.spd*ramp*(k||1),dt);return 1}
// a route for a scout receiver: s = 1 if the middle of the field is toward bigger y
function trRoute(n,L,y0,s){const R0={slant:[[4,0],[14,6]],out:[[8,0],[10,-7]],go:[[34,0]],curl:[[11,0],[8,1]],post:[[11,0],[26,8]],in:[[9,0],[11,8]]}[n]||[[20,0]];
 return R0.map(([a,b])=>[L+a,clamp(y0+b*s,2,51)])}
function trFollow(w,dt,k){if(!w.route||w.ri==null)return;if(w.ri<w.route.length){const t=w.route[w.ri];mv(w,t[0],t[1],w.spd*k,dt);if(Math.hypot(t[0]-w.x,t[1]-w.y)<.5){w.ri++;w.brk=.5}}
 else if(w.route.length){const a=w.route[w.route.length-1],b=w.route.length>1?w.route[w.route.length-2]:[w.sx,w.sy],m=Math.hypot(a[0]-b[0],a[1]-b[1])||1;mv(w,w.x+(a[0]-b[0])/m*4,clamp(w.y+(a[1]-b[1])/m*4,2,51),w.spd*k,dt)}}
// ball-carrier moves, with the same action keys as a game (the Controls page layout applies)
function trCarryKey(D,k){const c=D.me;if(D.st!='go'||!(P.b.st=='carry'&&P.b.c===c))return;if(k==' '||k=='q'||k=='e')juke(c,k=='q'?-1:k=='e'?1:null);else if(k=='z')cmove(c,'spin');else if(k=='x')cmove(c,'truck');else if(k=='c')cmove(c,'hurdle');else if(k=='r'&&typeof stiffArm=='function')stiffArm(c)}
// end of a rep: add the points, show the message, then a short pause
function trRep(D,msg,pts,pause){D.score+=pts||0;D.msg=msg;D.big=pts>0?`+${pts}`:'';D.log.push(msg);D.st='rest';D.t=0;D.rt=pause||1.7;D.rep++;P.aim=null}
// ---------- starting a drill ----------
function trGo(k){try{
 if(!trOn()||!TRD[k]||!(TRALL.includes(k)||trPos(k)))return trainUI();if(G&&G.live)return;const p=meRow(),s=trS();if(!p)return;
 if(p.inj)return trainUI('You are injured. Rest up first.');if(s.e<1)return trainUI('No training sessions left this week. Play or sim your next game to get more.');
 dsSync(p);const sl=MYSLOT[p.g]||['O',1];newGame({n:'Practice',r:60,i:0});
 Object.assign(G,{live:0,q:1,clk:900,run:false,ch:null,two:0,ot:0,poss:sl[0]=='O'?'U':'C',dir:1,los:40,down:1,ytg:10,phase:'pre',next:'same',sc:[0,0],wx:'clear',wind:{x:0,y:0,m:0},night:false,prac:null,tut:null});
 const _lu=lineup;lineup=function(t,...a){const r=_lu(t,...a);try{if(!t&&r&&r[sl[0]]){r[sl[0]]=r[sl[0]].slice();r[sl[0]][sl[1]]=p}}catch(e){}return r};
 try{setup()}finally{lineup=_lu}
 const me=(sl[0]=='O'?P.off:P.def)[sl[1]];me.pid=p.id;me.stm=100;me.spd=1.15*(5.6+(me.sk?me.sk.spd:60)*.03);// in practice everyone runs at his plain athletic speedP.off.concat(P.def).forEach(q=>{q.stm=100;q.route=[];q.ri=0});
 const D={k,me,st:'cd',t:0,cd:1.5,rep:0,reps:TRD[k].reps,score:0,log:[],msg:'',big:'',info:'',cx:40,cones:[]};G.drill=D;
 if(sl[0]=='D')cd=me;clearRags();P.b={st:'dead',x:-50,y:26.5};P.aim=null;P.look=null;P.t=0;P.run=0;P.scr=0;
 const df=TRD[k];df.init(D);trPark([me,...trKeep(D)]);trKeep(D).forEach(q=>{if(q===me)return;q.rp=null;q.o=TRSQ;q.sk={spd:q.sk?q.sk.spd:62,str:TRSQ,awr:TRSQ,skl:TRSQ}});df.rep(D);D.cd=D.cd||1.5;
 G.phase='play';G.msg='';$('modal').hidden=1;document.body.classList.add('trn');trHud(1)}catch(e){console.error(e);trEnd();modal(`<h1>Training</h1><p>That drill could not start: ${esc(e&&e.message||e)}</p>${B('trainUI()','Back to training')}`)}}
// the players a drill uses (everyone else waits off to the side)
function trKeep(D){return[D.co,D.wr,D.c,D.o,D.q,...(D.dfs||[])].filter(Boolean)}
// ---------- the live drill: runs instead of the game's play step ----------
const TRT=['mc','spin','trk','hrdL','rm','fk','burst','sa','ca','cool','jk','jc','ml','boost','hcool','hk','hawk','swk','swat','hs'];
function trStep(dt){const D=G.drill;if(!D)return;dt=Math.min(dt,.05);D.t+=dt;P.t+=dt;const df=TRD[D.k];
 P.off.concat(P.def).forEach(p=>{if(p.park)return;p.drag=1;if(p.hrd>0){p.hrd-=dt;if(p.hrd<=0)p.hrdL=.3}TRT.forEach(k=>{if(p[k]>0)p[k]-=dt});if(p.bite>0)p.bite-=dt});
 if(D.st=='cd'){D.me.vx=D.me.vy=0;if(df.cdTick)df.cdTick(D,dt);if(D.t>=D.cd){D.st='go';D.t=0;D.acc=0;D.big='GO!';D.msg='';if(df.go)df.go(D)}}
 else if(D.st=='go'){if(D.t>.6&&D.big=='GO!')D.big='';df.tick(D,dt)}
 else if(D.st=='rest'){try{postStep(dt)}catch(e){}if(D.t>=D.rt){if(D.rep>=D.reps)return trDone();clearRags();if(D.k!='gass'&&D.k!='sled')P.off.concat(P.def).forEach(p=>p.stm=100);df.rep(D);D.st='cd';D.t=0;D.msg=''}}
 try{const q=P.off[0];if(q)q.ha=null}catch(e){}try{animStep(dt)}catch(e){}try{if(typeof anTick=='function')anTick(dt)}catch(e){}
 const b=P.b;if(b.st=='carry'&&b.c){b.x=b.c.x;b.y=b.c.y}else if(b.st=='qb'){b.x=P.off[0].x;b.y=P.off[0].y}trHud()}
{const _st=step;step=function(dt,...a){if(G&&G.drill)return trStep(dt);return _st(dt,...a)}}
{const _ct=camTgt;camTgt=function(b,L){if(G&&G.drill)return G.drill.cx;return _ct(b,L)}}
{const _pw=pcWant;pcWant=function(...a){if(G&&G.drill)return false;return _pw.apply(this,a)}}
{const _kc=kbCtx;kbCtx=function(){const D=G&&G.drill;if(!D)return _kc();if(!$('modal').hidden||D.st=='rest')return null;
 if(['tack','cov','rush'].includes(D.k))return D.k=='rush'?null:'def';if(D.k=='gaunt')return'car';if(D.k=='tgt')return'qb';if(D.k=='jugs')return'wr';return null}}
// keys during a drill go to the drill (Esc quits)
{const _h=hit;hit=function(k,...a){const D=G&&G.drill;if(!D)return _h(k,...a);if(!$('modal').hidden)return;if(k=='escape')return trQuit();
 if((k=='dshu'||k=='dshd'||k=='dbp')&&G.poss!='U')return _h(k,...a);if(k=='t'&&D.k=='tgt')return _h(k,...a);
 if(k==' '&&D.k=='tgt'&&P.b.st=='qb'){pump();return}
 if((k=='q'||k=='e')&&D.k=='tgt'&&P.b.st=='qb'){juke(D.me,k=='q'?-1:1);return}
 try{const df=TRD[D.k];if(df.key)df.key(D,k)}catch(e){console.error(e)}}}
// no aiming or throwing before GO
addEventListener('pointerdown',e=>{const D=G&&G.drill;if(D&&e.target===C&&(D.st!='go'||D.k!='tgt'))e.stopImmediatePropagation()},true);
// draw the cones, rings, sled and jugs machine on the field (under the players)
{const _df=drawField;drawField=function(...a){const r=_df.apply(this,a);try{if(G&&G.drill)trGround()}catch(e){console.error(e)}return r}}
// practice jerseys for the scout team, and keep the drill's lines where the drill wants them
{const _dr=draw;draw=function(...a){const D=G&&G.drill;if(D){try{Object.assign(TEAM.C,{j:'#e5e7eb',j2:'#64748b',h:'#475569',pt:'#cbd5e1',st:'#64748b',num:'#334155'})}catch(e){}}return _dr.apply(this,a)}}
// a box on the field: x0-x1 along the field, y0-y1 across it, h tall (we see its top and the side facing the camera)
function trBox(x0,x1,y0,y1,h,col,side,top){const f=(pts,c)=>{X.fillStyle=c;X.beginPath();pts.forEach((q,i)=>{const s=P2(q[0],q[1],q[2]);i?X.lineTo(s[0],s[1]):X.moveTo(s[0],s[1])});X.closePath();X.fill()};
 f([[x0,y1,0],[x1,y1,0],[x1,y1,h],[x0,y1,h]],side);f([[x0,y0,h],[x1,y0,h],[x1,y1,h],[x0,y1,h]],top);f([[x0,y0,0],[x0,y1,0],[x0,y1,h],[x0,y0,h]],col)}
function trCone(x,y,col){const s=P2(x,y),k=scY(y),h=12*k,w=4.5*k;X.fillStyle='rgba(0,0,0,.28)';X.beginPath();X.ellipse(s[0]+2,s[1],w*1.5,w*.5,0,0,7);X.fill();
 X.fillStyle=col||'#f97316';X.beginPath();X.moveTo(s[0]-w,s[1]);X.lineTo(s[0]+w,s[1]);X.lineTo(s[0],s[1]-h);X.closePath();X.fill();X.fillStyle='#fff';X.fillRect(s[0]-w*.42,s[1]-h*.52,w*.84,2)}
function trGround(){const D=G.drill;(D.cones||[]).forEach(c=>trCone(c[0],c[1]));
 if(D.k=='cones')D.gt.forEach((g,i)=>{const on=i==D.i,done=i<D.i;trCone(g[0],g[1]-1.9,done?'#64748b':'#f97316');trCone(g[0],g[1]+1.9,done?'#64748b':'#f97316');if(on){gring(g[0],g[1],1.7,'#ffd84d',3);gring(g[0],g[1],1.1,'#ffd84d88',2)}else if(!done)gring(g[0],g[1],1.5,'#ffffff55',1.5)});
 if(D.k=='sled'){const x=D.sx;trBox(x-.4,x+2,22.4,30.6,.35,'#374151','#1f2937','#4b5563');[[23,26],[27,30]].forEach(([a,b])=>trBox(x-.35,x+.25,a,b,3.4,'#dc2626','#991b1b','#f87171'));trBox(x+1.4,x+2,25.6,27.4,1.2,'#6b7280','#374151','#9ca3af')}
 if(D.k=='tgt'&&D.cur&&P.b.st!='carry'){const T=D.cur,c=T.mv?(D.wr.park?null:D.wr):T;if(c){gring(c.x,c.y,3.2,'#ffffffcc',2);gring(c.x,c.y,2,'#ef4444',3);gring(c.x,c.y,1,'#ffffff',3);gring(c.x,c.y,.35,'#ef4444',4)}}
 if(D.k=='jugs'){const s=P2(D.mx,D.my),k=scY(D.my);X.fillStyle='#111827';X.fillRect(s[0]-14*k,s[1]-10*k,28*k,10*k);X.fillStyle='#facc15';X.fillRect(s[0]-11*k,s[1]-8*k,22*k,3*k);X.fillStyle='#374151';X.beginPath();X.arc(s[0]+4*k,s[1]-16*k,7*k,0,7);X.fill();X.fillStyle='#9ca3af';X.fillRect(s[0]+6*k,s[1]-20*k,14*k,6*k);
  if(P.b.st=='air'||(D.st=='cd'&&D.land)){const l=P.b.st=='air'?[P.b.tx,P.b.ty]:D.land;gring(l[0],l[1],1.7,'#ffd84d',2.5);gring(l[0],l[1],.5,'#ffd84d',2)}}
 if(D.k=='gass'){X.lineWidth=4;X.strokeStyle=D.leg%2?'#ffd84d':'#ffd84d55';gline(D.L-6,2.2,D.L+6,2.2);X.strokeStyle=D.leg%2?'#ffd84d55':'#ffd84d';gline(D.L-6,50.8,D.L+6,50.8);trCone(D.L-6,1.2);trCone(D.L+6,1.2);trCone(D.L-6,52);trCone(D.L+6,52)}
 if(D.k=='rush'&&D.q){gring(D.q.x,D.q.y,1.4,'#ef444499',2)}}
// the drill's own scoreboard, message and controls, over the game screen
let TRH='';
function trHud(force){let el=$('trh');if(!el){el=document.createElement('div');el.id='trh';($('wrap')||document.body).appendChild(el)}
 const D=G&&G.drill;if(!D){el.style.display='none';TRH='';return}el.style.display='';const df=TRD[D.k];
 let pr='';if(D.k=='sled'&&D.pr){const a={arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→'}[D.pr.k],f=1-D.pr.t/D.pr.w;pr=`<div class="trp"><b>${a}</b><i style="transform:scale(${(.55+f*1.1).toFixed(2)})"></i></div>`}
 const h=`<div class="trt"><b>${df.n}</b><span>${D.st=='rest'&&D.rep>=D.reps?'Done':[df.reps>1?`Rep ${Math.min(D.rep+1,D.reps)} of ${D.reps}`:'',D.score?`${D.score} pts`:'',D.info||''].filter(Boolean).join(' · ')}</span></div>${D.big?`<div class="trbig">${D.big}</div>`:''}${pr}${D.msg?`<div class="trm">${esc(D.msg)}</div>`:''}<div class="trk">${df.keys} · Esc to quit</div>`;
 if(h!==TRH||force){TRH=h;el.innerHTML=h}}
// ---------- finishing ----------
function trEnd(){if(G)G.drill=null;document.body.classList.remove('trn');trHud();try{if(G){G.phase='over';P.aim=null}}catch(e){}try{if(typeof uniforms=='function')uniforms()}catch(e){}}
function trQuit(){trEnd();trainUI('Drill stopped. No session used.')}
function trDone(){const D=G.drill,df=TRD[D.k],k=D.k;let g=0,v=null;try{g=df.grade(D);v=df.res(D)}catch(e){console.error(e)}trEnd();trFinish(k,g,v,D.log,0)}
// rewards: XP, and a chance at +1 in a rating the drill trains (better grades, better chance; never past the ceiling)
function trBoost(p,L){if(DS2()&&PSI[p.g]){dsSync(p);if(p.ds){const I=PSI[p.g],c=L.filter(s=>I[s]!=null&&p.ds[I[s]]<Math.min(99,p.dm[I[s]]));if(!c.length)return'';const s=c[rnd()*c.length|0];p.ds[I[s]]++;dsPush(p);return`+1 ${DSN[s].toLowerCase()}`}}
 const M={spd:'spd',acc:'spd',agi:'spd',pow:'str',sta:'str',btk:'str',hpw:'str',prp:'str',cvi:'awr',zon:'awr',prc:'awr'},c=[...new Set(L.map(s=>M[s]||'skl'))].filter(k=>p.sk[k]<Math.min(99,p.mx[k]));if(!c.length)return'';
 const k=c[rnd()*c.length|0];p.sk[k]++;return`+1 ${{spd:'speed',str:'strength',awr:'awareness',skl:'skill'}[k]}`}
function trFinish(k,g,v,log,sim){const p=meRow(),df=TRD[k],s=trS();if(!p)return careerHub();
 const mult=(sim?.5:1)*(1+(typeof lifePerk=='function'?lifePerk('xp',k):0)),xp=Math.round([3,7,12,18][g]*mult);R.xp=(R.xp||0)+xp;
 const got=rnd()<[.08,.25,.55,1][g]*(sim?.5:1)?trBoost(p,df.st):'';s.e=Math.max(0,s.e-1);s.n++;
 let pb='';if(!sim&&v!=null){const o=s.pb[k];if(o==null||(df.low?v<o:v>o)){if(o!=null)pb='New personal best!';s.pb[k]=v}}
 if(g>(s.gr[k]||0)){if(g==3&&!sim)addNews(`${p.n} aced the ${df.n.toLowerCase()} in practice.`);s.gr[k]=g}
 if(k=='dash'&&v!=null&&!sim&&pb)addNews(`${p.n} ran a ${tFmt(v)} 40-yard dash in practice.`);
 s.last={k,g,xp,got,v,sim:!!sim};VW.page='train';if(typeof lifeAfterDrill=='function')try{lifeAfterDrill(k,g)}catch(e){}save();
 modal(`<h1>${df.n}: <span style="color:${GRC[g]}">${GRN[g]}</span></h1>${sim?'<p class="dim">Quick sim (half the XP, smaller rating chance).</p>':''}
 ${v!=null&&!sim?`<p style="font-size:30px;font-weight:bold;margin:4px 0">${df.show(v)}${pb?` <span class="good">${pb}</span>`:''}</p>`:''}
 <p><b>+${xp} XP</b>${got?` · <b class="good">${got}</b>`:''}</p>${(log||[]).length?`<ul class="small">${log.map(l=>`<li>${esc(l)}</li>`).join('')}</ul>`:''}
 <p class="dim">${s.e} training session${s.e==1?'':'s'} left this week.</p>
 <div class="btns" style="display:flex;gap:8px;flex-wrap:wrap">${s.e>0?B(`trGo('${k}')`,'Run it again','go'):''}${B('trainUI()','Back to training')}${B('careerHub()','Career home')}</div>`)}
// quick sim: the grade comes from your ratings, with some luck
function trSim(k){const p=meRow(),s=trS(),df=TRD[k];if(!p||!df||!trOn())return;if(p.inj)return trainUI('You are injured. Rest up first.');if(s.e<1)return trainUI('No training sessions left this week.');
 dsSync(p);const vs=df.st.map(st=>dv(p,st)),a=vs.reduce((x,y)=>x+y,0)/vs.length+(rnd()-.5)*16;trFinish(k,a>=82?3:a>=68?2:a>=55?1:0,null,[],1)}
// ---------- the Training page ----------
function trainUI(note){if(!CAR()||!R.me)return careerHub();VW.page='train';const p=meRow(),s=trS();if(G&&G.drill)trEnd();
 if(!feat('drills'))return modal(`<h1>Training</h1><p>Training drills are switched off on the Game features page.</p>`);
 const dots=Array.from({length:Math.max(s.e,trMax())},(_,i)=>`<i class="${i<s.e?'on':''}"></i>`).join(''),ok=s.e>0&&!p.inj;
 const cardOf=k=>{const df=TRD[k],gr=s.gr[k]||0,pb=s.pb[k],I=PSI[p.g]||{},rt=df.st.filter(st=>!DS2()||I[st]!=null).map(st=>`${DSN[st]} ${dv(p,st)}`).join(' · ');
  return card(df.n,`<p>${df.d}</p><p class="small dim">Trains: ${rt||'-'}</p><p class="small">${gr?`Best grade: <b style="color:${GRC[gr]}">${GRN[gr]}</b>`:'Not done yet'}${pb!=null?` · Best: ${df.show(pb)}`:''}</p><p class="small dim">Controls: ${df.keys}</p>
  <div class="btns">${ok?B(`trGo('${k}')`,'Run the drill','go')+B(`trSim('${k}')`,'Quick sim'):''}</div>`)};
 modal(`${note?`<p class="warn">${esc(note)}</p>`:''}<div class="hdr"><h1>Training</h1><p class="dim">Practice on the field between games. Each week you get ${trMax()} sessions; a new week starts after your next game. Bronze, Silver or Gold give XP, and the better the grade, the better the chance to raise a rating the drill trains (up to your ceiling).</p></div>
 <p class="trdots">Sessions left this week: ${dots} <b>${s.e}</b>${p.inj?' · <b class="l">Injured: no training</b>':''}</p><div class="dash">${trList().map(cardOf).join('')}</div>`)}
// ---------- weekly sessions: a new week after every game (played or simmed); extra sessions in the offseason ----------
{const _cx=careerXP;careerXP=function(...a){const r=_cx.apply(this,a);try{if(CAR()&&R.me){const s=trS();s.e=trMax()}}catch(e){console.error(e)}return r}}
// ---------- the career home page gets a Training card, and the sidebar gets a Training link ----------
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{if(!trOn()||(G&&G.live))return r;const d=$('modal').querySelector('.dash'),p=meRow();if(!d||!p)return r;const s=trS();
 if(R.stage&&s.off!==R.season){s.off=R.season;s.e=trMax()+2}
 const l=s.last&&TRD[s.last.k]?`<p class="small">Last: ${TRD[s.last.k].n}, <b style="color:${GRC[s.last.g]}">${GRN[s.last.g]}</b> (+${s.last.xp} XP${s.last.got?', '+s.last.got:''})</p>`:'';
 const h=card(`Training · ${s.e} session${s.e==1?'':'s'} left`,`${p.inj?'<p class="l">You are injured. No training until you are healthy.</p>':`<p>Run drills on the field to earn XP and raise your ratings.</p>`}${l}<div class="btns">${B('trainUI()','Go to training','go')}</div>`);
 const f=d.firstElementChild;if(f)f.insertAdjacentHTML('afterend',h);else d.insertAdjacentHTML('afterbegin',h)}catch(e){console.error(e)}return r}}
(()=>{const i=NAVC.findIndex(x=>x[0]=='play');if(!NAVC.some(x=>x[0]=='train'))NAVC.splice(i<0?1:i+1,0,['train','trainUI()','Training'])})();
{const _sh=shellHTML;shellHTML=function(h,...a){let r=_sh(h,...a);try{if(R&&R.mode=='career'&&!feat('drills'))r=r.replace(/<[^<>]*trainUI\(\)[^<>]*>[^<]*<\/[a-z]+>/,'')}catch(e){}return r}}
