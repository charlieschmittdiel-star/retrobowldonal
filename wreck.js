'use strict';
// Neighborhood: GTA-style car damage. Crashes dent your car. A damaged car smokes (gray, then black) and loses speed,
// a badly damaged one breaks down, and a hard crash on a wrecked car sets it on fire: get out and get away before it
// blows up (cartoon style, nobody gets hurt). Ace Body Shop repairs cars (drive into the bay, or call a tow truck),
// and sells insurance: an insured car that gets destroyed pays back most of its price; an uninsured one is just gone.
// This file wraps functions from hood.js and cars.js and leaves the originals alone. Load it after cars.js.
{const add=[['Career','carDmg','Car damage','Crashes dent your car: it smokes, slows down, breaks down, and a hard crash can set it on fire (get out before it blows!). Fix it at Ace Body Shop. Insured cars pay back most of their price if destroyed.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const HD_HPMAX=1000,HD_STALL=300,HD_FIRE=150;       // car health: breaks down at 300 or less, catches fire at 150 or less
const HD_BURN=8;                                     // seconds from catching fire to the explosion
const HD_INS=.006,HD_PAYOUT=.8,HD_TOW=.02,HD_FIX=.25;// insurance per game and payout (shares of the price), tow fee ($M), full repair (share of price)
const HD_BAY={x:830,y:1356,w:140,h:82};
// the body shop takes the place of one house south of 2nd Street
{const i=HDHOUSE.findIndex(o=>o.x==810&&o.y==1380);if(i>=0)HDHOUSE.splice(i,1)}
HDBLD.push({k:'body',n:'Ace Body Shop',ic:'🔧',x:800,y:1440,w:200,h:120,door:'n',roof:'#57534e'});
const dmgOn=()=>feat('carDmg')&&feat('cars');
// ---------- save data (made when first needed) ----------
function hdHp(id){const h=HCAR();if(!h.hp||typeof h.hp!='object')h.hp={};const v=h.hp[id];return v==null?HD_HPMAX:clamp(+v,0,HD_HPMAX)}
function hdSetHp(id,v){const h=HCAR();if(!h.hp||typeof h.hp!='object')h.hp={};h.hp[id]=Math.round(clamp(v,0,HD_HPMAX))}
function hdIns(id){const h=HCAR();return!!(h.ins&&h.ins[id])}
const hdCond=id=>Math.round(hdHp(id)/HD_HPMAX*100);
const hdCondTxt=id=>dmgOn()?` Condition ${hdCond(id)}%${hdHp(id)<=HD_STALL?' (broken down)':''}.${hdIns(id)?' Insured.':''}`:'';
function hdRepairCost(id){const K=HD_CAR[id],hp=hdHp(id);if(!K||hp>=HD_HPMAX-5)return 0;return Math.max(.01,Math.ceil((HD_HPMAX-hp)/HD_HPMAX*K.p*HD_FIX*100-1e-9)/100)}
const hdSellMul=id=>dmgOn()?Math.max(.3,hdHp(id)/HD_HPMAX):1;
const hdInBay=(x,y)=>x>=HD_BAY.x&&x<=HD_BAY.x+HD_BAY.w&&y>=HD_BAY.y&&y<=HD_BAY.y+HD_BAY.h;
// ---------- how damage changes driving ----------
function hdCarMul(C){if(!dmgOn())return 1;const hp=hdHp(C.id);if(hp<=HD_STALL||(HD&&HD.burn))return 0;if(hp<400)return(.72+.08*Math.sin(HD.t*9));if(hp<650)return .9;return 1}
function hdCrash(C,imp){if(!dmgOn()||!HD)return;const hp=hdHp(C.id),d=Math.min(600,Math.max(0,(imp-100)*.8));if(d<=0||hp<=0)return;const n=hp-d;hdSetHp(C.id,n);
 const fx=C.x+Math.cos(C.a)*20,fy=C.y+Math.sin(C.a)*20;for(let i=0;i<Math.min(18,4+d/25);i++)hdFx(fx,fy,(rnd()-.5)*220,(rnd()-.5)*220,.3+rnd()*.2,2.5,'#fde047',-4);
 if(n<=HD_FIRE&&!HD.burn){HD.burn=HD_BURN;hdToast('🔥 Your car is on fire! Get out (F) and get away before it blows!')}
 else if(n<=HD_STALL&&hp>HD_STALL)hdToast('The engine died. Press E to call a tow truck, or walk to Ace Body Shop.');
 else if(n<400&&hp>=400)hdToast('Black smoke! Your car is badly damaged and losing power.');
 else if(n<650&&hp>=650)hdToast('Your car is smoking. Ace Body Shop can fix it (south of 2nd Street).');
 hdKeysTxt()}
// ---------- smoke, fire, sparks and the explosion ----------
function hdFx(x,y,vx,vy,life,r,c,grow){if(!HD)return;HD.fx=HD.fx||[];if(HD.fx.length>300)return;HD.fx.push({x,y,vx,vy,t:0,life,r,c,grow:grow||0})}
function hdWreckTick(dt){if(!HD)return;HD.fx=(HD.fx||[]).filter(p=>(p.t+=dt)<p.life);HD.fx.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt*2;p.vy*=1-dt;p.r=Math.max(.5,p.r+p.grow*dt)});
 if(HD.flash>0)HD.flash-=dt;if(HD.later&&(HD.later.t-=dt)<=0){hdToast(HD.later.m);HD.later=null}
 const k=HD.husk;if(k){k.t-=dt;if(k.t<=0)HD.husk=null;else if(rnd()<dt*8)hdFx(k.x+(rnd()-.5)*20,k.y,(rnd()-.5)*10,-25,2,5,'#292524',9)}
 const C=HD.car;if(!C||!dmgOn())return;const hp=hdHp(C.id),fx=C.x+Math.cos(C.a)*18,fy=C.y+Math.sin(C.a)*18;
 if(HD.burn){HD.burn-=dt;const n=Math.ceil(dt*60);for(let i=0;i<n;i++)hdFx(C.x+(rnd()-.5)*34,C.y+(rnd()-.5)*22,(rnd()-.5)*30,-40-rnd()*45,.5+rnd()*.3,6+rnd()*6,rnd()<.55?'#f97316':'#facc15',-5);
  if(rnd()<dt*16)hdFx(fx,fy-8,(rnd()-.5)*15,-40,2,6,'#1c1917',11);
  HD.npc.forEach(n=>{if(Math.hypot(n.x-C.x,n.y-C.y)<180&&n.sayT<=0&&rnd()<dt*1.5){n.say=['FIRE!','Get away from it!','Somebody call 911!'][rnd()*3|0];n.sayT=1.8;n.stop=2}});
  if(HD.burn<=0)hdBoom()}
 else if(hp<400){if(rnd()<dt*14)hdFx(fx,fy,(rnd()-.5)*20,-25-rnd()*20,1.7,5,'#1f2937',10)}
 else if(hp<650){if(rnd()<dt*7)hdFx(fx,fy,(rnd()-.5)*15,-20-rnd()*15,1.3,4,'#9ca3af',8)}}
{const _st=hdStep;hdStep=function(dt,...a){const r=_st.call(this,dt,...a);try{hdWreckTick(dt)}catch(e){console.error(e)}return r}}
function hdBoom(){const C=HD.car;if(!C)return;const id=C.id,me=HD.me;HD.burn=0;
 for(let i=0;i<70;i++){const a=rnd()*7,s=60+rnd()*340;hdFx(C.x,C.y,Math.cos(a)*s,Math.sin(a)*s,.45+rnd()*.7,5+rnd()*7,['#f97316','#facc15','#ef4444','#1f2937'][i%4],i%4==3?12:-3)}
 HD.flash=.4;HD.husk={x:C.x,y:C.y,a:C.a,t:12};
 if(HD.drive){HD.drive=0;const o=[[0,60],[0,-60],[60,0],[-60,0],[50,50],[-50,-50],[0,90],[0,-90]].find(([dx,dy])=>!hdSolid(C.x+dx,C.y+dy,10))||[0,0];me.x=C.x+o[0];me.y=C.y+o[1];me.spin=1;hdToast('BOOM! You were thrown clear. Lucky!')}
 else{const dd=Math.hypot(me.x-C.x,me.y-C.y);if(dd<120){me.spin=1;me.jk=.25;me.jx=(me.x-C.x)/(dd||1)*500;me.jy=(me.y-C.y)/(dd||1)*500;hdToast('BOOM! The blast knocks you off your feet.')}else hdToast('BOOM! Your car blew up.')}
 HD.npc.forEach(n=>{if(Math.hypot(n.x-C.x,n.y-C.y)<240){n.say='WHOA!';n.sayT=2.2;n.stop=2.5}});
 HD.car=null;hdTotal(id);hdKeysTxt()}
// the car is gone: insurance pays (if you had it), and it makes the news
function hdTotal(id){const h=HCAR(),K=HD_CAR[id];if(!K||!h.cars[id])return;const ins=hdIns(id);delete h.cars[id];delete h.gas[id];if(h.hp)delete h.hp[id];if(h.ins)delete h.ins[id];if(h.ride==id){h.ride=null;h.car=null}
 let m;if(ins){const v=hdC(K.p*HD_PAYOUT);hdPay(`Insurance payout: ${K.n} destroyed`,v);m=`Insurance pays ${HM$(v)} for your ${K.n.toLowerCase()}.`}else{hdPush(`Car destroyed, no insurance: ${K.n}`,0);m=`No insurance on the ${K.n.toLowerCase()}. It's gone.`}
 addNews(`${(meRow()||{n:'A player'}).n}'s ${K.n.toLowerCase()} goes up in flames in the Neighborhood. Nobody was hurt.`);if(HD)HD.later={t:2.6,m};save()}
// leaving the map while it burns: it burns out
{const _hc=hoodClose;hoodClose=function(...a){try{if(HD&&HD.burn&&HD.car){const id=HD.car.id;HD.car=null;HD.burn=0;hdTotal(id)}}catch(e){console.error(e)}return _hc.apply(this,a)}}
// ---------- drawing: dents, the burnt shell, smoke and flames, the flash ----------
function hdDents(g,C,hp){const n=hp<400?6:hp<650?4:2,P=[[30,-14],[-20,16],[10,18],[-36,-10],[40,8],[-6,-18]];g.save();g.translate(C.x,C.y);g.scale(.62,.62);g.rotate(C.a);g.fillStyle='rgba(0,0,0,.35)';
 for(let i=0;i<n;i++){g.beginPath();g.ellipse(P[i][0],P[i][1],7,4,i,0,7);g.fill()}if(hp<400){g.strokeStyle='rgba(0,0,0,.55)';g.lineWidth=2;g.beginPath();g.moveTo(20,-8);g.lineTo(34,4);g.lineTo(26,12);g.moveTo(-30,4);g.lineTo(-18,-6);g.stroke()}g.restore()}
function hdFxDraw(g){(HD.fx||[]).forEach(p=>{g.globalAlpha=Math.max(0,1-p.t/p.life)*.85;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()});g.globalAlpha=1}
{const _cd=hdCarDraw;hdCarDraw=function(g,all){_cd(g,all);try{const C=HD.car;if(C&&dmgOn()&&feat('cars')){const hp=hdHp(C.id);if(hp<850)all.push([C.y+.01,()=>hdDents(g,C,hp)])}
 const k=HD.husk;if(k)all.push([k.y,()=>{g.save();g.translate(k.x,k.y);g.scale(.62,.62);hdCarTop(g,0,0,k.a,'#292524');g.fillStyle='#0c0a09aa';g.beginPath();g.arc(0,0,40,0,7);g.fill();g.restore()}]);
 all.push([1e9,()=>hdFxDraw(g)])}catch(e){console.error(e)}}}
{const _cu=hdCarUI;hdCarUI=function(g){try{const C=HD.car;if(C&&dmgOn()&&!HD.pan){if(HD.burn){hdBubble(g,C.x,C.y-44,HD.drive?'GET OUT! (F)':`It's going to blow! ${Math.ceil(HD.burn)}`,0);return hdFlash(g)}
  else if(HD.drive&&hdInBay(C.x,C.y)){hdBubble(g,C.x,C.y-30,'E  Repair',1);return hdFlash(g)}
  else if(HD.drive&&hdHp(C.id)<=HD_STALL){hdBubble(g,C.x,C.y-30,'E  Call a tow truck',1);return hdFlash(g)}}}catch(e){console.error(e)}_cu(g);hdFlash(g)}}
function hdFlash(g){if(!HD||!(HD.flash>0))return;g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=Math.min(1,HD.flash/.4)*.75;g.fillStyle='#fff7ed';g.fillRect(0,0,HD.cv.width,HD.cv.height);g.restore()}
// the body shop and its repair bay on the map
{const _hb=hdBake;hdBake=function(...a){const c=_hb.apply(this,a);try{if(!c._body){c._body=1;const g=c.getContext('2d');if(g&&g.fillRect){const F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)},Y=HD_BAY;
 F('#4b5058',Y.x,Y.y,Y.w,Y.h);for(let i=0;i<Y.w;i+=28){F('#facc15',Y.x+i,Y.y,14,6);F('#111827',Y.x+i+14,Y.y,14,6)}g.strokeStyle='#facc15';g.lineWidth=3;g.strokeRect(Y.x+3,Y.y+3,Y.w-6,Y.h-6);
 g.fillStyle='#ffffffaa';g.font='bold 13px "Trebuchet MS",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('REPAIR BAY',Y.x+Y.w/2,Y.y+Y.h-16);
 const b=HDBLD.find(x=>x.k=='body');if(b){F('#00000040',b.x+8,b.y+10,b.w,b.h);F(b.roof,b.x,b.y+38,b.w,b.h-38);g.strokeStyle='#00000055';g.lineWidth=4;g.strokeRect(b.x+2,b.y+40,b.w-4,b.h-42);
  F('#efe6d2',b.x,b.y,b.w,38);for(let x=b.x+10;x<b.x+b.w-10;x+=10)F('#9ca3af',x,b.y+6,6,30);F('#3f2a1a',b.x+b.w/2-24,b.y,48,38);hdSign(g,b.x+b.w/2,b.y+38+(b.h-38)/2,`${b.ic} ${b.n}`,15)}}}}catch(e){console.error(e)}return c}}
