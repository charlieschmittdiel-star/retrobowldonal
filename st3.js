'use strict';
// Special teams, part 3: special teams get their own "Special" tab in the play picker, kick returns and kickoffs are
// plays you call (return schemes with blockers, walls and a return lane; deep, squib, sky and onside kicks), a pooch
// punt, and a special teams coach who works out punt / field goal / go for it with real odds. The CPU makes the same
// calls (smarter on higher difficulties). Plays from the Special teams designer (std.js) show up here too.
{const add=[['Playbook','stbook','Special teams tab','Punts, field goals, fakes, blocks and punt returns get their own Special tab in the play picker, and move to the front on 4th down.'],
 ['Playbook','stret','Return and kickoff calls','Before every kickoff you pick a play: a return scheme when you receive (Middle, Left, Right, Wedge, Fair catch) or a kick when you kick (Deep, Squib, Sky, Onside). Blockers set up and block for the return you called. The CPU calls them too.'],
 ['Playbook','stcoach','Special teams coach','On 4th down the coach shows the odds for going for it, kicking a field goal and punting, and recommends one. He also picks returns and kickoffs. The CPU uses the same math, more often on higher difficulties.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}

// ---------- plays ----------
// Return plays are drawn from the returner's view: x = yards in front of the catch (toward the kicking team),
// y = across the field from the returner's left (0) to his right (53.3). Jobs: w = hold a wall spot and block whoever
// comes, e = escort (stay in front of the returner), m = block coverage man number arg (0 = far left ... 10 = far right),
// f = block whoever is closest. lane = where the returner runs. fc = fair catch / safe hands.
const fyS=(y,f)=>f>0?y:53.3-y;
const SR_STOCK={
 'Return Middle':{p:[[9,15,'m',2],[9,21,'m',3],[9,26.5,'m',4],[9,32,'m',6],[9,38,'m',7],[5,11,'m',1],[5,42,'m',8],[7,47,'m',9],[2.5,23.5,'e'],[2.5,29.8,'e']],lane:[[8,26.5],[22,26.5],[45,26.5]]},
 'Return Left':{p:[[3,18],[5.5,18],[8,18.5],[10.5,19],[13,19.5],[8,7,'m',0],[10,11,'m',1],[9,23,'m',2],[2.5,23,'e'],[3,14,'e']].map(q=>q.length==2?[q[0],q[1],'w']:q),lane:[[4,22],[9,12],[25,8],[50,8]]},
 'Wedge':{p:[[6,23,'w'],[6,30.3,'w'],[8.5,20,'w'],[8.5,33.3,'w'],[9,9,'m',1],[9,16,'m',2],[9,24,'m',4],[9,30,'m',6],[9,37,'m',8],[9,44,'m',9]],lane:[[10,26.5],[25,26.5],[45,26.5]]},
 'Fair Catch':{fc:1,p:[[12,10,'f'],[12,18,'f'],[12,26.5,'f'],[12,35,'f'],[12,43,'f'],[5,8,'f'],[5,19,'f'],[5,34,'f'],[5,45,'f'],[3,26.5,'f']],lane:[]}};
{const L=SR_STOCK['Return Left'],R={p:L.p.map(q=>{const r=[q[0],53.3-q[1],q[2]];if(q[2]=='m')r[3]=10-q[3];return r}),lane:L.lane.map(w=>[w[0],53.3-w[1]])};
 const o={};['Return Middle','Return Left'].forEach(n=>o[n]=SR_STOCK[n]);o['Return Right']=R;o['Wedge']=SR_STOCK['Wedge'];o['Fair Catch']=SR_STOCK['Fair Catch'];
 for(const k in SR_STOCK)delete SR_STOCK[k];Object.assign(SR_STOCK,o)}
// Kickoffs: t = deep / squib / sky / onside, ax = landing spot in yards from the receiving goal line (negative = in the
// end zone), ay = across the field from the kicker's left. Stock kicks leave ax/ay empty (normal spread).
const SK_STOCK={'Deep':{t:'deep'},'Squib':{t:'squib'},'Sky Kick':{t:'sky'},'Onside':{t:'onside'}};
const SK_INFO={deep:'Booms it toward the end zone. Usually the best field position.',squib:'A low, bouncing kick to the 20-30. Hard to field and hard to break, but they start further out.',sky:'A high pop-up to about the 15. Your coverage gets there with the ball.',onside:'Kick it 10 yards and try to get it back. Works about 1 in 4.'};
const SR_INFO={'Return Middle':'Man-up blocking across the field, straight up the middle.','Return Left':'Blockers build a wall and the returner bends it to the left sideline.','Return Right':'Blockers build a wall and the returner bends it to the right sideline.','Wedge':'Four blockers escort the returner straight ahead in a tight wedge.','Fair Catch':'Safe hands: catch it and take the ball where it lands (no return).'};
let STP={r:{},k:{}};try{const s=JSON.parse(localStorage.getItem('gdst'));if(s&&s.r&&s.k)STP=s}catch(e){}
const stSave=()=>lsSet('gdst',JSON.stringify(STP));
const stDesOn=()=>feat('stdes')&&typeof stDes=='function';
const SR_ALL=()=>Object.assign({},SR_STOCK,stDesOn()?STP.r:{}),SK_ALL=()=>{const o=Object.assign({},SK_STOCK,stDesOn()?STP.k:{});if(!feat('fakes'))delete o.Onside;return o};
const stRetOn=()=>feat('stret');

// ---------- small pictures for the cards ----------
function retSVG(pl){const X=y=>2+y*108/53.3,Y=x=>74-clamp(x,-2,36)*68/37;let s='<line x1="2" y1="6" x2="110" y2="6" stroke="#ff5a4d" stroke-width="1" stroke-dasharray="2 3"/>';
 for(let i=0;i<11;i++){const cx=X(4+i*4.5),cy=Y(33.5);s+=`<g stroke="#ff5a4d" stroke-width="1.5"><line x1="${cx-2}" y1="${cy-2}" x2="${cx+2}" y2="${cy+2}"/><line x1="${cx+2}" y1="${cy-2}" x2="${cx-2}" y2="${cy+2}"/></g>`}
 if(pl.lane&&pl.lane.length){s+=`<path d="M${X(26.5)} ${Y(0)} ${pl.lane.map(w=>'L'+X(w[1])+' '+Y(w[0])).join(' ')}" fill="none" stroke="#ffd84d" stroke-width="2" stroke-dasharray="4 3"/>`}
 (pl.p||[]).forEach(q=>{const x=X(q[1]),y=Y(q[0]);if(q[2]=='m'){const tx=X(4+q[3]*4.5),ty=Y(33.5);s+=`<line x1="${x}" y1="${y}" x2="${x+(tx-x)*.45}" y2="${y+(ty-y)*.45}" stroke="#fca5a5" stroke-width="1.2"/>`}
  s+=`<circle cx="${x}" cy="${y}" r="2.6" fill="${q[2]=='w'?'#e9e3cf':q[2]=='e'?'#93c5fd':'#fff'}"/>`});
 s+=`<circle cx="${X(26.5)}" cy="${Y(0)}" r="3.4" fill="#ffd84d" stroke="#0b1410" stroke-width="1"/>`;if(pl.fc)s+=`<text x="56" y="44" fill="#ffd84d" font-size="11" font-weight="800" text-anchor="middle" font-family="sans-serif">FAIR CATCH</text>`;
 return`<svg viewBox="0 0 112 80">${s}</svg>`}
function kickSVG(pl){const t=pl.t||'deep',X=y=>2+y*108/53.3,Y=a=>8+(a+10)*64/45;let s=`<rect x="2" y="${Y(-10)}" width="108" height="${Y(0)-Y(-10)}" fill="#ffffff14"/><line x1="2" y1="${Y(0)}" x2="110" y2="${Y(0)}" stroke="#fff" stroke-width="1.5"/>`;
 const ax=pl.ax!=null?pl.ax:t=='squib'?24:t=='sky'?14:t=='onside'?33:-2,ay=pl.ay!=null?pl.ay:26.5,ex=X(ay),ey=Y(ax),sx=56,sy=Y(35);
 const peak=t=='sky'?-28:t=='squib'?-2:t=='onside'?-1:-14;s+=`<path d="M${sx} ${sy} Q${(sx+ex)/2+(t=='squib'?6:0)} ${Math.min(sy,ey)+peak} ${ex} ${ey}" fill="none" stroke="#ffd84d" stroke-width="2" ${t=='squib'?'stroke-dasharray="3 2"':''}/>`;
 s+=`<circle cx="${ex}" cy="${ey}" r="4" fill="none" stroke="#ffd84d" stroke-width="1.6"/>`;[...Array(10)].forEach((_,i)=>{const x=X(4+i*5);s+=`<circle cx="${i<5?x:x+4}" cy="${Y(36)}" r="2.3" fill="#fff"/>`});s+=`<circle cx="${sx}" cy="${sy+3}" r="3" fill="#ffd84d"/>`;
 return`<svg viewBox="0 0 112 80">${s}</svg>`}
function stIco(k){const L='<line x1="2" y1="58" x2="110" y2="58" stroke="#7cc4ff" stroke-width="1.5"/>',o=(x,y,c)=>`<circle cx="${x}" cy="${y}" r="2.6" fill="${c||'#fff'}"/>`;let s='';const line=[...Array(7)].map((_,i)=>36+i*6.5);
 if(k=='pooch'){line.forEach(v=>s+=o(v,62));s+=o(56,72)+o(8,62)+o(104,62)+`<path d="M56 72 Q60 -10 74 14" fill="none" stroke="#ffd84d" stroke-width="1.8" stroke-dasharray="3 3"/><circle cx="74" cy="14" r="3.5" fill="none" stroke="#ffd84d"/><line x1="2" y1="8" x2="110" y2="8" stroke="#fff" stroke-width="1"/>`}
 else if(k=='fakep'||k=='fakefg'){line.forEach(v=>s+=o(v,62));s+=o(56,k=='fakep'?72:70)+o(52,76)+`<path d="M${k=='fakep'?56:52} ${k=='fakep'?72:76} Q30 60 26 30 L26 10" fill="none" stroke="#c084fc" stroke-width="2"/><text x="78" y="30" fill="#c084fc" font-size="12" font-weight="800" font-family="sans-serif">FAKE</text>`}
 else if(k=='pblk'){[30,38,46,54,62,70,78,86].forEach(v=>s+=`<g stroke="#ff5a4d" stroke-width="1.8"><line x1="${v-2.4}" y1="51.6" x2="${v+2.4}" y2="56.4"/><line x1="${v+2.4}" y1="51.6" x2="${v-2.4}" y2="56.4"/></g><line x1="${v}" y1="54" x2="${v+(56-v)*.25}" y2="62" stroke="#ff5a4d" stroke-width="1.6"/>`);s+=o(56,74)+`<path d="M56 74 Q56 64 56 62" stroke="#ffd84d" stroke-width="1.6"/>`}
 return`<svg viewBox="0 0 112 80">${L}${s}</svg>`}

// ---------- the coach's 4th-down math ----------
// Expected points for a first down at y yards from your own goal line, then each option's value: go for it, field goal
// (miss = they take over at the spot of the kick), punt (they start where it lands, minus a typical return).
const EPT=[[0,-1.2],[5,-.9],[10,-.5],[20,.3],[30,.9],[40,1.5],[50,2.1],[60,2.7],[70,3.3],[80,4],[90,4.7],[95,5.3],[100,6]];
function stEP(y){y=clamp(y,0,100);for(let i=1;i<EPT.length;i++)if(y<=EPT[i][0]){const a=EPT[i-1],b=EPT[i];return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0])}return 6}
const stTid=s=>s=='U'?0:G.opp.i;
function stConv(side){const y=G.ytg,base=[0,.7,.6,.54,.49,.45,.41,.38,.35,.33,.31][Math.min(10,y)]||.3,b=y>10?Math.max(.12,.31-(y-10)*.02):base;
 let adv=0;try{adv=(teamR(stTid(side))-teamR(stTid(side=='U'?'C':'U')))*.005}catch(e){}return clamp(b+adv,.08,.85)}
function stFGp(side,fd){const k=kickerOf(side),rg=40+(k.str-60)*.4,mx=(typeof kMaxC=='function'?kMaxC(k):58+(k.str-60)*.5)*.93;
 let p=clamp(1.05-(fd-20)*.012+(k.skl-70)*.004-Math.max(0,fd-rg)*.015,.02,.99);if(fd>mx)p=Math.min(p,.03);if(feat('weather')&&(G.wx=='rain'||G.wx=='snow'))p*=.93;return p}
function stPuntLand(side){const p=punterOf(side);return 46+(p.str-70)*.45}
function st4th(side){const d=G.dir,y=clamp(((P.L-(d>0?10:110))*d),1,99),ytg=G.ytg,goal=y+ytg>=100,lead=side=='U'?G.sc[0]-G.sc[1]:G.sc[1]-G.sc[0];
 const pc=stConv(side)*(y>=80?1-.03*Math.max(0,ytg-2):1),fd=Math.round(100-y+17),pf=stFGp(side,fd),g0=stPuntLand(side);
 // a punt lands within a spread: some go for touchbacks; a pooch is shorter but hangs, so it's downed or fair-caught
 const pun=(g,sd,ret)=>{let ev=0,op=0,tbp=0;[[-1.5,.1],[-.75,.2],[0,.4],[.75,.2],[1.5,.1]].forEach(([z,w])=>{const l=y+g+z*sd,o=l>=100?20:clamp(100-l+(100-l>12?ret:0),1,70);if(l>=100)tbp+=w;ev+=w*-stEP(o);op+=w*o});return{ev,op,tbp}};
 const pn=pun(g0,7,7),pp=pun(g0*.72,5,2),usePooch=y>=45&&pp.ev>pn.ev+.05,pu=usePooch?pp:pn,tb=pu.tbp>.5,oppP=pu.op;
 const V={go:pc*(goal?6.35:stEP(Math.min(99,y+ytg+1.5)))-(1-pc)*stEP(100-y),fg:pf*(3-stEP(25))-(1-pf)*stEP(Math.max(20,107-y)),punt:pu.ev};
 let why='';const late=G.q>=4?clamp((360-G.clk)/360,0,1):0,endH=G.q==2&&G.clk<=20;
 if(y>62)V.punt-=.6+(y-62)*.06;                        // punting from close in gives up too much
 if(pf<.08)V.fg=-99;
 if(endH){V.punt-=2;if(!goal)V.go-=.8;if(pf>=.2)why='Points before the half.'}
 if(G.q>=4&&lead<0){const need=-lead;V.punt-=late*(need>3?4:2.5);if(need>3){if(V.fg>-90)V.fg-=late*pf*3}else if(V.fg>-90)V.fg+=late*1.6*pf;if(late>.3)why=need>3?(need>8?`You're down ${need}: you need scores and the ball.`:`You're down ${need}: a field goal isn't enough.`):`A field goal ${need==3?'ties it':'takes the lead'}.`}
 if(G.q>=4&&lead>0){V.punt+=late*1.1;if(ytg>1)V.go-=late*1.1;if(V.fg>-90&&lead<=8)V.fg+=late*.7*pf;if(late>.3)why='Protect the lead.'}
 if(G.q>=4&&G.clk<=8){if(lead<0&&-lead<=3&&pf>.04){V.fg=9;why='Last play: kick it.'}else if(lead<0){V.fg=-99;V.punt=-99;why='Last play: you need a touchdown.'}}
 // going for it has to be clearly better (a coin flip goes to the kick), unless the clock says otherwise
 let best=V.fg>V.punt?'fg':'punt';const marg=late>.3||endH?0:.15+(y<25?.6:y<40?.3:0)+(best=='fg'&&pf>.8&&ytg>=3?.5:0);if(V.go>V[best]+marg)best='go';
 const pooch=best=='punt'&&usePooch;
 return{V,best,pc,fd,pf,oppP,tb,y,why,pooch,goal}}
function st4Why(m,k){const pct=v=>Math.round(v*100)+'%';
 if(k=='go')return`${m.goal?'4th & goal':'4th & '+G.ytg}: converts about ${pct(m.pc)}`;
 if(k=='fg')return m.V.fg<-90?`${m.fd}-yard field goal: out of range`:`${m.fd}-yard field goal: about ${pct(m.pf)}`;
 return m.tb?'Likely a touchback (their 20)':`They'd start around their ${Math.round(m.oppP)}`}
const ST4N={go:'Go for it',fg:'Field goal',punt:'Punt'};

// ---------- the coach's return and kickoff picks ----------
// Which side of the kicking team's coverage is weakest (speed and tackling), and how good your blockers are.
function stCovSides(kt,kind){const tid=stTid(kt),L=lineup(tid),d=kt=='U'?-1:1,men=kind=='punt'?L.O.map((p,i)=>({p,i,y:[26.5,4.5,19.6,48.8,24.4,28.6,22.2,24.3,26.5,28.6,30.8][i],w:i==1||i==3?2:1})):L.D.map((p,i)=>({p,i,y:4+i*4.5,w:1}));
 // y in the returner's view: left 0 -> right 53.3
 // how fast each man really runs on the field (linemen are much slower than their speed rating suggests)
 const q=m=>{if(!m.p)return 60;const v=m.p.sk.spd,f=kind=='punt'?(m.i>=6?(4.6+v*.012):1.15*(5.6+v*.03)):(m.i<4?.85:m.i==7||m.i==8?1.08:1.15)*(5.6+v*.03);return f*10},side=[[],[],[]];
 men.forEach(m=>{if(!m.p)return;const yy=fyS(m.y,d),s=yy<20?0:yy>33.3?2:1;for(let i=0;i<m.w;i++)side[s].push(q(m))});
 const av=a=>a.length?a.reduce((x,v)=>x+v,0)/a.length:70;return side.map(av)}
function stRetSug(recv,kind){const kt=recv=='U'?'C':'U',s=stCovSides(kt,kind),L=lineup(stTid(recv)),ret=(L.O[5]||{sk:{spd:75,str:60}}).sk;
 const bl=L.O.filter((p,i)=>p&&i!=5).map(p=>p.sk.str),B=bl.reduce((a,v)=>a+v,0)/Math.max(1,bl.length),all=(s[0]+s[1]+s[2])/3;
 const df=Math.abs(s[0]-s[2]),sc={'Return Left':100-s[0]+(ret.spd-75)*.05,'Return Right':100-s[2]+(ret.spd-75)*.05,'Return Middle':100-(s[1]*.6+all*.4)-.5,'Wedge':100-Math.min(s[0],s[2])-Math.max(0,4-df)*0+(df<4?.5:-2)+(B-65)*.05};
 const lead=recv=='U'?G.sc[0]-G.sc[1]:G.sc[1]-G.sc[0];
 // punt returns are short and the sideline closes fast: go up the middle unless one gunner is much slower
 if(kind=='punt'){sc['Wedge']=-99;sc['Return Middle']+=Math.max(0,8-Math.abs(s[0]-s[2]))*1.5;if(G.q>=4&&lead>0&&G.clk<180)sc['Fair Catch']=200}
 let best='Return Middle';for(const k in sc)if(sc[k]>sc[best])best=k;
 const f=v=>Math.round(v),why=best=='Return Left'?`their coverage is slowest on your left${kind=='ko'&&s[0]<75?' (their linemen)':''}: speed ${f(s[0])} vs ${f(s[2])} on the right`:best=='Return Right'?`their coverage is slowest on your right${kind=='ko'&&s[2]<75?' (their linemen)':''}: speed ${f(s[2])} vs ${f(s[0])} on the left`:
  best=='Wedge'?`their coverage is even (speed ${f(s[0])} / ${f(s[2])}): hit it straight up the middle`:best=='Fair Catch'?'protect the lead: no fumbles':kind=='punt'?'punt returns are short: take what the middle gives you':`their coverage is even across the field (${f(s[0])} / ${f(s[1])} / ${f(s[2])})`;
 return{n:best,why}}
function stKickSug(kt){const lead=kt=='U'?G.sc[0]-G.sc[1]:G.sc[1]-G.sc[0],late=G.q>=4&&G.clk<300&&lead<0&&lead>=-16,rt=lineup(stTid(kt=='U'?'C':'U')).O[5],rs=rt?rt.sk.spd:75,all=SK_ALL();
 if(late&&all.Onside)return{n:'Onside',why:`you're down ${-lead} late: you need the ball back`};
 if((G.q==2||G.q>=4)&&G.clk<=25&&lead>=0)return{n:'Squib',why:'little time left: don\'t give them a big return'};
 if(rs>=90&&G.q>=4&&lead>0&&lead<=8)return{n:'Squib',why:`their returner is fast (${rs} speed): keep it out of his hands`};
 return{n:'Deep',why:'the best field position on average'}}
function stCpuRet(recv,kind){const all=SR_STOCK;if(rnd()<IQ()){const s=stRetSug(recv,kind);if(all[s.n])return s.n}const ks=['Return Middle','Return Left','Return Right','Wedge'];return ks[rnd()*ks.length|0]}
function stCpuKick(){const lead=G.sc[1]-G.sc[0];if(rnd()<IQ()){const s=stKickSug('C');if(s.n!='Onside')return s.n}return rnd()<.86?'Deep':rnd()<.5?'Squib':'Sky Kick'}

// ---------- kickoff menu (before the kick) ----------
const stMenuOK=()=>G&&G.live&&!CAR()&&!(typeof autoMode=='function'&&autoMode())&&!(typeof p2on=='function'&&p2on());
{const _sk=startKick;startKick=function(kind,kt,spot){try{if(kind=='ko'&&stRetOn()&&G&&G.live){
  if(!G.stKO&&stMenuOK()){const recv=kt=='C';G.ch={k:recv?'krc':'kc',a:[kind,kt,spot]};G.phase='pre';G.run=false;G.pbOpen=true;
   G.msg=recv?'Kickoff coming: call your return.':'Your kickoff: pick the kick.';ui();return}
  return stDoKick(_sk,kind,kt,spot)}}catch(e){console.error(e)}return _sk(kind,kt,spot)}}
function stDoKick(_sk,kind,kt,spot){const uk=kt=='U',kc=uk?(G.kcKO||(stMenuOK()?'Deep':stKickSug('U').n)):stCpuKick();
 G.rcNow=uk?stCpuRet('C','ko'):(G.rcKO||(stMenuOK()?null:stRetSug('U','ko').n));G.kcKO=G.rcKO=null;G.stKO=0;G.kcNow=kc;
 const pl=SK_ALL()[kc]||SK_STOCK.Deep;
 if(pl.t=='onside'&&typeof onside=='function'){G.rcNow=null;return onside(kt)}
 if(pl.t=='deep'&&pl.ax==null&&pl.ay==null){if(uk)G.koOK=1;return _sk(kind,kt,spot)}
 return stKickoff(kt,pl)}
// squib, sky and designed kickoffs: the ball lands where the kick was aimed (plus a miss based on the kicker)
function stKickoff(kt,pl){const rt=kt=='U'?'C':'U',d=rt=='U'?1:-1,own=d>0?10:110,k=kickerOf(kt),t=pl.t||'deep',acc=clamp(1.25-(k.skl-50)/80,.55,1.25);
 G.run=false;G.poss=rt;G.dir=d;G.down=1;G.ytg=10;G.ch=null;G.koOK=0;
 let dep=pl.ax!=null?pl.ax:t=='squib'?23:t=='sky'?13:1-(k.str-70)*.15;if(pl.ax!=null&&t=='deep')dep-=(k.str-70)*.1;
 dep+=gauss()*(t=='deep'?4:2.6)*acc;let ay=pl.ay!=null?fyS(pl.ay,-d):26.5+(rnd()-.5)*10;ay=clamp(ay+gauss()*3*acc,3,50.3);
 if(t!='deep')dep=Math.max(t=='squib'?12:6,dep);const lx=own+d*dep;
 if((lx-own)*d<=0&&!feat('ko2')){G.los=own+d*25;G.phase='pre';setup();G.msg=`${kt=='U'?'Your':'CPU'} kickoff: touchback.`;G.rcNow=null;ui();return}
 G.los=clamp(lx,11,109);setup();G.kTy={t,ay};krSetup(lx,d,'ko')}
function stPick(n){const c=G.ch;if(!c||(c.k!='kc'&&c.k!='krc'))return;if(c.k=='krc'){if(!SR_ALL()[n])return;G.rcKO=n}else{if(!SK_ALL()[n])return;G.kcKO=n}
 G.ch=null;G.stKO=1;G.pbOpen=false;const a=c.a||['ko',c.k=='kc'?'U':'C'];startKick(...a)}
function stMenuList(recv){return Object.keys(recv?SR_ALL():SK_ALL())}
function stMenuSug(recv){return recv?stRetSug('U','ko'):stKickSug('U')}
function stMenuHTML(recv){const all=recv?SR_ALL():SK_ALL(),ns=Object.keys(all),sg=feat('stcoach')?stMenuSug(recv):null,tch=typeof TOUCH=='function'&&TOUCH();
 const card=(n,i)=>`<button class="card st ${sg&&sg.n==n?'p3best':''}" data-st="${esc(n)}">${!tch&&i<9?`<kbd>${i+1}</kbd>`:''}${recv?retSVG(all[n]):kickSVG(all[n])}<span>${esc(n)}</span><small class="p3t">${esc(recv?(SR_INFO[n]?SR_INFO[n].split(':')[0].split(',')[0]:'Your design'):(SK_INFO[all[n].t]||'').split('.')[0])}</small></button>`;
 const coach=sg?`<div class="p3c"><div class="p3ci">&#129506;</div><div class="p3cb"><div class="p3cl">Coach's suggestion</div><div class="p3cn">${esc(sg.n)}</div><div class="p3cw">${esc(sg.why)}</div><div class="p3ca">${esc((recv?SR_INFO[sg.n]:SK_INFO[(all[sg.n]||{}).t])||'')}</div></div><button class="p3go" data-st="${esc(sg.n)}">Call it <kbd>Enter</kbd></button></div>`:'';
 return`<h3><span>${recv?'Kickoff return: call your return':'Kickoff: pick your kick'}</span></h3>${coach}<div class="cards">${ns.map(card).join('')}</div>`}
{const _ui=ui;ui=function(...a){const r=_ui.apply(this,a);try{stUI()}catch(e){console.error(e)}return r}}
function stUI(){if(!G||!P||!G.ch||(G.ch.k!='kc'&&G.ch.k!='krc'))return;const recv=G.ch.k=='krc',ns=stMenuList(recv);
 $('plays').innerHTML=ns.slice(0,9).map((n,i)=>`<button data-st="${esc(n)}">${esc(n)}</button>`).join('');$('hint').textContent=G.msg;
 showEl('pre',1,'flex');showEl('top',1,'flex');showEl('snap',0);showEl('pbb',0);showEl('pb',1);$('pb').innerHTML=stMenuHTML(recv);$('dctl').style.display='none';$('act').style.visibility='hidden'}
addEventListener('click',e=>{const el=e.target&&e.target.closest&&e.target.closest('[data-st]');if(!el||!G||!G.ch)return;e.stopPropagation();stPick(el.dataset.st)},true);
{const _h=hit;hit=function(k){try{if(G&&G.ch&&(G.ch.k=='kc'||G.ch.k=='krc')&&$('modal').hidden&&G.phase=='pre'){const recv=G.ch.k=='krc';
  if(/^[1-9]$/.test(k)){const n=stMenuList(recv)[+k-1];if(n)stPick(n);return}
  if(k=='enter'||k==' '){stPick(feat('stcoach')?stMenuSug(recv).n:stMenuList(recv)[0]);return}
  if(k!='escape'&&k!='p')return}}catch(e){console.error(e)}return _h(k)}}
{const _cc=coachChoice;coachChoice=function(){if(G.ch&&(G.ch.k=='kc'||G.ch.k=='krc'))return stPick(stMenuSug(G.ch.k=='krc').n);return _cc()}}

// ---------- returns on the field ----------
// When a return starts, the plan is attached to the play. During the kickoff flight the blockers run to their spots;
// after the catch each one does his job, and a CPU returner follows the lane.
{const _kr=krSetup;krSetup=function(lx,d,kind,...a){const r=_kr.call(this,lx,d,kind,...a);try{stRetStart(lx,d,kind)}catch(e){console.error(e)}return r}}
function stRetStart(lx,d,kind){if(!P)return;P.stR=null;const kt=G.kTy;G.kTy=null;
 if(kind=='ko'&&P.kf&&kt){const f=P.kf,dist0=Math.abs(f.sx-f.tx);f.ty=kt.ay;if(kt.t=='squib'){f.peak=1.4;f.T=clamp(dist0/19,2.3,3.4);f.sq=1;f.fc=0}else if(kt.t=='sky'){f.peak=16;f.T=4.5;f.sky=1}else{f.T=clamp(dist0/17,2.9,4.4)}P.kTy=kt.t}
 if(!stRetOn())return;const recv=G.poss;let n=null;
 if(kind=='ko'){n=G.rcNow;G.rcNow=null}else if(kind=='punt'){n=recv=='U'?G.rcPunt:stCpuRet('C','punt');G.rcPunt=null}
 const pl=n&&SR_ALL()[n];if(!pl)return;P.stR={n,pl:clone(pl),d,kind,side:recv,t0:null};
 if(kind=='ko'&&P.kf){const f=P.kf,O=P.off,bl=[0,1,2,3,4,6,7,8,9,10].filter(i=>O[i]),sp=pl.p.map(q=>[f.tx+d*q[0],fyS(q[1],d)]),used=new Set();
  // nearest free spot for each blocker (front men first)
  bl.sort((a,b)=>(f.spots[a][0]-f.spots[b][0])*d*-1).forEach(i=>{let bj=-1,bd=1e9;sp.forEach((s,j)=>{if(used.has(j))return;const dd=Math.hypot(s[0]-f.spots[i][0],s[1]-f.spots[i][1]);if(dd<bd){bd=dd;bj=j}});if(bj>=0){used.add(bj);f.spots[i]=[clamp(sp[bj][0],.5,119.5),clamp(sp[bj][1],1,52.3)];(P.stR.job=P.stR.job||{})[i]=bj}});
  if(pl.fc&&feat('kofc')&&!f.sq)f.fc=1}
 if(recv=='U')G.msg=`${n}${pl.fc?': fair catch, safe hands.':' is on. Follow the yellow lane.'}`}
// kickoff flight extras: squib bounces, sky kicks hang, coverage closes in; you can't fair-catch a bouncing squib
{const _st=step;step=function(dt){const f=P&&P.kf;const r=_st(dt);try{if(f&&P.kf===f&&G.phase=='play'){const k=Math.min(1,f.t/f.T),b=P.b,d=G.dir;
  if(f.sq){b.z=k<.3?4*1.8*(k/.3)*(1-k/.3):1.1*Math.abs(Math.sin((k-.3)/.7*Math.PI*3))*(1-k)+.15;f.fc=0}
  if(f.sq||f.sky){const near=f.sky?2.4:4;P.def.forEach(p=>{if(p.ksafe)return;const tx=f.tx+d*near,ly=f.ty+(p.y-f.ty)*.6,dd=Math.hypot(p.x-tx,p.y-ly);if(dd>.5&&Math.abs(p.x-f.tx)<11)mv(p,tx,ly,p.spd*.35,dt)})}
  // a CPU returner fair-catches a sky kick when the coverage is already on him
  if(f.sky&&G.poss=='C'&&!f.fc&&k>.75&&P.def.some(p=>Math.hypot(p.x-f.tx,p.y-f.ty)<5.5)&&rnd()<.5+.4*IQ()&&feat('kofc'))f.fc=1}
  stRetTick(dt)}catch(e){console.error(e)}return r}}
const stPh=(x,y)=>({x,y,vx:0,vy:0,eng:null,cool:99,ph:1,spd:0,mt:9});
function stRetTick(dt){const rp=P&&P.stR;if(!rp||G.phase!='play'||!P.kr||P.over||P.kf)return;const b=P.b,c=b.st=='carry'?b.c:null,O=P.off,D=P.def,d=G.dir;
 if(!c||c!==O[5]){stRetEnd();return}
 if(rp.t0==null){rp.t0=P.t;rp.c0=[c.x,c.y];rp.lanes=D.map((p,i)=>i).sort((a,e)=>fyS(D[a].y,d)-fyS(D[e].y,d));rp.lw=(rp.pl.lane||[]).map(w=>[clamp(c.x+d*w[0],.5,119.5),clamp(fyS(w[1],d),1.5,51.8)]);rp.li=0;
  if(!rp.job){rp.job={};const bl=[0,1,2,3,4,6,7,8,9,10].filter(i=>O[i]),sp=rp.pl.p.map(q=>[c.x+d*q[0],fyS(q[1],d)]),used=new Set();bl.forEach(i=>{let bj=-1,bd=1e9;sp.forEach((s,j)=>{if(used.has(j))return;const dd=Math.hypot(s[0]-O[i].x,s[1]-O[i].y);if(dd<bd){bd=dd;bj=j}});if(bj>=0){used.add(bj);rp.job[i]=bj}})}}
 const el=P.t-rp.t0;if(el>4.5){stRetEnd();return}
 const ahead=D.filter(p=>(p.x-c.x)*d>0).length;if(ahead<=2){stRetEnd();return}
 // the return lane from here on: coverage men near it are the ones that matter. Blockers prefer them (their man,
 // the guys coming at their wall spot), but still engage early like normal blockers do.
 const path=[[c.x,c.y],...rp.lw.slice(rp.li)],ld=p=>{if(path.length<2)return Math.hypot(p.x-c.x,p.y-c.y);let m=1e9;for(let i=1;i<path.length;i++){const a=path[i-1],e=path[i],vx=e[0]-a[0],vy=e[1]-a[1],L2=vx*vx+vy*vy||1,t=clamp(((p.x-a[0])*vx+(p.y-a[1])*vy)/L2,0,1);m=Math.min(m,Math.hypot(p.x-a[0]-vx*t,p.y-a[1]-vy*t))}return m};
 const free=D.filter(p=>!p.eng&&(p.x-c.x)*d>-2),taken=new Set();O.forEach(o=>{if(o.eng)taken.add(o.eng)});
 for(const k in rp.job){const i=+k,o=O[i],q=rp.pl.p[rp.job[k]];if(!o||!q||o.eng||o===c)continue;const job=q[2];
  const man=job=='m'?D[rp.lanes[q[3]]]:null,ws=job=='w'?[clamp(rp.c0[0]+d*q[0],.5,119.5),clamp(fyS(q[1],d),1,52.3)]:null;
  let best=null,bs=1e9;free.forEach(p=>{if(taken.has(p))return;let s=dist(o,p)+ld(p)*.6;if(man&&p===man)s-=4;if(ws&&Math.hypot(p.x-ws[0],p.y-ws[1])<8)s-=2.5;if(job=='e')s=dist(p,c)+dist(o,p)*.4;if(s<bs){bs=s;best=p}});
  if(o.tg&&o.tg.ph){o.tg=null;o.rt=0}
  if(job=='e'&&(!best||dist(best,c)>12)){const dx=Math.max(3,q[0]*.9),dy=(fyS(q[1],d)-fyS(26.5,d))*.55;o.tg=stPh(c.x+d*dx,clamp(c.y+dy,1,52.3));o.rt=.2;o.blk=-1;continue}
  if(best){o.blk=D.indexOf(best);taken.add(best);if(job=='e'||bs<6){o.tg=best;o.rt=.2}}}}
function stRetEnd(){const rp=P&&P.stR;if(!rp||rp.done)return;rp.done=1;P.off.forEach(o=>{if(o.tg&&o.tg.ph){o.tg=null;o.rt=0}o.blk=-1})}
// the CPU returner follows the lane while it's open
{const _cr=cpuRun;cpuRun=function(c,dt){try{const rp=P&&P.stR;if(rp&&!rp.done&&rp.lw&&rp.li<rp.lw.length&&P.kr&&c===P.off[5]&&!(typeof p2on=='function'&&p2on()&&c.t=='C')){const d=G.dir;
  while(rp.li<rp.lw.length){const w=rp.lw[rp.li];if(Math.hypot(w[0]-c.x,w[1]-c.y)<3||(c.x-w[0])*d>0)rp.li++;else break}
  if(rp.li<rp.lw.length&&rp.t0!=null&&P.t-rp.t0<2.2)return stCpuRun(c,dt,rp.lw[rp.li])}}catch(e){console.error(e)}return _cr(c,dt)}}
function stCpuRun(c,dt,w){const iq=c.t=='C'?IQ():.75,d=G.dir,D=P.def,wa=Math.atan2(w[1]-c.y,(w[0]-c.x)*d);let best=[d,0],bs=-1e9;
 for(let a=-1.4;a<=1.41;a+=.2){const fx=Math.cos(a)*d,fy=Math.sin(a);let clr=99;
  for(const s of[2.5,5,8]){const x=c.x+fx*s,y=c.y+fy*s;if(y<1||y>52.3){clr=0;continue}D.forEach(p=>{const e=Math.hypot(p.x-x,p.y-y)-(p.eng?-1.5:0)-s*.15;if(e<clr)clr=e})}
  const sc=Math.min(clr,8)*(.4+iq)+Math.cos(a)*2.2+Math.cos(a-wa)*1.8*(.5+iq*.5)+(rnd()-.5)*(1-iq)*4;if(sc>bs){bs=sc;best=[fx,fy]}}
 mv(c,c.x+best[0]*6,c.y+best[1]*6,c.spd*.93,dt);const n=D.reduce((a,p)=>dist(p,c)<dist(a,c)?p:a);if(!n.eng&&dist(n,c)<2.6&&rnd()<dt*(.6+iq*1.8)&&typeof aiMove=='function')aiMove(c,n,iq)}
// the lane drawn on the field for your returner
{const _df=drawField;drawField=function(...a){const r=_df.apply(this,a);try{stLaneDraw()}catch(e){}return r}}
function stLaneDraw(){const rp=P&&P.stR;if(!rp||rp.side!='U'||rp.done||!rp.pl.lane||!rp.pl.lane.length||G.phase!='play')return;let pts;const d=G.dir;
 if(P.kf)pts=[[P.kf.tx,P.kf.ty],...rp.pl.lane.map(w=>[P.kf.tx+d*w[0],fyS(w[1],d)])];else if(rp.lw&&rp.t0!=null&&P.t-rp.t0<1.8){const c=P.b.c;if(!c)return;pts=[[c.x,c.y],...rp.lw.slice(rp.li)]}else return;
 if(pts.length<2)return;const s=pts.map(p=>P2(clamp(p[0],0,120),clamp(p[1],0,53.3)));X.save();X.strokeStyle='#ffd84d';X.fillStyle='#ffd84d';X.lineWidth=3;X.globalAlpha=.85;X.setLineDash([10,7]);X.lineDashOffset=-performance.now()/40;
 X.beginPath();X.moveTo(s[0][0],s[0][1]);s.slice(1).forEach(p=>X.lineTo(p[0],p[1]));X.stroke();X.setLineDash([]);const e=s[s.length-1],f=s[s.length-2],an=Math.atan2(e[1]-f[1],e[0]-f[0]);
 X.beginPath();X.moveTo(e[0],e[1]);X.lineTo(e[0]-Math.cos(an-.5)*13,e[1]-Math.sin(an-.5)*13);X.lineTo(e[0]-Math.cos(an+.5)*13,e[1]-Math.sin(an+.5)*13);X.closePath();X.fill();
 X.font='bold 12px "Trebuchet MS",sans-serif';const t=rp.n.toUpperCase(),w=X.measureText(t).width+12;X.globalAlpha=.9;X.fillStyle='#0b1410';X.fillRect(s[0][0]-w/2,s[0][1]+14,w,17);X.fillStyle='#ffd84d';X.textAlign='center';X.fillText(t,s[0][0],s[0][1]+27);X.restore();X.textAlign='left'}

// ---------- punts: your return call, fair catch call, pooch punts ----------
{const _ks=kickStart;kickStart=function(kind,...a){const rc=G&&G.poss=='C'&&kind=='punt'?G.rcall:null,po=G&&G.pooch;G.pooch=0;const r=_ks(kind,...a);
 try{if(P&&P.kk&&kind=='punt'){if(po)P.kk.pooch=1;G.rcPunt=rc||null;const pl=rc&&SR_ALL()[rc];if(pl&&pl.fc)P.kk.fcCall=1;if(rc&&G.poss=='C'&&stRetOn()&&!pl.fc)G.msg=`${rc} is set. Field it and follow the lane.`;if(po&&G.poss=='U')G.msg='Pooch punt: high and short to pin them deep.';ui()}}catch(e){console.error(e)}return r}}
{const _kl=kLaunch;kLaunch=function(...a){const r=_kl.apply(this,a);try{const kk=P.kk;if(kk&&kk.kind=='punt'&&kk.pooch){const d=G.dir;kk.G0*=.72;kk.hang=Math.min(5.6,kk.hang+1.1);kk.lat*=.7;
  const fo=kk.lat>0?(53.1-26.5)/kk.lat:kk.lat<0?(.2-26.5)/kk.lat:9;kk.fo=fo<1?fo:1;kk.lx=kk.kx+d*kk.G0*kk.fo;kk.ly=26.5+kk.lat*kk.fo;kk.T=(.9+.42*kk.hang)*Math.max(.5,kk.fo)}}catch(e){console.error(e)}return r}}
{const _kr=kReturn;kReturn=function(lx,ly,hang){try{const kk=P&&P.kk;if(kk&&kk.fcCall&&kk.kind=='punt'){const d=G.dir,rg=d>0?110:10;G.rcPunt=null;G.next='flip';G.nl=clamp(lx,11,109);G.msg=`Fair catch at the ${Math.round(Math.abs(lx-rg))}.`;
  if(typeof xLog=='function')xLog(`${tAbbr(R.lg.t[0].n)}: fair catch at the ${Math.round(Math.abs(lx-rg))}.`);G.phase='post';G.pt=2;save();ui();return}}catch(e){console.error(e)}return _kr(lx,ly,hang)}}
// a CPU punt from close range is a pooch (the smarter the CPU, the more often)
{const _dp=doPunt;doPunt=function(...a){try{if(G&&G.poss=='C'&&feat('stcoach')&&!G.pooch&&P){const d=G.dir,y=((P.L-(d>0?10:110))*d);if(y>=50&&y<=67&&rnd()<.3+.6*IQ())G.pooch=1}}catch(e){}return _dp.apply(this,a)}}

// ---------- defensive special calls (when the CPU might kick) ----------
const STD3={'Punt Block':{k:'fgb',fb:'Goal Line D'},'Punt Return Left':{k:'pr',fb:'Prevent',r:'Return Left'},'Punt Return Right':{k:'pr',fb:'Prevent',r:'Return Right'},'Punt Return Wedge':{k:'pr',fb:'Prevent',r:'Wedge'},'Punt Safe':{k:'ps',fb:'Cover 3',r:'Fair Catch'}};
if(typeof STD=='object'){Object.assign(STD,STD3);if(STD['Punt Return'])STD['Punt Return'].r='Return Middle'}
const stDefName=n=>STD3[n]||(typeof STD=='object'&&STD[n])||(n.startsWith('Punt Return: ')?{k:'pr',fb:'Prevent',r:n.slice(13)}:null);
{const _ad=applyDef;applyDef=function(n,...a){try{if(G&&G.poss!='U'){const s=stDefName(n);if(s){G.rcall=s.r||null;
   if(n.startsWith('Punt Return: ')||!(typeof STD=='object'&&STD[n]&&feat('stplays'))){const r=_ad(DALL()[s.fb]?s.fb:Object.keys(DALL())[0],...a);if(feat('stplays')){G.stc=s.k;G.stcN=n}return r}}else G.rcall=null}}catch(e){console.error(e)}return _ad(n,...a)}}
{const _se=setup;setup=function(...a){if(G)G.rcall=null;return _se.apply(this,a)}}
// the Punt Safe call: nobody rushes, the returner fair-catches (stplays only knows 'pr' and 'fgb', so 'ps' is a plain defense)

// ---------- the Special tab ----------
function stOffCards(){const fd=fgDist(),m=feat('stcoach')&&P?st4th('U'):null,pct=m&&m.V.fg>-90?` · ${Math.round(m.pf*100)}%`:'',c=[];
 c.push(['punt',typeof stSVG=='function'?stSVG('punt'):'','Punt','Normal punt']);c.push(['pooch',stIco('pooch'),'Pooch Punt','High and short, to pin them']);
 if(fd<=70)c.push(['fg',typeof stSVG=='function'?stSVG('fg'):'',`Field Goal (${fd} yd${pct})`,'Kick it through']);
 if(G.down==4&&feat('fakes')&&!G.two&&!G.fake){c.push(['fakep',stIco('fakep'),'Fake Punt','Line up to punt, run a play']);c.push(['fakefg',stIco('fakefg'),'Fake FG','Line up for the kick, run a play'])}
 return c.map(([a,svg,n,t])=>`<button class="card st" data-a="${a}">${svg}<span>${esc(n)}</span><small class="p3t">${esc(t)}</small></button>`).join('')}
function stDefCards(){const on=n=>G.stcN==n?'on':'',c=[];
 if(feat('stplays'))c.push(['FG Block',typeof stSVG=='function'?stSVG('fgb'):'','Rush the field goal']);
 c.push(['Punt Block',stIco('pblk'),'Rush the punter, nobody back']);
 c.push(['Punt Return',retSVG(SR_STOCK['Return Middle']),'Return it up the middle']);c.push(['Punt Return Left',retSVG(SR_STOCK['Return Left']),'Wall return to the left']);
 c.push(['Punt Return Right',retSVG(SR_STOCK['Return Right']),'Wall return to the right']);c.push(['Punt Return Wedge',retSVG(SR_STOCK.Wedge),'Wedge straight ahead']);c.push(['Punt Safe',retSVG(SR_STOCK['Fair Catch']),'Fair catch, guard the fake']);
 if(stDesOn())Object.keys(STP.r).forEach(n=>c.push(['Punt Return: '+n,retSVG(STP.r[n]),'Your return']));
 return c.map(([n,svg,t])=>`<button class="card st ${on(n)}" data-d="${esc(n)}">${svg}<span>${esc(n)}</span><small class="p3t">${esc(t)}</small></button>`).join('')}
{const P3=typeof P3OF!='undefined'?P3OF:null,P4=typeof P3DF!='undefined'?P3DF:null;if(P3&&!P3.some(t=>t[0]=='st'))P3.splice(2,0,['st','Special']);if(P4&&!P4.some(t=>t[0]=='st'))P4.splice(2,0,['st','Special'])}
{const _pb=pbHTML;pbHTML=function(u){let h=_pb(u);try{if(!feat('stbook')||!G||!P)return h;const box=document.createElement('div');box.innerHTML=h;
  // the old tacked-on special cards come out; they're rebuilt here in the right place
  box.querySelectorAll('.card.st').forEach(e=>e.remove());let tabs=box.querySelector('.p3tabs');const f=tabs?((u?G.pbF:G.pbD)||'all'):'all',fourth=G.down==4&&!G.two;
  if(tabs&&!tabs.querySelector('[data-stt]')){[...tabs.children].forEach(b=>{if(/Special/.test(b.textContent))b.setAttribute('data-stt','1')})}
  const cards=box.querySelector('.cards'),sc=u?stOffCards():stDefCards();
  if(cards){const e=cards.querySelector('p.small');if(f=='st'){cards.innerHTML=sc}else if(f=='all'||!tabs){if(e)e.remove();if(fourth)cards.insertAdjacentHTML('afterbegin',sc);else cards.insertAdjacentHTML('beforeend',sc)}
   if(fourth&&tabs&&f=='all'){const sb=tabs.querySelector('[data-stt]');if(sb)sb.classList.add('st4')}
   const tch=typeof TOUCH=='function'&&TOUCH();[...cards.querySelectorAll('.card')].forEach((c,i)=>{const k=c.querySelector('kbd');if(k)k.remove();if(i<9&&!tch)c.insertAdjacentHTML('afterbegin',`<kbd>${i+1}</kbd>`)})}
  if(feat('stcoach')&&fourth){const cc=st4Card(u),old=box.querySelector('.p3c');if(cc){if(old)old.outerHTML=cc;else{const hh=box.querySelector('h3');if(hh)hh.insertAdjacentHTML('afterend',cc)}}}
  h=box.innerHTML}catch(e){console.error(e)}return h}}
// coach card on 4th down: offense = the three options with odds; defense = what they'll probably do and the call for it
function st4Card(u){if(u){const m=st4th('U'),top=typeof coachSug=='function'?(coachSug(1,'U',1)[0]||{}).n:null;
  const opt=k=>{const ok=k!='fg'||m.V.fg>-90,attr=k=='go'?(top?`data-p="${esc(top)}"`:''):k=='punt'&&m.pooch?'data-a="pooch"':`data-a="${k}"`;return`<button class="st4o ${m.best==k?'on':''}" ${ok?attr:'disabled'}><b>${k=='punt'&&m.pooch?'Pooch punt':ST4N[k]}</b><span>${esc(st4Why(m,k))}</span></button>`};
  const ca=m.best=='go'?(top?`data-p="${esc(top)}"`:'data-a="pb"'):m.best=='punt'&&m.pooch?'data-a="pooch"':`data-a="${m.best}"`,bn=m.best=='go'?(top?'Go for it: '+top:'Go for it'):m.best=='punt'&&m.pooch?'Pooch punt':ST4N[m.best];
  return`<div class="p3c st4c"><div class="p3ci">&#129506;</div><div class="p3cb"><div class="p3cl">Coach's call on ${m.goal?'4th & goal':'4th & '+G.ytg}</div><div class="p3cn">${esc(bn)}</div><div class="p3cw">${esc(m.why||'Best odds here.')}</div><div class="st4r">${opt('go')}${opt('fg')}${opt('punt')}</div></div><button class="p3go" ${ca}>Call it</button></div>`}
 const m=st4th('C'),rs=stRetSug('U','punt');let n,w;
 if(m.best=='fg'&&feat('stplays')){n='FG Block';w=`They'll most likely kick a ${m.fd}-yard field goal (about ${Math.round(m.pf*100)}%).`}
 else if(m.best=='punt'){n=rs.n=='Fair Catch'?'Punt Safe':rs.n=='Return Middle'?'Punt Return':'Punt '+rs.n.replace('Wedge','Return Wedge');w=`They'll most likely punt. ${rs.n=='Fair Catch'?'Take the fair catch':'Return it '+({'Return Middle':'up the middle','Return Left':'to the left','Return Right':'to the right','Wedge':'behind a wedge'}[rs.n]||'')}: ${rs.why}.`}
 else{const top=typeof coachSug=='function'?(coachSug(0,'U',1)[0]||{}).n:null;if(!top)return'';n=top;w=`They'll probably go for it: ${m.goal?'4th & goal':'4th & '+G.ytg} converts about ${Math.round(m.pc*100)}%.`}
 return`<div class="p3c st4c"><div class="p3ci">&#129506;</div><div class="p3cb"><div class="p3cl">Coach's read on their 4th down</div><div class="p3cn">${esc(n)}</div><div class="p3cw">${esc(w)}</div></div><button class="p3go" data-d="${esc(n)}">Call it</button></div>`}
// pooch / fakes from the playbook panel
$('pb').addEventListener('click',e=>{const el=e.target.closest&&e.target.closest('[data-a]');if(!el||!G)return;const a=el.dataset.a;
 if(a=='pooch'){if(G.phase!='pre'||G.ch||G.poss!='U')return;G.pooch=1;G.pbOpen=false;doPunt();return}
 if(a=='fakep'||a=='fakefg'){if(typeof fakeSet=='function'){G.pbOpen=false;fakeSet(a=='fakep'?'punt':'fg');ui()}}});
// number keys include the special cards
pbOrder=function(u){const d=document.createElement('div');d.innerHTML=pbHTML(u);return[...d.querySelectorAll('.card')].map(b=>b.dataset.a?'§'+b.dataset.a:u?b.dataset.p:b.dataset.d).filter(Boolean)};
{const _pp=pickPlay;pickPlay=function(n,u){if(typeof n=='string'&&n[0]=='§'){const a=n.slice(1);G.pbOpen=false;if(a=='punt')return doPunt();if(a=='fg')return doFG();if(a=='pooch'){G.pooch=1;return doPunt()}if(a=='fakep'||a=='fakefg'){fakeSet(a=='fakep'?'punt':'fg');return ui()}return}return _pp(n,u)}}
{const s=document.createElement('style');s.textContent=`.st4r{display:flex;gap:5px;margin-top:6px;flex-wrap:wrap}.st4o{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:4px 8px;border-radius:8px;border:1px solid #ffffff2a;background:#0b1410aa;color:#e8f0ea;cursor:pointer;text-align:left;min-width:120px}
.st4o b{font-size:12px}.st4o span{font-size:11px;color:#9fb5a8}.st4o.on{border-color:#4ade80;background:#14532d}.st4o.on span{color:#d1fae5}.st4o:disabled{opacity:.45;cursor:default}
.p3tabs button.st4{box-shadow:0 0 0 2px #4ade80}#pb .card.st span{font-weight:700}#pb .p3go kbd{font-size:10px;margin-left:4px;background:#0006;padding:1px 4px;border-radius:4px}`;document.head.appendChild(s)}

// ---------- the CPU (and your auto-coach) use the 4th-down math ----------
{const _c4=cpu4th;cpu4th=function(){try{if(feat('stcoach')&&G&&P&&rnd()<IQ()*.92){const m=st4th('C');if(m.best=='go')return false;if(m.best=='fg'){doFG();return true}if(m.pooch)G.pooch=1;doPunt();return true}}catch(e){console.error(e)}return _c4()}}
{const _c4=coach4th;coach4th=function(){try{if(feat('stcoach')&&G&&P){const m=st4th('U');if(m.best=='go')return false;if(m.best=='fg'){doFG();return true}if(m.pooch)G.pooch=1;doPunt();return true}}catch(e){console.error(e)}return _c4()}}
// clear one-play calls
{const _sn=snap;snap=function(...a){const call=G&&G.poss=='C'&&G.phase=='pre'?G.stc:null;if(G){G.rcNow=null}const r=_sn.apply(this,a);
 try{if(call=='ps'&&G.phase=='play'&&!P.kk)G.msg='They are going for it! Your Punt Safe team is in a Cover 3.'}catch(e){}return r}}
