const loginBtn = document.querySelector(".Login");
const connectBtn = document.getElementById("connectBtn");

let connectConfirmed = false;

loginBtn.addEventListener("click", () => {
  loginBtn.classList.toggle("login-active"); // คลาส .login-active ต้องตรงกับ CSS
});

connectBtn.addEventListener("click", () => {
  if (!connectConfirmed) {
    connectConfirmed = true;
    connectBtn.classList.add("connect-active"); // คลาส .connect-active ต้องตรงกับ CSS
    connectBtn.textContent = "Confirm Connect";
    setTimeout(() => {
      connectConfirmed = false;
      connectBtn.classList.remove("connect-active");
      connectBtn.textContent = "Connect";
    }, 5000);
  } else {
    window.location.href = "index.html";
  }
});


function goBack() {
  window.location.href = "index.html";
}