// ---------- keys: E in the bay repairs, E in a broken-down car calls a tow; no getting into a burning car ----------
{const _ck=hdCarKey;hdCarKey=function(k){try{if(HD&&HD.car&&dmgOn()){const C=HD.car;
 if(k=='f'&&HD.burn&&!HD.drive){hdToast('It\'s on fire! Stay away from it!');return true}
 if(HD.drive&&(k=='e'||k=='enter')&&!HD.burn&&(hdInBay(C.x,C.y)||hdHp(C.id)<=HD_STALL)){C.v=0;hdBody();return true}}}catch(e){console.error(e)}return _ck(k)}}
{const _gi=hdGetIn;hdGetIn=function(...a){const r=_gi.apply(this,a);try{if(HD&&HD.drive&&HD.car&&dmgOn()&&hdHp(HD.car.id)<=HD_STALL)hdToast('The engine won\'t start. Press E to call a tow truck.')}catch(e){}return r}}
{const _gs=hdKeysTxt;hdKeysTxt=function(...a){const r=_gs.apply(this,a);try{const el=$('hdkeys');if(el&&HD&&HD.drive&&dmgOn())el.textContent=el.textContent.replace('E fill up at the pumps','E fill up / repair in the bay / call a tow')}catch(e){}return r}}
// ---------- Ace Body Shop ----------
{const _he=hdEnter;hdEnter=function(k,note,...a){if(k=='body'){if(!HD)return;if(!dmgOn())return hdPanel('body','🔧 Ace Body Shop','<p>Closed. Car damage (or Cars and driving) is switched off on the Game features page.</p>');return hdBody(note)}return _he.call(this,k,note,...a)}}
function hdInsRows(){const h=HCAR(),ids=Object.keys(h.cars).filter(x=>HD_CAR[x]);if(!ids.length||!dmgOn())return'';
 return`<h3>Insurance</h3><p class="small dim">If an insured car is destroyed you get ${Math.round(HD_PAYOUT*100)}% of its price back. An uninsured car is just gone. Insurance is billed after each game.</p>`+
  ids.map(x=>{const Q=HD_CAR[x],on=hdIns(x);return hdRow(`${hdSw(Q.c)}${Q.n}`,on?'Insured.':'Not insured.',`${hdSmall$(Q.p*HD_INS)} a game`,hdBtn(`hdInsure('${x}',${on?0:1})`,on?'Cancel':'Insure it'),on?'own':'')}).join('')}
