'use strict';
// Street basketball (2 on 2, half court, first to 7) and street soccer (3 on 3 in a cage, first to 3 goals or
// 3 minutes) as simple top-down mini games, played in the Neighborhood park. Your speed and skill come from your
// career ratings; the crews have their own skill, and the difficulty setting only changes how smart they play.
// Keys come through the Neighborhood map (hood.js). Load after street.js.
let SM=null;
const smD=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const smIQ=()=>typeof IQ=='function'?IQ():.6;
function smP(o){return Object.assign({x:0,y:0,vx:0,vy:0,f:0,stun:0,dash:0,dx:0,dy:0,jump:0,ghost:0,dt:0,tx:0,ty:0,rt:0},o)}
const smSpd=r=>130+r*1.35;
// ---------- the shared frame: overlay, loop, keys, end ----------
function smStart(s,c){if(!HD)return;HD.pan='mini';for(const k in HDK)HDK[k]=0;const el=document.createElement('div');el.id='smw';
 el.innerHTML='<canvas id="smc"></canvas><div id="smhud"></div><div id="smmsg"></div><div id="smkeys"></div>';$('hood').appendChild(el);
 const p=meRow(),sk=p.sk||{spd:60,str:60,awr:60,skl:60},tc=teamCol(0)||['#2563eb','#1e3a8a'];
 SM={s,c,on:1,cv:$('smc'),t:0,last:0,sc:[0,0],msgT:0,me0:{sp:sk.spd,r:Math.round((sk.awr+sk.skl)/2),col:tc[0],col2:tc[1]||'#fff'},st8:{}};
 smResize();(s=='hoops'?bkInit:scInit)();$('smkeys').textContent=SGKEYS[s];requestAnimationFrame(smFrame)}
