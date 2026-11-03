'use strict';
// Ideas from deep retro sports sims: player traits, a league editor, a college mode (recruit high-school players,
// four-year players, a March tournament, players leaving for the pros) and a career that can start in college.
{const add=[['Franchise','traits','Player traits','Players earn traits like Sharpshooter, Lockdown or Rim protector from their ratings. Traits change how they play, in played and simmed games.'],
 ['Franchise','editor','League editor','Edit any team (name, short name, colors, conference) and any player (name, position, number, age, height, ratings).'],
 ['Franchise','recruit','Recruiting (college mode)','You recruit high-school players yourself. Off: your assistants recruit for you.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
// ---------- player traits ----------
const TRAITS={sharp:['🎯','Sharpshooter','Hits more of his threes.',p=>p.sk.thr>=78,{thr:5,mid:2}],
 midr:['📏','Mid-range maestro','Deadly from mid-range.',p=>p.sk.mid>=80,{mid:5}],
 slash:['⚡','Slasher','Finishes at the rim through traffic.',p=>p.sk.lay>=78&&p.sk.spd>=70,{lay:5}],
 poster:['💥','Posterizer','Dunks on anybody.',p=>p.sk.dnk>=80,{dnk:6}],
 post:['🏋️','Post scorer','Scores with his back to the basket.',p=>p.sk.post>=78,{post:6}],
 gen:['🧠','Floor general','Finds the open man.',p=>p.sk.pas>=78&&p.sk.vis>=74,{pas:6,vis:4}],
 lock:['🔒','Lockdown','Shuts down shooters he guards.',p=>p.sk.pd>=78,{pd:6}],
 rim:['🛡️','Rim protector','Blocks and changes shots at the rim.',p=>p.sk.blk>=76&&p.sk.id>=70,{blk:6,id:4}],
 glass:['🧲','Glass cleaner','Owns the boards.',p=>p.sk.drb+p.sk.orb>=146,{drb:6,orb:5}],
 pick:['🖐️','Pickpocket','Gets more steals.',p=>p.sk.stl>=78,{stl:6}],
 iron:['🔋','Iron man','Hardly gets tired.',p=>p.sk.sta>=84,{sta:8}],
 clutch:['❄️','Clutch','Better in the last two minutes of a close game.',p=>ovr(p)>=64&&(p.id*7919)%13===0,{}]};
function traitsOf(p){if(!feat('traits')||!p||!p.sk)return[];return Object.keys(TRAITS).filter(k=>TRAITS[k][3](p)).slice(0,3)}
const hasT=(p,k)=>feat('traits')&&p&&p.sk&&TRAITS[k][3](p);
function traitChips(p,big){const L=traitsOf(p);if(!L.length)return'';return L.map(k=>`<span class="trt" title="${esc(TRAITS[k][1]+': '+TRAITS[k][2])}">${TRAITS[k][0]}${big?' '+esc(TRAITS[k][1]):''}</span>`).join('')}
// simmed games: a trait counts as a small ratings boost for that game only
{const _sg=simGame;simGame=function(a,b,opt){if(!feat('traits'))return _sg(a,b,opt);const ch=[];[a,b].forEach(t=>rotation(t).slice(0,10).forEach(p=>{traitsOf(p).forEach(k=>{const bo=TRAITS[k][4];for(const s in bo){const v=Math.min(99,p.sk[s]+bo[s]);ch.push([p,s,v-p.sk[s]]);p.sk[s]=v}})}));
  try{return _sg(a,b,opt)}finally{ch.forEach(([p,s,d])=>p.sk[s]-=d)}}}
// played games
{const _sa=shotAdj;shotAdj=function(e,typ,info){let a=_sa(e,typ,info);if(!feat('traits')||!e||!e.p)return a;const p=e.p;
  if(typ=='three'&&hasT(p,'sharp'))a+=.035;if((typ=='mid'||typ=='close')&&hasT(p,'midr'))a+=.03;if(typ=='rim'&&hasT(p,'slash'))a+=.03;if(typ=='dunk'&&hasT(p,'poster'))a+=.03;if(typ=='close'&&hasT(p,'post'))a+=.02;
  if(hasT(p,'clutch')&&G&&G.q>=4&&G.clk<120&&Math.abs(G.sc[0]-G.sc[1])<=6)a+=.04;return a}}
{const _mp=makeProb;makeProb=function(e,info,q){const r=_mp(e,info,q);if(!feat('traits'))return r;const D=r.cdE,cd=r.cd;if(D&&D.p){if((r.typ=='three'||r.typ=='mid')&&cd<5&&hasT(D.p,'lock'))r.p-=.03;if((r.typ=='rim'||r.typ=='close'||r.typ=='dunk')&&cd<6&&hasT(D.p,'rim'))r.p-=.035}r.p=clamp(r.p,.03,.97);return r}}
{const _stl=stealTry;stealTry=function(d){if(feat('traits')&&d&&d.p&&hasT(d.p,'pick')){d.p.sk.stl+=8;try{return _stl(d)}finally{d.p.sk.stl-=8}}return _stl(d)}}
{const _st=hStep;hStep=function(dt){_st(dt);if(!G||!G.ent||!feat('traits')||!feat('fatigue'))return;G.ent.forEach(e=>{if(G.st[e.p.id]!=null&&hasT(e.p,'iron'))G.st[e.p.id]=Math.min(100,G.st[e.p.id]+dt*.25)})}}
// show them on the roster and the player page
{const _ru=rosterUI;rosterUI=function(){_ru();if(!feat('traits'))return;try{document.querySelectorAll('#mainpg table.t a[onclick^="playerUI("]').forEach(a=>{const id=+a.getAttribute('onclick').match(/\d+/)[0],p=R.pl.find(q=>q.id===id);if(p)a.insertAdjacentHTML('afterend',' '+traitChips(p))})}catch(e){}}}
{const _pu=playerUI;playerUI=function(id){_pu(id);if(!feat('traits'))return;try{const p=R.pl.find(q=>q.id===id),c=traitChips(p,true),h=$('modal').querySelector('.ph')||$('modal').querySelector('h2');if(p&&h)h.insertAdjacentHTML('afterend',`<p class="trts">${c||'<span class="small">No traits yet: they come with high ratings.</span>'}</p>`)}catch(e){}}}
// ---------- the league editor ----------
let EDT=0;
function editUI(t){if(t!=null)EDT=t;PAGE='edit';const T=R.t[EDT];if(!T)return;const col=COLLEGE();
 const L=teamPl(EDT).sort((a,b)=>POS.indexOf(a.pos)-POS.indexOf(b.pos)||ovr(b)-ovr(a));
 shell(`<div class="head"><h1>League editor</h1><p>Change any team or player. Changes are saved right away.</p><label>Team <select onchange="editUI(+this.value)">${R.t.map((x,i)=>`<option value="${i}" ${i==EDT?'selected':''}>${esc(x.n)}${i===0?' (you)':''}</option>`).join('')}</select></label></div>
 <div class="card"><h3>Team</h3><div class="row"><label>Name <input value="${esc(T.n)}" maxlength="32" onchange="edTeam('n',this.value)"></label><label>Short name <input value="${esc(T.ab)}" maxlength="4" size="5" onchange="edTeam('ab',this.value.toUpperCase())"></label>
 <label>Main color <input type="color" value="${T.col[0]}" onchange="edTeam('c0',this.value)"></label><label>Second color <input type="color" value="${T.col[1]}" onchange="edTeam('c1',this.value)"></label>
 <label>Conference <select onchange="edTeam('conf',+this.value)">${CONFN().map((n,i)=>`<option value="${i}" ${T.conf==i?'selected':''}>${n}</option>`).join('')}</select></label>${col?`<label>Prestige <select onchange="edTeam('pres',+this.value)">${[1,2,3,4,5].map(n=>`<option value="${n}" ${(T.pres||3)==n?'selected':''}>${'★'.repeat(n)}</option>`).join('')}</select></label>`:''}</div></div>
 <div class="card"><h3>Players</h3><div class="tw"><table class="t"><tr><th>Name</th><th>Pos</th><th>No.</th><th>Age</th><th>Height (in)</th><th>Ovr</th><th>Pot</th><th></th></tr>${L.map(p=>`<tr><td><input value="${esc(p.fn)}" size="8" maxlength="14" onchange="edPl(${p.id},'fn',this.value)"> <input value="${esc(p.ln)}" size="9" maxlength="16" onchange="edPl(${p.id},'ln',this.value)"></td>
  <td><select onchange="edPl(${p.id},'pos',this.value)">${POS.map(x=>`<option ${p.pos==x?'selected':''}>${x}</option>`).join('')}</select></td><td><input type="number" min="0" max="99" value="${p.num}" style="width:52px" onchange="edPl(${p.id},'num',+this.value)"></td>
  <td><input type="number" min="16" max="45" value="${p.age}" style="width:52px" onchange="edPl(${p.id},'age',+this.value)"></td><td><input type="number" min="66" max="92" value="${p.ht}" style="width:56px" onchange="edPl(${p.id},'ht',+this.value)"></td><td>${ovrPill(ovr(p))}</td><td>${pot(p)}</td>
  <td>${B(`edRatings(${p.id})`,'Ratings','xs')} ${B(`edDrop(${p.id})`,col?'Remove':'Release','xs')}</td></tr>`).join('')}</table></div><div class="row">${B('edAdd()','Add a player')}</div></div>`)}
function edTeam(k,v){const T=R.t[EDT];if(k=='c0')T.col=[v,T.col[1]];else if(k=='c1')T.col=[T.col[0],v];else if(k=='n'){T.n=String(v).trim()||T.n}else T[k]=v;if(EDT===0&&k=='n')R.t[0].n=T.n;hSave();editUI()}
function edPl(id,k,v){const p=R.pl.find(q=>q.id===id);if(!p)return;if(k=='fn'||k=='ln'){p[k]=String(v).trim()||p[k];p.n=p.fn+' '+p.ln}else if(k=='num'){p.num=clamp(v|0,0,99)}else if(k=='age')p.age=clamp(v|0,16,45);else if(k=='ht')p.ht=clamp(v|0,66,92);else p[k]=v;hSave();editUI()}
function edRatings(id){const p=R.pl.find(q=>q.id===id);if(!p)return;modal(`<h2>${esc(p.n)}: ratings</h2><p class="small">Rating now, and his potential (the most it can grow to).</p><div class="grid3">${Object.keys(HG).map(g=>`<div class="card"><h3>${HG[g][0]}</h3>${HG[g][1].map(k=>`<label class="er">${HN[k]} <input type="number" min="25" max="99" value="${p.sk[k]}" onchange="edSk(${id},'${k}',+this.value,0)"> <small>pot</small> <input type="number" min="25" max="99" value="${p.mx[k]}" onchange="edSk(${id},'${k}',+this.value,1)"></label>`).join('')}</div>`).join('')}</div>${B('closeModal();editUI()','Done','big')}`)}
function edSk(id,k,v,isMax){const p=R.pl.find(q=>q.id===id);if(!p)return;v=clamp(v|0,25,99);if(isMax){p.mx[k]=Math.max(v,p.sk[k])}else{p.sk[k]=v;p.mx[k]=Math.max(p.mx[k],v)}hSave()}
function edAdd(){if(teamPl(EDT).length>=15)return toast('This team already has 15 players.');const p=mkPlayer(pick(POS),COLLEGE()?18:ri(21,28),COLLEGE()?46:55,COLLEGE()?18:8,EDT);if(COLLEGE()){p.yr=1;p.sal=0;p.exp=9999}else p.sal=MINSAL;R.pl.push(p);R.rot[EDT]=null;hSave();editUI()}
function edDrop(id){const p=R.pl.find(q=>q.id===id);if(!p)return;if(teamPl(p.tid).length<=8)return toast('A team needs at least 8 players.');if(COLLEGE()){R.pl=R.pl.filter(q=>q!==p)}else{p.tid=-1}R.rot[EDT]=null;hSave();editUI()}
NAV.push(['edit','League editor','editUI()']);
{const _ok=navOK;navOK=function(k){if(k=='edit')return feat('editor')&&!CAREER();if(k=='recr')return COLLEGE()&&!CAREER();return _ok(k)}}
{const g=NAVG.find(x=>x[0]=='Options');if(g&&!g[1].includes('edit'))g[1].unshift('edit')}
// ---------- college mode ----------
const COLLEGE=()=>OPT.mode==='college'||(typeof CAREER=='function'&&CAREER()&&!!(R&&R.col));
const CONFN=()=>COLLEGE()?['Coastal Conference','Mountain Conference']:['East','West'];
const YRN=['','Freshman','Sophomore','Junior','Senior'],YRS=['','FR','SO','JR','SR'],SCH=['State','University','Tech','College','A&M'];
{const _sk=slotKey;slotKey=function(n){return OPT.mode==='college'?'hoops_college':_sk(n)}}
function colSetup(){if(!COLLEGE())return;['trades','treq','playin','allstar','fin','owner','neg','scoutp'].forEach(k=>MODEOFF.add(k));RDN[0]='Sweet 16';RDN[1]='Elite Eight';RDN[2]='Final Four';RDN[3]='National championship'}
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
function colPlayer(t,yr,lvl,room){const p=mkPlayer(pick(POS),17+yr,lvl,room,t);p.yr=yr;p.sal=0;p.exp=9999;if(yr===1)p.rook=R.season;return p}
function colRoster(t,lvl){const plan=[1,1,1,2,2,2,3,3,3,4,4,4,1];plan.forEach(yr=>{const p=colPlayer(t,yr,lvl+(yr-2.5)*1.6+gauss()*2.2,ri(10,24));p.stars=clamp(Math.round((lvl-42)/3+gauss()*.8),1,5);R.pl.push(p)})}
function makeCollege(o){newLeague(o);R.col=1;R.poBest=1;const rnd5=()=>clamp(Math.round(1+rnd()*4.4),1,5);
 R.t.forEach((T,i)=>{const city=T.n.split(' ')[0],nick=T.n.split(' ').slice(1).join(' ');T.nick=nick;if(i||!o.name)T.n=`${city} ${pick(SCH)}`;T.pres=i?rnd5():3});if(o.name)R.t[0].n=o.name;
 R.pl=[];R.uid=0;R.t.forEach((T,t)=>colRoster(t,44+T.pres*2+gauss()*1.2));R.t.forEach((_,t)=>fixNums(t));R.rot={};R.sched=mkSchedule(R.slen);colSetup();hSave();return R}
// the start page
{const _su=startUI;startUI=function(){_su();try{const c=$('ui').querySelector('.start');if(!c)return;
  if(OPT.mode==='college'){c.querySelector('.card').outerHTML=collegeCreateHTML();return}
  if(!CAREER())c.insertAdjacentHTML('beforeend',`<div class="card"><h3>College mode</h3><p>Coach a college program: recruit high-school players, build a team that changes every year as players graduate or leave for the pros, and chase a national title in the March tournament. It has its own save.</p>${B("OPT.mode='college';optSave();location.reload()",'Start a college program')}</div>`)}catch(e){console.error(e)}}}
function collegeCreateHTML(){const col=TCOL.map((c,i)=>`<label class="sw"><input type="radio" name="col" value="${i}" ${i==0?'checked':''}><i style="background:${c[0]};border-color:${c[1]}"></i></label>`).join('');
 return`<div class="card"><h3>New college program</h3><label>School name <input id="nn" maxlength="28" value="${esc(pick(CITIES))} ${pick(SCH)}"></label><div class="row"><span>Colors</span><div class="sws">${col}</div></div>
 <label>Difficulty <select id="nd">${DIFFN.map((d,i)=>`<option value="${i}" ${i==1?'selected':''}>${d}</option>`).join('')}</select></label><label>Season length <select id="ns"><option value="20">20 games</option><option value="30" selected>30 games</option></select></label>
 <label>Quarter length <select id="nq">${[2,3,4,6,8].map(q=>`<option value="${q}" ${q==4?'selected':''}>${q} minutes</option>`).join('')}</select></label><p class="small">You start as a three-star program. Win and recruit well to become a five-star power.</p>
 ${B('collegeGo()','Start coaching','big')}<p class="small">${B("OPT.mode='franchise';optSave();location.reload()",'Back to the pro league','xs')}</p></div>`}
function collegeGo(){const ci=+(document.querySelector('input[name=col]:checked')||{value:0}).value;makeCollege({name:$('nn').value.trim()||'Hardwood State',slen:+$('ns').value,qlen:+$('nq').value,diff:+$('nd').value});R.t[0].col=TCOL[ci];R.t.forEach((t,i)=>{if(i&&t.col===TCOL[ci])t.col=TCOL[(ci+15)%TCOL.length]});
 addNews(`Welcome to ${R.t[0].n}! The program is ${stars(3)}. Recruiting starts after the season.`,1);hSave();homeUI()}
// keep pro-only parts out of college
{const _hl=hLoad;hLoad=function(){const r=_hl();if(r&&COLLEGE())colSetup();return r}}
{const _co=cpuOffer;cpuOffer=function(){if(COLLEGE())return;return _co()}}
{const _oj=ownerJudge;ownerJudge=function(){if(COLLEGE())return 60;return _oj()}}
{const _fg=finGame;finGame=function(a,b){if(COLLEGE())return;return _fg(a,b)}}
{const _cs=cpuSign;cpuSign=function(t){if(COLLEGE())return false;return _cs(t)}}
let COLNS=0;
{const _fm=fillMin;fillMin=function(t){if(!COLLEGE())return _fm(t);const p=colPlayer(t,1,40+gauss()*2,ri(6,16));if(COLNS){p.yr=0;p.age=17}p.stars=1;p.walk=1;R.pl.push(p);return true}}
// the end of the season: awards get college names, then players leave and recruiting starts
{const _se=seasonEnd;seasonEnd=function(){_se();if(!COLLEGE())return;const ren={'MVP':'Player of the Year','Rookie of the Year':'Freshman of the Year','Sixth Man of the Year':'Sixth Man of the Year','Champion':'National champion'};
  R.pl.forEach(p=>{p.aw=p.aw.map(a=>{for(const k in ren){if(a===`${R.season} ${k}`)return`${R.season} ${ren[k]}`}return a})});
  R.news.forEach(n=>{if(n.s===R.season)n.t=n.t.replace(/^MVP:/,'Player of the Year:').replace(/^Rookie of the Year:/,'Freshman of the Year:').replace(/ win the championship!$/,' win the national championship!')});
  R.pl=R.pl.filter(p=>p.tid!==-2);R.dr=null;R.dp=[];
  // prestige follows results
  R.t.forEach((T,t)=>{const w=wpct(t),poW=R.po&&R.po.champ===t?1.2:R.po&&R.po.seeds&&R.po.seeds.some(s=>s.includes(t))?.4:0,target=clamp(1+w*4+poW,1,5);T.pres=clamp(Math.round(T.pres*.6+target*.4),1,5)});
  R.stage='leave';colLeavers()}}
function colLeavers(){R.leave=[];R.pl.forEach(p=>{if(p.tid<0)return;const o=ovr(p);let why=null;if(p.yr>=4)why='grad';else if(o>=68&&rnd()<.85||o>=64&&p.yr>=2&&rnd()<.45||o>=61&&p.yr==3&&rnd()<.25)why='pro';if(why)R.leave.push({id:p.id,why,stay:0})})}
function leaveUI(){PAGE='off';const L=R.leave||[],mine=L.filter(x=>{const p=R.pl.find(q=>q.id===x.id);return p&&p.tid===0});
 shell(`<div class="head"><h1>Players leaving</h1><p>Seniors graduate, and the best underclassmen can enter the pro draft. You can ask each one leaving early to come back for another year.</p><div class="row">${B('leaveDone()','On to recruiting','big')}</div></div>
 <div class="card"><table class="t"><tr><th>Player</th><th>Class</th><th>Pos</th><th>Ovr</th><th></th></tr>${mine.map(x=>{const p=R.pl.find(q=>q.id===x.id);return`<tr><td>${plink(p)}</td><td>${YRN[p.yr]}</td><td>${p.pos}</td><td>${ovrPill(ovr(p))}</td><td>${x.why=='grad'?'Graduating':x.stay==1?'<b class="w">Coming back!</b>':x.stay==-1?'Going pro':B(`askStay(${p.id})`,'Ask him to stay','xs')} </td></tr>`}).join('')||'<tr><td>Nobody is leaving your team this year.</td></tr>'}</table></div>`)}
function askStay(id){const x=(R.leave||[]).find(y=>y.id===id);if(!x||x.why!='pro'||x.stay)return;const p=R.pl.find(q=>q.id===id);x.stay=rnd()<clamp(.3+R.t[0].pres*.06-(ovr(p)-64)*.03,.08,.7)?1:-1;addNews(x.stay==1?`${p.n} will return for another season!`:`${p.n} is entering the pro draft.`,1);hSave();leaveUI()}
function leaveDone(){const out=[];(R.leave||[]).forEach(x=>{if(x.stay==1)return;const p=R.pl.find(q=>q.id===x.id);if(!p)return;if(x.why=='pro'&&ovr(p)>=63)out.push(p);(R.alumni=R.alumni||[]).push({n:p.n,t:p.tid,s:R.season,why:x.why,o:ovr(p),pos:p.pos});if(R.alumni.length>200)R.alumni.shift();if(p.tid===0)addNews(x.why=='grad'?`${p.n} graduates.`:`${p.n} leaves early for the pro draft.`,1)});
 const ids=new Set((R.leave||[]).filter(x=>x.stay!=1).map(x=>x.id));R.pl=R.pl.filter(p=>!ids.has(p.id));if(out.length)addNews(`Early entrants in the pro draft: ${out.slice(0,6).map(p=>p.n).join(', ')}${out.length>6?' and others':''}.`);
 R.leave=null;R.stage='recruit';recStart();hSave();offUI()}
// recruiting: five weeks, then signing day
function slots(t){const commits=R.pl.filter(p=>p.tid===-3&&p.cm===t).length;return 13-teamPl(t).length-commits}
function recStart(){R.rc={wk:1,pts:0};R.pl=R.pl.filter(p=>p.tid!==-3);const plan=[[5,6],[4,24],[3,48],[2,40],[1,22]];
 plan.forEach(([st,n])=>{for(let i=0;i<n;i++){const p=mkPlayer(pick(POS),17,[0,38,42,46,50,55][st]+gauss()*1.6,[0,10,14,18,22,26][st]+ri(0,4),-3);p.stars=st;p.yr=0;p.sal=0;p.exp=9999;p.int={};p.off=[];p.cm=null;p.home=ri(0,29);R.pl.push(p)}});
 recWeekStart()}
function recWeekStart(){R.rc.pts=40+R.t[0].pres*6+(feat('staff')&&R.staff&&R.staff.scout?6:0);R.rc.done={}}
const recruits=()=>R.pl.filter(p=>p.tid===-3);
// top recruits care most about a program's prestige
const fit=(pres,st)=>clamp(.5+.16*pres-.13*(st-3),.3,1.3);
// every team offers and pitches; your assistants do it for you if recruiting is off (or in career mode)
function cpuRecruit(t){const T=R.t[t],L=recruits().filter(p=>p.cm==null);let open=slots(t)-L.filter(p=>p.off.includes(t)).length;
 const want=L.filter(p=>Math.abs(p.stars-T.pres)<=1||p.stars<T.pres).sort((a,b)=>(b.stars*10+pot(b)*.3+rnd()*6)-(a.stars*10+pot(a)*.3+rnd()*6));
 for(const p of want){if(open<=0)break;if(!p.off.includes(t)){p.off.push(t);open--}}
 recruits().forEach(p=>{if(p.cm==null&&p.off.includes(t))p.int[t]=(p.int[t]||0)+(T.pres*4+rnd()*9+(p.home===t?4:0))*fit(T.pres,p.stars)})}
function recWeekEnd(){const auto=!feat('recruit')||CAREER();for(let t=0;t<30;t++){if(t===0&&!auto){recruits().forEach(p=>{if(p.cm==null&&p.off.includes(0))p.int[0]=(p.int[0]||0)+(R.t[0].pres*3+(p.home===0?4:0))*fit(R.t[0].pres,p.stars)})}else cpuRecruit(t)}
 const last=R.rc.wk>=5;recruits().forEach(p=>{if(p.cm!=null)return;const ranked=p.off.map(t=>[t,p.int[t]||0]).sort((a,b)=>b[1]-a[1]);const top=ranked[0];if(!top)return;const second=ranked[1]?ranked[1][1]:0;
  if((last||top[1]>=95&&top[1]-second>=14)&&slots(top[0])>0){p.cm=top[0];if(top[0]===0)addNews(`${stars(p.stars)} ${p.pos} ${p.n} commits to ${R.t[0].n}!`,1);else if(p.stars>=4&&p.off.includes(0))addNews(`${p.n} (${stars(p.stars)}) picks ${R.t[top[0]].n}.`,1)}
  else if(last){const alt=ranked.find(([t])=>slots(t)>0);if(alt){p.cm=alt[0];if(alt[0]===0)addNews(`${p.pos} ${p.n} signs with ${R.t[0].n}.`,1)}}});
 if(last){recFinish();return}R.rc.wk++;recWeekStart()}
function recFinish(){R.pl=R.pl.filter(p=>p.tid!==-3||p.cm!=null);const mine=recruits().filter(p=>p.cm===0);addNews(`Signing day: ${R.t[0].n} sign ${mine.length} recruit${mine.length==1?'':'s'}${mine.length?' ('+mine.map(p=>stars(p.stars)).join(', ')+')':''}.`,1);R.rc=null;R.stage='newyear'}
function recAct(id,a){const p=R.pl.find(q=>q.id===id);if(!p||p.cm!=null)return;const C={off:0,call:5,visit:15}[a];if(a=='off'){if(p.off.includes(0))return;if(recruits().filter(q=>q.cm==null&&q.off.includes(0)).length>=slots(0)+3)return toast('You have offered too many scholarships for your open spots.');p.off.push(0);p.int[0]=(p.int[0]||0)+6;hSave();return recruitUI()}
 if(!p.off.includes(0))return toast('Offer him a scholarship first.');if(R.rc.pts<C)return toast('Not enough recruiting points this week.');const k=id+a;if(R.rc.done[k])return toast(a=='visit'?'He has already visited this week.':'You already called him this week.');R.rc.done[k]=1;R.rc.pts-=C;p.int[0]=(p.int[0]||0)+(a=='visit'?12+rnd()*7:4+rnd()*3)*fit(R.t[0].pres,p.stars);hSave();recruitUI()}
let RF={st:0,pos:''};
function recStep(){recWeekEnd();if(R.stage=='newyear'){newSeason();hSave();toast('Signing day is done. A new season begins!');return homeUI()}hSave();recruitUI()}
function recruitUI(){PAGE='recr';if(!R.rc){shell(`<div class="head"><h1>Recruiting</h1><p>Recruiting happens after the season. ${R.t[0].n} is a ${stars(R.t[0].pres)} program.</p></div>`);return}
 const L=recruits().filter(p=>(!RF.st||p.stars==RF.st)&&(!RF.pos||p.pos==RF.pos)).sort((a,b)=>b.stars-a.stars||pot(b)-pot(a)).slice(0,80),open=slots(0),auto=!feat('recruit');
 const lead=p=>{const r=p.off.map(t=>[t,p.int[t]||0]).sort((a,b)=>b[1]-a[1]);return r[0]?r[0][0]:null};
 shell(`<div class="head"><h1>Recruiting: week ${R.rc.wk} of 5</h1><p>${stars(R.t[0].pres)} program · <b>${open}</b> open scholarship${open==1?'':'s'} · <b>${R.rc.pts}</b> recruiting points left this week. Offer a scholarship, then call (5 points) or bring him on a visit (15 points) to build his interest. ${auto?'<b>Your assistants are recruiting for you</b> (Game features).':''}</p>
 <div class="row">${B('recStep()',R.rc.wk>=5?'Signing day!':'Next week','big')}<label>Stars <select onchange="RF.st=+this.value;recruitUI()"><option value="0">All</option>${[5,4,3,2,1].map(s=>`<option value="${s}" ${RF.st==s?'selected':''}>${stars(s)}</option>`).join('')}</select></label><label>Position <select onchange="RF.pos=this.value;recruitUI()"><option value="">All</option>${POS.map(x=>`<option ${RF.pos==x?'selected':''}>${x}</option>`).join('')}</select></label></div></div>
 <div class="card"><h3>Your commits</h3><p>${recruits().filter(p=>p.cm===0).map(p=>`${plink(p)} ${stars(p.stars)} ${p.pos}`).join(' · ')||'None yet.'}</p></div>
 <div class="card"><div class="tw"><table class="t"><tr><th>Recruit</th><th>Stars</th><th>Pos</th><th>Ht</th><th>Ovr</th><th>Pot</th><th>Your interest</th><th>Leader</th><th></th></tr>${L.map(p=>{const ld=lead(p),mi=Math.round(p.int[0]||0);return`<tr class="${p.cm===0?'me':''}"><td>${plink(p)}</td><td class="str">${stars(p.stars)}</td><td>${p.pos}</td><td>${htTxt(p.ht)}</td><td>${ovr(p)}</td><td>${pot(p)}</td>
  <td>${p.off.includes(0)?`<div class="bar" style="width:90px;display:inline-block;vertical-align:middle"><i style="width:${Math.min(100,mi)}%;background:#f97316"></i></div> ${mi}`:'-'}</td><td>${p.cm!=null?`<b>${p.cm===0?'Committed to you':'Committed: '+esc(R.t[p.cm].ab)}</b>`:ld!=null?esc(R.t[ld].ab):'-'}</td>
  <td>${p.cm!=null||auto?'':p.off.includes(0)?B(`recAct(${p.id},'call')`,'Call','xs')+B(`recAct(${p.id},'visit')`,'Visit','xs'):B(`recAct(${p.id},'off')`,'Offer','xs')}</td></tr>`}).join('')}</table></div></div>`)}
NAV.splice(NAV.findIndex(n=>n[0]=='fa')+1,0,['recr','Recruiting','recruitUI()']);
// the new season: recruits join, everyone moves up a year
{const _ns=newSeason;newSeason=function(){if(!COLLEGE())return _ns();R.pl.forEach(p=>{if(p.tid===-3&&p.cm!=null){p.tid=p.cm;p.age=17;p.yr=0;delete p.int;delete p.off;fixNum(p,p.tid)}});R.pl=R.pl.filter(p=>p.tid!==-3);
  COLNS=1;try{_ns()}finally{COLNS=0}R.pl.forEach(p=>{p.yr=(p.yr||0)+1;if(p.yr===1)p.rook=R.season;p.sal=0;p.exp=9999});R.t.forEach((_,t)=>{while(teamPl(t).length<11)fillMin(t);while(teamPl(t).length>15){const w=teamPl(t).sort((a,b)=>ovr(a)-ovr(b))[0];R.pl=R.pl.filter(q=>q!==w)}});R.rot={};hSave()}}
// the offseason flow and the home page in college
{const _ou=offUI;offUI=function(){if(!COLLEGE())return _ou();PAGE='off';if(R.stage=='leave')return leaveUI();if(R.stage=='recruit')return recruitUI();if(R.stage=='newyear'){newSeason();return homeUI()}return homeUI()}}
{const _hu=homeUI;homeUI=function(){_hu();if(!COLLEGE()||(typeof CAREER=='function'&&CAREER()))return;try{const m=$('mainpg');const h=m.querySelector('.card.hot h3');if(R.stage&&h)h.textContent={leave:'Players leaving',recruit:`Recruiting: week ${R.rc?R.rc.wk:1} of 5`,newyear:'A new season'}[R.stage]||h.textContent;
  const hp=m.querySelector('.head p');if(hp)hp.innerHTML=hp.innerHTML.replace(/Payroll[^·]*·/,`${stars(R.t[0].pres)} program ·`).replace(/in the (East|West)/,`in the ${CONFN()[R.t[0].conf]}`);
  if(R.stage=='recruit'&&h){const p=h.parentElement.querySelector('p');if(p)p.textContent='Offer scholarships and pitch to high-school players.'}}catch(e){}}}
// college rosters show the class instead of a salary
{const _ru=rosterUI;rosterUI=function(){_ru();if(!COLLEGE())return;try{const t=document.querySelector('#mainpg table.t');if(!t)return;const hs=[...t.querySelectorAll('tr:first-child th')],si=hs.findIndex(h=>h.textContent=='Salary'),ei=hs.findIndex(h=>h.textContent=='Thru season');if(si>=0)hs[si].textContent='Class';if(ei>=0)hs[ei].textContent='Stars';
  t.querySelectorAll('tr').forEach((tr,i)=>{if(!i)return;const a=tr.querySelector('a[onclick^="playerUI("]');if(!a)return;const p=R.pl.find(q=>q.id===+a.getAttribute('onclick').match(/\d+/)[0]);if(!p)return;const td=tr.children;if(si>=0&&td[si])td[si].textContent=YRN[p.yr]||'';if(ei>=0&&td[ei])td[ei].textContent=p.stars?stars(p.stars):''});
  const hp=document.querySelector('#mainpg .head p');if(hp)hp.textContent=`${teamPl(0).length} players (13 scholarships). The first five are your starters; the next five get most of the bench minutes.`}catch(e){}}}
{const _pu=playerUI;playerUI=function(id){_pu(id);if(!COLLEGE())return;try{const p=R.pl.find(q=>q.id===id),h=$('modal').querySelector('.ph p')||$('modal').querySelector('p');if(p&&h)h.innerHTML=h.innerHTML.replace(/\$?[\d.]+M a year[^·]*·?/,'')+` · ${p.tid===-3?'High-school recruit':YRN[p.yr]||''}${p.stars?' · '+stars(p.stars):''}`;$('modal').querySelectorAll('button.danger').forEach(b=>{if(/Release|Waive/.test(b.textContent))b.remove()})}catch(e){}}}
{const _st=standUI;standUI=function(){_st();if(!COLLEGE())return;try{const m=$('mainpg');m.querySelectorAll('h3').forEach(h=>{h.textContent=h.textContent.replace('East',CONFN()[0]).replace('West',CONFN()[1])});const p=m.querySelector('.head p');if(p)p.textContent='The top 8 in each conference make the March tournament: one game, win or go home.'}catch(e){}}}
{const _hi=histUI;histUI=function(){_hi();if(!COLLEGE()||!R.alumni||!R.alumni.length)return;try{const m=$('mainpg'),mine=R.alumni.filter(a=>a.t===0).slice(-30).reverse();if(mine.length)m.insertAdjacentHTML('beforeend',`<div class="card"><h3>Your former players</h3><table class="t">${mine.map(a=>`<tr><td>${esc(a.n)}</td><td>${a.pos}</td><td>${a.o}</td><td>${a.why=='grad'?'Graduated':'Left early for the pros'}</td><td>${a.s}</td></tr>`).join('')}</table></div>`)}catch(e){}}}
// ---------- a career that starts in college ----------
{const _cc=careerCreateHTML;careerCreateHTML=function(){const h=_cc();return h.replace(`${B('careerGo()','Enter the draft','big')}`,`<label>Start <select id="cstart"><option value="col" selected>In college, then the pro draft</option><option value="pro">Straight to the pro draft</option></select></label>${B('careerStart()','Start my career','big')}`)}}
function careerStart(){const s=$('cstart');if(!s||s.value=='pro')return careerGo();careerGoCollege()}
function careerGoCollege(){const pos=$('cpos').value,ht=+$('cht').value,arch=$('carch').value,fn=$('cfn').value.trim()||'Rookie',ln=$('cln').value.trim()||'Player';
 makeCollege({slen:30,qlen:+$('nq').value,diff:+$('nd').value});R.mode='career';R.t[0].pres=clamp(ri(2,4),1,5);
 const p=colPlayer(0,1,46,0);p.fn=fn;p.ln=ln;p.n=fn+' '+ln;p.ht=ht;p.pos=pos;p.num=clamp(+$('cnum').value||0,0,55);p.stars=3;const pr=ARCH[arch][2];
 HK.forEach(k=>{let v=47+(PROF[pos][k]||0)*.6+(pr[k]||0)+gauss()*2;if(k=='vert'||k=='blk'||k=='orb'||k=='drb'||k=='id')v+=(ht-(HT[pos][0]+HT[pos][1])/2)*1.5;if(k=='spd'||k=='acc'||k=='han')v-=(ht-(HT[pos][0]+HT[pos][1])/2)*1.1;p.sk[k]=clamp(Math.round(v),28,72);p.mx[k]=clamp(Math.round(p.sk[k]+32+(pr[k]||0)*.5),p.sk[k],99)});
 p.pers='Competitor';p.mor=75;p.s0=ovr(p);R.pl.push(p);fixNum(p,0);
 // make room: one walk-on goes
 const w=teamPl(0).filter(q=>q!==p).sort((a,b)=>ovr(a)-ovr(b))[0];if(teamPl(0).length>13&&w)R.pl=R.pl.filter(q=>q!==w);
 R.car={id:p.id,xp:0,lvl:1,pts:2,xf:[],fans:15,trust:45,arch,log:[],evd:0};R.camp=0;R.plan='bal';colSetup();
 addNews(`${p.n}, a ${stars(3)} recruit, starts his college career at ${R.t[0].n}.`,1);hSave();careerHome();setTimeout(()=>modal(`<h2>Welcome to ${esc(R.t[0].n)}</h2><p><b>${esc(p.n)}</b> is a freshman ${POSN[pos].toLowerCase()} (${ovr(p)} overall).</p><p>Play well, then enter the pro draft after any season (you have to go after your senior year). The better you are, the higher you get picked.</p>`),60)}
// the career home page in college: show the class and the draft stock
{const _ch=careerHome;careerHome=function(){_ch();if(!COLLEGE())return;try{const p=me(),m=$('mainpg'),hp=m.querySelector('.head p');if(hp)hp.innerHTML=hp.innerHTML.replace(/\$?[\d.]+M through season \d+/,`${YRN[p.yr]||''} · ${stars(R.t[0].pres)} program`);
  const proj=draftProj(p);m.querySelector('.grid3')&&m.querySelector('.grid3').insertAdjacentHTML('afterend',`<div class="card"><h3>Pro draft stock</h3><p>${proj<=60?`Projected pick: <b>#${proj}</b>${proj<=14?' (lottery)':proj<=30?' (first round)':' (second round)'}`:'Not on draft boards yet. Keep improving.'}</p></div>`);
  const h=m.querySelector('.card.hot h3');if(R.stage&&h)h.textContent='The college season is over';const pp=h&&h.parentElement.querySelector('p');if(R.stage&&pp)pp.textContent=p.yr>=4?'Your college career is over: time for the pro draft.':'Enter the pro draft, or come back for another year?'}catch(e){}}}
function draftProj(p){return clamp(Math.round((73-ovr(p))*2.4+1),1,99)}
{const _co=careerOff;careerOff=function(){if(!COLLEGE())return _co();const p=me();if(R.stage=='leave'){if(p.yr>=4)return careerToPros();const proj=draftProj(p);
  modal(`<h2>Your ${YRN[p.yr].toLowerCase()} season is over</h2><p>Draft experts project you ${proj<=60?`as pick #${proj}`:'to go undrafted'}.</p>${B('careerToPros()','Enter the pro draft','big')} ${B('closeModal();careerStay()','Return to school')}`);$('modal').onclick=null;return}
  careerStay()}}
function careerStay(){const p=me();if(R.stage=='leave'){(R.leave||[]).forEach(x=>{if(x.id===p.id)x.stay=1});leaveDoneQuiet()}while(R.stage=='recruit'){recWeekEnd()}if(R.stage=='newyear')newSeason();hSave();careerHome()}
function leaveDoneQuiet(){(R.leave||[]).forEach(x=>{if(x.why=='pro'&&!x.stay)x.stay=rnd()<.3?1:-1});const ids=new Set((R.leave||[]).filter(x=>x.stay!=1).map(x=>x.id));R.pl=R.pl.filter(p=>!ids.has(p.id));R.leave=null;R.stage='recruit';recStart()}
function careerToPros(){closeModal();const old=R,p=me(),car=old.car,school=old.t[0].n,no=draftProj(p)+ri(-2,2),yrs=p.yr;
 // a new pro league; your college seasons go with you
 newLeague({slen:30,qlen:old.qlen,diff:old.diff});p.car=p.car.map(c=>{const d=c.slice();d[1]=-9;return d});if(p.ss[SI.gp])p.car.push([old.season,-9,...p.ss]);p.ss=newSS();p.ps=null;p.id=++R.uid;p.tid=-1;p.col={school,yrs};delete p.yr;delete p.stars;delete p.rook;R.pl.push(p);
 const ord=R.t.map((_,i)=>i).sort((a,b)=>teamOvr(a)-teamOvr(b)),pickNo=clamp(no,1,60),j=pickNo<=30?ord[pickNo-1]:ord[pickNo-31];swapTeam(j);p.tid=0;p.sal=pickNo<=30?clamp(10-pickNo*.3,2,10):MINSAL;p.exp=R.season+(pickNo<=30?3:2);p.rook=R.season;p.draft={s:R.season-1,rd:pickNo<=30?1:2,no:pickNo<=30?pickNo:pickNo-30,t:0};fixNum(p,0);
 car.id=p.id;car.trust=45;R.car=car;R.mode='career';R.col=0;MODEOFF.clear();RDN[0]='First round';RDN[1]='Conference semifinals';RDN[2]='Conference finals';RDN[3]='Finals';
 const tx=pickNo<=60?`With the #${p.draft.no} pick in round ${p.draft.rd}, the ${R.t[0].n} select ${p.n} from ${school}!`:`${p.n} goes undrafted and signs with the ${R.t[0].n}.`;addNews(tx,1);hSave();careerHome();setTimeout(()=>modal(`<h2>Draft night</h2><p>${esc(tx)}</p><p>After ${yrs} year${yrs==1?'':'s'} at ${esc(school)}, you start in the pros as a ${ovr(p)} overall.</p>`),60)}
{const _pu=playerUI;playerUI=function(id){_pu(id);try{const p=R.pl.find(q=>q.id===id);if(p&&p.col){const h=$('modal').querySelector('.ph p')||$('modal').querySelector('p');if(h)h.insertAdjacentHTML('beforeend',` · college: ${esc(p.col.school)}`)}}catch(e){}}}
// set up on load
try{if(typeof R!='undefined'&&R&&COLLEGE())colSetup()}catch(e){}
// the sidebar in college: the offseason button, no pro-only pages, and the tournament
{const _sh=shell;shell=function(...a){const r=_sh.apply(this,a);try{if(COLLEGE()){const sd=document.querySelector('.side');if(sd){const hb=sd.querySelector('.ni.hot');if(hb&&R.stage)hb.textContent={leave:'Players leaving',recruit:'Recruiting',newyear:'New season'}[R.stage]||hb.textContent;sd.querySelectorAll('button.ni').forEach(b=>{if(b.textContent=='Playoffs')b.textContent='Tournament'})}}}catch(e){}return r}}
{const _ok=navOK;navOK=function(k){if(COLLEGE()&&['trade','fa','picks','offers','fin','owner'].includes(k))return false;return _ok(k)}}
