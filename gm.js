'use strict';
// Franchise and career depth: finances, coaches you hire, morale / chemistry / trade requests / holdouts, the owner,
// the scouting combine, CPU trade offers, Hall of Fame, ring of honor, record book, dynasty tracker, storylines,
// Pro Bowls and season recaps, personalities, rivalries, achievements, power rankings, scouting reports, share cards,
// challenges (two-minute drill, daily challenge), custom leagues with eras and fantasy drafts, team renaming and colors,
// and career off-field choices, X-factors, free-agent offers and position changes.
const hsh=n=>{let h=(n*2654435761)>>>0;h^=h>>>15;return h};
const nmR=()=>N1[rnd()*N1.length|0]+' '+N2[rnd()*N2.length|0];
const fr=(v,a,b)=>v<a?a:v>b?b:v;
// ---------- save fields (old saves just get defaults) ----------
function gmInit(){if(!R)return;R.fin=R.fin||{tix:1,bud:{fac:2,coach:2,med:2},cash:25,cur:{tix:0,att:0,g:0},hist:[]};R.own=R.own||{sat:60,warn:0};R.riv=R.riv||{};R.hof=R.hof||[];R.roh=R.roh||[];R.dyn=R.dyn||[];R.r1g=R.r1g||{};R.offers=R.offers||[];
 if(!R.coach){R.coach={};['oc','dc','sc'].forEach(k=>R.coach[k]={n:nmR(),lv:R.st[k]||0})}}
gmInit();
const persOf=p=>{if(p.pers===undefined){const h=hsh(p.id)%100;p.pers=h<7?'L':h<12?'D':h<20?'C':''}return p.pers};
const PERS={L:['Leader','Lifts his teammates\' morale.'],D:['Diva','Gets unhappy fast when the team loses.'],C:['Clutch','Plays faster late in close games.']};
const morOf=p=>p.mor==null?60:p.mor;
// ---------- lineups skip players who are holding out ----------
{const _lu=lineup;lineup=function(tid){const h=R.pl.filter(p=>p.hold&&p.tid===(tid==null?0:tid));h.forEach(p=>p.inj=(p.inj||0)+1000);try{return _lu(tid)}finally{h.forEach(p=>p.inj-=1000)}}}
// ---------- every week (played or simmed) ----------
{const _res=result;result=function(res,oi,sc,quiet){const wk=R.lg.wk,po=!!R.lg.po,car=CAR();let r;try{gmWeek(res,oi,sc,wk,po,car)}catch(e){console.error(e)}r=_res(res,oi,sc,quiet);return r}}
function gmWeek(res,oi,sc,wk,po,car){const T=R.lg.t,me=T[0],gp=me.w+me.l+me.t,wp=gp?(me.w+.5*me.t)/gp:.5;
 if(feat('morale')){const L=lineup(0),st=new Set([...L.O,...L.D,L.K,L.P].filter(Boolean).map(p=>p.id)),pl=teamPl(0),lead=pl.some(p=>persOf(p)=='L'&&st.has(p.id));
  pl.forEach(p=>{let m=morOf(p)+(res>0?3:res<0?-3:0)+(st.has(p.id)?1:ovr(p)>=72?-2:0)+(lead?1:0);if(persOf(p)=='D'&&res<0)m-=4;p.mor=fr(m,0,100);
   if(p.mor<22&&ovr(p)>=68&&!p.treq&&p.id!==R.me&&!car){p.treq=1;addNews(`${p.g} ${p.n} has asked to be traded.`)}if(p.treq&&p.mor>45)p.treq=0})}
 if(feat('fin')&&!car){const home=po?me.w>=T[oi].w:(wk+oi)%2==0;if(home){const f=R.fin,riv=(R.riv[oi]||0)>=8,att=Math.round(72000*fr(.5+.3*wp+.06*(f.bud.fac-2)+(riv?.08:0)+(po?.25:0)-(f.tix-1)*.55,.25,1));
  f.cur.tix+=att*f.tix*120/1e6;f.cur.att+=att;f.cur.g++;f.last=att}}
 if(feat('fin')&&!car&&R.fin.bud.med>2)teamPl(0).forEach(p=>{if(p.inj>1&&rnd()<(R.fin.bud.med-2)*.18)p.inj--});
 if(feat('riv')){const b=R.riv[oi]||0,same=T[oi].c==me.c&&T[oi].d==me.d;R.riv[oi]=b+(Math.abs(sc[0]-sc[1])<=7?3:0)+(same?2:0)+(po?6:0);if(b<8&&R.riv[oi]>=8)addNews(`A rivalry is born: ${me.n} vs ${T[oi].n}.`)}
 if(feat('offers')&&!car&&!po&&rnd()<.14)genOffer();R.offers=R.offers.filter(o=>o.until>=wk);
 if(feat('events')&&car&&!R.evt&&rnd()<.4)R.evt=EVT[rnd()*EVT.length|0][0]}
// ---------- finances ----------
const TIXB=95,budCost=l=>l*4;
function finYear(){const f=R.fin,sl=R.lg.sched.length/17,tv=205*sl,bud=Object.values(f.bud).reduce((a,l)=>a+budCost(l),0)*sl,co=['oc','dc','sc'].reduce((a,k)=>a+coachSal(R.coach[k].lv),0),pay=payroll(0);
 return{tix:f.cur.tix,tv,pay,bud,co,profit:f.cur.tix+tv-pay-bud-co}}
const coachSal=lv=>.8+lv*1.1;
function finUI(){VW.page='fin';if(!feat('fin'))return modal(`${nav()}<h1>Finances</h1><p>Finances are switched off on the Game features page.</p>`);const f=R.fin,y=finYear(),M=v=>(v<0?'-':'')+M$(Math.abs(v));
 const bud=(k,n,d)=>`<tr><td><b>${n}</b><br><span class="small">${d}</span></td><td>${'★'.repeat(f.bud[k])}${'☆'.repeat(4-f.bud[k])}</td><td class="num">${M$(budCost(f.bud[k]))}/yr</td><td>${B(`finBud('${k}',-1)`,'-')}${B(`finBud('${k}',1)`,'+')}</td></tr>`;
 modal(`${nav()}<h1>Finances</h1><p>Cash on hand: <b>${M(f.cash)}</b>. The owner watches profit, but winning matters more.</p>
 <div class="dash">${card('This season so far',`<table class="mini"><tr><td>Ticket and concession revenue</td><td class="num">${M$(y.tix)}</td></tr><tr><td>TV and sponsor money (full season)</td><td class="num">${M$(y.tv)}</td></tr><tr><td>Payroll</td><td class="num">-${M$(y.pay)}</td></tr><tr><td>Budgets</td><td class="num">-${M$(y.bud)}</td></tr><tr><td>Coaching staff salaries</td><td class="num">-${M$(y.co)}</td></tr><tr><td><b>Projected profit</b></td><td class="num"><b>${M(y.profit+(f.cur.g?f.cur.tix/f.cur.g:5.6*f.tix)*Math.max(0,R.lg.sched.length/2-f.cur.g))}</b></td></tr></table><p class="dim">${f.cur.g} home games, average attendance ${f.cur.g?Math.round(f.cur.att/f.cur.g).toLocaleString():'-'} of 72,000.</p>`)}
 ${card('Ticket price',`<div class="big">$${Math.round(TIXB*f.tix)}</div><p class="dim">Higher prices bring in more per fan but fewer fans. Winning, rivalries, playoffs and nicer facilities fill the stadium.</p><div class="btns">${B('finTix(-.1)','Lower')}${B('finTix(.1)','Raise')}</div>`)}
 ${card('Budgets',`<table class="mini">${bud('fac','Facilities','More fans, and you can see the upgrades in your stadium.')}${bud('coach','Coaching','Your young players develop faster in the offseason.')}${bud('med','Medical','Injured players come back sooner.')}</table>`,'wide')}
 ${card('History',f.hist.length?`<table class="mini"><tr><th>Season</th><th class="num">Revenue</th><th class="num">Profit</th><th class="num">Attendance</th></tr>${f.hist.slice().reverse().map(h=>`<tr><td>${h.s}</td><td class="num">${M$(h.rev)}</td><td class="num">${M(h.p)}</td><td class="num">${h.att.toLocaleString()}</td></tr>`).join('')}</table>`:'<p class="dim">Your first season.</p>')}</div>`)}
