'use strict';
// Batch 4: momentum running, stiff-arm, ball security, celebration penalties, catch animations, tired players,
// crowd noise, smarter CPU (halftime adjustments, two-minute offense, trick plays and fakes), practice mode,
// route presets and play tags with a Suggest button, defensive spies and stunts, weekly game plans, training camp,
// contract negotiation, scouting trips, press conferences, pre-game intro and coin toss, halftime/postgame stats
// with a player of the game, player portraits, field variety, highlight videos, undo sim, season backup files,
// and accessibility (colorblind colors, bigger text, slower game speed). Each has a switch on Game features.
{const add=[
 ['On the field','accel','Momentum running','Ball carriers speed up and slow down gradually; sharp cuts cost speed.'],
 ['On the field','stiff','Stiff-arm','Shove a tackler away (R, or LB on a controller).'],
 ['On the field','secure','Ball security','Hold Shift (or a trigger) to cover the ball: fewer fumbles, a bit slower.'],
 ['On the field','celpen','Celebration penalties','Overdo a touchdown celebration and it costs 15 yards on the kickoff.'],
 ['On the field','catchanim','Catch animations','One-handed grabs and catches over the top of a defender.'],
 ['On the field','tired','Tired players show it','Players low on stamina slump while they run.'],
 ['On the field','noise','Crowd noise','Loud stadiums cause more false starts for the visiting offense and can drown out audibles.'],
 ['Smarter CPU','cpuadj','CPU halftime adjustments','If you keep beating the same coverage, the CPU changes its scheme at halftime (more often on higher difficulties).'],
 ['Smarter CPU','cpu2m','CPU two-minute offense','The CPU hurries, spikes the ball and attacks the sideline late in halves.'],
 ['Smarter CPU','cputrick','CPU trick plays and fakes','Now and then the CPU runs a trick play or a fake punt.'],
 ['Playbook','tags','Play tags and Suggest','Tag plays (red zone, 3rd and long...) in the editor; the Suggest button picks a play for the situation.'],
 ['Franchise','plan','Weekly game plan','Pick a focus before each game for a small boost.'],
 ['Franchise','camp','Training camp','Offseason drills that can bump your players\' ratings.'],
 ['Franchise','neg','Contract negotiation','Make offers and counteroffers instead of paying the asking price.'],
 ['Franchise','scoutp','Scouting trips','Spend a training point to learn a prospect\'s true ratings.'],
 ['Career','press','Press conferences','Answer reporters after games; your answers affect fans, XP and the locker room.'],
 ['Presentation','intro','Pre-game intro','A matchup card and a coin toss you call before kickoff.'],
 ['Presentation','postgame','Halftime and postgame stats','Stat screens at halftime and after the game, with a player of the game.'],
 ['Presentation','faces','Player portraits','Generated pixel portraits on player pages and stat cards.'],
 ['Presentation','fieldv','Field variety','Grass or turf, and end zone art for each team.'],
 ['Help','undo','Undo last sim','An undo button after simming, in case you simmed by accident.'],
 ['Help','autobk','Season backup file','Downloads a backup of your save at the start of every season. Off by default.']];
 const i=FEATS.findIndex(f=>f[0]=='Help');FEATS.splice(i<0?FEATS.length:i,0,...add.filter(a=>a[0]!='Help'&&!FEATS.some(f=>f[1]==a[1])));add.filter(a=>a[0]=='Help'&&!FEATS.some(f=>f[1]==a[1])).forEach(a=>FEATS.push(a));DEFOFF.add('autobk')}
const mSpd=()=>({n:1,s:.8,ss:.6})[OPT.gspd||'n']||1;
// ---------- accessibility and extra controls on the Game features page ----------
{const _fu=featUI;featUI=function(){_fu();const h=[...$('modal').querySelectorAll('h3')].find(e=>e.textContent=='Controls');if(!h||!h.nextElementSibling)return;const row=(n,d,opts,k,cur)=>`<div class="feat"><div class="row">${opts.map(([v,t])=>`<button class="${cur==v?'on':''}" onclick="optSet('${k}','${v}');mA11y()">${t}</button>`).join('')}</div><div><b>${n}</b><span class="small">${d}</span></div></div>`;
 h.nextElementSibling.insertAdjacentHTML('beforeend',row('Game speed','Slows the whole game down, clock included.',[['n','Normal'],['s','Slow'],['ss','Slower']],'gspd',OPT.gspd||'n')+row('Text size','Bigger buttons and menu text.',[['n','Normal'],['l','Large']],'txt',OPT.txt||'n')+row('Colorblind-friendly colors','Your team in blue, the other team in orange, every game.',[['0','Off'],['1','On']],'cb',String(OPT.cb||0)))}}
function mA11y(){document.body.classList.toggle('bigtxt',OPT.txt=='l');if(G&&G.opp&&typeof uniforms=='function')uniforms()}
mA11y();
{const _un=uniforms;uniforms=function(){_un();if(String(OPT.cb)=='1'){[['U','#2563eb','#1e3a8a'],['C','#f97316','#9a3412']].forEach(([k,a,b])=>{const t=TEAM[k];if(t.j=='#f1f5f9')Object.assign(t,{j2:a,h:b,pt:a,num:a});else Object.assign(t,{j:a,j2:b,h:b,num:'#fff'});t.ez=a});
 const sb=$('sb');if(sb&&sb.style.setProperty){sb.style.setProperty('--u1','#2563eb');sb.style.setProperty('--u2','#1e3a8a');sb.style.setProperty('--c1','#f97316');sb.style.setProperty('--c2','#9a3412')}}}}
// ---------- game speed, spies, stunts, animations, CPU two-minute spikes ----------
{const _st=step;step=function(dt){dt*=mSpd();try{mPre(dt)}catch(e){console.error(e)}_st(dt);try{mPost(dt)}catch(e){console.error(e)}}}
{const _kt=kickTick;kickTick=function(dt){_kt(dt*mSpd())}}{const _ps=postStep;postStep=function(dt){_ps(dt*mSpd())}}{const _ms=motionStep;motionStep=function(dt){_ms(dt*mSpd())}}
function mPre(dt){if(!P||G.phase!='play')return;const d=G.dir,L=P.L,qb=P.off[0],b=P.b;
 P.def.forEach(p=>{if(p.spy&&!(b.st=='carry')){p.zone=[L+d*5,qb.y];p.zr=6}
  if(p.stT>0){p.stT-=dt;p.bite=dt*1.01;mv(p,p.x+d*.6,p.y+p.stD*3,p.spd*.9,dt)}});
 P.off.concat(P.def).forEach(p=>{if(p.ca>0)p.ca-=dt;if(p.sa>0)p.sa-=dt})}
