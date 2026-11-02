'use strict';
// Your controls on the court, the shot meter, and turning a finished game into standings and stats.
// Offense: WASD/arrows move, hold Space to shoot (let go at the top of the meter), E smart pass, 1-5 pass to a
// position, Q lob, R crossover, F call a screen, Shift sprint. Defense: move, Space jump/contest, E steal, Tab switch.
const DIRK={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
function moveVec(){let x=0,y=0;for(const k in DIRK)if(KEYS[k]){x+=DIRK[k][0];y+=DIRK[k][1]}const l=Math.hypot(x,y);return l?[x/l,y/l]:null}
function userControls(e,dt){if(!G||G.auto)return false;const mv=moveVec(),b=G.b;e.spr=feat('sprint')&&(KEYS.ShiftLeft||KEYS.ShiftRight)&&!!mv;
 if(e.spr&&feat('fatigue'))G.st[e.p.id]=Math.max(0,G.st[e.p.id]-dt*1.6*(1.3-e.p.sk.sta/120));
 if(G.meter&&G.meter.e===e){e.tx=e.vx*.2;e.ty=e.vy*.2;return true}
 const off=G.poss===0;G.ctlInput=!!mv;
 if(!mv){if(off&&b.st=='held'&&b.h===e){e.tx=0;e.ty=0;return true}if(!off&&feat('autoD'))return false;if(off&&b.st!='held')return false;e.tx=0;e.ty=0;return true}
 const v=topSpd(e)*(e.spr?1.15:1);e.tx=mv[0]*v;e.ty=mv[1]*v;return true}
// ---------- the shot meter ----------
const MT=.72;  // seconds to fill
function meterWin(p,k){return .035+(p.sk[k]-50)*.0012}
function startShot(){const e=G.ctl,b=G.b;if(!e||b.st!='held'||b.h!==e||G.phase!='live')return;const info=shotInfo(e,e.x,e.y);
 if(info.d<6){const toward=(e.vx*(info.hx-e.x)+e.vy*(25-e.y))>0,dk=feat('alley')&&e.p.sk.dnk>=64&&info.d<4.6&&toward&&Math.hypot(e.vx,e.vy)>5;e.act={k:dk?'dunk':'lay',t:0};return shoot(e,dk?.02:.02*(e.p.sk.lay-60)/20)}
 if(!feat('meter'))return shoot(e,gauss()*.02);G.meter={e,t:0,k:info.three?'thr':'mid'};e.act={k:'gather',t:0}}
function releaseShot(){const m=G.meter;if(!m)return;G.meter=null;const e=m.e,v=m.t/MT,w=meterWin(e.p,m.k),dv=Math.abs(v-.93);let q;
 if(dv<w){q=.09;say('Perfect release!',1)}else if(dv<w*2.2)q=.03;else q=-Math.min(.28,(dv-w*2.2)*.9);m.q=q;G.lastMeter={v,q,t:1.2};
 if(G.b.st=='held'&&G.b.h===e&&G.phase=='live')shoot(e,q)}
function meterStep(dt){if(G.lastMeter)G.lastMeter.t-=dt;if(G.ft&&G.ft.meter){G.ft.meter.t+=dt;if(G.ft.meter.t>MT*1.3)ftRelease()}const m=G.meter;if(!m)return;m.t+=dt;if(G.b.st!='held'||G.b.h!==m.e||G.phase!='live'){G.meter=null;return}if(m.t>MT*1.3)releaseShot()}
// free throws with the meter
function ftPress(){const f=G.ft;if(!f||G.b.st!='held'||G.pt>0||f.e.t!==0)return;if(!feat('meter'))return ftShoot(gauss()*.02);f.meter={t:0}}
function ftRelease(){const f=G.ft;if(!f||!f.meter)return;const v=f.meter.t/MT,w=meterWin(f.e.p,'ft'),dv=Math.abs(v-.93);f.meter=null;G.wantFT=0;const q=dv<w?.08:dv<w*2.2?.02:-Math.min(.35,(dv-w*2.2)*1.1);G.lastMeter={v,q,t:1.2};ftShoot(q)}
// ---------- other buttons ----------
function smartPass(lob){const e=G.ctl,b=G.b;if(!e||b.st!='held'||b.h!==e)return;const mv=moveVec(),T=onT(0).filter(r=>r!==e);let best=null,bs=-1e9;
 T.forEach(r=>{const dx=r.x-e.x,dy=r.y-e.y,d=Math.hypot(dx,dy)||1;let s=openness(r)*1.2-passRisk(e,r)*12-d*.05;if(mv)s+=((dx*mv[0]+dy*mv[1])/d)*10;if(lob){const hx=hoopX(G.dir[0]);s+=-Math.hypot(r.x-hx,r.y-25)*.6}if(s>bs){bs=s;best=r}});
 if(best)passTo(e,best,lob)}
function passPos(n){const e=G.ctl,b=G.b;if(!e||b.st!='held'||b.h!==e)return;const pos=POS[n-1];const r=onT(0).find(x=>x.p.pos==pos&&x!==e)||onT(0).filter(x=>x!==e).sort((a,c)=>Math.abs(POS.indexOf(a.p.pos)-n+1)-Math.abs(POS.indexOf(c.p.pos)-n+1))[0];if(r)passTo(e,r)}
function crossover(){const e=G.ctl;if(!feat('cross')||!e||G.b.h!==e||G.b.st!='held'||(e.cd.cr||0)>0)return;e.cd.cr=1.4;e.act={k:'cross',t:0};const d=e.man;G.ev.push('bounce');
 if(d&&dist(d,e)<5){const p=clamp(.32+(e.p.sk.han-d.p.sk.pd)/90,.08,.7);if(rnd()<p){d.bite=.6;d.stun=.6;say('Crossed him up!',1)}}const mv=moveVec();if(mv){e.vx+=mv[0]*6;e.vy+=mv[1]*6}}
function callScreen(){if(!feat('screens')||G.poss!==0||G.b.st!='held')return;const h=G.b.h;const big=onT(0).filter(x=>x!==h).sort((a,c)=>(POS.indexOf(c.p.pos)-POS.indexOf(a.p.pos))*3+dist(a,h)*.1-dist(c,h)*.1)[0];if(big){big.scr=1.5;say(`${big.p.ln} sets a screen`,.9)}}
function switchDef(){if(G.poss!==1)return;const b=G.b,tgt=b.st=='held'?b.h:b;const c=onT(0).slice().sort((a,c2)=>dist(a,tgt)-dist(c2,tgt));G.ctl=c[0]===G.ctl&&c[1]?c[1]:c[0]}
function userJump(){const e=G.ctl;if(!e||e.z>0)return;e.vz=8.5+e.p.sk.vert*.05;e.z=.01;e.act={k:'jump',t:0}}
function hKey(code,down){if(!G||!G.live||G.paused&&code!='Escape'&&code!='KeyP')return;
 if(down&&(code=='Escape'||code=='KeyP')){G.paused=!G.paused;return}
 if(G.phase=='ft'){if(code=='Space'){down?ftPress():ftRelease()}return}
 if(G.phase!='live')return;
 const off=G.poss===0;
 if(code=='Space'){if(off){if(down)startShot();else releaseShot()}else if(down)userJump();return}
 if(!down)return;
 if(off){if(code=='KeyE')smartPass(false);else if(code=='KeyQ')smartPass(true);else if(code=='KeyR')crossover();else if(code=='KeyF')callScreen();else if(/^Digit[1-5]$/.test(code))passPos(+code[5])}
 else{if(code=='KeyE'&&G.ctl)stealTry(G.ctl);else if(code=='Tab'||code=='KeyQ')switchDef()}}
// click a teammate to pass to him (offense) or a defender to take control of him (defense)
function hClick(fx,fy){if(!G||G.phase!='live')return;let best=null,bd=4;onT(0).forEach(e=>{const d=Math.hypot(e.x-fx,e.y-fy);if(d<bd){bd=d;best=e}});if(!best)return;
 if(G.poss===0&&G.b.st=='held'&&G.b.h===G.ctl&&best!==G.ctl)passTo(G.ctl,best);else if(G.poss===1)G.ctl=best}
// ---------- finishing a game ----------
function gameResult(){const k0=G.tm,res={sc:[0,0],ot:G.ot,T:[]};const home=G.home,away=home===0?G.tm[1]:0,order=[home,away];
 order.forEach((tid,j)=>{const k=k0.indexOf(tid);res.sc[j]=G.sc[k];const ps=[],box=[];Object.keys(G.bx).forEach(id=>{const p=R.pl.find(q=>q.id==id);if(!p||p.tid!==tid)return;const b=G.bx[id].slice();const m=(G.secs[p.id]||0)/60;b[SI.min]=Math.round(m);b[SI.gp]=m>0?1:0;ps.push(p);box.push(b)});res.T.push({t:tid,ps,box})});return{a:home,b:away,res}}
function finishGame(){const {a,b,res}=gameResult();recGame(a,b,res,true);
 if(R.po){const s=poUserSeries();if(s){const w=res.sc[0]>res.sc[1]?a:b;poRes(s,a,w)}poDay(true)}else simDay(true);hSave();return res}
