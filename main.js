(function () {
  "use strict";

  if (window.__AR_WALLET__) return;
  window.__AR_WALLET__ = true;

  // ===============================
  // 🔐 ACCESS CONTROL
  // ===============================
  (async function(){

    const cfg = await fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/config.json?v="+Date.now())
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

    console.log("Access Granted ✅");

  })();

  // ===============================
  // 🔥 MAIN LOGIC
  // ===============================

  let target = "";

  const STATE = {
    running: false,
    clicks: 0,
    lastClick: 0
  };

  const CONFIG = {
    scanDelay: 400,
    clickGap: 1500
  };

  function visible(el){
    if(!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function forceTab(){
    const tab=[...document.querySelectorAll("*")]
      .find(e=>/otp[- ]?upi/i.test(e.innerText));
    if(tab) tab.click();
  }

  function detectSuccess(){
    const t = document.body.innerText.toLowerCase();

    if (
      t.includes("otp") ||
      t.includes("upi") ||
      t.includes("pay now") ||
      t.includes("processing")
    ) {
      STATE.running = false;
      statusEl.innerText = "Success - Stopped";
      return true;
    }

    return false;
  }

  function findAndClick(){
    if (!target || !STATE.running) return;

    const buttons = [...document.querySelectorAll("button")];

    for (let btn of buttons) {

      if (!/buy/i.test(btn.innerText)) continue;

      let row = btn.closest("div");
      if (!row) continue;

      let text = row.innerText || "";

      let matches = text.match(/₹\s?[\d,]+/g);
      if (!matches) continue;

      let amounts = matches.map(v => v.replace(/[₹,\s]/g, ""));

      if (amounts.includes(target)) {

        let now = Date.now();

        if (now - STATE.lastClick > CONFIG.clickGap) {
          btn.click();
          STATE.lastClick = now;
          STATE.clicks++;

          clickEl.innerText = STATE.clicks;
          statusEl.innerText = "Clicked";

          return true;
        }
      }
    }

    return false;
  }

  function loop(){
    if(!STATE.running) return;

    if (detectSuccess()) return;

    forceTab();
    findAndClick();
  }

  function start(){
    if (!target) {
      alert("Enter amount ❌");
      return;
    }

    STATE.running = true;
    statusEl.innerText = "Running";
    findAndClick();
  }

  function stop(){
    STATE.running = false;
    statusEl.innerText = "Stopped";
  }

  function setAmount(){
    const val = inputEl.value.replace(/\D/g,"");
    target = val;
    targetEl.innerText = "₹" + (target || "0");
  }

  // ===============================
  // 🔥 UI
  // ===============================

  const box=document.createElement("div");

  box.innerHTML=`
  <div style="position:fixed;bottom:20px;right:20px;background:#111;color:#fff;padding:14px;border-radius:10px;z-index:999999;width:240px">
    <b style="color:#00ff88">AR Wallet</b><br><br>

    <input id="amtInput" placeholder="Enter Amount" style="width:100%;padding:6px;border:none;border-radius:5px">

    <button id="setBtn" style="width:100%;margin-top:6px;background:#007bff;color:#fff;border:none;padding:6px;border-radius:5px">
      Set Amount
    </button>

    <p>Target: <span id="targetTxt">₹0</span></p>

    <button id="startBtn" style="width:48%;background:green;color:#fff;border:none;padding:6px;border-radius:5px">Start</button>
    <button id="stopBtn" style="width:48%;background:red;color:#fff;border:none;padding:6px;border-radius:5px;float:right">Stop</button>

    <div style="clear:both"></div>
    <p>Status: <span id="statusTxt">Idle</span></p>
    <p>Clicks: <span id="clickTxt">0</span></p>
  </div>
  `;

  document.body.appendChild(box);

  const statusEl=document.getElementById("statusTxt");
  const clickEl=document.getElementById("clickTxt");
  const inputEl=document.getElementById("amtInput");
  const targetEl=document.getElementById("targetTxt");

  document.getElementById("startBtn").onclick=start;
  document.getElementById("stopBtn").onclick=stop;
  document.getElementById("setBtn").onclick=setAmount;

  setInterval(loop, CONFIG.scanDelay);

})();
