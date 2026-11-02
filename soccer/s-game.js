'use strict';
// The match: 11 against 11. Team shape and pressing, dribbling, passes, through balls, crosses and headers, shots and
// goalkeeping, tackles, fouls and cards, throw-ins, corners, goal kicks, free kicks, penalties and offside.
// You control one player on your team; difficulty only changes how smart the other team plays.
const PL=105,PW=68,GW=7.32,GH=2.44,GY0=34-GW/2,GY1=34+GW/2;
let G=null;
const IQ=k=>(k===1||(G&&G.auto))?([.45,.7,.88,.98][G&&G.diff!=null?G.diff:(R?R.diff:1)]||.7):.82;
const goalX=s=>s>0?PL:0;                         // the goal a team attacking in direction s shoots at
const onT=k=>G.ent.filter(e=>e.t===k&&!e.off);
const opp=k=>1-k;
function say(s,t){G.msg=s;G.msgT=t||1.8}
function bx(e,k,n){const a=G.bx[e.p.id];if(a)a[SI[k]]+=n==null?1:n}
function newGame(home,away,opt){opt=opt||{};const tm=[0,home===0?away:home];const hl=(opt.hlen||R.hlen||4)*60;
 G={tm,home,ent:[],sc:[0,0],half:1,clk:0,hl,phase:'ko',b:{x:52.5,y:34,z:0,vx:0,vy:0,vz:0,own:null,lt:null},bx:{},st:{},dir:[1,-1],msg:'',msgT:0,live:1,ctl:null,dead:null,ev:[],diff:R.diff,secs:{},bench:[[],[]],subs:[0,0],slots:[[],[]],poss:[0,0],lastTeam:0,stop:[ri(0,2),ri(1,4)],cards:{},auto:0};
 tm.forEach((t,k)=>{const lu=lineup(t);G.slots[k]=lu.slots;G.bench[k]=lu.bench.map(p=>p.id);lu.xi.concat(lu.bench).forEach(p=>{G.bx[p.id]=newSS();G.st[p.id]=100});lu.xi.forEach((p,i)=>{G.ent.push(mkEnt(p,k,i,lu.slots[i]));G.bx[p.id][SI.gs]=1;G.bx[p.id][SI.gp]=1})});
 kickoff(0);return G}
function mkEnt(p,k,i,slot){return{p,t:k,i,pos:slot[0],hx:slot[1],hy:slot[2],x:52.5,y:34,vx:0,vy:0,fa:0,z:0,act:null,cd:{},stun:0,tx:0,ty:0}}
const gkOf=k=>G.ent.find(e=>e.t===k&&e.pos=='GK'&&!e.off);
// where each player wants to be: his formation spot, pushed up or dropped back with the play and shifted toward the ball
function homeSpot(e){const k=e.t,s=G.dir[k],own=goalX(-s),b=G.b,att=G.lastTeam===k,bx0=(b.x-own)*s;let X,Y;
 if(e.pos=='GK')return[own+s*clamp(bx0*.06+1.5,1.5,8),34+(b.y-34)*.12];
 const line=att?8+e.hx*86:5+e.hx*58,shift=(bx0-(att?55:45))*(att?.35:.42);X=clamp(line+shift,4,att?100:92);Y=4+e.hy*60;Y+=(b.y-34)*(att?.18:.32);
 return[own+s*X,clamp(Y,2,PW-2)]}
// ---------- restarts ----------
function kickoff(k){G.ent.forEach(e=>{const [x,y]=homeSpot(e),s=G.dir[e.t],own=goalX(-s);e.x=own+s*Math.min(Math.abs(x-own),48);e.y=y;e.vx=e.vy=0});G.lastTeam=k;
 const T=onT(k).filter(e=>e.pos=='ST'||e.pos=='CM').sort((a,c)=>Math.abs(a.x-52.5)-Math.abs(c.x-52.5)),tk=T[0]||onT(k)[9];tk.x=52.5-G.dir[k]*.6;tk.y=34;Object.assign(G.b,{x:52.5,y:34,z:0,vx:0,vy:0,vz:0,own:null});
 G.phase='dead';G.dead={t:1.2,fn:()=>{G.phase='live';give(tk);const r=onT(k).filter(e=>e!==tk).sort((a,c)=>dist(a,tk)-dist(c,tk))[0];if(r&&!(G.ctl===tk&&!G.auto))passTo(tk,r,.6)}};setCtl()}
function give(e){const b=G.b;b.own=e;b.lt=e;b.vx=b.vy=b.vz=0;b.z=0;G.lastTeam=e.t;e.cd.dec=.25+rnd()*.15;if(e.t===0&&!G.auto)G.ctl=e;G.ev.push('touch')}
function restart(kind,k,x,y){// k = team that takes it
 G.phase='dead';const b=G.b;b.own=null;b.vx=b.vy=b.vz=0;b.z=0;b.x=x;b.y=y;G.lastTeam=k;const s=G.dir[k];
 const taker=kind=='gk'?gkOf(k):onT(k).filter(e=>e.pos!='GK').sort((a,c)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(c.x-x,c.y-y))[0];if(!taker)return;
 G.dead={t:kind=='corner'?1.5:1,fn:()=>{G.phase='live';taker.x=x;taker.y=y;give(taker);taker.cd.dec=kind=='fk'||kind=='corner'?.4:.2;taker.set=kind}};
 if(kind=='corner'){say('Corner',1)}else if(kind=='gk'){say('Goal kick',1)}else if(kind=='throw'){say('Throw-in',.8)}setCtl()}
