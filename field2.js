'use strict';
// More football on the field: formations, play-action / option / RPO / trick plays, disguised defenses, no-huddle,
// drive fatigue, halftime adjustments, big-hit slow motion, pick-six banners, play success stats, TV graphics,
// commentary voice, highlight reels, camera modes, stadium upgrades, 2-player couch mode, eras and X-factors.
// Every feature has a switch on the Game features page.
{const add=[
 ['On the field','form','Formations','Shotgun, I-form, singleback, trips and empty sets you can run any play from (the Formation button).'],
 ['On the field','plays2','Play-action, option and trick plays','Adds PA Boot, PA Deep, Read Option, RPO Slant, Flea Flicker and HB Pass to your playbook.'],
 ['On the field','bluff','Disguised defenses','Defenses sometimes show blitz, then drop into coverage at the snap.'],
 ['On the field','fatigue','Drive fatigue and no-huddle','Long drives wear the defense down, timeouts give everyone a breather, and in hurry-up the defense can\'t change its call.'],
 ['On the field','half','Halftime adjustments','At halftime, take away their top receiver, pressure the QB or commit to the run.'],
 ['On the field','p2','2-player couch mode','A second player on the same keyboard runs the other team: picks their plays, steers with I J K L, throws with 6 7 8 9 0, juke U, hit stick O. Off by default.'],
 ['Presentation','slowmo','Big-hit slow motion','Hit-stick tackles and trucks play out in slow motion.'],
 ['Presentation','lower','TV graphics','A player stat card pops up after big plays.'],
 ['Presentation','hl','Highlight reels','The best plays of each game are saved so you can watch them again.'],
 ['Presentation','stadium','Stadium upgrades','Your facilities budget shows in your stadium: video boards, ribbon boards and banners.'],
 ['Presentation','voice','Commentary voice','The announcer reads big plays out loud with your device\'s voice. Off by default.'],
 ['Franchise','fin','Finances','Ticket prices, attendance, revenue, and budgets for facilities, coaching and medical staff.'],
 ['Franchise','morale','Morale, chemistry and holdouts','Players get happy or unhappy, request trades and hold out for new contracts.'],
 ['Franchise','owner','Owner and job security','The owner grades every season. Keep losing and you get fired.'],
 ['Franchise','offers','CPU trade offers','Other teams call during the season with trade offers.'],
 ['Franchise','riv','Rivalries','Close games and playoff meetings build rivalries, with louder crowds.'],
 ['Franchise','pers','Personalities','Leaders lift teammates, divas sulk, clutch players play faster late in close games.'],
 ['Franchise','story','Storylines','Breakouts, bust watch, Pro Bowls and an end-of-season recap.'],
 ['Franchise','ach','Achievements','Unlock achievements for big moments (pop-up when you get one).'],
 ['Career','events','Off-field choices','Endorsements, interviews and other choices between games.'],
 ['Career','xf','X-factor abilities','Unlock a signature ability once your key rating reaches 80.']];
 const i=FEATS.findIndex(f=>f[0]=='Help');FEATS.splice(i<0?FEATS.length:i,0,...add.filter(a=>!FEATS.some(f=>f[1]==a[1])))}
// camera mode lives with the controls
{const _fu=featUI;featUI=function(){_fu();const m=OPT.cam||'b',h=[...$('modal').querySelectorAll('h3')].find(e=>e.textContent=='Controls');
 if(h&&h.nextElementSibling)h.nextElementSibling.insertAdjacentHTML('afterbegin',`<div class="feat"><div class="row">${[['b','Broadcast'],['t','Tight'],['w','Wide']].map(([k,n])=>`<button class="${m==k?'on':''}" onclick="optSet('cam','${k}')">${n}</button>`).join('')}</div><div><b>Camera</b><span class="small">Broadcast follows the ball, Tight stays close and leads the runner, Wide keeps the line of scrimmage in view.</span></div></div>`)}}
