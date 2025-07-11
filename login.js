/* =========================================
   login.js  (แก้ไขชื่อคลาสพื้นหลัง → .background‑grid)
   ========================================= */
(() => {
  'use strict';

  /* ---------- 1. Type‑writer ---------- */
  const text =
    'เว็ปนี้มีจุดประสงค์เพื่อใช้ในการศึกษาหาความรู้เเละทดลองการใช้โมเดล\nเพื่อให้เข้าใจเนื้อหามากขึ้น หวังว่าเว็ปนี้จะมีประโยชน์กับทุกคนนะครับ';
  let index = 0;
  let typeTextEl; // จะผูกค่าหลัง DOM พร้อม

  function typeWriter(done) {
    if (index < text.length) {
      const ch = text.charAt(index);
      typeTextEl.innerHTML +=
        ch === '\n' ? '<br>&nbsp;&nbsp;&nbsp;&nbsp;' : ch;
      index++;
      setTimeout(() => typeWriter(done), 60);
    } else if (done) {
      done();
    }
  }

  /* ---------- 2. ห่ออักษรด้วย span.glow-letter ---------- */
  function wrapLettersIn(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      const chars = [...el.textContent];
      el.textContent = '';
      chars.forEach((c) => {
        const span = document.createElement('span');
        span.classList.add('glow-letter');
        span.textContent = c;
        el.appendChild(span);
      });
    });
  }

  /* ---------- 3. พื้นหลังกริด ---------- */
  const backgroundGrid = document.querySelector('.background-grid'); // ★ เปลี่ยนให้ตรง HTML
  const blockSize = 25;
  const gapSize   = 1;
  let cols, rows, blocks = [];

  function createGridBlocks() {
    if (!backgroundGrid) return;

    cols = Math.ceil(window.innerWidth  / (blockSize + gapSize));
    rows = Math.ceil(window.innerHeight / (blockSize + gapSize));

    backgroundGrid.style.gridTemplateColumns = `repeat(${cols}, ${blockSize}px)`;
    backgroundGrid.style.gridAutoRows       = `${blockSize}px`;
    backgroundGrid.innerHTML = '';
    blocks = [];

    for (let i = 0; i < cols * rows; i++) {
      const block = document.createElement('div');
      block.classList.add('block');
      backgroundGrid.appendChild(block);
      blocks.push(block);
    }
  }

  function setupMouseGridHighlight() {
  let isMouseDown = false;

  window.addEventListener('mousedown', (e) => {
    if (e.button === 1) { // เมาส์กลาง
      e.preventDefault();  // ป้องกัน scroll ล้อกลางขึ้น (ถ้าต้องการ)
      blocks.forEach((b) => b.classList.remove('hovered', 'locked')); // ลบทั้งหมด
    } else if (e.button === 0) { // เมาส์ซ้าย
      isMouseDown = true;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      isMouseDown = false;
    }
  });

  window.addEventListener('mousemove', (e) => {
    const col = Math.floor(e.clientX / (blockSize + gapSize));
    const row = Math.floor(e.clientY / (blockSize + gapSize));

    for (let r = row; r <= row + 1; r++) {
      for (let c = col; c <= col + 1; c++) {
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        const i = r * cols + c;
        const block = blocks[i];
        if (!block) continue;

        block.classList.add('hovered');

        if (isMouseDown) {
          block.classList.add('locked'); // คลิกซ้ายค้าง: วาดล็อกไว้
        } else {
          setTimeout(() => block.classList.remove('hovered'), 200); // ไม่คลิก: ดับใน 200ms
        }
      }
    }
  });

  // **ลบอันนี้ไปเลย ถ้าอยากให้คลิกขวาเมนูเด้ง**
  // window.addEventListener('contextmenu', (e) => {
  //   e.preventDefault();
  // });
}

  /* ---------- 4. เอฟเฟกต์อักษรเรืองแสงตามเมาส์ ---------- */
  function setupGlowLettersHover() {
    window.addEventListener('mousemove', (e) => {
      const { clientX: mx, clientY: my } = e;
      const radius = 10;
      document.querySelectorAll('.glow-letter').forEach((span) => {
        const rect = span.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        span.classList.toggle('hover-glow', dist <= radius);
      });
    });
  }

  /* ---------- 5. แสดง/ซ่อนรหัสผ่าน ---------- */
  function setupTogglePassword() {
    const toggle = document.getElementById('togglePassword');
    if (!toggle) return;
    const pwd = document.getElementById('Password');

    toggle.addEventListener('click', () => {
      if (!pwd) return;
      const isPwd = pwd.type === 'password';
      pwd.type = isPwd ? 'text' : 'password';
      toggle.classList.toggle('fa-eye');
      toggle.classList.toggle('fa-eye-slash');
    });
  }

  /* ---------- 6. ปุ่ม Sign Up ---------- */
  function setupSignupButton() {
  const signupBtn = document.querySelector('.button-Sign');
  if (!signupBtn) return;

  let clickedOnce = false;
  signupBtn.addEventListener('click', () => {
    if (clickedOnce) {
      window.location.href = 'sign.html';
    } else {
      clickedOnce = true;
      signupBtn.classList.add('login-signup-active');
    }
  });
}

  /* ---------- 7. เริ่มทำงานเมื่อ DOM พร้อม ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    typeTextEl = document.getElementById('typeText');

    createGridBlocks();
    setupMouseGridHighlight();
    window.addEventListener('resize', createGridBlocks);

    setupTogglePassword();
    setupGlowLettersHover();
    setupSignupButton();

    typeWriter(() => {
      // หลังพิมพ์จบค่อยใส่ span ให้ทุกตัวอักษร
      wrapLettersIn('#Login');
      wrapLettersIn('.Topic-purpose');
      wrapLettersIn('#loginBtn');
      wrapLettersIn('.button-Sign');
    });
  });
})();