function mPost(dt){}
{const _sn=snap;snap=function(){const was=G.phase,u=G.poss=='U';
 if(was=='pre'&&!u&&!G.ch&&!P.moDone&&feat('cpu2m')&&G.run&&(G.q==2||G.q>=4)&&G.clk<45&&G.down<4&&(G.q==2||G.sc[1]<=G.sc[0])&&G.cspk!==G.down*1000+Math.round(P.L)&&rnd()<.3+.6*IQ()&&G.drv>0){
  G.cspk=G.down*1000+Math.round(P.L);P.spk=1;P.ranoff=1;G.clk=Math.max(0,G.clk-2);G.phase='play';endPlay('inc');G.msg='The CPU spikes it to stop the clock. '+G.msg;return}
 _sn();
 if(was!='play'&&G.phase=='play'&&P.b.st=='qb'&&!P.over){const D=P.def,O=P.off,L=P.L,d=G.dir,qb=O[0];
  D.forEach((p,i)=>{const e=P.dp&&P.dp.p[i];if(!e)return;if(e[2]=='s'){p.spy=1;p.rush=false;p.cover=null;p.zone=[L+d*5,qb.y];p.zr=6}if(e[2]=='r'&&e[3]=='st'){p.stT=.42;p.stD=p.y<26.5?1:-1}});
  if(feat('noise')&&!G.two&&!P.kr&&mLoud()&&G.poss!=G.home&&rnd()<.012)penApply({s:'O',n:'False start (crowd noise)',y:5})}}}
function mLoud(){if(!G||!G.live)return false;return!!(R.lg.po||(R.riv&&(R.riv[G.opp.i]||0)>=8)||G.night||Math.abs(G.mom||0)>40)}
{const _cg=chg;chg=function(fn){if(feat('noise')&&G.called&&G.poss=='U'&&G.home!='U'&&mLoud()&&G.aud>0&&rnd()<.25){G.aud--;G.msg="Too loud! Your audible didn't get through.";return}return _cg(fn)}}
// ---------- momentum running, ball security ----------
{const _mv=mv;mv=function(p,tx,ty,sp,dt){if(!G||!P)return _mv(p,tx,ty,sp,dt);const b=P.b,car=b&&b.st=='carry'&&b.c===p;
 if(car&&mSecure(p))sp*=.9;
 if(feat('accel')&&car&&G.phase=='play'){const acc=7+((p.sk?p.sk.spd:60)-50)*.15,dx=tx-p.x,dy=ty-p.y,m=Math.hypot(dx,dy)||1;let cs=p.cs==null?Math.hypot(p.vx||0,p.vy||0):p.cs;
  const v=Math.hypot(p.vx||0,p.vy||0);if(v>.5){const dot=((p.vx||0)*dx+(p.vy||0)*dy)/(v*m);if(dot<.5)cs*=Math.pow(.25,dt*(1-dot))}
  cs=Math.min(sp,cs+acc*dt);p.cs=cs;return _mv(p,tx,ty,Math.max(1.5,cs),dt)}
 if(!car)p.cs=null;return _mv(p,tx,ty,sp,dt)}}
function mSecure(p){if(!feat('secure')||!p||p.t!='U')return false;if(CAR()&&p.pid!==R.me)return false;if(keys.shift)return true;try{const gp=(navigator.getGamepads?[...navigator.getGamepads()]:[]).find(g=>g&&g.connected);return!!(gp&&((gp.buttons[6]&&gp.buttons[6].pressed)||(gp.buttons[7]&&gp.buttons[7].pressed)))}catch(e){return false}}
{const _xf=xFumRoll;xFumRoll=function(k){const c=k=='sack'?P.off[0]:P.b.c;const r=_xf(k);if(r&&c&&mSecure(c)&&rnd()<.75)return false;return r}}
// ---------- stiff-arm ----------
function stiffArm(c){if(!feat('stiff')||!c||(c.mc||0)>0)return;const s=c.stm==null?100:c.stm;if(s<10)return;c.mc=1.2;c.ml=.6;c.mv='stiff arm';c.sa=.55;c.stm=s-10;
 const n=P.def.filter(p=>!p.fall).reduce((a,p)=>!a||dist(p,c)<dist(a,c)?p:a,null);c.saSide=n?Math.sign(n.y-c.y)||1:1;if(c.t=='U')G.msg='Stiff arm!'}
{const _tm=tackleMod;tackleMod=function(p,h){let m=_tm(p,h);if(h.sa>0&&feat('stiff')){const edge=((h.sk?h.sk.str:60)-(p.sk?p.sk.str:60))/40;m*=clamp(.45-edge*.3,.15,.75)}return m}}
{const _bt=brokeTackle;brokeTackle=function(p,h){_bt(p,h);if(h.sa>0){const dx=p.x-h.x,dy=p.y-h.y,m=Math.hypot(dx,dy)||1;p.kb={t:0,x:dx/m*7,y:dy/m*7};p.stun=Math.max(p.stun||0,.5);p.cool=Math.max(p.cool,.6);if(h.t=='U')G.msg='Stiff-armed him!'}}}
{const _am=aiMove2;aiMove2=function(c,n,iq){if(feat('stiff')&&!(c.mc>0)&&n&&Math.abs(n.y-c.y)>.6&&rnd()<.25){return stiffArm(c)}return _am(c,n,iq)}}
// ---------- celebration penalties ----------
{const _cs=celStep;celStep=function(dt){_cs(dt);const c=G.cel;if(c&&!c.pen&&c.t>1.1){c.pen=1;if(feat('celpen')&&['dance','flex','spin'].includes(c.ty)&&rnd()<.15){G.koPen=P.off.includes(c.p)?G.poss:(G.poss=='U'?'C':'U');G.flag={x:c.p.x,y:c.p.y,t:0};G.msg+=' Flag: excessive celebration, 15 yards on the kickoff.';sfx('flag');xLog('Flag: excessive celebration. 15 yards on the kickoff.')}}}}
{const _kr=krSetup;krSetup=function(lx,d,kind){_kr(lx,d,kind);P.wasKO=kind=='ko'}}
{const _sk=startKick;startKick=function(kind,kt,spot){const pen=kind=='ko'&&G.koPen&&G.koPen==kt;const r=_sk(kind,kt,spot);if(pen&&G.phase=='pre'&&!G.ch){G.koPen=null;G.los=clamp(G.los+G.dir*15,11,109);setup();G.msg='Touchback, plus 15 yards for the celebration penalty.'}return r}}
// ---------- catch animations ----------
{const _rs=resolve;resolve=function(){const b=P.b,r=b.tgt,l={x:b.tx,y:b.ty},rd=r?dist(r,l):99;_rs();
 if(feat('catchanim')&&r&&b.st=='carry'&&b.c===r){const dd=P.def.reduce((a,p)=>dist(p,r)<dist(a,r)?p:a);if(dist(dd,r)<1.3){r.ml=.8;r.mv='over the top';r.ca=.6}else if(rd>1.35){r.ml=.8;r.mv='one-handed!';r.ca=.6;r.ca1=1}}}}
