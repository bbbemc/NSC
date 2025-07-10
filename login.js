const text = "เว็ปนี้มีจุดประสงค์เพื่อใช้ในการศึกษาหาความรู้เเละทดลองการใช้โมเดล  \nเพื่อให้เข้าใจเนื้อหามากขึ้น หวังว่าเว็ปนี้จะมีประโยชน์กับทุกคนนะครับ";
let index = 0;

function typeWriter(callback) {
  if (index < text.length) {
    const currentChar = text.charAt(index);
    document.getElementById("typeText").innerHTML += currentChar === "\n" ? "<br>&nbsp;&nbsp;&nbsp;&nbsp;" : currentChar;
    index++;
    setTimeout(() => typeWriter(callback), 60);
  } else {
    if (typeof callback === "function") callback();
  }
}

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
    backgroundGrid.appendChild(block);
    blocks.push(block);

    if (window.innerWidth >= 1024) {
      // มีเมาส์: ใช้ hover
      block.addEventListener('mouseenter', () => highlightBlocksAround(i));
      block.addEventListener('mouseleave', resetBlocks);
    }
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

function wrapLettersIn(selector) {
  document.querySelectorAll(selector).forEach(el => {
    const text = el.textContent;
    el.innerHTML = "";
    for (let char of text) {
      const span = document.createElement("span");
      span.classList.add("glow-letter");
      span.textContent = char;
      el.appendChild(span);
    }
  });
}

const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("Password");

togglePassword.addEventListener("click", function () {
  const isPassword = password.getAttribute("type") === "password";
  password.setAttribute("type", isPassword ? "text" : "password");
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

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

window.addEventListener("mousemove", (e) => {
  const mx = e.clientX;
  const my = e.clientY;
  const radius = 10;

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

document.addEventListener('DOMContentLoaded', () => {
  createGridBlocks();

  window.addEventListener('resize', () => {
    createGridBlocks();
  });

  typeWriter();

  wrapLettersIn("#Login");
  wrapLettersIn(".Topic-purpose");
  wrapLettersIn("h1");
  wrapLettersIn("button");
});
