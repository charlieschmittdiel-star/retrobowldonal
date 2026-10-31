'use strict';
// Special teams, formation matching, motion and QB-vision helpers. Loaded before game.js: functions only.
const kickerOf=t=>lineup(t=='U'?0:G.opp.i).K.sk,punterOf=t=>lineup(t=='U'?0:G.opp.i).P.sk;
const coneHalf=q=>Math.max(.17,(q.sk.awr-20)*.45*Math.PI/180);
function coneOff(q,tx,ty){const a=Math.atan2(ty-q.y,tx-q.x);return Math.max(0,Math.abs(Math.atan2(Math.sin(a-q.fa),Math.cos(a-q.fa)))-coneHalf(q))}
function face(p,ang,rate,dt){let df=ang-p.fa;df=Math.atan2(Math.sin(df),Math.cos(df));p.fa+=Math.sign(df)*Math.min(Math.abs(df),rate*dt)}
function fgDist(){return Math.round(((G.dir>0?110:10)-P.L)*G.dir+17)}
// Defense lines up against the offense's formation: a defender over each wide receiver, DL over OL gaps, safeties shaded.
function matchFormation(){const dp=P&&P.dp;if(!dp||dp.fm===0||!P.off)return;const d=G.dir,L=P.L,O=P.off,D=P.def,Y=i=>O[i].sy;
 const set=(i,x,y)=>{D[i].x=D[i].sx=x;D[i].y=D[i].sy=clamp(y,1.5,51.5)};
 set(0,D[0].x,Y(6)-2);set(1,D[1].x,(Y(7)+Y(8))/2);set(2,D[2].x,(Y(8)+Y(9))/2);set(3,D[3].x,Y(10)+2);set(4,D[4].x,Y(7)-1);set(5,D[5].x,Y(8));set(6,D[6].x,Y(9)+1);
 const wide=i=>Math.abs(Y(i)-26.5)>6,Lw=[1,2,3,4,5].filter(i=>Y(i)<26.5&&wide(i)).sort((a,b)=>Y(a)-Y(b)),Rw=[1,2,3,4,5].filter(i=>Y(i)>=26.5&&wide(i)).sort((a,b)=>Y(b)-Y(a)),used=[];
 [[Lw,[7,6,9]],[Rw,[8,6,10]]].forEach(([ws,ds])=>{let k=0;ws.forEach(ri=>{while(ds[k]!=null&&used.includes(ds[k]))k++;const j=ds[k++];if(j==null)return;used.push(j);
  const x=j==6?L+d*4.5:j>8?L+d*Math.max(8,Math.abs(D[j].x-L)):D[j].x,e=dp.p[j];set(j,x,Y(ri)+(26.5-Y(ri))*.12);
  if(e[2]=='m')e[3]=ri;else if(e[2]=='z')e[3]=[Math.abs(e[3][0]),Y(ri)]})});
 [9,10].forEach((j,k)=>{if(!used.includes(j)){const e=dp.p[j],y=26.5+(k?9:-9);set(j,D[j].x,y);if(e[2]=='z')e[3]=[Math.abs(e[3][0]),y]}})}
// Pre-snap motion: motion men jog along their path, man defenders follow, zone defenders hold; then the real snap happens.
function motionStep(dt){const d=G.dir,O=P.off,D=P.def;P.mt+=dt;let busy=0;
 O.forEach(p=>{if(!p.mo)return;if(p.mi<p.mo.length){const w=p.mo[p.mi];mv(p,w[0],w[1],4.5,dt);busy=1;if(Math.hypot(w[0]-p.x,w[1]-p.y)<.5)p.mi++}else p.vx=p.vy=0});
 const L=P.L;D.forEach(p=>{const e=P.dp.p[p.i];if(e[2]=='m'&&O[e[3]]&&O[e[3]].mo){const v=O[e[3]];mv(p,L+d*Math.max(1.2,(v.x-L)*d+1.5,(p.sx-L)*d*.6),v.y,p.spd*.75,dt)}else p.vx=p.vy=0;
  if((p.x-L)*d<1)p.x=L+d*1});
 if(!busy||P.mt>2.4){G.phase='pre';snap()}}
