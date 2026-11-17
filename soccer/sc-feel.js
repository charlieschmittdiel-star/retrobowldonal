'use strict';
// Match feel pack. Long balls and crosses now come down where they are aimed (they used to fly about 60% too far and
// almost always went out of play). Plus, each with its own switch: a calmer, more realistic CPU build-up (players take
// a touch and look up, passes are crisper), assisted receiving (the player you pass to comes to meet the ball),
// natural dribbling (the ball rolls ahead of the feet with each touch and swings round on turns), calling a teammate's
// run in behind (Z), the one-two (T, then T again to play it back), and a camera that looks ahead to where the play is going.
{const add=[['Match feel','flow2','Realistic build-up','The CPU takes a touch and looks up before passing instead of one-touching everything, and ground passes are crisper. Fewer ping-pong turnovers.'],
 ['Match feel','recv2','Assisted receiving','The player you pass to moves to meet the ball by himself until it reaches him, so a pass is not lost because you were still holding a direction.'],
 ['Match feel','drib2','Natural dribbling','The ball rolls a little ahead of the player with each touch and swings round when he turns, instead of being stuck to his foot. Bigger touches when sprinting.'],
 ['Match feel','callrun','Call a run','With the ball, press Z: your best-placed forward holds the defensive line, then bursts in behind when you play the through ball (Q).'],
 ['Match feel','onetwo','One-two','With the ball, press T to pass and sprint forward. Press T again to play it straight back into his run.'],
 ['Match feel','cam2','Look-ahead camera','The camera leans toward the goal being attacked, so you see the space and the teammates in front of you.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;HFEATS.push(a)})}
// the second-last defender of team k's opponents, measured in team k's attacking direction (the offside line)
function offLine(k){const s=G.dir[k],D=onT(opp(k)).filter(o=>!o.off).map(o=>o.x*s).sort((a,c)=>c-a);return D[1]!=null?D[1]:D[0]||0}
// ---------- lofted balls land where they are aimed (a fix, always on) ----------
{const _pt=passTo;passTo=function(e,r,lead,kind){const r0=_pt(e,r,lead,kind);try{const b=G.b;b.land=null;
  if(b.own===null&&b.from===e&&b.vz>0&&r){const h=Math.hypot(b.vx,b.vy);if(h>.1){lead=lead==null?.5:lead;
   const tx=clamp(r.x+(r.vx||0)*lead*1.4,.5,PL-.5),ty=clamp(r.y+(r.vy||0)*lead*1.4,.5,PW-.5),d0=Math.hypot(tx-e.x,ty-e.y);
   const T=Math.abs(h-19)<1e-6?clamp(d0/19,.7,2.4):h<19?.7:2.4,zt=kind=='cross'?1.15:.35;
   b.vz=Math.max(2,(zt-(b.z||.2)+4.9*T*T)/T);b.land={x:e.x+b.vx*T,y:e.y+b.vy*T,T}}}
  // crisper ground passes
  if(feat('flow2')&&G.phase=='live'&&b.own===null&&b.from===e&&!b.vz&&kind!='cross'){const sp=Math.hypot(b.vx,b.vy),k2=kind=='through'?1.1:1.22,ns=Math.min(27,sp*k2);if(sp>0&&ns>sp){b.vx*=ns/sp;b.vy*=ns/sp}}}catch(err){console.error(err)}return r0}}
// ---------- realistic build-up: take a touch and look up when there is time ----------
{const _gv=give;give=function(e){_gv(e);try{if(!feat('flow2')||!G||G.phase!='live'||e.pos=='GK'||!e.cd)return;if(e.t===0&&!G.auto)return;
  const m=Math.min(...onT(opp(e.t)).filter(o=>!o.off).map(o=>dist(o,e)));e.cd.dec=m>8?.75+rnd()*.6:m>4.5?.45+rnd()*.35:e.cd.dec}catch(err){}}}
// a defender right on top of the passer can only get a foot to it (a deflection and a scramble), not trap it cleanly
{const _bs=ballStep;ballStep=function(dt){const b=G.b,fr=b.from;let held=null;
  try{if(feat('flow2')&&G.phase=='live'&&!b.own&&fr&&b.kind!='shot'&&b.kind!='cross'&&(b.t||0)<.22&&!b.vz){const sp=Math.hypot(b.vx,b.vy)||1,ux=b.vx/sp,uy=b.vy/sp;
    held=onT(opp(fr.t)).filter(o=>!o.off&&o.pos!='GK'&&!(o.stun>.3)&&Math.hypot(o.x-b.x,o.y-b.y)<1.3);held.forEach(o=>o.stun+=10);
    if(!b.defl&&held.length){b.defl=1;const o=held[0],perp=Math.abs((o.x-b.x)*-uy+(o.y-b.y)*ux),ahead=(o.x-b.x)*ux+(o.y-b.y)*uy;
     if(ahead>-.2&&perp<.55&&rnd()<.45){const a=Math.atan2(uy,ux)+(rnd()<.5?-1:1)*(.6+rnd()*.9),v=sp*(.25+rnd()*.2);b.vx=Math.cos(a)*v;b.vy=Math.sin(a)*v;b.kind=null;b.to=null;b.lt=o;b.from=o;b.t=.1;G.ev.push('block')}}}}catch(err){held=held||[]}
  try{_bs(dt)}finally{if(held)held.forEach(o=>o.stun-=10)}}}
{const _pt=passTo;passTo=function(e,r,lead,kind){const r0=_pt(e,r,lead,kind);try{G.b.defl=0}catch(err){}return r0}}
// ---------- off the ball: meeting lofted balls, called runs, one-two runs ----------
{const _ta=teamAI;teamAI=function(e,dt){try{if(G.phase=='live'&&e.pos!='GK'){const b=G.b,k=e.t,s=G.dir[k];
   // a lofted ball coming to him: go to where it comes down
   if(!b.own&&b.to===e&&b.land&&b.kind!='shot'&&b.t<b.land.T+.4){const L=b.land;return seek(e,L.x,L.y,1)}
   const ours=(b.own&&b.own.t===k&&b.own!==e)||(!b.own&&b.from&&b.from.t===k&&b.to!==e);
   if(e.callRun>0||e.give2>0){if(e.callRun>0)e.callRun-=dt;if(e.give2>0)e.give2-=dt;
    if(!(e.callRun>0)&&!(e.give2>0)){e.run=0}
    else if(ours){// hold the line until the ball is played, staying onside, then (the through ball) chase it
     const line=offLine(k),ballX=b.x*s,X=Math.max(Math.min(line-.6,(e.x*s)+(e.give2>0?9:4)),Math.min(ballX,line-.6)),y=e.runY!=null?e.runY:e.y;
     e.run=Math.max(e.run||0,.5);return seek(e,X*s,y,e.give2>0?1.18:1.05)}}}}catch(err){console.error(err)}return _ta(e,dt)}}
// ---------- assisted receiving ----------
{const _uc=userControls;userControls=function(e,dt){try{const b=G&&G.b;if(feat('recv2')&&fcUser(e)&&G.phase=='live'&&b&&!b.own&&b.to===e&&b.kind!='shot'&&b.from&&b.from.t===e.t&&b.from!==e&&(b.t||0)<3){e.spr=false;return false}}catch(err){}return _uc(e,dt)}}
// ---------- natural dribbling ----------
{const _bs=ballStep;ballStep=function(dt){_bs(dt);try{const b=G.b,e=b.own;if(!feat('drib2')||!e||e.pos=='GK'||G.phase!='live'||!e.p)return;
  const v=Math.hypot(e.vx,e.vy),sk=e.p.sk,D=e._dr||(e._dr={a:e.fa,ph:0,off:.5});
  // the ball's direction swings round toward where he is facing (quicker for agile players, slower at a sprint)
  let da=e.fa-D.a;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;const w=(6+(sk.agi||60)*.06)*(e.spr?.65:1);D.a+=clamp(da,-w*dt,w*dt);
  let off;if(v<1.2){D.ph=0;D.off+=(.45-D.off)*Math.min(1,dt*8);off=D.off}
  else{const tau=e.spr?.62:.5;D.ph+=dt/tau;if(D.ph>=1){D.ph-=1;if(e.t===0&&!G.auto&&e===G.ctl)G.ev.push('dtouch')}
   const peak=clamp(.12+v*.085*(e.spr?1.5:1)*(1.3-(sk.dri||60)/150)*(1.2-(sk.ctl||60)/250),.1,1.25);off=.38+4*peak*D.ph*(1-D.ph);D.off=off}
  b.x=clamp(e.x+Math.cos(D.a)*off,.05,PL-.05);b.y=clamp(e.y+Math.sin(D.a)*off,.05,PW-.05)}catch(err){}}}
{const _gv=give;give=function(e){_gv(e);try{if(e&&e.fa!=null)e._dr={a:Math.atan2(G.b.y-e.y,G.b.x-e.x)||e.fa,ph:0,off:.5}}catch(err){}}}
// ---------- calling a run, the one-two ----------
function callRunGo(){const e=G.ctl,b=G.b;if(!e||b.own!==e)return false;const k=e.t,s=G.dir[k],mv=moveVec();
 const T=onT(k).filter(r=>r!==e&&!r.off&&r.pos!='GK'&&!(r.callRun>0)&&(r.pos=='ST'||r.pos=='WG'||r.pos=='CM'||r.pos=='FB'));if(!T.length)return false;
 let best=null,bs=-1e9;T.forEach(r=>{const ahead=(r.x-e.x)*s;let sc=ahead*.5+(r.pos=='ST'?6:r.pos=='WG'?4:r.pos=='CM'?1:0)-Math.abs(r.y-e.y)*.08;if(mv&&Math.abs(mv[1])>.3)sc+=(r.y-e.y)*Math.sign(mv[1])*.15;if(ahead<-5)sc-=10;if(sc>bs){bs=sc;best=r}});
 if(!best)return false;best.callRun=3.6;best.run=3.6;best.cd.run=4;best.runY=clamp(best.y+(34-best.y)*.25,6,PW-6);say(`${best.p.ln} makes a run!`,1);return true}
function oneTwoGo(){const e=G.ctl,b=G.b;if(!e||b.own!==e)return false;const mate=onT(e.t).find(r=>r!==e&&r.give2>0);
 // T again while a teammate is on a one-two run: play it back into his path
 if(mate){passTo(e,mate,.7);if(G.b.from===e){G.ctl=mate;mate.give2=0;mate.callRun=0;mate.run=1.2;say('One-two!',.9)}return true}
 const r=typeof dirMateP=='function'?dirMateP(e,null,.3):dirMate(e,null);if(!r)return false;passTo(e,r,.45);if(G.b.from!==e)return false;G.ctl=r;
 e.give2=3;e.run=3;e.cd.run=4;e.runY=clamp(e.y+(34-e.y)*.15,5,PW-5);say('Pass and go',.8);return true}
{const _hk=hKey;hKey=function(code,down){try{if(G&&G.live&&!G.paused&&G.phase=='live'&&!G.ctl2&&!G.auto&&(code=='KeyZ'||code=='KeyT')){const has=G.b.own&&G.b.own.t===0,mine=G.ctl&&G.b.own===G.ctl;
   if(code=='KeyZ'&&feat('callrun')&&mine){if(down)callRunGo();return}
   if(code=='KeyT'&&feat('onetwo')){if(mine){if(down)oneTwoGo();return}
    // the ball is on its way during a one-two: do not send the keeper out by mistake
    if(!has&&onT(0).some(r=>r.give2>0)&&G.b.from&&G.b.from.t===0)return}}}catch(err){console.error(err)}return _hk(code,down)}}
// a marker over a player making a called run or a one-two run
{const _dp=drawPlayer;drawPlayer=function(e){_dp(e);try{if(G.auto||G.rp||!(e.callRun>0||e.give2>0)||e.t!==0)return;const [gx,gy]=P(e.x,e.y,0),h=1.8*S*HZ,s=G.dir[0],y=gy-h-S*.9,t=performance.now()/1000;
  CX.save();CX.translate(gx,y);CX.fillStyle=e.give2>0?'#a78bfa':'#38bdf8';CX.globalAlpha=.75+.25*Math.sin(t*8);const L=S*.9;CX.beginPath();CX.moveTo(s*L,0);CX.lineTo(-s*L*.2,-L*.45);CX.lineTo(-s*L*.2,L*.45);CX.closePath();CX.fill();CX.restore()}catch(err){}}}
// ---------- look-ahead camera ----------
{const _cam=camera;camera=function(){if(!feat('cam2')||!G||!G.b)return _cam();const b=G.b,k=b.own?b.own.t:G.lastTeam,want=G.phase=='live'||G.phase=='dead'?G.dir[k]*7:0;G.camL=(G.camL||0)+(want-(G.camL||0))*.03;
  const x0=b.x;b.x=x0+G.camL;try{_cam()}finally{b.x=x0}}}
// ---------- the controls page and the hint line ----------
{const _kh=keysHTML;keysHTML=function(){const r=(a,b)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`;let x='';if(feat('callrun'))x+=r('Call a teammate\'s run in behind, then Q to find him','Z');if(feat('onetwo'))x+=r('One-two: pass and sprint; T again plays it back','T, then T');
  return _kh()+(x?`<table class="t"><tr><th colspan="2">Creative play</th></tr>${x}</table>`:'')}}
{const _dh=drawHUD;drawHUD=function(){_dh();try{if(!G||G.auto||G.paused||G.rp||VW<=900||!(feat('callrun')||feat('onetwo')))return;if(!(G.b.own&&G.b.own===G.ctl))return;
  const t=[feat('callrun')?'Z call a run':'',feat('onetwo')?'T one-two':''].filter(Boolean).join(' · ');CX.font='600 12px system-ui';CX.textBaseline='middle';CX.textAlign='right';CX.fillStyle='rgba(125,211,252,.9)';CX.fillText(t,VW-12,VH-38)}catch(err){}}}
