'use strict';
// Simulated matches (chances and expected goals, tuned to real league averages), the league table, the season calendar,
// awards, player development, contracts, the transfer window, youth intake and the new season.
const RW={GK:0,CB:.45,FB:.55,CM:1.5,WG:2.6,ST:4.2};
function sideStr(L,slots){const S={att:0,mid:0,def:0,gk:60};L.forEach((p,i)=>{const pos=slots[i][0],s=p.sk;if(pos=='GK'){S.gk=(s.div+s.han+s.pos)/3;return}
  const att=(s.fin*.4+s.dri*.25+s.spd*.2+s.ctl*.15),mid=(s.shp*.35+s.vis*.25+s.ctl*.25+s.sta*.15),def=(s.tkl*.35+s.mrk*.3+s.int*.2+s.str*.15);
  const w={CB:[.1,.25,1],FB:[.25,.4,.75],CM:[.45,1,.45],WG:[.8,.5,.15],ST:[1,.3,.05]}[pos]||[.3,.3,.3];S.att+=att*w[0];S.mid+=mid*w[1];S.def+=def*w[2]});return S}
function pickW(w){let s=w.reduce((a,b)=>a+b,0),q=rnd()*s;for(let i=0;i<w.length;i++){q-=w[i];if(q<=0)return i}return w.length-1}
function poisson(l){let L=Math.exp(-l),k=0,p=1;do{k++;p*=rnd()}while(p>L);return k-1}
function simGame(a,b){const T=[a,b].map(t=>{const lu=lineup(t);return{t,ps:lu.xi.concat(lu.bench.slice(0,3)),xi:lu.xi,slots:lu.slots,box:lu.xi.concat(lu.bench.slice(0,3)).map(()=>newSS())}}),sc=[0,0];
 const S=T.map(x=>sideStr(x.xi,x.slots)),mid=[S[0].mid,S[1].mid],poss0=clamp(.5+(mid[0]-mid[1])/180,.3,.7);
 T.forEach((X,k)=>{X.xi.forEach((p,i)=>{const bx=X.box[i];bx[SI.gp]=1;bx[SI.gs]=1;bx[SI.min]=90});
  // three substitutes come on around the hour
  for(let j=0;j<3;j++){const outI=ri(5,10),inI=11+j;if(!X.ps[inI])continue;const m=ri(55,82);X.box[outI][SI.min]=m;X.box[inI][SI.gp]=1;X.box[inI][SI.min]=90-m}});
 const r=feat('realism');
 [0,1].forEach(k=>{const o=1-k,A=S[k],D=S[o],X=T[k],Y=T[o],home=k===0?1.06:.95;
  const lam=clamp(15.2*Math.pow(A.att/Math.max(1,D.def),1.15)*Math.pow((k?1-poss0:poss0)/.5,.6)*home,4,26),shots=poisson(lam);
  const w=X.xi.map((p,i)=>RW[X.slots[i][0]]*Math.pow((p.sk.fin+p.sk.lng*.5)/90,2));
  for(let s=0;s<shots;s++){const i=pickW(w),p=X.xi[i],bx=X.box[i];bx[SI.sh]++;const long=rnd()<.3;let xg=long?.025+rnd()*.04:.03+Math.pow(rnd(),2)*.3;
   xg*=Math.pow((long?p.sk.lng:p.sk.fin)/62,1.3)*Math.pow(74/Math.max(30,D.gk),1.1)*(r?1:1.08);const pOn=clamp(.26+xg*1.3+(p.sk.fin-65)/300,.15,.9),onT=rnd()<pOn;if(onT)bx[SI.sot]++;
   const goal=onT&&rnd()<clamp(xg/pOn,0,.95);const gk=Y.xi[0];if(onT&&!goal&&gk)Y.box[0][SI.sv]++;
   if(goal){sc[k]++;bx[SI.g]++;if(rnd()<.74){const aw=X.xi.map((q,j)=>j===i||X.slots[j][0]=='GK'?0:({CM:2.2,WG:2.4,FB:1,ST:1.2,CB:.3}[X.slots[j][0]]||1)*Math.pow((q.sk.vis+q.sk.shp+q.sk.crs)/200,2));if(aw.some(x=>x>0))X.box[pickW(aw)][SI.a]++}}}
  // passing, defending, discipline
  const tp=Math.round((k?1-poss0:poss0)*900*(.9+rnd()*.2));X.xi.forEach((p,i)=>{const pos=X.slots[i][0],sh={GK:.04,CB:.12,FB:.1,CM:.16,WG:.08,ST:.05}[pos]||.08,n=Math.round(tp*sh*(.8+rnd()*.4)),acc=clamp(.79+(p.sk.shp-65)*.005+(pos=='CB'||pos=='CM'?.04:0),.55,.95);
   X.box[i][SI.pas]+=n;X.box[i][SI.pac]+=Math.round(n*acc);const dw={GK:0,CB:3.2,FB:2.6,CM:2.4,WG:1,ST:.6}[pos]||1;X.box[i][SI.tkl]+=poisson(dw*p.sk.tkl/70);X.box[i][SI.int]+=poisson(dw*.6*p.sk.int/70);
   if(feat('fouls')&&rnd()<({CB:.25,FB:.21,CM:.21,WG:.12,ST:.12,GK:.02}[pos]||.15)){X.box[i][SI.yc]++}if(feat('fouls')&&rnd()<.0045&&pos!='GK')X.box[i][SI.rc]++})});
 T.forEach((X,k)=>{if(sc[1-k]===0)X.xi.forEach((p,i)=>{const pos=X.slots[i][0];if(pos=='GK'||pos=='CB'||pos=='FB')X.box[i][SI.cs]++});X.box.forEach((b,i)=>{if(b[SI.gp])b[SI.rat]=matchRating(b,X.slots[i]?X.slots[i][0]:X.ps[i].pos,sc[k]-sc[1-k])})});
 return{sc,T,poss:[Math.round(poss0*100),100-Math.round(poss0*100)]}}
