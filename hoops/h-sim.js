'use strict';
// Simulated games (possession by possession, tuned to NBA averages), the season calendar, playoffs, awards,
// player development, the draft, re-signing, free agency and the new season.
const MINS=[34,33,33,32,31,24,20,16,12,5];
const avgBy=(ps,ms,k)=>{let a=0,t=0;ps.forEach((p,i)=>{a+=p.sk[k]*ms[i];t+=ms[i]});return t?a/t:60};
function simGame(a,b,opt){opt=opt||{};const T=[a,b].map(t=>{const ps=rotation(t).slice(0,10),ms=ps.map((p,i)=>MINS[i]||0);
  // fatigue: tired or injured stars play a little less; heavy minutes spread to the bench
  return{t,ps,ms,box:ps.map(()=>newSS()),fouls:0}});
 const pace=Math.round(100+gauss()*4),sc=[0,0],r=feat('realism');
 const usage=(S)=>S.ps.map((p,i)=>S.ms[i]*Math.pow(ovr(p)/60,2.2)*(1+(Math.max(p.sk.lay,p.sk.mid,p.sk.thr)-62)/80));
 const pickW=(w)=>{let s=w.reduce((x,y)=>x+y,0),q=rnd()*s;for(let i=0;i<w.length;i++){q-=w[i];if(q<=0)return i}return w.length-1};
 const poss=(o,d,mult)=>{const O=T[o],D=T[d];let shots=0;const han=avgBy(O.ps,O.ms,'han'),stl=avgBy(D.ps,D.ms,'stl'),orb=avgBy(O.ps,O.ms,'orb'),drb=avgBy(D.ps,D.ms,'drb'),pd=avgBy(D.ps,D.ms,'pd'),idf=avgBy(D.ps,D.ms,'id'),blk=avgBy(D.ps,D.ms,'blk');
  const iq=o==0?1:(1+(R.diff-1)*.03);
  if(rnd()<clamp(.128+(stl-han)/420,.08,.19)){const i=pickW(O.ps.map((p,k)=>O.ms[k]*(1.3-p.sk.han/120)));O.box[i][SI.tov]++;if(rnd()<.55){const j=pickW(D.ps.map((p,k)=>D.ms[k]*p.sk.stl));D.box[j][SI.stl]++}
   if(rnd()<.07){const j=pickW(D.ms);D.box[j][SI.pf]++;D.fouls++}return}
  if(rnd()<.05){const j=pickW(D.ms),i=pickW(usage(O)),p=O.ps[i];D.box[j][SI.pf]++;for(let f=0;f<2;f++){O.box[i][SI.fta]++;if(rnd()<clamp(.81+(p.sk.ft-62)*.006,.45,.95)){O.box[i][SI.ftm]++;O.box[i][SI.pts]++;sc[o]++}}return}
  for(let tries=0;tries<4;tries++){const i=pickW(usage(O)),p=O.ps[i],s=p.sk,bx=O.box[i];
   const r3=clamp(.17+(s.thr-45)*.012,.01,.66),rr=clamp(.27+(s.lay+s.dnk-124)*.004+(p.pos=='C'?.12:p.pos=='PF'?.06:0),.12,.7),typ=rnd()<r3?3:rnd()<rr/(1-r3)?1:2;
   const foulP=typ==1?.19:typ==2?.06:.018;let mk=typ==1?.645+(s.lay-64)*.006+(s.dnk-62)*.002-(idf-58)*.0025-(blk-55)*.0015:typ==2?.43+(s.mid-64)*.0055-(pd-60)*.002:.365+(s.thr-66)*.0055-(pd-60)*.0015;
   mk=clamp(mk*(r?1:1.04),.15,.8);if(rnd()<foulP){const j=pickW(D.ps.map((q,k)=>D.ms[k]*(1+(70-q.sk.pd)/60)));D.box[j][SI.pf]++;D.fouls++;const made=rnd()<mk*.45;let fts=typ==3?3:2;
     if(made){bx[SI.fgm]++;bx[SI.fga]++;if(typ==3){bx[SI.tpm]++;bx[SI.tpa]++}bx[SI.pts]+=typ==3?3:2;sc[o]+=typ==3?3:2;fts=1;astr(O,i)}
     for(let f=0;f<fts;f++){bx[SI.fta]++;if(rnd()<clamp(.81+(s.ft-62)*.006,.45,.95)){bx[SI.ftm]++;bx[SI.pts]++;sc[o]++}}return}
   bx[SI.fga]++;if(typ==3)bx[SI.tpa]++;
   if(rnd()<mk){bx[SI.fgm]++;if(typ==3)bx[SI.tpm]++;const pts=typ==3?3:2;bx[SI.pts]+=pts;sc[o]+=pts;astr(O,i);return}
   if(rnd()<(typ==1?.3:typ==2?.08:.02)){const j=pickW(D.ps.map((q,k)=>D.ms[k]*Math.pow(q.sk.blk/50,2)));D.box[j][SI.blk]++}
   if(rnd()<clamp(.24+(orb-drb)/260,.15,.34)){const j=pickW(O.ps.map((q,k)=>O.ms[k]*Math.pow(q.sk.orb/50,2)));O.box[j][SI.orb]++;continue}
   const j=pickW(D.ps.map((q,k)=>D.ms[k]*Math.pow(q.sk.drb/50,2)));D.box[j][SI.drb]++;return}};
 const astr=(O,i)=>{if(rnd()<.66){const w=O.ps.map((q,k)=>k==i?0:O.ms[k]*Math.pow(q.sk.pas/50,2));if(w.some(x=>x>0))O.box[pickW(w)][SI.ast]++}};
 const per=n=>{for(let k=0;k<n;k++){poss(0,1);poss(1,0)}};
 per(pace);let ot=0;while(sc[0]==sc[1]&&ot<5){ot++;per(Math.round(pace*5/48))}
 // non-shooting fouls up to a realistic total
 T.forEach((S,k)=>{const extra=Math.max(0,Math.round(19+gauss()*3)-S.box.reduce((a,b)=>a+b[SI.pf],0));for(let f=0;f<extra;f++){S.box[pickW(S.ms)][SI.pf]++}});
 T.forEach(S=>S.ps.forEach((p,i)=>{const bx=S.box[i];bx[SI.gp]=S.ms[i]>0?1:0;bx[SI.gs]=i<5?1:0;bx[SI.min]=S.ms[i]+(ot?Math.round(S.ms[i]/48*5*ot):0)}));
 return{sc,ot,T}}
