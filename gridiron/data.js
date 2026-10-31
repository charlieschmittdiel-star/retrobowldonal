'use strict';
// League data, players, contracts and the save system. Loaded first.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),rnd=Math.random;
const GR=['QB','WR','TE','RB','OL','DL','LB','CB','S','K','P'],ST=['spd','str','awr','skl'];
const SKN={QB:'ACC',WR:'HND',TE:'HND',RB:'HND',OL:'BLK',DL:'RSH',LB:'TKL',CB:'COV',S:'COV',K:'ACC',P:'ACC'};
const WT={QB:[.1,.15,.25,.5],WR:[.3,.1,.2,.4],TE:[.2,.25,.2,.35],RB:[.3,.2,.2,.3],OL:[.1,.35,.15,.4],DL:[.2,.3,.15,.35],LB:[.25,.2,.25,.3],CB:[.35,.05,.2,.4],S:[.25,.15,.3,.3],K:[.05,.4,.1,.45],P:[.05,.45,.1,.4]};
const NEED={QB:1,WR:3,TE:1,RB:1,OL:5,DL:4,LB:3,CB:2,S:2,K:1,P:1},DEPTH={QB:2,WR:5,TE:2,RB:2,OL:7,DL:6,LB:4,CB:4,S:3,K:1,P:1};
const GO=['QB','WR','WR','WR','TE','RB','OL','OL','OL','OL','OL'],GD=['DL','DL','DL','DL','LB','LB','LB','CB','CB','S','S'];
const POSV={QB:1.35,WR:1,TE:.85,RB:.85,OL:.9,DL:1,LB:.85,CB:.95,S:.85,K:.35,P:.3};
const N1='Alex Ben Cal Dre Eli Finn Gus Hal Ian Jax Kai Leo Max Nico Omar Pete Quin Ray Sam Tre Uri Vic Wes Zane Abe Bo Caleb Dante Emil Felix Gabe Hugo Isaac Jalen Kofi Luis Marco Nate Owen Paul Reggie Saul Theo Victor Will Xavier Yusuf Zeke Andre Bryce Cole Darius Evan Grant Hank Jorge Keon Lamar Miles Reed'.split(' ');
const N2='Smith Jones Reyes Park Okafor Miller Cruz Hayes Dunn Ito Vega Brooks Webb Lane Shaw Cole Reid Frost Nash Boyd Diaz Hart Lowe Pike Adams Barnes Carter Dalton Ellis Fischer Garza Hughes Irving Jensen Kim Lopez Moreno Nguyen Owens Perry Quinn Rhodes Santos Tate Underwood Vance Walsh Young Zhang Banks Chen Duarte Eze Foster Grimes Holt Ibarra Kerr Mensah'.split(' ');
const CITIES='Harbor Summit Prairie Delta Cedar Ridge Lake Canyon Bay Pine Stone River Valley Iron Coast Mesa Glacier Timber Copper Falcon Orchard Lantern Meadow Quarry Beacon Bridge Forge Island Plains Crest Haven Port'.split(' ');
const MASC='Kings Wolves Hawks Bears Storm Titans Rams Sharks Comets Pilots Miners Rangers Foxes Giants Bison Knights'.split(' ');
const SK=['gp','pc','pa','py','ptd','pi','ra','ry','rtd','rc','ty','tt','tk','sk','in','fgm','fga'],SI={};SK.forEach((k,i)=>SI[k]=i);
const newSS=()=>SK.map(()=>0);
const DIFFS=[{n:'Rookie',iq:.15,d:'The CPU makes lots of mistakes and is easy to fool in trades.'},{n:'Pro',iq:.45,d:'A fair CPU that reads situations some of the time.'},{n:'All-Pro',iq:.75,d:'The CPU reads your tendencies and manages the clock well.'},{n:'Legend',iq:.95,d:'The CPU almost always makes the smart call, and is a tough trader.'}];
const IQ=()=>DIFFS[R&&R.diff!=null?R.diff:1].iq;
const MAXROS=46,MINSAL=.8,ROOKIE=[5,2.2,1.1];

