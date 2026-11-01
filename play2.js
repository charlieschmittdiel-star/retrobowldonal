'use strict';
// Deeper football on the field: defenders read the QB's eyes and jump routes, the offensive line pulls and climbs
// to linebackers on runs (with a running-lane arrow for your back), receivers cut sharper and settle in curls,
// and tackles vary: ankle tackles, gang tackles, and runners who fight for extra yards. Each has a switch.
{const add=[['On the field','cover2','Smarter pass coverage','Defenders read the QB\'s eyes, break on throws and can jump a route for an interception or a deflection.'],
 ['On the field','oline2','Smarter offensive line','A guard pulls on runs, linemen climb to the linebackers, and an arrow shows your running back the open lane.'],
 ['On the field','route2','Sharper routes','Better receivers cut sharper, and curl routes sit down facing the QB.'],
 ['On the field','tackle2','Tackle variety','Ankle tackles from behind, gang tackles, and strong runners who drive forward for extra yards.']];
 const i=FEATS.findIndex(f=>f[0]=='Smarter CPU');FEATS.splice(i<0?FEATS.length:i,0,...add.filter(a=>!FEATS.some(f=>f[1]==a[1])))}
// ---------- coverage: reading the QB's eyes, jumping routes ----------
function eyesTarget(){const b=P.b;if(b.st!='qb'||P.run||P.scr)return null;if(G.poss=='U'){if(P.aim&&qbIsMe()){const t=aimT();return{x:t[0],y:t[1]}}return null}return P.look?{x:P.look.x,y:P.look.y}:null}
function bzAt(b,f){const pk=Math.min(9,Math.hypot(b.tx-b.sx,b.ty-b.sy)*.18)*(b.arc||1);return 1.2+4*pk*f*(1-f)}
function covPre(dt){if(!feat('cover2'))return;const t=eyesTarget(),d=G.dir,L=P.L,b=P.b;
 if(b.st=='air'){P.def.forEach(p=>{p.ucpt=null;if(p.eng||p.fall||p.ucut||(p.t=='U'&&p===cd&&G.poss!='U')||!(b.t>p.rt)||!p.smart)return;const left=b.T-b.t;if(left<.15)return;
  for(let f=Math.max(.4,b.t/b.T+.05);f<=.88;f+=.06){if(bzAt(b,f)>3.3)continue;const x=b.sx+(b.tx-b.sx)*f,y=b.sy+(b.ty-b.sy)*f,dd=Math.hypot(p.x-x,p.y-y);if(dd>8)continue;if(dd/(p.spd*1.05)<=b.T*f-b.t){if(Math.hypot(x-b.tx,y-b.ty)>1.4){p.ucpt=[x,y];p.bite=dt*1.01}break}}})}
 P.def.forEach(p=>{p.zsv=null;if(!p.zone||!t||p.rush||p.eng)return;const read=p.t=='C'?.25+.7*IQ():.75;if(!p.smart||rnd()>read*1.4)return;
 const zx=p.zone[0],zy=p.zone[1],dd=Math.hypot(t.x-zx,t.y-zy);if(dd>14)return;const k=Math.min(3,dd*.35);p.zsv=p.zone;p.zone=[zx+(t.x-zx)/dd*k,zy+(t.y-zy)/dd*k]})}
function covPost(dt){P.def.forEach(p=>{if(p.zsv){p.zone=p.zsv;p.zsv=null}if(p.ucpt&&P.b.st=='air'&&!P.over){mv(p,p.ucpt[0],p.ucpt[1],p.spd*1.05,dt);p.bite=0}});const b=P.b;if(!feat('cover2')||b.st!='air'||P.over)return;const f=b.t/b.T;if(f<.25||f>.9)return;
 if(bzAt(b,f)>3.4)return;
 for(const p of P.def){if(p.ucut||p.eng||p.fall||(p.stun>0)||dist(p,b)>1.05)continue;p.ucut=1;const read=p.t=='C'?.7+.4*IQ():.95,sk=p.sk||{awr:60,skl:60},r=rnd();
  const pi=clamp(.17+((sk.awr+sk.skl)/2-60)/220,.08,.34)*read,pd=.38;if(r<pi){p.an={k:'catch',t:0,d:.35};return intReturn({x:b.x,y:b.y},p)}if(r<pi+pd){G.msg='Broken up in the passing lane!';p.an={k:'catch',t:0,d:.3};return tip({x:b.x,y:b.y})}}}
// ---------- offensive line: pulling guard, climbing to linebackers, lane arrow ----------
function olSnap(){if(!feat('oline2')||!P.run||P.kr)return;const O=P.off,h=O[P.ho||5],side=Math.sign(h.y-26.5)||(rnd()<.5?1:-1),g=side>0?O[7]:O[9];if(!g)return;g.pull={t:0,y:clamp(O[side>0?10:6].y+side*2.5,3,50)}}
function olPre(){P.off.forEach(o=>{o.olsv=o.pull&&o.pull.t<.55?[o.x,o.y]:null})}
function olPost(dt){if(!feat('oline2')||P.kr)return;const d=G.dir,L=P.L,O=P.off,D=P.def;
 O.forEach(o=>{if(o.olsv){o.pull.t+=dt;o.x=o.olsv[0];o.y=o.olsv[1];if(o.eng){o.eng.eng=null;o.eng=null}mv(o,L-d*1.4,o.pull.y,o.spd*1.15,dt)}});
 if(P.run&&P.t>.6)O.slice(6).forEach(o=>{if(o.eng||o.olsv)return;const lb=D.slice(4,7).filter(p=>!p.eng&&!p.fall&&dist(p,o)<9).sort((a,c)=>dist(a,o)-dist(c,o))[0];if(lb){o.tg=lb;o.rt=.3}})}