// record a finished game (simulated or played) into standings, stats and the box score log
function recGame(a,b,res,played){const t=R.t,[sa,sb]=res.sc,po=!!R.po;
 if(!po){t[a].pf+=sa;t[a].pa+=sb;t[b].pf+=sb;t[b].pa+=sa;if(sa>sb){t[a].w++;t[b].l++;t[a].strk=Math.max(1,t[a].strk+1);t[b].strk=Math.min(-1,t[b].strk-1)}else{t[b].w++;t[a].l++;t[b].strk=Math.max(1,t[b].strk+1);t[a].strk=Math.min(-1,t[a].strk-1)}}
 res.T.forEach(S=>S.ps.forEach((p,i)=>{const bx=S.box[i];if(!bx[SI.gp]&&!bx[SI.min])return;const tgt=po?(p.ps=p.ps||newSS()):p.ss;bx.forEach((v,k)=>tgt[k]+=v)}));
 if(a===0||b===0){R.box.push({s:R.season,d:R.day,po:po?R.po.rd:null,a,b,sc:[sa,sb],ot:res.ot,played:!!played,pl:res.T.map(S=>S.ps.map((p,i)=>[p.id,p.n,p.pos,...S.box[i]]))});if(R.box.length>60)R.box.shift();
  if(sa!=sb){const w=sa>sb?a:b;if(w===0&&!po)R.pts++}addNews(`${t[a].n} ${sa}, ${t[b].n} ${sb}${res.ot?' (OT)':''}.`,1)}
 else if(feat('news')&&Math.abs(sa-sb)>=30&&rnd()<.5)addNews(`Blowout: ${t[sa>sb?a:b].n} beat ${t[sa>sb?b:a].n} by ${Math.abs(sa-sb)}.`)}
