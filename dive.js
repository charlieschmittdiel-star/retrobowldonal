'use strict';
// Diving tackles: a defender who can't quite catch a ball carrier lunges at his legs. If he gets there it's a
// tackle; if he misses (a juke, spin or hurdle beats a dive) he ends up on the ground for a moment. Press V
// (or LB on a controller) to dive with your own defender. Its own switch on the Game features page.
{const a=['On the field','divetk','Diving tackles','Defenders dive at a ball carrier who is pulling away. Press V (LB on a controller) to dive with your defender. Jukes, spins and hurdles beat dives, and a missed dive leaves him on the ground.'];
 if(!FEATS.some(f=>f[1]==a[1])){let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)}}
const DV={n:0,hit:0};
function dvCarrier(){const b=P&&P.b;if(!b)return null;if(b.st=='carry')return b.c;if(b.st=='qb'&&P.scr)return P.off[0];return null}
function dvStart(p,h,user){const lead=.18,tx=h.x+(h.vx||0)*lead,ty=h.y+(h.vy||0)*lead,dx=tx-p.x,dy=ty-p.y,m=Math.hypot(dx,dy)||1;
 p.dv={t:0,dur:.3,ux:dx/m,uy:dy/m,sp:11.5+(p.sk?(p.sk.spd-60)*.05:0),h,user:!!user};p.dvcd=user?1.5:2.2;p.an={k:'dive',t:0,d:.55};p.fa=Math.atan2(dy,dx);p.cool=Math.max(p.cool||0,.4);DV.n++;
 if(user)G.msg='Diving!'}
function dvAI(dt,h){const d=G.dir;P.def.forEach(p=>{p.dvcd=(p.dvcd||0)-dt;if(p.dv||p.dvd>0||p.eng||p.fall||p.gone||p.dvcd>0||(p.cool||0)>0||(p.stun||0)>0||p.bite>0)return;
 if(G.poss!='U'&&p===cd&&!autoMode())return;if(CAR()&&p.pid===R.me)return;const dd=dist(p,h);if(dd<1.4||dd>2.8)return;
 const ux=(h.x-p.x)/dd,uy=(h.y-p.y)/dd,away=(h.vx||0)*ux+(h.vy||0)*uy,gl=d>0?110:10,near=(gl-h.x)*d<7,side=h.y<3||h.y>50.3;
 if(!(away>p.spd*.75||near||side))return;const iq=p.t=='C'?.5+.5*IQ():.9;if(rnd()<dt*4.5*iq)dvStart(p,h,0)})}
function dvPre(dt){P.def.forEach(p=>{if(p.dv||p.dvd>0){p.dvsv=[p.x,p.y,p.fa];p.bite=dt*1.01;p.cool=Math.max(p.cool||0,.15)}else p.dvsv=null})}
function dvPost(dt){const d=G.dir;P.def.forEach(p=>{if(!p.dvsv)return;const sv=p.dvsv;p.dvsv=null;p.x=sv[0];p.y=sv[1];p.fa=sv[2];p.bite=0;
 if(p.dvd>0){p.dvd-=dt;const f=p.fall;if(f){f.t+=dt;const kk=Math.exp(-4.5*dt);f.vx*=kk;f.vy*=kk;p.x=clamp(p.x+f.vx*dt,.5,119.5);p.y=clamp(p.y+f.vy*dt,.4,52.9)}
  if(p.dvd<=0){p.fall=null;p.an=null;p.stun=.25;p.cool=.3}return}
 const v=p.dv;if(!v)return;v.t+=dt;p.x=clamp(p.x+v.ux*v.sp*dt,.5,119.5);p.y=clamp(p.y+v.uy*v.sp*dt,.4,52.9);p.vx=v.ux*v.sp;p.vy=v.uy*v.sp;
 const h=dvCarrier();if(G.phase=='play'&&!P.over&&h&&h===v.h&&!h.fall&&dist(p,h)<1.25){
  let pr=clamp(.5+((p.o||70)-(h.o||70))/160,.25,.85);if(h.jk>0)pr*=.3;if(h.spin>0)pr*=.4;if(h.hrd>0)pr*=.12;if(typeof tackleMod=='function')pr*=tackleMod(p,h);p.dv=null;
  if(rnd()<pr){DV.hit++;P.tkl=p;p.cool=0;if(!(h.y<.8||h.y>52.2))ragTackle(p,h);const qb=h===P.off[0]&&P.b.st=='qb';endPlay(qb?'sack':'tackle',h.x);if(P.over){G.msg='Diving tackle! '+(G.msg||'');if(typeof xLog=='function'&&feat('pbp'))xLog(`${typeof xNm=='function'?xNm(p):p.pos} makes a diving tackle.`)}return}
  if(rnd()<.45){h.stun=Math.max(h.stun||0,.3);if(h.t=='U')G.msg='Stumbled! He got a hand on your ankle.'}else if(p.t=='U'||v.user)G.msg='Missed the dive!';dvFall(p,v);return}
 if(v.t>=v.dur){p.dv=null;dvFall(p,v)}})}
