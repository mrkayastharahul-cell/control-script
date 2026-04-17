(function () {
  "use strict";

  if (window.__AR_WALLET__) return;
  window.__AR_WALLET__ = true;

  // ===============================
  // 🔐 ACCESS CONTROL
  // ===============================
  (async function(){

    const cfg = await fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/config.json?v="+Math.random())
      .then(r=>r.json())
      .catch(()=>null);

    if (!cfg || !cfg.enabled) {
      alert("System Disabled ❌");
      throw new Error("Blocked");
    }

    let uid = localStorage.getItem("ar_uid");

    if (!uid) {
      uid = prompt("Enter UID");
      localStorage.setItem("ar_uid", uid);
    }

    const user = cfg.users.find(u => u.uid === uid);

    if (!user) {
      alert("Access Denied ❌");
      localStorage.removeItem("ar_uid");
      throw new Error("Invalid UID");
    }

    if (new Date() > new Date(user.expiry)) {
      alert("Expired ❌");
      throw new Error("Expired");
    }

    function getDevice(){
      return navigator.userAgent + screen.width + screen.height;
    }

    const current = getDevice();
    const saved = localStorage.getItem("ar_device");

    if (!saved) localStorage.setItem("ar_device", current);

    if (saved && saved !== current) {
      alert("Device Locked ❌");
      throw new Error("Device mismatch");
    }

  })();

  // ===============================
  // 🔥 STATE
  // ===============================
  let target = "";

  const STATE = {
    running: false,
    lastClick: 0
  };

  const CONFIG = {
    scanDelay: 400,
    clickGap: 1500
  };

  // ===============================
  // 🔥 SUCCESS DETECTION
  // ===============================
  function detectSuccess(){
    const hasBuy = [...document.querySelectorAll("button")]
      .some(b => /buy/i.test(b.innerText));

    if (!hasBuy) {
      STATE.running = false;
      statusDot.style.background = "red";
      statusDot.classList.remove("pulse");
      return true;
    }
    return false;
  }

  // ===============================
  // 🔥 FIND & CLICK
  // ===============================
  function findAndClick(){
    if (!target || !STATE.running) return;

    const buttons = [...document.querySelectorAll("button")];

    for (let btn of buttons) {

      if (!/buy/i.test(btn.innerText)) continue;

      let container = btn.closest("div");

      for (let i = 0; i < 6 && container; i++) {

        let text = container.innerText || "";
        let matches = text.match(/₹\s?[\d,]+/g);

        if (matches) {
          let amounts = matches.map(v =>
            v.replace(/[₹,\s]/g, "")
          );

          if (amounts.includes(target)) {

            let now = Date.now();

            if (now - STATE.lastClick > CONFIG.clickGap) {
              btn.click();
              STATE.lastClick = now;
              return true;
            }
          }
        }

        container = container.parentElement;
      }
    }
  }

  function loop(){
    if(!STATE.running) return;

    if (detectSuccess()) return;

    findAndClick();
  }

  function start(){
    if (!target) {
      alert("Enter amount ❌");
      return;
    }

    STATE.running = true;

    statusDot.style.background = "green";
    statusDot.classList.add("pulse");

    findAndClick();
  }

  function stop(){
    STATE.running = false;

    statusDot.style.background = "red";
    statusDot.classList.remove("pulse");
  }

  function setAmount(){
    target = inputEl.value.replace(/\D/g,"");
    targetEl.innerText = "₹" + (target || "0");
  }

  // ===============================
  // 🔥 PREMIUM UI (FINAL)
  // ===============================
  const box=document.createElement("div");

  box.innerHTML=`
<style>
#arBox{position:fixed;bottom:20px;right:20px;width:260px;font-family:sans-serif;z-index:999999;}
#arCard{background:#ffffff;border-radius:14px;padding:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);}
#arHeader{display:flex;justify-content:space-between;align-items:center;}
#arTitle{color:#ffcc00;font-weight:bold;font-size:16px;}
#statusDot{width:10px;height:10px;border-radius:50%;background:red;}
.pulse{animation:pulse 1s infinite;}
@keyframes pulse{0%{transform:scale(1);}50%{transform:scale(1.5);}100%{transform:scale(1);}}
#amtInput{width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;margin-top:10px;font-weight:bold;}
#setBtn{width:100%;margin-top:8px;padding:7px;border:none;border-radius:6px;background:#007bff;color:#fff;}
.arRow{margin-top:10px;display:flex;justify-content:space-between;}
.btn{width:48%;padding:7px;border:none;border-radius:6px;color:#fff;}
#startBtn{background:green;} #stopBtn{background:red;}
</style>

<div id="arBox">
  <div id="arCard">

    <div id="arHeader">
      <span id="arTitle">AR Wallet</span>
      <div id="statusDot"></div>
    </div>

    <input id="amtInput" placeholder="Enter Amount"/>
    <button id="setBtn">Set Amount</button>

    <p>Target: <span id="targetTxt">₹0</span></p>

    <div class="arRow">
      <button id="startBtn" class="btn">Start</button>
      <button id="stopBtn" class="btn">Stop</button>
    </div>

  </div>
</div>
`;

  document.body.appendChild(box);

  const inputEl=document.getElementById("amtInput");
  const targetEl=document.getElementById("targetTxt");
  const statusDot=document.getElementById("statusDot");

  document.getElementById("startBtn").onclick=start;
  document.getElementById("stopBtn").onclick=stop;
  document.getElementById("setBtn").onclick=setAmount;

  setInterval(loop, CONFIG.scanDelay);

})();
