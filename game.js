'use strict';
if(typeof lineup!='function'||typeof cpuQB!='function'||typeof careerHub!='function'){document.body.innerHTML='<p style="padding:20px;font:18px sans-serif;color:#fff">Gridiron Lab is missing files. Upload index.html, data.js, special.js, ai.js, moves.js, career.js, ragdoll.js, game.js, render.js, hud.js, playbook.js, league.js and style.css together in one folder.</p>';throw new Error('missing data.js')}
const C=document.getElementById('c'),X=C.getContext('2d'),S=10,H=540,$=i=>document.getElementById(i);let W=960;
const keys={};
const PO=['QB','WR','WR','WR','TE','RB','LT','LG','C','RG','RT'],PD=['DE','DT','DT','DE','LB','LB','LB','CB','CB','S','S'];
const NM='Smith Jones Reyes Park Okafor Miller Cruz Hayes Dunn Ito Vega Brooks Webb Lane Shaw Cole Reid Frost Nash Boyd Diaz Hart'.split(' ');
let CP={};try{CP=JSON.parse(lsGet('gd2p'))||{}}catch(e){}
const PLAYS={
 Slants:{r:[[[4,0],[10,5]],[[4,0],[10,-5]],[[5,0],[11,-6]],[[6,0],[7,-4]],[]]},
 Go:{r:[[[32,0]],[[32,0]],[[14,0],[26,-8]],[[8,0]],[]]},
 Mesh:{r:[[[4,0],[5,16]],[[4,0],[5,-16]],[[10,0],[12,-3]],[[3,0],[4,-4]],[[2,6]]]},
 Run:{run:1,r:[[[15,0]],[[15,0]],[[8,0]],[],[]]},
 Verts:{r:[[[35,0]],[[35,0]],[[35,0]],[[30,0]],[]]},Curls:{r:[[[10,0],[8,0]],[[10,0],[8,0]],[[9,0],[7,0]],[[7,0],[5,0]],[[2,9]]]},
 'Post Corner':{r:[[[12,0],[26,12]],[[12,0],[26,5]],[[8,0],[8,-6]],[[5,0]],[]]},Draw:{run:1,r:[[[15,0]],[[15,0]],[[12,0]],[[6,0]],[]]},
 'Motion Mesh':{r:[[[4,0],[5,16]],[[4,0],[5,-16]],[[6,0],[8,-6]],[[3,0],[4,-4]],[[2,6]]],mo:{3:[[0,-8],[0,-16]]}},
 'Jet Sweep':{run:1,ho:3,r:[[[12,0]],[[12,0]],[],[[6,0]],[]],mo:{3:[[-.5,-10],[-1,-18]]}}};
let G,P,sel=-1,cd=null,call='zone',camX=0;
R.st=R.st||{oc:0,dc:0};
let LU,LUc;
const ov=(t,s,i)=>t=='U'?ovr(LU[s][i])+R.st[s=='O'?'oc':'dc']*2:ovr(LUc[s][i]);
const FOX=[-4,-.5,-.5,-1,-1,-5,-1,-1,-1,-1,-1],FOY=[26.5,8,45,38,33.5,29.5,22,24.3,26.5,28.7,31],FDX=[1,1,1,1,4,4,4,7,7,13,13],FDY=[22,25,28,31,19,26.5,34,8,45,20,33];
const mkPre=(r,run,ho,mo)=>({run:run||0,ho:ho||5,p:FOX.map((x,i)=>[x,FOY[i],i>0&&i<6?r[i-1]:[],-1,mo&&mo[i]||null])});
const PRE={};for(const k in PLAYS)PRE[k]=mkPre(PLAYS[k].r,PLAYS[k].run,PLAYS[k].ho,PLAYS[k].mo);
const thr=(q,dd)=>18+dd*.5+(q.sk.str-70)*.15;
const audN=()=>clamp(1+((ovr(lineup().O[0])+R.st.oc*2-60)/8|0),1,5),allP=()=>({...PRE,...CP}),clone=o=>JSON.parse(JSON.stringify(o));
const DX0=[1,1,1,1,4,4,4,7,7,13,13],R_=['r'],mkD=(dx,y,as)=>({p:as.map((a,i)=>[dx[i]??DX0[i],y[i]??FDY[i],...a])});
const DPRE={
 'Cover 2 Zone':mkD([,,,,,,,6,6],[],[R_,R_,R_,R_,['z',[7,19]],['z',[7,26.5]],['z',[7,34]],['z',[5,8]],['z',[5,45]],['z',[15,19]],['z',[15,34]]]),
 'Man Free':mkD([,,,,,,,2,2],[],[R_,R_,R_,R_,['m',5],['z',[6,26.5]],['m',4],['m',1],['m',2],['m',3],['z',[16,26.5]]]),
 'Blitz':mkD([,,,,1.8,1.8,,2,2],[],[R_,R_,R_,R_,R_,R_,['m',4],['m',1],['m',2],['m',3],['z',[14,26.5]]]),
 'Cover 3':mkD([,,,,,,,,,13,8],[,,,,,,,,,26.5,38],[R_,R_,R_,R_,['z',[6,19]],['z',[6,26.5]],['z',[6,34]],['z',[14,9]],['z',[14,44]],['z',[14,26.5]],['z',[8,38]]]),
 'All Out':mkD([,,,,1.5,1.5,1.5,2,2],[],[R_,R_,R_,R_,R_,R_,R_,['m',1],['m',2],['m',3],['m',4]])};
let DCP={};try{DCP=JSON.parse(localStorage.getItem('gd2d'))||{}}catch(e){}
const DALL=()=>({...DPRE,...DCP});
function applyDef(n){const pl=DALL()[n];if(!pl)return;P.dp=clone(pl);P.dpn=n;if(G.poss!='U')G.ldp=n;const d=G.dir,L=P.L;pl.p.forEach((e,i)=>{const p=P.def[i];p.x=p.sx=L+d*Math.max(e[0],.5);p.y=p.sy=clamp(e[1],1,52)});matchFormation()}
function newGame(opp){G={opp:opp||{n:'Scrimmage',r:62,i:1},live:0,stm:{},box:{},to:[3,3],run:false,recv:'U',hurry:0,sc:[0,0],q:1,clk:QLEN(),down:1,ytg:10,los:35,dir:1,poss:'U',phase:'pre',msg:'Kickoff. Pick a play, then snap.',next:'same',nl:35,aud:audN()};setup();{const a=lineup(0),b=lineup(G.opp.i);G.gp=[...new Set([...a.O,...a.D,a.K,b.O,b.D,b.K].flat().filter(Boolean).map(p=>p.id))]}startKick('ko','C')}
function finish(){G.phase='over';endGame()}
function setup(){clearRags();LU=lineup(0);LUc=lineup(G.opp.i);
 const d=G.dir,L=G.los,u=G.poss=='U',ot=u?'U':'C',dt=u?'C':'U';
 const m=(t,s,i,x,y)=>{const o=ov(t,s,i)-(s=='D'&&(i==7||i==8)?4:0),ol=s=='O'&&i>5,pl=(t=='U'?LU:LUc)[s][i],sk=pl?pl.sk:{spd:o,str:o,awr:o,skl:o};return{t,s,i,pid:pl?pl.id:0,pos:(s=='O'?PO:PD)[i],o,sk,x,y,sx:x,sy:y,vx:0,vy:0,spd:ol?4.6+sk.spd*.012:(s=='D'&&i<4?.85:s=='D'&&(i==7||i==8)?1.08:1.15)*(5.6+sk.spd*.03),route:[],ri:0,eng:null,cool:0,jk:0,jc:0,bite:0,blk:-1,fa:s=='O'?(d>0?0:Math.PI):(d>0?Math.PI:0),tr:ol||(s=='D'&&i<4)?4.5:(s=='O'&&i==0)?12:(s=='D'&&i<7)||(s=='O'&&(i==4||i==5))?7:9,ml:0,mt:0,boost:0,stun:0,hs:0,hcool:0,hk:0,hawk:0,swat:0,swk:0}};
 P={off:FOY.map((y,i)=>m(ot,'O',i,L+FOX[i]*d,y)),def:FDY.map((y,i)=>m(dt,'D',i,L+FDX[i]*d,y)),L,b:{st:'pre',x:L-4*d,y:26.5},t:0,run:0,ho:5,over:0,scr:0,name:'',aim:null,pump:0};
 P.off.concat(P.def).forEach(p=>{const v=G.stm[p.t+p.s+p.i];p.stm=Math.min(100,(v==null?75:v)+25)});
 cd=P.def[G.cdi==null?5:G.cdi];sel=-1;G.called=0;G.pbOpen=true;applyPlay(u?(CAR()&&!qbIsMe()?coachPlay():(allP()[G.lp]?G.lp:'Slants')):cpuPlay());
 if(u){const k=Object.keys(DPRE);applyDef(cpuDef());if(rnd()<.2+.45*IQ()){const lk=DPRE[k[rnd()*k.length|0]];lk.p.forEach((e,i)=>{const p=P.def[i];p.x=p.sx=L+d*e[0];p.y=p.sy=e[1]})}matchFormation();
  const D=P.def;P.hint=D.slice(4,7).filter(p=>Math.abs(p.x-L)<=2.5).length>=2?'linebackers crowding the line':Math.abs(D[7].x-L)<=3?'corners pressed up':Math.abs(D[9].x-L)>=15?'safeties sitting deep':'a standard look'}
 else applyDef(CAR()?coachDef():(DALL()[G.ldp]?G.ldp:'Cover 2 Zone'));careerCd()
 G.msg=u?`${G.down} & ${G.ytg}. Defense shows ${P.hint}. First play call is free; changing it costs an audible.`:`CPU has the ball. Pick a defense, then snap.`;ui()}
