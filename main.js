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
  width:220px;
  font-family:sans-serif;
">
  <b>My Wallet Tool</b><br><br>
  
  <input id="uid" placeholder="Enter UID" style="width:100%"><br><br>
  
  <button onclick="activate()">Activate</button><br><br>
  
  <button onclick="start()">Start</button>
  <button onclick="stop()">Stop</button>
  
  <p id="status">Loading...</p>
</div>
`;

document.body.appendChild(panel);


// ===== SYSTEM VARIABLES =====
let activated = false;
let running = false;
let userData = {};


// ===== LOAD SERVER DATA =====
fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/users.json")
  .then(res => res.json())
  .then(data => {
    userData = data;
    checkSavedUser();
  })
  .catch(() => {
    document.getElementById("status").innerText = "Server error ❌";
  });


// ===== CHECK SAVED USER =====
function checkSavedUser() {
  const savedUID = localStorage.getItem("uid");

  if (!savedUID || !userData[savedUID]) {
    document.getElementById("status").innerText = "Not Activated";
    return;
  }

  const expiry = userData[savedUID].expiry;

  if (Date.now() < expiry) {
    activated = true;

    const daysLeft = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
    document.getElementById("status").innerText = "Active (" + daysLeft + " days left)";
  } else {
    localStorage.removeItem("uid");
    document.getElementById("status").innerText = "Expired ❌";
  }
}


// ===== ACTIVATE =====
function activate() {
  const input = document.getElementById("uid").value.trim();

  if (!userData[input]) {
    document.getElementById("status").innerHTML = "<span style='color:red'>Invalid UID ❌</span>";
    return;
  }

  const expiry = userData[input].expiry;

  if (Date.now() > expiry) {
    document.getElementById("status").innerText = "Expired ❌";
    return;
  }

  localStorage.setItem("uid", input);
  activated = true;

  const daysLeft = Math.ceil((expiry - Date.now()) / (1000 * 60 * 60 * 24));
  document.getElementById("status").innerText = "Activated (" + daysLeft + " days left)";
}


// ===== START =====
function start() {
  const savedUID = localStorage.getItem("uid");

  if (!activated || !userData[savedUID]) {
    alert("Not activated ❌");
    return;
  }

  const expiry = userData[savedUID].expiry;

  if (Date.now() > expiry) {
    alert("Subscription expired ❌");
    return;
  }

  running = true;
  document.getElementById("status").innerText = "Running 🚀";
}


// ===== STOP =====
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
