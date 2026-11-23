'use strict';
// Street football: a 3-on-3 pickup game on the real field with the real game engine (running, moves, tackling,
// slingshot throwing, catching, coverage), built the same way as the training drills (train.js). Both teams attack
// the same end zone. You are the QB on offense (any position can play it in the street) and you cover a receiver on
// defense. The rusher counts to 3 before he can come. Four possessions each, touchdowns only, 4 downs to score with
// one first down at midfield. Load after train.js and street.js.
const SF_RT=['slant','out','go','curl','post','in'];
const SF_START=70,SF_GOAL=110,SF_COUNT=2.6;        // where each possession starts, the goal line, the rusher's count (seconds)
let SF_TGT=null;                                     // the training drill whose slot street football borrows while it runs
// the training drills' slingshot throwing only works for the 'tgt' drill, so street football borrows that slot while it runs
const SFDEF={n:'Pickup football',reps:1,d:'',st:[],
 get keys(){const D=G&&G.drill;if(!D)return'';const b=P.b,u=D.poss=='U';
  if(u&&b.st=='qb')return'Pull back on the field to throw · WASD scramble · Space pump fake';if(b.st=='carry'&&b.c===D.me)return'WASD run · ↑ ↓ juke · → truck · ← spin · F stiff arm';
  if(!u)return'WASD move · E intercept · R swat · F or → hit stick';return'Watch the ball'},
 init(){},
 rep(D){if(D.over)return sfFinish(D);if(D.newPoss)sfPoss(D);const L=D.los,u=D.poss=='U';P.L=L;G.ytg=Math.max(1,Math.round(D.fd-L));G.down=D.down;G.poss=u?'U':'C';
  trPlace(D.q,L-4,26.5,0);D.w.forEach((w,i)=>{const y0=i?35:18,s=i?-1:1;trPlace(w,L-.5,y0,0);w.route=trRoute(SF_RT[rnd()*SF_RT.length|0],L,y0,s);w.ri=0});
  D.c.forEach((c,i)=>trPlace(c,L+3+rnd()*2,D.w[i].y+(i?-.8:.8),Math.PI));trPlace(D.r,L+7,26.5,Math.PI);
  D.me=D.me0;if(!u)cd=D.me;D.tw=D.tw0=null;D.pt=0;D.tt=1.7+rnd()*1.6;D.cd=1.3;
  [D.q,...D.w,D.r,...D.c].forEach(p=>{p.hawk=p.swat=p.hs=p.hk=p.swk=p.hcool=0;p.cool=0});
  P.b={st:'qb',x:D.q.x,y:D.q.y};P.aim=null;P.look=null;P.run=0;P.scr=0;P.pump=0;P.t=2;
  D.big=`${nth(D.down)} & ${D.fd>=SF_GOAL?'goal':Math.round(D.fd-L)}`;D.msg=u?'Your ball. Pull back on the field to throw; the rusher counts to 3.':'Their ball. Stay with your man (yellow ring is you).'},
 tick(D,dt){const b=P.b,u=D.poss=='U',q=D.q,me=D.me,rs=D.r;D.pt+=dt;
  D.cx=b.st=='air'?b.x:b.st=='carry'&&b.c?b.c.x+4:D.los+6;
  D.info=`You ${D.sc[0]} – ${D.sc[1]} ${D.crew.n} · ${u?'your ball':'their ball'} · possession ${Math.min(D.N/2,Math.floor(D.np/2)+1)} of ${D.N/2}${b.st=='qb'&&D.pt<SF_COUNT?` · rush in ${Math.ceil(SF_COUNT-D.pt)}`:''}`;
  if(!u&&me.park!==1)trRun(D,dt,me.hs>0?1.4:1.05);
  // receivers run their routes (the target runs to the ball)
  if(b.st!='carry')D.w.forEach(w=>{if(b.st=='air'&&w===D.tw)mv(w,b.tx,b.ty,w.spd*.95,dt);else trFollow(w,dt,.92)});
  // the CPU defenders (and your teammates on defense)
  D.c.forEach((c,i)=>{if(c===me||c.fall)return;if(b.st=='carry')sfChase(c,dt);else if(b.st=='air'&&D.tw===D.w[i])mv(c,b.tx,b.ty,c.spd*.93,dt);else sfCover(c,D.w[i],dt)});
  if(rs!==me&&!rs.fall){if(b.st=='qb')D.pt>SF_COUNT?mv(rs,q.x,q.y,rs.spd*.9,dt):mv(rs,rs.x,rs.y,0,dt);else if(b.st=='carry')sfChase(rs,dt);else mv(rs,rs.x,rs.y,0,dt)}
  if(D.pt>16)return sfPlayEnd(D,'time',b.st=='carry'&&b.c?b.c.x:null);
  if(b.st=='qb'){if(!rs.fall&&dist(rs,q)<1.3&&D.pt>SF_COUNT){ragTackle(rs,q);P.aim=null;return sfPlayEnd(D,'sack',q.x)}
   if(u){trRun(D,dt,.95);if(P.aim){const t=aimT();face(q,Math.atan2(t[1]-q.y,t[0]-q.x),4,dt)}else if(!inp()[2])face(q,0,3,dt);
    if(q.x>D.los+.6){P.b={st:'carry',c:q,x:q.x,y:q.y};P.aim=null;D.msg='QB keeper! Run!'}if(q.y<12||q.y>41){P.aim=null;return sfPlayEnd(D,'out',q.x)}}
   else{q.vx=q.vy=0;face(q,P.look?Math.atan2(P.look.y-q.y,P.look.x-q.x):0,4,dt);const press=!rs.fall&&D.pt>SF_COUNT&&dist(rs,q)<3;
    if(D.pt>D.tt-.5&&!D.tw0){D.tw0=sfPick(D);P.look={x:D.tw0.x,y:D.tw0.y}}if(D.tw0&&P.look){P.look.x=D.tw0.x;P.look.y=D.tw0.y}
    if(D.pt>=D.tt||press){const w=D.tw0||sfPick(D),dd=dist(q,w),T=dd/thr(q,dd);P.look=null;D.tw=w;throwAt(w.x+w.vx*T,w.y+w.vy*T)}}
   return}
  if(b.st=='air'){if(!D.tw)D.tw=b.tgt&&D.w.includes(b.tgt)?b.tgt:D.w.reduce((a,w)=>Math.hypot(w.x-b.tx,w.y-b.ty)<Math.hypot(a.x-b.tx,a.y-b.ty)?w:a);
   b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;if(k<1)return;
   const l={x:b.tx,y:b.ty};
   if(!u){const m=dist(me,l),bs=fs(me,'bsk');if(me.hawk>0&&m<2.6&&rnd()<clamp(.4+(bs-60)/90+(2.6-m)*.12,.08,.85))return sfPlayEnd(D,'int');
    if(me.swat>0&&m<2.9&&rnd()<clamp(.55+(bs-60)/100,.3,.9)){b.st='dead';return sfPlayEnd(D,'swat')}}
   const nd=D.c.filter(c=>c!==me&&!c.fall).reduce((a,c)=>!a||dist(c,l)<dist(a,l)?c:a,null);
   if(nd&&dist(nd,l)<1.4&&rnd()<clamp(.14+(nd.o-60)/250,.05,.3))return sfPlayEnd(D,'int');
   if(l.y<12||l.y>41){b.st='dead';return sfPlayEnd(D,'inc')}
   const w=D.w.reduce((a,x)=>dist(x,l)<dist(a,l)?x:a),rd=dist(w,l);
   if(rd<2.4){const md=Math.min(...D.c.filter(c=>!c.fall).map(c=>dist(c,l)),9),cc=clamp(.86-clamp(1-md/3,0,1)*.55+(fs(w,'cth')-60)/200-Math.max(0,rd-1.2)*.15,.1,.96);
    if(rnd()<cc){P.b={st:'carry',c:w,x:w.x,y:w.y};w.route=[];w.an={k:'catch',t:0,d:.35};if(u){D.me=w;D.msg='Caught! Now you have him: run (arrows for moves).'}else D.msg='Caught. Bring him down!';return}}
   b.st='dead';return sfPlayEnd(D,'inc')}
  if(b.st=='carry'){const c=b.c;if(!c)return;
   if(c===me)trRun(D,dt,.95*(c.jk>0?1.15:1));
   else{const ds=D.c.concat([rs]).filter(p=>!p.fall),nd=ds.reduce((a,p)=>!a||dist(p,c)<dist(a,c)?p:a,null);let ty=c.y;if(nd&&dist(nd,c)<6)ty=c.y+(c.y>=nd.y?1:-1)*4;
    if(c.bite>0){c.vx=c.vy=0}else mv(c,c.x+5,clamp(ty,14,39),c.spd*.95,dt);if(!u&&dist(c,me)<3.6&&!(c.mc>0)&&!(c.jc>0)&&rnd()<dt*3)aiMove(c,me,typeof IQ=='function'?IQ():.6)}
   // the other offensive players jog downfield
   [q,...D.w].forEach(o=>{if(o!==c&&!o.fall)mv(o,c.x-3,o.y,o.spd*.5,dt)});
   for(const p of D.c.concat([rs])){if(p===c||p.fall)continue;
    if(p===me){if(me.cool<=0&&dist(me,c)<(me.hs>0?1.8:1.3)){me.cool=.3;let pr=clamp(.55+(TK(me)-BT(c))/160,.25,.95);if(c.jk>0)pr*=me.hs>0?.5:.25;if(me.hs>0)pr=Math.min(.97,pr+.3);pr*=tackleMod(me,c);
      if(rnd()<pr){ragTackle(me,c);return sfPlayEnd(D,'tackle',c.x)}brokeTackle(me,c);if(me.hs>0){me.stun=.6;D.msg='Whiffed the big hit!'}else D.msg='He broke your tackle!'}}
    else if(p.cool<=0&&!(p.bite>0)&&dist(p,c)<1.3){p.cool=.3;let pr=clamp(.42+(TK(p)-BT(c))/160,.18,.75);if(c.jk>0)pr*=.25;pr*=tackleMod(p,c);
     if(rnd()<pr){ragTackle(p,c);return sfPlayEnd(D,'tackle',c.x)}brokeTackle(p,c);p.cool=Math.max(p.cool,.9);if(c===me)D.msg='Broke the tackle!'}}
   if(c.x>=SF_GOAL)return sfPlayEnd(D,'td');if(c.y<12||c.y>41)return sfPlayEnd(D,'out',c.x)}}};
