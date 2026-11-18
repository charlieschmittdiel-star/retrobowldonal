'use strict';
// Player-camera help (football), three separate switches on the Game features page:
//  - Wide first-person view: a wider field of view that opens up a bit more for the quarterback and when running fast.
//  - First-person throw help: a tag over every receiver (arrows at the screen edge when one is out of view), and the
//    pull-back throw gently pulls toward the receiver nearest your aim.
//  - Smooth player switching: when the camera moves to a different player it glides over instead of jumping, with a
//    short fade for long jumps such as a new play.
// It wraps pcUpdate(), aimT() and draw() from pcam.js (plus a few tiny hooks there), so the original code stays as it was.
{const add=[['Presentation','pcfov','Wide first-person view','On by default. Opens the first-person view up so you can see much more of the field, and a little wider still when you are the quarterback or sprinting. It only changes how much you can see, never ratings or physics.'],
 ['Presentation','pcthrow','First-person throw help','On by default. As the quarterback in first person you see a numbered tag over every receiver (an arrow at the screen edge when one is out of view), and the pull-back throw gently pulls toward the receiver nearest your aim. The slingshot throw works exactly as before.'],
 ['Presentation','pctrans','Smooth player switching (player cameras)','On by default. When the player camera moves to a different player (a catch, a handoff, an interception, a defender switch) it glides over instead of jumping, and long jumps like a new play dissolve from black.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const PC2={t:0,fx:null,tr:null,d:.5,f:null,x:0,y:0,at:0,fade:0,snap:null};
// ---------- every frame, just before the camera moves ----------
function pcPre(){const now=performance.now()/1000,dt=Math.min(.1,PC2.t?now-PC2.t:1/60);PC2.t=now;const v=pcView(),f=pcFocus(),b=P.b;if(!f)return;
 // field of view (the normal first-person lens is 0.56 of the screen width; smaller is wider)
 if(v=='1'&&feat('pcfov')){const qb=(b.st=='qb'||b.st=='pre')&&f===P.off[0]&&f.s=='O',car=b.st=='carry'&&b.c===f,sp=Math.hypot(f.vx||0,f.vy||0),t=((qb?.34:car?.4:.43)-Math.min(.03,sp*.004))/.56;
  PC2.fx=PC2.fx==null?t:PC2.fx+(t-PC2.fx)*(1-Math.exp(-dt*4));PC.fx=PC2.fx}
 else{PC2.fx=null;PC.fx=1}
 // switching players: glide over, or dissolve from black when the jump is long
 if(feat('pctrans')){
  if(PC2.f&&now-PC2.at<2&&v!='s'){const j=Math.hypot(f.x-PC2.x,f.y-PC2.y);
   if(f!==PC2.f&&PC.c&&j<=22){PC2.tr=0;PC2.d=.45+j*.02;if(typeof f.pos=='string'&&f.pos){PC.msg='Now playing '+f.pos;PC.msgT=1.3}}
   else if(j>(f!==PC2.f?22:8)){PC2.fade=1;PC2.tr=null;PC.c=null}}
  if(PC2.tr!=null){PC2.tr+=dt;if(PC2.tr>=PC2.d){PC2.tr=null;PC.tm=1;PC.gl=0}else{const u=PC2.tr/PC2.d;PC.tm=.1+.9*u*u*(3-2*u);PC.gl=1}}else{PC.tm=1;PC.gl=0}
  if(PC2.fade>0)PC2.fade=Math.max(0,PC2.fade-dt/.45)}
 else{PC.tm=1;PC.gl=0;PC2.tr=null;PC2.fade=0}
 PC2.f=f;PC2.x=f.x;PC2.y=f.y;PC2.at=now}
{const _pu=pcUpdate;pcUpdate=function(){try{pcPre()}catch(e){console.error(e)}_pu()}}
// ---------- throw help ----------
function pcAssist(){try{return !!(PC.on&&pcView()=='1'&&feat('pcthrow')&&G.poss=='U'&&P.b.st=='qb'&&!P.run&&!P.scr&&typeof qbIsMe=='function'&&qbIsMe())}catch(e){return false}}
function pcRecvs(){const o=[];P.off.forEach((r,i)=>{if(i==0||!r||r.gone||(i>5&&!(r.route&&r.route.length)))return;o.push([i,r])});return o}
{const _at=aimT;aimT=function(){const t=_at();PC2.snap=null;
 try{if(!P.aim||!pcAssist())return t;const q=P.off[0],R=9;let best=null,bd=1e9;
  pcRecvs().forEach(([i,r])=>{const dd=Math.hypot(r.x-q.x,r.y-q.y),T=Math.max(.3,dd/thr(q,dd)),lx=r.x+(r.vx||0)*T,ly=r.y+(r.vy||0)*T,e=Math.min(Math.hypot(lx-t[0],ly-t[1]),Math.hypot(r.x-t[0],r.y-t[1]));if(e<bd){bd=e;best={r,lx,ly}}});
  if(!best||bd>=R)return t;const k=.85*(1-(bd/R)*(bd/R));let x=t[0]+(best.lx-t[0])*k,y=t[1]+(best.ly-t[1])*k;
  const m=Math.hypot(x-q.x,y-q.y),rg=thRange(q);if(m>rg){x=q.x+(x-q.x)*rg/m;y=q.y+(y-q.y)*rg/m}
  PC2.snap=best.r;return[clamp(x,1,119),clamp(y,1,52)]}catch(e){return t}}}
// tags over the receivers
function pcMarks(){if(!pcAssist()&&!(PC.on&&pcView()=='1'&&feat('pcthrow')&&G.poss=='U'&&P.b.st=='pre'))return;
 const ks=typeof KS=='number'?KS:1;X.save();X.setTransform(ks,0,0,ks,0,0);X.textAlign='center';X.font='bold 12px "Trebuchet MS",sans-serif';
 const tag=(x,y,n,hot)=>{const r=hot?12:9;X.fillStyle=hot?'#4ade80':'#ffd84d';X.strokeStyle='#000c';X.lineWidth=2;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.stroke();X.fillStyle='#000';X.fillText(n,x,y+4)};
 pcRecvs().forEach(([i,r])=>{const v=pcCS(r.x,r.y,0),hot=PC2.snap===r;
  if(v[2]>.8){const s=pcSP(v),k=pcK(v[2]),h=Math.max(22,36*k),x=s[0],y=s[1]-h-12;
   if(x>14&&x<W-14&&y>10){tag(x,y,i,hot);X.fillStyle=hot?'#4ade80':'#ffd84d';X.beginPath();X.moveTo(x-5,y+(hot?12:9));X.lineTo(x+5,y+(hot?12:9));X.lineTo(x,y+(hot?19:16));X.closePath();X.fill();return}}
  const left=v[0]<0,x=left?24:W-24,y=H*.3+i*32;X.fillStyle=hot?'#4ade80':'#ffd84d';X.beginPath();X.moveTo(left?4:W-4,y);X.lineTo(left?14:W-14,y-9);X.lineTo(left?14:W-14,y+9);X.closePath();X.fill();tag(x+(left?6:-6),y,i,hot)});
 X.restore()}
// ---------- on top of the camera's own drawing ----------
{const _d=draw;draw=function(){_d();try{if(!PC.on)return;pcMarks();if(PC2.fade>0){const ks=typeof KS=='number'?KS:1;X.save();X.setTransform(ks,0,0,ks,0,0);X.fillStyle='rgba(0,0,0,'+(Math.min(1,PC2.fade*1.1)*.92).toFixed(2)+')';X.fillRect(0,0,W,H);X.restore()}}catch(e){}}}
