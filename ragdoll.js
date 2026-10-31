'use strict';
// Tackle animation. Instead of physics ragdolls, a tackle is choreographed: the tackler lunges and wraps the ball
// carrier, both carry forward with the momentum of the hit for a moment, then go down together (the tackler a beat
// later, landing on top). Bigger hits drive them further, kick up more turf and shake the camera a little.
const FALLS=[],DUST=[];let shakeT=0,shakeA=0,animLast=0;
function clearRags(){FALLS.length=0;DUST.length=0;shakeT=0}
const ease=t=>1-Math.pow(1-clamp(t,0,1),3);
function puff(x,y,n,s){for(let i=0;i<n;i++)DUST.push({x:x+(rnd()-.5)*.6,y:y+(rnd()-.5)*.5,vx:(rnd()-.5)*2*s,vy:(rnd()-.5)*1.4*s,t:0,life:.45+rnd()*.35,r:.25+rnd()*.3})}
// Called by the game when a tackle (or sack) happens: p is the tackler, h the ball carrier.
function ragTackle(p,h){const dx=h.x-p.x,dy=h.y-p.y,d=Math.hypot(dx,dy)||1,ix=dx/d,iy=dy/d,big=p.hs>0||h.trk>0;
 const pow=.55+(p.hs>0?.55:0)+Math.min(.45,Math.hypot(p.vx||0,p.vy||0)/18);
 const vx=(h.vx||0)*.45+ix*pow*2.4,vy=(h.vy||0)*.45+iy*pow*2.4;
 h.fall={t:0,lag:0,dur:.5-.1*Math.min(1,pow-.55),vx,vy};
 p.fall={t:0,lag:.07,dur:.55,vx:vx*.95,vy:vy*.95,wrap:h,ox:-ix*.55,oy:-iy*.55};
 FALLS.push(h,p);puff((h.x+p.x)/2,(h.y+p.y)/2,big?10:5,big?1.6:1);if(big){shakeT=.28;shakeA=5}}
// Between the whistle and the next snap: fallen players finish going down, everyone else coasts to a stop.
function postStep(dt){if(!P)return;const k=Math.exp(-2.2*dt);
 P.off.concat(P.def).forEach(p=>{const f=p.fall;
  if(f){f.t+=dt;const ft=f.t-f.lag;if(f.wrap&&ft<.14){const w=f.wrap,a=Math.min(1,dt*9);p.x+=(w.x+f.ox-p.x)*a;p.y+=(w.y+f.oy-p.y)*a;return}
   const kk=Math.exp(-4.5*dt);f.vx*=kk;f.vy*=kk;p.x=clamp(p.x+f.vx*dt,.5,119.5);p.y=clamp(p.y+f.vy*dt,.4,52.6);
   if(!f.landed&&ft>=f.dur){f.landed=1;puff(p.x+f.vx*.08,p.y+f.vy*.08,4,.8)}p.vx=p.vy=0;return}
  if(!(p.vx||p.vy))return;p.vx*=k;p.vy*=k;if(Math.hypot(p.vx,p.vy)<.25){p.vx=p.vy=0;return}p.x=clamp(p.x+p.vx*dt,.5,119.5);p.y=clamp(p.y+p.vy*dt,.4,52.6)})}
function ragTick(){const now=performance.now()/1000,dt=Math.min(.05,animLast?now-animLast:0);animLast=now;
 for(let i=DUST.length-1;i>=0;i--){const q=DUST[i];q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.92;q.vy*=.92;if(q.t>q.life)DUST.splice(i,1)}if(shakeT>0)shakeT-=dt}
// How far through his fall a player is (0 standing, 1 on the ground), with a small bounce on landing.
function fallProg(p){const f=p.fall;if(!f)return 0;const t=(f.t-f.lag)/f.dur;if(t<=0)return 0;if(t<1)return ease(t)*1.04;return 1+Math.max(0,.04-(t-1)*.4)*Math.sin((t-1)*30)}