function hdBody(note){const h=HCAR(),id=h.ride,K=id&&HD_CAR[id];let body='';
 if(!K)body='<p>You don\'t have a car to fix. Miller Motors sells them.</p>';
 else if(HD.burn)body='<p class="l"><b>Your car is on fire!</b> Nobody can save it now. Get away from it.</p>';
 else{const hp=hdHp(id),cost=hdRepairCost(id),C=HD.car,inBay=HD.drive&&C&&hdInBay(C.x,C.y);
  body=`<p>${K.n}: condition <b>${hdCond(id)}%</b>${hp<=HD_STALL?' <span class="l">(broken down)</span>':hp<400?' <span class="l">(badly damaged)</span>':hp<650?' (smoking)':''}.</p>`;
  if(!cost)body+='<p class="good">Not a scratch on it.</p>';
  else if(inBay)body+=hdRow('Full repair','Fixes every dent. Like new.',HM$(cost),hdBtn('hdFix(0)','Repair',hdCan(cost)));
  else body+=`<p class="small dim">Drive into the repair bay out front and press E, or have it towed here.</p>`+hdRow('Tow it here and fix it','The tow truck brings your car to the bay and the crew fixes it.',HM$(cost+HD_TOW),hdBtn('hdFix(1)','Tow and repair',hdCan(cost+HD_TOW)))}
 hdPanel('body','🔧 Ace Body Shop',body+hdInsRows(),note)}