function finTix(d){R.fin.tix=fr(Math.round((R.fin.tix+d)*10)/10,.6,1.6);save();finUI()}
function finBud(k,d){R.fin.bud[k]=fr(R.fin.bud[k]+d,1,4);save();finUI()}
// ---------- coaches you hire ----------
const CROLE={oc:['Offensive coordinator',5,l=>`+${l*2} to every offensive player in games`],dc:['Defensive coordinator',5,l=>`+${l*2} to every defensive player in games`],sc:['Head scout',4,l=>`draft ratings off by about ${Math.round(7-1.5*Math.min(4,l))}`]};
function candGen(){R.cand={s:R.season};Object.keys(CROLE).forEach(k=>{R.cand[k]=[0,1,2].map(()=>({n:nmR(),lv:Math.min(CROLE[k][1],Math.floor(rnd()*rnd()*(CROLE[k][1]+1))+(rnd()<.3?1:0))}))})}
staff=function(){VW.page='staff';if(!R.cand||R.cand.s!=R.season)candGen();const fin=feat('fin');
 modal(`${nav()}<h1>Coaching staff</h1><p>Training points: ${R.pts}${fin?` · Cash ${M$(R.fin.cash)}`:''}. Hiring a coach costs training points as a signing bonus${fin?' and he draws a salary every season':''}.</p>
 ${Object.keys(CROLE).map(k=>{const c=R.coach[k],[n,mx,fx]=CROLE[k];return`<h3>${n}</h3><p><b>${esc(c.n)}</b> · level ${R.st[k]} of ${mx}${fin?` · ${M$(coachSal(R.st[k]))}/yr`:''}<br><span class="small">${fx(R.st[k])}</span></p>
  ${R.st[k]<mx?`<p>${B(`hire('${k}')`,`Send him to a coaching clinic: +1 level (${3+R.st[k]*2} points)`)}</p>`:''}
  <table class="mini"><tr><th>Available</th><th>Level</th><th>Bonus</th><th></th></tr>${R.cand[k].map((x,i)=>`<tr><td>${esc(x.n)}</td><td>${x.lv}</td><td>${x.lv*2} pts</td><td>${x.lv>R.st[k]?B(`hireC('${k}',${i})`,'Hire',R.pts>=x.lv*2?'':'dim'):'<span class="dim">not better</span>'}</td></tr>`).join('')}</table>`}).join('')}`)};
function hireC(k,i){const x=R.cand[k][i];if(!x||R.pts<x.lv*2)return staff();R.pts-=x.lv*2;R.st[k]=x.lv;R.coach[k]={n:x.n,lv:x.lv};R.cand[k].splice(i,1);addNews(`Hired ${x.n} as ${CROLE[k][0].toLowerCase()}.`);save();staff()}
{const _h=hire;hire=function(k){const b=R.st[k];_h(k);if(R.st[k]>b)R.coach[k].lv=R.st[k]}}
// ---------- CPU trade offers ----------
function genOffer(){const mine=teamPl(0).filter(p=>p.id!==R.me&&ovr(p)>=64&&!p.hold&&p.g!="K"&&p.g!="P");if(!mine.length)return;const want=mine[rnd()*mine.length|0],t=1+(rnd()*31|0),iq=IQ(),v=pval(want,iq);
 const give=teamPl(t).filter(p=>{const x=pval(p,iq);return x>=v*1.02&&x<=v*1.35}).sort((a,b)=>pval(a,iq)-pval(b,iq))[0];if(!give)return;
 R.offers.push({t,want:want.id,give:give.id,until:R.lg.wk+2});addNews(`Trade offer: ${R.lg.t[t].n} offer ${give.g} ${give.n} (${ovr(give)}) for your ${want.g} ${want.n} (${ovr(want)}).`)}
function offersUI(){VW.page='offers';const by=id=>R.pl.find(p=>p.id===id),o=R.offers.filter(x=>{const a=by(x.want),b=by(x.give);return a&&b&&a.tid===0&&b.tid===x.t});R.offers=o;
 modal(`${nav()}<h1>Trade offers</h1><p class="dim">Other teams call during the season. Offers expire after two weeks.${feat('offers')?'':' (CPU trade offers are switched off on the Game features page.)'}</p>
 ${o.length?`<table>${o.map((x,i)=>{const a=by(x.want),b=by(x.give);return`<tr><td>${esc(R.lg.t[x.t].n)}</td><td>They get ${plink(a,a.g+' '+a.n)} (${ovr(a)}, ${M$(a.sal)})</td><td>You get ${plink(b,b.g+' '+b.n)} (${ovr(b)}, ${M$(b.sal)}, age ${b.age})</td><td>${B(`offerDo(${i},1)`,'Accept','go')}${B(`offerDo(${i},0)`,'Decline')}</td></tr>`}).join('')}</table>`:'<p>No offers right now.</p>'}`)}
function offerDo(i,ok){const x=R.offers[i];if(!x)return offersUI();R.offers.splice(i,1);if(ok){const a=R.pl.find(p=>p.id===x.want),b=R.pl.find(p=>p.id===x.give);
 if(payroll(0)-a.sal+b.sal>R.cap&&!offS()){alert('That would put you over the salary cap.');return offersUI()}a.tid=x.t;a.yt=0;b.tid=0;b.yt=0;b.mor=65;addNews(`Traded ${a.g} ${a.n} to ${R.lg.t[x.t].n} for ${b.g} ${b.n}.`);achGet('trade')}save();offersUI()}
// ---------- the scouting combine ----------
function combineUI(){VW.page='comb';const pr=R.pl.filter(p=>p.tid==-2),e=scoutErr()/7,nz=(p,k)=>((hsh(p.id*7+k)%1000)/1000-.5)*2*e;
 modal(`${nav()}<h1>Scouting combine</h1><p class="dim">Measurements for this year's draft prospects. Better scouts give more accurate numbers (head scout level ${R.st.sc||0}).</p>
 ${pr.length?`<table><tr><th>Pos</th><th>Name</th><th>Age</th><th class="num">40-yd</th><th class="num">Bench</th><th class="num">3-cone</th><th class="num">Drills</th><th class="num">Est. OVR</th></tr>${pr.sort((a,b)=>estO(b)-estO(a)).map(p=>`<tr><td>${p.g}</td><td>${plink(p)}</td><td>${p.age}</td><td class="num">${(5.25-(p.sk.spd-50)*.018+nz(p,1)*.08).toFixed(2)}</td><td class="num">${Math.max(4,Math.round(p.sk.str*.36+nz(p,2)*4))}</td><td class="num">${(7.6-(p.sk.awr-50)*.014+nz(p,3)*.12).toFixed(2)}</td><td class="num">${'FDCBA'[fr(Math.floor((p.sk.skl+nz(p,4)*8-40)/12),0,4)]}</td><td class="num">${estO(p)}</td></tr>`).join('')}</table>`:'<p>The combine happens after the season, once the draft class is set.</p>'}`)}
// ---------- Hall of Fame, ring of honor, records, dynasty, storylines (season turnover) ----------
const hofTot=p=>{const t=newSS();p.car.forEach(r=>r.slice(2).forEach((v,i)=>t[i]+=v));return t};
const hofScore=(t,p)=>{const v=k=>t[SI[k]];return v('py')/900+v('ptd')*.6+v('ry')/350+v('rtd')*.7+v('ty')/350+v('tt')*.7+v('tk')/40+v('sk')*1.1+v('in')*1.8+v('fgm')*.12+(p.aw||[]).length*4+p.car.length*.5};
{const _ns=newSeason;newSeason=function(){const before=R.pl.slice(),old={},cols=R.lg.t.map(t=>t.col);before.forEach(p=>{if(p.tid>=0&&p.age<=26)old[p.id]=ovr(p)});
 const r=_ns();try{gmSeason(before,old,cols)}catch(e){console.error(e)}return r}}
