// ===============================
// 🔹 PANEL UI (Floating Control Box)
// ===============================
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
  <b>Wallet Tool</b><br><br>
  
  <input id="uid" placeholder="Enter UID" style="width:100%"><br><br>
  
  <button onclick="activate()">Activate</button><br><br>
  
  <button onclick="start()">Start</button>
  <button onclick="stop()">Stop</button>
  
  <p id="status">Loading...</p>
</div>
`;

document.body.appendChild(panel);


// ===============================
// 🔹 SYSTEM VARIABLES
// ===============================
let activated = false;
let running = false;
let allowedUIDs = [];


// ===============================
// 🔹 LOAD USERS FROM SERVER (users.json)
// ===============================
fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/users.json")
  .then(res => res.json())
  .then(data => {
    allowedUIDs = data.users || [];
    checkSavedUser();
  })
  .catch(() => {
    document.getElementById("status").innerText = "Server error ❌";
  });


// ===============================
// 🔹 AUTO CHECK SAVED USER
// ===============================
function checkSavedUser() {
  const savedUID = localStorage.getItem("uid");

  if (savedUID && allowedUIDs.includes(savedUID)) {
    activated = true;
    document.getElementById("status").innerText = "Activated ✅ (Saved)";
  } else {
    document.getElementById("status").innerText = "Not Activated";
  }
}


// ===============================
// 🔹 ACTIVATE USER
// ===============================
function activate() {
  const input = document.getElementById("uid").value.trim();

  // Check if UID exists in server list
  if (!allowedUIDs.includes(input)) {
    document.getElementById("status").innerHTML =
      "<span style='color:red'>Invalid UID ❌</span>";
    return;
  }

  // Save UID locally
  localStorage.setItem("uid", input);

  activated = true;
  document.getElementById("status").innerText = "Activated ✅";
}


// ===============================
// 🔹 START SYSTEM
// ===============================
function start() {
  const savedUID = localStorage.getItem("uid");

  if (!activated || !allowedUIDs.includes(savedUID)) {
    alert("Not activated ❌");
    return;
  }

  running = true;
  document.getElementById("status").innerText = "Running 🚀";
}


// ===============================
// 🔹 STOP SYSTEM
// ===============================
function stop() {
  running = false;
  document.getElementById("status").innerText = "Stopped ❌";
}


// ===============================
// 🔹 AUTOMATION LOOP
// ===============================
setInterval(() => {
  if (!running) return;

  console.log("Running...");

  // Example logic: highlight Buy buttons
  document.querySelectorAll('button').forEach(btn => {
    if (btn.innerText.toLowerCase().includes("buy")) {
      btn.style.border = "2px solid red";
    }
  });

}, 3000);