// ---------- the players ----------
function sfCover(c,w,dt){const k=clamp(.84+(c.o-60)/250,.72,.98);mv(c,w.x+w.vx*.25+1.2,w.y+w.vy*.25,c.spd*k,dt);face(c,Math.atan2(w.y-c.y,w.x-c.x),5,dt)}
function sfChase(p,dt){const c=P.b.c;if(!c)return;const dc=dist(p,c),lt=Math.min(.6,dc/(p.spd*2));if(p.bite>0){p.vx=p.vy=0;return}mv(p,dc<3?c.x:c.x+c.vx*lt,dc<3?c.y:c.y+c.vy*lt,p.spd*.88,dt)}
// the CPU QB picks the most open receiver (a smarter CPU, on a higher difficulty, picks well more often)
function sfPick(D){const open=w=>Math.min(...D.c.filter(c=>!c.fall).map(c=>dist(c,w)),9)+(w.x-D.los)*.05;const iq=typeof IQ=='function'?IQ():.6;
 return rnd()<.35+.55*iq?D.w.reduce((a,w)=>open(w)>open(a)?w:a):D.w[rnd()*2|0]}
// a new possession: rebuild the teams (yours in your colors, theirs in practice jerseys)
function sfPoss(D){const p=meRow(),u=D.poss=='U';G.poss=u?'U':'C';G.los=D.los;G.dir=1;
 const _lu=lineup;lineup=function(t,...a){const r=_lu(t,...a);try{if(!t&&r&&r.O&&r.D){r.O=r.O.slice();r.D=r.D.slice();r.O[0]=p;r.D[7]=p}}catch(e){}return r};
 try{setup()}finally{lineup=_lu}
 const O=P.off,Df=P.def;D.q=O[0];D.w=[O[1],O[2]];D.r=Df[4];D.c=[Df[7],Df[8]];D.me0=u?D.q:D.c[0];D.me=D.me0;const keep=[D.q,...D.w,D.r,...D.c];
 keep.forEach(q=>{q.stm=100;q.route=[];q.ri=0;q.park=0;q.rush=0;if(q===D.me0){q.pid=p.id;q.rp=p;q.spd=1.15*(5.6+(q.sk?q.sk.spd:60)*.03);return}
  const rr=D.crew.r+(rnd()-.5)*6;q.pid=-1;q.rp=null;q.o=rr;q.sk={spd:clamp(rr+(rnd()-.5)*10,40,92),str:rr,awr:rr,skl:rr};q.spd=1.15*(5.6+q.sk.spd*.03)});
 D.r.rush=1;trPark(keep);clearRags();P.b={st:'dead',x:-50,y:26.5};P.aim=null;P.look=null;P.t=0;P.run=0;P.scr=0;P.pump=0;if(!u)cd=D.me;D.newPoss=0}