// ---------- endPlay: celebration penalty yards, play-by-play for fakes ----------
{const _ep=endPlay;endPlay=function(k,x){if(!P||P.over)return _ep(k,x);const ko=P.kr&&P.wasKO,pen=G.koPen;_ep(k,x);if(P.over&&ko&&pen&&k!='td'&&G.poss!=pen){G.koPen=null;G.nl=clamp(G.nl+G.dir*15,11,109);G.msg+=' Plus 15 yards for the celebration penalty.'}}}
// ---------- drawing: stiff-arm, raised catching arm, tired slump, portraits ----------
{const _sp=sprite;sprite=function(p,t){if(p.gone)return _sp(p,t);const live=G&&G.phase!='replay',tired=live&&feat('tired')&&G.phase=='play'&&(p.stm==null?100:p.stm)<25&&Math.hypot(p.vx||0,p.vy||0)>1;
 const s=P2(p.x,p.y),k=scY(p.y),u=2.6*k;if(tired){X.save();X.translate(s[0],s[1]);X.rotate((Math.cos(p.fa)>=0?1:-1)*.14);X.translate(-s[0],-s[1])}
 let hy;try{hy=_sp(p,t)}finally{if(tired)X.restore()}
 const c=TEAM[p.t]||TEAM.C,jz=(p.jz||0)*GZ*k,yb=s[1]-jz;
 if(live&&p.sa>0){const f=Math.cos(p.fa)>=0?1:-1;X.fillStyle=c.j;X.fillRect(s[0]+f*2.5*u,yb-7*u,f*4.5*u,1.6*u);X.fillStyle='#e8c39e';X.fillRect(s[0]+f*7*u,yb-7.4*u,f*1.4*u,2.2*u)}
 if(live&&p.ca>0){const f=Math.cos(p.fa)>=0?1:-1;X.fillStyle=c.j;X.fillRect(s[0]+f*1.6*u,yb-15*u,1.4*u,5*u);if(p.ca1){X.fillStyle='#e8c39e';X.fillRect(s[0]+f*1.4*u,yb-16.4*u,1.8*u,1.6*u)}}
 if(tired&&rnd()<.15){X.fillStyle='#93c5fd';X.fillRect(s[0]+(rnd()-.5)*10,hy+2,2,3)}return hy}}
const FACE=new Map();
function pface(p,sz){if(!feat('faces')||!p)return'';if(!FACE.has(p.id)){try{const c=document.createElement('canvas');c.width=12;c.height=12;const g=c.getContext('2d');if(!g||!g.fillRect)return'';const h=hsh(p.id),pick=(a,n)=>a[(h>>>n)%a.length];
  const skin=pick(['#f2d0b1','#e0ac85','#c68863','#a86b4a','#8a5536','#6b3f26','#4d2c1b'],3),hair=pick(['#1f1a17','#3b2414','#6b4423','#a16b2c','#d9b25c','#2b2b2b','#7a7a7a'],7),eye='#1b1b1b',P_=(x,y,w,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,w,hh)};
  P_(0,0,12,12,'#1d3a2a');P_(3,2,6,8,skin);P_(2,4,1,3,skin);P_(9,4,1,3,skin);const hs=(h>>>11)%4;if(hs==0)P_(3,1,6,2,hair);else if(hs==1){P_(2,1,8,2,hair);P_(2,2,1,3,hair);P_(9,2,1,3,hair)}else if(hs==2)P_(4,1,4,1,hair);else{P_(2,0,8,3,hair);P_(2,3,1,4,hair);P_(9,3,1,4,hair)}
  P_(4,5,1,1,eye);P_(7,5,1,1,eye);P_(5,8,2,1,'#7a3b2e');if((h>>>14)%3==0){P_(3,8,6,2,hair);P_(5,8,2,1,'#7a3b2e')}const tc=p.tid>=0&&R.lg.t[p.tid]?teamCol(p.tid):['#475569','#1e293b'];P_(2,10,8,2,tc[0]);P_(3,2,6,1,(h>>>17)%4==0?tc[0]:'transparent');
  FACE.set(p.id,c.toDataURL())}catch(e){return''}}return`<img class="face" src="${FACE.get(p.id)}" width="${sz}" height="${sz}" alt="">`}
{const _pp=pp;pp=function(id,...a){const r=_pp(id,...a);try{const p=R.pl.find(q=>q.id==id),h=$('modal').querySelector('h1');if(p&&h&&feat('faces'))h.insertAdjacentHTML('afterbegin',pface(p,56))}catch(e){}return r}}
{const _lt=ltShow;ltShow=function(p,title){_lt(p,title);try{const e=$('lt'),pl=p&&R.pl.find(q=>q.id===p.pid);if(e&&pl&&feat('faces')&&e.className=='show'&&!e.querySelector('.face'))e.insertAdjacentHTML('afterbegin',pface(pl,44))}catch(e){}}}
// ---------- field variety ----------
function fieldCol(x){const t=mTurf();return t?((x/5)%2?'#2b9a47':'#289243'):((x/5)%2?'#2f8a3a':'#2a7f35')}
function mTurf(){if(!feat('fieldv')||!G||!G.opp)return false;const i=G.home=='U'?0:G.opp.i;return hsh(i+7)%2==0}
{const _df=drawField;drawField=function(){_df();try{if(!feat('fieldv')||!G||!G.opp)return;[[0,0],[110,G.opp.i]].forEach(([x0,ti])=>{const c=teamCol(ti),a=P2(x0,0),b=P2(x0+10,0),cc=P2(x0+10,FW),d=P2(x0,FW);X.save();X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(b[0],b[1]);X.lineTo(cc[0],cc[1]);X.lineTo(d[0],d[1]);X.closePath();X.clip();
  X.strokeStyle=c[2]+'55';X.lineWidth=6;const sty=hsh(ti)%2;for(let y=-20;y<FW+20;y+=4){const p0=P2(x0,y),p1=P2(x0+10,sty?y+10:y);X.beginPath();X.moveTo(p0[0],p0[1]);X.lineTo(p1[0],p1[1]);X.stroke()}X.restore()})}catch(e){}}}