function addNews(s,mine){R.news.unshift({s:R.season,d:R.day,t:s,m:mine?1:0});if(R.news.length>120)R.news.length=120}
// simulate every game of the current day except (optionally) the user's
function simDay(skipUser){const d=R.sched[R.day];if(!d)return;d.forEach(([a,b])=>{if(skipUser&&(a===0||b===0))return;recGame(a,b,simGame(a,b))});endDay()}
function endDay(){R.day++;dailyStuff();if(R.day>=R.sched.length&&!R.po)startPlayoffs();hSave()}
function dailyStuff(){if(feat('dev')&&R.day%5==0)R.pl.forEach(p=>{if(p.tid<0||p.age>25||p.inj)return;if(rnd()<(p.age<=22?.55:.3)){const gk=bestGroup(p);hUp(p,gk,1)}});
 if(feat('inj'))R.pl.forEach(p=>{if(p.tid<0)return;if(p.inj){p.inj--;if(!p.inj&&p.tid===0)addNews(`${p.n} is back from injury.`,1);return}if(rnd()<.0025){p.inj=ri(1,8);if(p.tid===0)addNews(`${p.n} is hurt and will miss about ${p.inj} games.`,1)}})}
// ---------- rating upgrades by group ----------
function hRoom(p,gk){return HG[gk][1].reduce((a,k)=>a+Math.max(0,p.mx[k]-p.sk[k]),0)}
function bestGroup(p){return Object.keys(HG).sort((a,b)=>hRoom(p,b)*(OW[p.pos][HG[b][1][0]]||1)-hRoom(p,a)*(OW[p.pos][HG[a][1][0]]||1))[0]}
function hUp(p,gk,n,noCap){const ks=HG[gk][1],got={};for(let i=0;i<n;i++){const c=ks.filter(k=>p.sk[k]<99&&(noCap||p.sk[k]<p.mx[k]));if(!c.length)break;const w=c.map(k=>noCap?1:1+p.mx[k]-p.sk[k]);let q=rnd()*w.reduce((a,b)=>a+b,0),k=c[0];
  for(let j=0;j<c.length;j++){q-=w[j];if(q<=0){k=c[j];break}}const add=rnd()<.2?2:1;p.sk[k]=Math.min(99,p.sk[k]+add);if(noCap)p.mx[k]=Math.max(p.mx[k],p.sk[k]);else p.sk[k]=Math.min(p.sk[k],p.mx[k]);got[k]=(got[k]||0)+add}return got}
const gotTxt=g=>Object.keys(g).map(k=>`+${g[k]} ${HN[k].toLowerCase()}`).join(', ');
// ---------- playoffs ----------
const RDN=['First round','Conference semifinals','Conference finals','Finals'];
const wpct=t=>(R.t[t].w)/(Math.max(1,R.t[t].w+R.t[t].l));
function seeds(conf){return R.t.map((x,i)=>i).filter(i=>R.t[i].conf==conf).sort((a,b)=>wpct(b)-wpct(a)||(R.t[b].pf-R.t[b].pa)-(R.t[a].pf-R.t[a].pa))}
function startPlayoffs(){const best=R.poBest||OPT.poBest||5;const s0=seeds(0).slice(0,8),s1=seeds(1).slice(0,8),mk=s=>[[s[0],s[7]],[s[3],s[4]],[s[2],s[5]],[s[1],s[6]]];
 R.po={rd:0,best,ser:mk(s0).concat(mk(s1)).map(([a,b])=>({a,b,w:[0,0]})),seeds:[s0,s1],champ:null};addNews(`The playoffs begin! ${R.t[0].n} ${s0.includes(0)||s1.includes(0)?'are in':'missed out'}.`,1)}
