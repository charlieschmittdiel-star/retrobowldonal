'use strict';
// Extras: an interactive tutorial, shot charts, advanced stats on player pages, and a better pause menu.
{const add=[['Help','tut2','Interactive tutorial','A practice game that walks you through moving, shooting, passing, layups, defense and play calls.'],
 ['Presentation','shotc','Shot charts','Where every shot came from, made and missed, in the pause menu and after the game.'],
 ['Presentation','adv','Advanced stats','True shooting, effective FG%, per-36 numbers and game score on player pages.'],
 ['Presentation','lobby2','Better pause menu','The pause menu shows the score by quarter, team stats and the top players so far.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
// ---------- the tutorial ----------
const TUT=[['Move your player with W A S D (or the arrow keys).','move'],['Hold Space to start your shot and let go when the meter reaches the green.','shot'],['Press E to pass to the most open teammate (or 1-5 for a position).','pass'],
 ['Drive toward the basket and press Space near the rim for a layup or dunk.','rim'],['Now defend. Stay between your man and the basket. Press E to try a steal or Space to jump and contest.','def'],['Press Tab (or Q) to switch to the defender closest to the ball.','switch'],
 ['Change the play: C for your offense, V for your defense, X for the coach\'s suggestion.','calls'],['That\'s it! Press Esc any time for the menu, timeouts, substitutions and replays.','done']];
function tutStart(){if(!R)return;const opp=R.t.map((_,i)=>i).filter(i=>i).sort((a,b)=>teamOvr(a)-teamOvr(b))[0];newGame(0,opp,{qlen:12});G.diff=0;G.tut={i:0,mv:0,t:0};G.tutor=1;G.intro=0;
 $('ui').hidden=true;$('gamewrap').hidden=false;closeModal();hResize();runLoop()}
function tutDone(k){if(!G||!G.tut)return;const T=G.tut,step=TUT[T.i];if(!step||step[1]!==k)return;T.i++;T.t=0;G.ev.push('swish');if(TUT[T.i]&&TUT[T.i][1]=='def'&&G.poss===0){const b=G.b;if(b.st=='held')turnover(b.h,'Switch sides: time to defend')}}
{const _hk=hKey;hKey=function(code,down){const T=G&&G.tut;const r=_hk(code,down);if(T&&down){if(code=='Tab'||code=='KeyQ'&&G.poss===1)tutDone('switch');if(code=='KeyC'||code=='KeyV'||code=='KeyX')tutDone('calls');if(G.poss===1&&(code=='KeyE'||code=='Space'))tutDone('def')}return r}}
{const _s=shoot;shoot=function(e,q){const b=G&&G.b;const was=b&&b.st;_s(e,q);if(G&&G.tut&&e===G.ctl&&G.b.st=='shot'&&was=='held'){if(G.b.typ=='rim'||G.b.typ=='dunk')tutDone('rim');else tutDone('shot')}}}
{const _p=passTo;passTo=function(e,r,l){_p(e,r,l);if(G&&G.tut&&e===G.ctl&&G.b.st=='pass')tutDone('pass')}}
{const _st=hStep;hStep=function(dt){_st(dt);const T=G&&G.tut;if(!T)return;T.t+=dt;const e=G.ctl;if(e&&TUT[T.i]&&TUT[T.i][1]=='move'){T.mv+=Math.hypot(e.vx,e.vy)*dt*(G.ctlInput?1:0);if(T.mv>20)tutDone('move')}
  // steps that need the ball: if the other team has it for a few seconds, hand it back so nobody waits around
  if(TUT[T.i]&&['shot','pass','rim'].includes(TUT[T.i][1])&&G.phase=='live'){const b=G.b;if(b.st=='held'&&b.h.t===1||b.st=='loose'){T.nb=(T.nb||0)+dt;if(T.nb>3){T.nb=0;try{giveBall(0,'top')}catch(x){}}}else if(b.st=='held'&&b.h.t===0&&b.h!==G.ctl){T.nb=(T.nb||0)+dt;if(T.nb>2){T.nb=0;G.ctl=b.h}}else T.nb=0}
  if(TUT[T.i]&&TUT[T.i][1]=='def'&&G.phase=='live'){if(G.poss===0){T.nd=(T.nd||0)+dt;if(T.nd>3){T.nd=0;try{giveBall(1,'top')}catch(x){}}}else T.nd=0}
  if(TUT[T.i]&&TUT[T.i][1]=='done'&&T.t>4){G.tut=null;G.paused=true;modal(`<h2>Tutorial complete</h2><p>You know the basics. Play a real game from the home page whenever you're ready.</p>${B('tutQuit()','Back to the menu','big')}`)}}}
function tutQuit(){G=null;if(LOOP)cancelAnimationFrame(LOOP);LOOP=null;closeModal();homeUI()}
{const _dh=drawHUD;drawHUD=function(){_dh();const T=G&&G.tut;if(!T||!TUT[T.i]||G.rp)return;try{const t=TUT[T.i][0],cx=VW/2;CX.font='700 16px system-ui';const w=Math.min(VW-40,CX.measureText(t).width+40);CX.fillStyle='rgba(194,65,12,.95)';CX.fillRect(cx-w/2,110,w,40);CX.fillStyle='#fff';CX.textAlign='center';CX.textBaseline='middle';CX.fillText(t,cx,130);
  CX.font='600 11px system-ui';CX.fillText(`Step ${T.i+1} of ${TUT.length}`,cx,160)}catch(x){}}}
{const _gm=gameMenu;gameMenu=function(){_gm();try{if(G&&G.tutor){const r=$('modal').querySelector('.row');if(r)r.innerHTML=B("closeModal();G.paused=false",'Back to the tutorial','big')+B('tutQuit()','Quit the tutorial')}}catch(e){}}}
// a tutorial game never counts
{const _eu=endUI;endUI=function(){if(G&&G.tutor)return tutQuit();return _eu()}}
{const _ku=keysUI;keysUI=function(){_ku();try{if(feat('tut2')&&R){const m=$('mainpg');if(m)m.insertAdjacentHTML('beforeend',`<div class="card"><h3>Practice</h3><p>A guided practice game. Nothing counts.</p>${B('tutStart()','Start the tutorial','big')}</div>`)}}catch(e){}}}
{const _hu=homeUI;homeUI=function(){_hu();try{if(feat('tut2')&&R&&!OPT.tutSeen&&!R.stage&&R.day===0&&!(typeof CAREER=='function'&&CAREER())){const m=$('mainpg'),hd=m&&m.querySelector('.head');if(hd)hd.insertAdjacentHTML('afterend',`<div class="card"><h3>New to Hardwood Lab?</h3><p>Try a quick guided practice first.</p>${B('OPT.tutSeen=1;optSave();tutStart()','Start the tutorial','big')}${B('OPT.tutSeen=1;optSave();homeUI()','No thanks')}</div>`)}}catch(e){}}}
// ---------- shot charts ----------
{const _s=shoot;shoot=function(e,q){const was=G&&G.b&&G.b.st;_s(e,q);if(G&&!G.viewer&&was=='held'&&G.b.st=='shot'&&G.b.sh===e){(G.shots=G.shots||[]).push({k:e.t,x:e.x,y:e.y,hx:G.b.hx,m:null,id:e.p.id,three:G.b.pts==3});G.b.shotRef=G.shots[G.shots.length-1]}}}
{const _sl=shotLand;shotLand=function(){const b=G.b,ref=b.shotRef,k=b.sh.t,pre=G.sc[k];_sl();if(ref)ref.m=G.sc[k]>pre&&!b.foul?1:b.foul&&G.sc[k]>pre?1:b.foul?null:0}}
{const _bs=ballStep;ballStep=function(dt){const b=G.b;_bs(dt);if(b.st=='shot'&&b.blk&&G.b!==b&&b.shotRef)b.shotRef.m=0}}
function shotSVG(k){const L=(G.shots||[]).filter(s=>s.k===k&&s.m!=null);const W=300,H=282,sc=W/50;// half court, baseline at the top
 const pt=s=>{const d=s.hx>47?s.hx-s.x:s.x-s.hx,depth=clamp(d+5.25,0,47),lat=s.hx>47?s.y:50-s.y;return[lat*sc,depth*sc]};
 const arc=[];for(let a=-1.18;a<=1.18;a+=.05){arc.push([(25+Math.sin(a)*23.75)*sc,(5.25+Math.cos(a)*23.75)*sc])}
 return`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="background:#d6a565;border-radius:8px"><rect x="${17*sc}" y="0" width="${16*sc}" height="${19*sc}" fill="#00000018" stroke="#fff"/><circle cx="${25*sc}" cy="${5.25*sc}" r="5" fill="none" stroke="#f97316" stroke-width="2"/>
 <polyline points="${[[3*sc,0],[3*sc,14.2*sc]].concat(arc.filter(p=>p[1]>14.2*sc||true)).concat([[47*sc,14.2*sc],[47*sc,0]]).map(p=>p.join(',')).join(' ')}" fill="none" stroke="#fff"/>
 ${L.map(s=>{const [x,y]=pt(s);return s.m?`<circle cx="${x}" cy="${y}" r="4.5" fill="#16a34a" stroke="#fff"/>`:`<text x="${x}" y="${y+4}" text-anchor="middle" font-size="12" font-weight="900" fill="#b91c1c">×</text>`}).join('')}</svg>`}
function shotChartsHTML(){if(!feat('shotc')||!G)return'';G.shots=G.shots||[];return`<div class="cols">${[0,1].map(k=>{const L=G.shots.filter(s=>s.k===k&&s.m!=null),m=L.filter(s=>s.m).length;return`<div><h3>${esc(R.t[G.tm[k]].n)} <small>${m}/${L.length}</small></h3>${shotSVG(k)}</div>`}).join('')}</div>`}
{const _eu=endUI;endUI=function(){_eu();try{if(feat('shotc')&&G&&G.shots){const box=$('modal').querySelector('.mbox'),d=box.querySelector('details');const h=`<details><summary>Shot charts</summary>${shotChartsHTML()}</details>`;if(d)d.insertAdjacentHTML('beforebegin',h);else{const h2=box.querySelector('h2');if(h2)h2.insertAdjacentHTML('afterend',h)}}}catch(e){console.error(e)}}}
// ---------- the better pause menu ----------
{const _gm=gameMenu;gameMenu=function(){_gm();try{if(!G||G.tutor)return;const box=$('modal').querySelector('.mbox'),row=box.querySelector('.row');if(feat('shotc')&&row)row.insertAdjacentHTML('beforeend',B("modal('<h2>Shot charts</h2>'+shotChartsHTML()+B('closeModal();G.paused=false','Back to the game','big'))",'Shot charts'));
  if(!feat('lobby2'))return;const r=gameResult(),tot=k=>r.res.T[k].box.reduce((a,b)=>b.map((v,i)=>v+(a[i]||0)),[]),A=tot(0),Bx=tot(1),pc=(m,a)=>a?Math.round(m/a*100)+'%':'-';
  const top=k=>r.res.T[k].ps.map((p,i)=>[p,r.res.T[k].box[i]]).sort((a,b)=>gsc(b[1])-gsc(a[1]))[0];const qs=G.qs||[[],[]];
  const html=`<div class="cols"><div class="card"><table class="t"><tr><th></th>${[0,1,2,3].map(i=>`<th>Q${i+1}</th>`).join('')}<th>T</th></tr>${[r.a,r.b].map(t=>{const k=G.tm.indexOf(t),Q=qs[k]||[];const cur=G.sc[k]-Q.reduce((a,b)=>a+b,0);return`<tr><td>${esc(R.t[t].ab)}</td>${[0,1,2,3].map(i=>`<td>${i<Q.length?Q[i]:i==Q.length?cur:'-'}</td>`).join('')}<td><b>${G.sc[k]}</b></td></tr>`}).join('')}</table>
   <p class="small">FG ${pc(A[SI.fgm],A[SI.fga])} vs ${pc(Bx[SI.fgm],Bx[SI.fga])} · 3PT ${A[SI.tpm]}-${A[SI.tpa]} vs ${Bx[SI.tpm]}-${Bx[SI.tpa]} · REB ${A[SI.orb]+A[SI.drb]} vs ${Bx[SI.orb]+Bx[SI.drb]} · TO ${A[SI.tov]} vs ${Bx[SI.tov]}</p></div>
   <div class="card">${[0,1].map(k=>{const t=top(k);return t?`<p>${feat('faces')?faceSVG(t[0],34):''} <b>${esc(t[0].n)}</b> (${esc(R.t[r.res.T[k].t].ab)}): ${t[1][SI.pts]} pts, ${t[1][SI.orb]+t[1][SI.drb]} reb, ${t[1][SI.ast]} ast</p>`:''}).join('')}</div></div>`;
  const p=box.querySelector('p');if(p)p.insertAdjacentHTML('afterend',html)}catch(e){console.error(e)}}}
// ---------- advanced stats ----------
function advOf(ss){const g=Math.max(1,ss[SI.gp]),min=Math.max(1,ss[SI.min]),fga=ss[SI.fga],fta=ss[SI.fta],pts=ss[SI.pts];return{ts:fga+fta?pts/(2*(fga+.44*fta))*100:0,efg:fga?(ss[SI.fgm]+.5*ss[SI.tpm])/fga*100:0,p36:pts/min*36,r36:(ss[SI.orb]+ss[SI.drb])/min*36,a36:ss[SI.ast]/min*36,gs:gsc(ss)/g,tov:ss[SI.tov]/g,ft:fta?ss[SI.ftm]/fta*100:0}}
{const _pu=playerUI;playerUI=function(id){_pu(id);try{if(!feat('adv'))return;const p=R.pl.find(q=>q.id===id);if(!p||!p.ss[SI.gp])return;const a=advOf(p.ss),m=$('modal').querySelector('.mbox');const h3=[...m.querySelectorAll('h3')].find(h=>h.textContent=='Stats');
  if(h3)h3.insertAdjacentHTML('beforebegin',`<h3>Advanced (this season)</h3><div class="grid3 adv"><div><small>True shooting</small><b>${a.ts.toFixed(1)}%</b></div><div><small>Effective FG</small><b>${a.efg.toFixed(1)}%</b></div><div><small>Game score</small><b>${a.gs.toFixed(1)}</b></div><div><small>Points per 36</small><b>${a.p36.toFixed(1)}</b></div><div><small>Rebounds per 36</small><b>${a.r36.toFixed(1)}</b></div><div><small>Assists per 36</small><b>${a.a36.toFixed(1)}</b></div></div>`)}catch(e){console.error(e)}}}
{const _lu=leadUI;leadUI=function(){_lu();try{if(!feat('adv'))return;const m=$('mainpg'),g=m&&m.querySelector('.grid3');if(!g)return;const min=Math.max(1,Math.floor(R.day*.5)),el=R.pl.filter(p=>p.tid>=0&&p.ss[SI.gp]>=min&&p.ss[SI.fga]>=min*5);
  const L=(n,f,fmt)=>`<div class="card"><h3>${n}</h3><table class="t">${el.slice().sort((a,b)=>f(b)-f(a)).slice(0,10).map((p,i)=>`<tr class="${p.tid===0?'me':''}"><td>${i+1}</td><td>${plink(p)}</td><td>${esc(R.t[p.tid].ab)}</td><td><b>${fmt(f(p))}</b></td></tr>`).join('')}</table></div>`;
  g.insertAdjacentHTML('beforeend',L('True shooting %',p=>advOf(p.ss).ts,v=>v.toFixed(1)+'%')+L('Game score',p=>advOf(p.ss).gs,v=>v.toFixed(1)))}catch(e){console.error(e)}}}
