'use strict';
// Career mode: create one player and play only him. You get drafted, the coach decides your minutes, you earn XP
// from how you play and spend it on upgrades, unlock X-factor abilities, answer the press, make off-field choices,
// sign contracts and test free agency, and retire when you are ready. Career mode keeps its own save.
{const add=[['Career','xf','X-factor abilities','Unlock special abilities as you level up (Deadeye, Posterizer, Lockdown...).'],
 ['Career','press','Press conferences','Answer reporters after big games. Your answers affect fans, teammates and the coach.'],
 ['Career','events','Off-field choices','Decisions between games: extra practice, charity events, nights out...']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const CAREER=()=>OPT.mode==='career';
{const _sk=slotKey;slotKey=function(n){return CAREER()?'hoops_career':_sk(n)}}
const ARCH={scorer:['Scorer','Gets buckets from everywhere.',{mid:10,thr:6,lay:8,dnk:3,han:3,pas:-4,pd:-4,id:-4}],play:['Playmaker','Sees the floor and runs the offense.',{pas:12,vis:12,han:10,spd:4,thr:2,str:-6,blk:-6}],
 three:['3 and D','Shoots threes and locks up the other team\'s best wing.',{thr:12,pd:10,stl:6,ft:4,han:-3,post:-6,dnk:-4}],rim:['Rim protector','Blocks shots and owns the boards.',{blk:12,id:12,drb:10,orb:8,str:6,thr:-10,han:-8}],ath:['Athlete','Faster and bouncier than everyone.',{spd:10,acc:10,vert:12,dnk:10,sta:6,thr:-4,mid:-4,vis:-4}]};
const XF={dead:['Deadeye','Contested jumpers go in more often.'],post:['Posterizer','Dunk on anyone, even in traffic.'],gen:['Floor general','Your passes are hard to pick off, and teammates hit more open shots off them.'],
 lock:['Lockdown','Players you guard shoot worse.'],glass:['Glass cleaner','You get to more rebounds.'],ankle:['Ankle breaker','Your crossovers work more often.'],micro:['Microwave','You heat up after just two makes.'],iron:['Iron man','You tire much more slowly.']};
const me=()=>R&&R.car?R.pl.find(p=>p.id===R.car.id):null;
const hasXF=k=>feat('xf')&&R&&R.car&&R.car.xf.includes(k);
// ---------- creating a player ----------
{const _su=startUI;startUI=function(){_su();try{const c=$('ui').querySelector('.start');if(!c)return;if(CAREER()){c.querySelector('.card').outerHTML=careerCreateHTML()}else c.insertAdjacentHTML('beforeend',`<div class="card"><h3>Career mode</h3><p>Create one player and play only him: get drafted, earn XP, unlock abilities and chase a title. It has its own save.</p>${B("OPT.mode='career';optSave();location.reload()",'Start a career')}</div>`)}catch(e){console.error(e)}}}
function careerCreateHTML(){return`<div class="card"><h3>Create your player</h3><label>First name <input id="cfn" maxlength="14" value="${esc(pick(FN))}"></label><label>Last name <input id="cln" maxlength="16" value="${esc(pick(LN))}"></label>
 <label>Position <select id="cpos" onchange="$('cht').min=HT[this.value][0];$('cht').max=HT[this.value][1];$('cht').value=Math.round((HT[this.value][0]+HT[this.value][1])/2);$('chtv').textContent=htTxt(+$('cht').value)">${POS.map(p=>`<option value="${p}" ${p=='SG'?'selected':''}>${POSN[p]}</option>`).join('')}</select></label>
 <label>Height <input type="range" id="cht" min="75" max="79" value="77" oninput="$('chtv').textContent=htTxt(+this.value)"> <b id="chtv">6'5"</b></label><p class="small">Taller: better inside and on the boards. Shorter: quicker, better handles.</p>
 <label>Style <select id="carch">${Object.keys(ARCH).map(k=>`<option value="${k}">${ARCH[k][0]}: ${ARCH[k][1]}</option>`).join('')}</select></label><label>Number <input id="cnum" type="number" min="0" max="55" value="${ri(0,55)}"></label>
 <label>Difficulty <select id="nd">${DIFFN.map((d,i)=>`<option value="${i}" ${i==1?'selected':''}>${d}</option>`).join('')}</select></label><label>Quarter length <select id="nq">${[2,3,4,6,8,12].map(q=>`<option value="${q}" ${q==4?'selected':''}>${q} minutes</option>`).join('')}</select></label>
 ${B('careerGo()','Enter the draft','big')}<p class="small">${B("OPT.mode='franchise';optSave();location.reload()",'Back to franchise mode','xs')}</p></div>`}
function careerGo(){const pos=$('cpos').value,ht=+$('cht').value,arch=$('carch').value,fn=$('cfn').value.trim()||'Rookie',ln=$('cln').value.trim()||'Player';
 newLeague({slen:30,qlen:+$('nq').value,diff:+$('nd').value});const p=mkPlayer(pos,19,52,0,-1);p.fn=fn;p.ln=ln;p.n=fn+' '+ln;p.ht=ht;p.num=clamp(+$('cnum').value||0,0,55);const pr=ARCH[arch][2];
 HK.forEach(k=>{let v=53+(PROF[pos][k]||0)*.6+(pr[k]||0)+gauss()*2;if(k=='vert'||k=='blk'||k=='orb'||k=='drb'||k=='id')v+=(ht-(HT[pos][0]+HT[pos][1])/2)*1.5;if(k=='spd'||k=='acc'||k=='han')v-=(ht-(HT[pos][0]+HT[pos][1])/2)*1.1;p.sk[k]=clamp(Math.round(v),32,76);p.mx[k]=clamp(Math.round(p.sk[k]+26+(pr[k]||0)*.5),p.sk[k],99)});
 p.pers='Competitor';p.mor=75;p.s0=ovr(p);R.pl.push(p);
 // draft night: one of the worst teams takes you, and that team becomes yours
 const bad=R.t.map((_,i)=>i).sort((a,b)=>teamOvr(a)-teamOvr(b)).slice(0,8),j=pick(bad),no=bad.indexOf(j)+1;swapTeam(j);p.tid=0;p.sal=clamp(9-no*.6,3,9);p.exp=R.season+3;p.rook=R.season;p.draft={s:R.season-1,rd:1,no,t:0};fixNum(p,0);
 R.car={id:p.id,xp:0,lvl:1,pts:2,xf:[],fans:20,trust:50,arch,log:[],evd:0};R.mode='career';R.camp=0;R.plan='bal';
 addNews(`With pick #${no}, the ${R.t[0].n} select ${p.n}!`,1);hSave();careerHome();setTimeout(()=>modal(`<h2>Draft night</h2><p>With the #${no} pick, the <b>${esc(R.t[0].n)}</b> select <b>${esc(p.n)}</b>.</p><p>You start as a ${ovr(p)} overall. Play well to earn XP and minutes. The coach calls the plays and runs the roster.</p>`),60)}
// ---------- the career home page ----------
const NAVC=['home','roster','tstats','sched','box','stand','pr','lead','po','hl','hist','ach','feat','set','keys'];
{const _ok=navOK;navOK=function(k){if(CAREER())return NAVC.includes(k);return _ok(k)}}
{const _hu=homeUI;homeUI=function(){if(CAREER()&&R&&R.car)return careerHome();return _hu()}}
function lvlNeed(l){return 100+l*40}
function careerHome(){PAGE='home';const p=me();if(!p){OPT.mode='franchise';optSave();return startUI()}const C=R.car,T=R.t[0];let next='';
 if(R.stage)next=`<div class="card hot"><h3>Offseason</h3><p>${R.stage=='draft'?'The draft is underway.':R.stage=='resign'?'Teams are re-signing players.':'Free agency is open.'}</p>${B('careerOff()','Continue the offseason','big')}</div>`;
 else if(R.po){const s=poUserSeries();if(R.po.champ!=null)next='';else if(s){const o=s.a===0?s.b:s.a,w=s.a===0?s.w:[s.w[1],s.w[0]];next=`<div class="card hot"><h3>${RDN[R.po.rd]} · Game ${s.w[0]+s.w[1]+1}</h3><p>vs ${tlink(o)} · Series ${w[0]}-${w[1]}</p><div class="row">${B('playGame()','Play the game','big')}${B('simGameUI()','Sim the game')}${B('simSeriesUI()','Sim the series')}</div></div>`}
  else next=`<div class="card"><h3>Playoffs</h3><p>Your season is over.</p>${B('poAllUI()','Sim to the end')}</div>`}
 else{const g=nextGame();if(g){const o=g[0]===0?g[1]:g[0];next=`<div class="card hot"><h3>Game ${R.day+1} of ${R.sched.length}</h3><p>${g[0]===0?'vs':'@'} ${tlink(o)} (${rec(o)})</p><div class="row">${B('playGame()','Play the game','big')}${B('simGameUI()','Sim the game')}${B('simDaysUI(7)','Sim a week')}${B('simDaysUI(999)','Sim to the playoffs')}</div></div>`}}
 const role=rotation(0).indexOf(p),rl=p.inj?`Hurt (${p.inj} games)`:role<0?'-':role<5?'Starter':role<8?'Sixth to eighth man':role<10?'Bench':'End of the bench',need=lvlNeed(C.lvl);
 const st=k=>f1(pg(p,k));
 shell(`<div class="head ph"><div>${feat('faces')?faceSVG(p,72):''}</div><div><h1>${esc(p.n)} <small>#${p.num}</small></h1><p>${POSN[p.pos]} · ${esc(T.n)} (${rec(0)}) · ${p.age} years · ${htTxt(p.ht)} · ${rl} · ${money(p.sal)} through season ${p.exp}</p></div><div class="ov">${ovrPill(ovr(p))}<small>overall</small></div></div>
 ${next}<div class="grid3"><div class="card"><h3>Level ${C.lvl}</h3><div class="stb" style="width:100%"><em style="width:${Math.min(100,C.xp/need*100)}%;background:#f97316"></em></div><p class="small">${Math.round(C.xp)} / ${need} XP · <b>${C.pts}</b> upgrade points</p>${B('carUpUI()','Upgrade my player')}</div>
 <div class="card"><h3>This season</h3><p>${p.ss[SI.gp]} games · <b>${st('pts')}</b> pts · ${f1(pg(p,'orb')+pg(p,'drb'))} reb · ${st('ast')} ast · ${st('stl')} stl · ${st('blk')} blk</p><p class="small">FG ${pct(p.ss[SI.fgm],p.ss[SI.fga])}% · 3PT ${pct(p.ss[SI.tpm],p.ss[SI.tpa])}% · FT ${pct(p.ss[SI.ftm],p.ss[SI.fta])}%</p></div>
 <div class="card"><h3>Standing</h3><p>Coach's trust ${Math.round(C.trust)}/100<br>Fans ${Math.round(C.fans)}/100<br>Mood ${Math.round(p.mor)}/100</p>${feat('xf')&&C.xf.length?`<p class="small">X-factors: ${C.xf.map(k=>XF[k][0]).join(', ')}</p>`:''}</div></div>
 <div class="card"><h3>News</h3><ul class="news">${R.news.slice(0,8).map(n=>`<li class="${n.m?'mine':''}">${esc(n.t)}</li>`).join('')}</ul></div>${p.age>=33?`<p>${B('retireUI()','Retire')}</p>`:''}`);
 if(C.pendingXF)setTimeout(xfPick,60);else if(C.pendingEv)setTimeout(evUI,60)}
// upgrades
function carUpUI(){const p=me(),C=R.car;modal(`<h2>Upgrade ${esc(p.n)}</h2><p>${C.pts} upgrade points. Each point gives random boosts inside one group, up to your potential (the tick marks).</p><div class="grps">${Object.keys(HG).map(gk=>`<div class="grp"><div class="gh"><b>${HG[gk][0]}</b>${B(`carUp('${gk}')`,hRoom(p,gk)?'Upgrade (1)':'Maxed','xs '+(hRoom(p,gk)&&C.pts?'':'off'))}</div>${HG[gk][1].map(k=>`<div class="rt"><span>${HN[k]}</span><i><em style="width:${p.sk[k]}%"></em><u style="left:${p.mx[k]}%"></u></i><b>${p.sk[k]}</b></div>`).join('')}</div>`).join('')}</div>`)}
function carUp(gk){const p=me(),C=R.car;if(C.pts<1||!hRoom(p,gk))return;C.pts--;const b=ovr(p),g=hUp(p,gk,3);hSave();carUpUI();toast(`${gotTxt(g)||'no change'}${ovr(p)>b?` · overall ${ovr(p)}`:''}`)}
function addXP(n,why){const C=R.car;if(!C)return;C.xp+=n;let up=0;while(C.xp>=lvlNeed(C.lvl)){C.xp-=lvlNeed(C.lvl);C.lvl++;C.pts+=2;up++;if(feat('xf')&&C.lvl%3==0&&C.xf.length<Object.keys(XF).length)C.pendingXF=1}if(up)addNews(`${me().n} reached level ${C.lvl}.`,1)}
function xfPick(){const C=R.car;if(!C.pendingXF)return;const left=Object.keys(XF).filter(k=>!C.xf.includes(k)),opts=left.sort(()=>rnd()-.5).slice(0,3);modal(`<h2>New X-factor</h2><p>You reached level ${C.lvl}. Pick an ability:</p>${opts.map(k=>`<p>${B(`xfTake('${k}')`,`<b>${XF[k][0]}</b>: ${XF[k][1]}`)}</p>`).join('')}`);$('modal').onclick=null}
function xfTake(k){const C=R.car;C.xf.push(k);C.pendingXF=0;hSave();closeModal();addNews(`${me().n} unlocked ${XF[k][0]}.`,1);careerHome()}
// ---------- in the game: you control only your player ----------
function myEnt(){if(!G||!R.car)return null;return G.ent.find(e=>e.p.id===R.car.id)||null}
{const _sc=setCtl;setCtl=function(){if(!CAREER()||!G||G.auto||G.viewer)return _sc();G.ctl=myEnt()}}
{const _uc=userControls;userControls=function(e,dt){if(!CAREER())return _uc(e,dt);const mv=moveVec(),b=G.b;if(!mv&&G.poss===0&&!(b.st=='held'&&b.h===e)&&!G.meter)return false;return _uc(e,dt)}}
{const _ng=newGame;newGame=function(...a){const g=_ng.apply(this,a);if(CAREER()&&!g.auto){g.career=R.car.id;g.ctl=null;setTimeout(()=>{if(G===g){setCtl();if(g.calls)cpuCall(0)}},0)}return g}}
// the coach calls your team's plays and timeouts in career mode
{const _np=newPossCalls;newPossCalls=function(){_np();if(CAREER()&&G&&G.calls&&rnd()<.4)cpuCall(0)}}
function callForBall(){const e=G.ctl,b=G.b;if(!e||G.poss!==0||b.st!='held'||b.h===e||b.h.t!==0)return;const h=b.h,risk=passRisk(h,e),op=openness(e);G.callT=1.2;
 if(risk<.35&&op>2.5&&rnd()<.5+R.car.trust/200){passTo(h,e)}else say(op<=2.5?'You are covered':'He keeps it',.8)}
{const _k=hKey;hKey=function(code,down){if(!CAREER()||!G||G.rp)return _k(code,down);
  if(down&&G.phase=='live'){if(code=='KeyE'&&G.poss===0&&G.ctl&&G.b.st=='held'&&G.b.h!==G.ctl){callForBall();return}if((code=='Tab'||code=='KeyQ')&&G.poss===1)return;if(code=='KeyC'||code=='KeyV'||code=='KeyX'||code=='KeyT')return;if(code=='KeyF'&&G.poss===0)return}
  if(down&&code=='Space'&&!G.ctl&&G.phase!='ft'){G.ffw=!G.ffw;return}return _k(code,down)}}
{const _cl=hClick;hClick=function(x,y){if(CAREER()&&G&&G.poss===1)return;return _cl(x,y)}}
// on the bench, the game runs faster
{const _st=hStep;hStep=function(dt){_st(dt);if(!CAREER()||!G||G.auto||G.viewer||G.rp||G.intro>0)return;if(!myEnt()&&G.phase!='over'){G.ctl=null;const n=G.ffw?7:3;for(let i=0;i<n&&G&&G.phase!='over'&&!myEnt();i++)_st(dt)}else if(!G.ctl&&myEnt())setCtl();
  if(hasXF('iron')){const e=myEnt();if(e)G.st[e.p.id]=Math.min(100,G.st[e.p.id]+dt*.04*(12*60/G.ql))}}}
{const _dh=drawHUD;drawHUD=function(){_dh();if(!CAREER()||!G||G.auto||G.viewer||G.rp)return;try{CX.textAlign='center';CX.textBaseline='middle';
  if(!myEnt()&&G.phase!='over'){CX.fillStyle='rgba(15,23,42,.85)';CX.fillRect(VW/2-170,VH/2-30,340,60);CX.fillStyle='#fde68a';CX.font='800 18px system-ui';CX.fillText('You are on the bench',VW/2,VH/2-8);CX.fillStyle='#cbd5e1';CX.font='500 12px system-ui';CX.fillText(G.ffw?'Fast forward (Space to slow down)':'Space: fast forward until you go back in',VW/2,VH/2+14)}
  else if(G.poss===0&&G.ctl&&G.b.st=='held'&&G.b.h!==G.ctl&&G.phase=='live'){CX.fillStyle='rgba(15,23,42,.75)';CX.font='600 12px system-ui';const t='E: call for the ball · move to get open';const w=CX.measureText(t).width+20;CX.fillRect(VW/2-w/2,VH-88,w,20);CX.fillStyle='#fde68a';CX.fillText(t,VW/2,VH-78)}}catch(x){}}}
// coach's trust moves you up or down the rotation
{const _ro=rotation;rotation=function(t){const L=_ro(t);if(!CAREER()||t!==0||!R.car||R.rot[0])return L;const p=L.find(q=>q.id===R.car.id);if(!p)return L;const i=L.indexOf(p),bonus=Math.round((R.car.trust-50)/12);const j=clamp(i-bonus,0,Math.min(L.length-1,R.car.trust>=40?4:7));if(j!==i){L.splice(i,1);L.splice(j,0,p)}
  // keep the starting five balanced by position: only jump into the top 5 by replacing someone at your position
  return L}}
// X-factors in the game
{const _sa=shotAdj;shotAdj=function(e,typ,info){let a=_sa(e,typ,info);if(!CAREER()||!G||!R.car)return a;const mine=e.p.id===R.car.id;
  if(mine&&hasXF('dead')&&typ!='rim'&&typ!='dunk'){const D=onT(opp(e.t)).sort((x,y)=>dist(x,e)-dist(y,e))[0];if(D&&dist(D,e)<4)a+=.035}
  if(mine&&hasXF('post')&&(typ=='dunk'||typ=='rim'))a+=.05;
  if(!mine&&e.t===1&&hasXF('lock')){const m=myEnt();if(m&&dist(m,e)<4.5)a-=.04}
  if(mine&&hasXF('micro')&&G.hot&&(G.hot[e.p.id]||0)>=2)a+=.035;
  if(e.t===0&&!mine&&hasXF('gen')&&G.b&&G.b.ast&&G.b.ast.p.id===R.car.id)a+=.02;return a}}
{const _pr=passRisk;passRisk=function(e,r){const v=_pr(e,r);return CAREER()&&hasXF('gen')&&e.p.id===(R.car&&R.car.id)?v*.6:v}}
{const _rp=rebPick;rebPick=function(k,hx){const w=_rp(k,hx);if(CAREER()&&hasXF('glass')&&w.p.id!==R.car.id){const m=myEnt();if(m&&Math.hypot(m.x-hx,m.y-25)<14&&rnd()<.3)return m}return w}}
{const _cr=crossover;crossover=function(){const e=G.ctl,d=e&&e.man,was=d&&d.stun;_cr();if(CAREER()&&hasXF('ankle')&&d&&!(d.stun>0)&&dist(d,e)<5&&rnd()<.25){d.bite=.6;d.stun=.6;say('Crossed him up!',1)}}}
// ---------- after each game: XP, trust, the press ----------
function gameXP(b,won){return b[SI.pts]*1+(b[SI.orb]+b[SI.drb])*1.2+b[SI.ast]*1.5+b[SI.stl]*2+b[SI.blk]*2-b[SI.tov]*1.2-(b[SI.fga]-b[SI.fgm])*.4+(won?15:4)}
{const _rg=recGame;recGame=function(a,b,res,played){_rg(a,b,res,played);try{if(!CAREER()||!R.car||(a!==0&&b!==0))return;const k=a===0?0:1,S=res.T[k],i=S.ps.findIndex(p=>p.id===R.car.id),won=res.sc[k]>res.sc[1-k];
  if(i<0)return;const bx0=S.box[i];let x=gameXP(bx0,won)*(played?1:.45);if(played&&G&&G.ql<720&&!feat('pscale'))x*=720/G.ql*.6;addXP(Math.max(3,x));
  const C=R.car;C.trust=clamp(C.trust+(gsc(bx0)-8)*.25+(won?.5:-.3),0,100);C.fans=clamp(C.fans+(bx0[SI.pts]>=25?1.5:0)+(won?.3:-.2),0,100);C.lastBox=bx0.slice();C.lastWon=won;C.lastPlayed=played}catch(e){console.error(e)}}}
{const _dg=doneGame;doneGame=function(){const car=CAREER();_dg();if(car&&R.car){const C=R.car,b=C.lastBox;if(feat('press')&&C.lastPlayed&&b&&(b[SI.pts]>=20||rnd()<.3))setTimeout(pressUI,80);else if(feat('events')&&rnd()<.25){C.pendingEv=1;careerHome()}}}}
const PRESSQ=[['How do you feel about your game tonight?',[['Just doing my job. The team made it happen.',{fans:1,trust:2,team:3}],['I knew I was going to take over.',{fans:4,trust:-1,team:-2}],['I can play a lot better.',{fans:0,trust:3,team:1}]]],
 ['What does the team need to do better?',[['Keep playing together.',{trust:1,team:2}],['Get me the ball more.',{fans:3,trust:-3,team:-3}],['Defend. It starts there.',{trust:3,team:1}]]],
 ['Anything to say to the fans?',[['Thank you. We feed off you.',{fans:4}],['Keep believing in us.',{fans:2,team:1}],['Watch this space.',{fans:3,trust:-1}]]]];
function pressUI(){const q=pick(PRESSQ);modal(`<h2>Press conference</h2><p>"${esc(q[0])}"</p>${q[1].map((a,i)=>`<p>${B(`pressAns(${PRESSQ.indexOf(q)},${i})`,esc(a[0]))}</p>`).join('')}`);$('modal').onclick=null}
function pressAns(qi,ai){const e=PRESSQ[qi][1][ai][1],C=R.car;C.fans=clamp(C.fans+(e.fans||0),0,100);C.trust=clamp(C.trust+(e.trust||0),0,100);if(e.team)teamPl(0).forEach(p=>{if(p.id!==C.id)p.mor=clamp(p.mor+e.team,0,100)});hSave();closeModal();careerHome()}
const EVENTS=[['A teammate asks you to put in extra shooting work after practice.',[['Stay late and shoot',{xp:25,mor:-2}],['Go home and rest',{mor:3}]]],
 ['A local school invites you to a charity event.',[['Go and sign autographs',{fans:6,mor:2}],['Skip it, you need rest',{fans:-2}]]],
 ['Some teammates want a night out before an away game.',[['Go with them',{team:4,trust:-4,mor:4}],['Stay in the hotel',{trust:2}]]],
 ['A trainer offers a summer program on your weakest area.',[['Sign up',{xp:30,cash:-0.2}],['No thanks',{}]]],
 ['A shoe company wants you in an ad.',[['Do the shoot',{fans:5,mor:2}],['Stay focused on basketball',{trust:2}]]],
 ['The coach asks you to come off the bench for a while to help the second unit.',[['Do it for the team',{trust:6,mor:-3}],['Tell him you want to start',{trust:-5,mor:2}]]]];
function evUI(){const C=R.car;C.pendingEv=0;const ev=pick(EVENTS);modal(`<h2>Between games</h2><p>${esc(ev[0])}</p>${ev[1].map((o,i)=>`<p>${B(`evAns(${EVENTS.indexOf(ev)},${i})`,esc(o[0]))}</p>`).join('')}`);$('modal').onclick=null}
function evAns(ei,oi){const e=EVENTS[ei][1][oi][1],C=R.car,p=me();if(e.xp)addXP(e.xp);C.fans=clamp(C.fans+(e.fans||0),0,100);C.trust=clamp(C.trust+(e.trust||0),0,100);if(e.mor)p.mor=clamp(p.mor+e.mor,0,100);if(e.team)teamPl(0).forEach(q=>{if(q!==p)q.mor=clamp(q.mor+e.team,0,100)});hSave();closeModal();careerHome()}
// simulated games also give XP and sometimes an off-field choice
{const _sd=simDaysUI;simDaysUI=function(n){_sd(n);if(CAREER()&&R.car&&feat('events')&&rnd()<.3){R.car.pendingEv=1;careerHome()}}}
// ---------- the offseason in career mode: the team runs itself; you decide your own contract ----------
function careerOff(){const p=me();if(R.stage=='draft'){autoDraftAll();return careerHome()}
 if(R.stage=='resign'){if(p.exp<=R.season&&!p.keep)return contractUI();// your teammates: the team decides
  teamPl(0).forEach(q=>{if(q===p||q.exp>R.season)return;if(ovr(q)>=58&&q.age<34&&rnd()<.7){q.keep=1;q.sal=askFor(q);q.exp=R.season+ri(1,4)}});resignDone();hSave();return careerHome()}
 if(R.stage=='fa'){faDay(30);while(teamPl(0).length<13)cpuSign(0)||fillMin(0);newSeason();hSave();return careerHome()}}
function autoDraftAll(){while(R.dr&&R.dr.i<R.dr.picks.length){const pk=R.dr.picks[R.dr.i];if(pk.t===0){const av=R.pl.filter(q=>q.tid===-2).sort((a,b)=>(pot(b)*.6+ovr(b)*.4)-(pot(a)*.6+ovr(a)*.4));if(!av.length)break;draftPick(0,av[0].id)}else cpuDraftUntilUser()}draftEnd();hSave()}
function contractUI(){const p=me(),C=R.car,ask=Math.max(MINSAL,Math.round(salFor(p)*(1+C.fans/400)*10)/10),offers=R.t.map((_,i)=>i).filter(i=>i).sort(()=>rnd()-.5).slice(0,3).map(t=>({t,sal:Math.round(ask*(.85+rnd()*.35)*10)/10,y:ri(2,4)}));C.offers=offers;
 modal(`<h2>Your contract is up</h2><p>The ${esc(R.t[0].n)} offer <b>${money(ask)}</b> a year for 3 years.</p>${B(`carSign(0,${ask},3)`,`Re-sign with the ${esc(R.t[0].n)}`,'big')}<h3>Other offers</h3>${offers.map((o,i)=>`<p>${B(`carSign(${o.t},${o.sal},${o.y})`,`${esc(R.t[o.t].n)} (${rec(o.t)}): ${money(o.sal)} a year, ${o.y} years`)}</p>`).join('')}`);$('modal').onclick=null}
function carSign(t,sal,y){const p=me();p.sal=sal;p.exp=R.season+y;p.keep=1;if(t!==0){p.tid=t;swapTeam(t);p.tid=0;R.car.trust=50;addNews(`${p.n} signs with the ${R.t[0].n}.`,1)}else addNews(`${p.n} re-signs with the ${R.t[0].n}.`,1);closeModal();hSave();careerOff()}
function retireUI(){const p=me(),car=p.car.concat(p.ss[SI.gp]?[[R.season,0,...p.ss]]:[]),tot=newSS();car.forEach(c=>SS.forEach((k,i)=>tot[i]+=c[2+i]));const g=Math.max(1,tot[SI.gp]);
 modal(`<h2>Retire?</h2><p>${esc(p.n)}: ${car.length} seasons, ${tot[SI.gp]} games, ${f1(tot[SI.pts]/g)} points, ${f1((tot[SI.orb]+tot[SI.drb])/g)} rebounds, ${f1(tot[SI.ast]/g)} assists a game.</p><p>${p.aw.length?esc(p.aw.join(' · ')):'No awards.'}</p>${B('retireGo()','Retire and start a new career','danger')}`)}
function retireGo(){const p=me();(R.car.hof=R.car.hof||[]);try{const H=JSON.parse(lsGet('hoops_hof')||'[]');H.push({n:p.n,pos:p.pos,s:R.season,aw:p.aw.length,ovr:ovr(p)});lsSet('hoops_hof',JSON.stringify(H))}catch(e){}lsDel(slotKey());R=null;closeModal();startUI()}
// the season keeps aging your player; at 38 he has to retire
{const _ns=newSeason;newSeason=function(){_ns();if(CAREER()&&R.car){const p=me();if(p&&p.age>=38){addNews(`${p.n} has to retire at 38.`,1);setTimeout(retireUI,100)}R.camp=0}}}
// keep the owner, finances and camp out of career mode
{const _oj=ownerJudge;ownerJudge=function(){if(CAREER())return 60;return _oj()}}
{const _fg=finGame;finGame=function(a,b){if(CAREER())return;return _fg(a,b)}}
{const _ru=rosterUI;rosterUI=function(){_ru();if(CAREER()){const m=$('mainpg');if(m){m.querySelectorAll('.mv button,.head .row').forEach(b=>b.remove());m.querySelectorAll('tr[draggable]').forEach(tr=>tr.draggable=false)}}}}
{const _pu=playerUI;playerUI=function(id){_pu(id);if(CAREER()){const m=$('modal');m.querySelectorAll('.gh button,button.danger').forEach(b=>b.remove())}}}
{const _set=setUI;setUI=function(){_set();try{const m=$('mainpg');if(m)m.insertAdjacentHTML('beforeend',`<div class="card"><h3>Game mode</h3><p class="small">Franchise mode: you run the team and control the ball handler. Career mode: you are one player. Each mode keeps its own save.</p>${B("OPT.mode='franchise';optSave();location.reload()",'Franchise mode',CAREER()?'':'big')}${B("OPT.mode='career';optSave();location.reload()",'Career mode',CAREER()?'big':'')}</div>`)}catch(e){}}}
// free throws: you only shoot your own
{const _ap=autoPlay;autoPlay=function(){if(CAREER()&&G&&G.ft&&R.car&&G.ft.e.p.id!==R.car.id)return true;return _ap()}}
{const _fp=ftPress;ftPress=function(){if(CAREER()&&G&&G.ft&&R.car&&G.ft.e.p.id!==R.car.id)return;return _fp()}}
{const _kh=keysHTML;keysHTML=function(){const r=(a,b)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`;return _kh()+`<table class="t"><tr><th colspan="2">Career mode</th></tr>${r('Call for the ball (when a teammate has it)','E')}${r('Fast forward while you are on the bench','Space')}${r('You only control your own player; the coach calls plays and timeouts','')}</table>`}}