// ---------- save system ----------
// Saves are versioned. Before an update changes the save format, the old save is copied aside, and the last
// couple of saves are kept as rotating backups. A damaged save falls back to the newest working backup.
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
// Franchise mode and career mode keep separate saves, so switching modes never overwrites the other one.
const MODE=lsGet('gdmode')=='career'?'career':'franchise',SAVE_KEY=MODE=='career'?'gd3c':'gd3',SAVE_VER=4;
const lsSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}};
const lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
let R=null,saveWarn='',saveN=0;
function loadSave(){for(const k of [SAVE_KEY,SAVE_KEY+'_bak1',SAVE_KEY+'_bak2']){const s=lsGet(k);if(!s)continue;
  try{const r=JSON.parse(s);if(r&&r.pl&&r.lg){if(k!=SAVE_KEY)saveWarn='Your main save was damaged, so your most recent backup was loaded instead.';
   if((r.ver||3)<SAVE_VER&&!lsGet(SAVE_KEY+'_v'+(r.ver||3)))lsSet(SAVE_KEY+'_v'+(r.ver||3),s);return r}}catch(e){}}
 return null}
function save(){if(!R)return;R.ver=SAVE_VER;R.saved=Date.now();let s;try{s=JSON.stringify(R)}catch(e){return}
 if(!lsSet(SAVE_KEY,s)){lsDel(SAVE_KEY+'_bak2');if(!lsSet(SAVE_KEY,s)){saveWarn='Saving failed: browser storage is full or blocked. Export your save from Settings so you keep your progress.';return}}
 saveN++;const lb=+lsGet(SAVE_KEY+'_bakt')||0;
 if(Date.now()-lb>180000||saveN%25==0){const b1=lsGet(SAVE_KEY+'_bak1');if(b1&&!lsSet(SAVE_KEY+'_bak2',b1))lsDel(SAVE_KEY+'_bak2');lsSet(SAVE_KEY+'_bak1',s);lsSet(SAVE_KEY+'_bakt',String(Date.now()))}}
