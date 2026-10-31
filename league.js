'use strict';
// Season, playoffs and Football GM style team management: rosters for all 32 teams, depth chart, stats, awards,
// contracts with player mood, a hard cap, re-signing, free agency, trades with draft picks, and a scouted draft.
const T0=()=>R.mode=='career'?0:1;
const RD=['Wild Card','Divisional','Conference Final','Super Bowl'],T_=()=>R.lg.t;
let ctx='hub',lastMsg='Welcome to the league.';
const VW={sort:'pos',tid:0,stat:'py',dg:'QB',fpos:'',dpos:'',tr:null,back:null};
const modal=h=>{const m=$('modal');m.hidden=0;const bare=G&&G.live;m.innerHTML=bare?'<div class="pg">'+h+'</div>':'<div class="pg shellwrap">'+shellHTML(h)+'</div>';const d=bare?m.firstElementChild:$('mainpg');if(d)d.scrollTop=0};
const TN=i=>i==-1?'Free agent':i==-2?'Draft prospect':T_()[i].n;
const M$=v=>'$'+(+v).toFixed(1)+'M';
const rec3=t=>`${t.w}-${t.l}${t.t?'-'+t.t:''}`;
const gauss=()=>{let u=0;for(let i=0;i<6;i++)u+=rnd();return(u-3)/.707};
const opp=m=>m[0]?m[0]:m[1];
const rec=(w,l)=>{T_()[w].w++;T_()[l].l++};
const cmp=(a,b)=>{const T=T_();return(T[b].w+.5*T[b].t-T[a].w-.5*T[a].t)||(T[b].pf-T[b].pa-T[a].pf+T[a].pa)||(T[a].k-T[b].k)};
const B=(fn,txt,cls)=>`<button ${cls?`class="${cls}"`:''} onclick="${fn}">${txt}</button>`;
const back=()=>{const f=VW.back;VW.back=null;if(f)return f();lobby()};
const nav=()=>G&&G.live?`<div class="nav">${B('lobby()','&larr; Back')}</div>`:'';
const plink=(p,txt)=>`<a href="#" onclick="pp(${p.id});return false">${txt||p.n}</a>`;
const potShow=p=>p.tid==-2?estP(p):ovr(p,1),ovrShow=p=>p.tid==-2?estO(p):ovr(p);
const scoutErr=()=>7-1.5*Math.min(4,R.st.sc||0);
const estO=p=>clamp(ovr(p)+Math.round((p.fz?p.fz[0]:0)*scoutErr()),20,99),estP=p=>Math.max(estO(p),clamp(ovr(p,1)+Math.round((p.fz?p.fz[1]:0)*scoutErr()*1.4),20,99));
function seeds(c){const T=T_(),idx=T.map((_,i)=>i).filter(i=>T[i].c==c),dw=[0,1,2,3].map(d=>idx.filter(i=>T[i].d==d).sort(cmp)[0]).sort(cmp);return dw.concat(idx.filter(i=>!dw.includes(i)).sort(cmp).slice(0,3))}
function pairs(L,rd){if(rd==0)return[[L[1],L[6]],[L[2],L[5]],[L[3],L[4]]];const n=L.length,a=[];for(let i=0;i<n/2;i++)a.push([L[i],L[n-1-i]]);return a}
function nextOpp(){const lg=R.lg;if(!lg.po)return opp(lg.sched[lg.wk].find(m=>m.includes(0)));const po=lg.po;
 if(po.rd==3){const m=[po.al[0][0],po.al[1][0]];return m.includes(0)?opp(m):-1}
 const c=po.al[0].includes(0)?0:po.al[1].includes(0)?1:-1;if(c<0)return-1;const m=pairs(po.al[c],po.rd).find(m=>m.includes(0));return m?opp(m):-1}
function statLine(p,s){s=s||p.ss;const v=k=>s[SI[k]];
 if(p.g=='QB')return`${v('pc')}/${v('pa')}, ${v('py')} yds, ${v('ptd')} TD, ${v('pi')} INT`;
 if(p.g=='RB')return`${v('ra')} car, ${v('ry')} yds, ${v('rtd')} TD; ${v('rc')} rec, ${v('ty')} yds`;
 if(p.g=='WR'||p.g=='TE')return`${v('rc')} rec, ${v('ty')} yds, ${v('tt')} TD`;
 if(p.g=='K')return`${v('fgm')}/${v('fga')} FG`;if(p.g=='P'||p.g=='OL')return`${v('gp')} games`;
 return`${v('tk')} tkl, ${v('sk')} sacks, ${v('in')} INT`}

// ---------- lobby ----------
function rosterIssues(){const c={};teamPl(0).forEach(p=>c[p.g]=(c[p.g]||0)+1);const a=[];
 GR.forEach(g=>{if((c[g]||0)<NEED[g])a.push(`need ${NEED[g]-(c[g]||0)} more ${g}`)});const n=teamPl(0).length;if(n>MAXROS)a.push(`roster is ${n}/${MAXROS}: release ${n-MAXROS}`);
 if(!offS()&&payroll(0)>R.cap)a.push('over the salary cap');return a}
function lobby(){if(R.mode=='career'&&!(G&&G.live))return careerHub();if(G&&G.live)return gameLobby();if(!R.stage||true)return dashHome();ctx='hub';
 const lg=R.lg,y=lg.t[0],po=lg.po,T=lg.t,ri=rosterIssues(),stg={draft:['draftUI()','Go to the draft','The season is over. Next up: the draft.'],resign:['resignUI()','Re-sign players','Decide which expiring contracts to keep.'],fa:['faUI()','Free agency',`Free agency, day ${R.fa?R.fa.day:0} of 30.`]}[R.stage];
 if(stg)return modal(`<h1>Season ${R.season} offseason</h1>${saveWarn?`<p class="warn">${saveWarn}</p>`:''}<p>${stg[2]}</p><p><b>${T[0].n}</b> | Next season's payroll ${M$(payroll(0))} / ${R.cap}M | Training points ${R.pts}</p>
 <div class="grid">${B(stg[0],stg[1],'big')}</div><h3>Team</h3><div class="grid">${B('rosterUI(0)','Roster')}${B('depthUI()','Depth chart')}${B('staff()','Coaching staff')}${B('editor()','Offensive playbook')}${B('deditor()','Defensive playbook')}</div>
 <h3>League</h3><div class="grid">${B('standings()','Standings')}${B('tradeUI()','Trade')}${B('picksUI()','Draft picks')}${B('historyUI()','Awards &amp; history')}${B('settingsUI()','Settings &amp; saves')}</div>`);
 const o=nextOpp();
 const nx=po?(o<0?RD[po.rd]+': bye':`${RD[po.rd]} vs ${T[o].n} (team rating ${Math.round(teamR(o))})`):`Week ${lg.wk+1} of ${R.lg.sched.length} vs ${T[o].n} (${rec3(T[o])}, team rating ${Math.round(teamR(o))})`;
 modal(`<h1>Season ${R.season}</h1>${saveWarn?`<p class="warn">${saveWarn}</p>`:''}<p>${lastMsg}</p>
 <p><b>${T[0].n}</b> ${rec3(y)} | Team rating ${Math.round(teamR(0))} | Payroll ${M$(payroll(0))} / ${R.cap}M | Training points ${R.pts} | Difficulty: ${DIFFS[R.diff].n}</p>
 ${ri.length?`<p class="warn">Roster: ${ri.join(', ')}. Missing positions get filled with minimum-salary players when you play.</p>`:''}<p>Next: ${nx}</p>
 <div class="grid">${B('startGame()',o<0?'Advance (bye)':'Play game','big')}${o<0?'':B('simGame()','Sim game')}${!po?B('simRest()','Sim to playoffs'):''}</div>
 <h3>Team</h3><div class="grid">${B('rosterUI(0)','Roster')}${B('depthUI()','Depth chart')}${B('statsUI(0)','Team stats')}${B('staff()','Coaching staff')}${B('editor()','Offensive playbook')}${B('deditor()','Defensive playbook')}</div>
 <h3>League</h3><div class="grid">${B('standings()','Standings')}${B('leadersUI()','League leaders')}${B('tradeUI()','Trade')}${B('faUI()','Free agents')}${B('picksUI()','Draft picks')}${B('historyUI()','Awards &amp; history')}</div>
 <h3>Settings</h3><div class="grid">${B('settingsUI()','Settings &amp; saves')}</div>`)}
