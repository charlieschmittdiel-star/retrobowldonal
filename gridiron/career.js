'use strict';
// Career mode: you are one player. You control only him on the field, earn XP from how you play, and spend it to
// upgrade yourself. Your coach calls the plays (unless you're the QB), runs the roster and handles the other unit.
const CAR=()=>R.mode=='career'&&!!R.me;
const MYSLOT={QB:['O',0],RB:['O',5],WR:['O',1],TE:['O',4],DL:['D',0],LB:['D',4],CB:['D',7],S:['D',9]};
const CPOS=['QB','RB','WR','TE','DL','LB','CB','S'];
const meRow=()=>R.pl.find(p=>p.id===R.me);
const myPos=()=>{const p=meRow();return p?p.g:'QB'};
const qbIsMe=()=>!CAR()||myPos()=='QB';
function careerMe(){if(!CAR()||!P)return null;return P.off.concat(P.def).find(p=>p.pid===R.me)||null}
function myUnitOn(){if(!CAR())return true;const me=careerMe();if(!me)return false;return(me.t=='U'&&P.off.includes(me)&&G.poss=='U')||(me.t=='U'&&P.def.includes(me)&&G.poss=='C')||(P.b.st=='carry'&&P.b.c===me)}
function autoMode(){return CAR()&&G&&G.live&&!myUnitOn()}
function careerCd(){if(!CAR())return;const me=careerMe();if(me&&P.def.includes(me))cd=me;else if(!P.def.includes(cd))cd=P.def[0]}
function careerCtl(){if(autoMode())return null;return careerMe()}
// ----- the coach -----
function coachPlay(){const k=Object.keys(allP()),has=n=>allP()[n],lead=G.sc[0]-G.sc[1],pos=myPos(),pick=a=>a[rnd()*a.length|0];
 const runs=['Run','Draw','Jet Sweep'].filter(has),pass=['Slants','Mesh','Curls','Go','Verts','Post Corner','Motion Mesh'].filter(has);
 if(lead>0&&G.q>=4&&G.clk<=300)return pick(runs);if(lead<0&&G.q>=4&&G.clk<=240)return pick(pass);
 if(G.ytg<=2)return pick(rnd()<.7?runs:pass);if(G.down>=3&&G.ytg>=7)return pick(pass);
 const runP=pos=='RB'?.6:pos=='WR'||pos=='TE'?.3:.45;return pick(rnd()<runP?runs:pass)}
function coachDef(){const pick=a=>a[rnd()*a.length|0];if(G.ytg>=8)return pick(['Cover 3','Cover 2 Zone','Man Free']);if(G.ytg<=3)return pick(['Blitz','Man Free','Cover 3']);return pick(Object.keys(DPRE))}
function coach4th(){const d=G.dir,dg=((d>0?110:10)-P.L)*d,k=kickerOf('U'),rg=40+(k.str-60)*.4,lead=G.sc[0]-G.sc[1];
 if(G.q>=4&&lead<0&&G.clk<=240&&!(dg+17<=rg+4&&lead>=-3&&G.clk<=40))return false;
 if(dg+17<=rg+4){doFG();return true}if((G.ytg<=1&&dg<=65)||(G.ytg<=2&&dg<=40))return false;doPunt();return true}
function coachChoice(){if(!G.ch)return;if(G.ch.k=='tb')return chTb();const lead=G.sc[0]-G.sc[1];if(G.q>=4&&[-2,-5,-10,1,5,-9].includes(lead))return chTwo();chXp()}
// ----- auto-play while your unit is off the field -----
function autoTick(dt){if(!G.live)return;if(G.ch){coachChoice();return}
 if(G.phase=='pre'){G.at=(G.at||0)+dt;if(G.at>.35){G.at=0;if(G.poss=='U'&&G.down==4&&!qbIsMe()&&coach4th())return;snap()}}
 else if(G.phase=='play')step(dt);else if(G.phase=='motion')motionStep(dt);else if(G.phase=='post'){G.pt-=dt*2.5;postStep(dt);if(G.pt<=0)next()}}