// ---------- passing ----------
const ROLL=.55,DEC=1.4;   // ground passes slow down with rolling friction
function speedFor(d,arrive){return Math.sqrt(arrive*arrive+2*DEC*4*d)}
function passTo(e,r,lead,kind){const b=G.b;if(b.own!==e)return;lead=lead==null?.5:lead;let tx=r.x+r.vx*lead*1.4,ty=r.y+r.vy*lead*1.4;if(kind=='through'){const s=G.dir[e.t];tx=r.x+s*8+r.vx*.6;ty=r.y+r.vy*.6}
 tx=clamp(tx,.5,PL-.5);ty=clamp(ty,.5,PW-.5);const d=Math.hypot(tx-e.x,ty-e.y),lofted=kind=='cross'||kind=='long'||(d>32&&kind!='through');
 const acc=e.p.sk[lofted?(kind=='cross'?'crs':'lpa'):'shp'],err=(1.15-acc/100)*d*.06*(feat('fatigue')?1.2-(G.st[e.p.id]||100)/500:1)*(1+(1-IQ(e.t))*.5);tx+=gauss()*err;ty+=gauss()*err;
 const ang=Math.atan2(ty-e.y,tx-e.x);b.own=null;b.lt=e;b.from=e;b.to=r;b.kind=kind||'pass';b.t=0;b.passX=e.x;
 if(lofted){const T=clamp(d/19,.7,2.4);b.vx=Math.cos(ang)*d/T;b.vy=Math.sin(ang)*d/T;b.vz=16*T/2;b.z=.2}else{const v=clamp(speedFor(d,5.5),8,26);b.vx=Math.cos(ang)*v;b.vy=Math.sin(ang)*v;b.vz=0}
 bx(e,'pas');b.pc=e;e.act={k:'kick',t:0};G.ev.push('kick');
 // offside: the receiver is past the second-last defender and the ball when it is played
 if(feat('offside')&&r&&kind!='cross'){const s=G.dir[e.t],D=onT(opp(e.t)).map(x=>x.x*s).sort((a,c)=>c-a),second=D[1]!=null?D[1]:D[0],rx=r.x*s;if(rx>second+.3&&rx>e.x*s&&(r.x-52.5)*s>0&&b.kind!='throw'){b.offside={r,x:r.x,y:r.y}}}}
// ---------- shooting ----------
function shotQuality(e){const s=G.dir[e.t],gx=goalX(s),d=Math.hypot(gx-e.x,34-e.y),ang=Math.abs(Math.atan2(GW/2,d))*2,pres=onT(opp(e.t)).filter(o=>o.pos!='GK'&&dist(o,e)<2.5).length;
 let xg=clamp(.95*Math.pow(ang/1.2,1.1)*Math.exp(-d/16),.01,.85);xg*=Math.pow((d>20?e.p.sk.lng:e.p.sk.fin)/65,1.4);xg*=1-pres*.22;return{xg,d,pres}}
function shoot(e,power,aimY){const b=G.b;if(b.own!==e)return;const s=G.dir[e.t],gx=goalX(s),q=shotQuality(e),gk=gkOf(opp(e.t));power=power==null?.75:power;
 let pG=q.xg*1.55*(.75+power*.4)*(feat('realism')?1:1.12),pOn=clamp(.32+q.xg*1.1+(e.p.sk.fin-60)/250-(power>.95?.18:0),.12,.9);if(feat('fatigue'))pOn*=.92+.08*(G.st[e.p.id]||100)/100;
 if(gk)pG*=Math.pow(72/Math.max(35,(gk.p.sk.div+gk.p.sk.pos)/2),1.2);pG=clamp(pG,.005,.9);
 // a defender in the way can block it
 const blk=onT(opp(e.t)).find(o=>o.pos!='GK'&&Math.abs((o.x-e.x)*s)<5&&(o.x-e.x)*s>0&&Math.abs(o.y-(e.y+(34-e.y)*Math.abs(o.x-e.x)/Math.max(1,q.d)))<1.1);
 const blocked=blk&&rnd()<.55,onT_=!blocked&&rnd()<pOn,goal=onT_&&rnd()<clamp(pG/pOn,0,.97);
 let ty;if(aimY!=null)ty=clamp(aimY,GY0-3,GY1+3);else ty=34+(rnd()<.5?-1:1)*(GW/2-.6);
 if(goal){ty=clamp(ty,GY0+.35,GY1-.35);if(gk&&Math.abs(ty-gk.y)<1.2)ty=gk.y<34?GY1-.5:GY0+.5}else if(onT_){ty=gk?clamp(gk.y+gauss()*.8,GY0+.4,GY1-.4):34}else if(!blocked){ty=rnd()<.5?GY0-.5-rnd()*3:GY1+.5+rnd()*3}
 const tz=goal?.3+rnd()*1.8:onT_?.3+rnd()*1.5:rnd()<.5?2.6+rnd()*2:.5,d=Math.hypot(gx-e.x,ty-e.y),v=19+power*13+e.p.sk.fin*.04,T=d/v;
 b.own=null;b.lt=e;b.from=e;b.to=null;b.kind='shot';b.t=0;b.vx=(gx-e.x)/T;b.vy=(ty-e.y)/T;b.vz=(tz+4.9*T*T)/T*.98;b.z=.2;b.shot={e,goal,onT:onT_,blocked:blocked?blk:null,T,gk};
 bx(e,'sh');if(onT_)bx(e,'sot');e.act={k:'shoot',t:0};G.ev.push('shot');if(gk&&onT_&&!goal){gk.dive={ty,T,t:0}}}