function gameLobby(){ctx='game';if(R.mode=='career')return modal(`<h1>Paused</h1><p>${G.opp.n}${G.po?' - '+G.po:''}</p><div class="grid">${B('closeLobby()','Back to game','big')}${myPos()=='QB'?B('editor()','Playbook'):''}${B('settingsUI()','Settings')}</div>`);modal(`<h1>Team lobby</h1><p>${G.opp.n}${G.po?' - '+G.po:''}. Training points ${R.pts}</p><div class="grid">${B('closeLobby()','Back to game','big')}${B('editor()','Offensive playbook')}${B('deditor()','Defensive playbook')}${B('rosterUI(0)','Roster')}${B('depthUI()','Depth chart')}${B('staff()','Coaching staff')}${B('settingsUI()','Settings')}</div>`)}
function closeLobby(){$('modal').hidden=1;if(G.live&&G.phase=='pre'&&!G.ch){if(G.poss=='U')applyPlay(allP()[P.name]?P.name:'Slants');else applyDef(DALL()[P.dpn]?P.dpn:'Cover 2 Zone')}ui()}
function autoFill(tid){const fill=[];GR.forEach(g=>{while(R.pl.filter(p=>p.tid===tid&&p.g==g).length<NEED[g]){const fa=R.pl.filter(p=>p.tid==-1&&p.g==g).sort((a,b)=>ovr(b)-ovr(a))[0];
  const p=fa||(R.pl.push(mkPl(g,26,52,4,-1)),R.pl[R.pl.length-1]);p.tid=tid;p.sal=MINSAL;p.exp=R.season+(offS()?1:0);p.yt=0;fill.push(p)}});return fill}
function startGame(){const o=nextOpp();if(o<0)return byeAdvance();const f=autoFill(0);const t=T_()[o];autoFill(o);
 newGame({n:t.n,r:Math.round(teamR(o)),i:o});G.live=1;G.po=R.lg.po?RD[R.lg.po.rd]:'';$('modal').hidden=1;if(f.length)G.msg='Signed '+f.map(p=>p.g+' '+p.n).join(', ')+' to fill your roster. '+G.msg}
// ---------- simulating games ----------
function simScore(a,b){const e=(teamR(a)-teamR(b))/7,td=x=>Math.max(0,Math.round(2.4+x*.55+gauss()*1.25)),fg=()=>clamp(Math.round(1.4+gauss()*.9),0,5);return[7*td(e)+3*fg(),7*td(-e)+3*fg()]}
function simStats(tid,pts,opp,won){const L=lineup(tid),Lo=lineup(opp),add=(p,k,n)=>{if(p&&n)p.ss[SI[k]]+=n};
 new Set([...L.O,...L.D,L.K,L.P].filter(Boolean)).forEach(p=>p.ss[0]++);
 const qb=L.O[0],acc=qb.sk.skl,tds=Math.round(pts/7.4),fgm=Math.max(0,Math.round((pts-tds*7)/3));
 const att=25+(rnd()*14|0)+(won?0:4),cmp=Math.round(att*clamp(.5+(acc-65)*.006+(rnd()-.5)*.14,.35,.8)),py=Math.round(cmp*(9.5+rnd()*3+(acc-65)*.05));
 const ptd=clamp(Math.round(tds*.66+(rnd()-.5)),0,tds),rtd=tds-ptd,qrt=rtd&&rnd()<.15?1:0,pi=rnd()<.45?0:rnd()<.7?1:2;
 add(qb,'pa',att);add(qb,'pc',cmp);add(qb,'py',py);add(qb,'ptd',ptd);add(qb,'pi',pi);add(qb,'ra',2+(rnd()*3|0));add(qb,'ry',Math.round(rnd()*14));add(qb,'rtd',qrt);
 const rb=L.O[5],ra=13+(rnd()*9|0)+(won?3:0);add(rb,'ra',ra);add(rb,'ry',Math.round(ra*(3.3+rnd()*1.8+(ovr(rb)-65)*.04)));add(rb,'rtd',rtd-qrt);
 const tg=[[L.O[1],.3],[L.O[2],.22],[L.O[3],.16],[L.O[4],.17],[L.O[5],.15]];let lc=cmp,ly=py;
 tg.forEach(([p,s],i)=>{const c=i==4?lc:Math.min(lc,Math.round(cmp*s*(.7+rnd()*.6))),y=i==4?ly:Math.min(ly,Math.round(py*s*(.7+rnd()*.6)));lc-=c;ly-=y;add(p,'rc',c);add(p,'ty',y)});
 for(let i=0;i<ptd;i++)add(tg[rnd()<.85?(rnd()*4|0):4][0],'tt',1);
 add(L.K,'fga',fgm+(rnd()<.3?1:0));add(L.K,'fgm',fgm);
 const D=Lo.D,tk=50+(rnd()*16|0);for(let i=0;i<tk;i++){const r=rnd();add(r<.45?D[4+(rnd()*3|0)]:r<.7?D[9+(rnd()*2|0)]:r<.85?D[7+(rnd()*2|0)]:D[rnd()*4|0],'tk',1)}
 const dl=D.slice(0,4).reduce((a,p)=>a+ovr(p),0)/4,sk=Math.round(rnd()*4*clamp(.6+(dl-65)*.03,.2,1.5));for(let i=0;i<sk;i++)add(D[rnd()<.75?rnd()*4|0:4+(rnd()*3|0)],'sk',1);
 for(let i=0;i<pi;i++)add(D[7+(rnd()*4|0)],'in',1)}
function playSim(a,b,po,noRec){let[pa,pb]=simScore(a,b);if(pa==pb&&(po||rnd()<.75)){if(rnd()<1/(1+Math.exp(-(teamR(a)-teamR(b))/7)))pa+=3;else pb+=3}
 simStats(a,pa,b,pa>pb);simStats(b,pb,a,pb>pa);const T=T_();
 if(!po&&!noRec){T[a].pf+=pa;T[a].pa+=pb;T[b].pf+=pb;T[b].pa+=pa;if(pa>pb)rec(a,b);else if(pb>pa)rec(b,a);else{T[a].t++;T[b].t++}}
 return{w:pa>=pb?a:b,pa,pb}}
const simG=(a,b)=>playSim(a,b,1).w;
function simGame(quiet){const o=nextOpp();if(o<0)return byeAdvance();autoFill(0);autoFill(o);const me=CAR()?meRow():null,b4=me?me.ss.slice():null;const s=playSim(0,o,!!R.lg.po,true);R.pts+=2;if(me)careerXP(me.ss.map((v,i)=>v-b4[i]),s.pa>s.pb,true);
 result(s.pa>s.pb?1:s.pa<s.pb?-1:0,o,[s.pa,s.pb],quiet)}
function simRest(){let n=0;while(!R.lg.po&&R.stage==null&&n++<20&&!(G&&G.live))simGame(1);if(R.stage!='draft')lobby()}
function mergeBox(){if(!G.box)return;const by={};R.pl.forEach(p=>by[p.id]=p);
 for(const id in G.box){const p=by[id];if(p)G.box[id].forEach((v,i)=>p.ss[i]+=v)}(G.gp||[]).forEach(id=>{if(by[id])by[id].ss[0]++})}