function camTgt(b,L){const pl=G.phase=='play'||G.phase=='kick',m=OPT.cam||'b';if(!pl)return L;if(m=='w')return(b.x*2+L)/3;if(m=='t'){const c=b.st=='carry'&&b.c?b.c:null;return b.x+(c?(c.vx||0)*.6:0)}return b.x}
function camK(){const m=OPT.cam||'b';return m=='t'?.18:m=='w'?.06:.1}
const achv=id=>{if(typeof achGet=='function')achGet(id)};
// ---------- formations ----------
const FORMS={Shotgun:{0:[-5,26.5],5:[-5,29.5]},'I-Form':{0:[-1,26.5],5:[-7,26.5],4:[-1,33.6]},Singleback:{0:[-1,26.5],5:[-6,26.5]},Trips:{1:[-1,8],2:[-1,45],3:[-1.5,40.5],4:[-1,36.5]},Empty:{0:[-5,26.5],5:[-1,44],4:[-1,12]}};
const FORMN=['Default',...Object.keys(FORMS)];
// ---------- play-action, option, RPO and trick plays ----------
const SPEC={'PA Boot':[[[[14,0],[22,-10]],[[6,0],[10,14]],[[18,0]],[[2,0],[4,-12]],[]],0,{pa:1}],
 'PA Deep':[[[[34,0]],[[34,0]],[[12,0],[20,10]],[[8,0]],[]],0,{pa:1}],
 'Read Option':[[[[12,0]],[[12,0]],[[8,0]],[],[]],1,{opt:1}],
 'RPO Slant':[[[[3,0],[9,6]],[[12,0]],[[8,0]],[],[]],1,{rpo:1}],
 'Flea Flicker':[[[[30,0]],[[32,0]],[[14,0],[24,-8]],[[10,0]],[]],1,{flea:1}],
 'HB Pass':[[[[28,0]],[[12,0],[16,8]],[[20,0]],[[6,0],[10,-6]],[]],1,{hbp:1}]};
function f2Plays(){for(const n in SPEC){if(feat('plays2'))PRE[n]=Object.assign(mkPre(SPEC[n][0],SPEC[n][1]),SPEC[n][2]);else delete PRE[n]}}
f2Plays();{const _ot=optT;optT=function(k){_ot(k);if(k=='plays2')f2Plays()}}
{const _ap=applyPlay;applyPlay=function(n){_ap(n);try{const pl=allP()[n]||{};P.pf={pa:pl.pa,opt:pl.opt,rpo:pl.rpo,flea:pl.flea,hbp:pl.hbp};fForm()}catch(e){console.error(e)}}}
function fForm(){if(!feat('form')||!G||G.poss!='U'||!G.form||!FORMS[G.form]||!P)return;const f=FORMS[G.form],d=G.dir,L=P.L;
 for(const k in f){const p=P.off[k];if(!p)continue;const nx=L+d*f[k][0],ny=f[k][1],dx=nx-p.sx,dy=ny-p.sy;p.x=p.sx=nx;p.y=p.sy=ny;
  if(p.route)p.route=p.route.map(w=>[w[0]+dx,clamp(w[1]+dy,1,52)]);if(p.mo)p.mo=p.mo.map(w=>[w[0]+dx,clamp(w[1]+dy,1,52)])}if(P.dp)matchFormation()}
function fSpecial(){const b=P.b,d=G.dir,L=P.L,O=P.off,D=P.def,q=O[0],f=P.pf;if(!f||P.kr||G.phase!='play')return;const h=P.ho||5,me=G.poss=='U';
 if(f.pa&&!P.paDone&&P.t>.3&&b.st=='qb'){P.paDone=1;D.forEach((p,i)=>{if((i>=4&&i<=6)||i>=9){const c=(p.t=='C'?1.3-.6*IQ():1)*clamp(.8-p.sk.awr/160,.1,.6);if(rnd()<c)p.bite=.6}})}
 if(f.opt&&!P.optDone&&b.st=='qb'&&P.t>=.47){P.optDone=1;const rb=O[h],de=[D[0],D[3]].reduce((a,p)=>dist(p,rb)<dist(a,rb)?p:a);
  if(dist(de,rb)<3.8){b.st='carry';b.c=q;P.scr=1;P.rusher=q;sRec(q,'ra');if(me)G.msg='The end crashed - QB keeps it!'}}
 if(f.rpo&&!P.rpoDone&&b.st=='qb'&&P.t>=.42){P.rpoDone=1;const box=D.filter(p=>Math.abs(p.x-L)<6&&p.y>17&&p.y<36).length;if(box>=7){P.run=0;throwTo(O[1]);if(me)G.msg='RPO: they stacked the box, so he threw it!'}}
 if(f.flea&&!P.fleaDone&&b.st=='carry'&&b.c===O[h]&&P.t>=1.15){P.fleaDone=1;if((b.c.x-L)*d<-.5){P.run=0;P.scr=0;P.rusher=null;b.st='qb';b.c=null;b.x=q.x;b.y=q.y;P.sd=0;D.forEach((p,i)=>{if(i>=4&&rnd()<.6)p.bite=.5});if(me)G.msg='Flea flicker! Pitched back to the QB - throw it deep!'}}
 if(f.hbp&&!P.hbDone&&b.st=='carry'&&b.c===O[h]&&P.t>=1){P.hbDone=1;const rb=b.c;if((rb.x-L)*d<-.5){O[h]=q;O[0]=rb;q.route=[];P.run=0;P.scr=0;P.rusher=null;b.st='qb';b.c=null;b.x=rb.x;b.y=rb.y;P.sd=0;D.forEach((p,i)=>{if(i>=4&&rnd()<.5)p.bite=.5});if(me)G.msg='Halfback pass! Throw it!'}}}
