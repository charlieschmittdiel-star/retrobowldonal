'use strict';
// Full-screen game layout: the canvas fills the screen, the playbook and pre-snap buttons float on top and disappear
// at the snap. On offense the play starts when you pull back to throw (pass play) or tap your running back (run play).
let KS=1;
function fit(){const a=innerWidth/Math.max(1,innerHeight);W=Math.round(clamp(540*a,640,1400));const dpr=Math.min(3,globalThis.devicePixelRatio||1),ph=Math.round(clamp(innerHeight*dpr,540,1600));KS=ph/H;const pw=Math.round(W*KS);if(C.width!==pw||C.height!==ph){C.width=pw;C.height=ph}}
addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,200));fit();
// ---------- playbook cards (little play diagrams) ----------
function offSVG(pl){const X0=y=>6+clamp(y,0,53)*1.9,Y0=dx=>58-dx*1.45,s=[];
 s.push(`<line x1="2" y1="${Y0(0)}" x2="110" y2="${Y0(0)}" stroke="#7cc4ff" stroke-width="1.5"/>`);
 pl.p.forEach((e,i)=>{const x=X0(e[1]),y=Y0(Math.min(e[0],-.5));let sx=x,sy=y;
  if(e[4]&&e[4].length){const pts=e[4].map(([a,b])=>[X0(e[1]+b),Y0(Math.min(e[0]+a,-.5))]);s.push(`<polyline points="${[[x,y],...pts].map(q=>q.join(',')).join(' ')}" fill="none" stroke="#ff9f43" stroke-width="1.6" stroke-dasharray="2 2"/>`);[sx,sy]=pts[pts.length-1]}
  if(e[2]&&e[2].length){const pts=e[2].map(([a,b])=>[X0(e[1]+b+(sx-x)/1.9),clamp(sy-a*1.45,2,78)]);s.push(`<polyline points="${[[sx,sy],...pts].map(q=>q.join(',')).join(' ')}" fill="none" stroke="#ffd84d" stroke-width="1.8"/>`)}
  if(pl.run&&i==(pl.ho||5))s.push(`<line x1="${sx}" y1="${sy}" x2="${sx}" y2="${sy-20}" stroke="#ff5a4d" stroke-width="2.2"/>`);
  s.push(`<circle cx="${x}" cy="${y}" r="2.6" fill="${i==0?'#fff':i>5?'#93c5fd':'#3b82f6'}"/>`)});
 return`<svg viewBox="0 0 112 80">${s.join('')}</svg>`}
function defSVG(pl){const X0=y=>6+clamp(y,0,53)*1.9,Y0=dx=>58-dx*1.45,s=[];
 s.push(`<line x1="2" y1="${Y0(0)}" x2="110" y2="${Y0(0)}" stroke="#7cc4ff" stroke-width="1.5"/>`);
 pl.p.forEach(e=>{const x=X0(e[1]),y=Y0(Math.max(e[0],.5));
  if(e[2]=='r')s.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${Y0(-3)}" stroke="#ff5a4d" stroke-width="1.8"/>`);
  if(e[2]=='z'&&e[3]){const r=(e[4]||(Math.abs(e[3][0])>=12?10:6.5))*1.6;s.push(`<ellipse cx="${X0(e[3][1])}" cy="${Y0(e[3][0])}" rx="${r}" ry="${r*.7}" fill="#60a5fa33" stroke="#60a5fa" stroke-width="1"/><line x1="${x}" y1="${y}" x2="${X0(e[3][1])}" y2="${Y0(e[3][0])}" stroke="#60a5fa" stroke-width="1"/>`)}
  if(e[2]=='m')s.push(`<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#c084fc" stroke-width="1.2"/>`);
  s.push(`<circle cx="${x}" cy="${y}" r="2.6" fill="#ef4444"/>`)});
 return`<svg viewBox="0 0 112 80">${s.join('')}</svg>`}
