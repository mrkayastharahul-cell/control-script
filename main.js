(function () {
  "use strict";

  if (window.__AR_WALLET_BY_RS__) return;

  let users = [];

  fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/users.json")
    .then(r => r.json())
    .then(data => {
      users = data.users || [];
      init();
    })
    .catch(() => alert("Server error ❌"));

  function init() {

    // 🔹 HIDDEN UID (METHOD 1)
    let uid = localStorage.getItem("ar_uid");

    if (!uid) {
      uid = prompt("Enter Your UID")?.trim();
      if (uid) localStorage.setItem("ar_uid", uid);
    }

    if (!uid) {
      alert("Access Denied ❌");
      return;
    }

    // 🔹 FIND USER
    const user = users.find(u => u.uid === uid);

    if (!user) {
      alert("Access Denied ❌");
      return;
    }

    // 🔹 EXPIRY CHECK
    const today = new Date();
    const expiry = new Date(user.expiry);

    if (today > expiry) {
      alert("Subscription Expired ❌");
      return;
    }

    console.log("Access Granted ✅", user.name);

    // ===============================
    // 🔹 MAIN SYSTEM
    // ===============================

    const STATE = {
      running: false,
      clicks: 0,
      lastClickAt: 0,
      lastRefreshAt: 0,
      observerDirty: true,
      loopTimer: null,
      cache: [],
      lastScan: 0
    };

    const CONFIG = {
      scanInterval: 1000,
      clickGap: 2000,
      refreshGap: 5000,
      cacheTTL: 800
    };

    const SELECTOR = "button,a,[role='button'],input[type='button'],input[type='submit']";

    const now = () => Date.now();

    const visible = el => {
      if (!el || !(el instanceof Element)) return false;
      if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };

    const text = el =>
      el instanceof HTMLInputElement
        ? (el.value || "").trim()
        : (el.textContent || "").trim();

    const isBuy = el => /buy/i.test(text(el));

    function scan(force) {
      const t = now();
      if (!force && !STATE.observerDirty && t - STATE.lastScan < CONFIG.cacheTTL)
        return STATE.cache;

      const nodes = document.querySelectorAll(SELECTOR);
      const out = [];

      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        if (isBuy(el) && visible(el)) out.push(el);
      }

      STATE.cache = out;
      STATE.lastScan = t;
      STATE.observerDirty = false;
      return out;
    }

    function getBest() {
      const list = scan(false);
      if (!list.length) return null;

      return list
        .map(el => ({ el, r: el.getBoundingClientRect() }))
        .sort((a, b) => (b.r.top + b.r.height) - (a.r.top + a.r.height))[0].el;
    }

    function click(el) {
      const t = now();
      if (t - STATE.lastClickAt < CONFIG.clickGap) return;

      try {
        el.click();
        STATE.lastClickAt = t;
        STATE.clicks++;
        clicksEl.textContent = STATE.clicks;
        statusEl.textContent = "Running";
      } catch {}
    }

    function refresh() {
      const t = now();
      if (t - STATE.lastRefreshAt < CONFIG.refreshGap) return;

      STATE.lastRefreshAt = t;
      location.reload();
    }

    function loop() {
      if (!STATE.running) return;

      const btn = getBest();

      if (btn) {
        click(btn);
      } else {
        refresh();
      }
    }

    function start() {
      STATE.running = true;
      statusEl.textContent = "Running";

      if (STATE.loopTimer) clearInterval(STATE.loopTimer);
      STATE.loopTimer = setInterval(loop, CONFIG.scanInterval);

      loop();
    }

    function stop() {
      STATE.running = false;
      if (STATE.loopTimer) clearInterval(STATE.loopTimer);
      STATE.loopTimer = null;
      statusEl.textContent = "Stopped";
    }

    function ui() {
      const box = document.createElement("div");

      box.innerHTML = `
      <div style="position:fixed;bottom:20px;right:20px;background:#111;color:#fff;padding:12px;border-radius:10px;z-index:999999;font-family:sans-serif;width:220px">
        <b style="color:#00ff88">AR Wallet By RS</b><br><br>
        <button id="startBtn" style="width:48%;background:green;color:#fff;border:none;padding:7px;border-radius:5px">Start</button>
        <button id="stopBtn" style="width:48%;background:red;color:#fff;border:none;padding:7px;border-radius:5px;float:right">Stop</button>
        <div style="clear:both"></div>
        <p>Status: <span id="statusTxt">Idle</span></p>
        <p>Clicks: <span id="clickTxt">0</span></p>
        <p style="font-size:11px;color:#aaa">${user.name} | Exp: ${user.expiry}</p>
      </div>`;

      document.body.appendChild(box);

      startBtn.onclick = start;
      stopBtn.onclick = stop;

      return {
        status: document.getElementById("statusTxt"),
        clicks: document.getElementById("clickTxt")
      };
    }

    function observe() {
      const o = new MutationObserver(() => (STATE.observerDirty = true));
      o.observe(document.body, { childList: true, subtree: true });
    }

    const { status: statusEl, clicks: clicksEl } = ui();

    observe();

    window.__AR_WALLET_BY_RS__ = { start, stop };
  }

})();