function exportSave(){const blob=new Blob([JSON.stringify({app:'gridiron-lab',ver:SAVE_VER,at:new Date().toISOString(),R,plays:lsGet('gd2p'),defs:lsGet('gd2d')})],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`gridiron-save-season${R.season}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
function importSave(file,done){const fr=new FileReader();fr.onload=()=>{try{const o=JSON.parse(fr.result),r=o.R||o;if(!r||!r.pl||!r.lg)throw 0;
  const cur=lsGet(SAVE_KEY);if(cur)lsSet(SAVE_KEY+'_preimport',cur);if(!lsSet(SAVE_KEY,JSON.stringify(r)))throw 0;
  if(o.plays)lsSet('gd2p',o.plays);if(o.defs)lsSet('gd2d',o.defs);done(true)}catch(e){done(false)}};fr.readAsText(file)}
function backups(){return[[SAVE_KEY+'_bak1','Most recent backup'],[SAVE_KEY+'_bak2','Older backup'],[SAVE_KEY+'_v3','Save from before this update'],[SAVE_KEY+'_preimport','Save from before your last import'],[SAVE_KEY+'_prerestore','Save from before your last restore']]
 .map(([k,n])=>{const s=lsGet(k);if(!s)return null;try{const r=JSON.parse(s);return{k,n,season:r.season,when:r.saved?new Date(r.saved).toLocaleString():''}}catch(e){return null}}).filter(Boolean)}
function restoreBackup(k){const s=lsGet(k);if(!s)return false;try{if(!JSON.parse(s).pl)return false}catch(e){return false}const cur=lsGet(SAVE_KEY);if(cur)lsSet(SAVE_KEY+'_prerestore',cur);return lsSet(SAVE_KEY,s)}

// ---------- players ----------
const ovr=(p,mx)=>Math.round(WT[p.g].reduce((a,w,j)=>a+w*(mx?p.mx:p.sk)[ST[j]],0));
const salOf=o=>Math.min(35,Math.max(MINSAL,Math.round(Math.pow(Math.max(0,o-50),1.7)/20*10)/10));
const salFor=p=>Math.max(MINSAL,Math.round(salOf(.75*ovr(p)+.25*Math.max(ovr(p),ovr(p,1)*(p.age<26?1:.6)))*(p.g=='K'||p.g=='P'?.3:1)*10)/10);
const mkMood=()=>{const t=['W','$','L','F'].filter(()=>rnd()<.4);return t.length?t:[['W','$','L','F'][rnd()*4|0]]};
const MOODN={W:'wants to win',$:'wants money',L:'loyal',F:'wants to start'};
function mkPl(g,age,base,pot,tid){const sk={},mx={};ST.forEach(k=>{const v=clamp(Math.round(base+(rnd()-.5)*14),30,97);sk[k]=v;mx[k]=clamp(v+Math.round(rnd()*pot*(age<25?1:age<29?.5:.15)),v,99)});
 const p={id:++R.uid,n:N1[rnd()*N1.length|0]+' '+N2[rnd()*N2.length|0],g,age,sk,mx,tid:tid==null?0:tid,exp:R.season+(rnd()*4|0),inj:0,ss:newSS(),car:[],mood:mkMood(),yt:0,aw:[]};p.sal=salFor(p);return p}
const teamPl=tid=>R.pl.filter(p=>p.tid===tid);
const FB={QB:['WR','RB'],WR:['TE','RB','CB','S'],TE:['WR','OL','RB'],RB:['WR','TE','LB'],OL:['DL','TE'],DL:['OL','LB'],LB:['S','DL'],CB:['S','WR'],S:['CB','LB'],K:['P'],P:['K']};
function depthOrder(tid,g){const pl=R.pl.filter(p=>p.tid===tid&&p.g==g);
 let a=pl.sort((x,y)=>ovr(y)-ovr(x));
 if(tid===0&&R.depth&&R.depth[g]&&!(R.dAuto&&R.dAuto[g])){const ix=R.depth[g];a=a.slice().sort((x,y)=>{const i=ix.indexOf(x.id),j=ix.indexOf(y.id);return(i<0?999:i)-(j<0?999:j)||ovr(y)-ovr(x)})}
 a=a.filter(p=>!p.inj).concat(a.filter(p=>p.inj));
 if(tid===0&&R.mode=='career'&&R.me){const i=a.findIndex(p=>p.id===R.me);if(i>0&&!a[i].inj)a.unshift(a.splice(i,1)[0])}
 return a}
function lineup(tid){tid=tid==null?0:tid;const by={},used=new Set(),pl=R.pl.filter(p=>p.tid===tid);GR.forEach(g=>by[g]=depthOrder(tid,g));
 const pick=g=>{let p=by[g].find(q=>!used.has(q.id)&&!q.inj);
  if(!p)for(const h of FB[g]){p=by[h].find(q=>!used.has(q.id)&&!q.inj);if(p)break}
  if(!p)p=pl.find(q=>!used.has(q.id)&&!q.inj)||by[g][0]||pl[0];if(p)used.add(p.id);return p};
 const O=GO.map(pick),D=GD.map(pick);return{O,D,K:by.K.find(q=>!q.inj)||by.K[0]||by.P[0]||O[0],P:by.P.find(q=>!q.inj)||by.P[0]||by.K[0]||O[0]}}
function teamR(tid){const L=lineup(tid),a=[...L.O,...L.D].filter(Boolean);if(!a.length)return 50;return a.reduce((s,p)=>s+ovr(p)*(p.g=='QB'?3:1),0)/(a.length+2)+(tid===0?(R.st.oc+R.st.dc)*.5:0)}
// In the offseason (draft, re-signing, free agency) the payroll that matters is next season's: expiring deals drop off.
const offS=()=>R.stage=='draft'||R.stage=='resign'||R.stage=='fa';
const deadPay=()=>{const s=R.season+(offS()?1:0);return(R.dead||[]).filter(x=>x.exp>=s).reduce((a,x)=>a+x.amt,0)};
function payroll(tid){tid=tid==null?0:tid;const off=offS();return R.pl.reduce((a,p)=>a+(p.tid===tid&&(!off||p.exp>R.season)?p.sal:0),0)+(tid===0?deadPay():0)}
const userR=()=>teamR(0);
// What a player is worth to a team (trades, drafting, signing). Smarter CPUs weigh age, potential and contract properly;
// dumber ones mostly look at the current overall.
function pval(p,iq){iq=iq==null?1:iq;const o=ovr(p),pt=ovr(p,1),age=p.age;
 let smart=age<=24?o*.55+pt*.45:age<=28?o*.8+pt*.2:o-(age-28)*1.6;smart=Math.max(0,smart-44);smart=smart*smart/9*POSV[p.g];
 const yl=Math.max(1,p.exp-R.season+1);smart-=Math.max(-6,(p.sal-salOf(o))*.9)*Math.min(yl,3);
 let naive=Math.max(0,o-44);naive=naive*naive/9;
 return iq*smart+(1-iq)*naive}
function pickVal(pk,iq){const T=R.lg.t[pk.orig]||{w:8,l:8},wp=(T.w+.5*T.t)/Math.max(1,T.w+T.l+T.t)||.5,base=[34,13,5][pk.rd-1]||3,y=pk.s>R.season?.85:1;return base*(1.35-.7*wp)*y*(iq==null?1:.6+.4*iq)}
// How a player feels about signing with a team (Football GM style mood).
function moodFor(p,tid){const T=R.lg.t[tid]||{w:0,l:0,t:0},g=T.w+T.l+T.t,wp=g?(T.w+.5*T.t)/g:.5,prev=R.prevWP&&R.prevWP[tid]!=null?R.prevWP[tid]:wp,w=g>4?wp:(prev+wp)/2;
 let s=.25,why=[];
 if(p.mood.includes('W')){s+=(w-.5)*1.6;if(w<.4)why.push('wants a winner')}
 if(p.mood.includes('L')&&p.tid===tid){s+=.5;why.push('loyal')}
 if(p.mood.includes('F')){const rank=depthOrder(tid,p.g).filter(q=>q.id!==p.id&&ovr(q)>ovr(p)).length;if(rank>=NEED[p.g]){s-=.5;why.push('wants to start')}else s+=.2}
 if(p.mood.includes('$'))s-=.1;
 if(p.tid===tid&&p.yt>=3)s+=.15;
 return{ok:s>-.15,s,why}}
function askFor(p,tid,yrs){const m=moodFor(p,tid),base=salFor(p)*(p.mood.includes('$')?1.15:1)*(m.s<0?1.15:1)*(p.tid===tid&&p.mood.includes('L')?.92:1);
 const pref=p.age<27?4:p.age<31?3:1,adj=1+.025*Math.abs((yrs||pref)-pref);return Math.max(MINSAL,Math.round(base*adj*10)/10)}

// ---------- league ----------
function mkSched(){const sched=[];for(let w=0;w<17;w++){const a=[...Array(32).keys()];for(let i=31;i>0;i--){const j=rnd()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}const m=[];for(let i=0;i<32;i+=2)m.push([a[i],a[i+1]]);sched.push(m)}return sched}
function mkLeague(){const t=[];for(let i=0;i<32;i++)t.push({n:i?CITIES[i-1]+' '+MASC[i*7%16]:'Home Hawks',c:i>>4,d:i>>2&3,r:Math.round(56+rnd()*20),w:0,l:0,t:0,k:rnd(),pf:0,pa:0});return{wk:0,t,sched:mkSched(),po:null}}
function genTeam(tid,r){GR.forEach(g=>{for(let i=0;i<DEPTH[g];i++){const st=i<NEED[g],p=mkPl(g,22+(rnd()*11|0),st?r-3+rnd()*7:r-13+rnd()*8,st?12:16,tid);p.exp=R.season+(rnd()*4|0);p.yt=rnd()*4|0;R.pl.push(p)}});
 let pay=payroll(tid);if(pay>R.cap*.95){const f=R.cap*.92/pay;R.pl.forEach(p=>{if(p.tid===tid)p.sal=Math.max(MINSAL,Math.round(p.sal*f*10)/10)})}}
function mkPicks(s){R.picks=R.picks||[];for(let rd=1;rd<=3;rd++)for(let t=0;t<32;t++)if(!R.picks.some(k=>k.s==s&&k.rd==rd&&k.orig==t))R.picks.push({s,rd,orig:t,own:t})}
function newFranchise(){R={ver:SAVE_VER,uid:0,pts:3,st:{oc:0,dc:0,sc:0},season:1,pl:[],cap:220,lg:null,stage:null,diff:1,qlen:4,depth:{},dAuto:{},dead:[],awards:[],picks:[],news:[],prevWP:{}};
 R.lg=mkLeague();GR.forEach(g=>{for(let i=0;i<DEPTH[g];i++)R.pl.push(mkPl(g,22+(rnd()*10|0),i<NEED[g]?66+rnd()*8:54+rnd()*8,i<NEED[g]?14:8,0))});
 R.cap=Math.max(220,Math.ceil(payroll(0)+12));for(let t=1;t<32;t++)genTeam(t,R.lg.t[t].r);
 R.lg.t.forEach((t,i)=>t.r=Math.round(teamR(i)));mkPicks(1);mkPicks(2);save()}
// Bring an older save up to date without losing anything.
function migrate(){const v=R.ver||3;if(v>=SAVE_VER)return;
 if(R.q&&R.q.length){R.q.forEach(p=>{p.yrs=1;R.pl.push(p)})}
 R.pl.forEach(p=>{p.tid=0;p.exp=R.season+Math.max(1,p.yrs||1)-1;delete p.yrs;p.inj=0;p.ss=newSS();p.car=[];p.mood=mkMood();p.yt=1;p.aw=[]});
 R.st=R.st||{oc:0,dc:0};R.st.sc=R.st.sc||0;R.diff=1;R.qlen=4;R.depth={};R.dAuto={};R.dead=[];R.awards=[];R.news=[];R.prevWP={};R.picks=[];
 R.lg.t.forEach(t=>{t.pf=t.pf||0;t.pa=t.pa||0});for(let t=1;t<32;t++)genTeam(t,R.lg.t[t].r||66);
 mkPicks(R.season);mkPicks(R.season+1);
 if(R.stage=='resign'||R.stage=='draft'){R.aged=1;R.stage='draft';R.dr=null}else R.stage=null;delete R.q;R.ver=SAVE_VER}
R=loadSave();
if(!R){newFranchise();R.mode=MODE;save()}else{R.mode=R.mode||MODE;migrate();
 ['depth','dAuto'].forEach(k=>R[k]=R[k]||{});R.dead=R.dead||[];R.awards=R.awards||[];R.picks=R.picks||[];R.news=R.news||[];R.prevWP=R.prevWP||{};if(R.diff==null)R.diff=1;if(!R.qlen)R.qlen=4;R.st.sc=R.st.sc||0;
 GR.forEach(g=>{while(R.pl.filter(p=>p.tid===0&&p.g==g).length<NEED[g]){const p=mkPl(g,26,60,6,0);p.sal=MINSAL;p.exp=R.season;R.pl.push(p)}});save()}
