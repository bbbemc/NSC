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

document.addEventListener("DOMContentLoaded", function () {
    const toggleIcons = document.querySelectorAll(".toggle-password");

    toggleIcons.forEach(icon => {
        icon.addEventListener("click", function () {
            const targetId = this.getAttribute("data-target");
            const input = document.getElementById(targetId);

            if (!input) return; // ถ้า id ผิดหรือหาไม่เจอ

            const isPassword = input.getAttribute("type") === "password";

            input.setAttribute("type", isPassword ? "text" : "password");

            // เปลี่ยน icon ลูกตา
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    });
});


const backgroundGrid = document.querySelector('.background-grid');
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

document.addEventListener('DOMContentLoaded', () => {
  createGridBlocks();
  window.addEventListener('resize', createGridBlocks);
});

