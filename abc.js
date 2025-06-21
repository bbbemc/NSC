const text = "เว็ปนี้มีจุดประสงค์เพื่อใช้ในการศึกษาหาความรู้เเละทดลองการใช้โมเดล \n เพื่อให้เข้าใจเนื้อหามากขึ้น หวังว่าเว็ปนี้จะมีประโยชน์กับทุกคนนะครับ";
let index = 0;

function typeWriter() {
    if (index < text.length) {
        const currentChar = text.charAt(index);
        if (currentChar === "\n") {
            document.getElementById("typeText").innerHTML += "<br>";
        } else {
            document.getElementById("typeText").innerHTML += currentChar;
        }
        index++;
        setTimeout(typeWriter, 60);
    }
}

typeWriter(); // เริ่มพิมพ์ข้อความ

// สถานะการเลือก
let selectedAction = null;

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const connectBtn = document.getElementById("connectBtn");

// คลิกปุ่ม Login
loginBtn.onclick = function () {
    if (selectedAction === "login") {
        // กดซ้ำ → เข้าหน้า login
        window.location.href = "login.html";
    } else {
        selectedAction = "login";
        loginBtn.classList.add("active");
        signupBtn.classList.remove("active");
    }
};

// คลิกปุ่ม Sign Up
signupBtn.onclick = function () {
    if (selectedAction === "signup") {
        // กดซ้ำ → เข้าหน้า signup
        window.location.href = "signup.html";
    } else {
        selectedAction = "signup";
        signupBtn.classList.add("active");
        loginBtn.classList.remove("active");
    }
};

// คลิกปุ่ม Connect
connectBtn.onclick = function () {
    if (selectedAction === "login") {
        window.location.href = "login.html";
    } else if (selectedAction === "signup") {
        window.location.href = "signup.html";
    } else {
        alert("กรุณากด Login หรือ Sign Up ก่อนจึงจะ Connect ได้ครับ 🙂");
    }
};
