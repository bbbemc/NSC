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

  function setupTogglePassword() {
    const toggles = document.querySelectorAll('.toggle-password');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.getAttribute('data-target');
        const pwd = document.getElementById(targetId);
        if (!pwd) return;
        const isPwd = pwd.type === 'password';
        pwd.type = isPwd ? 'text' : 'password';
        toggle.classList.toggle('fa-eye');
        toggle.classList.toggle('fa-eye-slash');
      });
    });
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
  const gapSize = 1;
  let cols, rows, blocks = [];

  function createGridBlocks() {
    if (!backgroundGrid) return;

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
    }
  }


  /* ---------- 4. เอฟเฟกต์อักษรเรืองแสงตามเมาส์ ---------- */
  function setupMouseGridHighlight() {
    let isMouseDown = false;
    let isMiddleMouseDown = false;

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // คลิกซ้าย
        isMouseDown = true;
      } else if (e.button === 1) { // คลิกเมาส์กลาง (wheel)
        isMiddleMouseDown = true;
        // ลบทุกบล็อกเลย (เคลียร์พื้นหลัง)
        blocks.forEach(b => b.classList.remove('hovered', 'locked'));
        e.preventDefault(); // ป้องกัน scroll ล้อกลาง (ถ้าต้องการ)
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        isMouseDown = false;
      } else if (e.button === 1) {
        isMiddleMouseDown = false;
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
            block.classList.add('locked'); // คลิกซ้ายค้าง วาดล็อกไว้
          } else if (!isMouseDown && !isMiddleMouseDown) {
            block.classList.remove('locked');
            setTimeout(() => block.classList.remove('hovered'), 200);
          }
        }
      }
    });

    // **ลบ event contextmenu หรือไม่เพิ่มก็ได้**  
    // เพื่อให้คลิกขวาเมนูปกติ (inspect ใช้งานได้)
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
        setTimeout(() => {
          clickedOnce = false;
          signupBtn.classList.remove('login-signup-active');
        }, 600); // ปรับระยะเวลาแอนิเมชันได้ตามใจ
      }
    });
  }

  function setupGlowLettersHover() {
    document.querySelectorAll('.glow-letter').forEach(span => {
      span.addEventListener('mouseenter', () => {
        span.classList.add('hover-glow');
      });
      span.addEventListener('mouseleave', () => {
        span.classList.remove('hover-glow');
      });
    });
  }

  /* ---------- 7. เริ่มทำงานเมื่อ DOM พร้อม ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    typeTextEl = document.getElementById('typeText');

    createGridBlocks();
    setupMouseGridHighlight();
    window.addEventListener('resize', createGridBlocks);

    setupTogglePassword();
    setupSignupButton();

    typeWriter(() => {
      // หลังพิมพ์จบค่อยใส่ span ให้ทุกตัวอักษร
      wrapLettersIn('#Sign-Up');
      wrapLettersIn('.Topic-purpose');
      wrapLettersIn('.button-Continue');
      wrapLettersIn('.button-Sign');

      // เรียก setupHover หลังจาก wrap เสร็จ
      setupGlowLettersHover();
    });
  });
})();
