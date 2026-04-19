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

  // 🔥 CLICK TAB (OTP / UPI / BANK)
  function clickTab(){
    const el = [...document.querySelectorAll("*")]
      .find(e => /(otp|upi|bank)/i.test(e.innerText));
    if (el) el.click();
  }

  // 🔥 FILTER ONLY TARGET
  function filterOnlyTarget(){
    if (!target) return;

    const buttons = [...document.querySelectorAll("button")];

    for (let btn of buttons) {

      if (!/buy/i.test(btn.innerText)) continue;

      let container = btn.closest("div");
      let matched = false;

      for (let i = 0; i < 6 && container; i++) {

        let text = container.innerText || "";
        let matches = text.match(/₹\s?[\d,]+/g);

        if (matches) {
          let amounts = matches.map(v => v.replace(/[₹,\s]/g, ""));
          if (amounts.includes(target)) {
            matched = true;
            break;
          }
        }

        container = container.parentElement;
      }

      let row = btn.closest("div");
      if (row) row.style.display = matched ? "" : "none";
    }
  }

  // 🎯 FOCUS TARGET
  function focusTarget(){
    if (!target) return;

    const buttons = [...document.querySelectorAll("button")];

    for (let btn of buttons) {

      if (!/buy/i.test(btn.innerText)) continue;

      let container = btn.closest("div");

      for (let i = 0; i < 6 && container; i++) {

        let text = container.innerText || "";
        let matches = text.match(/₹\s?[\d,]+/g);

        if (matches) {
          let amounts = matches.map(v => v.replace(/[₹,\s]/g, ""));

          if (amounts.includes(target)) {

            if (!readyPlayed) {
              playReady();
              readyPlayed = true;
            }

            btn.scrollIntoView({ behavior: "smooth", block: "center" });

            container.style.outline = "3px solid #00ff88";
            container.style.borderRadius = "10px";

            btn.focus();

            document.onkeydown = (e) => {
              if (e.key === "Enter") btn.click();
            };

            return;
          }
        }

        container = container.parentElement;
      }
    }
  }

  // 🔄 SUCCESS DETECTION
  function detectSuccess(){
    const hasBuy = [...document.querySelectorAll("button")]
      .some(b => /buy/i.test(b.innerText));

    const t = document.body.innerText.toLowerCase();

    if (!hasBuy || /(otp|upi|pay|processing)/i.test(t)) {

      if (!successPlayed) {
        playSuccess();
        successPlayed = true;
      }

      STATE.running = false;

      statusDot.style.background = "red";
      statusDot.classList.remove("pulse");

      return true;
    }

    return false;
  }

  // 🔄 OBSERVER (FAST MODE)
  function observe(){
    const observer = new MutationObserver(() => {
      if (STATE.running) {
        filterOnlyTarget();
        focusTarget();
        detectSuccess();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ▶ START
  function start(){
    if (!target) return alert("Enter amount ❌");

    readyPlayed = false;
    successPlayed = false;

    STATE.running = true;

    statusDot.style.background = "green";
    statusDot.classList.add("pulse");

    clickTab();
    filterOnlyTarget();
    focusTarget();
  }

  // ⏹ STOP
  function stop(){
    STATE.running = false;
    statusDot.style.background = "red";
    statusDot.classList.remove("pulse");
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

  observe();

})();
