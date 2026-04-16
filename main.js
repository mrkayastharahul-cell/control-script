(function () {
  "use strict";

  if (window.__AR_WALLET_BY_RS__) return;
  window.__AR_WALLET_BY_RS__ = true;

  const STATE = {
    running: false,
    clicks: 0,
    lastClick: 0,
    lastRefresh: 0
  };

  const CONFIG = {
    scanInterval: 1000,
    clickGap: 2000,
    refreshGap: 3000
  };

  function visible(el) {
    if (!el || !(el instanceof Element)) return false;
    if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function findBuy() {
    const buttons = [...document.querySelectorAll("button,a,[role='button'],input")];

    const valid = buttons.filter(b =>
      visible(b) &&
      /buy/i.test(b.innerText || b.value || "")
    );

    if (!valid.length) return null;

    // Pick lowest visible Buy (most relevant)
    return valid.sort((a, b) =>
      (b.getBoundingClientRect().top) - (a.getBoundingClientRect().top)
    )[0];
  }

  function click(btn) {
    const now = Date.now();
    if (now - STATE.lastClick < CONFIG.clickGap) return;

    btn.click();
    STATE.lastClick = now;
    STATE.clicks++;
    clickEl.textContent = STATE.clicks;
    statusEl.textContent = "Running";
  }

  function refresh() {
    const now = Date.now();
    if (now - STATE.lastRefresh < CONFIG.refreshGap) return;

    STATE.lastRefresh = now;
    location.reload();
  }

  function loop() {
    if (!STATE.running) return;

    const btn = findBuy();

    if (btn) {
      click(btn);
    } else {
      refresh();
    }
  }

  function start() {
    STATE.running = true;
    statusEl.textContent = "Running";

    setInterval(loop, CONFIG.scanInterval);
    loop();
  }

  function stop() {
    STATE.running = false;
    statusEl.textContent = "Stopped";
  }

  // ===============================
  // UI
  // ===============================

  const box = document.createElement("div");

  box.innerHTML = `
  <div style="position:fixed;bottom:20px;right:20px;background:#111;color:#fff;padding:12px;border-radius:10px;z-index:999999;font-family:sans-serif;width:220px">
    <b style="color:#00ff88">AR Wallet By RS</b><br><br>
    <button id="startBtn" style="width:48%;background:green;color:#fff;border:none;padding:7px;border-radius:5px">Start</button>
    <button id="stopBtn" style="width:48%;background:red;color:#fff;border:none;padding:7px;border-radius:5px;float:right">Stop</button>
    <div style="clear:both"></div>
    <p>Status: <span id="statusTxt">Idle</span></p>
    <p>Clicks: <span id="clickTxt">0</span></p>
  </div>`;

  document.body.appendChild(box);

  const statusEl = document.getElementById("statusTxt");
  const clickEl = document.getElementById("clickTxt");

  document.getElementById("startBtn").onclick = start;
  document.getElementById("stopBtn").onclick = stop;

})();
