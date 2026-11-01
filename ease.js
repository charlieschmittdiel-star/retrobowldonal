'use strict';
// Ease of use: an interactive 5-step tutorial (it never counts in your league), a game speed setting and a
// bigger text option. The tutorial has its own switch; speed and text size are settings on the Game features page.
{const a=['Help','tut','Interactive tutorial','A guided 5-step practice: passing, running, moves, defense and kicking. Start it from the Tutorial page (or the card on the home screen). It never counts in your league.'];
 if(!FEATS.some(f=>f[1]==a[1])){let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)}}
(()=>{const ins=(a,after,item)=>{if(a.some(x=>x[0]==item[0]))return;const i=a.findIndex(x=>x[0]==after);a.splice(i<0?a.length:i+1,0,item)};ins(NAVF,'prac',['tut','tutUI()','Tutorial'])})();
// ---------- the tutorial ----------
const TS=[{t:'Throw a pass',s:'U',l:30,p:'Slants',
  k:'Click and hold on the field, drag <b>back</b> (away from where you want the ball to go), then let go to throw. Or press <b>1-5</b> to throw straight to that receiver. The white cone is what your QB sees: throws inside it are accurate. <b>Goal: complete a pass.</b>',
  m:'Touch and hold the field, drag <b>back</b> (away from your target) and let go to throw. Or tap a receiver\'s number. The white cone is what your QB sees. <b>Goal: complete a pass.</b>',
  ok:r=>r.rec&&(r.k=='tackle'||r.k=='td')},
 {t:'Run the ball',s:'U',l:30,p:'Run',k:'This is a run play. After the handoff, steer with the <b>arrow keys</b> or <b>WASD</b>. Follow the yellow arrow toward the open lane. <b>Goal: gain 4 yards.</b>',m:'This is a run play. After the handoff, steer with the on-screen stick. Follow the yellow arrow toward the open lane. <b>Goal: gain 4 yards.</b>',
  ok:r=>r.run&&(r.k=='td'||(r.k=='tackle'&&r.g>=4))},
 {t:'Make a move',s:'U',l:30,p:'Run',k:'While running, press <b>Space</b> to juke, <b>Z</b> to spin, <b>X</b> to truck or <b>C</b> to hurdle. <b>Goal: use any move on a run.</b>',m:'While running, tap the move buttons (juke, spin, truck, hurdle). <b>Goal: use any move on a run.</b>',
  ok:r=>r.mv&&(r.k=='tackle'||r.k=='td')},
 {t:'Play defense',s:'C',l:35,p:'',k:'You control the defender with the <b>yellow ring</b> (click another one, or press Space, to switch). Move with the arrow keys and chase the ball. <b>F</b> is a big hit, <b>V</b> is a dive and <b>E</b> jumps for an interception. Press <b>Enter</b> to snap. <b>Goal: hold them under 5 yards.</b>',
  m:'You control the defender with the <b>yellow ring</b> (tap another to switch). Use the stick to chase the ball, and the Hit stick, Dive and Intercept buttons. Tap Snap to start. <b>Goal: hold them under 5 yards.</b>',ok:r=>r.int||(r.k!='td'&&r.g<5)},
 {t:'Kick a field goal',s:'U',l:88,p:'',kick:1,k:'Press <b>Space</b> (or click) to stop the power meter, then press it again when the needle is in the <b>green</b>. <b>Goal: make the field goal.</b>',m:'Tap to stop the power meter, then tap again when the needle is in the <b>green</b>. <b>Goal: make the field goal.</b>',ok:r=>r.fg}];
function tutUI(){VW.page='tut';if(CAR())return modal(`${nav()}<h1>Tutorial</h1><p>The tutorial runs in franchise mode, where you call the plays. Switch modes in Settings to try it.</p>`);
 if(!feat('tut'))return modal(`${nav()}<h1>Tutorial</h1><p>The tutorial is switched off on the Game features page.</p>`);const done=lsGet('gdtutdone');
 modal(`${nav()}<h1>Tutorial</h1><p>Five quick steps against a practice defense: passing, running, moves, defense and kicking. Each step repeats until you get it (or press Skip). Nothing here counts in your league.</p>
 <div class="dash">${TS.map((s,i)=>card(`Step ${i+1}`,`<div class="big">${s.t}</div>`)).join('')}</div><div class="btns" style="margin-top:14px">${B('tutGo(0)',done?'Take it again':'Start the tutorial','go')}${B('tutGo(3)','Jump to defense')}</div>`)}
