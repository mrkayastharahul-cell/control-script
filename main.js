// ===============================
// 🔹 SIMPLE PANEL
// ===============================
const panel = document.createElement('div');

panel.innerHTML = `
<div style="
  position:fixed;
  bottom:20px;
  right:20px;
  background:white;
  padding:12px;
  border-radius:10px;
  z-index:999999;
  box-shadow:0 0 10px rgba(0,0,0,0.3);
  width:200px;
  font-family:sans-serif;
">
  <b>Quick Buy</b><br><br>

  <input id="amount" placeholder="Enter Amount ₹" style="width:100%; padding:5px;"><br><br>

  <button onclick="start()" style="
    width:48%;
    background:green;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
  ">Start</button>

  <button onclick="stop()" style="
    width:48%;
    background:red;
    color:white;
    border:none;
    padding:8px;
    border-radius:6px;
    float:right;
  ">Stop</button>

  <div style="clear:both;"></div>

  <p id="status">Idle</p>
</div>
`;

document.body.appendChild(panel);


// ===============================
// 🔹 VARIABLES
// ===============================
let running = false;
let clickLock = false;
let found = false;


// ===============================
// 🔹 STATUS
// ===============================
function setStatus(text, color) {
  document.getElementById("status").innerHTML =
    `<span style="color:${color}; font-weight:bold;">${text}</span>`;
}


// ===============================
// 🔹 START / STOP
// ===============================
function start() {
  running = true;
  setStatus("Running 🚀", "green");
}

function stop() {
  running = false;
  setStatus("Stopped ❌", "red");
}


// ===============================
// 🔹 RESET CLICK LOCK
// ===============================
setInterval(() => {
  clickLock = false;
}, 3000);


// ===============================
// 🔹 MAIN LOGIC (FIND + CLICK)
// ===============================
setInterval(() => {
  if (!running) return;

  const amount = document.getElementById("amount").value.trim();
  if (!amount) return;

  found = false;

  const elements = Array.from(document.querySelectorAll('button, div, span'))
    .filter(el => el.offsetParent !== null); // visible only

  for (let el of elements) {

    const text = el.innerText;
    if (!text) continue;

    // 🔥 FLEXIBLE AMOUNT MATCH
    if (text.replace(/[^\d]/g, '').includes(amount)) {

      found = true;

      let parent = el;

      for (let i = 0; i < 5; i++) {
        if (!parent) break;

        const btn = parent.querySelector('button');

        if (btn && btn.innerText.toLowerCase().includes("buy")) {

          if (!clickLock) {
            btn.click();
            clickLock = true;

            console.log("Clicked BUY:", amount);
          }

          break;
        }

        parent = parent.parentElement;
      }
    }
  }

}, 1200);


// ===============================
// 🔹 AUTO REFRESH IF NOT FOUND
// ===============================
setInterval(() => {
  if (!running) return;

  if (!found) {
    console.log("Not found → Refreshing...");
    location.reload();
  }

}, 3000);
