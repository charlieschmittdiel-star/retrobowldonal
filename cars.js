'use strict';
// Neighborhood stage 2: cars and driving. Buy cars at Miller Motors, pick one as your ride and drive it around town.
// Your ride gives small perks (a little fame after each game, bigger new sponsor offers), every car you own costs
// upkeep after each game, and driving uses gas (fill up at the Fuel Stop). Car and shop names are made up.
// This file wraps functions from hood.js and life.js and leaves the originals alone. Load it after hood.js.
{const add=[['Career','cars','Cars and driving','Buy cars at the Neighborhood car dealer and drive them around town. Your ride brings a little fame and bigger sponsor offers, but every car costs upkeep each game and driving uses gas.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
// n name, p price ($M), top speed and acc (map units), tank (cost of a full tank, $M), rng (distance on a full tank),
// fame (added after each game while it's your ride), spon (extra pay on new sponsor offers), c color
const HD_CAR={hatch:{n:'Used hatchback',p:.04,top:430,acc:330,tank:.01,rng:20000,fame:0,spon:0,c:'#94a3b8',d:'Gets you from A to B.'},
 sedan:{n:'Family sedan',p:.09,top:480,acc:380,tank:.01,rng:18000,fame:0,spon:0,c:'#2563eb',d:'Comfy and reliable.'},
 pickup:{n:'Pickup truck',p:.16,top:470,acc:360,tank:.02,rng:14000,fame:.1,spon:0,c:'#b91c1c',d:'Drives fine on grass too.',grass:.85},
 sport:{n:'Sports coupe',p:.45,top:650,acc:560,tank:.03,rng:13000,fame:.3,spon:.04,c:'#facc15',d:'Quick and loud.'},
 suv:{n:'Luxury SUV',p:.7,top:540,acc:420,tank:.04,rng:14000,fame:.3,spon:.06,c:'#111827',d:'Sponsors love a classy ride.',grass:.75},
 super:{n:'Supercar',p:2,top:760,acc:700,tank:.06,rng:10000,fame:.5,spon:.1,c:'#ea580c',d:'Everyone in town turns to look.'}};
const HD_UPK=.012;                                   // upkeep (insurance and maintenance) after each game, as a share of the car's price
const HD_SELL=.6;                                    // the dealer buys a car back for this share of its price
const HD_HOMESPOT={x:250,y:722,a:Math.PI},HD_DEALSPOT={x:400,y:768,a:0};
const HD_PUMP={x:410,y:1075,w:200,h:150};
const HD_ROADS=[[0,678,2400,134],[1078,0,134,1600],[0,1238,1100,114],[680,840,400,330],[HD_PUMP.x,HD_PUMP.y,HD_PUMP.w,HD_PUMP.h]];
// the gas station kiosk joins the buildings, and the dealer opens
HDBLD.push({k:'gas',n:'Fuel Stop',ic:'⛽',x:220,y:1080,w:160,h:120,door:'s',roof:'#ca8a04'});
{const d=HDBLD.find(b=>b.k=='cars');if(d)d.soon=null}
// ---------- save data (made when first needed) ----------
function HCAR(){const h=HDS();if(!h.cars||typeof h.cars!='object')h.cars={};if(!h.gas||typeof h.gas!='object')h.gas={};if(h.ride&&!h.cars[h.ride])h.ride=null;if(h.ride===undefined)h.ride=null;h.due=+h.due||0;return h}
const hdRide=()=>{if(!feat('cars')||!R||!R.hood)return null;const h=R.hood;return h.ride&&h.cars&&h.cars[h.ride]&&HD_CAR[h.ride]?HD_CAR[h.ride]:null};
const hdGas=id=>{const h=HCAR(),v=h.gas[id];return v==null?100:clamp(+v,0,100)};
const hdMph=v=>Math.round(v/6);
const hdSmall$=v=>v<.001?`$${Math.round(v*1e6)}`:HM$(v);
function hdFillCost(id){const c=HD_CAR[id],g=hdGas(id);if(!c||g>=99.5)return 0;return Math.max(.01,Math.ceil((100-g)/100*c.tank*100-1e-9)/100)}
function hdCarFree(x,y,a){const c=Math.cos(a),s=Math.sin(a);return!hdSolid(x,y,14)&&!hdSolid(x+c*24,y+s*24,11)&&!hdSolid(x-c*24,y-s*24,11)}
const hdOnRoad=(x,y)=>HD_ROADS.some(r=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3]);
const hdAtPump=(x,y)=>x>=HD_PUMP.x&&x<=HD_PUMP.x+HD_PUMP.w&&y>=HD_PUMP.y&&y<=HD_PUMP.y+HD_PUMP.h;
// ---------- the gas station on the map ----------
{const _hb=hdBake;hdBake=function(...a){const c=_hb.apply(this,a);try{if(!c._gas){c._gas=1;const g=c.getContext('2d');if(g&&g.fillRect){const P=HD_PUMP,F=(col,x,y,w,h)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
 F('#9ca3af',P.x,P.y,P.w,P.h);F('#4b5563',P.x,P.y+P.h-8,P.w,8);g.strokeStyle='#e5e7eb';g.lineWidth=2;g.strokeRect(P.x+4,P.y+4,P.w-8,P.h-8);
 g.fillStyle='#00000030';g.fillRect(P.x+18,P.y+22,P.w-28,P.h-40);g.strokeStyle='#ca8a04';g.lineWidth=5;g.strokeRect(P.x+12,P.y+16,P.w-24,P.h-36);
 [P.y+48,P.y+96].forEach(y=>{F('#e5e7eb',P.x+40,y-6,P.w-80,12);[P.x+64,P.x+P.w-64].forEach(x=>{F('#dc2626',x-7,y-10,14,20);F('#111827',x-4,y-6,8,6)})});
 const b=HDBLD.find(x=>x.k=='gas');if(b){F('#00000040',b.x+8,b.y+10,b.w,b.h);F(b.roof,b.x,b.y,b.w,b.h-38);g.strokeStyle='#00000055';g.lineWidth=4;g.strokeRect(b.x+2,b.y+2,b.w-4,b.h-42);
  F('#efe6d2',b.x,b.y+b.h-38,b.w,38);F('#7dd3fc',b.x+12,b.y+b.h-29,30,18);F('#7dd3fc',b.x+b.w-42,b.y+b.h-29,30,18);F('#3f2a1a',b.x+b.w/2-18,b.y+b.h-32,36,32);hdSign(g,b.x+b.w/2,b.y+(b.h-38)/2,`${b.ic} ${b.n}`,15)}
 hdSign(g,P.x+P.w/2,P.y-14,'Pumps: drive in, press E',13,'#5b3a1ecc')}}}catch(e){console.error(e)}return c}}
// ---------- the car on the map ----------
function hdCarPlace(spot){const h=HCAR(),s=spot||HD_HOMESPOT;h.car={x:s.x,y:s.y,a:s.a};if(HD&&h.ride)HD.car={id:h.ride,x:s.x,y:s.y,a:s.a,v:0}}
{const _hu=hoodUI;hoodUI=function(...a){const r=_hu.apply(this,a);try{if(!HD)return r;HD.drive=0;HD.keys0=($('hdkeys')||{}).textContent;HD.horn=0;HD.wreck=0;
 const h=HCAR();if(h.ride&&HD_CAR[h.ride]){const c=h.car&&hdCarFree(h.car.x,h.car.y,h.car.a)?h.car:HD_HOMESPOT;HD.car={id:h.ride,x:c.x,y:c.y,a:c.a,v:0}}else HD.car=null;hdKeysTxt()}catch(e){console.error(e)}return r}}
function hdCarSave(){if(!HD||!HD.car)return;const h=HCAR();h.car={x:Math.round(HD.car.x),y:Math.round(HD.car.y),a:Math.round(HD.car.a*100)/100}}
function hdKeysTxt(){const el=$('hdkeys');if(!el||!HD)return;el.textContent=HD.drive?'W gas · S brake / reverse · A D steer · Space handbrake · ↑ horn · F get out · E fill up at the pumps · H wallet · Esc leave':(HD.keys0||'')+(HD.car&&feat('cars')?' · F get in your car':'')}
function hdGetIn(){const C=HD.car;if(!C)return;if(!feat('cars'))return hdToast('Cars are switched off on the Game features page.');HD.drive=1;C.v=0;HD.me.x=C.x;HD.me.y=C.y;hdKeysTxt();
 const g=hdGas(C.id);hdToast(g<=0?'Out of gas! You can creep to the Fuel Stop, or walk there and send a fuel truck.':`${HD_CAR[C.id].n}. Gas ${Math.round(g)}%.`)}
function hdGetOut(){const C=HD.car;if(!C)return;if(Math.abs(C.v)>60)return hdToast('Slow down first.');const c=Math.cos(C.a),s=Math.sin(C.a);
 const spots=[[-s*30,c*30],[s*30,-c*30],[-c*44,-s*44],[c*44,s*44],[-s*46,c*46],[s*46,-c*46]];const o=spots.find(([dx,dy])=>!hdSolid(C.x+dx,C.y+dy,10));if(!o)return hdToast('No room to get out here.');
 C.v=0;HD.drive=0;HD.me.x=C.x+o[0];HD.me.y=C.y+o[1];HD.me.a=C.a;hdCarSave();hdKeysTxt()}
function hdCarStep(dt){const C=HD.car,me=HD.me;if(!C||!feat('cars')){HD.drive=0;hdKeysTxt();return}const K=HD_CAR[C.id],h=HCAR();let gas=hdGas(C.id);
 const thr=HD.pan?0:(HDK.w?1:0)-(HDK.s?1:0),st=HD.pan?0:(HDK.d?1:0)-(HDK.a?1:0),road=hdOnRoad(C.x,C.y),top=K.top*(road?1:(K.grass||.55))*(gas<=0?.2:1);
 if(thr>0)C.v+=(C.v<0?900:K.acc)*dt;else if(thr<0)C.v-=(C.v>0?900:K.acc*.6)*dt;else C.v*=Math.max(0,1-1.1*dt);
 if(HDK[' ']&&!HD.pan)C.v*=Math.max(0,1-4*dt);if(Math.abs(C.v)<4&&!thr)C.v=0;
 if(C.v>top)C.v=Math.max(top,C.v-900*dt);if(C.v<-top*.35)C.v=-top*.35;
 C.a+=st*dt*2.7*clamp(C.v/170,-1,1);
 const nx=C.x+Math.cos(C.a)*C.v*dt,ny=C.y+Math.sin(C.a)*C.v*dt;
 if(hdCarFree(nx,ny,C.a)){const d=Math.hypot(nx-C.x,ny-C.y);C.x=nx;C.y=ny;gas=Math.max(0,gas-d/K.rng*100);h.gas[C.id]=Math.round(gas*100)/100}
 else{if(Math.abs(C.v)>220)hdToast('Bonk!');C.v*=-.3}
 me.x=C.x;me.y=C.y;me.a=C.a;me.mv=0;HD.hudT+=dt*3;if(HD.horn>0)HD.horn-=dt;if(HD.wreck>0)HD.wreck-=dt;
 // people on the sidewalk: a fancy ride gets noticed, a near miss gets filmed
 const sp=Math.abs(C.v);HD.npc.forEach(n=>{const dd=Math.hypot(n.x-C.x,n.y-C.y);
  if(dd<34&&sp>200){n.say='Hey! Watch it!';n.sayT=2;n.stop=1.5;n.cool=8;if(HD.wreck<=0){HD.wreck=25;fameAdd(-1);hdToast('Someone filmed that near miss. -1 fame.')}}
  else if(dd<120&&n.cool<=0&&K.fame>=.3&&sp<260&&rnd()<dt*2){n.say=['Nice car!','Whoa, look at that ride!','Is that '+(meRow()||{n:'him'}).n.split(' ')[0]+'?!'][rnd()*3|0];n.sayT=2.4;n.cool=16}})}
function hdCarDraw(g,all){const C=HD.car;if(!C||!feat('cars'))return;const K=HD_CAR[C.id];if(!K)return;all.push([C.y,()=>{if(!HD.drive){g.strokeStyle=(teamCol(0)||['#fff'])[0]+'99';g.lineWidth=3;g.beginPath();g.ellipse(C.x,C.y,40,28,C.a,0,7);g.stroke()}
 g.save();g.translate(C.x,C.y);g.scale(.62,.62);hdCarTop(g,0,0,C.a,K.c);g.restore()}])}
function hdCarUI(g){const C=HD.car;if(!C||!feat('cars')||HD.pan)return;
 if(HD.drive){if(hdAtPump(C.x,C.y))hdBubble(g,C.x,C.y-30,'E  Fill up',1);if(HD.horn>0)hdBubble(g,C.x+30,C.y-34,'BEEP!')}
 else if(Math.hypot(HD.me.x-C.x,HD.me.y-C.y)<60&&!HD.near)hdBubble(g,C.x,C.y-34,`F  Get in your ${HD_CAR[C.id].n.toLowerCase()}`,1)}
function hdCarKey(k){if(!HD)return false;const C=HD.car;
 if(k=='f'){if(!C)return hdToast('You don\'t have a car yet. Miller Motors is across the street from your place.'),true;if(HD.drive)hdGetOut();else if(Math.hypot(HD.me.x-C.x,HD.me.y-C.y)<70)hdGetIn();else hdToast('Walk over to your car first (it has a ring around it).');return true}
 if(!HD.drive)return false;
 if(k=='e'||k=='enter'){if(hdAtPump(C.x,C.y)){C.v=0;hdFuel()}else hdToast('Get out first (F) to go inside. At the Fuel Stop pumps, E fills up.');return true}
 if(k=='arrowup'){HD.horn=.5;HD.npc.forEach(n=>{if(Math.hypot(n.x-C.x,n.y-C.y)<160){n.stop=Math.max(n.stop,1);if(n.sayT<=0){n.say=['!','Huh?','Beep beep!'][rnd()*3|0];n.sayT=1.2}}})}
 return k.startsWith('arrow')}
function hdHudX(){const K=hdRide();if(!K||!HD||!HD.car)return'';const g=Math.round(hdGas(HD.car.id));return`<span class="small">${K.n} · gas <b style="color:${g<20?'#ff8f7a':'#9be89b'}">${g}%</b>${HD.drive?` · ${hdMph(Math.abs(HD.car.v))} mph`:''}</span>`}
// ---------- buildings: the dealer, the Fuel Stop, and your garage at home ----------
{const _he=hdEnter;hdEnter=function(k,note,...a){if(k=='cars'||k=='gas'){if(!HD)return;if(!feat('cars')){const b=HDBLD.find(x=>x.k==k);return hdPanel(k,`${b.ic} ${b.n}`,'<p>Closed. Cars are switched off on the Game features page (Cars and driving).</p>')}return k=='cars'?hdDealer(note):hdFuel(note)}return _he.call(this,k,note,...a)}}
function hdCarPerks(K){const a=[];if(K.fame)a.push(`+${K.fame} fame after each game`);if(K.spon)a.push(`+${Math.round(K.spon*100)}% on new sponsor offers`);if(K.grass)a.push('good on grass');return a.length?a.join(', '):'No perks, just wheels'}
function hdDealer(note){const h=HCAR();let body=`<p class="small dim">Your ride is the car you drive. Only your ride gives perks, but <b>every car you own costs upkeep</b> after each game. The dealer buys cars back for ${Math.round(HD_SELL*100)}% of the price.</p><h3>For sale</h3>`;
 Object.keys(HD_CAR).forEach(id=>{const K=HD_CAR[id],own=h.cars[id],ride=h.ride==id;
  const btn=ride?`<span class="good">Your ride</span> ${hdBtn(`hdSell('${id}')`,'Sell')}`:own?hdBtn(`hdRideSet('${id}','dealer')`,'Drive it')+' '+hdBtn(`hdSell('${id}')`,'Sell'):hdBtn(`hdBuyCar('${id}')`,'Buy',hdCan(K.p));
  body+=hdRow(`${hdSw(K.c)}${K.n}`,`${K.d} Top speed ${hdMph(K.top)} mph. ${hdCarPerks(K)}. Upkeep ${hdSmall$(K.p*HD_UPK)} a game, full tank ${HM$(K.tank)}.`,HM$(K.p),btn,ride?'own':own?'own':'')});
 hdPanel('cars','🚗 Miller Motors',body,note)}
function hdBuyCar(id){const K=HD_CAR[id],h=HCAR();if(!K||h.cars[id])return hdDealer();if(!hdCan(K.p))return hdDealer('Not enough money yet.');
 hdPay(`Bought a car: ${K.n}`,-K.p);h.cars[id]=R.season;h.gas[id]=100;h.ride=id;hdCarPlace(HD_DEALSPOT);if(K.fame>=.3){fameAdd(1);addNews(`${meRow().n} shows up in a new ${K.n.toLowerCase()}.`)}save();hdKeysTxt();
 hdDealer(`The ${K.n.toLowerCase()} is yours. It's parked out front: walk to it and press F to get in.`)}
function hdRideSet(id,where){const h=HCAR();if(!h.cars[id])return;h.ride=id;hdCarPlace(where=='dealer'?HD_DEALSPOT:HD_HOMESPOT);save();hdKeysTxt();
 if(where=='dealer')hdDealer(`Your ${HD_CAR[id].n.toLowerCase()} is out front.`);else hdHome(`Your ${HD_CAR[id].n.toLowerCase()} is parked at the curb.`)}
function hdSell(id){const K=HD_CAR[id],h=HCAR();if(!K||!h.cars[id])return hdDealer();const v=hdC(K.p*HD_SELL);if(!confirm(`Sell your ${K.n.toLowerCase()} for ${HM$(v)}?`))return hdDealer();
 delete h.cars[id];delete h.gas[id];hdPay(`Sold a car: ${K.n}`,v);if(h.ride==id){h.ride=null;h.car=null;if(HD)HD.car=null}save();hdKeysTxt();hdDealer(`Sold for ${HM$(v)}.`)}
function hdFuel(note){const h=HCAR(),id=h.ride,K=id&&HD_CAR[id];if(!K)return hdPanel('gas','⛽ Fuel Stop','<p>You don\'t have a car yet. Miller Motors sells them.</p>',note);
 const g=Math.round(hdGas(id)),cost=hdFillCost(id),C=HD.car,at=HD.drive&&C&&hdAtPump(C.x,C.y);
 let body=`<p>${K.n}: gas <b>${g}%</b>. A full tank costs ${HM$(K.tank)}.</p>`;
 if(!cost)body+='<p class="good">Your tank is full.</p>';
 else if(at)body+=hdRow('Fill up',`To 100%.`,HM$(cost),hdBtn('hdFill(0)','Fill up',hdCan(cost)));
 else body+=`<p class="small dim">Drive your car onto the pumps and press E to fill up.</p>`+hdRow('Send a fuel truck to your car','Fills your tank wherever it is. Costs the gas plus a $10K service fee.',HM$(cost+.01),hdBtn('hdFill(1)','Send it',hdCan(cost+.01)));
 hdPanel('gas','⛽ Fuel Stop',body,note)}
function hdFill(truck){const h=HCAR(),id=h.ride;if(!id)return hdFuel();const cost=hdFillCost(id)+(truck?.01:0);if(!cost)return hdFuel();if(!hdCan(cost))return hdFuel('Not enough money yet.');
 hdPay(truck?`Fuel truck: ${HD_CAR[id].n}`:`Gas: ${HD_CAR[id].n}`,-cost);h.gas[id]=100;save();hdFuel('Tank full.')}
{const _hh=hdHome;hdHome=function(...a){const r=_hh.apply(this,a);try{const pb=$('hdpan')&&$('hdpan').querySelector('.hdpb');if(!pb||!feat('cars'))return r;const h=HCAR(),ids=Object.keys(h.cars).filter(id=>HD_CAR[id]);
 pb.insertAdjacentHTML('beforeend',`<h3>Garage</h3>`+(ids.length?ids.map(id=>{const K=HD_CAR[id];return hdRow(`${hdSw(K.c)}${K.n}`,`Gas ${Math.round(hdGas(id))}%. ${hdCarPerks(K)}.`,'',h.ride==id?'<span class="good">Your ride</span>':hdBtn(`hdRideSet('${id}','home')`,'Drive this one'),h.ride==id?'own':'')}).join(''):'<p class="dim">No cars yet. Miller Motors is across the street.</p>'))}catch(e){console.error(e)}return r}}
{const _ha=hdAgency;hdAgency=function(...a){const r=_ha.apply(this,a);try{const pb=$('hdpan')&&$('hdpan').querySelector('.hdpb'),K=hdRide();if(pb&&K&&K.spon)pb.insertAdjacentHTML('beforeend',`<p class="small good">Your ${K.n.toLowerCase()} adds +${Math.round(K.spon*100)}% to new sponsor offers.</p>`)}catch(e){console.error(e)}return r}}
// ---------- after every game: upkeep for every car you own, fame from your ride ----------
{const _cx=careerXP;careerXP=function(...a){const r=_cx.apply(this,a);try{if(CAR()&&R.me&&feat('hood')&&feat('cars')&&R.hood&&R.hood.cars){const h=HCAR(),ids=Object.keys(h.cars).filter(id=>HD_CAR[id]);
  if(ids.length){h.due+=ids.reduce((s,id)=>s+HD_CAR[id].p*HD_UPK,0);const bill=Math.floor(h.due*100+1e-6)/100;if(bill>=.01){hdPay(`Car upkeep (${ids.length} car${ids.length==1?'':'s'})`,-bill);h.due=Math.max(0,h.due-bill)}}
  const K=hdRide();if(K&&K.fame)fameAdd(K.fame)}}catch(e){console.error(e)}return r}}
// ---------- bigger sponsor offers with a classy ride ----------
{const _mo=mkOffer;mkOffer=function(...a){const o=_mo.apply(this,a);try{const K=feat('hood')&&hdRide();if(o&&K&&K.spon){o.pay=Math.round(o.pay*(1+K.spon)*100)/100;o.bon=Math.round(o.bon*(1+K.spon)*100)/100}}catch(e){console.error(e)}return o}}
// ---------- the career home's Neighborhood card shows your ride ----------
{const _ch=careerHub;careerHub=function(...a){const r=_ch.apply(this,a);try{const K=feat('hood')&&hdRide();if(!K||(G&&G.live))return r;const d=$('modal').querySelector('.dash');if(!d)return r;
 const c=[...d.children].find(x=>/^Neighborhood/.test((x.querySelector('h4')||{}).textContent||''));if(c){const b=c.querySelector('.btns');(b||c).insertAdjacentHTML('beforebegin',`<p class="small">Your ride: <b>${K.n}</b> · gas ${Math.round(hdGas(R.hood.ride))}%</p>`)}}catch(e){console.error(e)}return r}}
