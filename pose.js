'use strict';
// Animation triggers and timing for the pose system in render.js: throws, pump fakes, handoffs, kicks and the
// little jumps on over-the-top catches, dives and toe-taps. Pure looks: none of this changes how plays turn out.
function anTick(dt){if(!P)return;P.off.concat(P.def).forEach(p=>{const a=p.an;if(!a){if(p.jzA){p.jz=0;p.jzA=0}return}a.t+=dt;if(a.t>a.d){p.an=null;if(p.jzA){p.jz=0;p.jzA=0}return}
 const arc=a.k=='overtop'?[.5,.9]:a.k=='dive'?[.3,.55]:a.k=='toetap'?[.4,.25]:null;if(arc){p.jzA=1;p.jz=a.t<arc[0]?Math.sin(Math.PI*a.t/arc[0])*arc[1]:0}
 if(a.k=='toetap'&&a.t<.6&&rnd()<dt*14)puff(p.x+(rnd()-.5)*.6,p.y,1,.4)})}
{const _st=step;step=function(dt){const was=P&&P.b.st;_st(dt);try{const b=P.b;if(was=='qb'&&b.st=='carry'&&P.run&&b.c!==P.off[0])P.off[0].an={k:'hand',t:0,d:.35};anTick(dt)}catch(e){console.error(e)}}}
{const _ps=postStep;postStep=function(dt){_ps(dt);try{anTick(dt)}catch(e){}}}
{const _kt=kickTick;kickTick=function(dt){_kt(dt);try{anTick(dt)}catch(e){}}}
{const _ta=throwAt;throwAt=function(tx,ty){const q=P.off[0],was=P.b.st;_ta(tx,ty);if(was=='qb'&&P.b.st=='air')q.an={k:'throw',t:.13,d:.45}}}
{const _pm=pump;pump=function(){const was=P.pump;_pm();if(P.pump>0&&!(was>0))P.off[0].an={k:'pump',t:0,d:.4}}}
{const _kl=kLaunch;kLaunch=function(){_kl();try{const kk=P.kk,kp=kk.kind=='punt'?P.off[0]:P.off[5];kp.an={k:'kick',t:0,d:.55}}catch(e){}}}