// Fourth-down kicks (your kicker and punter come from the roster)
function doPunt(){if(G.phase!='pre'||G.ch)return;G.clk=Math.max(0,G.clk-6);G.run=false;startKick('punt',G.poss,P.L)}
function doFG(){if(G.phase!='pre'||G.ch)return;const u=G.poss=='U',d=G.dir,fd=fgDist(),k=kickerOf(u?'U':'C'),rg=40+(k.str-60)*.4,p=clamp(1.05-(fd-20)*.012+(k.skl-70)*.004-Math.max(0,fd-rg)*.015,.03,.99),ok=rnd()<p;
 P.over=1;P.b={st:'dead',x:d>0?110:10,y:26.5};G.clk=Math.max(0,G.clk-5);G.run=false;{const kp=lineup(u?0:G.opp.i).K;stId(kp&&kp.id,'fga');if(ok)stId(kp&&kp.id,'fgm')}
 if(ok){G.sc[u?0:1]+=3;G.msg=`FIELD GOAL IS GOOD from ${fd} yards!`;if(u)R.pts+=2;G.next='kick'}
 else{const spot=P.L-d*7;G.msg=`Field goal no good from ${fd} yards.`;G.next='flip';G.nl=clamp(d>0?Math.min(spot,90):Math.max(spot,30),11,109)}
 G.phase='post';G.pt=2.4;save()}
// Extra points and two-point tries
function xpFlow(){if(G.poss=='U'){G.ch={k:'xp'};G.phase='pre';G.msg='Touchdown! Kick the extra point or go for two?';ui();return}
 if(cpuGoFor2())return chTwo();doXP()}
function doXP(){const u=G.poss=='U',k=kickerOf(u?'U':'C'),ok=rnd()<clamp(.94+(k.skl-70)*.003,.8,.99);if(ok)G.sc[u?0:1]+=1;G.msg=ok?'Extra point is good.':'Extra point missed!';G.next='kick';G.phase='post';G.pt=1.8;save()}
function chXp(){G.ch=null;doXP()}
function chTwo(){G.ch=null;G.two=1;G.los=G.dir>0?108:12;G.down=1;G.ytg=2;G.phase='pre';setup();G.msg='Two-point try from the 2. Score to get 2 points.'}
// Kickoffs, punts and free kicks: touchback or a playable return (you return it, or you chase the returner).
function chTb(){G.ch=null;G.msg='Touchback. Ball at the 25.';ui()}
function chRet(){const c=G.ch;G.ch=null;krSetup(c.lx,c.d,c.kind)}
function startKick(kind,kt,spot){G.run=false;const rt=kt=='U'?'C':'U',d=rt=='U'?1:-1,own=d>0?10:110,k=kickerOf(kt),pk=punterOf(kt);G.poss=rt;G.dir=d;G.down=1;G.ytg=10;
 let lx;if(kind=='ko'){lx=own+d*(rnd()*14-4-(k.str-70)*.15);if(rnd()<.2+(k.str-70)*.01)lx=own-d*(1+rnd()*5)}else lx=spot-d*(38+rnd()*14+(pk.str-70)*.4);
 if((lx-own)*d<=0){
  if(kind=='punt'&&rnd()<(pk.skl-55)/100){G.los=own+d*5;G.phase='pre';setup();G.msg=`${kt=='U'?'Your':'CPU'} punter pinned them: downed at the 5.`;return}
  G.los=own+d*(kind=='ko'?25:20);G.phase='pre';setup();
  if(kind=='ko'&&rt=='U'){G.ch={k:'tb',lx,d,kind};G.msg='The kick sails into the end zone. Take the touchback or return it?';ui();return}
  if(kind=='ko'&&rt=='C'&&Math.abs(lx-own)<3&&rnd()<.5){G.ch=null;krSetup(lx,d,kind);return}
  G.msg=`${kt=='U'?'Your':'CPU'} ${kind=='ko'?'kickoff':'punt'}: touchback.`;return}
 G.los=lx;setup();krSetup(lx,d,kind)}
