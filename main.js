(()=>{

  // ================= UI =================
  let box=document.createElement('div');
  box.innerHTML=`
  <div style="position:fixed;bottom:20px;right:20px;background:#111;color:#fff;padding:12px;border-radius:10px;z-index:999999;box-shadow:0 0 15px rgba(0,0,0,0.5);width:220px;font-family:sans-serif">
    <b style="color:#00ff88">AR Wallet By RS</b><br><br>
    <input id="amt" placeholder="Enter Amount" style="width:100%;padding:6px;border:none;border-radius:5px"><br><br>
    <button id="st" style="width:48%;background:#00c853;color:#fff;border:none;padding:7px;border-radius:5px">Start</button>
    <button id="sp" style="width:48%;background:#d50000;color:#fff;border:none;padding:7px;border-radius:5px;float:right">Stop</button>
    <div style="clear:both"></div>
    <p id="s" style="margin-top:8px">Idle</p>
    <p id="c" style="font-size:12px">Clicks: 0</p>
  </div>`;
  document.body.appendChild(box);

  // ================= VAR =================
  let run=0,lock=0,count=0,lastClick=0;

  const setS=(t,c)=>document.getElementById("s").innerHTML=`<span style="color:${c}">${t}</span>`;

  document.getElementById("st").onclick=()=>{run=1;setS("Running 🚀","#00ff88");};
  document.getElementById("sp").onclick=()=>{run=0;setS("Stopped ❌","#ff4444");};

  // ================= CORE ENGINE =================
  function scan(){

    if(!run) return;

    let a=document.getElementById("amt").value.trim();
    if(!a) return;

    let found=false;

    let nodes=[...document.querySelectorAll('button,div,span')].filter(e=>e.offsetParent);

    for(let n of nodes){

      let t=n.innerText;
      if(!t) continue;

      if(t.replace(/\D/g,"").includes(a)){

        found=true;

        let p=n;

        for(let i=0;i<4 && p;i++){

          let btns=[...p.querySelectorAll('button')]
          .filter(b=>/buy/i.test(b.innerText) && b.offsetParent);

          if(btns.length){

            let btn=btns.at(-1); // elite fix

            // 🔥 anti-spam + human delay
            if(Date.now()-lastClick>1200){

              btn.click();
              lastClick=Date.now();

              count++;
              document.getElementById("c").innerText="Clicks: "+count;

              console.log("✔ BUY:",a);
            }

            return;
          }

          p=p.parentElement;
        }
      }
    }

    // 🔥 smart retry (no hard spam refresh)
    if(!found && Date.now()-lastClick>5000){
      console.log("Retry...");
      location.reload();
    }
  }

  // ================= REAL-TIME ENGINE =================
  const observer=new MutationObserver(scan);
  observer.observe(document.body,{childList:true,subtree:true});

  // fallback safety
  setInterval(scan,1500);

})();
