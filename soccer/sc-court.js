'use strict';
// On the pitch: tactics (mentality, pressing, width, passing style) with the coach's suggestion, finesse and chip
// shots, end-of-match strategy, in-game injuries, hot streaks, momentum, the halftime team talk, the advantage rule,
// gamepad, touch and 2-player controls, and key hints. Each part has its own switch.
{const add=[['Tactics','tact','Tactics','Set your mentality (park the bus to all-out attack), pressing, width and passing style. C changes mentality and V pressing during a match; the other team sets its own.'],
 ['Tactics','coach','Coach suggestions','Your coach suggests tactics from the matchups on the pitch. Press X to use them.'],
 ['On the pitch','late','End-of-match strategy','Teams that are ahead late keep the ball and slow the game down; teams that are behind throw everyone forward.'],
 ['On the pitch','moves','Finesse and chip shots','Press G for a curled finesse shot. If the keeper is off his line, it becomes a chip.'],
 ['On the pitch','inj2','In-match injuries','Players can get hurt during matches and have to come off.'],
 ['On the pitch','hot','Hot streaks','A player who has scored twice gets a confidence boost; hat-tricks make the news.'],
 ['On the pitch','mom','Momentum','Goals and big chances swing momentum, giving a small lift and a louder crowd.'],
 ['On the pitch','half','Halftime team talk','At halftime, give a team talk and change tactics.'],
 ['On the pitch','rules2','Advantage','The referee lets play go on after a foul if the fouled team keeps the ball.'],
 ['Controls','pad','Gamepad','Play with an Xbox or PlayStation controller.'],
 ['Controls','touch','Touch controls','A joystick and buttons on touch screens.'],
 ['Controls','p2','2-player couch mode','A friend controls the other team on the same keyboard (arrows, / shoot or slide, . pass or tackle, , through ball or switch). Off by default.'],
 ['Help','keyhint','Key hints','Short reminders of the right key at the right moment.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
HDEFOFF.add('p2');
// ---------- tactics ----------
const MENT={park:['Park the bus',{line:-14,shoot:.75,direct:.3,tempo:.9}],def:['Defensive',{line:-7,shoot:.9}],bal:['Balanced',{}],att:['Attacking',{line:7,shoot:1.15,tempo:1.1}],all:['All-out attack',{line:14,shoot:1.35,press:1,tempo:1.2,direct:.3}]};
const PRESS={low:['Low press',{press:-1}],mid:['Medium press',{}],high:['High press',{press:1}]};
const WIDTH={narrow:['Narrow',{width:.82}],norm:['Normal width',{}],wide:['Wide',{width:1.18}]};
const STYLE={short:['Short passing',{direct:-.6,tempo:.92}],mix:['Mixed passing',{}],direct:['Direct, long balls',{direct:.8,tempo:1.12}]};
const MK=Object.keys(MENT),PK=Object.keys(PRESS),WK=Object.keys(WIDTH),SK2=Object.keys(STYLE);
function merge(list){const o=Object.assign({},TM0);list.forEach(m=>{if(!m)return;for(const k in m){if(k=='line'||k=='press'||k=='direct')o[k]+=m[k];else o[k]*=m[k]}});return o}
tacMod=function(k){if(!G||!G.tac)return TM0;const c=G.tac[k],L=[];if(feat('tact')){L.push(MENT[c.m][1],PRESS[c.p][1],WIDTH[c.w][1],STYLE[c.s][1])}if(feat('half')&&G.talk&&G.talk[k]==='demand')L.push({press:1,tempo:1.05});
 if(feat('late')&&clkMin()>78&&G.half==2){const mg=G.sc[k]-G.sc[opp(k)];if(mg>0&&(k===1||G.auto))L.push({tempo:.75,shoot:.8,line:-4});}return L.length?merge(L):TM0};
function coachSug(k){const O=onT(k),D=onT(opp(k)),av=(L,pos,f)=>{const x=L.filter(e=>pos.includes(e.pos));return x.length?x.reduce((a,e)=>a+f(e.p.sk),0)/x.length:60};
 const theirPace=av(D,['ST','WG'],s=>s.spd),ourBack=av(O,['CB','FB'],s=>s.spd),ourWide=av(O,['WG','FB'],s=>s.crs),theirPass=av(D,['CM','CB'],s=>s.shp),ourPass=av(O,['CM'],s=>s.shp),ourAtt=av(O,['ST','WG'],s=>s.fin+s.dri)/2,theirDef=av(D,['CB'],s=>s.tkl+s.mrk)/2;
 const mg=G.sc[k]-G.sc[opp(k)],late=G.half==2&&clkMin()>70,why=[];let m='bal',p='mid',w='norm',st='mix';
 if(late&&mg<0){m=mg<-1?'all':'att';why.push('you need a goal')}else if(late&&mg>0){m='def';why.push('protect the lead')}else if(ourAtt>theirDef+5){m='att';why.push('your forwards are better than their defenders')}else if(theirPace>ourBack+6){m='def';why.push('their forwards are quicker than your back line')}
 if(theirPass<62){p='high';why.push('they struggle to pass under pressure')}else if(theirPace>ourBack+6){p='low';}
 if(ourWide>66){w='wide';why.push('your wide players can cross')}
 st=ourPass>68?'short':ourPass<58?'direct':'mix';if(st=='short')why.push('keep the ball: your midfield can pass');if(st=='direct')why.push('go long: your midfield is not strong on the ball');
 return{m,p,w,s:st,why}}
function cpuTac(k){if(!feat('tact'))return;const iq=IQ(k),s=coachSug(k);G.tac[k]=rnd()<iq?{m:s.m,p:s.p,w:s.w,s:s.s}:{m:pick(['bal','bal','def','att']),p:pick(PK),w:pick(WK),s:pick(SK2)}}
const userTac=()=>feat('tact')&&!(typeof CAREER=='function'&&CAREER());
function cycleTac(f,dir){if(!userTac()||!G.tac)return;const L={m:MK,p:PK}[f],c=G.tac[0];c[f]=L[(L.indexOf(c[f])+(dir||1)+L.length)%L.length];say((f=='m'?MENT:PRESS)[c[f]][0],1.1)}
function useCoach(){if(!feat('coach')||!userTac()||!G)return;const s=coachSug(0);G.tac[0]={m:s.m,p:s.p,w:s.w,s:s.s};say(`Coach: ${MENT[s.m][0]}, ${PRESS[s.p][0].toLowerCase()}`,1.6)}
// ---------- finesse and chip shots ----------
function finesse(e){if(!feat('moves')||!e||G.b.own!==e||G.phase!='live')return;const s=G.dir[e.t],gk=gkOf(opp(e.t)),chip=gk&&Math.abs(gk.x-goalX(s))>6&&Math.hypot(goalX(s)-e.x,34-e.y)<26;const add=chip?22:10;
 e.p.sk.fin+=add;e.p.sk.lng+=add;try{shoot(e,chip?.45:.6,null)}finally{e.p.sk.fin-=add;e.p.sk.lng-=add}const b=G.b;if(b.shot){if(chip){const T=b.shot.T/.7;b.vx*=.7;b.vy*=.7;b.vz=((b.shot.goal||b.shot.onT?1.4:2.8)+4.9*T*T)/T;b.shot.T=T;say('Chip!',.9)}else say('Finesse shot',.8)}}
// ---------- hot streaks, momentum, injuries ----------
shotAdj=function(e,q){let a=0;if(feat('hot')&&G.hot&&(G.hot[e.p.id]||0)>=2)a+=.03;if(feat('mom')&&G.mom)a+=.02*(e.t===0?G.mom:-G.mom);return a};
{const _sc=scored;scored=function(k,e){_sc(k,e);if(!G)return;if(e&&e.t===k){const n=(G.hot[e.p.id]||0)+1;G.hot[e.p.id]=n;if(feat('hot')&&n==2)say(`${e.p.ln} is on fire!`,1.6);if(n==3){say(`Hat-trick for ${e.p.ln}!`,2.4);addNews(`${e.p.n} scored a hat-trick.`,e.p.tid===0)}}G.mom=clamp((G.mom||0)+(k===0?.45:-.45),-1,1)}}
{const _ng=newGame;newGame=function(...a){const g=_ng.apply(this,a);g.tac=[{m:'bal',p:'mid',w:'norm',s:'mix'},{m:'bal',p:'mid',w:'norm',s:'mix'}];g.hot={};g.mom=0;g.talk=[null,null];g.ctl2=null;cpuTac(1);if(g.auto||typeof CAREER=='function'&&CAREER())cpuTac(0);else if(feat('tact')&&R.tac0)g.tac[0]=Object.assign({},R.tac0);return g}}
{const _st=hStep;hStep=function(dt){_st(dt);if(!G||!G.live||G.phase!='live')return;if(feat('mom'))G.mom*=1-dt*.015*45/G.hl*4;
  if(feat('inj2')&&feat('inj')&&rnd()<dt*22*1.2e-5*45/G.hl*4){const e=pick(G.ent.filter(x=>!x.off));if(e&&!e.hurt){e.hurt=1;e.p.inj=ri(2,8);say(`${e.p.ln} is injured`,2);addNews(`${e.p.n} (${R.t[e.p.tid].ab}) was injured in a match and will miss about ${e.p.inj-1} matches.`,e.p.tid===0);
   if(e.t===1||G.auto||e.t===0&&R.autoSub!==false){const c=G.bench[e.t].map(id=>R.pl.find(p=>p.id===id)).filter(p=>p&&(e.pos=='GK'?p.pos=='GK':p.pos!='GK')).sort((a,b)=>fitFor(b,e.pos)-fitFor(a,e.pos))[0];if(!c||!subOn(e.t,e,c)){}}}}
  // the CPU changes tactics every so often (and late in the match)
  G.tacT=(G.tacT||0)+dt*45/G.hl;if(G.tacT>12){G.tacT=0;cpuTac(1);if(G.auto||typeof CAREER=="function"&&CAREER())cpuTac(0)}}}
// end of match: time wasting by the team that is ahead
{const _rs=restart;restart=function(kind,k,x,y){_rs(kind,k,x,y);if(feat('late')&&G&&G.half==2&&clkMin()>80&&G.dead&&G.sc[k]>G.sc[opp(k)]&&(k===1||G.auto))G.dead.t+=1.2}}
// ---------- the advantage rule ----------
{const _f=foul;foul=function(d,v,hard){const s=G.dir[v.t],inBox=(s>0?v.x>PL-16.5:v.x<16.5)&&v.y>13.85&&v.y<54.15;
  if(feat('rules2')&&!inBox&&(v.x-52.5)*s>0&&rnd()<.4&&G.b.own===v){say('Advantage, play on!',1.4);G.ev.push('whistle');d.p.fouls=(d.p.fouls||0)+1;if(rnd()<(hard?.3:.1)){bx(d,'yc');G.cards[d.p.id]=(G.cards[d.p.id]||0)+1;if(G.cards[d.p.id]>=2){bx(d,'rc');sendOff(d)}}return true}return _f(d,v,hard)}}
// ---------- halftime team talk ----------
{const _eh=endHalf;endHalf=function(){const was=G.half;_eh();if(was===1&&G.half===2&&feat('half')){G.talk[1]=G.sc[1]<G.sc[0]?'demand':pick(['calm','praise']);if(G.auto||!userTac()&&typeof CAREER=='function'&&CAREER())return;if(typeof talkUI=='function'){G.paused=true;talkUI()}}}}
function giveTalk(k,t){G.talk[k]=t;const T=onT(k);if(t=='calm')T.forEach(e=>G.st[e.p.id]=Math.min(100,G.st[e.p.id]+10));if(t=='praise')T.forEach(e=>{e.p.mor=Math.min(100,(e.p.mor||70)+3)});if(t=='demand')say('The team comes out pressing',1.5)}
// ---------- keys ----------
{const _k=hKey;hKey=function(code,down){if(!G||!G.live)return _k(code,down);if(G.ctl2&&!G.paused&&p2Key(code,down))return;
  if(down&&!G.paused){if(code=='KeyC'){cycleTac('m',KEYS.ShiftLeft?-1:1);return}if(code=='KeyV'){cycleTac('p',KEYS.ShiftLeft?-1:1);return}if(code=='KeyX'){useCoach();return}if(code=='KeyG'&&G.b.own===G.ctl){finesse(G.ctl);return}}return _k(code,down)}}
// ---------- gamepad and touch ----------
let PADV=null,TOUCHV=null;
{const _mv=moveVec;moveVec=function(){if(PADV)return PADV;if(TOUCHV)return TOUCHV;if(G&&G.ctl2){let x=0,y=0;[['KeyW',0,-1],['KeyS',0,1],['KeyA',-1,0],['KeyD',1,0]].forEach(([c,a,b])=>{if(KEYS[c]){x+=a;y+=b}});const l=Math.hypot(x,y);return l?[x/l,y/l]:null}return _mv()}}
const PADMAP={0:'Space',2:'KeyE',3:'KeyQ',1:'KeyR',4:'KeyC',5:'KeyV',7:'ShiftLeft',6:'KeyG',9:'Escape',12:'KeyX',13:'KeyF',14:'Tab',15:'Tab'};let PADB={};
function padPoll(){PADV=null;if(!feat('pad')||!navigator.getGamepads)return;const gp=[...navigator.getGamepads()].find(g=>g&&g.connected);if(!gp)return;const ax=gp.axes[0]||0,ay=gp.axes[1]||0;if(Math.hypot(ax,ay)>.25){const l=Math.hypot(ax,ay);PADV=[ax/l,ay/l]}
 gp.buttons.forEach((bt,i)=>{const on=bt.pressed||bt.value>.5,code=PADMAP[i];if(!code||on===!!PADB[i])return;PADB[i]=on;if($('gamewrap').hidden)return;if(code=='Escape'){if(on){if(!$('modal').hidden){closeModal();if(G)G.paused=false}else if(G)gameMenu()}return}KEYS[code]=on?1:0;if(!$('modal').hidden)return;hKey(code,on)})}
(function padLoop(){try{padPoll()}catch(e){}requestAnimationFrame(padLoop)})();
function touchSetup(){if($('tch'))return;const d=document.createElement('div');d.id='tch';d.innerHTML='<div id="tstk"><i></i></div><div id="tbtn"><button data-c="Space">Shoot<br><small>Slide</small></button><button data-c="KeyE">Pass<br><small>Tackle</small></button><button data-c="KeyQ">Through<br><small>Switch</small></button><button data-c="KeyR">Cross</button><button data-c="ShiftLeft">Sprint</button><button data-c="KeyF">Skill<br><small>Press</small></button></div>';$('gamewrap').appendChild(d);
 const stk=$('tstk'),knob=stk.firstChild;let id=null,cx=0,cy=0;const mv=t=>{const dx=t.clientX-cx,dy=t.clientY-cy,l=Math.hypot(dx,dy),m=Math.min(l,45);knob.style.transform=`translate(${l?dx/l*m:0}px,${l?dy/l*m:0}px)`;TOUCHV=l>10?[dx/l,dy/l]:null};
 stk.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0],r=stk.getBoundingClientRect();id=t.identifier;cx=r.left+r.width/2;cy=r.top+r.height/2;mv(t)},{passive:false});stk.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===id)mv(t)},{passive:false});
 const end=e=>{for(const t of e.changedTouches)if(t.identifier===id){id=null;TOUCHV=null;knob.style.transform=''}};stk.addEventListener('touchend',end);stk.addEventListener('touchcancel',end);
 d.querySelectorAll('#tbtn button').forEach(b=>{const c=b.dataset.c;b.addEventListener('touchstart',e=>{e.preventDefault();KEYS[c]=1;hKey(c,true)},{passive:false});b.addEventListener('touchend',e=>{e.preventDefault();KEYS[c]=0;hKey(c,false)},{passive:false})})}