function tutGo(i){const o=1,t=R.lg.t[o];autoFill(0);autoFill(o);newGame({n:t.n,r:Math.round(teamR(o)),i:o});G.live=1;G.po='';G.tut={i:i||0,tries:0,fb:''};tutStep();$('modal').hidden=1;tutBox()}
function tutStep(){const s=TS[G.tut.i];G.prac={s:s.s,l:s.l,d:'',p:s.p};G.tut.r={};pracReset();G.pbOpen=false;if(s.s=='U'&&s.p&&allP()[s.p])applyPlay(s.p);G.pbOpen=false;ui();if(s.kick){G.down=4;G.ytg=10;setTimeout(()=>{try{if(G&&G.tut&&G.phase=='pre')doFG()}catch(e){}},400)}tutBox()}
function tutBox(){let b=$('tutbox');if(!G||!G.tut||!G.live){if(b)b.remove();return}if(!b){document.body.insertAdjacentHTML('beforeend','<div id="tutbox"></div>');b=$('tutbox')}const s=TS[G.tut.i];
 b.innerHTML=`<div class="tth"><span>Tutorial · step ${G.tut.i+1} of ${TS.length}</span><b>${s.t}</b></div><p>${TOUCH()?s.m:s.k}</p>${G.tut.fb?`<p class="tfb ${G.tut.ok?'ok':''}">${G.tut.fb}</p>`:''}<div class="ttb"><button onclick="tutSkip()">Skip step</button><button onclick="tutQuit()">Quit</button></div>`}
