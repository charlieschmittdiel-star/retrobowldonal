'use strict';
// Player camera (football): besides the normal sideline view, a third-person camera that rides behind the player
// you control and a first-person view from his eyes. Tab switches views during a game. In the player views the
// field is drawn with real perspective, everyone is sorted by distance from the camera, and WASD is turned so W
// always runs forward (downfield). The game itself still simulates on the same flat field; only drawing,
// mouse picking, the pull-back throw and the WASD direction change. Loaded right after opts.js, before any other
// file wraps draw(), so every later overlay (names, weather, hints) keeps working on top of it.
{const a=['Presentation','pcam','Player camera (first and third person)','Press Tab in a game to switch between the sideline view, a third-person camera behind your player and a first-person view from his eyes. In the player views W always runs downfield and A/D go left and right.'];
 if(!FEATS.some(f=>f[1]==a[1])){let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)}}
const PCV={s:'Sideline view',3:'Third person',1:'First person'},PCN=.25,PCSPR=.6;
const PC={c:null,f:700,cy:270,ht:0,focus:null,on:0,msg:'',msgT:0,last:0,lk:null,cur:null,side:new WeakMap()};
function pcView(){const v=OPT.pview;return feat('pcam')&&(v=='3'||v=='1')?v:'s'}
function pcSet(v){OPT.pview=v;optSave();PC.msg=PCV[v]+' · Tab to switch';PC.msgT=2.2;PC.c=null}
function pcCycle(){const v=pcView();pcSet(v=='s'?'3':v=='3'?'1':'s')}
// is the player camera drawing this frame? (kicks, replays and menus between games stay on the sideline view)
function pcWant(){try{if(pcView()=='s'||!G||!P||!P.b||!P.off||!P.def)return false;const ph=G.phase;if(ph!='pre'&&ph!='motion'&&ph!='play'&&ph!='post')return false;
  if(G.rp||(P.kk&&P.b.st!='carry'))return false;if(P.b.st=='kick'&&!(P.b.c))return false;return true}catch(e){return false}}
// ---------- who the camera follows and which way it looks ----------
function pcFocus(){const b=P.b;let f=null;
 if(typeof CAR=='function'&&CAR()&&typeof careerCtl=='function')f=careerCtl();
 if(!f&&b.st=='carry'&&b.c&&b.c.t=='U')f=b.c;
 if(!f){if(G.poss=='U')f=b.st=='qb'||b.st=='pre'?P.off[0]:null;else f=cd}
 const all=P.off.concat(P.def);if(f&&!all.includes(f))f=null;
 if(!f&&PC.focus&&all.includes(PC.focus))f=PC.focus;if(!f)f=G.poss=='U'?P.off[0]:(cd||P.def[0]);return f}
function pcHeading(f){const d=G.dir||1,b=P.b;let fw=f.s=='O'?d:-d;
 // a ball carrier on the other unit (interception or fumble return) runs the other way
 if(b.st=='carry'&&b.c===f&&P.kr&&f.vx)fw=Math.abs(f.vx)>.5?Math.sign(f.vx):fw;return fw>0?0:Math.PI}
const pcAng=(a,b,k)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return a+d*k};
function pcUpdate(){const now=performance.now()/1000,dt=Math.min(.1,PC.last?now-PC.last:1/60);PC.last=now;const v=pcView(),b=P.b;
 let f=pcFocus();PC.focus=f;const h=pcHeading(f);PC.ht=h;
 // third person watches the ball in the air instead of the quarterback who threw it
 let tx=f.x,ty=f.y;if(v=='3'&&b.st=='air'&&G.poss=='U'&&f===P.off[0]){const r=b.tgt;tx=r?r.x:b.tx;ty=r?r.y:b.ty;tx=f.x+(tx-f.x)*.65;ty=f.y+(ty-f.y)*.65}
 const ch=Math.cos(h),sh=Math.sin(h),sp=Math.hypot(f.vx||0,f.vy||0),jz=f.jz||0;let c;
 if(v=='1'){const bob=sp>1.5?Math.abs(Math.sin(now*(6+sp*.6)))*.07:0,lat=(-(f.vx||0)*sh+(f.vy||0)*ch)/Math.max(4,sp+2);
  c={x:tx-ch*.45,y:ty-sh*.45,z:1.72+jz*.9+bob-(f.fall?1.1*Math.min(1,typeof fallProg=='function'?fallProg(f):0):0),h:h+clamp(lat,-.6,.6)*.35,p:.05,f:W*.56}}
 else c={x:tx-ch*9.5,y:ty-sh*9.5,z:4.4,h,p:b.st=='air'||b.st=='kick'?.13:.25,f:W*.64};
 if(!PC.c||Math.abs(PC.c.f-c.f)>1){PC.c=c}else{const o=PC.c,k=1-Math.exp(-dt*(v=='1'?22:6.5)),ka=1-Math.exp(-dt*(v=='1'?9:3.6));
  o.x+=(c.x-o.x)*k;o.y+=(c.y-o.y)*k;o.z+=(c.z-o.z)*k;o.h=pcAng(o.h,c.h,ka);o.p+=(c.p-o.p)*k;o.f=c.f}
 PC.f=PC.c.f;PC.cy=TOP-4+PC.f*Math.tan(PC.c.p);if(PC.msgT>0)PC.msgT-=dt}
