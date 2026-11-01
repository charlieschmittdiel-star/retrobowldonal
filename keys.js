'use strict';
// Better keyboard layout. Every move sits around WASD so one hand can run and the other (or a thumb) can do moves:
// Space is the main move (juke, pump fake, switch player), F is the power move (stiff arm, hit stick),
// R is the spin/trick move, Shift goes to the ground (QB slide, diving tackle). The old keys still work where they
// don't clash, and every action can be changed on the Controls page (or put back to the Classic layout).
const KA=[
 // id, context, name, the key the game listens for, recommended key, extra old keys that still work
 ['juke','car','Juke',' ',' '],['jukeL','car','Juke left','q','q'],['jukeR','car','Juke right','e','e'],
 ['spin','car','Spin','z','r',['z']],['stiff','car','Stiff arm','r','f'],['truck','car','Truck','x','g',['x']],['hurdle','car','Hurdle','c','c'],['slide','car','QB slide (scrambling QB)','v','shift',['v']],
 ['pump','qb','Pump fake',' ',' '],['qjL','qb','Juke a rusher left','q','q'],['qjR','qb','Juke a rusher right','e','e'],['ttype','qb','Throw type (normal / bullet / lob)','t','t'],['qslide','qb','QB slide','v','shift',['v']],
 ['switch','def','Switch player',' ',' '],['int','def','Intercept (time it)','e','e'],['hit','def','Hit stick','f','f'],['swat','def','Swat','r','r'],['press','def','Press at the line','g','q',['g']],['dive','def','Diving tackle','v','shift',['v']],
 ['fake','wr','Head fake (career receiver)','z','r',['z']],['burst','wr','Burst','x','f',['x']],['rel','wr','Release','c','c']];
const KN=k=>k==' '?'Space':k=='shift'?'Shift':k=='control'?'Ctrl':k=='alt'?'Alt':k=='tab'?'Tab':k.startsWith('arrow')?k.slice(5,6).toUpperCase()+k.slice(6)+' arrow':k.length==1?k.toUpperCase():k[0].toUpperCase()+k.slice(1);
const KBAD=new Set(['escape','enter','arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','b','p','h','o','1','2','3','4','5','6','7','8','9','0','meta','capslock']);
function kbBind(a){const kb=OPT.kb||{};if(kb[a[0]])return kb[a[0]];return OPT.kbp=='classic'?a[3]:a[4]}
function kbCtx(){if(!G||!P||!$('modal').hidden||typeof autoMode=='function'&&autoMode())return null;const b=P.b,u=G.poss=='U';
 if(!u&&(G.phase=='play'||G.phase=='pre'))return 'def';if(!u||G.phase!='play')return null;const me=CAR()?careerMe():null;
 if(b.st=='carry'&&(!CAR()||b.c===me))return 'car';if(b.st=='qb'&&qbIsMe())return 'qb';if(CAR()&&me&&P.off.includes(me)&&me!==P.off[0])return 'wr';return null}
function kbMap(ctx){const m={},A=KA.filter(a=>a[1]==ctx),bound=new Set(A.map(kbBind));A.forEach(a=>{m[kbBind(a)]=a[3]});
 if(OPT.kbp!='classic')A.forEach(a=>(a[5]||[]).forEach(k=>{if(!bound.has(k)&&!(k in m))m[k]=a[3]}));A.forEach(a=>{if(!(a[3] in m))m[a[3]]=null});return m}
let KBW=null;
addEventListener('keydown',e=>{const k=e.key.toLowerCase(),tg=e.target&&e.target.tagName;
 if(KBW){e.preventDefault();e.stopImmediatePropagation();if(k=='escape'){KBW=null;return ctlPage()}if(KBAD.has(k)){KBW.msg=`${KN(k)} is used for something else. Pick another key.`;return ctlPage()}kbSet(KBW.id,k);KBW=null;return ctlPage()}
 if(tg=='INPUT'||tg=='SELECT'||tg=='TEXTAREA')return;const ctx=kbCtx();if(!ctx)return;const m=kbMap(ctx);if(!(k in m))return;const to=m[k];if(to===k)return;
 e.preventDefault();e.stopImmediatePropagation();if(to!=null&&!e.repeat)hit(to)},true);
function kbSet(id,k){const a=KA.find(x=>x[0]==id);if(!a)return;OPT.kb=OPT.kb||{};const old=kbBind(a);KA.filter(x=>x[1]==a[1]&&x[0]!=id&&kbBind(x)==k).forEach(x=>{OPT.kb[x[0]]=old});OPT.kb[id]=k;optSave();kbCss()}
function kbPreset(p){OPT.kbp=p;OPT.kb={};optSave();kbCss();ctlPage()}
// key badges on the on-screen buttons follow the layout
let kbEl=null;function kbCss(){if(!kbEl){kbEl=document.createElement('style');document.head.appendChild(kbEl)}const r=[],b=(sel,id)=>{const a=KA.find(x=>x[0]==id);if(a)r.push(`body.desk ${sel}::before{content:"${KN(kbBind(a))}"}`)};
 b('#mv[data-c="car"] [data-k="z"]','spin');b('#mv[data-c="car"] [data-k="x"]','truck');b('#mv[data-c="car"] [data-k="c"]','hurdle');b('#mv[data-c="car"] [data-k="r"]','stiff');b('#mv [data-k="v"]','slide');b('#mv [data-k="t"]','ttype');b('#mv [data-k="q"]','qjL');b('#mv [data-k="e"]','qjR');
 b('#mv[data-c="wr"] [data-k="z"]','fake');b('#mv[data-c="wr"] [data-k="x"]','burst');b('#mv[data-c="wr"] [data-k="c"]','rel');
 b('#dctl [data-k=" "]','switch');b('#dctl [data-k="e"]','int');b('#dctl [data-k="f"]','hit');b('#dctl [data-k="r"]','swat');b('#dctl [data-k="g"]','press');b('#dctl [data-k="v"]','dive');kbEl.textContent=r.join('\n')}
