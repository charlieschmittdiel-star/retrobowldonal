'use strict';
// On-court depth: a playbook (offensive sets and defenses) with the coach's suggestion, timeouts, end-of-game strategy,
// pump fakes and post moves, in-game injuries, hot streaks, momentum, halftime adjustments, more rules,
// gamepad and touch controls, and 2-player couch mode. Each part has its own switch on the Game features page.
{const add=[['Playbook','plays','Playbook','Call offensive sets (pick and roll, isolation, post up...) and defenses (man, 2-3 zone, press...). Press C to change your set and V your defense. The other team calls its own.'],
 ['Playbook','coach','Coach suggestions','Your coach suggests a set and a defense from the matchups on the floor. Press X to use them.'],
 ['On the court','tout','Timeouts','Press T to call a timeout (when you have the ball or it is dead): your players get a rest and, late in games, the ball moves up the court. The CPU calls them to stop runs.'],
 ['On the court','late','End-of-game strategy','Teams that are behind foul on purpose (press F on defense to do it yourself), teams that are ahead run the clock, and close games hold for the last shot.'],
 ['On the court','moves','Pump fakes and post moves','Press G to pump fake and get defenders off their feet. Big men score in the post with their post moves rating.'],
 ['On the court','inj2','In-game injuries','Players can get hurt during games and have to come out.'],
 ['On the court','hot','Hot streaks','Players who make several shots in a row heat up, then catch fire.'],
 ['On the court','mom','Momentum','Scoring runs give a team a small lift and get the crowd going.'],
 ['On the court','half','Halftime adjustments','At halftime, pick a plan for the second half.'],
 ['On the court','rules2','More rules','8-second backcourt violations and goaltending.'],
 ['Controls','pad','Gamepad','Play with an Xbox or PlayStation controller.'],
 ['Controls','touch','Touch controls','A joystick and buttons on touch screens.'],
 ['Controls','p2','2-player couch mode','A friend controls the other team on the same keyboard (arrows, / shoot, . pass or steal, , lob or switch, ; crossover). Off by default.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
// ---------- the playbook ----------
const OSETS={motion:{n:'Motion',d:'Move the ball and take the open shot.',m:{}},
 pnr:{n:'Pick and roll',d:'A big man screens for the ball handler, then rolls to the rim.',m:{screen:4,drive:1.05}},
 iso:{n:'Isolation',d:'Clear out and let the ball handler go one on one.',m:{drive:1,need:.1,screen:0,spots:U=>({PG:U(25,25),SG:U(3,3),SF:U(3,47),PF:U(17,46),C:U(17,4)})}},
 post:{n:'Post up',d:'Feed the big man on the block and let him work.',m:{post:1,three:.9,spots:U=>({PG:U(24,34),SG:U(22,6),SF:U(4,46),PF:U(16,40),C:U(7,18)})}},
 spread:{n:'Spread the floor',d:'Shooters around the arc and kick-outs for threes.',m:{three:1.22,drive:.9,spots:U=>({PG:U(25,25),SG:U(21,43),SF:U(3,3),PF:U(21,7),C:U(5,40)})}},
 give:{n:'Give and go',d:'Pass, cut hard to the basket, get it back.',m:{give:1}},
 push:{n:'Push the pace',d:'Run and take the first good shot.',m:{need:-.09}},
 slow:{n:'Slow it down',d:'Work the clock and take good shots late.',m:{need:.17}}};
const DSETS={man:{n:'Man to man',d:'Each defender guards one player.',m:{}},
 zone:{n:'2-3 zone',d:'Protect the paint. Good shooters can find open threes.',m:{zone:1}},
 press:{n:'Full-court press',d:'Pressure the ball everywhere: more steals, but more fouls and tired legs.',m:{press:1,stl:1.35,foul:1.2,ball:.9}},
 switch:{n:'Switch everything',d:'Switch on every screen instead of fighting through.',m:{sw:1}},
 pack:{n:'Pack the paint',d:'Sag off to stop drives and dare them to shoot.',m:{sag:1.4,help:1.25,ball:1.12}},
 tight:{n:'Run them off the line',d:'Crowd the shooters. Drives get easier.',m:{sag:.72,ball:.95,help:1}}};
const OKEYS=Object.keys(OSETS),DKEYS=Object.keys(DSETS);
const PLANS={none:['Stay the course','No changes.',{},{}],attack:['Attack the paint','Drive more.',{drive:1.2},{}],fly:['Let it fly','Shoot more threes.',{three:1.15},{}],
 arc:['Lock down the arc','Crowd their shooters.',{},{sag:.75}],paint:['Protect the paint','Sag off and help more.',{},{sag:1.35,help:1.2}],pace:['Push the pace','Run more.',{need:-.08},{}],slowp:['Slow it down','Fewer, better shots.',{need:.1},{}]};
const lateG=()=>G&&G.q>=4&&G.clk<=Math.min(120,G.ql*.25);
function mergeM(base,list){const o=Object.assign({},base);list.forEach(m=>{if(!m)return;for(const k in m){if(k=='spots'||k=='zone'||k=='press'||k=='sw'||k=='post'||k=='give')o[k]=m[k];else if(k=='need')o.need+=m[k];else o[k]=(o[k]==null?1:o[k])*m[k]}});return o}
offMod=function(k){if(!G)return OM0;const c=G.calls&&G.calls[k],L=[];if(feat('plays')&&c)L.push(OSETS[c.o].m);if(feat('half')&&G.plan&&G.plan[k])L.push(PLANS[G.plan[k]][2]);
 // end-of-game: run the clock when ahead, hold for the last shot when close, look for threes when down 3
 if(feat('late')&&G.q>=4){const mg=G.sc[k]-G.sc[opp(k)],c2=G.clk;if(mg>0&&c2<=G.shot+1&&G.shot>5)L.push({need:1.6});else if(mg>=-3&&mg<=0&&c2<=G.shot+1){L.push(c2>6?{need:1.6}:{need:-.5});if(mg<=-3&&mg>=-3&&c2<12)L.push({three:1.6,drive:.6})}}
 return L.length?mergeM(OM0,L):OM0};
defMod=function(k){if(!G)return DM0;const c=G.calls&&G.calls[k],L=[];if(feat('plays')&&c)L.push(DSETS[c.d].m);if(feat('half')&&G.plan&&G.plan[k])L.push(PLANS[G.plan[k]][3]);return L.length?mergeM(DM0,L):DM0};
// what the coach suggests: compare the matchups on the floor
function coachSug(k){const O=onT(k),D=onT(opp(k)),av=(L,f)=>L.reduce((a,e)=>a+f(e.p.sk,e.p),0)/Math.max(1,L.length),big=L=>L.slice().sort((a,b)=>b.p.ht-a.p.ht)[0],hand=L=>L.slice().sort((a,b)=>b.p.sk.han-a.p.sk.han)[0];
 const ob=big(O),db=big(D),oh=hand(O),dh=hand(D),why=[];const os={motion:.75+(av(O,s=>s.pas+s.vis)/2-60)/40};
 os.post=ob&&db?(ob.p.sk.post+ob.p.sk.str*.5-db.p.sk.id-db.p.sk.str*.5)/18+(ob.p.ht-db.p.ht)*.12:0;
 os.pnr=oh&&ob&&db?(oh.p.sk.han-70)/25+(ob.p.sk.lay+ob.p.sk.dnk-db.p.sk.pd*2-40)/40:0;
 const star=O.slice().sort((a,b)=>ovr(b.p)-ovr(a.p))[0];os.iso=star&&star.man?(star.p.sk.han+star.p.sk.spd-star.man.p.sk.pd*2-25)/24+(ovr(star.p)-76)/20:0;
 os.spread=(av(O,s=>s.thr)-61)/7+(av(D,s=>s.pd)<55?.15:0);os.give=(av(O,s=>s.spd)-av(D,s=>s.pd)-4)/20;
 os.push=(av(O,s=>s.spd)-av(D,s=>s.spd)-3)/12;const mg=G.sc[k]-G.sc[opp(k)];if(lateG()&&mg<-6)os.push+=1.5;if(lateG()&&mg>4)os.slow=1.5;
 const ds={man:.9};const dthr=av(D,s=>s.thr),ddr=av(D,s=>s.lay+s.han)/2;ds.zone=(55-dthr)/6+(av(O,s=>s.id)<52?.15:0);ds.pack=(ddr-dthr-10)/12;ds.tight=(dthr-63)/6;
 ds.press=(55-av(D,s=>s.han))/10+(lateG()&&mg<-5?1.6:0);const hs=O.map(e=>e.p.ht);ds.switch=(4-(Math.max(...hs)-Math.min(...hs)))/5;
 const bo=Object.keys(os).sort((a,b)=>os[b]-os[a])[0],bd=Object.keys(ds).sort((a,b)=>ds[b]-ds[a])[0];
 if(bo=='post'&&ob&&db)why.push(`${ob.p.ln} has the edge inside on ${db.p.ln}`);else if(bo=='pnr')why.push(`${oh.p.ln} and ${ob.p.ln} can work the pick and roll`);else if(bo=='iso'&&star)why.push(`${star.p.ln} can beat ${star.man.p.ln} one on one`);
 else if(bo=='spread')why.push('your shooters can hurt them from three');else if(bo=='push')why.push(lateG()&&mg<0?'you need points fast':'you are quicker than they are');else if(bo=='slow')why.push('protect the lead');else if(bo=='give')why.push('your cutters are quicker');else why.push('move the ball and find the open man');
 if(bd=='zone')why.push('they can\'t shoot well from outside');else if(bd=='pack')why.push('they like to drive more than shoot');else if(bd=='tight')why.push('their shooters are dangerous');else if(bd=='press')why.push(lateG()&&mg<0?'you need steals':'their ball handling is shaky');else if(bd=='switch')why.push('your players are all about the same size');
 return{o:bo,d:bd,why}}
function cpuCall(k){if(!feat('plays'))return;const iq=IQ(k);let s=coachSug(k);if(rnd()>iq*.85){s={o:rnd()<.5?'motion':pick(OKEYS),d:rnd()<.55?'man':pick(DKEYS)}}else if(rnd()<.3)s={o:rnd()<.5?s.o:'motion',d:rnd()<.5?s.d:'man'};G.calls[k]={o:s.o,d:s.d};if(!lateG()&&s.o=='slow')G.calls[k].o='motion'}
function cycleCall(side,dir){if(!feat('plays')||!G.calls)return;const L=side=='o'?OKEYS:DKEYS,c=G.calls[0];c[side]=L[(L.indexOf(c[side])+(dir||1)+L.length)%L.length];say((side=='o'?'Offense: ':'Defense: ')+(side=='o'?OSETS:DSETS)[c[side]].n,1.2)}
function useCoach(){if(!feat('coach')||!feat('plays')||!G)return;const s=coachSug(0);G.calls[0]={o:s.o,d:s.d};say(`Coach: ${OSETS[s.o].n} / ${DSETS[s.d].n}`,1.6)}
// 2-3 zone positions, shifted toward the ball
function zoneSpot(e,k){const D=onT(k),s=G.dir[opp(k)],hx=hoopX(s),b=G.b,bx0=b.st=='held'?b.h:b,ord=D.slice().sort((a,c)=>POS.indexOf(a.p.pos)-POS.indexOf(c.p.pos)),i=ord.indexOf(e);
 const base=[[22,17],[22,33],[9,7],[9,43],[5,25]][i]||[10,25];const shY=clamp((bx0.y-25)*.45,-8,8),shX=clamp(Math.abs(bx0.x-hx)-20,-4,6)*.3;return[hx-s*(base[0]+shX),base[1]+shY]}
{const _d=defAI;defAI=function(e,dt){const DM=defMod(e.t),b=G.b;
  if(DM.zone&&b.st=='held'&&b.h.t!==e.t&&!(e===G.ctl&&G.ctlInput)){const h=b.h,s=G.dir[opp(e.t)],hx=hoopX(s);const sp=zoneSpot(e,e.t);
   // the zone defender nearest the ball steps up to guard it
   const near=onT(e.t).slice().sort((a,c)=>Math.hypot(zoneSpot(a,e.t)[0]-h.x,zoneSpot(a,e.t)[1]-h.y)-Math.hypot(zoneSpot(c,e.t)[0]-h.x,zoneSpot(c,e.t)[1]-h.y))[0];
   if(near===e&&Math.hypot(h.x-hx,h.y-25)<26){const ux=hx-h.x,uy=25-h.y,l=Math.hypot(ux,uy)||1;seek(e,h.x+ux/l*3.4,h.y+uy/l*3.4,1);if(dist(e,h)<3&&rnd()<dt*.08*(e.p.sk.stl/65))stealTry(e);return}
   if(e.bite>0){e.bite-=dt;return}return seek(e,sp[0],sp[1],.9)}
  // full-court press: pick up the ball in the backcourt
  if(DM.press&&b.st=='held'&&b.h.t!==e.t&&b.h===e.man){const s=G.dir[opp(e.t)],own=(b.h.x-47)*s<0;if(own){const h=b.h,ux=hoopX(s)-h.x,uy=25-h.y,l=Math.hypot(ux,uy)||1;seek(e,h.x+ux/l*2.4,h.y+uy/l*2.4,1);if(feat('fatigue'))G.st[e.p.id]=Math.max(0,G.st[e.p.id]-dt*.25*(12*60/G.ql));if(dist(e,h)<3&&rnd()<dt*.3*(e.p.sk.stl/65))stealTry(e);return}}
  return _d(e,dt)}}
// post ups and give-and-go
{const _h=handlerAI;handlerAI=function(e,dt){const M=offMod(e.t),s=G.dir[e.t],hx=hoopX(s),d=Math.hypot(e.x-hx,e.y-25);
  if(feat('moves')&&e.pst>0){e.pst-=dt;seek(e,hx-s*3,25+(e.y-25)*.6,.38);if(e.pst<=0||d<6){e.pst=0;e.act={k:'shot',t:0};return shoot(e,gauss()*.04)}return}
  if(M.post&&feat('moves')){const big=onT(e.t).filter(x=>x!==e&&(x.p.pos=='C'||x.p.pos=='PF')).sort((a,c)=>c.p.sk.post-a.p.sk.post)[0];
   if(big&&e.p.pos!='C'&&e.p.pos!='PF'&&Math.hypot(big.x-hx,big.y-25)<11&&passRisk(e,big)<.3&&rnd()<dt*2.5){passTo(e,big);return}
   if((e.p.pos=='C'||e.p.pos=='PF')&&d<13&&d>5&&!(e.cd.pst>0)){e.cd.pst=6;e.pst=1+rnd()*1.3;return}}
  // a quick pump fake when a defender is right on him
  if(feat('moves')&&!(e.cd.fk>0)&&e.man&&dist(e.man,e)<3.2&&d>14&&d<26&&rnd()<dt*.12*IQ(e.t)){pumpFake(e);return}
  e.cd.fk=(e.cd.fk||0)-dt;if(e.cd.pst>0)e.cd.pst-=dt;return _h(e,dt)}}
{const _p=passTo;passTo=function(e,r,lob){const before=G.b.st;_p(e,r,lob);if(before=='held'&&G.b.st=='pass'&&offMod(e.t).give&&e!==G.ctl&&rnd()<.5){e.cut=1.5;e.cd.cut=2}}}
function pumpFake(e){if(!feat('moves')||G.b.st!='held'||G.b.h!==e||(e.cd.fk||0)>0)return;e.cd.fk=1.3;e.act={k:'fake',t:0};G.ev.push('fake');
 onT(opp(e.t)).forEach(d=>{if(dist(d,e)<4.8&&d.z<=0&&!(d===G.ctl&&G.ctlInput)&&rnd()<.6-(d.p.sk.hiq-50)/120){d.vz=8;d.z=.01;d.bite=.75;d.act={k:'jump',t:0}}})}
// shot adjustments: post moves, hot streaks, momentum
shotAdj=function(e,typ,info){let a=0;if(feat('moves')&&typ=='close'){const s=e.p.sk;a+=(s.post-(s.mid+s.lay)/2)*.004;const D=onT(opp(e.t)).sort((x,y)=>dist(x,e)-dist(y,e))[0];if(D&&dist(D,e)<4)a+=(s.str-D.p.sk.str)*.0015}
 if(feat('hot')&&G.hot){const h=G.hot[e.p.id]||0;a+=h>=4?.06:h>=3?.03:0}if(feat('mom')&&G.mom)a+=.015*(e.t===0?G.mom:-G.mom);return a};
// ---------- game state additions ----------
{const _n=newGame;newGame=function(...a){const g=_n.apply(this,a);g.calls=[{o:'motion',d:'man'},{o:'motion',d:'man'}];g.plan=[null,null];g.hot={};g.mom=0;g.run={k:-1,p:0};g.bc=0;g.fwait=0;g.ctl2=null;cpuCall(1);if(g.auto)cpuCall(0);return g}}
{const _sl=shotLand;shotLand=function(){const b=G.b,e=b.sh,k=e.t;const pre=G.sc.slice();_sl();
  if(feat('rules2')&&b.gt&&b.make)say('Goaltending!',1.4);
  if(b.make||G.sc[k]>pre[k]){const n=(G.hot[e.p.id]||0)+1;G.hot[e.p.id]=n;if(feat('hot')&&n==3)say(`${e.p.ln} is heating up!`,1.4);if(feat('hot')&&n==4)say(`${e.p.ln} is on fire!`,1.6);onScore(k,b.pts)}else G.hot[e.p.id]=0}}
{const _fr=ftResolve;ftResolve=function(){const f=G.ft,k=f.e.t,mk=f.last;_fr();if(mk)onScore(k,1)}}
function onScore(k,pts){if(G.run.k===k)G.run.p+=pts;else G.run={k,p:pts};G.mom=clamp(G.mom+(k===0?1:-1)*pts*.045,-1,1);if(feat('mom')&&G.run.p>=8&&Math.abs(G.mom)>.4)G.hype=Math.max(G.hype||0,1.5)}
// goaltending: a few late blocks are called goaltending (the basket counts)
{const _s=shoot;shoot=function(e,q){_s(e,q);const b=G.b;if(feat('rules2')&&b.st=='shot'&&b.sh===e&&b.blk&&b.typ!='rim'&&b.typ!='dunk'&&rnd()<.12){b.blk=null;b.make=true;b.gt=1}}}
// ---------- each frame ----------
{const _st=hStep;hStep=function(dt){_st(dt);if(!G||!G.live||G.phase!='live')return;const b=G.b;
  if(feat('mom'))G.mom*=1-dt*.012*(12*60/G.ql);
  // 8 seconds to get the ball over half court
  if(feat('rules2')&&b.st=='held'){const s=G.dir[b.h.t];if((b.h.x-47)*s<0)G.bc+=dt;else G.bc=0;if(G.bc>8){G.bc=0;turnover(b.h,'8-second violation');return}}else if(b.st!='pass')G.bc=0;
  // in-game injuries (rare)
  if(feat('inj2')&&feat('inj')&&rnd()<dt*10*5.2e-6*(12*60/G.ql)){const e=pick(G.ent);if(!e.hurt){e.hurt=1;e.p.inj=ri(2,9);say(`${e.p.ln} is hurt and heads to the locker room`,2.2);G.ev.push('whistle');if(e.p.tid===0||G.tm.includes(e.p.tid))addNews(`${e.p.n} (${R.t[e.p.tid].ab}) got hurt in a game and will miss about ${e.p.inj-1} games.`,e.p.tid===0)}}
  // the CPU fouls on purpose late when it is behind
  if(feat('late')&&G.q>=4&&b.st=='held'&&G.clk>.6){const k=opp(b.h.t),mg=G.sc[k]-G.sc[b.h.t];const cpu=k===1&&!G.ctl2||G.auto;
   if(cpu&&mg<0&&mg>=-8&&G.clk<=G.shot+1){G.fwait+=dt;if(G.fwait>1.1+rnd()*.6){G.fwait=0;const d=onT(k).sort((a,c)=>dist(a,b.h)-dist(c,b.h))[0];intFoul(d,b.h)}}else G.fwait=0}
  // the CPU calls a timeout to stop a run
  if(feat('tout')&&G.run.k===0&&G.run.p>=9&&G.to[1]>0&&!G.ctl2&&(b.st=='held'&&b.h.t===1||G.phase=='dead')&&rnd()<dt*2){callTO(1)}
}}
{const _cp=changePoss;changePoss=function(k){_cp(k);newPossCalls()}}{const _gb=giveBall;giveBall=function(...a){_gb.apply(this,a);newPossCalls()}}
function newPossCalls(){if(!G||!G.calls)return;if(rnd()<.4)cpuCall(1);if(G.auto&&rnd()<.4)cpuCall(0)}
function intFoul(d,h){if(!d||!h||G.phase!='live')return;foulOn(d,h);say(`${d.p.ln} fouls on purpose`,1.4);if(G.tf[d.t]>=5)return ftStart(h,2);deadBall(.8,()=>giveBall(h.t,'side',G.shot))}
// halftime plans (and injured players leave the game)
{const _sub=subs;subs=function(force){if(G)G.ent.forEach(e=>{if(e.hurt)e.fouledOut=1});return _sub(force)}}
{const _eq=endQuarter;endQuarter=function(){const q=G.q;_eq();if(q===2&&G.q===3&&feat('half')){G.plan[1]=halfCPU(1);if(G.auto||G.ctl2){G.plan[0]=halfCPU(0);return}if(typeof halfUI=='function'){G.paused=true;halfUI()}}}}
function halfCPU(k){const mg=G.sc[k]-G.sc[opp(k)],O=onT(k),D=onT(opp(k)),av=(L,f)=>L.reduce((a,e)=>a+f(e.p.sk),0)/L.length;if(rnd()>IQ(k))return pick(Object.keys(PLANS));
 if(mg<-10)return'pace';if(mg>12)return'slowp';if(av(D,s=>s.thr)>av(D,s=>s.lay)+4)return'arc';if(av(D,s=>s.lay)>av(D,s=>s.thr)+6)return'paint';if(av(O,s=>s.thr)>66)return'fly';return av(O,s=>s.lay)>66?'attack':'none'}
// ---------- timeouts ----------
function callTO(k){if(!feat('tout')||!G||G.to[k]<=0||G.phase=='over'||G.phase=='ft')return false;const b=G.b;if(G.phase=='live'&&!(b.st=='held'&&b.h.t===k))return false;
 G.to[k]--;const late=lateG(),kk=k;say(`Timeout, ${R.t[G.tm[k]].ab} (${G.to[k]} left)`,1.8);G.ev.push('whistle');G.run={k:-1,p:0};G.mom*=.4;
 G.ent.forEach(e=>{G.st[e.p.id]=Math.min(100,(G.st[e.p.id]||100)+12)});const s=G.dir[k],shot=G.shot;if(late)G.b.x=hoopX(s)-s*28;
 deadBall(1.4,()=>giveBall(kk,'side',Math.max(shot,late?14:shot)));if(k===0&&!G.auto&&typeof toUI=='function'){G.paused=true;toUI()}return true}
// ---------- keys ----------
{const _k=hKey;hKey=function(code,down){if(!G||!G.live)return _k(code,down);
  if(G.ctl2&&!G.paused&&p2Key(code,down))return;
  if(down&&!G.paused){if(code=='KeyC'){cycleCall('o',KEYS.ShiftLeft||KEYS.ShiftRight?-1:1);return}if(code=='KeyV'){cycleCall('d',KEYS.ShiftLeft||KEYS.ShiftRight?-1:1);return}if(code=='KeyX'){useCoach();return}
   if(code=='KeyT'){if(!callTO(0))say('You can call a timeout when you have the ball',1.2);return}
   if(code=='KeyG'&&G.poss===0&&G.ctl&&G.phase=='live'){pumpFake(G.ctl);return}
   if(code=='KeyF'&&G.poss===1&&feat('late')&&G.phase=='live'&&G.b.st=='held'&&G.ctl&&dist(G.ctl,G.b.h)<4.5){intFoul(G.ctl,G.b.h);return}}
  return _k(code,down)}}
// ---------- gamepad and touch ----------
let PADV=null,TOUCHV=null;
{const _mv=moveVec;moveVec=function(){if(PADV)return PADV;if(TOUCHV)return TOUCHV;if(G&&G.ctl2){let x=0,y=0;[['KeyW',0,-1],['KeyS',0,1],['KeyA',-1,0],['KeyD',1,0]].forEach(([c,a,b])=>{if(KEYS[c]){x+=a;y+=b}});const l=Math.hypot(x,y);return l?[x/l,y/l]:null}return _mv()}}
const PADMAP={0:'Space',2:'KeyE',3:'KeyQ',1:'KeyR',4:'KeyC',5:'KeyV',7:'ShiftLeft',6:'KeyG',9:'Escape',8:'KeyT',12:'KeyX',13:'KeyF',14:'Tab',15:'Tab'};let PADB={};
function padPoll(){PADV=null;if(!feat('pad')||!navigator.getGamepads)return;const gp=[...navigator.getGamepads()].find(g=>g&&g.connected);if(!gp)return;
 const ax=gp.axes[0]||0,ay=gp.axes[1]||0;if(Math.hypot(ax,ay)>.25){const l=Math.hypot(ax,ay);PADV=[ax/l,ay/l]}
 gp.buttons.forEach((bt,i)=>{const on=bt.pressed||bt.value>.5,code=PADMAP[i];if(!code||on===!!PADB[i])return;PADB[i]=on;if($('gamewrap').hidden)return;
  if(code=='Escape'){if(on){if(!$('modal').hidden){closeModal();if(G)G.paused=false}else if(G)gameMenu()}return}
  let c=code;if(G&&G.poss===1&&code=='KeyR')c='Tab';KEYS[c]=on?1:0;if(!$('modal').hidden){if(on&&c=='Space'&&G&&G.paused&&!$('modal').querySelector('.big'))return;return}hKey(c,on)})}
(function padLoop(){try{padPoll()}catch(e){}requestAnimationFrame(padLoop)})();
function touchSetup(){if($('tch'))return;const d=document.createElement('div');d.id='tch';d.innerHTML='<div id="tstk"><i></i></div><div id="tbtn"><button data-c="Space">Shoot<br><small>Jump</small></button><button data-c="KeyE">Pass<br><small>Steal</small></button><button data-c="KeyQ">Lob<br><small>Switch</small></button><button data-c="KeyR">Cross<br><small>&nbsp;</small></button><button data-c="ShiftLeft">Sprint</button><button data-c="KeyC">Play</button></div>';$('gamewrap').appendChild(d);
 const stk=$('tstk'),knob=stk.firstChild;let id=null,cx=0,cy=0;const mv=t=>{const dx=t.clientX-cx,dy=t.clientY-cy,l=Math.hypot(dx,dy),m=Math.min(l,45);knob.style.transform=`translate(${l?dx/l*m:0}px,${l?dy/l*m:0}px)`;TOUCHV=l>10?[dx/l,dy/l]:null};
 stk.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0],r=stk.getBoundingClientRect();id=t.identifier;cx=r.left+r.width/2;cy=r.top+r.height/2;mv(t)},{passive:false});
 stk.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===id)mv(t)},{passive:false});
 const end=e=>{for(const t of e.changedTouches)if(t.identifier===id){id=null;TOUCHV=null;knob.style.transform=''}};stk.addEventListener('touchend',end);stk.addEventListener('touchcancel',end);
 d.querySelectorAll('#tbtn button').forEach(b=>{const c=b.dataset.c;const code=()=>G&&G.poss===1&&(c=='KeyR'||c=='KeyQ')?'Tab':c;
  b.addEventListener('touchstart',e=>{e.preventDefault();const k=code();KEYS[k]=1;hKey(k,true)},{passive:false});b.addEventListener('touchend',e=>{e.preventDefault();const k=code();KEYS[k]=0;hKey(k,false)},{passive:false})})}
