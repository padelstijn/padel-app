const sheetURL="https://docs.google.com/spreadsheets/d/e/2PACX-1vThMpYnebaYI_2w9cLZr-lp9wpFDF-YcVEs4muuLk0LgpRBlNq9gVPgsFtwUHtsy02RmuY1Ds9ziOvf/pub?output=csv";

let rows=[], headers=[], i=0, favs=[], deferredPrompt;

// Load data from Google Sheets
async function load(){
  const r = await fetch(sheetURL);
  const t = await r.text();
  const l = t.split("\n").filter(x=>x);
  const p = l.map(x=>x.split(","));
  headers = p[0];
  rows = p.slice(1);
  show(0);
}

// Show current row
function show(n){
  i = (n + rows.length) % rows.length; // wrap
  const row = rows[i];
  let html="";
  headers.forEach((h,ix)=>{
    if(row[ix]){
      html += `<div class="card"><b>${h}</b><br>${row[ix]}</div>`;
    }
  });
  rowContent.innerHTML = html;
  rowNumber.innerText=`${i+1}/${rows.length}`;
}

// Navigation
function nextRow(){ show(i+1); }
function prevRow(){ show(i-1); }
function randomRow(){ show(Math.floor(Math.random()*rows.length)); }

// Open Google / YouTube
function openGoogle(){ window.open("https://google.com/search?q="+rows[i].join(" ")); }
function openYT(){ window.open("https://youtube.com/results?search_query="+rows[i].join(" ")); }

// Favorites
function addFav(){ favs.push(rows[i].join("\n")); alert("Saved ⭐"); }

// Swipe gestures
let startX=0;
document.addEventListener("touchstart", e=> startX=e.touches[0].clientX );
document.addEventListener("touchend", e=>{
  let diff = startX - e.changedTouches[0].clientX;
  if(Math.abs(diff) > 50){ diff>0?nextRow():prevRow(); }
});

// Install button handling
let installBtn = document.getElementById("installBtn");
installBtn.style.display = "none"; // hide initially

window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block"; // show button only if installable
});

installBtn.addEventListener("click", ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice=>{
    deferredPrompt = null;
    installBtn.style.display = "none"; // hide after prompt
  });
});

// Hide button permanently after app installed
window.addEventListener("appinstalled", ()=>{
  installBtn.style.display = "none";
  console.log("PWA installed ✅");
});

// Service worker
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}

// Load data initially
load();