function matchRating(b,pos,gd){let r=6.3+b[SI.g]*1+b[SI.a]*.6+b[SI.sot]*.12+(b[SI.pas]?b[SI.pac]/b[SI.pas]-.8:0)*2*Math.min(1,b[SI.pas]/15)+b[SI.tkl]*.08+b[SI.int]*.08+b[SI.sv]*.25+(b[SI.cs]?(pos=='GK'?.6:.3):0)-b[SI.yc]*.3-b[SI.rc]*1.5+gd*.12;return Math.round(clamp(r,3,10)*10)/10}
// record a finished match into the table, stats and the box score log
function recGame(a,b,res,played){const t=R.t,[sa,sb]=res.sc,cup=!!res.cup;
 if(!cup){t[a].gf+=sa;t[a].ga+=sb;t[b].gf+=sb;t[b].ga+=sa;const f=(x,c)=>{x.form5.push(c);if(x.form5.length>5)x.form5.shift()};if(sa>sb){t[a].w++;t[b].l++;f(t[a],'W');f(t[b],'L')}else if(sa<sb){t[b].w++;t[a].l++;f(t[b],'W');f(t[a],'L')}else{t[a].d++;t[b].d++;f(t[a],'D');f(t[b],'D')}}
 res.T.forEach(S=>S.ps.forEach((p,i)=>{const bx=S.box[i];if(!bx[SI.gp])return;const tgt=cup?(p.cs2=p.cs2||newSS()):p.ss;bx.forEach((v,k)=>{if(k!==SI.rat)tgt[k]+=v});tgt[SI.rat]+=bx[SI.rat];if(bx[SI.rc])p.ban=(p.ban||0)+1;if(!cup&&(p.ss[SI.yc]%5==0)&&bx[SI.yc])p.ban=(p.ban||0)+1}));
 if(a===0||b===0){R.box.push({s:R.season,d:R.day,cup:cup?res.cup:null,a,b,sc:[sa,sb],poss:res.poss,played:!!played,pl:res.T.map(S=>S.ps.map((p,i)=>[p.id,p.n,p.pos,...S.box[i]]))});if(R.box.length>60)R.box.shift();
  const me=a===0?0:1;if(res.sc[me]>res.sc[1-me])R.pts++;addNews(`${t[a].n} ${sa}-${sb} ${t[b].n}${cup?' ('+res.cup+')':''}.`,1)}
 else if(feat('news')&&Math.abs(sa-sb)>=5)addNews(`Thrashing: ${t[sa>sb?a:b].n} beat ${t[sa>sb?b:a].n} ${Math.max(sa,sb)}-${Math.min(sa,sb)}.`)}