function endGame(){if(!G.live)return;const a=G.sc[0],b=G.sc[1];let res=a>b?1:a<b?-1:0;if(!res&&R.lg.po)res=rnd()<.5?1:-1;if(CAR())careerXP(G.box[R.me]||newSS(),res>0,false);mergeBox();R.pts+=res>0?5:res<0?2:3;G.live=0;result(res,G.opp.i,[a,b])}
function weekly(){const news=[];R.pl.forEach(p=>{if(p.inj>0)p.inj--});
 for(let t=0;t<32;t++){const L=lineup(t);new Set([...L.O,...L.D]).forEach(p=>{if(p&&!p.inj&&rnd()<.012){p.inj=1+(rnd()*6|0);if(t==0)news.push(`${p.g} ${p.n} is injured (${p.inj} wk)`)}})}
 for(let t=T0();t<32;t++)cpuInSeason(t);return news}
function result(res,oi,sc,quiet){const lg=R.lg,T=lg.t;
 if(lg.po)return poRound(res>0,sc);
 T[0].pf+=sc[0];T[0].pa+=sc[1];T[oi].pf+=sc[1];T[oi].pa+=sc[0];
 if(res>0)rec(0,oi);else if(res<0)rec(oi,0);else{T[0].t++;T[oi].t++}
 (lg.res=lg.res||[]).push({wk:lg.wk,o:oi,a:sc[0],b:sc[1]});addNews(`${res>0?'Beat':res<0?'Lost to':'Tied'} ${T[oi].n} ${sc[0]}-${sc[1]}`);
 lg.sched[lg.wk].forEach(m=>{if(!m.includes(0))playSim(m[0],m[1])});const news=weekly();news.forEach(addNews);lg.wk++;
 lastMsg=`${res>0?'Won':res<0?'Lost':'Tied'} ${sc[0]}-${sc[1]} against ${T[oi].n}. `+(news.length?news.join('. ')+'. ':'');
 if(lg.wk>=lg.sched.length&&startPO())return;if(lg.po)lastMsg+=`You made the playoffs as the #${lg.po.sd[0]+1} seed!`;save();if(!quiet)lobby()}
function startPO(){const lg=R.lg,al=[seeds(0),seeds(1)],sd={};al.forEach(L=>L.forEach((t,i)=>sd[t]=i));lg.po={rd:0,al,sd};
 if(!al.some(L=>L.includes(0))){lastMsg+='You missed the playoffs. ';autoPO();return true}return false}
function stepRound(ur){const po=R.lg.po;
 if(po.rd==3){const m=[po.al[0][0],po.al[1][0]];po.champ=m.includes(0)&&ur!=null?(ur?0:opp(m)):simG(m[0],m[1]);po.rd=4;return}
 po.al=po.al.map(L=>{const w=pairs(L,po.rd).map(m=>m.includes(0)&&ur!=null?(ur?0:opp(m)):simG(m[0],m[1]));if(po.rd==0)w.push(L[0]);return w.sort((a,b)=>po.sd[a]-po.sd[b])});po.rd++}
function poRound(w,sc){const po=R.lg.po,nm=RD[po.rd];stepRound(w);if(!w){lastMsg=`Eliminated in the ${nm}${sc?` (${sc[0]}-${sc[1]})`:''}. `;return autoPO()}
 if(po.rd>3)return finishSeason();lastMsg=`Won the ${nm}${sc?` ${sc[0]}-${sc[1]}`:''}! `;save();lobby()}
function autoPO(){const po=R.lg.po;while(po.rd<4)stepRound(null);finishSeason()}
function byeAdvance(){const po=R.lg.po;stepRound(null);lastMsg='Bye week. ';if(po.rd>3)return finishSeason();save();lobby()}
// ---------- end of season ----------
function awards(){const pl=R.pl.filter(p=>p.tid>=0&&p.ss[0]>0),T=T_(),wp=t=>(T[t].w+.5*T[t].t)/Math.max(1,T[t].w+T[t].l+T[t].t),s=(p,k)=>p.ss[SI[k]];
 const off=p=>(p.g=='QB'?s(p,'py')/16+s(p,'ptd')*5-s(p,'pi')*3:0)+s(p,'ry')/12+s(p,'rtd')*5+s(p,'ty')/12+s(p,'tt')*5,def=p=>s(p,'tk')+s(p,'sk')*4+s(p,'in')*5;
 const best=(f,flt)=>pl.filter(flt||(()=>1)).reduce((a,p)=>!a||f(p)>f(a)?p:a,null);
 const A={s:R.season,champ:R.lg.po?R.lg.po.champ:null,list:[['MVP',best(p=>off(p)*(.7+wp(p.tid)*.6))],['Offensive Player of the Year',best(off,p=>p.g!='QB')],['Defensive Player of the Year',best(def)],['Rookie of the Year',best(p=>off(p)+def(p)*1.5,p=>p.draft&&p.draft.s==R.season-1)]]
  .filter(x=>x[1]).map(([a,p])=>{p.aw.push(R.season+' '+a);return{a,id:p.id,n:p.n,g:p.g,tid:p.tid,line:statLine(p)}})};
 if(A.champ!=null)R.pl.filter(p=>p.tid===A.champ).forEach(p=>p.aw.push(R.season+' Champion'));
 R.awards.push(A);if(R.awards.length>40)R.awards.shift();return A}
function finishSeason(){const c=R.lg.po.champ;lastMsg+=`Season ${R.season} champion: ${T_()[c].n}${c==0?' - that is you!':''}`;R.pts+=c==0?13:3;
 const A=awards();R.pl.forEach(p=>{if(p.ss[0]>0)p.car.push([R.season,p.tid,...p.ss]);if(p.car.length>16)p.car.shift();p.ss=newSS()});
 R.hist=R.hist||[];R.hist.push({s:R.season,rec:rec3(T_()[0]),champ:T_()[c].n});draftStart();
 modal(`<h1>Season ${R.season} is over</h1><p>${lastMsg}</p><h3>Awards</h3><table>${A.list.map(x=>`<tr><td>${x.a}</td><td>${x.g} ${x.n}</td><td>${TN(x.tid)}</td><td>${x.line}</td></tr>`).join('')}</table>
 <p>${R.mode=='career'?'Your coach handles the draft, contracts and free agency. You age a year and develop when the new season starts.':'The offseason runs like Football GM: the draft, then re-signing your expiring players, then free agency. Players age and develop when the new season starts.'}</p><div class="grid">${R.mode=='career'?B('lobby()','Continue','big'):B('draftUI()','Go to the draft','big')}</div>`)}
// ---------- player development ----------
function progress(p){const a=p.age;ST.forEach(k=>{let d=a<=24?rnd()*4:a<=27?rnd()*3-.5:a<=30?rnd()*2-1.2:-(1+rnd()*3);
  p.sk[k]=clamp(Math.round(p.sk[k]+d),25,Math.max(p.sk[k],p.mx[k]));if(a>=30)p.mx[k]=Math.max(p.sk[k],p.mx[k]-(rnd()*2|0))})}
// ---------- draft ----------
function draftStart(){const T=T_(),champ=R.lg.po?R.lg.po.champ:-1,wp=t=>(T[t].w+.5*T[t].t)/Math.max(1,T[t].w+T[t].l+T[t].t)+(t==champ?1:0);
 if(!R.picks.some(k=>k.s==R.season))mkPicks(R.season);
 const order=R.picks.filter(k=>k.s==R.season).sort((a,b)=>a.rd-b.rd||wp(a.orig)-wp(b.orig)||T[a.orig].k-T[b.orig].k);
 const GP=GR.flatMap(g=>Array(DEPTH[g]).fill(g));
 for(let i=0;i<130;i++){const p=mkPl(GP[rnd()*GP.length|0],21+(rnd()*2|0),43+rnd()*17,6+rnd()*30,-2);p.exp=0;p.sal=0;p.fz=[gauss(),gauss()];R.pl.push(p)}
 R.dr={order:order.map(k=>({rd:k.rd,orig:k.orig,own:k.own})),cur:0,log:[]};R.picks=R.picks.filter(k=>k.s!=R.season);R.stage='draft';save()}
