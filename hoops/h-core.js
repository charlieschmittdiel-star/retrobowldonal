'use strict';
// Hardwood Lab (basketball): core data. Players with detailed ratings in groups, positions and heights, teams,
// a 30-team league, contracts and saves. Completely separate from the football game (own saves, own code).
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=Math.random,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)];
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}},lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// ---------- ratings ----------
const HG={ath:['Athletic',['spd','acc','vert','str','sta']],ins:['Inside scoring',['lay','dnk','post']],sht:['Shooting',['mid','thr','ft']],
 ply:['Playmaking',['han','pas','vis']],def:['Defense',['pd','id','stl','blk','hiq']],reb:['Rebounding',['orb','drb']]};
const HN={spd:'Speed',acc:'Acceleration',vert:'Vertical',str:'Strength',sta:'Stamina',lay:'Layups',dnk:'Dunking',post:'Post moves',mid:'Mid-range',thr:'Three-point',ft:'Free throws',
 han:'Ball handling',pas:'Passing',vis:'Court vision',pd:'Perimeter D',id:'Interior D',stl:'Steals',blk:'Blocks',hiq:'Help defense',orb:'Off. rebounding',drb:'Def. rebounding'};
const HD={spd:'How fast he runs.',acc:'How quickly he gets to top speed.',vert:'How high he jumps (blocks, rebounds, dunks).',str:'Holding position, finishing through contact.',sta:'How long he can play hard.',
 lay:'Finishing at the rim.',dnk:'Dunking in traffic.',post:'Scoring with his back to the basket.',mid:'Jump shots inside the arc.',thr:'Shots from behind the arc.',ft:'Free throws.',
 han:'Dribbling without losing it; beating defenders off the bounce.',pas:'Accurate, quick passes.',vis:'Finding the open man.',pd:'Staying in front of ball handlers; contesting jumpers.',id:'Defending the paint and post.',
 stl:'Picking pockets and passing lanes.',blk:'Blocking shots.',hiq:'Rotating to help on drives.',orb:'Rebounds on his team\'s misses.',drb:'Rebounds on the other team\'s misses.'};
const HK=Object.values(HG).flatMap(g=>g[1]);
const POS=['PG','SG','SF','PF','C'],POSN={PG:'Point guard',SG:'Shooting guard',SF:'Small forward',PF:'Power forward',C:'Center'};
const HT={PG:[72,76],SG:[75,79],SF:[77,81],PF:[79,83],C:[81,86]};
// how much each rating counts toward the overall, per position
const OW={PG:{spd:6,acc:6,vert:2,str:1,sta:3,lay:6,dnk:1,post:1,mid:7,thr:9,ft:3,han:12,pas:12,vis:10,pd:7,id:1,stl:5,blk:1,hiq:3,orb:1,drb:3},
 SG:{spd:6,acc:5,vert:3,str:2,sta:3,lay:7,dnk:3,post:1,mid:9,thr:12,ft:4,han:8,pas:6,vis:5,pd:8,id:1,stl:5,blk:1,hiq:3,orb:1,drb:3},
 SF:{spd:5,acc:4,vert:4,str:4,sta:3,lay:8,dnk:5,post:3,mid:8,thr:9,ft:3,han:5,pas:5,vis:4,pd:8,id:4,stl:4,blk:3,hiq:4,orb:3,drb:5},
 PF:{spd:3,acc:3,vert:5,str:7,sta:3,lay:8,dnk:6,post:6,mid:6,thr:5,ft:2,han:3,pas:4,vis:3,pd:4,id:8,stl:2,blk:6,hiq:5,orb:7,drb:9},
 C:{spd:2,acc:2,vert:6,str:9,sta:3,lay:9,dnk:7,post:8,mid:3,thr:2,ft:2,han:2,pas:3,vis:3,pd:2,id:12,stl:2,blk:10,hiq:6,orb:9,drb:11}};
// typical rating shape by position (added to the player's base level)
const PROF={PG:{spd:8,acc:8,han:12,pas:12,vis:10,thr:5,mid:3,stl:5,pd:4,str:-10,id:-14,blk:-16,orb:-14,drb:-10,post:-12,dnk:-8,vert:0},
 SG:{spd:6,acc:6,thr:10,mid:8,han:4,pas:-2,pd:5,stl:3,str:-6,id:-10,blk:-12,orb:-10,drb:-8,post:-8},
 SF:{thr:2,mid:3,lay:3,dnk:2,pd:5,id:-2,str:0,han:-2,pas:-3,drb:-2,orb:-4},
 PF:{str:8,id:6,blk:4,orb:8,drb:9,post:6,dnk:4,thr:-8,han:-10,pas:-6,spd:-5,acc:-5,pd:-4},
 C:{str:12,id:12,blk:12,orb:12,drb:13,post:9,dnk:6,lay:4,thr:-20,mid:-10,han:-16,pas:-8,vis:-6,spd:-10,acc:-10,pd:-10,stl:-6,ft:-10}};
