'use strict';
// More: player 2 free throws, phones (turn sideways, smaller HUD), team logos, keeping highlights, All-Star weekend with a
// playable 3-point contest, Hall of Fame and records, trade requests, CPU trades and the trade deadline, the play-in
// tournament, and changing the season length for next season.
{const add=[['Presentation','logos','Team logos','Every team gets a logo on the standings, schedule and team pages.'],
 ['Franchise','allstar','All-Star weekend','At midseason: the All-Star game and a 3-point contest you can play.'],
 ['Franchise','hof','Hall of Fame and records','Great players are inducted when they retire; single-game, season and team records are kept.'],
 ['Franchise','treq','Trade requests and CPU trades','Unhappy players ask to be traded, other teams trade with each other, and there is a trade deadline.'],
 ['Franchise','playin','Play-in tournament','Seeds 7 to 10 in each conference play for the last two playoff spots.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
// ---------- player 2 free throws with the meter ----------
{const _fs=ftStep;ftStep=function(dt){const f=G&&G.ft;if(f&&G.ctl2&&f.e.t===1&&feat('meter')&&G.b.st=='held'){G.pt-=dt;if(G.pt>0)return;if(f.meter2){f.meter2.t+=dt;if(f.meter2.t>MT*1.3)p2FtRelease()}return}return _fs(dt)}}
function p2FtRelease(){const f=G.ft;if(!f||!f.meter2)return;const v=f.meter2.t/MT,w=meterWin(f.e.p,'ft'),dv=Math.abs(v-.93);f.meter2=null;ftShoot(dv<w?.08:dv<w*2.2?.02:-Math.min(.35,(dv-w*2.2)*1.1))}
{const _pk=p2Key;p2Key=function(code,down){if(G&&G.phase=='ft'&&G.ctl2&&code=='Slash'){const f=G.ft;if(f&&f.e.t===1&&G.b.st=='held'&&G.pt<=0){if(down&&!f.meter2)f.meter2={t:0};else if(!down)p2FtRelease()}return true}return _pk(code,down)}}
// ---------- phones: turn sideways, and a smaller HUD on small screens ----------
{const _dh=drawHUD;drawHUD=function(){if(VW>=980)return _dh();const k=Math.max(.55,VW/980),sv=[VW,VH,S,OX,OY];VW/=k;VH/=k;S/=k;OX/=k;OY/=k;CX.save();CX.scale(k,k);try{_dh()}finally{CX.restore();[VW,VH,S,OX,OY]=sv}}}
function rotCheck(){const show=!$('gamewrap').hidden&&innerWidth<innerHeight&&innerWidth<760;let d=$('hrot');if(show&&!d){d=document.createElement('div');d.id='hrot';d.innerHTML='<div>&#8635;<br>Turn your phone sideways to play</div>';document.body.appendChild(d)}if(d)d.hidden=!show;if(show&&G)G.paused=true}
addEventListener('resize',rotCheck);addEventListener('orientationchange',()=>setTimeout(()=>{rotCheck();if(G){hResize();if(innerWidth>innerHeight&&$('modal').hidden)G.paused=false}},300));
{const _pg=playGame;playGame=function(...a){const r=_pg.apply(this,a);rotCheck();return r}}
// ---------- team logos ----------
const LSH=['M32 10 L38 26 L55 26 L41 36 L46 53 L32 43 L18 53 L23 36 L9 26 L26 26Z','M36 6 L20 34 L31 34 L26 58 L46 26 L34 26Z','M14 44 L18 20 L26 32 L32 14 L38 32 L46 20 L50 44Z','M32 8 Q52 20 46 44 Q32 58 18 44 Q12 20 32 8Z','M10 40 Q32 4 54 40 Q32 30 10 40Z','M32 10 A22 22 0 1 0 32.1 10Z'];
function logoSVG(t,sz){const T=R.t[t];if(!T)return'';sz=sz||20;const h=(T.n.length*7+t*3)%LSH.length,c=T.col;return`<svg class="logo2" width="${sz}" height="${sz}" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${c[0]}" stroke="${c[1]}" stroke-width="4"/><path d="${LSH[h]}" fill="${c[1]}" opacity=".9"/>${sz>=40?`<text x="32" y="60" text-anchor="middle" font-size="11" font-weight="900" fill="${c[1]}">${esc(T.ab)}</text>`:''}</svg>`}
{const _tl=tlink;tlink=function(t){return(feat('logos')?logoSVG(t,18)+' ':'')+_tl(t)}}
{const _tu=teamUI;teamUI=function(t){_tu(t);try{if(feat('logos')){const h=$('modal').querySelector('h2');if(h)h.insertAdjacentHTML('afterbegin',logoSVG(t,44)+' ')}}catch(e){}}}
{const _sh=shell;shell=function(h){_sh(h);try{if(feat('logos')&&R){const l=document.querySelector('.brand .logo');if(l)l.outerHTML=logoSVG(0,42)}}catch(e){}}}
// ---------- highlights: keep up to 40, and star the ones you never want to lose ----------
hlSave=function(){if(!G||!G.hls||!G.hls.length)return;let L=hlList();G.hls.slice(0,3).forEach(h=>L.unshift(h));while(L.length>40){const i=L.map(x=>!!x.keep).lastIndexOf(false);if(i<0)break;L.splice(i,1)}if(!lsSet(HLKEY,JSON.stringify(L))){L=L.filter((x,i)=>x.keep||i<12);lsSet(HLKEY,JSON.stringify(L))}};
function hlKeep(i){const L=hlList();if(!L[i])return;L[i].keep=!L[i].keep;lsSet(HLKEY,JSON.stringify(L));hlUI()}
{const _hu=hlUI;hlUI=function(){_hu();try{document.querySelectorAll('#mainpg table.t tr').forEach((tr,i)=>{const L=hlList();if(!L[i])return;const td=tr.lastElementChild;if(td)td.insertAdjacentHTML('beforeend',B(`hlKeep(${i})`,L[i].keep?'&#9733; Kept':'&#9734; Keep','xs'))})}catch(e){}}}
// ---------- All-Star weekend ----------
function asScore(p){return pg(p,'pts')+pg(p,'orb')*.8+pg(p,'drb')*.5+pg(p,'ast')*1.1+pg(p,'stl')*1.5+pg(p,'blk')*1.3+wpct(p.tid)*6+ovr(p)*.15}
function asPick(){const el=R.pl.filter(p=>p.tid>=0&&p.ss[SI.gp]>=Math.max(2,R.day*.4));const conf=c=>el.filter(p=>R.t[p.tid].conf==c).sort((a,b)=>asScore(b)-asScore(a)).slice(0,12);
 const shooters=el.filter(p=>p.ss[SI.tpa]>=R.day*1.5).sort((a,b)=>(b.sk.thr+b.ss[SI.tpm]/Math.max(1,b.ss[SI.tpa])*40)-(a.sk.thr+a.ss[SI.tpm]/Math.max(1,a.ss[SI.tpa])*40)).slice(0,8);
 R.as={s:R.season,e:conf(0).map(p=>p.id),w:conf(1).map(p=>p.id),three:shooters.map(p=>p.id),done:0};[...R.as.e,...R.as.w].forEach(id=>{const p=R.pl.find(q=>q.id===id);p.aw.push(`${R.season} All-Star`)});
 addNews(`All-Stars announced. ${[...R.as.e,...R.as.w].filter(id=>R.pl.find(q=>q.id===id).tid===0).length} from your team.`,1)}
{const _ed=endDay;endDay=function(){_ed();try{if(!feat('allstar')||R.po||R.stage)return;const half=Math.floor(R.sched.length/2);if(R.day===half&&(!R.as||R.as.s!==R.season))asPick();else if(R.as&&R.as.s===R.season&&!R.as.done&&R.day>half)asSimAll()}catch(e){console.error(e)}}}
function contestShot(p,q){return rnd()<clamp(.36+(p.sk.thr-66)*.008+(q||0),.15,.85)}
function contestSim(p){let s=0;for(let r=0;r<5;r++)for(let b=0;b<5;b++)if(contestShot(p,gauss()*.03))s+=b==4?2:1;return s}
function asSimAll(){const A=R.as;if(!A||A.done)return;if(!A.res3){A.res3=A.three.map(id=>[id,contestSim(R.pl.find(q=>q.id===id))])}asFinish()}
function asFinish(){const A=R.as;A.res3.sort((a,b)=>b[1]-a[1]);const w3=R.pl.find(q=>q.id===A.res3[0][0]);if(w3){w3.aw.push(`${R.season} 3-point contest champion`);addNews(`3-point contest: ${w3.n} wins with ${A.res3[0][1]} points.`,w3.tid===0)}
 const side=ids=>ids.map(id=>R.pl.find(q=>q.id===id)).filter(Boolean),E=side(A.e),W=side(A.w),pts=L=>Math.round(L.reduce((s,p)=>s+pg(p,'pts')*.62+rnd()*3,0)+gauss()*8);let se=pts(E),sw=pts(W);if(se===sw)se++;
 const win=se>sw?E:W,mvp=win.slice().sort((a,b)=>asScore(b)+rnd()*8-asScore(a)-rnd()*8)[0];A.game=[se,sw,mvp&&mvp.id];if(mvp)mvp.aw.push(`${R.season} All-Star MVP`);addNews(`All-Star game: East ${se}, West ${sw}. MVP: ${mvp?mvp.n:''}.`,mvp&&mvp.tid===0);A.done=1;hSave()}
function asUI(){const A=R.as;if(!A)return;const nm=id=>{const p=R.pl.find(q=>q.id===id);return p?`${p.tid===0?'<b>':''}${esc(p.n)} <small>${esc(R.t[p.tid].ab)}</small>${p.tid===0?'</b>':''}`:''};
 const mine=A.three.map(id=>R.pl.find(q=>q.id===id)).filter(p=>p&&(typeof CAREER=='function'&&CAREER()?p.id===R.car.id:p.tid===0));
 modal(`<h2>All-Star weekend</h2><div class="cols"><div class="card"><h3>East</h3>${A.e.map(nm).join('<br>')}</div><div class="card"><h3>West</h3>${A.w.map(nm).join('<br>')}</div><div class="card"><h3>3-point contest</h3>${A.three.map(nm).join('<br>')}</div></div>
 ${A.done?`<p>East ${A.game[0]}, West ${A.game[1]}.</p>`:`<div class="row">${mine.length&&!A.res3?B(`c3Start(${mine[0].id})`,`Shoot the 3-point contest with ${esc(mine[0].ln)}`,'big'):''}${B('asSimAll();asUI()',A.res3?'Play the All-Star game':'Sim the weekend')}</div>`}`)}
// the playable 3-point contest: 5 racks of 5, the last ball of each rack counts double. Hit Space (or the button) in the green.
let C3=null;
function c3Start(id){const p=R.pl.find(q=>q.id===id);C3={p,r:0,b:0,s:0,t:0,run:1,log:[]};modal(`<h2>3-point contest: ${esc(p.n)}</h2><p class="small">Press Space or Shoot when the marker is in the green. The last ball of each rack (gold) is worth 2.</p><div id="c3m" class="c3m"><i id="c3w"></i><b id="c3k"></b></div><div id="c3r" class="c3r"></div><p id="c3s"></p>${B('c3Shoot()','Shoot','big')}`);$('modal').onclick=null;
 const w=meterWin(p,'thr')*2.2/1.3*100;$('c3w').style.left=(.93/1.3*100-w/2)+'%';$('c3w').style.width=w+'%';c3Draw();requestAnimationFrame(c3Tick)}
function c3Tick(){if(!C3||!C3.run||!$('c3k'))return;C3.t=(C3.t+1/60*.9)%1.3;$('c3k').style.left=(C3.t/1.3*100)+'%';requestAnimationFrame(c3Tick)}
function c3Draw(){const r=$('c3r');if(!r)return;let h='';for(let i=0;i<5;i++){h+='<div>';for(let j=0;j<5;j++){const L=C3.log[i*5+j];h+=`<span class="${j==4?'mb':''} ${L==null?'':L?'in':'out'}"></span>`}h+='</div>'}r.innerHTML=h;$('c3s').textContent=`Score: ${C3.s}`}
function c3Shoot(){if(!C3||!C3.run)return;const v=C3.t,w=meterWin(C3.p,'thr'),dv=Math.abs(v-.93),q=dv<w?.12:dv<w*2.2?.04:-Math.min(.3,(dv-w*2.2)*.8);const mk=contestShot(C3.p,q);C3.log.push(mk);if(mk)C3.s+=C3.b==4?2:1;C3.b++;if(C3.b==5){C3.b=0;C3.r++}c3Draw();
 if(C3.r==5){C3.run=0;const A=R.as;A.res3=A.three.map(id=>[id,id===C3.p.id?C3.s:contestSim(R.pl.find(q=>q.id===id))]);const sorted=A.res3.slice().sort((a,b)=>b[1]-a[1]),place=sorted.findIndex(x=>x[0]===C3.p.id)+1;
  $('c3s').innerHTML=`Final: <b>${C3.s}</b> · ${place==1?'You win the contest! 🏆':`${place}${['th','st','nd','rd'][place<4?place:0]} place (winner had ${sorted[0][1]})`}`;const m=$('modal').querySelector('.mbox');m.insertAdjacentHTML('beforeend',B('asUI()','Back to the All-Star weekend'));C3=null;hSave()}}
addEventListener('keydown',e=>{if(C3&&C3.run&&e.code=='Space'&&!$('modal').hidden){e.preventDefault();if(!e.repeat)c3Shoot()}});
{const _hu=homeUI;homeUI=function(){_hu();try{if(feat('allstar')&&R&&R.as&&R.as.s===R.season&&!R.as.done){const m=$('mainpg'),hd=m&&m.querySelector('.head');if(hd)hd.insertAdjacentHTML('afterend',`<div class="card hot"><h3>All-Star weekend</h3><p>The All-Stars are in town.</p>${B('asUI()','Go to the All-Star weekend','big')}</div>`)}}catch(e){console.error(e)}}}
// ---------- records and the Hall of Fame ----------
const RK=[['pts','Points'],['reb','Rebounds'],['ast','Assists'],['tpm','Threes made'],['stl','Steals'],['blk','Blocks']];
function recUpd(cat,key,v,p,extra){const r=R.recs=R.recs||{g:{},s:{},t:{}};const L=r[cat][key]=r[cat][key]||[];L.push({v,n:p?p.n:extra.n,t:p?R.t[p.tid]?R.t[p.tid].ab:'':extra.t,s:R.season,id:p?p.id:null});L.sort((a,b)=>b.v-a.v);if(L.length>5)L.length=5}
{const _rg=recGame;recGame=function(a,b,res,played){_rg(a,b,res,played);try{if(!feat('hof'))return;res.T.forEach(S=>S.ps.forEach((p,i)=>{const x=S.box[i],v={pts:x[SI.pts],reb:x[SI.orb]+x[SI.drb],ast:x[SI.ast],tpm:x[SI.tpm],stl:x[SI.stl],blk:x[SI.blk]};RK.forEach(([k])=>{const L=R.recs&&R.recs.g[k];if(!L||L.length<5||v[k]>L[L.length-1].v)recUpd('g',k,v[k],p)})}))}catch(e){}}}
{const _se=seasonEnd;seasonEnd=function(){try{if(feat('hof')){const el=R.pl.filter(p=>p.tid>=0&&p.ss[SI.gp]>=R.sched.length*.5);[['ppg','pts'],['rpg',null],['apg','ast']].forEach(([k,s])=>{el.forEach(p=>{const v=s?pg(p,s):pg(p,'orb')+pg(p,'drb');const L=R.recs&&R.recs.s[k];if(!L||L.length<5||v>L[L.length-1].v)recUpd('s',k,Math.round(v*10)/10,p)})});
  R.t.forEach((t,i)=>{const L=R.recs&&R.recs.t.w;const v=wpct(i);if(!L||L.length<5||v>L[L.length-1].v)recUpd('t','w',Math.round(v*1000)/1000,null,{n:`${t.n} (${t.w}-${t.l})`,t:t.ab})})}}catch(e){console.error(e)}_se()}}
function hofScore(p){const C=p.car.filter(c=>c[1]>=0);let g=0,pts=0,reb=0,ast=0;C.forEach(c=>{g+=c[2+SI.gp];pts+=c[2+SI.pts];reb+=c[2+SI.orb]+c[2+SI.drb];ast+=c[2+SI.ast]});if(g<40)return 0;const aw=p.aw.join(' ');
 return pts/g+reb/g*.6+ast/g*.8+(aw.match(/MVP/g)||[]).length*6+(aw.match(/Champion/g)||[]).length*2+(aw.match(/All-Star/g)||[]).length*1.5+(aw.match(/Player of the Year|Rookie|Sixth/g)||[]).length*2+C.length*.8}
{const _ns=newSeason;newSeason=function(){const before=new Map(R.pl.map(p=>[p.id,p]));_ns();try{if(!feat('hof'))return;const now=new Set(R.pl.map(p=>p.id));R.hof=R.hof||[];before.forEach((p,id)=>{if(now.has(id)||p.tid===-2)return;const sc=hofScore(p);if(sc>=34){const C=p.car.filter(c=>c[1]>=0);let g=0,pts=0,reb=0,ast=0;C.forEach(c=>{g+=c[2+SI.gp];pts+=c[2+SI.pts];reb+=c[2+SI.orb]+c[2+SI.drb];ast+=c[2+SI.ast]});
   R.hof.push({n:p.n,pos:p.pos,s:R.season,yrs:C.length,ppg:f1(pts/g),rpg:f1(reb/g),apg:f1(ast/g),aw:p.aw.filter(a=>!/week/.test(a)).length,team:R.t[C[C.length-1][1]]?R.t[C[C.length-1][1]].ab:''});addNews(`${p.n} is inducted into the Hall of Fame.`,C.some(c=>c[1]===0))}})}catch(e){console.error(e)}}}
function recordsUI(){PAGE='recs';const r=R.recs||{g:{},s:{},t:{}},T=(n,L,fmt)=>`<div class="card"><h3>${n}</h3><table class="t">${(L||[]).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.n)}</td><td>${esc(x.t)}</td><td>Season ${x.s}</td><td><b>${fmt?fmt(x.v):x.v}</b></td></tr>`).join('')||'<tr><td>None yet.</td></tr>'}</table></div>`;
 shell(`<div class="head"><h1>Records</h1><p>Single games include every game in the league; seasons need half the games played.</p></div><h3>Single game</h3><div class="grid3">${RK.map(([k,n])=>T(n,r.g[k])).join('')}</div><h3>Season</h3><div class="grid3">${T('Points per game',r.s.ppg)}${T('Rebounds per game',r.s.rpg)}${T('Assists per game',r.s.apg)}${T('Best record',r.t.w,v=>(v*100).toFixed(1)+'%')}</div>`)}
function hofUI(){PAGE='hof';let car=[];try{car=JSON.parse(lsGet('hoops_hof')||'[]')}catch(e){}shell(`<div class="head"><h1>Hall of Fame</h1><p>Players are inducted when they retire with a great career.</p></div><div class="card"><table class="t"><tr><th>Player</th><th>Pos</th><th>Inducted</th><th>Seasons</th><th>PPG</th><th>RPG</th><th>APG</th><th>Honors</th></tr>${(R.hof||[]).slice().reverse().map(h=>`<tr><td><b>${esc(h.n)}</b> <small>${esc(h.team)}</small></td><td>${h.pos}</td><td>${h.s}</td><td>${h.yrs}</td><td>${h.ppg}</td><td>${h.rpg}</td><td>${h.apg}</td><td>${h.aw}</td></tr>`).join('')||'<tr><td colspan="8">Nobody yet. It takes a few seasons for the first great players to retire.</td></tr>'}</table></div>
 ${car.length?`<div class="card"><h3>Your career-mode players</h3><table class="t">${car.map(c=>`<tr><td>${esc(c.n)}</td><td>${c.pos}</td><td>retired season ${c.s}</td><td>overall ${c.ovr}</td><td>${c.aw} honors</td></tr>`).join('')}</table></div>`:''}`)}
// ---------- trade requests, CPU trades and the deadline ----------
const deadline=()=>R&&!R.po&&!R.stage&&R.day>R.sched.length*.65;
{const _ds=dailyStuff;dailyStuff=function(){_ds();try{if(!feat('treq')||R.po||R.stage)return;
  teamPl(0).forEach(p=>{if(feat('morale')&&p.mor<25&&!p.req&&ovr(p)>=60&&!(typeof CAREER=='function'&&CAREER()&&p.id===R.car.id)){p.req=R.day;addNews(`${p.n} has asked to be traded.`,1)}if(p.req&&p.mor>45)delete p.req;if(p.req&&R.day-p.req==15){teamPl(0).forEach(q=>{if(q!==p)q.mor=clamp(q.mor-4,0,100)});addNews(`${p.n}'s trade request is hurting the locker room.`,1)}});
  if(!deadline()&&rnd()<.12){const a=ri(1,29),b=ri(1,29);if(a!==b){const pa=pick(teamPl(a).filter(p=>ovr(p)>=58)),c=pa&&teamPl(b).filter(p=>p.pos!==pa.pos&&Math.abs(pval(p)-pval(pa))<pval(pa)*.15)[0];if(pa&&c&&teamPl(a).length>=11&&teamPl(b).length>=11){pa.tid=b;c.tid=a;R.rot[a]=null;R.rot[b]=null;pa.mor=60;c.mor=60;if(feat('news'))addNews(`Trade: the ${R.t[a].n} send ${pa.n} to the ${R.t[b].n} for ${c.n}.`)}}}
  if(R.day===Math.floor(R.sched.length*.65)+1)addNews('The trade deadline has passed.',1)}catch(e){console.error(e)}}}
{const _tu=tradeUI;tradeUI=function(){if(feat('treq')&&deadline()){PAGE='trade';shell('<div class="head"><h1>Trade</h1><p>The trade deadline has passed. Trades open again after the season.</p></div>');return}_tu()}}
{const _co=cpuOffer;cpuOffer=function(){if(feat('treq')&&deadline())return;return _co()}}
{const _pu=playerUI;playerUI=function(id){_pu(id);try{const p=R.pl.find(q=>q.id===id);if(p&&p.req&&p.tid===0&&feat('treq')){const ph=$('modal').querySelector('.ph');if(ph)ph.insertAdjacentHTML('afterend','<p><b class="l">He has asked to be traded.</b> More minutes or winning can change his mind.</p>')}}catch(e){}}}
// ---------- the play-in tournament ----------
{const _sd=seeds;seeds=function(c){if(R&&R.piSeeds&&R.piSeeds[c])return R.piSeeds[c];return _sd(c)}}
{const _sp=startPlayoffs;startPlayoffs=function(){if(!feat('playin'))return _sp();const msgs=[];R.piSeeds={};
  [0,1].forEach(c=>{const s=seeds(c).slice(),g=(h,a)=>{const r=simGame(h,a);return r.sc[0]>r.sc[1]?[h,a,r.sc]:[a,h,[r.sc[1],r.sc[0]]]};const [w78,l78,s1]=g(s[6],s[7]),[w910,,s2]=g(s[8],s[9]),[w8,,s3]=g(l78,w910);
   msgs.push(`${['East','West'][c]} play-in: ${R.t[w78].ab} beat ${R.t[l78].ab} ${s1[0]}-${s1[1]} for the 7 seed; ${R.t[w8].ab} win the 8 seed.`);R.piSeeds[c]=s.slice(0,6).concat([w78,w8]).concat(s.slice(6).filter(t=>t!==w78&&t!==w8))});
  msgs.forEach(m=>addNews(m,1));_sp();delete R.piSeeds;R.piMsg=msgs}}