// ---------- a play ends: downs, scores, turnovers, and is the game over? ----------
function sfPlayEnd(D,res,spot){const u=D.poss=='U';let msg='',turn=0;P.aim=null;P.look=null;
 if(res=='td'){D.sc[u?0:1]++;turn=1;msg=u?'TOUCHDOWN!':'They scored.';if(D.me&&P.b.c===D.me)D.st8.td++}
 else if(res=='int'){turn=1;msg=u?'Intercepted! Their ball.':'INTERCEPTION! Your ball.';if(!u)D.st8.int++}
 else{if(spot!=null)D.los=clamp(spot,D.start-12,SF_GOAL-1);msg={inc:'Incomplete.',swat:'Swatted away!',tackle:'Tackled.',out:'Out of bounds.',sack:u?'Sacked!':'SACK!',time:'Play over.'}[res]||'';
  if(res=='sack'&&!u)D.st8.sk++;if(res=='swat')D.st8.pd++;
  if(D.los>=D.fd){D.fd=Math.min(SF_GOAL,D.fd+20);D.down=1;msg+=' First down!'}else if(++D.down>4){turn=1;msg+=u?' Turnover on downs.':' Stopped on downs!'}}
 if(turn){D.np++;D.poss=u?'C':'U';D.los=D.start;D.down=1;D.fd=D.start+20;D.newPoss=1}
 // over? each team gets N/2 possessions (you first); tied after that, one more each, twice at most
 const uRem=D.N/2-Math.ceil(D.np/2),cRem=D.N/2-Math.floor(D.np/2);
 if(D.sc[0]>D.sc[1]+cRem||D.sc[1]>D.sc[0]+uRem)D.over=1;else if(D.np>=D.N){if(D.sc[0]==D.sc[1]&&D.N<12){D.N+=2;msg+=' Tied: one more possession each!'}else D.over=1}
 trRep(D,msg,0,turn?2.4:1.6);D.big=res=='td'?'TOUCHDOWN':res=='int'?'PICKED OFF':res=='sack'?'SACK':'';if(D.over)D.big='GAME OVER'}