const ovrOf=(p,mx)=>{const w=OW[p.pos],s=mx?p.mx:p.sk;let a=0,t=0;for(const k in w){a+=w[k]*s[k];t+=w[k]}return Math.round(a/t+((mx?p.mx:p.sk).ht?0:0))};
const ovr=p=>ovrOf(p),pot=p=>ovrOf(p,1);
// ---------- names ----------
const FN=['Jalen','Marcus','Tyrese','Devin','Andre','Malik','Chris','Kevin','Darius','Isaiah','Jordan','Trey','Caleb','Elijah','Jaylen','Miles','Aaron','Brandon','Cole','Damon','Evan','Gabe','Hakeem','Ivan','Jamal','Kyle','Luka','Mason','Nate','Omar','Paul','Quinn','Reggie','Sam','Terrance','Victor','Wes','Xavier','Zion','Bryce','Cam','Dante','Eli','Felix','Grant','Hugo','Jace','Kofi','Lonzo','Moses','Nico','Otto','Rashad','Seth','Tobias','Uche','Vince','Wade','Yuri'];
const LN=['Allen','Brooks','Carter','Davis','Edwards','Fields','Grant','Harris','Irving','Jackson','King','Lewis','Mitchell','Nash','Owens','Porter','Reed','Simmons','Thompson','Walker','Young','Barnes','Coleman','Dixon','Ellis','Foster','Gibson','Hayes','Ingram','James','Knox','Lowry','Morris','Nance','Oduya','Parker','Randle','Smart','Turner','Vaughn','Wallace','Bennett','Cruz','Dunn','Evans','Fox','Gordon','Hill','Johnson','Kemp','Lee','Moore','Nunez','Okafor','Price','Rivers','Stone','Tate','Watts','Diallo','Petrovic','Sato','Mensah','Silva','Novak'];
const CITIES=['Harbor','Summit','Mesa','Coastal','Ridge','Valley','Prairie','Granite','Lakeshore','Desert','Bay','Forge','Capital','Metro','River','Pine','Iron','Glacier','Sun','Delta','Canyon','Northern','Southern','Twin','Beacon','Crystal','Copper','Midway','Emerald','Thunder'];
const NICKS=['Hawks','Comets','Kings','Rockets','Wolves','Storm','Blaze','Titans','Vipers','Monarchs','Falcons','Bolts','Owls','Rhinos','Lynx','Mavericks','Raptors','Sharks','Pilots','Hornets','Knights','Stallions','Phantoms','Grizzlies','Pioneers','Cyclones','Express','Dragons','Jets','Waves'];
const TCOL=[['#1d4ed8','#fbbf24'],['#b91c1c','#f8fafc'],['#047857','#facc15'],['#7c3aed','#f8fafc'],['#0f172a','#38bdf8'],['#c2410c','#1f2937'],['#0e7490','#f8fafc'],['#be123c','#fde68a'],['#15803d','#f8fafc'],['#1e3a8a','#f97316'],
 ['#6d28d9','#fde047'],['#b45309','#f8fafc'],['#334155','#f43f5e'],['#0369a1','#bef264'],['#9f1239','#94a3b8'],['#065f46','#fcd34d'],['#1f2937','#22d3ee'],['#a21caf','#f8fafc'],['#7f1d1d','#fbbf24'],['#0c4a6e','#f8fafc'],
 ['#3f6212','#f8fafc'],['#4338ca','#f472b6'],['#78350f','#fef3c7'],['#134e4a','#f97316'],['#581c87','#a3e635'],['#9a3412','#e0f2fe'],['#155e75','#fbbf24'],['#111827','#ef4444'],['#2563eb','#e5e7eb'],['#166534','#fda4af']];