// ---------- projection ----------
function pcCS(x,y,z){const c=PC.c,dx=x-c.x,dy=y-c.y,ch=Math.cos(c.h),sh=Math.sin(c.h),fw=dx*ch+dy*sh,rt=-dx*sh+dy*ch,up=(z||0)-c.z,cp=Math.cos(c.p),sp=Math.sin(c.p);return[rt,up*cp+fw*sp,fw*cp-up*sp]}
function pcSP(v){const d=Math.max(v[2],PCN);return[W/2+PC.f*v[0]/d,PC.cy-PC.f*v[1]/d]}
const pcK=dep=>clamp(PCSPR*PC.f/(Math.max(dep,PCN)*S),.03,8);
function pcClipSeg(a,b){const ai=a[2]>=PCN,bi=b[2]>=PCN;if(ai&&bi)return[a,b];if(!ai&&!bi)return null;const t=(PCN-a[2])/(b[2]-a[2]),m=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,PCN];return ai?[a,m]:[m,b]}
function pcClipPoly(pts){const o=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ai=a[2]>=PCN,bi=b[2]>=PCN;if(ai)o.push(a);if(ai!==bi){const t=(PCN-a[2])/(b[2]-a[2]);o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,PCN])}}return o}
function pcPoly(wpts,fill,stroke){const c=pcClipPoly(wpts.map(p=>pcCS(p[0],p[1],p[2]||0)));if(c.length<3)return;X.beginPath();c.forEach((v,i)=>{const s=pcSP(v);i?X.lineTo(s[0],s[1]):X.moveTo(s[0],s[1])});X.closePath();if(fill){X.fillStyle=fill;X.fill()}if(stroke){X.strokeStyle=stroke;X.stroke()}}
function pcSeg(x0,y0,z0,x1,y1,z1){const s=pcClipSeg(pcCS(x0,y0,z0),pcCS(x1,y1,z1));if(!s)return;const a=pcSP(s[0]),b=pcSP(s[1]);X.moveTo(a[0],a[1]);X.lineTo(b[0],b[1])}
// The shared drawing helpers switch to perspective while the player camera is on, so every file that draws on the
// field (routes, rings, overlays) lines up with it.
{const _p2=P2,_up=unproj,_sc=scY,_gl=gline,_gp=gpath,_q=quad,_gr=gring,_at=aimT;
 P2=function(x,y,z){if(!PC.on)return _p2(x,y,z);const v=pcCS(x,y,z),s=pcSP(v);PC.lk={x,y,k:pcK(v[2])};return s};
 scY=function(y){if(!PC.on)return _sc(y);if(PC.cur&&PC.cur.y===y)return PC.cur.k;if(PC.lk&&PC.lk.y===y)return PC.lk.k;return pcK(pcCS(PC.focus?PC.focus.x:PC.c.x,y,0)[2])};
 // clicking a player's body picks that player (a ground point alone would land yards behind him)
 unproj=function(sx,sy){if(!PC.on)return _up(sx,sy);const hit=pcPick(sx,sy);if(hit)return[hit.x,hit.y];const c=PC.c,rt=(sx-W/2)/PC.f,vt=(PC.cy-sy)/PC.f,cp=Math.cos(c.p),sp=Math.sin(c.p),fw=vt*sp+cp,up=vt*cp-sp,t=up<-.004?Math.min(140,-c.z/up):140,
  ch=Math.cos(c.h),sh=Math.sin(c.h);return[c.x+t*(fw*ch-rt*sh),clamp(c.y+t*(fw*sh+rt*ch),-2,FW+2)]};
 gline=function(x0,y0,x1,y1){if(!PC.on)return _gl(x0,y0,x1,y1);X.beginPath();pcSeg(x0,y0,0,x1,y1,0);X.stroke()};
 gpath=function(pts){if(!PC.on)return _gp(pts);if(!pts.length)return;X.beginPath();for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];pcSeg(a[0],a[1],a[2]||0,b[0],b[1],b[2]||0)}X.stroke()};
 quad=function(x0,x1,y0,y1,col){if(!PC.on)return _q(x0,x1,y0,y1,col);pcPoly([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],col)};
 gring=function(x,y,r,col,lw){if(!PC.on)return _gr(x,y,r,col,lw);const pts=[];for(let i=0;i<20;i++){const a=i/20*Math.PI*2;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r])}X.lineWidth=lw;pcPoly(pts,null,col)};
 // pull back to throw: the drag is read relative to the camera, so pulling the mouse down throws downfield
 aimT=function(){if(!PC.on)return _at();const a=P.aim,q=P.off[0],fw=-(a.a[1]-a.c[1])/KY*3,rt=(a.a[0]-a.c[0])/S*3,h=PC.ht;let x=fw*Math.cos(h)-rt*Math.sin(h),y=fw*Math.sin(h)+rt*Math.cos(h);
  const m=Math.hypot(x,y),rg=thRange(q);if(m>rg){x*=rg/m;y*=rg/m}return[clamp(q.x+x,1,119),clamp(q.y+y,1,52)]}}