function cpuDraftPick(tid){const iq=IQ(),pool=R.pl.filter(p=>p.tid==-2),cnt={};R.pl.forEach(p=>{if(p.tid===tid)cnt[p.g]=(cnt[p.g]||0)+1});let best=null,bs=-1e9;
 pool.forEach(p=>{const tv=ovr(p)*.45+ovr(p,1)*.55,ev=estO(p)*.45+estP(p)*.55,v=(rnd()<iq?tv:ev)*Math.sqrt(POSV[p.g])+((cnt[p.g]||0)<DEPTH[p.g]?4:0)+rnd()*3;if(v>bs){bs=v;best=p}});return best}
function makePick(p){const d=R.dr,k=d.order[d.cur],n=d.cur+1;p.tid=k.own;p.sal=k.rd==1?Math.round((ROOKIE[0]-(ROOKIE[0]-ROOKIE[1])*(n-1)/31)*10)/10:ROOKIE[k.rd-1];p.exp=R.season+4;
 p.draft={s:R.season,rd:k.rd,pk:n,tid:k.own};if(k.own===0)addNews(`Drafted ${p.g} ${p.n} (round ${k.rd}, pick ${n})`);delete p.fz;p.yt=0;d.log.unshift(`#${n} (Rd ${k.rd}) ${T_()[k.own].n}: ${p.g} ${p.n}`);d.cur++}
function draftRun(stopAtUser){const d=R.dr;while(d.cur<d.order.length){const k=d.order[d.cur];if(stopAtUser&&k.own===0&&R.mode!='career')break;const p=cpuDraftPick(k.own);if(!p)break;makePick(p)}save()}
function draftUI(){if(R.stage!='draft'||!R.dr)return lobby();ctx='draft';const d=R.dr;if(d.cur>=d.order.length)return draftEnd();
 const k=d.order[d.cur],mine=k.own===0,myLeft=d.order.slice(d.cur).filter(x=>x.own===0).length;
 const pool=R.pl.filter(p=>p.tid==-2&&(!VW.dpos||p.g==VW.dpos)).sort((a,b)=>estP(b)*.55+estO(b)*.45-estP(a)*.55-estO(a)*.45).slice(0,45);
 modal(`${nav()}<h1>Season ${R.season} draft</h1><p>Pick ${d.cur+1} of ${d.order.length} (round ${k.rd}): <b>${T_()[k.own].n}</b>${mine?' - <b>your pick!</b>':''}. You have ${myLeft} pick${myLeft==1?'':'s'} left.
 Ratings are scout estimates (off by about ${Math.round(scoutErr())} points; hire a better scout in Coaching staff to sharpen them). POT is the scout's guess at his peak overall.</p>
 <div class="row">${mine?'':B('draftRun(1);draftUI()','Sim to your pick','big')}${B('draftRun(0);draftUI()','Auto draft the rest')}<select onchange="VW.dpos=this.value;draftUI()"><option value="">All positions</option>${GR.map(g=>`<option ${VW.dpos==g?'selected':''}>${g}</option>`).join('')}</select></div>
 <table><tr><th>Pos</th><th>Name</th><th>Age</th><th>OVR</th><th>POT</th><th>SPD</th><th>STR</th><th>AWR</th><th>SKL</th><th></th></tr>${pool.map(p=>`<tr><td>${p.g}</td><td>${plink(p)}</td><td>${p.age}</td><td>${estO(p)}</td><td>${estP(p)}</td>${ST.map(s=>`<td>${clamp(p.sk[s]+Math.round(p.fz[0]*scoutErr()),20,99)}</td>`).join('')}<td>${mine?B(`makePick(R.pl.find(q=>q.id==${p.id}));save();draftUI()`,'Draft'):''}</td></tr>`).join('')}</table>
 <h3>Draft log</h3><p class="small">${d.log.slice(0,12).join('<br>')||'No picks yet.'}</p>`)}
function draftEnd(){R.pl.forEach(p=>{if(p.tid==-2){p.tid=-1;delete p.fz;p.sal=MINSAL;p.exp=R.season+1}});R.dr=null;resignStart()}
// ---------- re-signing ----------
function resignStart(){R.stage='resign';for(let t=T0();t<32;t++)cpuResign(t);save();if(R.mode!='career')resignUI()}
function toFA(p){p.tid=-1;p.yt=0;p.fad=0}
function cpuResign(t){const iq=IQ();R.pl.filter(p=>p.tid===t&&p.exp<=R.season&&!(p.id===R.me&&(p.sal=askFor(p,t,3),p.exp=R.season+3))).sort((a,b)=>pval(b,iq)-pval(a,iq)).forEach(p=>{
  const ask=askFor(p,t),v=pval(p,iq),room=R.cap-payroll(t);if(p.age<34&&moodFor(p,t).ok&&ask<room&&v>ask*(1.5-.6*iq)+1.5&&rnd()<.25+.7*iq+.2){p.sal=ask;p.exp=R.season+(p.age<27?4:p.age<31?3:1);p.yt++}else toFA(p)})}
function resignUI(){if(R.stage!='resign')return lobby();ctx='resign';const ex=R.pl.filter(p=>p.tid===0&&p.exp<=R.season).sort((a,b)=>ovr(b)-ovr(a));const room=R.cap-payroll(0);
 modal(`${nav()}<h1>Re-sign players</h1><p>These contracts are expiring. Next season's payroll: ${M$(payroll(0))} of ${R.cap}M (hard cap: if you're over, you can only sign minimum ${M$(MINSAL)} deals).
 Each player's mood decides whether he'll talk to you and what he asks. Anyone you don't re-sign becomes a free agent.</p>
 <table><tr><th>Pos</th><th>Name</th><th>Age</th><th>OVR</th><th>POT</th><th>Stats</th><th>Mood</th><th>Years</th><th>Asking per year</th><th></th></tr>${ex.map(p=>{const m=moodFor(p,0),yr=VW['y'+p.id]||(p.age<27?4:p.age<31?3:1),ask=askFor(p,0,yr),ok=m.ok&&(ask<=room||ask<=MINSAL);
  return`<tr><td>${p.g}</td><td>${plink(p)}</td><td>${p.age}</td><td>${ovr(p)}</td><td>${ovr(p,1)}</td><td class="small">${statLine(p,p.car.length?p.car[p.car.length-1].slice(2):p.ss)}</td><td class="small">${m.ok?'Willing':'Refuses to negotiate'}${m.why.length?' ('+m.why.join(', ')+')':''}</td>
  <td><select onchange="VW['y${p.id}']=+this.value;resignUI()">${[1,2,3,4,5].map(y=>`<option ${y==yr?'selected':''}>${y}</option>`).join('')}</select></td><td>${M$(ask)}</td><td>${ok?B(`resign(${p.id},${yr})`,'Sign'):''}${B(`toFA(R.pl.find(q=>q.id==${p.id}));save();resignUI()`,'Release')}</td></tr>`}).join('')||'<tr><td>No expiring contracts.</td></tr>'}</table>
 <div class="grid">${B('resignDone()','Done: on to free agency','big')}${B('rosterUI(0)','Roster')}${B('tradeUI()','Trade')}</div>`)}