// ---------- players ----------
let R=null;
function mkPlayer(pos,age,base,potRoom,tid){const pr=PROF[pos],sk={},mx={};const [h0,h1]=HT[pos];const ht=ri(h0,h1);
 HK.forEach(k=>{let v=base+(pr[k]||0)+gauss()*6;if(k=='vert'||k=='blk'||k=='orb'||k=='drb'||k=='id')v+=(ht-(h0+h1)/2)*1.2;if(k=='spd'||k=='acc'||k=='han')v-=(ht-(h0+h1)/2)*.8;
  sk[k]=clamp(Math.round(v),25,97);const room=potRoom*(age<=22?1:age<=25?.6:age<=28?.25:.05)*(.6+rnd()*.8);mx[k]=clamp(Math.round(sk[k]+room),sk[k],99)});
 const mates=tid>=0?R.pl.filter(q=>q.tid===tid):[];let ln=pick(LN);for(let k=0;k<20&&mates.some(q=>q.ln===ln);k++)ln=pick(LN);
 const p={id:++R.uid,fn:pick(FN),ln,pos,age,ht,wt:Math.round(170+(ht-72)*7+gauss()*10),sk,mx,tid,ss:newSS(),car:[],aw:[],num:ri(0,55),inj:0};p.n=p.fn+' '+p.ln;p.sal=salFor(p);p.exp=R.season+ri(0,3);if(tid>=0)fixNum(p,tid);return p}
// every player on a team wears a different number
function fixNum(p,t){const used=new Set(R.pl.filter(q=>q.tid===t&&q!==p).map(q=>q.num));if(!used.has(p.num))return;const opts=[];for(let n=0;n<=55;n++)if(!used.has(n))opts.push(n);if(opts.length)p.num=pick(opts)}
function fixNums(t){const seen=new Set();teamPl(t).forEach(p=>{if(seen.has(p.num))fixNum(p,t);seen.add(p.num)})}
const SS=['gp','gs','min','pts','fgm','fga','tpm','tpa','ftm','fta','orb','drb','ast','stl','blk','tov','pf'],SI={};SS.forEach((k,i)=>SI[k]=i);
const newSS=()=>SS.map(()=>0);
const CAP=155,MINSAL=1.1,MAXSAL=50;
function salFor(p,o){o=o==null?ovr(p):o;const v=Math.max(0,o-48);return clamp(Math.round(Math.pow(v,2.3)/40*10)/10,MINSAL,MAXSAL)}
const teamPl=t=>R.pl.filter(p=>p.tid===t);
const payroll=t=>teamPl(t).reduce((a,p)=>a+p.sal,0);
function teamOvr(t){const pl=rotation(t);const top=pl.slice(0,10).map(ovr);const w=[4,4,4,4,4,2,2,1.5,1,1];let a=0,s=0;top.forEach((v,i)=>{a+=v*w[i];s+=w[i]});return s?Math.round(a/s):50}
// starting five: best player at each position (or the closest fit), then the bench by overall
function rotation(t){const pl=teamPl(t).filter(p=>!p.inj).sort((a,b)=>ovr(b)-ovr(a));const R0=R.rot&&R.rot[t];
 if(R0&&R0.length){const m=R0.map(id=>pl.find(p=>p.id===id)).filter(Boolean);pl.forEach(p=>{if(!m.includes(p))m.push(p)});return m}
 const st=[],used=new Set();POS.forEach(pos=>{const c=pl.find(p=>p.pos==pos&&!used.has(p.id))||pl.find(p=>!used.has(p.id)&&Math.abs(POS.indexOf(p.pos)-POS.indexOf(pos))==1)||pl.find(p=>!used.has(p.id));if(c){st.push(c);used.add(c.id)}});
 return st.concat(pl.filter(p=>!used.has(p.id)))}
// ---------- league ----------
function newLeague(o){o=o||{};R={ver:1,uid:0,season:1,pl:[],t:[],sched:[],day:0,slen:o.slen||30,qlen:o.qlen||4,diff:o.diff||1,po:null,stage:null,news:[],hist:[],box:[],picks:[],pts:3,rot:{},fa:null,me:0};
 const cities=CITIES.slice().sort(()=>rnd()-.5),nicks=NICKS.slice().sort(()=>rnd()-.5);
 for(let i=0;i<30;i++)R.t.push({n:cities[i]+' '+nicks[i],ab:(cities[i].slice(0,3)).toUpperCase(),col:TCOL[i%TCOL.length],conf:i<15?0:1,w:0,l:0,pf:0,pa:0,strk:0});
 if(o.name){R.t[0].n=o.name;R.t[0].ab=o.name.split(' ')[0].slice(0,3).toUpperCase()}
 for(let t=0;t<30;t++){const lvl=60+gauss()*1.8;mkRoster(t,lvl)}
 for(let i=0;i<24;i++){const p=mkPlayer(pick(POS),ri(24,32),48+rnd()*10,6,-1);p.sal=MINSAL;R.pl.push(p)}
 R.sched=mkSchedule(R.slen);hSave();return R}
