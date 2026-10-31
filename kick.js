'use strict';
// Special teams you actually play. Punts, field goals and extra points line up in a real formation, you stop a power
// meter and an accuracy needle, and the ball flies over the field (a behind-the-kicker camera shows field goals).
// Punts can be returned, fair-caught, downed or kicked out of bounds. Also onside kicks, fake punts and fake field goals,
// and the fix for returns (no QB standing around, no line of scrimmage or first-down line).
// ---------- returns: hide the QB (he's not on the return team) ----------
{const _kr=krSetup;krSetup=function(lx,d,kind){_kr(lx,d,kind);const q=P.off[0];q.gone=1;q.x=q.sx=-40;q.y=q.sy=-40;q.vx=q.vy=0;if(typeof xRecStart=='function')xRecStart()}}
// ---------- kicking ----------
const kFac=s=>1.3-(s.skl-50)/100;                       // how much a kicker's miss drifts (better kickers drift less)
const kWx=()=>!feat('weather')||!G.wx?1:G.wx=='snow'?.92:G.wx=='rain'?.95:1;
const kMaxC=s=>(58+(s.str-60)*.5)*kWx();                 // carry at full power, in yards
const kWind=()=>feat('weather')&&G.wind?G.wind:{x:0,y:0,m:0};
function kNeed(kk){const s=kk.k.sk,c=kk.fd/Math.max(.05,1-3.78/kk.fd);return(c/kMaxC(s)-.45)/.55}
function kGreen(kk){if(kk.kind=='punt')return[.35,.7];const m=Math.min(1,3.08/(kk.fd*.11*kFac(kk.k.sk)));return[m*.6,m]}
const kAccW=kk=>3.5-(kk.k.sk.skl-60)*.03+(feat('weather')&&G.wx!='clear'?.35:0);
function kUser(){return G.poss=='U'&&!CAR()}
function kForm(kind){const d=G.dir,L=P.L,O=P.off,D=P.def,lu=lineup(G.poss=='U'?0:G.opp.i);
 P.run=0;P.scr=0;P.aim=null;P.look=null;P.sd=0;
 O.forEach(p=>{p.route=[];p.mo=null;p.eng=null;p.tg=null;p.vx=p.vy=0;p.fa=d>0?0:Math.PI;p.stun=0});
 D.forEach(p=>{p.eng=null;p.rush=false;p.cover=null;p.zone=null;p.vx=p.vy=0;p.fa=d>0?Math.PI:0;p.bite=0;p.stun=0});
 const put=(p,dx,y)=>{p.x=p.sx=L+d*dx;p.y=p.sy=y},as=(p,pl,pos)=>{if(pl){p.pid=pl.id;p.sk=pl.sk;p.o=ovr(pl)}p.pos=pos};
 [6,7,8,9,10].forEach((i,k)=>put(O[i],-.6,22.2+k*2.15));
 if(kind=='punt'){as(O[0],lu.P,'P');put(O[0],-14,26.5);put(O[4],-6,24.4);put(O[5],-6,28.6);put(O[1],-1,4.5);put(O[3],-1,48.8);put(O[2],-1,19.6);
  D.forEach((p,i)=>{if(i<7)put(p,1.2,20+i*2.2)});put(D[7],1.8,5.6);put(D[8],1.8,47.7);put(D[9],40,26.5);put(D[10],22,30)}
 else{as(O[5],lu.K,'K');O[0].pos='H';put(O[0],-7,26.5);put(O[5],-9.6,23.8);put(O[4],-1,19.6);put(O[1],-1.3,17.6);put(O[2],-1,33.4);put(O[3],-1.3,35.4);
  D.forEach((p,i)=>put(p,1.1,16.5+i*2));put(D[9],6,22);put(D[10],6,31)}}
function kickStart(kind){
 if(kind=='xp'){const d=G.dir;G.los=(d>0?110:10)-d*15;G.down=1;G.ytg=10;G.two=0;setup()}
 const d=G.dir,lu=lineup(G.poss=='U'?0:G.opp.i),k=(kind=='punt'?lu.P:lu.K)||{id:0,sk:{str:60,skl:60,spd:50,awr:50}};
 G.phase='kick';G.run=false;G.msg='';G.ch=null;kForm(kind);
 P.kk={kind,st:'pow',t:0,u:kUser(),k,kid:k.id,fd:kind=='punt'?0:Math.round(((d>0?110:10)-P.L)*d+17),pow:0,acc:0,post:0};
 P.b={st:'kick',x:P.L-d*.6,y:26.5,z:.3};
 if(!P.kk.u)kAuto();
 if(typeof xRecStart=='function')xRecStart();ui()}