function applyPlay(n){const pl=allP()[n];if(!pl)return;const d=G.dir,L=P.L;P.name=n;P.run=pl.run;P.ho=pl.ho||5;if(G.poss=='U')G.lp=n;P.moDone=0;
 pl.p.forEach((e,i)=>{const p=P.off[i];p.sx=p.x=L+d*Math.min(e[0],-.5);p.sy=p.y=clamp(e[1],1,52);p.mi=0;p.mo=e[4]&&e[4].length?e[4].map(([a,b])=>[p.sx+d*Math.min(a,-.5-Math.min(e[0],-.5)),clamp(p.sy+b,1,52)]):null;const s0=p.mo?p.mo[p.mo.length-1]:[p.sx,p.sy];p.route=e[2].map(([a,b])=>[s0[0]+d*a,clamp(s0[1]+b,1,52)]);p.ri=0;p.blk=e[3]==null?-1:e[3]});
 if(G.poss=='U'&&P.dp)matchFormation()}
function snap(){if(G.phase!='pre'||G.ch)return;const u=G.poss=='U',d=G.dir,L=P.L,D=P.def,O=P.off;
 if(clockAtSnap())return;
 if(!u&&!P.moDone&&cpuClockPre())return;
 if(u&&CAR()&&!qbIsMe()&&G.down==4&&!P.moDone&&!G.at&&coach4th())return;
 if(!u&&G.down==4&&!P.moDone&&cpu4th())return;
 const dp=P.dp;
 D.forEach((p,i)=>{const e=dp.p[i];p.smart=p.t!='C'||rnd()<.3+.7*IQ();p.zf=null;p.sw=null;p.on=null;p.ksafe=0;p.rt2=0;p.zm=null;p.rush=e[2]=='r';p.cover=e[2]=='m'?O[e[3]]:null;p.zone=e[2]=='z'?[L+d*e[3][0],e[3][1]]:null;p.zr=e[2]=='z'?(e[4]||(Math.abs(e[3][0])>=12?10:6.5)):0});
 {const zs=D.filter(p=>p.zone),rs=O.slice(1,6).filter((r,i)=>r.route.length||i<4),pr=[];zs.forEach(p=>rs.forEach(r=>pr.push([dist(p,r),p,r])));pr.sort((a,b)=>a[0]-b[0]);
  const ud=new Set(),ur=new Set();pr.forEach(([dd,p,r])=>{if(ud.has(p)||ur.has(r)||dd>18)return;p.zm=r;ud.add(p);ur.add(r)})}
 if(!P.moDone&&O.some(p=>p.mo&&p.mo.length)){P.moDone=1;P.mt=0;G.phase='motion';G.msg='Motion!';ui();return}
 if(u)D.forEach(p=>{if(p.cover&&Math.abs(p.sx-L)<=3){const r=p.cover;if(rnd()<clamp(.45+(p.o-r.o)/120,.15,.8))r.stun=.6;else p.stun=.4}});
 const rs=D.filter(p=>p.rush).sort((a,b)=>a.y-b.y),q=O[0],nr=p=>rs.reduce((a,r)=>dist(r,p)<dist(a,p)?r:a);
 O.slice(6).forEach((o,k)=>{o.tg=o.blk>=0&&D[o.blk]?D[o.blk]:rs[Math.round(k*(rs.length-1)/4)]});
 [4,5].forEach(i=>{const o=O[i];o.tg=o.blk>=0&&D[o.blk]?D[o.blk]:rs.filter(r=>!O.slice(6).some(l=>l.tg==r)).reduce((a,r)=>!a||dist(r,q)<dist(a,q)?r:a,null)||undefined});
 trackSnap();P.b={st:'qb',x:q.x,y:q.y};G.phase='play';G.msg='';ui()}
let joy=[0,0];
const inp=()=>{const x=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0)+joy[0],y=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0)+joy[1],m=Math.hypot(x,y)||1;return[x/m,y/m,x||y]};
function mv(p,tx,ty,sp,dt){if(p.stun>0){p.stun-=dt;sp*=.25}sp*=moveSpd(p);const dx=tx-p.x,dy=ty-p.y,m=Math.hypot(dx,dy);if(m<.05){p.vx=p.vy=0;return}
 const sm=p.stm==null?100:p.stm;sp*=(sm>20?1:.35+.65*sm/20)*(p.drag||1);p.stm=Math.max(0,sm-(P.b&&P.b.c===p?10:2)*dt);
 let df=Math.atan2(dy,dx)-p.fa;df=Math.atan2(Math.sin(df),Math.cos(df));const ap=Math.min(Math.abs(df),p.tr*(p.jk>0?3:1)*dt);p.fa+=Math.sign(df)*ap;sp*=clamp(Math.cos(Math.abs(df)-ap),.2,1);
 const k=Math.min(sp*dt,m)/m;p.vx=dx/m*sp;p.vy=dy/m*sp;p.x=clamp(p.x+dx*k,.5,119.5);p.y=clamp(p.y+dy*k,.4,52.6)}
function throwAt(tx,ty){const b=P.b,q=P.off[0];if(b.st!='qb'||P.scr||P.run)return;
 let dd=Math.hypot(tx-q.x,ty-q.y);const rg=34+(q.sk.str-60)*.7;if(dd>rg){tx=q.x+(tx-q.x)*rg/dd;ty=q.y+(ty-q.y)*rg/dd;dd=rg}
 const pr=P.def.filter(p=>p.rush&&dist(p,q)<3.5).length,sc=(1.2+Math.max(0,80-q.sk.skl)*.08)*(1+pr)*(1+Math.hypot(q.vx,q.vy)*.15+(P.sd?.4:0))*Math.pow(dd/22,1.5)*(1+coneOff(q,tx,ty)*4);
 tx=clamp(tx+(rnd()-.5)*sc,1,119);ty=clamp(ty+(rnd()-.5)*sc,1,52);
 const T=Math.max(.3,Math.hypot(tx-q.x,ty-q.y)/thr(q,dd));let tg=null,m=99;
 P.off.forEach((r,i)=>{if(i==0||(i>5&&!r.route.length))return;const e=Math.hypot(r.x+r.vx*T*.5-tx,r.y+r.vy*T*.5-ty)/r.spd;if(e<T+.9&&e<m){m=e;tg=r}});
 Object.assign(b,{st:'air',sx:q.x,sy:q.y,tx,ty,t:0,T,tgt:tg});P.passer=q;sRec(q,'pa');P.def.forEach(p=>p.rt=(Math.max(.05,.4-p.o*.003)+rnd()*.2)*(p.t=='C'?1.35-.6*IQ():1))}