function addNews(s,mine){R.news.unshift({s:R.season,d:R.day,t:s,m:mine?1:0});if(R.news.length>150)R.news.length=150}
const tpts=t=>R.t[t].w*3+R.t[t].d;
// the table for one division (by default the one your club is in)
const divOf=t=>R.t[t]&&R.t[t].dv||1;
function table(dv){const D=dv||divOf(0);return R.t.map((_,i)=>i).filter(i=>divOf(i)===D).sort((a,b)=>tpts(b)-tpts(a)||(R.t[b].gf-R.t[b].ga)-(R.t[a].gf-R.t[a].ga)||R.t[b].gf-R.t[a].gf)}
function simDay(skipUser){const d=R.sched[R.day];if(!d)return;d.forEach(([a,b])=>{if(skipUser&&(a===0||b===0))return;recGame(a,b,simGame(a,b))});const d2=R.sched2&&R.sched2[R.day];if(d2)d2.forEach(([a,b])=>recGame(a,b,simGame(a,b)));endDay()}
function endDay(){R.day++;dailyStuff();if(R.day>=R.sched.length&&!R.stage)seasonEnd();hSave()}
function dailyStuff(){R.pl.forEach(p=>{if(p.ban>0&&p.tid>=0){p.ban--}});
 if(feat('dev')&&R.day%4==0)R.pl.forEach(p=>{if(p.tid<0||p.age>24||p.inj)return;if(rnd()<(p.age<=20?.5:.28))hUp(p,bestGroup(p),1)});
 if(feat('inj'))R.pl.forEach(p=>{if(p.tid<0)return;if(p.inj){p.inj--;if(!p.inj&&p.tid===0)addNews(`${p.n} is fit again.`,1);return}if(rnd()<.004){p.inj=ri(1,6);if(p.tid===0)addNews(`${p.n} is injured and will miss about ${p.inj} matches.`,1)}})}
// ---------- rating upgrades by group ----------
function hRoom(p,gk){return SG[gk][1].reduce((a,k)=>a+Math.max(0,p.mx[k]-p.sk[k]),0)}
function bestGroup(p){return Object.keys(SG).filter(g=>p.pos=='GK'?g=='gk'||g=='pac':g!='gk').sort((a,b)=>hRoom(p,b)*(OW[p.pos][SG[b][1][0]]||1)-hRoom(p,a)*(OW[p.pos][SG[a][1][0]]||1))[0]}
function hUp(p,gk,n,noCap){const ks=SG[gk][1],got={};for(let i=0;i<n;i++){const c=ks.filter(k=>p.sk[k]<99&&(noCap||p.sk[k]<p.mx[k]));if(!c.length)break;const w=c.map(k=>noCap?1:1+p.mx[k]-p.sk[k]);let q=rnd()*w.reduce((a,b)=>a+b,0),k=c[0];
  for(let j=0;j<c.length;j++){q-=w[j];if(q<=0){k=c[j];break}}const add=rnd()<.2?2:1;p.sk[k]=Math.min(99,p.sk[k]+add);if(noCap)p.mx[k]=Math.max(p.mx[k],p.sk[k]);else p.sk[k]=Math.min(p.sk[k],p.mx[k]);got[k]=(got[k]||0)+add}return got}