// ---------- tackles and fouls ----------
function tackle(d,slide){const b=G.b,h=b.own;if(!h||h.t===d.t||(d.cd.tk||0)>0)return false;const dd=dist(d,h),reach=slide?2.6:1.6;d.cd.tk=slide?1.4:.7;d.act={k:slide?'slide':'tackle',t:0};if(slide){d.vx+=Math.cos(Math.atan2(h.y-d.y,h.x-d.x))*5;d.vy+=Math.sin(Math.atan2(h.y-d.y,h.x-d.x))*5;d.stun=.8}
 if(dd>reach)return false;const p=clamp(.38+(d.p.sk.tkl-h.p.sk.dri)/140+(slide?.08:0)-(dd-1)*.08,.08,.8),foulP=feat('fouls')?(slide?.3:.16)*(1.25-d.p.sk.tkl/100)*(1+(rnd()<.5?0:.5)):0;
 if(rnd()<foulP)return foul(d,h,slide);
 if(rnd()<p){bx(d,'tkl');G.ev.push('tackle');b.own=null;b.lt=d;const a=Math.atan2(h.y-d.y,h.x-d.x)+(rnd()-.5)*1.5;b.vx=Math.cos(a)*4+d.vx*.4;b.vy=Math.sin(a)*4+d.vy*.4;h.stun=.5;return true}
 h.cd.beat=.6;d.stun=slide?1:.45;return false}
function foul(d,v,hard){const s=G.dir[v.t],inBox=(s>0?v.x>PL-16.5:v.x<16.5)&&v.y>13.85&&v.y<54.15;say(inBox?'Penalty!':'Foul',1.6);G.ev.push('whistle');d.p.fouls=(d.p.fouls||0)+1;
 let card=null;if(rnd()<(hard?.32:.12)+(inBox?.08:0))card='y';if(rnd()<(hard?.05:.008))card='r';
 if(card=='y'){const c=G.cards[d.p.id]=(G.cards[d.p.id]||0)+1;bx(d,'yc');if(c>=2){card='r';say(`Second yellow! ${d.p.ln} is sent off`,2.2)}else say(`Yellow card: ${d.p.ln}`,1.8)}
 if(card=='r'){bx(d,'rc');if((G.cards[d.p.id]||0)<2)say(`Red card! ${d.p.ln} is sent off`,2.2);sendOff(d)}
 if(inBox)return penStart(v),true;restart('fk',v.t,clamp(v.x,1,PL-1),clamp(v.y,1,PW-1));return true}
function sendOff(e){e.off=1;e.x=-20;e.y=-20;if(G.b.own===e)G.b.own=null;if(G.ctl===e)G.ctl=null}
// ---------- penalties ----------
function penStart(v){const s=G.dir[v.t],spot=goalX(s)-s*11,gk=gkOf(opp(v.t)),taker=onT(v.t).filter(e=>e.pos!='GK').sort((a,c)=>(c.p.sk.fin+c.p.sk.str*.2)-(a.p.sk.fin+a.p.sk.str*.2))[0];
 G.phase='pen';G.pen={e:taker,gk,t:0,aim:null,dive:null,meter:null,done:0};G.ent.forEach(o=>{if(o===taker||o===gk)return;o.x=goalX(s)-s*(20+rnd()*6);o.y=20+rnd()*28});taker.x=spot-s*1;taker.y=34;if(gk){gk.x=goalX(s);gk.y=34}
 Object.assign(G.b,{x:spot,y:34,z:0,vx:0,vy:0,own:null});if(taker.t===0&&!G.auto)G.ctl=taker;else if(gk&&gk.t===0&&!G.auto)G.ctl=gk;G.pen.wait=1.2}
