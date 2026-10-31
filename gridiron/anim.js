'use strict';
// Move animations. Jukes and spins no longer jump: the player actually travels there over a fraction of a second
// (plant, lean, cut) with a short blur trail. Trucks lower the shoulder and knock the defender back, hurdles leave
// the ground. Only the look and the path changed; how well each move works is the same as before.
const jEase=t=>t<0?0:t>1?1:t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function animStep(dt){if(!P)return;P.off.concat(P.def).forEach(p=>{const j=p.jm;
  if(j&&j.t<j.d){const f0=jEase(j.t/j.d);j.t+=dt;const f1=jEase(j.t/j.d);p.x=clamp(p.x+j.x*(f1-f0),.5,119.5);p.y=clamp(p.y+j.y*(f1-f0),.4,52.6);j.tr.unshift([p.x,p.y]);if(j.tr.length>8)j.tr.length=8}
  else if(j){j.t+=dt;if(j.tr.length)j.tr.pop();if(j.t>j.d+.4)p.jm=null}
  if(p.hrd>0)p.jz=Math.sin(Math.PI*clamp(1-p.hrd/.45,0,1))*1.4;else if(p.hz){p.jz=0;p.hz=0}if(p.hrd>0)p.hz=1;
  const k=p.kb;if(k&&k.t<.35){k.t+=dt;const a=Math.exp(-6*k.t);p.x=clamp(p.x+k.x*a*dt,.5,119.5);p.y=clamp(p.y+k.y*a*dt,.4,52.6)}})}
{const _st=step;step=function(dt){_st(dt);try{animStep(G.slow>0&&feat('slowmo')?dt*.3:dt)}catch(e){console.error(e)}}}
// a truck that works sends the tackler flying back
{const _bt=brokeTackle;brokeTackle=function(p,h){_bt(p,h);if(h.trk>0){const dx=p.x-h.x,dy=p.y-h.y,m=Math.hypot(dx,dy)||1;p.kb={t:0,x:dx/m*9,y:dy/m*9};puff(p.x,p.y,7,1.3);if(typeof shakeT!='undefined'){shakeT=.2;shakeA=3}}}}
// drawing: blur trail, lean into the cut, spin turn, shoulder lowered, airborne hurdle with the shadow left on the ground
{const _sp=sprite;sprite=function(p,t){if(p.gone)return _sp(p,t);const j=p.jm,live=G&&G.phase!='replay';
 if(live&&j&&j.tr.length>1){const sx=p.x,sy=p.y,a0=X.globalAlpha;[[2,.32],[4,.18],[6,.09]].forEach(([i,al])=>{const q=j.tr[i];if(!q)return;p.x=q[0];p.y=q[1];X.globalAlpha=a0*al;_sp(p,t)});X.globalAlpha=a0;p.x=sx;p.y=sy}
 let rot=0,sxk=1,fa=p.fa;const s=P2(p.x,p.y);
 if(live&&j&&j.t<j.d){const f=j.t/j.d,scr=Math.sign(j.x)||1;if(j.k=='juke'){rot=(f<.25?-1:1)*scr*.32*Math.sin(Math.PI*Math.min(1,f*1.2));if(Math.abs(j.x)<Math.abs(j.y)*.5)sxk=1-.15*Math.sin(Math.PI*f)}
  else{const ph=f*Math.PI*2;sxk=.35+.65*Math.abs(Math.cos(ph));p.fa=Math.cos(ph)>=0?fa:fa+Math.PI}}
 else if(live&&p.trk>0){const v=Math.hypot(p.vx||0,p.vy||0);rot=v>.3?Math.sign(p.vx||1)*.38:0}
 else if(live&&p.kb&&p.kb.t<.35)rot=-Math.sign(p.kb.x||1)*.45*(1-p.kb.t/.35);
 const air=(p.jz||0)>.05;if(air){X.fillStyle='rgba(0,0,0,.28)';X.beginPath();X.ellipse(s[0],s[1],9*scY(p.y)*(1-p.jz*.2),3.2*scY(p.y)*(1-p.jz*.2),0,0,7);X.fill()}
 const tf=rot||sxk!=1;if(tf){X.save();X.translate(s[0],s[1]);X.rotate(rot);X.scale(sxk,1);X.translate(-s[0],-s[1])}
 const el=X.ellipse;if(air)X.ellipse=function(){};let hy;try{hy=_sp(p,t)}finally{X.ellipse=el;p.fa=fa;if(tf)X.restore()}return hy}}
