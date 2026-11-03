'use strict';
// Running the club: the cup, personalities, morale, contract talks, coaching staff, preseason camp, the game plan for
// simmed matches, finances and the stadium, the board, derbies, storylines, achievements, player of the month, power
// rankings, team stats, results, transfer offers and requests, save slots, the season recap, undo, kit colors and
// records with a hall of fame. Each part has its own switch.
{const add=[['Franchise','cup','Cup competition','A knockout cup alongside the league: five rounds, penalties if it is level, and a final.'],
 ['Franchise','pers','Personalities','Players are leaders, professionals, ambitious, loyal, hotheads or quiet, which changes how they react and what they ask for.'],
 ['Franchise','morale','Morale','Players are happier when they play and win. Happy teams play a little better; unhappy stars may ask to leave.'],
 ['Franchise','neg','Contract talks','Offer a wage when renewing a contract. Players can turn down low offers.'],
 ['Franchise','staff','Coaching staff','Hire better coaches for training, fitness, the academy and scouting.'],
 ['Franchise','camp','Preseason camp','Pick a focus for the preseason: fitness, attack, defense or the young players.'],
 ['Franchise','plan','Game plan','Your tactics also count when you sim a match.'],
 ['Franchise','fin','Finances and stadium','Ticket money from home matches goes into your budget. Expand the stadium to earn more.'],
 ['Franchise','board','Board expectations','The board sets a target for the season and its confidence in you goes up and down.'],
 ['Franchise','riv','Derbies','Every club has a rival. Derbies get top billing and mean more to the players.'],
 ['Franchise','story','Storylines','News about streaks, title races, scoring races and relegation fights.'],
 ['Franchise','ach','Achievements','Goals to chase, like a hat-trick, an unbeaten run or winning the double.'],
 ['Franchise','potm','Player of the month','The best player over each stretch of matches gets an award.'],
 ['Franchise','power','Power rankings','A weekly ranking of every club by form and strength.'],
 ['Franchise','tstats','Team stats','Goals, shots, cards and clean sheets for every club.'],
 ['Franchise','results','Results page','Every match your club has played this season, with the box scores.'],
 ['Franchise','offers','Transfer offers','Other clubs make offers for your players. Accept or turn them down.'],
 ['Franchise','treq','Transfer requests','Unhappy players can hand in a transfer request.'],
 ['Franchise','hof','Records and Hall of Fame','League records and a hall of fame for great careers.'],
 ['Franchise','recap','Season recap','A summary of your season when it ends.'],
 ['Franchise','kits','Kit colors','Pick your club\'s colors on the Settings page.'],
 ['Help','slots','Save slots','Keep up to three leagues in this browser.'],
 ['Help','undo','Undo last sim','Take back the last sim if you change your mind.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const PERS=['Leader','Professional','Ambitious','Loyal','Hothead','Quiet'],PERSD={Leader:'Lifts the team\'s morale',Professional:'Trains hard and improves faster',Ambitious:'Wants to play and to win; asks for more money',Loyal:'Happy to stay; asks for less to stay',Hothead:'Mood swings up and down',Quiet:'Steady, nothing bothers him'};
const persOf=p=>PERS[(p.id*2654435761>>>0)%PERS.length];
const mor=p=>p.mor==null?70:p.mor;
function setMor(p,d){if(!feat('morale'))return;const ps=feat('pers')?persOf(p):'';if(ps=='Hothead')d*=1.6;if(ps=='Quiet')d*=.5;if(ps=='Ambitious'&&d<0)d*=1.3;p.mor=clamp(Math.round(mor(p)+d),0,100)}
const morTxt=v=>v>=85?'Delighted':v>=70?'Happy':v>=50?'Content':v>=30?'Unhappy':'Furious';
// ---------- league start, saves and seasons ----------
function franInit(){if(!R)return;R.ach=R.ach||{};R.storyK=R.storyK||{};R.staff=R.staff||{coach:1,fit:1,youth:1,scout:1};R.fin=R.fin||{cap:30000,inc:[],lv:0};R.board=R.board||null;R.offers=R.offers||[];R.rec=R.rec||{};R.hof=R.hof||[];R.legends=R.legends||[];R.cupHist=R.cupHist||[];
 if(!R.board)boardNew();if(feat('cup')&&(!R.cup||R.cup.s!==R.season)&&R.day<=cupDays()[0]&&!R.stage)cupNew();if(!R.potm)R.potm={from:R.day,snap:potmSnap()}}
{const _nl=newLeague;newLeague=function(o){_nl(o);franInit()}}
{const _hl=hLoad;hLoad=function(){const r=_hl();if(r)try{franInit()}catch(e){}return r}}
{const _ns=newSeason;newSeason=function(){hofCheck();const had=new Set(R.pl.map(p=>p.id));_ns();try{R.pl.forEach(p=>{if(p.tid===0&&!had.has(p.id)&&p.age<=18)p.acad=1});franInit();boardNew();cupNew();R.potm={from:0,snap:potmSnap()};R.camp=feat('camp')?'pick':null;R.storyK={};
  if(feat('staff')&&R.staff.youth>1)teamPl(0).filter(p=>p.age<=18&&p.ss[SI.gp]===0&&!p.car.length).forEach(p=>{SK.forEach(k=>p.mx[k]=Math.min(99,p.mx[k]+(R.staff.youth-1)*3))});
  if(feat('fin')){const g=Math.round((5+R.fin.lv*1.5)*10)/10;R.cash=Math.round((R.cash+g)*10)/10;R.fin.inc.unshift({s:R.season,t:`Sponsors and TV money`,v:g})}}catch(e){}}}
// ---------- the cup ----------
const CUPN=['First round','Round of 16','Quarter-final','Semi-final','Final'];
// rounds for any number of clubs: a first round trims the field to 16 or 32, then knockout to the final
function cupPlan(n){let t=2;while(t*2<=n)t*=2;const names=[];if(n>t)names.push('First round');for(let k=t;k>=2;k/=2)names.push(k==2?'Final':k==4?'Semi-final':k==8?'Quarter-final':'Round of '+k);return{t,names}}
function cupNR(){return R.cup&&R.cup.names?R.cup.names.length:5}
function cupName(rd){return(R.cup&&R.cup.names||CUPN)[rd]||''}
function cupDays(nr){nr=nr||5;const L=R.sched.length;return[...Array(nr).keys()].map(i=>Math.max(1,Math.round(L*(.1+.8*i/(nr-1)))))}
function cupNew(){if(!feat('cup'))return;const t=R.t.map((_,i)=>i).sort(()=>rnd()-.5),pl=cupPlan(t.length);R.cup={s:R.season,rd:0,alive:t,names:pl.names,size:pl.t,days:cupDays(pl.names.length),ties:null,res:[],win:null,pend:false}}
function cupDraw(){const C=R.cup,a=C.alive.slice().sort(()=>rnd()-.5);let ties=[];if(C.rd===0&&a.length>(C.size||16)){const n=a.length-(C.size||16),bye=a.slice(0,a.length-n*2),pl=a.slice(a.length-n*2);for(let i=0;i<pl.length;i+=2)ties.push([pl[i],pl[i+1]]);C.bye=bye}else{for(let i=0;i<a.length;i+=2)ties.push([a[i],a[i+1]])}C.ties=ties;C.pend=ties.some(t=>t[0]===0||t[1]===0)}
function cupPens(a,b){const s=[0,0];for(let i=0;i<5;i++){s[0]+=rnd()<.76?1:0;s[1]+=rnd()<.76?1:0}while(s[0]===s[1]){s[0]+=rnd()<.76?1:0;s[1]+=rnd()<.76?1:0}return s}
function cupRecord(a,b,res){const C=R.cup,sc=res.sc;let w,pens=null;if(sc[0]!==sc[1])w=sc[0]>sc[1]?a:b;else{pens=res.pens||cupPens(a,b);w=pens[0]>pens[1]?a:b}C.res.push({rd:C.rd,a,b,sc:sc.slice(),pens,w});return w}
function cupSimTie(a,b){const res=simGame(a,b);res.cup=cupName(R.cup.rd);recGame(a,b,res);return cupRecord(a,b,res)}
function cupRoundEnd(){const C=R.cup,ws=C.res.filter(r=>r.rd===C.rd).map(r=>r.w);const mine=C.res.find(r=>r.rd===C.rd&&(r.a===0||r.b===0));
 C.alive=(C.rd===0?(C.bye||[]):[]).concat(ws);C.ties=null;C.pend=false;
 if(mine)addNews(`Cup ${cupName(C.rd).toLowerCase()}: ${mine.w===0?'you go through':'you are knocked out'} (${R.t[mine.a].ab} ${mine.sc[0]}-${mine.sc[1]} ${R.t[mine.b].ab}${mine.pens?`, ${mine.pens[0]}-${mine.pens[1]} on penalties`:''}).`,1);
 if(C.rd===cupNR()-1){C.win=ws[0];R.cupHist.push({s:R.season,w:C.win,f:mine||C.res[C.res.length-1]});addNews(`${R.t[C.win].n} win the cup!`,C.win===0);teamPl(C.win).forEach(p=>p.aw.push(`${R.season} Cup winner`));if(C.win===0)achGet('cup')}
 C.rd++;hSave()}
function cupDue(){const C=R.cup;return feat('cup')&&C&&C.s===R.season&&!R.stage&&C.rd<cupNR()&&R.day>=C.days[C.rd]}
function cupTick(){if(!cupDue())return;const C=R.cup;if(!C.ties)cupDraw();if(C.pend)return;C.ties.forEach(([a,b])=>cupSimTie(a,b));cupRoundEnd()}
function cupMine(){const C=R.cup;return C&&C.ties?C.ties.find(t=>t[0]===0||t[1]===0):null}
function cupSimMine(){const C=R.cup;if(!C||!C.pend)return;C.ties.forEach(([a,b])=>cupSimTie(a,b));cupRoundEnd();homeUI()}
function cupPlay(){const t=cupMine();if(!t)return;newGame(t[0],t[1],{hlen:R.hlen});G.diff=R.diff;G.cupTie=t;G.cupName=cupName(R.cup.rd);$('ui').hidden=true;$('gamewrap').hidden=false;closeModal();hResize();try{if(feat('intro'))G.intro=6;rotCheck()}catch(e){}runLoop()}
{const _fg=finishGame;finishGame=function(){if(!G||!G.cupTie)return _fg();const {a,b,res}=gameResult();res.cup=G.cupName;if(G.pens)res.pens=G.pens;recGame(a,b,res,true);
  // the other ties in this round
  const C=R.cup;cupRecord(a,b,res);C.ties.forEach(([x,y])=>{if(x===0||y===0)return;cupSimTie(x,y)});cupRoundEnd();hSave();return res}}
{const _eu=endUI;endUI=function(){if(G&&G.cupTie&&G.sc[0]===G.sc[1]&&!G.pens){const r=gameResult();G.pens=cupPens()}_eu();if(G&&G.cupTie)try{const h2=$('modal').querySelector('h2');const r=gameResult(),m=r.a===0?0:1;let t=`<p><b>${esc(G.cupName)}</b>`;if(G.pens){const mine=G.pens[m],their=G.pens[1-m];t+=` · Penalties: ${mine}-${their}, ${mine>their?'you go through!':'you are out.'}`;if(mine>their)h2.className='w';else h2.className='l'}t+='</p>';h2.insertAdjacentHTML('afterend',t)}catch(e){}}}
// the day loop: cup rounds come up between league matchdays
{const _sd=simDay;simDay=function(skipUser){if(!skipUser&&R.cup&&R.cup.pend&&cupDue()){R.cup.ties.forEach(([a,b])=>cupSimTie(a,b));cupRoundEnd()}_sd(skipUser)}}
{const _ed=endDay;endDay=function(){_ed();try{franDay()}catch(e){console.error(e)}}}
{const _pg=playGame;playGame=function(...a){if(R.cup&&R.cup.pend&&cupDue())return cupPlay();return _pg.apply(this,a)}}
// ---------- each matchday: morale, money, the board, offers, storylines, player of the month ----------
function lastBox(){return R.box[R.box.length-1]}
function franDay(){const b=lastBox(),fresh=b&&b.s===R.season&&b.d===R.day-1&&!b.cup;
 if(fresh){const m=b.a===0?0:1,w=b.sc[m]>b.sc[1-m],l=b.sc[m]<b.sc[1-m],o=b.a===0?b.b:b.a,derby=feat('riv')&&rival(0)===o;
  // morale: who played and how it went
  if(feat('morale')){const played=new Set(b.pl[m].filter(r=>r[3+SI.gp]).map(r=>r[0])),lead=feat('pers')&&teamPl(0).some(p=>played.has(p.id)&&persOf(p)=='Leader');const top=teamPl(0).sort((x,y)=>ovr(y)-ovr(x)).slice(0,16);
   teamPl(0).forEach(p=>{if(played.has(p.id))setMor(p,(w?3:l?-2:0)+(derby&&w?3:0)+(lead&&l?1:0));else if(top.includes(p)&&!p.inj)setMor(p,-2);else setMor(p,(70-mor(p))*.05)})}
  if(feat('fin')&&b.a===0){const f=R.t[0].form5.filter(x=>x=='W').length,att=Math.round(R.fin.cap*clamp(.72+f*.05+(derby?.1:0),.5,1)),v=Math.round(att*12/1e5)/10;R.cash=Math.round((R.cash+v)*10)/10;R.fin.inc.unshift({s:R.season,d:R.day,t:`Home match v ${R.t[o].ab}: ${att.toLocaleString()} fans`,v});if(R.fin.inc.length>60)R.fin.inc.length=60}
  if(feat('board')&&R.board){R.board.conf=clamp(R.board.conf+(w?2:l?-3:0)+(derby?(w?2:l?-2:0):0),0,100)}
  if(derby&&w)addNews(`Derby win! ${R.t[0].n} beat ${R.t[o].n} ${b.sc[m]}-${b.sc[1-m]}.`,1);if(derby&&w)achGet('derby');if(w)achGet('win1');if(w&&b.sc[m]-b.sc[1-m]>=4)achGet('rout');if(b.sc[1-m]===0)achGet('cs')}
 if(R.stage)return;cupTick();potmTick();storyTick();offerTick();reqTick();achTick()}
// ---------- personalities and morale in matches ----------
{const _ss=sideStr;sideStr=function(L,slots){const S=_ss(L,slots);try{let f=1;if(feat('morale')&&L.length){const a=L.reduce((s,p)=>s+mor(p),0)/L.length;f*=1+(a-70)/900}
  if(feat('plan')&&L[0]&&L[0].tid===0&&R.tac0&&!G){const m={park:[.88,1.09],def:[.94,1.05],bal:[1,1],att:[1.06,.96],all:[1.12,.9]}[R.tac0.m]||[1,1];S.att*=m[0];S.def*=m[1]}S.att*=f;S.mid*=f;S.def*=f}catch(e){}return S}}
{const _sa=shotAdj;shotAdj=function(e,q){let a=_sa(e,q);if(feat('morale'))a+=(mor(e.p)-70)/3000;return a}}
{const _af=askFor;askFor=function(p){let v=_af(p);if(feat('pers')){const s=persOf(p);if(s=='Ambitious')v*=1.15;if(s=='Loyal'&&p.tid===0)v*=.9}if(feat('morale')&&p.tid===0)v*=1+(70-mor(p))/400;return clamp(Math.round(v*10)/10,.3,30)}}
{const _dy=dailyStuff;dailyStuff=function(){_dy();try{if(feat('pers')&&feat('dev'))teamPl(0).forEach(p=>{if(persOf(p)=='Professional'&&p.age<=28&&rnd()<.04)hUp(p,bestGroup(p),1)});
  if(feat('staff')){const s=R.staff;if(s.coach>1)teamPl(0).forEach(p=>{if(p.age<=26&&rnd()<.02*(s.coach-1))hUp(p,bestGroup(p),1)});if(s.fit>1)teamPl(0).forEach(p=>{if(p.inj>1&&rnd()<.25*(s.fit-1))p.inj--})}}catch(e){}}}
// ---------- contract talks ----------
let NEG=null;
{const _kp=keepP;keepP=function(id,y){if(!feat('neg'))return _kp(id,y);const p=R.pl.find(q=>q.id===id);if(!p)return;NEG={id,y,tries:NEG&&NEG.id===id?NEG.tries:3};negUI()}}
function negUI(){const p=R.pl.find(q=>q.id===NEG.id),ask=askFor(p);modal(`<h2>Contract talks: ${esc(p.n)}</h2><p>${p.pos} · ${p.age} · ${ovrPill(ovr(p))}${feat('pers')?` · ${persOf(p)}`:''}${feat('morale')?` · ${morTxt(mor(p))}`:''}</p><p>He asks for <b>${money(ask)}</b> a season for ${NEG.y} season${NEG.y>1?'s':''}. ${NEG.tries} offer${NEG.tries==1?'':'s'} left before he walks away.</p>
 <div class="row">${[.8,.9,1,1.1].map(f=>B(`negOffer(${f})`,`${money(Math.round(ask*f*10)/10)}<br><small>${f<1?Math.round((1-f)*100)+'% less':f>1?Math.round((f-1)*100)+'% more':'what he asks'}</small>`)).join('')}</div>${B('closeModal()','Not now')}`)}
function negOffer(f){const p=R.pl.find(q=>q.id===NEG.id),ask=askFor(p);let ch=f>=1?1:f>=.9?.55:.25;ch+=(mor(p)-70)/200;if(feat('pers')&&persOf(p)=='Loyal')ch+=.2;if(feat('pers')&&persOf(p)=='Ambitious')ch-=.15;if(NEG.y>=3&&p.age>=30)ch+=.15;
 if(rnd()<ch){p.keep=1;p.sal=Math.round(ask*f*10)/10;p.exp=R.season+NEG.y;NEG=null;closeModal();toast(`${p.n} signs!`);hSave();renewUI();return}
 NEG.tries--;if(NEG.tries<=0){NEG=null;closeModal();p.keep=0;p.walk=1;toast(`${p.n} has decided to leave.`);addNews(`${p.n} turned down a new contract.`,1);renewUI();return}toast('He says no. Try again?');negUI()}
{const _ru=renewUI;renewUI=function(){_ru();if(!feat('neg'))return;try{R.pl.forEach(p=>{if(p.walk&&p.tid===0){const tr=[...document.querySelectorAll('.main table.t tr')].find(r=>r.textContent.includes(p.n));if(tr&&tr.lastElementChild)tr.lastElementChild.innerHTML='<i>Leaving</i>'}})}catch(e){}}}
{const _rd=renewDone;renewDone=function(){R.pl.forEach(p=>delete p.walk);return _rd()}}
// ---------- the board ----------
function boardNew(){if(!R)return;const rank=R.t.map((_,i)=>i).filter(i=>divOf(i)===divOf(0)).sort((a,b)=>teamOvr(b)-teamOvr(a)).indexOf(0)+1,tgt=clamp(rank+2,1,17);const prev=R.board?R.board.conf:60;R.board={s:R.season,tgt,conf:clamp(Math.round(prev*.5+30),30,70)}}
function boardTxt(){const b=R.board,two=R.t.some(t=>t.dv==2);if(two&&divOf(0)==2)return b.tgt<=3?'Win promotion (top 3)':`Finish ${b.tgt}${ord(b.tgt)} or better in Division 2`;return b.tgt<=1?'Win the league':b.tgt<=4?`Finish in the top ${b.tgt}`:b.tgt>=17?(two?'Stay up (17th or better)':'Finish 17th or better'):`Finish ${b.tgt}${ord(b.tgt)} or better`}
function boardEnd(){if(!feat('board')||!R.board)return'';const pos=table().indexOf(0)+1,b=R.board,d=b.tgt-pos;b.conf=clamp(b.conf+d*4,0,100);let v;if(d>=3)v='The board is thrilled with the season.';else if(d>=0)v='The board is pleased: target reached.';else if(b.conf>15)v='The board is disappointed you missed the target.';
 else{const cut=Math.round(R.cash*.5*10)/10;R.cash=Math.round((R.cash-cut)*10)/10;b.conf=35;v=`The board is furious. Final warning: they take back ${money(cut)} of your budget.`}addNews(v,1);return v}
// ---------- derbies ----------
function rival(t){return t^1}
{const _hu=homeUI;homeUI=function(){if(R&&R.stage!==undefined)try{franInit()}catch(e){}
 _hu();if(!R||PAGE!=='home')return;try{const main=document.querySelector('.main'),head=main&&main.querySelector('.head');let add='';
  if(feat('cup')&&R.cup&&R.cup.pend&&cupDue()){const t=cupMine(),o=t[0]===0?t[1]:t[0];add+=`<div class="card hot"><h3>Cup: ${cupName(R.cup.rd)}</h3><p>${t[0]===0?'vs':'at'} ${tlink(o)} · ${feat('riv')&&rival(0)===o?'<b>Derby!</b> ':''}A draw goes to penalties.</p><div class="row">${B('cupPlay()','Play the cup match','big')}${B('cupSimMine()','Sim it')}</div></div>`;const lg=main.querySelector('.card.hot');if(lg)lg.remove()}
  if(feat('camp')&&R.camp==='pick')add+=`<div class="card hot"><h3>Preseason camp</h3><p>Pick a focus before the first match.</p><div class="row">${[['fit','Fitness','Fewer injuries early on'],['att','Attack','Forwards and wingers improve'],['def','Defense','Defenders and the keeper improve'],['young','Young players','Everyone 21 or under improves']].map(([k,n,d])=>B(`campGo('${k}')`,`${n}<br><small>${d}</small>`)).join('')}</div></div>`;
  if(feat('offers')&&R.offers.length)add+=`<div class="card hot"><h3>Transfer offers</h3><table class="t">${R.offers.map((o,i)=>{const p=R.pl.find(q=>q.id===o.id);return p?`<tr><td>${esc(R.t[o.t].n)} offer <b>${money(o.fee)}</b> for ${plink(p)} (${p.pos}, ${ovr(p)})${p.req?' <small>(asked to leave)</small>':''}</td><td>${B(`offerYes(${i})`,'Accept','xs')} ${B(`offerNo(${i})`,'Turn down','xs')}</td></tr>`:''}).join('')}</table></div>`;
  if(feat('undo')&&UNDO)add+=`<div class="row">${B('undoGo()','Undo the last sim')}</div>`;
  const nx=nextGame();if(feat('riv')&&nx&&!R.stage){const o=nx[0]===0?nx[1]:nx[0];if(rival(0)===o){const h=main.querySelector('.card.hot h3');if(h&&/Matchday/.test(h.textContent))h.insertAdjacentHTML('beforeend',' · <span class="pill" style="background:#b91c1c">Derby</span>')}}
  let side='';if(feat('board')&&R.board)side+=`<div class="card"><h3>The board</h3><p>${boardTxt()}. You are ${table().indexOf(0)+1}${ord(table().indexOf(0)+1)}.</p><div class="bar"><i style="width:${R.board.conf}%;background:${R.board.conf>60?'#4ade80':R.board.conf>30?'#fbbf24':'#f87171'}"></i></div><small>Confidence ${R.board.conf}%</small></div>`;
  if(feat('morale')){const ps=teamPl(0),avg=Math.round(ps.reduce((a,p)=>a+mor(p),0)/Math.max(1,ps.length)),sad=ps.filter(p=>mor(p)<40).sort((a,b)=>mor(a)-mor(b)).slice(0,3);side+=`<div class="card"><h3>Dressing room</h3><p>Team spirit: <b>${morTxt(avg)}</b> (${avg})</p>${sad.length?`<p class="small">Unhappy: ${sad.map(p=>plink(p)+(p.req?' (wants to leave)':'')).join(', ')}</p>`:''}</div>`}
  if(feat('cup')&&R.cup&&R.cup.s===R.season){const C=R.cup,out=C.res.some(r=>(r.a===0||r.b===0)&&r.w!==0);side+=`<div class="card"><h3>Cup</h3><p>${C.win!=null?`Won by ${tlink(C.win)}`:out?'You are out.':C.rd>=cupNR()?'':C.pend&&cupDue()?`${cupName(C.rd)}: your match is up next.`:`Next: ${cupName(C.rd)} (around matchday ${C.days[C.rd]+1})`}</p></div>`}
  if(head&&add)head.insertAdjacentHTML('afterend',add);if(side){const cols=main.querySelector('.cols');if(cols)cols.insertAdjacentHTML('beforebegin',`<div class="cols">${side}</div>`)}
  if(feat('recap')&&R.recap)recapUI()}catch(e){console.error(e)}}}
// ---------- preseason camp ----------
function campGo(k){const T=teamPl(0);let n=0;if(k=='fit'){R.campFit=R.day+10;n=T.length}else T.forEach(p=>{const ok=k=='att'?['ST','WG','CM'].includes(p.pos):k=='def'?['CB','FB','GK'].includes(p.pos):p.age<=21;if(ok){hUp(p,k=='def'&&p.pos=='GK'?'gk':k=='def'?'def':k=='att'?(p.pos=='CM'?'pas':'sho'):bestGroup(p),2);n++}});
 R.camp='done';addNews(`Preseason camp done: ${({fit:'fitness',att:'attack',def:'defense',young:'young players'})[k]} focus.`,1);hSave();toast('Camp done');homeUI()}
{const _dy=dailyStuff;dailyStuff=function(){const keep=R.campFit>R.day?teamPl(0).map(p=>[p,p.inj]):null;_dy();if(keep)keep.forEach(([p,i])=>{if(!i&&p.inj&&rnd()<.6)p.inj=0})}}
// ---------- transfer offers and requests ----------
function offerTick(){if(!feat('offers'))return;R.offers=R.offers.filter(o=>{const p=R.pl.find(q=>q.id===o.id);return p&&p.tid===0&&o.until>=R.day});if(R.offers.length>=3||rnd()>(R.stage=='window'?.5:.12))return;
 const c=teamPl(0).filter(p=>!R.offers.some(o=>o.id===p.id)).map(p=>[p,ovr(p)+(p.req?15:0)+gauss()*6]).sort((a,b)=>b[1]-a[1]).slice(0,8);if(!c.length||teamPl(0).length<=16)return;const p=pick(c)[0],t=pick(R.t.map((_,i)=>i).filter(i=>i>0&&R.t[i].bud>=valueOf(p)*.8&&teamOvr(i)>=ovr(p)-8));if(t==null)return;
 R.offers.push({id:p.id,t,fee:Math.round(valueOf(p)*(.9+rnd()*.45)*10)/10,until:R.day+4});addNews(`${R.t[t].n} have made an offer for ${p.n}.`,1)}
function offerYes(i){const o=R.offers[i];if(!o)return;const p=R.pl.find(q=>q.id===o.id);R.offers.splice(i,1);if(!p||p.tid!==0)return homeUI();if(teamPl(0).length<=16){toast('Your squad is too small to sell.');return homeUI()}
 if(feat('hof'))legendCheck(p);p.tid=o.t;fixNum(p,o.t);R.t[o.t].bud-=o.fee;R.cash=Math.round((R.cash+o.fee)*10)/10;R.xi[0]=null;R.xi[o.t]=null;p.req=0;p.mor=75;addNews(`You sold ${p.n} to ${R.t[o.t].n} for ${money(o.fee)}.`,1);hSave();homeUI()}
function offerNo(i){const o=R.offers[i];if(!o)return;const p=R.pl.find(q=>q.id===o.id);R.offers.splice(i,1);if(p&&p.req)setMor(p,-8);hSave();homeUI()}
function reqTick(){if(!feat('treq')||!feat('morale'))return;teamPl(0).forEach(p=>{if(!p.req&&mor(p)<30&&ovr(p)>=60&&rnd()<.15){p.req=1;addNews(`${p.n} has handed in a transfer request.`,1)}else if(p.req&&mor(p)>=60){p.req=0;addNews(`${p.n} has withdrawn his transfer request.`,1)}})}
{const _wd=windowDay;windowDay=function(n){_wd(n);try{offerTick()}catch(e){}}}
// ---------- player of the month ----------
function potmSnap(){const o={};R.pl.forEach(p=>{if(p.tid>=0)o[p.id]=[p.ss[SI.gp],p.ss[SI.rat],p.ss[SI.g],p.ss[SI.a]]});return o}
function potmTick(){if(!feat('potm')||!R.potm)return;if(R.day-R.potm.from<4)return;const s=R.potm.snap;let best=null;R.pl.forEach(p=>{if(p.tid<0||!s[p.id])return;const gp=p.ss[SI.gp]-s[p.id][0];if(gp<3)return;const r=(p.ss[SI.rat]-s[p.id][1])/gp,g=p.ss[SI.g]-s[p.id][2],a=p.ss[SI.a]-s[p.id][3],v=r+g*.15+a*.08;if(!best||v>best.v)best={p,v,r,g,a}});
 if(best){const p=best.p;p.aw.push(`${R.season} Player of the Month`);addNews(`Player of the month: ${p.n} (${R.t[p.tid].ab}), ${best.g} goals, ${best.a} assists, ${best.r.toFixed(1)} average rating.`,p.tid===0);if(p.tid===0){setMor(p,6);achGet('potm')}}R.potm={from:R.day,snap:potmSnap()}}
// ---------- storylines ----------
function story(k,txt,mine){if(R.storyK[k])return;R.storyK[k]=1;addNews(txt,mine)}
function storyTick(){if(!feat('story'))return;const f=R.t[0].form5,last=f.slice(-3),tb=table(),pos=tb.indexOf(0)+1,left=R.sched.length-R.day;
 if(f.length>=5&&f.every(x=>x=='W'))story('w5'+R.day,`${R.t[0].n} have won five in a row.`,1);if(last.length==3&&last.every(x=>x=='L'))story('l3'+R.day,`Pressure is building: ${R.t[0].n} have lost three in a row.`,1);
 const unb=R.box.filter(b=>b.s===R.season&&!b.cup).slice(-10);if(unb.length==10&&unb.every(b=>{const m=b.a===0?0:1;return b.sc[m]>=b.sc[1-m]}))story('unb10'+Math.floor(R.day/10),`${R.t[0].n} are unbeaten in ten league matches.`,1);
 if(left<=6&&left>0){const gap=tpts(tb[0])-tpts(tb[1]);if(pos<=2&&gap<=3)story('race',`Title race: ${R.t[tb[0]].n} and ${R.t[tb[1]].n} are separated by ${gap} point${gap==1?'':'s'} with ${left} to play.`,1);if(pos>=16&&divOf(0)===1&&R.t.some(t=>t.dv==2))story('drop',`Relegation fight: ${R.t[0].n} are ${pos}${ord(pos)} with ${left} matches left.`,1)}
 const sc=R.pl.filter(p=>p.tid>=0).sort((a,b)=>b.ss[SI.g]-a.ss[SI.g]);if(sc[0]&&sc[0].tid===0&&sc[0].ss[SI.g]>=8)story('boot'+sc[0].id,`${sc[0].n} leads the league with ${sc[0].ss[SI.g]} goals.`,1);
 if(sc[0]&&sc[0].ss[SI.g]>=20)story('g20'+sc[0].id,`${sc[0].n} (${R.t[sc[0].tid].ab}) has scored 20 goals this season.`,sc[0].tid===0)}
// ---------- achievements ----------
const ACH=[['win1','First win','Win a match'],['cs','Shut out','Keep a clean sheet'],['rout','Rout','Win by four or more'],['derby','Derby day','Win a derby'],['hat','Hat-trick hero','Score a hat-trick in a match you play'],['potm','Player of the month','One of your players wins it'],['top4','Top four','Finish in the top four'],['title','Champions','Win the league'],['cup','Cup winners','Win the cup'],['double','The double','Win the league and the cup in the same season'],['unbeat','Invincibles','Go a whole league season unbeaten'],['boot','Golden Boot','One of your players wins the Golden Boot'],['star','Star signing','Have an 80+ player in your squad'],['acad','Academy graduate','A player who came through your academy reaches 70'],['rich','Big budget','Have €100M to spend'],['s5','Long service','Finish five seasons']];
let ACHQ=[],ACHT=null;
function achGet(k){if(!feat('ach')||!R.ach||R.ach[k])return;R.ach[k]={s:R.season};const a=ACH.find(x=>x[0]==k);if(a){addNews(`Achievement unlocked: ${a[1]}.`,1);ACHQ.push(a[1]);
 // several at once (often at the end of a season) become one message
 if(!ACHT)ACHT=setTimeout(()=>{try{toast(ACHQ.length>1?`${ACHQ.length} achievements unlocked: ${ACHQ.join(', ')}`:'Achievement: '+ACHQ[0])}catch(e){}ACHQ=[];ACHT=null},400)}}
function achTick(){if(!feat('ach'))return;if(teamPl(0).some(p=>ovr(p)>=80))achGet('star');if(R.cash>=100)achGet('rich');if(teamPl(0).some(p=>p.acad&&ovr(p)>=70))achGet('acad')}
{const _sc=scored;scored=function(k,e){_sc(k,e);try{if(G&&!G.auto&&e&&e.t===0&&k===0&&G.hot&&G.hot[e.p.id]===3)achGet('hat')}catch(x){}}}
function achUI(){PAGE='ach';const n=ACH.filter(a=>R.ach[a[0]]).length;shell(`<div class="head"><h1>Achievements</h1><p>${n} of ${ACH.length} unlocked.</p></div><div class="card"><table class="t">${ACH.map(([k,n,d])=>`<tr class="${R.ach[k]?'me':''}"><td>${R.ach[k]?'🏆':'·'}</td><td><b>${n}</b></td><td>${d}</td><td>${R.ach[k]?'Season '+R.ach[k].s:''}</td></tr>`).join('')}</table></div>`)}
// ---------- season end: board, recap, records, achievements ----------
{const _se=seasonEnd;seasonEnd=function(){_se();try{const tb=table(),pos=tb.indexOf(0)+1,aw=R.hist[R.hist.length-1],mine=R.box.filter(b=>b.s===R.season&&!b.cup);
 if(pos<=4)achGet('top4');if(pos===1&&divOf(0)===1)achGet('title');if(pos===1&&divOf(0)===1&&R.cup&&R.cup.win===0)achGet('double');if(mine.length&&mine.every(b=>{const m=b.a===0?0:1;return b.sc[m]>=b.sc[1-m]})&&mine.length>=R.sched.length)achGet('unbeat');
 const bp=R.pl.find(p=>p.id===aw.boot);if(bp&&bp.tid===0)achGet('boot');if(R.season>=5)achGet('s5');
 const bv=boardEnd();recordsCheck();
 if(feat('recap')){const top=teamPl(0).sort((a,b)=>b.ss[SI.g]-a.ss[SI.g])[0],best=teamPl(0).filter(p=>p.ss[SI.gp]>=5).sort((a,b)=>avgRat(b)-avgRat(a))[0],T=R.t[0];
  R.recap={s:R.season,pos,w:T.w,d:T.d,l:T.l,gf:T.gf,ga:T.ga,pts:tpts(0),champ:aw.champ,top:top?[top.n,top.ss[SI.g]]:null,best:best?[best.n,avgRat(best)]:null,cup:R.cup&&R.cup.s===R.season?(R.cup.win===0?'Won the cup':(()=>{const r=R.cup.res.filter(x=>x.a===0||x.b===0).pop();return r?`Out in the ${cupName(r.rd).toLowerCase()}`:''})()):'',board:bv,aw:['boot','pots','young','glove'].map(k=>{const p=R.pl.find(q=>q.id===aw[k]);return p&&p.tid===0?`${p.n}: ${({boot:'Golden Boot',pots:'Player of the Season',young:'Young Player of the Season',glove:'Golden Glove'})[k]}`:null}).filter(Boolean)}}}catch(e){console.error(e)}}}
function recapUI(){const r=R.recap;R.recap=null;hSave();modal(`<h2>Season ${r.s} recap</h2><p style="font-size:20px"><b>${r.pos}${ord(r.pos)}</b> · ${r.pts} points · ${r.w}-${r.d}-${r.l} · goals ${r.gf}-${r.ga}</p>
 <p>Champions: <b>${esc(R.t[r.champ].n)}</b>${r.cup?` · Cup: ${esc(r.cup)}`:''}</p>${r.top?`<p>Top scorer: <b>${esc(r.top[0])}</b> (${r.top[1]} goals)</p>`:''}${r.best?`<p>Best player: <b>${esc(r.best[0])}</b> (${r.best[1].toFixed(2)} average rating)</p>`:''}${r.aw.length?`<p>Awards: ${r.aw.map(esc).join(' · ')}</p>`:''}${r.board?`<p><i>${esc(r.board)}</i></p>`:''}${B('closeModal()','Continue','big')}`)}
// ---------- records and the hall of fame ----------
function careerOf(p){const c=p.car.filter(x=>x[1]>=0);const s=k=>c.reduce((a,x)=>a+x[2+SI[k]],0)+p.ss[SI[k]];return{gp:s('gp'),g:s('g'),a:s('a'),cs:s('cs')}}
function recordsCheck(){if(!feat('hof'))return;const set=(k,n,v,p)=>{const r=R.rec[k];if(!r||v>r.v){R.rec[k]={n,v,p:p.n,t:R.t[p.tid]?R.t[p.tid].ab:'',s:R.season};if(r)addNews(`New record: ${n}, ${p.n} with ${v}.`,p.tid===0)}};
 R.pl.filter(p=>p.tid>=0).forEach(p=>{set('g','Most goals in a season',p.ss[SI.g],p);set('a','Most assists in a season',p.ss[SI.a],p);set('cs','Most clean sheets in a season',p.pos=='GK'?p.ss[SI.cs]:0,p)});
 const tb=table(),T=R.t[tb[0]];const tr=R.rec.pts;if(!tr||tpts(tb[0])>tr.v)R.rec.pts={n:'Most points in a season',v:tpts(tb[0]),p:T.n,t:T.ab,s:R.season}}
function hofCheck(){if(!feat('hof'))return;R.pl.forEach(p=>{if(p.age<34||p.hofd)return;const c=careerOf(p),aw=p.aw.length;if(c.g>=120||aw>=6||c.gp>=450&&aw>=2){/* likely to retire soon: store when they do */p.hofc=1}});
 // players who will be removed by retirement are handled by checking after the season rolls over
 HOFPRE=R.pl.filter(p=>p.hofc).map(p=>({id:p.id,n:p.n,pos:p.pos,c:careerOf(p),aw:p.aw.slice(),t:p.tid>=0&&R.t[p.tid]?R.t[p.tid].n:''}))}
let HOFPRE=[];
{const _ns=newSeason;newSeason=function(){const pre=new Set(R.pl.map(p=>p.id)),mineOld=teamPl(0).map(p=>p.id);_ns();try{if(!feat('hof'))return;const now=new Set(R.pl.map(p=>p.id));HOFPRE.forEach(h=>{if(!now.has(h.id)&&pre.has(h.id)&&!R.hof.some(x=>x.id===h.id)){R.hof.push(Object.assign({s:R.season-1},h));addNews(`${h.n} retires and goes into the Hall of Fame.`,1)}});HOFPRE=[]}catch(e){}}}
function legendCheck(p){const c=careerOf(p);if(c.gp>=60&&!R.legends.some(x=>x.id===p.id))R.legends.push({id:p.id,n:p.n,pos:p.pos,c,s:R.season})}
function hofUI(){PAGE='hof';const recs=Object.values(R.rec);shell(`<div class="head"><h1>Records and Hall of Fame</h1></div><div class="card"><h3>League records</h3><table class="t">${recs.map(r=>`<tr><td>${esc(r.n)}</td><td><b>${r.v}</b></td><td>${esc(r.p)} ${r.t?'('+esc(r.t)+')':''}</td><td>Season ${r.s}</td></tr>`).join('')||'<tr><td>Records are set at the end of each season.</td></tr>'}</table></div>
 <div class="card"><h3>Hall of Fame</h3><table class="t">${R.hof.map(h=>`<tr><td><b>${esc(h.n)}</b></td><td>${h.pos}</td><td>${h.c.gp} matches · ${h.c.g} goals · ${h.c.a} assists</td><td>${h.aw.length} awards</td><td>Retired ${h.s}</td></tr>`).join('')||'<tr><td>Great careers end up here when the player retires.</td></tr>'}</table></div>
 ${R.legends.length?`<div class="card"><h3>Your club's former players</h3><table class="t">${R.legends.map(h=>`<tr><td>${esc(h.n)}</td><td>${h.pos}</td><td>${h.c.gp} matches · ${h.c.g} goals</td><td>Left ${h.s}</td></tr>`).join('')}</table></div>`:''}`)}
// ---------- pages: power rankings, team stats, results, staff, finances, tactics ----------
function powerScore(t){const T=R.t[t],gp=T.w+T.d+T.l,ppg=gp?tpts(t)/gp:1.4,f=T.form5.reduce((a,x)=>a+(x=='W'?3:x=='D'?1:0),0)/Math.max(1,T.form5.length);return ppg*20+f*8+teamOvr(t)*.8+(gp?(T.gf-T.ga)/gp*5:0)}
function powerUI(){PAGE='power';const L=R.t.map((_,i)=>i).filter(i=>divOf(i)===divOf(0)).sort((a,b)=>powerScore(b)-powerScore(a)),tb=table();R.pwPrev=R.pwPrev||{};const prev=R.pwPrev;
 shell(`<div class="head"><h1>Power rankings</h1><p>Form, results and squad strength.</p></div><div class="card"><table class="t"><tr><th>#</th><th></th><th>Club</th><th>Table</th><th>Form</th><th>Team</th></tr>${L.map((t,i)=>{const p=prev[t],mv=p==null?'':p>i+1?`<span class="w">▲${p-i-1}</span>`:p<i+1?`<span class="l">▼${i+1-p}</span>`:'–';return`<tr class="${t===0?'me':''}"><td>${i+1}</td><td>${mv}</td><td>${tlink(t)}</td><td>${tb.indexOf(t)+1}${ord(tb.indexOf(t)+1)}</td><td>${formHTML(t)}</td><td>${ovrPill(teamOvr(t))}</td></tr>`}).join('')}</table></div>`);
 if(R.pwDay!==R.day){R.pwDay=R.day;const o={};L.forEach((t,i)=>o[t]=i+1);R.pwPrev=o}}
function tstatsUI(){PAGE='tstats';const rows=R.t.map((T,t)=>{if(divOf(t)!==divOf(0))return null;const ps=R.pl.filter(p=>p.tid===t),s=k=>ps.reduce((a,p)=>a+p.ss[SI[k]],0),gp=T.w+T.d+T.l;return{t,gp,gf:T.gf,ga:T.ga,sh:s('sh'),sot:s('sot'),yc:s('yc'),rc:s('rc'),cs:ps.filter(p=>p.pos=='GK').reduce((a,p)=>a+p.ss[SI.cs],0),pas:s('pas'),pac:s('pac')}}).filter(Boolean).sort((a,b)=>b.gf-a.gf);
 shell(`<div class="head"><h1>Team stats</h1></div><div class="card"><div class="tw"><table class="t"><tr><th>Club</th><th>P</th><th>Goals</th><th>Against</th><th>Shots</th><th>On target</th><th>Pass %</th><th>Clean sheets</th><th>Yellow</th><th>Red</th></tr>${rows.map(r=>`<tr class="${r.t===0?'me':''}"><td>${tlink(r.t)}</td><td>${r.gp}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.sh}</td><td>${r.sot}</td><td>${r.pas?Math.round(r.pac/r.pas*100):0}%</td><td>${r.cs}</td><td>${r.yc}</td><td>${r.rc}</td></tr>`).join('')}</table></div></div>`)}
function resultsUI(){PAGE='results';const L=R.box.map((b,k)=>[b,k]).filter(([b])=>b.s===R.season).reverse();shell(`<div class="head"><h1>Results</h1><p>Season ${R.season}. Click a match for the box score.</p></div><div class="card"><table class="t">${L.map(([b,k])=>{const m=b.a===0?0:1,o=b.a===0?b.b:b.a,r=b.sc[m]>b.sc[1-m]?'W':b.sc[m]<b.sc[1-m]?'L':'D';return`<tr class="click" onclick="boxUI(${k})"><td>${b.cup?esc(b.cup):'Matchday '+(b.d+1)}</td><td>${b.a===0?'vs':'at'} ${esc(R.t[o].n)}</td><td class="${r=='W'?'w':r=='L'?'l':''}"><b>${r} ${b.sc[m]}-${b.sc[1-m]}</b></td><td>${b.played?'played':'sim'}</td></tr>`}).join('')||'<tr><td>No matches yet this season.</td></tr>'}</table></div>`)}
const STAFFN={coach:['Training coach','Young and prime-age players improve faster'],fit:['Fitness coach','Injured players get back sooner'],youth:['Academy director','Academy players come up with more potential'],scout:['Chief scout','Reports on the best young players in the league']};
const staffCost=lv=>lv==1?4:lv==2?8:0;
function staffUI(){PAGE='staff';shell(`<div class="head"><h1>Coaching staff</h1><p>${money(R.cash)} to spend.</p></div><div class="card"><table class="t">${Object.keys(STAFFN).map(k=>{const lv=R.staff[k];return`<tr><td><b>${STAFFN[k][0]}</b><br><small>${STAFFN[k][1]}</small></td><td>${'★'.repeat(lv)}${'☆'.repeat(3-lv)}</td><td>${lv<3?B(`staffUp('${k}')`,`Hire a better one: ${money(staffCost(lv))}`,'xs'+(R.cash>=staffCost(lv)?'':' off')):'Best there is'}</td></tr>`}).join('')}</table></div>
 ${R.staff.scout>1?`<div class="card"><h3>Scout report: young players to watch</h3><table class="t">${R.pl.filter(p=>p.tid>0&&p.age<=21).sort((a,b)=>(b.pot||0)-(a.pot||0)||SK.reduce((s,k)=>s+b.mx[k],0)-SK.reduce((s,k)=>s+a.mx[k],0)).slice(0,R.staff.scout*4).map(p=>`<tr><td>${plink(p)}</td><td>${esc(R.t[p.tid].ab)}</td><td>${p.pos}</td><td>${p.age}</td><td>${ovrPill(ovr(p))}</td><td>${pot(p)}</td><td>${money(valueOf(p))}</td></tr>`).join('')}</table></div>`:''}`)}
function staffUp(k){const lv=R.staff[k],c=staffCost(lv);if(lv>=3||R.cash<c)return toast('Not enough money.');R.cash=Math.round((R.cash-c)*10)/10;R.staff[k]=lv+1;addNews(`You hired a new ${STAFFN[k][0].toLowerCase()}.`,1);hSave();staffUI()}
function finUI(){PAGE='fin';const wage=teamPl(0).reduce((a,p)=>a+p.sal,0),cost=12+R.fin.lv*6;shell(`<div class="head"><h1>Finances</h1><p>${money(R.cash)} to spend · wage bill ${money(wage)} a season</p></div>
 <div class="cols"><div class="card"><h3>Stadium</h3><p>${feat('stad2')?esc(stadName(0))+' · ':''}<b>${R.fin.cap.toLocaleString()}</b> seats</p>${R.fin.lv<4?B('stadUp()',`Add 6,000 seats: ${money(cost)}`,R.cash>=cost?'':'off'):'<p>The stadium is as big as it can get.</p>'}<p class="small">Each home match earns about €12 a fan. Winning brings bigger crowds.</p></div>
 <div class="card"><h3>Income</h3><table class="t">${R.fin.inc.slice(0,15).map(x=>`<tr><td>${esc(x.t)}</td><td class="w">+${money(x.v)}</td></tr>`).join('')||'<tr><td>Play a home match.</td></tr>'}</table></div></div>`)}
function stadUp(){const cost=12+R.fin.lv*6;if(R.fin.lv>=4||R.cash<cost)return toast('Not enough money.');R.cash=Math.round((R.cash-cost)*10)/10;R.fin.lv++;R.fin.cap+=6000;addNews(`The stadium grows to ${R.fin.cap.toLocaleString()} seats.`,1);hSave();finUI()}
function planUI(){PAGE='plan';R.tac0=R.tac0||{m:'bal',p:'mid',w:'norm',s:'mix'};const c=R.tac0,sel=(f,O)=>`<select onchange="R.tac0.${f}=this.value;hSave()">${Object.keys(O).map(k=>`<option value="${k}" ${c[f]==k?'selected':''}>${O[k][0]}</option>`).join('')}</select>`;
 shell(`<div class="head"><h1>Tactics</h1><p>Your starting tactics for every match${feat('plan')?', and how simmed matches are played':''}.</p></div><div class="card"><div class="row"><label>Mentality ${sel('m',MENT)}</label><label>Pressing ${sel('p',PRESS)}</label><label>Width ${sel('w',WIDTH)}</label><label>Passing ${sel('s',STYLE)}</label></div><p class="small">Attacking tactics score more but leave gaps at the back.</p></div>`)}
// ---------- save slots, undo, kit colors ----------
let UNDO=null;
{const _sg=simGameUI;simGameUI=function(){if(feat('undo'))UNDO=JSON.stringify(R);return _sg()}}
{const _sd=simDaysUI;simDaysUI=function(n){if(feat('undo'))UNDO=JSON.stringify(R);return _sd(n)}}
{const _cs=cupSimMine;cupSimMine=function(){if(feat('undo'))UNDO=JSON.stringify(R);return _cs()}}
{const _pg=playGame;playGame=function(...a){UNDO=null;return _pg.apply(this,a)}}
function undoGo(){if(!UNDO)return;R=JSON.parse(UNDO);UNDO=null;hSave();toast('The last sim was undone.');homeUI()}
function slotGo(n){hSave();OPT.slot=n;optSave();UNDO=null;if(hLoad()&&R&&R.t)homeUI();else{R=null;startUI()}}
function slotInfo(n){try{const s=lsGet(n>1?HKEY+'_'+n:HKEY);if(!s)return'Empty';const r=JSON.parse(s);return`${esc(r.t[0].n)}, season ${r.season}`}catch(e){return'Empty'}}
{const _su=setUI;setUI=function(){_su();try{const m=document.querySelector('.main');let h='';
 if(feat('slots'))h+=`<div class="card"><h3>Save slots</h3><table class="t">${[1,2,3].map(n=>`<tr class="${(OPT.slot||1)==n?'me':''}"><td>Slot ${n}</td><td>${slotInfo(n)}</td><td>${(OPT.slot||1)==n?'<b>Playing</b>':B(`slotGo(${n})`,'Switch','xs')}</td></tr>`).join('')}</table></div>`;
 if(feat('kits'))h+=`<div class="card"><h3>Kit colors</h3><div class="row"><label>Shirt <input type="color" value="${R.t[0].col[0]}" onchange="R.t[0].col=[this.value,R.t[0].col[1]];hSave()"></label><label>Shorts and trim <input type="color" value="${R.t[0].col[1]}" onchange="R.t[0].col=[R.t[0].col[0],this.value];hSave()"></label></div></div>`;
 if(h&&m)m.insertAdjacentHTML('beforeend',h)}catch(e){}}}
// ---------- the player page and the sidebar ----------
{const _pu=playerUI;playerUI=function(id){_pu(id);try{const p=R.pl.find(q=>q.id===id);if(!p)return;const h=$('modal').querySelector('.ph p')||$('modal').querySelector('p');let t='';if(feat('pers'))t+=` · <span title="${esc(PERSD[persOf(p)])}">${persOf(p)}</span>`;if(feat('morale')&&p.tid===0)t+=` · ${morTxt(mor(p))}`;if(p.req&&feat('treq'))t+=' · <b>wants to leave</b>';if(h&&t)h.insertAdjacentHTML('beforeend',t)}catch(e){}}}
{const add=[['plan','Tactics','planUI()','squad'],['results','Results','resultsUI()','fix'],['power','Power rankings','powerUI()','table'],['tstats','Team stats','tstatsUI()','lead'],['staff','Staff','staffUI()','fa'],['fin','Finances','finUI()','staff'],['ach','Achievements','achUI()','hist'],['hof','Records','hofUI()','ach']];
 add.forEach(([k,n,f,after])=>{if(NAV.some(x=>x[0]==k))return;const i=NAV.findIndex(x=>x[0]==after);NAV.splice(i<0?NAV.length:i+1,0,[k,n,f])})}
{const _no=navOK;navOK=function(k){const need={plan:'tact',results:'results',power:'power',tstats:'tstats',staff:'staff',fin:'fin',ach:'ach',hof:'hof'}[k];if(need&&!feat(need))return false;return _no(k)}}
