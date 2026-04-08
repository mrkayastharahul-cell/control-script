console.log("Automation started");

setInterval(() => {
  const elements = document.querySelectorAll('*');

  elements.forEach(el => {
    if (el.innerText && el.innerText.includes("Buy")) {
      el.click();
      console.log("Clicked Buy");
    }
  });
}, 5000);