function gmSeason(before,old,cols){cols.forEach((c,i)=>{if(c)R.lg.t[i].col=c});if(R.slen&&R.slen<17)R.lg.sched.length=R.slen;
 const now=new Set(R.pl.map(p=>p.id));
 before.filter(p=>!now.has(p.id)&&p.tid!=-2&&p.car&&p.car.length).forEach(p=>{const t=hofTot(p),sc=hofScore(t,p),w0=p.car.filter(r=>r[1]===0).length;
  if(sc>=45){R.hof.push({n:p.n,g:p.g,s:R.season-1,sc:Math.round(sc),tm:R.lg.t[p.car[p.car.length-1][1]]?R.lg.t[p.car[p.car.length-1][1]].n:'',tot:t,id:p.id});addNews(`${p.g} ${p.n} is headed to the Hall of Fame.`);if(w0)achGet('hof')}
  if(w0>=4&&sc>=22&&!CAR()){R.roh.push({n:p.n,g:p.g,s:R.season-1,num:jNum(p)});addNews(`${R.lg.t[0].n} retire #${jNum(p)} for ${p.n}.`)}});
 if(feat('fin')&&!CAR()){const c=R.fin.bud.coach;if(c!=2)teamPl(0).forEach(p=>{if(p.age<=27)ST.forEach(k=>{p.sk[k]=fr(Math.round(p.sk[k]+(c-2)*rnd()*.9),25,Math.max(p.sk[k],p.mx[k]))})})}
 if(feat('story')){const st=[];R.pl.forEach(p=>{if(old[p.id]!=null&&p.tid>=0){const d=ovr(p)-old[p.id];if(d>=5)st.push([d+(p.tid===0?10:0),`Breakout: ${p.g} ${p.n} (${R.lg.t[p.tid].n}) jumped from ${old[p.id]} to ${ovr(p)}.`]);
   else if(p.draft&&p.draft.rd==1&&R.season-p.draft.s>=2&&R.season-p.draft.s<=4&&d<=0&&ovr(p)<64)st.push([3+(p.tid===0?10:0),`Bust watch: first-rounder ${p.g} ${p.n} hasn't developed (${ovr(p)}).`])}});st.sort((a,b)=>b[0]-a[0]).slice(0,4).forEach(s=>addNews(s[1]))}
 if(feat('morale')&&!CAR())teamPl(0).forEach(p=>{p.mor=fr(Math.round((morOf(p)+60)/2),0,100);if(p.hold){p.hold=0}
  if(ovr(p)>=74&&p.exp>R.season&&p.sal<askFor(p,0,1)*.6&&rnd()<.3&&p.id!==R.me){p.hold=1;addNews(`${p.g} ${p.n} is holding out for a new contract.`)}});
 Object.keys(R.riv).forEach(k=>{R.riv[k]=Math.round(R.riv[k]*.85*10)/10});R.offers=[];R.fin.cur={tix:0,att:0,g:0};save();lobby()}
// season end: Pro Bowl, owner, finances, dynasty, recap
{const _fs=finishSeason;finishSeason=function(){let pb=[];try{pb=proBowl()}catch(e){console.error(e)}const champ=R.lg.po.champ,msg=lastMsg,T=R.lg.t[0],row={s:R.season,rec:rec3(T),w:T.w,l:T.l,champ:champ==0,
  po:champ==0?'Won the title':(msg.match(/Eliminated in the ([A-Za-z ]+)/)||[])[1]?'Lost in the '+msg.match(/Eliminated in the ([A-Za-z ]+)/)[1]:/missed the playoffs/i.test(msg)?'Missed the playoffs':'Playoffs'};
 let fin=null;if(feat('fin')&&!CAR()){fin=finYear();R.fin.cash+=fin.profit;R.fin.hist.push({s:R.season,rev:Math.round((fin.tix+fin.tv)*10)/10,p:Math.round(fin.profit*10)/10,att:R.fin.cur.g?Math.round(R.fin.cur.att/R.fin.cur.g):0})}
 R.dyn.push(row);if(row.champ){achGet('champ');if(R.dyn.filter(d=>d.champ).length>=3)achGet('dynasty')}if(T.l==0&&T.t==0&&T.w>=R.lg.sched.length)achGet('perfect');
 let own='';if(feat('owner')&&!CAR()){const o=R.own,po=row.po,d=(T.w-T.l)*1.2+(po=='Missed the playoffs'?-6:6)+(po.includes('Divisional')?4:po.includes('Conference')?8:po.includes('Super Bowl')?12:0)+(row.champ?18:0)+(fin?(fin.profit>0?3:-4):0)-3;
  o.sat=fr(Math.round(o.sat+d),0,100);if(o.sat<=15){if(o.warn){R.fired=1}else{o.warn=1;own='The owner is furious. Win next season or you are fired.'}}else{if(o.sat>30)o.warn=0;own=o.sat>=75?'The owner loves what you are building.':o.sat>=45?'The owner is satisfied.':'The owner is getting impatient.'}addNews('Owner: '+own)}
 const r=_fs();try{recap(row,pb,fin,own)}catch(e){console.error(e)}return r}}
function proBowl(){const S=k=>p=>p.ss[SI[k]],grp={QB:S('py'),RB:S('ry'),WR:S('ty'),TE:S('ty'),DL:S('sk'),LB:S('tk'),CB:p=>S('in')(p)*10+ovr(p),S:p=>S('in')(p)*6+S('tk')(p),K:S('fgm'),OL:p=>ovr(p),P:p=>ovr(p)},n={QB:2,RB:2,WR:4,TE:2,DL:4,LB:3,CB:4,S:3,K:1,P:1,OL:5},out=[];
 Object.keys(grp).forEach(g=>{R.pl.filter(p=>p.tid>=0&&p.g==g&&p.ss[0]>=Math.min(6,R.lg.sched.length/2)).sort((a,b)=>grp[g](b)*3+ovr(b)-grp[g](a)*3-ovr(a)).slice(0,n[g]).forEach(p=>{p.aw=p.aw||[];p.aw.push(`Pro Bowl ${R.season}`);out.push(p);if(p.id===R.me)achGet('probowl')})});return out}
