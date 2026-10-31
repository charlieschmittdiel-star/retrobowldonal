'use strict';
// Football GM style front end: a left sidebar with every section, and a home screen of team and league stats.
const NAVF=[['home','lobby()','Home'],['play','playNext()','Play'],['roster','rosterUI(0)','Roster'],['depth','depthUI()','Depth chart'],['stats','statsUI(0)','Team stats'],['sched','schedUI()','Schedule'],['stand','standings()','Standings'],['lead','leadersUI()','League leaders'],['trade','tradeUI()','Trade'],['fa','faUI()','Free agents'],['picks','picksUI()','Draft picks'],['staff','staff()','Coaching staff'],['po','editor()','Offense playbook'],['pd','deditor()','Defense playbook'],['hist','historyUI()','History'],['set','settingsUI()','Settings']];
const NAVC=[['home','lobby()','Home'],['play','playNext()','Play'],['roster','rosterUI(0)','Team roster'],['stats','statsUI(0)','Team stats'],['sched','schedUI()','Schedule'],['stand','standings()','Standings'],['lead','leadersUI()','League leaders'],['hist','historyUI()','History'],['po','editor()','Playbook'],['set','settingsUI()','Settings']];
function shellHTML(h){const car=R.mode=='career',T=R.lg.t[0],st=R.stage,items=(car?NAVC.filter(x=>x[0]!='po'||myPos()=='QB'):NAVF);
 const stage=st?`<button class="ni hot ${VW.page=='off'?'on':''}" onclick="playNext()">${{draft:'Draft',resign:'Re-sign players',fa:'Free agency'}[st]||'Offseason'}</button>`:'';
 return`<div class="shell"><aside class="side"><div class="brand"><div class="logo">${tAbbr(T.n).slice(0,2)}</div><div><b>${T.n}</b><span>${rec3(T)} · Season ${R.season}</span></div></div>${stage}
 ${items.map(([k,f,n])=>k=='play'&&st?'':`<button class="ni ${VW.page==k?'on':''} ${k=='play'?'hot':''}" onclick="${f}">${k=='play'?playLabel():n}</button>`).join('')}</aside><main class="main" id="mainpg">${h}</main></div>`}