// ---------- setup: drives, fatigue, no-huddle, disguised defenses ----------
{const _su=setup;setup=function(){_su();try{fSetup()}catch(e){console.error(e)}}}
function fSetup(){if(!G||!P)return;const d=G.dir,L=P.L,own=d>0?10:110;
 if(G.dPoss!==G.poss){G.dPoss=G.poss;G.drv=0;G.dStart=(L-own)*d}else G.drv=(G.drv||0)+1;
 if(feat('fatigue')){if(G.drv>=6){const t=Math.min(18,(G.drv-5)*3);P.def.forEach(p=>p.stm=Math.max(20,p.stm-t))}
  if(G.hurry&&G.poss=='U'&&G.lastDef&&DALL()[G.lastDef]&&G.drv>0)applyDef(G.lastDef)}
 if(G.poss=='U')G.lastDef=P.dpn;
 if(feat('bluff')&&G.poss=='U'&&P.dp&&rnd()<.12+.25*IQ()){P.def.forEach((p,i)=>{const e=P.dp.p[i];if(i>=4&&i<=6&&e&&e[2]!='r'){p.x=p.sx=L+d*1.7}});P.hint='linebackers crowding the line'}
 if(G.p2off&&G.poss=='C'&&feat('p2')&&allP()[G.p2off])applyPlay(G.p2off);if(G.p2def&&G.poss=='U'&&feat('p2')&&DALL()[G.p2def])applyDef(G.p2def);
 if(G.form&&G.poss=='U')fForm();ui()}
{const _cto=callTO;callTO=function(s){const r=_cto(s);if(r&&feat('fatigue')&&G.stm){for(const k in G.stm)G.stm[k]=Math.min(100,G.stm[k]+20);if(P)P.off.concat(P.def).forEach(p=>p.stm=Math.min(100,(p.stm||0)+20))}return r}}
// ---------- halftime adjustments ----------
const ADJ={cover:['Take away their top receiver','Your corners and safeties play a step faster.'],rush:['Pressure the quarterback','Your defensive line gets off the ball faster.'],run:['Commit to the run','Your line and running back play faster on run plays.']};
{const _qo=quarterOver;quarterOver=function(){const q=G.q,r=_qo();if(q==2&&G.q==3&&G.live&&feat('half')&&!G.chal){G.adjC=rnd()<IQ()?Object.keys(ADJ)[rnd()*3|0]:null;
 if(CAR()||!$('modal').hidden)G.adj=Object.keys(ADJ)[rnd()*3|0];else{G.paused=1;modal(`<h1>Halftime</h1><p>${G.sc[0]}-${G.sc[1]}. Pick one adjustment for the second half.</p><div class="grid">${Object.keys(ADJ).map(k=>`<button class="big" onclick="halfPick('${k}')">${ADJ[k][0]}<br><small>${ADJ[k][1]}</small></button>`).join('')}</div>`)}}return r}}
function halfPick(k){G.adj=k;G.paused=0;$('modal').hidden=1;G.msg=ADJ[k][0]+'. '+G.msg;ui()}
// ---------- movement modifiers: halftime adjustments, clutch players ----------
{const _mv=mv;mv=function(p,tx,ty,sp,dt){let f=1;if(G&&G.live&&P){const a=p.t=='U'?G.adj:G.adjC;if(a){const off=P.off.includes(p);
  if(a=='cover'&&!off&&(p.pos=='CB'||p.pos=='S'))f=1.04;else if(a=='rush'&&!off&&(p.pos=='DE'||p.pos=='DT'))f=1.06;else if(a=='run'&&off&&P.run&&p.i>=5)f=1.05}
 if(G.clutch&&G.clutch[p.pid]&&G.q>=4&&Math.abs(G.sc[0]-G.sc[1])<=8&&feat('pers'))f*=1.03}return _mv(p,tx,ty,sp*f,dt)}}