function tutSkip(){if(!G||!G.tut)return;G.tut.fb='';tutNext()}
function tutNext(){G.tut.i++;G.tut.tries=0;if(G.tut.i>=TS.length)return tutDone();tutStep()}
function tutQuit(){if(G){G.live=0;G.prac=null;G.tut=null;G.phase='over'}tutBox();lobby()}
function tutDone(){lsSet('gdtutdone','1');G.live=0;G.prac=null;G.tut=null;G.phase='over';tutBox();modal(`<h1>Tutorial complete!</h1><p>You know the basics: passing, running, moves, defense and kicking. The <b>Controls</b> button in a game lists every key, and <b>Practice</b> lets you rehearse any situation.</p><div class="btns">${B('lobby()','Back to the lobby','go')}</div>`)}
{const _ep=endPlay;endPlay=function(k,x){const t=G&&G.tut,live=t&&P&&!P.over,L0=P&&P.L,d=G.dir,run=P&&!!P.run,rec=P&&!!P.rec;_ep(k,x);try{if(live&&P.over){const r=t.r;r.k=k;r.g=x!=null&&L0!=null?Math.round((x-L0)*d):0;r.run=run;r.rec=rec;r.done=1}}catch(e){}}}
{const _ir=intReturn;intReturn=function(...a){if(G&&G.tut)G.tut.r.int=1;return _ir.apply(this,a)}}
{const _ke=kEnd;kEnd=function(...a){const r=_ke.apply(this,a);try{if(G&&G.tut&&P.kk&&P.kk.kind=='fg'){G.tut.r.fg=/GOOD/.test(G.msg);G.tut.r.done=1}}catch(e){}return r}}
{const _st=step;step=function(dt){_st(dt);try{if(G&&G.tut&&P&&P.b.st=='carry'){const c=P.b.c;if(c&&(c.jk>0||c.spin>0||c.trk>0||c.hrd>0))G.tut.r.mv=1}}catch(e){}}}
{const _nx=next;next=function(...a){if(G&&G.tut){try{const t=G.tut,s=TS[t.i];if(t.r&&t.r.done){t.tries++;if(s.ok(t.r)){t.ok=1;t.fb='Nice! '+(t.i+1<TS.length?'On to the next step.':'That\'s everything.');return tutNext()}t.ok=0;t.fb=t.tries>=3?'Not quite. Try again, or press Skip step.':'Not quite. Try again.'}tutStep();return}catch(e){console.error(e)}}return _nx.apply(this,a)}}
{const _eg=endGame;endGame=function(...a){if(G&&G.tut){G.tut=null;tutBox()}return _eg.apply(this,a)}}
{const _gl=gameLobby;gameLobby=function(...a){const r=_gl.apply(this,a);try{if(G&&G.tut){const g=$('modal').querySelector('.gmenu,.grid');if(g&&!$('modal').querySelector('[data-tq]'))g.insertAdjacentHTML('afterbegin','<button data-tq="1" onclick="tutQuit()"><em>&#10006;</em>Quit tutorial<span>Back to the lobby</span></button>')}}catch(e){}return r}}
// a card on the home screen for new players
{const _dh=dashHome;dashHome=function(...a){const r=_dh.apply(this,a);try{if(feat('tut')&&!lsGet('gdtutdone')&&!CAR()){const d=$('modal').querySelector('.dash');if(d)d.insertAdjacentHTML('afterbegin',card('New here?','<p>Take the 5-step tutorial: passing, running, moves, defense and kicking. It never counts in your league.</p><div class="btns">'+B('tutGo(0)','Start the tutorial','go')+B("lsSet('gdtutdone','1');lobby()",'No thanks')+'</div>'))}}catch(e){}return r}}
// ---------- game speed ----------
const gSpd=()=>{const v=+OPT.gspd;return v>0?clamp(v,.5,1.5):1};
{const _s=step;step=function(dt,...a){return _s(dt*gSpd(),...a)}}
{const _m=motionStep;motionStep=function(dt,...a){return _m(dt*gSpd(),...a)}}
{const _k=kickTick;kickTick=function(dt,...a){return _k(dt*gSpd(),...a)}}
{const _p=postStep;postStep=function(dt,...a){return _p(dt*gSpd(),...a)}}
// ---------- text size ----------
function txApply(){const v=OPT.txs||'n';document.body.classList.toggle('txl',v=='l');document.body.classList.toggle('txxl',v=='x')}
(()=>{const s=document.createElement('style');s.textContent=`
#tutbox{position:fixed;top:64px;left:50%;transform:translateX(-50%);z-index:9;width:min(560px,92vw);background:#0b1410ee;border:2px solid #ffd84d;border-radius:12px;padding:10px 14px;color:#e8f0ea;box-shadow:0 6px 20px #000a;font:14px/1.4 "Trebuchet MS",sans-serif}
#tutbox .tth span{display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9fc7ad}#tutbox .tth b{font-size:18px;color:#ffd84d}#tutbox p{margin:6px 0}
#tutbox .tfb{color:#fca5a5;font-weight:700}#tutbox .tfb.ok{color:#86efac}#tutbox .ttb{display:flex;gap:8px;justify-content:flex-end}#tutbox button{padding:5px 12px;border-radius:7px;font:600 13px "Trebuchet MS",sans-serif}
body.txl #modal .pg{zoom:1.15}body.txxl #modal .pg{zoom:1.3}
body.txl #pre,body.txl #top,body.txl #bar,body.txl #mv,body.txl #tutbox{zoom:1.12}body.txxl #pre,body.txxl #top,body.txxl #bar,body.txxl #mv,body.txxl #tutbox{zoom:1.25}`;document.head.appendChild(s);try{txApply()}catch(e){}})();
// ---------- the settings, at the top of the Game features page ----------
{const _fu=featUI;featUI=function(...a){const r=_fu.apply(this,a);try{const h=$('modal').querySelector('h1');if(h){const sp=gSpd(),tx=OPT.txs||'n',bt=(on,f,n)=>`<button class="${on?'on':''}" onclick="${f}">${n}</button>`;
 h.insertAdjacentHTML('afterend',`<div class="cardx" style="margin:8px 0 14px"><h4>Game speed</h4><div class="row">${[[.7,'Slow'],[.85,'A bit slower'],[1,'Normal'],[1.15,'Fast']].map(([v,n])=>bt(Math.abs(sp-v)<.01,`OPT.gspd=${v};optSave();featUI()`,n)).join('')}</div><p class="small">Slows down (or speeds up) everything on the field, including the game clock and the kick meter.</p>
 <h4 style="margin-top:12px">Text size</h4><div class="row">${[['n','Normal'],['l','Large'],['x','Extra large']].map(([v,n])=>bt(tx==v,`OPT.txs='${v}';optSave();txApply();featUI()`,n)).join('')}</div><p class="small">Makes menus, buttons and the play-calling bar bigger.</p></div>`)}}catch(e){console.error(e)}return r}}