function penShoot(aim,q){const P=G.pen,e=P.e,s=G.dir[e.t],gx=goalX(s),gk=P.gk;aim=aim==null?pick([-1,0,1]):aim;const dive=P.dive!=null?P.dive:(rnd()<.85?pick([-1,1]):0);P.dive=dive;
 let pg=.78+(e.p.sk.fin-65)*.004+(q||0)-(gk?(gk.p.sk.div-70)*.004:0);if(aim===dive)pg=aim===0?.2:.3;else if(aim===0&&dive!==0)pg=.88;if(q<-.15)pg*=.5;const miss=rnd()<(q<-.1?.25:.04);const goal=!miss&&rnd()<pg;
 const ty=34+aim*2.8*(miss?1.5:1),tz=miss&&rnd()<.5?2.9:.4+rnd()*1.2,T=.55;Object.assign(G.b,{own:null,lt:e,kind:'shot',t:0,vx:(gx-G.b.x)/T,vy:(ty-34)/T,vz:(tz+4.9*T*T)/T,z:.1,shot:{e,goal,onT:!miss,T,gk,pen:1}});
 bx(e,'sh');if(!miss)bx(e,'sot');if(gk)gk.dive={ty:34+dive*2.8,T:.45,t:0};P.done=1;G.phase='live';e.act={k:'shoot',t:0};G.ev.push('shot')}
// ---------- goals and the ball going out ----------
function scored(k,e){G.sc[k]++;if(e&&e.t===k){bx(e,'g');const a=G.b.pc&&G.b.pc!==e&&G.b.pc.t===k?G.b.pc:G.assist&&G.assist.t===k&&G.assist!==e?G.assist:null;if(a)bx(a,'a')}else if(e)say('Own goal!',2);
 say(e&&e.t===k?`GOAL! ${e.p.ln}`:'GOAL!',2.5);G.ev.push('goal');G.hype=2.5;G.cel={k,e,t:2.6};G.phase='dead';G.dead={t:2.6,fn:()=>kickoff(opp(k))}}
function outOfPlay(){const b=G.b,lt=b.lt?b.lt.t:G.lastTeam;
 if(b.y<0||b.y>PW){restart('throw',opp(lt),clamp(b.x,1,PL-1),b.y<0?.3:PW-.3);return}
 const leftGoal=b.x<0,k=leftGoal?(G.dir[0]<0?0:1):(G.dir[0]>0?0:1);// k = team attacking that goal
 if(b.y>GY0&&b.y<GY1&&b.z<GH){return scored(k,b.lt)}
 const def=opp(k);if(lt===k){const gkx=leftGoal?5.5:PL-5.5;return restart('gk',def,gkx,34+(b.y<34?-6:6))}
 // the defenders touched it last: a corner
 return restart('corner',k,leftGoal?.5:PL-.5,b.y<34?.5:PW-.5)}
// ---------- substitutions and fatigue ----------
function subOn(k,outE,inP){if(G.subs[k]>=5||!inP)return false;G.subs[k]++;G.bench[k]=G.bench[k].filter(id=>id!==inP.id);const ne=mkEnt(inP,k,outE.i,[outE.pos,outE.hx,outE.hy]);ne.x=outE.x;ne.y=outE.y;const i=G.ent.indexOf(outE);G.ent[i]=ne;if(G.b.own===outE)G.b.own=ne;if(G.ctl===outE)G.ctl=ne;G.bx[inP.id][SI.gp]=1;say(`Substitution: ${inP.ln} on for ${outE.p.ln}`,1.6);return true}
function cpuSubs(k){if(G.subs[k]>=5||clkMin()<55)return;onT(k).forEach(e=>{if(G.subs[k]>=5||e.pos=='GK')return;const st=G.st[e.p.id];if(st>55&&!e.hurt)return;const c=G.bench[k].map(id=>R.pl.find(p=>p.id===id)).filter(p=>p&&p.pos!='GK').sort((a,b)=>fitFor(b,e.pos)-fitFor(a,e.pos))[0];if(c&&(rnd()<.02||e.hurt))subOn(k,e,c)})}
// ---------- the AI ----------
function teamAI(e,dt){const b=G.b,k=e.t,s=G.dir[k],has=b.own&&b.own.t===k,iq=IQ(k);
 if(e.pos=='GK')return gkAI(e,dt);
 if(b.own===e)return carrierAI(e,dt);
 // a pass coming to him
 if(!b.own&&b.to===e&&b.kind!='shot'){const tx=b.x+b.vx*.25,ty=b.y+b.vy*.25;return seek(e,tx,ty,1)}
 // loose ball: the closest player from each team goes for it
 if(!b.own){const T=onT(k).filter(x=>x.pos!='GK').sort((a,c)=>bt(a)-bt(c));if(T[0]===e||(T[1]===e&&dist(e,b)<6)){const lead=Math.min(1,dist(e,b)/12);return seek(e,b.x+b.vx*lead,b.y+b.vy*lead,1)}}
 let [hx,hy]=homeSpot(e);
 if(has){// support: runs in behind, width, showing for the ball
  const c=b.own,gx=goalX(s);if((e.pos=='ST'||e.pos=='WG')&&(c.x-goalX(-s))*s>35&&!(e.cd.run>0)&&rnd()<dt*.5*iq){e.run=1.6;e.cd.run=4}
  if(e.run>0){e.run-=dt;const line=Math.max(...onT(opp(k)).filter(o=>o.pos!='GK').map(o=>o.x*s));hx=(line+6)*s;hx=s>0?Math.min(hx,PL-6):Math.max(hx,6);hy=e.y+(34-e.y)*.2;return seek(e,hx,hy,1)}
  if(e.pos=='FB'&&(c.x-goalX(-s))*s>60&&rnd()<dt*.15)e.run=1.2;
  if(dist(e,c)<8){hy+=e.y<c.y?-6:6}seek(e,hx,hy,.75);return}
 // defending: press the ball, cover, mark
 const c=b.own;if(c){const D=onT(k).filter(x=>x.pos!='GK').sort((a,x)=>dist(a,c)-dist(x,c)),press=feat('press')||(k===0&&G.press2>0)?2:1;
  if(D[0]===e){const own=goalX(-s),ux=own-c.x,uy=34-c.y,l=Math.hypot(ux,uy)||1;seek(e,c.x+ux/l*1.2,c.y+uy/l*1.2,1);if(dist(e,c)<1.9&&rnd()<dt*1.6*(.5+iq*.5))tackle(e,false);return}
  if(press>1&&D[1]===e&&dist(e,c)<14&&iq>.6){const own=goalX(-s);seek(e,c.x+(own-c.x)*.18,c.y+(34-c.y)*.18,.95);return}
  // mark the nearest attacker in my area
  const m=onT(opp(k)).filter(x=>x!==c&&x.pos!='GK').sort((a,x)=>Math.hypot(a.x-hx,a.y-hy)-Math.hypot(x.x-hx,x.y-hy))[0];if(m&&Math.hypot(m.x-hx,m.y-hy)<12){const own=goalX(-s);hx=m.x+(own-m.x)*.08*(e.p.sk.mrk/60);hy=m.y+(34-m.y)*.1}
  // cut out passing lanes
  if(b.to&&!b.own){}}
 seek(e,hx,hy,.8)}