function kAuto(){const kk=P.kk,s=kk.k.sk;
 if(kk.kind=='punt'){kk.pow=clamp(.76+rnd()*.24,0,1);kk.acc=clamp(gauss()*.27,-1,1)}
 else{kk.pow=clamp(((kk.fd+8+rnd()*5)/Math.max(.1,1-3.78/kk.fd)/kMaxC(s)-.45)/.55,.3,1);kk.acc=clamp(gauss()*(.36-(s.skl-60)*.004),-1,1)}
 kk.st='snap';kk.t=0}
function kickTap(){const kk=P&&P.kk;if(G.phase!='kick'||!kk||!kk.u)return;
 if(kk.st=='pow'){kk.st='acc';kk.t=rnd()*6;kk.at=0}else if(kk.st=='acc'&&kk.at>.15){kk.st='snap';kk.t=0;if(typeof sfx=='function')sfx('hike')}}
function kLaunch(){const kk=P.kk,d=G.dir,s=kk.k.sk,w=kWind(),tail=w.x*d,cross=w.y;
 if(kk.kind=='punt'){const g0=(56+(s.str-70)*.45)*(.62+.45*kk.pow)*kWx()+tail*.15,hang=clamp(2.3+2.6*kk.pow*(.8+(s.str-60)/200),2,5);
  Object.assign(kk,{kx:P.L-d*14,G0:g0,hang,lat:kk.acc*g0*.12+cross*.1,T:.9+.42*hang,blk:rnd()<.008});
  const fo=kk.lat>0?(53.1-26.5)/kk.lat:kk.lat<0?(.2-26.5)/kk.lat:9;kk.fo=fo<1?fo:1;kk.lx=kk.kx+d*kk.G0*kk.fo;kk.ly=26.5+kk.lat*kk.fo;kk.T*=Math.max(.5,kk.fo)}
 else{const C=kMaxC(s)*(.45+.55*kk.pow)+tail*.12,lat=kk.acc*kk.fd*.11*kFac(s)+cross*.07*kk.fd/40;
  Object.assign(kk,{kx:P.L-d*7,C,lat,h:C*.22,S:Math.min(C,kk.fd+12),blk:rnd()<(kk.kind=='xp'?.008:.018)+(kk.pow<.35?.05:0)});kk.T=.5+kk.S/40}}
// one tick of the kick (called every frame while G.phase=='kick')
function kickTick(dt){const kk=P&&P.kk;if(!kk||G.phase!='kick')return;kk.t+=dt;const d=G.dir,O=P.off,D=P.def,b=P.b;
 if(kk.st=='pow'){kk.pow=1-Math.abs((kk.t/.8)%2-1);return}
 if(kk.st=='acc'){kk.at+=dt;kk.acc=Math.sin(kk.t*kAccW(kk));return}
 const L=P.L,kp=kk.kind=='punt'?O[0]:O[0];
 // the line: rushers push into the blockers, blockers hold
 D.forEach((p,i)=>{if(kk.kind=='punt'&&i>=7)return;if(i<7||kk.kind!='punt')mv(p,L+d*.3,p.y+(26.5-p.y)*.05,1.1,dt)});
 [6,7,8,9,10].forEach(i=>mv(O[i],L-d*.9,O[i].y,.8,dt));
 if(kk.st=='snap'){const f=Math.min(1,kk.t/.42),x0=L-d*.6;b.x=x0+(kp.x-x0)*f;b.y=26.5+(kp.y-26.5)*f;b.z=.4+.7*f;if(f>=1){kk.st='plant';kk.t=0}}
 else if(kk.st=='plant'){if(kk.kind=='punt'){mv(O[0],O[0].x+d*2,O[0].y,2.5,dt);b.x=O[0].x+d*.5;b.y=O[0].y;b.z=1.1}else{mv(O[5],L-d*7.7,26.1,5,dt);b.x=L-d*7;b.y=26.5;b.z=.2}
  if(kk.t>=.38){kLaunch();kk.st='fly';kk.t=0;if(typeof sfx=='function')sfx('kick');if(kk.blk)return kBlocked()}}
 else if(kk.st=='fly'){const f=Math.min(1,kk.t/kk.T);
  if(kk.kind=='punt'){const g=f*kk.fo,hz=6+kk.hang*3;b.x=clamp(kk.kx+d*kk.G0*g,-1,121);b.y=26.5+kk.lat*g;b.z=4*hz*g*(1-g)+1.2*(1-g);
   [1,3].forEach(i=>mv(O[i],kk.lx,kk.ly+(i==1?-2:2),O[i].spd,dt));[7,8].forEach((i,j)=>mv(D[i],O[j?3:1].x+d*.8,O[j?3:1].y,D[i].spd*.9,dt));mv(D[9],kk.lx,kk.ly,D[9].spd,dt);
   if(f>=1)kEnd()}
  else{const s=kk.S*f,r=s/kk.C;b.x=kk.kx+d*s;b.y=26.5+kk.lat*s/kk.fd;b.z=Math.max(0,4*kk.h*r*(1-r))+.2*(1-f);if(f>=1)kEnd()}}
 if(typeof xRec=='function')xRec(dt)}