// ---------- start, quit, finish ----------
function sfStart(crew){const p=meRow();if(!p)return;try{dsSync(p);newGame({n:crew.n,r:crew.r,i:0});
 Object.assign(G,{live:0,q:1,clk:900,run:false,ch:null,two:0,ot:0,poss:'U',dir:1,los:SF_START,down:1,ytg:20,phase:'pre',next:'same',sc:[0,0],wx:'clear',wind:{x:0,y:0,m:0},night:false,prac:null,tut:null,chal:null});
 const D={k:'tgt',street:1,crew,st:'cd',t:0,cd:1.5,rep:0,reps:1e9,score:0,log:[],msg:'',big:'',info:'',cx:80,cones:[],sc:[0,0],poss:'U',np:0,N:8,los:SF_START,start:SF_START,down:1,fd:SF_START+20,newPoss:1,st8:{td:0,int:0,sk:0,pd:0}};
 for(let x=60;x<=110;x+=10)D.cones.push([x,12],[x,41]);
 if(TRD.tgt!==SFDEF){SF_TGT=TRD.tgt;TRD.tgt=SFDEF}G.drill=D;SFDEF.rep(D);
 G.phase='play';G.msg='';$('modal').hidden=1;document.body.classList.add('trn');trHud(1)}
 catch(e){console.error(e);sfRestore();try{trEnd()}catch(x){}SGNOW=null;hoodUI();if(HD)hdPanel('street','🏈 Pickup football',`<p>The game could not start: ${esc(e&&e.message||e)}</p>`)}}
