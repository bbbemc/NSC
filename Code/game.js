/** ChemRush! Game Logic (ปรับปรุง)
 * - small fixes: cancel canvas RAF, keyboard accessibility, markAll cleanup,
 *   safeAddListener accepts NodeList, improved error logs
 */

(() => {
  const $ = (q, ctx = document) => ctx.querySelector(q);
  const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));
  const format = (n) => Math.max(0, Math.floor(n)).toString().padStart(2, '0');

  // Safety helpers
  const safeText = (el, txt) => { if (el) el.textContent = txt; };
  const safeValue = (el, v) => { if (el) el.value = v; };
  // accept single element or NodeList/Array
  const safeAddListener = (el, ev, fn) => {
    if (!el) return;
    if (NodeList.prototype.isPrototypeOf(el) || Array.isArray(el)) {
      el.forEach(x => x.addEventListener(ev, fn));
    } else {
      el.addEventListener(ev, fn);
    }
  };

  // Canvas stars bg (optional) — keep RAF id so we can cancel
  const starCanvas = $('#stars');
  let sctx = null;
  let starsRAF = null;
  if (starCanvas && starCanvas.getContext) {
    sctx = starCanvas.getContext('2d');
    function resizeCanvas() {
      starCanvas.width = innerWidth; starCanvas.height = innerHeight;
    }
    addEventListener('resize', resizeCanvas); resizeCanvas();
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      r: Math.random() * 1.5 + 0.2,
      v: Math.random() * 0.4 + 0.1
    }));
    function drawStars() {
      sctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      sctx.fillStyle = '#ffffff99';
      for (const s of stars) {
        sctx.beginPath();
        sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sctx.fill();
        s.y += s.v;
        if (s.y > starCanvas.height) { s.y = -5; s.x = Math.random() * starCanvas.width; }
      }
      starsRAF = requestAnimationFrame(drawStars);
    }
    drawStars();
  }

  // Screens (may be null if missing)
  const scrStart = $('#screen-start');
  const scrGame = $('#screen-game');
  const scrEnd = $('#screen-end');

  // HUD elements
  const elScore = $('#score');
  const elCombo = $('#combo');
  const elTime = $('#time');
  const elQnum = $('#qnum');
  const elTimeBar = $('#timebar');
  const elQuestion = $('#question');
  const elChoices = $('#choices');
  const elBadgeTopic = $('#badge-topic');
  const elBadgeDiff = $('#badge-diff');

  // End elements
  const elFScore = $('#final-score');
  const elFMaxCombo = $('#final-maxcombo');
  const elFTime = $('#final-time');
  const elNickname = $('#nickname');

  // Buttons
  const btnPlay = $('#btn-play');
  const btnMarathon = $('#btn-marathon');
  const btnSpeedrun = $('#btn-speedrun');
  const btnSkip = $('#btn-skip');
  const btnQuit = $('#btn-quit');
  const btnSave = $('#btn-save');
  const btnRetry = $('#btn-retry');
  const btnHome = $('#btn-home');
  

  // Dialogs & other UI
  const dlgHowto = $('#dlg-howto');
  const dlgLeaderboard = $('#dlg-leaderboard');
  const btnHowto = $('#btn-howto');
  const btnLeaderboard = $('#btn-leaderboard');

  // safe dialog close for any dialog-buttons with data-close
  safeAddListener($$('#app dialog [data-close]'), 'click', e => {
    const d = e.target.closest('dialog'); if (d?.open) d.close();
  });

  safeAddListener(btnHowto, 'click', () => { if (dlgHowto?.showModal) dlgHowto.showModal(); });
  safeAddListener(btnLeaderboard, 'click', async () => {
    await refreshLeaderboard();
    if (dlgLeaderboard?.showModal) dlgLeaderboard.showModal();
  });

  // Selects
  const selTopic = $('#select-topic');
  const selDiff = $('#select-difficulty');

  // Sound placeholders (optionally set .src)
  const sCorrect = new Audio();
  const sWrong = new Audio();
  const sTick = new Audio();
  const sEnd = new Audio();
  // e.g. sCorrect.src = 'sounds/correct.mp3';

  // Game state
  let mode = 'solo'; // solo | marathon | speedrun
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let qIndex = 0;
  let qTotal = 10;
  let timePerQ = 15;
  let timeLeft = 0;
  let timerId = null;
  let startedAt = 0;
  // --- Unified timer helpers (inserted) ---
  if (typeof window.gameState === 'undefined') {
    window.gameState = { running: false, paused: false, remainingMs: (timePerQ || 15) * 1000 };
  } else if (typeof window.gameState.remainingMs !== 'number') {
    window.gameState.remainingMs = (timePerQ || 15) * 1000;
  }
  // Use global timerId so pause/resume works across files
  window.timerId = window.timerId || null;
  window.lastTick = window.lastTick || 0;
  const TICK_MS = 100;

  const TIME_EL = document.getElementById('time') || null;
  const SCORE_EL = document.getElementById('score') || null;

  function updateTimeDisplayFromMs() {
    window.gameState.remainingMs = Math.max(0, window.gameState.remainingMs);
    const secs = Math.ceil(window.gameState.remainingMs / 1000);
    if (TIME_EL) TIME_EL.textContent = format(secs);
  }

  function tick() {
    if (window.gameState.paused) return;
    const now = Date.now();
    const dt = now - (window.lastTick || now);
    window.lastTick = now;
    window.gameState.remainingMs = Math.max(0, window.gameState.remainingMs - dt);
    updateTimebar(); // reuse existing UI function (we'll update it to read remainingMs)
    if (window.gameState.remainingMs <= 0) {
      // time up: stop and handle same as previous behavior
      stopTimer();
      allowAnswer = false;
      markAll();
      combo = 0; safeText(elCombo, combo);
      setTimeout(nextQuestion, 700);
    } else {
      try { if (sTick) { sTick.currentTime = 0; /* sTick.play(); */ } } catch (e) { }
    }
  }

  function startTimer(initialMs) {
    if (typeof initialMs === 'number') window.gameState.remainingMs = initialMs;
    window.gameState.running = true;
    window.gameState.paused = false;
    window.lastTick = Date.now();
    if (window.timerId) clearInterval(window.timerId);
    window.timerId = setInterval(tick, TICK_MS);
    updateTimebar();
  }

  function stopTimer() {
    window.gameState.running = false;
    window.gameState.paused = true;
    if (window.timerId) {
      clearInterval(window.timerId);
      window.timerId = null;
    }
  }

  function pauseGame() {
    if (window.gameState.paused) return;
    window.gameState.paused = true;
    if (window.timerId) {
      clearInterval(window.timerId);
      window.timerId = null;
    }
  }

  function resumeGame() {
    if (!window.gameState.paused) return;
    window.gameState.paused = false;
    window.lastTick = Date.now();
    if (!window.timerId && window.gameState.remainingMs > 0) {
      window.timerId = setInterval(tick, TICK_MS);
    }
  }
  // --- end unified timer helpers ---
  let topic = 'all';
  let difficulty = 'easy';
  let questions = [];
  let allowAnswer = true;

  function show(scr) {
    [scrStart, scrGame, scrEnd].forEach(s => s && s.classList.add('hidden'));
    if (scr) scr.classList.remove('hidden');
    // pause stars when not showing game (optional)
    if (starCanvas) {
      if (scr !== scrGame && starsRAF) { cancelAnimationFrame(starsRAF); starsRAF = null; }
      else if (scr === scrGame && !starsRAF) drawStarsSafe();
    }
  }
  function drawStarsSafe() { if (starCanvas && starCanvas.getContext) { starsRAF = requestAnimationFrame(function f() { try { sctx.clearRect(0, 0, starCanvas.width, starCanvas.height); } catch { }; drawStarsSafe(); }); } }

  function resetCore() {
    score = 0; combo = 0; maxCombo = 0; qIndex = 0; allowAnswer = true;
    safeText(elScore, '0'); safeText(elCombo, '0'); safeText(elQnum, '1');
    if (elTimeBar) elTimeBar.style.removeProperty('--accent');
  }

  // Attach main buttons
  safeAddListener(btnPlay, 'click', async () => { mode = 'solo'; qTotal = 10; timePerQ = 15; await startGame(); });
  safeAddListener(btnMarathon, 'click', async () => { mode = 'marathon'; qTotal = 9999; timePerQ = 12; await startGame(); });
  safeAddListener(btnSpeedrun, 'click', async () => { mode = 'speedrun'; qTotal = 9999; timePerQ = 90; await startGame(); });

  safeAddListener(btnSkip, 'click', () => {
    if (!allowAnswer) return;
    score = Math.max(0, score - 5);
    safeText(elScore, score);
    nextQuestion();
  });

  safeAddListener(btnQuit, 'click', () => endGame());
  safeAddListener(btnRetry, 'click', async () => { await startGame(); });
  safeAddListener(btnHome, 'click', () => show(scrStart));

  // Choice click handling (delegation) + keyboard
  if (elChoices) {
    elChoices.addEventListener('click', (e) => {
      const li = e.target.closest('.choice');
      if (!li || !allowAnswer) return;
      checkAnswer(li.dataset.key);
    });
    elChoices.addEventListener('keydown', (e) => {
      const li = e.target.closest('.choice');
      if (!li) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!allowAnswer) return;
        checkAnswer(li.dataset.key);
      }
    });
  }

  async function startGame() {
    topic = selTopic?.value || 'all';
    difficulty = selDiff?.value || 'easy';
    resetCore();
    show(scrGame);
    safeText(elBadgeTopic, topic);
    safeText(elBadgeDiff, difficulty);

    // โหลดคำถามจาก API (และ normalize ให้เป็น options[])
    questions = await fetchQuestions({ topic, difficulty, limit: 60 });
    if (!questions || !questions.length) {
      safeText(elQuestion, 'ไม่พบคำถาม');
      // กลับหน้าเริ่มหรือแสดง msg ตามต้องการ
      return;
    }
    startedAt = performance.now();
    if (mode === 'speedrun') { timeLeft = 90; } else { timeLeft = timePerQ; }
    // sync to ms
    window.gameState.remainingMs = Math.round(timeLeft * 1000);
    renderQuestion();
    runTimer();
  }

  // fetch + normalize
  async function fetchQuestions({ topic = 'all', difficulty = 'easy', limit = 50 }) {
    const url = `api/questions.php?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}&limit=${limit}`;
    try {
      const res = await fetch(url);
      if (!res.ok) { console.warn('fetchQuestions res not ok', res.status); return []; }
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      const normalized = data.map(row => {
        // support both shapes if already has options[]
        if (Array.isArray(row.options) && row.options.length) {
          return {
            ...row,
            answer: (row.answer || '').toString().trim().toUpperCase()
          };
        }
        return {
          ...row,
          options: [
            { key: 'A', text: row.option_a ?? row.optionA ?? '' },
            { key: 'B', text: row.option_b ?? row.optionB ?? '' },
            { key: 'C', text: row.option_c ?? row.optionC ?? '' },
            { key: 'D', text: row.option_d ?? row.optionD ?? '' },
          ],
          answer: (row.answer || '').toString().trim().toUpperCase()
        };
      });
      shuffle(normalized);
      return normalized;
    } catch (err) {
      console.error('fetchQuestions error', err);
      return [];
    }
  }

  function renderQuestion() {
    allowAnswer = true;
    if (!questions || !questions.length) { endGame(); return; }
    if (qIndex >= qTotal || (mode === 'speedrun' && timeLeft <= 0)) { endGame(); return; }
    const q = questions[qIndex % questions.length];
    safeText(elQnum, (qIndex + 1).toString());
    safeText(elQuestion, q.question || '---');
    safeText(elBadgeTopic, q.topic || topic);
    safeText(elBadgeDiff, q.difficulty || difficulty);
    if (elChoices) elChoices.innerHTML = '';
    const opts = Array.isArray(q.options) ? [...q.options] : [];
    shuffle(opts);
    for (const opt of opts) {
      if (!elChoices) continue;
      const li = document.createElement('li');
      li.className = 'choice';
      li.tabIndex = 0;
      li.setAttribute('role', 'option');
      li.dataset.key = String(opt.key || '').toUpperCase();
      li.innerHTML = `<span class="choice__key">${li.dataset.key}</span> <span class="choice__text">${opt.text || ''}</span>`;
      elChoices.appendChild(li);
    }
    // reset timebar accent each question
    if (elTimeBar) elTimeBar.style.removeProperty('--accent');
    if (mode !== 'speedrun') { timeLeft = timePerQ; }
    // sync to ms
    window.gameState.remainingMs = Math.round(timeLeft * 1000);
    updateTimebar();
  }

  function runTimer() {
    // stop old interval if any, then start unified timer
    stopTimer();
    // sync legacy seconds -> ms if needed
    window.gameState.remainingMs = (typeof timeLeft === 'number' && timeLeft >= 0)
      ? Math.round(timeLeft * 1000)
      : window.gameState.remainingMs;
    startTimer(window.gameState.remainingMs);
  }

  function updateTimebar() {
    // read remainingMs (ms) and show seconds
    const remMs = (window.gameState && typeof window.gameState.remainingMs === 'number')
      ? window.gameState.remainingMs
      : (timeLeft * 1000);
    const secs = Math.max(0, Math.ceil(remMs / 1000));
    safeText(elTime, format(secs));
    if (elTimeBar) {
      const denom = (mode === 'speedrun' ? 90 : timePerQ) || 1;
      elTimeBar.value = Math.max(0, Math.min(100, ((remMs / 1000) / denom) * 100));
      if ((remMs / 1000) <= 4) elTimeBar.style.setProperty('--accent', '#ff6b6b');
    }
  }

  function checkAnswer(selectedKey) {
    const q = currentQ();
    if (!q) return;
    const isCorrect = (String(selectedKey).toUpperCase() === String(q.answer).toUpperCase());
    allowAnswer = false;
    markSelected(selectedKey, isCorrect);
    if (isCorrect) {
      combo += 1; maxCombo = Math.max(maxCombo, combo);
      const gain = 10 + Math.floor(combo * 1.5);
      score += gain;
      safeText(elScore, score);
      safeText(elCombo, combo);
      if (mode === 'speedrun') { timeLeft = Math.min(90, timeLeft + 1); } else { timeLeft += 3; }
      // sync to ms so unified timer reflects new time immediately
      window.gameState.remainingMs = Math.round(timeLeft * 1000);
      // update UI bar/text now
      updateTimebar();
      try { if (sCorrect) { sCorrect.currentTime = 0; /* sCorrect.play(); */ } } catch (e) { }
    } else {
      combo = 0; safeText(elCombo, combo);
      score = Math.max(0, score - 2);
      safeText(elScore, score);
      try { if (sWrong) { sWrong.currentTime = 0; /* sWrong.play(); */ } } catch (e) { }
    }
    setTimeout(nextQuestion, 600);
  }

  function markSelected(key, isCorrect) {
    $$('.choice').forEach(li => {
      if (li.dataset.key === String(key).toUpperCase()) {
        li.classList.add(isCorrect ? 'correct' : 'wrong');
      }
      const ans = currentQ()?.answer;
      if (ans && li.dataset.key === String(ans).toUpperCase()) {
        li.classList.add('correct');
      }
    });
  }
  function markAll() {
    $$('.choice').forEach(li => {
      const isAns = (li.dataset.key === String(currentQ()?.answer || '').toUpperCase());
      li.classList.add(isAns ? 'correct' : 'wrong');
    });
  }
  function currentQ() { return (questions && questions.length) ? questions[qIndex % questions.length] : null; }

  function nextQuestion() {
    qIndex += 1;
    if (mode === 'solo' && qIndex >= qTotal) { endGame(); return; }
    renderQuestion();
  }

  function endGame() {
    stopTimer();
    // cancel canvas RAF if running
    if (starsRAF) { cancelAnimationFrame(starsRAF); starsRAF = null; }
    show(scrEnd);
    safeText(elFScore, String(score));
    safeText(elFMaxCombo, String(maxCombo));
    const elapsed = Math.round((performance.now() - startedAt) / 1000);
    safeText(elFTime, String(elapsed));
    try { if (sEnd) { sEnd.currentTime = 0; /* sEnd.play(); */ } } catch (e) { }
  }

  safeAddListener(btnSave, 'click', async () => {
    const nameRaw = (elNickname?.value || '').trim().slice(0, 16);
    const nickname = nameRaw === '' ? '' : nameRaw; // ไม่ตั้ง 'Guest' ที่ client

    // disable button และโชว์สถานะ
    btnSave.disabled = true;
    const prevText = btnSave.textContent;
    btnSave.textContent = 'กำลังบันทึก...';

    const payload = { nickname, score, mode, topic, difficulty };

    try {
      const res = await fetch('api/submit_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          alert('กรุณาเข้าสู่ระบบก่อนบันทึกคะแนน');
          // ถ้าต้องการ redirect ไปหน้า login:
          // window.location.href = '/login.php';
        } else {
          alert('บันทึกคะแนนไม่สำเร็จ: ' + (data.message || data.error || JSON.stringify(data)));
        }
        return;
      }

      // สำเร็จ: อัปเดต UI
      alert('บันทึกคะแนนเรียบร้อยแล้ว');
      // เก็บชื่อนี้ไว้ใน localStorage (optional)
      if (nickname) localStorage.setItem('quiz_nickname', nickname);
      // รีเฟรช leaderboard ให้เห็นผลทันที
      await refreshLeaderboard();

    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดเชื่อมต่อ: ' + err.message);
    } finally {
      // กลับสถานะปุ่ม
      btnSave.disabled = false;
      btnSave.textContent = prevText;
    }
  });

  async function refreshLeaderboard() {
    try {
      const res = await fetch('api/get_leaderboard.php?_=' + Date.now());
      if (!res.ok) {
        console.warn('refreshLeaderboard failed', res.status);
        return;
      }

      const payload = await res.json();
      console.log('LB payload =>', payload); // ลบออกเมื่อเรียบร้อย

      // รองรับทั้งกรณี API คืน array ตรง ๆ หรือ object ที่มี rows
      const data = Array.isArray(payload) ? payload : (payload.rows || payload.raw_json_for_frontend || []);

      const tb = document.querySelector('#tbl-leaderboard tbody');
      if (!tb) {
        console.error('Table body #tbl-leaderboard tbody not found');
        return;
      }

      tb.innerHTML = ''; // ล้างก่อน

      if (data.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" style="text-align:center">ไม่มีอันดับในขณะนี้</td>';
        tb.appendChild(tr);
        return;
      }

      data.forEach((row, i) => {
        const tr = document.createElement('tr');

        // ปรับการแมปฟิลด์ให้ตรงกับ API ของคุณ
        const name = row.nickname ?? row.name ?? row.user_name ?? 'Unknown';
        const score = row.score ?? '0';
        const correct = row.correct_answers ?? row.correct ?? '';
        const mode = row.mode ?? '';       // ถ้าคุณมีคอลัมน์ mode ให้เปลี่ยนได้
        const topic = row.topic ?? '';     // ถ้าคุณมีคอลัมน์ topic ให้เปลี่ยนได้
        const created = row.date ?? row.created_at ?? '';

        tr.innerHTML = `<td>${i + 1}</td>
                      <td>${escapeHtml(name)}</td>
                      <td>${escapeHtml(String(score))}${correct ? ` (${escapeHtml(String(correct))} ข้อ)` : ''}</td>
                      <td>${escapeHtml(mode)}</td>
                      <td>${escapeHtml(topic)}</td>
                      <td>${escapeHtml(created)}</td>`;
        tb.appendChild(tr);
      });

    } catch (e) {
      console.error('refreshLeaderboard', e);
    }
  }

  // ฟังก์ชันเล็กๆ ป้องกัน XSS เมื่อใส่ค่าใน innerHTML
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
})(); // end IIFE