function kBlocked(){const kk=P.kk,d=G.dir,u=G.poss=='U';P.over=1;P.b.z=0;P.b.x=P.L-d*(kk.kind=='punt'?9:6);G.run=false;G.next='flip';
 if(kk.kind=='xp'){G.msg='Extra point missed! BLOCKED at the line.';G.next='kick'}
 else if(kk.kind=='fg'){stId(kk.kid,'fga');G.msg=`BLOCKED! The ${kk.fd}-yard field goal is knocked down.`;G.nl=clamp(P.L-d*7,11,109)}
 else{G.msg='BLOCKED PUNT!'+(u?' They take over deep in your end.':' You take over deep in their end.');G.nl=clamp(P.L-d*9,11,109)}
 if(typeof xMom=='function')xMom(u,-15);if(typeof xLog=='function')xLog(`${u?tAbbr(R.lg.t[0].n):tAbbr(G.opp.n)}: ${kk.kind=='punt'?'Punt':kk.kind=='fg'?'Field goal':'Extra point'} blocked!`);
 G.phase='post';G.pt=2.2;kk.post=1.2;save();ui()}
function kEnd(){const kk=P.kk,d=G.dir,u=G.poss=='U',fd=kk.fd,side=u?tAbbr(R.lg.t[0].n):tAbbr(G.opp.n),lg=typeof xLog=='function'?xLog:()=>{},mo=typeof xMom=='function'?xMom:()=>{},sx=typeof sfx=='function'?sfx:()=>{};
 P.over=1;G.run=false;kk.st='done';kk.post=1.4;
 if(kk.kind=='punt'){const recvGoal=d>0?110:10,lx=kk.lx,yl=x=>Math.round(Math.abs(x-recvGoal)),kname=xNm2(O0());
  P.b.z=0;G.next='flip';
  if(kk.fo<1&&(lx-recvGoal)*d<0){G.nl=clamp(lx,11,109);G.msg=`Punt goes out of bounds at the ${yl(lx)}.`}
  else if((lx-recvGoal)*d>=0){G.nl=recvGoal-d*20;G.msg='Punt into the end zone: touchback.'}
  else{const yd=(recvGoal-lx)*d;
   if(yd<10&&kk.hang>3&&rnd()<.6){G.nl=clamp(lx,11,109);G.msg=`Punt downed at the ${yl(lx)}!`}
   else if(kk.hang>=4.2&&rnd()<.3){G.nl=clamp(lx,11,109);G.msg=`Fair catch at the ${yl(lx)}.`}
   else{lg(`${side}: ${kname} punts ${Math.round(kk.G0*kk.fo-14)} yards.`);mo(u,-3);return kReturn(lx,kk.ly,kk.hang)}}
  lg(`${side}: ${kname} punts ${Math.round(kk.G0*kk.fo-14)} yards. ${G.msg}`);mo(u,-3);sx('whistle');G.phase='post';G.pt=2;save();ui();return}
 // field goal / extra point: did it clear the bar between the uprights?
 const r=fd/kk.C,zg=kk.C>=fd?4*kk.h*r*(1-r):-1,yg=Math.abs(kk.lat),left=kk.lat*d<0;let ok=zg>3.33&&yg<3.08,why='';
 if(zg>3.33&&yg>=2.9&&yg<3.3){ok=rnd()<.5;why=ok?' Off the upright... and in!':' Doinks off the upright!'}
 else if(!ok)why=zg<=3.33?(kk.C<fd?' Short.':' Under the crossbar.'):left?' Wide left.':' Wide right.';
 if(kk.kind=='xp'){if(ok)G.sc[u?0:1]+=1;G.msg=ok?'Extra point is good.'+why:'Extra point missed!'+why;G.next='kick';G.phase='post';G.pt=1.9;lg(`${side}: ${G.msg}`)}
 else{stId(kk.kid,'fga');G.clk=Math.max(0,G.clk-5);
  if(ok){stId(kk.kid,'fgm');G.sc[u?0:1]+=3;G.msg=`FIELD GOAL IS GOOD from ${fd} yards!${why}`;if(u)R.pts+=2;G.next='kick';mo(u,8);sx('roar')}
  else{const spot=P.L-d*7;G.msg=`Field goal no good from ${fd} yards.${why}`;G.next='flip';G.nl=clamp(d>0?Math.min(spot,90):Math.max(spot,30),11,109);mo(u,-8)}
  G.phase='post';G.pt=2.4;lg(`${side}: ${G.msg}`)}
 sx('whistle');save();ui()}
