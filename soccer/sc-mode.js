'use strict';
// Pitch Lab: (1) manager / career mode is chosen once, when a save slot is created, and (2) an "Exit to menu" button in the pause menu.
// This file wraps existing functions and leaves the originals alone. Load it after sc-real.js.
{const add=[['Help','modelock','Mode is chosen per save slot','Manager or Career is picked when you start a new save and stays with that slot. Turn this off to get the old "Switch mode" button back.'],
 ['Help','exitbtn','Exit to menu button','Adds an "Exit to menu" button to the pause menu. It asks first, and the match does not count.']];
 add.forEach(a=>{if(HFEATS.some(f=>f[1]==a[1]))return;let i=-1;HFEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});HFEATS.splice(i<0?HFEATS.length:i+1,0,a)})}

// ---------- each slot keeps its own mode ----------
const MK_F=n=>n>1?HKEY+'_'+n:HKEY, MK_C=n=>n>1?'soccer_career_'+n:'soccer_career';
const mkSlot=()=>OPT.slot>1?OPT.slot:1;
function slotMode(n){if(lsGet(MK_F(n)))return'franchise';if(lsGet(MK_C(n)))return'career';return(OPT.pm&&OPT.pm[n])||'franchise'}
function syncMode(){if(feat('modelock'))OPT.mode=slotMode(mkSlot())}
// the career save used to be one shared save; give it a real slot. If slot 1 already holds a manager save, the career moves to a free slot.
function mkMigrate(){try{if(OPT.mkm)return;OPT.mkm=1;const c=lsGet('soccer_career');
 if(c){if(lsGet(HKEY)){let n=0;for(const k of[2,3])if(!lsGet(MK_F(k))&&!lsGet(MK_C(k))){n=k;break}
   if(n&&lsSet(MK_C(n),c)){lsDel('soccer_career');if(OPT.mode==='career')OPT.slot=n}else OPT.mkm=0}
  else if(OPT.mode==='career')OPT.slot=1}
 optSave()}catch(e){}}
mkMigrate();syncMode();
{const _sk=slotKey;slotKey=function(){return CAREER()?MK_C(mkSlot()):MK_F(mkSlot())}}

function pickMode(m){OPT.pm=OPT.pm||{};OPT.pm[mkSlot()]=m;OPT.mode=m;optSave();location.reload()}
// the old buttons set the mode for the whole game; point them at this slot instead
function mkFixBtns(){try{document.querySelectorAll('#ui button[onclick*="OPT.mode="]').forEach(b=>{const o=b.getAttribute('onclick')||'';b.setAttribute('onclick',o.includes("'career'")?"pickMode('career')":"pickMode('franchise')")})}catch(e){}}

slotInfo=function(n){try{const f=lsGet(MK_F(n));if(f){const r=JSON.parse(f);return'Manager: '+esc(r.t[0].n)+', season '+r.season}
 const c=lsGet(MK_C(n));if(c){const r=JSON.parse(c),p=r.car&&r.pl.find(q=>q.id===r.car.id);return'Career: '+esc(p?p.n:r.t[0].n)+', season '+r.season}}catch(e){}return'Empty'};

{const _sg=slotGo;slotGo=function(n){if(!feat('modelock'))return _sg(n);const was=OPT.mode;hSave();OPT.slot=n;syncMode();optSave();UNDO=null;
 if(OPT.mode!==was){location.reload();return}if(hLoad()&&R&&R.t)homeUI();else{R=null;startUI()}}}

{const _su=startUI;startUI=function(){_su();try{mkFixBtns();if(!feat('modelock'))return;const c=$('ui').querySelector('.start');if(!c)return;
 c.insertAdjacentHTML('afterbegin',`<div class="card"><h3>New save${feat('slots')?' (slot '+mkSlot()+')':''}</h3><p>Choose how to play this save: run a club as the manager, or start a career as one player. You choose once and the save stays that way.${feat('slots')?' To play the other mode, start a new save in another empty slot.':''}</p></div>`)}catch(e){console.error(e)}}}

function mkSlotCard(){const cur=mkSlot(),note=`<p class="small">This save is in ${CAREER()?'career':'manager'} mode. You pick the mode when you start a new save, and it stays with that slot. For the other mode, use an empty slot.</p>`;
 if(!feat('slots'))return`<div class="card"><h3>Game mode</h3>${note}</div>`;
 return`<div class="card"><h3>Save slots</h3>${note}<table class="t">${[1,2,3].map(n=>{const i=slotInfo(n);return`<tr class="${cur==n?'me':''}"><td>Slot ${n}</td><td>${i}</td><td>${cur==n?'<b>Playing</b>':B(`slotGo(${n})`,i=='Empty'?'New save':'Switch','xs')}</td></tr>`}).join('')}</table></div>`}
{const _st=setUI;setUI=function(){_st();try{mkFixBtns();if(!feat('modelock'))return;const m=document.querySelector('.main');if(!m)return;
 [...m.querySelectorAll('.card h3')].filter(h=>h.textContent=='Game mode'||h.textContent=='Save slots').forEach(h=>h.parentElement.remove());
 m.insertAdjacentHTML('beforeend',mkSlotCard())}catch(e){console.error(e)}}}

// ---------- exit to menu ----------
function exitAsk(){if(!G||G.phase=='over')return;G.paused=true;modal(`<h2>Exit this match?</h2><p>You go back to the menu and this match does not count. To finish fast and keep the result, use "Sim the rest of the match" instead.</p><div class="row">${B('exitGo()','Yes, exit','big')}${B('closeModal();G.paused=false','Keep playing')}</div>`)}
function exitGo(){G=null;if(LOOP)cancelAnimationFrame(LOOP);LOOP=null;try{for(const k in KEYS)KEYS[k]=0}catch(e){}try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}closeModal();homeUI()}
{const _gm=gameMenu;gameMenu=function(){_gm();try{if(!feat('exitbtn')||!G||G.tut||G.rp||G.viewer||G.phase=='over')return;const M=$('modal'),h=M.querySelector('h2');if(!h||h.textContent!='Paused')return;
 const r=M.querySelector('.row');if(r)r.insertAdjacentHTML('beforeend',B('exitAsk()','Exit to menu'))}catch(e){}}}
