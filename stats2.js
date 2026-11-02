'use strict';
// Detailed ratings. Every player gets football stats (throw power, deep accuracy, catching in traffic, pass block,
// tackling...) grouped the way football teams think about them. The old four ratings (speed, strength, awareness,
// skill) are now worked out from these, so overall ratings, salaries and the sim keep working. Upgrades (career XP,
// training points, weekly development) go to a group and hand out random boosts to the stats inside it.
// Also: the QB's vision cone reaches as far as he can throw, and a QB on the move can turn his head about 90 degrees
// to either side to throw (less accurate on the run, depending on his throw-on-the-run stat).
{const add=[['On the field','ds2','Detailed ratings','Players have detailed stats (throw power, deep accuracy, catching in traffic, pass blocking, tackling, man coverage...) that drive the game. Upgrades go to a group and give random boosts inside it.'],
 ['On the field','cone2','Cone reaches throw range','The QB\'s vision cone is as long as the farthest he can throw.'],
 ['On the field','nfl','Realistic NFL numbers','Completion rates, yards per carry, sacks, interceptions, tackling, blitz rates, penalties and kicking are tuned to land close to real NFL averages.'],
 ['On the field','scrd','Scramble drill','When your QB leaves the pocket, receivers work toward the side he is rolling to and find open grass in his throwing range.'],
 ['On the field','zhunt','Zone defenders hunt','Underneath zone defenders whose zone is empty, with every receiver covered, come after the QB.'],
 ['On the field','qbhead','Look while running','A QB on the move can turn his head about 90 degrees to either side and throw. Throws on the run are less accurate.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// ---------- wiring: new players, saves, game setup ----------
{const _mk=mkPl;mkPl=function(...a){const p=_mk.apply(this,a);try{dsInit(p)}catch(e){console.error(e)}return p}}
{const _sv=save;save=function(...a){try{dsSyncAll()}catch(e){console.error(e)}return _sv.apply(this,a)}}
try{dsSyncAll()}catch(e){console.error(e)}
{const _su=setup;setup=function(...a){const r=_su.apply(this,a);try{dsField()}catch(e){console.error(e)}return r}}
function dsField(){if(!P||!P.off)return;[['O',P.off],['D',P.def]].forEach(([s,A])=>A.forEach(p=>{const T=p.t=='U'?LU:LUc,pl=T&&T[s]&&T[s][p.i];p.rp=pl||null;
 if(DS2()&&pl){p.tr0=p.tr0||p.tr;p.tr=p.tr0*(.85+dv(pl,'agi')/330)}
 if(FT('nfl')&&s=='D'&&(p.i==7||p.i==8)&&!p.cbf){p.cbf=1;p.spd*=1.13/1.08}}))}
{const _sg=startGame;startGame=function(...a){try{dsSyncAll()}catch(e){}return _sg.apply(this,a)}}
// QB looks where his head points (the cone)
coneOff=function(q,tx,ty){const a=Math.atan2(ty-q.y,tx-q.x),f=qLook(q);return Math.max(0,Math.abs(Math.atan2(Math.sin(a-f),Math.cos(a-f)))-coneHalf2(q))};
// ---------- QB head turn while moving ----------
{const _f=face;face=function(p,ang,rate,dt){try{if(feat('qbhead')&&P&&G.phase=='play'&&p===P.off[0]&&P.b&&P.b.st=='qb'&&!P.run&&(p._rs||0)>1.2){
 const body=p.fa;p.fa=p.ha==null?body:p.ha;_f(p,ang,rate,dt);let d=p.fa-body;d=Math.atan2(Math.sin(d),Math.cos(d));const lim=Math.PI/2;p.ha=body+clamp(d,-lim,lim);p.fa=body;return}}catch(e){}return _f(p,ang,rate,dt)}}
{const _st=step;step=function(dt){const q0=P&&P.off&&P.off[0],x0=q0?q0.x:0,y0=q0?q0.y:0;_st(dt);try{if(q0&&dt>0){const v=Math.hypot(q0.x-x0,q0.y-y0)/dt;q0._rs=(q0._rs||0)*.6+v*.4}if(!feat('qbhead')||!P||G.phase!='play')return;const q=P.off[0];if(!q)return;
 if(P.b.st!='qb'||P.run){q.ha=null;return}const mvg=(q._rs||0)>1.2;
 if(!mvg){if(q.ha!=null){let d=q.ha-q.fa;d=Math.atan2(Math.sin(d),Math.cos(d));q.fa+=d;q.ha=null}return}
 if(q.ha==null)q.ha=q.fa;
 // nothing to look at: eyes drift back downfield, as far as the neck allows
 if(!P.aim&&!(P.look&&(G.poss!='U'||!qbIsMe()))){const dn=G.dir>0?0:Math.PI;let d=dn-q.ha;d=Math.atan2(Math.sin(d),Math.cos(d));q.ha+=Math.sign(d)*Math.min(Math.abs(d),3*dt)}
 let d=q.ha-q.fa;d=Math.atan2(Math.sin(d),Math.cos(d));q.ha=q.fa+clamp(d,-Math.PI/2,Math.PI/2)}catch(e){}}}
// ---------- upgrade screens ----------
// career: upgrade a group with XP
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{if(!DS2()||!CAR()||!R.me||(G&&G.live))return r;const p=meRow();if(!p)return r;dsSync(p);const sec=[...$('modal').querySelectorAll('section.cardx')].find(s=>/Upgrade yourself/.test((s.querySelector('h4')||{}).textContent||''));if(!sec)return r;
 const xp=R.xp||0;sec.innerHTML=`<h4>Upgrade yourself · ${xp} XP</h4>${R.dsLast?`<p class="small w">${esc(R.dsLast)}</p>`:''}<table class="mini">${POSG[p.g].map(gk=>{const av=dsGAvg(p,gk),c=upCost(av),room=dsRoom(p,gk)>0||av<99;
  return`<tr><td><b>${DGRP[gk][0]}</b><div class="small dim">${DGRP[gk][1].filter(s=>PSI[p.g][s]!=null).map(s=>`${DSN[s]} ${p.ds[PSI[p.g][s]]}`).join(' · ')}</div></td><td class="num"><b>${av}</b></td><td>${av<99?B(`dsCarUp('${gk}')`,`Upgrade · ${c} XP`,xp>=c?'':'dim'):'max'}</td></tr>`}).join('')}</table>
  <p class="small">Each upgrade gives 3 random boosts to stats in that group. XP comes from your stats and wins every game (simmed games give less).</p>`}catch(e){console.error(e)}return r}}
function dsCarUp(gk){const p=meRow();if(!p)return;const c=upCost(dsGAvg(p,gk));if((R.xp||0)<c)return careerHub();R.xp-=c;const got=dsUp(p,gk,3,true);R.dsLast=`${DGRP[gk][0]}: ${dsGot(got)||'already maxed'}`;save();careerHub()}
// franchise: training points go to a group
function dsTrain(id,gk){const p=R.pl.find(q=>q.id==id);if(!p||p.tid!==0||R.pts<1||dsRoom(p,gk)<=0)return pp(id);R.pts--;const got=dsUp(p,gk,3);VW.dsMsg=`${p.n}: ${dsGot(got)}`;save();pp(id)}
{const _pp=pp;pp=function(id,...a){const r=_pp(id,...a);try{if(!DS2())return r;const p=R.pl.find(q=>q.id==id);if(!p||p.tid==-2||!PSL[p.g])return r;dsSync(p);const m=$('modal'),mine=p.tid===0&&!CAR();
 const at=m.querySelector('.rbars')||[...m.querySelectorAll('h3')].find(x=>/^Ratings/.test(x.textContent));if(!at)return r;const anchor=at.classList&&at.classList.contains('rbars')?at:at.nextElementSibling||at;
 const html=`<h3>Detailed ratings</h3>${VW.dsMsg?`<p class="small w">${esc(VW.dsMsg)}</p>`:''}<div class="dsg">${POSG[p.g].map(gk=>{const room=dsRoom(p,gk)>0,can=mine&&R.pts>0&&room;
  return`<div class="dsc"><div class="dsh"><b>${DGRP[gk][0]}</b><span>${dsGAvg(p,gk)}</span>${mine?`<button ${can?'':'disabled'} onclick="dsTrain(${p.id},'${gk}')" title="${room?'1 training point: 3 random boosts in this group':'At ceiling'}">Train</button>`:''}</div>
  ${DGRP[gk][1].filter(s=>PSI[p.g][s]!=null).map(s=>{const i=PSI[p.g][s],v=p.ds[i],mx=p.dm[i];return`<div class="dsr" title="${esc(DSD[s]||'')}"><span>${DSN[s]}</span><div class="tr"><i style="width:${v}%;background:${v>=80?'#4ade80':v>=65?'#facc15':v>=50?'#fb923c':'#f87171'}"></i><u style="left:${Math.min(99.5,mx)}%"></u></div><b>${v}</b><span class="dim">/ ${mx}</span></div>`}).join('')}</div>`}).join('')}</div>
  ${mine?`<p class="small">Training points: ${R.pts}. Each one trains a group: 3 random boosts to stats in it, up to their ceilings.</p>`:''}`;
 anchor.insertAdjacentHTML('afterend',html);VW.dsMsg=null;m.querySelectorAll('.rbar').forEach(el=>{el.removeAttribute('onclick');el.removeAttribute('title');el.classList.remove('can')});m.querySelectorAll('td.tc').forEach(el=>{el.removeAttribute('onclick');el.classList.remove('tc')});[...m.querySelectorAll('p.small')].filter(x=>/^Tap a rating/.test(x.textContent)).forEach(x=>x.remove());const rh=[...m.querySelectorAll('h3')].find(x=>/^Ratings/.test(x.textContent));if(rh)rh.textContent='Overall ratings (current / ceiling)'}catch(e){console.error(e)}return r}}
// weekly development and focus by group
{const _foc=mFocSel;mFocSel=function(p){if(!DS2()||!PSL[p.g])return _foc(p);return`<select onchange="devFoc2(${p.id},this.value)"><option value="">Auto</option>${POSG[p.g].map(gk=>`<option value="${gk}" ${p.foc2==gk?'selected':''}>${DGRP[gk][0]}</option>`).join('')}</select>`}}
function devFoc2(id,gk){const p=R.pl.find(q=>q.id==id);if(!p)return;p.foc2=DGRP[gk]?gk:null;save()}
{const _dw=devWeek;devWeek=function(){if(!DS2())return _dw();const gains=[];R.pl.forEach(p=>{if(p.tid<0||p.age>26||p.inj||!PSL[p.g])return;dsSync(p);const gs=POSG[p.g].filter(gk=>dsRoom(p,gk)>0);if(!gs.length)return;
  const gk=p.foc2&&gs.includes(p.foc2)?p.foc2:gs.sort((a,b)=>dsRoom(p,b)-dsRoom(p,a))[0];p.dxp=(p.dxp||0)+devRate(p);if(p.dxp<DEVN)return;p.dxp-=DEVN;const got=dsUp(p,gk,3);if(p.tid===0)gains.push(`${p.n} ${dsGot(got)}`)});
 if(gains.length)addNews(`Development: ${gains.slice(0,3).join('; ')}${gains.length>3?` and ${gains.length-3} more`:''}.`)}}
// styles
{const s=document.createElement('style');s.textContent=`.dsg{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin:6px 0 10px}.dsc{background:#ffffff0a;border:1px solid #ffffff1a;border-radius:10px;padding:8px 10px}
.dsh{display:flex;align-items:center;gap:8px;margin-bottom:4px}.dsh b{flex:1}.dsh span{font-weight:800;color:#ffd84d}.dsh button{padding:2px 10px;font-size:12px}.dsh button[disabled]{opacity:.4}
.dsr{display:grid;grid-template-columns:118px 1fr 24px 34px;align-items:center;gap:6px;font-size:12px;margin:2px 0}.dsr .tr{position:relative;height:7px;background:#ffffff1a;border-radius:4px}.dsr .tr i{position:absolute;left:0;top:0;bottom:0;border-radius:4px}.dsr .tr u{position:absolute;top:-2px;bottom:-2px;width:2px;background:#fff8}.dsr b{text-align:right}`;document.head.appendChild(s)}
// ---------- realistic NFL numbers: CPU play calling ----------
// Real teams rarely call trick plays and throw deep less often than this game's CPU did; blitzes about a quarter of the time.
const NFL_DEEP=['Go','Verts','Post Corner','PA Deep'];
{const _cp=cpuPlay;cpuPlay=function(){let n=_cp();try{if(!FT('nfl'))return n;const all=allP(),cat=k=>{const v=all[k]||{};return v.flea||v.hbp?'trick':NFL_DEEP.includes(k)?'deep':'x'};
 const des=(G.q>=4&&G.clk<=240&&G.sc[1]<G.sc[0])||(G.q==2&&G.clk<=60)||(G.down>=3&&G.ytg>=10);
 for(let i=0;i<3;i++){const c=cat(n);if((c=='trick'&&rnd()<.88)||(c=='deep'&&!des&&rnd()<.5))n=_cp();else break}}catch(e){}return n}}
{const _cd=cpuDef;cpuDef=function(){let n=_cd();try{if(!FT('nfl'))return n;const pass=G.down>=3&&G.ytg>=7;const rush=k=>((DALL()[k]||{p:[]}).p.filter(q=>q[2]=='r').length);for(let i=0;i<3;i++){const r=rush(n);if((r>=6&&rnd()<(pass?.35:.7))||(r==5&&rnd()<.42))n=_cd();else break}}catch(e){}return n}}
// running back check-release: on a pass play where he stayed in to block, he leaks into the flat once the rush is picked up
{const _st=step;step=function(dt){_st(dt);try{if(!FT('nfl')||!P||G.phase!='play'||P.run||P.pf&&(P.pf.flea||P.pf.hbp)||P.rbRel||P.t<1.35||P.b.st!='qb')return;P.rbRel=1;
 const O=P.off,r=O[5],q=O[0],d=G.dir,L=P.L;if(!r||r.route.length||r.eng||P.kr)return;if(P.def.some(p=>p.rush&&!p.eng&&dist(p,q)<4))return;if(rnd()<.35)return;
 const side=r.y<q.y?-1:1;r.route=[[L+d*1.5,clamp(r.y+side*7,3,50)],[L+d*4,clamp(r.y+side*11,2,51)]];r.ri=0}catch(e){}}}
{const _sn=snap;snap=function(...a){const r=_sn.apply(this,a);try{if(P)P.rbRel=0}catch(e){}return r}}
// CPU-called stock pass plays: routes break a little shorter, like real timing routes (your own designed plays are never changed)
{const _ap=applyPlay;applyPlay=function(n,...a){const r=_ap.call(this,n,...a);try{if(FT('nfl')&&P&&PRE[n]&&!CP[n]&&(G.poss=='C'||(CAR()&&!qbIsMe()))){const L=P.L;P.off.forEach((o,i)=>{if(i<1||i>5||!o.route)return;o.route.forEach(w=>{w[0]=L+(w[0]-L)*.78})})}}catch(e){}return r}}
// ---------- zone defenders hunt the QB ----------
// A short (flat / hook) zone defender with nobody in his zone, while every receiver already has someone on him, comes after the quarterback.
{const _st=step;step=function(dt){_st(dt);try{if(!FT('zhunt')||!P||G.phase!='play'||P.over||P.run||P.kr||P.b.st!='qb'||P.t<1.5)return;const L=P.L,O=P.off,D=P.def,q=O[0];
 const el=O.filter((r,i)=>i>0&&i<6&&r.route&&r.route.length&&!r.eng);if(!el.length)return;
 D.forEach(p=>{if(p.rush||p.eng||p.fall||p.gone||!p.zone||p.zt||p.zf||p.sw||p.bite>0)return;if(G.poss!='U'&&p===cd&&!autoMode())return;if(CAR()&&p.pid===R.me)return;
  if(Math.abs(p.zone[0]-L)>=12)return;
  const guarded=el.every(r=>D.some(o=>o!==p&&!(o.rush&&!o.hunt)&&(o.on===r||o.cover===r||dist(o,r)<3.2)));if(!guarded)return;
  if(dist(p,q)>(P.sd?22:16))return;p.rush=true;p.hunt=1;p.zone=null;p.cool=Math.max(p.cool||0,.1)})}catch(e){}}}
