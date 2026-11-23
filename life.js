'use strict';
// Career fame and sponsors (the Fame & sponsors page): fame, brand deals that pay money (with goals, appearances and risks), a shop where that money
// buys trainers and coaches that help your training, and storylines that play out over several weeks
// (a rival, a pushy agent, an injury comeback, a viral clip, a sponsor scandal and more).
// All brands and people here are made up. This file wraps existing functions and leaves the originals alone.
// Load it after train.js.
{const add=[['Career','brands','Brand deals and money','Sponsors offer deals as you get famous. They pay money (with goals and appearances), and money buys trainers and coaches that help your training.'],
 ['Career','arcs','Career storylines','Stories that play out over a few weeks: a rival calling you out, a pushy agent, an injury comeback, a viral clip, a sponsor scandal...']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const lfOn=()=>CAR()&&!!R.me;
function LF(){if(!R.life||typeof R.life!='object')R.life={};const L=R.life;L.deals=L.deals||[];L.offers=L.offers||[];L.perk=L.perk||{};L.done=L.done||[];L.earn=L.earn||0;L.wk=L.wk||0;if(L.app===undefined)L.app=null;return L}
const fame=()=>clamp(Math.round(R.fans||0),0,100);
function fameAdd(v){R.fans=clamp((R.fans||0)+v,0,100)}
const FAMEN=f=>f>=80?'Superstar':f>=60?'Star':f>=40?'Rising star':f>=20?'Local favorite':'Unknown';
const money=v=>{R.money=Math.round(((R.money||0)+v)*100)/100};
// ---------- the shop: buy once, keep for the whole career ----------
const PERKS=[['trainer','Personal trainer','+1 training session every week.',.6],['trainer2','Elite trainer','Another +1 training session every week.',2,'trainer'],
 ['speed','Speed coach','+50% XP from the 40-yard dash and the cone drill.',.8],['gym','Home gym','+50% XP from the sled push and conditioning.',.8],
 ['poscoach','Private position coach','+50% XP from the drills for your position.',1],['film','Film room','+20% XP from every game.',1.2],
 ['rehab','Recovery center','Injuries heal faster (often a week sooner).',1.5],['agent','Sports agent','Better brand offers (+15% pay) and room for a 4th deal.',.4]];
function lifePerk(k,drill){if(!feat('brands')||!R||!R.life)return 0;const P0=R.life.perk||{};
 if(k=='sess')return(P0.trainer?1:0)+(P0.trainer2?1:0);
 if(k=='xp'){let m=0;if(P0.speed&&(drill=='dash'||drill=='cones'))m+=.5;if(P0.gym&&(drill=='sled'||drill=='gass'))m+=.5;if(P0.poscoach&&drill&&!TRALL.includes(drill))m+=.5;return m}return 0}
function perkBuy(k){const P0=PERKS.find(x=>x[0]==k),L=LF();if(!P0||L.perk[k]||(P0[4]&&!L.perk[P0[4]]))return lifeUI();if((R.money||0)<P0[3])return lifeUI('Not enough money yet.');
 money(-P0[3]);L.perk[k]=R.season;if(k=='trainer'||k=='trainer2'){const s=trS();s.e++}addNews(`${meRow().n} hires a ${P0[1].toLowerCase()}.`);save();lifeUI(`${P0[1]}: done.`)}
// ---------- brand deals ----------
const BRANDS=[['Apex Cleats','shoes'],['Thunder Fuel','sports drink'],['Crunch Time Cereal','cereal'],['Velo Headphones','headphones'],['Summit Trucks','trucks'],['Iron Ridge Gyms','gyms'],
 ['Big Play Pizza','pizza'],['Gridline Games','video games'],['Harbor Insurance','insurance'],['Bolt Energy Bars','snacks'],['Northwind Watches','watches'],['Miller Motors','car dealer']];
const TIERS=[['Local',0,.15,.4,.6],['Regional',25,.6,1.2,.8],['National',50,2,4,1],['Cover star',80,5,8,1.15]];   // name, fame needed, pay low/high ($M a season), goal size
const SGOAL={QB:[['py',3500,'passing yards'],['ptd',25,'touchdown passes']],RB:[['ry',1000,'rushing yards'],['rtd',8,'rushing touchdowns']],WR:[['ty',1000,'receiving yards'],['tt',8,'touchdown catches'],['rc',75,'catches']],
 TE:[['ty',650,'receiving yards'],['tt',6,'touchdown catches'],['rc',55,'catches']],DL:[['sk',8,'sacks'],['tk',45,'tackles']],LB:[['tk',100,'tackles'],['sk',5,'sacks']],CB:[['in',4,'interceptions'],['tk',55,'tackles']],S:[['in',3,'interceptions'],['tk',75,'tackles']]};
const slen=()=>R.lg&&R.lg.sched?R.lg.sched.length:17;
function dealGoalVal(d){if(d.gk=='w'){const T=R.lg.t[0];return T.w}const p=meRow();return p?p.ss[SI[d.gk]]||0:0}
const trGoalN=v=>v>=100?Math.round(v/10)*10:Math.max(1,Math.round(v));
function mkOffer(){const f=fame(),ok=TIERS.map((t,i)=>i).filter(i=>f>=TIERS[i][1]),ti=ok[Math.min(ok.length-1,Math.floor(rnd()*(ok.length+.6)))],T=TIERS[ti],L=LF(),used=new Set(L.deals.concat(L.offers).map(d=>d.b));
 const free=BRANDS.filter(b=>!used.has(b[0]));if(!free.length)return null;const br=free[rnd()*free.length|0],ag=L.perk.agent?1.15:1;
 const pay=Math.round((T[2]+rnd()*(T[3]-T[2]))*ag*100)/100,g=myPos(),opts=(SGOAL[g]||[['tk',50,'tackles']]).concat([['w',10,'team wins']]),o=opts[rnd()*opts.length|0],sc=slen()/17;
 return{b:br[0],what:br[1],t:ti,pay,yrs:1+(rnd()*3|0),gk:o[0],gn:o[2],gv:trGoalN(o[1]*T[4]*sc),bon:Math.round(pay*.5*100)/100,until:L.wk+3,trust:70}}
function dealTake(i){const L=LF(),o=L.offers[i];if(!o)return lifeUI();const max=L.perk.agent?4:3;if(L.deals.length>=max)return lifeUI(`You can have ${max} deals at once. Let one go first.`);
 L.offers.splice(i,1);o.s0=R.season;o.app=4;L.deals.push(o);const sb=Math.round(o.pay*.25*100)/100;money(sb);L.earn+=sb;fameAdd(1+o.t);addNews(`${meRow().n} signs a deal with ${o.b}.`);save();lifeUI(`Signed with ${o.b}. Signing bonus ${M$(sb)}.`)}
function dealNo(i){const L=LF();L.offers.splice(i,1);save();lifeUI()}
function dealDrop(i){const L=LF(),d=L.deals[i];if(!d)return lifeUI();if(!confirm(`End your deal with ${d.b}? You lose the rest of the pay.`))return;L.deals.splice(i,1);save();lifeUI(`You ended the ${d.b} deal.`)}
// appearances: every few weeks a sponsor wants a commercial shoot or an event. Doing it uses a training session.
function appDo(go){const L=LF(),a=L.app;if(!a)return lifeUI();const d=L.deals.find(x=>x.b==a.b);L.app=null;
 if(d){if(go){const s=trS();if(s.e<1){L.app=a;return lifeUI('You need a free training session for that. Play your next game first.')}s.e--;d.trust=Math.min(100,d.trust+10);fameAdd(2);money(.05*(d.t+1));L.earn+=.05*(d.t+1)}
  else{d.trust-=35;if(d.trust<=0){L.deals=L.deals.filter(x=>x!==d);addNews(`${d.b} drops ${meRow().n} after he skipped their events.`)}}}save();lifeUI(go?`Done. ${a.b} is happy.`:`You skipped the ${a.b} ${a.k}.`)}
const APPK=['commercial shoot','photo shoot','store opening','charity golf day','fan meet-and-greet','social media video'];
// ---------- storylines ----------
// Each storyline is a few steps. A step either asks you to choose, waits a few weeks, or gives you a goal for your next game(s).
// fx: fame, money ($M), xp, sk (+1 to a rating group's stat), sess (training sessions), inj (weeks)
function bigGame(s,g){const v=k=>s[SI[k]]||0;
 if(g=='QB')return v('py')>=260||v('ptd')>=3;if(g=='RB')return v('ry')>=100||v('rtd')>=2||v('ry')+v('ty')>=140;if(g=='WR')return v('ty')>=100||v('tt')>=2;if(g=='TE')return v('ty')>=75||v('tt')>=2;
 if(g=='DL')return v('sk')>=2||(v('sk')>=1&&v('tk')>=4);if(g=='LB')return v('tk')>=9||v('sk')>=1||v('in')>=1;return v('in')>=1||v('tk')>=7}
const BIGT={QB:'260 passing yards or 3 TD passes',RB:'100 rushing yards or 2 TDs',WR:'100 receiving yards or 2 TDs',TE:'75 receiving yards or 2 TDs',DL:'2 sacks (or a sack and 4 tackles)',LB:'9 tackles, a sack or an interception',CB:'an interception or 7 tackles',S:'an interception or 7 tackles'};
const bigTxt=()=>BIGT[myPos()]||'a big game';
const ARCS={
 rival:{n:'The rival',ok:()=>true,init(A){A.nm=N1[rnd()*N1.length|0]+' '+N2[rnd()*N2.length|0];A.tm=R.lg.t[1+(rnd()*(R.lg.t.length-1)|0)].n},
  st:{0:{t:A=>`${A.nm}, a ${myPos()} for the ${A.tm}, says on a podcast that you are "overrated" and only play because of where you were drafted.`,ch:[['Fire back on social media',{fame:4},'hot'],['Say nothing and let your play talk',{xp:10},'cool']]},
   hot:{t:A=>`The clip blew up. Now everyone is watching: have a big game next time out (${bigTxt()}).`,goal:1,win:['You backed it up. '+'%n has gone quiet.',{fame:7,xp:25}],lose:['You talked big and played small. The internet is not kind.',{fame:-7}]},
   cool:{t:A=>`Reporters keep asking about ${A.nm}. Answer on the field: have a big game in either of your next two games (${bigTxt()}).`,goal:2,win:['Your play did the talking. Even %n gave you credit.',{fame:5,xp:30}],lose:['No answer yet, but you kept your cool. Fans respect that.',{fame:1}]}}},
 agent:{n:'The super agent',ok:()=>!LF().perk.agent,init(A){A.nm='Vic '+N2[rnd()*N2.length|0]},
  st:{0:{t:A=>`Super agent ${A.nm} wants to represent you. He promises much bigger brand deals, but he takes a cut and likes to make noise.`,ch:[['Sign with him (free Sports agent perk; he keeps 10% of brand money)',{agent:1},'wait'],['Keep doing it yourself',{xp:10},null]]},
   wait:{wait:4,next:'hold'},
   hold:{t:A=>`${A.nm} says you are underpaid. He wants you to skip the next game (a "hold-in") until the team gives you a raise.`,ch:[['Hold out one game: raise, but fans and teammates are annoyed',{hold:1,fame:-6},null],['Tell him no and fire him',{fame:2,fire:1},null]]}}},
 viral:{n:'Going viral',ok:A=>!!(A&&A.big),init(){},
  st:{0:{t:()=>`A clip of your last game is everywhere online. A clothing company wants to make "${meRow().n}" shirts.`,ch:[['Cash in on a shirt line (+$0.8M)',{money:.8,fame:4},null],['Stay humble and thank your teammates',{xp:20,fame:2},null]]}}},
 charity:{n:'Hometown hero',ok:()=>(R.money||0)>=1,init(A){A.tw=['Riverbend','Oak Hollow','Millbrook','Cedar Falls','Port Allen'][rnd()*5|0]},
  st:{0:{t:A=>`Your hometown, ${A.tw}, needs a new youth football field. You could start a foundation to build it ($1M).`,ch:[['Start the foundation (-$1M, fans love it)',{money:-1,fame:10,char:1},'wait'],['Not right now',{},null]]},
   wait:{wait:3,next:'open'},open:{t:A=>`The new field in ${A.tw} opens. The kids want you there.`,ch:[['Go to the opening (uses a training session)',{sess:-1,fame:5,xp:15},null],['Send a video',{fame:1},null]]}}},
 scandal:{n:'Sponsor trouble',ok:()=>LF().deals.length>0,init(A){const d=LF().deals[rnd()*LF().deals.length|0];A.b=d.b},
  st:{0:{t:A=>`${A.b}, one of your sponsors, is in the news for a scandal. Reporters want to know if you still stand with them.`,ch:[['Drop them (lose the deal, fans approve)',{dropB:1,fame:3},null],['Stand by them (keep the money, take some heat)',{fame:-6,risk:1},null]]}}},
 comeback:{n:'The comeback',ok:()=>(meRow()||{}).inj>=2,init(){},
  st:{0:{t:()=>`You are hurt for ${(meRow()||{}).inj} weeks. The doctors give you two rehab plans.`,ch:[['Aggressive rehab: back sooner, small chance of a setback',{rehab:1},'back'],['Careful rehab: full time off, study film meanwhile (+20 XP)',{xp:20},'back']]},
   back:{waitInj:1,next:'game'},game:{t:()=>`You're back. Show everyone you are the same player: have a big game in one of your first two games back (${bigTxt()}).`,goal:2,win:['What a comeback! The league is talking about you again.',{fame:8,xp:30}],lose:['It takes time to get back to full speed.',{}]}}},
 mentor:{n:'The veteran',ok:()=>(meRow()||{}).age<=24,init(A){A.nm=N1[rnd()*N1.length|0]+' '+N2[rnd()*N2.length|0]},
  st:{0:{t:A=>`${A.nm}, a 12-year veteran on your team, offers to work with you after practice. His challenge: get a Gold grade in any training drill within the next two weeks.`,ch:[['Accept the challenge',{},'gold'],['Thanks, but I have my own routine',{},null]]},
   gold:{t:()=>'Get a Gold grade in any training drill (Training page).',goalDrill:2,win:['%n is impressed. He shares his secrets.',{xp:35,sk:1}],lose:['Not this time. %n says to keep at it.',{xp:5}]}}},
 contract:{n:'Contract year',ok:()=>{const p=meRow();return p&&p.exp<=R.season&&!R.lg.po},init(){},
  st:{0:{t:()=>`It's the last year of your contract. The team offers an extension now: ${M$(Math.round(meRow().sal*1.15*10)/10)} a year through season ${R.season+3}.`,ch:[['Sign it now (safe)',{ext:1},null],['Bet on yourself',{},'bet']]},
   bet:{t:()=>`Betting on yourself: have 3 big games before the season ends (${bigTxt()}).`,goalN:3,win:['You won your bet. Teams are lining up, and a sponsor sends a $1.5M bonus.',{money:1.5,fame:6}],lose:['The bet did not pay off this time.',{fame:-2}]}}}};
function arcFx(A,fx){const p=meRow(),L=LF();if(!fx)return'';const out=[];
 if(fx.fame){fameAdd(fx.fame);out.push(`fame ${fx.fame>0?'+':''}${fx.fame}`)}if(fx.money){money(fx.money);out.push(`${fx.money>0?'+':'-'}${M$(Math.abs(fx.money))}`)}
 if(fx.xp){R.xp=(R.xp||0)+fx.xp;out.push(`+${fx.xp} XP`)}if(fx.sk&&p){const g=POSG[p.g]||['ath'],gk=g[rnd()*g.length|0];const got=trBoost(p,DGRP[gk]?DGRP[gk][1]:['spd']);if(got)out.push(got)}
 if(fx.sess){const s=trS();s.e=Math.max(0,s.e+fx.sess)}
 if(fx.agent){L.perk.agent=R.season;L.agentCut=1;out.push('Sports agent perk')}if(fx.fire){L.agentCut=0}
 if(fx.hold&&p){p.inj=Math.max(p.inj||0,1);p.sal=Math.round(p.sal*1.3*10)/10;p.exp=Math.max(p.exp,R.season+2);addNews(`${p.n} sits out a game in a contract dispute, then gets a raise to ${M$(p.sal)}.`);out.push(`raise to ${M$(p.sal)}`)}
 if(fx.ext&&p){p.sal=Math.round(p.sal*1.15*10)/10;p.exp=R.season+3;addNews(`${p.n} signs an extension through season ${p.exp}.`);out.push('extension signed')}
 if(fx.dropB){L.deals=L.deals.filter(d=>d.b!==A.b)}if(fx.risk&&rnd()<.35){const o=L.deals.filter(d=>d.b!==A.b);if(o.length){const d=o[rnd()*o.length|0];L.deals=L.deals.filter(x=>x!==d);out.push(`${d.b} ended your deal`)}}
 if(fx.rehab&&p&&p.inj>1){p.inj=Math.ceil(p.inj/2);A.setback=rnd()<.2}return out.join(', ')}
function arcStart(id){const L=LF(),a=ARCS[id];const A={id,st:'0',w:0};a.init(A);L.arc=A;L.done.push(id);if(L.done.length>12)L.done.shift()}
function arcStep(A){return ARCS[A.id].st[A.st]}
function arcGo(A,next){if(next==null){LF().arc=null;return}A.st=next;const s=arcStep(A);A.w=s.wait||0;A.left=s.goal||s.goalDrill||0;A.n=0}
function arcPick(i){const L=LF(),A=L.arc;if(!A)return lifeUI();const s=arcStep(A);if(!s.ch||!s.ch[i])return lifeUI();const c=s.ch[i],r=arcFx(A,c[1]);L.lastArc=`${ARCS[A.id].n}: ${c[0]}${r?' ('+r+')':''}`;arcGo(A,c[2]);save();
 if(VW.page=='life')lifeUI();else careerHub()}
function arcEnd(A,win){const s=arcStep(A),e=win?s.win:s.lose,L=LF(),txt=e[0].replace(/%n/g,A.nm||''),r=arcFx(A,e[1]);L.lastArc=`${ARCS[A.id].n}: ${txt}${r?' ('+r+')':''}`;addNews(`${meRow().n}: ${txt}`);L.arc=null}
// after each game: storyline goals and timers
function arcWeek(s,ctx){const L=LF();let A=L.arc;
 if(A){const st=arcStep(A),p=meRow();
  if(st.goal){if(bigGame(s,myPos()))arcEnd(A,1);else if(--A.left<=0)arcEnd(A,0)}
  else if(st.goalN){if(bigGame(s,myPos()))A.n=(A.n||0)+1;if(A.n>=st.goalN)arcEnd(A,1);else if(ctx.last)arcEnd(A,0)}
  else if(st.goalDrill){if(--A.left<=0)arcEnd(A,0)}
  else if(st.wait){if(--A.w<=0)arcGo(A,st.next)}
  else if(st.waitInj){if(A.setback&&p&&p.inj==1){p.inj+=2;A.setback=0;addNews(`${p.n} has a setback in rehab.`)}else if(p&&!p.inj)arcGo(A,st.next)}
  return}
 if(!feat('arcs')||L.wk<2||rnd()>.3)return;const big=bigGame(s,myPos()),ids=Object.keys(ARCS).filter(k=>!L.done.slice(-5).includes(k)&&ARCS[k].ok({big}));
 const pr=ids.includes('comeback')?['comeback']:ids.includes('contract')&&rnd()<.5?['contract']:ids.includes('viral')&&big?['viral']:ids;if(pr.length)arcStart(pr[rnd()*pr.length|0])}
function lifeAfterDrill(k,g){const L=R.life,A=L&&L.arc;if(!A||!feat('arcs'))return;const s=arcStep(A);if(s&&s.goalDrill&&g==3)arcEnd(A,1)}
// ---------- every game (played or simmed): fame, pay, offers, appearances, storylines ----------
function perfOf(s,g){const v=k=>s[SI[k]]||0;if(g=='QB')return v('py')/10+v('ptd')*10-v('pi')*8+v('ry')/5+v('rtd')*10;if(g=='RB')return v('ry')/4+v('rtd')*12+v('ty')/5+v('tt')*12;
 if(g=='WR'||g=='TE')return v('ty')/4+v('tt')*12+v('rc')*2;return v('tk')*4+v('sk')*15+v('in')*20}
function lifeWeek(s,won,sim){const L=LF(),p=meRow();if(!p)return;L.wk++;const po=!!R.lg.po;
 const pf=perfOf(s,p.g);fameAdd(clamp((pf-15)/12,-1,4)*(sim?.6:1)+(won?.5:0)-(fame()>40?.4:0));
 if(feat('brands')){const cut=L.agentCut?.9:1;L.deals.forEach(d=>{if(!po){const v=Math.round(d.pay/slen()*cut*1000)/1000;money(v);L.earn+=v}d.app=(d.app||4)-1;
   if(d.app<=0&&!L.app){d.app=4+(rnd()*2|0);L.app={b:d.b,k:APPK[rnd()*APPK.length|0]}}});
  L.offers=L.offers.filter(o=>o.until>=L.wk);const ch=.1+fame()/260;if(L.offers.length<3&&rnd()<ch){const o=mkOffer();if(o){L.offers.push(o);L.newOff=1}}
  if(L.perk.rehab&&p.inj>0&&rnd()<.5)p.inj--}
 if(feat('arcs'))try{arcWeek(s,{last:po||R.lg.wk>=slen()-1})}catch(e){console.error(e)}}
{const _cx=careerXP;careerXP=function(s,won,sim,...a){const r=_cx.call(this,s,won,sim,...a);try{if(CAR()&&R.me){if(feat('brands')&&R.life&&R.life.perk&&R.life.perk.film){const x=Math.round(((R.lastXP||'').match(/\+(\d+)/)||[0,0])[1]*.2);if(x>0){R.xp=(R.xp||0)+x;R.lastXP+=` (+${x} film room)`}}lifeWeek(s||[],won,sim)}}catch(e){console.error(e)}return r}}
// ---------- end of the season: sponsor goals, awards make you more famous ----------
{const _fs=finishSeason;finishSeason=function(...a){let pre=null,aw0=0;try{if(lfOn()){const p=meRow();pre=p.ss.slice();aw0=(p.aw||[]).length}}catch(e){}const r=_fs.apply(this,a);
 try{if(!pre)return r;const L=LF(),p=meRow(),T=R.lg.t[0],msg=[];
  L.deals.forEach(d=>{const v=d.gk=='w'?T.w:pre[SI[d.gk]]||0;if(v>=d.gv){money(d.bon);L.earn+=d.bon;fameAdd(2);msg.push(`${d.b} goal met (${v} ${d.gn}): +${M$(d.bon)} bonus`)}else msg.push(`${d.b} goal missed (${v} of ${d.gv} ${d.gn})`);d.yrs--});
  const gone=L.deals.filter(d=>d.yrs<=0);L.deals=L.deals.filter(d=>d.yrs>0);gone.forEach(d=>msg.push(`The ${d.b} deal is over.`));
  (p.aw||[]).slice(aw0).forEach(w=>{const f=/MVP/.test(w)?15:/Player of the Year/.test(w)?10:/Champion/.test(w)?10:/Rookie/.test(w)?8:/Pro Bowl/.test(w)?6:3;fameAdd(f)});
  L.season=msg;if(msg.length)addNews(`${p.n}'s sponsors: ${msg.join('; ')}.`);save()}catch(e){console.error(e)}return r}}
// ---------- the Fame & sponsors page ----------
function lifeUI(note){if(!CAR()||!R.me)return careerHub();VW.page='life';const L=LF(),p=meRow(),f=fame();L.newOff=0;
 if(!feat('brands')&&!feat('arcs'))return modal(`<h1>Fame & sponsors</h1><p>Brand deals and storylines are switched off on the Game features page.</p>`);
 const max=L.perk.agent?4:3,arc=L.arc&&feat('arcs')?arcCard(L.arc):'';
 const top=card('Money and fame',`<div class="stats3"><div><b>${M$(R.money||0)}</b><span>money</span></div><div><b>${f}</b><span>fame · ${FAMEN(f)}</span></div><div><b>${M$(L.earn||0)}</b><span>earned from sponsors</span></div></div>
  <p class="small dim">Money here is from sponsors and appearances (your team salary is separate). Fame grows with big games, wins, awards and good choices. More fame brings bigger sponsors.</p>`);
 let h=top+arc;
 if(feat('brands')){
  if(L.app)h+=card('Sponsor event',`<p>${esc(L.app.b)} wants you for a ${L.app.k}.</p><div class="btns">${B('appDo(1)','Do it (uses a training session)','go')}${B('appDo(0)','Skip it (they won\'t like it)')}</div>`,'hot');
  h+=card(`Your deals (${L.deals.length} of ${max})`,L.deals.length?`<table class="mini"><tr><th>Brand</th><th>Pay</th><th>Season goal</th><th></th></tr>${L.deals.map((d,i)=>`<tr><td><b>${esc(d.b)}</b><br><span class="small dim">${TIERS[d.t][0]} · ${d.yrs} season${d.yrs==1?'':'s'} left${d.trust<50?' · <span class="l">unhappy</span>':''}</span></td><td class="num">${M$(d.pay)}/yr</td><td class="small">${d.gv} ${d.gn}: <b>${dealGoalVal(d)}</b> so far<br><span class="dim">bonus ${M$(d.bon)}</span></td><td>${B(`dealDrop(${i})`,'End','xs')}</td></tr>`).join('')}</table>`:'<p class="dim">No sponsors yet. Offers come in as you get more famous.</p>');
  h+=card('Offers',L.offers.length?L.offers.map((o,i)=>`<div class="offer"><p><b>${esc(o.b)}</b> <span class="dim">(${o.what}, ${TIERS[o.t][0].toLowerCase()})</span><br>${M$(o.pay)} a season for ${o.yrs} season${o.yrs==1?'':'s'}, plus ${M$(o.bon)} if you get ${o.gv} ${o.gn} in a season. They will want you at an event every few weeks.</p><div class="btns">${B(`dealTake(${i})`,'Sign','go')}${B(`dealNo(${i})`,'No thanks')}</div></div>`).join('')+`<p class="small dim">Offers go away after a few weeks.</p>`:'<p class="dim">No offers right now. Play well, win games and keep your fame up.</p>');
  h+=card('Spend your money',`<p class="small dim">Each is a one-time purchase and lasts your whole career.</p><table class="mini">${PERKS.map(k=>{const own=L.perk[k[0]],need=k[4]&&!L.perk[k[4]];return`<tr><td><b>${k[1]}</b><br><span class="small">${k[2]}</span></td><td class="num">${M$(k[3])}</td><td>${own?'<span class="good">Owned</span>':need?'<span class="dim small">Needs a personal trainer first</span>':B(`perkBuy('${k[0]}')`,'Buy',(R.money||0)>=k[3]?'go':'dim')}</td></tr>`}).join('')}</table>`)}
 if(L.season&&L.season.length)h+=card('Last season\'s sponsor goals',L.season.map(m=>`<p class="small">${esc(m)}</p>`).join(''));
 if(L.lastArc)h+=card('Latest story',`<p>${esc(L.lastArc)}</p>`);
 modal(`${note?`<p class="warn">${esc(note)}</p>`:''}<div class="hdr"><h1>Fame & sponsors</h1><p class="dim">Sponsors, money and the stories around your career.</p></div><div class="dash">${h}</div>`)}
function arcCard(A){const a=ARCS[A.id],s=arcStep(A);if(!s)return'';let b='';
 if(s.ch)b=`<p>${esc(s.t(A))}</p><div class="btns">${s.ch.map((c,i)=>B(`arcPick(${i})`,esc(c[0]),i?'':'go')).join('')}</div>`;
 else if(s.goal||s.goalN||s.goalDrill)b=`<p>${esc(s.t(A))}</p><p class="small dim">${s.goalN?`${A.n||0} of ${s.goalN} so far`:`${A.left} ${s.goalDrill?'week':'game'}${A.left==1?'':'s'} left`}</p>`;
 else b=`<p class="dim">To be continued...</p>`;return card(`Storyline: ${a.n}`,b,'hot')}
// ---------- the career home page: a Fame & sponsors card (and the storyline when it needs you) ----------
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{if(!lfOn()||(G&&G.live)||(!feat('brands')&&!feat('arcs')))return r;const d=$('modal').querySelector('.dash');if(!d)return r;const L=LF(),f=fame();
 const n=(feat('brands')?L.offers.length+(L.app?1:0):0),A=L.arc&&feat('arcs')?L.arc:null,s=A&&arcStep(A);
 let h=card('Fame & sponsors',`<div class="stats3"><div><b>${M$(R.money||0)}</b><span>money</span></div><div><b>${f}</b><span>fame · ${FAMEN(f)}</span></div><div><b>${L.deals.length}</b><span>sponsor${L.deals.length==1?'':'s'}</span></div></div>${n?`<p class="good">${n} thing${n==1?'':'s'} waiting for you (offers or a sponsor event)</p>`:''}${L.lastArc?`<p class="small">${esc(L.lastArc)}</p>`:''}<div class="btns">${B('lifeUI()','Fame & sponsors','go')}</div>`);
 if(A&&s&&s.ch)h=arcCard(A)+h;const t=[...d.children].find(c=>/^Training/.test((c.querySelector('h4')||{}).textContent||''));(t||d.firstElementChild).insertAdjacentHTML('afterend',h)}catch(e){console.error(e)}return r}}
(()=>{const i=NAVC.findIndex(x=>x[0]=='train');if(!NAVC.some(x=>x[0]=='life'))NAVC.splice(i<0?2:i+1,0,['life','lifeUI()','Fame & sponsors'])})();
{const _sh=shellHTML;shellHTML=function(h,...a){let r=_sh(h,...a);try{if(R&&R.mode=='career'&&!feat('brands')&&!feat('arcs'))r=r.replace(/<[^<>]*lifeUI\(\)[^<>]*>[^<]*<\/[a-z]+>/,'')}catch(e){}return r}}