// ---------- season length for next season ----------
{const _ns=newSeason;newSeason=function(){_ns();try{if(R.nextSlen&&R.nextSlen!==R.slen){R.slen=R.nextSlen;R.sched=mkSchedule(R.slen);addNews(`This season is ${R.slen} games long.`,1)}delete R.nextSlen;hSave()}catch(e){}}}
{const _s=setUI;setUI=function(){_s();try{const c=$('mainpg').querySelector('.card');if(c)c.insertAdjacentHTML('beforeend',`<label>Season length from next season <select onchange="R.nextSlen=+this.value;hSave()">${[20,30,50,82].map(n=>`<option value="${n}" ${(R.nextSlen||R.slen)==n?'selected':''}>${n} games</option>`).join('')}</select></label>`)}catch(e){}}}
// ---------- menu ----------
{const i=NAV.findIndex(x=>x[0]=='hist');NAV.splice(i+1,0,['recs','Records','recordsUI()'],['hof','Hall of Fame','hofUI()'])}
{const _ok=navOK;navOK=function(k){if(k=='recs'||k=='hof')return feat('hof');return _ok(k)}}
if(typeof NAVC!='undefined')NAVC.push('recs','hof');
{const _st=standUI;standUI=function(){_st();try{if(feat('playin')){const p=$('mainpg').querySelector('.head p');if(p)p.textContent='Seeds 1-6 go straight to the playoffs; 7-10 play in for the last two spots.';$('mainpg').querySelectorAll('table.t').forEach(t=>{const rows=t.querySelectorAll('tr');[7,8,9,10].forEach(i=>{if(rows[i])rows[i].style.background='#f9731612'});if(rows[6])rows[6].classList.add('cut')})}}catch(e){}}}
// ---------- a shorter left menu: less-used pages sit in groups that open with a click ----------
{const add=[["Help","navg","Grouped menu","Stats, club and history pages sit in groups in the left menu, so the menu fits on a laptop screen."]];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const NAVOPEN={};
function groupNav(){if(!feat("navg")||innerWidth<=760)return;const side=document.querySelector(".side");if(!side)return;const byF={};NAV.forEach(n=>byF[n[2]]=n[0]);
 NAVG.forEach(([g,keys])=>{const btns=[...side.querySelectorAll(":scope > button.ni")].filter(b=>keys.includes(byF[b.getAttribute("onclick")]));if(btns.length<2)return;
  const d=document.createElement("details");d.className="ng";d.innerHTML=`<summary class="ni">${g}</summary>`;const last=[...side.querySelectorAll(":scope > button.ni, :scope > details.ng")].filter(x=>!btns.includes(x)).pop();(last||btns[0]).after(d);btns.forEach(b=>d.appendChild(b));d.open=!!NAVOPEN[g]||btns.some(b=>b.classList.contains("on"));d.ontoggle=()=>{NAVOPEN[g]=d.open}})}
{const _sh=shell;shell=function(...a){const r=_sh.apply(this,a);try{groupNav()}catch(e){}return r}}
const NAVG=[["Stats",["tstats","box","pr","lead"]],["Club",["offers","picks","staff","fin","owner","uni"]],["Honors",["hl","hist","recs","hof","ach"]],["Options",["feat","set","keys"]]];
// ---------- arrow-key moves: WASD moves your player, the arrow keys are moves ----------
// With the ball: the arrow toward the basket is an explosive drive, the arrow away from it is a step-back, and up or
// down is a crossover that way. Without the ball on offense, an arrow is a quick cut that way; on defense it is a
// quick defensive slide. In 2-player mode the arrow keys belong to player 2.
{const add=[['Controls','arrows','Arrow-key moves','WASD moves. Arrow keys: toward the basket = drive, away = step-back, up/down = crossover. On defense they are quick slides.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const ARK={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};
const arrowsOn=()=>feat('arrows')&&!(G&&G.ctl2);
{const _mv=moveVec;moveVec=function(){if(!arrowsOn())return _mv();const sv={};for(const k in ARK){sv[k]=KEYS[k];KEYS[k]=0}try{return _mv()}finally{Object.assign(KEYS,sv)}}}
function arrowMove(code){const e=G.ctl,d=ARK[code],b=G.b;if(!e||!d||G.phase!='live'||(e.cd.am||0)>0||e.stun>0)return;const v=topSpd(e),s=G.dir[0],hx=hoopX(s),toward=Math.sign(hx-e.x)||s;
 if(G.poss===0&&b.st=='held'&&b.h===e){const m=e.man&&dist(e.man,e)<4.5?e.man:null;
  if(d[1]){// crossover up or down
   if(feat('cross')&&!(e.cd.cr>0)){const keep=e.vx,keep2=e.vy;crossover();e.vx=keep;e.vy=keep2}else{e.act={k:'cross',t:0};G.ev.push('bounce')}e.dash={x:e.vx*.3,y:d[1]*v*1.2,t:.32};e.cd.am=.75}
  else if(d[0]===toward){// explosive first step toward the basket
   e.dash={x:d[0]*v*1.3,y:(25-e.y)*.25,t:.45};e.cd.am=1.3;if(m&&rnd()<clamp(.25+((e.p.sk.spd+e.p.sk.han)/2-m.p.sk.pd)/80,.06,.6)){m.stun=.5;say('Blew right by him!',1)}}
  else{// step-back for a jump shot
   e.dash={x:d[0]*12,y:0,t:.22};e.cd.am=1.2;e.sbk=1.1;e.act={k:'cross',t:0};if(m&&rnd()<clamp(.3+(e.p.sk.han-m.p.sk.pd)/90,.08,.6)){m.stun=.35;say('Step-back!',.9)}}}
 else if(G.poss===0){e.dash={x:d[0]*v*1.2,y:d[1]*v*1.2,t:.35};e.cd.am=.8}
 else{e.dash={x:d[0]*v*1.25,y:d[1]*v*1.25,t:.2};e.cd.am=.45}}
{const _uc=userControls;userControls=function(e,dt){if(e.dash&&e.dash.t>0&&G&&!G.auto&&!(G.meter&&G.meter.e===e)){if(!e.dash.go){e.dash.go=1;e.vx=e.dash.x;e.vy=e.dash.y}e.dash.t-=dt;e.tx=e.dash.x;e.ty=e.dash.y;return true}return _uc(e,dt)}}
{const _sa=shotAdj;shotAdj=function(e,typ,info){let a=_sa(e,typ,info);if(e.sbk>0&&typ!='close'&&typ!='dunk')a+=.03;return a}}
{const _hk=hKey;hKey=function(code,down){if(ARK[code]&&arrowsOn()&&G&&G.live&&!G.paused){if(down)arrowMove(code);return}return _hk(code,down)}}
// move cooldowns that were never counted down (the crossover and a user pump fake only worked once a game)
{const _st=hStep;hStep=function(dt){_st(dt);if(!G||!G.ent)return;G.ent.forEach(e=>{const c=e.cd;if(!c)return;if(c.cr>0)c.cr-=dt;if(c.am>0)c.am-=dt;if(e===G.ctl&&c.fk>0)c.fk-=dt;if(e.sbk>0)e.sbk-=dt})}}
{const _kh=keysHTML;keysHTML=function(){const h=_kh();if(!feat('arrows'))return h;const r=(a,b)=>`<tr><td>${a}</td><td><kbd>${b}</kbd></td></tr>`;return h+`<table class="t"><tr><th colspan="2">Arrow-key moves</th></tr>${r('Explosive drive','Arrow toward the basket')}${r('Step-back (better jump shot)','Arrow away from the basket')}${r('Crossover up or down','↑ or ↓')}${r('Quick cut (offense, no ball) / defensive slide','Any arrow')}</table>`}}