function playLabel(){if(R.stage)return'Offseason';const o=nextOpp();return o<0?'Advance (bye)':'Play next game'}
function playNext(){if(R.stage)return R.mode=='career'?careerOffseason():{draft:draftUI,resign:resignUI,fa:faUI}[R.stage]();startGame()}
const pct=(a,b)=>b?Math.round(a/b*100):0;
function rankOf(tid,f){const v=f(tid);let r=1;for(let t=0;t<32;t++)if(t!==tid&&f(t)>v)r++;return r}
const unitR=(tid,u)=>{const L=lineup(tid),a=(u=='O'?L.O:L.D).filter(Boolean);return a.reduce((s,p)=>s+ovr(p),0)/Math.max(1,a.length)};
const nth=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');
function addNews(t){R.news=R.news||[];R.news.unshift({s:R.season,w:R.lg?R.lg.wk:0,t});if(R.news.length>30)R.news.length=30}
function card(title,body,cls){return`<section class="cardx ${cls||''}"><h4>${title}</h4>${body}</section>`}
function leaderRow(lbl,k,tid){const p=R.pl.filter(q=>q.tid===tid&&q.ss[SI[k]]>0).sort((a,b)=>b.ss[SI[k]]-a.ss[SI[k]])[0];return`<tr><td class="dim">${lbl}</td><td>${p?plink(p,p.n):'-'}</td><td class="num">${p?p.ss[SI[k]]:''}</td></tr>`}
function dashHome(){ctx='hub';VW.page='home';const lg=R.lg,T=lg.t,me=T[0],po=lg.po,c0=me.c,conf=T.map((_,i)=>i).filter(i=>T[i].c==c0).sort(cmp),crank=conf.indexOf(0)+1,div=T.map((_,i)=>i).filter(i=>T[i].c==c0&&T[i].d==me.d).sort(cmp),gp=me.w+me.l+me.t;
 const pay=payroll(0),capP=pct(pay,R.cap),ri=rosterIssues(),res=(lg.res||[]).slice(-1)[0];
 const rO=rankOf(0,t=>unitR(t,'O')),rD=rankOf(0,t=>unitR(t,'D')),rT=rankOf(0,teamR);
 let next='';if(R.stage){const s={draft:['The draft','Pick the next wave of talent.'],resign:['Re-sign players','Decide which expiring contracts to keep.'],fa:['Free agency',`Day ${R.fa?R.fa.day:0} of 30. Other teams are signing players.`]}[R.stage];
  next=card('Offseason',`<div class="big">${s[0]}</div><p class="dim">${s[1]}</p><div class="btns">${B('playNext()','Continue','go')}</div>`)}
 else{const o=nextOpp();next=card(po?RD[po.rd]:`Week ${lg.wk+1} of ${R.lg.sched.length}`,o<0?`<div class="big">Bye week</div><div class="btns">${B('startGame()','Advance','go')}</div>`:
  `<div class="vs"><div><span class="dim">vs</span><div class="big">${T[o].n}</div><span class="dim">${rec3(T[o])} · rating ${Math.round(teamR(o))} (yours ${Math.round(teamR(0))})</span></div></div><div class="btns">${B('startGame()','Play game','go')}${B('simGame()','Sim')}${!po?B('simRest()','Sim to playoffs'):''}</div>`)}
 const teamCard=card('Your team',`<div class="stats3"><div><b>${rec3(me)}</b><span>Record</span></div><div><b>${nth(crank)}</b><span>in conference</span></div><div><b>${gp?(me.pf/gp).toFixed(1):'-'}</b><span>points/game</span></div><div><b>${gp?(me.pa/gp).toFixed(1):'-'}</b><span>allowed/game</span></div><div><b>${nth(rO)}</b><span>offense rank</span></div><div><b>${nth(rD)}</b><span>defense rank</span></div></div>
  <p class="dim">Team rating ${Math.round(teamR(0))} (${nth(rT)} of 32) · Difficulty ${DIFFS[R.diff].n}</p>`);
 const last=res?card('Last game',`<div class="big ${res.a>res.b?'w':res.a<res.b?'l':''}">${res.a>res.b?'W':res.a<res.b?'L':'T'} ${res.a}-${res.b}</div><p class="dim">vs ${T[res.o].n}</p>`):card('Last game','<p class="dim">No games played yet this season.</p>');
 const leaders=card('Team leaders',`<table class="mini">${leaderRow('Passing yds','py',0)}${leaderRow('Rushing yds','ry',0)}${leaderRow('Receiving yds','ty',0)}${leaderRow('Tackles','tk',0)}${leaderRow('Sacks','sk',0)}${leaderRow('Interceptions','in',0)}</table>`);
 const divC=card('Your division',`<table class="mini">${div.map(i=>`<tr class="${i==0?'me':''}"><td>${T[i].n}</td><td class="num">${rec3(T[i])}</td><td class="num dim">${T[i].pf}-${T[i].pa}</td></tr>`).join('')}</table><div class="btns">${B('standings()','Full standings')}</div>`);
 const fin=card('Payroll',`<div class="bar"><i style="width:${Math.min(100,capP)}%" class="${capP>100?'over':''}"></i></div><p>${M$(pay)} of ${R.cap}M cap (${M$(R.cap-pay)} room)</p><p class="dim">${teamPl(0).length}/${MAXROS} players · ${R.pts} training points · ${R.picks.filter(k=>k.own===0).length} draft picks</p>${ri.length?`<p class="warn">${ri.join(', ')}</p>`:''}`);
 const top=k=>R.pl.filter(p=>p.tid>=0&&p.ss[SI[k]]>0).sort((a,b)=>b.ss[SI[k]]-a.ss[SI[k]])[0];
 const lead=card('League leaders',`<table class="mini">${[['Passing','py'],['Rushing','ry'],['Receiving','ty'],['Sacks','sk']].map(([n,k])=>{const p=top(k);return`<tr><td class="dim">${n}</td><td>${p?plink(p,p.n):'-'}</td><td class="dim">${p?tAbbr(T[p.tid].n):''}</td><td class="num">${p?p.ss[SI[k]]:''}</td></tr>`}).join('')}</table><div class="btns">${B('leadersUI()','All leaders')}</div>`);
 const news=card('News',(R.news||[]).slice(0,7).map(n=>`<p class="news"><span class="dim">S${n.s} W${n.w+1}</span> ${n.t}</p>`).join('')||'<p class="dim">Nothing yet. Results, injuries, signings and trades show up here.</p>');
 modal(`${saveWarn?`<p class="warn">${saveWarn}</p>`:''}<div class="hdr"><h1>${me.n}</h1><p class="dim">${lastMsg}</p></div><div class="dash">${next}${teamCard}${last}${leaders}${divC}${lead}${fin}${news}</div>`)}
function schedUI(){VW.page='sched';const lg=R.lg,T=lg.t,res=lg.res||[],rows=[];
 for(let w=0;w<lg.sched.length;w++){const m=lg.sched[w].find(x=>x.includes(0)),o=m?opp(m):-1,r=res.find(x=>x.wk==w);
  rows.push(`<tr class="${w==lg.wk&&!lg.po&&!R.stage?'me':''}"><td>Week ${w+1}</td><td>${o>=0?`<a href="#" onclick="rosterUI(${o});return false">${T[o].n}</a>`:'-'}</td><td class="dim">${o>=0?rec3(T[o]):''}</td><td>${r?`<b class="${r.a>r.b?'w':r.a<r.b?'l':''}">${r.a>r.b?'W':r.a<r.b?'L':'T'} ${r.a}-${r.b}</b>`:w<lg.wk?'':''}</td></tr>`)}
 modal(`<h1>Schedule</h1><p class="dim">Season ${R.season}. Tap a team to see its roster.</p><table>${rows.join('')}</table>`)}