// ---------- smarter CPU ----------
{const _qo=quarterOver;quarterOver=function(){const q=G.q;const r=_qo();try{if(q==2&&G.q==3&&G.live)mHalf()}catch(e){console.error(e)}return r}}
function mHalf(){if(feat('cpuadj')&&rnd()<.25+.7*IQ()&&G.dburn){const e=Object.entries(G.dburn).sort((a,b)=>b[1]-a[1]);if(e.length&&e[0][1]>25){G.ban=[e[0][0]];let py=0,ry=0;for(const id in G.box){const pl=R.pl.find(q=>q.id==id);if(pl&&pl.tid===0){py+=G.box[id][SI.py];ry+=G.box[id][SI.ry]}}G.cpuLean=py>=ry*1.4?'pass':ry>=py*1.2?'run':null;
  const t=`The CPU adjusted at halftime: no more ${e[0][0]}${G.cpuLean?`, and they're selling out to stop the ${G.cpuLean}`:''}.`;xLog(t);G.msg=t+' '+G.msg}}
 if(feat('postgame')&&G.paused&&!$('modal').hidden){const pg=$('modal').querySelector('.pg');if(pg)pg.insertAdjacentHTML('beforeend',`<h3>First half</h3>${mStats()}`)}}
{const _cd=cpuDef;cpuDef=function(){let n=_cd();if(G.ban&&G.ban.includes(n)&&rnd()<.85){const pref=G.cpuLean=='pass'?['Cover 3','Cover 2 Zone','Man Free']:G.cpuLean=='run'?['Blitz','All Out','Man Free']:[],ks=Object.keys(DALL()).filter(k=>!G.ban.includes(k));n=pref.find(k=>ks.includes(k))||ks[rnd()*ks.length|0]||n}return n}}
{const _cp=cpuPlay;cpuPlay=function(){let n=_cp();const all=allP();
 if(feat('cputrick')&&feat('plays2')&&rnd()<.015+.025*IQ()){const t=['Flea Flicker','HB Pass','PA Deep','RPO Slant'].filter(k=>all[k]);if(t.length)return t[rnd()*t.length|0]}
 if(feat('cpu2m')&&(G.q==2||G.q>=4)&&G.clk<120&&(G.q==2||G.sc[1]<=G.sc[0])&&rnd()<IQ()){const t=['Curls','Post Corner','Slants','Verts','Mesh'].filter(k=>all[k]);if(t.length)return t[rnd()*t.length|0]}return n}}
{const _c4=cpu4th;cpu4th=function(){const d=G.dir,dg=((d>0?110:10)-P.L)*d;if(feat('cputrick')&&dg>45&&G.ytg<=3&&(G.sc[1]<G.sc[0]||G.q<=2)&&rnd()<.03+.07*IQ()){G.msg='FAKE PUNT by the CPU!';xLog(`${tAbbr(G.opp.n)}: fake punt!`);return false}return _c4()}}
// ---------- route presets and play tags (offensive play editor) ----------
const RPRE={Slant:[[2,0],[8,6]],Out:[[6,0],[6,-8]],In:[[7,0],[7,8]],Post:[[10,0],[22,8]],Corner:[[10,0],[20,-8]],Go:[[28,0]],Curl:[[11,0],[9,1]],Comeback:[[13,0],[11,-3]],Wheel:[[1,-4],[4,-7],[22,-7]],Flat:[[1,-7]],'Clear':[]};
const TAGS=['Short yardage','3rd and long','Red zone','2-minute','Deep shot'];let PTAG={};try{PTAG=JSON.parse(lsGet('gdtags'))||{}}catch(e){}
{const _eu=edUI;edUI=function(){_eu();try{const t=$('edt');if(!t)return;const n=E.n,tg=PTAG[n]||[];t.insertAdjacentHTML('beforeend',`<div class="edx"><span class="small">Route for the selected player:</span> ${Object.keys(RPRE).map(k=>`<button onclick="edRoute('${k}')">${k}</button>`).join('')}</div>`+(feat('tags')?`<div class="edx"><span class="small">Tags for ${esc(n)}:</span> ${TAGS.map(k=>`<button class="${tg.includes(k)?'on':''}" onclick="edTag('${k}')">${k}</button>`).join('')}</div>`:''))}catch(e){console.error(e)}}}
function edRoute(k){const q=E.pl.p[E.sel];if(!q)return;const m=q[1]<26.5?1:-1;q[2]=RPRE[k].map(([a,b])=>[a,b*m]);edUI()}
function edTag(k){const n=E.n,a=PTAG[n]=PTAG[n]||[],i=a.indexOf(k);if(i<0)a.push(k);else a.splice(i,1);lsSet('gdtags',JSON.stringify(PTAG));edUI()}
function suggest(){const all=allP(),d=G.dir,toGo=((d>0?110:10)-P.L)*d,late=(G.q==2||G.q>=4)&&G.clk<120,sit=[];if(G.ytg<=2)sit.push('Short yardage');if(G.down>=3&&G.ytg>=7)sit.push('3rd and long');if(toGo<=20)sit.push('Red zone');if(late)sit.push('2-minute');if(G.down<=2&&G.ytg>=10&&toGo>40)sit.push('Deep shot');
 let names=Object.keys(all).filter(n=>(PTAG[n]||[]).some(t=>sit.includes(t)));if(!names.length){names=Object.keys(all).filter(n=>G.ytg<=2?all[n].run:G.ytg>=7?!all[n].run:true)}
 const sc=n=>{const s=R.pst&&R.pst[n];return(s&&s[0]>=3?s[2]/s[0]:.45)+rnd()*.25};names.sort((a,b)=>sc(b)-sc(a));const n=names[0];if(n&&n!=P.name)chg(()=>{applyPlay(n);sel=-1});if(n)G.msg=`Suggested: ${n}${sit.length?' ('+sit[0].toLowerCase()+')':''}.`;ui()}
{const _ui=ui;ui=function(){_ui();try{if(G&&P&&G.phase=='pre'&&!G.ch&&G.poss=='U'&&qbIsMe()&&feat('tags')&&!(CAR()&&!myUnitOn()))$('plays').insertAdjacentHTML('afterbegin','<button data-a="sug">Suggest</button>')}catch(e){}}}
$('plays').addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-a="sug"]');if(el)suggest()});
// ---------- defensive editor: spies and stunts ----------
{const _de=deUI;deUI=function(){_de();try{const q=DE.pl.p[DE.sel];$('edt').insertAdjacentHTML('beforeend',`<div class="edx">${B('deSpy()','QB spy',q&&q[2]=='s'?'on':'')}${B('deStunt()','Stunt (rushers loop inside first)',q&&q[2]=='r'&&q[3]=='st'?'on':'')}<span class="small"> A spy shadows the QB 5 yards off the line and chases him if he runs.</span></div>`)}catch(e){}}}
function deSpy(){const q=DE.pl.p[DE.sel];if(!q)return;if(q[2]=='s'){q[2]='z';q[3]=[6,q[1]];q.length=4}else{q[2]='s';q.length=3}deUI()}
function deStunt(){const q=DE.pl.p[DE.sel];if(!q)return;if(q[2]!='r'){q[2]='r';q.length=3}q[3]=q[3]=='st'?undefined:'st';if(q[3]===undefined)q.length=3;deUI()}
// ---------- weekly game plan ----------
const PLANS={cover:'Stop the pass',rush:'Pressure the QB',run:'Run the ball'};
{const _xn=xNewGame;xNewGame=function(){_xn();try{if(feat('plan')&&!CAR()&&R.plan&&PLANS[R.plan]&&G.live!==undefined){G.adj=R.plan}if(feat('plan')&&rnd()<IQ())G.adjC=Object.keys(PLANS)[rnd()*3|0]}catch(e){}}}
// ---------- practice mode ----------
function pracUI(){VW.page='prac';if(CAR())return modal(`${nav()}<h1>Practice</h1><p>Practice mode is for franchise mode, where you call the plays.</p>`);const T=R.lg.t,o=VW.pracO||1;
 modal(`${nav()}<h1>Practice</h1><p>Run plays against any defense with no clock. Every play resets to the same spot. Press Esc and quit when you're done.</p>
 <p>Side <select id="prs"><option value="U">Offense</option><option value="C">Defense</option></select> Ball on the <select id="prl">${[20,35,50,65,80,95].map(y=>`<option value="${y}" ${y==35?'selected':''}>${y<=60?'own '+(y-10):'their '+(110-y)}</option>`).join('')}</select>
 Against <select id="pro">${T.map((t,i)=>i?`<option value="${i}" ${i==o?'selected':''}>${esc(t.n)}</option>`:'').join('')}</select></p>
 <p>Their defense <select id="prd"><option value="">CPU picks</option>${Object.keys(DALL()).map(n=>`<option>${esc(n)}</option>`).join('')}</select> Their offense <select id="prp"><option value="">CPU picks</option>${Object.keys(allP()).map(n=>`<option>${esc(n)}</option>`).join('')}</select></p>
 <div class="btns">${B('pracGo()','Start practice','go')}</div>`)}
function pracGo(){const s=$('prs').value,l=+$('prl').value,o=+$('pro').value;VW.pracO=o;const t=R.lg.t[o];autoFill(0);autoFill(o);newGame({n:t.n,r:Math.round(teamR(o)),i:o});
 G.live=1;G.prac={s,l,d:$('prd').value,p:$('prp').value};G.po='';$('modal').hidden=1;pracReset()}
function pracReset(){const pr=G.prac;Object.assign(G,{q:1,clk:900,run:false,ch:null,two:0,ot:0,poss:pr.s,dir:pr.s=='U'?1:-1,los:pr.s=='U'?pr.l:120-pr.l,down:1,ytg:10,phase:'pre',next:'same',sc:[0,0]});setup();
 if(pr.s=='U'&&pr.d&&DALL()[pr.d])applyDef(pr.d);if(pr.s=='C'&&pr.p&&allP()[pr.p])applyPlay(pr.p);G.msg='Practice: '+G.msg;ui()}
{const _nx=next;next=function(){if(G&&G.prac){G.clk=900;return pracReset()}return _nx()}}
{const _eg=endGame;endGame=function(){if(G&&G.prac){G.live=0;G.prac=null;G.phase='over';return lobby()}return mEndGame(_eg)}}
{const _gl=gameLobby;gameLobby=function(...a){const r=_gl.apply(this,a);if(G&&G.prac){const g=$('modal').querySelector('.grid');if(g)g.insertAdjacentHTML('beforeend',B("G.live=0;G.prac=null;G.phase='over';lobby()",'Quit practice'))}return r}}
// ---------- pre-game intro and coin toss ----------
{const _sg=startGame;startGame=function(...a){UNDO=null;const r=_sg.apply(this,a);try{if(G&&G.live&&feat('intro')&&!G.chal&&!G.prac)mIntro()}catch(e){console.error(e)}return r}}
function mIntro(){const T=R.lg.t,o=G.opp.i,L0=lineup(0),Lo=lineup(o),top=L=>[L.O[0],[...L.D].filter(Boolean).sort((a,b)=>ovr(b)-ovr(a))[0]],cu=teamCol(0),co=teamCol(o),k=p=>p?`${p.g} ${esc(p.n)} (${ovr(p)})`:'-';G.paused=1;
 const side=(i,c,L,away)=>`<div class="mside" style="background:linear-gradient(${c[0]},${c[1]})">${pface(top(L)[0],40)}<b>${esc(T[i].n)}</b><span>${rec3(T[i])} · rating ${Math.round(teamR(i))}${away?' · away':' · home'}</span><em>${k(top(L)[0])}<br>${k(top(L)[1])}</em></div>`;
 modal(`<div class="intro"><p class="dim">${G.po||'Week '+(R.lg.wk+1)} · ${wxName(G.wx)}${G.wind&&G.wind.m>=5?', wind '+G.wind.m+' mph':''}${G.night?' · under the lights':''}${(R.riv[o]||0)>=8?' · <b class="l">RIVALRY GAME</b>':''}</p>
 <div class="mvs">${side(0,cu,L0,G.home!='U')}<div class="mvsx">VS</div>${side(o,co,Lo,G.home=='U')}</div>
 ${feat('plan')&&!CAR()?`<p>Game plan: ${Object.keys(PLANS).map(k=>`<button class="${(G.adj||R.plan)==k?'on':''}" onclick="R.plan='${k}';G.adj='${k}';mIntro()">${PLANS[k]}</button>`).join('')}</p>`:''}
 ${CAR()?`<div class="grid">${B('mStartPlay()','Kick off','big')}</div>`:`<h3>Coin toss: call it</h3><div class="grid">${B("coin('h')",'Heads','big')}${B("coin('t')",'Tails','big')}</div>`}</div>`)}
function coin(c){const win=rnd()<.5,f=win?c:(c=='h'?'t':'h');if(win){modal(`<div class="intro"><h1>${f=='h'?'Heads':'Tails'}. You won the toss!</h1><div class="grid">${B('mToss(1)','Receive','big')}${B('mToss(0)','Kick off','big')}</div></div>`)}else{modal(`<div class="intro"><h1>${f=='h'?'Heads':'Tails'}. They won the toss and will receive.</h1><div class="grid">${B('mToss(0)','Kick off','big')}</div></div>`)}}
function mToss(rec){if(!rec){G.recv='C';startKick('ko','U')}else G.recv='U';mStartPlay()}
function mStartPlay(){G.paused=0;$('modal').hidden=1;ui()}
// ---------- halftime / postgame stats and player of the game ----------
function mStats(){const by={},t=[{py:0,ry:0,int:0,sk:0},{py:0,ry:0,int:0,sk:0}];R.pl.forEach(p=>by[p.id]=p);let best=null,bs=-1;
 for(const id in G.box){const p=by[id];if(!p)continue;const s=G.box[id],v=k=>s[SI[k]]||0,tt=p.tid===0?0:1;t[tt].py+=v('py');t[tt].ry+=v('ry');t[tt].int+=v('pi');t[tt].sk+=v('sk');
  const sc=v('py')/25+v('ptd')*4-v('pi')*3+v('ry')/10+v('rtd')*6+v('ty')/10+v('tt')*6+v('tk')*.8+v('sk')*4+v('in')*5+v('fgm')*3;if(sc>bs){bs=sc;best=[p,s]}}
 const tr=(n,k)=>`<tr><td>${n}</td><td class="num">${t[0][k]}</td><td class="num">${t[1][k]}</td></tr>`;
 return`<div class="dash">${card('Team stats',`<table class="mini"><tr><th></th><th class="num">${esc(tAbbr(R.lg.t[0].n))}</th><th class="num">${esc(tAbbr(G.opp.n))}</th></tr>${tr('Passing yards','py')}${tr('Rushing yards','ry')}${tr('Interceptions thrown','int')}${tr('Sacks','sk')}</table>`)}
 ${best?card('Player of the game',`<div class="pcard">${pface(best[0],48)}<div><div class="big">${esc(best[0].n)}</div><p class="dim">${best[0].g} · ${esc(best[0].tid===0?R.lg.t[0].n:G.opp.n)}</p><p>${boxLine(best[1])}</p></div></div>`):''}</div>`}
function mEndGame(_eg){if(!G||!G.live||G.chal||!feat('postgame'))return _eg();const st=mStats(),a=G.sc[0],b=G.sc[1],on=G.opp.n,bi=(R.box||[]).length;const r=_eg();
 try{const h=$('modal').querySelector('h1'),t=h?h.textContent:'';if(/is over|offseason|draft|fired|Free agency/i.test(t))return r;
  modal(`<h1>Final: ${a>b?'Win':a<b?'Loss':'Tie'} ${a}-${b}</h1><p class="dim">vs ${esc(on)}</p>${st}<div class="btns">${R.box&&R.box.length>bi?B(`boxUI(${R.box.length-1})`,'Box score'):''}${B('lobby()','Continue','go')}</div>`)}catch(e){console.error(e)}return r}
// ---------- training camp ----------
function campUI(){VW.page='camp';if(CAR())return modal(`${nav()}<h1>Training camp</h1><p>Training camp is for franchise mode.</p>`);if(!feat('camp'))return modal(`${nav()}<h1>Training camp</h1><p>Training camp is switched off on the Game features page.</p>`);
 R.camp=R.camp&&R.camp.s==R.season?R.camp:{s:R.season,n:3};const pl=teamPl(0).filter(p=>p.age<=30).sort((a,b)=>ovr(b,1)-ovr(a,1));
 modal(`${nav()}<h1>Training camp</h1><p>Run drills to give a player a ratings bump. ${R.camp.n} session${R.camp.n==1?'':'s'} left this season.${R.stage?'':' (Best done in the offseason, but you can run them anytime.)'}</p>
 <p>Player <select id="cpl">${pl.map(p=>`<option value="${p.id}">${p.g} ${esc(p.n)} (spd ${p.sk.spd}, skill ${p.sk.skl})</option>`).join('')}</select></p>
 <div class="dash">${card('40-yard dash',`<p>Mash Space (or click the button) as fast as you can for 5 seconds. A fast time adds +1 speed.</p><div class="btns">${R.camp.n>0?B("drill('dash')",'Start','go'):'<span class="dim">No sessions left</span>'}</div>`)}
 ${card('Route timing',`<p>Press Space (or click) when the marker is in the green zone. 5 reps. 4 or more adds +1 skill.</p><div class="btns">${R.camp.n>0?B("drill('route')",'Start','go'):'<span class="dim">No sessions left</span>'}</div>`)}</div><div id="drill"></div>`)}
let DR=null;
function drill(k){const id=+$('cpl').value,p=R.pl.find(q=>q.id===id);if(!p||R.camp.n<1)return;R.camp.n--;save();DR={k,p,t0:performance.now(),n:0,hits:0,rep:0,ph:0};const box=$('drill');
 const tap=()=>{if(!DR)return;if(DR.k=='dash')DR.n++;else{const x=DRpos();if(Math.abs(x-.75)<.08)DR.hits++;DR.rep++;if(DR.rep>=5)return drillEnd()}};DR.tap=tap;
 box.innerHTML=`<div class="drillbox"><div class="dbar"><i id="dmk"></i>${k=='route'?'<b class="dz"></b>':''}</div><p id="dtx"></p><button class="big" id="dtap">${k=='dash'?'TAP':'NOW'}</button></div>`;$('dtap').onpointerdown=e=>{e.preventDefault();tap()};
 const loop=()=>{if(!DR||!$('dmk'))return;const t=(performance.now()-DR.t0)/1000;if(DR.k=='dash'){$('dmk').style.left=Math.min(100,DR.n*2.2)+'%';$('dtx').textContent=`${Math.max(0,5-t).toFixed(1)}s · ${DR.n} taps`;if(t>=5)return drillEnd()}
  else{$('dmk').style.left=(DRpos()*100)+'%';$('dtx').textContent=`Rep ${DR.rep+1} of 5 · ${DR.hits} hit`}requestAnimationFrame(loop)};requestAnimationFrame(loop)}
const DRpos=()=>{const t=(performance.now()-DR.t0)/1000*(.9+DR.rep*.12);return Math.abs((t%2)-1)};
function drillEnd(){const d=DR;DR=null;if(!d)return;const p=d.p;let msg;if(d.k=='dash'){const tm=Math.max(4.2,5.6-d.n*.02);const ok=tm<=4.55;if(ok&&p.sk.spd<99){p.sk.spd++;if(p.mx.spd<p.sk.spd)p.mx.spd=p.sk.spd}msg=`${p.n} ran a ${tm.toFixed(2)}. ${ok?'+1 speed!':'Needs to be 4.55 or faster for a bump.'}`}
 else{const ok=d.hits>=4;if(ok&&p.sk.skl<99){p.sk.skl++;if(p.mx.skl<p.sk.skl)p.mx.skl=p.sk.skl}msg=`${d.hits} of 5 reps on time. ${ok?'+1 skill!':'Needs 4 for a bump.'}`}save();campUI();$('drill').innerHTML=`<p class="good">${esc(msg)}</p>`}
addEventListener('keydown',e=>{if(DR&&e.key==' '){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)DR.tap()}},true);
// ---------- contract negotiation ----------
{const _rs=resign,_sf=signFA;resign=function(id,yr){if(!feat('neg'))return _rs(id,yr);negUI(id,yr,'re')};signFA=function(id,yr){if(!feat('neg'))return _sf(id,yr);negUI(id,yr,'fa')}
 window.negDone=(id,yr,k,sal)=>{const p=R.pl.find(q=>q.id==id);if(!p)return lobby();if(k=='re')_rs(id,yr);else _sf(id,yr);if(p.tid===0&&p.exp>=R.season+yr-0&&p.sal>sal){p.sal=sal;save()}k=='re'?resignUI():faUI()}}