const serDone=s=>s.w[0]>=Math.ceil(R.po.best/2)||s.w[1]>=Math.ceil(R.po.best/2);
const serWin=s=>s.w[0]>s.w[1]?s.a:s.b;
function poUserSeries(){if(!R.po)return null;return R.po.ser.find(s=>!serDone(s)&&(s.a===0||s.b===0))||null}
function poDay(skipUser){const P=R.po;P.ser.forEach(s=>{if(serDone(s))return;if(skipUser&&(s.a===0||s.b===0))return;const home=(s.w[0]+s.w[1])%2==0?s.a:s.b,away=home==s.a?s.b:s.a,res=simGame(home,away);recGame(home,away,res);poRes(s,home,res.sc[0]>res.sc[1]?home:away)});poAdvance();hSave()}
function poRes(s,home,win){s.w[win===s.a?0:1]++}
function poAdvance(){const P=R.po;if(!P.ser.every(serDone))return;const win=P.ser.map(serWin);if(P.rd==3){P.champ=win[0];addNews(`${R.t[win[0]].n} win the championship!`,win[0]===0);seasonEnd();return}
 P.rd++;const pairs=[];if(P.rd<3){for(let c=0;c<2;c++){const w=win.slice(c*win.length/2,(c+1)*win.length/2);for(let i=0;i<w.length;i+=2)pairs.push([w[i],w[i+1]])}}else pairs.push([win[0],win[1]]);
 P.ser=pairs.map(([a,b])=>({a,b,w:[0,0]}));addNews(`${RDN[P.rd]} set: ${pairs.map(([a,b])=>R.t[a].ab+' vs '+R.t[b].ab).join(', ')}.`)}
// ---------- awards and the offseason ----------
function pg(p,k){return p.ss[SI.gp]?p.ss[SI[k]]/p.ss[SI.gp]:0}
function seasonEnd(){const el=R.pl.filter(p=>p.tid>=0&&p.ss[SI.gp]>=R.sched.length*.5);const by=f=>el.slice().sort((a,b)=>f(b)-f(a))[0];
 const mvp=by(p=>pg(p,'pts')+pg(p,'drb')*.6+pg(p,'orb')*.8+pg(p,'ast')*1.1+pg(p,'stl')*1.5+pg(p,'blk')*1.3+wpct(p.tid)*12),dpoy=by(p=>pg(p,'stl')*2.2+pg(p,'blk')*2.4+pg(p,'drb')*.5+p.sk.pd*.05+p.sk.id*.05),
  roy=by(p=>p.rook===R.season?pg(p,'pts')+pg(p,'drb')+pg(p,'ast'):-1),six=by(p=>p.ss[SI.gs]<p.ss[SI.gp]*.3?pg(p,'pts')+pg(p,'ast')*.5:-1);
 const aw={s:R.season,champ:R.po&&R.po.champ,mvp:mvp&&mvp.id,dpoy:dpoy&&dpoy.id,roy:roy&&roy.id,six:six&&six.id};[['mvp','MVP'],['dpoy','Defensive Player of the Year'],['roy','Rookie of the Year'],['six','Sixth Man of the Year']].forEach(([k,n])=>{const p=R.pl.find(q=>q.id===aw[k]);if(p){p.aw.push(`${R.season} ${n}`);addNews(`${n}: ${p.n} (${R.t[p.tid].ab}).`,p.tid===0)}});
 if(aw.champ!=null)teamPl(aw.champ).forEach(p=>p.aw.push(`${R.season} Champion`));R.hist.push({...aw,rec:R.t.map(t=>[t.w,t.l])});R.stage='draft';mkDraft()}
