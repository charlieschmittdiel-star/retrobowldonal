'use strict';
// A deeper, quicker QB drop-back, and kickoffs that are always returned: the returner fields the kick, and if he's in the
// end zone he can take a knee (back up / move toward the back of the end zone) for a touchback.
{const add=[['On the field','drop2','Deeper drop-back','The quarterback drops back farther and faster after the snap.'],
 ['On the field','ko2','Kick returns, no touchback menu','Kickoffs are always fielded and returned. Catch it in the end zone and back up to take a knee for a touchback.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- drop-back ----------
{const _st=step;step=function(dt){const q=P&&P.off&&P.off[0],on=feat('drop2')&&q&&G.phase=='play'&&!P.run&&!P.kr&&P.b&&P.b.st=='qb'&&P.t<1.05;const x0=q?q.x:0;
 if(P)P.dropping=!!on;_st(dt);try{if(!on||P.run||P.b.st!='qb'||P.off[0]!==q){if(P)P.dropping=false;return}const d=G.dir,tgt=P.L-d*7.5,dep=(q.x-tgt)*d;if(dep<=0){P.dropping=false;return}q.x=x0-d*Math.min((x0-tgt)*d,6.5*dt);
 // he can look where you're aiming while he drops, and a throw off the drop isn't a throw on the run
 if(P.aim&&G.poss=='U'&&qbIsMe()){const t=aimT();let df=Math.atan2(t[1]-q.y,t[0]-q.x)-(d>0?0:Math.PI);df=Math.atan2(Math.sin(df),Math.cos(df));q.fa=(d>0?0:Math.PI)+clamp(df,-1.3,1.3)}else q.fa=d>0?0:Math.PI}catch(e){}}}
// ---------- kick returns ----------
{const _st=step;step=function(dt){_st(dt);try{if(!feat('ko2')||!P||!P.kr||!P.koEZ||G.phase!='play'||P.over)return;const b=P.b,c=b.st=='carry'?b.c:null;if(!c)return;const d=G.dir,own=d>0?10:110,inEZ=(c.x-own)*d<0;
 if(!inEZ){P.koEZ=0;return}const user=G.poss=='U'&&!(typeof autoMode=='function'&&autoMode())&&(!CAR()||c.pid===R.me);
 if(user){const v=inp();if(P.t>.15&&v[2]&&v[0]*d<-.5)return koKneel(c)}
 else if(!P.koDec&&P.t>.3){P.koDec=1;if((c.x-own)*d<=-3&&rnd()<.85)return koKneel(c)}}catch(e){console.error(e)}}}
function koKneel(c){P.knl=1;endPlay('tackle',c.x);G.msg='Kneel in the end zone: touchback, ball at the 25.';if(typeof xLog=='function'&&feat('pbp'))xLog('Kneel in the end zone for a touchback.')}
{const _kr=krSetup;krSetup=function(lx,d,kind,...a){const r=_kr.call(this,lx,d,kind,...a);try{if(P){P.koDec=0;if(kind=='ko'&&feat('ko2')&&(lx-(d>0?10:110))*d<0){P.koEZ=1;if(G.poss=='U')G.msg='Kickoff fielded in the end zone. Run it out, or back up to take a knee for a touchback.'}}}catch(e){}return r}}
// with the deeper drop, a rusher who has beaten his man closes on the quarterback a little faster (keeps sack rates real)
{const _st=step;step=function(dt){_st(dt);try{if(!feat('drop2')||!P||G.phase!='play'||P.run||P.kr||P.b.st!='qb')return;const q=P.off[0];P.def.forEach(p=>{if(!p.rush||p.eng||p.fall||p.bite>0||p.stun>0||(p.cool||0)>0)return;const dd=dist(p,q);if(dd<1||dd>12)return;const k=Math.min(dd-.9,p.spd*.35*dt);p.x+=(q.x-p.x)/dd*k;p.y+=(q.y-p.y)/dd*k})}catch(e){}}}
// ---------- your defense's assignments drawn on the field before the snap ----------
{const add=[['On the field','dshow','Show defensive assignments','Before the snap on defense, each defender\'s job is drawn on the field: zones, man coverage lines, rush and spy arrows. Choose all defenders or only yours.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
function daOn(){if(!feat('dshow')||!G||!P||!P.dp||G.poss=='U'||P.kr||P.kk)return false;if(!(G.phase=='pre'||G.phase=='motion'))return false;if(CAR()&&!(typeof myUnitOn=='function'&&myUnitOn()))return false;return true}
function daMine(){if(CAR()){const me=typeof careerMe=='function'?careerMe():null;return me&&P.def.includes(me)?me:null}return cd}
{const _df=drawField;drawField=function(...a){const r=_df.apply(this,a);try{if(daOn())daDraw()}catch(e){}return r}}
function daDraw(){const d=G.dir,L=P.L,D=P.def,O=P.off,mine=daMine(),only=OPT.dassign=='mine',t=performance.now()/1000;X.save();X.lineCap='round';X.lineJoin='round';
 D.forEach((p,i)=>{if(only&&p!==mine)return;const e=P.dp.p[i];if(!e)return;const me=p===mine,a=me?1:.55,s=P2(p.x,p.y);
  if(e[2]=='z'&&e[3]){const zx=L+d*e[3][0],zy=e[3][1],zr=e[4]||(Math.abs(e[3][0])>=12?10:6.5),c=P2(zx,zy),rx=zr*S*scY(zy),ry=zr*KY,deep=Math.abs(e[3][0])>=12;
   X.globalAlpha=a;X.fillStyle=deep?'rgba(96,165,250,.16)':'rgba(250,204,21,.14)';X.strokeStyle=deep?'#93c5fd':'#fde047';X.lineWidth=me?2.4:1.4;X.setLineDash(me?[]:[6,5]);
   X.beginPath();X.ellipse(c[0],c[1],rx,ry,0,0,7);X.fill();X.stroke();X.setLineDash([]);X.beginPath();X.moveTo(s[0],s[1]);X.lineTo(c[0],c[1]);X.stroke()}
  else if(e[2]=='m'&&O[e[3]]){const q=O[e[3]],c=P2(q.x,q.y);X.globalAlpha=a;X.strokeStyle='#facc15';X.lineWidth=me?2.6:1.6;X.setLineDash([3,5]);X.lineDashOffset=-t*20;X.beginPath();X.moveTo(s[0],s[1]);X.lineTo(c[0],c[1]);X.stroke();X.setLineDash([]);
   X.beginPath();X.arc(c[0],c[1],9,0,7);X.stroke()}
  else if(e[2]=='r'||e[2]=='s'){const q=O[0],spy=e[2]=='s',tx=spy?L+d*5:q.x,ty=q.y,c=P2(tx,ty),st=e[3]=='st',mx=st?P2(p.x-d*1.2,p.y+(p.y<26.5?2.5:-2.5)):[(s[0]+c[0])/2,(s[1]+c[1])/2],ex=s[0]+(c[0]-s[0])*.7,ey=s[1]+(c[1]-s[1])*.7;
   X.globalAlpha=a;X.strokeStyle=spy?'#c084fc':'#f87171';X.fillStyle=X.strokeStyle;X.lineWidth=me?3:1.8;if(spy)X.setLineDash([4,4]);X.beginPath();X.moveTo(s[0],s[1]);X.quadraticCurveTo(mx[0],mx[1],ex,ey);X.stroke();X.setLineDash([]);
   const an=Math.atan2(ey-mx[1],ex-mx[0]);X.beginPath();X.moveTo(ex,ey);X.lineTo(ex-Math.cos(an-.5)*9,ey-Math.sin(an-.5)*9);X.lineTo(ex-Math.cos(an+.5)*9,ey-Math.sin(an+.5)*9);X.closePath();X.fill()}});
 // a label under your player saying his job
 if(mine){const i=D.indexOf(mine),e=P.dp.p[i];if(e){const s=P2(mine.x,mine.y),job=e[2]=='z'?(Math.abs(e[3][0])>=12?'Deep zone':'Zone'):e[2]=='m'?`Man on ${PO[e[3]]} ${e[3]}`:e[2]=='s'?'QB spy':e[3]=='st'?'Rush (stunt)':'Rush the QB';
  X.globalAlpha=1;X.font='bold 11px sans-serif';const w=X.measureText(job).width+12;X.fillStyle='#0b1410dd';X.fillRect(s[0]-w/2,s[1]+10,w,16);X.fillStyle='#ffd84d';X.textAlign='center';X.fillText(job,s[0],s[1]+22)}}
 X.restore()}
// a small toggle on the defensive pre-snap bar: all assignments or just yours
{const _ui=ui;ui=function(){_ui();try{if(daOn()&&!(CAR()))$('plays').insertAdjacentHTML('beforeend',`<button data-a="dassign">Show: ${OPT.dassign=='mine'?'my player':'all defenders'}</button>`)}catch(e){}}}
$('plays').addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-a="dassign"]');if(el){OPT.dassign=OPT.dassign=='mine'?'all':'mine';optSave();ui()}});

// ---------- the kick in the air before a return ----------
// Kickoffs: the ball flies from the kicking team's 35 while the coverage team runs down and the return team sets up;
// the returner fields it and the return starts. Punts: the coverage releases and the return team sets up while the punt
// is in the air, and everyone keeps their spot when the returner catches it (no jump to new positions).
{const add=[['On the field','kfly','Kicks fly before returns','Kickoffs and punts are played out: the ball flies, the coverage runs down and the returner catches it before the return starts.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
{const _kr=krSetup;krSetup=function(lx,d,kind,...a){const r=_kr.call(this,lx,d,kind,...a);try{if(kind=='ko'&&feat('kfly')&&!P.puntMap)kfKick(lx,d)}catch(e){console.error(e)}return r}}
function kfKick(lx,d){const O=P.off,D=P.def,ret=O[5],K=(d>0?110:10)-d*35,ly=ret.y,spots=O.map(p=>[p.x,p.y]);
 D.forEach((p,i)=>{p.x=p.sx=K+d*1;p.y=p.sy=4+i*4.5;p.vx=p.vy=0});const k=D[5];k.x=k.sx=K+d*6;k.y=k.sy=26.5;
 [6,7,8,9,10,1,2,3,4].forEach((i,j)=>{const p=O[i];p.x=p.sx=K-d*(j<5?11:24);p.y=p.sy=j<5?16+j*5.2:8+(j-5)*12.5});O[0].x=O[0].sx=lx+d*6;O[0].y=26.5+(ly>26.5?-8:8);ret.x=ret.sx=lx+d*4;ret.y=ret.sy=ly;
 const T=clamp(Math.abs(K-lx)/17,2.9,4.3);P.kf={t:0,T,sx:K,sy:26.5,tx:lx,ty:ly,peak:7,spots,ret,lane:D.map(p=>p.y)};P.b={st:'kick',x:K,y:26.5,z:.2};P.t=0;
 G.msg=G.poss=='U'?'Kickoff! Get under it...':'Kickoff! Cover it - get down the field.';ui()}
{const _st=step;step=function(dt){if(!(P&&P.kf&&G.phase=='play'))return _st(dt);try{const f=P.kf,d=G.dir,O=P.off,D=P.def;f.t+=dt;const k=Math.min(1,f.t/f.T),b=P.b;
 b.x=f.sx+(f.tx-f.sx)*k;b.y=f.sy+(f.ty-f.sy)*k;b.z=4*f.peak*k*(1-k)+.2*(1-k);
 mv(f.ret,f.tx,f.ty,f.ret.spd*.9,dt);O.forEach((p,i)=>{if(p===f.ret)return;const s=f.spots[i];mv(p,s[0],s[1],p.spd*.8,dt)});
 D.forEach((p,i)=>{if(p.ksafe){mv(p,f.tx+d*30,26.5,p.spd*.6,dt);return}const ly=f.ty+(f.lane[i]-26.5)*.55;mv(p,f.tx+d*(8+Math.abs(f.lane[i]-26.5)*.15),ly,p.spd*.88,dt)});
 if(k>=1){const r=f.ret;r.x=f.tx;r.y=f.ty;P.kf=null;P.b={st:'carry',c:r,x:r.x,y:r.y};P.t=0;G.msg=G.poss=='U'?'Caught it! Run it back'+(P.koEZ?' - or back up in the end zone to take a knee.':'.'):'They have it. Chase him down!';ui()}}catch(e){console.error(e);P.kf=null}}}
// punts: the whole coverage releases while the ball is up, and positions carry over into the return
{const _kt=kickTick;kickTick=function(dt){_kt(dt);try{const kk=P&&P.kk;if(!feat('kfly')||!kk||kk.kind!='punt'||!['snap','plant','fly'].includes(kk.st)||G.phase!='kick')return;if(kk.st=='fly'&&!kk.kfT){kk.kfT=1;kk.T*=1.5}const d=G.dir,O=P.off,D=P.def,fl=kk.st=='fly',lx=fl?kk.lx:P.L+d*40,ly=fl?kk.ly:26.5;
 if(!fl){[1,3].forEach(i=>{const p=O[i];if(p)kfMv(p,lx,p.y,p.spd*.95,dt)})}
 [2,4,5,6,7,8,9,10].forEach((i,j)=>{const p=O[i];if(!p)return;if(!fl&&kk.st=='snap')return;kfMv(p,lx-d*1,ly+(j-3.5)*3.2,p.spd*1.02,dt)});
 D.forEach((p,i)=>{if(i==9||i==7||i==8)return;mv(p,lx-d*(i==10?6:12),i==10?ly:clamp(ly+(i-3)*4.5,3,50),p.spd*.55,dt)})}catch(e){}}}
{const _krt=kReturn;kReturn=function(lx,ly,hang){const old=P,oO=old.off.map(p=>[p.x,p.y]),oD=old.def.map(p=>[p.x,p.y]);P&&(P.puntMap=1);const r=_krt(lx,ly,hang);try{if(!feat('kfly'))return r;const O=P.off,D=P.def,put=(p,s)=>{p.x=p.sx=s[0];p.y=p.sy=s[1];p.vx=p.vy=0};
 const recv=[10,7,8,0,1,2,3,4,5,6];[0,1,2,3,4,6,7,8,9,10].forEach((i,k)=>put(O[i],oD[recv[k]]));put(O[5],[lx,ly]);
 D.forEach((p,i)=>put(p,oO[i==5?0:i==0?5:i]));P.b.x=lx;P.b.y=ly;G.msg=G.poss=='U'?'Fielded! Run it back.':'He fields it. Chase him down!';ui()}catch(e){console.error(e)}return r}}

function kfMv(p,tx,ty,sp,dt){const dx=tx-p.x,dy=ty-p.y,m=Math.hypot(dx,dy);if(m<.05)return;const k=Math.min(m,sp*dt)/m;p.x+=dx*k;p.y+=dy*k;p.vx=dx/m*sp;p.vy=dy/m*sp;p.fa=Math.atan2(dy,dx)}