function pcPick(sx,sy){let best=null,bd=1e9;try{P.off.concat(P.def).forEach(p=>{if(p.gone||(pcView()=='1'&&p===PC.focus))return;const v=pcCS(p.x,p.y,0);if(v[2]<1)return;const s=pcSP(v),k=pcK(v[2]),w=Math.max(9,9*k),h=Math.max(22,36*k);
  if(Math.abs(sx-s[0])<w&&sy<s[1]+Math.max(4,3*k)&&sy>s[1]-h&&v[2]<bd){bd=v[2];best=p}})}catch(e){}return best}
// WASD turns with the camera: W runs where the camera looks.
{const _in=inp;inp=function(){const r=_in();try{if(!PC.on||!r[2]||(typeof dforce=='function'&&dforce()))return r;const h=PC.ht,fw=-r[1],rt=r[0];return[fw*Math.cos(h)-rt*Math.sin(h),fw*Math.sin(h)+rt*Math.cos(h),r[2]]}catch(e){return r}}}
// ---------- field ----------
function pcField(){const ox=-((camX*S*.8)%400)-200;
 if(STANDS===null)STANDS=buildStands()||0;if(STANDS)X.drawImage(STANDS,ox,0);else{X.fillStyle='#1d3348';X.fillRect(0,0,W,TOP)}
 if(STANDS&&ox+1600<W)X.drawImage(STANDS,ox+1600,0);
 X.fillStyle='#1f6b2a';X.fillRect(0,TOP-6,W,H-TOP+6);
 pcPoly([[-12,-8],[132,-8],[132,FW+8],[-12,FW+8]],'#1d6428');
 for(let x=10;x<110;x+=5)quad(x,x+5,0,FW,typeof fieldCol=='function'?fieldCol(x):((x/5)%2?'#2f8a3a':'#2a7f35'));
 quad(0,10,0,FW,TEAM.U.ez||'#1e4e8c');quad(110,120,0,FW,TEAM.C.ez||'#8a1b2a');
 X.strokeStyle='#ffffffd0';X.lineWidth=2;X.beginPath();pcSeg(0,0,0,120,0,0);pcSeg(0,FW,0,120,FW,0);pcSeg(0,0,0,0,FW,0);pcSeg(120,0,0,120,FW,0);X.stroke();
 X.strokeStyle='#ffffffb0';X.lineWidth=1.5;X.beginPath();for(let x=10;x<=110;x+=5)pcSeg(x,0,0,x,FW,0);X.stroke();
 X.strokeStyle='#ffffff80';X.lineWidth=1;X.beginPath();for(let x=11;x<110;x++){if(x%5==0)continue;[1,FW/2-3.1,FW/2+3.1,FW-1].forEach(y=>pcSeg(x,y-.4,0,x,y+.4,0))}X.stroke();
 // yard numbers lie on the grass, so they flatten with distance
 X.fillStyle='#ffffffb8';X.textAlign='center';
 for(let x=20;x<=100;x+=10){const n=x<=60?x-10:110-x;[8,FW-8].forEach(y=>{const v=pcCS(x,y,0);if(v[2]<1.5)return;const s=pcSP(v),k=pcK(v[2])/PCSPR,fs=Math.round(clamp(22*k,6,90)),sq=clamp(PC.c.z/v[2]*1.6,.12,1);
  if(s[0]<-fs*2||s[0]>W+fs*2)return;X.font=`bold ${fs}px "Trebuchet MS",sans-serif`;X.save();X.translate(s[0],s[1]);X.scale(1,sq);X.fillText(n,0,fs*.35);X.restore()})}
 // goal posts at both end lines
 X.strokeStyle='#facc15';[0,120].forEach(x=>{const v=pcCS(x,FW/2,0);if(v[2]<12)return;X.lineWidth=clamp(.25*PC.f/v[2],1,8);X.beginPath();pcSeg(x,FW/2,0,x,FW/2,3.3);pcSeg(x,FW/2-3.1,3.3,x,FW/2+3.1,3.3);pcSeg(x,FW/2-3.1,3.3,x,FW/2-3.1,10);pcSeg(x,FW/2+3.1,3.3,x,FW/2+3.1,10);X.stroke()})
 // night, snow and rain tints and the penalty flag (the sideline view gets these from its own field layer)
 try{if(G.night){X.fillStyle='rgba(4,8,24,.6)';X.fillRect(0,0,W,TOP-6);X.fillStyle='rgba(8,14,40,.2)';X.fillRect(0,TOP-6,W,H)}
  if(feat('weather')){if(G.wx=='snow'){X.fillStyle='rgba(240,245,255,.3)';X.fillRect(0,TOP-6,W,H)}else if(G.wx=='rain'){X.fillStyle='rgba(20,30,60,.16)';X.fillRect(0,0,W,H)}}
  if(G.flag&&G.phase=='post'){const v=pcCS(G.flag.x,G.flag.y,0);if(v[2]>1){const s=pcSP(v),k=pcK(v[2])/PCSPR,w=Math.sin(performance.now()/1000*9)*1.5*k;X.fillStyle='#facc15';X.beginPath();X.moveTo(s[0],s[1]);X.lineTo(s[0]+8*k,s[1]-3*k+w);X.lineTo(s[0]+k,s[1]-7*k);X.closePath();X.fill()}}}catch(e){}}