// ---------- the play loop: special plays, slow motion, 2-player, X-factors ----------
function fPaused(){if(G.paused&&$('modal').hidden){G.paused=0;if(!G.adj)G.adj=Object.keys(ADJ)[rnd()*3|0]}return G.paused}
{const _st=step;step=function(dt){if(fPaused())return;if(G.slow>0&&feat('slowmo'))dt*=.3;fSpecial();
 const p2d=fP2Def();let sv=null;if(p2d)sv=[p2d.x,p2d.y];_st(dt);
 if(p2d&&G.phase=='play'&&!P.over){const[x,y,m]=p2in();if(m){p2d.x=sv[0];p2d.y=sv[1];mv(p2d,p2d.x+x*5,p2d.y+y*5,p2d.spd*1.05,dt)}if(keys.o&&!(p2d.hcool>0)){p2d.hs=.35;p2d.hcool=1.4}}
 const me=xfMe('unstop');if(me&&me.eng&&rnd()<dt*.7){const o=me.eng;o.eng=null;me.eng=null;me.cool=.4;me.boost=.5}}}
{const _ps=postStep;postStep=function(dt){if(G.slow>0&&feat('slowmo'))dt*=.3;_ps(dt)}}
{const _kt=kickTick;kickTick=function(dt){if(fPaused())return;_kt(dt)}}
{const _at=autoTick;autoTick=function(dt){if(fPaused())return;return _at(dt)}}
{const _rt=ragTackle;ragTackle=function(p,h){_rt(p,h);if(feat('slowmo')&&(p.hs>0||h.trk>0)&&$('modal').hidden&&!(CAR()&&autoMode())){G.slow=.9;G.bigHit=1.2}}}
// ---------- 2-player couch mode ----------
const p2on=()=>feat('p2')&&!CAR()&&G&&G.live;
function p2in(){const x=(keys.l?1:0)-(keys.j?1:0),y=(keys.k?1:0)-(keys.i?1:0),m=Math.hypot(x,y)||1;return[x/m,y/m,!!(x||y)]}
function fP2Def(){if(!p2on()||G.poss!='U'||G.phase!='play'||P.over)return null;const b=P.b,t=b.st=='carry'?b.c:b;return P.def.filter(p=>!p.gone&&!p.fall).reduce((a,p)=>!a||dist(p,t)<dist(a,t)?p:a,null)}
{const _cr=cpuRun;cpuRun=function(c,dt){if(p2on()&&c.t=='C'){const[x,y,m]=p2in();if(keys.u&&!(c.jc>0))juke(c);if(m)return mv(c,c.x+x*5,c.y+y*5,c.spd*.95,dt)}return _cr(c,dt)}}
{const _cq=cpuQB;cpuQB=function(dt){const q=P.off[0];if(p2on()&&q.t=='C'){for(let k=0;k<5;k++)if(keys['67890'[k]]){keys['67890'[k]]=0;throwTo(P.off[k+1]);return}const[x,y,m]=p2in();if(m)mv(q,q.x+x*5,q.y+y*5,q.spd*.95,dt);else q.vx=q.vy=0;return}return _cq(dt)}}
// ---------- eras, X-factors ----------
const ERA={modern:{n:'Modern',acc:0,fum:0,run:0},'90s':{n:'1990s',acc:.3,fum:.003,run:.12},'70s':{n:'1970s',acc:.7,fum:.008,run:.25},leather:{n:'Leather helmet',acc:1.2,fum:.015,run:.4}};
const eraOf=()=>ERA[R.era]||ERA.modern;
function xfMe(id){if(!CAR()||!feat('xf')||R.xfOn!==id||!P)return null;return careerMe()}
{const _ta=throwAt;throwAt=function(tx,ty){const q=P.off[0],dd=Math.hypot(tx-q.x,ty-q.y),e=eraOf().acc;if(e){tx+=(rnd()-.5)*dd/22*e;ty+=(rnd()-.5)*dd/22*e}
 const was=P.b.st;_ta(tx,ty);const b=P.b,me=xfMe('dime');if(was=='qb'&&b.st=='air'&&me&&me===q){b.tx+=(tx-b.tx)*.45;b.ty+=(ty-b.ty)*.45}}}
{const _jk=juke;juke=function(c,s){_jk(c,s);if(xfMe('juke')===c)c.jc*=.5}}
{const _rs=resolve;resolve=function(){const b=P.b,r=b.tgt,l={x:b.tx,y:b.ty},me=careerMe(),sv=[];
 if(me&&r===me&&xfMe('mossed')){const dd=P.def.reduce((a,p)=>dist(p,l)<dist(a,l)?p:a);if(dist(dd,l)<2.6){sv.push([dd,dd.x,dd.y]);const k=Math.hypot(dd.x-l.x,dd.y-l.y)||1;dd.x+=(dd.x-l.x)/k*1.1;dd.y+=(dd.y-l.y)/k*1.1}}
 if(me&&xfMe('lockdown')&&r&&P.def.includes(me)&&dist(me,l)<3){sv.push([me,me.x,me.y],[r,r.x,r.y]);me.x+=(l.x-me.x)*.5;me.y+=(l.y-me.y)*.5;const k=Math.hypot(r.x-l.x,r.y-l.y)||1;r.x+=(r.x-l.x)/k*.8;r.y+=(r.y-l.y)/k*.8}
 _rs();if(b.st!='carry')sv.forEach(([p,x,y])=>{p.x=x;p.y=y})}}
{const _xf=xFumRoll;xFumRoll=function(k){if(_xf(k))return true;const e=eraOf().fum;if(e&&rnd()<e)return true;const me=xfMe('enforcer');return!!(me&&P.tkl===me&&me.hs>0&&rnd()<.15)}}
{const _cp=cpuPlay;cpuPlay=function(){const n=_cp(),e=eraOf().run,all=allP();if(e&&all[n]&&!all[n].run&&rnd()<e){const runs=Object.keys(all).filter(k=>all[k].run&&!all[k].flea&&!all[k].hbp);if(runs.length)return runs[rnd()*runs.length|0]}return n}}
{const _un=uniforms;uniforms=function(){_un();if(R.era=='leather'){TEAM.U.h='#6b4423';TEAM.C.h='#5b3a1e'}}}
// ---------- after every play: success stats, TV graphics, achievements ----------
{const _ep=endPlay;endPlay=function(k,x){if(!P||P.over)return;const u=G.poss=='U',L0=P.L,d=G.dir,pre={kr:P.kr,name:P.name,down:G.down,ytg:G.ytg,knl:P.knl,spk:P.spk,two:G.two,int6:P.int6,fum:P.fumRec,fake:G.fake,sc:G.sc.slice()};
 _ep(k,x);if(!P.over)return;try{fAfter(k,x,u,L0,d,pre)}catch(e){console.error(e)}}}