function negUI(id,yr,k,msg){const p=R.pl.find(q=>q.id==id);if(!p)return lobby();const ask=k=='re'?askFor(p,0,yr):faAsk(p,yr);p.neg=p.neg&&p.neg.s==R.season?p.neg:{s:R.season,n:0,c:null};
 if(p.neg.walk)return modal(`${nav()}<h1>${esc(p.n)}</h1><p>He's done negotiating with you this offseason.</p>${B(k=='re'?'resignUI()':'faUI()','Back')}`);const room=R.cap-payroll(0),offs=[.8,.88,.94,1].map(f=>Math.max(MINSAL,Math.round(ask*f*10)/10));
 modal(`${nav()}<h1>Negotiate: ${p.g} ${esc(p.n)}</h1><p>Asking ${M$(ask)} per year for ${yr} year${yr>1?'s':''}. Cap room ${M$(room)}.${p.neg.c?` <b>His counteroffer: ${M$(p.neg.c)}.</b>`:''}</p>${msg?`<p class="warn">${esc(msg)}</p>`:''}
 <p>Your offer: ${offs.map(o=>B(`negOffer(${id},${yr},'${k}',${o})`,M$(o))).join('')}${p.neg.c?B(`negOffer(${id},${yr},'${k}',${p.neg.c})`,'Accept his counter','go'):''}</p><p class="small">Lowball offers can annoy him. Three rejected offers and he walks.</p>${B(k=='re'?'resignUI()':'faUI()','Back')}`)}