const O0=()=>P.off[0];
function xNm2(p){return typeof xNm=='function'?xNm(p):(p&&p.pos)||''}
// a punt that can be returned: the receiving team takes over with the returner where the ball came down,
// and the coverage team is closer the longer the punt hung in the air
function kReturn(lx,ly,hang){const rt=G.poss=='U'?'C':'U';G.poss=rt;G.dir=-G.dir;G.down=1;G.ytg=10;G.los=clamp(lx,11,109);setup();krSetup(lx,G.dir,'punt');
 const ret=P.b.c;ret.x=ret.sx=clamp(lx,.5,119.5);ret.y=ret.sy=clamp(ly,2,51);P.b.x=ret.x;P.b.y=ret.y;
 const cov=clamp(1.3-hang*.22,.3,1);P.def.forEach(p=>{p.x=p.sx=clamp(lx+(p.x-lx)*cov,.5,119.5)})}
// ---------- the kicks themselves replace the instant versions (unless Playable kicks is switched off) ----------
{const _p=doPunt,_f=doFG,_x=doXP;
 doPunt=function(){if(!feat('kick'))return _p();if(G.phase!='pre'||G.ch)return;G.clk=Math.max(0,G.clk-6);kickStart('punt')};
 doFG=function(){if(!feat('kick'))return _f();if(G.phase!='pre'||G.ch)return;kickStart('fg')};
 doXP=function(){if(!feat('kick'))return _x();kickStart('xp')}}