function fAfter(k,x,u,L0,d,pre){const m=G.msg;if(/^FLAG/.test(m))return;const g=Math.round(((x==null?L0:x)-L0)*d);
 if(u&&!pre.kr&&!pre.knl&&!pre.spk&&!pre.two&&pre.name&&(k=='tackle'||k=='td'||k=='inc'||k=='sack')){const gg=k=='td'?Math.round(((d>0?110:10)-L0)*d):k=='inc'?0:g,ok=k=='td'||gg>=(pre.down==1?.4:pre.down==2?.6:1)*pre.ytg;pStat(pre.name,gg,ok)}
 if(G.slow>0)G.pt+=.7;
 if(k=='td')ltShow(P.rec||P.rusher||P.b.c,pre.kr?(pre.int6?'PICK SIX':pre.fum?'SCOOP AND SCORE':'RETURN TOUCHDOWN'):'TOUCHDOWN');
 else if(k=='sack')ltShow(P.tkl,'SACK');else if(k=='tackle'&&g>=20&&!pre.kr)ltShow(P.rec||P.rusher,`${g}-YARD ${P.rec?'CATCH':'RUN'}`);else if(pre.kr&&k=='tackle'&&g>=30)ltShow(P.b.c,`${g}-YARD RETURN`);
 if(G.chal)return;
 if(k=='td'&&u){if(pre.int6)achv('pick6');if(pre.fum)achv('scoop');if(pre.kr&&!pre.int6&&!pre.fum)achv('kr');if(!pre.kr&&G.dStart!=null&&G.dStart<=5)achv('drive99');if(pre.fake)achv('fake')}
 if(u&&pre.fake&&/FIRST DOWN/.test(m))achv('fake');if(/SAFETY/.test(m)&&!u)achv('safety');
 if(k=='tackle'&&u&&g>=80&&!pre.kr)achv('bomb');
 const def=G.sc[1]-G.sc[0];G.maxDef=Math.max(G.maxDef||0,def)}
{const _ir=intReturn;intReturn=function(l,dd){const u=G.poss=='U',nm=P.name;_ir(l,dd);P.int6=1;if(u&&nm)pStat(nm,0,false);ltShow(dd,'INTERCEPTION')}}
{const _fr=fumbleReturn;fumbleReturn=function(dd){_fr(dd);ltShow(dd,'FUMBLE RECOVERY')}}
{const _ke=kEnd;kEnd=function(){const kk=P.kk,u=G.poss=='U';_ke();if(u&&kk&&kk.kind=='fg'&&/GOOD/.test(G.msg)&&kk.fd>=55&&!G.chal)achv('fg55')}}
{const _os=onside;onside=function(kt){_os(kt);if(kt=='U'&&G.poss=='U'&&!CAR()&&!G.chal)achv('onside')}}
// play success stats, shown on the playbook cards
function pStat(n,y,ok){if(!R)return;R.pst=R.pst||{};const s=R.pst[n]=R.pst[n]||[0,0,0];s[0]++;s[1]+=y;s[2]+=ok?1:0}
{const _pb=pbHTML;pbHTML=function(u){let h=_pb(u);if(u&&R.pst)for(const n in R.pst){const s=R.pst[n];if(s[0]<3)continue;const rx=new RegExp('<span>'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=( \\(run\\))?</span>)');
  h=h.replace(rx,`<span><em class="pst">${Math.round(s[2]/s[0]*100)}% · ${(s[1]/s[0]).toFixed(1)} yds</em>${n}`)}
 if(u&&G.runOnly){const d=document.createElement('div');d.innerHTML=h;d.querySelectorAll('[data-p]').forEach(b=>{const pl=allP()[b.dataset.p];if(pl&&!pl.run)b.remove()});h=d.innerHTML}return h}}
