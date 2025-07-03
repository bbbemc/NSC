// Text พิมพ์ทีละตัว (Typewriter effect)
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

let selectedAction = null;       // เก็บสถานะว่าเลือก login หรือ signup แล้ว
let connectSelected = false;     // สถานะ confirm connect
let connectTimeout = null;       // ตัวเก็บ timeout สำหรับ connect

// เมื่อกด Login
loginBtn.onclick = function () {
    if (selectedAction === "login") {
        // กดซ้ำ → เข้าหน้า login.html
        window.location.href = "index.html";
        return;
    }

    selectedAction = "login";
    loginBtn.classList.add("login-signup-active");
    signupBtn.classList.remove("login-signup-active");

    // รีเซ็ตสถานะ Connect
    resetConnect();
};

// เมื่อกด Sign Up
signupBtn.onclick = function () {
    if (selectedAction === "signup") {
        // กดซ้ำ → เข้าหน้า signup.html
        window.location.href = "signup.html";
        return;
    }

    selectedAction = "signup";
    signupBtn.classList.add("login-signup-active");
    loginBtn.classList.remove("login-signup-active");

    // รีเซ็ตสถานะ Connect
    resetConnect();
};

// เมื่อกด Connect
connectBtn.onclick = function () {
    if (!selectedAction) {
        // ยังไม่ได้เลือก login หรือ signup
        alert("กรุณากด Login หรือ Sign Up ก่อนจึงจะ Connect ได้ครับ 🙂");
        return;
    }

    if (connectSelected) {
        // กด confirm connect ครั้งที่สอง → ไปหน้าตามที่เลือก
        if (selectedAction === "login") {
            window.location.href = "login.html";
        } else if (selectedAction === "signup") {
            window.location.href = "signup.html";
        }
    } else {
        // กดครั้งแรก → เปลี่ยนสถานะ confirm connect
        connectSelected = true;
        connectBtn.classList.add("connect-active");
        connectBtn.textContent = "Confirm Connect";

        // เคลียร์ Timeout เดิมถ้ามี แล้วตั้งใหม่
        if (connectTimeout) clearTimeout(connectTimeout);
        connectTimeout = setTimeout(() => {
            resetConnect();
        }, 5000); // รีเซ็ตหลัง 5 วินาที ถ้าไม่กดอีกครั้ง
    }
};

// ปิด Connect ชั่วคราวตอนโหลด 1 วินาที (ไม่จำเป็นแต่ช่วย UX)
connectBtn.disabled = true;
setTimeout(() => {
    connectBtn.disabled = false;
}, 1000);

// ฟังก์ชันรีเซ็ตสถานะ Connect ให้กลับเป็นค่าเริ่มต้น
function resetConnect() {
    connectSelected = false;
    connectBtn.classList.remove("connect-active");
    connectBtn.textContent = "Connect";

    if (connectTimeout) {
        clearTimeout(connectTimeout);
        connectTimeout = null;
    }
}
