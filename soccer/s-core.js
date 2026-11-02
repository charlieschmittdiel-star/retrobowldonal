'use strict';
// Pitch Lab (soccer): core data. Players with detailed ratings in groups, positions and formations, 20 clubs,
// contracts, transfer values and saves. Completely separate from football and basketball (own saves, own code).
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=Math.random,ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)),pick=a=>a[Math.floor(rnd()*a.length)];
const gauss=()=>{let u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v);return true}catch(e){return false}},lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
// ---------- ratings ----------
const SG={pac:['Pace',['spd','acc','sta']],sho:['Shooting',['fin','lng','hd']],pas:['Passing',['shp','lpa','vis','crs']],dri:['Dribbling',['dri','ctl','agi']],def:['Defending',['tkl','mrk','int','str']],gk:['Goalkeeping',['div','han','pos','kic']]};
const SN={spd:'Speed',acc:'Acceleration',sta:'Stamina',fin:'Finishing',lng:'Long shots',hd:'Heading',shp:'Short passing',lpa:'Long passing',vis:'Vision',crs:'Crossing',dri:'Dribbling',ctl:'Ball control',agi:'Agility',tkl:'Tackling',mrk:'Marking',int:'Interceptions',str:'Strength',div:'Diving',han:'Handling',pos:'Positioning',kic:'Kicking'};
const SD={spd:'Top speed.',acc:'How fast he gets going.',sta:'How long he can keep running.',fin:'Scoring chances in and around the box.',lng:'Shots from distance.',hd:'Headers from crosses and corners.',shp:'Short, accurate passes.',lpa:'Long balls and switches of play.',vis:'Seeing the pass others miss.',crs:'Crosses from wide areas.',
 dri:'Beating players with the ball.',ctl:'First touch and keeping the ball.',agi:'Turning quickly.',tkl:'Winning the ball cleanly.',mrk:'Staying with his man.',int:'Reading and cutting out passes.',str:'Holding off and knocking off opponents.',div:'Reflex saves.',han:'Catching instead of spilling.',pos:'Being in the right place in goal.',kic:'Goal kicks and distribution.'};
const SK=Object.values(SG).flatMap(g=>g[1]);
const POS=['GK','CB','FB','CM','WG','ST'],POSN={GK:'Goalkeeper',CB:'Centre-back',FB:'Full-back',CM:'Midfielder',WG:'Winger',ST:'Striker'};
const OW={GK:{div:10,han:8,pos:9,kic:4,acc:1,str:1},
 CB:{tkl:9,mrk:9,int:8,str:7,hd:6,spd:3,acc:2,shp:4,ctl:3,lpa:2,sta:2},
 FB:{tkl:7,mrk:6,int:6,spd:7,acc:5,sta:6,crs:5,shp:4,dri:3,ctl:3,str:2},
 CM:{shp:9,lpa:6,vis:8,ctl:7,dri:4,sta:6,int:5,tkl:4,lng:4,fin:2,agi:3},
 WG:{spd:8,acc:8,dri:9,crs:7,ctl:6,agi:6,fin:4,shp:4,vis:3,lng:2},
 ST:{fin:10,hd:6,ctl:6,spd:6,acc:5,str:5,dri:5,lng:4,agi:3,shp:2}};