function bt(e){const b=G.b,v=topSpd(e);return dist(e,b)/v}
function carrierAI(e,dt){const b=G.b,k=e.t,s=G.dir[k],gx=goalX(s),iq=IQ(k);e.cd.dec=(e.cd.dec||0)-dt;const fwd=(e.x-goalX(-s))*s;
 const pres=onT(opp(k)).filter(o=>dist(o,e)<3).length,space=!onT(opp(k)).some(o=>{const u=(o.x-e.x)*s;return u>-1&&u<7&&Math.abs(o.y-e.y)<4.5});
 if(e.cd.dec>0&&!(pres&&e.cd.dec>.15)){dribble(e,dt,fwd);return}
 e.cd.dec=(space?.45:.25)+(1-iq)*.2+rnd()*.15;
 // set pieces
 if(e.set){const set=e.set;e.set=null;if(set=='corner'){return crossBox(e)}if(set=='fk'&&Math.hypot(gx-e.x,34-e.y)<27&&rnd()<.6)return shoot(e,.85);if(set=='gk'||set=='throw'){const t=bestPass(e,true);if(t)return passTo(e,t.r,.4,t.long&&set=='gk'?'long':null)}}
 const q=shotQuality(e),dGoal=q.d;
 if(dGoal<30&&q.xg>(.062-(iq-.7)*.02)*(dGoal>20?.7:1)*(space&&dGoal>16?1.25:1))return shoot(e,.72+rnd()*.25);
 // cross from wide areas in the final third
 if(fwd>70&&(e.y<16||e.y>52)&&rnd()<.55+iq*.25)return crossBox(e);
 const t=bestPass(e);
 if(space&&fwd<88&&(!t||t.sc<.85)){dribble(e,dt,fwd);return}
 if(t&&t.sc>(pres?-.3:.1))return passTo(e,t.r,.45,t.kind);
 if(pres>=2&&t)return passTo(e,t.r,.45,t.kind);
 dribble(e,dt,fwd)}
function dribble(e,dt,fwd){const k=e.t,s=G.dir[k],gx=goalX(s);let ty=34+(e.y-34)*.6;const ahead=onT(opp(k)).filter(o=>{const u=(o.x-e.x)*s;return u>0&&u<7&&Math.abs(o.y-e.y)<3.5});if(ahead.length)ty=e.y+(ahead[0].y>e.y?-5:5);
 seek(e,e.x+s*8,clamp(ty,3,PW-3),fwd>55?.95:.85);if(ahead.length&&dist(ahead[0],e)<2.2&&rnd()<dt*1.2)skill(e)}
function bestPass(e,safe){const k=e.t,s=G.dir[k],iq=IQ(k);let best=null;
 onT(k).forEach(r=>{if(r===e||r.pos=='GK'&&!safe)return;const d=dist(e,r);if(d<5||d>45)return;const prog=((r.x-e.x)*s)/25,open=Math.min(...onT(opp(k)).map(o=>dist(o,r))),risk=laneRisk(e,r),q=shotQuality(r).xg;
  let sc=prog*1.1+Math.min(open,8)/8*.5-risk*1.8*iq+q*4-(d>32?.25:0)-(prog<0?.25:0)+(rnd()-.5)*(1-iq)*.8;const off=feat('offside')&&isOff(r);if(off)sc-=1.5*iq;
  const kind=d>32?'long':r.run>0&&(r.x-e.x)*s>4&&open>3?'through':null;if(!best||sc>best.sc)best={r,sc,kind,long:d>32}});return best}
