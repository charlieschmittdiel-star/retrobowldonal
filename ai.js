'use strict';
// CPU intelligence, clock management and in-game stat tracking. Difficulty (IQ) only changes decisions, never ratings.
// ---------- stats ----------
function sRec(p,k,n){if(!p||!p.pid||!G||!G.box)return;(G.box[p.pid]=G.box[p.pid]||newSS())[SI[k]]+=(n==null?1:n)}
function stId(id,k,n){if(!id||!G||!G.box)return;(G.box[id]=G.box[id]||newSS())[SI[k]]+=(n==null?1:n)}
function recordPlay(k,x){if(!G.box||P.kr||G.two||P.knl||P.spk)return;const d=G.dir,gain=Math.round(((x==null?P.L:x)-P.L)*d);
 if(G.poss=='U'&&P.dpn){G.dburn=G.dburn||{};G.dburn[P.dpn]=(G.dburn[P.dpn]||0)+(k=='inc'?-2:k=='int'||k=='sack'?-6:gain)}
 if(k=='sack'){sRec(P.tkl,'sk');return}
 if(k=='int'){sRec(P.passer,'pi');sRec(P.intBy,'in');return}
 if(k=='tackle'||k=='td'){const g=k=='td'?Math.round(((d>0?110:10)-P.L)*d):gain;
  if(P.rec){sRec(P.rec,'ty',g);sRec(P.passer,'py',g);if(k=='td'){sRec(P.rec,'tt');sRec(P.passer,'ptd')}}
  else if(P.rusher){sRec(P.rusher,'ry',g);if(k=='td')sRec(P.rusher,'rtd')}
  if(k=='tackle'&&P.tkl&&!P.oob)sRec(P.tkl,'tk')}}
// ---------- clock ----------
const QLEN=()=>(R.qlen||4)*60;
const lateHalf=()=>(G.q==2&&G.clk<=120)||(G.q>=4&&G.clk<=300);
function hudText(){const m=Math.max(0,Math.ceil(G.clk)),q=G.q==5?'OT':'Q'+G.q;
 return`YOU ${G.sc[0]} - ${G.sc[1]} ${G.opp.n.slice(0,14)}  ${q} ${m/60|0}:${String(m%60).padStart(2,'0')} ${G.run?'(running)':'(stopped)'}  ${G.down} & ${G.ytg}  TO ${G.to[0]}-${G.to[1]}  ${G.poss=='U'?'Your ball':'CPU ball'}  Audibles ${G.aud}`}
// Runoff between plays when the clock is running: huddle ~25s, hurry-up ~8s, milking ~38s.
function cpuRunoff(){const iq=IQ(),lead=G.sc[1]-G.sc[0];if(rnd()>iq+.15)return 25;
 if(lead>0&&((G.q>=4&&G.clk<=480)||(G.q==2&&G.clk<=120&&false)))return 38;
 if(lead<0&&G.q>=4&&G.clk<=360)return 8;if(G.q==2&&G.clk<=120)return 9;return 25}
function clockAtSnap(){if(P.ranoff)return false;P.ranoff=1;if(!G.run)return false;
 const r=G.poss=='U'?(G.hurry?8:25):cpuRunoff();
 if((G.q==2||G.q==4)&&!G['w'+G.q]&&G.clk>120&&G.clk-r<=120){G['w'+G.q]=1;G.clk=120;G.run=false;P.ranoff=0;G.msg='Two-minute warning. The clock is stopped.';ui();return true}
 G.clk-=r;if(G.clk<=0){G.clk=0;P.over=1;G.msg='Time runs out.';G.phase='post';G.pt=1.4;G.next='same';G.nl=P.L;ui();return true}
 return false}
function clockTick(dt){const was=G.clk;G.clk=Math.max(0,G.clk-dt);if((G.q==2||G.q==4)&&!G['w'+G.q]&&was>120&&G.clk<=120){G['w'+G.q]=1;P.w2=1}}
function afterPlay(k){let run=!(k=='inc'||k=='td'||k=='int'||k=='fum');if(P.oob&&lateHalf())run=false;
 if(G.next!='same'||P.kr||P.w2||P.spk)run=false;G.run=run;if(P.w2)G.msg+=' - Two-minute warning.'}