const PROF={GK:{div:22,han:20,pos:20,kic:12,fin:-30,lng:-25,hd:-20,shp:-10,lpa:-2,vis:-15,crs:-25,dri:-30,ctl:-15,agi:-10,tkl:-30,mrk:-30,int:-25,spd:-15,acc:-12,sta:-10},
 CB:{tkl:12,mrk:12,int:10,str:10,hd:8,fin:-15,lng:-10,dri:-12,crs:-10,agi:-6,vis:-8,div:-40,han:-40,pos:-40,kic:-30},
 FB:{tkl:6,mrk:5,int:5,spd:6,acc:5,sta:8,crs:5,fin:-12,hd:-4,lng:-8,div:-40,han:-40,pos:-40,kic:-30},
 CM:{shp:10,lpa:6,vis:9,ctl:7,sta:6,int:3,tkl:1,lng:3,hd:-6,crs:-2,div:-40,han:-40,pos:-40,kic:-30},
 WG:{spd:10,acc:10,dri:11,crs:8,agi:8,ctl:5,tkl:-12,mrk:-12,int:-8,str:-8,hd:-6,div:-40,han:-40,pos:-40,kic:-30},
 ST:{fin:12,hd:7,ctl:5,str:4,spd:4,lng:3,tkl:-14,mrk:-14,int:-10,crs:-8,div:-40,han:-40,pos:-40,kic:-30}};
const ovrOf=(p,mx)=>{const w=OW[p.pos],s=mx?p.mx:p.sk;let a=0,t=0;for(const k in w){a+=w[k]*s[k];t+=w[k]}return Math.round(a/t)};
const ovr=p=>ovrOf(p),pot=p=>ovrOf(p,1);
// formations: [position, x (0 own goal .. 1 their goal), y (0 left .. 1 right)]
const FORMS={'4-4-2':[['GK',.03,.5],['FB',.2,.12],['CB',.18,.38],['CB',.18,.62],['FB',.2,.88],['WG',.47,.12],['CM',.42,.38],['CM',.42,.62],['WG',.47,.88],['ST',.66,.4],['ST',.66,.6]],
 '4-3-3':[['GK',.03,.5],['FB',.2,.12],['CB',.18,.38],['CB',.18,.62],['FB',.2,.88],['CM',.38,.3],['CM',.34,.5],['CM',.38,.7],['WG',.62,.15],['ST',.68,.5],['WG',.62,.85]],
 '3-5-2':[['GK',.03,.5],['CB',.18,.28],['CB',.16,.5],['CB',.18,.72],['FB',.42,.08],['CM',.38,.33],['CM',.34,.5],['CM',.38,.67],['FB',.42,.92],['ST',.66,.4],['ST',.66,.6]],
 '4-2-3-1':[['GK',.03,.5],['FB',.2,.12],['CB',.18,.38],['CB',.18,.62],['FB',.2,.88],['CM',.33,.4],['CM',.33,.6],['WG',.55,.15],['CM',.52,.5],['WG',.55,.85],['ST',.7,.5]],
 '5-3-2':[['GK',.03,.5],['FB',.24,.08],['CB',.17,.3],['CB',.15,.5],['CB',.17,.7],['FB',.24,.92],['CM',.38,.3],['CM',.36,.5],['CM',.38,.7],['ST',.62,.4],['ST',.62,.6]]};
