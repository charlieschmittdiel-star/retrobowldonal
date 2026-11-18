'use strict';
// Gridiron Lab: League (franchise) or Career is chosen once, when a save is created, instead of with a global mode switch.
// The Settings "Game mode" buttons go away; the slot list shows both leagues and careers, and "start a new league / career here" picks the mode.
// This file wraps existing functions and leaves the originals alone. Load it after modes.js and league.js.
{const add=[['Franchise','modelock','Mode is chosen per save','League or Career is picked when you start a new save and stays with that save. Needs Save slots to be on. Turn this off to get the old "Game mode" buttons back.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const mlLockOn=()=>feat('modelock')&&feat('slots')&&typeof indexedDB!='undefined';
const mlWord=T=>T=='career'?'career':'league';

async function mlGet(k){const db=await slotDB();return new Promise((ok,no)=>{const t=db.transaction('slots','readonly').objectStore('slots').get(k);t.onsuccess=()=>ok(t.result||null);t.onerror=()=>no(t.error)})}
async function mlPut(k,v){const db=await slotDB();return new Promise((ok,no)=>{const tx=db.transaction('slots','readwrite');tx.objectStore('slots').put(v,k);tx.oncomplete=()=>ok(true);tx.onerror=()=>no(tx.error)})}
async function mlDel(k){const db=await slotDB();return new Promise((ok,no)=>{const tx=db.transaction('slots','readwrite');tx.objectStore('slots').delete(k);tx.oncomplete=()=>ok(true);tx.onerror=()=>no(tx.error)})}

// Load a save (or start a new one) in either mode. T = 'franchise' or 'career', n = slot number, fresh = start a new save there.
async function mlSwitch(T,n,fresh){try{
 if(G&&G.live){alert('Finish or leave the current game first.');return}
 if(T===MODE)return slotSwitch(n,fresh);
 const KT=T=='career'?'gd3c':'gd3',aT=+(lsGet('gdslot_'+T)||1);
 await slotStoreCurrent();
 if(n!=aT){
  const cur=lsGet(KT);if(cur){let info=null;try{info=slotInfo(JSON.parse(cur))}catch(e){}
   await mlPut(T+':'+aT,{data:cur,bak1:lsGet(KT+'_bak1'),bak2:lsGet(KT+'_bak2'),info,when:Date.now()})}
  if(!fresh){const v=await mlGet(T+':'+n);if(!v||!v.data){alert('That slot is empty.');return}
   if(!lsSet(KT,v.data)){alert('Could not load that save: browser storage is full.');return}
   [['_bak1',v.bak1],['_bak2',v.bak2]].forEach(([k,d])=>{if(d)lsSet(KT+k,d);else lsDel(KT+k)})}
  else{lsDel(KT);lsDel(KT+'_bak1');lsDel(KT+'_bak2')}
  lsSet('gdslot_'+T,String(n))}
 else if(fresh){lsDel(KT);lsDel(KT+'_bak1');lsDel(KT+'_bak2')}
 lsSet('gdmode',T);location.reload()}catch(e){console.error(e);alert('Switching saves failed: '+(e&&e.message||e))}}
async function mlRemove(T,n){if(!confirm('Delete the '+mlWord(T)+' in slot '+n+'? This cannot be undone.'))return;try{await mlDel(T+':'+n)}catch(e){}slotFill()}

{const _sf=slotFill;slotFill=async function(){if(!mlLockOn())return _sf();const box=$('slotbox');if(!box)return;let h='';
 for(const T of['franchise','career']){const KT=T=='career'?'gd3c':'gd3',a=T==MODE?slotAct():+(lsGet('gdslot_'+T)||1),w=mlWord(T);
  h+=`<tr><td colspan="4"><b>${T=='career'?'Careers (you are one player)':'Leagues (you run the team)'}</b></td></tr>`;
  for(let n=1;n<=SLN;n++){let i=null;
   if(n==a){if(T==MODE)i=slotInfo(R);else{const s=lsGet(KT);if(s){try{i=slotInfo(JSON.parse(s))}catch(e){}}}}
   else{try{const v=await mlGet(T+':'+n);i=v&&v.info}catch(e){}}
   const cur=T==MODE&&n==a;
   h+=`<tr class="${cur?'me':''}"><td><b>Slot ${n}</b></td><td>${i?`${esc(i.name)}${i.name!=i.team?' <span class="dim small">('+esc(i.team)+')</span>':''}`:'<span class="dim">Empty</span>'}</td><td class="small">${i?`Season ${i.season} · ${i.rec}`:''}</td>
   <td>${cur?'<b class="w">Playing now</b>':i?B(`mlSwitch('${T}',${n})`,'Load this '+w)+(n!=a?B(`if(confirm('Start a new ${w} in slot ${n}? The ${w} there will be replaced.'))mlSwitch('${T}',${n},1)`,'Start over here')+B(`mlRemove('${T}',${n})`,'Delete'):''):B(`mlSwitch('${T}',${n},1)`,'Start a new '+w+' here')}</td></tr>`}}
 box.innerHTML=`<table>${h}</table><p class="small">Each save is either a league or a career. You pick which when you start a new save, and it stays that way. Your current game is saved into its slot when you switch, then the page reloads. Playbooks are shared by all saves.</p>`}}

// the old global "Game mode" buttons go away; the slot list is where you start a new league or career
{const _st=settingsUI;settingsUI=function(...a){const r=_st.apply(this,a);try{if(mlLockOn()){
 [...$('modal').querySelectorAll('h3')].forEach(h=>{if(h.textContent=='Game mode'){const p=h.nextElementSibling,d=p&&p.nextElementSibling;[p,d,h].forEach(x=>x&&x.remove())}else if(/^(League|Career) slots$/.test(h.textContent))h.textContent='Saves'})}}catch(e){console.error(e)}return r}}