function isOff(r){const s=G.dir[r.t],D=onT(opp(r.t)).map(x=>x.x*s).sort((a,c)=>c-a),second=D[1]!=null?D[1]:D[0];return r.x*s>second+.3&&(r.x-52.5)*s>0&&r.x*s>G.b.x*s}
function laneRisk(e,r){let risk=0;onT(opp(e.t)).forEach(d=>{const ax=r.x-e.x,ay=r.y-e.y,l2=ax*ax+ay*ay||1,u=clamp(((d.x-e.x)*ax+(d.y-e.y)*ay)/l2,0,1),px=e.x+ax*u,py=e.y+ay*u,dd=Math.hypot(d.x-px,d.y-py);if(dd<2.5)risk+=(2.5-dd)/2.5*(.5+d.p.sk.int/200)});return risk}
function crossBox(e){const k=e.t,s=G.dir[k],gx=goalX(s);const T=onT(k).filter(r=>r!==e&&(r.pos=='ST'||r.pos=='WG'||r.pos=='CM'||r.pos=='CB')).sort((a,c)=>Math.abs(a.x-gx)-Math.abs(c.x-gx))[0];
 const tx=gx-s*(7+rnd()*5),ty=34+(rnd()-.5)*10;const fake={x:tx,y:ty,vx:0,vy:0,t:k};passTo(e,T||fake,0,'cross');G.b.to=T||null;G.b.crossT={x:tx,y:ty};if(T){T.run=1.5}}
function skill(e){if((e.cd.sk||0)>0)return;e.cd.sk=1.5;e.act={k:'skill',t:0};const d=onT(opp(e.t)).sort((a,c)=>dist(a,e)-dist(c,e))[0];if(d&&dist(d,e)<3.5&&rnd()<clamp(.3+(e.p.sk.dri-d.p.sk.tkl)/110+(e.p.sk.agi-60)/300,.08,.75)){d.stun=.7;e.cd.beat=.6;say('Skill move!',.8)}const s=G.dir[e.t];e.vx+=s*3}
function gkAI(e,dt){const b=G.b,k=e.t,s=G.dir[k],own=goalX(-s);
 if(e.dive){const d=e.dive;d.t+=dt;e.y+=(clamp(d.ty,GY0,GY1)-e.y)*Math.min(1,dt*9);e.act={k:'dive',t:.1};if(d.t>d.T+.6)e.dive=null;return}
 if(b.own===e){e.cd.dec=(e.cd.dec||0)-dt;if(e.cd.dec<=0){const t=bestPass(e,true);if(t&&rnd()<.75)return passTo(e,t.r,.3,t.long?'long':null);const r=onT(k).filter(x=>x.pos=='ST'||x.pos=='WG').sort(()=>rnd()-.5)[0];if(r)return passTo(e,r,.3,'long')}seek(e,own+s*6,34,.5);return}
 const inBox=Math.abs(b.x-own)<16.5&&b.y>13.85&&b.y<54.15;
 if(!b.own&&inBox&&b.z<2.6&&b.kind!='shot'){const T=G.ent.filter(x=>!x.off&&x.pos!='GK').sort((a,c)=>dist(a,b)-dist(c,b))[0];if(!T||dist(e,b)<dist(T,b)+1)return seek(e,b.x,b.y,1)}
 if(b.own&&b.own.t!==k&&inBox&&dist(b.own,e)<6&&rnd()<dt*2){return seek(e,b.own.x,b.own.y,1)}
 const [x,y]=homeSpot(e);seek(e,x,clamp(y,GY0+.3,GY1-.3),.9)}
// movement
function topSpd(e){let v=6.2+(e.p.sk.spd-60)*.045;if(feat('fatigue'))v*=.86+.14*Math.min(1,(G.st[e.p.id]||100)/70);if(G.b.own===e)v*=.9+(e.p.sk.dri-60)*.002;return v}
function seek(e,tx,ty,f){const dx=tx-e.x,dy=ty-e.y,d=Math.hypot(dx,dy),v=topSpd(e)*(f||1)*(e.spr?1.18:1),want=d<.3?0:Math.min(v,d*3);e.tx=d?dx/d*want:0;e.ty=d?dy/d*want:0}
// ---------- the main step ----------
const KEYS={};
function clkMin(){return G.half==1?G.clk:45+G.clk}
function hStep(dt){if(!G||!G.live)return;G.msgT-=dt;if(G.press2>0)G.press2-=dt;if(G.hype>0)G.hype-=dt;
 if(G.phase=='dead'){G.dead.t-=dt;moveAll(dt,true);if(G.dead.t<=0){const f=G.dead.fn;G.dead=null;G.phase='live';cpuSubs(1);if(G.auto)cpuSubs(0);f()}return}
 if(G.phase=='pen')return penStep(dt);
 if(G.phase=='over')return;
 // the clock: each half lasts G.hl real seconds and shows 45 minutes
 G.clk+=dt*45/G.hl;
 if(G.clk>=45+G.stop[G.half-1]&&!(G.b.kind=='shot'&&!G.b.own)){return endHalf()}
 G.ent.forEach(e=>{if(e.off)return;G.secs[e.p.id]=(G.secs[e.p.id]||0)+dt*45/G.hl*60;if(feat('fatigue')){const sp=Math.hypot(e.vx,e.vy),dr=(e.spr?2.2:sp>5?1:.35)*.55*(1.3-e.p.sk.sta/120);G.st[e.p.id]=Math.max(0,(G.st[e.p.id]||100)-dr*dt*45/G.hl)}});
 G.ent.forEach(e=>{if(e.off)return;e.tx=0;e.ty=0;for(const c in e.cd)if(c!='dec')e.cd[c]-=dt;if(e.stun>0)e.stun-=dt;
  if(e===G.ctl&&userControls(e,dt))return;teamAI(e,dt)});
 moveAll(dt);ballStep(dt);
 const b=G.b;if(b.own)G.poss[b.own.t]+=dt}