function negOffer(id,yr,k,x){const p=R.pl.find(q=>q.id==id),ask=k=='re'?askFor(p,0,yr):faAsk(p,yr),m=morOf(p),give=.9-(m<40?.06:0)+(p.mood&&p.mood.includes('L')&&k=='re'?.04:0);
 if(x>R.cap-payroll(0)+(k=='re'?0:0)&&x>MINSAL)return negUI(id,yr,k,"You don't have the cap room for that.");
 if(x>=ask||(p.neg.c&&x>=p.neg.c)||x>=ask*give+rnd()*ask*.04)return negDone(id,yr,k,x);
 p.neg.n++;p.mor=fr(m-(x<ask*.85?6:2),0,100);if(p.neg.n>=3||x<ask*.75){p.neg.walk=1;save();return negUI(id,yr,k)}p.neg.c=Math.round((x+ask)/2*10)/10;save();negUI(id,yr,k,'He turned it down, but made a counteroffer.')}
// ---------- scouting trips (on the combine page) ----------
{const _cb=combineUI;combineUI=function(){const r=_cb();try{if(!feat('scoutp'))return r;const t=$('modal').querySelector('table');if(!t)return r;const rows=[...t.querySelectorAll('tr')];rows[0].insertAdjacentHTML('beforeend','<th></th>');
 rows.slice(1).forEach(tr=>{const a=tr.querySelector('a');const id=a&&+(a.getAttribute('onclick').match(/\d+/)||[])[0];const p=R.pl.find(q=>q.id===id);tr.insertAdjacentHTML('beforeend',`<td>${p?p.scouted?'<span class="good">scouted</span>':B(`scoutTrip(${id})`,'Scout (1 pt)',R.pts>=1?'':'dim'):''}</td>`)});
 t.insertAdjacentHTML('beforebegin',`<p class="small">Scouting trips: spend 1 training point (you have ${R.pts}) to learn a prospect's true ratings.</p>`)}catch(e){console.error(e)}return r}}