function recap(row,pb,fin,own){const m=$('modal'),pg=m&&(m.querySelector('#mainpg')||m.querySelector('.pg'));if(!pg||!feat('story'))return;const mine=pb.filter(p=>p.tid===0),mo=(R.moments||[]).filter(x=>x.s==R.season).slice(-6);
 pg.insertAdjacentHTML('beforeend',`<h3>Season recap</h3><div class="dash">${card('Your season',`<div class="big">${row.rec}</div><p>${row.po}</p>${own?`<p class="dim">${own}</p>`:''}${fin?`<p class="dim">Profit ${fin.profit<0?'-':''}${M$(Math.abs(fin.profit))}</p>`:''}`)}
 ${card('Pro Bowl',mine.length?mine.map(p=>`<p>${p.g} ${esc(p.n)}</p>`).join(''):'<p class="dim">None of your players made it.</p>')}${card('Best moments',mo.length?mo.map(x=>`<p>${esc(x.t)}</p>`).join(''):'<p class="dim">Play games yourself to collect moments.</p>')}</div>`)}
{const _lb=lobby;lobby=function(...a){if(R&&R.fired&&!(G&&G.live))return firedUI();return _lb.apply(this,a)}}
function firedUI(){modal(`<h1>You're fired</h1><p>After another losing season, the owner of the ${esc(R.lg.t[0].n)} has let you go.</p><div class="grid">${B("R.fired=0;R.own.sat=30;R.own.warn=1;save();lobby()",'Beg for one more season','big')}${B('newLeagueUI()','Start a new league')}</div>`)}
function recordsUI(){VW.page='rec';const S=(p,k)=>p.ss[SI[k]],keys=[['py','Passing yards'],['ptd','Passing TD'],['ry','Rushing yards'],['rtd','Rushing TD'],['ty','Receiving yards'],['tt','Receiving TD'],['sk','Sacks'],['in','Interceptions'],['tk','Tackles']];
 const ss=k=>{let b=null;R.pl.forEach(p=>{(p.car||[]).forEach(r=>{const v=r[2+SI[k]];if(!b||v>b.v)b={v,n:p.n,s:r[0],t:r[1]}});const v=S(p,k);if(v&&(!b||v>b.v))b={v,n:p.n,s:R.season,t:p.tid}});return b};
 const ca=k=>{const a=R.pl.filter(p=>p.car&&p.car.length).map(p=>({n:p.n,v:hofTot(p)[SI[k]]+S(p,k)})).concat(R.hof.map(h=>({n:h.n+' (HOF)',v:h.tot[SI[k]]})));return a.sort((x,y)=>y.v-x.v)[0]};
 const d=R.dyn,ti=d.filter(x=>x.champ).length,pa=d.filter(x=>x.po!='Missed the playoffs').length,w=d.reduce((a,x)=>a+x.w,0),l=d.reduce((a,x)=>a+x.l,0),leg=ti*25+pa*6+w;
 modal(`${nav()}<h1>Records &amp; legacy</h1><div class="dash">${card('Dynasty tracker',`<div class="stats3"><div><b>${ti}</b><span>titles</span></div><div><b>${pa}</b><span>playoff trips</span></div><div><b>${w}-${l}</b><span>all-time</span></div><div><b>${leg}</b><span>legacy score</span></div></div>
 ${d.length?`<table class="mini">${d.slice().reverse().map(x=>`<tr><td>${x.s}</td><td>${x.rec}</td><td>${x.po}</td></tr>`).join('')}</table>`:'<p class="dim">Finish a season to start your dynasty.</p>'}`)}
 ${card('Single-season records',`<table class="mini">${keys.map(([k,n])=>{const b=ss(k);return`<tr><td class="dim">${n}</td><td>${b?esc(b.n):'-'}</td><td class="dim">${b?b.s:''}</td><td class="num">${b?b.v:''}</td></tr>`}).join('')}</table>`)}
 ${card('Career records',`<table class="mini">${keys.map(([k,n])=>{const b=ca(k);return`<tr><td class="dim">${n}</td><td>${b?esc(b.n):'-'}</td><td class="num">${b?b.v:''}</td></tr>`}).join('')}</table>`)}
 ${card('Single-game records (your games)',Object.keys(R.r1g).length?`<table class="mini">${keys.filter(([k])=>R.r1g[k]).map(([k,n])=>{const b=R.r1g[k];return`<tr><td class="dim">${n}</td><td>${esc(b.n)}</td><td class="dim">S${b.s} vs ${esc(tAbbr(b.o))}</td><td class="num">${b.v}</td></tr>`}).join('')}</table>`:'<p class="dim">Play a game to set some records.</p>')}
 ${card('Hall of Fame',R.hof.length?`<table class="mini">${R.hof.slice().reverse().map(h=>`<tr><td>${h.g}</td><td>${esc(h.n)}</td><td class="dim">${esc(h.tm)}</td><td class="dim">class of ${h.s}</td></tr>`).join('')}</table>`:'<p class="dim">Great players are inducted when they retire.</p>')}
 ${card('Ring of honor',R.roh.length?R.roh.map(h=>`<p><b>#${h.num}</b> ${h.g} ${esc(h.n)} <span class="dim">(retired ${h.s})</span></p>`).join(''):'<p class="dim">Long-time stars of your team get their numbers retired.</p>')}</div>`)}
// ---------- game end: single-game records, moments, achievements, chemistry ----------
{const _eg=endGame;endGame=function(){if(G&&G.live&&G.chal)return chEnd();try{if(G&&G.live)gmGameEnd()}catch(e){console.error(e)}return _eg()}}
function gmGameEnd(){const by={};R.pl.forEach(p=>by[p.id]=p);const s0=G.sc[0],s1=G.sc[1],win=s0>s1;let sk=0,ry=0,ptd=0;
 for(const id in G.box){const p=by[id];if(!p)continue;const s=G.box[id];['py','ptd','ry','rtd','ty','tt','sk','in','tk'].forEach(k=>{const v=s[SI[k]];if(v>0&&(!R.r1g[k]||v>R.r1g[k].v))R.r1g[k]={v,n:p.n,s:R.season,o:G.opp.n}});
  if(p.tid===0){sk+=s[SI.sk];ry=Math.max(ry,s[SI.ry]);ptd=Math.max(ptd,s[SI.ptd])}}
 if(win&&s1==0)achGet('shutout');if(s0-s1>=35)achGet('blowout');if(win&&(G.maxDef||0)>=14)achGet('comeback');if(sk>=5)achGet('sack5');if(ptd>=5)achGet('td5');if(ry>=200)achGet('run200');if(win&&(R.riv[G.opp.i]||0)>=8)achGet('rival');
 R.moments=R.moments||[];(G.hls||[]).slice(0,2).forEach(h=>R.moments.push({s:R.season,t:`${h.t} vs ${G.opp.n} (${h.q})`}));if(R.moments.length>40)R.moments.splice(0,R.moments.length-40)}
{const _xn=xNewGame;xNewGame=function(){_xn();try{const rn=new Set((R.roh||[]).map(h=>h.num)),used=new Set(rn);if(rn.size)R.pl.filter(p=>p.tid===0).sort((a,b)=>a.id-b.id).forEach(p=>{if(G.nmap[p.id])G.nmap[p.id].j=jNum(p,used)});
 G.clutch={};R.pl.forEach(p=>{if((p.tid===0||p.tid===G.opp.i)&&persOf(p)=='C')G.clutch[p.id]=1});G.maxDef=0;
 if(feat('morale')&&feat('mom')&&!CAR()){const L=lineup(0),a=[...L.O,...L.D].filter(Boolean);G.mom=fr((a.reduce((s,p)=>s+morOf(p),0)/Math.max(1,a.length)-60)/2,-15,15)}}catch(e){console.error(e)}}}
// ---------- achievements ----------
const ACH=[['pick6','Pick six','Return an interception for a touchdown.'],['scoop','Scoop and score','Return a fumble for a touchdown.'],['kr','House call','Return a kick or punt for a touchdown.'],['drive99','The long haul','Score a touchdown on a drive that started inside your 5.'],['bomb','Bombs away','Gain 80+ yards on one play.'],['fg55','Leg of steel','Make a 55+ yard field goal.'],['onside','Surprise!','Recover your own onside kick.'],['fake','Gotcha','Convert a fake punt or fake field goal.'],['safety','Safety first','Score a safety.'],
 ['shutout','Shutout','Win without allowing a point.'],['blowout','Statement game','Win by 35 or more.'],['comeback','Never say die','Win after trailing by 14 or more.'],['sack5','Sack party','Get 5 sacks in a game.'],['td5','Air raid','Throw 5 touchdown passes in a game.'],['run200','Workhorse','Rush for 200 yards with one player in a game.'],['rival','Bragging rights','Beat a rival.'],
 ['champ','Champions','Win the title.'],['perfect','Perfection','Go undefeated in the regular season.'],['dynasty','Dynasty','Win 3 titles.'],['hof','Immortal','Have one of your players inducted into the Hall of Fame.'],['trade','Dealmaker','Accept a trade offer from another team.'],
 ['chal1','Clutch','Win a challenge.'],['chal5','Ice water','Win 5 different challenges.'],['daily','Daily grind','Win a daily challenge.'],['probowl','Pro Bowler','Make the Pro Bowl in career mode.'],['xf','X-factor','Unlock an X-factor ability in career mode.']];
let ACHD={};try{ACHD=JSON.parse(lsGet('gdach'))||{}}catch(e){}
function achGet(id){if(!feat('ach')||ACHD[id])return;const a=ACH.find(x=>x[0]==id);if(!a)return;ACHD[id]=new Date().toISOString().slice(0,10);lsSet('gdach',JSON.stringify(ACHD));const e=$('achp');if(e){e.innerHTML=`<small>Achievement unlocked</small><b>${a[1]}</b><span>${a[2]}</span>`;e.className='';void e.offsetWidth;e.className='show'}}
function achUI(){VW.page='ach';const n=ACH.filter(a=>ACHD[a[0]]).length;modal(`${nav()}<h1>Achievements</h1><p>${n} of ${ACH.length} unlocked. Achievements count across all your leagues and careers on this device.</p>
 <div class="achs">${ACH.map(([id,t,d])=>`<div class="ach ${ACHD[id]?'got':''}"><b>${ACHD[id]?'★':'☆'} ${t}</b><span>${d}</span>${ACHD[id]?`<em>${ACHD[id]}</em>`:''}</div>`).join('')}</div>`)}
// ---------- power rankings ----------
function rankUI(){VW.page='rank';const T=R.lg.t,sc=i=>{const t=T[i],g=t.w+t.l+t.t;return(g?(t.w+.5*t.t)/g:.5)*60+(g?(t.pf-t.pa)/g:0)*1.2+(teamR(i)-60)*.9},ord=[...T.keys()].sort((a,b)=>sc(b)-sc(a));
 R.prk=R.prk||{};if(R.prk.wk!==R.lg.wk||R.prk.s!==R.season){R.prk={wk:R.lg.wk,s:R.season,prev:R.prk.cur||null,cur:ord.slice()}}const prev=R.prk.prev;
 const blurb=i=>{const t=T[i],g=t.w+t.l+t.t,st=[...R.pl.filter(p=>p.tid===i)].sort((a,b)=>ovr(b)-ovr(a))[0],pd=g?(t.pf-t.pa)/g:0;
  return(g==0?'Season hasn\'t started. ':pd>10?'Crushing people. ':pd>3?'Winning the right way. ':pd<-10?'Getting blown out. ':pd<-3?'Struggling to keep up. ':'Living on close games. ')+(st?`Led by ${st.g} ${st.n} (${ovr(st)}).`:'')};
 modal(`${nav()}<h1>Power rankings</h1><p class="dim">Week ${R.lg.wk+1}, season ${R.season}.</p><table>${ord.map((i,r)=>{const pr=prev?prev.indexOf(i):-1,mv=pr<0?'':pr>r?`<span class="w">▲${pr-r}</span>`:pr<r?`<span class="l">▼${r-pr}</span>`:'<span class="dim">-</span>';
  return`<tr class="${i==0?'me':''}"><td class="num"><b>${r+1}</b></td><td>${mv}</td><td>${esc(T[i].n)}</td><td class="dim">${rec3(T[i])}</td><td class="small">${blurb(i)}</td></tr>`}).join('')}</table>`)}
// ---------- scouting report for the next game ----------
function scoutUI(){VW.page='home';const o=nextOpp();if(o<0)return lobby();const T=R.lg.t,Lo=lineup(o),L0=lineup(0),top=a=>a.filter(Boolean).sort((x,y)=>ovr(y)-ovr(x));
 const qb=Lo.O[0],rb=Lo.O[5],wr=top(Lo.O.slice(1,5))[0],pr=top(Lo.D.slice(0,4))[0],cb=top(Lo.D.slice(7,9))[0],my=top(L0.O.slice(1,5))[0],lean=ovr(qb)>=ovr(rb)+4?'They like to throw.':ovr(rb)>=ovr(qb)+4?'They lean on the run.':'A balanced offense.';
 const r=x=>x?`${x.g} ${esc(x.n)} (${ovr(x)})`:'-';
 modal(`${nav()}<h1>Scouting report: ${esc(T[o].n)}</h1><p>${rec3(T[o])} · team rating ${Math.round(teamR(o))} (yours ${Math.round(teamR(0))}) · offense ${Math.round(unitR(o,'O'))}, defense ${Math.round(unitR(o,'D'))}${(R.riv[o]||0)>=8?' · <b class="l">RIVAL</b>':''}</p>
 <div class="dash">${card('Their offense',`<p>${lean}</p><table class="mini"><tr><td class="dim">QB</td><td>${r(qb)}</td></tr><tr><td class="dim">Best receiver</td><td>${r(wr)}</td></tr><tr><td class="dim">RB</td><td>${r(rb)}</td></tr></table>`)}
 ${card('Their defense',`<table class="mini"><tr><td class="dim">Best pass rusher</td><td>${r(pr)}</td></tr><tr><td class="dim">Best corner</td><td>${r(cb)}</td></tr></table><p class="dim">${ovr(pr)>=78?'Get the ball out quick, their rush is dangerous.':'You should have time to throw.'}</p>`)}
 ${card('Key matchup',`<p>Your ${r(my)}<br>vs their ${r(cb)}</p><p class="dim">${my&&cb&&ovr(my)>ovr(cb)+3?'You have the edge. Go after him.':my&&cb&&ovr(cb)>ovr(my)+3?'Their corner wins this one. Look elsewhere.':'Even matchup.'}</p>`)}</div><div class="btns">${B('startGame()','Play game','go')}</div>`)}
// ---------- share card ----------
function shareCard(){const g=(R.box||[]).slice(-1)[0];if(!g)return;const c=document.createElement('canvas');c.width=1200;c.height=630;const x=c.getContext('2d');if(!x||!x.fillRect)return;
 const cu=teamCol(0),co=teamCol(g.o),gr=x.createLinearGradient(0,0,1200,630);gr.addColorStop(0,cu[1]);gr.addColorStop(.5,'#0b1626');gr.addColorStop(1,co[1]);x.fillStyle=gr;x.fillRect(0,0,1200,630);
 x.fillStyle='#ffd84d';x.font='bold 30px Trebuchet MS';x.textAlign='center';x.fillText(`${g.po||'WEEK '+(g.w+1)} · SEASON ${g.s}`,600,70);
 x.fillStyle='#fff';x.font='900 46px Trebuchet MS';x.fillText(R.lg.t[0].n.toUpperCase(),300,190);x.fillText(g.on.toUpperCase(),900,190);x.font='900 150px Trebuchet MS';x.fillText(g.a,300,350);x.fillText(g.b,900,350);
 x.font='bold 36px Trebuchet MS';x.fillStyle=g.a>g.b?'#6ee7a0':g.a<g.b?'#ff8f7a':'#fff';x.fillText(g.a>g.b?'WIN':g.a<g.b?'LOSS':'TIE',600,300);
 x.fillStyle='#e2e8f0';x.font='24px Trebuchet MS';g.lines[0].slice(0,3).forEach((l,i)=>x.fillText(`${l[2]} ${l[1]}: ${l[3]}`.slice(0,80),600,440+i*38));x.fillStyle='#94a3b8';x.font='20px Trebuchet MS';x.fillText('Gridiron Lab',600,600);
 c.toBlob(b=>{if(!b)return;const f=new File([b],'gridiron-result.png',{type:'image/png'});try{if(navigator.canShare&&navigator.canShare({files:[f]}))return navigator.share({files:[f],title:'Gridiron Lab'}).catch(()=>{})}catch(e){}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='gridiron-result.png';document.body.appendChild(a);a.click();a.remove()})}
// ---------- challenges: two-minute drill, scenarios, daily challenge ----------
const CHAL={
 two:['Two-minute drill','Down 17-21 with 2:00 left. Ball on your 25, one timeout. Go win it.',()=>({q:4,clk:120,sc:[17,21],poss:'U',dir:1,los:35,to:[1,2]})],
 down10:['Down 10','Down 20-30 with 3:00 left and two timeouts. You need two scores (onside kick, anyone?).',()=>({q:4,clk:180,sc:[20,30],poss:'U',dir:1,los:35,to:[2,2]})],
 comeback:['Comeback','Down 14-28 with 7:00 to play.',()=>({q:4,clk:420,sc:[14,28],poss:'U',dir:1,los:30,to:[3,3]})],
 backed:['Backed up','Down 17-20 at your own 1-yard line with 3:00 left.',()=>({q:4,clk:180,sc:[17,20],poss:'U',dir:1,los:11,to:[3,3]})],
 goal:['Goal-line stand','You lead 24-20. They have 1st and goal at your 3 with 0:50 left. Hold them.',()=>({q:4,clk:50,sc:[24,20],poss:'C',dir:-1,los:13,ytg:3,to:[3,1]})],
 kick:['Walk-off kick','Down 20-22, 0:03 left, 4th and 6 at their 31. Win it.',()=>({q:4,clk:3,sc:[20,22],poss:'U',dir:1,los:79,down:4,ytg:6,to:[0,0]})],
 run:['Ground and pound','Up 21-17 with 5:00 left, ball on your 30. Run plays only. Close it out.',()=>({q:4,clk:300,sc:[21,17],poss:'U',dir:1,los:40,to:[2,3],runOnly:1})]};
let CHD={},DAILY={};try{CHD=JSON.parse(lsGet('gdchal'))||{};DAILY=JSON.parse(lsGet('gddaily'))||{}}catch(e){}
const today=()=>new Date().toISOString().slice(0,10),dayN=()=>Math.floor(Date.now()/864e5);
function dailyPick(){const n=dayN(),ids=Object.keys(CHAL);return{id:ids[n%ids.length],o:1+(n*7)%31,wx:['clear','rain','snow','wind'][hsh(n)%4]}}
function chalUI(){VW.page='chal';if(CAR())return modal(`${nav()}<h1>Challenges</h1><p>Challenges are played in franchise mode, where you run the whole offense.</p>`);const dp=dailyPick(),dd=DAILY[today()];
 modal(`${nav()}<h1>Challenges</h1><p class="dim">Short scenarios against a random team from your league. They don't count toward your season.</p>
 <div class="dash">${card('Daily challenge',`<div class="big">${CHAL[dp.id][0]}</div><p>${CHAL[dp.id][1]}</p><p class="dim">vs ${esc(R.lg.t[dp.o].n)} · ${wxName(dp.wx)} · ${dd?'You already '+(dd=='w'?'won':'played')+' today':'Same challenge for everyone today'}</p><div class="btns">${B(`chStart('${dp.id}',1)`,'Play the daily challenge','go')}</div>`,'wide')}
 ${Object.keys(CHAL).map(k=>card(CHAL[k][0],`<p>${CHAL[k][1]}</p><p class="dim">${CHD[k]?`Won ${CHD[k].w} of ${CHD[k].n}`:'Not played yet'}</p><div class="btns">${B(`chStart('${k}')`,'Play','go')}</div>`)).join('')}</div>`)}
function chStart(id,daily){const c=CHAL[id];if(!c||(G&&G.live))return;const dp=daily?dailyPick():null,o=dp?dp.o:1+(rnd()*31|0),t=R.lg.t[o];autoFill(0);autoFill(o);
 newGame({n:t.n,r:Math.round(teamR(o)),i:o});G.live=1;G.chal=id;G.daily=daily?today():null;G.po='';if(dp&&feat('weather')){G.wx=dp.wx;G.wind=dp.wx=='wind'?{x:-14,y:4,m:15}:{x:3,y:0,m:3}}
 const s=c[2]();Object.assign(G,{down:1,ytg:10,ch:null,run:false,two:0,koOK:0,ot:0},s);G.phase='pre';G.next='same';G.aud=audN();$('modal').hidden=1;setup();G.msg=c[1];ui()}
{const _sn=snap;snap=function(){if(G&&G.runOnly&&G.poss=='U'&&G.phase=='pre'&&P&&!P.run){const r=Object.keys(allP()).find(n=>allP()[n].run);if(r)applyPlay(r)}return _sn()}}
function chEnd(){const id=G.chal,win=G.sc[0]>G.sc[1],c=CHAL[id];G.live=0;G.phase='over';G.chal=null;G.runOnly=0;
 const r=CHD[id]=CHD[id]||{w:0,n:0};r.n++;if(win)r.w++;lsSet('gdchal',JSON.stringify(CHD));if(G.daily){if(DAILY[G.daily]!='w')DAILY[G.daily]=win?'w':'l';lsSet('gddaily',JSON.stringify(DAILY));if(win)achGet('daily')}
 if(win){achGet('chal1');if(Object.values(CHD).filter(x=>x.w).length>=5)achGet('chal5')}
 modal(`<h1>${win?'Challenge complete!':'Challenge failed'}</h1><p>${c[0]}: final score ${G.sc[0]}-${G.sc[1]}.</p><div class="grid">${B(`chStart('${id}')`,'Try again','big')}${B('chalUI()','All challenges')}${B('lobby()','Back to the lobby')}</div>`)}
{const _gl=gameLobby;gameLobby=function(...a){const r=_gl.apply(this,a);if(G&&G.chal){const g=$('modal').querySelector('.grid');if(g)g.insertAdjacentHTML('beforeend',B("G.live=0;G.chal=null;G.runOnly=0;G.phase='over';lobby()",'Quit challenge'))}return r}}
// ---------- custom new league: season length, cap, era, fantasy draft, your team ----------
function newLeagueUI(){const T=R.lg.t[0],c=teamCol(0),sel=(id,o,v)=>`<select id="${id}">${o.map(([k,n])=>`<option value="${k}" ${k==v?'selected':''}>${n}</option>`).join('')}</select>`;
 modal(`${nav()}<h1>New ${MODE=='career'?'career':'league'}</h1><p class="small">Your current save is kept as a backup you can restore from Settings.</p>
 <p>Team city <input id="nlc" maxlength="16" value="${esc(T.n.split(' ').slice(0,-1).join(' ')||'Home')}"> Nickname <input id="nln" maxlength="14" value="${esc(T.n.split(' ').pop())}"></p>
 <p>Colors <input type="color" id="nl1" value="${c[0]}"> <input type="color" id="nl2" value="${c[1]}"> <input type="color" id="nl3" value="${c[2]}"></p>
 <p>Season length ${sel('nls',[[17,'17 games'],[12,'12 games'],[8,'8 games']],17)} Salary cap ${sel('nlcap',[[160,'$160M (tight)'],[220,'$220M (normal)'],[300,'$300M (loose)']],220)}</p>
 <p>Era ${sel('nle',Object.keys(ERA).map(k=>[k,ERA[k].n]),'modern')} <span class="small">Older eras: more running, less accurate passing, more fumbles, leather helmets.</span></p>
 <p><label><input type="checkbox" id="nlf"> Fantasy draft: every team's roster is redrafted from scratch</label></p>
 <div class="grid">${B('newLeagueGo()','Create','big')}${B('settingsUI()','Cancel')}</div><p class="small">The league is always 32 teams.</p>`)}
function newLeagueGo(){const v=id=>$(id).value,o={city:v('nlc').replace(/[<>"&]/g,'').trim()||'Home',nick:v('nln').replace(/[<>"&]/g,'').trim()||'Hawks',col:[v('nl1'),v('nl2'),v('nl3')],slen:+v('nls'),cap:+v('nlcap'),era:v('nle'),fd:$('nlf').checked};
 if(!confirm('Start over with these settings?'))return;lsSet('gdnew',JSON.stringify(o));const c=lsGet(SAVE_KEY);if(c)lsSet(SAVE_KEY+'_prerestore',c);lsDel(SAVE_KEY);location.reload()}
(function applyNew(){const s=lsGet('gdnew');if(!s||!R||R.season!=1||R.lg.wk!=0||R.cust)return;lsDel('gdnew');let o;try{o=JSON.parse(s)}catch(e){return}R.cust=1;
 R.lg.t[0].n=(o.city+' '+o.nick).trim();R.lg.t[0].col=o.col;R.cap=o.cap||220;R.era=o.era||'modern';if(o.slen&&o.slen<17){R.slen=o.slen;R.lg.sched.length=o.slen}if(o.fd)fantasyDraft();save()})();
function fantasyDraft(){const pool=R.pl.filter(p=>p.tid>=0&&p.id!==R.me);pool.forEach(p=>p.tid=-9);const cnt=[...Array(32)].map(()=>({})),ord=[...Array(32).keys()].sort(()=>rnd()-.5);let left=pool.slice(),rd=0;
 while(left.length&&rd<60){const o=rd%2?ord.slice().reverse():ord;let any=0;for(const t of o){const c=cnt[t];let best=null,bs=-1e9;for(const p of left){const n=c[p.g]||0;if(n>=DEPTH[p.g])continue;const s=pval(p)+(n<NEED[p.g]?60:0);if(s>bs){bs=s;best=p}}
   if(best){best.tid=t;c[best.g]=(c[best.g]||0)+1;left.splice(left.indexOf(best),1);any=1}}if(!any)break;rd++}
 left.forEach(p=>p.tid=-1);R.depth={};R.dAuto={};addNews('Fantasy draft complete: every roster was built from scratch.')}
{const _set=settingsUI;settingsUI=function(...a){const r=_set.apply(this,a);const h=[...$('modal').querySelectorAll('h3')].find(e=>/New (league|career)/.test(e.textContent));if(h)h.insertAdjacentHTML('afterend',`<p>${B('newLeagueUI()','Custom new league (season length, cap, era, fantasy draft)')}</p>`);
 if(R.era&&R.era!='modern'||R.slen)$('modal').querySelector('h1').insertAdjacentHTML('afterend',`<p class="small">League: ${eraOf().n} era · ${R.lg.sched.length}-game season · ${R.cap}M cap</p>`);return r}}
// ---------- your team: rename, relocate, colors ----------
function teamUI(){VW.page='team';const T=R.lg.t[0],c=teamCol(0);modal(`${nav()}<h1>Team settings</h1><p>Rename or relocate your team and pick its colors.</p>
 <p>City <input id="tc" maxlength="16" value="${esc(T.n.split(' ').slice(0,-1).join(' '))}"> Nickname <input id="tn" maxlength="14" value="${esc(T.n.split(' ').pop())}"></p>
 <p>Jersey <input type="color" id="t1" value="${c[0]}"> Trim <input type="color" id="t2" value="${c[1]}"> Stripe <input type="color" id="t3" value="${c[2]}"></p><div class="btns">${B('teamSave()','Save','go')}</div><p class="small">The league stays at 32 teams, so expansion isn't available.</p>`)}
function teamSave(){const T=R.lg.t[0],old=T.n,c=($('tc').value||'').replace(/[<>"&]/g,'').trim(),n=($('tn').value||'').replace(/[<>"&]/g,'').trim()||'Hawks';T.n=(c+' '+n).trim();T.col=[$('t1').value,$('t2').value,$('t3').value];
 if(T.n!=old)addNews(`The ${old} are now the ${T.n}.`);save();lobby()}
// ---------- player page: personality, morale, holdouts, position changes ----------
{const _pp=pp;pp=function(id,...a){const r=_pp(id,...a);try{const p=R.pl.find(q=>q.id==id),h=$('modal').querySelector('h1');if(!p||!h)return r;const tr=[];
 if(feat('pers')&&persOf(p))tr.push(`<span class="tag">${PERS[p.pers][0]}</span> <span class="small">${PERS[p.pers][1]}</span>`);
 if(feat('morale')&&p.tid===0)tr.push(`Morale ${morOf(p)>=70?'<b class="w">happy</b>':morOf(p)>=40?'okay':'<b class="l">unhappy</b>'} (${morOf(p)})${p.treq?' · <b class="l">wants a trade</b>':''}`);
 if(p.hold&&p.tid===0){const ask=askFor(p,0,3);tr.push(`<b class="l">Holding out</b> for a new deal. ${B(`holdPay(${p.id})`,`Pay him ${M$(ask)} through ${R.season+3}`)}`)}
 if(p.tid===0&&!CAR())tr.push(`Move to <select onchange="posChange(${p.id},this.value)">${GR.map(g=>`<option ${g==p.g?'selected':''}>${g}</option>`).join('')}</select>`);
 if(tr.length)h.insertAdjacentHTML('afterend',`<p>${tr.join('<br>')}</p>`)}catch(e){console.error(e)}return r}}
function holdPay(id){const p=R.pl.find(q=>q.id==id);if(!p)return;const ask=askFor(p,0,3);if(payroll(0)-p.sal+ask>R.cap&&!offS()){alert('Not enough cap room.');return pp(id)}p.sal=ask;p.exp=R.season+3;p.hold=0;p.mor=fr(morOf(p)+20,0,100);addNews(`${p.g} ${p.n} ends his holdout with a new deal.`);save();pp(id)}
function posChange(id,g){const p=R.pl.find(q=>q.id==id);if(!p||!GR.includes(g))return;const o=p.g;p.g=g;if(R.depth)delete R.depth[0];addNews(`${p.n} moves from ${o} to ${g}.`);save();pp(id)}
// ---------- career: off-field choices, X-factors, free-agent offers, legacy ----------
const EVT=[['endorse','A shoe company wants you for a commercial.',[['Do it (+$1.5M)',{money:1.5}],['Stay focused on football (+15 XP)',{xp:15}]]],
 ['media','Reporters want a quote after the last game.',[['Praise your teammates (+10 XP)',{xp:10}],['Talk yourself up (+$0.5M, fans love it)',{money:.5,fans:5}]]],
 ['charity','You are invited to a youth football camp.',[['Coach the kids (+20 XP)',{xp:20,fans:3}],['Rest up (+1 strength)',{sk:'str'}]]],
 ['film','The coaches offer extra film sessions.',[['Study film (+1 awareness)',{sk:'awr'}],['Take the night off (+5 XP)',{xp:5}]]],
 ['party','Teammates are throwing a party the night before practice.',[['Go anyway (fans like it, -10 XP)',{xp:-10,fans:4}],['Stay home (+12 XP)',{xp:12}]]],
 ['trainer','A private trainer offers summer sessions.',[['Hire him ($1M, +1 speed)',{money:-1,sk:'spd'}],['Train on your own (+8 XP)',{xp:8}]]]];
const XF={QB:['dime','Dime dropper','Your throws land much closer to where you aim.','skl'],RB:['juke','Juke box','Your juke recharges twice as fast.','spd'],WR:['mossed','Mossed','You win more contested catches.','skl'],TE:['mossed','Mossed','You win more contested catches.','skl'],
 DL:['unstop','Unstoppable','You shed blockers on your own.','str'],LB:['enforcer','Enforcer','Your hit sticks force more fumbles.','str'],S:['enforcer','Enforcer','Your hit sticks force more fumbles.','str'],CB:['lockdown','Lockdown','Passes thrown your way get picked off or broken up more.','skl']};
function evtPick(i){const e=EVT.find(x=>x[0]==R.evt),p=meRow();if(!e||!p)return careerHub();const f=e[2][i][1];R.xp=Math.max(0,(R.xp||0)+(f.xp||0));R.money=(R.money||0)+(f.money||0);R.fans=(R.fans||0)+(f.fans||0);
 if(f.sk){p.sk[f.sk]=Math.min(99,p.sk[f.sk]+1);if(p.mx[f.sk]<p.sk[f.sk])p.mx[f.sk]=p.sk[f.sk]}R.evt=null;save();careerHub()}
function xfUnlock(){const p=meRow(),x=XF[p.g];if(!x||(R.xp||0)<40||p.sk[x[3]]<80)return;R.xp-=40;R.xfU=R.xfU||[];if(!R.xfU.includes(x[0]))R.xfU.push(x[0]);R.xfOn=x[0];achGet('xf');save();careerHub()}
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{if(!CAR()||!R.me||(G&&G.live))return r;const p=meRow(),d=$('modal').querySelector('.dash');if(!p||!d)return r;let h='';
 if(feat('events')&&R.evt){const e=EVT.find(x=>x[0]==R.evt);if(e)h+=card('Off the field',`<p>${e[1]}</p><div class="btns">${e[2].map((c,i)=>B(`evtPick(${i})`,c[0])).join('')}</div>`)}
 if(feat('xf')){const x=XF[p.g];if(x){const has=(R.xfU||[]).includes(x[0]),k={skl:'key skill',spd:'speed',str:'strength',awr:'awareness'}[x[3]];h+=card('X-factor',`<div class="big">${x[1]}</div><p>${x[2]}</p>${has?`<p class="good">${R.xfOn==x[0]?'Active':'Unlocked'}</p>${R.xfOn!=x[0]?B(`R.xfOn='${x[0]}';save();careerHub()`,'Turn on'):B(`R.xfOn=null;save();careerHub()`,'Turn off')}`:`<p class="dim">Needs ${k} 80 (you have ${p.sk[x[3]]}) and 40 XP.</p>${p.sk[x[3]]>=80&&(R.xp||0)>=40?B('xfUnlock()','Unlock','go'):''}`}`)}}
 const pb=(p.aw||[]).filter(a=>/Pro Bowl/.test(a)).length,leg=Math.round(hofScore(hofTot(p),p));h+=card('Legacy',`<div class="stats3"><div><b>${leg}</b><span>legacy score</span></div><div><b>${pb}</b><span>Pro Bowls</span></div><div><b>${M$(R.money||0)}</b><span>off-field money</span></div><div><b>${R.fans||0}</b><span>fan buzz</span></div></div><p class="dim">45+ legacy points when you retire puts you in the Hall of Fame.</p>`);
 if(R.stage)h+=card('Change position',`<p>In the offseason you can switch positions. Your ratings stay; what they're worth changes.</p><select onchange="posChange(R.me,this.value);careerHub()">${CPOS.map(g=>`<option ${g==p.g?'selected':''}>${g}</option>`).join('')}</select>`);
 (d.firstElementChild||d).insertAdjacentHTML(d.firstElementChild?'afterend':'afterbegin',h)}catch(e){console.error(e)}return r}}
{const _co=careerOffseason;careerOffseason=function(){const p=meRow();if(p&&R.stage&&p.exp<=R.season&&R.offS!==R.season)return faOffers();return _co()}}
function faOffers(){const p=meRow(),ask=askFor(p,0,3),T=R.lg.t,ts=[...Array(31).keys()].map(i=>i+1).sort(()=>rnd()-.5).slice(0,3);
 R.offL=[{t:0,sal:ask},...ts.map(t=>({t,sal:Math.round(ask*(1.04+rnd()*.25)*10)/10}))];save();
 modal(`<h1>Free agency: your offers</h1><p>Your contract is up. Pick where you play next. (Rating shows how good each team is.)</p><table>${R.offL.map((o,i)=>`<tr><td><b>${esc(T[o.t].n)}</b>${o.t==0?' (your team)':''}</td><td class="dim">${rec3(T[o.t])} · rating ${Math.round(teamR(o.t))}</td><td>${M$(o.sal)}/yr for 3 years</td><td>${B(`faPick(${i})`,'Sign','go')}</td></tr>`).join('')}</table>`)}