function mkDraft(){const order=R.t.map((x,i)=>i).sort((a,b)=>wpct(a)-wpct(b));const lot=order.slice(0,14),rest=order.slice(14);
 // lottery: the worst teams have the best odds at the top picks
 const top=[];const pool=lot.slice();for(let k=0;k<4;k++){const w=pool.map((t,i)=>14-lot.indexOf(t)+ (lot.indexOf(t)<3?6:0));let q=rnd()*w.reduce((a,b)=>a+b,0),j=0;for(;j<pool.length;j++){q-=w[j];if(q<=0)break}top.push(pool.splice(Math.min(j,pool.length-1),1)[0])}
 const r1=top.concat(pool,rest),picks=r1.concat(r1).map((t,i)=>({t,rd:i<30?1:2,no:i%30+1}));R.dr={picks,i:0};
 R.dp=[];for(let k=0;k<70;k++){const age=ri(19,22),p=mkPlayer(pick(POS),age,40+rnd()*12+(k<6?8:k<15?4:0),ri(10,26),-2);p.sal=0;R.pl.push(p);R.dp.push(p.id)}
 if(lot.slice(0,14).includes(0))addNews(`Draft lottery: you pick #${r1.indexOf(0)+1}.`,1)}
function draftPick(t,id){const p=R.pl.find(q=>q.id===id);if(!p||p.tid!==-2)return;const pk=R.dr.picks[R.dr.i];p.tid=t;p.rook=R.season+1;p.draft={s:R.season,rd:pk.rd,no:pk.no,t};p.sal=pk.rd==1?clamp(10-pk.no*.3,2,10):MINSAL;p.exp=R.season+(pk.rd==1?3:2);R.dr.i++;if(t===0)addNews(`You drafted ${p.pos} ${p.n} (#${pk.no}, round ${pk.rd}).`,1)}
function cpuDraftUntilUser(){while(R.dr&&R.dr.i<R.dr.picks.length){const pk=R.dr.picks[R.dr.i];if(pk.t===0)return;const av=R.pl.filter(p=>p.tid===-2).sort((a,b)=>(pot(b)*.6+ovr(b)*.4)-(pot(a)*.6+ovr(a)*.4)+gauss()*2);if(!av.length)break;draftPick(pk.t,av[0].id)}draftEnd()}
function draftEnd(){if(R.dr&&R.dr.i<R.dr.picks.length)return;R.pl.forEach(p=>{if(p.tid===-2){p.tid=-1;p.sal=MINSAL;p.exp=R.season+1}});R.dr=null;R.stage='resign'}
function askFor(p){return clamp(Math.round(salFor(p)*(p.age>=31?.85:1)*10)/10,MINSAL,MAXSAL)}
function resignDone(){const nextPay=t=>teamPl(t).filter(q=>q.exp>R.season||q.kept2).reduce((a,q)=>a+q.sal,0);
 R.pl.slice().sort((a,b)=>ovr(b)-ovr(a)).forEach(p=>{if(p.tid>0&&p.exp<=R.season){const ask=askFor(p);if(ovr(p)>=58&&p.age<34&&rnd()<.7&&nextPay(p.tid)+ask<=CAP*1.3){p.sal=ask;p.exp=R.season+ri(1,4);p.kept2=1}else{p.tid=-1}}});R.pl.forEach(p=>{delete p.kept2;if(p.tid===0&&p.exp<=R.season&&!p.keep){p.tid=-1;addNews(`${p.n} leaves in free agency.`,1)}delete p.keep});R.stage='fa';R.fa={day:0}}