// ---------- TV graphics ----------
let ltT=0;
function ltShow(p,title){if(!feat('lower')||!p||!p.pid||!G.box||(CAR()&&autoMode()))return;const pl=R.pl.find(q=>q.id===p.pid);if(!pl)return;const s=G.box[p.pid]||newSS(),m=G.nmap&&G.nmap[p.pid],e=$('lt');if(!e)return;
 const tm=pl.tid===0?R.lg.t[0].n:G.opp.n,col=pl.tid===0?TEAM.U.j:TEAM.C.j;e.style.setProperty('--lc',col=='#f1f5f9'?TEAM[pl.tid===0?'U':'C'].j2:col);
 e.innerHTML=`<i>${esc(title)}</i><b>${m?'#'+m.j+' ':''}${esc(pl.n)}</b><span>${pl.g} · ${esc(tm)}</span><em>${boxLine(s)||'First big play of the day'}</em>`;e.className='show';ltT=3.8}
// ---------- voice ----------
function fSay(t){if(!feat('voice')||!globalThis.speechSynthesis||!t)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=1.08;u.pitch=.95;speechSynthesis.speak(u)}catch(e){}}
{const _sr=showRes;showRes=function(){const m=G.msg;
 if(/TOUCHDOWN/.test(m)&&P&&P.kr&&(P.int6||P.fumRec||G.phase=='post')){const t=P.int6?'PICK SIX!':P.fumRec?'SCOOP AND SCORE!':'RETURN TOUCHDOWN!';xBanner(t,'',G.poss=='U'?'td':'bad')}else _sr();
 if(/TOUCHDOWN|INTERCEPT|FIELD GOAL IS GOOD|SACK|FUMBLE|BLOCKED|PICK SIX/.test(m)||/Gain of ([2-9]\d|1\d\d)/.test(m)){const l=(G.pbp||[]).slice(-1)[0];if(l)fSay(l.replace(/^Q\d \d+:\d+ - |^OT \d+:\d+ - /,'').replace(/^[A-Z]+: /,''))}}}
// ---------- highlight reels (saved outside the league save, last 2 games) ----------
const HLK='gdhl_'+SAVE_KEY;
function hlScore(){const m=G.msg||'';let s=0;if(/TOUCHDOWN/.test(m))s=10;else if(/INTERCEPT|PICK/.test(m))s=8;else if(/FUMBLE/.test(m))s=7;else if(/BLOCKED/.test(m))s=7;else if(/DIVING|TOE-TAP/.test(m))s=6;else if(/SACK/.test(m))s=3;
 const g=m.match(/Gain of (\d+)/);if(g&&+g[1]>=20)s=Math.max(s,+g[1]/3);if(/FIELD GOAL IS GOOD from (\d+)/.test(m)&&+RegExp.$1>=45)s=6;if(P.kr&&/TOUCHDOWN/.test(m))s=12;return s}
function hlEnc(p){const rf=p.rf,L=p.rp,fr=[];const t0=rf[0].t;
 for(let i=0;i<rf.length;i+=3){const f=rf[i];if(f.t-t0>9)break;const a=[Math.round((f.t-t0)*100)];for(let j=0;j<L.length;j++){const o=j*6;a.push(Math.round(f.a[o]*20),Math.round(f.a[o+1]*20),Math.round(Math.atan2(Math.sin(f.a[o+2]),Math.cos(f.a[o+2]))*100),f.a[o+5]<0?-1:Math.round(f.a[o+5]*100))}
  const b=f.b;let z=0,st=1;if(b.st=='air'){const q=clamp(b.t/b.T,0,1),pk=Math.min(9,Math.hypot(b.tx-b.sx,b.ty-b.sy)*.18)*(b.arc||1);z=1.2+4*pk*q*(1-q)}else if(b.st=='tip')z=.6+Math.sin(Math.PI*Math.min(1,b.tt/b.T2))*2.4;else if(b.st=='qb'||b.st=='carry')z=1.1;else if(b.st=='kick'||b.st=='cel'||b.st=='loose')z=b.z||0;else st=0;
  const bx=b.st=='carry'&&b.c?b.c.x:b.x,by=b.st=='carry'&&b.c?b.c.y:b.y;a.push(st,Math.round((bx||0)*20),Math.round((by||0)*20),Math.round(z*20));fr.push(a)}
 return{n:L.map(q=>[q.t,q.s,q.i,q.pos,q.pid,q.fall?Math.round(q.fall.vx*10):0,q.fall?Math.round(q.fall.vy*10):0,q.fall?Math.round(q.fall.lag*100):0,q.fall?Math.round(q.fall.dur*100):0,G.nmap&&G.nmap[q.pid]?G.nmap[q.pid].j:0,q.gone?1:0]),f:fr,tm:{U:{...TEAM.U},C:{...TEAM.C}}}}