function pbHTML(u){const all=u?allP():DALL(),cur=u?P.name:P.dpn,run=n=>u&&all[n].run;
 const names=Object.keys(all).sort((a,b)=>(run(b)?1:0)-(run(a)?1:0));
 return`<h3><span>${u?'Call a play':'Call a defense'}${u&&G.called?` (changing it uses an audible: ${G.aud} left)`:''}</span><button data-a="pb">Close</button></h3><div class="cards">${names.map(n=>`<button class="card ${cur==n?'on':''}" ${u?'data-p':'data-d'}="${n}">${u?offSVG(all[n]):defSVG(all[n])}<span>${n}${run(n)?' (run)':''}</span></button>`).join('')}</div>`}
// ---------- the pre-snap / in-play interface ----------
function showEl(id,v,disp){const e=$(id);if(e)e.style.display=v?(disp||''):'none'}
function ui(){if(!G||!P)return;const u=G.poss=='U',pre=G.phase=='pre',car=CAR(),pl=$('plays');$('stick').style.visibility=G.phase=='play'?'visible':'hidden';showEl('hint',1);
 const sw=$('dctl')&&$('dctl').querySelector('[data-k=" "]');if(sw)sw.style.display=car?'none':'';
 if(car&&G.live&&autoMode()&&!G.ch){showEl('pb',0);showEl('snap',0);showEl('top',1,'flex');showEl('pbb',0);showEl('pre',1,'flex');$('stick').style.visibility='hidden';$('dctl').style.display='none';$('act').style.visibility='hidden';
  $('hint').textContent=(G.poss=='U'?'Your offense':'Your defense')+' is on the field.';$('plays').innerHTML='<button data-a="skip">Skip to your next drive</button>';return}
 if(G.ch){showEl('pb',0);showEl('pre',1,'flex');showEl('top',1,'flex');showEl('snap',0);$('hint').textContent=G.msg;
  pl.innerHTML=G.ch.k=='tb'?'<button data-a="tb">Take the touchback</button><button data-a="ret">Return it</button>':'<button data-a="xp">Kick the extra point</button><button data-a="two">Go for 2</button>';
  $('dctl').style.display='none';$('act').style.visibility='hidden';return}
 if(!pre){showEl('pb',0);showEl('pre',0);showEl('top',0);$('dctl').style.display=!u&&G.phase=='play'&&!(car&&autoMode())?'flex':'none';$('act').style.visibility=u&&G.phase=='play'&&!(car&&autoMode())?'visible':'hidden';return}
 showEl('top',1,'flex');showEl('pre',1,'flex');$('dctl').style.display='none';$('act').style.visibility='hidden';
 if(car&&!myUnitOn()){showEl('pb',0);showEl('snap',0);showEl('pbb',0);$('hint').textContent=(u?'Your offense':'Your defense')+' is on the field.';pl.innerHTML='<button data-a="skip">Skip to your next drive</button>';return}
 const canCall=u?qbIsMe():!car,rb=P.off[P.ho||5],meRB=car&&u&&P.run&&rb&&rb.pid===R.me;
 showEl('pbb',canCall);showEl('pb',canCall&&G.pbOpen);showEl('hint',!(canCall&&G.pbOpen));if(canCall&&G.pbOpen)$('pb').innerHTML=pbHTML(u);
 $('hint').textContent=u?(qbIsMe()?(P.run?`${P.name}: tap your running back to snap.`:`${P.name}: pull back on the field to snap, then aim and let go to throw.`):(meRB?`Coach called ${P.name}. Tap yourself (the running back) to snap.`:`Coach called ${P.name}. Press Ready to snap.`))
  :(car?`Coach called ${P.dpn}. Press Ready.`:`${P.dpn}: press Snap when you're set.${P.hint?'':''}`);
 if(u&&qbIsMe()&&P.hint)$('hint').textContent+=` Defense shows ${P.hint}.`;
 let b='';if(u&&qbIsMe()){b+=`<button data-a="hurry" class="${G.hurry?'on':''}">Hurry-up ${G.hurry?'on':'off'}</button>`;if(G.run&&G.down<4)b+='<button data-a="spike">Spike</button>';b+='<button data-a="kneel">Kneel</button>';if(G.down==4)b+=`<button data-a="punt">Punt</button><button data-a="fg">Field goal (${fgDist()} yd)</button>`}
 if(G.run&&G.to[0]>0&&(!car||qbIsMe()||!u))b+=`<button data-a="to">Timeout (${G.to[0]})</button>`;
 pl.innerHTML=b;const needSnap=!u||(car&&!qbIsMe()&&!meRB);showEl('snap',needSnap);$('snap').textContent=u||car?'Ready':'Snap'}