function faDay(n){for(let i=0;i<n&&R.fa.day<30;i++){R.fa.day++;for(let t=1;t<30;t++)if(rnd()<.35)cpuSign(t)}}
function cpuSign(t){if(teamPl(t).length>=15)return;const room=CAP-payroll(t);const need=POS.filter(pos=>teamPl(t).filter(p=>p.pos==pos).length<2);
 const c=R.pl.filter(p=>p.tid===-1&&(askFor(p)<=room||askFor(p)<=MINSAL+.5)).sort((a,b)=>(ovr(b)+(need.includes(b.pos)?5:0))-(ovr(a)+(need.includes(a.pos)?5:0)))[0];if(!c)return;c.tid=t;c.sal=Math.min(askFor(c),Math.max(MINSAL,room));c.exp=R.season+ri(1,3)+1}
function newSeason(){R.pl.forEach(p=>{p.car.push([R.season,p.tid,...p.ss]);p.ss=newSS();p.ps=null;p.age++;
  const d=p.age<=22?3.2:p.age<=25?2:p.age<=28?.6:p.age<=31?-.8:-2.4;HK.forEach(k=>{let v=d+gauss()*1.4;if(['spd','acc','vert'].includes(k)&&p.age>=29)v-=1;p.sk[k]=clamp(Math.round(p.sk[k]+v),25,Math.max(p.sk[k],p.mx[k]));if(p.age>=30)p.mx[k]=Math.max(p.sk[k],p.mx[k]-ri(0,1))})});
 // retirements
 R.pl=R.pl.filter(p=>{if(p.age>=35&&(rnd()<.5||ovr(p)<62)){if(p.tid===0)addNews(`${p.n} retires.`,1);return false}if(p.tid===-1&&p.age>=32&&rnd()<.4)return false;return true});
 // keep the free-agent pool (and the save file) from growing forever
 {const fa=R.pl.filter(p=>p.tid===-1).sort((a,b)=>ovr(b)-ovr(a)),drop=new Set(fa.slice(120).map(p=>p.id));if(drop.size)R.pl=R.pl.filter(p=>!drop.has(p.id))}
 for(let t=1;t<30;t++){while(teamPl(t).length<13)cpuSign(t)||fillMin(t);while(teamPl(t).length>15){const w=teamPl(t).sort((a,b)=>ovr(a)-ovr(b))[0];w.tid=-1}}
 while(teamPl(0).length<10)fillMin(0);
 R.season++;R.day=0;R.po=null;R.stage=null;R.fa=null;R.t.forEach(t=>{t.w=t.l=t.pf=t.pa=t.strk=0});R.sched=mkSchedule(R.slen);R.rot[0]=null;addNews(`Season ${R.season} begins.`,1);hSave()}
function fillMin(t){const fa=R.pl.filter(p=>p.tid===-1).sort((a,b)=>ovr(b)-ovr(a))[0];if(fa){fa.tid=t;fa.sal=MINSAL;fa.exp=R.season+1;return true}const p=mkPlayer(pick(POS),ri(24,30),48,4,t);p.sal=MINSAL;R.pl.push(p);return true}
// trades: the CPU accepts if what it gets is worth a bit more than what it gives
function pval(p){const o=ovr(p),pt=pot(p);return Math.pow(Math.max(0,o-45),1.6)*(p.age<=24?1+(pt-o)/40:p.age>=31?.8:1)-p.sal*.4}
function tradeOK(t,give,get){const a=give.reduce((s,p)=>s+pval(p),0),b=get.reduce((s,p)=>s+pval(p),0);const sal0=payroll(0)-give.reduce((s,p)=>s+p.sal,0)+get.reduce((s,p)=>s+p.sal,0);
 if(teamPl(0).length-give.length+get.length<9)return'You would have too few players.';if(sal0>CAP+15&&get.reduce((s,p)=>s+p.sal,0)>give.reduce((s,p)=>s+p.sal,0)*1.25)return'That would put you too far over the cap.';
 return a>=b*1.08?true:`They want more value (${Math.round(a)} vs ${Math.round(b*1.08)}).`}
