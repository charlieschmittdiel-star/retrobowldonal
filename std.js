'use strict';
// Special teams designer: design your own kick return plays (where each blocker sets up, his job, and the lane the
// returner runs) and kickoffs (deep, squib or sky, aimed at a spot). Built like the offense and defense designers.
// Saved in this browser (and in exported saves). Your designs show up in the kickoff menu and in the Special tab.
{const add=[['Playbook','stdes','Special teams designer','Design your own kick returns and kickoffs (Playbook menu: Special teams). They show up in the kickoff menu and in the Special tab.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
let SX=null,sxCv=null;
const SX_JOB={w:'Wall',e:'Escort',m:'Block man',f:'Free'},SX_JD={w:'Holds his spot in the wall and blocks whoever comes at it.',e:'Stays a few yards in front of the returner and picks off the closest tackler.',m:'Goes after one coverage man (pick him on the field or in the list).',f:'Blocks whoever is closest, like a normal return.'};
const sxCov=i=>`Cover ${i+1}`;
const sxStock=()=>SX.kind=='r'?SR_STOCK:SK_STOCK,sxMine=()=>SX.kind=='r'?STP.r:STP.k,sxAll=()=>SX.kind=='r'?Object.assign({},SR_STOCK,STP.r):Object.assign({},SK_STOCK,STP.k);
function sxNewR(){return{p:[[10,8,'f'],[10,16,'f'],[10,26.5,'f'],[10,37,'f'],[10,45,'f'],[5,12,'f'],[5,22,'f'],[5,31,'f'],[5,41,'f'],[2.5,26.5,'e']],lane:[[10,26.5],[30,26.5]]}}
function sxLoad(kind,n){SX.kind=kind;const all=sxAll();if(!all[n])n=Object.keys(all)[0];SX.n=n;SX.nm=n;SX.pl=clone(all[n]);if(kind=='k'&&SX.pl.t=='onside'){SX.pl={t:'deep'}}SX.sel=kind=='r'?0:-1;SX.hist=[];SX.dirty=0;SX.msg='';SX.delAsk=null}
function stDes(){if(!feat('stdes')){modal(`${typeof nav=='function'?nav():''}<h1>Special teams designer</h1><p>The designer is switched off. Turn it on to design your own kick returns and kickoffs.</p><div class="btns">${B("optT('stdes');stDes()",'Turn it on','go')}${B('lobby()','Back')}</div>`);return}
 if(!SX){SX={mode:'move'};sxLoad('r','Return Left')}
 peCss();sxCss();$('modal').hidden=0;$('modal').innerHTML=`<div id="sx"><div class="pe-top"><button class="pe-x" onclick="sxDone()">&larr; Done</button><input id="sx-nm" maxlength="18" spellcheck="false" value="${esc(SX.nm)}" oninput="SX.nm=this.value;SX.dirty=1"><span id="sx-kind"></span><span class="pe-sp"></span>
  <button onclick="sxUndo()" title="Undo (Ctrl+Z)">&#8630; Undo</button><button onclick="sxFlip()" title="Mirror left to right">&#8646; Flip</button><button class="pe-pri" onclick="sxSave(0)">Save</button><button onclick="sxSave(1)">Save as new</button><button id="sx-del" onclick="sxDel()">Delete</button></div>
  <div class="pe-body"><div class="pe-list" id="sx-list"></div><div class="pe-mid"><div class="pe-tools" id="sx-tools"></div><canvas id="sx-cv"></canvas><div class="pe-hint" id="sx-hint"></div></div><div class="pe-side" id="sx-side"></div></div></div>`;
 sxCv=$('sx-cv');sxCv.width=PE_W*2;sxCv.height=PE_H*2;
 const ep=e=>{const r=sxCv.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*PE_W,sy=(e.clientY-r.top)/r.height*PE_H;return[sx,sy]},sn=v=>Math.round(v*2)/2;
 sxCv.onpointerdown=e=>{const[px,py]=ep(e);
  if(SX.kind=='k'){const[ax,ay]=sxKInv(px,py);sxPush();SX.pl.ax=sn(clamp(ax,SX.pl.t=='squib'?12:SX.pl.t=='sky'?6:-8,36));SX.pl.ay=sn(clamp(ay,2,51.3));SX.drag={k:'aim'};return sxUI()}
  const x=PE_TOP-(py-PE_PY)/PE_K,y=(px-PE_PX)/PE_K,P0=SX.pl.p;let hit=-1,hd=1.6;P0.forEach((q,i)=>{const dd=Math.hypot(q[0]-x,q[1]-y);if(dd<hd){hd=dd;hit=i}});
  const ghost=(()=>{let j=-1,jd=2;for(let i=0;i<11;i++){const dd=Math.hypot(31-x,4+i*4.5-y);if(dd<jd){jd=dd;j=i}}return j})();
  if(SX.mode=='man'){if(ghost>=0&&SX.sel>=0){sxPush();const q=P0[SX.sel];q[2]='m';q[3]=ghost;q.length=4}else if(hit>=0)SX.sel=hit;return sxUI()}
  if(SX.mode=='lane'){const L=SX.pl.lane=SX.pl.lane||[];const li=L.findIndex(w=>Math.hypot(w[0]-x,w[1]-y)<1.4);if(li>=0){sxPush();SX.drag={k:'lane',i:li};return}
   if(L.length>=5){SX.msg='A lane can have up to 5 points. Drag one, or Clear lane.';return sxUI()}if(x<.5){SX.msg='The lane goes up the field, in front of the returner.';return sxUI()}sxPush();L.push([sn(clamp(x,.5,34)),sn(clamp(y,1,52.3))]);SX.drag={k:'lane',i:L.length-1};return sxUI()}
  if(hit>=0){SX.sel=hit;sxPush();SX.drag={k:'p'};return sxUI()}sxUI()};
 sxCv.onpointermove=e=>{const[px,py]=ep(e);if(!SX.drag){if(SX.kind=='r'){const x=PE_TOP-(py-PE_PY)/PE_K,y=(px-PE_PX)/PE_K;sxCv.style.cursor=SX.pl.p.some(q=>Math.hypot(q[0]-x,q[1]-y)<1.6)?'pointer':SX.mode=='move'?'default':'crosshair'}else sxCv.style.cursor='crosshair';return}
  if(SX.kind=='k'){const[ax,ay]=sxKInv(px,py);SX.pl.ax=sn(clamp(ax,SX.pl.t=='squib'?12:SX.pl.t=='sky'?6:-8,36));SX.pl.ay=sn(clamp(ay,2,51.3));return sxDraw()}
  const x=PE_TOP-(py-PE_PY)/PE_K,y=(px-PE_PX)/PE_K;if(SX.drag.k=='p'){const q=SX.pl.p[SX.sel];q[0]=sn(clamp(x,.5,28));q[1]=sn(clamp(y,1,52.3))}else if(SX.drag.k=='lane'){SX.pl.lane[SX.drag.i]=[sn(clamp(x,.5,34)),sn(clamp(y,1,52.3))]}sxDraw()};
 sxCv.onpointerup=()=>{if(SX.drag){SX.drag=null;sxUI()}};sxCv.oncontextmenu=e=>{e.preventDefault();if(SX.kind=='r'&&SX.mode=='lane'&&SX.pl.lane&&SX.pl.lane.length){sxPush();SX.pl.lane.pop();sxUI()}};
 sxUI()}
function sxPush(){SX.hist.push(JSON.stringify(SX.pl));if(SX.hist.length>60)SX.hist.shift();SX.dirty=1;SX.msg=''}
function sxUndo(){const s=SX.hist.pop();if(s){SX.pl=JSON.parse(s);SX.dirty=1}sxUI()}
function sxFlip(){sxPush();if(SX.kind=='r'){SX.pl.p.forEach(q=>{q[1]=53.3-q[1];if(q[2]=='m')q[3]=10-q[3]});(SX.pl.lane||[]).forEach(w=>w[1]=53.3-w[1])}else if(SX.pl.ay!=null)SX.pl.ay=53.3-SX.pl.ay;sxUI()}
function sxName(){return String(SX.nm||'').replace(/[^\w &'-]/g,'').trim().slice(0,18)}
function sxSave(asNew){let n=sxName();const mine=sxMine(),stock=sxStock(),all=sxAll();if(!n){SX.msg='Give it a name first.';return sxUI()}
 if(asNew&&n==SX.n){let i=2;while(all[n+' '+i])i++;n=(n.slice(0,15)+' '+i).trim()}
 if(stock[n]&&!mine[n]){SX.msg=`"${n}" is a stock play. Pick a different name (or use Save as new).`;return sxUI()}
 if(SX.n!==n&&mine[SX.n]&&!asNew)delete mine[SX.n];mine[n]=clone(SX.pl);stSave();SX.n=n;SX.nm=n;SX.dirty=0;SX.msg='';$('sx-nm').value=n;sxUI();sxToast('Saved "'+n+'"')}
function sxDel(){const mine=sxMine();if(!mine[SX.n])return;if(SX.delAsk!==SX.n){SX.delAsk=SX.n;SX.msg='Click Delete again to remove "'+SX.n+'" for good.';return sxUI()}delete mine[SX.n];stSave();sxLoad(SX.kind,SX.kind=='r'?'Return Left':'Deep');$('sx-nm').value=SX.nm;sxUI();sxToast('Deleted')}
function sxDone(){if(SX.dirty){let n=sxName()||SX.n;const mine=sxMine(),stock=sxStock();if(!mine[n]&&stock[n])n=('My '+n).slice(0,18);let i=2;const b=n;while(stock[n]&&!mine[n])n=b+' '+i++;mine[n]=clone(SX.pl);stSave();SX.n=n;SX.nm=n;SX.dirty=0}return lobby()}
function sxOpen(kind,n){if(SX.dirty&&!SX.warned){SX.warned=1;SX.msg='You have unsaved changes. Click again to leave them, or Save first.';return sxUI()}SX.warned=0;sxLoad(kind,n);$('sx-nm').value=SX.nm;sxUI()}
function sxNew(kind){SX.warned=0;SX.kind=kind;const all=sxAll();let i=1,b=kind=='r'?'My return ':'My kickoff ';while(all[b+i])i++;SX.n=b+i;SX.nm=SX.n;SX.pl=kind=='r'?sxNewR():{t:'deep',ax:-2,ay:26.5};SX.sel=kind=='r'?0:-1;SX.hist=[];SX.dirty=1;SX.msg='';$('sx-nm').value=SX.nm;sxUI()}
function sxToast(t){const el=document.createElement('div');el.className='pe-toast';el.textContent=t;$('sx')&&$('sx').appendChild(el);setTimeout(()=>el.remove(),1600)}
function sxUI(){if(!$('sx'))return;const pl=SX.pl,r=SX.kind=='r',mine=sxMine(),stock=sxStock(),all=sxAll();
 $('sx-kind').textContent=(r?'Kick return':'Kickoff')+(mine[SX.n]?' · yours':' · stock')+(SX.dirty?' · unsaved':'');$('sx-kind').className='pe-chip pe-'+(r?'run':'pass');$('sx-del').style.display=mine[SX.n]?'':'none';
 const li=(k,n)=>`<button class="pe-li ${k==SX.kind&&n==SX.n?'on':''}" onclick="sxOpen('${k}',this.dataset.n)" data-n="${esc(n)}"><b>${esc(n)}</b><i class="pe-chip">${k=='r'?(SR_STOCK[n]||STP.r[n]).fc?'Safe':'Return':((SK_STOCK[n]||STP.k[n]).t||'deep')}</i></button>`;
 const sec=(t,k,ns)=>ns.length?`<div class="pe-lh">${t}</div>`+ns.map(n=>li(k,n)).join(''):'';
 $('sx-list').innerHTML=`<button class="pe-new" onclick="sxNew('r')">+ New kick return</button>`+sec('Your returns','r',Object.keys(STP.r))+sec('Stock returns','r',Object.keys(SR_STOCK))+
  `<div style="height:10px"></div><button class="pe-new" onclick="sxNew('k')">+ New kickoff</button>`+sec('Your kickoffs','k',Object.keys(STP.k))+sec('Stock kickoffs','k',Object.keys(SK_STOCK).filter(n=>SK_STOCK[n].t!='onside'));
 const tool=(m,ic,t)=>`<button class="${SX.mode==m?'on':''}" onclick="SX.mode='${m}';SX.msg='';sxUI()"><span>${ic}</span>${t}</button>`;
 $('sx-tools').innerHTML=r?tool('move','&#10021;','Move')+tool('lane','&#10148;','Return lane')+tool('man','&#9711;','Block a man'):`<span style="padding:6px 10px;color:#cbd5e1;font:700 13px sans-serif">Click the field to aim the kick</span>`;
 const hints={move:'Drag your blockers (blue) to where they set up when the ball comes down. Click one to change his job on the right.',lane:'Click the field to add points to the yellow lane the returner runs (up to 5). Drag a point to move it. Right-click removes the last point.',man:'Pick a blocker, then click a red coverage man for him to block.'};
 $('sx-hint').innerHTML=SX.msg?`<b class="pe-warn">${esc(SX.msg)}</b>`:r?hints[SX.mode]:'The kicker is at the bottom, kicking up toward the end zone. The circle is where it lands; the dashed ring is how far a typical miss drifts.';
 if(r){const q=pl.p[SX.sel],job=q?q[2]:'',seg=(j,t)=>`<button class="${job==j?'on':''}" onclick="sxJob('${j}')">${t}</button>`;
  $('sx-side').innerHTML=`<div class="pe-card"><div class="pe-ct">Selected: <b>${q?'Blocker '+(SX.sel+1):'nobody'}</b></div>${q?`<div class="pe-seg">${seg('w','Wall')}${seg('e','Escort')}${seg('m','Man')}${seg('f','Free')}</div>
   ${job=='m'?`<label class="pe-pick">Blocks<select onchange="sxMan(+this.value)">${[...Array(11)].map((_,i)=>`<option value="${i}" ${q[3]==i?'selected':''}>${sxCov(i)}${i==5?' (kicker)':''}</option>`).join('')}</select></label>`:''}<p>${SX_JD[job]||''}</p>`:''}</div>
   <div class="pe-card"><div class="pe-ct">Whole return</div><div class="pe-row"><button class="${pl.fc?'on':''}" onclick="sxPush();SX.pl.fc=SX.pl.fc?0:1;sxUI()">Fair catch (safe hands): ${pl.fc?'on':'off'}</button><button onclick="sxPush();SX.pl.lane=[];sxUI()">Clear lane</button></div>
   <div class="pe-row"><button onclick="sxAll2('w')">Everyone in the wall</button><button onclick="sxAll2('f')">Everyone free</button></div><p>The CPU returner follows the lane while it's open. When you return it yourself, the lane is drawn on the field so you know where your blockers are going.</p></div>
   <div class="pe-card"><div class="pe-ct">Jobs</div>${pl.p.map((q,i)=>`<button class="pe-li ${i==SX.sel?'on':''}" onclick="SX.sel=${i};sxUI()"><b>Blocker ${i+1}</b><i class="pe-chip">${SX_JOB[q[2]]||'?'}${q[2]=='m'?' · '+sxCov(q[3]):''}</i></button>`).join('')}</div>`}
 else{const t=pl.t||'deep',seg=(k,n)=>`<button class="${t==k?'on':''}" onclick="sxKT('${k}')">${n}</button>`,k=(()=>{try{return kickerOf('U')}catch(e){return{skl:65,str:65}}})(),acc=clamp(1.25-(k.skl-50)/80,.55,1.25);
  $('sx-side').innerHTML=`<div class="pe-card"><div class="pe-ct">Kick</div><div class="pe-seg">${seg('deep','Deep')}${seg('squib','Squib')}${seg('sky','Sky')}</div><p>${SK_INFO[t]}</p></div>
   <div class="pe-card"><div class="pe-ct">Aim</div><p>${pl.ax==null?'Normal spread (no aim).':`Lands about ${pl.ax<0?-pl.ax+' yards deep in the end zone':'at the '+Math.round(pl.ax)}, ${Math.abs(pl.ay-26.5)<4?'down the middle':pl.ay<26.5?'toward your left sideline':'toward your right sideline'}.`}</p>
   <div class="pe-row"><button onclick="sxPush();delete SX.pl.ax;delete SX.pl.ay;sxUI()">Clear aim</button></div><p>Your kicker (${k.skl} kicking skill) usually lands it within about ${Math.round(3*acc*1.6)} yards of the spot. Wind and weather push it more.</p></div>`}
 sxDraw()}
function sxJob(j){const q=SX.pl.p[SX.sel];if(!q)return;sxPush();q[2]=j;if(j=='m'){let b=0,bd=1e9;for(let i=0;i<11;i++){const dd=Math.abs(4+i*4.5-q[1]);if(dd<bd){bd=dd;b=i}}q[3]=b;q.length=4}else q.length=3;sxUI()}
function sxMan(v){const q=SX.pl.p[SX.sel];if(!q)return;sxPush();q[2]='m';q[3]=v;q.length=4;sxUI()}
function sxAll2(j){sxPush();SX.pl.p.forEach(q=>{q[2]=j;q.length=3});sxUI()}
function sxKT(t){sxPush();SX.pl.t=t;if(SX.pl.ax!=null)SX.pl.ax=clamp(SX.pl.ax,t=='squib'?12:t=='sky'?6:-8,36);sxUI()}
// kickoff view: end line at the top (ax = -10), goal line, then the field down to ax = 37
const sxKY=ax=>PE_PY+(ax+10)*PE_K,sxKInv=(px,py)=>[(py-PE_PY)/PE_K-10,(px-PE_PX)/PE_K];
function sxDraw(){if(!sxCv)return;const g=sxCv.getContext('2d');g.setTransform(2,0,0,2,0,0);const X=peSx,K=PE_K,r=SX.kind=='r',pl=SX.pl;
 g.fillStyle='#2f7d36';g.fillRect(0,0,PE_W,PE_H);
 if(r){const Y=peSy;for(let x=Math.ceil(PE_BOT/5)*5;x<PE_TOP;x+=5)if(((x/5)|0)%2==0){g.fillStyle='#2a7331';g.fillRect(0,Y(x+5),PE_W,5*K)}
  g.strokeStyle='#ffffff55';g.lineWidth=1;for(let x=Math.ceil(PE_BOT/5)*5;x<=PE_TOP;x+=5){g.beginPath();g.moveTo(X(0),Y(x));g.lineTo(X(53.3),Y(x));g.stroke()}
  g.fillStyle='#ffffff70';g.font='bold 12px "Trebuchet MS",sans-serif';g.textAlign='center';for(let x=5;x<PE_TOP;x+=5){g.fillText('+'+x,X(2.2),Y(x)+4);g.fillText('+'+x,X(51.1),Y(x)+4)}
  g.fillStyle='#ffffffaa';g.font='bold 10px sans-serif';g.fillText('BALL COMES DOWN HERE',X(26.5),Y(-2.2));g.fillText('COVERAGE TEAM',X(26.5),Y(33.6));
  // coverage ghosts
  for(let i=0;i<11;i++){const sx=X(4+i*4.5),sy=Y(31),man=SX.mode=='man';g.strokeStyle=i==5?'#fca5a5':'#ef4444';g.lineWidth=man?3:2.2;g.beginPath();g.moveTo(sx-6,sy-6);g.lineTo(sx+6,sy+6);g.moveTo(sx+6,sy-6);g.lineTo(sx-6,sy+6);g.stroke();
   g.fillStyle='#fff';g.font='bold 9px sans-serif';g.fillText(i==5?'K':String(i+1),sx,sy-9)}
  // lane
  const L=pl.lane||[];if(L.length){g.strokeStyle='#ffd84d';g.lineWidth=3;g.setLineDash([9,6]);g.beginPath();g.moveTo(X(26.5),Y(0));L.forEach(w=>g.lineTo(X(w[1]),Y(w[0])));g.stroke();g.setLineDash([]);
   L.forEach((w,i)=>{g.fillStyle=SX.mode=='lane'?'#ffd84d':'#ffd84d99';g.beginPath();g.arc(X(w[1]),Y(w[0]),SX.mode=='lane'?5:3.5,0,7);g.fill()});
   const e=L[L.length-1],f=L.length>1?L[L.length-2]:[0,26.5],an=Math.atan2(Y(e[0])-Y(f[0]),X(e[1])-X(f[1]));g.fillStyle='#ffd84d';g.beginPath();g.moveTo(X(e[1]),Y(e[0]));g.lineTo(X(e[1])-Math.cos(an-.5)*12,Y(e[0])-Math.sin(an-.5)*12);g.lineTo(X(e[1])-Math.cos(an+.5)*12,Y(e[0])-Math.sin(an+.5)*12);g.closePath();g.fill()}
  // jobs
  pl.p.forEach((q,i)=>{const sx=X(q[1]),sy=Y(q[0]),s=i==SX.sel;
   if(q[2]=='m'){g.strokeStyle=s?'#ffd84d':'#fca5a5aa';g.lineWidth=s?2.6:1.6;g.setLineDash([3,4]);g.beginPath();g.moveTo(sx,sy);g.lineTo(X(4+q[3]*4.5),Y(31));g.stroke();g.setLineDash([])}
   if(q[2]=='w'){g.strokeStyle=s?'#ffd84d':'#e9e3cf';g.lineWidth=4;g.beginPath();g.moveTo(sx-11,sy-5);g.lineTo(sx-11,sy+5);g.stroke()}
   if(q[2]=='e'){g.strokeStyle=s?'#ffd84d':'#93c5fd';g.lineWidth=1.6;g.setLineDash([2,3]);g.beginPath();g.moveTo(sx,sy);g.lineTo(X(26.5),Y(0));g.stroke();g.setLineDash([])}});
  pl.p.forEach((q,i)=>{const sx=X(q[1]),sy=Y(q[0]),s=i==SX.sel;g.fillStyle='#00000055';g.beginPath();g.ellipse(sx+1.5,sy+2.5,10,8,0,0,7);g.fill();
   g.fillStyle=q[2]=='e'?'#60a5fa':q[2]=='w'?'#2563eb':'#3b82f6';g.strokeStyle=s?'#ffd84d':'#0b1410';g.lineWidth=s?3.5:1.5;g.beginPath();g.arc(sx,sy,10,0,7);g.fill();g.stroke();
   if(s){g.strokeStyle='#ffd84d55';g.lineWidth=6;g.beginPath();g.arc(sx,sy,15,0,7);g.stroke()}g.fillStyle='#fff';g.font='bold 9px sans-serif';g.fillText((q[2]||'f').toUpperCase()+(i+1),sx,sy+3)});
  g.fillStyle='#ffd84d';g.strokeStyle='#0b1410';g.lineWidth=2;g.beginPath();g.arc(X(26.5),Y(0),11,0,7);g.fill();g.stroke();g.fillStyle='#0b1410';g.font='bold 9px sans-serif';g.fillText('KR',X(26.5),Y(0)+3);
  if(pl.fc){g.fillStyle='#0b1410cc';g.fillRect(X(16),Y(-5)-14,X(37.3)-X(16),20);g.fillStyle='#ffd84d';g.font='bold 12px sans-serif';g.fillText('FAIR CATCH: NO RETURN',X(26.65),Y(-5))}}
 else{const Y=sxKY;g.fillStyle='#1d4ed855';g.fillRect(0,Y(-10),PE_W,10*K);g.fillStyle='#ffffff90';g.font='bold 22px "Trebuchet MS",sans-serif';g.textAlign='center';g.fillText('END ZONE',X(26.65),Y(-5)+8);
  g.strokeStyle='#ffffff55';g.lineWidth=1;for(let a=0;a<=37;a+=5){g.beginPath();g.moveTo(X(0),Y(a));g.lineTo(X(53.3),Y(a));g.stroke()}g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.moveTo(X(0),Y(0));g.lineTo(X(53.3),Y(0));g.stroke();
  g.fillStyle='#ffffff70';g.font='bold 12px "Trebuchet MS",sans-serif';for(let a=10;a<=35;a+=10){g.fillText(String(a),X(2.4),Y(a)+4);g.fillText(String(a),X(50.9),Y(a)+4)}
  const t=pl.t||'deep',ax=pl.ax!=null?pl.ax:t=='squib'?23:t=='sky'?13:0,ay=pl.ay!=null?pl.ay:26.5,ex=X(ay),ey=Y(ax),sx=X(26.5),sy=PE_H-6;
  g.strokeStyle='#ffd84d';g.lineWidth=3;if(t=='squib')g.setLineDash([6,5]);g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo((sx+ex)/2+(t=='squib'?14:0),Math.min(sy,ey)-(t=='sky'?150:t=='squib'?4:70),ex,ey);g.stroke();g.setLineDash([]);
  const k=(()=>{try{return kickerOf('U')}catch(e){return{skl:65}}})(),acc=clamp(1.25-(k.skl-50)/80,.55,1.25),rr=3*acc*1.6*K;
  g.strokeStyle='#ffd84d88';g.lineWidth=1.5;g.setLineDash([4,4]);g.beginPath();g.ellipse(ex,ey,rr,(t=='deep'?4:2.6)*acc*1.6*K,0,0,7);g.stroke();g.setLineDash([]);
  g.fillStyle='#ffd84d';g.beginPath();g.arc(ex,ey,7,0,7);g.fill();g.fillStyle='#0b1410';g.beginPath();g.arc(ex,ey,2.5,0,7);g.fill();
  g.fillStyle='#ffffffcc';g.font='bold 11px sans-serif';g.fillText('KICKER (from your 35)  ↑',sx,sy-4);if(pl.ax==null){g.fillText('NORMAL SPREAD (click to aim)',ex,ey-14)}}
 g.textAlign='left'}
function sxCss(){if($('sxcss'))return;const src=[...document.querySelectorAll('style')].find(s=>s.textContent.includes('#pe .pe-top'));if(!src)return;const s=document.createElement('style');s.id='sxcss';
 s.textContent=src.textContent.replace(/#pd/g,'#zz').replace(/#ed\b/g,'#zz').replace(/#pe-cv/g,'#sx-cv').replace(/#pe-nm/g,'#sx-nm').replace(/#pe\b/g,'#sx');document.head.appendChild(s)}
addEventListener('keydown',e=>{if(!$('sx')||$('modal').hidden)return;const tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='SELECT')return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='z'){e.preventDefault();e.stopImmediatePropagation();sxUndo()}},true);
// ---------- menu entries ----------
{const i=NAVF.findIndex(x=>x[0]=='pd');if(!NAVF.some(x=>x[0]=='st'))NAVF.splice(i<0?NAVF.length:i+1,0,['st','stDes()','Special teams'])}
{const _g=g2Lobby;g2Lobby=function(...a){const r=_g.apply(this,a);try{if(feat('stdes')&&!CAR()){const b=[...$('modal').querySelectorAll('.gmenu button')].find(x=>/deditor\(\)/.test(x.getAttribute('onclick')||''));
  if(b)b.insertAdjacentHTML('afterend','<button onclick="stDes()"><em>&#127944;</em>Special teams<span>Returns and kickoffs</span></button>')}}catch(e){console.error(e)}return r}}
// ---------- saves: your special teams plays travel with exported saves ----------
{const _ex=exportSave;exportSave=function(){const _js=JSON.stringify;JSON.stringify=function(o,...a){if(o&&o.app=='gridiron-lab'&&o.R){o.st=lsGet('gdst')}return _js.call(JSON,o,...a)};try{return _ex()}finally{JSON.stringify=_js}}}
{const _im=importSave;importSave=function(file,done){return _im(file,ok=>{try{if(ok){const fr=new FileReader();fr.onload=()=>{try{const o=JSON.parse(fr.result);if(o&&o.st){lsSet('gdst',o.st);const s=JSON.parse(o.st);if(s&&s.r&&s.k)STP=s}}catch(e){}done(ok)};fr.readAsText(file);return}}catch(e){}done(ok)})}}