function resign(id,yr){const p=R.pl.find(q=>q.id==id),ask=askFor(p,0,yr);if(ask>R.cap-payroll(0)&&ask>MINSAL)return;p.sal=ask;p.exp=R.season+yr;p.yt++;save();resignUI()}
function resignDone(){R.pl.forEach(p=>{if(p.tid===0&&p.exp<=R.season)toFA(p)});faStart()}
// ---------- free agency ----------
function faStart(){R.stage='fa';R.fa={day:0};save();faUI()}
const faAsk=(p,yr)=>Math.max(MINSAL,Math.round(askFor(p,0,yr)*(R.stage=='fa'?Math.max(.6,1-.02*R.fa.day):.75)*10)/10);
function faUI(){ctx='fa';const off=R.stage=='fa',room=R.cap-payroll(0),n=teamPl(0).length;
 const pool=R.pl.filter(p=>p.tid==-1&&(!VW.fpos||p.g==VW.fpos)).sort((a,b)=>ovr(b)-ovr(a)).slice(0,60);
 modal(`${nav()}<h1>Free agents</h1><p>${off?`Free agency day ${R.fa.day} of 30. Other teams sign players as days pass, and asking prices drop.`:'Players without a team. They ask less during the season.'} Cap room ${M$(room)} | Roster ${n}/${MAXROS}. Over the cap you can only sign ${M$(MINSAL)} deals.</p>
 <div class="row">${off?B('faDay(1);faUI()','Advance 1 day')+B('faDay(7);faUI()','Advance 7 days')+B('faEnd()','Finish free agency and start the season','big'):''}<select onchange="VW.fpos=this.value;faUI()"><option value="">All positions</option>${GR.map(g=>`<option ${VW.fpos==g?'selected':''}>${g}</option>`).join('')}</select></div>
 <table><tr><th>Pos</th><th>Name</th><th>Age</th><th>OVR</th><th>POT</th><th>Mood</th><th>Years</th><th>Asking per year</th><th></th></tr>${pool.map(p=>{const m=moodFor(p,0),yr=VW['y'+p.id]||(p.age<27?3:p.age<31?2:1),ask=faAsk(p,yr),ok=m.ok&&n<MAXROS&&(ask<=room||ask<=MINSAL);
  return`<tr><td>${p.g}</td><td>${plink(p)}</td><td>${p.age}</td><td>${ovr(p)}</td><td>${ovr(p,1)}</td><td class="small">${m.ok?'Interested':'Not interested'}${m.why.length?' ('+m.why.join(', ')+')':''}</td><td><select onchange="VW['y${p.id}']=+this.value;faUI()">${[1,2,3,4,5].map(y=>`<option ${y==yr?'selected':''}>${y}</option>`).join('')}</select></td><td>${M$(ask)}</td><td>${ok?B(`signFA(${p.id},${yr})`,'Sign'):''}</td></tr>`}).join('')}</table>`)}
function signFA(id,yr){const p=R.pl.find(q=>q.id==id),ask=faAsk(p,yr);if(teamPl(0).length>=MAXROS||(ask>R.cap-payroll(0)&&ask>MINSAL)||!moodFor(p,0).ok)return faUI();
 p.tid=0;p.sal=ask;p.exp=R.season+yr-(R.stage?0:1);p.yt=0;lastMsg=`Signed ${p.g} ${p.n}.`;addNews(lastMsg);save();faUI()}
function cpuSign(t,maxN){const iq=IQ(),cnt={};let n=0;R.pl.forEach(p=>{if(p.tid===t){cnt[p.g]=(cnt[p.g]||0)+1;n++}});if(n>=MAXROS)return 0;
 const room=R.cap-payroll(t),need=g=>(cnt[g]||0)<DEPTH[g]?((cnt[g]||0)<NEED[g]?3:1):.2;let best=null,bs=0;
 R.pl.forEach(p=>{if(p.tid!=-1)return;const ask=Math.max(MINSAL,askFor(p,t)*(R.stage=='fa'?Math.max(.6,1-.02*R.fa.day):.75));if(ask>room&&ask>MINSAL)return;
  const v=pval(p,iq)*need(p.g)-ask*(.5+iq)+rnd()*2;if(v>bs&&moodFor(p,t).ok){bs=v;best=[p,ask]}});
 if(!best)return 0;const[p,ask]=best;p.tid=t;p.sal=Math.round(ask*10)/10;p.exp=R.season+(p.age<27?3:p.age<31?2:1)-(R.stage?0:1);p.yt=0;return 1}
function faDay(n){for(let i=0;i<n&&R.fa.day<30;i++){R.fa.day++;for(let t=T0();t<32;t++)if(rnd()<.35)cpuSign(t)}save()}
function cpuFill(t){let g=0;GR.forEach(x=>{let tries=0;while(R.pl.filter(p=>p.tid===t&&p.g==x).length<NEED[x]+(x=='K'||x=='P'?0:1)&&tries++<6){const fa=R.pl.filter(p=>p.tid==-1&&p.g==x).sort((a,b)=>ovr(b)-ovr(a))[0];
   const p=fa||(R.pl.push(mkPl(x,24,50,8,-1)),R.pl[R.pl.length-1]);p.tid=t;p.sal=MINSAL;p.exp=R.season+1;p.yt=0;g++}});
 let pl=teamPl(t);while(pl.length>MAXROS){const cnt={};pl.forEach(p=>cnt[p.g]=(cnt[p.g]||0)+1);const cut=pl.filter(p=>cnt[p.g]>NEED[p.g]).sort((a,b)=>pval(a)-pval(b))[0];if(!cut)break;toFA(cut);pl=teamPl(t)}return g}
function cpuInSeason(t){GR.forEach(g=>{const ok=R.pl.filter(p=>p.tid===t&&p.g==g&&!p.inj).length;if(ok<NEED[g]){const fa=R.pl.filter(p=>p.tid==-1&&p.g==g).sort((a,b)=>ovr(b)-ovr(a))[0];if(fa&&teamPl(t).length<MAXROS){fa.tid=t;fa.sal=MINSAL;fa.exp=R.season;fa.yt=0}}})}
function faEnd(){faDay(30);for(let t=T0();t<32;t++)cpuFill(t);newSeason()}
function newSeason(){const prev={};T_().forEach((t,i)=>prev[i]=(t.w+.5*t.t)/Math.max(1,t.w+t.l+t.t));R.prevWP=prev;R.stage=null;R.fa=null;R.season++;
 R.pl=R.pl.filter(p=>p.tid!=-2);if(!R.aged)R.pl.forEach(p=>{p.age++;progress(p)});R.aged=0;
 const ret=[];R.pl=R.pl.filter(p=>{const go=p.id!==R.me&&(p.age>=37||(p.age>=33&&rnd()<.18+(p.age-33)*.18)||(p.tid==-1&&((p.age>=30&&ovr(p)<62)||ovr(p)<44)));if(go&&p.tid===0)ret.push(p.n);return!go});
 R.pl.forEach(p=>{p.inj=0;if(p.tid>=0&&p.yt!=null)p.yt++});for(let t=T0();t<32;t++)cpuFill(t);
 {const fa=R.pl.filter(p=>p.tid==-1).sort((a,b)=>pval(b)-pval(a)),drop=new Set(fa.slice(110).map(p=>p.id));R.pl=R.pl.filter(p=>!drop.has(p.id))}
 const o=R.lg;R.lg=mkLeague();R.lg.t.forEach((t,i)=>{t.n=o.t[i].n;t.r=Math.round(teamR(i))});mkPicks(R.season);mkPicks(R.season+1);
 R.dead=R.dead.filter(x=>x.exp>=R.season);R.pts+=3;lastMsg=`Season ${R.season} begins. Your players aged a year and developed.`+(ret.length?` Retired: ${ret.join(', ')}.`:'');save();lobby()}
