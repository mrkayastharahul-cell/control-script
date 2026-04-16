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
  border-radius:12px;
  z-index:999999;
  box-shadow:0 0 15px rgba(0,0,0,0.3);
  width:240px;
  font-family:sans-serif;
">
  <b>Wallet Tool</b><br><br>
  
  <input id="uid" placeholder="Enter UID" style="width:100%; padding:5px;"><br><br>
  <input id="amount" placeholder="Enter Amount ₹" style="width:100%; padding:5px;"><br><br>
  
  <button onclick="activate()" style="
    width:100%;
    background:#007bff;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
    margin-bottom:10px;
  ">Activate</button>
  
  <button onclick="start()" style="
    width:48%;
    background:#28a745;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
  ">Start</button>

  <button onclick="stop()" style="
    width:48%;
    background:#dc3545;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
    float:right;
  ">Stop</button>
  
  <div style="clear:both;"></div>
  
  <p id="status" style="margin-top:10px; font-weight:bold;">Loading...</p>
  <p id="count" style="font-size:12px;">Clicks: 0</p>
</div>
`;

document.body.appendChild(panel);


// ===============================
// 🔹 VARIABLES
// ===============================
let activated = false;
let running = false;
let allowedUIDs = [];
let clickCount = 0;
let alreadyClicked = false;


// ===============================
// 🔹 STATUS FUNCTION
// ===============================
function setStatus(text, color) {
  document.getElementById("status").innerHTML =
    `<span style="color:${color}; font-weight:bold;">${text}</span>`;
}


// ===============================
// 🔹 LOAD USERS
// ===============================
fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/users.json")
  .then(res => res.json())
  .then(data => {
    allowedUIDs = data.users || [];
    checkSavedUser();
  })
  .catch(() => setStatus("Server error ❌", "red"));


// ===============================
// 🔹 AUTO LOGIN
// ===============================
function checkSavedUser() {
  const savedUID = localStorage.getItem("uid");

  if (savedUID && allowedUIDs.includes(savedUID)) {
    activated = true;
    document.getElementById("uid").value = savedUID;
    setStatus("Activated ✅", "blue");
  } else {
    setStatus("Not Activated", "gray");
  }
}


// ===============================
// 🔹 ACTIVATE
// ===============================
function activate() {
  const input = document.getElementById("uid").value.trim();

  if (!allowedUIDs.includes(input)) {
    setStatus("Invalid UID ❌", "red");
    return;
  }

  localStorage.setItem("uid", input);
  activated = true;

  setStatus("Activated ✅", "blue");
}


// ===============================
// 🔹 START
// ===============================
function start() {
  const savedUID = localStorage.getItem("uid");

  if (!activated || !allowedUIDs.includes(savedUID)) {
    alert("Access revoked ❌");
    return;
  }

  running = true;
  setStatus("Running 🚀", "green");
}


// ===============================
// 🔹 STOP
// ===============================
function stop() {
  running = false;
  setStatus("Stopped ❌", "red");
}


// ===============================
// 🔹 RESET CLICK LOCK
// ===============================
setInterval(() => {
  alreadyClicked = false;
}, 4000);


// ===============================
// 🔹 ACCURATE AUTOMATION (CARD-BASED)
// ===============================
setInterval(() => {
  if (!running) return;

  const targetAmount = document.getElementById("amount").value.trim();
  if (!targetAmount) return;

  console.log("Searching:", targetAmount);

  // 🔥 STEP 1: Find all possible offer cards
  const cards = document.querySelectorAll('div');

  cards.forEach(card => {

    const text = card.innerText;

    // 🔥 STEP 2: Match amount inside card
    if (text && text.replace(/\s/g, '').includes(targetAmount)) {

      // 🔥 STEP 3: Find BUY button inside SAME card
      const buyBtn = card.querySelector('button');

      if (
        buyBtn &&
        buyBtn.innerText.toLowerCase().includes("buy") &&
        !alreadyClicked
      ) {
        buyBtn.click();

        alreadyClicked = true;
        clickCount++;

        document.getElementById("count").innerText = "Clicks: " + clickCount;

        console.log("Clicked:", targetAmount);
      }
    }

  });

}, 1500);
