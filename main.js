// ===== PANEL UI =====
const panel = document.createElement('div');

panel.innerHTML = `
<div style="
  position:fixed;
  bottom:20px;
  right:20px;
  background:white;
  padding:15px;
  border-radius:10px;
  z-index:9999;
  box-shadow:0 0 10px rgba(0,0,0,0.3);
  width:200px;
">
  <b>My Wallet Tool</b><br><br>
  
  <input id="uid" placeholder="Enter UID" style="width:100%"><br><br>
  
  <button onclick="activate()">Activate</button><br><br>
  
  <button onclick="start()">Start</button>
  <button onclick="stop()">Stop</button>
  
  <p id="status">Not Activated</p>
</div>
`;

document.body.appendChild(panel);


// ===== ACTIVATION =====
let activated = false;
const allowedUID = "26866223"; // change this

function activate() {
  const input = document.getElementById("uid").value;

  if (input === allowedUID) {
    activated = true;
    document.getElementById("status").innerText = "Activated ✅";
  } else {
    alert("Invalid UID");
  }
}


// ===== START / STOP =====
let running = false;

function start() {
  if (!activated) {
    alert("Activate first!");
    return;
  }

  running = true;
  document.getElementById("status").innerText = "Running 🚀";
}

function stop() {
  running = false;
  document.getElementById("status").innerText = "Stopped ❌";
}


// ===== AUTOMATION LOOP =====
setInterval(() => {
  if (!running) return;

  console.log("Running...");

  document.querySelectorAll('button').forEach(btn => {
    if (btn.innerText.toLowerCase().includes("buy")) {
      btn.style.border = "2px solid red";
    }
  });

}, 3000);
