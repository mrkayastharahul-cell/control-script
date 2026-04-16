(function () {
  "use strict";

  if (window.__AR_WALLET_BY_RS__) return;
  window.__AR_WALLET_BY_RS__ = true;

  let users = [];

  fetch("https://cdn.jsdelivr.net/gh/mrkayastharahul-cell/control-script/users.json?v=" + Date.now())
    .then(r => r.json())
    .then(data => {
      users = data.users || [];
      init();
    })
    .catch(err => {
      alert("Server error ❌");
      console.log(err);
    });

  function init() {

    // 🔹 DEVICE ID
    function getDeviceId() {
      return btoa(
        navigator.userAgent +
        screen.width +
        screen.height +
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
    }

    // 🔹 UID
    let uid = localStorage.getItem("ar_uid");

    if (!uid) {
      uid = prompt("Enter Your UID")?.trim();
    }

    if (!uid) {
      alert("Access Denied ❌");
      return;
    }

    const user = users.find(u => u.uid === uid);

    if (!user) {
      alert("Access Denied ❌");
      localStorage.removeItem("ar_uid");
      return;
    }

    // 🔹 EXPIRY
    const today = new Date();
    const expiry = new Date(user.expiry);

    if (today > expiry) {
      alert("Subscription Expired ❌");
      localStorage.removeItem("ar_uid");
      return;
    }

    // 🔹 DEVICE LOCK
    const currentDevice = getDeviceId();
    const savedDevice = localStorage.getItem("ar_device");

    if (!savedDevice) {
      localStorage.setItem("ar_device", currentDevice);
    }

    if (savedDevice && savedDevice !== currentDevice) {
      alert("Device Mismatch ❌ Contact Admin");
      return;
    }

    // 🔹 SAVE UID AFTER SUCCESS
    localStorage.setItem("ar_uid", uid);

    console.log("Access Granted ✅", user.name);

    // ===============================
    // 🔹 AUTO BUY SYSTEM
    // ===============================

    const STATE = {
      running: false,
      clicks: 0,
      lastClick: 0,
      lastRefresh: 0
    };

    const CONFIG = {
      scanInterval: 1000,
      clickGap: 2000,
      refreshGap: 5000
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

    function changeUID() {
      localStorage.clear();
      location.reload();
    }

    // ===============================
    // 🔹 UI
    // ===============================

    const box = document.createElement("div");

    box.innerHTML = `
    <div style="position:fixed;bottom:20px;right:20px;background:#111;color:#fff;padding:12px;border-radius:10px;z-index:999999;font-family:sans-serif;width:230px">
      <b style="color:#00ff88">AR Wallet By RS</b><br><br>
      <button id="startBtn" style="width:32%;background:green;color:#fff;border:none;padding:6px;border-radius:5px">Start</button>
      <button id="stopBtn" style="width:32%;background:red;color:#fff;border:none;padding:6px;border-radius:5px">Stop</button>
      <button id="changeBtn" style="width:32%;background:#007bff;color:#fff;border:none;padding:6px;border-radius:5px">Reset</button>
      <div style="clear:both"></div>
      <p>Status: <span id="statusTxt">Idle</span></p>
      <p>Clicks: <span id="clickTxt">0</span></p>
      <p style="font-size:11px;color:#aaa">${user.name} | Exp: ${user.expiry}</p>
    </div>`;

    document.body.appendChild(box);

    const statusEl = document.getElementById("statusTxt");
    const clickEl = document.getElementById("clickTxt");

    document.getElementById("startBtn").onclick = start;
    document.getElementById("stopBtn").onclick = stop;
    document.getElementById("changeBtn").onclick = changeUID;
  }

})();