// ---------- first-person hands ----------
function pcHands(f,now){const b=P.b,hold=(b.st=='carry'&&b.c===f)||((b.st=='qb'||b.st=='pre')&&f===P.off[0]&&f.s=='O'),u=H/80,c=TEAM[f.t]||TEAM.C,sk=typeof skinOf=='function'?skinOf(f):'#e0ac85';
 const sp=Math.hypot(f.vx||0,f.vy||0),sw=sp>1.5?Math.sin(now*(6+sp*.6)):0,aim=!!(P.aim&&f===P.off[0]),up=f.s=='D'&&G.phase=='play'&&b.st=='air';
 const arm=(side,hx,hy)=>{const bx=side<0?W*.12:W*.88,by=H+u*4;X.strokeStyle=c.j;X.lineWidth=u*7;X.lineCap='round';X.beginPath();X.moveTo(bx,by);X.lineTo((bx+hx)/2,(by+hy)/2+u*2);X.stroke();
  X.strokeStyle=sk;X.lineWidth=u*5;X.beginPath();X.moveTo((bx+hx)/2,(by+hy)/2+u*2);X.lineTo(hx,hy);X.stroke();X.fillStyle=sk;X.fillRect(hx-u*3,hy-u*3,u*6,u*6);X.lineCap='butt'};
 const ball=(x,y,r)=>{X.save();X.translate(x,y);X.rotate(r);X.fillStyle='#5a3312';X.beginPath();X.ellipse(0,0,u*9,u*5.6,0,0,7);X.fill();X.fillStyle='#8b5a2b';X.beginPath();X.ellipse(0,0,u*7.6,u*4.4,0,0,7);X.fill();
  X.fillStyle='#fff';X.fillRect(-u*3,-u*.5,u*6,u);for(let i=-2;i<=2;i++)X.fillRect(i*u*1.2-u*.25,-u*1.4,u*.5,u*1.8);X.restore()};
 if(aim){arm(-1,W*.36,H*.8);arm(1,W*.74,H*.55);ball(W*.74,H*.52,-.6);return}
 if(up){arm(-1,W*.3,H*.42);arm(1,W*.7,H*.42);return}
 if(hold){if(b.st=='carry'){arm(-1,W*.24,H*.95-sw*u*4);arm(1,W*.66,H*.86+sw*u*3);ball(W*.62,H*.85+sw*u*3,-.35)}else{arm(-1,W*.42,H*.86);arm(1,W*.58,H*.86);ball(W*.5,H*.84,0)}return}
 arm(-1,W*.2,H*.94-sw*u*5);arm(1,W*.8,H*.94+sw*u*5)}
