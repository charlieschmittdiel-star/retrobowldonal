'use strict';
// EA FC-style play: aimed shooting (where you push decides where it goes, the keeper has to reach it), pass power
// (hold Pass longer for a longer, harder pass), jockeying (hold Z), rushing the keeper out (T), first touches that can
// get away from you, sprint dribbling that pushes the ball further ahead and turns wider, and an FC-style player HUD
// (name, stamina bar, pass power bar, who you will switch to). Each part has its own switch.
{const add=[['FC-style play','fcshot','Aimed shooting','Where you push when you shoot is where the ball goes, and the keeper has to reach it. Corners beat keepers; shots at him get saved. Too much power goes over the bar.'],
 ['FC-style play','fcpass','Pass power','Tap Pass for a short ball; hold it longer to pass further and harder. Through balls (Q) go further the longer you hold.'],
 ['FC-style play','jockey','Jockey','Hold Z on defense to jockey: face the ball, shuffle, stay goal-side. Tackles from a jockey are cleaner.'],
 ['FC-style play','gkrush','Rush the keeper','Press T on defense to send your keeper out to close down the shooter.'],
 ['FC-style play','touch1','First touch','Hard passes to players with poor control can bounce off them.'],
 ['FC-style play','sprdrb','Sprint dribbling','Sprinting with the ball pushes it further ahead: you turn wider and are easier to tackle. Walk it for close control.'],
 ['FC-style play','fchud','FC-style player HUD','Your player\'s name and stamina bar, the pass power bar, and a marker on the teammate you will switch to.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const fcUser=e=>G&&!G.auto&&e&&e===G.ctl&&e.t===0&&!G.ctl2;
// ---------- aimed shooting ----------
// the keeper's reach (metres across the goal) for a shot that takes T seconds to arrive
function gkReach(gk,T,tz){const dv=gk.p.sk.div||60,rf=gk.p.sk.ref||dv;return 1.05+dv/100*1.2+clamp(T-.2,0,.5)*(2.15+(rf-60)*.025)-Math.max(0,tz-1.6)*.6}
{const _sh=shoot;shoot=function(e,power,aimY){const user=feat('fcshot')&&fcUser(e)&&G.phase=='live';const r=_sh(e,power,aimY);if(!user)return r;
  try{const b=G.b,S=b.shot;if(!S||S.pen||S.blocked)return r;const s=G.dir[e.t],gx=goalX(s),q=shotQuality(e),gk=S.gk,mv=moveVec();power=power==null?.75:power;
   // where you aimed: up/down across the goal (relative to the screen), centre if you are not pushing up or down
   const ay=mv&&Math.abs(mv[1])>.2?mv[1]:(aimY!=null?Math.sign(aimY-34):0),ty0=34+ay*(GW/2-.45);
   const sk=q.d>20?e.p.sk.lng:e.p.sk.fin,good=G.lastMeter&&G.lastMeter.good&&G.lastMeter.t>1;
   let sig=(1.28-sk/100)*q.d*.055*(1+q.pres*.4)*(1+Math.max(0,power-.92)*3.5)*(good?.75:1)*(feat('fatigue')?1.15-(G.st[e.p.id]||100)/700:1);
   const ty=ty0+gauss()*sig,tz=clamp(.25+power*1.85+gauss()*sig*.55,.1,6);
   const onT_=ty>GY0+.12&&ty<GY1-.12&&tz<GH-.12;
   const v=19+power*13+e.p.sk.fin*.04,d=Math.hypot(gx-e.x,ty-e.y),T=d/v;
   let goal=false;if(onT_){if(!gk)goal=true;else{const off=Math.abs(gk.x-gx)>2.5?Math.abs(gk.x-gx)*.35:0,dy=Math.abs(ty-gk.y)+off;goal=dy>gkReach(gk,T,tz)}}
   if(S.onT!==onT_)bx(e,'sot',onT_?1:-1);
   Object.assign(S,{goal,onT:onT_,T});b.vx=(gx-e.x)/T;b.vy=(ty-e.y)/T;b.vz=(tz+4.9*T*T)/T*.98;
   if(gk){gk.dive=onT_&&!goal?{ty,T,t:0}:goal&&rnd()<.7?{ty:gk.y+Math.sign(ty-gk.y)*Math.min(2.5,Math.abs(ty-gk.y)),T,t:0}:null}}catch(err){console.error(err)}return r}}
// ---------- pass power ----------
const PMT=.9;
function dirMateP(e,kind,pw){const mv=moveVec(),T=onT(0).filter(r=>r!==e&&r.pos!='GK'&&!r.off);let best=null,bs=-1e9;const s=G.dir[0],want=6+pw*42;
 T.forEach(r=>{const dx=r.x-e.x,dy=r.y-e.y,d=Math.hypot(dx,dy)||1;if(d<3)return;let sc=-Math.abs(d-want)*.09-laneRisk(e,r)*3.5+Math.min(6,Math.min(...onT(1).map(o=>dist(o,r))))*.25;
  if(mv)sc+=((dx*mv[0]+dy*mv[1])/d)*7;else sc+=dx*s/d*1.5;if(kind=='through')sc+=(r.run>0?3:0)+dx*s*.06;if(sc>bs){bs=sc;best=r}});return best}
function fcPassGo(kind,pw){const e=G.ctl,b=G.b;if(!e||b.own!==e||G.phase!='live')return;const s=G.dir[0],fwd=(e.x-goalX(-s))*s;
 const r=dirMateP(e,kind,pw);if(!r)return;passTo(e,r,kind=='through'?.5+pw*.7:.45,kind=='through'?'through':null);
 if(G.b.own===null&&G.b.from===e){const k=G.b.kind=='through'?.85+pw*.45:.9+pw*.3,sp=Math.hypot(G.b.vx,G.b.vy);if(sp*k<=28&&!G.b.vz){G.b.vx*=k;G.b.vy*=k}
  if(kind=='through'&&!G.b.vz){const ux=G.b.vx/sp,uy=G.b.vy/sp,ext=pw*7;G.b.vx+=ux*ext*.5;G.b.vy+=uy*ext*.5}}
 G.ctl=r}
{const _hk=hKey;hKey=function(code,down){try{if(feat('fcpass')&&G&&G.live&&!G.paused&&G.phase=='live'&&!G.tut&&!G.ctl2&&(code=='KeyE'||code=='KeyQ')){const e=G.ctl,mine=e&&G.b.own===e;
    if(mine||G.pm){if(down){if(!G.pm&&mine)G.pm={k:code=='KeyQ'?'through':null,t:0,e};return}
     const m=G.pm;G.pm=null;if(m&&m.e===e&&G.b.own===e)fcPassGo(m.k,Math.min(1,m.t/PMT));return}}
   if(feat('gkrush')&&down&&code=='KeyT'&&G&&G.live&&G.phase=='live'&&!(G.b.own&&G.b.own.t===0)){const gk=gkOf(0);if(gk&&!G.auto){gk.rush=1.3;say('Keeper out!',.7)}return}}catch(err){console.error(err)}
  return _hk(code,down)}}
// ---------- jockey ----------
{const _uc=userControls;userControls=function(e,dt){if(G&&G.pm){G.pm.t+=dt;if(G.b.own!==G.pm.e)G.pm=null}
  e.jk=0;if(feat('jockey')&&fcUser(e)&&KEYS.KeyZ&&G.phase=='live'){const c=G.b.own;if(c&&c.t!==e.t){const mv=moveVec(),v=topSpd(e)*.62,own=goalX(-G.dir[e.t]),ux=own-c.x,uy=34-c.y,l=Math.hypot(ux,uy)||1;
    // with no input, hold a goal-side spot 1.8m in front of him; with input, shuffle where you push
    const gx=c.x+ux/l*1.8,gy=c.y+uy/l*1.8,dx=gx-e.x,dy=gy-e.y,dd=Math.hypot(dx,dy)||1;let tx=mv?mv[0]*v:dx/dd*Math.min(v,dd*3),ty=mv?mv[1]*v:dy/dd*Math.min(v,dd*3);
    e.tx=tx;e.ty=ty;e.jk=1;e.spr=false;e.fa=Math.atan2(c.y-e.y,c.x-e.x);G.ctlInput=true;return true}}
  // sprinting with the ball: wider turns
  const r=_uc(e,dt);try{if(r&&feat('sprdrb')&&e.spr&&G.b.own===e&&fcUser(e)){const sp=Math.hypot(e.vx,e.vy),tl=Math.hypot(e.tx,e.ty);if(sp>3&&tl>0){const k=.3,nx=e.vx/sp*(1-k)+e.tx/tl*k,ny=e.vy/sp*(1-k)+e.ty/tl*k,nl=Math.hypot(nx,ny)||1;e.tx=nx/nl*tl;e.ty=ny/nl*tl}}}catch(err){}return r}}
{const _mvA=moveAll;moveAll=function(dt,slow){_mvA(dt,slow);try{if(G&&G.ctl&&G.ctl.jk){const e=G.ctl,c=G.b.own;if(c)e.fa=Math.atan2(c.y-e.y,c.x-e.x)}}catch(err){}}}
{const _tk=tackle;tackle=function(d,slide){const h=G.b.own;if(!h||!d)return _tk(d,slide);let add=0;if(feat('jockey')&&d.jk&&!slide)add+=12;if(feat('sprdrb')&&h.spr)add+=10;
  if(!add)return _tk(d,slide);d.p.sk.tkl+=add;const fo=OPT.fouls,jf=d.jk&&!slide;try{if(jf&&rnd()<.4)OPT.fouls=0;return _tk(d,slide)}finally{d.p.sk.tkl-=add;OPT.fouls=fo}}}
// ---------- keeper rush ----------
{const _ga=gkAI;gkAI=function(e,dt){if(e.rush>0){e.rush-=dt;const c=G.b.own,b=G.b;if(!e.dive&&!(b.own===e)){if(c&&c.t!==e.t){const own=goalX(-G.dir[e.t]);seek(e,c.x+(own-c.x)*.12,c.y+(34-c.y)*.12,1.1);return}if(!b.own){seek(e,b.x,b.y,1.1);return}}}return _ga(e,dt)}}
// ---------- first touch and sprint dribbling ----------
{const _bs=ballStep;ballStep=function(dt){const b=G.b,prevOwn=b.own,kind=b.kind,sp=Math.hypot(b.vx,b.vy),from=b.from;_bs(dt);
  try{if(feat('touch1')&&!prevOwn&&b.own&&b.own!==from&&(kind=='pass'||kind=='through'||kind=='long')&&b.own.pos!='GK'&&G.phase=='live'){const e=b.own,ctl=e.p.sk.ctl||60,
     pres=onT(opp(e.t)).some(o=>!o.off&&dist(o,e)<2.5),pr=clamp((sp-16)*.018*(1.4-ctl/100)+(kind=='long'?.02:0),0,.12)*(pres?1.5:1);
     if(rnd()<pr){const a=e.fa+(rnd()-.5)*1.4,v=3.5+sp*.18;b.own=null;b.lt=e;b.from=e;b.t=-.1;b.kind=null;b.to=null;b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v;b.vz=0;b.x=e.x+Math.cos(a)*.7;b.y=e.y+Math.sin(a)*.7;if(e.t===0&&!G.auto)say('Heavy touch',.6)}}
   if(feat('sprdrb')&&b.own&&b.own.spr){const e=b.own;b.x=e.x+Math.cos(e.fa)*.95;b.y=e.y+Math.sin(e.fa)*.95}}catch(err){console.error(err)}}}
// ---------- the HUD over your player ----------
{const _dp=drawPlayer;drawPlayer=function(e){_dp(e);try{if(!feat('fchud')||!G||G.auto||G.rp||!e.p)return;const [gx,gy]=P(e.x,e.y,0),h=1.8*S*HZ,w=S*.6;
  if(e===G.ctl){const st=(G.st[e.p.id]==null?100:G.st[e.p.id])/100,bw=Math.max(26,w*2.6),bh=Math.max(3,w*.16),y0=gy-h-w*2.55;
   CX.fillStyle='rgba(0,0,0,.55)';CX.fillRect(gx-bw/2-1,y0-1,bw+2,bh+2);CX.fillStyle=st>.6?'#4ade80':st>.35?'#facc15':'#f87171';CX.fillRect(gx-bw/2,y0,bw*st,bh);
   if(G.pm&&G.pm.e===e){const k=Math.min(1,G.pm.t/PMT),W=Math.max(44,w*4),H=7,y1=gy+w*.8;CX.fillStyle='rgba(0,0,0,.6)';CX.fillRect(gx-W/2-2,y1-2,W+4,H+4);CX.fillStyle=G.pm.k=='through'?'#60a5fa':'#facc15';CX.fillRect(gx-W/2,y1,W*k,H);CX.fillStyle='rgba(255,255,255,.5)';[.33,.66].forEach(f=>CX.fillRect(gx-W/2+W*f,y1,1,H))}}
  else if(e.t===0&&!(G.b.own&&G.b.own.t===0)&&e.pos!='GK'){const b=G.b,T=onT(0).filter(x=>x.pos!='GK'&&!x.off).sort((a,c)=>dist(a,b)-dist(c,b)),nx=T[0]===G.ctl?T[1]:T[0];
   if(nx===e){CX.strokeStyle='rgba(250,204,21,.75)';CX.lineWidth=1.5;CX.beginPath();CX.ellipse(gx,gy,w*1.05,w*.42,0,0,7);CX.stroke()}}}catch(err){}}}
// ---------- the controls page ----------
{const _kh=keysHTML;keysHTML=function(){const r=(a,b)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`;let x='';
  if(feat('fcshot'))x+=r('Aim a shot: push up or down as you let go of Shoot (no push = at the keeper)','W / S');if(feat('fcpass'))x+=r('Pass power: tap for short, hold for long','hold E / Q');
  if(feat('jockey'))x+=r('Jockey (defense)','hold Z');if(feat('gkrush'))x+=r('Rush the keeper out (defense)','T');return _kh()+(x?`<table class="t"><tr><th colspan="2">FC-style</th></tr>${x}</table>`:'')}}