$('pb').onclick=$('plays').onclick;$('pbb').onclick=()=>{G.pbOpen=!G.pbOpen;ui()};
$('hlp').onclick=()=>{$('modal').hidden=0;$('modal').innerHTML=`<div class="pg"><h1>Controls</h1><p><b>Starting a play:</b> on a pass play, pull back on the field (like a slingshot) to snap; keep holding to aim, let go to throw. A tiny pull is a pump fake. On a run play, tap your running back to snap and hand it off. On defense, press Snap.</p><p>${$('help').textContent}</p><div class="grid"><button class="big" onclick="$('modal').hidden=1">Back to the game</button></div></div>`};
// ---------- snap by pulling back (pass) or tapping the running back (run) ----------
let preAim=null;
C.addEventListener('pointerdown',e=>{if(G.phase!='pre'||G.poss!='U'||G.ch||!$('modal').hidden||(CAR()&&autoMode()))return;const[a,c]=wp(e),[x,y]=unproj(a,c);
 const rb=P.off[P.ho||5],meRB=CAR()&&rb&&rb.pid===R.me;
 if(P.run){const f=rb?P2(rb.x,rb.y):[0,0],hitRB=rb&&Math.abs(a-f[0])<24&&c>f[1]-48&&c<f[1]+14;if((qbIsMe()||meRB)&&hitRB){G.pbOpen=false;snap()}else if(qbIsMe())G.msg='Run play: tap your running back to snap.';return}
 if(!qbIsMe())return;G.pbOpen=false;showEl('pb',0);preAim={a:[a,c]};P.aim={a:[a,c],c:[a,c]};try{C.setPointerCapture(e.pointerId)}catch(err){}});
C.addEventListener('pointermove',e=>{if(!preAim||G.phase!='pre')return;const p=wp(e);if(P.aim)P.aim.c=p;if(Math.hypot(p[0]-preAim.a[0],p[1]-preAim.a[1])>16){preAim=null;snap();if(G.phase=='pre')P.aim=null}});
C.addEventListener('pointerup',()=>{if(preAim){preAim=null;P.aim=null}if(G.phase=='motion')P.aim=null});

// ---------- scoreboard and play-result banner ----------
(()=>{const w=$('wrap');w.insertAdjacentHTML('beforeend','<div id="sb"></div><div id="res"><div class="t"></div><div class="s"></div></div>');$('hud').style.display='none'})();
const ord=n=>['1st','2nd','3rd','4th'][n-1]||n+'th';
const tAbbr=n=>String(n||'').split(' ').pop().toUpperCase().slice(0,8);
function ylab(x){x=Math.round(x);if(x==60)return'50';return x<60?`${tAbbr(R.lg.t[0].n)} ${x-10}`:`${tAbbr(G.opp.n)} ${110-x}`}
let sbSig='',resSig='';
function sbTick(){if(!G)return;const m=Math.max(0,Math.ceil(G.clk)),q=G.q==5?'OT':ord(G.q).toUpperCase(),u=G.poss=='U',dots=n=>'<b></b>'.repeat(n)+'<b class="off"></b>'.repeat(Math.max(0,3-n));
 const dd=G.ch?'':`${ord(G.down)} &amp; ${G.ytg>=((G.dir>0?110:10)-P.L)*G.dir?'Goal':G.ytg} <em>·</em> ${ylab(P.L)}`;
 const sig=[G.sc,m,q,G.run,G.down,G.ytg,P.L,G.poss,G.to,G.opp.n,G.ch?1:0].join('|');
 if(sig!==sbSig){sbSig=sig;$('sb').innerHTML=`<div class="tm u${u?' pos':''}"><span class="nm">${tAbbr(R.lg.t[0].n)}</span><span class="sc">${G.sc[0]}</span><span class="to">${dots(G.to[0])}</span></div>
  <div class="mid"><div class="q">${q} <span class="clk ${G.run?'on':''}">${m/60|0}:${String(m%60).padStart(2,'0')}</span></div><div class="dd">${dd}</div></div>
  <div class="tm c${!u?' pos':''}"><span class="sc">${G.sc[1]}</span><span class="nm">${tAbbr(G.opp.n)}</span><span class="to">${dots(G.to[1])}</span></div>`}
 const ms=$('msg'),show=G.phase!='post'&&G.msg&&G.phase=='play';ms.textContent=show?G.msg:'';ms.style.display=show?'':'none';
 // result banner: shown while the play result is on screen
 if(G.phase=='post'&&G.msg){const k=G.msg+'|'+G.sc;if(k!==resSig){resSig=k;showRes()}}else if(G.phase!='post'&&resSig){resSig='';$('res').className=''}}
