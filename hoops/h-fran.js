'use strict';
// Franchise depth: personalities, morale and chemistry, holdouts, contract negotiation, scouting and the combine,
// coaching staff, training camp, weekly game plans, finances and arena upgrades, the owner and job security, rivalries,
// storylines, achievements, player of the week, power rankings, team stats, box scores, draft-pick trades,
// trade offers, save slots, season recap, undo, custom uniforms, played-game stat scaling and salary cap fixes.
{const add=[['Franchise','pers','Personalities','Leaders, divas, competitors, loyal players, mercenaries... each affects morale, contracts and development.'],
 ['Franchise','morale','Morale and chemistry','Players care about minutes, winning and money. Happy, settled teams play a little better; unhappy stars hold out or want out.'],
 ['Franchise','neg','Contract negotiation','Offer a salary and years; players accept, counter or walk away.'],
 ['Franchise','scoutp','Scouting and the combine','Draft prospects\' ratings are a guess until your scouts look at them; combine results for every prospect.'],
 ['Franchise','staff','Coaching staff','Hire offense, defense and development coaches, a trainer and a scout. Each one matters.'],
 ['Franchise','camp','Training camp','Before each season, pick what your players work on.'],
 ['Franchise','plan','Weekly game plan','Pick a plan for your games (feed the star, pound the paint, bombs away...). It counts in simulated games too.'],
 ['Franchise','fin','Finances','Ticket prices, attendance, revenue, expenses and arena upgrades.'],
 ['Franchise','owner','Owner and job security','The owner sets goals each season. Miss them too often and you are fired.'],
 ['Franchise','riv','Rivalries','A rival team, louder rivalry games and a head-to-head record.'],
 ['Franchise','story','Storylines','Headlines about streaks, big games, breakout players and the MVP race.'],
 ['Franchise','ach','Achievements','Unlock achievements for big games, streaks and titles.'],
 ['Franchise','potw','Player of the week','The best player in each conference every week.'],
 ['Franchise','slots','Save slots','Keep up to 3 different leagues.'],
 ['Franchise','recap','Season recap','A summary at the end of each season.'],
 ['Franchise','uni2','Custom uniforms','Pick your team\'s colors, jersey style and court.'],
 ['Franchise','pscale','Full-game stats','Stats from games you play with short quarters count as if the game were 48 minutes, so season stats stay fair.'],
 ['Franchise','dnd','Drag-and-drop lineup','Drag players on the roster page to change the lineup.'],
 ['Help','undo','Undo last sim','Take back the last simulated game, week or series.'],
 ['Help','autobk','Season backup file','Download a backup of your league at the end of each season.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const PERS=[['Leader','Lifts the whole team\'s mood.'],['Competitor','Only happy when the team wins.'],['Team player','Fine with any role.'],['Loyal','Gives a discount to stay.'],['Mercenary','Goes where the money is.'],['Diva','Wants the ball and the minutes.'],['Hard worker','Improves faster.'],['Laid back','Improves slower, rarely upset.']];
const PW=[1,1.4,2,1,1.2,.8,1.2,1];
function persPick(){let s=PW.reduce((a,b)=>a+b),q=rnd()*s;for(let i=0;i<PW.length;i++){q-=PW[i];if(q<=0)return PERS[i][0]}return'Team player'}
const STAFFR={off:['Offense coach','Better shots for your team.'],def:['Defense coach','Tougher shots for the other team.'],dev:['Development coach','Young players improve faster; training camp works better.'],med:['Trainer','Fewer injuries and faster recovery.'],sc:['Scout','More scouting each draft.']};
function mkStaff(k,lvl){const r=clamp(Math.round((lvl||55)+gauss()*9),35,95);return{n:pick(FN)+' '+pick(LN),r,sal:Math.round(Math.max(.4,(r-35)/12)*10)/10,k}}
// make sure every save has the new fields (older saves get them the first time they load)
function ensureR(){if(!R)return;if(R.fran)return;R.fran=1;R.cash=R.cash==null?25:R.cash;R.tix=R.tix||1;R.hype=R.hype==null?50:R.hype;R.arena=R.arena||{cap:18000,score:0,gym:0,med:0};R.fin=R.fin||{rev:0,exp:0,log:[],hist:[]};
 R.owner=R.owner||{sat:60,goal:null,hist:[]};R.staff=R.staff||{off:mkStaff('off',58),def:mkStaff('def',58),dev:mkStaff('dev',55),med:mkStaff('med',55),sc:mkStaff('sc',55)};R.ach=R.ach||{};R.plan=R.plan||'bal';R.offers=R.offers||[];R.ts=R.ts||{};R.wk=R.wk||{};R.pk=R.pk||{};R.rivRec=R.rivRec||[0,0];R.uni=R.uni||{style:0,floor:-1};
 R.pl.forEach(p=>{if(!p.pers)p.pers=persPick();if(p.mor==null)p.mor=70;if(p.s0==null)p.s0=ovr(p)});if(R.riv==null)R.riv=pickRival();if(!R.owner.goal)R.owner.goal=ownerGoal();for(let s=R.season;s<=R.season+1;s++)for(let rd=1;rd<=2;rd++)for(let t=0;t<30;t++){const k=`${s}-${rd}-${t}`;if(R.pk[k]==null)R.pk[k]=t}}
{const _nl=newLeague;newLeague=function(o){const r=_nl(o);ensureR();capFix();hSave();return r}}
{const _hl=hLoad;hLoad=function(){const ok=_hl();if(ok&&R)ensureR();return ok}}
function pickRival(){const c=R.t[0].conf,L=R.t.map((t,i)=>i).filter(i=>i&&R.t[i].conf==c);return L.sort((a,b)=>Math.abs(teamOvr(a)-teamOvr(0))-Math.abs(teamOvr(b)-teamOvr(0)))[0]||1}
// salary cap: no team starts far over, and you start under it
function capFix(){for(let t=0;t<30;t++){const lim=t===0?CAP-8:CAP*1.08,pay=payroll(t);if(pay>lim){const f=lim/pay;teamPl(t).forEach(p=>p.sal=Math.max(MINSAL,Math.round(p.sal*f*10)/10))}}}
// ---------- morale and chemistry ----------
function expMin(p){const L=teamPl(p.tid).filter(q=>!q.inj).sort((a,b)=>ovr(b)-ovr(a)),i=L.indexOf(p);return i<0?0:(MINS[i]||0)}
function moraleTick(t){if(!feat('morale'))return;const T=R.t[t],wp=wpct(t);teamPl(t).forEach(p=>{let d=0;const role=rotation(t).indexOf(p),gotMin=role<0?0:(MINS[role]||0),want=expMin(p);
  d+=(gotMin-want)*(p.pers=='Diva'?.12:p.pers=='Team player'||p.pers=='Laid back'?.03:.06);d+=(wp-.5)*(p.pers=='Competitor'?6:3);if(T.strk>=3)d+=1;if(T.strk<=-3)d-=1;
  if(feat('pers')&&p.pers=='Mercenary'&&p.sal<salFor(p)*.75)d-=1;d+=(70-p.mor)*.05;p.mor=clamp(p.mor+d*.5,0,100);
  if(t===0&&p.mor<25&&!p.unhappyNews){p.unhappyNews=1;addNews(`${p.n} is unhappy${want>gotMin+6?' with his minutes':''} and wants a change.`,1)}if(p.mor>45)p.unhappyNews=0})}
function chem(t){if(!feat('morale'))return 50;const L=rotation(t).slice(0,8);if(!L.length)return 50;let m=L.reduce((a,p)=>a+p.mor,0)/L.length;const lead=L.some(p=>p.pers=='Leader')?6:0,stay=L.filter(p=>(p.yrs||0)>=1).length*1.5;return clamp(Math.round(m*.7+lead+stay+8),0,100)}
// ---------- staff, plans, home court: effects in games ----------
const GPLANS={bal:['Balanced','No special plan.'],star:['Feed the star','Your best scorer takes more shots.'],paint:['Pound the paint','Drive and post up more.'],bombs:['Bombs away','Shoot more threes.'],lock:['Lock down their star','Extra attention on their best scorer.'],slow:['Slow it down','Fewer possessions; good when you are the weaker team.'],run:['Run and gun','More possessions, more points.']};
function teamEdge(t){let a=0;if(t===0){if(feat('staff'))a+=(R.staff.off.r-60)*.0007;if(feat('morale'))a+=(chem(0)-50)*.0004}return a}
function teamDef(t){return t===0&&feat('staff')?(R.staff.def.r-60)*.0007:0}
simAdj=function(o,d){let a=teamEdge(o)-teamDef(d);if(feat('plan')&&(o===0||d===0)){const P=R.plan;if(o===0&&P=='paint')a+=.006;if(d===0&&P=='lock')a-=.006;if(o===0&&P=='bombs')a+=.003}
 // home court: the home team is the first one passed to simGame
 return a};
simPace=function(a,b){if(!feat('plan')||(a!==0&&b!==0))return 0;return R.plan=='slow'?-7:R.plan=='run'?7:0};
simUse=function(t,p){if(!feat('plan')||t!==0)return 1;if(R.plan=='star'){const top=teamPl(0).slice().sort((a,b)=>ovr(b)-ovr(a))[0];return p===top?1.35:.97}if(R.plan=='bombs')return 1+(p.sk.thr-62)/60;if(R.plan=='paint')return 1+(p.sk.lay+p.sk.post-124)/90;return 1};
{const _sa=shotAdj;shotAdj=function(e,typ,info){let a=_sa(e,typ,info);if(!G||G.viewer)return a;const k=e.t,tid=G.tm[k];a+=teamEdge(tid)-teamDef(G.tm[opp(k)]);if(feat('morale')&&tid===0&&e.p.mor!=null)a+=(e.p.mor-60)*.0005;return a}}
{const _ng=newGame;newGame=function(...a){const g=_ng.apply(this,a);try{if(feat('plan')&&g.calls&&!g.auto){const P=R.plan;if(P=='paint')g.calls[0].o='post';else if(P=='bombs')g.calls[0].o='spread';else if(P=='slow')g.calls[0].o='slow';else if(P=='run')g.calls[0].o='push';else if(P=='star')g.calls[0].o='iso';if(P=='lock')g.calls[0].d='tight'}if(feat('riv')&&g.tm.includes(R.riv)){g.riv=1;g.hype=1}}catch(e){}return g}}
// ---------- finances, hype and the arena ----------
const SEASONF=()=>82/Math.max(10,R.slen);
function attendance(home,opp){const T=R.t[home],wp=wpct(home),riv=feat('riv')&&home===0&&opp===R.riv?.12:0,big=R.po?.2:0;return Math.round(R.arena.cap*clamp(.5+R.hype*.004+wp*.25-(R.tix-1)*.7+riv+big+(R.arena.score?.04:0),.25,1))}
function finGame(a,b){if(!feat('fin'))return;const f=SEASONF(),pay=payroll(0),staff=Object.values(R.staff).reduce((s,x)=>s+x.sal,0);let rev=0,exp=(pay+staff+6)/R.slen*(R.po?.5:1);
 if(a===0){const att=attendance(0,b);rev+=att*95*R.tix/1e6*f+ (2.2+R.hype*.03)*f*(R.po?1.5:1);R.fin.att=(R.fin.att||[]).concat([att]).slice(-41)}rev+=2.6*f*.5;R.cash=Math.round((R.cash+rev-exp)*100)/100;R.fin.rev+=rev;R.fin.exp+=exp}
function hypeAfter(won,mg){R.hype=clamp(R.hype+(won?1.2:-1)+(mg>20?(won?.8:-.8):0)+(R.po?(won?1.5:-.5):0),0,100)}
const UPG={cap:['More seats','+2,000 seats',22],score:['New scoreboard','Fans enjoy games more (+ attendance)',8],gym:['Practice facility','Players improve a little faster',15],med:['Medical center','Fewer injuries',10]};
function buyUpg(k){const c=UPG[k][2];if(R.cash<c)return toast('Not enough cash.');if(k=='cap'){if(R.arena.cap>=24000)return toast('The arena is as big as it gets.');R.arena.cap+=2000}else{if(R.arena[k])return;R.arena[k]=1}R.cash-=c;addNews(`Arena upgrade: ${UPG[k][0]}.`,1);hSave();finUI()}
function finUI(){PAGE='fin';if(!feat('fin')){shell('<div class="head"><h1>Finances</h1><p>Finances are switched off on the Game features page.</p></div>');return}const att=R.fin.att||[],avg=att.length?Math.round(att.reduce((a,b)=>a+b,0)/att.length):attendance(0,1);
 shell(`<div class="head"><h1>Finances</h1><p>Cash <b>${money(R.cash)}</b> · This season: revenue ${money(R.fin.rev)}, expenses ${money(R.fin.exp)} · Fan hype ${Math.round(R.hype)}/100</p></div>
 <div class="cols"><div class="card"><h3>Tickets</h3><p>Average crowd ${avg.toLocaleString()} of ${R.arena.cap.toLocaleString()} seats. Higher prices bring in more per fan but fewer fans.</p><label>Ticket price <input type="range" min="0.6" max="1.6" step="0.05" value="${R.tix}" oninput="R.tix=+this.value;$('tixv').textContent='$'+Math.round(95*R.tix)" onchange="hSave()"> <b id="tixv">$${Math.round(95*R.tix)}</b></label>
 <p class="small">Next home game: about ${attendance(0,1).toLocaleString()} fans at this price.</p></div>
 <div class="card"><h3>Arena upgrades</h3><table class="t">${Object.keys(UPG).map(k=>`<tr><td><b>${UPG[k][0]}</b><br><small>${UPG[k][1]}</small></td><td>${money(UPG[k][2])}</td><td>${k=='cap'?R.arena.cap.toLocaleString():R.arena[k]?'Built':B(`buyUpg('${k}')`,'Build','xs')}${k=='cap'&&R.arena.cap<24000?B(`buyUpg('cap')`,'Build','xs'):''}</td></tr>`).join('')}</table></div></div>
 <div class="card"><h3>Past seasons</h3><table class="t"><tr><th>Season</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr>${R.fin.hist.map(h=>`<tr><td>${h.s}</td><td>${money(h.rev)}</td><td>${money(h.exp)}</td><td class="${h.rev>=h.exp?'w':'l'}">${money(h.rev-h.exp)}</td></tr>`).join('')||'<tr><td>No finished seasons yet.</td></tr>'}</table></div>`)}
// ---------- staff ----------
let STAFFPOOL=null;
function staffUI(){PAGE='staff';if(!feat('staff')){shell('<div class="head"><h1>Coaching staff</h1><p>The coaching staff is switched off on the Game features page.</p></div>');return}if(!STAFFPOOL)STAFFPOOL=Object.keys(STAFFR).flatMap(k=>[mkStaff(k,50),mkStaff(k,62),mkStaff(k,72)]);
 shell(`<div class="head"><h1>Coaching staff</h1><p>Staff salaries come out of your cash (${money(R.cash)}). Hiring someone new costs a one-time fee of one year's salary.</p></div><div class="cols">${Object.keys(STAFFR).map(k=>{const s=R.staff[k];return`<div class="card"><h3>${STAFFR[k][0]}</h3><p class="small">${STAFFR[k][1]}</p><p><b>${esc(s.n)}</b> · rating ${ovrPill(s.r)} · ${money(s.sal)}/yr</p>
  <table class="t">${STAFFPOOL.filter(c=>c.k==k).map(c=>`<tr><td>${esc(c.n)}</td><td>${ovrPill(c.r)}</td><td>${money(c.sal)}/yr</td><td>${B(`hireStaff('${k}','${esc(c.n)}')`,'Hire','xs')}</td></tr>`).join('')}</table></div>`}).join('')}</div>`)}
function hireStaff(k,n){const c=STAFFPOOL.find(x=>x.k==k&&x.n==n);if(!c)return;if(R.cash<c.sal)return toast('Not enough cash.');R.cash-=c.sal;STAFFPOOL=STAFFPOOL.filter(x=>x!==c).concat([R.staff[k]]);R.staff[k]=c;addNews(`You hired ${c.n} as ${STAFFR[k][0].toLowerCase()}.`,1);hSave();staffUI()}
// ---------- the owner ----------
function ownerGoal(){const r=[...Array(30).keys()].sort((a,b)=>teamOvr(b)-teamOvr(a)).indexOf(0);const g=r<6?{k:'series',t:'Win a playoff series'}:r<16?{k:'po',t:'Make the playoffs'}:{k:'wins',n:Math.round(R.slen*.4),t:`Win ${Math.round(R.slen*.4)} games`};if(feat('fin')&&rnd()<.35)g.t2='Make a profit';return g}
function ownerJudge(){const o=R.owner,g=o.goal||ownerGoal(),T=R.t[0],P=R.po||{},inPo=R.hist.length&&R.hist[R.hist.length-1];let met=false;const madePo=R.poTeams&&R.poTeams.includes(0),wonSer=(R.poWins||0)>0;
 if(g.k=='wins')met=T.w>=g.n;else if(g.k=='po')met=madePo;else met=wonSer;const champ=inPo&&inPo.champ===0;let d=met?12:-16;if(champ)d+=20;if(g.t2){const prof=R.fin.rev-R.fin.exp;d+=prof>=0?5:-6}d+=(wpct(0)-.5)*20;
 o.sat=clamp(Math.round(o.sat+d),0,100);o.hist.push({s:R.season,goal:g.t+(g.t2?' and '+g.t2.toLowerCase():''),met,sat:o.sat});addNews(`Owner: ${met?'goal met':'goal missed'} (${g.t}). Satisfaction ${o.sat}/100.`,1);o.goal=null;return o.sat}
function firedUI(){$('ui').hidden=false;$('gamewrap').hidden=true;const offers=R.t.map((t,i)=>i).filter(i=>i).sort((a,b)=>wpct(a)-wpct(b)).slice(0,3);
 $('ui').innerHTML=`<div class="start"><div class="card"><h1>You're fired</h1><p>The owner of the ${esc(R.t[0].n)} has let you go after season ${R.season}. Satisfaction fell to ${R.owner.sat}/100.</p><h3>Job offers</h3>${offers.map(j=>`<p>${B(`takeJob(${j})`,`Take over the ${esc(R.t[j].n)} (${R.t[j].w}-${R.t[j].l})`)}</p>`).join('')}<p>${B("lsDel(slotKey());R=null;startUI()",'Start a new league','danger')}</p></div></div>`}
// swap team 0 (yours) with team j everywhere
function swapTeam(j){const sw=t=>t===0?j:t===j?0:t;[R.t[0],R.t[j]]=[R.t[j],R.t[0]];R.pl.forEach(p=>{if(p.tid===0||p.tid===j)p.tid=sw(p.tid);if(p.draft)p.draft.t=sw(p.draft.t)});R.sched=R.sched.map(d=>d.map(g=>g.map(sw)));
 if(R.po){R.po.ser.forEach(s=>{s.a=sw(s.a);s.b=sw(s.b)});R.po.seeds=R.po.seeds.map(L=>L.map(sw))}if(R.dr)R.dr.picks.forEach(p=>p.t=sw(p.t));R.box.forEach(b=>{b.a=sw(b.a);b.b=sw(b.b)});R.rot={};for(const k in R.pk)R.pk[k]=sw(R.pk[k]);R.riv=pickRival();R.offers=[];R.offer=null}
function takeJob(j){swapTeam(j);R.owner={sat:50,goal:null,hist:R.owner.hist};R.owner.goal=ownerGoal();addNews(`You are the new GM and coach of the ${R.t[0].n}.`,1);hSave();homeUI()}
// ---------- new players get a personality ----------
{const _mp=mkPlayer;mkPlayer=function(...a){const p=_mp.apply(this,a);p.pers=persPick();p.mor=70;p.s0=ovr(p);return p}}
// holdouts sit out
{const _ro=rotation;rotation=function(t){const L=_ro(t);return t===0?L.filter(p=>!p.hold):L}}
// ---------- after every game ----------
const ACH=[['win1','First win','Win a game.'],['streak5','Hot streak','Win 5 in a row.'],['streak10','Unstoppable','Win 10 in a row.'],['p30','30-piece','A player scores 30 in a game.'],['p50','Fifty','A player scores 50 in a game.'],
 ['td','Triple-double','A player gets 10 in three stats.'],['a15','Dime dropper','A player has 15 assists.'],['t8','Rain maker','A player makes 8 threes.'],['blow30','Blowout','Win by 30.'],['clutch','Clutch','Win a game you played by 1 or 2 points.'],['ot','Overtime thriller','Win in overtime.'],
 ['played20','Gym rat','Play 20 games yourself.'],['po','Postseason','Make the playoffs.'],['ser','Moving on','Win a playoff series.'],['conf','Conference champions','Reach the Finals.'],['champ','Champions','Win the title.'],['dyn','Dynasty','Win 3 titles.'],
 ['mvp','MVP','A player of yours wins MVP.'],['roy','Rookie of the year','A player of yours wins Rookie of the Year.'],['w75','Juggernaut','Win 75% of your games in a season.'],['pick1','Number one','Draft first overall.'],['star','Star signing','Sign a free agent rated 78 or more.'],
 ['trade','Blockbuster','Trade for a player rated 78 or more.'],['profit','In the black','Finish a season with a profit.'],['full','Sold out','Sell out a home game.'],['s5','Veteran GM','Reach season 5.']];
function unlock(k){if(!feat('ach')||R.ach[k])return;R.ach[k]=R.season;const a=ACH.find(x=>x[0]==k);if(a){addNews(`Achievement unlocked: ${a[1]}.`,1);if(typeof document!='undefined'&&document.body){ACHQ.push(a[1]);if(!ACHT)ACHT=setTimeout(()=>{try{toast(ACHQ.length>1?`🏆 ${ACHQ.length} achievements: ${ACHQ.join(', ')}`:'🏆 '+ACHQ[0])}catch(e){}ACHQ=[];ACHT=null},400)}}}
let ACHQ=[],ACHT=null;
function scaleRes(res,f){res.T.forEach(S=>S.box=S.box.map(b=>{const o=b.slice(),r=v=>{const x=v*f,i=Math.floor(x);return i+(rnd()<x-i?1:0)};SS.forEach((k,i)=>{if(k!='gp'&&k!='gs')o[i]=r(b[i])});
 o[SI.fga]=Math.max(o[SI.fga],o[SI.fgm]);o[SI.tpm]=Math.min(o[SI.tpm],o[SI.fgm]);o[SI.tpa]=Math.max(o[SI.tpa],o[SI.tpm]);o[SI.fta]=Math.max(o[SI.fta],o[SI.ftm]);o[SI.pts]=2*(o[SI.fgm]-o[SI.tpm])+3*o[SI.tpm]+o[SI.ftm];o[SI.min]=Math.min(o[SI.min],53);return o}))}
{const _rg=recGame;recGame=function(a,b,res,played){if(played&&feat('pscale')&&G&&G.ql<720){res={...res,T:res.T.map(S=>({...S,box:S.box.map(x=>x.slice())}))};scaleRes(res,720/G.ql)}
  _rg(a,b,res,played);try{const [sa,sb]=res.sc;
   // team stats
   [[a,0],[b,1]].forEach(([t,k])=>{const ts=R.ts[t]=R.ts[t]||{g:0,f:newSS(),o:newSS()};ts.g++;res.T[k].box.forEach(x=>x.forEach((v,i)=>ts.f[i]+=v));res.T[1-k].box.forEach(x=>x.forEach((v,i)=>ts.o[i]+=v))});
   // player of the week log
   res.T.forEach(S=>S.ps.forEach((p,i)=>{const w=R.wk[p.id]=R.wk[p.id]||[0,0];w[0]++;w[1]+=gsc(S.box[i])}));
   // storylines from other games
   if(feat('story'))res.T.forEach((S,k)=>S.ps.forEach((p,i)=>{const x=S.box[i];if(x[SI.pts]>=40&&(rnd()<.6||p.tid===0))addNews(`${p.n} (${R.t[S.t].ab}) scored ${x[SI.pts]} points.`,p.tid===0)}));
   if(a!==0&&b!==0)return;const me=a===0?0:1,won=res.sc[me]>res.sc[1-me],mg=res.sc[me]-res.sc[1-me],o=a===0?b:a;
   finGame(a,b);if(feat('fin'))hypeAfter(won,Math.abs(mg));moraleTick(0);
   if(o===R.riv&&!R.po){R.rivRec[won?0:1]++;if(feat('riv'))addNews(`Rivalry: ${won?'you beat':'you lost to'} the ${R.t[o].n} (${R.rivRec[0]}-${R.rivRec[1]} this season).`,1)}
   if(played)R.playedN=(R.playedN||0)+1;
   if(won)unlock('win1');if(R.t[0].strk>=5)unlock('streak5');if(R.t[0].strk>=10)unlock('streak10');if(won&&mg>=30)unlock('blow30');if(won&&played&&mg<=2)unlock('clutch');if(won&&res.ot)unlock('ot');if((R.playedN||0)>=20)unlock('played20');
   res.T[me].box.forEach(x=>{if(x[SI.pts]>=30)unlock('p30');if(x[SI.pts]>=50)unlock('p50');if(x[SI.ast]>=15)unlock('a15');if(x[SI.tpm]>=8)unlock('t8');if([x[SI.pts],x[SI.orb]+x[SI.drb],x[SI.ast],x[SI.stl],x[SI.blk]].filter(v=>v>=10).length>=3)unlock('td')});
   if(feat('fin')&&a===0&&(R.fin.att||[]).slice(-1)[0]>=R.arena.cap)unlock('full')}catch(e){console.error(e)}}}
// ---------- each day ----------
{const _ds=dailyStuff;dailyStuff=function(){_ds();try{
  // trainer and medical center: injured players on your team heal faster
  if(feat('staff')||R.arena.med)teamPl(0).forEach(p=>{if(p.inj>1&&rnd()<(feat('staff')?(R.staff.med.r-45)/120:0)+(R.arena.med?.15:0))p.inj--});
  // development coach and practice facility: extra growth for young players
  if(feat('dev')&&R.day%5==0)teamPl(0).forEach(p=>{if(p.age<=25&&rnd()<(feat('staff')?(R.staff.dev.r-55)/150:0)+(R.arena.gym?.08:0)+(feat('pers')&&p.pers=='Hard worker'?.1:0))hUp(p,bestGroup(p),1)});
  if(R.day%7==0&&R.day>0){if(feat('potw')&&!R.po)[0,1].forEach(c=>{let best=null,bv=-1;for(const id in R.wk){const w=R.wk[id];if(w[0]<2)continue;const p=R.pl.find(q=>q.id==id);if(!p||p.tid<0||R.t[p.tid].conf!=c)continue;const v=w[1]/w[0];if(v>bv){bv=v;best=p}}
    if(best){best.aw.push(`${R.season} Player of the week`);addNews(`${['East','West'][c]} player of the week: ${best.n} (${R.t[best.tid].ab}).`,best.tid===0)}});R.wk={};R.prPrev=prRank()}
  if(feat('story')){R.t.forEach((t,i)=>{if(t.strk==6)addNews(`${t.n} have won 6 in a row.`,i===0);if(t.strk==-6)addNews(`${t.n} have lost 6 straight.`,i===0)});
   if(R.day%10==0&&R.day>0&&!R.po){const el=R.pl.filter(p=>p.tid>=0&&p.ss[SI.gp]>=3).sort((a,b)=>(pg(b,'pts')+pg(b,'ast')+pg(b,'drb')+wpct(b.tid)*10)-(pg(a,'pts')+pg(a,'ast')+pg(a,'drb')+wpct(a.tid)*10));if(el[0])addNews(`MVP race: ${el[0].n} (${R.t[el[0].tid].ab}) leads at ${f1(pg(el[0],'pts'))} points a game.`,el[0].tid===0)}
   if(R.day==Math.floor(R.sched.length/2)){const br=R.pl.filter(p=>p.tid>=0&&p.age<=24&&ovr(p)-p.s0>=3).sort((a,b)=>(ovr(b)-b.s0)-(ovr(a)-a.s0))[0];if(br)addNews(`Breakout: ${br.n} (${R.t[br.tid].ab}) is up ${ovr(br)-br.s0} overall this season.`,br.tid===0)}}
  cpuOffer()}catch(e){console.error(e)}}}
// ---------- playoffs and the end of the season ----------
{const _sp=startPlayoffs;startPlayoffs=function(){_sp();R.poTeams=R.po.seeds.flat();R.poWins=0;if(R.poTeams.includes(0))unlock('po')}}
{const _pa=poAdvance;poAdvance=function(){const P=R.po;const done=P.ser.every(serDone);if(done)P.ser.forEach(s=>{if((s.a===0||s.b===0)&&serWin(s)===0){R.poWins=(R.poWins||0)+1;unlock('ser');if(P.rd==2)unlock('conf')}});_pa()}}
{const _se=seasonEnd;seasonEnd=function(){_se();try{const h=R.hist[R.hist.length-1];if(h.champ===0){unlock('champ');if(R.hist.filter(x=>x.champ===0).length>=3)unlock('dyn')}
  const mine=k=>{const p=R.pl.find(q=>q.id===h[k]);return p&&p.tid===0};if(mine('mvp'))unlock('mvp');if(mine('roy'))unlock('roy');if(wpct(0)>=.75)unlock('w75');
  if(feat('fin')){R.fin.hist.push({s:R.season,rev:R.fin.rev,exp:R.fin.exp});if(R.fin.rev>=R.fin.exp)unlock('profit')}
  let fired=false;if(feat('owner')){const sat=ownerJudge();if(sat<20)fired=true}
  R.recap={s:R.season,rec:[R.t[0].w,R.t[0].l],po:R.poTeams&&R.poTeams.includes(0)?(h.champ===0?'Won the title!':`Won ${R.poWins||0} playoff series`):'Missed the playoffs',champ:h.champ,
   aw:['mvp','dpoy','roy','six'].map(k=>{const p=R.pl.find(q=>q.id===h[k]);return p?[k,p.n,p.tid]:null}).filter(Boolean),ach:Object.keys(R.ach).filter(k=>R.ach[k]===R.season),
   lead:teamPl(0).filter(p=>p.ss[SI.gp]).sort((a,b)=>pg(b,'pts')-pg(a,'pts')).slice(0,3).map(p=>[p.n,f1(pg(p,'pts')),f1(pg(p,'orb')+pg(p,'drb')),f1(pg(p,'ast'))]),
   prog:teamPl(0).map(p=>[p.n,ovr(p)-p.s0]).sort((a,b)=>b[1]-a[1]).slice(0,3),owner:feat('owner')?R.owner.hist.slice(-1)[0]:null,fin:feat('fin')?R.fin.hist.slice(-1)[0]:null,shown:0};
  if(fired)R.fired=1;
  // draft order belongs to whoever owns each pick
  }catch(e){console.error(e)}}}
{const _md=mkDraft;mkDraft=function(){_md();try{R.dr.picks.forEach(pk=>{const k=`${R.season}-${pk.rd}-${pk.t}`;if(R.pk[k]!=null&&R.pk[k]!==pk.t){pk.orig=pk.t;pk.t=R.pk[k]}});
  if(R.dr.picks[0].t===0)unlock('pick1');R.scoutPts=feat('scoutp')?3+(feat('staff')?Math.round((R.staff.sc.r-50)/10):0):0;
  R.pl.forEach(p=>{if(p.tid===-2){p.sc=0;p.cmb={ws:p.ht+ri(1,7),vert:Math.round(26+(p.sk.vert-50)*.35+gauss()*1.5),sprint:+(3.45-(p.sk.spd-50)*.012+gauss()*.04).toFixed(2),lane:+(11.6-(p.sk.acc-50)*.03+gauss()*.15).toFixed(2),shoot:clamp(Math.round(10+(p.sk.thr-50)*.25+gauss()*2),2,25)};p.fz=ri(-6,6)}})}catch(e){console.error(e)}}}
{const _ns=newSeason;newSeason=function(){const prevT={};R.pl.forEach(p=>prevT[p.id]=p.tid);_ns();try{R.pl.forEach(p=>{p.yrs=prevT[p.id]===p.tid?(p.yrs||0)+1:0;p.s0=ovr(p);p.mor=clamp(Math.round(p.mor*.5+35),0,100);delete p.unhappyNews});
  for(const k in R.pk){if(+k.split('-')[0]<R.season)delete R.pk[k]}for(let s=R.season;s<=R.season+1;s++)for(let rd=1;rd<=2;rd++)for(let t=0;t<30;t++){const k=`${s}-${rd}-${t}`;if(R.pk[k]==null)R.pk[k]=t}
  R.fin.rev=0;R.fin.exp=0;R.fin.att=[];R.ts={};R.wk={};R.poWins=0;R.poTeams=null;R.rivRec=[0,0];if(feat('riv'))R.riv=pickRival();R.owner.goal=ownerGoal();if(feat('camp'))R.camp=1;if(R.season>=5)unlock('s5');
  // holdouts: underpaid stars who are unhappy
  if(feat('morale'))teamPl(0).forEach(p=>{if((p.pers=='Mercenary'||p.pers=='Diva')&&ovr(p)>=72&&p.sal<salFor(p)*.6&&p.mor<55&&rnd()<.6){p.hold=1;addNews(`${p.n} is holding out for a new contract.`,1)}});
  R.recap&&(R.recap.shown=1);hSave()}catch(e){console.error(e)}}}
// ---------- power rankings ----------
function prScore(t){const T=R.t[t],gp=Math.max(1,T.w+T.l);return wpct(t)*60+(T.pf-T.pa)/gp*1.4+teamOvr(t)*.6}
function prRank(){return R.t.map((_,i)=>i).sort((a,b)=>prScore(b)-prScore(a))}
function prUI(){PAGE='pr';const L=prRank(),prev=R.prPrev||L;shell(`<div class="head"><h1>Power rankings</h1><p>Record, point differential and roster strength. Arrows show the change since last week.</p></div><div class="card"><table class="t"><tr><th>#</th><th></th><th>Team</th><th>Record</th><th>Diff</th><th>Team rating</th></tr>${L.map((t,i)=>{const T=R.t[t],gp=Math.max(1,T.w+T.l),ch=prev.indexOf(t)-i;return`<tr class="${t===0?'me':''}"><td>${i+1}</td><td class="${ch>0?'w':ch<0?'l':''}">${ch>0?'&#9650;'+ch:ch<0?'&#9660;'+(-ch):''}</td><td>${tlink(t)}</td><td>${rec(t)}</td><td>${((T.pf-T.pa)/gp>0?'+':'')+f1((T.pf-T.pa)/gp)}</td><td>${ovrPill(teamOvr(t))}</td></tr>`}).join('')}</table></div>`)}
// ---------- team stats ----------
function tstatsUI(){PAGE='tstats';const rows=R.t.map((_,t)=>{const s=R.ts[t];if(!s||!s.g)return null;const g=s.g,v=(x,k)=>x[SI[k]]/g;return{t,pts:v(s.f,'pts'),opp:v(s.o,'pts'),fg:s.f[SI.fgm]/Math.max(1,s.f[SI.fga]),tp:s.f[SI.tpm]/Math.max(1,s.f[SI.tpa]),reb:v(s.f,'orb')+v(s.f,'drb'),ast:v(s.f,'ast'),tov:v(s.f,'tov'),stl:v(s.f,'stl'),blk:v(s.f,'blk'),ofg:s.o[SI.fgm]/Math.max(1,s.o[SI.fga])}}).filter(Boolean);
 const rk=(k,low)=>{const L=rows.slice().sort((a,b)=>low?a[k]-b[k]:b[k]-a[k]);return r=>L.indexOf(r)+1};const cols=[['pts','Points',0],['opp','Allowed',1],['fg','FG%',0],['tp','3P%',0],['reb','Rebounds',0],['ast','Assists',0],['tov','Turnovers',1],['stl','Steals',0],['blk','Blocks',0],['ofg','Opp FG%',1]];
 const fm=(k,v)=>k=='fg'||k=='tp'||k=='ofg'?(v*100).toFixed(1):f1(v),me=rows.find(r=>r.t===0);
 shell(`<div class="head"><h1>Team stats</h1><p>Per game this season, with your league rank.</p></div>${me?`<div class="card"><div class="grid3">${cols.map(([k,n,low])=>`<div><small>${n}</small><h2 style="margin:2px 0">${fm(k,me[k])}</h2><small>${rk(k,low)(me)}${['th','st','nd','rd'][rk(k,low)(me)%10<4&&(rk(k,low)(me)<11||rk(k,low)(me)>13)?rk(k,low)(me)%10:0]} of 30</small></div>`).join('')}</div></div>`:''}
 <div class="card"><div class="tw"><table class="t"><tr><th>Team</th>${cols.map(c=>`<th>${c[1]}</th>`).join('')}</tr>${rows.sort((a,b)=>b.pts-b.opp-(a.pts-a.opp)).map(r=>`<tr class="${r.t===0?'me':''}"><td>${tlink(r.t)}</td>${cols.map(([k])=>`<td>${fm(k,r[k])}</td>`).join('')}</tr>`).join('')||'<tr><td>No games yet.</td></tr>'}</table></div></div>`)}
function boxesUI(){PAGE='box';shell(`<div class="head"><h1>Box scores</h1><p>Every game you have played or simulated this season and last.</p></div><div class="card"><table class="t">${R.box.slice().reverse().map((b,i)=>{const k=R.box.length-1-i,m=b.a===0?0:1,o=b.a===0?b.b:b.a,w=b.sc[m]>b.sc[1-m];return`<tr class="click" onclick="boxUI(${k})"><td>Season ${b.s}</td><td>${b.po!=null?RDN[b.po]:'Game '+(b.d+1)}</td><td>${b.a===0?'vs':'@'} ${esc(R.t[o].n)}</td><td class="${w?'w':'l'}">${w?'W':'L'} ${b.sc[m]}-${b.sc[1-m]}${b.ot?' OT':''}</td><td>${b.played?'played':'sim'}</td></tr>`}).join('')||'<tr><td>No games yet.</td></tr>'}</table></div>`)}
// ---------- achievements, owner pages ----------
function achUI(){PAGE='ach';const n=Object.keys(R.ach).length;shell(`<div class="head"><h1>Achievements</h1><p>${n} of ${ACH.length} unlocked.</p></div><div class="card"><div class="grid3">${ACH.map(([k,nm,d])=>`<div class="ach ${R.ach[k]?'on':''}"><b>${R.ach[k]?'🏆':'🔒'} ${nm}</b><small>${d}${R.ach[k]?` · season ${R.ach[k]}`:''}</small></div>`).join('')}</div></div>`)}
function ownerUI(){PAGE='owner';const o=R.owner,g=o.goal;shell(`<div class="head"><h1>Owner</h1><p>Satisfaction <b>${o.sat}/100</b>. Below 20 at the end of a season and you are fired.</p></div><div class="card"><h3>This season's goal</h3><p>${g?esc(g.t)+(g.t2?' and '+g.t2.toLowerCase():''):'-'}</p><div class="stb" style="width:300px"><em style="width:${o.sat}%;background:${o.sat>50?'#4ade80':o.sat>25?'#fbbf24':'#f87171'}"></em></div></div>
 <div class="card"><h3>History</h3><table class="t">${o.hist.slice().reverse().map(h=>`<tr><td>Season ${h.s}</td><td>${esc(h.goal)}</td><td class="${h.met?'w':'l'}">${h.met?'Met':'Missed'}</td><td>${h.sat}/100</td></tr>`).join('')||'<tr><td>No finished seasons yet.</td></tr>'}</table></div>`)}
// ---------- weekly game plan, training camp, recap, undo: cards on the home page ----------
let UNDO=null;function undoSave(){if(feat('undo'))try{UNDO=JSON.stringify(R)}catch(e){UNDO=null}}
function undoGo(){if(!UNDO)return;R=JSON.parse(UNDO);UNDO=null;hSave();toast('The last sim was undone.');homeUI()}
{const f=simGameUI;simGameUI=function(...a){undoSave();return f.apply(this,a)}}{const f=simDaysUI;simDaysUI=function(...a){undoSave();return f.apply(this,a)}}
{const f=simSeriesUI;simSeriesUI=function(...a){undoSave();return f.apply(this,a)}}{const f=poDayUI;poDayUI=function(...a){undoSave();return f.apply(this,a)}}{const f=poAllUI;poAllUI=function(...a){undoSave();return f.apply(this,a)}}
{const _pg=playGame;playGame=function(...a){UNDO=null;return _pg.apply(this,a)}}
function campUI(){PAGE='camp';const L=rotation(0).slice(0,12);shell(`<div class="head"><h1>Training camp</h1><p>Pick what each player works on, and how hard. Hard camps give bigger gains but players can get hurt.</p><label>Intensity <select id="cint"><option value="1">Light</option><option value="2" selected>Normal</option><option value="3">Hard</option></select></label></div>
 <div class="card"><table class="t"><tr><th>Player</th><th>Pos</th><th>Age</th><th>Ovr</th><th>Focus</th></tr>${L.map(p=>`<tr><td>${plink(p)}</td><td>${p.pos}</td><td>${p.age}</td><td>${ovrPill(ovr(p))}</td><td><select data-id="${p.id}">${Object.keys(HG).map(g=>`<option value="${g}" ${bestGroup(p)==g?'selected':''}>${HG[g][0]}</option>`).join('')}</select></td></tr>`).join('')}</table>${B('campGo()','Run training camp','big')}</div>`)}
function campGo(){const n=+$('cint').value,out=[];document.querySelectorAll('select[data-id]').forEach(s=>{const p=R.pl.find(q=>q.id==s.dataset.id);if(!p)return;const k=Math.max(1,Math.round(n*(1+(feat('staff')?(R.staff.dev.r-60)/60:0)+(R.arena.gym?.2:0)+(feat('pers')&&p.pers=='Hard worker'?.3:p.pers=='Laid back'?-.3:0))));const b=ovr(p),g=hUp(p,s.value,k);if(n==3&&rnd()<.06){p.inj=ri(2,6);out.push(`${p.n} got hurt in camp (${p.inj} games).`)}out.push(`${p.n}: ${gotTxt(g)||'no change'}${ovr(p)>b?` (overall ${ovr(p)})`:''}`)});
 R.camp=0;R.pl.forEach(p=>p.s0=ovr(p));hSave();homeUI();modal(`<h2>Training camp results</h2><ul class="news">${out.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`)}
function recapUI(){const r=R.recap;if(!r)return;r.shown=1;hSave();modal(`<h2>Season ${r.s} recap</h2><div class="cols"><div class="card"><h3>${r.rec[0]}-${r.rec[1]}</h3><p>${esc(r.po)}. Champions: ${esc(R.t[r.champ]?R.t[r.champ].n:'')}.</p>${r.owner?`<p>Owner: ${r.owner.met?'goal met':'goal missed'} (${esc(r.owner.goal)}). Satisfaction ${r.owner.sat}/100.</p>`:''}${r.fin?`<p>Profit: ${money(r.fin.rev-r.fin.exp)}</p>`:''}</div>
 <div class="card"><h3>Your leaders</h3>${r.lead.map(l=>`<p>${esc(l[0])}: ${l[1]} pts, ${l[2]} reb, ${l[3]} ast</p>`).join('')}<h3>Most improved</h3>${r.prog.map(l=>`<p>${esc(l[0])}: ${l[1]>=0?'+':''}${l[1]}</p>`).join('')}</div></div>
 <div class="card"><h3>Awards</h3>${r.aw.map(([k,n,t])=>`<p>${{mvp:'MVP',dpoy:'Defensive Player of the Year',roy:'Rookie of the Year',six:'Sixth Man'}[k]}: ${esc(n)} (${esc(R.t[t]?R.t[t].ab:'')})</p>`).join('')}${r.ach.length?`<p>Achievements: ${r.ach.map(k=>esc((ACH.find(a=>a[0]==k)||[0,k])[1])).join(', ')}</p>`:''}</div>${feat('autobk')?B('exportSave()','Download a backup of this season'):''}`)}
{const _hu=homeUI;homeUI=function(){ensureR();if(R.fired&&feat('owner'))return firedUI();_hu();try{const m=$('mainpg');if(!m)return;let h='';
  if(R.camp&&feat('camp')&&!R.stage)h+=`<div class="card hot"><h3>Training camp</h3><p>Before the season starts, decide what your players work on.</p>${B('campUI()','Go to camp','big')}${B('R.camp=0;hSave();homeUI()','Skip')}</div>`;
  if(R.recap&&!R.recap.shown&&feat('recap'))setTimeout(recapUI,50);
  if(UNDO&&feat('undo'))h+=`<div class="row">${B('undoGo()','Undo last sim')}</div>`;
  let side='';if(feat('plan')&&!R.stage)side+=`<div class="card"><h3>Game plan</h3><select onchange="R.plan=this.value;hSave()">${Object.keys(GPLANS).map(k=>`<option value="${k}" ${R.plan==k?'selected':''}>${GPLANS[k][0]}</option>`).join('')}</select><p class="small">${GPLANS[R.plan][1]} Used in simulated games and as your starting call in games you play.</p></div>`;
  if(feat('owner')&&R.owner.goal)side+=`<div class="card"><h3>Owner</h3><p>Goal: ${esc(R.owner.goal.t)}${R.owner.goal.t2?' and '+esc(R.owner.goal.t2.toLowerCase()):''}. Satisfaction ${R.owner.sat}/100.</p></div>`;
  if(feat('morale'))side+=`<div class="card"><h3>Team chemistry</h3><p>${chem(0)}/100 ${chem(0)>65?'· a tight group':chem(0)<40?'· there is tension':''}</p></div>`;
  if(feat('riv')&&R.riv!=null)side+=`<div class="card"><h3>Rival</h3><p>${tlink(R.riv)} · ${R.rivRec[0]}-${R.rivRec[1]} this season</p></div>`;
  const hd=m.querySelector('.head');if(hd)hd.insertAdjacentHTML('afterend',h+(side?`<div class="grid3">${side}</div>`:''));
  const ng=nextGame();if(feat('riv')&&ng&&!R.po&&(ng[0]===R.riv||ng[1]===R.riv)){const c=m.querySelector('.card.hot h3');if(c)c.insertAdjacentHTML('beforeend',' <span class="pill" style="background:#f87171">Rivalry game</span>')}}catch(e){console.error(e)}}}
// ---------- contract negotiation ----------
function demand(p,mode){let d=askFor(p);if(feat('pers')){if(p.pers=='Mercenary')d*=1.15;if(p.pers=='Diva')d*=1.08;if(p.pers=='Loyal'&&mode=='re')d*=.9}if(feat('morale')&&mode=='re'&&p.mor<40)d*=1.2;if(mode=='fa'&&wpct(0)<.4&&R.day>0)d*=1.08;return clamp(Math.round(d*10)/10,MINSAL,MAXSAL)}
const wantY=p=>p.age<27?4:p.age<31?3:2;
let NEG=null;
function negUI(id,mode){const p=R.pl.find(q=>q.id===id);if(!p)return;if(p.noTalk===R.season)return toast(`${p.ln} won't talk to you again this offseason.`);if(!NEG||NEG.id!==id)NEG={id,mode,d:demand(p,mode),tries:0,msg:''};const N=NEG;
 const room=CAP-payroll(0)+(mode=='re'?0:0);modal(`<div class="ph"><div><h2>${mode=='re'?'Re-sign':'Sign'} ${esc(p.n)}</h2><p>${p.pos} · ${p.age} · overall ${ovr(p)}${feat('pers')?' · '+esc(p.pers):''}${feat('morale')&&mode=='re'?' · mood '+Math.round(p.mor):''}</p></div></div>
 <p>He is asking for about <b>${money(N.d)}</b> a year for <b>${wantY(p)} years</b>.${mode=='fa'?` Your cap room: ${money(room)} (anyone can sign for the minimum).`:''}</p>${N.msg?`<p class="card">${esc(N.msg)}</p>`:''}
 <label>Salary per year <input type="number" id="nsal" min="${MINSAL}" max="${MAXSAL}" step="0.1" value="${N.d}"> million</label><label>Years <select id="nyrs">${[1,2,3,4,5].map(y=>`<option ${y==wantY(p)?'selected':''}>${y}</option>`).join('')}</select></label>${B(`negOffer()`,'Make the offer','big')}`)}
function negOffer(){const N=NEG,p=R.pl.find(q=>q.id===N.id);if(!p)return;const sal=clamp(+$('nsal').value||0,MINSAL,MAXSAL),y=+$('nyrs').value,need=N.d*(1+Math.abs(y-wantY(p))*.03);
 if(N.mode=='fa'){if(teamPl(0).length>=15)return toast('Your roster is full (15).');if(sal>CAP-payroll(0)&&sal>MINSAL+.5)return toast('Not enough cap room for that offer.')}
 if(sal>=need){if(N.mode=='re'){p.keep=1;p.sal=Math.round(sal*10)/10;p.exp=R.season+y;if(feat('morale'))p.mor=Math.min(100,p.mor+8);NEG=null;closeModal();hSave();return resignUI()}
  p.tid=0;p.sal=Math.round(sal*10)/10;p.exp=R.season+y;p.mor=75;R.rot[0]=null;addNews(`You signed ${p.n} (${money(p.sal)} a year, ${y} years).`,1);if(ovr(p)>=78)unlock('star');NEG=null;closeModal();hSave();return faUI()}
 N.tries++;if(N.tries>=3||sal<N.d*.7){p.noTalk=R.season;if(N.mode=='re'){p.keep=0;p.walk=1}N.msg=`${p.ln} is done talking. ${N.mode=='re'?'He will test free agency.':''}`;NEG=null;closeModal();hSave();toast(`${p.ln} walked away from the table.`);return N.mode=='re'?resignUI():faUI()}
 if(sal>=N.d*.88){N.d=Math.round((N.d+sal)/2*1.02*10)/10;N.msg=`He comes down a little: ${money(N.d)} a year.`}else N.msg='That is not close. Try again.';negUI(N.id,N.mode)}
{const _k=keep;keep=function(id,y){if(!feat('neg'))return _k(id,y);NEG=null;negUI(id,'re')}}
{const _s=signFA;signFA=function(id){if(!feat('neg'))return _s(id);NEG=null;negUI(id,'fa')}}
{const _r=resignDone;resignDone=function(){R.pl.forEach(p=>{if(p.walk){p.keep=0;delete p.walk}});_r()}}
// ---------- scouting and the combine in the draft ----------
function scoutTxt(p){if(!feat('scoutp'))return[ovr(p),pot(p)];const sp=[9,6,3,0][Math.min(3,p.sc||0)],o=ovr(p)+Math.round((p.fz||0)*sp/9),pt=pot(p)+Math.round((p.fz||0)*sp/6);return sp?[`${o-sp}-${o+sp}`,`${pt-sp}-${pt+sp}`]:[ovr(p),pot(p)]}
draftKey=function(p){if(!feat('scoutp'))return pot(p)*.6+ovr(p)*.4;const sp=[9,6,3,0][Math.min(3,p.sc||0)];return(pot(p)+(p.fz||0)*sp/6)*.6+(ovr(p)+(p.fz||0)*sp/9)*.4};
function scoutP(id){const p=R.pl.find(q=>q.id===id);if(!p||(R.scoutPts||0)<1||(p.sc||0)>=3)return;R.scoutPts--;p.sc=(p.sc||0)+1;hSave();draftUI()}
{const _du=draftUI;draftUI=function(){_du();try{if(!feat('scoutp')||!R.dr)return;const m=$('mainpg');const hd=m&&m.querySelector('.head p');if(hd)hd.insertAdjacentHTML('beforeend',` Scouting points: <b>${R.scoutPts||0}</b>. ${B('combineUI()','Combine results','xs')}`);
  // replace the ovr/pot columns with scouted ranges
  m.querySelectorAll('table.t tr').forEach(tr=>{const a=tr.querySelector('a[onclick^="playerUI"]');if(!a)return;const id=+a.getAttribute('onclick').match(/\d+/)[0],p=R.pl.find(q=>q.id===id);if(!p||p.tid!==-2)return;const td=tr.querySelectorAll('td'),[o,pt]=scoutTxt(p);if(td[4])td[4].innerHTML=typeof o=='number'?ovrPill(o):`<small>${o}</small>`;if(td[5])td[5].innerHTML=`${pt}${(p.sc||0)<3&&(R.scoutPts||0)>0?' '+B(`scoutP(${p.id})`,'Scout','xs'):''}`})}catch(e){console.error(e)}}}
function combineUI(){const L=R.pl.filter(p=>p.tid===-2&&p.cmb).sort((a,b)=>(pot(b)*.6+ovr(b)*.4)-(pot(a)*.6+ovr(a)*.4)).slice(0,40);modal(`<h2>Draft combine</h2><p class="small">Measurements for the top prospects. Wingspan and vertical help inside; the sprint and lane agility times show quickness (lower is better); the shooting drill is out of 25.</p><div class="tw"><table class="t"><tr><th>Name</th><th>Pos</th><th>Height</th><th>Wingspan</th><th>Vertical</th><th>Sprint</th><th>Lane agility</th><th>Shooting</th></tr>${L.map(p=>`<tr><td>${esc(p.n)}</td><td>${p.pos}</td><td>${htTxt(p.ht)}</td><td>${htTxt(p.cmb.ws)}</td><td>${p.cmb.vert}"</td><td>${p.cmb.sprint}s</td><td>${p.cmb.lane}s</td><td>${p.cmb.shoot}/25</td></tr>`).join('')}</table></div>`)}
{const _pu=playerUI;playerUI=function(id){_pu(id);try{const p=R.pl.find(q=>q.id===id);if(!p)return;const m=$('modal').querySelector('.mbox');
  if(p.tid===-2&&feat('scoutp')){const [o,pt]=scoutTxt(p),ov=m.querySelector('.ov');if(ov)ov.innerHTML=`<b class="pill" style="background:#94a3b8">${o}</b><small>potential ${pt}</small>`;m.querySelectorAll('.rt b').forEach(b=>{if((p.sc||0)<2)b.textContent='?'});if((p.sc||0)<2)m.querySelectorAll('.rt em,.rt u').forEach(x=>x.style.opacity=.25)}
  let extra='';if(feat('pers')&&p.pers)extra+=`<b>${esc(p.pers)}</b>: ${esc((PERS.find(x=>x[0]==p.pers)||['',''])[1])} `;if(feat('morale')&&p.tid===0)extra+=`· Mood ${Math.round(p.mor)}/100 ${p.mor>70?'😊':p.mor<35?'😠':'😐'}`;
  if(p.hold&&p.tid===0)extra+=`<br><b class="l">Holding out.</b> ${B(`endHold(${p.id})`,`Give him a raise to ${money(salFor(p))}`,'xs')}`;
  if(extra){const ph=m.querySelector('.ph');if(ph)ph.insertAdjacentHTML('afterend',`<p>${extra}</p>`)}}catch(e){console.error(e)}}}
function endHold(id){const p=R.pl.find(q=>q.id===id);if(!p)return;p.sal=salFor(p);p.hold=0;p.mor=Math.min(100,p.mor+15);addNews(`${p.n} ended his holdout with a raise.`,1);hSave();playerUI(id)}
// ---------- trades with draft picks; several trade offers ----------
function pickVal(k){const [s,rd,o]=k.split('-').map(Number),rank=R.t.map((_,i)=>i).sort((a,b)=>wpct(a)-wpct(b)).indexOf(o);let v=rd==1?40+130*Math.pow(1-rank/29,1.5):12;if(s>R.season)v*=.85;return v}
function pickName(k){const [s,rd,o]=k.split('-').map(Number);return`${s} round ${rd} pick${o!==R.pk[k]?` (from ${R.t[o].ab})`:''}`}
const ownedPk=t=>Object.keys(R.pk).filter(k=>R.pk[k]===t&&+k.split('-')[0]>=R.season&&!(R.dr&&+k.split('-')[0]==R.season)).sort();
function tradeVal(t,give,get,gpk,tpk){// value the CPU team t gets minus what it gives
 const a=give.reduce((s,p)=>s+pval(p),0)+gpk.reduce((s,k)=>s+pickVal(k),0),b=get.reduce((s,p)=>s+pval(p),0)+tpk.reduce((s,k)=>s+pickVal(k),0);return[a,b]}
function tradeOK2(t,give,get,gpk,tpk){const [a,b]=tradeVal(t,give,get,gpk,tpk);const sal0=payroll(0)-give.reduce((s,p)=>s+p.sal,0)+get.reduce((s,p)=>s+p.sal,0);
 if(teamPl(0).length-give.length+get.length<9)return'You would have too few players.';if(teamPl(t).length+give.length-get.length>15)return'They would have too many players.';
 if(sal0>CAP+15&&get.reduce((s,p)=>s+p.sal,0)>give.reduce((s,p)=>s+p.sal,0)*1.25)return'That would put you too far over the cap.';return a>=b*1.08?true:`They want more value (${Math.round(a)} vs ${Math.round(b*1.08)}).`}
{const _tu=tradeUI;tradeUI=function(){TR.gpk=TR.gpk||[];TR.tpk=TR.tpk||[];_tu();try{const t=TR.t,m=$('mainpg'),cards=m.querySelectorAll('.cols .card');if(cards.length<2)return;
  const row=(k,arr,on)=>`<tr class="click ${on?'sel':''}" onclick="trPk('${arr}','${k}')"><td>${on?'&#10003;':''}</td><td colspan="5">${esc(pickName(k))}</td></tr>`;
  cards[0].querySelector('table').insertAdjacentHTML('beforeend',ownedPk(0).map(k=>row(k,'gpk',TR.gpk.includes(k))).join(''));cards[1].querySelector('table').insertAdjacentHTML('beforeend',ownedPk(t).map(k=>row(k,'tpk',TR.tpk.includes(k))).join(''));
  const g=TR.give.map(id=>R.pl.find(p=>p.id===id)).filter(p=>p&&p.tid===0),h=TR.get.map(id=>R.pl.find(p=>p.id===id)).filter(p=>p&&p.tid===t);const res=(g.length||TR.gpk.length)&&(h.length||TR.tpk.length)?tradeOK2(t,g,h,TR.gpk,TR.tpk):null;
  const last=m.querySelector('.card:last-child');if(last)last.innerHTML=`<p>${res===true?'<b class="w">They would accept.</b>':res?esc(res):'Pick at least one player or pick on each side.'}</p>${res===true?B('doTrade()','Make the trade','big'):''}`}catch(e){console.error(e)}}}
function trPk(a,k){const L=TR[a],i=L.indexOf(k);i<0?L.push(k):L.splice(i,1);tradeUI()}
doTrade=function(){const t=TR.t,g=TR.give.map(id=>R.pl.find(p=>p.id===id)).filter(Boolean),h=TR.get.map(id=>R.pl.find(p=>p.id===id)).filter(Boolean);if(tradeOK2(t,g,h,TR.gpk||[],TR.tpk||[])!==true)return;
 g.forEach(p=>{p.tid=t;p.mor=60});h.forEach(p=>{p.tid=0;p.mor=65});(TR.gpk||[]).forEach(k=>R.pk[k]=t);(TR.tpk||[]).forEach(k=>R.pk[k]=0);R.rot[0]=null;R.rot[t]=null;if(h.some(p=>ovr(p)>=78))unlock('trade');
 addNews(`Trade with ${R.t[t].n}: you get ${h.map(p=>p.n).concat((TR.tpk||[]).map(pickName)).join(', ')||'nothing'} for ${g.map(p=>p.n).concat((TR.gpk||[]).map(pickName)).join(', ')}.`,1);TR={t,give:[],get:[],gpk:[],tpk:[]};hSave();toast('Trade done!');tradeUI()};
cpuOffer=function(){if(!feat('trades')||R.stage||R.po||(R.offers||[]).length>=3||rnd()>.1)return;const t=ri(1,29),mine=teamPl(0).filter(p=>!p.inj).sort((a,b)=>ovr(b)-ovr(a)),w=pick(mine.slice(1,10));if(!w)return;
 // they offer a player (and sometimes a pick) for one of yours
 const c=teamPl(t).filter(p=>p.pos!==w.pos&&pval(p)<pval(w)*1.05&&pval(p)>pval(w)*.55).sort((a,b)=>pval(b)-pval(a))[0];if(!c)return;let tpk=[];const [a,b]=tradeVal(t,[w],[c],[],[]);if(a>b*1.25){const pk=ownedPk(t).find(k=>k.split('-')[1]=='2');if(pk)tpk=[pk]}
 if(tradeOK2(t,[w],[c],[],tpk)!==true)return;R.offers.push({t,give:[w.id],get:[c.id],tpk,d:R.day});addNews(`The ${R.t[t].n} want to talk trade about ${w.n}.`,1)};
function offerOK(o){return o.give.every(id=>{const p=R.pl.find(q=>q.id===id);return p&&p.tid===0})&&o.get.every(id=>{const p=R.pl.find(q=>q.id===id);return p&&p.tid===o.t})&&o.tpk.every(k=>R.pk[k]===o.t)}
function offerTxt(o){const nm=id=>{const p=R.pl.find(q=>q.id===id);return p?`${plink(p)} (${p.pos}, ${ovr(p)}, age ${p.age}, ${money(p.sal)})`:''};return`They want ${o.give.map(nm).join(', ')} and would give you ${o.get.map(nm).concat(o.tpk.map(k=>esc(pickName(k)))).join(' and ')}.`}
offerCard=function(){R.offers=(R.offers||[]).filter(offerOK);const o=R.offers[0];if(!o)return'';return`<div class="card offer"><h3>Trade offer from ${tlink(o.t)}${R.offers.length>1?` <small>(${R.offers.length} offers)</small>`:''}</h3><p>${offerTxt(o)}</p><div class="row">${B('offerAns(0,1)','Accept')}${B('offerAns(0,0)','Decline')}${R.offers.length>1?B('offersUI()','See all offers'):''}</div></div>`};
function offerAns(i,yes){const o=R.offers[i];if(!o)return;R.offers.splice(i,1);if(yes&&offerOK(o)){o.give.forEach(id=>{const p=R.pl.find(q=>q.id===id);p.tid=o.t});o.get.forEach(id=>{const p=R.pl.find(q=>q.id===id);p.tid=0;if(ovr(p)>=78)unlock('trade')});o.tpk.forEach(k=>R.pk[k]=0);R.rot[0]=null;R.rot[o.t]=null;addNews(`Trade done with the ${R.t[o.t].n}.`,1)}hSave();PAGE=='offers'?offersUI():homeUI()}
function offersUI(){PAGE='offers';R.offers=(R.offers||[]).filter(offerOK);shell(`<div class="head"><h1>Trade offers</h1><p>Other teams call with offers during the season.</p></div>${R.offers.map((o,i)=>`<div class="card offer"><h3>${tlink(o.t)} <small>(${rec(o.t)})</small></h3><p>${offerTxt(o)}</p>${B(`offerAns(${i},1)`,'Accept')}${B(`offerAns(${i},0)`,'Decline')}</div>`).join('')||'<div class="card"><p>No offers right now.</p></div>'}`)}
function picksUI(){PAGE='picks';const L=ownedPk(0);shell(`<div class="head"><h1>Draft picks</h1><p>Picks you own for this season's and next season's drafts. You can trade them on the Trade page.</p></div><div class="card"><table class="t">${L.map(k=>`<tr><td>${esc(pickName(k))}</td><td>value ${Math.round(pickVal(k))}</td></tr>`).join('')||'<tr><td>You have traded all your picks.</td></tr>'}</table></div>`)}
// ---------- save slots ----------
function slotKey(n){n=n||OPT.slot||1;return n==1?'hoops_save':'hoops_save_'+n}
hSave=function(){if(!R)return;R.saved=Date.now();const k=slotKey(),s=JSON.stringify(R);if(!lsSet(k,s)){try{R.box=R.box.slice(-20);lsSet(k,JSON.stringify(R))}catch(e){}}const old=lsGet(k+'_b1');if(old)lsSet(k+'_b2',old);lsSet(k+'_b1',s);lsSet('hoops_meta_'+(OPT.slot||1),JSON.stringify({n:R.t[0].n,s:R.season,w:R.t[0].w,l:R.t[0].l,at:R.saved}))};
hLoad=function(){try{const s=lsGet(slotKey());if(s){R=JSON.parse(s);ensureR();return true}}catch(e){}return false};
function slotsHTML(){if(!feat('slots'))return'';const cur=OPT.slot||1;return`<div class="card"><h3>Save slots</h3><table class="t">${[1,2,3].map(n=>{let m=null;try{m=JSON.parse(lsGet('hoops_meta_'+n))}catch(e){}const has=!!lsGet(slotKey(n));return`<tr class="${n==cur?'me':''}"><td>Slot ${n}</td><td>${has?(m?`${esc(m.n)} · season ${m.s} · ${m.w}-${m.l}`:'A saved league'):'Empty'}</td><td>${n==cur?'<b>Playing</b>':has?B(`slotGo(${n})`,'Load','xs')+B(`slotDel(${n})`,'Delete','xs danger'):B(`slotGo(${n},1)`,'New league here','xs')}</td></tr>`}).join('')}</table></div>`}
function slotGo(n,fresh){hSave();OPT.slot=n;optSave();R=null;if(!fresh&&hLoad())homeUI();else startUI()}
function slotDel(n){if(!confirm('Delete this saved league?'))return;[slotKey(n),slotKey(n)+'_b1',slotKey(n)+'_b2','hoops_meta_'+n].forEach(lsDel);setUI()}
{const _s=setUI;setUI=function(){_s();try{const m=$('mainpg');if(m)m.insertAdjacentHTML('beforeend',slotsHTML())}catch(e){}}}
resetUI=function(){if(!confirm('Start a new league in this slot? This league will be deleted (download a backup first if you want to keep it).'))return;lsDel(slotKey());R=null;startUI()};
// ---------- custom uniforms ----------
const USTY=['Plain','Side stripes','Pinstripes','Two-tone'];
function uniUI(){PAGE='uni';const t=R.t[0];shell(`<div class="head"><h1>Uniforms and court</h1><p>Your colors, your jersey and your home floor.</p></div><div class="card">
 <label>Main color <input type="color" value="${t.col[0]}" onchange="R.t[0].col=[this.value,R.t[0].col[1]];hSave();uniUI()"></label><label>Second color <input type="color" value="${t.col[1]}" onchange="R.t[0].col=[R.t[0].col[0],this.value];hSave();uniUI()"></label>
 <label>Jersey style <select onchange="R.uni.style=+this.value;hSave();uniUI()">${USTY.map((s,i)=>`<option value="${i}" ${R.uni.style==i?'selected':''}>${s}</option>`).join('')}</select></label>
 <label>Home floor <select onchange="R.uni.floor=+this.value;hSave()"><option value="-1">Automatic</option>${FLOORS.map((f,i)=>`<option value="${i}" ${R.uni.floor==i?'selected':''}>Floor ${i+1}</option>`).join('')}</select></label>
 <div class="row" style="gap:16px;align-items:flex-end">${faceSVG(teamPl(0)[0]||{id:1,tid:0},80)}<svg width="70" height="90" viewBox="0 0 70 90"><path d="M15 5 L28 5 Q35 16 42 5 L55 5 L60 50 L10 50Z" fill="${t.col[0]}"/>${R.uni.style==1?`<rect x="10" y="10" width="5" height="40" fill="${t.col[1]}"/><rect x="55" y="10" width="5" height="40" fill="${t.col[1]}"/>`:R.uni.style==2?[18,26,34,42,50].map(x=>`<rect x="${x}" y="8" width="1.5" height="42" fill="${t.col[1]}" opacity=".6"/>`).join(''):R.uni.style==3?`<path d="M35 12 L60 50 L35 50Z" fill="${t.col[1]}" opacity=".5"/>`:''}<text x="35" y="38" text-anchor="middle" font-weight="900" font-size="16" fill="${t.col[1]}">23</text><rect x="10" y="52" width="50" height="30" fill="${t.col[0]}"/></svg></div></div>`)}
floorFor=function(t){if(t===0&&R.uni&&R.uni.floor>=0)return FLOORS[R.uni.floor%FLOORS.length];return FLOORS[t%FLOORS.length]};
{const _db=drawBody;drawBody=function(e,gx,gy,y0,h,w,sp,swing,face,jer,trim){_db(e,gx,gy,y0,h,w,sp,swing,face,jer,trim);try{if(!feat('uni2')||!feat('model2')||G.tm[e.t]!==0||G.home!==0)return;const st=R.uni.style;if(!st)return;const sh=y0-h*.8,hip=y0-h*.45,bw=w*(.9+(e.p.wt-200)/600);
  CX.fillStyle=trim;if(st==1){CX.fillRect(gx-bw*.41,sh+h*.02,bw*.07,hip-sh-h*.06);CX.fillRect(gx+bw*.34,sh+h*.02,bw*.07,hip-sh-h*.06)}else if(st==2){CX.globalAlpha=.45;for(let i=-2;i<=2;i++)CX.fillRect(gx+i*bw*.16,sh+h*.03,1,hip-sh-h*.07);CX.globalAlpha=1}else if(st==3){CX.globalAlpha=.35;CX.beginPath();CX.moveTo(gx,sh+h*.03);CX.lineTo(gx+bw*.4,hip-h*.04);CX.lineTo(gx,hip-h*.04);CX.fill();CX.globalAlpha=1}}catch(x){}}}
// ---------- roster: drag to reorder, mood, personality, progress ----------
{const _ru=rosterUI;rosterUI=function(){_ru();try{const m=$('mainpg'),ids=rotation(0).map(p=>p.id),all=teamPl(0).slice().sort((a,b)=>{const ia=ids.indexOf(a.id),ib=ids.indexOf(b.id);return(ia<0?99:ia)-(ib<0?99:ib)});
  const rows=[...m.querySelectorAll('table.t tr')].slice(1);rows.forEach((tr,i)=>{const p=all[i];if(!p)return;tr.dataset.id=p.id;const nm=tr.children[2];if(nm){let s='';if(feat('morale'))s+=` <span title="Mood ${Math.round(p.mor)}">${p.mor>70?'😊':p.mor<35?'😠':'😐'}</span>`;if(feat('pers'))s+=` <small class="small">${esc(p.pers)}</small>`;if(p.hold)s+=' <span class="inj">holdout</span>';nm.insertAdjacentHTML('beforeend',s)}
   const ov=tr.children[6];if(ov&&p.s0!=null&&ovr(p)!==p.s0)ov.insertAdjacentHTML('beforeend',` <small class="${ovr(p)>p.s0?'w':'l'}">${ovr(p)>p.s0?'+':''}${ovr(p)-p.s0}</small>`);
   if(feat('dnd')){tr.draggable=true;tr.style.cursor='grab';tr.ondragstart=ev=>{ev.dataTransfer.setData('text',p.id)};tr.ondragover=ev=>ev.preventDefault();tr.ondrop=ev=>{ev.preventDefault();const from=+ev.dataTransfer.getData('text'),L=rotation(0).map(q=>q.id),a=L.indexOf(from),b=L.indexOf(p.id);if(a<0||b<0)return;L.splice(b,0,L.splice(a,1)[0]);R.rot[0]=L;hSave();rosterUI()}}});
  if(feat('dnd')){const hp=m.querySelector('.head p');if(hp)hp.insertAdjacentHTML('beforeend',' Drag a row to move a player.')}}catch(e){console.error(e)}}}
// ---------- the menu ----------
[['roster',['tstats','Team stats','tstatsUI()']],['sched',['box','Box scores','boxesUI()']],['stand',['pr','Power rankings','prUI()']],['trade',['offers','Trade offers','offersUI()'],['picks','Draft picks','picksUI()']],['fa',['staff','Coaching staff','staffUI()'],['fin','Finances','finUI()'],['owner','Owner','ownerUI()']],['hist',['ach','Achievements','achUI()'],['uni','Uniforms','uniUI()']]].forEach(([after,...items])=>{const i=NAV.findIndex(x=>x[0]==after);NAV.splice(i+1,0,...items)});
navOK=function(k){return({staff:'staff',fin:'fin',owner:'owner',ach:'ach',uni:'uni2',offers:'trades',hl:'hl'})[k]?feat(({staff:'staff',fin:'fin',owner:'owner',ach:'ach',uni:'uni2',offers:'trades',hl:'hl'})[k]):true};
{const _ne=newLeagueGo;newLeagueGo=function(){_ne();try{ensureR();capFix();R.camp=feat('camp')?1:0;hSave();homeUI()}catch(e){console.error(e)}}}
