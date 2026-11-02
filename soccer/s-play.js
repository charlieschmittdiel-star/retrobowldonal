'use strict';
// Your controls. Attack: WASD/arrows move, hold Space to shoot (let go in the green; up/down picks the corner),
// E pass, Q through ball, R cross or long ball, F skill move, Shift sprint.
// Defend: move, E tackle, Space slide tackle, Q or Tab switch player, F send a teammate to press.
const DIRK={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
function moveVec(){let x=0,y=0;for(const k in DIRK)if(KEYS[k]){x+=DIRK[k][0];y+=DIRK[k][1]}const l=Math.hypot(x,y);return l?[x/l,y/l]:null}
function userControls(e,dt){if(!G||G.auto)return false;const mv=moveVec(),b=G.b;e.spr=feat('sprint')&&(KEYS.ShiftLeft||KEYS.ShiftRight)&&!!mv;
 if(e.spr&&feat('fatigue'))G.st[e.p.id]=Math.max(0,G.st[e.p.id]-dt*1.2*45/G.hl*(1.3-e.p.sk.sta/120));
 if(G.meter&&G.meter.e===e){const v=topSpd(e)*.5;e.tx=mv?mv[0]*v:e.vx*.5;e.ty=mv?mv[1]*v:e.vy*.5;return true}
 const mine=b.own===e;G.ctlInput=!!mv;
 if(!mv){if(mine){e.tx=e.vx*.6;e.ty=e.vy*.6;return true}if(b.own&&b.own.t===1&&!feat('autoSw'))return true;return false}
 const v=topSpd(e)*(e.spr?1.18:1);e.tx=mv[0]*v;e.ty=mv[1]*v;return true}
// shooting with the power meter
const MT=.75;
function startShot(){const e=G.ctl,b=G.b;if(!e||b.own!==e||G.phase!='live')return;if(!feat('meter'))return shoot(e,.8,aimY(e));G.meter={e,t:0}}
function aimY(e){const mv=moveVec();if(!mv||Math.abs(mv[1])<.3)return null;return 34+Math.sign(mv[1])*(GW/2-.5)}
function releaseShot(){const m=G.meter;if(!m)return;G.meter=null;const e=m.e;if(G.b.own!==e)return;const v=Math.min(1.3,m.t/MT),dv=Math.abs(v-.85);let pw=v>1?1:v;G.lastMeter={v,t:1.1,good:dv<.1};shoot(e,dv<.1?.9:pw*.9,aimY(e));if(dv>=.1&&v>1.05&&G.b.shot){G.b.shot.goal=false;G.b.shot.onT=false;G.b.vz+=2.5}}
function meterStep(dt){if(G.lastMeter)G.lastMeter.t-=dt;const m=G.meter;if(m){m.t+=dt;if(G.b.own!==m.e||G.phase!='live'){G.meter=null;return}if(m.t>MT*1.3)releaseShot()}
 const P=G.pen;if(P&&P.meter){P.meter.t+=dt}}
// passing in the direction you are pushing
function dirMate(e,kind){const mv=moveVec(),T=onT(0).filter(r=>r!==e&&r.pos!='GK');let best=null,bs=-1e9;const s=G.dir[0];
 T.forEach(r=>{const dx=r.x-e.x,dy=r.y-e.y,d=Math.hypot(dx,dy)||1;if(d<3)return;let sc=-d*.03-laneRisk(e,r)*4+Math.min(6,Math.min(...onT(1).map(o=>dist(o,r))))*.3;
  if(mv)sc+=((dx*mv[0]+dy*mv[1])/d)*6;else sc+=dx*s/d*1.5;if(kind=='through')sc+=(r.run>0?3:0)+dx*s*.08;if(kind=='long')sc+=d*.04;if(sc>bs){bs=sc;best=r}});return best}
function userPass(kind){const e=G.ctl,b=G.b;if(!e||b.own!==e||G.phase!='live')return;const s=G.dir[0],fwd=(e.x-goalX(-s))*s;
 if(kind=='cross'&&fwd>68&&(e.y<20||e.y>48))return crossBox(e);const r=dirMate(e,kind);if(!r)return;passTo(e,r,kind=='through'?.8:.45,kind=='through'?'through':kind=='cross'?'long':null);G.ctl=r}
function switchPlayer(){const b=G.b,T=onT(0).filter(e=>e.pos!='GK').sort((a,c)=>dist(a,b)-dist(c,b));G.ctl=T[0]===G.ctl&&T[1]?T[1]:T[0]}
function hKey(code,down){if(!G||!G.live)return;if(down&&(code=='Escape'||code=='KeyP')){G.paused=!G.paused;return}if(G.paused)return;
 if(G.phase=='pen'){const P=G.pen;if(P.e.t===0&&code=='Space'&&P.wait<=0){if(down&&!P.meter)P.meter={t:0};else if(!down)penRelease()}
  if(P.gk&&P.gk.t===0&&down&&!P.guess){if(code=='KeyW'||code=='ArrowUp'){P.guess=1;P.dive=-1}else if(code=='KeyS'||code=='ArrowDown'){P.guess=1;P.dive=1}else if(code=='Space'){P.guess=1;P.dive=0}}return}
 if(G.phase!='live')return;const has=G.b.own&&G.b.own.t===0,mine=G.b.own===G.ctl&&G.ctl;
 if(code=='Space'){if(mine){down?startShot():releaseShot()}else if(down&&!has)tackle(G.ctl,true);return}
 if(!down)return;
 if(mine){if(code=='KeyE')userPass(null);else if(code=='KeyQ')userPass('through');else if(code=='KeyR')userPass('cross');else if(code=='KeyF')skill(G.ctl)}
 else if(!has){if(code=='KeyE'&&G.ctl)tackle(G.ctl,false);else if(code=='KeyQ'||code=='Tab')switchPlayer();else if(code=='KeyF'){G.press2=3;say('Pressing!',.8)}}}
// click a teammate to pass to him
function hClick(fx,fy){if(!G||G.phase!='live')return;const e=G.ctl;let best=null,bd=3;onT(0).forEach(r=>{const d=Math.hypot(r.x-fx,r.y-fy);if(d<bd){bd=d;best=r}});if(!best)return;if(e&&G.b.own===e&&best!==e){passTo(e,best,.45);G.ctl=best}else if(!(G.b.own&&G.b.own.t===0))G.ctl=best}
// on defense, control the man nearest the ball (if auto-switch is on)
function autoSwitch(dt){if(!G||G.auto||!feat('autoSw'))return;const b=G.b;if(b.own&&b.own.t===0)return;G.swT=(G.swT||0)-dt;if(G.swT>0||G.ctlInput)return;G.swT=.4;
 const T=onT(0).filter(e=>e.pos!='GK').sort((a,c)=>dist(a,b)-dist(c,b));if(T[0]&&G.ctl&&dist(T[0],b)<dist(G.ctl,b)-4)G.ctl=T[0];if(!G.ctl||G.ctl.off)G.ctl=T[0]}
// ---------- finishing a match ----------
function gameResult(){const home=G.home,away=home===0?G.tm[1]:0,order=[home,away],res={sc:[0,0],T:[],poss:[0,0]};const tot=G.poss[0]+G.poss[1]||1;
 order.forEach((tid,j)=>{const k=G.tm.indexOf(tid);res.sc[j]=G.sc[k];res.poss[j]=Math.round(G.poss[k]/tot*100);const ps=[],box=[];Object.keys(G.bx).forEach(id=>{const p=R.pl.find(q=>q.id==id);if(!p||p.tid!==tid)return;const b=G.bx[id].slice();const m=(G.secs[p.id]||0)/60;b[SI.min]=Math.round(m);b[SI.gp]=m>0?1:0;if(!b[SI.gp])return;
  if(G.sc[opp(k)]===0&&(p.pos=='GK'||p.pos=='CB'||p.pos=='FB')&&m>=60)b[SI.cs]=1;b[SI.rat]=matchRating(b,p.pos,G.sc[k]-G.sc[opp(k)]);ps.push(p);box.push(b)});res.T.push({t:tid,ps,box})});return{a:home,b:away,res}}
function finishGame(){const {a,b,res}=gameResult();recGame(a,b,res,true);simDay(true);hSave();return res}
