const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vThMpYnebaYI_2w9cLZr-lp9wpFDF-YcVEs4muuLk0LgpRBlNq9gVPgsFtwUHtsy02RmuY1Ds9ziOvf/pub?output=csv";

let rows = [], headers = [], i = 0, favs = [], deferredPrompt;

// Load CSV from Google Sheets
async function load() {
    try {
        const res = await fetch(sheetURL);
        const text = await res.text();
        const lines = text.split("\n").filter(l => l.trim() !== "");
        const parsed = lines.map(line => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/"/g, "").trim()));
        headers = parsed[0];
        rows = parsed.slice(1);
        show(0);
    } catch (err) {
        console.error("Error loading sheet:", err);
    }
}

// Show a row
function show(n) {
    if (!rows || rows.length === 0) return;
    i = (n + rows.length) % rows.length;
    const row = rows[i];
    let html = "";
    headers.forEach((h, ix) => {
        if (row[ix]) {
            html += `<div class="card"><b>${h}</b><br>${row[ix]}</div>`;
        }
    });
    document.getElementById("rowContent").innerHTML = html;
    document.getElementById("rowNumber").innerText = `${i + 1}/${rows.length}`;
}

// Navigation
function nextRow() { show(i + 1); }
function prevRow() { show(i - 1); }
function randomRow() { show(Math.floor(Math.random() * rows.length)); }

// Open Google / YouTube
function openGoogle() { window.open("https://google.com/search?q=" + rows[i].join(" ")); }
function openYT() { window.open("https://youtube.com/results?search_query=" + rows[i].join(" ")); }

// Favorites
function addFav() { favs.push(rows[i].join("\n")); alert("Saved ⭐"); }

// Swipe gestures
let startX = 0;
document.addEventListener("touchstart", e => startX = e.touches[0].clientX);
document.addEventListener("touchend", e => {
    let diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextRow() : prevRow(); }
});

// Install App button
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
            deferredPrompt = null;
            document.getElementById("installBtn").style.display = "none";
        });
    } else {
        alert("App cannot be installed at this time.");
    }
}

let installBtn = document.getElementById("installBtn");
installBtn.style.display = "none"; // hide initially
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "block";
});
window.addEventListener("appinstalled", () => {
    installBtn.style.display = "none";
    console.log("PWA installed ✅");
});

// Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(console.error);
}

// Load sheet on start
load();