function showRes(){const m=G.msg,u=G.poss=='U';let t='',cls='',bad=false;const n=(re)=>{const x=m.match(re);return x?x[1]:null};
 if(/TOUCHDOWN/.test(m)){t='TOUCHDOWN!';cls='td'}
 else if(/FIELD GOAL IS GOOD/.test(m)){t='FIELD GOAL';cls='td'}else if(/Field goal no good/.test(m)){t='NO GOOD';bad=true}
 else if(/INTERCEPT/.test(m)){t='INTERCEPTED';bad=true}else if(/FUMBLE/.test(m)){t='FUMBLE';bad=true}else if(/SAFETY/.test(m)){t='SAFETY';bad=true}
 else if(/TURNOVER ON DOWNS/.test(m)){t='TURNOVER ON DOWNS';bad=true}
 else if(/SACK/.test(m)){t='SACKED'+(n(/Loss of (\d+)/)?' -'+n(/Loss of (\d+)/):'');bad=true}
 else if(/Incomplete|Spiked/.test(m)){t=/Spiked/.test(m)?'SPIKE':'INCOMPLETE';bad=!/Spiked/.test(m)}
 else if(/Extra point is good/.test(m)){t='EXTRA POINT GOOD';cls='td'}else if(/Extra point missed/.test(m)){t='EXTRA POINT MISSED';bad=true}
 else if(/Two-point conversion is good/.test(m)){t='2-POINT GOOD';cls='td'}else if(/Two-point try fails/.test(m)){t='2-POINT FAILS';bad=true}
 else if(/FIRST DOWN/.test(m)){t='FIRST DOWN'}
 else if(n(/Gain of (\d+)/)!=null){t='+'+n(/Gain of (\d+)/)+' YARDS'}else if(n(/Loss of (\d+)/)!=null){t='-'+n(/Loss of (\d+)/)+' YARDS';bad=true}
 else if(/Returned to the/.test(m)){t='RETURN';cls='inc'}else if(/Kneel/.test(m)){t='KNEEL';cls='inc'}else if(/Time runs out/.test(m)){t='END OF QUARTER';cls='inc'}
 else{t=m.split(/[.!]/)[0].toUpperCase().slice(0,26);cls='inc'}
 if(!cls){const good=u!==bad;cls=good?'good':'bad'}else if(cls=='td')cls=(u?'td':'bad');
 let s='';const g=n(/Gain of (\d+)/)||n(/Loss of (\d+)/);if(t=='FIRST DOWN'&&g)s=`+${g} yards`;
 if(G.next=='same'&&!/Returned|Touchback/.test(m)&&!/TOUCHDOWN|FIELD GOAL/.test(m))s+=(s?' · ':'')+`${ord(G.down)} & ${G.ytg} at ${ylab(G.nl)}`;
 else if(/Returned to the/.test(m))s=`Ball at ${ylab(G.nl)}`;
 const e=$('res');e.className='';void e.offsetWidth;e.querySelector('.t').textContent=t;e.querySelector('.s').textContent=s;e.className='show '+cls}