function throwTo(r){const q=P.off[0],dd=dist(q,r),T=dd/thr(q,dd);throwAt(r.x+r.vx*T,r.y+r.vy*T)}
function pump(){const b=P.b;if(b.st!='qb'||P.scr||P.run||P.pump>0)return;P.pump=.5;P.def.forEach(p=>{if(!p.rush&&!p.eng&&rnd()<(.75-p.o*.005)*(p.t=='C'?1.3-.6*IQ():1))p.bite=.4+rnd()*.3});G.msg='Pump fake!'}
function aimT(){const a=P.aim,q=P.off[0];let x=(a.a[0]-a.c[0])/S*3,y=(a.a[1]-a.c[1])/S*3;const m=Math.hypot(x,y),rg=34+(q.o-60)*.7;if(m>rg){x*=rg/m;y*=rg/m}return[clamp(q.x+x,1,119),clamp(q.y+y,1,52)]}
function tip(l){Object.assign(P.b,{st:'tip',tt:0,T2:.8,tx:l.x,ty:l.y,x:l.x,y:l.y});G.msg='Tipped! Ball in the air!'}
function tipEnd(){const b=P.b,l={x:b.tx,y:b.ty};let r=null,rd=99,dd=null,m=99;
 P.off.forEach((q,i)=>{if(i&&(i<6||q.route.length)){const e=dist(q,l);if(e<rd){rd=e;r=q}}});P.def.forEach(p=>{const e=dist(p,l);if(e<m){m=e;dd=p}});b.st='dead';
 const sr=r&&rd<3.5?1/(rd+.6):0;let sd=dd&&m<3.5?.55/(m+.6):0;if(G.poss!='U'&&cd.hawk>0&&dist(cd,l)<3.5)sd*=2.5;
 if(sr+sd==0||rnd()>.45)return endPlay('inc');
 if(rnd()<sr/(sr+sd)){b.st='carry';b.c=r;P.rec=r;sRec(P.passer,'pc');sRec(r,'rc')}else{P.intBy=dd;endPlay('int',l.x)}}
function resolve(){const b=P.b,r=b.tgt,l={x:b.tx,y:b.ty};b.st='dead';let dd=null,m=99;P.def.forEach(p=>{const q=dist(p,l);if(q<m){m=q;dd=p}});
 if(G.poss!='U'&&cd.hawk>0&&dist(cd,l)<3.2){dd=cd;m=dist(cd,l);dd.hawked=1}
 const rd=r?dist(r,l):99;
 if(G.poss!='U'&&cd.swat>0&&dist(cd,l)<3.2){if(rnd()<clamp(.55+(cd.o-(r?r.o:55))/100,.2,.85)){G.msg='SWATTED!';return rnd()<.4?tip(l):endPlay('inc')}G.msg='Missed the swat'}
 if(rd>2.4&&m>2.4)return endPlay('inc');
 const hk=dd.hawked?1:0,tight=Math.max(clamp(1-m/3,0,1),hk*.8),ro=r?r.o:55;
 const ic=m<2.4?clamp((.006+tight*.09+(dd.o-ro)/320)*(m<=rd+.3||hk?1:.35)+hk*.25,0,.6):0;
 const cc=r&&rd<2.4?clamp(.95-tight*.5-hk*.15+(ro-dd.o)/200+(P.off[0].o-70)/300-(rd>1.2?.2:0)-(m<rd?.15:0),.05,.95):0,u=rnd();
 if(u<ic)return intReturn(l,dd);
 if(u<ic+cc){b.st='carry';b.c=r;P.rec=r;sRec(P.passer,'pc');sRec(r,'rc')}else if(rnd()<(m<1.8?.4:rd<1.5?.22:.08))tip(l);else endPlay('inc')}
function endPlay0(k,x){if(P.over)return;P.over=1;P.b.st='dead';P.off.concat(P.def).forEach(p=>{G.stm[p.t+p.s+p.i]=p.stm});const d=G.dir,u=G.poss=='U',gl=d>0?110:10;let msg='';x=x==null?P.L:x;
 if(G.two){G.two=0;const ok=k=='td';if(ok)G.sc[u?0:1]+=2;G.msg=ok?'Two-point conversion is good!':'Two-point try fails.';G.next='kick';G.phase='post';G.pt=1.8;save();return}
 if(P.kr&&k!='td'){const own=d>0?10:110;if((x-own)*d<=0){G.nl=own+d*25;G.next='same';G.down=1;G.ytg=10;G.msg='Tackled in the end zone: touchback, ball at the 25.';G.phase='post';G.pt=1.6;save();return}G.nl=clamp(x,11,109);G.next='same';G.down=1;G.ytg=10;G.msg='Returned to the '+Math.round((G.nl-own)*d)+' yard line';G.phase='post';G.pt=1.6;save();return}
 if(k=='td'){G.sc[u?0:1]+=6;msg='TOUCHDOWN!';if(u)R.pts+=3;G.next='xp'}
 else if(k=='int'||k=='fum'){msg=k=='fum'?'FUMBLE! Defense recovers':'INTERCEPTED!';G.next='flip';G.nl=x;if(!u)R.pts+=2}
 else{const own=d>0?10:110;if((k=='sack'||k=='tackle')&&(x-own)*d<=0){G.sc[u?1:0]+=2;if(!u)R.pts+=3;G.next='safety';G.msg='SAFETY! Two points and the ball.';G.phase='post';G.pt=2;save();return}
  const gain=Math.round((x-P.L)*d);
  if(k=='inc'){msg='Incomplete';G.nl=P.L}else{G.nl=clamp(x,11,109);msg=(k=='sack'?'SACK! ':'')+(gain>=0?'Gain of ':'Loss of ')+Math.abs(gain)+' yds';if(k=='sack'&&!u)R.pts+=2}
  if(k!='inc'&&gain>=G.ytg){G.down=1;G.ytg=Math.max(1,Math.min(10,Math.round((gl-G.nl)*d)));msg+=' - FIRST DOWN';if(u)R.pts+=1;G.next='same'}
  else{if(k!='inc')G.ytg-=gain;G.down++;if(G.down>4){G.next='flip';msg+=' - TURNOVER ON DOWNS'}else G.next='same'}}
 G.msg=msg;G.phase='post';G.pt=1.6;save()}
function next(){if(G.ot&&G.sc[0]!=G.sc[1])return finish();
 if(G.next=='xp')return xpFlow();
 if(G.clk<=0&&quarterOver())return;
 const flip=()=>{G.poss=G.poss=='U'?'C':'U';G.dir=-G.dir;G.down=1};
 if(G.next=='kick')return startKick('ko',G.poss);
 else if(G.next=='safety')return startKick('punt',G.poss,G.dir>0?30:90);
 else if(G.next=='flip'){flip();G.los=G.nl;G.ytg=Math.max(1,Math.min(10,Math.round(((G.dir>0?110:10)-G.los)*G.dir)))}
 else G.los=G.nl;
 G.phase='pre';setup();cpuTimeouts()}
