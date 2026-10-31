'use strict';
// Computer-first controls: keyboard shortcuts for everything, throw-to-receiver keys, optional point-and-click
// throwing, right-click pump fake, game controller support, on-screen key hints, fullscreen and a full controls page.
FEATS.splice(FEATS.findIndex(f=>f[0]=='Help')+1,0,['Help','keyhint','Key hints','A line at the bottom of the screen showing the keys you can press right now (computers only).']);
const isPad=()=>padOn;let padOn=false,padPrev=[],padJoy=false,mouseS=null;
const mthrow=()=>OPT.mthrow=='point'&&!TOUCH();
const userQB=()=>G&&P&&G.phase=='play'&&G.poss=='U'&&P.b.st=='qb'&&!P.run&&!P.scr&&qbIsMe()&&!autoMode();
// ---------- camera/controls page additions ----------
{const _fu=featUI;featUI=function(){_fu();const h=[...$('modal').querySelectorAll('h3')].find(e=>e.textContent=='Controls');if(!h||!h.nextElementSibling)return;const m=OPT.mthrow||'sling';
 h.nextElementSibling.insertAdjacentHTML('afterbegin',`<div class="feat"><div class="row">${[['sling','Slingshot'],['point','Point and click']].map(([k,n])=>`<button class="${m==k?'on':''}" onclick="optSet('mthrow','${k}')">${n}</button>`).join('')}</div><div><b>Mouse throwing</b><span class="small">Slingshot: pull back and let go. Point and click: aim with the mouse and click the spot. Either way, 1-5 throws straight to a receiver.</span></div></div>`)}}
