(function () {
  "use strict";

  if (window.__AR_WALLET__) return;
  window.__AR_WALLET__ = true;

  let target = "";
  let interval = null;

  const STATE = { running: false, success: false };

  // 🔔 READY SOUND
  function playReady(){
    new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg").play().catch(()=>{});
  }

  // 🔊 SUCCESS SOUND
  function playSuccess(){
    new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg").play().catch(()=>{});
  }

  // 🎯 STRICT MATCH
  function isExactMatch(text){
    const matches = text.match(/₹\s?[\d,]+/g);
    if (!matches) return false;

    const clean = matches.map(v => v.replace(/[₹,\s]/g, ""));
    return clean.includes(target);
  }

  // 🔍 FIND + CLICK
  function scanAndBuy(){
    if (!STATE.running) return;

    const buttons = document.querySelectorAll("button");

    for (let btn of buttons) {

      if (!/buy/i.test(btn.innerText)) continue;

      let container = btn.closest("div");

      for (let i = 0; i < 3 && container; i++) {

        if (isExactMatch(container.innerText)) {

          playReady();

          btn.click(); // ⚡ INSTANT CLICK

          STATE.success = true;
          STATE.running = false;

          clearInterval(interval);

          setTimeout(playSuccess, 500);

          return;
        }

        container = container.parentElement;
      }
    }
  }

  function start(){
    if (!target) return alert("Enter amount ❌");

    STATE.running = true;
    STATE.success = false;

    clearInterval(interval);

    interval = setInterval(scanAndBuy, 300); // ⚡ FAST LOOP
  }

  function stop(){
    STATE.running = false;
    clearInterval(interval);
  }

  function setAmount(){
    target = inputEl.value.replace(/\D/g,"");
    targetEl.innerText = "₹" + (target || "0");
  }

  // 🎨 UI
  const box=document.createElement("div");

  box.innerHTML=`
<div style="position:fixed;bottom:20px;right:20px;width:250px;background:#fff;padding:12px;border-radius:10px;z-index:999999;box-shadow:0 10px 25px rgba(0,0,0,0.2);font-family:sans-serif;">
  <b style="color:#ffcc00;">AR Wallet ⚡</b>

  <input id="amtInput" placeholder="Enter Amount" style="width:100%;margin-top:8px;padding:6px"/>

  <button id="setBtn" style="width:100%;margin-top:6px;">Set</button>

  <p>Target: <span id="targetTxt">₹0</span></p>

  <div style="display:flex;gap:5px;">
    <button id="startBtn" style="flex:1;background:green;color:#fff;">Start</button>
    <button id="stopBtn" style="flex:1;background:red;color:#fff;">Stop</button>
  </div>
</div>
`;

  document.body.appendChild(box);

  const inputEl=document.getElementById("amtInput");
  const targetEl=document.getElementById("targetTxt");

  document.getElementById("startBtn").onclick=start;
  document.getElementById("stopBtn").onclick=stop;
  document.getElementById("setBtn").onclick=setAmount;

})();