function step(dt){
 const d=G.dir,L=P.L,O=P.off,D=P.def,b=P.b,qb=O[0],u=G.poss=='U',[ix,iy,im]=inp();P.t+=dt;P.pump-=dt;clockTick(dt);
 O.concat(D).forEach(p=>p.drag=1);
 { const prs=O.filter(o=>o.eng);if(prs.length)O.concat(D).forEach(p=>{if(p.eng)return;for(const o of prs){const m=o.eng;if(p===o||p===m||(p.help&&p.help===m))continue;if(dist(p,o)<1.0||dist(p,m)<1.0){p.drag=P.b&&P.b.c===p?.65:.3;break}}})}
 careerCd();O.concat(D).forEach(p=>{p.brk=(p.brk||0)-dt;if(p.hrd>0&&p.hrd-dt<=0)p.hrdL=.3;['mc','spin','trk','hrd','hrdL','rm','fk','burst'].forEach(k=>{if(p[k]>0)p[k]-=dt});p.cool-=dt;p.jk-=dt;p.jc-=dt;p.ml-=dt;p.boost-=dt;p.hcool-=dt;p.hk-=dt;p.hawk-=dt;p.swat-=dt;p.swk-=dt;if(p.hs>0){p.hs-=dt;if(p.hs<=0)p.cool=Math.max(p.cool,.7)}});
 if(b.st=='qb'){
  if(P.run){if(P.t>.5){b.st='carry';b.c=O[P.ho];P.rusher=b.c;sRec(b.c,'ra')}else mv(qb,L-6*d,qb.y,3,dt)}
  else{
   if(P.t<.9){mv(qb,L-7*d,qb.y,5.5,dt);qb.fa=d>0?0:Math.PI}
   else if(u&&im&&qbIsMe())mv(qb,qb.x+ix*5,qb.y+iy*5,qb.spd*.95,dt);
   else if((!u||!qbIsMe())&&P.t>.9)cpuQB(dt);
   if(b.st=='qb'&&(qb.x-L)*d>.5){b.st='carry';b.c=qb;P.scr=1;P.rusher=qb;sRec(qb,'ra')}}}
 if(b.st=='qb'&&!P.run&&P.t>=.9){if(P.aim&&u){const t=aimT();face(qb,Math.atan2(t[1]-qb.y,t[0]-qb.x),4,dt)}else if((!u||!qbIsMe())&&P.look)face(qb,Math.atan2(P.look.y-qb.y,P.look.x-qb.x),5,dt);else if(!(u&&im))face(qb,d>0?0:Math.PI,3,dt)}
 if(b.st=='qb'&&!P.run&&P.t>.8&&(qb.y<20.5||qb.y>32.5||dist(qb,{x:L-7*d,y:qb.sy})>4.5))P.sd=1;
 const c=b.st=='carry'?b.c:null,isBl=(r,i)=>i>0&&(P.scr||(i>=4&&!r.route.length&&!(P.run&&i==P.ho)));
 O.forEach((r,i)=>{if(i==0||r==c||r.eng||isBl(r,i))return;
  if((b.st=='air'&&b.tgt==r)||(b.st=='tip'&&Math.hypot(r.x-b.tx,r.y-b.ty)<9))mv(r,b.tx,b.ty,r.spd,dt);
  else if(u&&CAR()&&r.pid===R.me&&im&&!autoMode())mv(r,r.x+ix*5,r.y+iy*5,r.spd,dt);
  else if(P.sd&&b.st=='qb'&&i<6){r.ft-=dt;if(!(r.ft>0)){r.ft=.3;let bs=-9,bt=null;for(const dx of[0,3,6])for(const dy of[-8,-4,0,4,8]){const x=clamp(r.x+d*dx,2,118),y=clamp(r.y+dy,2,51),f=(x-L)*d,dq=Math.hypot(x-qb.x,y-qb.y);if(f<3||dq<5||dq>32)continue;const sc=Math.min(10,...D.map(p=>Math.hypot(p.x-x,p.y-y)))-Math.abs(dq-14)*.1;if(sc>bs){bs=sc;bt=[x,y]}}r.fl=bt||[r.x+d*3,r.y]}mv(r,r.fl[0],r.fl[1],r.spd,dt)}
  else if(r.ri<r.route.length){const w=r.route[r.ri];mv(r,w[0],w[1],r.spd,dt);if(r.vx||r.vy){const mm=Math.hypot(r.vx,r.vy);r.ld=[r.vx/mm,r.vy/mm]}if(Math.hypot(w[0]-r.x,w[1]-r.y)<.4){r.ri++;r.brk=.55;if(r.pid!==R.me||!CAR())aiWrFake(r)}}
  else if(P.run&&i==P.ho&&b.st=='qb')mv(r,L-1*d,r.y,6,dt);
  else if(i<6&&!P.run){let l=r.ld||[d,0];if((r.y<3&&l[1]<0)||(r.y>50&&l[1]>0))l=r.ld=[d,0];mv(r,r.x+l[0]*4,r.y+l[1]*4,r.spd,dt)}else r.vx=r.vy=0});
 const tg0=c||qb;
 O.forEach((o,i)=>{if(o==c||!isBl(o,i))return;const oo=o.o-bPen(o);
  if(!o.eng){o.rt=(o.rt||0)-dt;if(o.rt<=0||!o.tg){o.rt=.15;let best=null,bs=1e9;
   D.forEach(p=>{if(!(P.run||P.scr||p.rush||dist(p,o)<3||dist(p,qb)<7))return;
    const sc=dist(p,o)+(p.eng&&p.eng!=o?5:0)+(!P.run&&!P.scr&&!p.rush?3:0)-(o.blk>=0&&D[o.blk]==p?6:0)-(p.cool>0?2:0);if(sc<bs){bs=sc;best=p}});
   if(best)o.tg=best}}
  if(o.help){const h=o.help;if(P.run||P.scr||!h.eng||h.helper!==o||D.some(p=>p.rush&&!p.eng&&p.cool<=0)){o.help=null;if(h.helper===o)h.helper=null}else{const k=Math.hypot(tg0.x-h.x,tg0.y-h.y)||1;mv(o,h.x+(tg0.x-h.x)/k*1.1,h.y+(tg0.y-h.y)/k*1.1+(o.y>h.y?.9:-.9),o.spd,dt);return}}
  const t=o.eng||o.tg;if(!t)return;
  if(o.eng){t.mt-=dt;const tp=clamp((P.t-2.8)/2.5,0,1);let f=clamp(.11+(t.o-oo)/120+tp*.15+(t.i==1||t.i==2?.06:0),0,.8);if(t.ml>0&&t.mv=='bull')f=Math.min(.9,f+.2);if(t.helper)f*=.6;if(!P.run&&!P.scr&&P.t<.35)f=Math.max(f,.25);let hit=0;
   if(t.mt<=0){t.mt=1.1+rnd()*.6;t.mv=['bull','swim','rip','spin'][rnd()*4|0];o.mv=['anchor','punch','slide'][rnd()*3|0];t.ml=o.ml=.7;
    hit=rnd()<clamp(.14+tp*.14+(t.i==0||t.i==3?.05:0)+(t.o-oo)/100-(t.helper?.1:0)-(t.mv=='bull'&&o.mv=='anchor'?.15:0)-(t.mv=='swim'&&o.mv=='punch'?.12:0)-(t.mv=='rip'&&o.mv=='slide'?.12:0)-(t.mv=='spin'?.06:0),.05,.7)}
   if(hit){if(t.helper){t.helper.help=null;t.helper=null}o.eng=t.eng=null;t.cool=.8;o.cool=.5;o.rt=0;t.boost=.4;if(t.mv!='bull'){o.fa+=Math.PI*.8;o.stun=.3}}
   else if((P.run||P.scr)&&!P.kr){const adv=clamp(.55+(oo-t.o)/60+(P.t<.7?.35:0),-.25,1.2),hole=c?c.y:(O[P.ho]||qb).y,lat=Math.sign(t.y-hole)||0;
    t.x=clamp(t.x+d*adv*3.2*dt,.5,119.5);t.y=clamp(t.y+lat*Math.abs(adv)*1.6*dt,.4,52.6);o.x=t.x-d*1.1;o.y=t.y-lat*.4}
   else{mv(t,tg0.x,tg0.y,t.spd*f,dt);const k=Math.hypot(tg0.x-t.x,tg0.y-t.y)||1;o.x=t.x+(tg0.x-t.x)/k*1.2;o.y=t.y+(tg0.y-t.y)/k*1.2}}
  else{const k=Math.hypot(tg0.x-t.x,tg0.y-t.y)||1;mv(o,t.x+(tg0.x-t.x)/k*1.3,t.y+(tg0.y-t.y)/k*1.3,o.spd*(P.run&&P.t<.8?1.6:1),dt);
   if(dist(o,t)<1.6&&!t.eng&&o.cool<=0&&t.cool<=0){o.eng=t;t.eng=o;t.mt=.8}
   else if(!P.run&&!P.scr&&dist(o,t)<2&&t.eng&&t.eng!==o&&!t.helper&&!o.help&&!D.some(p=>p.rush&&!p.eng&&p.cool<=0)){o.help=t;t.helper=o}}});
 const deep=Math.max(12,Math.max(...O.slice(1,6).map(r=>(r.x-L)*d))+3);
 if(!c&&!P.kr&&!P.run){const el=O.filter((r,i)=>i>0&&i<6&&!isBl(r,i)),cvd=D.filter(p=>!p.rush&&!p.eng);
  // who each coverage defender is on right now: his man, the receiver in his zone, or (empty zone) his man from the snap
  cvd.forEach(p=>{p.zt=null;if(p.sw&&!el.includes(p.sw))p.sw=null;
   if(p.zone){const zz={x:p.zone[0],y:p.zone[1]},deepZ=Math.abs(p.zone[0]-L)>=12,inZ=r=>deepZ?((r.x-L)*d>6&&Math.abs(r.y-zz.y)<(p.zr||10)):dist(r,zz)<(p.zr||7);
    p.zt=el.filter(inZ).sort((a,e)=>dist(a,zz)-dist(e,zz))[0]||null;p.zf=p.zt||!p.smart?null:(p.zm&&el.includes(p.zm)?p.zm:null)}
   p.on=p.sw||p.cover||p.zt||p.zf});
  // linebackers and safeties: if someone else is already on my man and closer to him, go pick up the nearest man nobody has
  cvd.forEach(p=>{if(p.bite>0)return;const lbS=(p.i>=4&&p.i<=6)||p.i>=9;p.rt2=(p.rt2||0)-dt;if(!lbS||!p.on||p.rt2>0||!p.smart)return;p.rt2=.3;
   const mine=p.on;if(!cvd.some(q=>q!==p&&q.on===mine&&dist(q,mine)<=dist(p,mine)))return;
   const open=el.filter(r=>r!==mine&&!cvd.some(q=>q!==p&&(q.on===r||dist(q,r)<3))).sort((a,e)=>dist(a,p)-dist(e,p))[0];
   if(open){p.sw=open;p.on=open;if(p.cover){p.cover=open;p.cx=p.cy=null}}})}
 D.forEach((p,i)=>{if(p.eng)return;p.bite-=dt;let tx,ty,sp=p.spd*.98;
  if(p.bite>0){tx=p.x;ty=p.y}
  else if(P.kr&&c&&p.ksafe&&dist(p,c)>9){tx=c.x+d*Math.min(8,dist(p,c)*.4);ty=c.y}
  else if(P.kr&&c&&dist(p,c)>13){tx=c.x;ty=p.ly}
  else if(c){const dc=dist(p,c),lt=Math.min(.35,dc/(p.spd*2.2));tx=dc<3?c.x:c.x+c.vx*lt;ty=dc<3?c.y:c.y+c.vy*lt;sp=p.spd}
  else if(((b.st=='air'&&b.t>p.rt)||b.st=='tip')&&Math.hypot(p.x-b.tx,p.y-b.ty)<16){tx=b.tx;ty=b.ty;sp=p.spd*1.05}
  else if(p.rush){tx=qb.x+qb.vx*.3;ty=qb.y+qb.vy*.3;sp=p.spd}
  else if((p.cover||p.sw||p.zf)&&!c&&cutLag(p,p.cover||p.sw||p.zf)){tx=p.x+p.vx*.5;ty=p.y+p.vy*.5}
  else if(p.cover){const k=clamp(dt*(2.5+p.o*.04)*(i==7||i==8?.75:1),0,1),v=p.cover;p.cx=p.cx==null?v.x:p.cx+(v.x-p.cx)*k;p.cy=p.cy==null?v.y:p.cy+(v.y-p.cy)*k;tx=p.cx+v.vx*.3+d*1.2;ty=p.cy+v.vy*.3}
  else if((p.sw||p.zf)&&!c){const v=p.sw||p.zf;tx=v.x+v.vx*.3+d*1.5;ty=v.y+v.vy*.3}
  else{const z=p.zone;
   if(Math.abs(z[0]-L)>=12){const rr=O.slice(1,6).filter(r=>(r.x-L)*d>6&&Math.abs(r.y-z[1])<(p.zr||10)).sort((a,e)=>(e.x-a.x)*d)[0];tx=L+d*deep;ty=rr?(z[1]+rr.y)/2:z[1]}
   else{const zz={x:z[0],y:z[1]},r=O.slice(1,6).filter(r=>dist(r,zz)<(p.zr||7)).sort((a,e)=>dist(a,zz)-dist(e,zz))[0];tx=r?r.x+d*1.5:z[0];ty=r?r.y:z[1]}}
  if(!u&&p==cd&&im&&!autoMode())mv(p,p.x+ix*5,p.y+iy*5,p.spd*1.05*(p.hs>0?1.4:1),dt);else mv(p,tx,ty,sp*(p.hs>0?1.4:1)*(p.boost>0?1.1:1),dt)});
 if(c){if(u&&(!CAR()||(c.pid===R.me&&!autoMode()))){if(im)mv(c,c.x+ix*5,c.y+iy*5,c.spd*.95*(c.jk>0?1.15:1),dt);else c.vx=c.vy=0}
  else cpuRun(c,dt)}
 if(b.st=='air'){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;if(k>=1)resolve()}
 else if(c){b.x=c.x;b.y=c.y}else if(b.st=='qb'){b.x=qb.x;b.y=qb.y}else if(b.st=='tip'){b.tt+=dt;if(b.tt>=b.T2)tipEnd()}
 const h=c||(b.st=='qb'?qb:null);
 if(h)D.forEach(p=>{const col=p.eng&&((h==qb&&b.st=='qb')||(c&&P.kr))&&dist(p,h)<1.9;if((p.eng&&!col)||p.cool>0||dist(p,h)>(p.hs>0?1.8:col?1.9:1.3))return;p.cool=col?.5:.25;
  let pr=h==qb&&!P.scr?.6:clamp(.55+(p.o-h.o)/160,.25,.9);if(col)pr*=.6;if(h.jk>0)pr*=p.hs>0?.5:.12;if(p.hs>0)pr=Math.min(.97,pr+.3);pr*=tackleMod(p,h);
  if(rnd()<pr){P.tkl=p;if(!(c&&(c.y<.8||c.y>52.2)))ragTackle(p,h);if(p.hs>0&&h!=qb&&rnd()<.07+(p.o-h.o)/400){p.hs=0;return endPlay('fum',h.x)}endPlay(b.st=='qb'?'sack':'tackle',h.x-(p.hs>0?d*1.5:0))}else brokeTackle(p,h)});
 if(c&&!P.over){if(c.y<.8||c.y>52.2){P.oob=1;endPlay('tackle',c.x)}else if((c.x-(d>0?110:10))*d>=0)endPlay('td')}}
