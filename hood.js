'use strict';
// The Neighborhood (career mode): a small top-down town you walk around between games, using your career money.
// This update (stage 1): the map and walking, the shops (clothes, sports store, diner, gym, sports agency), a weekly
// take-home paycheck from your salary, and a wallet with your money history. The car dealer and the pickup courts
// are on the map already but open in later updates.
// Gear and meals give small boosts during real games only (never in drills or practice, and never to your real
// ratings or ceilings). Shop and brand names are made up. This file wraps existing functions and leaves the
// originals alone. Load it after life.js.
{const add=[['Career','hood','Neighborhood map','Between games, walk around a small town with WASD. Your career money is spent here, and you get a weekly take-home slice of your salary.'],
 ['Career','shops','Neighborhood shops','Clothes, game-day gear, food, a gym and a sports agency in the Neighborhood. Gear and meals give small boosts in games (+1 to +3), never in drills.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const HD_TAKE=.10;                                   // share of your salary that reaches your wallet (after taxes, agent and living costs)
// ---------- save data (made the first time it's needed, so old saves keep working) ----------
function HDS(){if(!R.hood||typeof R.hood!='object')R.hood={};const h=R.hood;if(!Array.isArray(h.log))h.log=[];if(!h.own||typeof h.own!='object')h.own={tee:1};
 if(!h.look||typeof h.look!='object')h.look={top:'tee'};if(!h.eq||typeof h.eq!='object')h.eq={};if(h.meal===undefined)h.meal=null;h.wk=h.wk||0;return h}
const HM$=v=>{v=+v||0;const a=Math.abs(v),s=v<0?'-':'';return a>=1?`${s}$${a.toFixed(a>=10?1:2)}M`:`${s}$${Math.round(a*1000)}K`};
const hdC=v=>Math.round(v*100)/100;                 // keep money on the same $10K steps the rest of the career uses
const hdWeekTxt=()=>R.stage?'Offseason':R.lg&&R.lg.po?'Playoffs':`Week ${(R.lg?R.lg.wk:0)+1}`;
const hdPayWk=()=>{const p=meRow();return p?hdC(p.sal*HD_TAKE/(typeof slen=='function'?slen():17)):0};
// ---------- the wallet: every change to your money gets a line ----------
function hdPush(t,v){const h=HDS();h.log.unshift({s:R.season,w:hdWeekTxt(),t,v:hdC(v),b:hdC(R.money||0)});if(h.log.length>80)h.log.length=80}
// money that changed outside the Neighborhood (sponsors, events, storylines) gets one line
function hdSync(){const h=HDS(),m=R.money||0;if(h.bal==null){h.bal=m;return}const d=hdC(m-h.bal);if(Math.abs(d)>=.005)hdPush('Sponsors, events and stories',d);h.bal=m}
function hdPay(t,v){hdSync();R.money=hdC((R.money||0)+v);HDS().bal=R.money;hdPush(t,v)}
const hdCan=v=>(R.money||0)>=v-1e-9;
// ---------- what's for sale ----------
// clothes (looks only; a couple of flashy items make you a bit more famous when you buy them)
const HD_WEAR={tee:['top','Plain tee','#e5e7eb',0,'What you showed up in.'],hoodie:['top','Gray hoodie','#6b7280',.02,'Comfy.'],team:['top','Team jacket','team',.04,'In your team\'s colors.'],
 denim:['top','Denim jacket','#3b5b8c',.05,'A classic.'],track:['top','Purple tracksuit','#7c3aed',.06,'Fast even standing still.'],suit:['top','Sharp suit','#111827',.15,'For press conferences. +1 fame when you buy it.',1],
 coat:['top','Designer coat','#b45309',.4,'Everyone notices. +2 fame when you buy it.',2],cap:['hat','Ball cap','team',.01,'Team colors.'],beanie:['hat','Red beanie','#dc2626',.01,'Warm.'],
 bucket:['hat','Bucket hat','#d6c9a3',.02,'Sunny days.'],cowboy:['hat','Cowboy hat','#8b5a2b',.04,'Yeehaw.'],shades:['face','Sunglasses','#111827',.03,'Cool.'],
 chain:['neck','Gold chain','#facc15',.3,'Shiny. +2 fame when you buy it.',2]};
const HD_SLOTW={top:'Tops',hat:'Hats',face:'Eyewear',neck:'Jewelry'};
// game-day gear: one per slot, boosts only during real games
const HD_GEAR={cl1:['feet','Speed cleats',.12,{spd:1,acc:1}],cl2:['feet','Pro cleats',.45,{spd:2,agi:1}],
 gl1:['hands','Grip gloves',.09,{cth:1,cit:1}],gl2:['hands','QB gloves',.12,{sac:1,tor:1}],gl3:['hands','Lineman gloves',.1,{pow:1,bsh:1,prp:1}],
 sl1:['arm','Arm sleeve',.15,{tpw:1,dac:1}],sl2:['arm','Padded sleeve',.1,{btk:1,tak:1}],
 vz1:['head','Tinted visor',.1,{vis:2,prc:1,cvi:1}],vz2:['head','Pro helmet',.3,{hpw:1,bsc:1,pkt:1}],
 pd1:['body','Light pads',.08,{agi:1,sta:1}],pd2:['body','Pro shoulder pads',.3,{pow:2,btk:1,hpw:1}]};
const HD_SLOTG={feet:'Feet',hands:'Hands',arm:'Arms',head:'Head',body:'Body'};
// diner: one meal at a time, for your next game (simmed games use it up too)
const HD_MEAL={pan:['Pancake stack',.01,{sta:2},'Carbs for the fourth quarter.'],pasta:['Pasta night',.01,{sta:3},'Lots of carbs.'],smoo:['Green smoothie',.01,{acc:1},'Quick feet.'],
 chick:['Grilled chicken plate',.02,{pow:1,sta:1},'Lean and strong.'],steak:['Steak dinner',.03,{pow:1,spd:1},'The big pregame meal.']};
// training perks (the ones from the Fame & sponsors page) by shop
const HD_PERKAT={gym:['trainer','trainer2','speed','gym','rehab'],sports:['poscoach','film'],agency:['agent']};
// ---------- game-day boosts ----------
let HDB=null;                                        // {id, s:{stat:+n}} while you play a real game
const hdReal=()=>!!(G&&G.live&&!G.drill&&!G.prac&&!G.chal&&!G.tut);
function hdBonus(){if(!feat('shops')||!feat('hood')||!CAR()||!R.me||!R.hood)return null;const h=R.hood,s={},add=b=>{for(const k in b)s[k]=Math.min(3,(s[k]||0)+b[k])};
 Object.keys(h.eq||{}).forEach(sl=>{const id=h.eq[sl],g=HD_GEAR[id];if(g&&h.own[id])add(g[3])});if(h.meal&&HD_MEAL[h.meal])add(HD_MEAL[h.meal][2]);return Object.keys(s).length?{id:R.me,s}:null}
{const _su=setup;setup=function(...a){const r=_su.apply(this,a);try{HDB=hdReal()?hdBonus():null;if(HDB&&HDB.s.spd){const me=careerMe();if(me&&me.sk){const s0=me.sk.spd;me.sk=Object.assign({},me.sk,{spd:Math.min(99,s0+HDB.s.spd)});me.spd*=(5.6+me.sk.spd*.03)/(5.6+s0*.03)}}}catch(e){console.error(e)}return r}}
{const _sg=startGame;startGame=function(...a){const r=_sg.apply(this,a);try{HDB=hdReal()?hdBonus():null}catch(e){console.error(e)}return r}}
{const _fs=fs;fs=function(p,s){const v=_fs(p,s);if(HDB&&p&&p.pid===HDB.id&&G&&G.live){const b=HDB.s[s];if(b)return Math.min(99,v+b)}return v}}
// ---------- after every game (played or simmed): paycheck, meal used up ----------
{const _cx=careerXP;careerXP=function(s,won,sim,...a){const r=_cx.call(this,s,won,sim,...a);try{if(CAR()&&R.me&&feat('hood')){const h=HDS();h.wk++;hdSync();
  if(!R.lg.po&&!R.stage){const v=hdPayWk();if(v>0)hdPay('Paycheck (take-home)',v)}if(h.meal)h.meal=null}}catch(e){console.error(e)}return r}}
// the Fame & sponsors page's own shop (used when the Neighborhood or its shops are off) also writes to the wallet
{const _pb=perkBuy;perkBuy=function(k,...a){const on=feat('hood')&&CAR()&&R.me,b=R.money||0;if(on)hdSync();const r=_pb.call(this,k,...a);
 try{if(on){const d=hdC((R.money||0)-b);if(d<0){const P0=PERKS.find(x=>x[0]==k);HDS().bal=R.money;hdPush(`Bought: ${P0?P0[1]:k}`,d);save();lifeUI(`${P0?P0[1]:k}: done.`)}}}catch(e){console.error(e)}return r}}
// ---------- the town map ----------
const HDW=2400,HDH=1600;
const HDBLD=[{k:'home',n:'Your place',ic:'🏠',x:140,y:470,w:220,h:210,door:'s',roof:'#7c2d12'},
 {k:'clothes',n:'Threadline Clothing',ic:'👕',x:430,y:490,w:260,h:190,door:'s',roof:'#be185d'},
 {k:'sports',n:'Pro Shop Sports',ic:'🏈',x:760,y:460,w:290,h:220,door:'s',roof:'#1d4ed8'},
 {k:'diner',n:'Corner Diner',ic:'🍔',x:1260,y:500,w:230,h:180,door:'s',roof:'#b91c1c'},
 {k:'gym',n:'Northside Gym',ic:'🏋️',x:1550,y:440,w:320,h:240,door:'s',roof:'#374151'},
 {k:'agency',n:'Summit Sports Agency',ic:'💼',x:1940,y:500,w:240,h:180,door:'s',roof:'#0f766e'},
 {k:'cars',n:'Miller Motors',ic:'🚗',x:180,y:830,w:440,h:210,door:'n',roof:'#475569',soon:'The car dealer opens in the next update.'}];
const HDHOUSE=[[90,110],[330,110],[570,110],[810,110],[1270,110],[1510,110],[1760,110],[2010,110],[90,1380],[330,1380],[570,1380],[810,1380]].map(([x,y],i)=>({x,y,w:170,h:150,roof:['#9a3412','#475569','#166534','#7c2d12','#1e3a8a','#6b21a8','#92400e','#334155','#0f766e','#7f1d1d','#3f6212','#4c1d95'][i]}));
const HDCARS=[[700,860,'#dc2626'],[700,960,'#2563eb'],[700,1060,'#f8fafc'],[880,860,'#111827'],[880,960,'#facc15'],[880,1060,'#16a34a']].map(([x,y,c])=>({x,y,w:110,h:56,c}));
const HDZONE=[{k:'court',n:'Pickup basketball',x:1300,y:900,w:300,h:180},{k:'pitch',n:'Pickup soccer',x:1680,y:890,w:420,h:240},{k:'field',n:'Pickup football',x:1320,y:1200,w:560,h:260}];
const HDTREE=(()=>{const t=[],sd={v:11},r=()=>(sd.v=(sd.v*16807)%2147483647)/2147483647;
 [[60,400],[400,400],[720,400],[1240,420],[1500,400],[1900,420],[2250,420],[2330,620],[60,620],[2330,300],[1245,330],[1030,320],[2200,1570],[1265,1570],[1650,1560],[1960,1565],[2330,1000],[2330,1260],
  [1268,868],[1268,1120],[2200,1080],[2010,1290],[2180,1300],[2250,1450],[1960,1430],[660,1570],[300,1570],[60,1100],[60,900],[120,1170],[1040,1450],[1050,1200],[640,1185],[2260,880]].forEach(([x,y])=>t.push({x:x+(r()-.5)*20,y:y+(r()-.5)*20,r:20+r()*10}));return t})();
const HDNPCW=[[20,689,2380,689],[20,801,2380,801],[1089,20,1089,1580],[1201,20,1201,1580],[20,1249,1070,1249],[1240,1170,2360,1170]];
const hdDoor=b=>[b.x+b.w/2,b.door=='n'?b.y-14:b.y+b.h+14];
function hdSolid(x,y,rad){if(x<rad||y<rad||x>HDW-rad||y>HDH-rad)return true;
 const box=o=>x>o.x-rad&&x<o.x+o.w+rad&&y>o.y-rad&&y<o.y+o.h+rad;if(HDBLD.some(box)||HDHOUSE.some(box)||HDCARS.some(box))return true;
 return HDTREE.some(t=>Math.hypot(x-t.x,y-t.y)<rad+t.r*.45)}
// ---------- drawing the town once (roads, buildings, park) ----------
let HD_BAKE=null;
function hdRR(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function hdSign(g,x,y,txt,sz,bg){g.font=`bold ${sz}px "Trebuchet MS",sans-serif`;const w=g.measureText(txt).width+sz*1.2;g.fillStyle=bg||'#0b1626dd';hdRR(g,x-w/2,y-sz*.95,w,sz*1.7,sz*.4);g.fill();
 g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,x,y-sz*.1)}
function hdBake(){if(HD_BAKE)return HD_BAKE;const c=document.createElement('canvas');c.width=HDW;c.height=HDH;const g=c.getContext('2d');if(!g||!g.fillRect)return c;
 const sd={v:7},r=()=>(sd.v=(sd.v*16807)%2147483647)/2147483647,F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 F('#4b8a3e',0,0,HDW,HDH);for(let i=0;i<6000;i++)F(r()<.5?'#559749':'#437e38',r()*HDW,r()*HDH,3+r()*5,2+r()*3);
 // park
 g.fillStyle='#5ea34f';hdRR(g,1240,840,1120,700,26);g.fill();g.strokeStyle='#3f7a35';g.lineWidth=4;g.stroke();
 g.strokeStyle='#d8cba5';g.lineWidth=26;g.lineCap='round';g.beginPath();g.moveTo(1250,1170);g.lineTo(2350,1170);g.moveTo(1640,850);g.lineTo(1640,1530);g.stroke();g.lineCap='butt';
 // basketball court
 {const z=HDZONE[0];F('#2f5f86',z.x,z.y,z.w,z.h);g.strokeStyle='#f8fafc';g.lineWidth=3;g.strokeRect(z.x+8,z.y+8,z.w-16,z.h-16);g.beginPath();g.moveTo(z.x+z.w/2,z.y+8);g.lineTo(z.x+z.w/2,z.y+z.h-8);g.stroke();
  g.beginPath();g.arc(z.x+z.w/2,z.y+z.h/2,26,0,7);g.stroke();[[z.x+8,1],[z.x+z.w-8,-1]].forEach(([x,d])=>{F('#c2410c',d>0?x:x-56,z.y+z.h/2-30,56,60);g.strokeRect(d>0?x:x-56,z.y+z.h/2-30,56,60);
   g.beginPath();g.arc(x,z.y+z.h/2,72,d>0?-Math.PI/2:Math.PI/2,d>0?Math.PI/2:Math.PI*1.5);g.stroke();F('#e5e7eb',x+d*2-3,z.y+z.h/2-14,6,28);g.strokeStyle='#f97316';g.beginPath();g.arc(x+d*14,z.y+z.h/2,7,0,7);g.stroke();g.strokeStyle='#f8fafc'})}
 // soccer pitch
 {const z=HDZONE[1];for(let i=0;i<8;i++)F(i%2?'#3f9a45':'#48a84e',z.x+i*z.w/8,z.y,z.w/8+1,z.h);g.strokeStyle='#f8fafc';g.lineWidth=3;g.strokeRect(z.x+8,z.y+8,z.w-16,z.h-16);
  g.beginPath();g.moveTo(z.x+z.w/2,z.y+8);g.lineTo(z.x+z.w/2,z.y+z.h-8);g.stroke();g.beginPath();g.arc(z.x+z.w/2,z.y+z.h/2,34,0,7);g.stroke();
  [[z.x+8,1],[z.x+z.w-8,-1]].forEach(([x,d])=>{g.strokeRect(d>0?x:x-50,z.y+z.h/2-50,50,100);g.lineWidth=5;g.strokeRect(d>0?x-12:x,z.y+z.h/2-28,12,56);g.lineWidth=3})}
 // football sandlot
 {const z=HDZONE[2];F('#4f9a43',z.x,z.y,z.w,z.h);F('#1d4ed8aa',z.x,z.y,46,z.h);F('#b91c1caa',z.x+z.w-46,z.y,46,z.h);g.fillStyle='#f8fafc';
  for(let x=z.x+46;x<=z.x+z.w-46;x+=42)F('#f8fafcbb',x-1,z.y+6,3,z.h-12);g.strokeStyle='#f8fafc';g.lineWidth=3;g.strokeRect(z.x+2,z.y+2,z.w-4,z.h-4)}
 HDZONE.forEach(z=>hdSign(g,z.x+z.w/2,z.y-16,`${z.n} · coming soon`,15,'#5b3a1ecc'));
 // parking lot and parked cars (decoration for now)
 F('#4b5058',680,840,400,330);g.strokeStyle='#e5e7ebaa';g.lineWidth=2;for(let y=840;y<=1170;y+=100){g.beginPath();g.moveTo(690,y);g.lineTo(820,y);g.moveTo(860,y);g.lineTo(1000,y);g.stroke()}
 HDCARS.forEach(o=>hdCarTop(g,o.x+o.w/2,o.y+o.h/2,0,o.c));
 // sidewalks, then roads
 const SW='#bdb6a4';F(SW,0,678,HDW,22);F(SW,0,790,HDW,22);F(SW,1078,0,22,HDH);F(SW,1190,0,22,HDH);F(SW,0,1238,1078,22);F(SW,0,1330,1078,22);
 g.fillStyle='#a8a190';for(let x=0;x<HDW;x+=34){g.fillRect(x,678,1,22);g.fillRect(x,790,1,22)}for(let y=0;y<HDH;y+=34){g.fillRect(1078,y,22,1);g.fillRect(1190,y,22,1)}
 const RD='#3b3f45';F(RD,0,700,HDW,90);F(RD,1100,0,90,HDH);F(RD,0,1260,1100,70);
 g.fillStyle='#facc15';for(let x=10;x<HDW;x+=60)if(x<1070||x>1200)g.fillRect(x,743,32,4);for(let y=10;y<HDH;y+=60)if(y<690||y>800)g.fillRect(1143,y,4,32);for(let x=10;x<1070;x+=60)g.fillRect(x,1293,32,4);
 g.fillStyle='#e5e7eb';for(let i=0;i<7;i++){g.fillRect(1104+i*12,680,7,18);g.fillRect(1104+i*12,792,7,18);g.fillRect(1080,704+i*12,18,7);g.fillRect(1192,704+i*12,18,7)}
 // houses
 HDHOUSE.forEach(o=>{F('#00000033',o.x+6,o.y+8,o.w,o.h);F('#e7dcc7',o.x,o.y+o.h-34,o.w,34);F('#94a3b8',o.x+20,o.y+o.h-26,26,16);F('#94a3b8',o.x+o.w-46,o.y+o.h-26,26,16);F('#5b3a1e',o.x+o.w/2-12,o.y+o.h-30,24,30);
  F(o.roof,o.x-6,o.y,o.w+12,o.h-34);g.fillStyle='#00000026';g.fillRect(o.x-6,o.y+(o.h-34)/2,o.w+12,(o.h-34)/2);g.fillStyle='#ffffff22';g.fillRect(o.x-6,o.y+(o.h-34)/2-2,o.w+12,3)});
 // shops
 HDBLD.forEach(b=>{const n=b.door=='n',wy=n?b.y:b.y+b.h-38,ry=n?b.y+38:b.y;F('#00000040',b.x+8,b.y+10,b.w,b.h);F(b.roof,b.x,ry,b.w,b.h-38);g.strokeStyle='#00000055';g.lineWidth=4;g.strokeRect(b.x+2,ry+2,b.w-4,b.h-42);
  g.fillStyle='#ffffff14';for(let x=b.x+14;x<b.x+b.w-10;x+=22)g.fillRect(x,ry+6,2,b.h-50);
  F('#efe6d2',b.x,wy,b.w,38);for(let x=b.x+14;x<b.x+b.w-34;x+=46)if(Math.abs(x+13-(b.x+b.w/2))>40)F('#7dd3fc',x,wy+9,26,18);
  F('#3f2a1a',b.x+b.w/2-20,wy+(n?0:6),40,32);F('#fbbf24',b.x+b.w/2+12,wy+(n?14:20),4,4);
  for(let i=0;i<6;i++)F(i%2?'#ffffff':b.roof,b.x+b.w/2-36+i*12,n?wy+32:wy-6,12,8);
  hdSign(g,b.x+b.w/2,ry+(b.h-38)/2,`${b.ic} ${b.n}`,b.w<250?16:19)});
 // trees and lamps
 HDTREE.forEach(t=>{g.fillStyle='#00000030';g.beginPath();g.ellipse(t.x+6,t.y+8,t.r,t.r*.8,0,0,7);g.fill();g.fillStyle='#2f6b2a';g.beginPath();g.arc(t.x,t.y,t.r,0,7);g.fill();
  g.fillStyle='#3c8a35';g.beginPath();g.arc(t.x-t.r*.25,t.y-t.r*.25,t.r*.65,0,7);g.fill();g.fillStyle='#4ea544';g.beginPath();g.arc(t.x-t.r*.35,t.y-t.r*.4,t.r*.3,0,7);g.fill()});
 for(let x=120;x<HDW;x+=260)[690,800].forEach(y=>{if(Math.abs(x-1145)<80)return;g.fillStyle='#1f2937';g.beginPath();g.arc(x,y,4,0,7);g.fill();g.fillStyle='#fde68a55';g.beginPath();g.arc(x,y,9,0,7);g.fill()});
 HD_BAKE=c;return c}
// a car seen from above (used for the dealer lot now, and for driving later)
function hdCarTop(g,x,y,a,col){g.save();g.translate(x,y);g.rotate(a);g.fillStyle='#00000040';hdRR(g,-50,-22,104,50,12);g.fill();g.fillStyle=col;hdRR(g,-52,-25,104,50,12);g.fill();
 g.fillStyle='#1e293bdd';hdRR(g,6,-19,20,38,5);g.fill();hdRR(g,-34,-18,14,36,5);g.fill();g.fillStyle='#00000022';hdRR(g,-18,-20,22,40,4);g.fill();
 g.fillStyle='#fef9c3';g.fillRect(46,-20,5,9);g.fillRect(46,11,5,9);g.fillStyle='#b91c1c';g.fillRect(-52,-20,4,8);g.fillRect(-52,12,4,8);g.restore()}
// a person seen from above, facing angle a (0 = right)
function hdPerson(g,x,y,a,ph,o){g.save();g.translate(x,y);g.scale(1.2,1.2);g.fillStyle='#00000038';g.beginPath();g.ellipse(2,5,14,9,0,0,7);g.fill();
 if(o.ring){g.strokeStyle=o.ring;g.lineWidth=2.5;g.beginPath();g.arc(0,2,17,0,7);g.stroke()}
 g.rotate(a);const sw=Math.sin(ph)*5;g.fillStyle=o.pants||'#1f2937';g.fillRect(-4+sw,-8,9,5);g.fillRect(-4-sw,3,9,5);
 g.fillStyle=o.shirt;g.beginPath();g.ellipse(0,0,8,12.5,0,0,7);g.fill();if(o.top=='suit'){g.fillStyle='#f8fafc';g.beginPath();g.moveTo(3,-3);g.lineTo(8,0);g.lineTo(3,3);g.fill()}
 g.fillStyle=o.skin;g.beginPath();g.arc(-sw*.7,-12,3.4,0,7);g.arc(sw*.7,12,3.4,0,7);g.fill();
 if(o.chain){g.strokeStyle='#facc15';g.lineWidth=2;g.beginPath();g.arc(1,0,8.5,-1.1,1.1);g.stroke()}
 g.fillStyle=o.skin;g.beginPath();g.arc(1,0,7,0,7);g.fill();g.fillStyle=o.hair;g.beginPath();g.arc(0,0,7,Math.PI*.55,Math.PI*1.45);g.fill();
 if(o.hat){g.fillStyle=o.hatC;if(o.hat=='cap'){g.beginPath();g.arc(0,0,7.4,0,7);g.fill();g.beginPath();g.ellipse(7,0,4.5,5.5,0,-Math.PI/2,Math.PI/2);g.fill()}
  else if(o.hat=='cowboy'){g.beginPath();g.ellipse(0,0,13,11,0,0,7);g.fill();g.fillStyle='#00000030';g.beginPath();g.arc(0,0,6,0,7);g.fill()}
  else if(o.hat=='bucket'){g.beginPath();g.arc(0,0,10,0,7);g.fill();g.fillStyle='#00000020';g.beginPath();g.arc(0,0,6.5,0,7);g.fill()}
  else{g.beginPath();g.arc(0,0,7.6,0,7);g.fill();g.fillStyle='#ffffff30';g.fillRect(-7,-1,14,2)}}
 if(o.shades){g.fillStyle='#0b0f17';g.fillRect(5,-5,3,10)}g.restore()}
// ---------- the live map ----------
let HD=null;const HDK={};
function hdLook(){const p=meRow(),h=HDS(),hs=hsh(p?p.id:1),pick=(a,n)=>a[(hs>>>n)%a.length],tc=teamCol(0),col=c=>c=='team'?tc[0]:c,lk=h.look,t=HD_WEAR[lk.top]||HD_WEAR.tee,ht=lk.hat&&HD_WEAR[lk.hat];
 return{skin:pick(['#f2d0b1','#e0ac85','#c68863','#a86b4a','#8a5536','#6b3f26','#4d2c1b'],3),hair:pick(['#1f1a17','#3b2414','#6b4423','#a16b2c','#d9b25c','#2b2b2b','#7a7a7a'],7),
  shirt:col(t[2]),top:lk.top,hat:ht?lk.hat:null,hatC:ht?col(ht[2]):null,shades:!!lk.face,chain:!!lk.neck,ring:tc[0],pants:lk.top=='suit'?'#111827':lk.top=='track'?'#5b21b6':'#1f2937'}}
function hdNpcs(){const out=[],cols=['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#f8fafc','#64748b','#14b8a6','#84cc16'],sk=['#f2d0b1','#e0ac85','#c68863','#a86b4a','#8a5536','#6b3f26'],hr=['#1f1a17','#3b2414','#a16b2c','#d9b25c','#7a7a7a'];
 for(let i=0;i<14;i++){const w=HDNPCW[i%HDNPCW.length],f=rnd(),x=w[0]+(w[2]-w[0])*f,y=w[1]+(w[3]-w[1])*f;
  out.push({w,f,d:rnd()<.5?1:-1,sp:45+rnd()*35,x,y,a:0,ph:rnd()*6,stop:0,say:'',sayT:0,cool:2+rnd()*6,o:{shirt:cols[i%cols.length],skin:sk[(rnd()*sk.length)|0],hair:hr[(rnd()*hr.length)|0],hat:rnd()<.25?'cap':null,hatC:cols[(i+3)%cols.length],pants:rnd()<.5?'#1f2937':'#334155'}})}return out}
function hoodUI(){if(!CAR()||!R.me)return careerHub();if(G&&G.live)return;
 if(!feat('hood'))return modal(`<h1>Neighborhood</h1><p>The Neighborhood map is switched off on the Game features page.</p>`);
 try{if(G&&G.drill&&typeof trEnd=='function')trEnd()}catch(e){}
 const h=HDS();hdSync();if(!h.look.top||!HD_WEAR[h.look.top]||!h.own[h.look.top])h.look.top='tee';
 let el=$('hood');if(el)el.remove();el=document.createElement('div');el.id='hood';
 el.innerHTML='<canvas id="hdc"></canvas><div id="hdhud"></div><div id="hdkeys">WASD walk · Shift run · ↑ ↓ juke · ← → spin · E go inside · H wallet · Esc back to your career</div><div id="hdmsg"></div><div id="hdpan" hidden></div>';
 document.body.appendChild(el);for(const k in HDK)HDK[k]=0;try{for(const k in keys)keys[k]=0}catch(e){}
 const home=HDBLD[0],d=hdDoor(home),pos=Array.isArray(h.pos)&&!hdSolid(h.pos[0],h.pos[1],10)?h.pos:[d[0],d[1]+10];
 HD={on:1,cv:$('hdc'),me:{x:pos[0],y:pos[1],a:Math.PI/2,ph:0,mv:0,jk:0,jx:0,jy:0,spin:0},npc:hdNpcs(),pan:null,near:null,zone:null,t:0,last:0,hudT:9,look:hdLook(),msgT:0,cam:[0,0],Z:1};
 hdResize();hdHud();hdToast(h.log.length?`Welcome back. You have ${HM$(R.money||0)}.`:`Welcome to the Neighborhood. Walk with WASD, press E at a door to go inside.`);
 requestAnimationFrame(hdFrame)}
function hoodClose(){if(!HD)return;const h=HDS();h.pos=[Math.round(HD.me.x),Math.round(HD.me.y)];HD.on=0;HD=null;const el=$('hood');if(el)el.remove();for(const k in HDK)HDK[k]=0;save();careerHub()}
function hdResize(){if(!HD)return;const c=HD.cv,dpr=Math.min(2,globalThis.devicePixelRatio||1),w=innerWidth,h=innerHeight;c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.width=w+'px';c.style.height=h+'px';HD.dpr=dpr;HD.Z=clamp(Math.min(w/1150,h/680),.75,1.5)}
addEventListener('resize',()=>{try{hdResize()}catch(e){}});
function hdFrame(ts){if(!HD||!HD.on)return;const dt=HD.last?Math.min(.05,(ts-HD.last)/1000):0;HD.last=ts;try{hdStep(dt);hdDraw()}catch(e){console.error(e)}requestAnimationFrame(hdFrame)}
function hdStep(dt){const me=HD.me;HD.t+=dt;if(HD.msgT>0&&(HD.msgT-=dt)<=0){const m=$('hdmsg');if(m)m.classList.remove('on')}
 let dx=0,dy=0;if(!HD.pan){dx=(HDK.d?1:0)-(HDK.a?1:0);dy=(HDK.s?1:0)-(HDK.w?1:0)}const l=Math.hypot(dx,dy),run=HDK.shift?1:0,sp=run?330:200;
 let vx=l?dx/l*sp:0,vy=l?dy/l*sp:0;if(me.jk>0){me.jk-=dt;vx+=me.jx;vy+=me.jy}if(me.spin>0){me.spin-=dt;me.a+=dt*18;vx*=1.15;vy*=1.15}
 const nx=me.x+vx*dt,ny=me.y+vy*dt;if(!hdSolid(nx,me.y,10))me.x=nx;if(!hdSolid(me.x,ny,10))me.y=ny;
 me.mv=l?1:0;if(l){me.ph+=dt*(run?17:12);if(me.spin<=0){let df=Math.atan2(dy,dx)-me.a;df=Math.atan2(Math.sin(df),Math.cos(df));me.a+=df*Math.min(1,dt*14)}}else me.ph*=.8;
 // the closest door
 let best=null,bd=60;HDBLD.forEach(b=>{const d=hdDoor(b),dd=Math.hypot(me.x-d[0],me.y-d[1]);if(dd<bd){bd=dd;best=b}});HD.near=best;
 const z=HDZONE.find(z=>me.x>z.x&&me.x<z.x+z.w&&me.y>z.y&&me.y<z.y+z.h);if(z&&HD.zone!==z.k)hdToast(`${z.n}: pickup games open in a later update.`);HD.zone=z?z.k:null;
 // people on the sidewalks (they know you once you're famous)
 const f=fame(),p=meRow(),first=p?p.n.split(' ')[0]:'',tn=R.lg.t[0].n;
 HD.npc.forEach(n=>{if(n.stop>0)n.stop-=dt;else{const w=n.w,len=Math.hypot(w[2]-w[0],w[3]-w[1]);n.f+=n.d*n.sp*dt/len;if(n.f>1||n.f<0){n.f=clamp(n.f,0,1);n.d*=-1}if(rnd()<dt*.08)n.stop=1+rnd()*2;
   n.x=w[0]+(w[2]-w[0])*n.f;n.y=w[1]+(w[3]-w[1])*n.f;n.a=Math.atan2((w[3]-w[1])*n.d,(w[2]-w[0])*n.d);n.ph+=dt*9}
  if(n.sayT>0)n.sayT-=dt;n.cool-=dt;const dd=Math.hypot(n.x-me.x,n.y-me.y);
  if(dd<110&&n.cool<=0&&!HD.pan){n.cool=14+rnd()*10;const L=f>=65?[`NO WAY, it's ${first}!!`,`${first}! Can you sign my jersey?`,'MVP! MVP!',`${first}, you're the best!`]:f>=35?[`It's ${first}!`,'Can I get a picture?','Big game this week?',`Go ${tn}!`]:f>=15?[`Hey, aren't you on the ${tn}?`,'Good luck this week!','Nice game last week.']:['Morning.','Nice day out.','Hi there.'];
   if((f>=15||rnd()<.4)&&!HD.npc.some(q=>q!==n&&q.sayT>0&&Math.hypot(q.x-n.x,q.y-n.y)<260)){n.say=L[rnd()*L.length|0];n.sayT=2.6;if(dd<70&&f>=35)n.stop=Math.max(n.stop,1.4)}}});
 // camera
 const Z=HD.Z,vw=innerWidth/Z,vh=innerHeight/Z;HD.cam=[clamp(me.x-vw/2,0,Math.max(0,HDW-vw)),clamp(me.y-vh/2,0,Math.max(0,HDH-vh))];
 if((HD.hudT+=dt)>.5)hdHud()}
function hdDraw(){const c=HD.cv,g=c.getContext('2d');if(!g||!g.drawImage)return;const Z=HD.Z*HD.dpr,[cx,cy]=HD.cam,vw=c.width/Z,vh=c.height/Z;
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#2d5a27';g.fillRect(0,0,c.width,c.height);g.setTransform(Z,0,0,Z,-cx*Z,-cy*Z);
 const sx=Math.max(0,cx),sy=Math.max(0,cy),sw=Math.min(HDW-sx,vw+2),sh=Math.min(HDH-sy,vh+2);if(sw>0&&sh>0)g.drawImage(hdBake(),sx,sy,sw,sh,sx,sy,sw,sh);
 const me=HD.me,all=HD.npc.map(n=>[n.y,()=>hdPerson(g,n.x,n.y,n.a,n.stop>0?0:n.ph,n.o)]);all.push([me.y,()=>hdPerson(g,me.x,me.y,me.a,me.ph,HD.look)]);all.sort((a,b)=>a[0]-b[0]).forEach(a=>a[1]());
 HD.npc.forEach(n=>{if(n.sayT>0&&n.say)hdBubble(g,n.x,n.y-26,n.say)});
 if(HD.near&&!HD.pan){const b=HD.near,d=hdDoor(b),pulse=.5+.5*Math.sin(HD.t*5);g.strokeStyle=`rgba(255,216,77,${.5+pulse*.5})`;g.lineWidth=3;g.beginPath();g.arc(d[0],d[1],16+pulse*3,0,7);g.stroke();
  hdBubble(g,me.x,me.y-30,b.soon?`${b.n}: coming soon`:`E  ${b.n}`,1)}}
function hdBubble(g,x,y,t,key){g.font='bold 14px "Trebuchet MS",sans-serif';const w=g.measureText(t).width+16;g.fillStyle=key?'#ffd84d':'#ffffffee';hdRR(g,x-w/2,y-24,w,24,8);g.fill();
 g.beginPath();g.moveTo(x-6,y);g.lineTo(x+6,y);g.lineTo(x,y+7);g.fill();g.fillStyle='#111827';g.textAlign='center';g.textBaseline='middle';g.fillText(t,x,y-12)}
function hdToast(t){const m=$('hdmsg');if(!m||!HD)return;m.textContent=t;m.classList.add('on');HD.msgT=3.2}
function hdHud(){if(!HD)return;HD.hudT=0;const el=$('hdhud'),p=meRow();if(!el||!p)return;const f=fame(),h=HDS(),meal=h.meal&&HD_MEAL[h.meal];
 const s=`<div class="hdbox">${typeof pface=='function'?pface(p,38):''}<div><b>${esc(p.n)}</b><span class="hdm">${HM$(R.money||0)}</span><span>Fame ${f} · ${FAMEN(f)}</span><span class="small">${hdWeekTxt()} · paycheck ${HM$(hdPayWk())} a game${meal?` · next meal: ${meal[0]}`:''}</span></div></div>`;
 if(el.innerHTML!==s)el.innerHTML=s}
// ---------- keys (only while the map is open; everything else in the game is left alone) ----------
addEventListener('keydown',e=>{if(!HD||!HD.on)return;const tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='SELECT'||tg=='TEXTAREA')return;
 const k=e.key.toLowerCase();e.stopImmediatePropagation();if(k==' '||k.startsWith('arrow')||k=='tab')e.preventDefault();HDK[k]=1;if(e.repeat)return;
 if(k=='escape'){if(HD.pan)hdPanClose();else hoodClose();return}if(k=='h'){if(HD.pan=='wallet')hdPanClose();else hdWallet();return}if(HD.pan)return;
 if((k=='e'||k=='enter')&&HD.near)return hdEnter(HD.near.k);
 const me=HD.me;if((k=='arrowup'||k=='arrowdown')&&me.jk<=0){const s=k=='arrowup'?-1:1,pa=me.a+s*Math.PI/2;me.jk=.16;me.jx=Math.cos(pa)*520;me.jy=Math.sin(pa)*520}
 if((k=='arrowleft'||k=='arrowright')&&me.spin<=0)me.spin=.35},true);
addEventListener('keyup',e=>{if(!HD||!HD.on)return;HDK[e.key.toLowerCase()]=0;e.stopImmediatePropagation()},true);
addEventListener('blur',()=>{for(const k in HDK)HDK[k]=0});
// ---------- inside the buildings ----------
function hdPanClose(){if(!HD)return;HD.pan=null;const p=$('hdpan');if(p){p.hidden=true;p.innerHTML=''}hdHud()}
function hdPanel(k,title,body,note){if(!HD)return;HD.pan=k;for(const q in HDK)HDK[q]=0;const p=$('hdpan');if(!p)return;
 p.innerHTML=`<div class="hdp"><div class="hdph"><h2>${title}</h2><span class="hdbal">${HM$(R.money||0)}</span>${B('hdPanClose()','Leave (Esc)')}</div>${note?`<p class="hdnote">${esc(note)}</p>`:''}<div class="hdpb">${body}</div></div>`;p.hidden=false;hdHud()}
const hdBtn=(fn,t,ok)=>B(fn,t,ok===false?'dim':'go');
function hdEnter(k,note){const b=HDBLD.find(x=>x.k==k);if(!b||!HD)return;if(b.soon)return hdToast(b.soon);
 if(k=='home')return hdHome(note);if(k=='wallet')return hdWallet();
 if(!feat('shops'))return hdPanel(k,`${b.ic} ${b.n}`,`<p>Closed. Shops are switched off on the Game features page (Neighborhood shops).</p>`);
 ({clothes:hdClothes,sports:hdSports,diner:hdDiner,gym:hdGym,agency:hdAgency})[k](note)}
function hdRow(name,desc,price,btn,cls){return`<div class="hdi ${cls||''}"><div class="hdt"><b>${name}</b><span>${desc}</span></div><div class="hdpr">${price}</div><div class="hdbt">${btn}</div></div>`}
const hdSw=c=>`<i class="hdsw" style="background:${c=='team'?teamCol(0)[0]:c}"></i>`;
function hdBoostTxt(b){const g=myPos(),ok=PSL[g]?Object.keys(b).filter(s=>PSL[g].includes(s)):Object.keys(b);
 return ok.length?ok.map(s=>`+${b[s]} ${DSN[s].toLowerCase()}`).join(', '):`<span class="dim">Doesn't help a ${g}.</span>`}
// clothes
function hdClothes(note){const h=HDS();let body='<p class="small dim">Clothes change how you look around town. Wear one item per row.</p>';
 Object.keys(HD_SLOTW).forEach(sl=>{body+=`<h3>${HD_SLOTW[sl]}</h3>`;Object.keys(HD_WEAR).filter(id=>HD_WEAR[id][0]==sl).forEach(id=>{const w=HD_WEAR[id],own=h.own[id],on=h.look[sl]==id;
  body+=hdRow(`${hdSw(w[2])}${w[1]}`,w[4],w[3]?HM$(w[3]):'free',on?(sl=='top'?'<span class="good">Wearing</span>':hdBtn(`hdWear('${id}',1)`,'Take off')):own?hdBtn(`hdWear('${id}')`,'Wear'):hdBtn(`hdBuyWear('${id}')`,'Buy',hdCan(w[3])),on?'own':'')})});
 hdPanel('clothes','👕 Threadline Clothing',body,note)}
function hdBuyWear(id){const w=HD_WEAR[id],h=HDS();if(!w||h.own[id])return hdClothes();if(!hdCan(w[3]))return hdClothes('Not enough money yet.');
 hdPay(`Bought: ${w[1]}`,-w[3]);h.own[id]=1;h.look[w[0]]=id;if(w[5])fameAdd(w[5]);HD.look=hdLook();save();hdClothes(`You bought the ${w[1].toLowerCase()} and put it on.${w[5]?` People notice (+${w[5]} fame).`:''}`)}
function hdWear(id,off){const w=HD_WEAR[id],h=HDS();if(!w||!h.own[id])return hdClothes();if(off)delete h.look[w[0]];else h.look[w[0]]=id;if(!h.look.top)h.look.top='tee';HD.look=hdLook();save();
 HD.pan=='home'?hdHome():hdClothes()}
// sports store: game-day gear and two training perks
function hdSports(note){const h=HDS();let body=`<p class="small dim">Game-day gear: one item per slot. Boosts work in real games only (not drills), and each rating can go up by at most +3 from gear and food together.${!DS2()?' <b>Most boosts need the Detailed ratings switch on</b> (speed works either way).':''}</p>`;
 Object.keys(HD_SLOTG).forEach(sl=>{body+=`<h3>${HD_SLOTG[sl]}</h3>`;Object.keys(HD_GEAR).filter(id=>HD_GEAR[id][0]==sl).forEach(id=>{const gx=HD_GEAR[id],own=h.own[id],on=h.eq[sl]==id;
  body+=hdRow(gx[1],hdBoostTxt(gx[3]),HM$(gx[2]),on?hdBtn(`hdEquip('${id}',1)`,'Take off'):own?hdBtn(`hdEquip('${id}')`,'Equip'):hdBtn(`hdBuyGear('${id}')`,'Buy',hdCan(gx[2])),on?'own':'')})});
 body+=hdPerkRows('sports','Coaching and film');hdPanel('sports','🏈 Pro Shop Sports',body,note)}
function hdBuyGear(id){const gx=HD_GEAR[id],h=HDS();if(!gx||h.own[id])return hdSports();if(!hdCan(gx[2]))return hdSports('Not enough money yet.');hdPay(`Bought: ${gx[1]}`,-gx[2]);h.own[id]=1;h.eq[gx[0]]=id;save();hdSports(`${gx[1]}: bought and equipped.`)}
function hdEquip(id,off){const gx=HD_GEAR[id],h=HDS();if(!gx||!h.own[id])return hdSports();if(off)delete h.eq[gx[0]];else h.eq[gx[0]]=id;save();HD.pan=='home'?hdHome():hdSports()}
// training perks, shared with the Fame & sponsors page (same list, bought once for the whole career)
function hdPerkRows(shop,title){const L=LF();return`<h3>${title}</h3>`+(HD_PERKAT[shop]||[]).map(k=>{const P0=PERKS.find(x=>x[0]==k);if(!P0)return'';const own=L.perk[k],need=P0[4]&&!L.perk[P0[4]];
 return hdRow(P0[1],P0[2]+' <span class="dim">Lasts your whole career.</span>',HM$(P0[3]),own?'<span class="good">Owned</span>':need?'<span class="dim small">Needs a personal trainer first</span>':hdBtn(`hdPerkBuy('${k}','${shop}')`,'Buy',hdCan(P0[3])),own?'own':'')}).join('')}
function hdPerkBuy(k,shop){const P0=PERKS.find(x=>x[0]==k),L=LF(),back=n=>hdEnter(shop,n);if(!P0||L.perk[k]||(P0[4]&&!L.perk[P0[4]]))return back();if(!hdCan(P0[3]))return back('Not enough money yet.');
 hdPay(`Bought: ${P0[1]}`,-P0[3]);L.perk[k]=R.season;if((k=='trainer'||k=='trainer2')&&typeof trS=='function'){const s=trS();s.e++}addNews(`${meRow().n} hires a ${P0[1].toLowerCase()}.`);save();back(`${P0[1]}: done.`)}
// diner: a meal for your next game, and a round for the fans once a week
function hdDiner(note){const h=HDS(),cur=h.meal&&HD_MEAL[h.meal];let body=`<p class="small dim">Eat here before a game: the meal helps in your next game only (simmed games use it up too). One meal at a time.</p>${cur?`<p class="good">Your next meal: <b>${cur[0]}</b> (${hdBoostTxt(cur[2])}).</p>`:''}<h3>Menu</h3>`;
 Object.keys(HD_MEAL).forEach(id=>{const m=HD_MEAL[id],on=h.meal==id;body+=hdRow(m[0],`${m[3]} ${hdBoostTxt(m[2])}`,HM$(m[1]),on?'<span class="good">Ordered</span>':hdBtn(`hdBuyMeal('${id}')`,cur?'Order instead':'Order',hdCan(m[1])),on?'own':'')});
 const done=h.fanW===h.wk;body+=`<h3>Locals</h3>`+hdRow('Buy a round for the fans','The whole diner cheers. +1 fame. Once a week.',HM$(.02),done?'<span class="dim small">Done this week</span>':hdBtn('hdFans()','Buy',hdCan(.02)));
 hdPanel('diner','🍔 Corner Diner',body,note)}
function hdBuyMeal(id){const m=HD_MEAL[id],h=HDS();if(!m||h.meal==id)return hdDiner();if(!hdCan(m[1]))return hdDiner('Not enough money yet.');hdPay(`Meal: ${m[0]}`,-m[1]);h.meal=id;save();hdDiner(`${m[0]} it is. It helps in your next game.`)}
function hdFans(){const h=HDS();if(h.fanW===h.wk)return hdDiner();if(!hdCan(.02))return hdDiner('Not enough money yet.');hdPay('A round for the fans at the diner',-.02);h.fanW=h.wk;fameAdd(1);save();hdDiner('The diner goes wild. +1 fame.')}
// gym: trainers and equipment, plus a paid workout for XP once a week
function hdGym(note){const h=HDS(),done=h.gymW===h.wk;let body=`<h3>Workout</h3>`+hdRow('Weight room session','Pay for a session with the gym\'s coaches. +10 XP. Once a week.',HM$(.03),done?'<span class="dim small">Done this week</span>':hdBtn('hdGymSess()','Work out',hdCan(.03)));
 body+=hdPerkRows('gym','Trainers and equipment');hdPanel('gym','🏋️ Northside Gym',body,note)}
function hdGymSess(){const h=HDS();if(h.gymW===h.wk)return hdGym();if(!hdCan(.03))return hdGym('Not enough money yet.');hdPay('Weight room session',-.03);h.gymW=h.wk;R.xp=(R.xp||0)+10;save();hdGym('Good work. +10 XP (spend it on the Home page).')}
// sports agency: the agent, and a look at your sponsors
function hdAgency(note){const L=LF(),f=fame();let body=hdPerkRows('agency','Representation')+`<h3>Your sponsors</h3><p>${L.deals.length?L.deals.map(d=>`<b>${esc(d.b)}</b> (${HM$(d.pay)} a season)`).join(', '):'No sponsors yet.'}</p>
 <p class="small">Fame ${f} (${FAMEN(f)}). ${L.offers.length?`<b class="good">${L.offers.length} offer${L.offers.length==1?'':'s'} waiting.</b>`:'More fame brings bigger offers.'}</p><div class="btns">${hdBtn("hoodClose();lifeUI()",'Go to Fame & sponsors')}</div>`;
 hdPanel('agency','💼 Summit Sports Agency',body,note)}
// home: wardrobe, your gear, and the way back to your career
function hdHome(note){const h=HDS(),own=id=>h.own[id];let body=`<div class="btns">${hdBtn('hoodClose()','Back to my career')}${hdBtn('hdWallet()','Wallet and history')}</div><h3>Wardrobe</h3>`;
 body+=Object.keys(HD_WEAR).filter(own).map(id=>{const w=HD_WEAR[id],on=h.look[w[0]]==id;return hdRow(`${hdSw(w[2])}${w[1]}`,HD_SLOTW[w[0]],'',on?(w[0]=='top'?'<span class="good">Wearing</span>':hdBtn(`hdWear('${id}',1)`,'Take off')):hdBtn(`hdWear('${id}')`,'Wear'),on?'own':'')}).join('');
 const gear=Object.keys(HD_GEAR).filter(own);body+=`<h3>Game-day gear</h3>`+(gear.length?gear.map(id=>{const gx=HD_GEAR[id],on=h.eq[gx[0]]==id;return hdRow(gx[1],hdBoostTxt(gx[3]),HD_SLOTG[gx[0]],on?hdBtn(`hdEquip('${id}',1)`,'Take off'):hdBtn(`hdEquip('${id}')`,'Equip'),on?'own':'')}).join(''):'<p class="dim">No gear yet. The sports store has it.</p>');
 hdPanel('home','🏠 Your place',body,note)}
// ---------- wallet: balance and history (on the map with H, and as a page from Fame & sponsors) ----------
function hdWalletHTML(n){const h=HDS(),p=meRow(),log=h.log.slice(0,n||80),inS=h.log.filter(x=>x.s==R.season),earn=inS.filter(x=>x.v>0).reduce((a,x)=>a+x.v,0),spent=-inS.filter(x=>x.v<0).reduce((a,x)=>a+x.v,0);
 return`<div class="stats3"><div><b>${HM$(R.money||0)}</b><span>money</span></div><div><b>${HM$(hdPayWk())}</b><span>paycheck a game</span></div><div><b>${HM$(earn)}</b><span>earned this season</span></div><div><b>${HM$(spent)}</b><span>spent this season</span></div></div>
 <p class="small dim">Your paycheck is ${Math.round(HD_TAKE*100)}% of your ${p?M$(p.sal):''} salary spread over the regular season (the rest goes to taxes, your agent and living costs). Sponsors, events and storylines add the rest.</p>
 ${log.length?`<table class="mini hdlog"><tr><th>When</th><th>What</th><th class="num">Amount</th><th class="num">Balance</th></tr>${log.map(x=>`<tr><td class="dim small">S${x.s} · ${esc(x.w)}</td><td>${esc(x.t)}</td><td class="num ${x.v<0?'l':'good'}">${x.v>0?'+':''}${HM$(x.v)}</td><td class="num dim">${HM$(x.b)}</td></tr>`).join('')}</table>`:'<p class="dim">Nothing yet. Your first paycheck comes after your next game.</p>'}`}
function hdWallet(){hdSync();hdPanel('wallet','💵 Wallet',hdWalletHTML())}
function walletUI(){if(!CAR()||!R.me)return careerHub();VW.page='life';hdSync();modal(`<div class="hdr"><h1>Money</h1><p class="dim">Your balance and everything that came in or went out.</p></div><div class="btns">${B('lifeUI()','Back to Fame & sponsors')}${feat('hood')?B('hoodUI()','Go to the Neighborhood','go'):''}</div>${card('Wallet',hdWalletHTML())}`)}
// ---------- tie-ins: career home, Fame & sponsors page, sidebar ----------
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{if(!CAR()||!R.me||(G&&G.live)||!feat('hood'))return r;const d=$('modal').querySelector('.dash');if(!d)return r;hdSync();
 const h=HDS(),l=h.log[0];{const fc=[...d.children].find(c=>/^Fame/.test((c.querySelector('h4')||{}).textContent||'')),mb=fc&&fc.querySelector('.stats3 b');if(mb)mb.textContent=HM$(R.money||0)}const html=card('Neighborhood',`<p>Walk around town: shops, food, the gym and your agent.</p><div class="stats3"><div><b>${HM$(R.money||0)}</b><span>money</span></div><div><b>${HM$(hdPayWk())}</b><span>paycheck a game</span></div></div>${l?`<p class="small dim">Last: ${esc(l.t)} ${l.v>0?'+':''}${HM$(l.v)}</p>`:''}<div class="btns">${B('hoodUI()','Go to the Neighborhood','go')}</div>`);
 const f=[...d.children].find(c=>/^Fame/.test((c.querySelector('h4')||{}).textContent||''));(f||d.firstElementChild).insertAdjacentHTML('afterend',html)}catch(e){console.error(e)}return r}}
{const _lu=lifeUI;lifeUI=function(...a){const r=_lu.apply(this,a);try{if(!feat('hood')||!CAR()||!R.me||VW.page!='life')return r;const m=$('modal'),secs=[...m.querySelectorAll('.cardx')],hd=c=>(c.querySelector('h4')||{}).textContent||'';hdSync();
 const top=secs.find(c=>/^Money and fame/.test(hd(c)));if(top){const mb=top.querySelector('.stats3 b');if(mb)mb.textContent=HM$(R.money||0);const pp=[...top.querySelectorAll('p')].find(x=>/salary is separate/.test(x.textContent));if(pp)pp.textContent=`Money comes from sponsors, appearances, stories and a weekly take-home slice of your salary (${HM$(hdPayWk())} a game). Fame grows with big games, wins, awards and good choices. More fame brings bigger sponsors.`}
 const sp=secs.find(c=>/^Spend your money/.test(hd(c)));if(sp&&feat('shops'))sp.innerHTML=`<h4>Spend your money</h4><p>The shop has moved to the <b>Neighborhood</b>: trainers and equipment at the gym, the film room and position coach at the sports store, and the sports agent at the agency. There's also clothes, game-day gear and food.</p><div class="btns">${B('hoodUI()','Go to the Neighborhood','go')}</div>`;
 const h=HDS(),hist=card('Money history',h.log.length?`<table class="mini">${h.log.slice(0,6).map(x=>`<tr><td class="dim small">S${x.s} · ${esc(x.w)}</td><td>${esc(x.t)}</td><td class="num ${x.v<0?'l':'good'}">${x.v>0?'+':''}${HM$(x.v)}</td></tr>`).join('')}</table>`:'<p class="dim">Nothing yet. Your first paycheck comes after your next game.</p>'+'')+'';
 const el=document.createElement('div');el.innerHTML=hist;const c=el.firstElementChild;c.insertAdjacentHTML('beforeend',`<div class="btns">${B('walletUI()','Full history')}${B('hoodUI()','Neighborhood')}</div>`);
 if(top)top.after(c);else{const d=m.querySelector('.dash');if(d)d.prepend(c)}}catch(e){console.error(e)}return r}}
(()=>{const i=NAVC.findIndex(x=>x[0]=='life'),j=i<0?NAVC.findIndex(x=>x[0]=='play'):i;if(!NAVC.some(x=>x[0]=='hood'))NAVC.splice(j<0?2:j+1,0,['hood','hoodUI()','Neighborhood'])})();
{const _sh=shellHTML;shellHTML=function(h,...a){let r=_sh(h,...a);try{if(R&&R.mode=='career'&&!feat('hood'))r=r.replace(/<[^<>]*hoodUI\(\)[^<>]*>[^<]*<\/[a-z]+>/,'')}catch(e){}return r}}