function endPlay(k,x){if(P.over)return;recordPlay(k,x);endPlay0(k,x);afterPlay(k);if(G.ot&&G.sc[0]!=G.sc[1])G.clk=0}
function quarterOver(){const q=G.q;
 if(q==1||q==3){G.q++;G.clk=QLEN();G.msg+=` End of the ${q==1?'1st':'3rd'} quarter.`;return false}
 if(q==2){G.q=3;G.clk=QLEN();G.to=[3,3];G.aud=audN();G.run=false;G.two=0;startKick('ko',G.recv=='U'?'U':'C');G.msg='Halftime is over. '+G.msg;return true}
 if(q==4&&G.sc[0]==G.sc[1]&&!G.ot){G.q=5;G.ot=1;G.clk=Math.round(QLEN()*.75);G.to=[2,2];G.run=false;G.two=0;startKick('ko',rnd()<.5?'U':'C');G.msg='Overtime! First score wins. '+G.msg;return true}
 finish();return true}
function callTO(side){if(G.phase!='pre'||!G.run||G.to[side]<1)return false;G.to[side]--;G.run=false;G.msg=(side?'CPU':'You')+' called a timeout. The clock is stopped.';ui();return true}
function spike(){if(G.phase!='pre'||G.poss!='U'||G.ch||G.down>=4)return;if(G.run)G.clk=Math.max(0,G.clk-3);P.spk=1;P.ranoff=1;G.phase='play';endPlay('inc');G.msg='Spiked to stop the clock. '+G.msg}
function kneel(){if(G.phase!='pre'||G.ch)return;if(G.run&&!P.ranoff){G.clk=Math.max(0,G.clk-38);if(G.clk<=0){P.over=1;G.phase='post';G.pt=1.2;G.next='same';G.nl=P.L;G.msg='Kneel. Time runs out.';return}}
 G.clk=Math.max(0,G.clk-2);P.knl=1;P.ranoff=1;G.phase='play';endPlay('tackle',P.L-G.dir);G.msg='Kneel down. '+G.msg}
// The CPU manages its own clock: kneels to close games, spikes and uses timeouts when it needs time.
function cpuClockPre(){const iq=IQ(),lead=G.sc[1]-G.sc[0];if(G.poss!='C'||rnd()>iq+.05)return false;
 if(lead>0&&G.q>=4){const left=5-G.down,w2=G.q==4&&!G.w4&&G.clk>120?1:0,can=2+(left-1-G.to[0]-w2)*40;if(left>=1&&G.clk<=can)return kneel(),true}
 if(lead<=0&&G.run&&(G.q>=4||G.q==2)&&G.clk<=30&&G.down<4&&G.to[1]<1)return spike2(),true;
 return false}
function spike2(){if(G.run)G.clk=Math.max(0,G.clk-3);P.spk=1;P.ranoff=1;G.phase='play';endPlay('inc');G.msg='CPU spikes the ball. '+G.msg}
function cpuTimeouts(){if(G.phase!='pre'||!G.run||G.to[1]<1)return;const iq=IQ();if(rnd()>iq)return;const lead=G.sc[1]-G.sc[0];
 if(G.poss=='C'&&lead<=0&&((G.q>=4&&G.clk<=150)||(G.q==2&&G.clk<=60)))callTO(1);
 else if(G.poss=='U'&&lead<0&&G.q>=4&&G.clk<=200&&G.clk>15)callTO(1)}
// ---------- tendencies ----------
function sitKey(){return(G.down>=3?'3':'e')+(G.ytg<=3?'s':G.ytg>=8?'l':'m')}
function trackSnap(){if(G.poss=='U'){G.otd=G.otd||{};const k=sitKey(),h=G.otd[k]=G.otd[k]||{r:0,p:0};if(P.run)h.r++;else h.p++}
 else if(P.dp){G.dtd=G.dtd||{};const ps=P.dp.p,ru=ps.filter(e=>e[2]=='r').length,ty=ru>=6?'blitz':ps.some(e=>e[2]=='m')?'man':'zone';G.dtd[ty]=(G.dtd[ty]||0)+1}}