function swt(){const D=P.def;if(G.phase=='pre'){const o=[...D].sort((a,b)=>a.y-b.y);cd=o[(o.indexOf(cd)+1)%11];G.cdi=P.def.indexOf(cd);return}const b=P.b,f=b.st=='carry'?b.c:b;cd=D.filter(p=>p!=cd).reduce((a,p)=>dist(p,f)<dist(a,f)?p:a)}
function press(){if(G.phase!='play'||P.b.st!='qb'||P.t>1.6){G.msg='Press right after the snap';return}if(cd.pr){G.msg='Already pressed';return}
 let r=null,m=4;P.off.slice(1,6).forEach(q=>{const e=dist(q,cd);if(e<m){m=e;r=q}});if(!r){G.msg='No receiver in reach - get next to a WR first';return}cd.pr=1;
 if(rnd()<clamp(.5+(cd.o-r.o)/100,.2,.85)){r.stun=.7;G.msg='Jammed at the line!'}else{cd.stun=.5;G.msg='Beaten at the line'}}
function hit(k){if(!$('modal').hidden)return;if(k=='enter')snap();const u=G.poss=='U';
 if(autoMode())return;
 if(!u&&(G.phase=='pre'||G.phase=='play')){if(k==' '&&!CAR()){swt();G.msg='Controlling the '+cd.pos}
  if(G.phase=='play'&&'1234'.includes(k)&&k.length==1)rushMove({1:'bull',2:'swim',3:'rip',4:'spin'}[k]);
  if(G.phase=='play'){
  if(k=='e'){if(cd.hk>0)G.msg='Intercept recharging';else{cd.hawk=.5;cd.hk=1.2;G.msg=P.b.st=='air'?'Hands up!':'Time it as the ball arrives'}}
  if(k=='f'){if(cd.hcool>0)G.msg='Hit stick recharging';else{cd.hs=.35;cd.hcool=1.4;G.msg='Hit stick!'}}
  if(k=='r'){if(cd.swk>0)G.msg='Swat recharging';else{cd.swat=.45;cd.swk=1;G.msg=P.b.st=='air'?'Swat!':'Time the swat as the ball arrives'}}
  if(k=='g')press()}}
 if(G.phase!='play'||!u)return;
 const c=P.b.st=='carry'?P.b.c:null,me=careerMe();
 if(c){if(CAR()&&c!==me)return;if(k==' '||k=='q'||k=='e')juke(c,k=='q'?-1:k=='e'?1:null);if(k=='z')cmove(c,'spin');if(k=='x')cmove(c,'truck');if(k=='c')cmove(c,'hurdle');return}
 if(P.b.st=='qb'&&qbIsMe()){if(k==' ')pump();if(k=='q'||k=='e')juke(P.off[0],k=='q'?-1:1);return}
 if(CAR()&&me&&P.off.includes(me)){if(k=='z')wrMove(me,'fake');if(k=='x')wrMove(me,'burst');if(k=='c')wrMove(me,'release')}}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=1;if(k==' '||k.startsWith('arrow'))e.preventDefault();hit(k)});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