function careerLoop(dt){if(!CAR()||!G.live)return false;if(G.ch&&G.phase=='pre'&&!qbIsMe()){coachChoice();return true}
 if(!autoMode())return false;for(let i=0;i<3;i++)autoTick(dt);return true}
function skipDrive(){let n=0;while(G.live&&autoMode()&&n++<30000)autoTick(1/30);ui()}
function careerUi(pre,u){const on=myUnitOn(),me=careerMe();$('dctl').querySelector('[data-k=" "]').style.display='none';
 if(!on){$('plays').innerHTML=`<span class="cinfo">${G.poss=='U'?'Your offense':'Your defense'} is on the field</span><button data-a="skip">Skip to your next drive</button>`;$('snap').style.display='none';$('dctl').style.display='none';return}
 if(pre&&!qbIsMe()&&!G.ch){$('plays').innerHTML=`<span class="cinfo">Coach called: ${u?P.name:P.dpn}. You are the ${me?me.pos:myPos()}.</span>`}
 $('dctl').style.display=!u&&G.phase!='over'?'flex':'none'}
// ----- XP and upgrades -----
const upCost=v=>3+Math.max(0,Math.floor((v-55)/6))*2;
function careerXP(s,won,sim){if(!CAR())return;const p=meRow(),v=k=>s[SI[k]]||0;let x=10+(won?20:0);
 if(p.g=='QB')x+=v('py')/10+v('ptd')*10-v('pi')*8+v('ry')/5+v('rtd')*10;
 else if(p.g=='RB')x+=v('ry')/4+v('rtd')*12+v('ty')/5+v('tt')*12;
 else if(p.g=='WR'||p.g=='TE')x+=v('ty')/4+v('tt')*12+v('rc')*2;
 else x+=v('tk')*4+v('sk')*15+v('in')*20;
 x=Math.max(5,Math.round(x*(sim?.6:1)));R.xp=(R.xp||0)+x;R.lastXP=`+${x} XP ${sim?'(simmed game)':'from your game'}: ${statLine(p,s)}`}