// ---------- names, clubs ----------
const FN=['James','Luca','Mateo','Kai','Diego','Noah','Leo','Marco','Theo','Hugo','Ivan','Jonas','Rafael','Sami','Tomas','Yusuf','Bruno','Adam','Elias','Felix','Kofi','Liam','Nico','Omar','Paulo','Ruben','Sven','Viktor','Andre','Dani','Emil','Gabriel','Hakim','Joao','Karim','Lars','Milo','Oscar','Pedro','Rui','Stefan','Tariq','Youssef','Zane','Arda','Ben','Callum','Dario','Enzo','Filip'];
const LN=['Silva','Muller','Rossi','Garcia','Kowalski','Dubois','Jensen','Okafor','Santos','Novak','Moreau','Fischer','Costa','Lindqvist','Ibrahim','Petrov','Walker','Hansen','Ferreira','Romero','Bauer','Diallo','Kovac','Larsen','Martin','Nakamura','Oliveira','Pereira','Quinn','Richter','Schmidt','Torres','Vidal','Wagner','Yilmaz','Zielinski','Brooks','Carvalho','Duarte','Eriksen','Fontaine','Gomez','Haas','Ito','Janssen','Keller','Lopez','Mendes','Nilsson','Orsini'];
const CITIES=['Harbor','Kingsport','Ashford','Riverton','Northgate','Westmoor','Eastbridge','Stonehaven','Millbrook','Redcliff','Lakeside','Oakridge','Brightwater','Ironvale','Greenfield','Highbury','Thornton','Silverton','Marston','Fairhaven'];
const SUFF=['United','City','Rovers','Athletic','Wanderers','Town','Albion','FC','Forest','Rangers','County','Villa','Olympic','Sporting','Dynamo','Real','Inter','Celtic','Borough','Spartans'];
const TCOL=[['#c8102e','#ffffff'],['#034694','#ffffff'],['#6cabdd','#1c2c5b'],['#fdb913','#231f20'],['#7a263a','#1bb1e7'],['#132257','#ffffff'],['#ee2737','#000000'],['#003399','#ffcc00'],['#00a650','#ffffff'],['#000000','#ffffff'],
 ['#f58220','#000000'],['#5a2d82','#ffd100'],['#d71920','#ffd700'],['#1e3a8a','#e11d48'],['#14532d','#fbbf24'],['#9f1239','#e2e8f0'],['#0e7490','#f8fafc'],['#4b5563','#f59e0b'],['#b45309','#1f2937'],['#7c3aed','#e5e7eb']];
// ---------- players and clubs ----------
let R=null;
function mkPlayer(pos,age,base,potRoom,tid){const pr=PROF[pos],sk={},mx={};
 SK.forEach(k=>{let v=base+(pr[k]||0)+gauss()*6;sk[k]=clamp(Math.round(v),20,97);const room=potRoom*(age<=21?1:age<=24?.65:age<=27?.25:.05)*(.6+rnd()*.8);mx[k]=clamp(Math.round(sk[k]+room),sk[k],99)});
 const mates=tid>=0?R.pl.filter(q=>q.tid===tid):[];let ln=pick(LN);for(let k=0;k<20&&mates.some(q=>q.ln===ln);k++)ln=pick(LN);
 const p={id:++R.uid,fn:pick(FN),ln,pos,age,ht:pos=='GK'||pos=='CB'?ri(183,197):ri(168,190),ft:rnd()<.75?'R':'L',sk,mx,tid,ss:newSS(),car:[],aw:[],num:0,inj:0};p.n=p.fn+' '+p.ln;p.sal=salFor(p);p.exp=R.season+ri(0,3);if(tid>=0)fixNum(p,tid);return p}
const SS=['gp','gs','min','g','a','sh','sot','pas','pac','tkl','int','sv','yc','rc','cs','rat'],SI={};SS.forEach((k,i)=>SI[k]=i);
const newSS=()=>SS.map(()=>0);
function salFor(p,o){o=o==null?ovr(p):o;const v=Math.max(0,o-45);return clamp(Math.round(Math.pow(v,2.1)/90*10)/10,.3,30)}   // millions per season
function valueOf(p){const o=ovr(p),pt=pot(p);return Math.max(.2,Math.round(Math.pow(Math.max(0,o-45),2.4)/60*(p.age<=21?1.6+(pt-o)/20:p.age<=25?1.2+(pt-o)/40:p.age<=29?1:p.age<=31?.7:.4)*10)/10)}
function fixNum(p,t){const used=new Set(R.pl.filter(q=>q.tid===t&&q!==p).map(q=>q.num));const pref=p.pos=='GK'?[1,13,12,31]:p.pos=='CB'?[4,5,6,15]:p.pos=='FB'?[2,3,12,22]:p.pos=='CM'?[8,6,10,14,16]:p.pos=='WG'?[7,11,17,19]:[9,10,18,20];
 if(p.num&&!used.has(p.num))return;for(const n of pref)if(!used.has(n)){p.num=n;return}for(let n=2;n<=40;n++)if(!used.has(n)){p.num=n;return}}
