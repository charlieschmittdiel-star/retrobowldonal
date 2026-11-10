'use strict';
// Smarter AI (both teams; the other team's difficulty still sets how sharp it is): defenders read and cut out passes,
// the back line moves as one and the lines stay compact, a second man covers the one who presses, defenders stay on
// their feet and pick their moment to tackle, attackers make runs into the box for crosses and play cut-backs,
// one-twos and switches of play, and keepers set their angle and sweep up balls played in behind.
{const add=[['FC-style play','ai2','Smarter AI','Interceptions, a back line that moves together, cover defending, patient tackling, runs into the box, cut-backs, one-twos, switches of play and a sweeper keeper.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const AI2=()=>feat('ai2');
const BACK=e=>e.pos=='CB'||e.pos=='FB',MID=e=>e.pos=='CM'||e.pos=='DM'||e.pos=='AM',FWD=e=>e.pos=='ST'||e.pos=='WG';
// ---------- interceptions: once per pass, each team picks its best man to cut it out ----------
function icPlan(k){const b=G.b;if(!b.from||b.from.t===k||b.own||!(b.kind=='pass'||b.kind=='through'||b.kind=='long')||b.z>1.6)return null;
 if(!b.ic)b.ic={};if(b.ic[k]!==undefined)return b.ic[k];let best=null;const sp=Math.hypot(b.vx,b.vy);if(sp<2){b.ic[k]=null;return null}
 const lofted=b.vz>0||b.z>.5;onT(k).forEach(e=>{if(e.off||e.pos=='GK'||e.stun>0)return;const v=topSpd(e)*1.05;
  for(let t=.15;t<=1.6;t+=.05){const ns=Math.max(0,sp-DEC*4*t),dd=(sp+ns)/2*t,x=b.x+b.vx/sp*dd,y=b.y+b.vy/sp*dd;if(lofted)break;const m=t-(Math.hypot(x-e.x,y-e.y)-.7)/v;
   if(m>.08&&t>=.25){const pr=(e.p.sk.int||60)/100*IQ(k);if(!best||t<best.t)best={e,x,y,t,ok:rnd()<.1+pr*.4};break}}});
 b.ic[k]=best&&best.ok?best:null;return b.ic[k]}
// ---------- per frame: where each team's lines sit ----------
function lines(k){const b=G.b,s=G.dir[k],own=goalX(-s),bx0=(b.x-own)*s,TMk=tacMod(k);
 const back=clamp(Math.min(bx0-14,42)+TMk.line*.6,6,48);return{back,mid:back+9,fwd:back+22,own,s}}
// ---------- off the ball ----------
{const _ta=teamAI;teamAI=function(e,dt){if(!AI2()||e.pos=='GK'||G.phase!='live')return _ta(e,dt);const b=G.b,k=e.t,s=G.dir[k],iq=IQ(k),c=b.own;
  // cut out a pass
  const ic=!c&&b.to!==e?icPlan(k):null;if(ic&&ic.e===e){seek(e,ic.x,ic.y,1.05);return}
  if(b.own===e||(!c&&b.to===e))return _ta(e,dt);
  if(c&&c.t===k){// attacking runs into the box when the ball is wide in the final third
   const gx=goalX(s),cf=(c.x-goalX(-s))*s,wide=Math.abs(c.y-34)>13;
   if(cf>66&&wide&&(FWD(e)||MID(e))&&e!==c&&rnd()<.98){const side=c.y<34?-1:1,roles=onT(k).filter(x=>x!==c&&(FWD(x)||MID(x))&&!x.off).sort((a,x)=>Math.abs(a.x-gx)-Math.abs(x.x-gx)),j=roles.indexOf(e);
    if(j>=0&&j<3){const spots=[[6,side*3.5],[7,-side*5],[12.5,-side*1]],[dx,dy]=spots[j];return seek(e,gx-s*dx,34+dy,.95)}}
   // forwards spin in behind a high line
   if(FWD(e)&&!(e.run>0)&&!(e.cd.run>0)&&cf>30){const L=lines(opp(k)),hi=L.back>26;if(hi&&rnd()<dt*.7*iq){e.run=1.6;e.cd.run=3.5}}
   // everyone else finds a pocket of space near his spot, with a clear line to the ball
   if(e!==c&&!(e.run>0)&&cf<92){if(!(e.cd.sp>0)||!e.spot){e.cd.sp=.45+rnd()*.2;const [hx,hy]=homeSpot(e),O=onT(opp(k)).filter(o=>!o.off);let best=null,bs=-1e9;
     for(let i=0;i<7;i++){const a=i*Math.PI*2/6,r=i?4:0,x=clamp(hx+Math.cos(a)*r,2,PL-2),y=clamp(hy+Math.sin(a)*r,2,PW-2),q={x,y};let m=99;O.forEach(o=>{m=Math.min(m,Math.hypot(o.x-x,o.y-y))});
      let sc=Math.min(m,7)-laneRisk(c,q)*4-r*.12;if(isOff(Object.assign({t:k},q)))sc-=4;if(sc>bs){bs=sc;best=q}}e.spot=best}
    if(e.spot){seek(e,e.spot.x,e.spot.y,.85);return}}
   return _ta(e,dt)}
  if(!c)return _ta(e,dt);
  // defending: first man contains, second man covers, the rest hold the lines
  const D=onT(k).filter(x=>x.pos!='GK'&&!x.off).sort((a,x)=>dist(a,c)-dist(x,c)),L=lines(k),own=L.own;
  if(D[0]===e){const ux=own-c.x,uy=34-c.y,l=Math.hypot(ux,uy)||1,gap=2+(1-iq)*.6;seek(e,c.x+ux/l*gap,c.y+uy/l*gap,1);
   const dd=dist(e,c),away=Math.cos(c.fa-Math.atan2(uy,ux))<-.2,slow=Math.hypot(c.vx,c.vy)<2.5,beat=(c.cd.beat||0)>0;
   if(dd<1.9&&!beat){const rate=(away||slow?2.6:.9)*(.4+iq*.6);if(rnd()<dt*rate)tackle(e,false)}
   else if(dd<2.4&&(e.x-c.x)*s<0&&(c.x-own)*s<30&&rnd()<dt*.5*iq)tackle(e,true);return}
  const press=(feat('press')||(k===0&&G.press2>0)?2:1)+tacMod(k).press;
  if(D[1]===e&&press<=1&&dist(e,c)<22&&Math.hypot(c.x-own,c.y-34)>30){const cx=c.x+(own-c.x)*.28,cy=c.y+(34-c.y)*.28;seek(e,cx,cy,.95);return}
  return _ta(e,dt)}}
// the defending team's shape: back line level, midfield and forwards not too far in front of it
{const _hs=homeSpot;homeSpot=function(e){const r=_hs(e);try{if(!AI2()||!G||G.phase!='live'||e.pos=='GK')return r;const k=e.t,b=G.b,c=b.own;if(!c||c.t===k)return r;
  const L=lines(k),s=L.s,own=L.own;if((b.x-own)*s<36)return r;let X=(r[0]-own)*s;if(BACK(e))X=X*.3+L.back*.7;else if(MID(e))X=clamp(X,L.back+6,L.back+22);else if(FWD(e))X=clamp(X,L.back+12,L.back+36);
  if(BACK(e)){const run=onT(opp(k)).find(o=>o.run>0&&Math.abs(o.y-r[1])<12&&(o.x-own)*s<X+8);if(run)X=Math.min(X,(run.x-own)*s-1.5)}
  return[own+s*X,r[1]]}catch(err){return r}}}
// ---------- on the ball ----------
{const _ca=carrierAI;carrierAI=function(e,dt){if(!AI2()||G.phase!='live'||e.set)return _ca(e,dt);const b=G.b,k=e.t,s=G.dir[k],gx=goalX(s),iq=IQ(k),fwd=(e.x-goalX(-s))*s;
  if((e.cd.dec||0)>dt)return _ca(e,dt);
  const O=onT(opp(k)).filter(o=>!o.off),dGoal=Math.hypot(gx-e.x,34-e.y),clear=!O.some(o=>o.pos!='GK'&&(o.x-e.x)*s>0&&Math.abs(o.y-(e.y+(34-e.y)*Math.abs(o.x-e.x)/Math.max(1,dGoal)))<1.6&&Math.abs(o.x-e.x)<dGoal);
  // through on goal: shoot from close in
  if(clear&&dGoal<15&&rnd()<iq){e.cd.dec=.3;return shoot(e,.78+rnd()*.15)}
  // a shot from the edge of the box when the lane is clear
  if(clear&&dGoal<22){const q=shotQuality(e);if(q.xg>.05&&!q.pres&&rnd()<iq*.8){e.cd.dec=.3;return shoot(e,.78+rnd()*.17)}}
  // take on the last man in front of him
  const ahead=O.filter(o=>o.pos!='GK'&&(o.x-e.x)*s>0&&dist(o,e)<3.2);if(ahead.length==1&&fwd>55&&e.p.sk.dri>=ahead[0].p.sk.tkl-6&&!(e.cd.sk>0)&&rnd()<.45*iq){skill(e);e.cd.dec=.35;return dribble(e,dt,fwd)}
  // cut-back from the byline
  if(fwd>90&&Math.abs(e.y-34)>7&&rnd()<.4+iq*.5){const T=onT(k).filter(r=>r!==e&&!r.off&&r.pos!='GK'&&Math.abs(gx-r.x)>7&&Math.abs(gx-r.x)<17&&Math.abs(r.y-34)<10&&Math.min(...O.map(o=>dist(o,r)))>2.5).sort((a,c2)=>shotQuality(c2).xg-shotQuality(a).xg)[0];
   if(T&&laneRisk(e,T)<.5){e.cd.dec=.3;return passTo(e,T,.35)}}
  // early cross when runners are in the box
  if(fwd>62&&Math.abs(e.y-34)>13){const box=onT(k).filter(r=>r!==e&&!r.off&&Math.abs(gx-r.x)<15&&Math.abs(r.y-34)<11).length;if(box>=1&&rnd()<.35+iq*.35){e.cd.dec=.3;return crossBox(e)}}
  // slide a runner in behind
  {const R2=onT(k).filter(r=>r!==e&&!r.off&&r.run>0&&(r.x-e.x)*s>3&&!isOff(r)&&laneRisk(e,r)<.6)[0];if(R2&&rnd()<.4+iq*.5){e.cd.dec=.3;return passTo(e,R2,.8,'through')}}
  // switch play when it is crowded on this side
  const near=O.filter(o=>dist(o,e)<9).length;if(near>=3&&rnd()<iq*.7){const T=onT(k).filter(r=>r!==e&&!r.off&&r.pos!='GK'&&Math.abs(r.y-e.y)>26&&Math.min(...O.map(o=>dist(o,r)))>7&&(r.x-e.x)*s>-12)[0];if(T){e.cd.dec=.3;return passTo(e,T,.4,'long')}}
  return _ca(e,dt)}}
// a player who passes forward goes for the return (one-two)
{const _pt=passTo;passTo=function(e,r,lead,kind){const r0=_pt(e,r,lead,kind);try{if(AI2()&&G.phase=='live'&&r&&r.t===e.t&&!(e===G.ctl&&!G.auto&&e.t===0)&&(MID(e)||FWD(e)||e.pos=='FB')&&(r.x-e.x)*G.dir[e.t]>2&&!kind&&!onT(opp(e.t)).some(o=>!o.off&&(o.x-e.x)*G.dir[e.t]>0&&dist(o,e)<6)&&rnd()<IQ(e.t)*.4){e.run=1.3;e.cd.run=3}}catch(err){}return r0}}
// ---------- keepers: narrow the angle, sweep balls in behind ----------
{const _ga=gkAI;gkAI=function(e,dt){if(!AI2()||e.dive||e.rush>0||G.phase!='live'||G.b.own===e)return _ga(e,dt);const b=G.b,k=e.t,s=G.dir[k],own=goalX(-s),c=b.own;
  // sweep a ball played in behind if he gets there first
  if(!c&&b.from&&b.from.t!==k&&(b.kind=='through'||b.kind=='long'||b.kind==null)&&b.kind!='shot'&&Math.abs(b.x-own)<30&&b.z<2.4){const sp=Math.hypot(b.vx,b.vy),tx=b.x+b.vx*.35,ty=b.y+b.vy*.35,tg=Math.hypot(tx-e.x,ty-e.y)/(topSpd(e)*1.05),A=onT(opp(k)).filter(x=>!x.off).map(x=>Math.hypot(tx-x.x,ty-x.y)/topSpd(x));
   if(sp<22&&tg+.25<Math.min(...A)*(.8+IQ(k)*.25))return seek(e,tx,ty,1.1)}
  // with the ball near his goal, stand on the line from the ball to the middle of the goal
  if(c&&c.t!==k&&Math.abs(c.x-own)<34){const dx=c.x-own,dy=c.y-34,d=Math.hypot(dx,dy)||1,out=clamp(1+(34-d)*.06,1,3.2)*(dist(c,e)<9?1.6:1);seek(e,own+dx/d*out,clamp(34+dy/d*out,GY0-.5,GY1+.5),1);
   if(dist(c,e)<5.5&&!onT(k).some(x=>x!==e&&x.pos!='GK'&&dist(x,c)<2)&&rnd()<dt*2.2*IQ(k))return seek(e,c.x,c.y,1.1);return}
  return _ga(e,dt)}}
// an attacking team that reads the game better also takes its chances: more willing to shoot, a little quicker on the ball
{const _tm=tacMod;tacMod=function(k){const t=_tm(k);if(!AI2()||!G||G.phase!='live')return t;return Object.assign({},t,{shoot:t.shoot*1.15,tempo:t.tempo*1.1})}}
// better finishing: smarter attackers pick their spot (the keeper's position decides player shots; this is the CPU's)
{const _sa=shotAdj;shotAdj=function(e,q){const a=_sa(e,q);if(!AI2()||!G)return a;return a+.13*IQ(e.t)}}