// ---------- roster, player pages, depth chart ----------
function rosterUI(tid){VW.tid=tid=tid==null?VW.tid:tid;ctx='roster';const pl=teamPl(tid),L=lineup(tid),st=new Set([...L.O,...L.D,L.K,L.P].filter(Boolean).map(p=>p.id));
 const sk={pos:(a,b)=>GR.indexOf(a.g)-GR.indexOf(b.g)||ovr(b)-ovr(a),ovr:(a,b)=>ovr(b)-ovr(a),pot:(a,b)=>ovr(b,1)-ovr(a,1),age:(a,b)=>a.age-b.age,sal:(a,b)=>b.sal-a.sal,name:(a,b)=>a.n<b.n?-1:1}[VW.sort]||(()=>0);
 const th=(k,t)=>`<th onclick="VW.sort='${k}';rosterUI()" class="srt">${t}${VW.sort==k?' &#9662;':''}</th>`;
 modal(`${nav()}<h1>${TN(tid)} roster</h1><p>${rec3(T_()[tid])} | Team rating ${Math.round(teamR(tid))} | Payroll ${M$(payroll(tid))} / ${R.cap}M | ${pl.length} players${tid===0?` | Training points ${R.pts}`:''}</p>
 <div class="row"><select onchange="rosterUI(+this.value)">${T_().map((t,i)=>`<option value="${i}" ${i==tid?'selected':''}>${t.n}</option>`).join('')}</select>${tid===0?B('depthUI()','Depth chart'):B(`VW.tr=null;tradeUI(${tid})`,'Trade with them')}</div>
 <p class="small">Bold = starter. Tap a name for his player page${tid===0?' (that is where you train him, see his contract and mood, or release him)':''}. Tap a column to sort.</p>
 <table><tr>${th('pos','Pos')}${th('name','Name')}${th('age','Age')}${th('ovr','OVR')}${th('pot','POT')}${th('sal','Contract')}<th>Season stats</th></tr>${pl.slice().sort(sk).map(p=>`<tr${st.has(p.id)?' class="st"':''}><td>${p.g}</td><td>${plink(p)}${p.inj?` <span class="inj">INJ ${p.inj}</span>`:''}</td><td>${p.age}</td><td>${ovr(p)}</td><td>${ovr(p,1)}</td><td>${M$(p.sal)} thru ${p.exp}</td><td class="small">${statLine(p)}</td></tr>`).join('')}</table>`)}
function roster(){rosterUI(0)}
function pp(id){const p=R.pl.find(q=>q.id==id);if(!p)return lobby();const mine=p.tid===0,pr=VW.ppBack||(()=>rosterUI());VW.ppCur=id;
 const m=p.tid>=0||p.tid==-1?moodFor(p,0):null,est=p.tid==-2;
 modal(`<div class="nav">${B('VW.ppBack?VW.ppBack():rosterUI()','&larr; Back')}${B('lobby()','Lobby')}</div><h1>${p.n}</h1>
 <p>${p.g} | Age ${p.age} | ${TN(p.tid)} | ${est?`Scout estimate: OVR ${estO(p)}, POT ${estP(p)}`:`OVR ${ovr(p)}, POT ${ovr(p,1)}`}${p.inj?` | <span class="inj">Injured: ${p.inj} weeks</span>`:''}</p>
 ${p.tid>=0?`<p>Contract: ${M$(p.sal)} per year through season ${p.exp}.</p>`:''}${p.draft?`<p class="small">Drafted ${p.draft.s}: round ${p.draft.rd}, pick ${p.draft.pk} by ${TN(p.draft.tid)}.</p>`:''}
 <p class="small">Personality: ${p.mood.map(x=>MOODN[x]).join(', ')}.${m?` Toward your team: ${m.ok?'happy to sign':'not interested'}${m.why.length?' ('+m.why.join(', ')+')':''}.`:''}</p>
 ${p.aw.length?`<p>Awards: ${p.aw.join('; ')}</p>`:''}
 ${est?'':`<h3>Ratings (current / ceiling)</h3><table><tr>${ST.map(k=>`<th>${k=='skl'?SKN[p.g]:k.toUpperCase()}</th>`).join('')}</tr><tr>${ST.map(k=>`<td ${mine?`class="tc" onclick="trn(${p.id},'${k}')"`:''}>${p.sk[k]} / ${p.mx[k]}</td>`).join('')}</tr></table>${mine?`<p class="small">Tap a rating to train it with 1 training point (you have ${R.pts}), up to its ceiling.</p>`:''}`}
 <h3>Stats</h3><table><tr><th>Season</th><th>Team</th><th>G</th><th>Line</th></tr><tr><td>${R.season} (now)</td><td>${TN(p.tid)}</td><td>${p.ss[0]}</td><td>${statLine(p)}</td></tr>${p.car.slice().reverse().map(c=>`<tr><td>${c[0]}</td><td>${c[1]>=0?T_()[c[1]].n:'-'}</td><td>${c[2]}</td><td>${statLine(p,c.slice(2))}</td></tr>`).join('')}</table>
 <div class="grid">${mine?B(`relUI(${p.id})`,'Release'):''}${p.tid>0?B(`VW.tr={t:${p.tid},a:[],b:[${p.id}],pa:[],pb:[]};tradeUI(${p.tid})`,'Trade for him'):''}${p.tid==-1?B(`VW.fpos='${p.g}';faUI()`,'Sign him (free agents)'):''}</div>`)}
function trn(id,k){const p=R.pl.find(q=>q.id==id);if(p.tid===0&&R.pts>0&&p.sk[k]<p.mx[k]){R.pts--;p.sk[k]++;save()}pp(id)}
function deadFor(p){return p.draft&&p.draft.s==R.season&&R.stage?0:p.sal}
function relUI(id){const p=R.pl.find(q=>q.id==id),dm=deadFor(p);modal(`<h2>Release ${p.n}?</h2><p>${dm?`His remaining salary (${M$(dm)} per year through ${p.exp}) still counts against your cap as dead money.`:'Rookies drafted this offseason can be released for free.'} He becomes a free agent.</p><div class="grid">${B(`rel(${id})`,'Release him','big')}${B(`pp(${id})`,'Cancel')}</div>`)}
function rel(id){const p=R.pl.find(q=>q.id==id),dm=deadFor(p);addNews(`Released ${p.g} ${p.n}`);if(dm)R.dead.push({amt:dm,exp:p.exp});toFA(p);if(R.depth[p.g])R.depth[p.g]=R.depth[p.g].filter(x=>x!==id);save();rosterUI(0)}
function depthUI(g){VW.dg=g=g||VW.dg;ctx='depth';const a=depthOrder(0,g),auto=R.dAuto[g]!==false&&!(R.depth[g]&&R.depth[g].length);
 modal(`${nav()}<h1>Depth chart</h1><div class="row">${GR.map(x=>`<button class="${x==g?'on':''}" onclick="depthUI('${x}')">${x}</button>`).join('')}</div>
 <p>The top ${NEED[g]} ${g}${NEED[g]>1?'s start':' starts'}. Injured players drop to the bottom automatically. ${auto?'Sorted automatically by overall.':'Your custom order.'} ${B(`R.depth['${g}']=[];R.dAuto['${g}']=true;save();depthUI()`,'Auto sort')}</p>
 <table>${a.map((p,i)=>`<tr${i<NEED[g]?' class="st"':''}><td>${i+1}</td><td>${plink(p)}${p.inj?` <span class="inj">INJ</span>`:''}</td><td>OVR ${ovr(p)}</td><td>${i?B(`dmove('${g}',${i},-1)`,'&#9650;'):''}${i<a.length-1?B(`dmove('${g}',${i},1)`,'&#9660;'):''}</td></tr>`).join('')}</table>`);VW.ppBack=()=>depthUI()}
