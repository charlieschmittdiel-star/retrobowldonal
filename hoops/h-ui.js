'use strict';
// Menus: a sidebar like the football game (home, roster, player pages with training, standings, schedule, box scores,
// leaders, playoffs, the offseason, trades, history, game features, settings and controls), plus the game loop.
let PAGE='home',LOOP=null;
const pct=(a,b)=>b?(a/b*100).toFixed(1):'-',f1=v=>(Math.round(v*10)/10).toFixed(1);
const rec=t=>`${R.t[t].w}-${R.t[t].l}`;
const money=v=>'$'+(Math.round(v*10)/10).toFixed(1)+'M';
const DIFFN=['Rookie','Pro','All-Star','Hall of Fame'];
function B(f,t,c){return`<button class="${c||''}" onclick="${f}">${t}</button>`}
function ovrPill(v){const c=v>=80?'#22c55e':v>=70?'#84cc16':v>=62?'#eab308':v>=55?'#f97316':'#ef4444';return`<b class="pill" style="background:${c}">${v}</b>`}
const htTxt=h=>`${Math.floor(h/12)}'${h%12}"`;
function tlink(t){return`<a href="#" onclick="teamUI(${t});return false">${esc(R.t[t].n)}</a>`}
function plink(p){return`<a href="#" onclick="playerUI(${p.id});return false">${esc(p.n)}</a>`}
// ---------- the shell ----------
const NAV=[['home','Home','homeUI()'],['roster','Roster','rosterUI()'],['sched','Schedule','schedUI()'],['stand','Standings','standUI()'],['lead','League leaders','leadUI()'],['po','Playoffs','poUI()'],['trade','Trade','tradeUI()'],['fa','Free agents','faUI()'],['hl','Highlights','hlUI()'],['hist','History','histUI()'],['feat','Game features','featUI()'],['set','Settings','setUI()'],['keys','Controls','keysUI()']];
function shell(h){const me=R.t[0];$('ui').hidden=false;$('gamewrap').hidden=true;
 const stage=R.stage?`<button class="ni hot" onclick="offUI()">${{draft:'The draft',resign:'Re-sign players',fa:'Free agency'}[R.stage]}</button>`:'';
 $('ui').innerHTML=`<div class="shell"><aside class="side"><div class="brand"><div class="logo" style="background:${me.col[0]};color:${me.col[1]}">${esc(me.ab.slice(0,3))}</div><div><b>${esc(me.n)}</b><span>${rec(0)} · Season ${R.season}</span></div></div>${stage}
 ${NAV.map(([k,n,f])=>k=='po'&&!R.po&&!R.hist.length?'':`<button class="ni ${PAGE==k?'on':''}" onclick="${f}">${n}</button>`).join('')}
 <a class="ni fb" href="../index.html">&#127944; Football</a></aside><main class="main" id="mainpg">${h}</main></div>`;window.scrollTo(0,0)}