function sfRestore(){if(SF_TGT&&TRD.tgt===SFDEF)TRD.tgt=SF_TGT}
function sfQuit(D){if(!confirm('Quit this pickup game? It counts as a loss.'))return;sfFinish(D,1)}
function sfFinish(D,forfeit){const c=D.crew,us=D.sc[0],them=D.sc[1],s=D.st8;sfRestore();try{trEnd()}catch(e){console.error(e)}D.over=1;
 const lines=[s.td?`Your touchdowns running the ball: ${s.td}.`:'',s.int?`Interceptions: ${s.int}.`:'',s.pd?`Passes swatted: ${s.pd}.`:''].filter(Boolean);hdStreetDone(c,us,them,forfeit,lines)}
// the drill system ending for any reason puts the borrowed slot back
{const _te=trEnd;trEnd=function(...a){const r=_te.apply(this,a);try{sfRestore()}catch(e){}return r}}
// ---------- keys, mouse and the yellow ring ----------
{const _h=hit;hit=function(k,...a){const D=G&&G.drill;if(!D||!D.street)return _h(k,...a);if(!$('modal').hidden)return;if(k=='escape')return sfQuit(D);if(D.st!='go')return;
 if(k=='t'||k=='dshu'||k=='dshd'||k=='dbp')return _h(k,...a);const u=D.poss=='U',b=P.b,me=D.me;
 if(u&&b.st=='qb'&&me===D.q){if(k==' ')return pump();if(k=='q'||k=='e')return juke(me,k=='q'?-1:1);return}
 if(b.st=='carry'&&b.c===me)return trCarryKey(D,k);
 if(!u){if(k=='e'&&!(me.hk>0)){me.hawk=.5;me.hk=1.2;D.msg=b.st=='air'?'Hands up!':'Time it as the ball arrives'}if(k=='r'&&!(me.swk>0)){me.swat=.45;me.swk=1;D.msg='Swat!'}if(k=='f'&&!(me.hcool>0)){me.hs=.35;me.hcool=1.4;D.msg='Hit stick!'}}}}
{const _kc=kbCtx;kbCtx=function(){const D=G&&G.drill;if(!D||!D.street)return _kc();if(!$('modal').hidden||D.st!='go')return null;const b=P.b,u=D.poss=='U';
 if(u&&b.st=='qb'&&D.me===D.q)return'qb';if(b.st=='carry'&&b.c===D.me)return'car';return u?null:'def'}}
// any career position can throw in the street (the game itself only lets a career QB aim)
C.addEventListener('pointerdown',e=>{try{const D=G&&G.drill;if(!D||!D.street||D.st!='go'||P.aim||!$('modal').hidden)return;if(D.poss=='U'&&P.b.st=='qb'&&D.me===D.q&&!P.scr&&!P.run){P.aim={a:wp(e),c:wp(e)};try{C.setPointerCapture(e.pointerId)}catch(x){}}}catch(x){}});
{const _df=drawField;drawField=function(...a){const r=_df.apply(this,a);try{const D=G&&G.drill;if(D&&D.street&&D.me&&!D.me.park){gring(D.me.x,D.me.y,1.25,'#ffd84d',3);gline&&(X.lineWidth=3,X.strokeStyle='#ffffff66',gline(SF_GOAL,12,SF_GOAL,41))}}catch(e){}return r}}