function hlDec(h){const pl=h.n.map(n=>({t:n[0],s:n[1],i:n[2],pos:n[3],pid:n[4],x:0,y:0,vx:0,vy:0,fa:0,stun:0,bite:0,ml:0,gone:n[10],fall:n[8]?{t:0,lag:n[7]/100,dur:n[8]/100,vx:n[5]/10,vy:n[6]/10}:null}));
 const nm={};h.n.forEach(n=>{if(n[9])nm[n[4]]={n:'',j:n[9]}});const k=pl.length,rf=[],F=h.f;
 for(let i=0;i<F.length;i++){const A=F[i],B=F[Math.min(i+1,F.length-1)];for(let s=0;s<3;s++){const w=s/3,a=new Float32Array(k*6),mix=(o)=>A[o]+(B[o]-A[o])*w;
   for(let j=0;j<k;j++){const o=1+j*4;a[j*6]=mix(o)/20;a[j*6+1]=mix(o+1)/20;a[j*6+2]=A[o+2]/100;a[j*6+3]=(B[o]-A[o])/20*20;a[j*6+4]=(B[o+1]-A[o+1])/20*20;a[j*6+5]=A[o+3]<0?-1:mix(o+3)/100}
   const o=1+k*4;rf.push({t:mix(0)/100,a,b:A[o]?{st:'kick',x:mix(o+1)/20,y:mix(o+2)/20,z:mix(o+3)/20}:{st:'dead',x:A[o+1]/20,y:A[o+2]/20},jz:null})}}
 return{P:{off:pl.filter(p=>p.s=='O'),def:pl.filter(p=>p.s=='D'),rp:pl,rf,b:{st:'dead',x:0,y:0},L:60,kr:1,run:0,look:null,aim:null},nmap:nm}}
{const _nx=next;next=function(){try{if(feat('hl')&&G.live&&P&&P.rf&&P.rf.length>20&&!G.chal){const s=hlScore();if(s>=5){G.hls=G.hls||[];G.hls.push({s,t:G.msg.split(/[.!]/)[0].slice(0,40),q:`${G.q>=5?'OT':'Q'+G.q} ${xClk()}`,line:(G.pbp||[]).slice(-1)[0]||'',h:hlEnc(P)});G.hls.sort((a,b)=>b.s-a.s);if(G.hls.length>3)G.hls.length=3}}}catch(e){console.error(e)}return _nx()}}
function hlLoad(){try{return JSON.parse(lsGet(HLK))||[]}catch(e){return[]}}
function hlSave(){if(!G.hls||!G.hls.length)return;const a=hlLoad();a.push({s:R.season,w:R.lg.wk,po:R.lg.po?RD[R.lg.po.rd]:'',on:G.opp.n,sc:G.sc.join('-'),list:G.hls});while(a.length>2)a.shift();if(!lsSet(HLK,JSON.stringify(a))){a.shift();lsSet(HLK,JSON.stringify(a))}}
function hlPlay(gi,hi){const g=hlLoad()[gi],h=g&&g.list[hi];if(!h||!G||!P||G.live)return;const dec=hlDec(h.h),sv={U:{...TEAM.U},C:{...TEAM.C}},nm=G.nmap,ph=G.phase;
 Object.assign(TEAM.U,h.h.tm.U);Object.assign(TEAM.C,h.h.tm.C);G.nmap=dec.nmap;$('modal').hidden=1;
 G.rp={P:dec.P,t:0,i:0,ph:ph=='replay'?'over':ph,msg:G.msg,hold:0,after:()=>{Object.assign(TEAM.U,sv.U);Object.assign(TEAM.C,sv.C);G.nmap=nm;hlUI()}};G.phase='replay';ui()}