function scoutTrip(id){const p=R.pl.find(q=>q.id===id);if(!p||R.pts<1||p.scouted)return combineUI();R.pts--;p.scouted=1;p.fz=[0,0];save();combineUI()}
// ---------- press conferences (career) ----------
const PRESS=[['How do you explain that result?',[['Credit the whole team (+team chemistry)',{xp:5,mor:4}],['I put this team on my back (+fans)',{fans:4,mor:-3}],['No comment (nothing happens)',{}]]],
 ['Is there tension in the locker room?',[['We are a family (+chemistry)',{mor:5}],['Some guys need to step up (+XP, -chemistry)',{xp:10,mor:-5}]]],
 ['What are your goals this season?',[['Win a title (+fans)',{fans:3}],['Get better every week (+XP)',{xp:8}]]],
 ['Thoughts on your next opponent?',[['Lots of respect for them (+XP)',{xp:6}],['They are overrated (+fans, more pressure)',{fans:5,xp:-3}]]]];
{const _res=result;result=function(...a){const r=_res(...a);try{if(CAR()&&feat('press')&&rnd()<.5)R.press=rnd()*PRESS.length|0}catch(e){}return r}}
function pressPick(i){const q=PRESS[R.press];if(!q)return careerHub();const f=q[1][i][1];R.xp=Math.max(0,(R.xp||0)+(f.xp||0));R.fans=(R.fans||0)+(f.fans||0);if(f.mor)teamPl(0).forEach(p=>p.mor=fr(morOf(p)+f.mor,0,100));R.press=null;save();careerHub()}
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{if(!CAR()||(G&&G.live))return r;const d=$('modal').querySelector('.dash');if(!d)return r;let h='';
 if(feat('press')&&R.press!=null&&PRESS[R.press]){const q=PRESS[R.press];h+=card('Press conference',`<p>"${q[0]}"</p><div class="btns">${q[1].map((c,i)=>B(`pressPick(${i})`,c[0])).join('')}</div>`)}
 const me=d.querySelector('.pcard');if(me&&feat('faces')){const p=meRow();if(p)me.insertAdjacentHTML('afterbegin',pface(p,56))}
 if(h)(d.firstElementChild||d).insertAdjacentHTML(d.firstElementChild?'afterend':'afterbegin',h)}catch(e){console.error(e)}return r}}
