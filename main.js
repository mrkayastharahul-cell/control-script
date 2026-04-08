console.log("Automation started");

setInterval(() => {
  const buttons = document.querySelectorAll('button, div');

  buttons.forEach(btn => {
    if (btn.innerText && btn.innerText.toLowerCase().includes("buy")) {
      btn.click();
      console.log("Clicked BUY element");
    }
  });
}, 5000);