// ---------- CPU play calling ----------
function cpuPlay(){const iq=IQ(),k=Object.keys(PRE),pick=a=>a[rnd()*a.length|0];if(rnd()>iq)return pick(k);
 const lead=G.sc[1]-G.sc[0],has=n=>PRE[n],runs=['Run','Draw','Jet Sweep'].filter(has),quick=['Slants','Mesh','Motion Mesh'].filter(has),deep=['Go','Verts','Post Corner'].filter(has),mid=['Curls','Slants','Post Corner','Mesh'].filter(has);
 let pool;
 if(lead>0&&G.q>=4&&G.clk<=300)pool=runs;
 else if(lead<0&&G.q>=4&&G.clk<=240)pool=G.ytg>12?deep:mid.concat(deep);
 else if(G.q==2&&G.clk<=60)pool=deep.concat(mid);
 else if(G.ytg<=2)pool=runs.concat(['Slants']);
 else if(G.down>=3&&G.ytg>=8)pool=deep.concat(['Curls']);
 else pool=rnd()<.45?runs:quick.concat(mid);
 const t=G.dtd||{},tot=(t.blitz||0)+(t.man||0)+(t.zone||0);
 if(tot>=3&&rnd()<iq){const fav=['blitz','man','zone'].sort((a,b)=>(t[b]||0)-(t[a]||0))[0],beat={blitz:quick.concat(['Draw']),man:['Mesh','Motion Mesh','Slants','Jet Sweep'],zone:['Curls','Post Corner','Verts','Run']}[fav].filter(has),both=pool.filter(n=>beat.includes(n));if(both.length)pool=both}
 return pick(pool)}
function cpuDef(){const iq=IQ(),k=Object.keys(DPRE),pick=a=>a[rnd()*a.length|0];if(rnd()>iq)return pick(k);
 const h=(G.otd||{})[sitKey()]||{r:0,p:0},n=h.r+h.p,lead=G.sc[1]-G.sc[0];let runP=n>=3?h.r/n:(G.ytg<=3?.6:G.ytg>=8?.2:.45);
 if(G.q>=4&&G.clk<=240){if(lead>0)runP*=.5;else if(lead<0)runP=Math.min(.9,runP*1.6)}
 if(runP>.6)return rnd()<.6?'Blitz':'Man Free';
 if(G.ytg>=8&&G.down>=3)return rnd()<.1+.3*iq?'All Out':rnd()<.5?'Cover 3':'Cover 2 Zone';
 const burn=G.dburn||{};return['Cover 2 Zone','Cover 3','Man Free','Blitz'].sort((a,b)=>(burn[a]||0)-(burn[b]||0)+(rnd()-.5)*8)[0]}
// ---------- CPU quarterback ----------
function throwAway(){const qb=P.off[0];throwAt(qb.x+G.dir*7,qb.y<26.5?1:52)}
function cpuQB(dt){const iq=P.off[0].t=='C'?IQ():.8,d=G.dir,L=P.L,O=P.off,D=P.def,qb=O[0];
 const th=D.filter(p=>p.rush&&!p.eng).reduce((a,p)=>!a||dist(p,qb)<dist(a,qb)?p:a,null),dn=th?dist(th,qb):99;
 const lead=G.sc[1]-G.sc[0],late=G.q>=4&&lead<0&&G.clk<=180,need=G.down>=3?G.ytg:0;
 const reads=O.slice(1,6).filter(r=>r.route.length&&!r.eng).map(r=>{const dd=dist(qb,r),t=dd/thr(qb,dd),cx=r.x+r.vx*t,cy=r.y+r.vy*t;
   let sep=99,lane=99,nv=99;D.forEach(p=>{if(p.rush&&!p.eng)return;nv=Math.min(nv,dist(p,r));sep=Math.min(sep,Math.hypot(p.x-cx,p.y-cy)-p.spd*Math.max(0,t-.35)*.8);
    const ax=cx-qb.x,ay=cy-qb.y,l2=ax*ax+ay*ay||1,w=clamp(((p.x-qb.x)*ax+(p.y-qb.y)*ay)/l2,.2,.92);lane=Math.min(lane,Math.hypot(qb.x+ax*w-p.x,qb.y+ay*w-p.y))});
   const open=iq*Math.min(sep+.4,lane*1.2)+(1-iq)*(nv-.5),prog=(cx-L)*d;
   return{r,open,prog,sc:(CAR()&&r.pid===R.me?.7:0)+open+(need&&prog>=need?1.5*iq:0)+prog*.04*(late?2.5:1)-(dd>32?2:0)-coneOff(qb,cx,cy)*3*iq}});
 const nr=Math.max(1,Math.min(reads.length,1+Math.floor((P.t-.9)*(.8+iq*3.2))));
 const avail=reads.sort((a,b)=>O.indexOf(a.r)-O.indexOf(b.r)).slice(0,nr),best=avail.reduce((a,b)=>!a||b.sc>a.sc?b:a,null);
 P.look=best?best.r:null;const want=1.1+iq*1.2-Math.max(0,P.t-2.4)*.8;
 if(best&&best.open>=want&&P.t>1.15)return throwTo(best.r);
 if(dn<2.6&&P.t>1){if(best&&rnd()<dt*5*(1-iq))return throwTo(best.r);if(rnd()<dt*6*iq){if(best&&best.open>.9)return throwTo(best.r);return throwAway()}}
 if(P.t>1.8){const ahead={x:qb.x+d*5,y:qb.y};if(!D.some(p=>!p.eng&&dist(p,ahead)<5.5)&&rnd()<dt*(.6+iq*3)){mv(qb,L+d*3,qb.y,qb.spd,dt);return}}
 if(dn<5){const up=iq>.45&&th&&Math.abs(th.y-qb.y)>2.5,ey=qb.y<10?1:qb.y>43?-1:(th&&qb.y>th.y?1:-1);mv(qb,up?qb.x+d*1.5:L-6*d,qb.y+ey*(up?2:8),qb.spd*.95,dt)}
 if(P.t>3.6){if(best&&(best.open>.6||rnd()>iq))throwTo(best.r);else throwAway()}}