function hlUI(){VW.page='box';const a=hlLoad();modal(`${nav()}<h1>Highlights</h1><p class="dim">The best plays from your last two games. They play in slow motion; tap to skip.</p>
 ${a.slice().reverse().map((g,ri)=>{const gi=a.length-1-ri;return`<h3>${g.po||'Week '+(g.w+1)} vs ${esc(g.on)} (${g.sc})</h3><div class="grid">${g.list.map((h,hi)=>B(`hlPlay(${gi},${hi})`,`${esc(h.t)}<br><small>${esc(h.q)}</small>`)).join('')}</div>`}).join('')||'<p class="dim">Play a game to collect highlights.</p>'}`)}
{const _eg=endGame;endGame=function(){try{if(G&&G.live&&!G.chal&&feat('hl'))hlSave()}catch(e){console.error(e)}return _eg()}}
[NAVF,NAVC].forEach(a=>{const i=a.findIndex(x=>x[0]=='box');if(!a.some(x=>x[0]=='hl'))a.splice(i+1,0,['hl','hlUI()','Highlights'])});
// ---------- stadium upgrades, rivalry banner, big-hit text ----------
{const _df=drawField;drawField=function(){_df();try{fStadium()}catch(e){}}}
function fStadium(){if(!G||!G.live)return;const lv=feat('stadium')&&feat('fin')&&R.fin&&G.home=='U'?R.fin.bud.fac:0,ab=n=>tAbbr(n);
 if(lv>=3){[W*.2,W*.8].forEach(cx=>{const y0=88;X.fillStyle='#0b0f17';X.fillRect(cx-62,y0,124,46);X.strokeStyle='#475569';X.lineWidth=2;X.strokeRect(cx-62,y0,124,46);X.fillStyle=TEAM.U.j;X.fillRect(cx-58,y0+3,116,11);
  X.fillStyle='#fff';X.font='bold 10px sans-serif';X.textAlign='center';X.fillText(ab(R.lg.t[0].n),cx,y0+12);X.font='bold 17px "Trebuchet MS",sans-serif';X.fillStyle='#ffd84d';X.fillText(`${G.sc[0]} - ${G.sc[1]}`,cx,y0+32);X.font='9px sans-serif';X.fillStyle='#cbd5e1';X.fillText(`${G.q>=5?'OT':'Q'+G.q} ${xClk()}`,cx,y0+43)});X.textAlign='left'}
 if(lv>=2){X.fillStyle='#0b0f17';X.fillRect(0,TOP-13,W,9);X.fillStyle=TEAM.U.j;const t=(performance.now()/40)%160;X.font='bold 8px sans-serif';for(let x=-t;x<W;x+=160)X.fillText(ab(R.lg.t[0].n)+' ★ GO '+ab(R.lg.t[0].n).slice(0,8),x,TOP-6)}
 if(lv>=4){const n=Math.min(6,(R.dyn||[]).filter(s=>s.champ).length+1);for(let i=0;i<n;i++){const x=W*.32+i*26;X.fillStyle=i==n-1?TEAM.U.st:TEAM.U.j;X.beginPath();X.moveTo(x,0);X.lineTo(x+18,0);X.lineTo(x+18,26);X.lineTo(x+9,20);X.lineTo(x,26);X.closePath();X.fill()}}
 if(feat('riv')&&R.riv&&(R.riv[G.opp.i]||0)>=8){X.fillStyle='#ef4444';X.font='bold 14px "Trebuchet MS",sans-serif';X.textAlign='center';X.fillText('★ RIVALRY GAME ★',W/2,TOP-30);X.textAlign='left'}}
{const _dr=draw;draw=function(){_dr();try{fOverlay()}catch(e){}}}
let fLast=0;
function fOverlay(){const now=performance.now()/1000,dt=Math.min(.05,fLast?now-fLast:0);fLast=now;if(G.slow>0)G.slow-=dt;
 if(G.bigHit>0){G.bigHit-=dt;X.save();X.globalAlpha=Math.min(1,G.bigHit*2);X.font='900 italic 42px "Trebuchet MS",sans-serif';X.textAlign='center';X.fillStyle='#000a';X.fillText('BIG HIT!',W/2+3,H*.3+3);X.fillStyle='#ffd84d';X.fillText('BIG HIT!',W/2,H*.3);X.restore()}
 if(ltT>0){ltT-=dt;if(ltT<=0){const e=$('lt');if(e)e.className=''}}
 if(G.phase=='pre'&&p2on()){X.fillStyle='#000b';X.fillRect(W-250,H-150,240,40);X.fillStyle='#fca5a5';X.font='bold 11px sans-serif';X.fillText('PLAYER 2: '+(G.poss=='C'?'offense - I J K L move, 6-0 throw, U juke':'defense - I J K L move, O hit stick'),W-244,H-126)}}
// ---------- pre-snap buttons: formation, 2-player calls ----------
{const _ui=ui;ui=function(){_ui();try{fUI()}catch(e){console.error(e)}}}
function fUI(){if(!G||!P||G.phase!='pre'||G.ch)return;const pl=$('plays'),u=G.poss=='U';
 if(u&&qbIsMe()&&feat('form')&&!(CAR()&&!myUnitOn()))pl.insertAdjacentHTML('afterbegin',`<button data-a="form">Formation: ${G.form||'Default'}</button>`);
 if(p2on()){const names=u?Object.keys(DALL()):Object.keys(allP()),cur=u?P.dpn:P.name;pl.insertAdjacentHTML('beforeend',`<span class="p2l">P2 ${u?'defense':'offense'}:</span>`+names.map(n=>`<button class="p2b ${cur==n?'on':''}" data-p2="${esc(n)}">${esc(n)}</button>`).join(''))}}
$('plays').addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-a="form"],[data-p2]');if(!el)return;
 if(el.dataset.a=='form'){const i=FORMN.indexOf(G.form||'Default');G.form=FORMN[(i+1)%FORMN.length];applyPlay(P.name);ui();return}
 const n=el.dataset.p2;if(G.poss=='C'){G.p2off=n;applyPlay(n)}else{G.p2def=n;applyDef(n)}ui()});
(()=>{const w=$('wrap');if(w&&w.insertAdjacentHTML)w.insertAdjacentHTML('beforeend','<div id="lt"></div>')})();