kbCss();
{const _mb=moveBar;moveBar=function(...a){const r=_mb.apply(this,a);try{const el=$('mv');if(el){const c=kbCtx();el.dataset.c=c||''}}catch(e){}return r}}
// the in-game tips and feature descriptions use the current keys
{const kb=id=>KN(kbBind(KA.find(x=>x[0]==id)));const _d=TIPS.def,_c=TIPS.carry;
 TIPS.def=()=>TOUCH()?_d():`On defense: click a defender (or ${kb('switch')}) to control him, pick a defense, then press Snap. During the play: ${kb('int')} intercept, ${kb('hit')} hit stick, ${kb('swat')} swat, ${kb('press')} press, ${kb('dive')} dive.`;
 TIPS.carry=()=>TOUCH()?_c():`You have the ball: arrows or WASD to run, ${kb('juke')} to juke (${kb('jukeL')}/${kb('jukeR')} for a direction), ${kb('spin')} spin, ${kb('stiff')} stiff arm, ${kb('truck')} truck, ${kb('hurdle')} hurdle.`;
 const fx=(key,f)=>{const x=FEATS.find(y=>y[1]==key);if(x)x[3]=f(x[3])};fx('divetk',t=>t.replace('Press V (LB on a controller)','Press Shift (LB on a controller)'));fx('slide',t=>t.replace('or V)','or Shift)'))}
// ---------- the Controls page: every key, and you can change them ----------
function kbPage(){const row=(a,b,c)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td><td>${c}</td></tr>`,pad={juke:'A',spin:'B',truck:'X',hurdle:'Y',slide:'RB',pump:'LB',switch:'A',int:'X',hit:'B',swat:'Y',press:'RB',dive:'LB',fake:'A',burst:'B',rel:'X'};
 const sec=(t,ctx)=>`<tr><td colspan="4" class="sec">${t}</td></tr>`+KA.filter(a=>a[1]==ctx).map(a=>{const w=KBW&&KBW.id==a[0];return`<tr><td>${a[2]}</td><td><kbd>${w?'press a key...':KN(kbBind(a))}</kbd></td><td>${pad[a[0]]||''}</td><td>${B(`KBW={id:'${a[0]}'};ctlPage()`,w?'Waiting...':'Change')}</td></tr>`}).join('');
 const live=G&&G.live,cl=OPT.kbp=='classic',custom=OPT.kb&&Object.keys(OPT.kb).length;$('modal').hidden=0;
 $('modal').innerHTML=`<div class="pg"><h1>Controls</h1><p class="small">Keyboard and mouse, or plug in a controller (Xbox or PlayStation) and press any button. Click <b>Change</b> next to any action, then press the key you want.</p>
 <div class="row"><button class="${!cl&&!custom?'on':''}" onclick="kbPreset('new')">Recommended layout</button><button class="${cl&&!custom?'on':''}" onclick="kbPreset('classic')">Classic layout</button>${custom?'<span class="small dim" style="align-self:center">(with your changes)</span>':''}</div>
 <p class="small">Recommended keeps every move next to WASD: Space is the main move, F the power move, R the spin, Shift goes to the ground, Q and E juke left and right.${cl?'':' The old keys (Z, X, V, G) still work too.'}</p>${KBW&&KBW.msg?`<p class="warn">${KBW.msg}</p>`:''}
 <table class="ctl"><tr><th>Action</th><th>Keyboard</th><th>Controller</th><th></th></tr>
 <tr><td colspan="4" class="sec">Before the snap</td></tr>${row('Pick a play or defense','1-9 (or click a card)','LB / RB')}${row('Open the playbook','B','Back / Select')}${row('Snap','Enter or the Snap button, or pull back on the field (pass) / click your RB (run)','A')}${row('Formation','O','Y')}${row('Hurry-up','H','')}${row('Hot route','Click a receiver','')}${row('Defensive disguise','X','')}${row('Watch the last play again','P','')}${row('Pause / lobby','Esc','Start')}
 <tr><td colspan="4" class="sec">Passing</td></tr>${row('Throw to a receiver','1 2 3 4 5 (numbers over their heads)','A B X Y RB')}${row('Aim and throw','Drag back and let go','')}${row('Move / scramble','Arrows or WASD','Left stick')}${sec('','qb').replace('<tr><td colspan="4" class="sec"></td></tr>','')}
 ${sec('With the ball','car')}${sec('Defense','def')}<tr><td>Shed a block</td><td><kbd>1 bull, 2 swim, 3 rip, 4 spin</kbd></td><td>A / B / X / Y</td><td></td></tr>
 <tr><td colspan="4" class="sec">Kicking</td></tr>${row('Stop the power meter, then the accuracy needle','Space or click','A')}${sec('Career mode receiver','wr')}</table>
 <div class="grid"><button class="big" onclick="KBW=null;${live?"$('modal').hidden=1":'lobby()'}">${live?'Back to the game':'Back'}</button></div></div>`}
ctlPage=kbPage;$('hlp').onclick=()=>ctlPage();
{const _st=settingsUI;settingsUI=function(...a){const r=_st.apply(this,a);try{const h=$('modal').querySelector('h1');if(h)h.insertAdjacentHTML('afterend',`<p>${B('ctlPage()','Keyboard controls')} <span class="small dim">See every key and change them.</span></p>`)}catch(e){}return r}}
