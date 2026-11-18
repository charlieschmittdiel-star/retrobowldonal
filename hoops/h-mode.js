'use strict';
// Hardwood Lab: Franchise / Career / College is chosen once, when a save slot is created.
// This file wraps existing functions and leaves the originals alone. Load it after h-real.js.
{const add=[['Franchise','modelock','Mode is chosen per save slot','Franchise, Career or College is picked when you start a new save and stays with that slot. Turn this off to get the old "Game mode" buttons back.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}

// ---------- each slot keeps its own mode ----------
const MK_K={franchise:n=>n>1?'hoops_save_'+n:'hoops_save',career:n=>n>1?'hoops_career_'+n:'hoops_career',college:n=>n>1?'hoops_college_'+n:'hoops_college'};
const MK_M=['franchise','career','college'];
const mkSlot=()=>OPT.slot>1?OPT.slot:1;
const mkHas=n=>MK_M.some(m=>lsGet(MK_K[m](n)));
function slotMode(n){for(const m of MK_M)if(lsGet(MK_K[m](n)))return m;return(OPT.pm&&OPT.pm[n])||'franchise'}
function syncMode(){if(feat('modelock'))OPT.mode=slotMode(mkSlot())}
// the career and college saves used to be shared by every slot; give each one a real slot.
// Slot 1 keeps the franchise save, the others move to a free slot.
function mkMigrate(){try{if(OPT.mkm)return;OPT.mkm=1;const old=MK_M.filter(m=>lsGet(MK_K[m](1)));
 if(old.length){const keep=old.includes('franchise')?'franchise':old[0],at={};let fail=0;at[keep]=1;
  old.filter(m=>m!==keep).forEach(m=>{let n=0;for(const k of[2,3])if(!mkHas(k)){n=k;break}
   if(n&&lsSet(MK_K[m](n),lsGet(MK_K[m](1)))){lsDel(MK_K[m](1));at[m]=n}else fail=1});
  if((OPT.mode==='career'||OPT.mode==='college')&&at[OPT.mode])OPT.slot=at[OPT.mode];if(fail)OPT.mkm=0}
 optSave()}catch(e){}}
mkMigrate();syncMode();
{const _sk=slotKey;slotKey=function(n){n=n||mkSlot();const m=(n==mkSlot()?OPT.mode:slotMode(n))||'franchise';return(MK_K[m]||MK_K.franchise)(n)}}

function pickMode(m){OPT.pm=OPT.pm||{};OPT.pm[mkSlot()]=m;OPT.mode=m;optSave();location.reload()}
// the old buttons set the mode for the whole game; point them at this slot instead
function mkFixBtns(){try{document.querySelectorAll('#ui button[onclick*="OPT.mode="]').forEach(b=>{const x=/OPT\.mode='(\w+)'/.exec(b.getAttribute('onclick')||'');if(x)b.setAttribute('onclick',`pickMode('${x[1]}')`)})}catch(e){}}

function slotInfo(n){try{const L={franchise:'Franchise',career:'Career',college:'College'};
 for(const m of MK_M){const s=lsGet(MK_K[m](n));if(!s)continue;const r=JSON.parse(s),t=r.t[0];
  if(m==='career'){const p=r.car&&r.pl.find(q=>q.id===r.car.id);return`${L[m]}: ${esc(p?p.n:t.n)} · season ${r.season}`}
  return`${L[m]}: ${esc(t.n)} · season ${r.season}`+(t.w!=null?` · ${t.w}-${t.l}`:'')}}catch(e){}return mkHas(n)?'A saved game':'Empty'}

{const _sg=slotGo;slotGo=function(n,fresh){if(!feat('modelock'))return _sg(n,fresh);const was=OPT.mode;hSave();OPT.slot=n;syncMode();optSave();R=null;
 if(OPT.mode!==was){location.reload();return}if(!fresh&&hLoad())homeUI();else startUI()}}

{const _su=startUI;startUI=function(){_su();try{mkFixBtns();if(!feat('modelock'))return;const c=$('ui').querySelector('.start');if(!c)return;
 c.insertAdjacentHTML('afterbegin',`<div class="card"><h3>New save${feat('slots')?' (slot '+mkSlot()+')':''}</h3><p>Choose how to play this save: run a team in franchise mode, start a career as one player, or coach a college program. You choose once and the save stays that way.${feat('slots')?' To play another mode, start a new save in another empty slot.':''}</p></div>`)}catch(e){console.error(e)}}}

function mkSlotCard(){const cur=mkSlot(),nm={franchise:'franchise',career:'career',college:'college'}[OPT.mode]||'franchise',note=`<p class="small">This save is in ${nm} mode. You pick the mode when you start a new save, and it stays with that slot. For another mode, use an empty slot.</p>`;
 if(!feat('slots'))return`<div class="card"><h3>Game mode</h3>${note}</div>`;
 return`<div class="card"><h3>Save slots</h3>${note}<table class="t">${[1,2,3].map(n=>{const has=mkHas(n);return`<tr class="${cur==n?'me':''}"><td>Slot ${n}</td><td>${slotInfo(n)}</td><td>${cur==n?'<b>Playing</b>':has?B(`slotGo(${n})`,'Load','xs')+B(`slotDel(${n})`,'Delete','xs danger'):B(`slotGo(${n},1)`,'New save','xs')}</td></tr>`}).join('')}</table></div>`}
{const _st=setUI;setUI=function(){_st();try{mkFixBtns();if(!feat('modelock'))return;const m=$('mainpg');if(!m)return;
 [...m.querySelectorAll('.card h3')].filter(h=>h.textContent=='Game mode'||h.textContent=='Save slots').forEach(h=>h.parentElement.remove());
 m.insertAdjacentHTML('beforeend',mkSlotCard())}catch(e){console.error(e)}}}