$('snap').onclick=snap;$('rb').textContent='Lobby';$('rb').onclick=()=>{if(G.phase!='play')lobby()};$('help').textContent='Offense: drag back on the field to aim, release to throw. The white cone is what your QB can see - throws outside it are wild. A tiny pull or Space = pump fake. With the ball: Space = juke (Q/E = juke left/right), Z = spin, X = truck, C = hurdle. In the pocket, Q/E = juke a rusher. Rushing the passer while blocked: 1 = bull rush, 2 = swim, 3 = rip, 4 = spin. Career mode as a receiver: Z = head fake, X = burst, C = release at the line. Move: arrows/WASD. Defense: Space/Switch changes player (works pre-snap too, or tap a defender). E = time an intercept, F = hit stick, G = press the nearest receiver right after the snap, R = swat the ball as it arrives.';
function chg(fn){if(G.called){if(G.aud<1){G.msg='No audibles left this half';return}G.aud--;G.msg='Audible!'}G.called=1;fn()}
$('plays').onclick=e=>{const el=e.target.closest&&e.target.closest('[data-p],[data-d],[data-a]'),t=el?el.dataset:{};if(t.a=='pb'){G.pbOpen=!G.pbOpen;return ui()}if(t.p||t.d)G.pbOpen=false;if(t.p){if(t.p!=P.name)chg(()=>{applyPlay(t.p);sel=-1});else applyPlay(t.p)}
 if(t.d)applyDef(t.d);if(t.a=='skip')return skipDrive();if(t.a=='to'){callTO(0);return}if(t.a=='hurry'){G.hurry=G.hurry?0:1;return ui()}if(t.a=='spike')return spike();if(t.a=='kneel')return kneel();if(t.a=='tb')return chTb();if(t.a=='ret')return chRet();if(t.a=='xp')return chXp();if(t.a=='two')return chTwo();if(t.a=='punt')return doPunt();if(t.a=='fg')return doFG();if(t.a=='run')chg(()=>P.run=P.run?0:1);if(t.a=='ed')editor();ui()};
function ui(){const u=G.poss=='U',pre=G.phase=='pre';
 if(G.ch){$('plays').innerHTML=G.ch.k=='tb'?'<button data-a="tb">Take the touchback</button><button data-a="ret">Return it</button>':'<button data-a="xp">Kick the extra point</button><button data-a="two">Go for 2</button>';$('snap').style.display='none';return}
 $('plays').innerHTML=pre?(u?Object.keys(allP()).map(n=>`<button data-p="${n}" class="${P.name==n?'on':''}">${n}</button>`).join('')+`<button data-a="run" class="${P.run?'on':''}">${P.run?'Run play':'Pass play'}</button><button data-a="ed">Edit plays</button><button data-a="hurry" class="${G.hurry?'on':''}">Hurry-up ${G.hurry?'on':'off'}</button>${G.run&&G.down<4?'<button data-a="spike">Spike</button>':''}<button data-a="kneel">Kneel</button>${G.down==4?`<button data-a="punt">Punt</button><button data-a="fg">Field goal (${fgDist()} yd)</button>`:''}`:Object.keys(DALL()).map(n=>`<button data-d="${n}" class="${P.dpn==n?'on':''}">${n}</button>`).join('')):'';
 if(pre&&G.run&&G.to[0]>0)$('plays').insertAdjacentHTML('beforeend',`<button data-a="to">Timeout (${G.to[0]} left)</button>`);
 $('snap').style.display=pre?'':'none';$('dctl').style.display=!u&&G.phase!='over'?'flex':'none';$('act').style.visibility=u?'visible':'hidden';
 if(CAR())careerUi(pre,u)}