// ---------- the main draw, with the camera on ----------
function pcDraw(){const L=P.L,d=G.dir,b=P.b,now=performance.now()/1000,v=pcView();ragTick();
 camX+=(clamp((typeof camTgt=='function'?camTgt(b,L):(G.phase=='play'||G.phase=='kick'?b.x:L))-48,-2,26)-camX)*(typeof camK=='function'?camK():.1);
 pcUpdate();const f=PC.focus;
 {const ks=typeof KS=='number'?KS:1,sh=shakeT>0?shakeA*shakeT/.28:0;X.setTransform(ks,0,0,ks,(rnd()-.5)*sh*ks,(rnd()-.5)*sh*ks)}X.imageSmoothingEnabled=false;X.clearRect(0,0,W,H);pcField();
 if(!P.kr&&!G.rp){X.lineWidth=3;X.strokeStyle='#4aa3ff';gline(L,0,L,FW);if(!P.kk){X.strokeStyle='#ffd84d';gline(L+G.ytg*d,0,L+G.ytg*d,FW)}}
 if(G.poss=='U'&&G.phase=='pre'){P.off.slice(1).forEach((p,k)=>{if(!p.route.length)return;X.strokeStyle=sel==k+1?'#ffd84d':'#ffffffb0';X.lineWidth=2;X.setLineDash([6,4]);const s0=p.mo&&p.mo.length?p.mo[p.mo.length-1]:[p.sx,p.sy];gpath([s0,...p.route]);X.setLineDash([])});
  P.off.forEach(p=>{if(p.mo&&p.mo.length){X.strokeStyle='#ff9f43';X.lineWidth=2;X.setLineDash([2,4]);gpath([[p.sx,p.sy],...p.mo]);X.setLineDash([])}})}
 if((b.st=='qb'||b.st=='pre')&&!P.run&&(G.phase=='play'||G.phase=='pre'||G.phase=='motion')){const q=P.off[0],hf=coneHalf(q),rad=coneLen(q),pts=[[q.x,q.y]];
  for(let i=0;i<=16;i++){const a=qLook(q)-hf+2*hf*i/16;pts.push([clamp(q.x+Math.cos(a)*rad,0,120),clamp(q.y+Math.sin(a)*rad,0,FW)])}X.lineWidth=1.5;pcPoly(pts,'rgba(255,255,255,.12)','rgba(255,255,255,.55)')}
 const ctl=CAR()?careerCtl():G.poss=='U'?(b.st=='carry'?b.c:(b.st=='qb'||b.st=='pre'?P.off[0]:null)):cd;
 if(ctl&&!(v=='1'&&ctl===f)){gring(ctl.x,ctl.y,1.6,'#ffd84d',3);gring(ctl.x,ctl.y,1.95,'#ffffff',1.5)}
 if(sel>0&&P.off[sel])gring(P.off[sel].x,P.off[sel].y,1.5,'#ffd84d',2);
 if(P.look&&G.poss!='U'&&b.st=='qb'){const q=P.off[0],l=P.look;X.strokeStyle='#ff4d4d';X.lineWidth=2;X.setLineDash([3,5]);gline(q.x,q.y,l.x,l.y);X.setLineDash([]);gring(l.x,l.y,1.4,'#ff4d4d',2)}
 let bz=0;if(b.st=='air'){const t=clamp(b.t/b.T,0,1),pk=Math.min(9,Math.hypot(b.tx-b.sx,b.ty-b.sy)*.18)*(b.arc||1);bz=1.2+4*pk*t*(1-t)}else if(b.st=='kick'||b.st=='cel'||b.st=='loose')bz=b.z||0;else if(b.st=='tip')bz=.6+Math.sin(Math.PI*Math.min(1,b.tt/b.T2))*(b.tipH||2.4);else if(b.st=='qb'||b.st=='carry')bz=1.1;
 if(P.aim){const t=aimT(),q=P.off[0],dd=Math.hypot(t[0]-q.x,t[1]-q.y),pk=Math.min(9,dd*.18)*(G.tt=='lob'&&feat('throwT')?1.9:G.tt=='bul'&&feat('throwT')?.45:1),n=Math.max(3,dd/1.5|0);X.fillStyle='#fff';
  for(let i=1;i<=n;i++){const t2=i/n,vv=pcCS(q.x+(t[0]-q.x)*t2,q.y+(t[1]-q.y)*t2,1.2+4*pk*t2*(1-t2));if(vv[2]<PCN)continue;const s=pcSP(vv);X.beginPath();X.arc(s[0],s[1],clamp(2.3*pcK(vv[2])*2,1.5,6),0,7);X.fill()}
  gring(t[0],t[1],.9,'#ffffff',2)}
 // everyone, far to near, ball included
 const all=P.off.concat(P.def).map(p=>[pcCS(p.x,p.y,0)[2]-(p.fall&&p.fall.wrap?.01:0),p]);all.push([pcCS(b.x,b.y,0)[2]-.01,'ball']);all.sort((a,c)=>c[0]-a[0]);
 const heads=new Map();
 all.forEach(([dep,p])=>{if(p==='ball'){if(b.st=='dead'&&G.phase!='post')return;const vg=pcCS(b.x,b.y,0),vs=pcCS(b.x,b.y,bz);if(vs[2]<.6)return;const g=pcSP(vg),s=pcSP(vs),k=pcK(vs[2]);
   if(bz>1.3&&vg[2]>PCN){X.fillStyle='rgba(0,0,0,.35)';X.beginPath();X.ellipse(g[0],g[1],5*k,2*k*clamp(PC.c.z/vg[2]*2,.2,1),0,0,7);X.fill()}
   if(b.st=='qb'||b.st=='carry')return;drawBall(s,k,b,now);return}
  if(v=='1'&&p===f)return;if(dep<(v=='1'?.9:1.2))return;
  const k=pcK(dep),fa=p.fa,vc=pcCS(p.x,p.y,0);let sg=PC.side.get(p)||1;if(fa!=null){const rt=Math.sin(fa-PC.c.h);if(rt>.25)sg=1;else if(rt<-.25)sg=-1;PC.side.set(p,sg);p.fa=sg>0?0:Math.PI}
  PC.cur={y:p.y,k};PC.lk={x:p.x,y:p.y,k};try{if(p.fall&&fallProg(p)>0)drawFallen(p,now);else heads.set(p,sprite(p,now))}catch(e){console.error(e)}finally{p.fa=fa;PC.cur=null}});
 DUST.forEach(q=>{const vv=pcCS(q.x,q.y,0);if(vv[2]<PCN)return;const s=pcSP(vv),a=1-q.t/q.life,k=pcK(vv[2])/PCSPR;X.fillStyle=`rgba(214,196,150,${(a*.55).toFixed(2)})`;X.beginPath();X.ellipse(s[0],s[1]-2*k,(q.r+q.t*1.4)*S*k,(q.r+q.t*1.4)*S*k*.35,0,0,7);X.fill()});
 X.textAlign='center';X.font='bold 9px sans-serif';
 heads.forEach((hy,p)=>{const s=P2(p.x,p.y);if(p.ml>0&&G.phase=='play'&&!(typeof lwHide=='function'&&lwHide(p))){X.fillStyle='#ffd84d';X.fillText(p.mv,s[0],hy-4)}});
 [ctl,b.st=='carry'?b.c:null].forEach((p,i)=>{if(!p||(i==1&&p==ctl)||!heads.has(p))return;const s=P2(p.x,p.y),hy=heads.get(p),vv=(p.stm==null?100:p.stm)/100;X.fillStyle='#000a';X.fillRect(s[0]-14,hy-14,28,5);X.fillStyle=vv>.3?'#4ade80':vv>.1?'#fbbf24':'#ef4444';X.fillRect(s[0]-13,hy-13,26*vv,3)});
 if(P.look&&G.poss!='U'&&b.st=='qb'){const vv=pcCS(P.look.x,P.look.y,0);if(vv[2]>PCN){const s=pcSP(vv);X.fillStyle='#ff4d4d';X.fillText('QB EYES',s[0],s[1]-30)}}
 if(v=='1'&&f)pcHands(f,now);
 if(ctl&&G.phase=='play'){const vv=(ctl.stm==null?100:ctl.stm)/100;X.fillStyle='#000a';X.fillRect(W-170,6,160,20);X.fillStyle=vv>.3?'#4ade80':vv>.1?'#fbbf24':'#ef4444';X.fillRect(W-168,8,156*vv,16);X.fillStyle='#fff';X.font='bold 11px sans-serif';X.textAlign='right';X.fillText('STAMINA',W-14,20)}
 X.textAlign='left';
 if(G.poss!='U'&&cd){const bs=$('dctl').children;if(bs[3]){bs[1].style.opacity=cd.hk>0?.4:1;bs[2].style.opacity=cd.hcool>0?.4:1;bs[3].style.opacity=(cd.pr||P.t>1.6||P.b.st!='qb')?.4:1;if(bs[4])bs[4].style.opacity=cd.swk>0?.4:1}}
 if(typeof sbTick=='function')sbTick();else{$('hud').textContent=hudText();$('msg').textContent=G.msg}}