// ---------- goal posts ----------
function gPosts(){X.strokeStyle='#facc15';X.lineCap='round';[0,120].forEach(x=>{X.lineWidth=3;gline3(x,26.5,0,x,26.5,3.33);X.lineWidth=2.5;gline3(x,23.42,3.33,x,29.58,3.33);gline3(x,23.42,3.33,x,23.42,11);gline3(x,29.58,3.33,x,29.58,11)});X.lineCap='butt'}
function gline3(x0,y0,z0,x1,y1,z1){const a=P2(x0,y0,z0),b=P2(x1,y1,z1);X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(b[0],b[1]);X.stroke()}
// ---------- the meter and the field goal camera (drawn over the field) ----------
function kDraw(dt){const kk=P&&P.kk;if(!kk)return;if(kk.post>0&&G.phase!='kick')kk.post-=dt;
 if(G.phase=='kick'&&kk.u&&kk.st!='fly'&&kk.st!='done'){const w=Math.min(300,W*.42),x0=W/2-w/2,y0=H-96;
  X.fillStyle='#0b1626e8';X.fillRect(x0-14,y0-32,w+28,92);X.strokeStyle='#e9e3cf';X.lineWidth=2;X.strokeRect(x0-14,y0-32,w+28,92);
  X.textAlign='center';X.fillStyle='#fff';X.font='bold 13px "Trebuchet MS",sans-serif';const wd=kWind();
  X.fillText(({punt:'PUNT',fg:`FIELD GOAL  ·  ${kk.fd} YD`,xp:'EXTRA POINT'})[kk.kind]+(wd.m>=5?`  ·  WIND ${wd.m} ${wd.x>=0?'→':'←'}`:''),W/2,y0-14);
  X.fillStyle='#ffffff22';X.fillRect(x0,y0,w,13);const pg=X.createLinearGradient?X.createLinearGradient(x0,0,x0+w,0):null;if(pg&&pg.addColorStop){pg.addColorStop(0,'#22c55e');pg.addColorStop(.75,'#facc15');pg.addColorStop(1,'#ef4444')}
  X.fillStyle=pg||'#22c55e';X.fillRect(x0,y0,w*kk.pow,13);if(kk.kind!='punt'){const n=kNeed(kk);X.fillStyle='#fff';if(n<=1)X.fillRect(x0+w*clamp(n,0,1)-1,y0-4,2,21)}
  X.font='bold 10px sans-serif';X.textAlign='left';X.fillStyle='#cbd5e1';X.fillText('POWER',x0,y0+24);X.textAlign='right';X.fillText('ACCURACY',x0+w,y0+24);
  const ay=y0+30,gz=kGreen(kk);X.fillStyle='#ffffff22';X.fillRect(x0,ay,w,11);X.fillStyle='#ca8a04';X.fillRect(W/2-w/2*gz[1],ay,w*gz[1],11);X.fillStyle='#16a34a';X.fillRect(W/2-w/2*gz[0],ay,w*gz[0],11);
  if(kk.st!='pow'){X.fillStyle='#fff';X.fillRect(W/2+kk.acc*w/2-2,ay-4,4,19)}
  X.textAlign='center';X.fillStyle='#ffd84d';X.font='bold 12px "Trebuchet MS",sans-serif';
  X.fillText(kk.st=='pow'?(TOUCH()?'TAP to set the power':'SPACE or click to set the power'):kk.st=='acc'?(TOUCH()?'TAP when the needle is in the green':'SPACE or click when the needle is in the green'):'',W/2,y0+56);X.textAlign='left'}
 if(feat('fgcam')&&kk.kind!='punt'&&((G.phase=='kick'&&kk.st!='pow'&&kk.st!='acc')||kk.post>0))kCam()}
function kCam(){const kk=P.kk,b=P.b,d=G.dir,w=Math.min(240,W*.3),h=w*.64,x0=W-w-12,y0=48,cx=x0+w/2,hz=y0+h*.4,F=w*.75,fd=kk.fd;
 X.save();X.beginPath();X.rect(x0,y0,w,h);X.clip();
 const sky=X.createLinearGradient?X.createLinearGradient(0,y0,0,hz):null;if(sky&&sky.addColorStop){sky.addColorStop(0,G.night?'#020617':'#1d4e89');sky.addColorStop(1,G.night?'#1e293b':'#7fb2e5')}X.fillStyle=sky||'#4a7fb5';X.fillRect(x0,y0,w,h);
 X.fillStyle='#2a7f35';X.fillRect(x0,hz,w,h);
 const pr=(s,l,z)=>{const D=Math.max(.6,s+4);return[cx+l*F/D,hz-(z-1.6)*F/D]},ln=(a,c)=>{X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(c[0],c[1]);X.stroke()};
 X.strokeStyle='#ffffff70';X.lineWidth=1;for(let s=0;s<=fd+10;s+=5)ln(pr(s,-26.5,0),pr(s,26.5,0));ln(pr(0,-26.5,0),pr(fd+10,-26.5,0));ln(pr(0,26.5,0),pr(fd+10,26.5,0));
 X.strokeStyle='#facc15';X.lineWidth=3;ln(pr(fd,0,0),pr(fd,0,3.33));X.lineWidth=2;ln(pr(fd,-3.08,3.33),pr(fd,3.08,3.33));ln(pr(fd,-3.08,3.33),pr(fd,-3.08,11));ln(pr(fd,3.08,3.33),pr(fd,3.08,11));
 const s=Math.max(0,(b.x-kk.kx)*d),q=pr(s,(b.y-26.5)*d,b.z||0),r=Math.max(1.6,7*4/(s+4));X.fillStyle='#000a';const g=pr(s,(b.y-26.5)*d,0);X.beginPath();X.ellipse(g[0],g[1],r,r*.35,0,0,7);X.fill();
 X.fillStyle='#8b5a2b';X.beginPath();X.ellipse(q[0],q[1],r,r*.7,0,0,7);X.fill();X.restore();
 X.strokeStyle='#e9e3cf';X.lineWidth=2;X.strokeRect(x0,y0,w,h);X.fillStyle='#000a';X.fillRect(x0,y0,62,15);X.fillStyle='#fff';X.font='bold 10px sans-serif';X.textAlign='left';X.fillText('KICK CAM',x0+5,y0+11)}
