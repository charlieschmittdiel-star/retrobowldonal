'use strict';
// Promotion and relegation: a second division of 20 clubs. The bottom three of Division 1 go down and the top three
// of Division 2 come up at the end of every season. Both divisions play every matchday.
{const add=[['Franchise','div2','Promotion and relegation','A second division: the bottom three go down, the top three of Division 2 come up. Starts with a new league or the next season.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}
const CITIES2=['Ashby','Bramford','Coldwater','Dunmore','Elmstead','Foxley','Glenrock','Hartwell','Kelby','Larkhill','Moorfield','Norbury','Oxley','Pembury','Quarrytown','Rushden','Saltmarsh','Tunstall','Wexcombe','Yarrow'];
const twoDiv=()=>R&&R.t.length>20&&R.t.some(t=>t.dv==2);
const divIds=d=>R.t.map((_,i)=>i).filter(i=>divOf(i)===d);
function addDiv2(){if(!R||R.t.length>20)return;R.t.forEach(t=>t.dv=1);const suff=SUFF.slice().sort(()=>rnd()-.5);
 for(let i=0;i<20;i++){const c=CITIES2[i];R.t.push({n:c+' '+suff[i],ab:c.slice(0,3).toUpperCase(),col:TCOL[(i+7)%TCOL.length],form:pick(['4-4-2','4-3-3','4-2-3-1','4-4-2','3-5-2']),w:0,d:0,l:0,gf:0,ga:0,form5:[],bud:8+rnd()*15,dv:2})}
 uniqAb();for(let t=20;t<40;t++)mkSquad(t,53+gauss()*2.2);setScheds()}
function setScheds(){const me=divOf(0),other=me==1?2:1;R.sched=mkSchedule(R.rounds,divIds(me));R.sched2=mkSchedule(R.rounds,divIds(other))}
{const _nl=newLeague;newLeague=function(o){const r=_nl(o);if(feat('div2')){addDiv2();if(feat('cup'))try{cupNew()}catch(e){}try{boardNew()}catch(e){}hSave()}return r}}
// the end of the season: who goes up and who goes down
{const _se=seasonEnd;seasonEnd=function(){const two=twoDiv();_se();if(!two)return;try{const t2=table(2),t1=table(1);addNews(`${R.t[t2[0]].n} win Division 2.`,t2[0]===0);if(t2[0]===0)teamPl(0).forEach(p=>p.aw.push(`${R.season} Division 2 champion`));
 if(feat('div2')){R.moves={up:t2.slice(0,3),down:t1.slice(-3)};addNews(`Relegated: ${R.moves.down.map(t=>R.t[t].n).join(', ')}. Promoted: ${R.moves.up.map(t=>R.t[t].n).join(', ')}.`,R.moves.down.includes(0)||R.moves.up.includes(0))}}catch(e){console.error(e)}}}
{const _ns=newSeason;newSeason=function(){const mv=R.moves;_ns();try{if(twoDiv()){if(mv&&feat('div2')){mv.down.forEach(t=>R.t[t].dv=2);mv.up.forEach(t=>R.t[t].dv=1);
   if(mv.up.includes(0)){addNews(`${R.t[0].n} are back in Division 1!`,1);achGet('promo')}if(mv.down.includes(0))addNews(`${R.t[0].n} start the season in Division 2.`,1);
   // promoted clubs get some money to strengthen, relegated ones lose some
   mv.up.forEach(t=>{if(t)R.t[t].bud+=15});mv.down.forEach(t=>{if(t)R.t[t].bud=Math.max(5,R.t[t].bud-10)})}
  R.moves=null;setScheds();if(feat('cup'))cupNew();boardNew();R.xi[0]=null}
 else if(feat('div2')){addDiv2();if(feat('cup'))cupNew();boardNew();addNews('A second division has started this season: from now on the bottom three go down.',1)}hSave()}catch(e){console.error(e)}}}
// achievements and the season recap
ACH.push(['promo','Going up','Win promotion from Division 2']);
{const _ru=recapUI;recapUI=function(){const r=R.recap,d=twoDiv()?divOf(0):0;_ru();try{if(!d)return;const p=$('modal').querySelector('p');if(p)p.insertAdjacentHTML('afterbegin',`Division ${d} · `);const mv=R.moves;if(mv){const t=mv.up.includes(0)?'<p class="w"><b>Promoted to Division 1!</b></p>':mv.down.includes(0)?'<p class="l"><b>Relegated to Division 2.</b></p>':'';if(t&&p)p.insertAdjacentHTML('afterend',t)}}catch(e){}}}
// the home page says which division you are in
{const _hu=homeUI;homeUI=function(){_hu();try{if(!twoDiv()||PAGE!=='home'||(typeof CAREER=='function'&&CAREER()&&!R.car))return;const p=document.querySelector('.main .head p');if(p)p.insertAdjacentHTML('afterbegin',`Division ${divOf(0)} · `)}catch(e){}}}
// smaller crowds in Division 2
{const _fd=franDay;franDay=function(){const c0=R.fin&&R.fin.cap;if(c0&&twoDiv()&&divOf(0)==2)R.fin.cap=Math.round(c0*.6);try{_fd()}finally{if(c0)R.fin.cap=c0}}}