function dmove(g,i,dir){const a=depthOrder(0,g).map(p=>p.id),j=i+dir;[a[i],a[j]]=[a[j],a[i]];R.depth[g]=a;R.dAuto[g]=false;save();depthUI(g)}
// ---------- stats, standings, leaders, history ----------
function statsUI(tid){VW.tid=tid=tid==null?VW.tid:tid;const pl=teamPl(tid),s=(p,k)=>p.ss[SI[k]],sec=(t,f,cols)=>{const r=pl.filter(f);return r.length?`<h3>${t}</h3><table><tr><th>Name</th>${cols.map(c=>`<th>${c[0]}</th>`).join('')}</tr>${r.map(p=>`<tr><td>${plink(p)}</td>${cols.map(c=>`<td>${c[1](p)}</td>`).join('')}</tr>`).join('')}</table>`:''};
 VW.ppBack=()=>statsUI();
 modal(`${nav()}<h1>${TN(tid)} stats, season ${R.season}</h1><div class="row"><select onchange="statsUI(+this.value)">${T_().map((t,i)=>`<option value="${i}" ${i==tid?'selected':''}>${t.n}</option>`).join('')}</select></div>
 ${sec('Passing',p=>s(p,'pa')>0,[['Cmp',p=>s(p,'pc')],['Att',p=>s(p,'pa')],['Yds',p=>s(p,'py')],['TD',p=>s(p,'ptd')],['INT',p=>s(p,'pi')]])}
 ${sec('Rushing',p=>s(p,'ra')>0,[['Car',p=>s(p,'ra')],['Yds',p=>s(p,'ry')],['Avg',p=>(s(p,'ry')/s(p,'ra')).toFixed(1)],['TD',p=>s(p,'rtd')]])}
 ${sec('Receiving',p=>s(p,'rc')>0,[['Rec',p=>s(p,'rc')],['Yds',p=>s(p,'ty')],['TD',p=>s(p,'tt')]])}
 ${sec('Defense',p=>s(p,'tk')+s(p,'sk')+s(p,'in')>0,[['Tkl',p=>s(p,'tk')],['Sacks',p=>s(p,'sk')],['INT',p=>s(p,'in')]])}
 ${sec('Kicking',p=>s(p,'fga')>0,[['FG',p=>s(p,'fgm')+'/'+s(p,'fga')]])}`)}
function standings(){VW.ppBack=null;const T=T_(),blk=c=>{const sd=seeds(c);return`<h3>${c?'Second':'First'} conference</h3><table><tr><th></th><th>Team</th><th>W-L</th><th>PF</th><th>PA</th><th>Rating</th></tr>${T.map((_,i)=>i).filter(i=>T[i].c==c).sort(cmp).map(i=>`<tr${i==0?' class="me"':''}><td>${sd.includes(i)?'x':''}</td><td><a href="#" onclick="rosterUI(${i});return false">${T[i].n}</a></td><td>${rec3(T[i])}</td><td>${T[i].pf}</td><td>${T[i].pa}</td><td>${Math.round(teamR(i))}</td></tr>`).join('')}</table>`};
 modal(`${nav()}<h1>Standings</h1><p class="small">x = in the playoff picture (4 division winners and 3 wild cards per conference). Tap a team to see its roster.</p>${blk(0)}${blk(1)}`)}
function leadersUI(){VW.ppBack=()=>leadersUI();const cats=[['Passing yards','py'],['Passing TD','ptd'],['Rushing yards','ry'],['Receiving yards','ty'],['Receiving TD','tt'],['Tackles','tk'],['Sacks','sk'],['Interceptions','in'],['Field goals','fgm']];
 modal(`${nav()}<h1>League leaders, season ${R.season}</h1>${cats.map(([n,k])=>`<h3>${n}</h3><table>${R.pl.filter(p=>p.tid>=0&&p.ss[SI[k]]>0).sort((a,b)=>b.ss[SI[k]]-a.ss[SI[k]]).slice(0,8).map((p,i)=>`<tr${p.tid===0?' class="me"':''}><td>${i+1}</td><td>${plink(p)}</td><td>${T_()[p.tid].n}</td><td>${p.ss[SI[k]]}</td></tr>`).join('')||'<tr><td>No stats yet.</td></tr>'}</table>`).join('')}`)}
function historyUI(){VW.ppBack=()=>historyUI();modal(`${nav()}<h1>Awards &amp; history</h1>${(R.awards||[]).slice().reverse().map(A=>`<h3>Season ${A.s}${A.champ!=null?': champion '+T_()[A.champ].n:''}</h3><table>${A.list.map(x=>`<tr><td>${x.a}</td><td>${x.g} ${x.n}</td><td>${TN(x.tid)}</td><td class="small">${x.line}</td></tr>`).join('')}</table>`).join('')||'<p>No seasons finished yet.</p>'}
 ${(R.hist||[]).length?`<h3>Your seasons</h3><table>${R.hist.slice().reverse().map(h=>`<tr><td>${h.s}</td><td>${h.rec}</td><td>Champion: ${h.champ}</td></tr>`).join('')}</table>`:''}`)}
function picksUI(){const own=R.picks.filter(k=>k.own===0).sort((a,b)=>a.s-b.s||a.rd-b.rd);modal(`${nav()}<h1>Your draft picks</h1><p>Picks are assets: you can trade them in the Trade screen. A pick's order depends on the original team's record.</p><table>${own.map(k=>`<tr><td>Season ${k.s} draft</td><td>Round ${k.rd}</td><td>${k.orig===0?'Your own':'From '+T_()[k.orig].n}</td></tr>`).join('')||'<tr><td>You have no picks.</td></tr>'}</table>`)}
function staff(){const c=(k,n,w)=>`<p><b>${n}</b>: level ${R.st[k]} of ${k=='sc'?4:5}. ${w} ${B(`hire('${k}')`,`Upgrade (${3+R.st[k]*2} points)`)}</p>`;
 modal(`${nav()}<h1>Coaching staff</h1><p>Training points: ${R.pts}</p>${c('oc','Offensive coordinator',`+${R.st.oc*2} to every offensive player's rating in games.`)}${c('dc','Defensive coordinator',`+${R.st.dc*2} to every defensive player's rating in games.`)}${c('sc','Head scout',`Draft prospect ratings are off by about ${Math.round(scoutErr())} points.`)}`)}
function hire(k){const n=3+R.st[k]*2;if(R.pts>=n&&R.st[k]<(k=='sc'?4:5)){R.pts-=n;R.st[k]++;save()}staff()}
// ---------- trades ----------
const pkKey=k=>`${k.s}-${k.rd}-${k.orig}`,pkName=k=>`${k.s} round ${k.rd} pick${k.orig!==k.own?` (from ${T_()[k.orig].n})`:''}`;
function tradeEval(tr){const iq=IQ(),A=R.pl.filter(p=>tr.a.includes(p.id)),Bp=R.pl.filter(p=>tr.b.includes(p.id)),PA=R.picks.filter(k=>tr.pa.includes(pkKey(k))),PB=R.picks.filter(k=>tr.pb.includes(pkKey(k)));
 const get=A.reduce((s,p)=>s+pval(p,iq),0)+PA.reduce((s,k)=>s+pickVal(k,iq),0),give=Bp.reduce((s,p)=>s+pval(p,iq),0)+PB.reduce((s,k)=>s+pickVal(k,iq),0);
 const sa=A.reduce((s,p)=>s+p.sal,0),sb=Bp.reduce((s,p)=>s+p.sal,0),pu=payroll(0)-sa+sb,pt=payroll(tr.t)+sa-sb,nu=teamPl(0).length-A.length+Bp.length,nt=teamPl(tr.t).length+A.length-Bp.length;
 const marg=[-.12,.04,.14,.26][R.diff];let ok=get>0||give>0,msg='';
 if(!A.length&&!Bp.length&&!PA.length&&!PB.length){ok=false;msg='Pick players or picks to trade.'}
 else if(pu>R.cap&&sb>sa){ok=false;msg='This puts you over the salary cap.'}
 else if(pt>R.cap&&sa>sb){ok=false;msg='This puts them over the salary cap.'}
 else if(nu>MAXROS){ok=false;msg=`You would have ${nu} players (max ${MAXROS}).`}else if(nt>MAXROS){ok=false;msg='Their roster would be too big.'}
 else if(get<give*(1+marg)+.5){ok=false;msg='They say no: they want more value back.'}
 else msg='They would accept this trade.';return{ok,msg,get,give,sa,sb,pu}}
