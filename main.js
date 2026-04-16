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

  console.log("Access Granted ✅");

})();