// ---------- onside kicks ----------
{const _sk=startKick;startKick=function(kind,kt,spot){
 if(kind=='ko'&&G&&G.live&&feat('fakes')&&!G.koOK){const lead=kt=='U'?G.sc[0]-G.sc[1]:G.sc[1]-G.sc[0],late=G.q>=4&&G.clk<300&&lead<0&&lead>=-16;
  if(kt=='U'&&!CAR()&&lead<0){G.ch={k:'ko',a:[kind,kt,spot]};G.phase='pre';G.run=false;G.msg='Kickoff. Kick it deep, or try an onside kick?';ui();return}
  if(kt=='C'&&late&&rnd()<.25+.7*IQ())return onside('C');
  if(kt=='U'&&CAR()&&late)return onside('U')}
 G.koOK=0;return _sk(kind,kt,spot)}}
function chDeep(){const a=G.ch&&G.ch.a||['ko','U'];G.ch=null;G.koOK=1;startKick(...a)}
function chOnside(){G.ch=null;onside('U')}
function onside(kt){G.ch=null;G.koOK=0;const rt=kt=='U'?'C':'U',dR=rt=='U'?1:-1,dK=-dR,kOwn=dK>0?10:110,spot=kOwn+dK*(35+10+rnd()*2.5),got=rnd()<.24;
 G.clk=Math.max(0,G.clk-4);G.run=false;G.down=1;G.ytg=10;G.los=clamp(spot,11,109);
 if(got){G.poss=kt;G.dir=dK}else{G.poss=rt;G.dir=dR}
 G.phase='pre';setup();const ours=(kt=='U')==got;
 G.msg=got?`ONSIDE KICK RECOVERED by the ${kt=='U'?'your team':'CPU'}!`:`Onside kick fails. ${rt=='U'?'You take':'They take'} over.`;
 if(typeof xBanner=='function')xBanner(got?'ONSIDE RECOVERED':'ONSIDE FAILS','',ours?'good':'bad');
 if(typeof xLog=='function')xLog(`${tAbbr(kt=='U'?R.lg.t[0].n:G.opp.n)}: onside kick ${got?'recovered by the kicking team!':'recovered by the return team.'}`);
 if(typeof xMom=='function')xMom(kt=='U',got?14:-5);ui()}
{const _cc=coachChoice;coachChoice=function(){if(G.ch&&G.ch.k=='ko')return chDeep();return _cc()}}
// ---------- fake punts and fake field goals: the defense lines up for the kick, you run a real play ----------
function fakeSet(kind){if(G.phase!='pre'||G.poss!='U'||G.down!=4||G.fake||G.ch)return;G.fake=kind;
 if(rnd()>=.3*IQ()){const d=G.dir,L=P.L;
  const pt=kind=='punt'?[[1,22,'r'],[1,24.3,'r'],[1,28.7,'r'],[1,31,'r'],[1.5,20,'r'],[4,26.5,'z',[4,26.5]],[5,33,'z',[5,33]],[2,6,'m',1],[2,47,'m',3],[38,26.5,'z',[38,26.5]],[20,30,'z',[20,30]]]
   :[[1,21,'r'],[1,23.2,'r'],[1,25.4,'r'],[1,27.6,'r'],[1,29.8,'r'],[1,32,'r'],[1,19,'r'],[2,12,'m',1],[2,41,'m',3],[7,20,'z',[7,20]],[7,33,'z',[7,33]]];
  P.dp={p:pt,fm:0};P.dpn=kind=='punt'?'Punt return':'Field goal block';pt.forEach((e,i)=>{const p=P.def[i];p.x=p.sx=L+d*e[0];p.y=p.sy=e[1]})}
 G.msg=kind=='punt'?'Fake punt! Call your play and snap.':'Fake field goal! Call your play and snap.';G.pbOpen=true;ui()}