function pcLabel(){if(PC.msgT<=0||!G)return;const ks=typeof KS=='number'?KS:1;X.save();X.setTransform(ks,0,0,ks,0,0);X.globalAlpha=Math.min(1,PC.msgT/.4);X.font='bold 15px "Trebuchet MS",sans-serif';X.textAlign='center';
 const t=PC.msg,w=X.measureText(t).width+28;X.fillStyle='#000b';X.fillRect(W/2-w/2,TOP+8,w,28);X.fillStyle='#ffd84d';X.fillText(t,W/2,TOP+27);X.restore()}
{const _dr=draw;draw=function(){PC.on=pcWant();if(!PC.on){PC.c=null;try{_dr()}finally{PC.on=0}pcLabel();return}
 try{pcDraw()}catch(e){console.error(e);PC.on=0;_dr()}pcLabel()}}
// ---------- Tab switches the view ----------
addEventListener('keydown',e=>{if(e.key!=='Tab'||e.ctrlKey||e.altKey||e.metaKey)return;try{if(!G||!P||!$('modal').hidden||!feat('pcam'))return;const a=document.activeElement;if(a&&/INPUT|SELECT|TEXTAREA/.test(a.tagName))return}catch(err){return}
 e.preventDefault();e.stopImmediatePropagation();pcCycle()},true);