function dvFall(p,v){p.fall={t:0,lag:0,dur:.22,vx:v.ux*3.5,vy:v.uy*3.5};p.dvd=.95+rnd()*.3;p.cool=1.2;if(typeof puff=='function')puff(p.x,p.y,4,.8)}
{const _st=step;step=function(dt){const on=feat('divetk')&&G.phase=='play'&&P&&!P.over;if(on)try{const h=dvCarrier();if(h)dvAI(dt,h);dvPre(dt)}catch(e){console.error(e)}
 _st(dt);if(on&&P)try{dvPost(dt)}catch(e){console.error(e)}}}
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P)P.def.forEach(p=>{p.dv=null;p.dvd=0;p.dvcd=0;p.dvsv=null})}catch(e){}return r}}
// your defender: V on the keyboard, LB on a controller, or the Dive button
function userDive(){if(!feat('divetk')||G.phase!='play'||!P||P.over||G.poss=='U'||!cd||cd.dv||cd.dvd>0||cd.eng||cd.fall)return;if((cd.dvcd||0)>0){G.msg='Dive recharging';return}
 const h=dvCarrier();if(h&&dist(cd,h)<5)dvStart(cd,h,1);else{const a=cd.fa||0;dvStart(cd,{x:cd.x+Math.cos(a)*3,y:cd.y+Math.sin(a)*3,vx:0,vy:0},1);if(h)cd.dv.h=h}}
{const _h=hit;hit=function(k,...a){if(k=='v'&&P&&G.poss!='U'&&!autoMode()&&$('modal').hidden){userDive();return}return _h(k,...a)}}
{const _pb=padBtn;padBtn=function(i,...a){try{if(i==4&&G&&P&&G.phase=='play'&&G.poss!='U'&&$('modal').hidden&&!(cd&&cd.eng))return hit('v')}catch(e){}return _pb(i,...a)}}
(()=>{const c=$('dctl');if(c&&!c.querySelector('[data-k="v"]'))c.insertAdjacentHTML('beforeend','<button data-k="v">Dive</button>')})();
{const _cp=ctlPage;ctlPage=function(...a){const r=_cp.apply(this,a);try{const t=[...document.querySelectorAll('#modal table.ctl td')].find(x=>x.textContent=='Hit stick');if(t&&feat('divetk'))t.parentElement.insertAdjacentHTML('afterend','<tr><td>Diving tackle</td><td><kbd>V</kbd></td><td>LB</td></tr>')}catch(e){}return r}}
{const _ui=ui;ui=function(...a){const r=_ui.apply(this,a);try{const b=$('dctl')&&$('dctl').querySelector('[data-k="v"]');if(b)b.style.display=feat('divetk')?'':'none'}catch(e){}return r}}