function faPick(i){const o=R.offL[i],p=meRow();if(!o||!p)return careerHub();if(o.t)swapTeams(o.t);p.tid=0;p.sal=o.sal;p.exp=R.season+3;R.offS=R.season;addNews(`${p.n} signs with the ${R.lg.t[0].n}.`);save();careerOffseason();careerHub()}
function swapTeams(k){const T=R.lg.t,a=T[0],b=T[k];['n','col','r'].forEach(f=>{const t=a[f];a[f]=b[f];b[f]=t;if(a[f]===undefined)delete a[f];if(b[f]===undefined)delete b[f]});
 R.pl.forEach(p=>{if(p.tid===0)p.tid=k;else if(p.tid===k)p.tid=0});(R.picks||[]).forEach(q=>['own','orig'].forEach(f=>{if(q[f]===0)q[f]=k;else if(q[f]===k)q[f]=0}));
 [R.depth,R.dAuto].forEach(o=>{if(o){delete o[0];delete o[k]}});const t=R.riv[k];R.riv[k]=R.riv[0];R.riv[0]=t}
// ---------- dashboard additions ----------
{const _dh=dashHome;dashHome=function(...a){const r=_dh.apply(this,a);try{const d=$('modal').querySelector('.dash');if(!d)return r;const cards=[...d.querySelectorAll('section.cardx')],nx=cards[0],lg=cards.find(s=>s.querySelector('h4')&&s.querySelector('h4').textContent=='Last game');
 const o=nextOpp();if(nx&&!R.stage&&o>=0){const b=nx.querySelector('.btns');if(b)b.insertAdjacentHTML('beforeend',B('scoutUI()','Scouting report'));if(feat('riv')&&(R.riv[o]||0)>=8)nx.querySelector('h4').insertAdjacentHTML('beforeend',' · <span class="l">RIVALRY GAME</span>')}
 if(lg&&(R.box||[]).length){const b=lg.querySelector('.btns')||(lg.insertAdjacentHTML('beforeend','<div class="btns"></div>'),lg.querySelector('.btns'));b.insertAdjacentHTML('beforeend',B('shareCard()','Share result'))}
 let h='';if(feat('owner'))h+=card('Owner',`<div class="bar"><i style="width:${R.own.sat}%" class="${R.own.sat<25?'over':''}"></i></div><p>${R.own.sat>=75?'Thrilled':R.own.sat>=45?'Satisfied':R.own.sat>=25?'Impatient':'Furious'} (${R.own.sat}/100)${R.own.warn?' · <b class="l">on the hot seat</b>':''}</p>${feat('fin')?`<p class="dim">Cash ${M$(R.fin.cash)} · ${B('finUI()','Finances')}</p>`:''}`);
 if(feat('morale')){const L=lineup(0),a=[...L.O,...L.D].filter(Boolean),ch=Math.round(a.reduce((s,p)=>s+morOf(p),0)/Math.max(1,a.length)),rq=teamPl(0).filter(p=>p.treq||p.hold);h+=card('Locker room',`<div class="big">${ch>=70?'Great':ch>=50?'Good':ch>=35?'Tense':'Toxic'} chemistry</div><p class="dim">Average starter morale ${ch}.</p>${rq.map(p=>`<p class="warn">${plink(p,p.g+' '+p.n)} ${p.hold?'is holding out':'wants a trade'}</p>`).join('')}`)}
 if(feat('offers')&&R.offers.length)h+=card('Trade offers',`<p>${R.offers.length} team${R.offers.length>1?'s have':' has'} called with an offer.</p><div class="btns">${B('offersUI()','See offers','go')}</div>`);
 const dp=dailyPick();h+=card('Daily challenge',`<p><b>${CHAL[dp.id][0]}</b> vs ${esc(R.lg.t[dp.o].n)}</p><p class="dim">${DAILY[today()]=='w'?'Done for today':'New one every day'}</p><div class="btns">${B('chalUI()','Challenges')}</div>`);
 d.insertAdjacentHTML('beforeend',h)}catch(e){console.error(e)}return r}}
// ---------- sidebar ----------
(()=>{const ins=(a,after,item)=>{if(a.some(x=>x[0]==item[0]))return;const i=a.findIndex(x=>x[0]==after);a.splice(i<0?a.length:i+1,0,item)};
 ins(NAVF,'stand',['rank','rankUI()','Power rankings']);ins(NAVF,'trade',['offers','offersUI()','Trade offers']);ins(NAVF,'picks',['comb','combineUI()','Scouting combine']);ins(NAVF,'staff',['fin','finUI()','Finances']);
 ins(NAVF,'hist',['rec','recordsUI()','Records & legacy']);ins(NAVF,'rec',['ach','achUI()','Achievements']);ins(NAVF,'ach',['chal','chalUI()','Challenges']);ins(NAVF,'chal',['team','teamUI()','Team settings']);
 ins(NAVC,'stand',['rank','rankUI()','Power rankings']);ins(NAVC,'hist',['rec','recordsUI()','Records & legacy']);ins(NAVC,'rec',['ach','achUI()','Achievements'])})();
(()=>{const w=$('wrap');if(w&&w.insertAdjacentHTML)w.insertAdjacentHTML('beforeend','<div id="achp"></div>')})();
if(!$('modal').hidden&&!(G&&G.live))lobby();
