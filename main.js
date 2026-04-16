// ===============================
// 🔹 PANEL UI (Styled + Controls)
// ===============================
const panel = document.createElement('div');

panel.innerHTML = `
<div style="
  position:fixed;
  bottom:20px;
  right:20px;
  background:white;
  padding:15px;
  border-radius:12px;
  z-index:999999;
  box-shadow:0 0 15px rgba(0,0,0,0.3);
  width:240px;
  font-family:sans-serif;
">
  <b>Wallet Tool</b><br><br>
  
  <!-- UID INPUT -->
  <input id="uid" placeholder="Enter UID" style="width:100%; padding:5px;"><br><br>

  <!-- AMOUNT INPUT -->
  <input id="amount" placeholder="Enter Amount ₹" style="width:100%; padding:5px;"><br><br>
  
  <!-- ACTIVATE BUTTON -->
  <button onclick="activate()" style="
    width:100%;
    background:#007bff;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
    margin-bottom:10px;
    cursor:pointer;
  ">Activate</button>
  
  <!-- START / STOP BUTTONS -->
  <button onclick="start()" style="
    width:48%;
    background:#28a745;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
    cursor:pointer;
  ">Start</button>

  <button onclick="stop()" style="
    width:48%;
    background:#dc3545;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
    float:right;
    cursor:pointer;
  ">Stop</button>
  
  <div style="clear:both;"></div>
  
  <!-- STATUS + DOT -->
  <p id="status" style="margin-top:10px; font-weight:bold;">
    <span id="dot" style="
      height:10px;
      width:10px;
      background:gray;
      border-radius:50%;
      display:inline-block;
      margin-right:5px;
    "></span>
    Loading...
  </p>

  <!-- CLICK COUNTER -->
  <p id="count" style="font-size:12px;">Clicks: 0</p>
</div>
`;

document.body.appendChild(panel);


// ===============================
// 🔹 VARIABLES
// ===============================
let activated = false;     // User activation status
let running = false;       // Automation running state
let allowedUIDs = [];      // Loaded from server
let clickCount = 0;        // Total clicks


// ===============================
// 🔹 STATUS FUNCTION (color + dot)
// ===============================
function setStatus(text, color) {
  const statusEl = document.getElementById("status");

  statusEl.innerHTML = `
    <span style="
      height:10px;
      width:10px;
      background:${color};
      border-radius:50%;
      display:inline-block;
      margin-right:5px;
    "></span>
    ${text}
  `;
}


// ===============================
// 🔹 LOAD USERS FROM SERVER
// ===============================
fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/users.json")
  .then(res => res.json())
  .then(data => {
    allowedUIDs = data.users || [];
    checkSavedUser();
  })
  .catch(() => {
    setStatus("Server error ❌", "red");
  });


// ===============================
// 🔹 CHECK SAVED USER (AUTO LOGIN)
// ===============================
function checkSavedUser() {
  const savedUID = localStorage.getItem("uid");

  if (savedUID && allowedUIDs.includes(savedUID)) {
    activated = true;
    document.getElementById("uid").value = savedUID;
    setStatus("Activated ✅ (Saved)", "#007bff");
  } else {
    setStatus("Not Activated", "gray");
  }
}


// ===============================
// 🔹 ACTIVATE USER
// ===============================
function activate() {
  const input = document.getElementById("uid").value.trim();

  if (!allowedUIDs.includes(input)) {
    setStatus("Invalid UID ❌", "red");
    return;
  }

  localStorage.setItem("uid", input);
  activated = true;

  setStatus("Activated ✅ (" + input + ")", "#007bff");
}


// ===============================
// 🔹 START SYSTEM
// ===============================
function start() {
  const savedUID = localStorage.getItem("uid");

  // Re-check access from server
  if (!activated || !allowedUIDs.includes(savedUID)) {
    activated = false;
    localStorage.removeItem("uid");
    alert("Access revoked ❌");
    return;
  }

  running = true;
  setStatus("Running 🚀", "green");
}


// ===============================
// 🔹 STOP SYSTEM
// ===============================
function stop() {
  running = false;
  setStatus("Stopped ❌", "red");
}


// ===============================
// 🔹 SMART AUTOMATION LOOP
// ===============================
let alreadyClicked = false;

setInterval(() => {
  if (!running) return;

  const targetAmount = document.getElementById("amount").value.trim();
  if (!targetAmount) return;

  console.log("Searching for:", targetAmount);

  const elements = document.querySelectorAll('*');

  elements.forEach(el => {
    if (
      el.innerText &&
      el.innerText.includes("₹" + targetAmount)
    ) {
      const parent = el.closest('div');
      if (!parent) return;

      const buyBtn = Array.from(parent.querySelectorAll('*')).find(b =>
        b.innerText && b.innerText.toLowerCase().includes("buy")
      );

      if (buyBtn && !alreadyClicked) {
        buyBtn.click();
        clickCount++;
        alreadyClicked = true;

        document.getElementById("count").innerText = "Clicks: " + clickCount;

        console.log("Clicked BUY for:", targetAmount);
      }
    }
  });

}, 2000);
