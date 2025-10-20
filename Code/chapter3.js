const cards = document.querySelectorAll('.card');
const scoreDisplay = document.getElementById('score-display');
const resetButton = document.getElementById('reset-button');
const resetCountDisplay = document.getElementById('reset-count');

let score = 0;
let completedCount = 0;
let totalCards = cards.length;
let isResetting = false;

// โหลดค่า reset count ตอนเปิดหน้า
fetch("get_reset_count.php")
  .then(res => res.text())
  .then(count => {
    resetCountDisplay.textContent = `Reset Count: ${count}`;
  });

// อัปเดตการแสดงผลคะแนน
function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${score} / ${totalCards}`;
}

updateScoreDisplay();

// จัดการแต่ละ card
cards.forEach(card => {
  const items = card.querySelectorAll('.item');
  let selectedItem = null;
  let isLocked = false;
  let hasScored = false;

  const submitBtn = card.querySelector('.primary-btn');
  const tryAgainBtn = card.querySelector('.try-again-btn');

  // เลือกตัวเลือก
  items.forEach(item => {
    item.addEventListener('click', () => {
      if (isLocked) return;
      items.forEach(i => i.classList.remove('selected'));
      selectedItem = item;
      item.classList.add('selected');
    });
  });

  // ตรวจคำตอบ
  submitBtn.addEventListener('click', () => {
    if (!selectedItem) {
      alert("กรุณาเลือกคำตอบก่อนกด Submit");
      return;
    }

    const isCorrect = selectedItem.dataset.correct === "true";

    // ✅ ลบ Animation เก่าออกก่อนทุกครั้ง
    items.forEach(item => {
      item.classList.remove('correct', 'incorrect');
      const animationIcon = item.querySelector('.animation-icon');
      if (animationIcon) {
        animationIcon.remove();
      }
    });

    if (isCorrect) {
      selectedItem.classList.add('correct');
      // สร้าง Lottie Checkmark
      const lottieCheckmark = document.createElement('lottie-player');
      lottieCheckmark.src = "animations/rc1PLqmiRt.json"; // ✅ ใช้ชื่อไฟล์ของคุณ
      lottieCheckmark.autoplay = true;
      lottieCheckmark.loop = false;
      lottieCheckmark.classList.add('animation-icon');
      selectedItem.appendChild(lottieCheckmark);

      if (!hasScored) {
        score += 1;
        hasScored = true;
      }
    } else {
      selectedItem.classList.add('incorrect');
      const lottieCross = document.createElement('lottie-player');
      lottieCross.src = "animations/zBgeVeKOwt.json";
      lottieCross.autoplay = true;
      lottieCross.loop = false;
      lottieCross.classList.add('animation-icon');
      selectedItem.appendChild(lottieCross);
    }

    isLocked = true;
    submitBtn.disabled = true;
    tryAgainBtn.style.display = 'inline-block';

    completedCount++;

    // ถ้าทำครบทุกข้อ อัปเดตคะแนน
    if (completedCount === totalCards) {
      updateScoreDisplay();
    }
  });

  // ทำใหม่เฉพาะการ์ดนี้
  tryAgainBtn.addEventListener('click', () => {
    isLocked = false;
    selectedItem = null;
    items.forEach(item => {
      item.classList.remove('selected', 'correct', 'incorrect');
      // ✅ ลบ Animation ออก
      const animationIcon = item.querySelector('.animation-icon');
      if (animationIcon) {
        animationIcon.remove();
      }
    });
    submitBtn.disabled = false;
    tryAgainBtn.style.display = 'none';
  });

  // method สำหรับ reset ทั้งหมด
  card.resetCard = function () {
    isLocked = false;
    selectedItem = null;
    hasScored = false;

    items.forEach(item => {
      item.classList.remove('selected', 'correct', 'incorrect');
      // ✅ ลบ Animation ออก
      const animationIcon = item.querySelector('.animation-icon');
      if (animationIcon) {
        animationIcon.remove();
      }
    });
    submitBtn.disabled = false;
    tryAgainBtn.style.display = 'none';
  };
});

// จัดการปุ่ม Reset Quiz ทั้งหมด
resetButton.addEventListener('click', function () {
  if (isResetting) return;
  isResetting = true;

  // อัปเดตค่า reset_count ที่เซิร์ฟเวอร์
  fetch("reset_quiz.php", { method: "POST" })
    .then(res => res.text())
    .then(() => fetch("get_reset_count.php"))
    .then(res => res.text())
    .then(count => {
      // เมื่อได้ค่าใหม่แล้ว ค่อยอัปเดตการแสดงผล
      resetCountDisplay.textContent = `Reset Count: ${count}`;

      // รีเซ็ตการ์ดทั้งหมด
      cards.forEach(card => card.resetCard());
      score = 0;
      completedCount = 0;
      updateScoreDisplay();
      isResetting = false;
    })
    .catch(error => {
      console.error("Error:", error);
      isResetting = false;
    });
});

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});