function modal(h){const m=$('modal');m.innerHTML=`<div class="mbox">${h}<div class="mclose">${B("closeModal()",'Close')}</div></div>`;m.hidden=false;m.onclick=e=>{if(e.target===m)closeModal()}}
function closeModal(){$('modal').hidden=true;$('modal').innerHTML=''}
function toast(s){const d=document.createElement('div');d.className='toast';d.textContent=s;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
// ---------- start ----------
function startUI(){$('ui').hidden=false;$('gamewrap').hidden=true;const col=TCOL.map((c,i)=>`<label class="sw"><input type="radio" name="col" value="${i}" ${i==0?'checked':''}><i style="background:${c[0]};border-color:${c[1]}"></i></label>`).join('');
 $('ui').innerHTML=`<div class="start"><div class="hero"><div class="ball"></div><h1>Hardwood Lab</h1><p>Basketball: run a team, coach it, and play the games yourself.</p></div>
 <div class="card"><h3>New league</h3><label>Team name <input id="nn" maxlength="28" value="${esc(pick(CITIES))} ${esc(pick(NICKS))}"></label>
 <div class="row"><span>Colors</span><div class="sws">${col}</div></div>
 <label>Difficulty <select id="nd">${DIFFN.map((d,i)=>`<option value="${i}" ${i==1?'selected':''}>${d}</option>`).join('')}</select></label><p class="small">Difficulty only changes how smart the other team plays.</p>
 <label>Season length <select id="ns"><option value="20">20 games</option><option value="30" selected>30 games</option><option value="50">50 games</option><option value="82">82 games</option></select></label>
 <label>Quarter length <select id="nq">${[2,3,4,6,8,12].map(q=>`<option value="${q}" ${q==4?'selected':''}>${q} minutes</option>`).join('')}</select></label>
 ${B('newLeagueGo()','Start the league','big')}</div><p class="small"><a href="../index.html">&#127944; Back to Gridiron Lab (football)</a></p></div>`}
function newLeagueGo(){const ci=+(document.querySelector('input[name=col]:checked')||{value:0}).value;newLeague({name:$('nn').value.trim()||'Hardwood Lab',slen:+$('ns').value,qlen:+$('nq').value,diff:+$('nd').value});R.t[0].col=TCOL[ci];
 // make sure no other team wears the same colors
 R.t.forEach((t,i)=>{if(i&&t.col===TCOL[ci])t.col=TCOL[(ci+15)%TCOL.length]});hSave();homeUI()}
// ---------- home ----------
function homeUI(){PAGE='home';const me=R.t[0],conf=seeds(me.conf),cr=conf.indexOf(0)+1;let next='';
 if(R.stage){next=`<div class="card hot"><h3>${{draft:'The draft',resign:'Re-sign players',fa:'Free agency'}[R.stage]}</h3><p>The season is over. ${R.stage=='fa'?`Free agency day ${R.fa.day} of 30.`:''}</p>${B('offUI()','Go','big')}</div>`}
 else if(R.po){const s=poUserSeries();if(R.po.champ!=null)next='';else if(s){const o=s.a===0?s.b:s.a,w=s.a===0?s.w:[s.w[1],s.w[0]],home=(s.w[0]+s.w[1])%2==0?s.a:s.b;
   next=`<div class="card hot"><h3>${RDN[R.po.rd]} · Game ${s.w[0]+s.w[1]+1}</h3><p>${home===0?'vs':'@'} ${tlink(o)} (${rec(o)}) · Series ${w[0]}-${w[1]} · Best of ${R.po.best}</p><div class="row">${B('playGame()','Play the game','big')}${B('simGameUI()','Sim the game')}${B('simSeriesUI()','Sim the series')}</div></div>`}
  else next=`<div class="card"><h3>Playoffs: ${RDN[R.po.rd]}</h3><p>You're out. Watch the rest.</p><div class="row">${B('poDayUI()','Sim a day')}${B('poAllUI()','Sim to the end')}</div></div>`}
 else{const g=nextGame();if(g){const o=g[0]===0?g[1]:g[0];next=`<div class="card hot"><h3>Game ${R.day+1} of ${R.sched.length}</h3><p>${g[0]===0?'vs':'@'} ${tlink(o)} (${rec(o)}, team ${ovrPill(teamOvr(o))})</p><div class="row">${B('playGame()','Play the game','big')}${B('simGameUI()','Sim the game')}${B('simDaysUI(7)','Sim a week')}${B('simDaysUI(999)','Sim to the playoffs')}</div></div>`}}
 const box=R.box.slice(-6).reverse().map((b,i)=>{const k=R.box.length-1-i,me0=b.a===0?0:1,o=b.a===0?b.b:b.a,w=b.sc[me0]>b.sc[1-me0];return`<tr onclick="boxUI(${k})" class="click"><td>${b.po!=null?'PO':'G'}</td><td>${b.a===0?'vs':'@'} ${esc(R.t[o].ab)}</td><td class="${w?'w':'l'}">${w?'W':'L'} ${b.sc[me0]}-${b.sc[1-me0]}${b.ot?' OT':''}</td><td>${b.played?'played':'sim'}</td></tr>`}).join('');
 const tops=teamPl(0).filter(p=>p.ss[SI.gp]).sort((a,b)=>pg(b,'pts')-pg(a,'pts')).slice(0,4).map(p=>`<tr><td>${plink(p)}</td><td>${p.pos}</td><td>${f1(pg(p,'pts'))} pts</td><td>${f1(pg(p,'orb')+pg(p,'drb'))} reb</td><td>${f1(pg(p,'ast'))} ast</td></tr>`).join('');
 const news=R.news.slice(0,8).map(n=>`<li class="${n.m?'mine':''}">${esc(n.t)}</li>`).join('');
 shell(`<div class="head"><h1>${esc(me.n)}</h1><p>${rec(0)} · ${cr}${['th','st','nd','rd'][cr%10<4&&(cr<11||cr>13)?cr%10:0]} in the ${['East','West'][me.conf]} · Team ${ovrPill(teamOvr(0))} · Payroll ${money(payroll(0))} / ${money(CAP)} · <b>${R.pts}</b> training points</p></div>
 ${offerCard()}${next}<div class="cols"><div class="card"><h3>Recent games</h3><table class="t">${box||'<tr><td>No games yet.</td></tr>'}</table></div><div class="card"><h3>Top players</h3><table class="t">${tops||'<tr><td>Play some games.</td></tr>'}</table></div></div>
 <div class="card"><h3>League news</h3><ul class="news">${news}</ul></div>`)}
// ---------- simming ----------
function simGameUI(){if(R.po){poDay(false);}else simDay(false);afterSim();homeUI()}
function simDaysUI(n){for(let i=0;i<n&&!R.po&&R.day<R.sched.length;i++)simDay(false);afterSim();homeUI()}
function simSeriesUI(){let k=0;while(poUserSeries()&&k++<10)poDay(false);afterSim();homeUI()}
function poDayUI(){if(R.po&&R.po.champ==null)poDay(false);afterSim();homeUI()}
function poAllUI(){let k=0;while(R.po&&R.po.champ==null&&k++<40)poDay(false);afterSim();homeUI()}
function afterSim(){cpuOffer();hSave()}
// ---------- the game ----------
function playGame(){let home,away;if(R.po){const s=poUserSeries();if(!s)return;home=(s.w[0]+s.w[1])%2==0?s.a:s.b;away=home===s.a?s.b:s.a}else{const g=nextGame();if(!g)return;home=g[0];away=g[1]}
 newGame(home,away,{qlen:R.qlen});G.diff=R.diff;$('ui').hidden=true;$('gamewrap').hidden=false;closeModal();hResize();
 if(feat('tips')&&!OPT.tip1){OPT.tip1=1;optSave();G.paused=true;modal(`<h2>How to play</h2>${keysHTML()}<p class="small">You control the ball handler on offense and the player with the yellow ring on defense. These tips show once; Controls in the menu has them any time.</p>${B("closeModal();G.paused=false",'Let\'s play','big')}`)}
 runLoop()}
function runLoop(){if(LOOP)cancelAnimationFrame(LOOP);let last=performance.now(),acc=0;const tick=now=>{if(!G){LOOP=null;return}const dt=Math.min(.1,(now-last)/1000);last=now;
  if(!G.paused&&G.live){acc+=dt;let n=0;while(acc>=1/60&&n<8){hStep(1/60);meterStep(1/60);acc-=1/60;n++}if(G.netT>0)G.netT-=dt;if(G.hype>0)G.hype-=dt}
  hEvents();hDraw();if(G.phase=='over'&&!G.shown){G.shown=1;setTimeout(endUI,900)}LOOP=requestAnimationFrame(tick)};LOOP=requestAnimationFrame(tick)}
function simRest(){if(!G||G.phase=='over')return;G.auto=1;G.ctl=null;G.paused=false;closeModal();const go=()=>{let n=0;while(G&&G.phase!='over'&&n++<4000)hStep(1/30);if(G&&G.phase!='over')setTimeout(go,0)};go()}
function gameMenu(){if(!G)return;G.paused=true;modal(`<h2>Paused</h2><p>${esc(R.t[G.tm[0]].ab)} ${G.sc[0]} - ${G.sc[1]} ${esc(R.t[G.tm[1]].ab)} · ${G.q<=4?'Q'+G.q:'OT'}</p><div class="row">${B("closeModal();G.paused=false",'Back to the game','big')}${B("liveBox()",'Box score')}${B("subUI()",'Substitutions')}${B("simRest()",'Sim the rest of the game')}</div>`)}
// substitutions: pick a bench player, then the player he replaces
let SUBP=null;
function subUI(){const on=onT(0),bench=G.bench[0].map(id=>R.pl.find(p=>p.id===id)).filter(Boolean);const st=id=>Math.round(G.st[id]||0),pf=id=>G.bx[id]?G.bx[id][SI.pf]:0;
 const bar=id=>`<i class="stb"><em style="width:${st(id)}%;background:${st(id)>60?'#4ade80':st(id)>35?'#fbbf24':'#f87171'}"></em></i>`;
 modal(`<h2>Substitutions</h2><p class="small">${SUBP?'Now click the player on the court he replaces.':'Click a bench player, then the player on the court he replaces.'} Energy bars show how tired each player is.</p><div class="cols">
 <div><h3>On the court</h3><table class="t">${on.map(e=>`<tr class="click" onclick="subDo(${e.p.id})"><td>${e.p.pos}</td><td>${esc(e.p.n)}</td><td>${ovrPill(ovr(e.p))}</td><td>${bar(e.p.id)}</td><td>${pf(e.p.id)} PF</td></tr>`).join('')}</table></div>
 <div><h3>Bench</h3><table class="t">${bench.map(p=>`<tr class="click ${SUBP===p.id?'sel':''}" onclick="SUBP=${p.id};subUI()"><td>${p.pos}</td><td>${esc(p.n)}${p.inj?' (hurt)':''}</td><td>${ovrPill(ovr(p))}</td><td>${bar(p.id)}</td><td>${pf(p.id)} PF</td></tr>`).join('')}</table></div></div>${B("closeModal();G.paused=false",'Back to the game','big')}`)}
function subDo(outId){if(!SUBP)return;const inP=R.pl.find(p=>p.id===SUBP),e=onT(0).find(x=>x.p.id===outId);if(!inP||!e||inP.inj||(G.bx[inP.id]&&G.bx[inP.id][SI.pf]>=6)){SUBP=null;return subUI()}
 G.bench[0]=G.bench[0].filter(id=>id!==inP.id).concat([e.p.id]);const ne=mkEnt(inP,0,e.i);ne.x=e.x;ne.y=e.y;ne.fa=e.fa;G.ent[G.ent.indexOf(e)]=ne;if(G.b.h===e)G.b.h=ne;if(G.ctl===e)G.ctl=ne;if(G.ft&&G.ft.e===e)G.ft.e=ne;if(G.b.tgt===e)G.b.tgt=ne;if(G.b.to===e)G.b.to=ne;if(G.b.sh===e)G.b.sh=ne;assignMen();SUBP=null;subUI()}
function liveBox(){const r=gameResult();modal(boxHTML(r.a,r.b,r.res.sc,r.res.T.map(S=>S.ps.map((p,i)=>[p.id,p.n,p.pos,...S.box[i]])),G.ot)+B("closeModal();G.paused=false",'Back to the game','big'))}
function endUI(){if(!G)return;const r=gameResult();const me=r.a===0?0:1,w=r.res.sc[me]>r.res.sc[1-me];
 modal(`<h2 class="${w?'w':'l'}">${w?'Win!':'Loss'} ${r.res.sc[me]}-${r.res.sc[1-me]}${G.ot?' (OT)':''}</h2>${boxHTML(r.a,r.b,r.res.sc,r.res.T.map(S=>S.ps.map((p,i)=>[p.id,p.n,p.pos,...S.box[i]])),G.ot)}${B('doneGame()','Continue','big')}`);$('modal').onclick=null}
function doneGame(){finishGame();G=null;if(LOOP)cancelAnimationFrame(LOOP);LOOP=null;closeModal();afterSim();homeUI()}
// sounds and effects from game events
let AC=null;function snd(f,d,type,vol,slide){if(!feat('sound'))return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;if(slide)o.frequency.exponentialRampToValueAtTime(slide,AC.currentTime+d);g.gain.value=vol||.08;g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function noise(d,vol,hp){if(!feat('sound'))return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*d,b=AC.createBuffer(1,n,AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(rnd()*2-1)*(1-i/n);const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();f.type='highpass';f.frequency.value=hp||2000;g.gain.value=vol||.06;s.buffer=b;s.connect(f);f.connect(g);g.connect(AC.destination);s.start()}catch(e){}}
function hEvents(){if(!G||!G.ev.length)return;const ev=G.ev;G.ev=[];ev.forEach(k=>{if(k=='score'||k=='three'||k=='dunk'||k=='swish'){G.netT=.5;noise(.18,.05,3000);if(k!='swish')G.hype=1.2;if(k=='dunk')snd(90,.2,'square',.08)}
  else if(k=='rim')snd(520,.12,'square',.04,300);else if(k=='whistle'){snd(2600,.12,'sine',.05);setTimeout(()=>snd(2400,.18,'sine',.05),130)}else if(k=='block'){snd(140,.15,'triangle',.1);G.hype=.8}else if(k=='steal')G.hype=.6;else if(k=='bounce')snd(110,.06,'sine',.06)})}
// ---------- box scores ----------
function boxHTML(a,b,sc,pl,ot){const hd='<tr><th>Player</th><th>MIN</th><th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TO</th><th>FG</th><th>3PT</th><th>FT</th><th>PF</th></tr>';const I=k=>SI[k]+3;
 return [a,b].map((t,j)=>{const rows=pl[j].filter(r=>r[I('min')]>0||r[I('pts')]>0).sort((x,y)=>y[I('min')]-x[I('min')]).map(r=>`<tr><td>${esc(r[1])} <small>${r[2]}</small></td><td>${r[I('min')]}</td><td><b>${r[I('pts')]}</b></td><td>${r[I('orb')]+r[I('drb')]}</td><td>${r[I('ast')]}</td><td>${r[I('stl')]}</td><td>${r[I('blk')]}</td><td>${r[I('tov')]}</td><td>${r[I('fgm')]}-${r[I('fga')]}</td><td>${r[I('tpm')]}-${r[I('tpa')]}</td><td>${r[I('ftm')]}-${r[I('fta')]}</td><td>${r[I('pf')]}</td></tr>`).join('');
  return`<h3>${esc(R.t[t].n)} ${sc[j]}</h3><div class="tw"><table class="t box">${hd}${rows}</table></div>`}).join('')}
function boxUI(k){const b=R.box[k];if(!b)return;modal(`<h2>${esc(R.t[b.b].ab)} @ ${esc(R.t[b.a].ab)} · ${b.sc[1]}-${b.sc[0]}${b.ot?' (OT)':''}</h2>`+boxHTML(b.a,b.b,b.sc,b.pl,b.ot))}
// ---------- roster ----------
function rosterUI(){PAGE='roster';const rot=rotation(0),all=teamPl(0).slice().sort((a,b)=>{const ia=rot.indexOf(a),ib=rot.indexOf(b);return(ia<0?99:ia)-(ib<0?99:ib)});
 const rows=all.map((p,i)=>`<tr class="${i<5?'st':''}"><td>${i<5?'Starter':i<10?'Bench':'Reserve'}</td><td class="mv">${p.inj?'':`${B(`rotMove(${p.id},-1)`,'&#9650;','xs')}${B(`rotMove(${p.id},1)`,'&#9660;','xs')}`}</td><td>${plink(p)}${p.inj?` <span class="inj">hurt ${p.inj}g</span>`:''}</td><td>${p.pos}</td><td>${p.age}</td><td>${htTxt(p.ht)}</td><td>${ovrPill(ovr(p))}</td><td>${pot(p)}</td><td>${money(p.sal)}</td><td>${p.exp}</td><td>${f1(pg(p,'pts'))}</td><td>${f1(pg(p,'orb')+pg(p,'drb'))}</td><td>${f1(pg(p,'ast'))}</td></tr>`).join('');
 shell(`<div class="head"><h1>Roster</h1><p>${teamPl(0).length} players · Payroll ${money(payroll(0))} of a ${money(CAP)} cap · ${R.pts} training points. The first five are your starters; the next five get most of the bench minutes.</p><div class="row">${B('rotAuto()','Auto-set the lineup')}</div></div>
 <div class="card"><div class="tw"><table class="t"><tr><th></th><th></th><th>Name</th><th>Pos</th><th>Age</th><th>Ht</th><th>Ovr</th><th>Pot</th><th>Salary</th><th>Thru season</th><th>PPG</th><th>RPG</th><th>APG</th></tr>${rows}</table></div></div>`)}
function rotMove(id,d){const ids=rotation(0).map(p=>p.id),i=ids.indexOf(id),j=i+d;if(i<0||j<0||j>=ids.length)return;[ids[i],ids[j]]=[ids[j],ids[i]];R.rot[0]=ids;hSave();rosterUI()}
function rotAuto(){R.rot[0]=null;hSave();rosterUI()}
// ---------- players ----------
function playerUI(id){const p=R.pl.find(q=>q.id===id);if(!p)return;const mine=p.tid===0;
 const grp=Object.keys(HG).map(gk=>{const [gn,ks]=HG[gk];const room=hRoom(p,gk);return`<div class="grp"><div class="gh"><b>${gn}</b>${mine&&!R.stage?B(`trainUI(${p.id},'${gk}')`,room?`Train (1 pt)`:'Maxed','xs '+(room&&R.pts?'':'off')):''}</div>
  ${ks.map(k=>`<div class="rt" title="${esc(HD[k])}"><span>${HN[k]}</span><i><em style="width:${p.sk[k]}%"></em><u style="left:${p.mx[k]}%"></u></i><b>${p.sk[k]}</b></div>`).join('')}</div>`}).join('');
 const car=p.car.filter(c=>c[1]>=0||c[2+SI.gp]).map(c=>{const g=c[2+SI.gp]||1,v=k=>f1(c[2+SI[k]]/g);return`<tr><td>${c[0]}</td><td>${c[1]>=0?esc(R.t[c[1]].ab):'-'}</td><td>${c[2+SI.gp]}</td><td>${v('pts')}</td><td>${f1((c[2+SI.orb]+c[2+SI.drb])/g)}</td><td>${v('ast')}</td><td>${pct(c[2+SI.fgm],c[2+SI.fga])}</td></tr>`}).join('');
 const cur=p.ss[SI.gp]?`<tr><td>${R.season}</td><td>${p.tid>=0?esc(R.t[p.tid].ab):'-'}</td><td>${p.ss[SI.gp]}</td><td>${f1(pg(p,'pts'))}</td><td>${f1(pg(p,'orb')+pg(p,'drb'))}</td><td>${f1(pg(p,'ast'))}</td><td>${pct(p.ss[SI.fgm],p.ss[SI.fga])}</td></tr>`:'';
 modal(`<div class="ph"><div><h2>${esc(p.n)} <small>#${p.num}</small></h2><p>${POSN[p.pos]} · ${p.age} years · ${htTxt(p.ht)}, ${p.wt} lb · ${p.tid>=0?tlink(p.tid):p.tid==-2?'Draft prospect':'Free agent'} · ${money(p.sal)} a year through season ${p.exp}</p></div><div class="ov">${ovrPill(ovr(p))}<small>potential ${pot(p)}</small></div></div>
 ${p.aw.length?`<p class="aw">${p.aw.map(esc).join(' · ')}</p>`:''}<p class="small">Bars show each rating; the tick mark is how high it can grow. ${mine?`Training costs 1 point (you have <b>${R.pts}</b>; win games to earn more) and gives random boosts inside that group.`:''}</p>
 <div class="grps">${grp}</div><h3>Stats</h3><table class="t"><tr><th>Season</th><th>Team</th><th>G</th><th>PTS</th><th>REB</th><th>AST</th><th>FG%</th></tr>${car}${cur}</table>
 ${mine&&!R.stage&&teamPl(0).length>10?B(`releaseUI(${p.id})`,'Release him','danger'):''}`)}
function trainUI(id,gk){const p=R.pl.find(q=>q.id===id);if(!p||R.pts<1||!hRoom(p,gk))return;R.pts--;const before=ovr(p),got=hUp(p,gk,3);hSave();playerUI(id);toast(`${p.ln}: ${gotTxt(got)||'no change'}${ovr(p)>before?` · overall ${ovr(p)}`:''}`)}
function releaseUI(id){const p=R.pl.find(q=>q.id===id);if(!p)return;if(!confirm(`Release ${p.n}? You still pay his salary this season.`))return;p.tid=-1;p.exp=R.season;R.rot[0]=null;addNews(`You released ${p.n}.`,1);hSave();closeModal();rosterUI()}
function teamUI(t){const pl=rotation(t);modal(`<h2>${esc(R.t[t].n)}</h2><p>${rec(t)} · Team ${ovrPill(teamOvr(t))} · Payroll ${money(payroll(t))}</p><table class="t"><tr><th>Name</th><th>Pos</th><th>Age</th><th>Ovr</th><th>PPG</th><th>RPG</th><th>APG</th></tr>${pl.map((p,i)=>`<tr class="${i<5?'st':''}"><td>${plink(p)}</td><td>${p.pos}</td><td>${p.age}</td><td>${ovrPill(ovr(p))}</td><td>${f1(pg(p,'pts'))}</td><td>${f1(pg(p,'orb')+pg(p,'drb'))}</td><td>${f1(pg(p,'ast'))}</td></tr>`).join('')}</table>`)}
// ---------- schedule, standings, leaders ----------
function schedUI(){PAGE='sched';const rows=R.sched.map((d,i)=>{const g=d.find(x=>x[0]===0||x[1]===0);if(!g)return'';const o=g[0]===0?g[1]:g[0],bi=R.box.findIndex(b=>b.s===R.season&&b.d===i&&b.po==null);let r='';if(bi>=0){const b=R.box[bi],m=b.a===0?0:1,w=b.sc[m]>b.sc[1-m];r=`<a href="#" onclick="boxUI(${bi});return false" class="${w?'w':'l'}">${w?'W':'L'} ${b.sc[m]}-${b.sc[1-m]}</a>`}else if(i<R.day)r='-';
  return`<tr class="${i==R.day&&!R.po?'next':''}"><td>${i+1}</td><td>${g[0]===0?'vs':'@'} ${tlink(o)}</td><td>${rec(o)}</td><td>${r}</td></tr>`}).join('');
 shell(`<div class="head"><h1>Schedule</h1><p>Season ${R.season} · ${R.sched.length} games</p></div><div class="card"><table class="t"><tr><th>#</th><th>Opponent</th><th>Record</th><th>Result</th></tr>${rows}</table></div>`)}
function standUI(){PAGE='stand';const tb=c=>{const s=seeds(c),lead=R.t[s[0]];return`<div class="card"><h3>${['East','West'][c]}</h3><table class="t"><tr><th></th><th>Team</th><th>W</th><th>L</th><th>Pct</th><th>GB</th><th>Pts</th><th>Opp</th><th>Strk</th></tr>${s.map((t,i)=>{const T=R.t[t],gp=Math.max(1,T.w+T.l);return`<tr class="${t===0?'me':''} ${i==7?'cut':''}"><td>${i+1}</td><td>${tlink(t)}</td><td>${T.w}</td><td>${T.l}</td><td>${(T.w/gp).toFixed(3).replace(/^0/,'')}</td><td>${i?((lead.w-T.w+T.l-lead.l)/2).toFixed(1):'-'}</td><td>${f1(T.pf/gp)}</td><td>${f1(T.pa/gp)}</td><td>${T.strk>0?'W'+T.strk:T.strk<0?'L'+(-T.strk):'-'}</td></tr>`}).join('')}</table></div>`};
 shell(`<div class="head"><h1>Standings</h1><p>The top 8 in each conference make the playoffs.</p></div><div class="cols">${tb(0)}${tb(1)}</div>`)}
function leadUI(){PAGE='lead';const min=Math.max(1,Math.floor(R.day*.5)),el=R.pl.filter(p=>p.tid>=0&&p.ss[SI.gp]>=min);
 const L=(n,f,fmt)=>`<div class="card"><h3>${n}</h3><table class="t">${el.slice().sort((a,b)=>f(b)-f(a)).slice(0,10).map((p,i)=>`<tr class="${p.tid===0?'me':''}"><td>${i+1}</td><td>${plink(p)}</td><td>${esc(R.t[p.tid].ab)}</td><td><b>${(fmt||f1)(f(p))}</b></td></tr>`).join('')}</table></div>`;
 const fg=k=>p=>p.ss[SI[k+'a']]>=(k=='tp'?min*1.5:min*3)?p.ss[SI[k+'m']]/p.ss[SI[k+'a']]:0,pc=v=>(v*100).toFixed(1)+'%';
 shell(`<div class="head"><h1>League leaders</h1><p>Per game. Players need ${min}+ games.</p></div><div class="grid3">${L('Points',p=>pg(p,'pts'))}${L('Rebounds',p=>pg(p,'orb')+pg(p,'drb'))}${L('Assists',p=>pg(p,'ast'))}${L('Steals',p=>pg(p,'stl'))}${L('Blocks',p=>pg(p,'blk'))}${L('Field goal %',fg('fg'),pc)}${L('Three-point %',fg('tp'),pc)}${L('Free throw %',fg('ft'),pc)}${L('Three-pointers made',p=>pg(p,'tpm'))}</div>`)}
// ---------- playoffs ----------
function poUI(){PAGE='po';if(!R.po){const h=R.hist[R.hist.length-1];shell(`<div class="head"><h1>Playoffs</h1><p>${h?`Last champion: ${esc(R.t[h.champ].n)}`:'The playoffs start after the regular season.'}</p></div>`);return}
 const P=R.po,ser=P.ser.map(s=>`<div class="ser ${serDone(s)?'done':''} ${s.a===0||s.b===0?'me':''}"><span>${esc(R.t[s.a].ab)} <b>${s.w[0]}</b></span><span>${esc(R.t[s.b].ab)} <b>${s.w[1]}</b></span></div>`).join('');
 shell(`<div class="head"><h1>Playoffs</h1><p>${P.champ!=null?`Champions: <b>${esc(R.t[P.champ].n)}</b>`:`${RDN[P.rd]} · best of ${P.best}`}</p></div><div class="card"><div class="bracket">${ser}</div></div>`)}
// ---------- the offseason ----------
function offUI(){PAGE='off';if(R.stage=='draft')return draftUI();if(R.stage=='resign')return resignUI();if(R.stage=='fa')return faUI();homeUI()}
function draftUI(){const D=R.dr;if(!D){R.stage='resign';return resignUI()}const pk=D.picks[D.i],mine=pk&&pk.t===0,my=D.picks.map((x,i)=>x.t===0&&i>=D.i?`#${x.no} (round ${x.rd})`:'').filter(Boolean);
 const av=R.pl.filter(p=>p.tid===-2).sort((a,b)=>(pot(b)*.6+ovr(b)*.4)-(pot(a)*.6+ovr(a)*.4)).slice(0,40);
 const done=D.picks.slice(0,D.i).slice(-8).reverse().map((x,i)=>{const p=R.pl.find(q=>q.draft&&q.draft.s===R.season&&q.draft.no===x.no&&q.draft.rd===x.rd);return p?`<li>${x.rd}-${x.no} ${esc(R.t[x.t].ab)}: ${esc(p.n)} (${p.pos})</li>`:''}).join('');
 shell(`<div class="head"><h1>The draft</h1><p>${pk?`Pick ${pk.no} of round ${pk.rd}: ${esc(R.t[pk.t].n)}${mine?' — <b>your pick!</b>':''}`:'The draft is over.'} Your picks: ${my.join(', ')||'none left'}.</p>
 <div class="row">${mine?'':B('cpuDraftUntilUser();draftUI()','Go to my next pick','big')}${B('autoDraft()','Auto-draft for me')}</div></div>
 <div class="cols"><div class="card"><h3>Best available</h3><p class="small">Potential is a scout's guess.</p><table class="t"><tr><th>Name</th><th>Pos</th><th>Age</th><th>Ht</th><th>Ovr</th><th>Pot</th><th></th></tr>${av.map(p=>`<tr><td>${plink(p)}</td><td>${p.pos}</td><td>${p.age}</td><td>${htTxt(p.ht)}</td><td>${ovrPill(ovr(p))}</td><td>${pot(p)-2+(p.id%5)}</td><td>${mine?B(`draftPick(0,${p.id});cpuDraftUntilUser();draftUI()`,'Draft','xs'):''}</td></tr>`).join('')}</table></div>
 <div class="card"><h3>Latest picks</h3><ul class="news">${done||'<li>No picks yet.</li>'}</ul></div></div>`);if(!R.dr||R.stage!='draft')setTimeout(()=>offUI(),0)}
function autoDraft(){while(R.dr&&R.dr.i<R.dr.picks.length){const pk=R.dr.picks[R.dr.i];if(pk.t===0){const av=R.pl.filter(p=>p.tid===-2).sort((a,b)=>(pot(b)*.6+ovr(b)*.4)-(pot(a)*.6+ovr(a)*.4));if(!av.length)break;draftPick(0,av[0].id)}else{cpuDraftUntilUser()}}draftEnd();hSave();offUI()}
function resignUI(){const ex=teamPl(0).filter(p=>p.exp<=R.season);
 shell(`<div class="head"><h1>Re-sign players</h1><p>These contracts are ending. Keep the players you want; the rest become free agents. Payroll next season ${money(teamPl(0).filter(p=>p.exp>R.season||p.keep).reduce((a,p)=>a+p.sal,0))} of ${money(CAP)} (you may go over the cap to keep your own players).</p><div class="row">${B('resignDone();hSave();offUI()','Done: on to free agency','big')}</div></div>
 <div class="card"><table class="t"><tr><th>Name</th><th>Pos</th><th>Age</th><th>Ovr</th><th>Asks</th><th></th></tr>${ex.map(p=>`<tr><td>${plink(p)}</td><td>${p.pos}</td><td>${p.age}</td><td>${ovrPill(ovr(p))}</td><td>${money(askFor(p))}/yr</td><td>${p.keep?`<b>Kept</b> ${B(`unkeep(${p.id})`,'Undo','xs')}`:[1,2,3,4].map(y=>B(`keep(${p.id},${y})`,y+' yr','xs')).join('')}</td></tr>`).join('')||'<tr><td>No contracts are ending.</td></tr>'}</table></div>`)}
function keep(id,y){const p=R.pl.find(q=>q.id===id);p.keep=1;p.sal=askFor(p);p.exp=R.season+y;hSave();resignUI()}
function unkeep(id){const p=R.pl.find(q=>q.id===id);p.keep=0;p.exp=R.season;hSave();resignUI()}
function faUI(){PAGE='fa';const off=R.stage=='fa',room=CAP-payroll(0),n=teamPl(0).length;const fa=R.pl.filter(p=>p.tid===-1).sort((a,b)=>ovr(b)-ovr(a)).slice(0,60);
 shell(`<div class="head"><h1>Free agents</h1><p>${off?`Day ${R.fa.day} of 30. Other teams sign players each day. `:''}Cap room ${money(room)} · ${n}/15 players. Anyone can be signed for the minimum (${money(MINSAL)}); bigger contracts need cap room.</p>${off?`<div class="row">${B('faDay(1);hSave();faUI()','Next day')}${B('faFinish()','Finish free agency and start the next season','big')}</div>`:''}</div>
 <div class="card"><table class="t"><tr><th>Name</th><th>Pos</th><th>Age</th><th>Ovr</th><th>Pot</th><th>Asks</th><th></th></tr>${fa.map(p=>{const a=askFor(p),ok=n<15&&(a<=room||a<=MINSAL+.5);return`<tr><td>${plink(p)}</td><td>${p.pos}</td><td>${p.age}</td><td>${ovrPill(ovr(p))}</td><td>${pot(p)}</td><td>${money(a)}</td><td>${ok?B(`signFA(${p.id})`,'Sign','xs'):'<small>no room</small>'}</td></tr>`}).join('')}</table></div>`)}
function signFA(id){const p=R.pl.find(q=>q.id===id);if(!p||p.tid!==-1)return;const a=askFor(p);if(teamPl(0).length>=15)return toast('Your roster is full (15).');if(a>CAP-payroll(0)&&a>MINSAL+.5)return toast('Not enough cap room.');p.tid=0;p.sal=a;p.exp=R.season+(R.stage=='fa'?2:1);R.rot[0]=null;addNews(`You signed ${p.n}.`,1);hSave();faUI()}
function faFinish(){faDay(30);newSeason();homeUI()}
// ---------- trades ----------
let TR={t:1,give:[],get:[]};
function tradeUI(){PAGE='trade';if(R.stage&&R.stage!='fa'){shell('<div class="head"><h1>Trade</h1><p>Trades open again after the draft and re-signing.</p></div>');return}
 const t=TR.t,mine=teamPl(0).sort((a,b)=>ovr(b)-ovr(a)),theirs=teamPl(t).sort((a,b)=>ovr(b)-ovr(a));const g=TR.give.map(id=>R.pl.find(p=>p.id===id)).filter(p=>p&&p.tid===0),h=TR.get.map(id=>R.pl.find(p=>p.id===id)).filter(p=>p&&p.tid===t);
 const row=(p,arr,on)=>`<tr class="click ${on?'sel':''}" onclick="trTog('${arr}',${p.id})"><td>${on?'&#10003;':''}</td><td>${esc(p.n)}</td><td>${p.pos}</td><td>${p.age}</td><td>${ovrPill(ovr(p))}</td><td>${money(p.sal)}</td></tr>`;
 const res=g.length&&h.length?tradeOK(t,g,h):null;
 shell(`<div class="head"><h1>Trade</h1><p>Pick players on both sides. The other team says yes if what it gets is worth a bit more than what it gives up.</p><label>Trade with <select onchange="TR={t:+this.value,give:TR.give,get:[]};tradeUI()">${R.t.map((x,i)=>i?`<option value="${i}" ${i==t?'selected':''}>${esc(x.n)} (${rec(i)})</option>`:'').join('')}</select></label></div>
 <div class="cols"><div class="card"><h3>You give</h3><table class="t">${mine.map(p=>row(p,'give',g.includes(p))).join('')}</table></div><div class="card"><h3>You get</h3><table class="t">${theirs.map(p=>row(p,'get',h.includes(p))).join('')}</table></div></div>
 <div class="card"><p>${res===true?'<b class="w">They would accept.</b>':res?esc(res):'Pick at least one player on each side.'}</p>${res===true?B('doTrade()','Make the trade','big'):''}</div>`)}
function trTog(a,id){const L=TR[a],i=L.indexOf(id);i<0?L.push(id):L.splice(i,1);tradeUI()}
function doTrade(){const t=TR.t,g=TR.give.map(id=>R.pl.find(p=>p.id===id)),h=TR.get.map(id=>R.pl.find(p=>p.id===id));if(tradeOK(t,g,h)!==true)return;g.forEach(p=>p.tid=t);h.forEach(p=>p.tid=0);R.rot[0]=null;R.rot[t]=null;addNews(`Trade: ${g.map(p=>p.n).join(', ')} to ${R.t[t].n} for ${h.map(p=>p.n).join(', ')}.`,1);TR={t,give:[],get:[]};hSave();toast('Trade done!');tradeUI()}
// the CPU sometimes offers a trade
function cpuOffer(){if(!feat('trades')||R.stage||R.po||R.offer||rnd()>.12)return;const t=ri(1,29),mine=teamPl(0).filter(p=>!p.inj).sort((a,b)=>ovr(b)-ovr(a)).slice(2,10),w=pick(mine);if(!w)return;
 const c=teamPl(t).filter(p=>Math.abs(pval(p)-pval(w)*.95)<pval(w)*.25&&p.pos!==w.pos).sort((a,b)=>pval(b)-pval(a))[0];if(!c||tradeOK(t,[w],[c])!==true)return;R.offer={t,give:w.id,get:c.id}}
function offerCard(){const o=R.offer;if(!o)return'';const w=R.pl.find(p=>p.id===o.give),c=R.pl.find(p=>p.id===o.get);if(!w||!c||w.tid!==0||c.tid!==o.t){R.offer=null;return''}
 return`<div class="card offer"><h3>Trade offer from ${tlink(o.t)}</h3><p>They want ${plink(w)} (${w.pos}, ${ovr(w)}) and would give you ${plink(c)} (${c.pos}, ${ovr(c)}, age ${c.age}, ${money(c.sal)}).</p><div class="row">${B('offerYes()','Accept')}${B('R.offer=null;hSave();homeUI()','Decline')}</div></div>`}
function offerYes(){const o=R.offer;const w=R.pl.find(p=>p.id===o.give),c=R.pl.find(p=>p.id===o.get);w.tid=o.t;c.tid=0;R.rot[0]=null;addNews(`Trade: ${w.n} to ${R.t[o.t].n} for ${c.n}.`,1);R.offer=null;hSave();homeUI()}
// ---------- history ----------
function histUI(){PAGE='hist';const nm=id=>{const p=R.pl.find(q=>q.id===id);return p?plink(p):'(retired)'};
 shell(`<div class="head"><h1>History</h1></div><div class="card"><table class="t"><tr><th>Season</th><th>Champion</th><th>MVP</th><th>Defense</th><th>Rookie</th><th>Sixth man</th><th>Your record</th></tr>${R.hist.slice().reverse().map(h=>`<tr><td>${h.s}</td><td>${h.champ!=null?esc(R.t[h.champ].n):'-'}</td><td>${nm(h.mvp)}</td><td>${nm(h.dpoy)}</td><td>${nm(h.roy)}</td><td>${nm(h.six)}</td><td>${h.rec[0].join('-')}</td></tr>`).join('')||'<tr><td>Finish a season first.</td></tr>'}</table></div>`)}
// ---------- features, settings, controls ----------
function featUI(){PAGE='feat';const gs=[...new Set(HFEATS.map(f=>f[0]))];
 shell(`<div class="head"><h1>Game features</h1><p>Turn any feature on or off.</p><div class="row">${B('featAll(1)','All on')}${B('featAll(0)','All off')}</div></div>${gs.map(g=>`<div class="card"><h3>${g}</h3>${HFEATS.filter(f=>f[0]==g).map(([_,k,n,d])=>`<label class="ft"><input type="checkbox" ${feat(k)?'checked':''} onchange="OPT['${k}']=this.checked?1:0;optSave()"><span><b>${n}</b><small>${esc(d)}</small></span></label>`).join('')}</div>`).join('')}`)}
function featAll(v){HFEATS.forEach(f=>OPT[f[1]]=v);optSave();featUI()}
function setUI(){PAGE='set';shell(`<div class="head"><h1>Settings</h1></div><div class="card">
 <label>Difficulty <select onchange="R.diff=+this.value;hSave()">${DIFFN.map((d,i)=>`<option value="${i}" ${R.diff==i?'selected':''}>${d}</option>`).join('')}</select></label><p class="small">Difficulty only changes how smart the other team plays.</p>
 <label>Quarter length <select onchange="R.qlen=+this.value;hSave()">${[2,3,4,6,8,12].map(q=>`<option value="${q}" ${R.qlen==q?'selected':''}>${q} minutes</option>`).join('')}</select></label>
 <label>Playoff series <select onchange="R.poBest=+this.value;hSave()">${[3,5,7].map(q=>`<option value="${q}" ${(R.poBest||5)==q?'selected':''}>Best of ${q}</option>`).join('')}</select></label><p class="small">Takes effect next playoffs.</p>
 <label class="ft"><input type="checkbox" ${R.autoSub!==false?'checked':''} onchange="R.autoSub=this.checked;hSave()"><span><b>Automatic substitutions</b><small>Tired players and players in foul trouble come out on their own.</small></span></label></div>
 <div class="card"><h3>League</h3><p class="small">Saved automatically in this browser (separate from the football game).</p><div class="row">${B('exportSave()','Download a backup')}${B("$('imp').click()",'Load a backup')}${B('resetUI()','Start a new league','danger')}</div><input type="file" id="imp" accept=".json" hidden onchange="importSave(this)"></div>`)}
function exportSave(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(R)],{type:'application/json'}));a.download=`hardwood-lab-season${R.season}.json`;a.click()}
function importSave(inp){const f=inp.files[0];if(!f)return;f.text().then(t=>{try{const r=JSON.parse(t);if(!r.t||!r.pl)throw 0;R=r;hSave();toast('Backup loaded');homeUI()}catch(e){toast('That file is not a Hardwood Lab backup.')}})}
function resetUI(){if(!confirm('Start a new league? This league will be deleted (download a backup first if you want to keep it).'))return;lsDel(HKEY);R=null;startUI()}
function keysHTML(){const r=(a,b)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`;return`<div class="cols"><table class="t"><tr><th colspan="2">Offense</th></tr>${r('Move','W A S D or arrows')}${r('Shoot (hold, let go at the top of the meter)','Space')}${r('Layup / dunk (near the rim)','Space')}${r('Pass to the best open man','E')}${r('Pass to a position (1 PG ... 5 C)','1-5, or click him')}${r('Lob / alley-oop','Q')}${r('Crossover','R')}${r('Call a screen','F')}${r('Sprint','Shift')}</table>
 <table class="t"><tr><th colspan="2">Defense</th></tr>${r('Move','W A S D or arrows')}${r('Jump / contest / block','Space')}${r('Steal','E')}${r('Switch player','Tab or Q, or click him')}${r('Sprint','Shift')}${r('Pause','P or Esc')}</table></div>`}
function keysUI(){PAGE='keys';shell(`<div class="head"><h1>Controls</h1><p>Made for a laptop keyboard.</p></div><div class="card">${keysHTML()}</div>`)}
// ---------- input ----------
const GAMEKEYS=new Set(['Space','Tab','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
addEventListener('keydown',e=>{if(!G||$('gamewrap').hidden)return;if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(GAMEKEYS.has(e.code))e.preventDefault();if(!$('modal').hidden&&e.code!='Escape')return;
 if(e.code=='Escape'&&!$('modal').hidden&&G.phase!='over'){closeModal();G.paused=false;return}
 KEYS[e.code]=1;if(!e.repeat){if(e.code=='Escape'){gameMenu();return}hKey(e.code,true)}});
addEventListener('keyup',e=>{KEYS[e.code]=0;if(G&&!$('gamewrap').hidden)hKey(e.code,false)});
addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=0});
addEventListener('resize',()=>{if(G)hResize()});
function hInit(){$('cv').addEventListener('mousedown',e=>{const r=$('cv').getBoundingClientRect(),x=(e.clientX-r.left-OX)/S,y=(e.clientY-r.top-OY)/(S*KY);hClick(x,y)});
 if(hLoad()&&R&&R.t)homeUI();else startUI()}
