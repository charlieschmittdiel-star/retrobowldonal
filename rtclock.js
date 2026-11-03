'use strict';
// Real-time clock: when the clock is running between plays, it ticks down one second per real second while you pick a
// play and line up, instead of jumping 25 seconds at the snap. The CPU offense takes a few real seconds at the line
// (longer when it wants to run out the clock). The two-minute warning and running out of time work the same way.
{const add=[['On the field','rtclock','Real-time clock','Between plays the running clock ticks down one second per real second while you call the play, instead of jumping at the snap.']];
 add.forEach(a=>{if(FEATS.some(f=>f[1]==a[1]))return;let i=-1;FEATS.forEach((f,j)=>{if(f[0]==a[0])i=j});FEATS.splice(i<0?FEATS.length:i+1,0,a)})}
const RTC=()=>feat('rtclock')&&G&&G.live&&!G.prac&&!G.tut&&!(typeof autoMode=='function'&&autoMode());
// how long the CPU offense stays at the line, in real seconds (short, so you are not left waiting)
const rtWant=()=>{const r=cpuRunoff();return r>=38?12:r>=25?6:3};
{const _ca=clockAtSnap;clockAtSnap=function(){if(!RTC())return _ca();if(P.ranoff)return false;
  if(G.poss=='C'&&G.run&&!P.rtGo){const w=P.rtWant||(P.rtWant=rtWant());if((P.rtT||0)<w){if(!P.rtHold){P.rtHold=1;G.msg='The offense takes its time at the line...';ui()}return true}}
  P.ranoff=1;return false}}
function rtTick(dt){if(!RTC()||!P||!(G.phase=='pre'||G.phase=='motion')||!G.run||G.paused||!$('modal').hidden||G.clk<=0||P.ranoff&&G.phase=='pre')return;
 const was=G.clk;G.clk=Math.max(0,G.clk-dt);P.rtT=(P.rtT||0)+dt;
 // the two-minute warning stops the clock
 if((G.q==2||G.q==4)&&!G['w'+G.q]&&was>120&&G.clk<=120){G['w'+G.q]=1;G.clk=120;G.run=false;P.rtHold=0;G.msg='Two-minute warning. The clock is stopped.';ui();return}
 if(G.clk<=0&&G.phase=='pre'){G.clk=0;P.over=1;P.ranoff=1;G.msg='Time runs out.';G.phase='post';G.pt=1.4;G.next='same';G.nl=P.L;ui();return}
 if(P.rtHold&&G.phase=='pre'&&P.rtT>=P.rtWant){P.rtHold=0;P.rtGo=1;snap()}}
{const _cl=careerLoop;careerLoop=function(dt){try{rtTick(dt)}catch(e){console.error(e)}return _cl(dt)}}
