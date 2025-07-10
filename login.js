// --- Typewriter Effect พร้อม callback ---
const text = "เว็ปนี้มีจุดประสงค์เพื่อใช้ในการศึกษาหาความรู้เเละทดลองการใช้โมเดล  \nเพื่อให้เข้าใจเนื้อหามากขึ้น หวังว่าเว็ปนี้จะมีประโยชน์กับทุกคนนะครับ";
let index = 0;

function typeWriter(callback) {
    if (index < text.length) {
        const currentChar = text.charAt(index);
        document.getElementById("typeText").innerHTML += currentChar === "\n" ? "<br>&nbsp;&nbsp;&nbsp;&nbsp;" : currentChar;
        index++;
        setTimeout(() => typeWriter(callback), 60);
    } else {
        if (typeof callback === "function") {
            callback();
        }
    }
}

// --- สร้างกริด background (ถ้ามีส่วนนี้อยู่แล้วในโปรเจกต์ให้เอาไว้) ---
const backgroundGrid = document.querySelector('.background');
const blockSize = 25;
const gapSize = 1;

let cols, rows;
let blocks = [];

function createGridBlocks() {
  cols = Math.ceil(window.innerWidth / (blockSize + gapSize));
  rows = Math.ceil(window.innerHeight / (blockSize + gapSize));

  backgroundGrid.style.gridTemplateColumns = `repeat(${cols}, ${blockSize}px)`;
  backgroundGrid.style.gridAutoRows = `${blockSize}px`;
  backgroundGrid.innerHTML = '';

  blocks = [];

  for (let i = 0; i < cols * rows; i++) {
    const block = document.createElement('div');
    block.classList.add('block');

    block.addEventListener('mouseenter', () => highlightBlocksAround(i));
    block.addEventListener('mouseleave', resetBlocks);

    backgroundGrid.appendChild(block);
    blocks.push(block);
  }
}

function highlightBlocksAround(centerIndex) {
  const centerRow = Math.floor(centerIndex / cols);
  const centerCol = centerIndex % cols;
  const radius = 1;

  blocks.forEach((block, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    if (Math.abs(row - centerRow) <= radius && Math.abs(col - centerCol) <= radius) {
      block.classList.add('hovered');
    } else {
      block.classList.remove('hovered');
    }
  });
}

function resetBlocks() {
  blocks.forEach(block => block.classList.remove('hovered'));
}

// --- ฟังก์ชันแบ่งตัวอักษรในข้อความ เพื่อให้เปลี่ยนสีทีละตัวได้ ---
function wrapLettersIn(selector) {
    document.querySelectorAll(selector).forEach(el => {
        const text = el.textContent;
        el.innerHTML = ""; // ลบข้อความเดิม
        for (let char of text) {
            const span = document.createElement("span");
            span.classList.add("glow-letter");
            span.textContent = char;
            el.appendChild(span);
        }
    });
}

// --- รันเมื่อโหลดหน้าเสร็จ ---
document.addEventListener('DOMContentLoaded', () => {
    createGridBlocks();
    window.addEventListener('resize', createGridBlocks);

    // เริ่มพิมพ์ข้อความ typewriter แล้วพอเสร็จค่อย wrap ตัวอักษร
    typeWriter(() => {
        wrapLettersIn("#typeText");
    });

    // wrap ตัวอักษรอื่นที่ต้องการให้มี glow effect
    wrapLettersIn("#Login");
    wrapLettersIn(".Topic-purpose");
    wrapLettersIn("h1");
    wrapLettersIn("button");
});

// --- ไลท์วงแสงที่ตัวอักษรที่ใกล้เคอร์เซอร์เมาส์ ---
window.addEventListener("mousemove", (e) => {
    const mx = e.clientX;
    const my = e.clientY;
    const radius = 100; // รัศมีแสง

    document.querySelectorAll(".glow-letter").forEach(span => {
        const rect = span.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dist = Math.hypot(mx - cx, my - cy);

        if (dist <= radius) {
            span.classList.add("hover-glow");
        } else {
            span.classList.remove("hover-glow");
        }
    });
});

// --- ฟังก์ชัน toggle password eye icon ---
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("Password");

togglePassword.addEventListener("click", function () {
    const isPassword = password.getAttribute("type") === "password";
    password.setAttribute("type", isPassword ? "text" : "password");
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
});

// --- ปุ่ม Sign Up ทำให้เด่นก่อนลิงก์ ---
const signupBtn = document.querySelector(".button-Sign");
let signupClicked = false;

signupBtn.onclick = function () {
    if (signupClicked) {
        window.location.href = "sign.html";
    } else {
        signupClicked = true;
        signupBtn.classList.add("login-signup-active");

        setTimeout(() => {
            signupClicked = false;
            signupBtn.classList.remove("login-signup-active");
        }, 6000);
    }
};

// --- Background mouse move effect ---
const bg = document.querySelector('.background');

window.addEventListener('mousemove', e => {
  const x = e.clientX;
  const y = e.clientY;
  const xPercent = (x / window.innerWidth) * 100 + '%';
  const yPercent = (y / window.innerHeight) * 100 + '%';

  bg.style.setProperty('--mouse-x', xPercent);
  bg.style.setProperty('--mouse-y', yPercent);
});

window.addEventListener('mouseleave', () => {
  bg.style.setProperty('--mouse-x', '50%');
  bg.style.setProperty('--mouse-y', '50%');
});

function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

// ปรับปรุง event listener mousemove ของ background grid และแสงเมาส์

function handleMouseMove(e) {
  if (isPortrait()) {
    // ถ้าเป็นหน้าจอทรศ ให้ disable effect
    bg.style.setProperty('--mouse-x', '50%');
    bg.style.setProperty('--mouse-y', '50%');
    resetBlocks();
    return; // ไม่ทำอะไรต่อ
  }

  const x = e.clientX;
  const y = e.clientY;
  const xPercent = (x / window.innerWidth) * 100 + '%';
  const yPercent = (y / window.innerHeight) * 100 + '%';

  bg.style.setProperty('--mouse-x', xPercent);
  bg.style.setProperty('--mouse-y', yPercent);
}

// แก้ event listener

window.removeEventListener('mousemove', yourOldMouseMoveHandler); // ถ้ามีเก็บไว้ลบก่อน

window.addEventListener('mousemove', handleMouseMove);

window.addEventListener('mouseleave', () => {
  bg.style.setProperty('--mouse-x', '50%');
  bg.style.setProperty('--mouse-y', '50%');
  resetBlocks();
});

// เพิ่มฟังก์ชัน resize ปรับ disable effect ตอนเปลี่ยนขนาดหน้าจอ

window.addEventListener('resize', () => {
  if (isPortrait()) {
    // ปิด effect ทั้งหมดตอนเปลี่ยนเป็นทรศ
    bg.style.setProperty('--mouse-x', '50%');
    bg.style.setProperty('--mouse-y', '50%');
    resetBlocks();
  }
});