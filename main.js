// ===============================
// 🔹 PANEL UI
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
  z-index:999999;
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
// 🔹 VARIABLES
// ===============================
let activated = false;
let running = false;
let allowedUIDs = [];


// ===============================
// 🔹 LOAD USERS
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
// 🔹 CHECK SAVED USER
// ===============================
function checkSavedUser() {
  const savedUID = localStorage.getItem("uid");

  if (savedUID && allowedUIDs.includes(savedUID)) {
    activated = true;
    document.getElementById("status").innerText = "Activated ✅ (Saved)";
    document.getElementById("uid").value = savedUID;
  } else {
    document.getElementById("status").innerText = "Not Activated";
  }
}


// ===============================
// 🔹 ACTIVATE
// ===============================
function activate() {
  const input = document.getElementById("uid").value.trim();

  if (!allowedUIDs.includes(input)) {
    document.getElementById("status").innerHTML =
      "<span style='color:red'>Invalid UID ❌</span>";
    return;
  }

  localStorage.setItem("uid", input);
  activated = true;

  document.getElementById("status").innerText = "Activated ✅ (" + input + ")";
}


// ===============================
// 🔹 START
// ===============================
function start() {
  const savedUID = localStorage.getItem("uid");

  if (!activated || !allowedUIDs.includes(savedUID)) {
    activated = false;
    localStorage.removeItem("uid");
    alert("Access revoked ❌");
    return;
  }

  running = true;
  document.getElementById("status").innerText = "Running 🚀";
}


// ===============================
// 🔹 STOP
// ===============================
function stop() {
  running = false;
  document.getElementById("status").innerText = "Stopped ❌";
}


// ===============================
// 🔹 AUTOMATION (REAL CLICK)
// ===============================
setInterval(() => {
  if (!running) return;

  console.log("Running...");

  const elements = document.querySelectorAll('button, div, span');

  elements.forEach(el => {
    if (
      el.innerText &&
      el.innerText.toLowerCase().includes("buy") &&
      el.offsetParent !== null // visible only
    ) {
      el.click();
      console.log("Clicked:", el.innerText);
    }
  });

}, 3000);
