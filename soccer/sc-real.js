'use strict';
// Realism pack. Hold-for-power shooting like EA FC (no green zone: the longer you hold, the harder and higher it goes),
// realistic finishing (shots on the run, under pressure or at full power are less accurate, and the keeper covers his
// angle), tougher defending (defenders take the ball off a player who stands still and stop straight-line sprints),
// a cleaner match screen, and a formation designer. Each part has its own switch.
{const add=[['FC-style play','fcpower','Hold-for-power shooting','Hold Shoot longer for a harder, higher shot. There is no green zone to hit: a short hold is a soft, low shot, a long hold is a rocket that can fly over the bar. Off: the old bar with a green zone.'],
 ['FC-style play','fin2','Realistic finishing','Shots taken while sprinting, with a defender on you, from a tight angle or at full power are less accurate, and the keeper covers his angle. Set yourself and pick a corner.'],
 ['FC-style play','def3','Tougher defending','Defenders step in and take the ball if you stand still, poke it away when you sprint straight at them, and a second defender blocks your path to goal.'],
 ['Presentation','hud3','Cleaner match screen','A smaller radar that no longer covers the key hints, and a tidier How to play box.'],
 ['Tactics','fdes','Formation designer','Drag your ten outfield players anywhere on a board to make your own formation, then pick "Custom" on the Squad page.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const FCP=()=>feat('fcpower')&&feat('meter'),PT=.85;   // PT = seconds of holding for a full bar
// ---------- hold-for-power ----------
// the shot the bar would give right now: 0 (tap) to 1 (full)
function fcPow(t){return clamp(t/PT,.1,1)}
{const _ss=startShot;startShot=function(){const r=_ss();if(G&&G.meter&&FCP()){G.meter.fc=1;G.meter.spr=!!G.meter.e.spr}return r}}
{const _rs=releaseShot;releaseShot=function(){const m=G&&G.meter;if(!m||!m.fc||!FCP())return _rs();G.meter=null;const e=m.e;if(G.b.own!==e)return;const p=fcPow(m.t);G.lastMeter={v:p,t:1.1,fc:1,good:false};G.fcp=p;G.fcspr=m.spr&&m.t<.45;try{shoot(e,p,aimY(e))}finally{G.fcp=null;G.fcspr=0}}}
{const _ms=meterStep;meterStep=function(dt){const m=G&&G.meter;if(m&&m.fc&&FCP()){if(G.lastMeter)G.lastMeter.t-=dt;m.t+=dt;if(G.b.own!==m.e||G.phase!='live'){G.meter=null}else if(m.t>=PT+.12)releaseShot();const P=G.pen;if(P&&P.meter)P.meter.t+=dt;return}return _ms(dt)}}
// you keep most of your speed while you wind up (the old bar slowed you to half)
{const _uc=userControls;userControls=function(e,dt){const m=G&&G.meter;if(m&&m.fc&&m.e===e&&FCP()&&!G.auto){const mv=moveVec(),v=topSpd(e)*.62;e.spr=false;e.tx=mv?mv[0]*v:e.vx*.7;e.ty=mv?mv[1]*v:e.vy*.7;G.ctlInput=!!mv;return true}return _uc(e,dt)}}
// ---------- where a player's shot goes ----------
// how far the keeper can get across in the time the ball takes to reach him (metres)
function gkReach2(gk,T,tz){const dv=gk.p.sk.div||60,rf=gk.p.sk.ref||dv;return clamp(.7+dv/100*.5+Math.max(0,T-.18)*(3.9+(rf-60)*.03),1.05,2.8+Math.max(0,T-.6)*1.6)-Math.max(0,tz-1.5)*.5}
function fcShotCalc(e,power,ay,gk,o){const s=G.dir[e.t],gx=goalX(s),q=shotQuality(e),fin2=o.fin2,sk=q.d>20?e.p.sk.lng:e.p.sk.fin;
 const ty0=34+ay*(GW/2-.5),spd=Math.hypot(e.vx,e.vy),top=topSpd(e)||6;
 let sig=(1.28-sk/100)*q.d*(fin2?.062:.055);
 if(fin2){const pr=onT(opp(e.t)).filter(x=>x.pos!='GK'&&dist(x,e)<1.6).length;sig*=1+.6*Math.pow(clamp(spd/top,0,1.2),2)+(o.spr?.45:0);sig*=1+pr*.35;sig*=1+Math.max(0,power-.6)*1.3;sig/=Math.max(.38,Math.abs(gx-e.x)/Math.max(1,q.d))}
 else sig*=(1+q.pres*.4)*(1+Math.max(0,power-.92)*3.5);
 if(feat('fatigue'))sig*=1.15-(G.st[e.p.id]||100)/700;
 const ty=ty0+gauss()*sig,tz=clamp(.2+power*power*1.9+Math.max(0,power-.86)*9+gauss()*sig*.5*(.5+power),.1,7);
 const on=ty>GY0+.12&&ty<GY1-.12&&tz<GH-.1,v=14+power*18+e.p.sk.fin*.04,d=Math.hypot(gx-e.x,ty-e.y),T=d/v;
 let goal=false;if(on){if(!gk)goal=true;else{// how close the ball passes to the keeper, and when
   const ux=(gx-e.x)/d,uy=(ty-e.y)/d,along=clamp((gk.x-e.x)*ux+(gk.y-e.y)*uy,0,d),px=e.x+ux*along,py=e.y+uy*along,perp=Math.hypot(gk.x-px,gk.y-py),Tk=along/v,hz=tz*along/d;
   goal=fin2?rnd()>clamp(.5+(gkReach2(gk,Tk,hz)-perp)*1.7,.02,.98):perp>gkReach(gk,T,tz)}}
 return{ty,tz,on,goal,T,v,d}}
{const _sh=shoot;shoot=function(e,power,aimY){const user=FCP()&&G.fcp!=null&&feat('fcshot')&&fcUser(e)&&G.phase=='live';const spr=!!G.fcspr,r=_sh(e,power,aimY);if(!user)return r;
  try{const b=G.b,S=b.shot;if(!S||S.pen||S.blocked)return r;const s=G.dir[e.t],gx=goalX(s),gk=S.gk,mv=moveVec();
   const ay=mv&&Math.abs(mv[1])>.2?Math.sign(mv[1]):0,c=fcShotCalc(e,power,ay,gk,{fin2:feat('fin2'),spr});
   if(S.onT!==c.on)bx(e,'sot',c.on?1:-1);Object.assign(S,{goal:c.goal,onT:c.on,T:c.T});b.vx=(gx-e.x)/c.T;b.vy=(c.ty-e.y)/c.T;b.vz=(c.tz+4.9*c.T*c.T)/c.T*.98;
   if(gk)gk.dive=c.on&&!c.goal?{ty:c.ty,T:c.T,t:0}:c.goal&&rnd()<.75?{ty:gk.y+Math.sign(c.ty-gk.y)*Math.min(2.6,Math.abs(c.ty-gk.y)),T:c.T,t:0}:null}catch(err){console.error(err)}return r}}
// the power bar: plain fill, with a mark where shots start to fly over
{const _dh=drawHUD;drawHUD=function(){const mt=G.meter,lm=G.lastMeter&&G.lastMeter.t>0?G.lastMeter:null,fc=FCP()&&((mt&&mt.fc)||(lm&&lm.fc&&!mt));
  if(!fc)return _dh();const sm=G.meter,sl=G.lastMeter;G.meter=null;G.lastMeter=null;try{_dh()}finally{G.meter=sm;G.lastMeter=sl}
  try{const e=mt?mt.e:G.ctl;if(!e)return;const [gx,gy]=P(e.x,e.y,0),h=1.8*S*HZ,W=70,x0=gx-W/2,y0=gy+12,v=mt?fcPow(mt.t):lm.v;
   CX.fillStyle='rgba(15,23,42,.85)';CX.fillRect(x0-2,y0-2,W+4,13);const g=CX.createLinearGradient(x0,0,x0+W,0);g.addColorStop(0,'#fde68a');g.addColorStop(.6,'#fb923c');g.addColorStop(1,'#ef4444');CX.fillStyle=g;CX.fillRect(x0,y0,W*v,9);
   CX.fillStyle='rgba(255,255,255,.75)';CX.fillRect(x0+W*.86,y0-2,1.5,13)}catch(err){}}}
// ---------- tougher defending ----------
// how sharp a team is at these (difficulty only changes this, never ratings): Amateur .25, Professional .6, World class .85, Legendary 1
const DF=iq=>clamp((iq-.29)/.69,.25,1);
{const _ta=teamAI;teamAI=function(e,dt){if(!feat('def3')||e.pos=='GK'||G.phase!='live')return _ta(e,dt);const b=G.b,c=b.own,k=e.t;if(!c||c.t===k||c.pos=='GK')return _ta(e,dt);
  const s=G.dir[k],own=goalX(-s),iq=IQ(k),D=onT(k).filter(x=>x.pos!='GK'&&!x.off).sort((a,x)=>dist(a,c)-dist(x,c)),sp=Math.hypot(c.vx,c.vy);
  if(D[0]===e){// a carrier who has stopped: step in and take it
   if(sp<2.5&&(c.idle||0)>.35+(1-iq)*.5&&!((c.cd.beat||0)>0)){seek(e,c.x,c.y,1);if(dist(e,c)<1.5&&rnd()<dt*3.5*DF(iq))tackle(e,false);return}
   // a carrier sprinting with the ball out in front of him: get a foot in as he comes past
   if(c.spr&&!((c.cd.beat||0)>0)){const fx=Math.cos(c.fa),fy=Math.sin(c.fa),ahead=(e.x-c.x)*fx+(e.y-c.y)*fy,side=Math.abs((e.x-c.x)*-fy+(e.y-c.y)*fx);
    if(ahead>-.3&&ahead<3.2&&side<2.4){seek(e,c.x+fx*Math.min(ahead,1.4),c.y+fy*Math.min(ahead,1.4),1.2);if(dist(e,c)<2.1&&rnd()<dt*4.2*DF(iq))tackle(e,false);return}}
   if(c.spr){// he is sprinting: sprint after him instead of jogging
    const ux=own-c.x,uy=34-c.y,l=Math.hypot(ux,uy)||1;seek(e,c.x+c.vx*.3+ux/l*1.6,c.y+c.vy*.3+uy/l*1.6,1.2);if(dist(e,c)<1.9&&!((c.cd.beat||0)>0)&&rnd()<dt*2.2*DF(iq))tackle(e,false);return}
   return _ta(e,dt)}
  // the second man gets between a running carrier and the goal
  if(D[1]===e&&(c.x-own)*s<52&&sp>3.5){const gxv=own-c.x,gyv=34-c.y,l=Math.hypot(gxv,gyv)||1,gap=Math.min(l*.5,5+sp*.5);seek(e,c.x+gxv/l*gap,c.y+gyv/l*gap+(e.y<c.y?-1:1)*.8,c.spr?1.18:1);
   if(dist(e,c)<1.8&&!((c.cd.beat||0)>0)&&rnd()<dt*2*DF(iq))tackle(e,false);return}
  return _ta(e,dt)}}
// a clean standing tackle usually comes away with the ball instead of knocking it loose
{const _tk=tackle;tackle=function(d,slide){const h0=G.b.own;let add=0;if(feat('def3')&&h0&&h0.spr&&h0.t!==d.t&&d.pos!='GK'){const fx=Math.cos(h0.fa),fy=Math.sin(h0.fa),ah=(d.x-h0.x)*fx+(d.y-h0.y)*fy,sd=Math.abs((d.x-h0.x)*-fy+(d.y-h0.y)*fx);if(ah>0&&sd<1.3)add=Math.round(30*DF(IQ(d.t)))}
  d.p.sk.tkl+=add;let r;try{r=_tk(d,slide)}finally{d.p.sk.tkl-=add}try{const b=G.b;if(add&&r===false&&h0.cd.beat>.35)h0.cd.beat=.35;if(r===true&&feat('def3')&&!slide&&G.phase=='live'&&!b.own&&b.lt===d&&d.pos!='GK'&&rnd()<.6){b.x=d.x;b.y=d.y;give(d);d.cd.dec=.35}}catch(err){}return r}}
// the keeper goes down at the feet of anyone who tries to walk the ball past him
{const _ga=gkAI;gkAI=function(e,dt){try{if(feat('def3')&&G.phase=='live'&&!e.dive){const c=G.b.own,k=e.t,own=goalX(-G.dir[k]);
   if(c&&c.t!==k&&Math.abs(c.x-own)<16.5&&c.y>13.85&&c.y<54.15){const d=dist(c,e);
    if(d<3.4){seek(e,c.x+c.vx*.15,c.y+c.vy*.15,1.15);
     if(d<1.9&&!((e.cd.sm||0)>0)&&!((c.cd.beat||0)>0)){e.cd.sm=1.1;e.act={k:'dive',t:0};const p=clamp(.88+.06*DF(IQ(k))+((e.p.sk.han||60)-(c.p.sk.dri||60))/200+(c.spr?.08:0),.75,.97);
      if(rnd()<p){const b=G.b;bx(e,'sv');G.ev.push('save');say(`${e.p.ln} smothers it`,1.2);b.x=e.x;b.y=e.y;give(e);e.cd.dec=1.2;c.stun=.5}else{e.stun=.9;c.cd.beat=.8}}
     return}}}}catch(err){console.error(err)}return _ga(e,dt)}}
{const _st=hStep;hStep=function(dt){const r=_st(dt);try{const c=G&&G.b.own;if(c&&G.phase=='live')c.idle=Math.hypot(c.vx,c.vy)<2?(c.idle||0)+dt:0;if(G)G.ent.forEach(e=>{if(e!==c)e.idle=0})}catch(err){}return r}}
// ---------- the words on screen follow the shooting style ----------
const _HSH=HINTS.shoot,_TSH=(TUT.find(t=>t[0]=='Shoot')||[0,''])[1];
function fcWords(){const on=FCP();HINTS.shoot=on?'Hold Space: longer = harder (W/S aims · G finesse)':_HSH;const t=TUT.find(t=>t[0]=='Shoot');if(t)t[1]=on?'Get near the goal and hold Space: the longer you hold, the harder and higher the shot. Hold W or S to aim for a corner.':_TSH}
{const _kh=keysHTML;keysHTML=function(){let h=_kh();if(FCP())h=h.replace('Shoot (hold for power, let go in the green; hold W or S to pick a corner)','Shoot (hold longer for a harder, higher shot; W or S picks a corner)');
  if(feat('hud3'))h='<style>.mbox .cols{grid-template-columns:1fr 1fr;gap:22px}.mbox .t td{white-space:normal}.mbox .t td:last-child{white-space:nowrap;text-align:right}@media(max-width:760px){.mbox .cols{grid-template-columns:1fr}}</style>'+h;return h}}
// ---------- a cleaner match screen ----------
{const _dr=drawRadar;drawRadar=function(){if(!feat('hud3'))return _dr();if(!feat('radar'))return;const w=Math.min(170,VW*.17),h=w*PW/PL,x0=VW/2-w/2,y0=VH-h-10;CX.fillStyle='rgba(15,23,42,.6)';CX.fillRect(x0-3,y0-3,w+6,h+6);CX.strokeStyle='rgba(255,255,255,.3)';CX.lineWidth=1;CX.strokeRect(x0,y0,w,h);CX.beginPath();CX.moveTo(x0+w/2,y0);CX.lineTo(x0+w/2,y0+h);CX.stroke();
  G.ent.forEach(e=>{if(e.off)return;CX.fillStyle=e===G.ctl?'#fde047':e.t===0?'#38bdf8':'#f87171';CX.beginPath();CX.arc(x0+e.x/PL*w,y0+e.y/PW*h,e===G.ctl?3:2,0,7);CX.fill()});CX.fillStyle='#fff';CX.beginPath();CX.arc(x0+G.b.x/PL*w,y0+G.b.y/PW*h,1.8,0,7);CX.fill()}}
{const _dh=drawHUD;drawHUD=function(){fcWords();const on=feat('hud3');HIDEHELP=on;_dh();if(!on||!G||G.auto||G.paused||VW<=900)return;
  try{const att=G.b.own&&G.b.own.t===0,room=VW/2-Math.min(170,VW*.17)/2-26;CX.font='600 12px system-ui';CX.textBaseline='middle';
   const opts=att?['Space shoot · E pass · Q through ball · R cross · Shift sprint · P pause','Space shoot · E pass · Shift sprint · P pause','P pause · controls']:['E tackle · Space slide · Q switch · Z jockey · Shift sprint · P pause','E tackle · Q switch · Shift sprint · P pause','P pause · controls'];
   const t=opts.find(o=>CX.measureText(o).width<=room);if(!t)return;CX.fillStyle='rgba(226,232,240,.8)';CX.textAlign='right';CX.fillText(t,VW-12,VH-20)}catch(err){}}}
// ---------- formation designer ----------
const FD_DEF=[['GK',.03,.5],['FB',.2,.12],['CB',.18,.38],['CB',.18,.62],['FB',.2,.88],['WG',.47,.12],['CM',.42,.38],['CM',.42,.62],['WG',.47,.88],['ST',.66,.4],['ST',.66,.6]];
try{Object.defineProperty(FORMS,'Custom',{enumerable:true,configurable:true,get(){const c=typeof R!='undefined'&&R&&R.cform;return Array.isArray(c)&&c.length===11?c:FD_DEF}})}catch(err){}
// the role a spot on the board gets: full-backs and centre-backs at the back, wide and central midfielders, wingers and strikers up top
function fdRole(hx,hy){const w=Math.abs(hy-.5);if(hx<.29)return w>.24?'FB':'CB';if(hx<.56)return w>.29?(hx<.34?'FB':'WG'):'CM';return w>.26?'WG':'ST'}
let FD=null;
function fdUI(from){PAGE='squad';if(!FD||from)FD=(FORMS[from||(R.t[0].form||'4-4-2')]||FD_DEF).map(a=>a.slice());
 const W=560,H=360,X=hx=>20+hx/.8*(W-40),Y=hy=>12+hy*(H-24);
 shell(`<div class="head"><h1>Formation designer</h1><p>Drag your ten outfield players anywhere. Your goal is on the left; you attack to the right. Each spot gets a role from where it sits (FB, CB, CM, WG, ST), and the best player for that role is picked unless you swap them on the Squad page.</p>
 <div class="row"><label>Start from <select onchange="fdUI(this.value)">${Object.keys(FORMS).map(f=>`<option>${f}</option>`).join('')}</select></label>${B('fdSave()','Save and use it','big')}${B('FD=null;squadUI()','Cancel')}</div></div>
 <div class="card"><svg id="fdsvg" viewBox="0 0 ${W} ${H}" style="width:100%;max-width:760px;touch-action:none;user-select:none;background:#14532d;border-radius:10px;cursor:default">
 <rect x="20" y="12" width="${W-40}" height="${H-24}" fill="none" stroke="#ffffff66" stroke-width="2"/><line x1="${W/2+60}" y1="12" x2="${W/2+60}" y2="${H-12}" stroke="#ffffff33" stroke-dasharray="6 6"/>
 <rect x="20" y="${H/2-75}" width="70" height="150" fill="none" stroke="#ffffff66" stroke-width="2"/><rect x="${W-90}" y="${H/2-75}" width="70" height="150" fill="none" stroke="#ffffff33" stroke-width="2"/>
 <text x="${W-26}" y="${H-18}" fill="#ffffff88" font-size="12" text-anchor="end">attack &#8594;</text>
 ${FD.map((a,i)=>`<g id="fd${i}" data-i="${i}" transform="translate(${X(a[1])},${Y(a[2])})" style="cursor:${i?'grab':'default'}"><circle r="15" fill="${i?R.t[0].col[0]:'#a3e635'}" stroke="#fff" stroke-width="2"/><text y="4" text-anchor="middle" font-size="11" font-weight="800" fill="${i?R.t[0].col[1]:'#111'}" style="pointer-events:none">${a[0]}</text></g>`).join('')}</svg>
 <p><small>Tip: push the full-backs high for width, drop a midfielder in front of the back line to protect it, or pack the middle. The other team never uses your design.</small></p></div>`);
 const sv=$('fdsvg');let drag=-1;const pt=e=>{const r=sv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]};
 sv.addEventListener('pointerdown',e=>{const g=e.target.closest('g[data-i]');if(!g||!+g.dataset.i)return;drag=+g.dataset.i;try{sv.setPointerCapture(e.pointerId)}catch(err){}e.preventDefault()});
 sv.addEventListener('pointermove',e=>{if(drag<0)return;const [x,y]=pt(e),hx=clamp((x-20)/(W-40)*.8,.1,.76),hy=clamp((y-12)/(H-24),.04,.96),a=FD[drag];a[1]=+hx.toFixed(3);a[2]=+hy.toFixed(3);a[0]=fdRole(hx,hy);
  const g=$('fd'+drag);g.setAttribute('transform',`translate(${X(hx)},${Y(hy)})`);g.querySelector('text').textContent=a[0]});
 const up=()=>{drag=-1};sv.addEventListener('pointerup',up);sv.addEventListener('pointercancel',up)}
function fdSave(){if(!FD)return;R.cform=FD.map(a=>[a[0],a[1],a[2]]);R.t[0].form='Custom';if(R.xi)R.xi[0]=null;FD=null;hSave();toast('Formation saved. Your squad now lines up in it.');squadUI()}
{const _sq=squadUI;squadUI=function(){_sq();try{const sel=document.querySelector('#mainpg .head select');if(!feat('fdes')){if(sel&&R.t[0].form!='Custom')[...sel.options].forEach(o=>{if(o.value=='Custom')o.remove()});return}
  const row=document.querySelector('#mainpg .head .row');if(row)row.insertAdjacentHTML('beforeend',B('fdUI()','Design a formation'))}catch(err){}}}