// Hamburger toggle — ใส่ไว้ใน game.js (หรือไฟล์สคริปต์หลัก) หลังจาก DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function () {
  try {
    const hamburgerBtn = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.top-nav');

    // ถ้าไม่มี element ใดตัวใด ให้หยุดทำงาน
    if (!hamburgerBtn || !navMenu) {
      // console.debug('Hamburger or top-nav not found');
      return;
    }

    // เริ่มต้น aria
    hamburgerBtn.setAttribute('aria-expanded', 'false');

    // ปุ่มคลิกเพื่อ toggle เมนู
    hamburgerBtn.addEventListener('click', function (e) {
      const isOpen = navMenu.classList.toggle('active');
      hamburgerBtn.classList.toggle('active');

      // อัปเดต aria attribute
      hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      // ปิด dialog / overlays ถ้ามี (ถ้าคุณมีระบบ dialog ให้ใส่โค้ดปิดที่นี่)
      // ex: document.querySelector('#someDialog')?.close?.();
    });

    // ปิดเมนูเมื่อคลิกรายนอก (optional)
    document.addEventListener('click', function (ev) {
      if (!isMobileViewport()) return; // ตรวจสอบเฉพาะมือถือ
      const target = ev.target;
      if (!navMenu.contains(target) && !hamburgerBtn.contains(target) && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      }
    });

    function isMobileViewport() {
      return window.matchMedia && window.matchMedia('(max-width: 640px)').matches;
    }
  } catch (err) {
    console.error('Hamburger init error:', err);
  }
});