const gotTxt=g=>Object.keys(g).map(k=>`+${g[k]} ${SN[k].toLowerCase()}`).join(', ');
function pg(p,k){return p.ss[SI.gp]?p.ss[SI[k]]/p.ss[SI.gp]:0}
const avgRat=p=>p.ss[SI.gp]?p.ss[SI.rat]/p.ss[SI.gp]:0;
// ---------- the end of the season ----------
function seasonEnd(){const tb=table(1),champ=tb[0],el=R.pl.filter(p=>p.tid>=0&&divOf(p.tid)===1&&p.ss[SI.gp]>=R.sched.length*.4);const by=f=>el.slice().sort((a,b)=>f(b)-f(a))[0];
 const boot=by(p=>p.ss[SI.g]+p.ss[SI.a]*.01),pots=by(p=>avgRat(p)*10+p.ss[SI.g]*.3+p.ss[SI.a]*.2),young=by(p=>p.age<=21?avgRat(p)*10+p.ss[SI.g]*.3:-1),glove=by(p=>p.pos=='GK'?p.ss[SI.cs]*10+avgRat(p):-1);
 const aw={s:R.season,champ,table:tb.slice(),div:divOf(0),table2:R.t.some(t=>t.dv==2)?table(2):null,boot:boot&&boot.id,pots:pots&&pots.id,young:young&&young.id,glove:glove&&glove.id,rec:R.t.map(t=>[t.w,t.d,t.l])};
 [['boot','Golden Boot'],['pots','Player of the Season'],['young','Young Player of the Season'],['glove','Golden Glove']].forEach(([k,n])=>{const p=R.pl.find(q=>q.id===aw[k]);if(p){p.aw.push(`${R.season} ${n}`);addNews(`${n}: ${p.n} (${R.t[p.tid].ab})${k=='boot'?`, ${p.ss[SI.g]} goals`:''}.`,p.tid===0)}});
 teamPl(champ).forEach(p=>p.aw.push(`${R.season} Champion`));addNews(`${R.t[champ].n} are the champions!`,champ===0);R.hist.push(aw);R.stage='renew'}