function draw(){const L=P.L,d=G.dir,b=P.b;camX+=(clamp((G.phase=='play'?b.x:L)-48,-2,26)-camX)*.1;
 const px=x=>(x-camX)*S,py=y=>y*S+5;
 X.fillStyle='#2e7d32';X.fillRect(0,0,W,H);
 X.fillStyle='#1b4f8a';X.fillRect(px(0),0,10*S,H);X.fillStyle='#8a1b2a';X.fillRect(px(110),0,10*S,H);
 X.strokeStyle='#ffffff55';X.lineWidth=1;X.fillStyle='#ffffff88';X.font='bold 20px sans-serif';
 for(let x=10;x<=110;x+=5){X.beginPath();X.moveTo(px(x),0);X.lineTo(px(x),H);X.stroke();if(x%10==0&&x>10&&x<110){const n=x<=60?x-10:110-x;X.fillText(n,px(x)-10,py(10));X.fillText(n,px(x)-10,py(45))}}
 X.lineWidth=3;X.strokeStyle='#4aa3ff';X.beginPath();X.moveTo(px(L),0);X.lineTo(px(L),H);X.stroke();
 X.strokeStyle='#ffd84d';X.beginPath();X.moveTo(px(L+G.ytg*d),0);X.lineTo(px(L+G.ytg*d),H);X.stroke();
 if(G.poss=='U'&&G.phase=='pre')P.off.slice(1).forEach((p,k)=>{if(!p.route.length)return;X.strokeStyle=sel==k+1?'#ffd84d':'#fff9';X.lineWidth=2;X.setLineDash([6,4]);X.beginPath();const s0=p.mo&&p.mo.length?p.mo[p.mo.length-1]:[p.sx,p.sy];X.moveTo(px(s0[0]),py(s0[1]));p.route.forEach(w=>X.lineTo(px(w[0]),py(w[1])));X.stroke();X.setLineDash([])});
 if(G.poss=='U'&&G.phase=='pre')P.off.forEach(p=>{if(p.mo&&p.mo.length){X.strokeStyle='#ff9f43';X.lineWidth=2;X.setLineDash([2,4]);X.beginPath();X.moveTo(px(p.sx),py(p.sy));p.mo.forEach(w=>X.lineTo(px(w[0]),py(w[1])));X.stroke();X.setLineDash([])}});
 if((b.st=='qb'||b.st=='pre')&&!P.run&&(G.phase=='play'||G.phase=='pre'||G.phase=='motion')){const q=P.off[0],hf=coneHalf(q),rad=Math.min(34+(q.sk.str-60)*.7,45)*S*.8;X.save();X.fillStyle='rgba(255,255,255,.12)';X.strokeStyle='rgba(255,255,255,.55)';X.lineWidth=1.5;X.beginPath();X.moveTo(px(q.x),py(q.y));X.arc(px(q.x),py(q.y),rad,q.fa-hf,q.fa+hf);X.closePath();X.fill();X.stroke();X.restore()}
 const ctl=G.poss=='U'?(b.st=='carry'?b.c:(b.st=='qb'||b.st=='pre'?P.off[0]:null)):cd;
 P.off.concat(P.def).forEach(p=>{const o=p.s=='O';X.fillStyle=p.t=='U'?'#3b82f6':'#ef4444';X.beginPath();X.arc(px(p.x),py(p.y),o?8:9,0,7);X.fill();X.strokeStyle='#fff';X.lineWidth=2;X.beginPath();X.moveTo(px(p.x),py(p.y));X.lineTo(px(p.x)+Math.cos(p.fa)*13,py(p.y)+Math.sin(p.fa)*13);X.stroke();
  if(p==cd&&G.poss!='U'||sel>0&&p==P.off[sel]){X.strokeStyle=p==cd?'#fff':'#ffd84d';X.lineWidth=3;X.stroke()}
  X.fillStyle='#fff';X.font='bold 10px sans-serif';X.textAlign='center';const k=o?P.off.indexOf(p):0;X.fillText(p.pos,px(p.x),py(p.y)+3);if(p.ml>0){X.fillStyle='#ffd84d';X.fillText(p.mv,px(p.x),py(p.y)-13)}if(p==ctl){X.strokeStyle='#ffd84d';X.lineWidth=3;X.beginPath();X.arc(px(p.x),py(p.y),15,0,7);X.stroke();X.strokeStyle='#fff';X.lineWidth=1.5;X.beginPath();X.arc(px(p.x),py(p.y),18,0,7);X.stroke()}});
 if(P.look&&G.poss!='U'&&P.b.st=='qb'){const q=P.off[0],l=P.look;X.save();X.strokeStyle='#ff4d4d';X.lineWidth=2;X.setLineDash([3,5]);X.beginPath();X.moveTo(px(q.x),py(q.y));X.lineTo(px(l.x),py(l.y));X.stroke();X.setLineDash([]);X.beginPath();X.arc(px(l.x),py(l.y),13,0,7);X.stroke();X.fillStyle='#ff4d4d';X.font='bold 10px sans-serif';X.textAlign='center';X.fillText('QB EYES',px(l.x),py(l.y)-17);X.restore()}
 if(P.aim){const t=aimT(),q=P.off[0],n=Math.max(2,Math.hypot(t[0]-q.x,t[1]-q.y)/1.5|0);X.fillStyle='#fff';for(let i=1;i<=n;i++){const f=i/n;X.beginPath();X.arc(px(q.x+(t[0]-q.x)*f),py(q.y+(t[1]-q.y)*f),2.5,0,7);X.fill()}X.strokeStyle='#fff';X.lineWidth=2;X.beginPath();X.arc(px(t[0]),py(t[1]),8,0,7);X.stroke()}
 [ctl,b.st=='carry'?b.c:null].forEach((p,i)=>{if(!p||(i==1&&p==ctl))return;const v=(p.stm==null?100:p.stm)/100;X.fillStyle='#000a';X.fillRect(px(p.x)-14,py(p.y)-26,28,5);X.fillStyle=v>.3?'#4ade80':v>.1?'#fbbf24':'#ef4444';X.fillRect(px(p.x)-13,py(p.y)-25,26*v,3)});
 if(ctl){const v=(ctl.stm==null?100:ctl.stm)/100;X.fillStyle='#000a';X.fillRect(W-170,6,160,20);X.fillStyle=v>.3?'#4ade80':v>.1?'#fbbf24':'#ef4444';X.fillRect(W-168,8,156*v,16);X.fillStyle='#fff';X.font='bold 11px sans-serif';X.textAlign='right';X.fillText('STAMINA',W-14,20)}
 X.textAlign='left';X.fillStyle='#8b5a2b';X.beginPath();X.ellipse(px(b.x),py(b.y)-(b.st=='air'?8:b.st=='tip'?4+Math.sin(Math.PI*Math.min(1,b.tt/b.T2))*18:0),6,4,0,0,7);X.fill();
 if(G.poss!='U'&&cd){const bs=$('dctl').children;if(bs[3]){bs[1].style.opacity=cd.hk>0?.4:1;bs[2].style.opacity=cd.hcool>0?.4:1;bs[3].style.opacity=(cd.pr||P.t>1.6||P.b.st!='qb')?.4:1;bs[4].style.opacity=cd.swk>0?.4:1}}
 const m=Math.max(0,G.clk|0);$('hud').textContent=`YOU ${G.sc[0]} - ${G.sc[1]} ${G.opp.n.slice(0,14)}   Q${G.q}${G.ot?' OT':''} ${m/60|0}:${String(m%60).padStart(2,'0')}   ${G.down} & ${G.ytg}   ${G.poss=='U'?'Your ball':'CPU ball'}   Audibles: ${G.aud}`;$('msg').textContent=G.msg}
let last=0;function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;
 try{moveBar();if(careerLoop(dt)){}else if(G.phase=='play')step(dt);else if(G.phase=='motion')motionStep(dt);else if(G.phase=='post'){G.pt-=dt;postStep(dt);if(G.pt<=0)next()}draw()}catch(e){console.error(e)}requestAnimationFrame(loop)}