// the Controls page lists Tab
addEventListener('load',()=>{try{const _cp=ctlPage;ctlPage=function(...a){const r=_cp.apply(this,a);try{if(!feat('pcam'))return r;const t=[...document.querySelectorAll('#modal table td')].find(x=>x.textContent=='Pause / lobby');
 if(t){const n=t.parentElement.children.length;t.parentElement.insertAdjacentHTML('afterend',`<tr><td>Camera view (sideline, third person, first person)</td><td><kbd>Tab</kbd></td>${'<td></td>'.repeat(Math.max(0,n-2))}</tr>`)}}catch(e){}return r};try{$('hlp').onclick=()=>ctlPage()}catch(e){}}catch(e){}});
// starting view picker on the Game features page
{const _fu=featUI;featUI=function(...a){const r=_fu.apply(this,a);try{const row=[...$('modal').querySelectorAll('.feat b')].find(x=>x.textContent.startsWith('Player camera'));if(row&&feat('pcam')){const m=pcView(),it=row.closest('.feat');
  it.insertAdjacentHTML('afterend',`<div class="feat"><div class="row">${[['s','Sideline'],['3','Third person'],['1','First person']].map(([k,n])=>`<button class="${m==k?'on':''}" onclick="pcSet('${k}');featUI()">${n}</button>`).join('')}</div><div><b>Camera view</b><span class="small">The view games start in. Tab switches during a game.</span></div></div>`)}}catch(e){}return r}}
