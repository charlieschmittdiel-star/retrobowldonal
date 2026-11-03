'use strict';
// Hoop Land-style view: a low camera from the side of the court with real perspective (the far side is smaller,
// the near side bigger), a closer camera that follows the ball, bigger players, bouncier jumps with squash and
// stretch, a lean when players sprint, and dunks that reach the rim. It only changes how the game is drawn;
// the game itself plays the same. Needs Broadcast graphics.
{const add=[['Presentation','hlview','Hoop Land-style view','A low side camera with perspective, a closer view that follows the ball, bigger players and bouncier jumps. Needs Broadcast graphics.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const HV={D:110,KY:.42,BIG:1.14,JZ:2.2};
const HLV=()=>feat('hlview')&&GFX();
const pvU=y=>Math.min(y-25,HV.D-8),pvF=y=>HV.D/(HV.D-pvU(y)),pvG=y=>{const u=pvU(y);return u*HV.D/(HV.D-u)};
function pvProj(x,y,z){const u=pvU(y),f=HV.D/(HV.D-u);return[OX+(47+(x-47)*f)*S,OY+u*f*S*HV.KY-z*S*HZ*f]}
pvProj.inv=(mx,my)=>{const g=Math.max(-HV.D+1,(my-OY)/(S*HV.KY)),u=g*HV.D/(HV.D+g),f=HV.D/(HV.D-u);return[47+((mx-OX)/S-47)/f,25+u]};
// ---------- the camera ----------
const VC={x:47,g:0,on:0,last:0},VOFF=()=>Math.round(VH*.1);
function pvLimits(){const K=S*HV.KY,hw=VW/(2*S),cx0=hw-16,cx1=CW+16-hw,up=(VH/2+VOFF())/K,dn=(VH/2-VOFF())/K,gt=pvG(-24),gb=pvG(CH+4);let g0=gt+up,g1=gb-dn;if(g0>g1)g0=g1=(g0+g1)/2;
 return{cx0:cx0>cx1?47:cx0,cx1:cx0>cx1?47:cx1,g0,g1}}
{const _cf=camFrame;camFrame=function(close){if(!HLV()){PROJ=null;VC.on=0;return _cf(close)}
  const now=performance.now(),dt=Math.min(.1,(now-(VC.last||now))/1000)||.016;VC.last=now;
  const base=Math.min((VW-24)/100,(VH-182)/(CH*KY+8)),z=close?2.05:VW<800?1.35:1.75;S=base*z;
  const b=G.b;let tx=47,ty=25;if(b){const h=b.st=='held'&&b.h?b.h:null;tx=h?h.x+h.vx*.3:(b.x||47)+(b.vx||0)*.2;ty=h?h.y:(b.y||25);
   if(!G.rp&&G.phase=='live'&&b.st=='held'&&G.poss!=null){const s=G.dir[G.poss];if(s)tx+=s*8}}
  if(!isFinite(tx))tx=47;if(!isFinite(ty))ty=25;if(!isFinite(VC.x)||!isFinite(VC.g))VC.on=0;
  const L=pvLimits();tx=clamp(tx,L.cx0,L.cx1);let tg=clamp(pvG(25+(clamp(ty,0,CH)-25)*.55),L.g0,L.g1);
  if(!VC.on){VC.x=tx;VC.g=tg;VC.on=1}const f=1-Math.exp(-dt*3.2);VC.x+=(tx-VC.x)*f;VC.g+=(tg-VC.g)*f;
  OX=VW/2-VC.x*S;OY=VH/2+VOFF()-VC.g*S*HV.KY;PROJ=pvProj}}
{const _hd=hDraw;hDraw=function(){PROJ=null;return _hd()}}
// ---------- the floor and the crowd, redrawn in perspective (once per arena and screen size) ----------
let PV={};
function pvBounds(){const L=pvLimits(),K=S*HV.KY;return{x0:L.cx0*S-VW/2-4,x1:L.cx1*S+VW/2+4,y0:L.g0*K-(VH/2+VOFF())-4,y1:L.g1*K+(VH/2-VOFF())+4}}
function pvWarp(img,X0,Y0,PX,b,d){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil((b.x1-b.x0)*d));c.height=Math.max(1,Math.ceil((b.y1-b.y0)*d));const x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
 const K=S*HV.KY,IW=img.width/PX,uOf=ly=>{const g=Math.max(-HV.D+1,ly/K);return g*HV.D/(HV.D+g)};
 for(let r=0;r<c.height;r++){const ly=b.y0+r/d,u=uOf(ly),sy=(25+u-Y0)*PX;if(sy<0||sy>=img.height-1)continue;const f=HV.D/(HV.D-u),sh=Math.max(1,(uOf(ly+1/d)-u)*PX),lx=(47+(X0-47)*f)*S;
  x.drawImage(img,0,sy,img.width,Math.min(sh,img.height-sy),(lx-b.x0)*d,r,IW*f*S*d,1.05)}
 return c}
function pvTex(){const T=tex(),dpr=Math.min(2,window.devicePixelRatio||1),d=Math.min(dpr,1.25),k=[G.home,S.toFixed(2),VW,VH,d,T.f.width,T.s.width,R.t[G.home].col.join()].join(':');
 if(PV.k!==k){const b=pvBounds();PV={k,b,d,f:pvWarp(T.f,FX0,FY0,PXF,b,d),s:pvWarp(T.s,AX0,AY0,PXC,b,d)}}return PV}
function pvBlit(c,oy){const P0=PV,d=P0.d,dpr=Math.min(2,window.devicePixelRatio||1),dx=Math.round((OX+P0.b.x0)*d),dy=Math.round((OY+P0.b.y0+(oy||0))*d),sx=Math.max(0,-dx),sy=Math.max(0,-dy),tx=Math.max(0,dx),ty=Math.max(0,dy),sw=Math.min(c.width-sx,Math.ceil(VW*d)-tx),sh=Math.min(c.height-sy,Math.ceil(VH*d)-ty);if(sw<=0||sh<=0)return;
 CX.save();CX.setTransform(dpr/d,0,0,dpr/d,0,0);CX.drawImage(c,sx,sy,sw,sh,tx,ty,sw,sh);CX.restore()}
{const _da=drawArena;drawArena=function(){if(!PROJ||!HLV()||!G||!R||!R.t[G.home])return _da();const V=pvTex();CX.fillStyle='#05070d';CX.fillRect(0,0,VW,VH);
  if(feat('crowd')){const hy=G.hype>0?G.hype:0,j=hy?Math.abs(Math.sin(performance.now()/110))*hy*1.6:0;pvBlit(V.s,-j);
   if(hy>.6&&rnd()<.5){for(let i=0;i<3;i++){const q=P(-20+rnd()*134,rnd()<.6?-8-rnd()*18:CH+7+rnd()*8,0);CX.fillStyle='rgba(255,255,255,.85)';CX.beginPath();CX.arc(q[0],q[1],1.2+rnd()*2.2,0,7);CX.fill()}}}
  else{CX.fillStyle='#0c1222';CX.fillRect(0,0,VW,VH)}
  if(feat('night')&&R.po&&!G.auto){CX.fillStyle='rgba(0,0,0,.3)';CX.fillRect(0,0,VW,VH);CX.fillStyle='#fde68a';CX.font='800 13px system-ui';CX.textAlign='left';CX.fillText('PLAYOFFS',14,24)}}}
{const _dc=drawCourt;drawCourt=function(){if(!PROJ||!HLV()||!G||!R||!R.t[G.home])return _dc();pvBlit(pvTex().f);courtLines()}}
// ---------- players drawn bigger, scaled by how far away they are ----------
// Each figure is drawn around its own spot on the floor; S is scaled up while it is drawn and put back after.
function pvLocal(x0,y0,k,fn){const [gx,gy]=pvProj(x0,y0,0),s0=S,pj=PROJ,S2=S*k;PROJ=(x,y,z)=>[gx+(x-x0)*S2,gy+(y-y0)*S2*HV.KY-(z||0)*S2*HZ];S=S2;try{return fn(gx,gy)}finally{S=s0;PROJ=pj}}
// how high to draw a player's feet: jumps look higher; on a dunk the hands reach the rim
function pvZ(e){const z=e.z||0;if(z<=0)return 0;if(e.dk){const ft=ftOf(e.p)*1.15;return Math.max(0,(z+ft-ft*HV.BIG))/HV.BIG}return z*HV.JZ/HV.BIG}
{const _st=hStep;hStep=function(dt){_st(dt);if(!G||!G.ent)return;G.ent.forEach(e=>{if(e.sq>0)e.sq-=dt;if(e.wz>0&&!(e.z>0))e.sq=.16;e.wz=e.z||0})}}
{const _dp=drawPlayer;drawPlayer=function(e){if(!PROJ||PROJ!==pvProj||!e||!e.p||G.refl)return _dp(e);const k=pvF(e.y)*HV.BIG,z0=e.z;
  pvLocal(e.x,e.y,k,(gx,gy)=>{const zl=pvZ(e);e.z=zl;CX.save();try{
   // squash on landing, stretch in the air, lean into a sprint
   const air=zl>.3,up=air?(e.vz>0?1.09:1.04):1,sq=e.sq>0?Math.sin(e.sq/.16*Math.PI)*.12:0,sx=(air?.95:1)*(1+sq),sy=up*(1-sq);
   const sp=Math.hypot(e.vx||0,e.vy||0),lean=!air&&sp>6?clamp((e.vx||0)/24,-1,1)*.11:0;
   if(sx!==1||sy!==1||lean){CX.translate(gx,gy);if(lean)CX.transform(1,0,-lean,1,0,0);CX.scale(sx,sy);CX.translate(-gx,-gy)}
   _dp(e)}finally{CX.restore();e.z=z0}})}}
// the ball goes with the player holding it; in the air it is sized by its distance
{const _db=drawBall;drawBall=function(){if(!PROJ||PROJ!==pvProj||!G||!G.b)return _db();const b=G.b;
  if(b.st=='held'&&b.h&&b.h.p){const h=b.h,z0=h.z;return pvLocal(h.x,h.y,pvF(h.y)*HV.BIG,()=>{const zl=pvZ(h);h.z=zl;
    const sh=h.act&&(h.act.k=='shot'||h.act.k=='gather'||h.act.k=='lay'||h.act.k=='dunk');G.pvBZ=((sh?ftOf(h.p)+1.1:1.6)+zl)*HV.BIG-(sh?ftOf(h.p)+1.1+z0:1.6+z0*.3);G.pvBT=performance.now();
    try{_db()}finally{h.z=z0}})}
  // just after a shot or a pass leaves the hands, blend from where the hands were drawn
  const s0=S,pj=PROJ,dz=G.pvBZ&&G.pvBT?G.pvBZ*Math.max(0,1-(performance.now()-G.pvBT)/300):0,z0=b.z;S=S*pvF(b.y||25);if(dz&&b.st!='dead')b.z=(b.z||0)+dz;
  PROJ=(x,y,z)=>{const s1=S;S=s0;try{return pvProj(x,y,z)}finally{S=s1}};try{_db()}finally{S=s0;PROJ=pj;b.z=z0}}}
// benches, coaches and referees scale with distance too
if(typeof drawFig=='function'){const _df=drawFig;drawFig=function(x,y,...a){if(!PROJ||PROJ!==pvProj)return _df(x,y,...a);return pvLocal(x,y,pvF(y)*HV.BIG,()=>_df(x,y,...a))}}
