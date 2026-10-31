'use strict';
// Game features you can switch off, control settings, first-time tips and the installable (offline) app.
// Loaded after league.js. Settings live in this browser (shared by franchise and career mode).
const FEATS=[
 ['On the field','kick','Playable kicks','Punts, field goals and extra points use a power meter and an accuracy needle. Off: kicks happen instantly.'],
 ['On the field','fakes','Onside kicks and fakes','Onside kicks when you trail, plus fake punts and fake field goals on 4th down.'],
 ['On the field','weather','Weather','Rain, snow and wind. Rain makes the ball slippery, snow slows everyone down, wind pushes kicks and deep passes.'],
 ['On the field','pen','Penalties','False starts, offside, holding, pass interference, roughing the passer and facemasks.'],
 ['On the field','fumble','Live fumbles','Hits can knock the ball loose, and everyone scrambles for it.'],
 ['On the field','throwT','Bullet and lob passes','Pick a fast, low bullet or a high, soft lob (the Throw button, or T).'],
 ['On the field','dive','Diving and toe-tap catches','Receivers lay out for balls just out of reach and tap their toes on the sideline.'],
 ['On the field','slide','QB slides','Your QB can slide to give himself up on a scramble (the Slide button, or V).'],
 ['On the field','hot','Hot routes','Tap a receiver before the snap to change his route.'],
 ['On the field','inj','In-game injuries','Players can get hurt on a hit and miss the rest of the game or longer.'],
 ['On the field','mom','Momentum','Big plays swing momentum, and the team riding it plays a little faster.'],
 ['Presentation','replay','Instant replay','Watch the last play again in slow motion (the Replay button, or P).'],
 ['Presentation','pbp','Play-by-play','A commentary line for every play, saved in each game\'s box score.'],
 ['Presentation','sound','Sound','Crowd noise, hits, whistles and the touchdown horn.'],
 ['Presentation','celeb','Celebrations','Touchdown celebrations.'],
 ['Presentation','unif','Team uniforms','Every team wears its own colors, with white jerseys on the road.'],
 ['Presentation','night','Night games and playoffs','Prime-time games under the lights, and a louder playoff atmosphere.'],
 ['Presentation','names','Numbers and names','Jersey numbers on every player and name tags on the key players.'],
 ['Presentation','fgcam','Field goal camera','A behind-the-kicker view of field goals and extra points.'],
 ['Help','tut','Tips','Short tips the first time you see each part of the game.']];