function krSetup(lx,d,kind){const O=P.off,D=P.def,ret=O[5];P.kr=1;P.scr=1;P.L=lx;P.run=0;G.nl=lx;
 O.forEach(p=>{p.route=[];p.mo=null;p.eng=null;p.blk=-1;p.tg=null});
 ret.x=ret.sx=lx;ret.y=ret.sy=26.5+(rnd()-.5)*10;O[0].x=O[0].sx=lx+d*3;O[0].y=ret.y;
 [1,2,3,4,6,7,8,9,10].forEach((i,k)=>{const p=O[i];p.x=p.sx=lx+d*(10+k%3*2.5);p.y=p.sy=4+k*5.6});
 D.forEach((p,i)=>{p.x=p.sx=lx+d*(34+i%3*2);p.y=p.sy=3+i*4.7;p.ly=p.y;p.rush=false;p.cover=null;p.zone=null;p.eng=null});
 const ks=D[5];ks.x=ks.sx=lx+d*48;ks.y=ks.sy=26.5;ks.ksafe=1;
 P.b={st:'carry',c:ret,x:ret.x,y:ret.y};P.t=0;cd=D[G.cdi==null?3:G.cdi];G.phase='play';
 G.msg=`${kind=='ko'?'Kickoff':'Punt'} return! `+(G.poss=='U'?'You have the ball - run it back.':'Chase down the returner.');ui()}

// Juke: sidestep (away from the nearest tackler by default); defenders close by may bite and freeze.
function juke(c,side){if(c.jc>0||(c.stm!=null&&c.stm<8))return;const n=P.def.reduce((a,p)=>dist(p,c)<dist(a,c)?p:a),m=Math.hypot(c.vx,c.vy),fx=m?c.vx/m:G.dir,fy=m?c.vy/m:0,qx=-fy,qy=fx;
 if(side==null)side=((n.x-c.x)*qx+(n.y-c.y)*qy)>0?-1:1;
 c.jm={t:0,d:.26,x:qx*side*2.2,y:qy*side*2.2,tr:[],k:'juke'};c.ml=.5;c.mv='juke';if(typeof puff=='function')puff(c.x-qx*side*.3,c.y-qy*side*.3,4,.7);c.jk=.45;c.jc=1.3;c.stm=Math.max(0,(c.stm==null?100:c.stm)-10);
 P.def.forEach(p=>{if(!p.eng&&dist(p,c)<3.2&&rnd()<clamp(.65-(p.o-c.o)/120,.2,.9)){p.bite=.5;p.cool=Math.max(p.cool,.5)}});
 if(c.t=='U')G.msg='Juke!'}
// Interception: the play keeps going. The two teams swap roles and the defender who caught it runs it back.
function intReturn(l,dd){sRec(P.passer||P.off[0],'pi');sRec(dd,'in');const b=P.b,d0=G.dir,tmp=P.off;b.st='dead';P.off=P.def;P.def=tmp;G.poss=G.poss=='U'?'C':'U';G.dir=-d0;G.down=1;G.ytg=10;
 dd.x=l.x;dd.y=l.y;P.L=l.x;G.los=clamp(l.x,11,109);G.nl=G.los;P.kr=1;P.scr=1;P.run=0;P.sd=0;P.aim=null;P.t=0;P.over=0;P.look=null;
 P.off.forEach(p=>{p.route=[];p.ri=0;p.mo=null;p.eng=null;p.blk=-1;p.tg=null;p.stun=0;p.fa=G.dir>0?0:Math.PI});
 P.def.forEach(p=>{p.rush=false;p.cover=null;p.zone=null;p.eng=null;p.ly=p.y;p.bite=0;p.fa=G.dir>0?Math.PI:0});
 P.b={st:'carry',c:dd,x:dd.x,y:dd.y};cd=P.def.reduce((a,p)=>dist(p,dd)<dist(a,dd)?p:a);
 if(G.poss=='U')R.pts+=2;G.msg=G.poss=='U'?'INTERCEPTION! Run it back!':'Intercepted - chase him down!';ui()}

// Blocking strength by position: linemen block at full strength, TEs and backs a bit worse, everyone else badly. Worse again on returns.
function bPen(o){const g=o.pos;let pen=g=='OL'||g=='LT'||g=='LG'||g=='C'||g=='RG'||g=='RT'||g=='DL'||g=='DE'||g=='DT'?0:g=='TE'||g=='RB'||g=='FB'?6:15;return pen+(P.kr?(pen?8:4):0)}
