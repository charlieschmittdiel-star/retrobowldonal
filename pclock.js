'use strict';
// 1) Play clock: before the snap on offense you have 40 seconds to snap the ball. It shows next to the game clock and
//    turns red for the last 10 seconds. If it hits zero: delay of game, 5 yards, replay the down.
// 2) Skip the drop-back: double-tap the pump-fake key (Space) during the QB's drop-back and you get control of him
//    right away instead of waiting for the drop to finish. A single tap is still a pump fake.
// 3) Live tipped balls: when a tipped ball comes down, the players around it play it. Someone can catch it (offense:
//    a catch, defense: an interception), tip it again (up to 3 tips), or knock it down. It only hits the turf if
//    nobody gets a hand on it.
{const add=[['On the field','pclock','Play clock','Before the snap on offense you have 40 seconds to snap the ball (shown next to the game clock). If it runs out: delay of game, 5 yards.'],
 ['On the field','qbskip','Skip the drop-back','Double-tap Space (the pump fake key) during the drop-back to take control of your QB right away. One tap is still a pump fake.'],
 ['On the field','tip3','Live tipped balls','A tipped ball that comes down near players is played: it can be caught, intercepted, tipped again or knocked down, instead of just falling.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}

// ---------- 1) play clock ----------
const PCK_LEN=40;
function pckOn(){return feat('pclock')&&G&&G.live&&P&&G.phase=='pre'&&G.poss=='U'&&!G.prac&&!G.tut&&!G.two&&!G.ch&&!P.kr&&!P.kk&&!P.over&&
 !(typeof autoMode=='function'&&autoMode())&&qbIsMe()}
function pckTick(dt){if(!pckOn())return;if(P.pck==null)P.pck=PCK_LEN;
 // stopped while a menu, the lobby or a first-time tip is open
 if(G.paused||!$('modal').hidden||($('tip')&&$('tip').style.display=='block'))return;
 P.pck=Math.max(0,P.pck-dt);
 if(P.pck<=0&&!P.pckDone){P.pckDone=1;penApply({s:'O',n:'Delay of game',y:5})}}
{const _cl=careerLoop;careerLoop=function(dt){try{pckTick(dt)}catch(e){console.error(e)}return _cl(dt)}}
// a timeout resets it
{const _to=callTO;callTO=function(side,...a){const r=_to.call(this,side,...a);try{if(r&&side==0&&P)P.pck=PCK_LEN}catch(e){}return r}}
// shown next to the game clock on the scoreboard
{const _sb=sbTick;sbTick=function(...a){const r=_sb.apply(this,a);try{const q=document.querySelector('#sb .q');if(!q)return r;let e=q.querySelector('.pck');
 if(!pckOn()||P.pck==null){if(e)e.remove();return r}
 if(!e){e=document.createElement('span');e.className='pck';e.title='Play clock';q.appendChild(e)}
 const s=Math.ceil(P.pck);e.textContent=':'+String(s).padStart(2,'0');e.classList.toggle('low',s<=10)}catch(err){}return r}}
(()=>{const st=document.createElement('style');st.textContent=`#sb .pck{display:inline-block;margin-left:8px;padding:0 5px;border-radius:4px;background:#ffd84d;color:#111;font:800 13px "Trebuchet MS",sans-serif;vertical-align:1px}
#sb .pck.low{background:#ef4444;color:#fff;animation:pckP .5s ease-in-out infinite alternate}@keyframes pckP{from{opacity:1}to{opacity:.55}}`;document.head.appendChild(st)})();

// ---------- 2) double-tap to skip the drop-back ----------
const QS_WIN=280; // ms between the two taps
function qsDropping(){if(!feat('qbskip')||!G||!P||G.phase!='play'||G.poss!='U'||P.run||P.kr||P.qbFree)return false;
 if(!P.b||P.b.st!='qb'||!qbIsMe()||(typeof autoMode=='function'&&autoMode()))return false;return P.t<(feat('drop2')?1.05:.9)}
const _qsPump=pump;
pump=function(...a){try{if(qsDropping()){const now=performance.now();
  if(P.qsTap&&now-P.qsTap<=QS_WIN){P.qsTap=0;P.qbFree=1;P.dropping=false;G.msg='Drop-back skipped. He\'s all yours.';return}
  P.qsTap=now;return}}catch(e){}return _qsPump.apply(this,a)};
{const _st=step;step=function(dt){const q=P&&P.off&&P.off[0],fr=!!(P&&P.qbFree&&G.phase=='play'&&q&&P.b.st=='qb'&&!P.run&&P.t<1.2),sx=fr?q.x:0,sy=fr?q.y:0,sf=fr?q.fa:0;
 _st(dt);
 try{if(!P)return;
  // one tap and no second one: it was a pump fake after all
  if(P.qsTap&&performance.now()-P.qsTap>QS_WIN){P.qsTap=0;if(P.b&&P.b.st=='qb'&&G.phase=='play')_qsPump()}
  // he's yours: undo this frame's scripted drop and move him with your keys instead
  if(fr&&P.off[0]===q&&P.b.st=='qb'&&!P.run&&G.phase=='play'){P.dropping=false;q.x=sx;q.y=sy;q.fa=sf;const v=inp();
   if(v[2])mv(q,q.x+v[0]*5,q.y+v[1]*5,q.spd*.95,dt);else q.vx=q.vy=0;
   if(P.aim){const t=aimT();face(q,Math.atan2(t[1]-q.y,t[0]-q.x),6,dt)}else if(v[2])face(q,Math.atan2(v[1],v[0]),6,dt)}}catch(e){console.error(e)}}}

// ---------- 3) live tipped balls ----------
const TIP_R=2.6,TIP_MAX=3;
{const _te=tipEnd;tipEnd=function(...a){if(!feat('tip3'))return _te.apply(this,a);try{return tip3End()}catch(e){console.error(e);return _te.apply(this,a)}}}
function tip3End(){const b=P.b,l={x:b.tx,y:b.ty},n=P.tipN=(P.tipN||0)+1,uD=G.poss!='U';
 const up=p=>p&&!p.fall&&!p.gone,C=[];
 P.off.forEach((q,i)=>{if(i&&(i<6||q.route.length)&&up(q)){const d=dist(q,l);if(d<TIP_R)C.push({p:q,o:1,d})}});
 P.def.forEach(p=>{if(up(p)){const d=dist(p,l);if(d<TIP_R)C.push({p,o:0,d})}});
 b.st='dead';
 if(!C.length){endPlay('inc');G.msg='The tipped ball falls to the turf. Incomplete.';return}
 // closest first, with a little scramble so it isn't always the same man
 C.forEach(c=>c.k=c.d+rnd()*.6);C.sort((x,y)=>x.k-y.k);
 for(const c of C.slice(0,3)){const p=c.p,reach=clamp(1-c.d/TIP_R,0,1),me=uD&&p===cd;
  if(rnd()>clamp(.45+reach*.55+(me&&(cd.hawk>0||cd.swat>0)?.25:0),.4,.97))continue; // didn't get a hand on it
  const crowd=C.filter(x=>x.o!==c.o&&dist(x.p,p)<1.6).length,hands=c.o?CR(p,.5):BK(p);
  let pc=clamp(.3+(hands-60)/160+reach*.25-crowd*.1,.08,.8)*(c.o?1:.88);
  if(me&&cd.hawk>0)pc=Math.min(.9,pc+.3);if(me&&cd.swat>0)pc=0;
  p.an={k:'catch',t:0,d:.35};const u=rnd();
  if(u<pc){if(c.o){b.st='carry';b.c=p;b.x=p.x;b.y=p.y;P.rec=p;sRec(P.passer||P.off[0],'pc');sRec(p,'rc');G.msg=n>1?'Caught after '+n+' tips!':'Caught off the tip!';return}
   P.intBy=p;G.msg='Picked off the tip!';if(feat('tipint'))return intReturn(l,p);return endPlay('int',l.x)}
  if(n<TIP_MAX&&u<pc+(1-pc)*.7){tip({x:p.x+(l.x-p.x)*.5,y:p.y+(l.y-p.y)*.5});if(P.b.tipH){P.b.tipH=4.2;P.b.T2=.9}
   G.msg=c.o?'Bobbled! It\'s still in the air!':'Tipped again! It\'s still alive!';return}
  endPlay('inc');G.msg=c.o?'He can\'t hang on. Incomplete.':'Knocked down! Incomplete.';return}
 endPlay('inc');G.msg='It falls between them. Incomplete.'}