const wp=e=>{const r=C.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
C.addEventListener('pointerdown',e=>{if(G.phase=='play'&&G.poss=='U'&&P.b.st=='qb'&&!P.scr&&!P.run&&qbIsMe()&&!autoMode()){P.aim={a:wp(e),c:wp(e)};C.setPointerCapture(e.pointerId)}});
C.addEventListener('pointermove',e=>{if(P.aim)P.aim.c=wp(e)});
C.addEventListener('pointerup',()=>{const a=P.aim;if(!a)return;const m=Math.hypot(a.a[0]-a.c[0],a.a[1]-a.c[1])/S;if(m<2){P.aim=null;return pump()}const t=aimT();P.aim=null;throwAt(t[0],t[1])});
let E=null,ec=null;
function editor(){if(!E)E={n:'Slants',pl:clone(allP().Slants),sel:1,mode:'move',drag:0};
 $('modal').hidden=0;$('modal').innerHTML='<div id="ed"><div id="edt"></div><canvas id="ec" width="960" height="540"></canvas><p>Move: drag players anywhere. Route: click the field to add waypoints for the selected player. Block: click a red ghost defender to assign the selected blocker. Motion: click the field to draw a pre-snap motion path (orange); the route then starts from where he ends up. Players and motion have to stay behind the blue line (the red side is off limits). Pick a receiver or lineman by clicking him.</p></div>';
 ec=$('ec');const ep=e=>{const r=ec.getBoundingClientRect();return[((e.clientX-r.left)/r.width*960-300)/S,((e.clientY-r.top)/r.height*H-5)/S]};
 ec.onpointerdown=e=>{const[x,y]=ep(e),p=E.pl.p,h=p.findIndex(q=>Math.hypot(q[0]-x,q[1]-y)<1.6);
  if(E.mode=='block'){const j=FDX.findIndex((dx,j)=>Math.hypot(dx-x,FDY[j]-y)<1.8);if(j>=0)p[E.sel][3]=j;else if(h>=0)E.sel=h;else p[E.sel][3]=-1}
  else if(h>=0){E.sel=h;if(E.mode=='move')E.drag=1}
  else if(E.mode=='route'){const q=p[E.sel];q[2].push([x-q[0],y-q[1]])}
  else if(E.mode=='motion'){const q=p[E.sel];(q[4]=q[4]||[]).push([Math.min(x,-.5)-q[0],y-q[1]])}
  edraw()};
 ec.onpointermove=e=>{if(E.drag){const[x,y]=ep(e),q=E.pl.p[E.sel];q[0]=clamp(Math.round(x*2)/2,-12,-.5);q[1]=clamp(Math.round(y*2)/2,1,52);edraw()}};
 ec.onpointerup=()=>E.drag=0;edUI()}
function edUI(){const pl=E.pl,B=(e,t,n,on)=>`<button data-e="${e}" data-n="${n||''}" class="${on?'on':''}">${t}</button>`;
 $('edt').innerHTML=Object.keys(allP()).map(n=>B('load',n,n,E.n==n)).join('')+'<br>'+['move','route','motion','block'].map(m=>B('mode',m,m,E.mode==m)).join('')+B('undo','Undo point')+B('clr','Clear route')+B('run',pl.run?'Run play':'Pass play','',pl.run)+B('ho','Handoff to #'+pl.ho)+B('save','Save as...')+(CP[E.n]?B('del','Delete'):'')+B('done','Done');edraw()}
$('modal').onclick=e=>{const t=e.target.dataset;if(!t.e||!E)return;const q=E.pl.p[E.sel];
 if(t.e=='load'){E.n=t.n;E.pl=clone(allP()[t.n]);E.sel=1}
 if(t.e=='mode')E.mode=t.n;if(t.e=='undo'){if(E.mode=='motion'&&q[4])q[4].pop();else q[2].pop()}if(t.e=='clr'){if(E.mode=='motion')q[4]=null;else q[2]=[]}if(t.e=='run')E.pl.run=E.pl.run?0:1;if(t.e=='ho')E.pl.ho=E.pl.ho%5+1;
 if(t.e=='save'){const n=(prompt('Play name',E.n)||'').replace(/[^\w ]/g,'').slice(0,14);if(n){CP[n]=clone(E.pl);lsSet('gd2p',JSON.stringify(CP));E.n=n}}
 if(t.e=='del'){delete CP[E.n];E.n='Slants';E.pl=clone(allP().Slants);lsSet('gd2p',JSON.stringify(CP))}
 if(t.e=='done'){if(JSON.stringify(E.pl)!=JSON.stringify(allP()[E.n])){CP[E.n]=clone(E.pl);lsSet('gd2p',JSON.stringify(CP))}if(G.live&&G.phase=='pre'&&G.poss=='U')applyPlay(E.n);return lobby()}edUI()};
function edraw(){const g=ec.getContext('2d'),ex=x=>300+x*S,ey=y=>y*S+5,W=960;g.fillStyle='#2e7d32';g.fillRect(0,0,W,H);g.textAlign='center';g.font='9px sans-serif';
 g.strokeStyle='#fff6';g.lineWidth=1;for(let x=-30;x<70;x+=5){g.beginPath();g.moveTo(ex(x),0);g.lineTo(ex(x),H);g.stroke()}
 g.strokeStyle='#4aa3ff';g.lineWidth=3;g.beginPath();g.moveTo(ex(0),0);g.lineTo(ex(0),H);g.stroke();g.fillStyle='rgba(239,68,68,.13)';g.fillRect(ex(-.5),0,W,H);
 FDX.forEach((x,j)=>{g.fillStyle='#ef444466';g.beginPath();g.arc(ex(x),ey(FDY[j]),9,0,7);g.fill();g.fillStyle='#fff';g.fillText(PD[j],ex(x),ey(FDY[j])+3)});
 E.pl.p.forEach((q,i)=>{const s=i==E.sel;
  if(q[3]>=0){g.strokeStyle='#ff7b7b';g.lineWidth=2;g.beginPath();g.moveTo(ex(q[0]),ey(q[1]));g.lineTo(ex(FDX[q[3]]),ey(FDY[q[3]]));g.stroke()}
  if(q[2].length){g.strokeStyle=s?'#ffd84d':'#fffc';g.lineWidth=2;g.setLineDash([6,4]);g.beginPath();g.moveTo(ex(q[0]),ey(q[1]));q[2].forEach(w=>g.lineTo(ex(q[0]+w[0]),ey(q[1]+w[1])));g.stroke();g.setLineDash([])}
  if(q[4]&&q[4].length){g.strokeStyle='#ff9f43';g.lineWidth=2;g.setLineDash([2,4]);g.beginPath();g.moveTo(ex(q[0]),ey(q[1]));q[4].forEach(w=>g.lineTo(ex(q[0]+w[0]),ey(q[1]+w[1])));g.stroke();g.setLineDash([])}
  g.fillStyle='#3b82f6';g.beginPath();g.arc(ex(q[0]),ey(q[1]),9,0,7);g.fill();if(s){g.strokeStyle='#ffd84d';g.lineWidth=3;g.stroke()}
  g.fillStyle='#fff';g.fillText(PO[i],ex(q[0]),ey(q[1])+3)})}
const dc2=document.createElement('div');dc2.id='dctl';dc2.innerHTML='<button data-k=" ">Switch</button><button data-k="e">Intercept</button><button data-k="f">Hit stick</button><button data-k="g">Press</button><button data-k="r">Swat</button>';$('bar').appendChild(dc2);
dc2.onpointerdown=e=>{const k=e.target.dataset.k;if(k){e.preventDefault();hit(k)}};
C.addEventListener('pointerdown',e=>{if(G.poss!='U'&&(G.phase=='pre'||G.phase=='play')&&!CAR()){const[a,c]=wp(e),[x,y]=unproj(a,c);let m=2.5;P.def.forEach(p=>{const q=Math.hypot(p.x-x,p.y-y);if(q<m){m=q;cd=p}});if(G.phase=='pre')G.cdi=P.def.indexOf(cd)}});
const st=$('stick');let sp=null;
const sj=e=>{const r=st.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}joy=m<.2?[0,0]:[x,y];st.firstElementChild.style.transform=`translate(${x*35}px,${y*35}px)`};
st.onpointerdown=e=>{e.preventDefault();sp=e.pointerId;st.setPointerCapture(sp);sj(e)};st.onpointermove=e=>{if(e.pointerId==sp)sj(e)};
st.onpointerup=st.onpointercancel=()=>{sp=null;joy=[0,0];st.firstElementChild.style.transform=''};
$('act').onpointerdown=e=>{e.preventDefault();hit(' ')};$('mv').onpointerdown=e=>{const k=e.target.dataset.k;if(k){e.preventDefault();hit(k)}};$('rot').onclick=()=>$('rot').remove();
newGame();requestAnimationFrame(loop);