function touchShow(){const on=feat('touch')&&('ontouchstart' in window||navigator.maxTouchPoints>0);if(on)touchSetup();const t=$('tch');if(t)t.hidden=!on;HIDEHELP=on}
{const _pg=playGame;playGame=function(...a){const r=_pg.apply(this,a);try{touchShow();if(G&&feat('p2')&&!G.auto){G.ctl2=onT(1).filter(e=>e.pos!='GK')[0]}}catch(e){}return r}}
// ---------- 2-player couch mode ----------
const P2DIR={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
function p2Vec(){let x=0,y=0;for(const k in P2DIR)if(KEYS[k]){x+=P2DIR[k][0];y+=P2DIR[k][1]}const l=Math.hypot(x,y);return l?[x/l,y/l]:null}
{const _ta=teamAI;teamAI=function(e,dt){if(G.ctl2&&e===G.ctl2){const mv=p2Vec();if(mv){const v=topSpd(e);e.tx=mv[0]*v;e.ty=mv[1]*v;return}if(G.b.own===e){e.tx=e.vx*.6;e.ty=e.vy*.6;return}}return _ta(e,dt)}}
{const _gv=give;give=function(e){_gv(e);if(G&&G.ctl2&&e.t===1&&e.pos!='GK')G.ctl2=e}}
{const _uc=userControls;userControls=function(e,dt){if(!G.ctl2)return _uc(e,dt);const save={};['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach(k=>{save[k]=KEYS[k];KEYS[k]=0});const r=_uc(e,dt);Object.assign(KEYS,save);return r}}
function p2Key(code,down){if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Slash','Period','Comma'].includes(code))return false;const e=G.ctl2;if(!e||G.phase!='live'||e.off)return true;const b=G.b,mine=b.own===e;if(!down)return true;
 if(code=='Slash'){if(mine)shoot(e,.8);else if(!(b.own&&b.own.t===1))tackle(e,true)}else if(code=='Period'){if(mine){const t=bestPass(e);if(t)passTo(e,t.r,.45)}else if(!(b.own&&b.own.t===1))tackle(e,false)}
 else if(code=='Comma'){if(mine){const t=bestPass(e);if(t)passTo(e,t.r,.8,'through')}else{G.ctl2=onT(1).filter(x=>x.pos!='GK').sort((a,c)=>dist(a,b)-dist(c,b))[0]}}return true}
// ---------- screens and the HUD ----------
function tacHTML(){if(!userTac()||!G)return'';const c=G.tac[0],sg=feat('coach')?coachSug(0):null,sel=(f,O)=>`<select onchange="G.tac[0].${f}=this.value;R.tac0=Object.assign({},G.tac[0])">${Object.keys(O).map(k=>`<option value="${k}" ${c[f]==k?'selected':''}>${O[k][0]}</option>`).join('')}</select>`;
 return`<h3>Tactics</h3><div class="row"><label>Mentality ${sel('m',MENT)}</label><label>Pressing ${sel('p',PRESS)}</label><label>Width ${sel('w',WIDTH)}</label><label>Passing ${sel('s',STYLE)}</label></div>
 ${sg?`<div class="card hot"><b>Coach suggests:</b> ${MENT[sg.m][0]}, ${PRESS[sg.p][0].toLowerCase()}, ${WIDTH[sg.w][0].toLowerCase()}, ${STYLE[sg.s][0].toLowerCase()}. <small>${esc(sg.why.join('; '))}.</small> ${B("useCoach();R.tac0=Object.assign({},G.tac[0]);tacUI()",'Use it','xs')}</div>`:''}`}
function tacUI(){if(!G)return;G.paused=true;modal(tacHTML()+B("closeModal();G.paused=false",'Back to the match','big'))}
function talkUI(){const r=gameResult(),m=r.a===0?0:1;modal(`<h2>Half time: ${esc(R.t[G.tm[0]].ab)} ${G.sc[0]} - ${G.sc[1]} ${esc(R.t[G.tm[1]].ab)}</h2><p>Possession ${r.res.poss[m]}% · Shots ${r.res.T[m].box.reduce((a,b)=>a+b[SI.sh],0)} vs ${r.res.T[1-m].box.reduce((a,b)=>a+b[SI.sh],0)}</p>
 <h3>Team talk</h3><div class="row">${[['calm','Stay calm','Tired legs recover a little'],['praise','Praise them','Morale goes up'],['demand','Demand more','The team presses harder']].map(([k,n,d])=>B(`giveTalk(0,'${k}');closeModal();G.paused=false`,`${n}<br><small>${d}</small>`)).join('')}</div>${tacHTML()}`);$('modal').onclick=null}
{const _gm=gameMenu;gameMenu=function(){_gm();try{const r=$('modal').querySelector('.row');if(r&&userTac())r.insertAdjacentHTML('beforeend',B('tacUI()','Tactics'))}catch(e){}}}
const HINTS={shoot:'Hold Space, let go in the green (G: finesse)',pass:'E pass · Q through ball · R cross',def:'E tackle · Space slide · Q switch'};
{const _dh=drawHUD;drawHUD=function(){_dh();if(!G||G.auto)return;try{const cx=VW/2;CX.textAlign='center';CX.textBaseline='middle';
  if(feat('mom')){const c=164,w=300,y=52;CX.fillStyle='rgba(15,23,42,.7)';CX.fillRect(c-w/2,y,w,5);const m0=G.mom||0,m=m0*(G.home===0?-1:1);CX.fillStyle=m0>=0?'#38bdf8':'#f87171';if(m>=0)CX.fillRect(c,y,w/2*m,5);else CX.fillRect(c+w/2*m,y,-w/2*m,5);CX.fillStyle='#fff';CX.fillRect(c-1,y-1,2,7)}
  if(userTac()&&G.tac&&!G.paused&&VW>700){const c=G.tac[0],t=`${MENT[c.m][0]} (C) · ${PRESS[c.p][0]} (V)`+(feat('coach')?' · Coach (X)':'');CX.font='600 12px system-ui';const w=CX.measureText(t).width+20;CX.fillStyle='rgba(15,23,42,.75)';CX.fillRect(VW-w-12,58,w,20);CX.fillStyle='#e2e8f0';CX.fillText(t,VW-w/2-12,68)}
  if(feat('keyhint')&&G.ctl&&G.phase=='live'&&!G.paused){const e=G.ctl,h=G.b.own===e?(shotQuality(e).d<26?'shoot':'pass'):!(G.b.own&&G.b.own.t===0)?'def':null;G.hints=G.hints||{};if(h&&(G.hints[h]||0)<5){G.hints[h]=(G.hints[h]||0)+1/60;const[gx,gy]=P(e.x,e.y,0),y=gy-1.8*S*HZ-S*1.6;CX.font='600 12px system-ui';const w=CX.measureText(HINTS[h]).width+16;CX.fillStyle='rgba(15,23,42,.88)';CX.fillRect(gx-w/2,y-11,w,22);CX.fillStyle='#bbf7d0';CX.fillText(HINTS[h],gx,y)}}
  if(G.ctl2&&!G.paused){CX.font='600 12px system-ui';CX.fillStyle='rgba(226,232,240,.75)';CX.textAlign='left';CX.fillText('Player 2: arrows · / shoot or slide · . pass or tackle · , through ball or switch',12,VH-56)}}catch(x){}}}
{const _dp=drawPlayer;drawPlayer=function(e){_dp(e);try{if(e===G.ctl2){const [gx,gy]=P(e.x,e.y,0),w=S*.6;CX.strokeStyle='#38bdf8';CX.lineWidth=2.5;CX.beginPath();CX.ellipse(gx,gy,w*1.25,w*.5,0,0,7);CX.stroke()}if(feat('hot')&&G.hot&&(G.hot[e.p.id]||0)>=2){const [gx,gy]=P(e.x,e.y,0);CX.font=`${Math.round(S*.7)}px system-ui`;CX.textAlign='center';CX.fillText('🔥',gx+S*.6,gy-1.8*S*HZ)}}catch(x){}}}
{const _kh=keysHTML;keysHTML=function(){const r=(a,b)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`;return _kh()+`<table class="t"><tr><th colspan="2">More</th></tr>${r('Finesse shot (a chip if the keeper is off his line)','G')}${r('Change mentality / pressing','C / V (Shift goes back)')}${r('Use the coach\'s suggestion','X')}${r('Gamepad','A shoot · X pass · Y through ball · B cross · LB/RB tactics · RT sprint · LT finesse · Start menu')}</table>`}}