function endHalf(){if(G.half==1){G.half=2;G.clk=0;G.dir=[G.dir[1],G.dir[0]];say('Half time',2.5);G.ev.push('whistle');G.phase='dead';G.dead={t:2.5,fn:()=>kickoff(1)};G.halfT=1;return}
 G.phase='over';G.live=0;say('Full time',3);G.ev.push('whistle')}
function moveAll(dt,slow){G.ent.forEach(e=>{if(e.off)return;const a=8+(e.p.sk.acc-60)*.08;if(e.stun>0){e.tx*=.25;e.ty*=.25}const k=Math.min(1,a*dt/Math.max(.5,Math.hypot((e.tx||0)-e.vx,(e.ty||0)-e.vy)));
  e.vx+=((e.tx||0)-e.vx)*Math.min(1,k*2);e.vy+=((e.ty||0)-e.vy)*Math.min(1,k*2);if(slow){e.vx*=.92;e.vy*=.92}e.x=clamp(e.x+e.vx*dt,-3,PL+3);e.y=clamp(e.y+e.vy*dt,-3,PW+3);if(Math.hypot(e.vx,e.vy)>.6)e.fa=Math.atan2(e.vy,e.vx);if(e.act){e.act.t+=dt;if(e.act.t>.7)e.act=null}});
 for(let i=0;i<G.ent.length;i++)for(let j=i+1;j<G.ent.length;j++){const a=G.ent[i],c=G.ent[j];if(a.off||c.off)continue;const dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy),m=.8;if(d<m&&d>0){const p=(m-d)/2,ux=dx/d,uy=dy/d;a.x-=ux*p;a.y-=uy*p;c.x+=ux*p;c.y+=uy*p}}}