const teamPl=t=>R.pl.filter(p=>p.tid===t);
const payroll=t=>teamPl(t).reduce((a,p)=>a+p.sal,0);
// the starting eleven for a formation: the best player for each slot (by position fit), then the bench
function fitFor(p,pos){if(pos=='GK')return p.pos=='GK'?ovr(p):-99;if(p.pos=='GK')return -99;const near={CB:['FB'],FB:['CB','WG'],CM:['WG','ST'],WG:['FB','CM','ST'],ST:['WG','CM']};const o=ovrOf({pos,sk:p.sk});return p.pos==pos?o+2:near[pos].includes(p.pos)?o-2:o-8}
function lineup(t){const T=R.t[t],F=FORMS[T.form||'4-4-2'],pl=teamPl(t).filter(p=>!p.inj&&!(p.ban>0));const R0=R.xi&&R.xi[t];
 if(R0&&R0.length===11){const xi=R0.map(id=>pl.find(p=>p.id===id));if(xi.every(Boolean)){const rest=pl.filter(p=>!R0.includes(p.id)).sort((a,b)=>ovr(b)-ovr(a));return{xi,bench:rest.slice(0,7),slots:F}}}
 const used=new Set(),xi=[];F.forEach(([pos],i)=>{const c=pl.filter(p=>!used.has(p.id)).sort((a,b)=>fitFor(b,pos)-fitFor(a,pos))[0];xi[i]=c;if(c)used.add(c.id)});
 const bench=pl.filter(p=>!used.has(p.id)).sort((a,b)=>(b.pos=='GK'?1:0)-(a.pos=='GK'?1:0)||ovr(b)-ovr(a));const gk=bench.find(p=>p.pos=='GK');const b7=(gk?[gk]:[]).concat(bench.filter(p=>p!==gk)).slice(0,7);return{xi:xi.filter(Boolean),bench:b7,slots:F}}
function teamOvr(t){const L=lineup(t).xi;return L.length?Math.round(L.reduce((a,p,i)=>a+fitFor(p,FORMS[R.t[t].form||'4-4-2'][i][0]),0)/L.length):50}
// ---------- the league ----------
function newLeague(o){o=o||{};R={ver:1,sport:'soccer',uid:0,season:1,pl:[],t:[],sched:[],day:0,rounds:o.rounds||2,hlen:o.hlen||4,diff:o.diff==null?1:o.diff,news:[],hist:[],box:[],pts:3,xi:{},stage:null,cup:null,me:0,cash:o.cash||40};
 const cities=CITIES.slice().sort(()=>rnd()-.5),suff=SUFF.slice().sort(()=>rnd()-.5);
 for(let i=0;i<20;i++){const n=cities[i]+' '+suff[i];R.t.push({n,ab:cities[i].slice(0,3).toUpperCase(),col:TCOL[i%TCOL.length],form:pick(['4-4-2','4-3-3','4-2-3-1','4-4-2','3-5-2']),w:0,d:0,l:0,gf:0,ga:0,form5:[],bud:20+rnd()*40})}
 if(o.name){R.t[0].n=o.name;R.t[0].ab=o.name.replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()||'YOU'}
 const lvls=[...Array(20).keys()].map(i=>58+gauss()*2.4+(i<3?3:i>16?-2:0)).sort(()=>rnd()-.5);
 for(let t=0;t<20;t++)mkSquad(t,lvls[t]);
 for(let i=0;i<30;i++){const p=mkPlayer(pick(POS),ri(22,32),46+rnd()*10,5,-1);p.sal=.4;R.pl.push(p)}
 R.sched=mkSchedule(R.rounds);hSave();return R}