function hdFix(tow){const h=HCAR(),id=h.ride,K=id&&HD_CAR[id];if(!K||!HD||HD.burn)return hdBody();const cost=hdRepairCost(id)+(tow?HD_TOW:0);if(!hdRepairCost(id))return hdBody();if(!hdCan(cost))return hdBody('Not enough money yet.');
 hdPay(tow?`Tow and repair: ${K.n}`:`Repair: ${K.n}`,-cost);hdSetHp(id,HD_HPMAX);
 if(tow&&HD.car){const C=HD.car;C.x=HD_BAY.x+HD_BAY.w/2;C.y=HD_BAY.y+HD_BAY.h/2;C.a=-Math.PI/2;C.v=0;if(HD.drive){HD.me.x=C.x;HD.me.y=C.y}hdCarSave()}
 save();hdKeysTxt();hdBody(tow?'Towed and fixed. It\'s waiting in the repair bay.':'Good as new.')}
function hdInsure(id,on){const h=HCAR();if(!h.cars[id])return;if(!h.ins||typeof h.ins!='object')h.ins={};if(on)h.ins[id]=1;else delete h.ins[id];save();if(HD&&HD.pan=='cars')hdDealer(on?'Insured.':'Insurance canceled.');else hdBody(on?'Insured.':'Insurance canceled.')}
// the dealer also sells insurance, and buys damaged cars for less
{const _dd=hdDealer;hdDealer=function(...a){const r=_dd.apply(this,a);try{const pb=$('hdpan')&&$('hdpan').querySelector('.hdpb');if(pb&&dmgOn())pb.insertAdjacentHTML('beforeend',`<p class="small dim">Damaged cars sell for less. Ace Body Shop does repairs.</p>`+hdInsRows())}catch(e){console.error(e)}return r}}
{const _sl=hdSell;hdSell=function(id,...a){const r=_sl.call(this,id,...a);try{const h=HCAR();if(!h.cars[id]){if(h.hp)delete h.hp[id];if(h.ins)delete h.ins[id];save()}}catch(e){}return r}}
{const _hx=hdHudX;hdHudX=function(...a){let s=_hx.apply(this,a);try{if(s&&HD&&HD.car&&dmgOn()){const c=hdCond(HD.car.id);s=s.replace(/<\/span>$/,` · condition <b style="color:${c<=30?'#ff8f7a':c<65?'#fbbf24':'#9be89b'}">${c}%</b>${HD.burn?' · <b style="color:#f97316">ON FIRE</b>':''}</span>`)}}catch(e){}return s}}
// ---------- after every game: insurance bill ----------
{const _cx=careerXP;careerXP=function(...a){const r=_cx.apply(this,a);try{if(CAR()&&R.me&&feat('hood')&&dmgOn()&&R.hood&&R.hood.ins){const h=HCAR(),ids=Object.keys(h.ins).filter(id=>h.cars[id]&&HD_CAR[id]);
  if(ids.length){h.insDue=(+h.insDue||0)+ids.reduce((s,id)=>s+HD_CAR[id].p*HD_INS,0);const bill=Math.floor(h.insDue*100+1e-6)/100;if(bill>=.01){hdPay(`Car insurance (${ids.length} car${ids.length==1?'':'s'})`,-bill);h.insDue=Math.max(0,h.insDue-bill)}}}}catch(e){console.error(e)}return r}}