function touchShow(){const on=feat('touch')&&('ontouchstart' in window||navigator.maxTouchPoints>0);if(on)touchSetup();const t=$('tch');if(t)t.hidden=!on;HIDEHELP=on}
{const _pg=playGame;playGame=function(...a){const r=_pg.apply(this,a);try{touchShow();if(G&&feat('p2')&&!G.auto){G.ctl2=onT(1)[0];if(G.b.st=='held'&&G.b.h.t===1)G.ctl2=G.b.h}}catch(e){}return r}}
// ---------- 2-player couch mode ----------
const P2DIR={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
function p2Vec(){let x=0,y=0;for(const k in P2DIR)if(KEYS[k]){x+=P2DIR[k][0];y+=P2DIR[k][1]}const l=Math.hypot(x,y);return l?[x/l,y/l]:null}
userControls2=function(e,dt){const mv=p2Vec(),b=G.b;if(G.meter2&&G.meter2.e===e){e.tx=e.vx*.2;e.ty=e.vy*.2;return true}const off=G.poss===1;
 if(!mv){if(off&&b.st=='held'&&b.h===e){e.tx=0;e.ty=0;return true}return false}const v=topSpd(e);e.tx=mv[0]*v;e.ty=mv[1]*v;return true};
{const _sc=setCtl;setCtl=function(){_sc();if(G&&G.ctl2){const b=G.b;if(G.poss===1&&b.st=='held'&&b.h.t===1)G.ctl2=b.h;else if(G.ctl2.t!==1||!G.ent.includes(G.ctl2))G.ctl2=onT(1)[0]}}}
function p2Key(code,down){if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Slash','Period','Comma','Semicolon'].includes(code))return false;const e=G.ctl2;if(!e||G.phase!='live')return true;const b=G.b,off=G.poss===1;
 if(code=='Slash'){if(off&&b.st=='held'&&b.h===e){if(down){const info=shotInfo(e,e.x,e.y);if(info.d<6){e.act={k:'lay',t:0};shoot(e,0)}else G.meter2={e,t:0}}else if(G.meter2){const v=G.meter2.t/MT,dv=Math.abs(v-.93),w=meterWin(e.p,shotInfo(e,e.x,e.y).three?'thr':'mid');G.meter2=null;shoot(e,dv<w?.09:dv<w*2.2?.03:-Math.min(.28,(dv-w*2.2)*.9))}}else if(!off&&down&&e.z<=0){e.vz=8.5+e.p.sk.vert*.05;e.z=.01}return true}
 if(!down)return true;
 if(code=='Period'){if(off&&b.st=='held'&&b.h===e){const r=onT(1).filter(x=>x!==e).sort((a,c)=>openness(c)-openness(a))[0];if(r)passTo(e,r)}else if(!off)stealTry(e)}
 else if(code=='Comma'){if(off&&b.st=='held'&&b.h===e){const hx=hoopX(G.dir[1]);const r=onT(1).filter(x=>x!==e).sort((a,c)=>Math.hypot(a.x-hx,a.y-25)-Math.hypot(c.x-hx,c.y-25))[0];if(r)passTo(e,r,true)}else if(!off){const t=b.st=='held'?b.h:b;G.ctl2=onT(1).sort((a,c)=>dist(a,t)-dist(c,t))[0]}}
 else if(code=='Semicolon'&&off&&b.h===e&&!(e.cd.cr>0)){e.cd.cr=1.4;e.act={k:'cross',t:0};const d=e.man;if(d&&dist(d,e)<5&&rnd()<clamp(.32+(e.p.sk.han-d.p.sk.pd)/90,.08,.7)){d.bite=.6;d.stun=.6;say('Crossed him up!',1)}}
 return true}
{const _ms=meterStep;meterStep=function(dt){_ms(dt);if(G&&G.meter2){G.meter2.t+=dt;if(G.b.st!='held'||G.b.h!==G.meter2.e)G.meter2=null;else if(G.meter2.t>MT*1.3){G.meter2=null;shoot(G.ctl2,-.25)}}}}
// in 2-player mode the arrows belong to player 2
{const _uc=userControls;userControls=function(e,dt){if(!G.ctl2)return _uc(e,dt);const save={};['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach(k=>{save[k]=KEYS[k];KEYS[k]=0});const r=_uc(e,dt);Object.assign(KEYS,save);return r}}
// ---------- screens: halftime, timeouts, the playbook, and what the HUD shows ----------
function callsHTML(){if(!feat('plays')||!G)return'';const c=G.calls[0],sg=feat('coach')?coachSug(0):null;
 return`<h3>Playbook</h3><div class="cols"><div><b>Offense</b>${OKEYS.map(k=>`<label class="ft"><input type="radio" name="po" ${c.o==k?'checked':''} onchange="G.calls[0].o='${k}'"><span><b>${OSETS[k].n}</b><small>${OSETS[k].d}</small></span></label>`).join('')}</div>
 <div><b>Defense</b>${DKEYS.map(k=>`<label class="ft"><input type="radio" name="pd" ${c.d==k?'checked':''} onchange="G.calls[0].d='${k}'"><span><b>${DSETS[k].n}</b><small>${DSETS[k].d}</small></span></label>`).join('')}</div></div>
 ${sg?`<div class="card hot"><b>Coach suggests:</b> ${OSETS[sg.o].n} and ${DSETS[sg.d].n}. <small>${esc(sg.why.join('; '))}.</small> ${B("useCoach();playbookUI()",'Use it','xs')}</div>`:''}`}
function playbookUI(){if(!G)return;G.paused=true;modal(callsHTML()+B("closeModal();G.paused=false",'Back to the game','big'))}
function toUI(){modal(`<h2>Timeout</h2><p>${esc(R.t[G.tm[0]].ab)} ${G.sc[0]} - ${G.sc[1]} ${esc(R.t[G.tm[1]].ab)} · ${G.to[0]} timeouts left. Your players got a breather.</p>${callsHTML()}<div class="row">${B("closeModal();G.paused=false",'Back to the game','big')}${B("subUI()",'Substitutions')}</div>`)}
function halfUI(){const r=gameResult(),me=r.a===0?0:1;const top=k=>r.res.T[k].ps.map((p,i)=>[p,r.res.T[k].box[i]]).sort((a,b)=>b[1][SI.pts]-a[1][SI.pts]).slice(0,3).map(([p,b])=>`${esc(p.ln)} ${b[SI.pts]} pts, ${b[SI.orb]+b[SI.drb]} reb, ${b[SI.ast]} ast`).join('<br>');
 const tt=k=>{const s=r.res.T[k].box.reduce((a,b)=>b.map((v,i)=>v+(a[i]||0)),[]);return`FG ${s[SI.fgm]}-${s[SI.fga]} · 3PT ${s[SI.tpm]}-${s[SI.tpa]} · FT ${s[SI.ftm]}-${s[SI.fta]} · REB ${s[SI.orb]+s[SI.drb]} · TO ${s[SI.tov]}`};
 modal(`<h2>Halftime: ${esc(R.t[G.tm[0]].ab)} ${G.sc[0]} - ${G.sc[1]} ${esc(R.t[G.tm[1]].ab)}</h2><div class="cols"><div class="card"><h3>${esc(R.t[r.a].n)}</h3><p class="small">${tt(0)}</p><p>${top(0)}</p></div><div class="card"><h3>${esc(R.t[r.b].n)}</h3><p class="small">${tt(1)}</p><p>${top(1)}</p></div></div>
 <h3>Second-half plan</h3><div class="row">${Object.keys(PLANS).map(k=>B(`G.plan[0]='${k}';closeModal();G.paused=false`,`${PLANS[k][0]}<br><small>${PLANS[k][1]}</small>`)).join('')}</div>${feat('plays')?B('playbookUI()','Playbook'):''}`);$('modal').onclick=null}
{const _gm=gameMenu;gameMenu=function(){_gm();try{if(feat('plays')){const r=$('modal').querySelector('.row');if(r)r.insertAdjacentHTML('beforeend',B('playbookUI()','Playbook'))}if(feat('tout')&&G.to[0]>0&&G.b.st=='held'&&G.b.h.t===0){const r=$('modal').querySelector('.row');if(r)r.insertAdjacentHTML('beforeend',B('closeModal();G.paused=false;callTO(0)',`Timeout (${G.to[0]} left)`))}}catch(e){}}}
{const _dh=drawHUD;drawHUD=function(){_dh();if(!G||G.auto)return;try{const cx=VW/2;CX.textAlign='center';CX.textBaseline='middle';
  if(feat('mom')){const w=240,x=cx-w/2,y=62;CX.fillStyle='rgba(15,23,42,.7)';CX.fillRect(x,y,w,5);const m=G.mom;CX.fillStyle=m>=0?R.t[G.tm[0]].col[0]:R.t[G.tm[1]].col[0];if(m>=0)CX.fillRect(cx,y,w/2*m,5);else CX.fillRect(cx+w/2*m,y,-w/2*m,5);CX.fillStyle='#fff';CX.fillRect(cx-1,y-1,2,7)}
  if(feat('tout')){[0,1].forEach(k=>{const x=k===(G.tm[0]===G.home?1:0)?cx+70:cx-240;for(let i=0;i<4;i++){CX.fillStyle=i<G.to[k]?'#fde047':'rgba(255,255,255,.2)';CX.fillRect(x+150+i*9,52,6,3)}})}
  if(feat('plays')&&G.calls&&!G.paused){const c=G.calls[0],sg=feat('coach')&&(G.sgT=(G.sgT||0)+1)?(G.sgC&&G.sgT%120?G.sgC:(G.sgC=coachSug(0))):null;
   const car=typeof CAREER=='function'&&CAREER();const t=car?`Coach's call: ${OSETS[c.o].n} / ${DSETS[c.d].n}`:`Offense: ${OSETS[c.o].n} (C) · Defense: ${DSETS[c.d].n} (V)`+(sg?` · Coach: ${OSETS[sg.o].n} / ${DSETS[sg.d].n} (X)`:'');CX.font='600 12px system-ui';const w=CX.measureText(t).width+20;CX.fillStyle='rgba(15,23,42,.75)';CX.fillRect(cx-w/2,VH-64,w,20);CX.fillStyle='#e2e8f0';CX.fillText(t,cx,VH-54)}
  if(G.ctl2&&!G.paused){CX.font='600 12px system-ui';CX.fillStyle='rgba(226,232,240,.75)';CX.textAlign='left';CX.fillText('Player 2: arrows · / shoot or jump · . pass or steal · , lob or switch · ; crossover',12,VH-56)}}catch(e){}}}
{const _dp=drawPlayer;drawPlayer=function(e){_dp(e);try{if(e===G.ctl2){const [gx,gy]=P(e.x,e.y,0),w=S*1.25;CX.strokeStyle='#38bdf8';CX.lineWidth=2.5;CX.beginPath();CX.ellipse(gx,gy,w*1.05,w*.42,0,0,Math.PI*2);CX.stroke()}
  if(feat('hot')&&G.hot&&(G.hot[e.p.id]||0)>=3){const [gx,gy]=P(e.x,e.y,e.z),h=ftOf(e.p)*S*HZ;CX.font=`${Math.round(S*1.3)}px system-ui`;CX.textAlign='center';CX.fillText(G.hot[e.p.id]>=4?'🔥':'♨',gx+S*1.2,gy-h*.9)}}catch(x){}}}
{const _kh=keysHTML;keysHTML=function(){const r=(a,b)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`;return _kh()+`<table class="t"><tr><th colspan="2">More</th></tr>${r('Change your offense / defense','C / V (Shift goes back)')}${r('Use the coach\'s suggestion','X')}${r('Timeout','T')}${r('Pump fake','G')}${r('Foul on purpose (defense, late)','F')}${r('Gamepad','A shoot · X pass · Y lob · B crossover/switch · LB/RB plays · RT sprint · LT pump fake · Start menu')}</table>`}}
