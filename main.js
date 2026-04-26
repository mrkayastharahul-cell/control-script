(function () {
  "use strict";

  if (window.__AR_WALLET__) return;
  window.__AR_WALLET__ = true;

  let target = "";
  let readyPlayed = false;
  let successPlayed = false;

  const STATE = { running: false };

  // 🔔 READY SOUND
  function playReady(){
    const a = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
    a.play().catch(()=>{});
    if (navigator.vibrate) navigator.vibrate([120,60,120]);
  }

  // 🔊 SUCCESS SOUND
  function playSuccess(){
    const a = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
    a.play().catch(()=>{});
    if (navigator.vibrate) navigator.vibrate([200,80,200]);
  }

  // 🎯 STRICT AMOUNT MATCH
  function isExactMatch(container){
    const text = container.innerText || "";
    const matches = text.match(/₹\s?[\d,]+/g);
    if (!matches) return false;

    const clean = matches.map(v => v.replace(/[₹,\s]/g, ""));
    return clean.includes(target);
  }

  // 🔍 FIND TARGET ROW + BUTTON
  function findTarget(){
    const buttons = [...document.querySelectorAll("button")];

    for (let btn of buttons) {

      if (!/buy/i.test(btn.innerText)) continue;

      let container = btn.closest("div");

      for (let i = 0; i < 3 && container; i++) {

        if (isExactMatch(container)) {
          return { btn, container };
        }

        container = container.parentElement;
      }
    }

    return null;
  }

  // 🧼 ISOLATE TARGET (HIDE OTHERS)
  function isolateTarget(container){
    const all = document.querySelectorAll("body *");

    all.forEach(el => {
      if (!container.contains(el) && el !== container) {
        el.style.display = "none";
      }
    });

    container.style.display = "block";
  }

  // 🔄 SUCCESS DETECTION
  function detectSuccess(){
    const hasBuy = [...document.querySelectorAll("button")]
      .some(b => /buy/i.test(b.innerText));

    if (!hasBuy && !successPlayed) {
      playSuccess();
      successPlayed = true;
      STATE.running = false;
    }
  }

  // 🔄 MAIN LOOP
  function loop(){
    if (!STATE.running) return;

    const found = findTarget();

    if (!found) return;

    const { btn, container } = found;

    if (!readyPlayed) {
      playReady();
      readyPlayed = true;
    }

    isolateTarget(container);

    btn.scrollIntoView({ behavior: "smooth", block: "center" });
    btn.focus();

    document.onkeydown = (e) => {
      if (e.key === "Enter") btn.click();
    };

    // watch for success
    const observer = new MutationObserver(() => detectSuccess());
    observer.observe(document.body, { childList: true, subtree: true });

    STATE.running = false;
  }

  function start(){
    if (!target) return alert("Enter amount ❌");

    readyPlayed = false;
    successPlayed = false;

    STATE.running = true;

    loop();
  }

  function stop(){
    STATE.running = false;
  }

  function setAmount(){
    target = inputEl.value.replace(/\D/g,"");
    targetEl.innerText = "₹" + (target || "0");
  }

  // 🎨 UI
  const box=document.createElement("div");

  box.innerHTML=`
<style>
#arBox{position:fixed;bottom:20px;right:20px;width:260px;font-family:sans-serif;z-index:999999;}
#arCard{background:#fff;border-radius:14px;padding:14px;box-shadow:0 10px 25px rgba(0,0,0,0.2);}
#arHeader{display:flex;justify-content:space-between;align-items:center;}
#arTitle{color:#ffcc00;font-weight:bold;font-size:16px;}
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

  document.getElementById("startBtn").onclick=start;
  document.getElementById("stopBtn").onclick=stop;
  document.getElementById("setBtn").onclick=setAmount;

})();