function laneBest(c){const d=G.dir,L=P.L,D=P.def.filter(p=>!p.eng&&!p.fall);let best=null,bs=-1;for(let y=Math.max(4,c.y-12);y<=Math.min(49,c.y+12);y+=1.5){const x=L+d*1,s=Math.min(9,...D.map(p=>Math.hypot(p.x-x,p.y-y)))-Math.abs(y-c.y)*.08;if(s>bs){bs=s;best=[x,y]}}return best}
// ---------- receivers: sharp cuts, curls sit down ----------
function rtSetup(){if(!feat('route2')||!P)return;P.off.slice(1,6).forEach(r=>{r.tr=9+(((r.sk&&r.sk.skl)||60)-60)/12})}
function rtPre(){if(!feat('route2')||P.run||P.scr)return;const d=G.dir,q=P.off[0];P.off.slice(1,6).forEach(r=>{const R_=r.route;if(!R_||R_.length<2||r.ri<R_.length||P.b.st=='air')return;const a=R_[R_.length-2],e=R_[R_.length-1];if((e[0]-a[0])*d<-.5){r.ld=[0,0];r.fa=Math.atan2(q.y-r.y,q.x-r.x)}})}
// ---------- tackles: ankle tackles, gang tackles, extra yards ----------
{const _rt=ragTackle;ragTackle=function(p,h){_rt(p,h);try{if(!feat('tackle2')||!h.fall||!p.fall||!P)return;const d=G.dir,v=Math.hypot(h.vx||0,h.vy||0),behind=v>3&&((h.vx||0)*(p.x-h.x)+(h.vy||0)*(p.y-h.y))<0;P.xtra=0;
 if(behind&&p.hs<=0&&rnd()<.6){p.fall.wrap=null;p.fall.lag=0;p.fall.dur=.3;p.fall.vx=(h.x-p.x)*4;p.fall.vy=(h.y-p.y)*4;p.an={k:'dive',t:0,d:2};h.fall.lag=.12;h.fall.dur=.55;h.fall.vx+=d*2.6;P.xtra=1.1;P.tkType='ankle'}
 else if(p.hs<=0&&h.sk&&p.sk){const ex=clamp((h.sk.str-p.sk.str)/25+rnd()*.6-.15,0,2.2);if(ex>.3){h.fall.lag+=.18;h.fall.vx+=d*ex*2.2;p.fall.lag+=.1;P.xtra=ex;P.tkType='drive'}}
 const g=P.def.filter(q=>q!==p&&!q.fall&&!q.eng&&!q.gone&&dist(q,h)<2.3).sort((a,c)=>dist(a,h)-dist(c,h))[0];
 if(g){const dx=h.x-g.x,dy=h.y-g.y,m=Math.hypot(dx,dy)||1;g.fall={t:0,lag:.14,dur:.5,vx:h.fall.vx*.8,vy:h.fall.vy*.8,wrap:h,ox:-dx/m*.5,oy:-dy/m*.5};FALLS.push(g);P.tkType=P.tkType||'gang';P.gang=g}}catch(e){console.error(e)}}}
{const _ep=endPlay;endPlay=function(k,x){if(P&&!P.over&&k=='tackle'&&P.xtra>0&&!P.oob&&feat('tackle2')&&x!=null){const d=G.dir,gl=d>0?110:10;x+=d*P.xtra;if((x-gl)*d>=0)k='td'}
 const t=P&&P.tkType,ex=P&&P.xtra,tk=P&&P.tkl,c=P&&P.b.c;_ep(k,x);if(P&&P.over&&t&&feat('pbp')&&c){xLog(t=='ankle'?`${xNm(tk)} trips him up from behind.`:t=='gang'?'Gang tackle!':`${xNm(c)} drives forward for ${Math.round(ex)} more yard${Math.round(ex)==1?'':'s'}.`)}if(P)P.tkType=null}}
// ---------- hooks ----------
{const _sn=snap;snap=function(){const was=G.phase;_sn();if(was!='play'&&G.phase=='play'&&P&&!P.over){P.def.forEach(p=>p.ucut=0);try{olSnap()}catch(e){}}}}
{const _su=setup;setup=function(){_su();try{rtSetup()}catch(e){}}}
{const _st=step;step=function(dt){if(G.phase=='play'&&P&&!P.over){try{covPre(dt);olPre();rtPre()}catch(e){console.error(e)}}_st(dt);if(G.phase=='play'&&P){try{olPost(dt);covPost(dt)}catch(e){console.error(e)}}}}
{const _dr=draw;draw=function(){_dr();try{if(!feat('oline2')||G.phase!='play'||!P||!P.run||P.kr)return;const b=P.b,c=b.st=='carry'?b.c:null;if(!c||c.t!='U'||(c.x-P.L)*G.dir>1||P.t>2.6)return;if(CAR()&&c.pid!==R.me)return;
 const l=laneBest(c);if(!l)return;const a=P2(c.x,c.y),e=P2(l[0],l[1]);X.save();X.globalAlpha=.55;X.strokeStyle='#fde047';X.lineWidth=4;X.setLineDash([8,6]);X.beginPath();X.moveTo(a[0],a[1]);X.lineTo(e[0],e[1]);X.stroke();X.setLineDash([]);
 const ang=Math.atan2(e[1]-a[1],e[0]-a[0]);X.fillStyle='#fde047';X.beginPath();X.moveTo(e[0]+Math.cos(ang)*10,e[1]+Math.sin(ang)*10);X.lineTo(e[0]+Math.cos(ang+2.5)*9,e[1]+Math.sin(ang+2.5)*9);X.lineTo(e[0]+Math.cos(ang-2.5)*9,e[1]+Math.sin(ang-2.5)*9);X.fill();X.restore()}catch(e){}}}