// ---------- CPU ball carrier ----------
function cpuRun(c,dt){const iq=c.t=='C'?IQ():.75,d=G.dir,D=P.def;let best=[d,0],bs=-1e9;
 const trail=c.t=='C'&&G.sc[1]<G.sc[0]&&((G.q>=4&&G.clk<=150)||(G.q==2&&G.clk<=40))&&!P.kr;
 for(let a=-1.2;a<=1.21;a+=.3){const fx=Math.cos(a)*d,fy=Math.sin(a);let clr=99;
  for(const s of[2.5,5,8]){const x=c.x+fx*s,y=c.y+fy*s;if(y<1||y>52.3){clr=Math.min(clr,trail?3:0);continue}D.forEach(p=>{const e=Math.hypot(p.x-x,p.y-y)-(p.eng?-1.5:0)-s*.15;if(e<clr)clr=e})}
  let sc=Math.min(clr,8)*(.4+iq)+Math.cos(a)*3+(rnd()-.5)*(1-iq)*4;if(trail&&iq>.4)sc+=(c.y<26.5?-fy:fy)*3*iq;
  if(sc>bs){bs=sc;best=[fx,fy]}}
 mv(c,c.x+best[0]*6,c.y+best[1]*6,c.spd*.93,dt);const n=D.reduce((a,p)=>dist(p,c)<dist(a,c)?p:a);if(!n.eng&&dist(n,c)<2.6&&rnd()<dt*(.6+iq*1.8))aiMove(c,n,iq)}
// ---------- CPU fourth downs and conversions ----------
function cpu4th(){const iq=IQ(),d=G.dir,dg=((d>0?110:10)-P.L)*d,k=kickerOf('C'),rg=40+(k.str-60)*.4,fd=dg+17,lead=G.sc[1]-G.sc[0],fgOK=fd<=rg+4;
 if(rnd()>iq){if(fgOK){doFG();return true}if(G.ytg<=2&&dg<=60)return false;doPunt();return true}
 const desperate=G.q>=4&&lead<0&&(G.clk<=240||(lead<-8&&G.clk<=420));
 if(desperate){if(fgOK&&lead>=-3&&G.clk<=40){doFG();return true}return false}
 if(fgOK&&!(G.ytg<=1&&dg<=4)){doFG();return true}
 if((G.ytg<=1&&dg<=70)||(G.ytg<=3&&dg<=42)||(G.ytg<=2&&dg<=55&&lead<0))return false;doPunt();return true}
function cpuGoFor2(){const iq=IQ(),lead=G.sc[1]-G.sc[0];if(rnd()>iq)return G.q>=4&&(lead==-2||lead==-5)&&rnd()<.5;
 return(G.q>=4||(G.q==3&&G.clk<120))&&[-2,-5,-10,1,5,-9,-12].includes(lead)}

// After a receiver's cut, his defender keeps going the old way for a beat; better awareness reacts sooner.
function cutLag(p,v){if(!v||!(v.brk>0))return false;const lag=clamp(.5-((p.sk?p.sk.awr:p.o)-60)*.006,.12,.5);return .55-v.brk<lag}
