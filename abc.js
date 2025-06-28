// Text พิมพ์ทีละตัว
const text = "เว็ปนี้มีจุดประสงค์เพื่อใช้ในการศึกษาหาความรู้เเละทดลองการใช้โมเดล \n เพื่อให้เข้าใจเนื้อหามากขึ้น หวังว่าเว็ปนี้จะมีประโยชน์กับทุกคนนะครับ";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        const currentChar = text.charAt(index);
        document.getElementById("typeText").innerHTML += currentChar === "\n" ? "<br>" : currentChar;
        index++;
        setTimeout(typeWriter, 60);
    }
}
typeWriter();

// ปุ่มทั้งหมด
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const connectBtn = document.getElementById("connectBtn");

let selectedAction = null;       // บอกว่าผู้ใช้เลือก login หรือ signup แล้วหรือยัง
let connectSelected = false;     // สถานะ confirm connect

// เมื่อกด Login
loginBtn.onclick = function () {
    if (selectedAction === "login") {
        window.location.href = "login.html"; // กดซ้ำ → เข้าหน้า
        return;
    }

    selectedAction = "login";
    loginBtn.classList.add("login-signup-active");
    signupBtn.classList.remove("login-signup-active");

    // รีเซ็ต Connect
    connectSelected = false;
    connectBtn.classList.remove("connect-active");
    connectBtn.textContent = "Connect";
};

// เมื่อกด Sign Up
signupBtn.onclick = function () {
    if (selectedAction === "signup") {
        window.location.href = "signup.html";
        return;
    }

    selectedAction = "signup";
    signupBtn.classList.add("login-signup-active");
    loginBtn.classList.remove("login-signup-active");

    // รีเซ็ต Connect
    connectSelected = false;
    connectBtn.classList.remove("connect-active");
    connectBtn.textContent = "Connect";
};

// เมื่อกด Connect
connectBtn.onclick = function () {
    // ถ้ายังไม่เลือก login หรือ signup → แจ้งเตือนทันที
    if (!selectedAction) {
        alert("กรุณากด Login หรือ Sign Up ก่อนจึงจะ Connect ได้ครับ 🙂");
        return;
    }

    // ถ้าเคยกดแล้ว → ไปหน้า
    if (connectSelected) {
        if (selectedAction === "login") {
            window.location.href = "login.html";
        } else if (selectedAction === "signup") {
            window.location.href = "signup.html";
        }
    } else {
        // ยังไม่เคยกด → ให้ยืนยัน
        connectSelected = true;
        connectBtn.classList.add("connect-active");
        connectBtn.textContent = "Confirm Connect";

        // ยกเลิกอัตโนมัติใน 3 วินาที
        setTimeout(() => {
            connectSelected = false;
            connectBtn.classList.remove("connect-active");
            connectBtn.textContent = "Connect";
        }, 5000);
    }
};

// ปิด Connect ชั่วคราวตอนโหลด
connectBtn.disabled = true;
setTimeout(() => {
    connectBtn.disabled = false;
}, 1000);
