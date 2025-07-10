
// Typewriter Effect
const text = "เว็ปนี้มีจุดประสงค์เพื่อใช้ในการศึกษาหาความรู้เเละทดลองการใช้โมเดล \nเพื่อให้เข้าใจเนื้อหามากขึ้น หวังว่าเว็ปนี้จะมีประโยชน์กับทุกคนนะครับ";
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

// ปุ่ม Sign Up
const signupBtn = document.querySelector(".button-Sign");
let signupClicked = false;

signupBtn.onclick = function () {
    if (signupClicked) {
        // กดรอบสอง → ลิงก์ไปหน้า signup.html
        window.location.href = "sign.html";
    } else {
        // กดรอบแรก → ทำให้ปุ่มเด่น
        signupClicked = true;
        signupBtn.classList.add("login-signup-active");

        // รีเซ็ตถ้าไม่กดซ้ำภายใน 5 วิ
        setTimeout(() => {
            signupClicked = false;
            signupBtn.classList.remove("login-signup-active");
        }, 6000);
    }
};


const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("Password");

togglePassword.addEventListener("click", function () {
    const isPassword = password.getAttribute("type") === "password";

    password.setAttribute("type", isPassword ? "text" : "password");
    this.classList.toggle("fa-eye");        // ตาเปิด
    this.classList.toggle("fa-eye-slash");  // ตาปิด
});