function askFor(p){return clamp(Math.round(salFor(p)*(p.age>=31?.85:1)*10)/10,.3,30)}
function renewDone(){R.pl.forEach(p=>{if(p.tid>0&&p.exp<=R.season){if(ovr(p)>=60&&p.age<34&&rnd()<.7){p.sal=askFor(p);p.exp=R.season+ri(1,4)}else p.tid=-1}if(p.tid===0&&p.exp<=R.season&&!p.keep){p.tid=-1;addNews(`${p.n} leaves on a free transfer.`,1)}delete p.keep});R.stage='window';R.win={day:0}}
function windowDay(n){for(let i=0;i<n&&R.win.day<30;i++){R.win.day++;for(let t=1;t<R.t.length;t++){if(rnd()<.3)cpuSign(t);if(rnd()<.05)cpuBuy(t)}}}
function cpuSign(t){if(teamPl(t).length>=25)return false;const need=POS.filter(pos=>teamPl(t).filter(p=>p.pos==pos).length<(pos=='GK'?2:3));const c=R.pl.filter(p=>p.tid===-1).sort((a,b)=>(ovr(b)+(need.includes(b.pos)?6:0))-(ovr(a)+(need.includes(a.pos)?6:0)))[0];if(!c)return false;c.tid=t;c.sal=askFor(c);c.exp=R.season+ri(1,3)+1;fixNum(c,t);return true}
function cpuBuy(t){const T=R.t[t];const tgt=R.pl.filter(p=>p.tid>0&&p.tid!==t&&valueOf(p)<=T.bud&&teamPl(p.tid).length>18).sort((a,b)=>ovr(b)-ovr(a)+gauss()*3)[0];if(!tgt||ovr(tgt)<teamOvr(t)-2)return;const fee=valueOf(tgt),from=tgt.tid;T.bud-=fee;R.t[from].bud+=fee;tgt.tid=t;fixNum(tgt,t);R.xi[t]=null;R.xi[from]=null;if(feat('news'))addNews(`Transfer: ${tgt.n} moves from ${R.t[from].n} to ${T.n} for ${money(fee)}.`)}
const money=v=>'€'+(Math.round(v*10)/10).toFixed(1)+'M';
function newSeason(){R.pl.forEach(p=>{p.car.push([R.season,p.tid,...p.ss]);p.ss=newSS();p.cs2=null;p.age++;p.ban=0;
  const d=p.age<=20?3.4:p.age<=23?2.2:p.age<=27?.6:p.age<=30?-.6:-2.2;SK.forEach(k=>{let v=d+gauss()*1.4;if(['spd','acc','sta'].includes(k)&&p.age>=29)v-=1;p.sk[k]=clamp(Math.round(p.sk[k]+v),20,Math.max(p.sk[k],p.mx[k]));if(p.age>=30)p.mx[k]=Math.max(p.sk[k],p.mx[k]-ri(0,1))})});
 R.pl=R.pl.filter(p=>{if(p.age>=35&&(rnd()<.5||ovr(p)<64)){if(p.tid===0)addNews(`${p.n} retires.`,1);return false}if(p.tid===-1&&p.age>=32&&rnd()<.4)return false;return true});
 // youth intake: every club promotes two academy players
 for(let t=0;t<R.t.length;t++){for(let k=0;k<2;k++){const p=mkPlayer(pick(POS),ri(16,18),44+rnd()*8,ri(14,30),t);p.sal=.2;p.exp=R.season+3;R.pl.push(p);if(t===0)addNews(`Academy: ${p.pos} ${p.n} (${p.age}) joins the first team.`,1)}}
 for(let t=1;t<R.t.length;t++){while(teamPl(t).length<20)cpuSign(t)||fillMin(t);while(teamPl(t).length>26){const w=teamPl(t).sort((a,b)=>ovr(a)-ovr(b))[0];w.tid=-1}R.t[t].bud=Math.max(R.t[t].bud,10+rnd()*30)}
 while(teamPl(0).length<16||teamPl(0).filter(p=>p.pos=='GK').length<1)fillMin(0);for(let t=1;t<R.t.length;t++)while(needPos(t)=='GK')fillMin(t);
 {const fa=R.pl.filter(p=>p.tid===-1).sort((a,b)=>ovr(b)-ovr(a)),drop=new Set(fa.slice(120).map(p=>p.id));if(drop.size)R.pl=R.pl.filter(p=>!drop.has(p.id))}
 R.season++;R.day=0;R.stage=null;R.win=null;R.t.forEach(t=>{t.w=t.d=t.l=t.gf=t.ga=0;t.form5=[]});R.sched=mkSchedule(R.rounds);R.xi[0]=null;addNews(`Season ${R.season} kicks off.`,1);hSave()}
function needPos(t){const c=pos=>teamPl(t).filter(p=>p.pos==pos).length;return c('GK')<2?'GK':c('CB')<3?'CB':c('FB')<2?'FB':c('CM')<3?'CM':c('ST')<2?'ST':c('WG')<2?'WG':null}
function fillMin(t){const np=needPos(t),fa=R.pl.filter(p=>p.tid===-1&&(!np||p.pos==np)).sort((a,b)=>ovr(b)-ovr(a))[0];if(fa){fa.tid=t;fa.sal=askFor(fa);fa.exp=R.season+1;fixNum(fa,t);return true}const p=mkPlayer(np||pick(POS),ri(22,28),52,4,t);R.pl.push(p);return true}
// transfers: buy for the asking fee if the selling club can spare him and you have the money
function buyOK(p){const fee=valueOf(p);if(R.cash<fee)return'Not enough transfer money.';if(teamPl(0).length>=26)return'Your squad is full (26).';if(teamPl(p.tid).length<=18)return'They will not sell: their squad is too small.';return true}
function sellValue(p){return Math.round(valueOf(p)*.9*10)/10}