function ballStep(dt){const b=G.b;
 if(b.own){const e=b.own,f=e.fa;b.x=e.x+Math.cos(f)*.55;b.y=e.y+Math.sin(f)*.55;b.z=0;b.vx=e.vx;b.vy=e.vy;
  // defenders close by can take it off him
  if(b.x<0||b.x>PL||b.y<0||b.y>PW){b.own=null;return outOfPlay()}return}
 b.t=(b.t||0)+dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;
 if(b.z>0||b.vz>0){b.vz-=9.8*dt;if(b.z<=0){b.z=0;b.vz=Math.abs(b.vz)>2.5?-b.vz*.45:0;if(!(b.kind=='shot'&&b.shot)){b.vx*=.75;b.vy*=.75}}}else if(!(b.kind=='shot'&&b.shot)){const sp=Math.hypot(b.vx,b.vy);if(sp>0){const ns=Math.max(0,sp-DEC*4*dt)*(1-ROLL*dt*.3);b.vx*=ns/sp;b.vy*=ns/sp}}
 // shots: goal, save or miss as decided when struck
 if(b.kind=='shot'&&b.shot&&(b.t>b.shot.T+1.2||Math.hypot(b.vx,b.vy)<3)){b.shot=null;b.kind='loose'}
 if(b.kind=='shot'&&b.shot){const S=b.shot;if(S.blocked&&b.t>.12){G.ev.push('block');say(`Blocked by ${S.blocked.p.ln}`,1);if(rnd()<.35){const gx=goalX(G.dir[S.e.t]);b.shot=null;return restart('corner',S.e.t,gx<1?.5:PL-.5,b.y<34?.5:PW-.5)}b.vx=-b.vx*.3+(rnd()-.5)*6;b.vy=(rnd()-.5)*8;b.vz=2;b.kind='loose';b.shot=null;b.lt=S.blocked;return}
  if(S.onT&&!S.goal&&S.gk&&b.t>=S.T*.92){const gk=S.gk;bx(gk,'sv');b.shot=null;b.kind='loose';G.ev.push('save');const hold=rnd()<.35+gk.p.sk.han/220;if(hold){say(`Saved by ${gk.p.ln}`,1.3);b.x=gk.x;b.y=gk.y;give(gk);gk.cd.dec=1.2;return}
   say(`Great save, ${gk.p.ln}!`,1.3);if(rnd()<.5){const gx=goalX(-G.dir[gk.t]);b.shot=null;return restart('corner',opp(gk.t),gx<1?.5:PL-.5,b.y<34?.5:PW-.5)}const s=G.dir[gk.t];b.vx=s*(5+rnd()*6);b.vy=(rnd()<.5?-1:1)*(4+rnd()*8);b.vz=3+rnd()*3;b.lt=gk;return}}
 if(b.x<0||b.x>PL||b.y<0||b.y>PW){if(b.kind=='shot'&&b.shot&&b.shot.goal){const S=b.shot;b.shot=null;b.lt=S.e;return scored(S.e.t,S.e)}return outOfPlay()}
 if(b.kind=='shot'&&b.shot)return;
 // offside when the pass arrives
 // who can control it
 let best=null,bs=0;G.ent.forEach(e=>{if(e.off||e.stun>.3)return;const mine0=b.from&&b.from.t===e.t,d=Math.hypot(e.x-b.x,e.y-b.y),reach=e.pos=='GK'?1.6:mine0||!b.from?1.05:.8;if(d>reach||b.z>(e.pos=='GK'?2.6:1.9))return;if(b.from===e&&b.t<.25)return;
  const sp=Math.hypot(b.vx,b.vy),own=b.to===e,mine=b.from&&b.from.t===e.t;let w=(own?3:mine?1.2:.55)*(1.6-d)*(e.p.sk[mine?'ctl':'int']/60)*(sp>12&&!mine?.4:1)*(.6+rnd()*.8);if(e.pos=='GK'&&Math.abs(e.x-goalX(-G.dir[e.t]))<16.5)w*=3;if(w>bs){bs=w;best=e}});
 if(best&&(best.t!==(b.from&&b.from.t)||b.t>.15)){
  if(b.offside&&best===b.offside.r&&feat('offside')){const o=b.offside;b.offside=null;say('Offside',1.2);G.ev.push('whistle');return restart('fk',opp(best.t),clamp(o.x,1,PL-1),clamp(o.y,1,PW-1))}
  // a header from a cross
  if(b.kind=='cross'&&b.z>.9){const s=G.dir[best.t],gx=goalX(s);if(best.t===b.from.t&&Math.abs(gx-best.x)<14){const hdr=G.ent.filter(o=>!o.off&&o.t!==best.t&&o.pos!='GK'&&dist(o,best)<1.6).sort((a,c)=>c.p.sk.hd-a.p.sk.hd)[0];
    if(hdr&&rnd()<.5+(hdr.p.sk.hd+hdr.p.sk.str*.4-best.p.sk.hd-best.p.sk.str*.4)/120){G.ev.push('head');b.kind='loose';b.offside=null;b.vx=G.dir[hdr.t]*(8+rnd()*6);b.vy=(rnd()-.5)*10;b.vz=4;b.lt=hdr;b.from=hdr;bx(hdr,'int');return}
    b.own=best;give(best);b.own=null;headShot(best);return}}
  if(best.t!==(b.from&&b.from.t)&&b.from){bx(best,'int');if(b.kind=='pass'||b.kind=='through'||b.kind=='long')G.ev.push('steal')}else if(b.pc&&b.from&&best.t===b.from.t&&best!==b.from)bx(b.pc,'pac');
  G.assist=b.from&&b.from.t===best.t&&b.from!==best?b.from:null;b.offside=null;b.kind=null;b.to=null;give(best)}}
function headShot(e){const s=G.dir[e.t],gx=goalX(s),d=Math.hypot(gx-e.x,34-e.y);let xg=clamp(.42*Math.exp(-d/7)*(e.p.sk.hd/62),.02,.6);const gk=gkOf(opp(e.t));
 G.b.own=e;shoot(e,.6,34+(rnd()-.5)*GW);const S=G.b.shot;if(S){const goal=rnd()<xg;S.goal=goal;S.onT=goal||rnd()<.45;if(goal){const ty=rnd()<.5?GY0+.6:GY1-.6;const T=S.T;G.b.vy=(ty-e.y)/T}e.act={k:'head',t:0};say('Header!',.8)}}
function penStep(dt){const P=G.pen;P.wait-=dt;moveAll(dt,true);if(P.wait>0)return;
 if(P.e.t===0&&!G.auto){if(P.meter)P.meter.t+=dt;if(P.meter&&P.meter.t>1.3)penRelease();return}
 if(P.gk&&P.gk.t===0&&!G.auto&&!P.guess){P.gwait=(P.gwait||0)+dt;if(P.gwait<1.6)return}
 penShoot(pick([-1,0,1,-1,1]),gauss()*.03)}
function penRelease(){const P=G.pen;if(!P||!P.meter)return;const v=P.meter.t/.75,dv=Math.abs(v-.9),q=dv<.08?.06:dv<.18?0:-(dv-.18)*.9;P.meter=null;const mv=moveVec();const aim=mv?(Math.abs(mv[1])>.4?(mv[1]<0?-1:1)*G.dir[0]:0):0;penShoot(aim,q)}
function setCtl(){if(G.auto){G.ctl=null;return}const b=G.b;if(b.own&&b.own.t===0){G.ctl=b.own;return}const T=onT(0).filter(e=>e.pos!='GK');if(!G.ctl||G.ctl.off||G.ctl.t!==0)G.ctl=T.sort((a,c)=>dist(a,b)-dist(c,b))[0]}
function autoPlay(){return !!G.auto}