function upgrade(k){const p=meRow(),c=upCost(p.sk[k]);if((R.xp||0)<c||p.sk[k]>=99)return;R.xp-=c;p.sk[k]++;if(p.mx[k]<p.sk[k])p.mx[k]=p.sk[k];save();careerHub()}
// ----- career hub -----
function careerHub(){if(!R.me)return careerCreate();if(G&&G.live)return gameLobby();ctx='hub';VW.page='home';const p=meRow(),T=T_(),y=T[0],lg=R.lg;
 if(!p){R.me=null;return careerCreate()}
 const nm={spd:'Speed',str:'Strength',awr:'Awareness',skl:{QB:'Accuracy',RB:'Hands',WR:'Hands',TE:'Hands',DL:'Pass rush',LB:'Tackling',CB:'Coverage',S:'Coverage'}[p.g]};
 const stg=R.stage,o=stg?-1:nextOpp(),po=lg.po,xp=R.xp||0;
 const nextC=card(stg?'Offseason':po?RD[po.rd]:`Week ${lg.wk+1} of ${R.lg.sched.length}`,stg?`<div class="big">Offseason</div><p class="dim">Your coach handles the draft, contracts and free agency.</p><div class="btns">${B('careerOffseason()','Advance through the offseason','go')}</div>`
  :o<0?`<div class="big">Bye week</div><div class="btns">${B('startGame()','Advance','go')}</div>`
  :`<div class="vs"><div><span class="dim">vs</span><div class="big">${T[o].n}</div><span class="dim">${rec3(T[o])} · rating ${Math.round(teamR(o))}</span></div></div><div class="btns">${p.inj?B('simGame()','Sim (you are injured)','go'):B('startGame()','Play game','go')+B('simGame()','Sim')}${!po?B('simRest()','Sim to playoffs'):''}</div>`);
 const me=card('You',`<div class="pcard"><div class="ovr"><b>${ovr(p)}</b><span>OVR</span></div><div><div class="big">${p.n}</div><p class="dim">${p.g} · age ${p.age} · ${y.n} · ${M$(p.sal)} thru ${p.exp}${p.inj?` · <span class="inj">injured ${p.inj} wk</span>`:''}</p></div></div>${R.lastXP?`<p class="good">${R.lastXP}</p>`:''}`);
 const up=card(`Upgrade yourself · ${xp} XP`,`<table class="mini">${ST.map(k=>{const c=upCost(p.sk[k]);return`<tr><td>${nm[k]}</td><td class="num"><b>${p.sk[k]}</b></td><td><div class="bar sm"><i style="width:${p.sk[k]}%"></i></div></td><td>${p.sk[k]<99?B(`upgrade('${k}')`,`+1 · ${c} XP`,xp>=c?'':'dim'):'Max'}</td></tr>`}).join('')}</table><p class="dim">XP comes from your stats and wins every game (simmed games give less).</p>`);
 const season=card('This season',`<div class="big">${statLine(p)}</div><p class="dim">${p.ss[0]} games · team ${rec3(y)}</p>`);
 const career=card('Career',`<table class="mini"><tr><th>Season</th><th>G</th><th>Line</th></tr>${p.car.slice().reverse().map(c=>`<tr><td>${c[0]}</td><td>${c[2]}</td><td>${statLine(p,c.slice(2))}</td></tr>`).join('')||'<tr><td class="dim" colspan="3">Your first season.</td></tr>'}</table>${p.aw.length?`<p>Awards: ${p.aw.join('; ')}</p>`:''}`);
 const c0=y.c,div=T.map((_,i)=>i).filter(i=>T[i].c==c0&&T[i].d==y.d).sort(cmp);
 const divC=card('Your division',`<table class="mini">${div.map(i=>`<tr class="${i==0?'me':''}"><td>${T[i].n}</td><td class="num">${rec3(T[i])}</td></tr>`).join('')}</table>`);
 const news=card('News',(R.news||[]).slice(0,6).map(n=>`<p class="news"><span class="dim">S${n.s} W${n.w+1}</span> ${n.t}</p>`).join('')||'<p class="dim">Nothing yet.</p>');
 modal(`${saveWarn?`<p class="warn">${saveWarn}</p>`:''}<div class="hdr"><h1>${p.n}</h1><p class="dim">${lastMsg}</p></div><div class="dash">${nextC}${me}${up}${season}${divC}${career}${news}</div>`)}
function careerOffseason(){if(R.stage=='draft'){draftRun(0);if(R.stage=='draft')draftEnd()}if(R.stage=='resign')resignDone();if(R.stage=='fa')faEnd()}
function careerCreate(){ctx='create';modal(`<h1>Career mode</h1><p>Create your player. You'll control only him, earn XP from how you play, and spend it to upgrade yourself. Your coach calls the plays (if you're the QB, you call them yourself) and runs the roster.</p>
 <p>Name <input id="cn" maxlength="22" value="${N1[rnd()*N1.length|0]} ${N2[rnd()*N2.length|0]}"></p>
 <p>Position <select id="cp">${CPOS.map(g=>`<option>${g}</option>`).join('')}</select></p>
 <p>Style <select id="cs"><option value="bal">Balanced</option><option value="spd">Speed</option><option value="str">Power</option><option value="awr">Smart</option><option value="skl">Technician</option></select></p>
 <div class="grid">${B('careerStart()','Start my career','big')}${B("lsSet('gdmode','franchise');location.reload()",'Back to franchise mode')}</div>`)}
function careerStart(){const n=($('cn').value||'').replace(/[<>"'&]/g,'').trim()||'Rookie',g=$('cp').value,s=$('cs').value;
 const p=mkPl(g,21,57,6,0);p.n=n;ST.forEach(k=>{p.sk[k]=clamp(p.sk[k]+(s==k?8:s=='bal'?2:-2),45,80);p.mx[k]=clamp(p.sk[k]+18+(rnd()*10|0),70,95)});
 p.sal=ROOKIE[0];p.exp=R.season+3;p.draft={s:R.season-1,rd:1,pk:1+(rnd()*20|0),tid:0};p.mood=['L'];R.pl.push(p);R.me=p.id;R.mode='career';R.xp=25;lastMsg=`Welcome to the league, ${n}.`;save();careerHub()}
