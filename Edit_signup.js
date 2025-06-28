// ฟังก์ชันย้อนกลับไปหน้า index
function goBack() {
  window.location.href = "index.html";
}

const loginBtn = document.querySelector(".Login");
const connectBtn = document.getElementById("connectBtn");

let selectedAction = null;
let connectSelected = false;

function setLoginActive(active) {
  if (active) loginBtn.classList.add("login-active");
  else loginBtn.classList.remove("login-active");
}

// เมื่อคลิกปุ่ม Sign Up (เหมือนแค่เปลี่ยนสถานะสวยงาม)
loginBtn.onclick = function () {
  if (selectedAction === "signup") {
    // อาจจะลิงก์ไปหน้าสมัครจริง ๆ ถ้าต้องการ
    return;
  }
  selectedAction = "signup";
  setLoginActive(true);
  connectSelected = false;
  connectBtn.textContent = "Connect";
  connectBtn.classList.remove("connect-active");
};

// เมื่อคลิก Connect
connectBtn.onclick = function () {
  // กด Connect ได้เลย ไม่ต้องล็อกอิน
  if (connectSelected) {
    // ถ้ากดซ้ำ Confirm Connect ให้ลิงก์ไปหน้า index หรือหน้าที่ต้องการ
    window.location.href = "index.html";
  } else {
    connectSelected = true;
    connectBtn.textContent = "Confirm Connect";
    connectBtn.classList.add("connect-active");

    setTimeout(() => {
      connectSelected = false;
      connectBtn.textContent = "Connect";
      connectBtn.classList.remove("connect-active");
    }, 5000);
  }
};
