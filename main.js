(function () {
  "use strict";

  if (window.__AR_WALLET_BY_RS__) return;
  window.__AR_WALLET_BY_RS__ = true;

  let target = "";

  const STATE = {
    running: false,
    clicks: 0,
    lastClick: 0
  };

  const CONFIG = {
    scanDelay: 300,
    clickGap: 1500
  };

  function visible(el){
    if(!el) return false;
    const r = el.getBoundingClientRect();
    return r.width>0 && r.height>0;
  }

  // 🔥 FORCE OTP-UPI TAB
  function forceTab(){
    const tab=[...document.querySelectorAll("*")]
      .find(e=>/otp[- ]?upi/i.test(e.innerText));
    if(tab) tab.click();
  }

  // 🔥 FINAL CLICK LOGIC (FIXED)
  function findAndClick(){
    if (!target) return;

    const elements = [...document.querySelectorAll("*")];

    for (let el of elements) {

      let txt = el.innerText || "";

      // 🔥 STRICT ₹ MATCH
      if (txt.includes("₹" + target)) {

        let parent = el.closest("div");
        if (!parent) continue;

        let btn = [...parent.querySelectorAll("button")]
          .find(b => /buy/i.test(b.innerText));

        if (btn && visible(btn)) {

          let now = Date.now();

          if (now - STATE.lastClick > CONFIG.clickGap) {
            btn.click();
            STATE.lastClick = now;
            STATE.clicks++;

            clickEl.innerText = STATE.clicks;
            statusEl.innerText = "Running";

            console.log("Clicked ₹" + target);
          }

          return true;
        }
      }
    }

    return false;
  }

  function loop(){
    if(!STATE.running) return;

    forceTab();
    findAndClick();
  }

  function start(){
    if (!target) {
      alert("Enter amount first ❌");
      return;
    }

    STATE.running = true;
    statusEl.innerText = "Running";

    console.log("Started with target:", target);

    findAndClick(); // 🔥 instant first run
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

  function reset(){
    STATE.running = false;
    target = "";
    STATE.clicks = 0;

    inputEl.value = "";
    targetEl.innerText = "₹0";
    clickEl.innerText = "0";
    statusEl.innerText = "Idle";
  }

  // 🔥 LIVE DETECTION (NO REFRESH)
  const observer = new MutationObserver(()=>{
    if(STATE.running) findAndClick();
  });

  observer.observe(document.body,{childList:true,subtree:true});

  setInterval(loop, CONFIG.scanDelay);

  // ===============================
  // 🔥 UI PANEL
  // ===============================
  const box=document.createElement("div");

  box.innerHTML=`
  <div style="
    position:fixed;
    bottom:20px;
    right:20px;
    background:#111;
    color:#fff;
    padding:14px;
    border-radius:12px;
    z-index:999999;
    width:250px;
    font-family:sans-serif;
    box-shadow:0 0 15px rgba(0,0,0,0.5);
  ">
    <div style="font-weight:bold;color:#00ff88;font-size:16px">
      AR Wallet By RS
    </div>

    <div style="margin-top:10px">
      <input id="amtInput" placeholder="Enter Amount"
        style="width:100%;padding:7px;border-radius:6px;border:none">
    </div>

    <button id="setBtn"
      style="width:100%;margin-top:8px;background:#007bff;color:#fff;border:none;padding:7px;border-radius:6px">
      Set Amount
    </button>

    <div style="margin-top:8px;font-size:13px">
      Target: <span id="targetTxt">₹0</span>
    </div>

    <div style="margin-top:10px">
      <button id="startBtn"
        style="width:32%;background:green;color:#fff;border:none;padding:7px;border-radius:6px">
        Start
      </button>

      <button id="stopBtn"
        style="width:32%;background:red;color:#fff;border:none;padding:7px;border-radius:6px">
        Stop
      </button>

      <button id="resetBtn"
        style="width:32%;background:#444;color:#fff;border:none;padding:7px;border-radius:6px">
        Reset
      </button>
    </div>

    <div style="margin-top:10px;font-size:13px">
      Status: <span id="statusTxt">Idle</span><br>
      Clicks: <span id="clickTxt">0</span>
    </div>
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
  document.getElementById("resetBtn").onclick=reset;

})();
