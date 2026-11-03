'use strict';
// Career mode: create one player and play only him. You come up through a club's academy, the manager decides if
// you start, you earn XP from how you play and spend it on upgrades, unlock X-factor abilities, answer the press,
// make choices between matches, and retire when you are ready. Career mode keeps its own save.
{const add=[['Career','xf','X-factor abilities','Unlock special abilities as you level up (Clinical finisher, Engine, Rocket, Brick wall).'],
 ['Career','pressc','Press conferences','Answer reporters after big matches. Your answers affect the fans, your teammates and the manager.'],
 ['Career','events','Off-field choices','Decisions between matches: extra training, charity work, a night out...']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const CAREER=()=>OPT.mode==='career';
{const _sk=slotKey;slotKey=function(){return CAREER()?'soccer_career':_sk()}}
const ARCH={poach:['Poacher','Lives in the box and finishes chances.',{fin:12,hd:8,ctl:4,spd:2,tkl:-8,mrk:-6,lpa:-4}],play:['Playmaker','Sees passes nobody else does.',{shp:12,vis:12,lpa:8,ctl:6,str:-6,hd:-6}],
 speed:['Speedster','Faster than everyone.',{spd:12,acc:12,dri:8,agi:6,str:-6,hd:-6,mrk:-4}],engine:['Box-to-box','Runs all day at both ends.',{sta:14,tkl:8,shp:6,str:4,fin:-2,dri:-4}],wall:['Stopper','Wins the ball and keeps it out.',{tkl:12,mrk:12,int:10,str:8,hd:6,dri:-8,fin:-8}]};
const CPOS={ST:'Striker',WG:'Winger',CM:'Central midfielder',FB:'Full back',CB:'Centre back'};
const XF={fin:['Clinical finisher','Your shots go in more often.'],eng:['Engine','You hardly get tired.'],rocket:['Rocket','You are even quicker with the ball.'],wall:['Brick wall','Your tackles win the ball more often.']};
const me=()=>R&&R.car?R.pl.find(p=>p.id===R.car.id):null;
const hasXF=k=>feat('xf')&&R&&R.car&&R.car.xf.includes(k);
// ---------- creating a player ----------
{const _su=startUI;startUI=function(){_su();try{const c=$('ui').querySelector('.start');if(!c)return;if(CAREER()){c.querySelector('.card').outerHTML=careerCreateHTML()}else c.insertAdjacentHTML('beforeend',`<div class="card"><h3>Career mode</h3><p>Create one player and play only him: come up through an academy, earn XP, unlock abilities and chase trophies. It has its own save.</p>${B("OPT.mode='career';optSave();location.reload()",'Start a career')}</div>`)}catch(e){console.error(e)}}}
function careerCreateHTML(){return`<div class="card"><h3>Create your player</h3><label>First name <input id="cfn" maxlength="14" value="${esc(pick(FN))}"></label><label>Last name <input id="cln" maxlength="16" value="${esc(pick(LN))}"></label>
 <label>Position <select id="cpos">${Object.keys(CPOS).map(p=>`<option value="${p}" ${p=='ST'?'selected':''}>${CPOS[p]}</option>`).join('')}</select></label>
 <label>Style <select id="carch">${Object.keys(ARCH).map(k=>`<option value="${k}">${ARCH[k][0]}: ${ARCH[k][1]}</option>`).join('')}</select></label><label>Shirt number <input id="cnum" type="number" min="1" max="99" value="${ri(7,29)}"></label>
 <label>Difficulty <select id="nd">${DIFFN.map((d,i)=>`<option value="${i}" ${i==1?'selected':''}>${d}</option>`).join('')}</select></label><label>Half length <select id="nq">${[2,3,4,6,8].map(q=>`<option value="${q}" ${q==4?'selected':''}>${q} minutes</option>`).join('')}</select></label>
 ${B('careerGo()','Sign your first contract','big')}<p class="small">${B("OPT.mode='franchise';optSave();location.reload()",'Back to manager mode','xs')}</p></div>`}
function careerGo(){const pos=$('cpos').value,arch=$('carch').value,fn=$('cfn').value.trim()||'Young',ln=$('cln').value.trim()||'Player';
 newLeague({rounds:2,hlen:+$('nq').value,diff:+$('nd').value});const p=mkPlayer(pos,17,50,0,0);p.fn=fn;p.ln=ln;p.n=fn+' '+ln;p.num=clamp(+$('cnum').value||9,1,99);const pr=ARCH[arch][2];
 SK.forEach(k=>{let v=p.sk[k]+(pr[k]||0)*.8+gauss()*1.5;p.sk[k]=clamp(Math.round(v),25,74);p.mx[k]=clamp(Math.round(p.sk[k]+28+(pr[k]||0)*.5),p.sk[k],99)});
 teamPl(0).filter(q=>q.num===p.num).forEach(q=>fixNum(q,0));p.sal=.3;p.exp=R.season+3;p.acad=1;p.mor=75;p.s0=ovr(p);R.pl.push(p);
 R.car={id:p.id,xp:0,lvl:1,pts:1,xf:[],fans:20,trust:30,arch,log:[],evd:0};R.camp=null;
 addNews(`${p.n} (17) signs his first professional contract with ${R.t[0].n}.`,1);hSave();careerHome();setTimeout(()=>modal(`<h2>Welcome to ${esc(R.t[0].n)}</h2><p><b>${esc(p.n)}</b> has come up through the academy. You start as a ${ovr(p)} overall.</p><p>You start on the bench: play well when you come on to earn XP and the manager's trust, and you will win a place in the team.</p>`),60)}
// ---------- the career home page ----------
const NAVC=['home','roster','table','fix','results','lead','power','tstats','hist','ach','hof','hl','feat','set','keys'];
{const i=NAV.findIndex(n=>n[0]=='squad');if(!NAV.some(n=>n[0]=='roster'))NAV.splice(i<0?1:i,0,['roster','Team','teamUI(0)'])}
{const _ok=navOK;navOK=function(k){if(CAREER())return NAVC.includes(k)&&(k=='roster'||_ok(k));if(k=='roster')return false;return _ok(k)}}
{const _hu=homeUI;homeUI=function(){if(CAREER()&&R&&R.car)return careerHome();return _hu()}}
function lvlNeed(l){return 160+l*60}
function starter(){const p=me();if(!p||p.inj||p.ban>0)return false;const lu=lineup(0);return lu.xi.includes(p)}
function careerHome(){PAGE='home';const p=me();if(!p){OPT.mode='franchise';optSave();return startUI()}const C=R.car,T=R.t[0],tb=table(),pos=tb.indexOf(0)+1;let next='';
 if(R.stage)next=`<div class="card hot"><h3>The season is over</h3><p>The club sorts out contracts and the transfer window.</p>${B('careerOff()','Start the next season','big')}</div>`;
 else if(feat('cup')&&R.cup&&R.cup.pend&&cupDue()){const t=cupMine(),o=t[0]===0?t[1]:t[0];next=`<div class="card hot"><h3>Cup: ${cupName(R.cup.rd)}</h3><p>${t[0]===0?'vs':'at'} ${tlink(o)}</p><div class="row">${B('cupPlay()','Play the cup match','big')}${B('cupSimMine()','Sim it')}</div></div>`}
 else{const g=nextGame();if(g){const o=g[0]===0?g[1]:g[0];next=`<div class="card hot"><h3>Matchday ${R.day+1} of ${R.sched.length}</h3><p>${g[0]===0?'vs':'at'} ${tlink(o)} (${tb.indexOf(o)+1}${ord(tb.indexOf(o)+1)})${feat('riv')&&rival(0)===o?' · <b>Derby</b>':''}</p><div class="row">${B('playGame()','Play the match','big')}${B('simGameUI()','Sim the match')}${B('simDaysUI(5)','Sim 5 matches')}</div></div>`}}
 const role=p.inj?`Injured (${p.inj} matches)`:p.ban>0?'Suspended':starter()?'Starting':'On the bench',need=lvlNeed(C.lvl);
 shell(`<div class="head ph" style="display:flex;gap:14px;align-items:center"><div>${feat('faces')&&typeof faceSVG=='function'?faceSVG(p,72):''}</div><div style="flex:1"><h1>${esc(p.n)} <small>#${p.num}</small></h1><p>${CPOS[p.pos]||p.pos} · ${esc(T.n)} (${pos}${ord(pos)}) · ${p.age} years · ${role} · ${money(p.sal)} a season through ${p.exp}</p></div><div class="ov">${ovrPill(ovr(p))}<small> overall</small></div></div>
 ${next}<div class="grid3"><div class="card"><h3>Level ${C.lvl}</h3><div class="bar"><i style="width:${Math.min(100,C.xp/need*100)}%;background:#16a34a"></i></div><p class="small">${Math.round(C.xp)} / ${need} XP · <b>${C.pts}</b> upgrade points</p>${B('carUpUI()','Upgrade my player')}</div>
 <div class="card"><h3>This season</h3><p>${p.ss[SI.gp]} matches · <b>${p.ss[SI.g]}</b> goals · ${p.ss[SI.a]} assists · rating ${f1(avgRat(p))}</p><p class="small">${p.ss[SI.sh]} shots (${p.ss[SI.sot]} on target) · passing ${p.ss[SI.pas]?Math.round(p.ss[SI.pac]/p.ss[SI.pas]*100):0}% · ${p.ss[SI.tkl]} tackles</p></div>
 <div class="card"><h3>Standing</h3><p>Manager's trust ${Math.round(C.trust)}/100<br>Fans ${Math.round(C.fans)}/100</p>${feat('xf')&&C.xf.length?`<p class="small">X-factors: ${C.xf.map(k=>XF[k][0]).join(', ')}</p>`:''}</div></div>
 <div class="card"><h3>News</h3><ul class="news">${R.news.slice(0,8).map(n=>`<li class="${n.m?'mine':''}">${esc(n.t)}</li>`).join('')}</ul></div>${p.age>=32?`<p>${B('retireUI()','Retire')}</p>`:''}`);
 if(p.age>=38)setTimeout(()=>modal(`<h2>Time to hang up the boots</h2><p>At 38, ${esc(p.n)} retires.</p>${B('retireGo()','Retire','big')}`),60);else if(feat('recap')&&R.recap)setTimeout(recapUI,60);else if(C.pendingXF)setTimeout(xfPick,60);else if(C.pendingPress)setTimeout(pressUI,60);else if(C.pendingEv)setTimeout(evUI,60)}
// ---------- upgrades, XP, X-factors ----------
function carUpUI(){const p=me(),C=R.car;modal(`<h2>Upgrade ${esc(p.n)}</h2><p>${C.pts} upgrade points. Each point gives a few random boosts inside one group, up to your potential.</p><div class="row">${Object.keys(SG).filter(g=>g!='gk').map(g=>B(`carUp('${g}')`,`${SG[g][0]}<br><small>${hRoom(p,g)?'room to grow':'maxed'}</small>`,C.pts&&hRoom(p,g)?'':'off')).join('')}</div>`)}
function carUp(gk){const p=me(),C=R.car;if(C.pts<1||!hRoom(p,gk))return;C.pts--;const b=ovr(p),g=hUp(p,gk,3);hSave();carUpUI();toast(`${gotTxt(g)||'no change'}${ovr(p)>b?` · now ${ovr(p)} overall`:''}`)}
function addXP(n){const C=R.car;if(!C)return;C.xp+=n;while(C.xp>=lvlNeed(C.lvl)){C.xp-=lvlNeed(C.lvl);C.lvl++;C.pts+=1;addNews(`${me().n} reaches level ${C.lvl}.`,1);if(feat('xf')&&C.lvl%4==0&&C.xf.length<Object.keys(XF).length)C.pendingXF=1}}
function xfPick(){const C=R.car;if(!C.pendingXF)return;const opts=Object.keys(XF).filter(k=>!C.xf.includes(k));modal(`<h2>New X-factor</h2><p>Pick one ability.</p>${opts.map(k=>`<p>${B(`xfTake('${k}')`,`<b>${XF[k][0]}</b><br><small>${XF[k][1]}</small>`)}</p>`).join('')}`);$('modal').onclick=null}
function xfTake(k){const C=R.car;C.xf.push(k);C.pendingXF=0;hSave();closeModal();addNews(`${me().n} unlocked ${XF[k][0]}.`,1);careerHome()}
{const _sa=shotAdj;shotAdj=function(e,q){let a=_sa(e,q);if(CAREER()&&hasXF('fin')&&me()&&e.p.id===me().id)a+=.05;return a}}
{const _ts=topSpd;topSpd=function(e){const v=_ts(e);return CAREER()&&hasXF('rocket')&&R.car&&e.p.id===R.car.id&&G&&G.b.own===e?v*1.07:v}}
{const _tk=tackle;tackle=function(d,slide){if(CAREER()&&hasXF('wall')&&R.car&&d.p.id===R.car.id){d.p.sk.tkl+=15;try{return _tk(d,slide)}finally{d.p.sk.tkl-=15}}return _tk(d,slide)}}
// ---------- in the match: you control only your player ----------
function myEnt(){if(!G||!R.car)return null;return G.ent.find(e=>e.p.id===R.car.id&&!e.off)||null}
{const _sc=setCtl;setCtl=function(){if(!CAREER()||!G||G.auto)return _sc();G.ctl=myEnt()}}
{const _as=autoSwitch;autoSwitch=function(dt){if(CAREER()){if(G&&!G.auto)G.ctl=myEnt();return}return _as(dt)}}
{const _sw=switchPlayer;switchPlayer=function(){if(CAREER()){callForBall();return}return _sw()}}
{const _gv=give;give=function(e){_gv(e);if(CAREER()&&G&&!G.auto)G.ctl=myEnt()}}
// without the ball and not touching the keys, your player keeps his position like a teammate would
{const _uc=userControls;userControls=function(e,dt){if(!CAREER())return _uc(e,dt);const r=_uc(e,dt);if(!r&&!G.ctlInput)return false;return r}}
function callForBall(){const e=myEnt(),b=G&&G.b;if(!e||!b||!b.own||b.own.t!==0||b.own===e||G.phase!='live')return;const h=b.own;if((G.callT||0)>0)return;G.callT=1.5;say('Pass it!',.8);
 if(!isOff(e)&&rnd()<.6+(R.car.trust-50)/200)passTo(h,e,.5,dist(h,e)>22?'through':null)}
{const _st=hStep;hStep=function(dt){if(G&&G.callT>0)G.callT-=dt;_st(dt);if(!CAREER()||!G||G.viewer)return;
  if(hasXF('eng')){const e=myEnt();if(e&&G.st[e.p.id]!=null)G.st[e.p.id]=Math.min(100,G.st[e.p.id]+dt*.6*45/G.hl)}
  // on the bench: watch the first half go by quickly, then come on at half time
  if(G.waitSub&&G.half===2&&G.phase!='over'){const p=me(),out=onT(0).filter(e=>e.pos!='GK').sort((a,b)=>(a.pos===p.pos?0:1)-(b.pos===p.pos?0:1)||(G.st[a.p.id]||100)-(G.st[b.p.id]||100))[0];
   G.waitSub=0;if(out&&subOn(0,out,p)){if(!G.simAll){G.auto=0;G.ctl=myEnt()}say(`${p.ln} comes on!`,2)}}}}
{const _ng=newGame;newGame=function(...a){const g=_ng.apply(this,a);if(CAREER()&&R.car&&!g.auto){const p=me();if(p&&!g.ent.some(e=>e.p.id===p.id)){if(!p.inj&&!(p.ban>0)&&g.bench[0].includes(p.id)){g.waitSub=1;g.auto=1;g.ctl=null}else g.noMe=1}else setTimeout(()=>{if(G===g)G.ctl=myEnt()},0)}return g}}
{const _rl=runLoop;runLoop=function(){_rl();if(CAREER()&&G&&G.noMe){G.paused=true;modal(`<h2>You are not playing today</h2><p>${me()&&me().inj?'You are injured.':'You are suspended.'} The match will be simmed.</p>${B('closeModal();simRest()','OK','big')}`)}}}
{const _hk=hKey;hKey=function(code,down){if(CAREER()&&G&&G.waitSub&&down&&!G.paused){if(code=='Space'){G.ff=!G.ff;return}}return _hk(code,down)}}
// fast-forward while you wait on the bench
{const _hs=hStep;hStep=function(dt){_hs(dt);if(G&&G.waitSub&&!G.paused&&G.live){for(let i=0;i<3&&G&&G.waitSub&&G.phase!='over';i++)_hs(dt)}}}
{const _dh=drawHUD;drawHUD=function(){_dh();if(!CAREER()||!G)return;try{if(G.waitSub){CX.font='700 15px system-ui';CX.textAlign='center';CX.fillStyle='rgba(15,23,42,.85)';const t='You start on the bench. You come on at half time.';const w=CX.measureText(t).width+30;CX.fillRect(VW/2-w/2,VH-110,w,30);CX.fillStyle='#fde68a';CX.fillText(t,VW/2,VH-95)}
 const e=myEnt();if(e&&G.b.own&&G.b.own.t===0&&G.b.own!==e&&!G.paused){CX.font='600 12px system-ui';CX.textAlign='right';CX.fillStyle='rgba(226,232,240,.85)';CX.fillText('Q or Tab: call for the ball',VW-14,VH-40)}}catch(x){}}}
// ---------- after each match: XP, trust, the press ----------
function matchXP(b,won,drew){return b[SI.g]*30+b[SI.a]*20+b[SI.sot]*4+b[SI.pac]*.25+b[SI.tkl]*4+b[SI.int]*3+(b[SI.rat]-6)*20+(won?15:drew?6:2)}
{const _rg=recGame;recGame=function(a,b,res,played){_rg(a,b,res,played);if(!CAREER()||!R.car||!(a===0||b===0))return;try{const p=me(),m=res.T.findIndex(S=>S.t===0),S=res.T[m],i=S.ps.findIndex(q=>q.id===p.id);if(i<0||!S.box[i][SI.gp]){R.car.trust=clamp(R.car.trust-1,0,100);return}
 const bx=S.box[i],won=res.sc[m]>res.sc[1-m],drew=res.sc[m]===res.sc[1-m],xp=Math.max(12,matchXP(bx,won,drew))*(played?1:.6);addXP(xp);const mins=bx[SI.min]||90;R.car.trust=clamp(R.car.trust+(mins>=45?(bx[SI.rat]-6.6)*3:Math.max(0,bx[SI.rat]-6.6)*3+.8),0,100);R.car.fans=clamp(R.car.fans+bx[SI.g]*2+(won?1:0),0,100);
 R.car.log.unshift({s:R.season,d:R.day,o:R.t[a===0?b:a].ab,r:`${res.sc[m]}-${res.sc[1-m]}`,g:bx[SI.g],a:bx[SI.a],rat:bx[SI.rat],xp:Math.round(xp)});if(R.car.log.length>40)R.car.log.length=40;
 if(played&&feat('pressc')&&(bx[SI.g]>=2||bx[SI.rat]>=8||res.sc[m]-res.sc[1-m]<=-3||res.cup))R.car.pendingPress=1;if(feat('events')&&++R.car.evd>=5){R.car.evd=0;R.car.pendingEv=1}}catch(e){console.error(e)}}}
const PRESSQ=[['You were the star today. What made the difference?',[['The whole team worked hard.',{trust:3,team:2}],['I was the best player on the pitch.',{fans:5,trust:-3,team:-3}],['We still have a lot to improve.',{trust:4}]]],
 ['People say you should start every match. Agree?',[['That is up to the manager.',{trust:5}],['Of course. Look at my numbers.',{fans:4,trust:-5}],['I just want to help the team.',{team:3,trust:2}]]],
 ['A tough day. What went wrong?',[['We let the fans down. We have to be better.',{fans:3,trust:2}],['The referee did not help us.',{fans:2,trust:-2}],['I will not hide: I have to play better.',{trust:3,team:2}]]],
 ['Big clubs are said to be watching you. Interested?',[['I am happy here.',{fans:6,trust:3}],['Every player dreams of the top.',{fans:-4,trust:-2}],['No comment.',{}]]]];
function pressUI(){const C=R.car;C.pendingPress=0;const q=pick(PRESSQ);modal(`<h2>Press conference</h2><p>"${esc(q[0])}"</p>${q[1].map((a,i)=>`<p>${B(`pressAns(${PRESSQ.indexOf(q)},${i})`,esc(a[0]))}</p>`).join('')}`);$('modal').onclick=null}
function pressAns(qi,ai){const e=PRESSQ[qi][1][ai][1],C=R.car;C.fans=clamp(C.fans+(e.fans||0),0,100);C.trust=clamp(C.trust+(e.trust||0),0,100);if(e.team&&feat('morale'))teamPl(0).forEach(p=>setMor(p,e.team));hSave();closeModal();careerHome()}
const EVENTS=[['The club offers extra finishing sessions after training.',[['Stay late every day',{xp:40,fit:-1}],['Rest instead',{}]]],['A local school asks you to visit.',[['Go and sign autographs',{fans:6}],['Say you are busy',{fans:-2}]]],
 ['Teammates invite you out the night before a match.',[['Go out',{team:3,trust:-4}],['Early night',{trust:2}]]],['A sports scientist offers you a new diet plan.',[['Try it',{xp:25}],['Keep eating what you like',{}]]],['A boot sponsor wants you in an advert.',[['Do it',{fans:5,cash:.2}],['Focus on football',{trust:2}]]]];
function evUI(){const C=R.car;C.pendingEv=0;const ev=pick(EVENTS);modal(`<h2>Between matches</h2><p>${esc(ev[0])}</p>${ev[1].map((o,i)=>`<p>${B(`evAns(${EVENTS.indexOf(ev)},${i})`,esc(o[0]))}</p>`).join('')}`);$('modal').onclick=null}
function evAns(ei,oi){const e=EVENTS[ei][1][oi][1],C=R.car,p=me();if(e.xp)addXP(e.xp);C.fans=clamp(C.fans+(e.fans||0),0,100);C.trust=clamp(C.trust+(e.trust||0),0,100);if(e.team&&feat('morale'))teamPl(0).forEach(q=>setMor(q,e.team));if(e.cash)p.sal=Math.round((p.sal+e.cash)*10)/10;hSave();closeModal();careerHome()}
// the manager picks the team: trust decides whether you start
{const _lu=lineup;lineup=function(t){const L=_lu(t);if(t!==0||!CAREER()||!R.car)return L;const p=me();if(!p||p.inj||p.ban>0)return L;const inXI=L.xi.includes(p);
 const want=R.car.trust>=50||ovr(p)>=L.xi.filter(q=>q.pos===p.pos).reduce((m,q)=>Math.min(m,ovr(q)),99);if(want&&!inXI){let j=L.slots.findIndex((s,i)=>s[0]===p.pos);if(j<0)j=L.slots.findIndex(s=>s[0]!='GK');const out=L.xi[j];L.xi[j]=p;L.bench=[out].concat(L.bench.filter(q=>q!==p)).slice(0,7)}
 else if(!want&&inXI){}else if(!inXI&&!L.bench.includes(p)){L.bench=[p].concat(L.bench).slice(0,7)}return L}}
// ---------- the offseason: the club runs itself ----------
function careerOff(){const p=me();if(R.stage=='renew'){if(p&&p.exp<=R.season){p.sal=Math.max(p.sal,Math.round(salFor(p)*(1+R.car.fans/300)*10)/10);p.exp=R.season+3;p.keep=1;addNews(`${p.n} signs a new contract: ${money(p.sal)} a season.`,1)}
  teamPl(0).forEach(q=>{if(q!==p&&q.exp<=R.season&&ovr(q)>=teamOvr(0)-4&&q.age<33){q.keep=1;q.sal=askFor(q);q.exp=R.season+ri(1,3)}});renewDone()}
 if(R.stage=='window'){for(let i=0;i<30;i++){windowDay(1);if(rnd()<.3)cpuSign(0)}newSeason();while(teamPl(0).length<20)if(!cpuSign(0))fillMin(0);R.camp=null;R.car.trust=clamp(R.car.trust*.7+20,0,100)}
 hSave();careerHome()}
{const _ns=newSeason;newSeason=function(){const p=me();_ns();if(!CAREER()||!R.car)return;R.camp=null;const q=me();if(!q){addNews('Your player has retired.',1);return}if(q.age>=38){R.car.forceRetire=1}}}
function retireUI(){const p=me(),car=p.car.filter(c=>c[1]>=0),g=car.reduce((a,c)=>a+c[2+SI.g],0)+p.ss[SI.g],gp=car.reduce((a,c)=>a+c[2+SI.gp],0)+p.ss[SI.gp];modal(`<h2>Retire?</h2><p>${esc(p.n)}: ${gp} matches, ${g} goals, ${p.aw.length} awards.</p>${B('retireGo()','Retire','danger')} ${B('closeModal()','Keep playing')}`)}
function retireGo(){const p=me();try{const H=JSON.parse(lsGet('soccer_chof')||'[]');H.push({n:p.n,pos:p.pos,s:R.season,aw:p.aw.length,lvl:R.car.lvl});lsSet('soccer_chof',JSON.stringify(H))}catch(e){}addNews(`${p.n} retires.`,1);p.tid=-1;p.age=99;R.car=null;hSave();closeModal();lsDel(slotKey());R=null;startUI();toast('Thanks for the career!')}
// keep the manager-only parts out of career mode
{const _ot=offerTick;offerTick=function(){if(CAREER())return;return _ot()}}
{const _be=boardEnd;boardEnd=function(){if(CAREER())return'';return _be()}}
{const _fd=franDay;franDay=function(){_fd();if(CAREER())R.camp=null}}
{const _tu=teamUI;teamUI=function(t){_tu(t);if(CAREER()&&t===0)PAGE='roster'}}
{const _su=setUI;setUI=function(){_su();try{const m=document.querySelector('.main');if(m)m.insertAdjacentHTML('beforeend',`<div class="card"><h3>Game mode</h3><p>${CAREER()?'You are playing career mode (one player).':'You are the manager. Career mode lets you play as one player instead.'} Each mode has its own save.</p>${CAREER()?B("OPT.mode='franchise';optSave();location.reload()",'Switch to manager mode'):B("OPT.mode='career';optSave();location.reload()",'Switch to career mode')}</div>`);if(CAREER()){const sl=[...m.querySelectorAll('.card h3')].find(h=>h.textContent=='Save slots');if(sl)sl.parentElement.remove()}}catch(e){}}}
{const _sr=simRest;simRest=function(){if(G)G.simAll=1;return _sr()}}