function smResize(){if(!SM)return;const c=SM.cv,dpr=Math.min(2,globalThis.devicePixelRatio||1);c.width=Math.round(innerWidth*dpr);c.height=Math.round(innerHeight*dpr);c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';SM.dpr=dpr}
addEventListener('resize',()=>{try{smResize()}catch(e){}});
function smFrame(ts){if(!SM||!SM.on)return;const dt=SM.last?Math.min(.05,(ts-SM.last)/1000):0;SM.last=ts;try{if(!SM.over){SM.t+=dt;SM.step(dt)}if(SM&&SM.on){smView();SM.draw(SM.g);smHud()}}catch(e){console.error(e)}
 if(SM&&SM.msgT>0&&(SM.msgT-=dt)<=0){const m=$('smmsg');if(m)m.classList.remove('on')}if(SM&&SM.on)requestAnimationFrame(smFrame)}
function smView(){const c=SM.cv,g=c.getContext('2d');SM.g=g;const k=Math.min(c.width/(SM.W+60),(c.height-120*SM.dpr)/(SM.H+60));g.setTransform(1,0,0,1,0,0);g.fillStyle='#1f3d1b';g.fillRect(0,0,c.width,c.height);
 g.setTransform(k,0,0,k,(c.width-SM.W*k)/2,(c.height-SM.H*k)/2+20*SM.dpr)}
function smMsg(t){const m=$('smmsg');if(!m||!SM)return;m.textContent=t;m.classList.add('on');SM.msgT=2}
function smHud(){const el=$('smhud');if(!el)return;const s=`<b>You ${SM.sc[0]} – ${SM.sc[1]}</b> <span>${esc(SM.c.n)}</span><span class="small">${SM.hud||''}</span>`;if(el.innerHTML!==s)el.innerHTML=s}
function hdKeyHook(k,e){if(!SM||!SM.on)return false;if(k=='escape'){if(!e.repeat&&!SM.over&&confirm('Quit this pickup game? It counts as a loss.'))smEnd(1);return true}if(!e.repeat&&!SM.over)try{SM.key(k)}catch(x){console.error(x)}return true}
function smEnd(forfeit){if(!SM)return;const S=SM;S.on=0;SM=null;const el=$('smw');if(el)el.remove();for(const k in HDK)HDK[k]=0;if(HD)HD.pan=null;
 hdStreetDone(S.c,S.sc[0],S.sc[1],forfeit,S.lines?S.lines():[])}
// WASD input, movement, pushing, walls
function smInput(){const x=(HDK.d?1:0)-(HDK.a?1:0),y=(HDK.s?1:0)-(HDK.w?1:0),m=Math.hypot(x,y);return m?[x/m,y/m]:[0,0]}
function smGo(q,tx,ty,sp,dt){const dx=tx-q.x,dy=ty-q.y,m=Math.hypot(dx,dy);if(m<2){q.vx=q.vy=0;return}const v=Math.min(sp,m/dt);q.vx=dx/m*v;q.vy=dy/m*v;q.f=Math.atan2(dy,dx)}
function smMove(S,dt,R){S.pl.forEach(q=>{['stun','dash','jump','ghost'].forEach(k=>{if(q[k]>0)q[k]-=dt});let vx=q.vx,vy=q.vy;if(q.stun>0){vx*=.15;vy*=.15}if(q.dash>0){vx+=q.dx;vy+=q.dy}q.x+=vx*dt;q.y+=vy*dt;q.x=clamp(q.x,R,S.W-R);q.y=clamp(q.y,R,S.H-R)});
 for(let i=0;i<S.pl.length;i++)for(let j=i+1;j<S.pl.length;j++){const a=S.pl[i],b=S.pl[j];if(a.ghost>0||b.ghost>0)continue;const d=smD(a,b),m=R*2;if(d<m&&d>0){const o=(m-d)/2,ux=(a.x-b.x)/d,uy=(a.y-b.y)/d;a.x+=ux*o;a.y+=uy*o;b.x-=ux*o;b.y-=uy*o}}}
function smMan(g,q,R,me){g.fillStyle='#00000040';g.beginPath();g.ellipse(q.x+3,q.y+4,R,R*.8,0,0,7);g.fill();if(me){g.strokeStyle='#ffd84d';g.lineWidth=3;g.beginPath();g.arc(q.x,q.y,R+6,0,7);g.stroke()}
 g.fillStyle=q.col;g.strokeStyle=q.col2;g.lineWidth=3;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();g.stroke();g.fillStyle='#f2d0b1';g.beginPath();g.arc(q.x+Math.cos(q.f)*R*.45,q.y+Math.sin(q.f)*R*.45,R*.42,0,7);g.fill();
 if(q.stun>0){g.fillStyle='#fde047';g.font='bold 14px sans-serif';g.textAlign='center';g.fillText('✶',q.x,q.y-R-6)}}
function smMeter(g,q,v,R){g.fillStyle='#0009';g.fillRect(q.x-22,q.y-R-20,44,8);g.fillStyle=v>.85?'#4ade80':'#facc15';g.fillRect(q.x-21,q.y-R-19,42*Math.min(1,v),6)}
// =================== BASKETBALL ===================
const BK_ARC=237;
function bkInit(){const S=SM,c=S.c,m=S.me0,mk=(team,r,sp,me)=>smP({team,r,sp:smSpd(sp),me,col:team?'#9ca3af':m.col,col2:team?'#111827':m.col2});
 S.W=500;S.H=470;S.hoop={x:250,y:52};S.to=7;S.pl=[mk(0,m.r,m.sp,1),mk(0,c.r+(rnd()-.5)*6,c.r),mk(1,c.r+(rnd()-.5)*6,c.r),mk(1,c.r+(rnd()-.5)*6,c.r)];
 const P0=S.pl;S.me=P0[0];P0[0].guard=P0[2];P0[1].guard=P0[3];P0[2].guard=P0[0];P0[3].guard=P0[1];S.st8={pts:0,stl:0,blk:0};
 S.step=bkStep;S.draw=bkDraw;S.key=bkKey;S.lines=()=>[S.st8.pts?`You scored ${S.st8.pts}.`:'',S.st8.stl?`Steals: ${S.st8.stl}.`:'',S.st8.blk?`Blocks: ${S.st8.blk}.`:''].filter(Boolean);
 bkCheck(0);smMsg('Your ball. Hold Space to shoot, let go at the top. E passes.')}
function bkCheck(team,pause){const S=SM;S.off=team;S.ph='check';S.pt=pause||1.1;S.sclk=0;S.call=0;
 const o=S.pl.filter(q=>q.team==team),d=S.pl.filter(q=>q.team!=team),h=team==0?S.me:o[0],w=o.find(q=>q!==h);
 Object.assign(h,{x:250,y:430,vx:0,vy:0,f:-Math.PI/2});Object.assign(w,{x:rnd()<.5?80:420,y:300,vx:0,vy:0,f:-Math.PI/2});
 d.forEach(q=>{const g=q.guard;q.x=g.x+(S.hoop.x-g.x)*.12;q.y=g.y-34;q.vx=q.vy=0;q.f=Math.PI/2});S.ball={m:'hold',h,x:h.x,y:h.y,z:0};S.meter=0;S.held=0;S.pl.forEach(q=>{q.dt=.4+rnd()*.4})}
const bkPts=q=>(Math.hypot(q.x-250,q.y-52)>BK_ARC||q.x<30||q.x>470)?2:1;
function bkShoot(sh,qual){const S=SM,d=Math.hypot(sh.x-S.hoop.x,sh.y-S.hoop.y),pts=bkPts(sh),D=S.pl.filter(q=>q.team!=sh.team),nd=D.reduce((a,q)=>smD(q,sh)<smD(a,sh)?q:a),cd=smD(nd,sh);
 if(!nd.me&&nd.stun<=0&&cd<40&&rnd()<.55*smIQ())nd.jump=.35;
 if(nd.jump>0&&cd<40&&rnd()<clamp(.3+(nd.r-sh.r)/250,.12,.5)){if(nd.me)S.st8.blk++;smMsg(nd.team?'Blocked!':'You blocked it!');const a=rnd()*7;S.ball={m:'reb',sx:sh.x,sy:sh.y,tx:clamp(sh.x+Math.cos(a)*60,20,480),ty:clamp(sh.y+Math.sin(a)*60,20,450),t:0,T:.35,x:sh.x,y:sh.y,z:0};return}
 let p=d<70?.85:d<BK_ARC?.7-(d-70)/1200:.55-(d-BK_ARC)/600;p*=(.6+.4*qual)*(.85+(sh.r-60)/200);if(cd<24)p*=.6;else if(cd<40)p*=.82;
 S.ball={m:'shot',sh,sx:sh.x,sy:sh.y,t:0,T:.45+d/900,make:rnd()<clamp(p,.03,.95),pts,x:sh.x,y:sh.y,z:0};S.sclk=0}
function bkPass(fr,to){const S=SM,dd=smD(fr,to);let st=null;S.pl.filter(q=>q.team!=fr.team).forEach(q=>{const t=clamp(((q.x-fr.x)*(to.x-fr.x)+(q.y-fr.y)*(to.y-fr.y))/(dd*dd||1),0,1),px=fr.x+(to.x-fr.x)*t,py=fr.y+(to.y-fr.y)*t;
  if(!st&&Math.hypot(q.x-px,q.y-py)<16&&t>.15&&rnd()<clamp(.35+(q.r-fr.r)/200,.15,.6))st=q});
 S.ball={m:'pass',fr,to:st||to,st,sx:fr.x,sy:fr.y,t:0,T:Math.max(.15,dd/650),x:fr.x,y:fr.y,z:0}}
function bkGive(q){const S=SM;if(q.team!=S.off){if(q.me)S.st8.stl++;smMsg(q.team?'They take it.':'Your ball!');return bkCheck(q.team,.7)}S.ball={m:'hold',h:q,x:q.x,y:q.y,z:0};S.sclk=0;q.dt=.3}
function bkKey(k){const S=SM,me=S.me,b=S.ball;if(S.ph!='live')return;const hold=b.m=='hold'&&b.h===me,mate=S.pl[1];
 if(k=='e'){if(hold)return bkPass(me,mate);if(S.off==0&&b.m=='hold'&&b.h===mate){S.call=1;return}if(S.off==1&&b.m=='hold'&&smD(me,b.h)<32){if(rnd()<clamp(.16+(me.r-b.h.r)/200,.06,.35)){smMsg('Steal!');return bkGive(me)}me.stun=.35;smMsg('Reached in and missed.')}return}
 if(k==' '&&!hold&&S.off==1){me.jump=.4;return}
 if(hold&&k.startsWith('arrow')){const hx=S.hoop.x-me.x,hy=S.hoop.y-me.y,hm=Math.hypot(hx,hy)||1;let dx=0,dy=0,t=.18;
  if(k=='arrowleft'||k=='arrowright'){dx=(k=='arrowleft'?-1:1)*me.sp*1.5;const nd=S.pl.filter(q=>q.team==1).reduce((a,q)=>smD(q,me)<smD(a,me)?q:a);if(smD(nd,me)<48&&rnd()<clamp(.4+(me.r-nd.r)/150,.15,.7)){nd.stun=.55;smMsg('Crossover! Ankles!')}}
  else if(k=='arrowup'){dx=-hx/hm*me.sp*1.3;dy=-hy/hm*me.sp*1.3}else{dx=hx/hm*me.sp*1.2;dy=hy/hm*me.sp*1.2;t=.25;me.ghost=.25}
  me.dash=t;me.dx=dx;me.dy=dy}}
function bkAI(q,dt){const S=SM,b=S.ball,off=q.team==S.off,iq=smIQ(),H=S.hoop,mate=S.pl.find(x=>x.team==q.team&&x!==q);q.dt-=dt;
 if(b.m=='loose'||b.m=='reb'){const tx=b.m=='reb'?b.tx:b.x,ty=b.m=='reb'?b.ty:b.y;if(Math.hypot(q.x-tx,q.y-ty)<=Math.hypot(mate.x-tx,mate.y-ty)+20||q.team!=S.off)return smGo(q,tx,ty,q.sp,dt)}
 if(off){if(b.m=='hold'&&b.h===q){const d=Math.hypot(q.x-H.x,q.y-H.y),D=S.pl.filter(x=>x.team!=q.team),gap=Math.min(...D.map(x=>smD(x,q))),mg=Math.min(...D.map(x=>smD(x,mate)));
   if(q.dt<=0){q.dt=.25+rnd()*.35;
    if(S.sclk>7||(d<75&&gap>18)||(d<BK_ARC&&gap>52&&rnd()<.4)||(d>BK_ARC&&gap>66&&rnd()<.3))return bkShoot(q,clamp(.55+.4*rnd()*(.5+iq/2),0,1));
    if((mate.me&&S.call)||(mg>58&&rnd()<.3*(.5+iq))){S.call=0;return bkPass(q,mate)}
    const nd=D.reduce((a,x)=>smD(x,q)<smD(a,x)?x:a);q.tx=H.x+(q.x<nd.x?-1:1)*(60+rnd()*60);q.ty=H.y+40+rnd()*80}
   return smGo(q,q.tx||H.x,q.ty||H.y+60,q.sp*.85,dt)}
  if(q.dt<=0){q.dt=1.2+rnd();const g=S.pl.find(x=>x.guard===q),spots=[[60,110],[440,110],[50,330],[450,330],[250,330],[150,220],[350,220],[250,150]];
   let best=spots[0],bv=-1;spots.forEach(s=>{const v=Math.hypot(s[0]-(g?g.x:250),s[1]-(g?g.y:250))+rnd()*40-Math.hypot(s[0]-(b.h?b.h.x:250),s[1]-(b.h?b.h.y:250))*.2;if(v>bv){bv=v;best=s}});q.tx=best[0];q.ty=best[1]}
  return smGo(q,q.tx,q.ty,q.sp*.8,dt)}
 // defense: stay between your man and the hoop
 const m=q.guard,hb=b.m=='hold'&&b.h===m,k=hb?28:40,dx=H.x-m.x,dy=H.y-m.y,dm=Math.hypot(dx,dy)||1;smGo(q,m.x+dx/dm*k,m.y+dy/dm*k,q.sp*(q.team==1?.82+.15*iq:.9),dt);
 if(hb&&smD(q,m)<26&&q.stun<=0&&rnd()<dt*(q.team==1?.6*iq:.25)&&rnd()<clamp(.12+(q.r-m.r)/250,.04,.3)){smMsg(q.team?'Stolen!':'Your teammate steals it!');bkGive(q)}}
function bkStep(dt){const S=SM,me=S.me,b=S.ball;S.hud=`first to ${S.to} · ${S.off==0?'your ball':'their ball'}`;
 if(S.ph=='check'){S.pt-=dt;S.pl.forEach(q=>{q.vx=q.vy=0});if(S.pt<=0)S.ph='live';b.x=b.h.x;b.y=b.h.y;return}
 if(S.ph=='score'){S.pt-=dt;if(S.pt<=0){if(S.sc[0]>=S.to||S.sc[1]>=S.to){S.over=1;return setTimeout(()=>smEnd(0),50)}bkCheck(S.next)}return}
 S.sclk+=dt;const hold=b.m=='hold'&&b.h===me,[ix,iy]=smInput();let sp=me.sp*(hold?.92:1);
 if(hold){if(HDK[' ']){S.held=1;S.meter=Math.min(1.6,S.meter+dt/.8);sp*=.3}else if(S.held){S.held=0;const m=S.meter>1?2-S.meter:S.meter;S.meter=0;bkShoot(me,clamp(1-(1-m)*2.2,0,1));if(S.ball.m=='shot')smMsg(m>.9?'Perfect release!':m>.75?'Good release':'Off the mark...')}}else{S.held=0;S.meter=0}
 me.vx=ix*sp;me.vy=iy*sp;if(ix||iy)me.f=Math.atan2(iy,ix);if(S.off==0&&S.sclk>14&&b.m=='hold'&&b.h.team==0){smMsg('Shot clock! Their ball.');return bkCheck(1,.8)}
 S.pl.forEach(q=>{if(q!==me)bkAI(q,dt)});smMove(S,dt,13);
 if(b.m=='hold'){b.x=b.h.x+Math.cos(b.h.f)*10;b.y=b.h.y+Math.sin(b.h.f)*10;b.z=0}
 else if(b.m=='pass'){b.t+=dt;const k=Math.min(1,b.t/b.T),to=b.to;b.x=b.sx+(to.x-b.sx)*k;b.y=b.sy+(to.y-b.sy)*k;if(k>=1){if(b.st)smMsg(b.st.team?'Picked off!':'Picked off by your teammate!');bkGive(to)}}
 else if(b.m=='shot'){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(S.hoop.x-b.sx)*k;b.y=b.sy+(S.hoop.y-b.sy)*k;b.z=Math.sin(k*Math.PI)*(40+b.T*40);
  if(k>=1){if(b.make){S.sc[b.sh.team]+=b.pts;if(b.sh.me)S.st8.pts+=b.pts;smMsg(b.sh.team?`They score ${b.pts}.`:b.sh.me?`Bucket! +${b.pts}`:`Your teammate scores ${b.pts}.`);S.ph='score';S.pt=1.2;S.next=1-b.sh.team;S.ball={m:'hold',h:b.sh,x:S.hoop.x,y:S.hoop.y,z:0};return}
   const a=Math.PI*(.15+.7*rnd()),r=45+rnd()*85;S.ball={m:'reb',sx:S.hoop.x,sy:S.hoop.y,tx:clamp(S.hoop.x+Math.cos(a)*r,20,480),ty:clamp(S.hoop.y+Math.sin(a)*r,20,450),t:0,T:.45,x:S.hoop.x,y:S.hoop.y,z:0}}}
 else if(b.m=='reb'){b.t+=dt;const k=Math.min(1,b.t/b.T);b.x=b.sx+(b.tx-b.sx)*k;b.y=b.sy+(b.ty-b.sy)*k;b.z=Math.sin(k*Math.PI)*20;if(k>=1)S.ball={m:'loose',x:b.tx,y:b.ty,z:0}}
 if(S.ball.m=='loose'){const L=S.ball,g=S.pl.filter(q=>Math.hypot(q.x-L.x,q.y-L.y)<17&&q.stun<=0).sort((a,c)=>Math.hypot(a.x-L.x,a.y-L.y)-Math.hypot(c.x-L.x,c.y-L.y))[0];if(g)bkGive(g)}}
function bkDraw(g){const S=SM,W=S.W,H=S.H,hp=S.hoop;g.fillStyle='#2f5f86';g.fillRect(0,0,W,H);g.strokeStyle='#f8fafc';g.lineWidth=3;g.strokeRect(0,0,W,H);
 g.fillStyle='#c2410c';g.fillRect(190,0,120,190);g.strokeRect(190,0,120,190);g.beginPath();g.arc(250,190,60,0,Math.PI);g.stroke();
 g.beginPath();g.moveTo(30,0);g.lineTo(30,140);g.arc(hp.x,hp.y,BK_ARC,Math.PI-Math.acos(220/BK_ARC),Math.acos(220/BK_ARC),true);g.lineTo(470,0);g.stroke();
 g.fillStyle='#e5e7eb';g.fillRect(220,36,60,5);g.strokeStyle='#f97316';g.lineWidth=3;g.beginPath();g.arc(hp.x,hp.y,9,0,7);g.stroke();
 S.pl.slice().sort((a,b)=>a.y-b.y).forEach(q=>smMan(g,q,13,q.me));const b=S.ball;
 g.fillStyle='#00000055';g.beginPath();g.ellipse(b.x+2,b.y+3,6,4,0,0,7);g.fill();g.fillStyle='#ea580c';g.beginPath();g.arc(b.x,b.y-(b.z||0),6.5,0,7);g.fill();g.strokeStyle='#431407';g.lineWidth=1.2;g.stroke();
 if(S.held)smMeter(g,S.me,S.meter>1?2-S.meter:S.meter,13);
 if(S.ph=='check'){g.fillStyle='#ffffffcc';g.font='bold 22px "Trebuchet MS",sans-serif';g.textAlign='center';g.fillText(S.off==0?'YOUR BALL':'THEIR BALL',250,300)}}
// =================== SOCCER ===================
const SC_GT=160,SC_GB=260;                           // the goal mouths (top and bottom posts)
function scInit(){const S=SM,c=S.c,m=S.me0,mk=(team,r,sp,o)=>smP(Object.assign({team,r,sp:smSpd(sp)*.92,col:team?'#9ca3af':m.col,col2:team?'#111827':m.col2},o));
 S.W=700;S.H=420;S.clock=180;S.ot=0;S.to=3;S.meter=0;S.held=0;
 S.pl=[mk(0,m.r,m.sp,{me:1}),mk(0,c.r+(rnd()-.5)*6,c.r),mk(0,c.r,c.r,{gk:1,col:'#16a34a'}),mk(1,c.r+(rnd()-.5)*6,c.r),mk(1,c.r+(rnd()-.5)*6,c.r),mk(1,c.r,c.r,{gk:1,col:'#7c3aed'})];
 S.me=S.pl[0];S.st8={g:0,a:0,t:0};S.step=scStep;S.draw=scDraw;S.key=scKey;S.lines=()=>[S.st8.g?`Your goals: ${S.st8.g}.`:'',S.st8.t?`Tackles won: ${S.st8.t}.`:''].filter(Boolean);
 scKick(0);smMsg('Run into the ball to dribble. Hold Space to shoot, E to pass.')}
function scKick(team){const S=SM;S.ph='kick';S.pt=1.2;S.own=null;S.ball={x:350,y:210,vx:0,vy:0};const sp=[[290,210],[250,140],[30,210]],sp1=[[410,210],[450,280],[670,210]];
 S.pl.forEach(q=>{const i=S.pl.filter(x=>x.team==q.team).indexOf(q),s=(q.team?sp1:sp)[i];q.x=s[0];q.y=s[1];q.vx=q.vy=0;q.f=q.team?Math.PI:0});
 const k=S.pl.find(q=>q.team==team&&!q.gk&&(team==1||q.me));k.x=team?362:338;k.y=210;S.kt=team;S.pl.forEach(q=>q.dt=.3+rnd()*.4)}
const scGoalX=t=>t==0?700:0;
function scShoot(q,pw,aimY){const S=SM,gx=scGoalX(q.team),ty=aimY!=null?aimY:210+(rnd()-.5)*70,sp=300+pw*520,err=(14+(1-(q.r-40)/60)*30)*(0.6+pw*.8);
 const tx=gx,yy=ty+(rnd()-.5)*err,dx=tx-q.x,dy=yy-q.y,m=Math.hypot(dx,dy)||1;S.ball.vx=dx/m*sp;S.ball.vy=dy/m*sp;S.own=null;S.lastT=q.team;S.lastK=q;q.nk=.3;S.shot=1}
function scPass(q,to){const S=SM,lead=.3,tx=to.x+to.vx*lead,ty=to.y+to.vy*lead,dx=tx-q.x,dy=ty-q.y,m=Math.hypot(dx,dy)||1,sp=Math.min(560,220+m*1.4);
 S.ball.vx=dx/m*sp+(rnd()-.5)*30;S.ball.vy=dy/m*sp+(rnd()-.5)*30;S.own=null;S.lastT=q.team;S.lastK=q;q.nk=.25;S.shot=0}
function scKey(k){const S=SM,me=S.me,mate=S.pl[1];if(S.ph!='live')return;const has=S.own===me;
 if(k=='e'){if(has)return scPass(me,mate);if(S.own===mate){S.call=1;return}const o=S.own;if(o&&o.team==1&&smD(o,me)<24){if(rnd()<clamp(.42+(me.r-o.r)/150,.2,.72)){S.own=me;S.st8.t++;smMsg('Tackle won!')}else{me.stun=.4;smMsg('Missed the tackle.')}}return}
 if(has&&k.startsWith('arrow')){if(k=='arrowup'){S.ball.vx=Math.cos(me.f)*330;S.ball.vy=Math.sin(me.f)*330;S.own=null;me.nk=.15;me.dash=.35;me.dx=Math.cos(me.f)*me.sp*.6;me.dy=Math.sin(me.f)*me.sp*.6;return}
  if(k=='arrowdown'){me.f+=Math.PI;me.dash=.15;me.dx=Math.cos(me.f)*me.sp;me.dy=Math.sin(me.f)*me.sp;return}
  const s=k=='arrowleft'?-1:1,a=me.f+s*Math.PI/2;me.dash=.18;me.dx=Math.cos(a)*me.sp*1.4;me.dy=Math.sin(a)*me.sp*1.4;const nd=S.pl.filter(q=>q.team==1&&!q.gk).reduce((a,q)=>smD(q,me)<smD(a,me)?q:a);if(smD(nd,me)<40&&rnd()<clamp(.4+(me.r-nd.r)/150,.15,.7)){nd.stun=.5;smMsg('Skinned him!')}}}
function scAI(q,dt){const S=SM,B=S.ball,iq=smIQ(),gx=scGoalX(q.team),own=S.own,mates=S.pl.filter(x=>x.team==q.team&&x!==q&&!x.gk),mate=mates[0];q.dt-=dt;
 if(q.gk){const hx=q.team?676:24,ty=clamp(B.y+(B.vx&&Math.sign(hx-B.x)==Math.sign(B.vx)?B.vy*Math.abs((hx-B.x)/B.vx)*.5:0),SC_GT+4,SC_GB-4);if(own===q){q.hold=(q.hold||0)+dt;smGo(q,hx,210,q.sp*.5,dt);if(q.hold>.9){q.hold=0;const t=mates.length?mates[rnd()*mates.length|0]:null;if(t)scPass(q,t)}return}return smGo(q,hx,ty,q.sp*.9,dt)}
 if(own===q){const D=S.pl.filter(x=>x.team!=q.team&&!x.gk),nd=D.reduce((a,x)=>smD(x,q)<smD(a,q)?x:a),gd=Math.abs(gx-q.x);
  if(q.dt<=0){q.dt=.25+rnd()*.3;
   if(gd<230&&(rnd()<.35+.3*iq||gd<130)){const gk=S.pl.find(x=>x.team!=q.team&&x.gk),ay=gk&&gk.y<210?SC_GB-14:SC_GT+14;return scShoot(q,.55+rnd()*.4,rnd()<.4+.5*iq?ay:null)}
   if(mate&&smD(nd,q)<40&&Math.min(...D.map(x=>smD(x,mate)))>60&&rnd()<.5*(.5+iq))return scPass(q,mate);
   if(S.call&&mate&&mate.me){S.call=0;return scPass(q,mate)}
   q.tx=gx+(q.team?60:-60);q.ty=clamp(210+(q.y<nd.y?-1:1)*(70+rnd()*60),40,380)}
  return smGo(q,q.tx,q.ty,q.sp*.82,dt)}
 // without the ball: the closer one chases it, the other helps
 const near=[q,...mates].reduce((a,x)=>smD(x,B)<smD(a,B)?x:a);
 if(near===q){if(own&&own.team!=q.team&&smD(q,own)<24&&q.stun<=0&&rnd()<dt*(q.team?1.1*iq:.7)){if(rnd()<clamp(.32+(q.r-own.r)/150,.1,.6)){S.own=q;smMsg(q.team?'They win it back.':'Your teammate wins it!')}else q.stun=.3}
  return smGo(q,B.x+B.vx*.15,B.y+B.vy*.15,q.sp*(q.team?.82+.15*iq:.9),dt)}
 const att=own&&own.team==q.team;if(q.dt<=0){q.dt=.9+rnd();q.tx=att?clamp(gx+(q.team?150:-150)+(rnd()-.5)*80,60,640):clamp(scGoalX(1-q.team)+(q.team?-140:140),60,640);q.ty=clamp(att?(B.y<210?300:120):B.y+(rnd()-.5)*80,40,380)}
 smGo(q,q.tx,q.ty,q.sp*.75,dt)}
function scStep(dt){const S=SM,me=S.me,B=S.ball;S.hud=`${Math.floor(S.clock/60)}:${String(Math.floor(S.clock%60)).padStart(2,'0')}${S.ot?' golden goal':''} · first to ${S.to}`;
 if(S.ph=='kick'){S.pt-=dt;if(S.pt<=0){S.ph='live';const k=S.pl.find(q=>q.team==S.kt&&!q.gk&&(S.kt==1||q.me));S.own=k}return}
 if(S.ph=='goal'){S.pt-=dt;if(S.pt<=0){if(S.sc[0]>=S.to||S.sc[1]>=S.to||(S.ot&&S.sc[0]!=S.sc[1])){S.over=1;return setTimeout(()=>smEnd(0),50)}scKick(S.next)}return}
 S.clock-=dt;if(S.clock<=0){if(S.sc[0]!=S.sc[1]||S.ot){S.over=1;return setTimeout(()=>smEnd(0),50)}S.ot=1;S.clock=60;smMsg('Tied! One more minute: next goal wins.')}
 const has=S.own===me,[ix,iy]=smInput();let sp=me.sp*(has?.9:1);
 if(has){if(HDK[' ']){S.held=1;S.meter=Math.min(1,S.meter+dt);sp*=.45}else if(S.held){S.held=0;const ay=HDK.w?SC_GT+12:HDK.s?SC_GB-12:null;scShoot(me,S.meter,ay);S.meter=0;smMsg('Shot!')}}else{if(!HDK[' ']){S.held=0;S.meter=0}}
 me.vx=ix*sp;me.vy=iy*sp;if(ix||iy)me.f=Math.atan2(iy,ix);S.pl.forEach(q=>{if(q.nk>0)q.nk-=dt;if(q!==me)scAI(q,dt)});smMove(S,dt,11);
 // the ball: stuck to whoever has it, or rolling and bouncing off the cage
 if(S.own){const o=S.own;B.x=o.x+Math.cos(o.f)*14;B.y=o.y+Math.sin(o.f)*14;B.vx=o.vx;B.vy=o.vy;if(o.gk){B.x=o.x;B.y=o.y}}
 else{B.x+=B.vx*dt;B.y+=B.vy*dt;const f=Math.exp(-1.05*dt);B.vx*=f;B.vy*=f;
  if(B.y<6){B.y=6;B.vy=Math.abs(B.vy)*.7}if(B.y>S.H-6){B.y=S.H-6;B.vy=-Math.abs(B.vy)*.7}
  const inM=B.y>SC_GT&&B.y<SC_GB;if(B.x<6&&!inM){B.x=6;B.vx=Math.abs(B.vx)*.7}if(B.x>S.W-6&&!inM){B.x=S.W-6;B.vx=-Math.abs(B.vx)*.7}
  if(inM&&(B.x<-4||B.x>S.W+4)){const t=B.x>0?0:1;S.sc[t]++;if(t==0&&S.lastK===me)S.st8.g++;smMsg(t==0?(S.lastK===me?'GOAL! What a strike!':'GOAL! Your team scores.'):'They scored.');S.ph='goal';S.pt=1.6;S.next=1-t;S.own=null;B.vx=B.vy=0;return}
  // keepers save, everyone else traps a slow enough ball
  const sp2=Math.hypot(B.vx,B.vy);for(const q of S.pl){if(q.nk>0||q.stun>0)continue;const d=Math.hypot(q.x-B.x,q.y-B.y);
   if(q.gk&&S.shot&&d<20+(q.r-50)/4&&S.lastT!=q.team){if(rnd()<clamp(.78-(sp2-420)/1100+(q.r-60)/200,.2,.92)){if(sp2<520){S.own=q;q.hold=0;smMsg(q.team?'Saved and held.':'Your keeper holds it.')}else{B.vx=-B.vx*.35;B.vy=(rnd()-.5)*300;smMsg('Great save!')}S.shot=0;q.nk=.3;break}else{q.nk=.6;continue}}
   if(d<15&&(sp2<330||(sp2<560&&rnd()<.35))){S.own=q;S.shot=0;break}}}}
function scDraw(g){const S=SM,W=S.W,H=S.H;for(let i=0;i<10;i++){g.fillStyle=i%2?'#3f9a45':'#48a84e';g.fillRect(i*W/10,0,W/10+1,H)}
 g.strokeStyle='#f8fafc';g.lineWidth=3;g.strokeRect(0,0,W,H);g.beginPath();g.moveTo(W/2,0);g.lineTo(W/2,H);g.stroke();g.beginPath();g.arc(W/2,H/2,50,0,7);g.stroke();g.strokeRect(0,120,70,180);g.strokeRect(W-70,120,70,180);
 g.fillStyle='#e5e7eb';[[-14,SC_GT],[W,SC_GT]].forEach(([x,y])=>{g.fillStyle='#ffffff33';g.fillRect(x,y,14,SC_GB-SC_GT);g.strokeStyle='#f8fafc';g.strokeRect(x,y,14,SC_GB-SC_GT)});
 g.strokeStyle='#94a3b8';g.lineWidth=6;g.beginPath();g.moveTo(0,SC_GT);g.lineTo(0,0);g.lineTo(W,0);g.lineTo(W,SC_GT);g.moveTo(W,SC_GB);g.lineTo(W,H);g.lineTo(0,H);g.lineTo(0,SC_GB);g.stroke();
 S.pl.slice().sort((a,b)=>a.y-b.y).forEach(q=>smMan(g,q,11,q.me));const B=S.ball;g.fillStyle='#00000055';g.beginPath();g.ellipse(B.x+2,B.y+3,6,4,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(B.x,B.y,6,0,7);g.fill();g.strokeStyle='#111827';g.lineWidth=1.5;g.stroke();
 if(S.held)smMeter(g,S.me,S.meter,11);if(S.ph=='kick'){g.fillStyle='#ffffffcc';g.font='bold 22px "Trebuchet MS",sans-serif';g.textAlign='center';g.fillText(S.kt==0?'YOUR KICKOFF':'THEIR KICKOFF',W/2,60)}}