// ---------- highlight videos ----------
{const _hu=hlUI;hlUI=function(){_hu();try{if(!globalThis.MediaRecorder||!C.captureStream)return;const a=hlLoad();$('modal').querySelectorAll('.grid').forEach((g,ri)=>{const gi=a.length-1-ri;g.insertAdjacentHTML('afterend',`<p class="small">Save as a video: ${(a[gi]?a[gi].list:[]).map((h,hi)=>B(`hlRec(${gi},${hi})`,esc(h.t))).join(' ')}</p>`)})}catch(e){}}}
function hlRec(gi,hi){try{const st=C.captureStream(30),mt=['video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(t))||'video/webm',rec=new MediaRecorder(st,{mimeType:mt}),ch=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
 rec.onstop=()=>{const b=new Blob(ch,{type:'video/webm'}),u=document.createElement('a');u.href=URL.createObjectURL(b);u.download='gridiron-highlight.webm';document.body.appendChild(u);u.click();u.remove()};rec.start();hlPlay(gi,hi);
 if(G.rp){const af=G.rp.after;G.rp.after=()=>{try{rec.stop()}catch(e){}if(af)af()}}else rec.stop()}catch(e){alert('Your browser cannot record video here.')}}
// ---------- undo last sim, season backup file ----------
let UNDO=null,UNDOd=0;
{const _sg=simGame;simGame=function(...a){if(!UNDOd&&feat('undo')&&!(G&&G.live))try{UNDO=JSON.stringify(R)}catch(e){UNDO=null}UNDOd++;try{return _sg.apply(this,a)}finally{UNDOd--}}}
{const _sr=simRest;simRest=function(...a){if(feat('undo')&&!(G&&G.live))try{UNDO=JSON.stringify(R)}catch(e){UNDO=null}UNDOd++;try{return _sr.apply(this,a)}finally{UNDOd--}}}
function undoSim(){if(!UNDO)return;R=JSON.parse(UNDO);UNDO=null;save();lastMsg='Undid the last sim.';lobby()}
{const _dh=dashHome;dashHome=function(...a){const r=_dh.apply(this,a);try{const d=$('modal').querySelector('.dash'),nx=d&&d.querySelector('section.cardx');if(UNDO&&feat('undo')&&nx){const b=nx.querySelector('.btns');if(b)b.insertAdjacentHTML('beforeend',B('undoSim()','Undo last sim'))}
 if(feat('plan')&&nx&&!R.stage){nx.insertAdjacentHTML('beforeend',`<p class="small">Game plan: ${Object.keys(PLANS).map(k=>`<button class="${R.plan==k?'on':''}" onclick="R.plan=R.plan=='${k}'?null:'${k}';save();lobby()">${PLANS[k]}</button>`).join('')}</p>`)}}catch(e){}return r}}
{const _ch2=careerHub;careerHub=function(...a){const r=_ch2.apply(this,a);try{if(UNDO&&feat('undo')&&!(G&&G.live)){const d=$('modal').querySelector('.dash section.cardx .btns');if(d)d.insertAdjacentHTML('beforeend',B('undoSim()','Undo last sim'))}}catch(e){}return r}}
{const _ns=newSeason;newSeason=function(...a){const r=_ns.apply(this,a);try{if(OPT.autobk===1&&typeof exportSave=='function')exportSave()}catch(e){}return r}}
// ---------- keys and controller: stiff-arm ----------
{const _h=hit;hit=function(k){if($('modal').hidden&&G&&P&&G.phase=='play'&&G.poss=='U'&&k=='r'){const c=P.b.st=='carry'?P.b.c:null;if(c&&(!CAR()||(c.pid===R.me&&!autoMode())))return stiffArm(c)}return _h(k)}}
{const _pb=padBtn;padBtn=function(i){if(i==4&&G&&P&&G.phase=='play'&&G.poss=='U'&&P.b.st=='carry'&&$('modal').hidden)return hit('r');return _pb(i)}}
moveBar=(m=>function(){m();try{const el=$('mv');if(feat('stiff')&&el&&el.querySelector('[data-k="z"]')&&!el.querySelector('[data-k="r"]')&&G.poss=='U')el.insertAdjacentHTML('beforeend','<button data-k="r">Stiff arm</button>')}catch(e){}})(moveBar);
// ---------- sidebar ----------
(()=>{const ins=(a,after,item)=>{if(a.some(x=>x[0]==item[0]))return;const i=a.findIndex(x=>x[0]==after);a.splice(i<0?a.length:i+1,0,item)};ins(NAVF,'chal',['prac','pracUI()','Practice']);ins(NAVF,'staff',['camp','campUI()','Training camp'])})();
if(!$('modal').hidden&&!(G&&G.live))lobby();
