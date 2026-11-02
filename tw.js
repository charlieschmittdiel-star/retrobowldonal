'use strict';
// A deeper, quicker QB drop-back, and kickoffs that are always returned: the returner fields the kick, and if he's in the
// end zone he can take a knee (back up / move toward the back of the end zone) for a touchback.
{const add=[['On the field','drop2','Deeper drop-back','The quarterback drops back farther and faster after the snap.'],
 ['On the field','ko2','Kick returns, no touchback menu','Kickoffs are always fielded and returned. Catch it in the end zone and back up to take a knee for a touchback.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- drop-back ----------
{const _st=step;step=function(dt){const q=P&&P.off&&P.off[0],on=feat('drop2')&&q&&G.phase=='play'&&!P.run&&!P.kr&&P.b&&P.b.st=='qb'&&P.t<1.05;const x0=q?q.x:0;
 _st(dt);try{if(!on||P.run||P.b.st!='qb'||P.off[0]!==q)return;const d=G.dir,tgt=P.L-d*7.5,dep=(q.x-tgt)*d;if(dep<=0)return;q.x=x0-d*Math.min((x0-tgt)*d,6.5*dt);q.fa=d>0?0:Math.PI}catch(e){}}}
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
