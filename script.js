const today = new Date().toISOString().slice(0,10);
let data = JSON.parse(localStorage.getItem("vxnnLifeDataPremium") || '{"days":{},"xp":0,"focusSessions":0,"longestStreak":0}');
const quotes=["You don’t find willpower. You create it.","Small steps daily become a powerful life.","Discipline today, freedom tomorrow.","Your future is built by today’s actions.","No excuses. Just progress.","Sai Charan, one focused day can change everything.","Don’t wait for motivation. Move first."];

const toast=(msg)=>{const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2400);};
const saveData=()=>localStorage.setItem("vxnnLifeDataPremium",JSON.stringify(data));

document.querySelectorAll("nav button").forEach(btn=>{btn.onclick=()=>{document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));document.getElementById(btn.dataset.tab).classList.add("active");};});
document.querySelectorAll(".habit").forEach(h=>{h.checked=!!(data.days[today]&&data.days[today].habits&&data.days[today].habits[h.dataset.id]);h.onchange=updateUI;});

function alreadySavedToday(){return !!(data.days[today]&&data.days[today].saved);}
function lockTodayIfSaved(){const saved=alreadySavedToday();document.querySelectorAll(".habit").forEach(h=>h.disabled=saved);const btn=document.getElementById("saveDay");const status=document.getElementById("saveStatus");if(saved){btn.disabled=true;btn.textContent="Saved Today ✅";status.textContent="Today is locked. Come back tomorrow.";}else{btn.disabled=false;btn.textContent="Save Today";status.textContent="";}}

document.getElementById("saveDay").onclick=()=>{if(alreadySavedToday()){toast("Already saved today ✅");return;}const habits={};let addedXP=0,completed=0;document.querySelectorAll(".habit").forEach(h=>{habits[h.dataset.id]=h.checked;if(h.checked){addedXP+=Number(h.dataset.xp);completed++;}});if(completed===0){toast("Complete at least one mission first ⚡");return;}data.days[today]={saved:true,habits,score:Math.round((completed/3)*100),xp:addedXP};data.xp+=addedXP;data.longestStreak=Math.max(data.longestStreak||0,streak());saveData();updateUI();toast(`Saved! +${addedXP} XP 🔥`);levelPopup();};

document.getElementById("newQuote").onclick=()=>{const q=quotes[Math.floor(Math.random()*quotes.length)];document.getElementById("motivationText").textContent=q;document.getElementById("heroQuote").textContent="“"+q+"”";};

document.getElementById("soundBtn").onclick=()=>{try{const AudioContext=window.AudioContext||window.webkitAudioContext;const ctx=new AudioContext();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.frequency.value=620;gain.gain.value=.05;osc.connect(gain);gain.connect(ctx.destination);osc.start();setTimeout(()=>{osc.stop();ctx.close();},180);}catch(e){}toast(document.getElementById("motivationText").textContent);};

document.getElementById("resetBtn").onclick=()=>{if(confirm("Reset all VXNN LIFE data?")){localStorage.removeItem("vxnnLifeDataPremium");location.reload();}};

function streak(){let count=0;for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);const day=data.days[key];if(day&&day.saved)count++;else break;}return count;}
function totalSavedDays(){return Object.values(data.days).filter(d=>d.saved).length;}
function getLevel(){if(data.xp>=2500)return{name:"Legend 👑",next:4000};if(data.xp>=1200)return{name:"Beast 🔥",next:2500};if(data.xp>=500)return{name:"Warrior ⚔️",next:1200};if(data.xp>=150)return{name:"Focused ⚡",next:500};return{name:"Starter",next:150};}
function levelPopup(){const level=getLevel().name;const old=localStorage.getItem("lastLevelPremium");if(old!==level){localStorage.setItem("lastLevelPremium",level);toast("New level unlocked: "+level);}}

function updateWeek(){const grid=document.getElementById("weekGrid");grid.innerHTML="";for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=d.toISOString().slice(0,10);const done=data.days[key]&&data.days[key].saved;const div=document.createElement("div");div.className="day "+(done?"done":"");div.textContent=d.toLocaleDateString("en-US",{weekday:"short"}).slice(0,3);grid.appendChild(div);}}

function updateUI(){const done=[...document.querySelectorAll(".habit")].filter(h=>h.checked).length;const percent=Math.round(done/3*100);document.getElementById("focusScore").textContent=percent+"%";document.getElementById("streakDays").textContent=streak();document.getElementById("xpValue").textContent=data.xp;const level=getLevel();document.getElementById("levelName").textContent=level.name;document.getElementById("levelBar").style.width=Math.min((data.xp/level.next)*100,100)+"%";document.getElementById("totalDays").textContent=totalSavedDays();document.getElementById("longestStreak").textContent=data.longestStreak||streak();document.getElementById("focusSessions").textContent=data.focusSessions||0;document.getElementById("focusSessions2").textContent=data.focusSessions||0;updateWeek();lockTodayIfSaved();}

document.getElementById("shareBtn").onclick=async()=>{const text=`VXNN LIFE ⚡\nStreak: ${streak()} days\nXP: ${data.xp}\nLevel: ${getLevel().name}\nFocus Sessions: ${data.focusSessions||0}`;if(navigator.share){await navigator.share({title:"My VXNN LIFE Progress",text});}else{navigator.clipboard.writeText(text);toast("Progress copied. Share it with friends 📤");}};

let focusSeconds=25*60,focusMode="focus",focusTimer=null,isRunning=false;
function renderFocus(){const m=Math.floor(focusSeconds/60),s=focusSeconds%60;document.getElementById("focusTimer").textContent=`${m}:${s.toString().padStart(2,"0")}`;document.getElementById("focusModeText").textContent=focusMode==="focus"?"Focus Time 🔒":"Break Time 🧘";document.getElementById("focusSub").textContent=focusMode==="focus"?"No distractions. Build your future.":"Relax. Your next focus round is coming.";}
function startFocusTimer(){if(isRunning)return;isRunning=true;focusTimer=setInterval(()=>{focusSeconds--;renderFocus();if(focusSeconds<=0){clearInterval(focusTimer);isRunning=false;if(focusMode==="focus"){data.focusSessions=(data.focusSessions||0)+1;data.xp+=50;saveData();updateUI();toast("Focus complete! +50 XP 🔥");focusMode="break";focusSeconds=5*60;}else{toast("Break complete. Back to focus ⚡");focusMode="focus";focusSeconds=25*60;}renderFocus();}},1000);}
document.getElementById("focusBtn").onclick=()=>{document.querySelector('[data-tab="focus"]').click();startFocusTimer();};
document.getElementById("startFocus").onclick=startFocusTimer;
document.getElementById("pauseFocus").onclick=()=>{clearInterval(focusTimer);isRunning=false;toast("Paused");};
document.getElementById("resetFocus").onclick=()=>{clearInterval(focusTimer);isRunning=false;focusMode="focus";focusSeconds=25*60;renderFocus();};
renderFocus();updateUI();setTimeout(()=>{if(!alreadySavedToday())toast("Today’s mission is waiting ⚡");},2500);