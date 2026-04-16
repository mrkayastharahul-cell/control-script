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
  width:230px;
  font-family:sans-serif;
">
  <b>Wallet Tool</b><br><br>
  
  <input id="uid" placeholder="Enter UID" style="width:100%"><br><br>
  
  <button onclick="activate()">Activate</button><br><br>
  
  <button onclick="start()">Start</button>
  <button onclick="stop()">Stop</button><br><br>

  <button onclick="findTargets()">Find Buy</button>
  <button onclick="clickFirst()">Click</button>

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
let targets = [];


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
    document.getElementById("status").innerText = "Activated ✅";
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
// 🔹 START / STOP
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

function stop() {
  running = false;
  document.getElementById("status").innerText = "Stopped ❌";
}


// ===============================
// 🔹 FIND BUTTONS
// ===============================
function findTargets() {
  targets = [];

  document.querySelectorAll('button, div, span').forEach(el => {
    if (
      el.innerText &&
      /(buy|continue)/i.test(el.innerText) &&
      el.offsetParent !== null
    ) {
      el.style.outline = "2px solid red";
      targets.push(el);
    }
  });

  console.log("Found:", targets);
  document.getElementById("status").innerText = "Found " + targets.length + " items";
}


// ===============================
// 🔹 CLICK (MANUAL CONFIRM)
// ===============================
function clickFirst() {
  if (!targets.length) {
    alert("No targets found ❌");
    return;
  }

  if (confirm("Click first highlighted button?")) {
    targets[0].click();
    console.log("Clicked:", targets[0].innerText);
  }
}


// ===============================
// 🔹 LOOP (SAFE GUIDE MODE)
// ===============================
setInterval(() => {
  if (!running) return;

  console.log("Scanning...");
  findTargets();

}, 4000);
