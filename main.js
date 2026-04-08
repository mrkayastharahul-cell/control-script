console.log("Automation started");

setInterval(() => {
  const btn = document.querySelector('button');

  if (btn) {
    btn.click();
    console.log("Clicked");
  } else {
    console.log("Not found");
  }
}, 5000);