function tradeUI(tid){if(tid!=null&&(!VW.tr||VW.tr.t!==tid))VW.tr={t:tid,a:[],b:[],pa:[],pb:[]};if(!VW.tr)VW.tr={t:1,a:[],b:[],pa:[],pb:[]};const tr=VW.tr,t=tr.t;
 if(!R.stage&&!R.lg.po&&R.lg.wk>=12)return modal(`${nav()}<h1>Trade</h1><p>The trade deadline (week 12) has passed. Trading opens again after the season.</p>`);
 if(R.lg.po&&!R.stage)return modal(`${nav()}<h1>Trade</h1><p>No trades during the playoffs.</p>`);
 VW.ppBack=()=>tradeUI();const ev=tradeEval(tr),chk=(arr,key,v,lbl)=>`<label class="ck"><input type="checkbox" ${tr[arr].includes(v)?'checked':''} onchange="tgl('${arr}',${typeof v=='string'?`'${v}'`:v})"> ${lbl}</label>`;
 const side=(tid,arr,parr)=>teamPl(tid).sort((a,b)=>ovr(b)-ovr(a)).map(p=>chk(arr,'',p.id,`${p.g} ${p.n} ${p.age}y OVR ${ovr(p)}/${ovr(p,1)} ${M$(p.sal)} thru ${p.exp}`)).join('')+R.picks.filter(k=>k.own===tid).map(k=>chk(parr,'',pkKey(k),pkName(k))).join('');
 modal(`${nav()}<h1>Trade</h1><div class="row">Trade with <select onchange="VW.tr=null;tradeUI(+this.value)">${T_().map((x,i)=>i?`<option value="${i}" ${i==t?'selected':''}>${x.n} (${rec3(x)})</option>`:'').join('')}</select></div>
 <p class="${ev.ok?'good':'warn'}"><b>${ev.msg}</b> Salary out ${M$(ev.sa)}, in ${M$(ev.sb)}; your payroll after: ${M$(ev.pu)} / ${R.cap}M.</p>
 <div class="grid">${B('tradeDo()','Propose trade','big')}${B('tradeFix()','What would make this work?')}${B(`VW.tr={t:${t},a:[],b:[],pa:[],pb:[]};tradeUI()`,'Clear')}</div>
 <div class="cols"><div><h3>You give</h3>${side(0,'a','pa')}</div><div><h3>You get (${T_()[t].n})</h3>${side(t,'b','pb')}</div></div>`)}
function tgl(arr,v){const a=VW.tr[arr],i=a.indexOf(v);if(i<0)a.push(v);else a.splice(i,1);tradeUI()}
function tradeFix(){const tr=VW.tr;let ev=tradeEval(tr);if(ev.ok)return tradeUI();const iq=IQ();
 const opts=teamPl(0).filter(p=>!tr.a.includes(p.id)).map(p=>({k:'a',v:p.id,val:pval(p,iq)})).concat(R.picks.filter(k=>k.own===0&&!tr.pa.includes(pkKey(k))).map(k=>({k:'pa',v:pkKey(k),val:pickVal(k,iq)}))).sort((a,b)=>a.val-b.val);
 for(const o of opts){tr[o.k].push(o.v);if(tradeEval(tr).ok)return tradeUI();tr[o.k].pop()}
 const big=opts.filter(o=>o.val>0).pop();if(big){tr[big.k].push(big.v);if(tradeEval(tr).ok)return tradeUI();tr[big.k].pop()}
 tradeUI();$('modal').firstElementChild.insertAdjacentHTML('afterbegin','<p class="warn">They could not find anything from your team that makes this work.</p>')}
function tradeDo(){const tr=VW.tr,ev=tradeEval(tr);if(!ev.ok)return tradeUI();
 R.pl.forEach(p=>{if(tr.a.includes(p.id)){p.tid=tr.t;p.yt=0}else if(tr.b.includes(p.id)){p.tid=0;p.yt=0}});
 R.picks.forEach(k=>{const kk=pkKey(k);if(tr.pa.includes(kk))k.own=tr.t;else if(tr.pb.includes(kk))k.own=0});
 lastMsg=`Trade completed with ${T_()[tr.t].n}.`;addNews(lastMsg);VW.tr=null;save();lobby()}
// ---------- settings and saves ----------
function settingsUI(){const bk=backups();
 modal(`${nav()}<h1>Settings</h1><h3>Difficulty</h3><p class="small">Difficulty only changes how smart the CPU is: play calling, reading your tendencies, QB decisions, clock management, drafting and trading. It never changes player ratings.</p>
 <div class="row">${DIFFS.map((x,i)=>`<button class="${R.diff==i?'on':''}" onclick="R.diff=${i};save();settingsUI()">${x.n}</button>`).join('')}</div><p>${DIFFS[R.diff].d}</p>
 <h3>Quarter length</h3><div class="row">${[2,4,6,8].map(m=>`<button class="${R.qlen==m?'on':''}" onclick="R.qlen=${m};save();settingsUI()">${m} min</button>`).join('')}</div><p class="small">Takes effect next game.</p>
 <h3>Your save</h3><p class="small">Your league saves automatically in this browser after every play, and backups rotate every few minutes. Export a save file now and then so you can't lose your league, even if browser data gets cleared.</p>
 ${saveWarn?`<p class="warn">${saveWarn}</p>`:''}<div class="grid">${B('exportSave()','Export save file','big')}<button onclick="$('imp').click()">Import save file</button></div><input type="file" id="imp" accept=".json,application/json" hidden onchange="importSave(this.files[0],ok=>{if(ok)location.reload();else alert('That file is not a Gridiron Lab save.')})">
 <h3>Backups</h3>${bk.length?`<table>${bk.map(b=>`<tr><td>${b.n}</td><td>Season ${b.season}</td><td class="small">${b.when}</td><td>${B(`if(confirm('Restore this backup? Your current save is kept as a backup too.')&&restoreBackup('${b.k}'))location.reload()`,'Restore')}</td></tr>`).join('')}</table>`:'<p class="small">No backups yet. They appear after a few minutes of play.</p>'}
 <h3>Game mode</h3><p class="small">Franchise mode: you're the GM and coach and control the QB and a defender. Career mode: you're one player and upgrade yourself. Each mode keeps its own save.</p><div class="row">${B("lsSet('gdmode','franchise');location.reload()",'Franchise mode',MODE=='franchise'?'on':'')}${B("lsSet('gdmode','career');location.reload()",'Career mode',MODE=='career'?'on':'')}</div>
 <h3>${MODE=='career'?'New career':'New league'}</h3><p class="small">Starts over in this mode. Your current save is kept as a backup you can restore.</p>${B(`if(confirm('Start over?')){const c=lsGet(SAVE_KEY);if(c)lsSet(SAVE_KEY+'_prerestore',c);lsDel(SAVE_KEY);location.reload()}`,MODE=='career'?'Start a new career':'Start a new league')}`)}
// on load: resume where the save left off
if(R.stage=='draft'&&!R.dr)draftStart();
[['rosterUI','roster'],['depthUI','depth'],['statsUI','stats'],['standings','stand'],['leadersUI','lead'],['tradeUI','trade'],['faUI','fa'],['picksUI','picks'],['staff','staff'],['historyUI','hist'],['settingsUI','set'],['draftUI','off'],['resignUI','off'],['pp','pp']].forEach(([f,k])=>{const o=globalThis[f];if(typeof o=='function')globalThis[f]=function(...a){VW.page=k;return o.apply(this,a)}});
lobby();