function mkRoster(t,lvl){const plan=[['PG',1],['SG',1],['SF',1],['PF',1],['C',1],['PG',.6],['SG',.6],['SF',.6],['PF',.6],['C',.6],['SG',.3],['SF',.3],['C',.3]];
 plan.forEach(([pos,q],i)=>{const star=i<5&&rnd()<.1?ri(5,10):0,age=ri(20,33),base=lvl+(q==1?2:q==.6?-5:-9)+star+gauss()*2.5;const p=mkPlayer(pos,age,base,ri(4,14),t);R.pl.push(p)})}
// a schedule where every team plays once per day
function mkSchedule(n){const ids=[...Array(30).keys()],days=[];let arr=ids.slice();for(let d=0;d<n;d++){if(d%29==0)arr=ids.slice().sort(()=>rnd()-.5);const r=d%29,fixed=arr[0],rest=arr.slice(1),rot=rest.slice(r).concat(rest.slice(0,r)),list=[fixed].concat(rot),g=[];
  for(let i=0;i<15;i++){const a=list[i],b=list[29-i];g.push(d%2?[a,b]:[b,a])}days.push(g)}return days}
function nextGame(){const d=R.sched[R.day];if(!d)return null;return d.find(g=>g[0]===0||g[1]===0)||null}
// ---------- saves and options ----------
const HKEY='hoops_save',OKEY='hoops_opt';
function hSave(){if(!R)return;R.saved=Date.now();const s=JSON.stringify(R);if(!lsSet(HKEY,s)){try{R.box=R.box.slice(-20);lsSet(HKEY,JSON.stringify(R))}catch(e){}}const old=lsGet(HKEY+'_b1');if(old)lsSet(HKEY+'_b2',old);lsSet(HKEY+'_b1',s)}
function hLoad(){try{const s=lsGet(HKEY);if(s){R=JSON.parse(s);return true}}catch(e){}return false}
let OPT={};try{OPT=JSON.parse(lsGet(OKEY))||{}}catch(e){}
const optSave=()=>lsSet(OKEY,JSON.stringify(OPT));
const HFEATS=[['On the court','meter','Shot meter','Hold Shoot and let go at the top of the meter for the best shot. Off: shots release automatically with average timing.'],
 ['On the court','sprint','Sprint','Hold Shift to sprint. It tires your player faster.'],
 ['On the court','fatigue','Fatigue','Players tire as they play and recover on the bench; tired players are slower and miss more.'],
 ['On the court','fouls','Fouls','Shooting fouls, reach-ins and blocking fouls; free throws, the bonus and fouling out.'],
 ['On the court','shotclk','Shot clock','24 seconds to shoot (14 after an offensive rebound).'],
 ['On the court','autoD','Auto-guard','When you are on defense and not touching the controls, your player keeps guarding his man.'],
 ['On the court','help','Help defense','Defenders rotate to stop drives to the basket.'],
 ['On the court','screens','Screens','Big men set screens for the ball handler (press F to call one).'],
 ['On the court','cross','Crossovers','Press R to cross over; defenders with worse perimeter D can stumble.'],
 ['On the court','alley','Alley-oops and dunks','Dunks for players who can, and alley-oop passes to cutting big men.'],
 ['On the court','realism','Realistic numbers','Shooting percentages, rebounds, turnovers and pace are tuned toward NBA averages.'],
 ['Presentation','crowd','Crowd and arena','A crowd, arena lights and a center-court logo.'],
 ['Presentation','sound','Sound','Bounces, swishes, the buzzer and the crowd.'],
 ['Presentation','labels','Player labels','Names and numbers over players.'],
 ['Presentation','tips','Tips','Short tips the first time you play.'],
 ['Franchise','dev','Player development','Young players improve during the season; training points upgrade a rating group with random boosts.'],
 ['Franchise','inj','Injuries','Players can get hurt and miss games.'],
 ['Franchise','trades','CPU trade offers','Other teams sometimes offer trades.'],
 ['Franchise','news','League news','Headlines from around the league.']];
const HDEFOFF=new Set(['p2']),MODEOFF=new Set(),feat=k=>!MODEOFF.has(k)&&(OPT[k]==null?!HDEFOFF.has(k):OPT[k]!==0);