function mkSquad(t,lvl){const plan=[['GK',1],['GK',.4],['CB',1],['CB',1],['CB',.5],['FB',1],['FB',1],['FB',.5],['CM',1],['CM',1],['CM',.8],['CM',.5],['WG',1],['WG',1],['WG',.5],['ST',1],['ST',.9],['ST',.5],['CM',.3],['CB',.3],['WG',.3],['GK',.2]];
 plan.forEach(([pos,q],i)=>{const star=q==1&&rnd()<.08?ri(5,10):0,age=ri(18,33),base=lvl+(q==1?2:q>=.8?0:q>=.5?-4:-8)+star+gauss()*2.5;R.pl.push(mkPlayer(pos,age,base,ri(4,16),t))})}
// a double round robin: every team plays every other twice (home and away), one match per team per round
function mkSchedule(rounds){const n=20;let arr=[...Array(n).keys()].sort(()=>rnd()-.5);const first=[];
 for(let d=0;d<n-1;d++){const g=[];for(let i=0;i<n/2;i++){const a=arr[i],b=arr[n-1-i];g.push((d+i)%2?[a,b]:[b,a])}first.push(g);arr=[arr[0]].concat([arr[n-1]],arr.slice(1,n-1))}
 const days=[];for(let leg=0;leg<rounds;leg++)first.forEach(g=>days.push(leg%2?g.map(([a,b])=>[b,a]):g.map(x=>x.slice())));return days}
function nextGame(){const d=R.sched[R.day];if(!d)return null;return d.find(g=>g[0]===0||g[1]===0)||null}
// ---------- saves and options ----------
const HKEY='soccer_save',OKEY='soccer_opt';
function slotKey(){return OPT.slot>1?HKEY+'_'+OPT.slot:HKEY}
function hSave(){if(!R)return;R.saved=Date.now();const k=slotKey(),s=JSON.stringify(R);if(!lsSet(k,s)){try{R.box=R.box.slice(-20);lsSet(k,JSON.stringify(R))}catch(e){}}const old=lsGet(k+'_b1');if(old)lsSet(k+'_b2',old);lsSet(k+'_b1',s)}
function hLoad(){try{const s=lsGet(slotKey());if(s){R=JSON.parse(s);return true}}catch(e){}return false}
let OPT={};try{OPT=JSON.parse(lsGet(OKEY))||{}}catch(e){}
const optSave=()=>lsSet(OKEY,JSON.stringify(OPT));
const HFEATS=[['On the pitch','meter','Shot power','Hold Shoot for more power; let go in the green for the best shot. Off: one tap, average power.'],
 ['On the pitch','sprint','Sprint','Hold Shift to sprint. It tires your player.'],
 ['On the pitch','fatigue','Fatigue','Players tire over the match; tired players are slower and less accurate.'],
 ['On the pitch','fouls','Fouls and cards','Fouls, free kicks, penalties, yellow and red cards.'],
 ['On the pitch','offside','Offside','Attackers past the last defender when the ball is played are offside.'],
 ['On the pitch','autoSw','Auto-switch','On defense you automatically control the player closest to the ball.'],
 ['On the pitch','press','Pressing AI','Teams press the ball as a unit and keep their shape.'],
 ['On the pitch','realism','Realistic numbers','Shots, saves, passes and goals tuned toward real league averages.'],
 ['Presentation','crowd','Crowd and stadium','Stands, fans and stadium lights.'],
 ['Presentation','sound','Sound','Kicks, whistles, nets and the crowd.'],
 ['Presentation','labels','Player labels','Names over players.'],
 ['Presentation','radar','Radar','A small map of the whole pitch.'],
 ['Presentation','tips','Tips','Short tips the first time you play.'],
 ['Franchise','dev','Player development','Young players improve during the season; training points upgrade a rating group with random boosts.'],
 ['Franchise','inj','Injuries','Players can get hurt and miss matches.'],
 ['Franchise','news','League news','Headlines from around the league.']];
const HDEFOFF=new Set(),feat=k=>OPT[k]==null?!HDEFOFF.has(k):OPT[k]!==0;
