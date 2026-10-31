'use strict';
let DE=null;const zrOf=q=>q[4]||(Math.abs(q[3][0])>=12?10:6.5);
function deditor(){if(!DE)DE={n:'Cover 2 Zone',pl:clone(DALL()['Cover 2 Zone']),sel:0,mode:'move',drag:0};
 $('modal').hidden=0;$('modal').innerHTML='<div id="ed"><div id="edt"></div><canvas id="dcv" width="960" height="540"></canvas><p>Move: drag defenders anywhere. Rush / Man / Zone sets the selected defender\'s job. Man: click a blue receiver. Zone: click the field for the spot he covers, then drag the ring or use Zone size -/+ to make it smaller or bigger (how far he reacts to receivers).</p></div>';
 const cv=$('dcv'),ep=e=>{const r=cv.getBoundingClientRect();return[((e.clientX-r.left)/r.width*960-300)/S,((e.clientY-r.top)/r.height*H-5)/S]};
 cv.onpointerdown=e=>{const[x,y]=ep(e),p=DE.pl.p,h=p.findIndex(q=>Math.hypot(q[0]-x,q[1]-y)<1.6);
  const zq=p[DE.sel];if(DE.mode=='zone'&&zq&&zq[2]=='z'&&Math.abs(Math.hypot(x-zq[3][0],y-zq[3][1])-zrOf(zq))<1.4){DE.rs=1;return}
  if(DE.mode=='man'){const j=[1,2,3,4,5].find(j=>Math.hypot(FOX[j]-x,FOY[j]-y)<1.8);if(j){p[DE.sel][2]='m';p[DE.sel][3]=j}else if(h>=0)DE.sel=h}
  else if(DE.mode=='zone'){if(h>=0)DE.sel=h;else{p[DE.sel][2]='z';p[DE.sel][3]=[Math.round(x*2)/2,Math.round(clamp(y,1,52)*2)/2]}}
  else if(h>=0){DE.sel=h;DE.drag=1}
  dedraw()};
 cv.onpointermove=e=>{if(DE.rs){const[x,y]=ep(e),q=DE.pl.p[DE.sel];q[4]=clamp(Math.round(Math.hypot(x-q[3][0],y-q[3][1])),2,16);dedraw();return}if(DE.drag){const[x,y]=ep(e),q=DE.pl.p[DE.sel];q[0]=clamp(Math.round(x*2)/2,.5,30);q[1]=clamp(Math.round(y*2)/2,1,52);dedraw()}};
 cv.onpointerup=()=>{DE.drag=0;DE.rs=0};deUI()}
function deUI(){const B=(e,t,n,on)=>`<button data-de="${e}" data-n="${n||''}" class="${on?'on':''}">${t}</button>`;
 $('edt').innerHTML=Object.keys(DALL()).map(n=>B('load',n,n,DE.n==n)).join('')+'<br>'+['move','man','zone'].map(m=>B('mode',m,m,DE.mode==m)).join('')+B('rush','Rush')+B('zm','Zone size -')+B('zp','Zone size +')+B('fm','Match formation: '+(DE.pl.fm===0?'off':'on'))+B('save','Save as...')+(DCP[DE.n]?B('del','Delete'):'')+B('done','Done');dedraw()}
function dClick(t){const q=DE.pl.p[DE.sel],sv=()=>localStorage.setItem('gd2d',JSON.stringify(DCP));
 if(t.de=='load'){DE.n=t.n;DE.pl=clone(DALL()[t.n]);DE.sel=0}
 if(t.de=='mode')DE.mode=t.n;
 if(t.de=='zm'||t.de=='zp'){if(q[2]=='z')q[4]=clamp(zrOf(q)+(t.de=='zp'?1:-1),2,16)}
 if(t.de=='fm')DE.pl.fm=DE.pl.fm===0?1:0;
 if(t.de=='rush'){q[2]='r';q.length=3}
 if(t.de=='save'){const n=(prompt('Name this defense',DE.n)||'').replace(/[^\w ]/g,'').slice(0,14);if(n){DCP[n]=clone(DE.pl);sv();DE.n=n}}
 if(t.de=='del'){delete DCP[DE.n];DE.n='Cover 2 Zone';DE.pl=clone(DALL()[DE.n]);sv()}
 if(t.de=='done'){if(JSON.stringify(DE.pl)!=JSON.stringify(DALL()[DE.n])){DCP[DE.n]=clone(DE.pl);sv()}if(G.live&&G.phase=='pre'&&G.poss!='U')applyDef(DE.n);return lobby()}
 deUI()}
function dedraw(){const g=$('dcv').getContext('2d'),ex=x=>300+x*S,ey=y=>y*S+5,W=960;g.fillStyle='#2e7d32';g.fillRect(0,0,W,H);g.textAlign='center';g.font='9px sans-serif';
 g.strokeStyle='#fff6';g.lineWidth=1;for(let x=-30;x<70;x+=5){g.beginPath();g.moveTo(ex(x),0);g.lineTo(ex(x),H);g.stroke()}
 g.strokeStyle='#4aa3ff';g.lineWidth=3;g.beginPath();g.moveTo(ex(0),0);g.lineTo(ex(0),H);g.stroke();g.fillStyle='rgba(239,68,68,.13)';g.fillRect(0,0,ex(.5),H);
 FOX.forEach((x,i)=>{g.fillStyle='#3b82f688';g.beginPath();g.arc(ex(x),ey(FOY[i]),9,0,7);g.fill();g.fillStyle='#fff';g.fillText(i>0&&i<6?i+' '+PO[i]:PO[i],ex(x),ey(FOY[i])+3)});
 DE.pl.p.forEach((q,i)=>{const s=i==DE.sel;g.lineWidth=2;
  if(q[2]=='m'){g.strokeStyle='#ffd84d';g.beginPath();g.moveTo(ex(q[0]),ey(q[1]));g.lineTo(ex(FOX[q[3]]),ey(FOY[q[3]]));g.stroke()}
  if(q[2]=='z'){g.strokeStyle='#9ad';g.setLineDash([5,4]);g.beginPath();g.moveTo(ex(q[0]),ey(q[1]));g.lineTo(ex(q[3][0]),ey(q[3][1]));g.stroke();g.beginPath();g.arc(ex(q[3][0]),ey(q[3][1]),zrOf(q)*S,0,7);g.stroke();g.setLineDash([]);g.fillStyle='#9ad';g.fillText(zrOf(q)+' yd',ex(q[3][0]),ey(q[3][1])+3)}
  if(q[2]=='r'){g.strokeStyle='#ff7b7b';g.beginPath();g.moveTo(ex(q[0]),ey(q[1]));g.lineTo(ex(-4),ey(26.5));g.stroke()}
  g.fillStyle='#ef4444';g.beginPath();g.arc(ex(q[0]),ey(q[1]),9,0,7);g.fill();if(s){g.strokeStyle='#ffd84d';g.lineWidth=3;g.stroke()}
  g.fillStyle='#fff';g.fillText(PD[i],ex(q[0]),ey(q[1])+3)})}
const _mc=$('modal').onclick;$('modal').onclick=e=>{const t=e.target.dataset;if(t.de)return dClick(t);if(_mc)_mc(e)};