// ---------- the order plays appear in the playbook (for number keys) ----------
function pbOrder(u){const d=document.createElement('div');d.innerHTML=pbHTML(u);return[...d.querySelectorAll(u?'[data-p]':'[data-d]')].map(b=>u?b.dataset.p:b.dataset.d)}
{const _pb=pbHTML;pbHTML=function(u){let h=_pb(u);if(!TOUCH()){let i=0;h=h.replace(/(<button class="card[^>]*>)/g,m=>i<9?m+`<kbd>${++i}</kbd>`:m)}return h}}
function pickPlay(n,u){if(u){if(n!=P.name)chg(()=>{applyPlay(n);sel=-1});else applyPlay(n)}else applyDef(n);G.pbOpen=false;ui()}
function canCall(){const u=G.poss=='U';return u?qbIsMe()&&!(CAR()&&!myUnitOn()):!CAR()}
// ---------- keyboard ----------
{const _h=hit;hit=function(k){
 if(k=='escape'){if($('tip')&&$('tip').style.display=='block')return tipOK();if(!$('modal').hidden){if(G&&G.live&&!G.paused)closeLobby();return}if(G&&G.live&&G.phase!='play')lobby();return}
 if(!$('modal').hidden||!G||!P)return _h(k);
 if(G.ch&&G.phase=='pre'&&(k=='1'||k=='2')){const b=$('plays').querySelectorAll('button')[+k-1];if(b)b.click();return}
 const pre=G.phase=='pre'&&!G.ch,u=G.poss=='U';
 if(pre&&/^[1-9]$/.test(k)&&canCall()&&!(typeof p2on=='function'&&p2on()&&+k>=6)){const n=pbOrder(u)[+k-1];if(n)pickPlay(n,u);return}
 if(pre&&k=='b'&&canCall()){G.pbOpen=!G.pbOpen;ui();return}
 if(pre&&k=='o'&&u&&qbIsMe()&&feat('form')){const i=FORMN.indexOf(G.form||'Default');G.form=FORMN[(i+1)%FORMN.length];applyPlay(P.name);ui();return}
 if(pre&&k=='h'&&u&&qbIsMe()){G.hurry=G.hurry?0:1;ui();return}
 if(/^[1-5]$/.test(k)&&userQB()){const r=P.off[+k];if(r){throwTo(r);G.msg=''}return}
 return _h(k)}}
// ---------- mouse: right-click pump fake, point-and-click throwing ----------
C.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('pointerdown',e=>{if(e.target!==C||!G||!P||!$('modal').hidden)return;
 if(e.button==2){e.stopImmediatePropagation();if(userQB())pump();return}
 if(mthrow()&&userQB()&&e.pointerType=='mouse'){e.stopImmediatePropagation();const[a,c]=wp(e),[x,y]=unproj(a,c);throwAt(clamp(x,1,119),clamp(y,1,52))}},true);
C.addEventListener('pointermove',e=>{if(e.pointerType=='mouse')mouseS=wp(e)});C.addEventListener('pointerleave',()=>mouseS=null);
// ---------- game controller ----------
addEventListener('gamepadconnected',()=>{padOn=true;if(G)G.msg='Controller connected.'});addEventListener('gamepaddisconnected',()=>{padOn=false;padPrev=[];if(padJoy){joy=[0,0];padJoy=false}});
const PADR=['A','B','X','Y','RB'];
function padPoll(){const gs=globalThis.navigator&&navigator.getGamepads?[...navigator.getGamepads()]:[],gp=gs.find(g=>g&&g.connected);if(!gp){if(padJoy){joy=[0,0];padJoy=false}return}padOn=true;
 const pr=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed);let x=gp.axes[0]||0,y=gp.axes[1]||0;if(pr(14))x=-1;if(pr(15))x=1;if(pr(12))y=-1;if(pr(13))y=1;const m=Math.hypot(x,y);
 if(m>.25&&$('modal').hidden){joy=[x/Math.max(1,m),y/Math.max(1,m)];padJoy=true}else if(padJoy){joy=[0,0];padJoy=false}
 const now=gp.buttons.map(b=>!!b.pressed);now.forEach((v,i)=>{if(v&&!padPrev[i])try{padBtn(i)}catch(e){console.error(e)}});padPrev=now}
function padBtn(i){if(!G||!P)return;if(!$('modal').hidden){if(i==9||i==1)hit('escape');return}
 if(G.phase=='replay')return hit('p');if(G.phase=='kick'){if(i==0)hit(' ');return}
 if(G.ch){const b=$('plays').querySelectorAll('button');if(i==0&&b[0])b[0].click();if(i==1&&b[1])b[1].click();return}
 const u=G.poss=='U',b=P.b;if(i==9)return hit('escape');
 if(G.phase=='pre'){if(i==0)return snap();if(i==8)return hit('b');if(i==3)return hit('o');if(i==2)return hit('t');if(i==1&&!u)return hit(' ');
  if((i==4||i==5)&&canCall()){const o=pbOrder(u),c=o.indexOf(u?P.name:P.dpn),n=o[(c+(i==5?1:o.length-1))%o.length];if(n)pickPlay(n,u)}return}
 if(G.phase!='play')return;
 if(u){if(userQB()){if(i<=3||i==5)return hit(String(i<=3?i+1:5));if(i==4)return hit(' ');return}
  if(b.st=='carry')return hit({0:' ',1:'z',2:'x',3:'c',5:'v'}[i]||'');if(CAR())return hit({0:'z',1:'x',2:'c'}[i]||'');return}
 if(cd&&cd.eng)return hit({0:'1',1:'2',2:'3',3:'4'}[i]||'');hit({0:' ',1:'f',2:'e',3:'r',5:'g'}[i]||'')}
// ---------- drawing: receiver badges, mouse aim, key hints ----------
{const _dr=draw;draw=function(){padPoll();_dr();try{deskOverlay()}catch(e){}}}
function deskOverlay(){if(!G||!P||G.phase=='replay')return;const desk=!TOUCH()||padOn;
 if(desk&&userQB()){P.off.forEach((r,i)=>{if(i<1||i>5||(i>3&&!r.route.length)||r.gone)return;const s=P2(r.x,r.y),y=s[1]-46*scY(r.y),t=padOn?PADR[i-1]:String(i);
  X.fillStyle=padOn?['#16a34a','#dc2626','#2563eb','#ca8a04','#475569'][i-1]:'#0b1626e6';X.beginPath();X.arc(s[0],y,9,0,7);X.fill();X.strokeStyle='#fff';X.lineWidth=1.5;X.stroke();X.fillStyle='#fff';X.font=`bold ${t.length>1?8:11}px sans-serif`;X.textAlign='center';X.fillText(t,s[0],y+4);X.textAlign='left'})}
 if(mthrow()&&userQB()&&mouseS&&!P.aim){const q=P.off[0],[x,y]=unproj(mouseS[0],mouseS[1]),rg=34+(q.sk.str-60)*.7;let dx=x-q.x,dy=y-q.y;const m=Math.hypot(dx,dy);if(m>rg){dx*=rg/m;dy*=rg/m}
  const tx=q.x+dx,ty=q.y+dy,dd=Math.hypot(dx,dy),pk=Math.min(9,dd*.18),n=Math.max(3,dd/1.5|0);X.fillStyle='#ffffffcc';for(let k=1;k<=n;k++){const f=k/n,s=P2(q.x+dx*f,q.y+dy*f,1.2+4*pk*f*(1-f));X.beginPath();X.arc(s[0],s[1],2,0,7);X.fill()}gring(tx,ty,.9,'#fff',2)}
 C.style.cursor=mthrow()&&userQB()?'crosshair':'';
 const kl=$('keys'),pre=G.phase=='pre'||!!G.ch,kt=feat('keyhint')&&(!TOUCH()||padOn)&&$('modal').hidden?keyHint():'';if(kl){const v=pre?kt:'';if(kl.textContent!==v)kl.textContent=v}
 {const kh=$('kh'),v=!pre&&kt&&G.phase!='kick'?kt:'';if(kh&&kh.textContent!==v)kh.textContent=v}}
function keyHint(){const u=G.poss=='U',b=P.b,pad=padOn;if(G.ch||G.phase=='post'||G.phase=='over')return'';
 if(G.phase=='kick')return P.kk&&P.kk.u?(pad?'A: stop the meter':'Space or click: stop the meter'):'';
 if(G.phase=='pre'){if(!canCall())return pad?'A: ready':'';return pad?'A snap · LB/RB change play · Back playbook · Y formation · X throw type · Start pause':
  u?'1-9 pick a play · B playbook · click a receiver for a hot route · P replay · Esc pause':'1-9 pick a defense · B playbook · click a defender to control him · Esc pause'}
 if(G.phase!='play')return'';
 if(u){if(userQB())return pad?'A B X Y RB throw to that receiver · LB pump fake':'Pull back to aim, let go to throw · right-click to pump fake · 1-5 quick throw';
  if(b.st=='carry'&&(!CAR()||b.c.pid===R.me))return pad?'A juke · B spin · X truck · Y hurdle':'Arrows / WASD to run · Space to juke';return''}
 if(cd&&cd.eng)return pad?'Shed the block: A B X Y':'Shed the block with 1-4';
 return pad?'A switch · B hit stick · X intercept · Y swat · RB press':'Arrows / WASD to move · click a defender to switch'}
// ---------- fullscreen and the controls page ----------
(()=>{const t=$('top');if(t&&t.insertAdjacentHTML){t.insertAdjacentHTML('afterbegin','<button id="fsb" title="Fullscreen (F11 also works)">Fullscreen</button>');$('fsb').onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}}}})();
addEventListener('fullscreenchange',()=>{const b=$('fsb');if(b)b.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';setTimeout(fit,100)});
function ctlPage(){const row=(a,b,c)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td><td>${c}</td></tr>`;$('modal').hidden=0;
 $('modal').innerHTML=`<div class="pg"><h1>Controls</h1><p class="small">Keyboard and mouse, or plug in a controller (Xbox or PlayStation) and press any button.</p>
 <table class="ctl"><tr><th>Action</th><th>Keyboard / mouse</th><th>Controller</th></tr>
 <tr><td colspan="3" class="sec">Before the snap</td></tr>${row('Pick a play or defense','1-9 (or click a card)','LB / RB')}${row('Open the playbook','B','Back / Select')}${row('Snap','Enter or the Snap button, or pull back on the field (pass) / click your RB (run)','A')}${row('Choose (extra point / 2, touchback / return, deep / onside)','1 / 2','A / B')}
 ${row('Formation','O','Y')}${row('Throw type (normal, bullet, lob)','T','X')}${row('Hurry-up','H','')}${row('Hot route','Click a receiver','')}${row('Switch defender','Space, or click him','B')}${row('Watch the last play again','P','')}${row('Pause / lobby','Esc','Start')}
 <tr><td colspan="3" class="sec">Passing</td></tr>${row('Throw to a receiver','1 2 3 4 5 (numbers over their heads)','A B X Y RB')}${row('Aim and throw','Drag back and let go (or point and click, see Game features)','')}${row('Pump fake','Space or right-click','LB')}${row('Move / scramble','Arrows or WASD','Left stick')}${row('Juke a rusher','Q / E','')}
 <tr><td colspan="3" class="sec">With the ball</td></tr>${row('Run','Arrows or WASD','Left stick')}${row('Juke','Space (Q/E for a direction)','A')}${row('Spin / truck / hurdle','Z / X / C','B / X / Y')}${row('QB slide','V','RB')}
 <tr><td colspan="3" class="sec">Defense</td></tr>${row('Move','Arrows or WASD','Left stick')}${row('Switch player','Space','A')}${row('Intercept (time it)','E','X')}${row('Hit stick','F','B')}${row('Swat','R','Y')}${row('Press at the line','G','RB')}${row('Shed a block','1 bull, 2 swim, 3 rip, 4 spin','A / B / X / Y')}
 <tr><td colspan="3" class="sec">Kicking</td></tr>${row('Stop the power meter, then the accuracy needle','Space or click','A')}
 <tr><td colspan="3" class="sec">Career mode receiver</td></tr>${row('Head fake / burst / release','Z / X / C','A / B / X')}</table>
 <div class="grid"><button class="big" onclick="$('modal').hidden=1">Back to the game</button></div></div>`}
$('hlp').onclick=ctlPage;
(()=>{const pl=$('plays');if(pl&&pl.insertAdjacentHTML)pl.insertAdjacentHTML('afterend','<div id="keys"></div>')})();

// ---------- laptop / desktop layout: one bottom action bar, Snap button on offense ----------
(()=>{if(TOUCH())return;const bar=$('bar'),mv=$('mv');if(bar&&mv&&bar.appendChild){bar.insertAdjacentHTML('afterbegin','<div id="kh"></div>');bar.appendChild(mv)}
 document.body.classList.add('desk')})();
{const _ui=ui;ui=function(){_ui();try{if(TOUCH()||!G||!P)return;const u=G.poss=='U';
 if(G.phase=='pre'&&!G.ch&&u&&qbIsMe()&&!(CAR()&&!myUnitOn())){showEl('snap',1);$('snap').textContent='Snap'}
 const h=$('hint');if(h&&/pull back on the field to snap/.test(h.textContent))h.textContent=h.textContent.replace('pull back on the field to snap, then aim and let go to throw','pull back on the field to snap, then aim and let go to throw (or press Enter)');
 const pl=$('plays');if(pl&&G.phase=='pre'&&!G.ch&&pl.querySelector('[data-a="punt"],[data-a="fakep"]')&&!pl.querySelector('.sep'))pl.insertAdjacentHTML('beforeend','<i class="sep"></i>')}catch(e){console.error(e)}}}