let OPT={};try{OPT=JSON.parse(lsGet('gdopt'))||{}}catch(e){}
const DEFOFF=new Set(['p2','voice']),feat=k=>OPT[k]==null?!DEFOFF.has(k):OPT[k]!==0;
function optSave(){lsSet('gdopt',JSON.stringify(OPT))}
function optT(k){OPT[k]=feat(k)?0:1;optSave();ctlApply();if(k=='unif'&&G&&G.opp&&typeof uniforms=='function')uniforms();if(k=='sound'&&typeof crowd=='function')crowd(0);featUI()}
function optSet(k,v){OPT[k]=v;optSave();ctlApply();featUI()}
const TOUCH=()=>!!(globalThis.matchMedia&&matchMedia('(pointer:coarse)').matches);
function buzz(ms){if(!feat('vib')||!TOUCH())return;try{if(globalThis.navigator&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
// ---------- controls ----------
function ctlApply(){const b=document.body;if(!b||!b.classList)return;b.classList.toggle('lefty',OPT.lefty===1);
 if(b.style&&b.style.setProperty)b.style.setProperty('--stk',{s:'88px',m:'110px',l:'140px'}[OPT.stk||'m']||'110px')}
ctlApply();
// ---------- the Game features page (in the sidebar next to Settings) ----------
function featUI(){VW.page='feat';const grp={};FEATS.forEach(f=>(grp[f[0]]=grp[f[0]]||[]).push(f));
 const tg=(id,txt,onv)=>`<button class="tg ${onv?'on':''}" onclick="${txt}">${onv?'On':'Off'}</button>`;
 const row=(id,n,d,onv,fn)=>`<div class="feat">${tg(id,fn,onv)}<div><b>${n}</b><span class="small">${d}</span></div></div>`;
 const sz=OPT.stk||'m';
 modal(`${nav()}<h1>Game features</h1><p class="small">Switch off anything you don't like. Changes apply right away; uniforms, weather and night games change from your next game.</p>
 ${Object.keys(grp).map(g=>`<h3>${g}</h3><div class="feats">${grp[g].map(([,id,n,d])=>row(id,n,d,feat(id),`optT('${id}')`)).join('')}</div>`).join('')}
 <div class="btns">${B("TUT={};lsSet('gdtut','{}');featUI()",'Show all the tips again')}</div>
 <h3>Controls</h3><div class="feats">
 <div class="feat"><div class="row">${[['s','Small'],['m','Medium'],['l','Large']].map(([k,n])=>`<button class="${sz==k?'on':''}" onclick="optSet('stk','${k}')">${n}</button>`).join('')}</div><div><b>Joystick size</b><span class="small">On touch screens.</span></div></div>
 ${row('lefty','Left-handed layout','Joystick on the right, action buttons on the left (touch screens).',OPT.lefty===1,`optSet('lefty',${OPT.lefty===1?0:1})`)}
 ${row('vib','Vibration','A short buzz on big hits and scores (phones that support it).',feat('vib'),"optT('vib')")}</div>
 <h3>Install the app</h3><p class="small">Gridiron Lab can be installed like an app and played offline once it has loaded online.</p>
 <div class="btns">${B('appInstall()',instEv?'Install Gridiron Lab':'How to install')}</div><p class="small" id="instx"></p>`)}
[NAVF,NAVC].forEach(a=>{const i=a.findIndex(x=>x[0]=='set');if(!a.some(x=>x[0]=='feat'))a.splice(i<0?a.length:i,0,['feat','featUI()','Game features'])});
{const _set=settingsUI;settingsUI=function(...a){const r=_set.apply(this,a);const h=$('modal').querySelector('h1');if(h)h.insertAdjacentHTML('afterend',`<div class="btns">${B('featUI()','Game features &amp; controls','go')}</div>`);return r}}
{const _gl=gameLobby;gameLobby=function(...a){const r=_gl.apply(this,a);const g=$('modal').querySelector('.grid');if(g)g.insertAdjacentHTML('beforeend',B('featUI()','Game features'));return r}}
// ---------- installable app (PWA) ----------
let instEv=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();instEv=e});
try{if(globalThis.navigator&&navigator.serviceWorker&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
function appInstall(){if(instEv){instEv.prompt();instEv=null;return}const x=$('instx');if(x)x.textContent=/iP(hone|ad|od)/.test(navigator.userAgent||'')?'On iPhone or iPad: tap the Share button in Safari, then "Add to Home Screen".':'In Chrome or Edge: open the browser menu and choose "Install app" (or "Add to Home screen" on Android). It has to be opened from a web address (like GitHub Pages), not from a file on your computer.'}
// ---------- first-time tips ----------
let TUT={};try{TUT=JSON.parse(lsGet('gdtut'))||{}}catch(e){}
const TIPS={
 pass:()=>TOUCH()?'Pass play: pull back on the field like a slingshot to snap. Keep holding to aim, then let go to throw. The white cone is what your QB can see.':'Pass play: drag back on the field to snap, keep holding to aim, let go to throw. The white cone is what your QB can see.',
 run:()=>'Run play: tap your running back to snap and hand him the ball.',
 hot:()=>'Tip: tap a receiver before the snap to change his route (a hot route). Each tap picks the next route.',
 def:()=>TOUCH()?'On defense: tap a defender to control him, pick a defense, then press Snap. During the play use Intercept, Hit stick, Swat and Press.':'On defense: click a defender (or Space) to control him, pick a defense, then press Snap. During the play: E intercept, F hit stick, R swat, G press.',
 carry:()=>TOUCH()?'You have the ball: steer with the joystick, tap the yellow button to juke, and use Spin, Truck and Hurdle.':'You have the ball: arrows or WASD to run, Space to juke, Z spin, X truck, C hurdle.',
 kick:()=>TOUCH()?'Kicking: tap once to stop the power meter, then tap again when the needle is in the green.':'Kicking: press Space or click to stop the power meter, then again when the needle is in the green.',
 onside:()=>'You are behind, so you can try an onside kick. It works about 1 time in 4; if it fails they get the ball in great field position.',
 fourth:()=>'4th down: punt, kick a field goal, go for it, or try a fake.'};
function tipShow(k){if(!feat('tut')||TUT[k]||!$('tip'))return false;const e=$('tip');if(e.style.display=='block')return false;e.dataset.k=k;e.firstElementChild.textContent=TIPS[k]();e.style.display='block';return true}
function tipOK(){const e=$('tip');if(!e)return;TUT[e.dataset.k]=1;lsSet('gdtut',JSON.stringify(TUT));e.style.display='none'}
let tipSig='',tipN=0;
function tipCheck(){if(!G||!P||!G.live||!$('modal').hidden){return}const u=G.poss=='U',car=CAR();let k='';
 if(G.ch&&G.ch.k=='ko')k='onside';
 else if(G.phase=='pre'&&!G.ch&&u&&qbIsMe()&&!(car&&!myUnitOn())){if(!tipSig.startsWith('pre'))tipN++;k=G.down==4&&!TUT.fourth?'fourth':P.run?'run':TUT.pass&&!TUT.hot&&tipN>3&&feat('hot')?'hot':'pass'}
 else if(G.phase=='pre'&&!u&&!car)k='def';
 else if(G.phase=='play'&&u&&P.b.st=='carry'&&!P.kr&&(!car||P.b.c.pid===R.me))k='carry';
 else if(G.phase=='kick'&&P.kk&&P.kk.u)k='kick';
 const sig=G.phase+k;if(sig===tipSig)return;tipSig=sig;if(k)tipShow(k)}
(()=>{const w=$('wrap');if(w&&w.insertAdjacentHTML){w.insertAdjacentHTML('beforeend','<div id="tip"><p></p><button>Got it</button></div>');const b=$('tip').querySelector('button');if(b)b.onclick=tipOK}})();
