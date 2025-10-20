// =========================================
//         Core Utilities
// =========================================
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

// Function to switch between pages
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const currentPage = document.getElementById(pageId);
    currentPage.classList.add('active');

    // Set body class for correct background/colors and overflow
    document.body.className = (pageId === 'page-ch2') ? '' : 'page-ch3';
    document.body.style.overflowY = 'auto'; // Re-enable scroll bar

    // Re-initialize logic for the new page
    if (pageId === 'page-ch2') {
        resetAll(); // Reset CH2 animation state
        setActiveBond('ionic');
    } else if (pageId === 'page-ch3') {
        lewisTutorial._buildAtoms();
        setTimeout(() => lewisTutorial.play(true), 400);
        lewisBuildGame(lewisMoleculeSelect.value); // Pre-build game UI
    }
}

document.getElementById('nextPageBtn').addEventListener('click', () => {
    showPage('page-ch3');
});

document.getElementById('backBtn').addEventListener('click', () => {
    showPage('page-ch2');
});


// =========================================
//         CH2 Original Code
// =========================================
const bondButtons = document.querySelectorAll('.bond-btn');
const desc = document.getElementById('desc');
const info = document.getElementById('info');
const scene = document.getElementById('scene-ch2');
const playBtn = document.getElementById('playBtn');
const stepBtn = document.getElementById('stepBtn');
const resetBtn = document.getElementById('resetBtn');

let current = 'ionic';
let step = 0;
let animationInterval = null;
let playing = false;

function setActiveBond(b) {
    current = b;
    // แสดง/ซ่อนกลุ่มอะตอม
    document.querySelectorAll('.atom-group').forEach(g => g.style.display = 'none');
    const g = document.getElementById(b);
    if (g) g.style.display = '';

    // แสดงคำอธิบายทันทีเมื่อเลือกพันธะ
    const texts = {
        ionic: 'พันธะไอออนิก — อิเล็กตรอนย้ายจากโลหะไปหาอโลหะ ทำให้เกิดประจุบวกและลบ จากนั้นไอออนต่างประจุจะดึงดูดกัน',
        covalent: 'พันธะโควาเลนต์ — อิเล็กตรอนถูกแชร์ระหว่างอะตอม สร้างคู่ร่วม (shared pair) ที่แข็งแรง',
        metallic: 'พันธะโลหะ — อะตอมโลหะปล่อยอิเล็กตรอนเป็นทะเลอิเล็กตรอนอิสระ ทำให้เกิดคุณสมบัติการนำไฟฟ้าและความยืดหยุ่น',
        hydrogen: 'พันธะไฮโดรเจน — พันธะอ่อนที่เกิดระหว่างไฮโดรเจนที่ผูกกับอะตอมที่มีค่าอิเล็กโตรเนกาติวิตีสูง (เช่น O, N) กับอะตอมอีกตัวหนึ่ง'
    };
    desc.textContent = texts[b] || '';

    // จัดการสถานะของปุ่ม
    bondButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.bond === b));

    resetAll();
}

// Play / step logic (แยกเป็นฟังก์ชันเพื่อเรียกได้ทั้งจากปุ่มหรือคีย์บอร์ด)
function togglePlay() {
    playing = !playing;
    if (playBtn) playBtn.textContent = playing ? 'หยุด' : 'เล่น';
    if (playing) {
        info.textContent = 'กำลังเล่น...';
        intervalId = setInterval(() => advanceStep(), 1400);
    } else {
        info.textContent = 'หยุดชั่วคราว';
        clearInterval(intervalId);
        intervalId = null;
    }
}
function startPlay() {
    if (!playing) togglePlay();
}
function stopPlay() {
    if (playing) togglePlay();
}

if (playBtn) {
    playBtn.addEventListener('click', () => togglePlay());
}

stepBtn && stepBtn.addEventListener('click', () => advanceStep());
resetBtn && resetBtn.addEventListener('click', () => { resetAll(); info.textContent = 'รีเซ็ตแล้ว' });

function advanceStep() {
    step++;
    runStateFor(current, step);
}


function resetAll() {
    step = 0;
    // restore default positions/visibility
    // ionic reset
    const ionE = document.querySelector('#ion-e circle');
    if (ionE) { ionE.style.transform = 'translate(0px,0px)'; ionE.style.transition = ''; }
    const leftChargeEl = document.getElementById('ion-left-charge');
    const rightChargeEl = document.getElementById('ion-right-charge');
    if (leftChargeEl) leftChargeEl.textContent = '';
    if (rightChargeEl) rightChargeEl.textContent = '';

    // covalent reset
    const ov = document.querySelector('#covalent .overlap');
    if (ov) { ov.style.opacity = 0.08; ov.style.animation = 'none' }

    // metallic reset
    const metalElectrons = document.getElementById('metal-electrons');
    if (metalElectrons) metalElectrons.innerHTML = ''; // will be regenerated when metallic active

    // hydrogen reset
    const hline = document.getElementById('hbond-line');
    if (hline) { hline.style.stroke = '#bfdbfe'; hline.style.animation = 'none' }

    // stop any running animation timers
    stopMetalLoop();
    stopPlay();
}

function runStateFor(bond, s) {
    if (bond === 'ionic') runIonic(s);
    if (bond === 'covalent') runCovalent(s);
    if (bond === 'metallic') runMetallic(s);
    if (bond === 'hydrogen') runHydrogen(s);
}

// --- Ionic sequence ---
function runIonic(s) {
    const ionE = document.querySelector('#ion-e circle');
    const leftCharge = document.getElementById('ion-left-charge');
    const rightCharge = document.getElementById('ion-right-charge');
    if (s === 1) {
        info.textContent = 'จาก Na มีอิเล็กตรอนวงนอก 1 ตัว ได้ขยับไปหา Cl กลายเป็น Na⁺, Cl⁻ จึงเกิดแรงดึงดูดไฟฟ้าสถิตระหว่างประจุตรงข้าม';
        // highlight electron near Na
        if (ionE) {
            ionE.style.transition = 'transform 1s ease-in-out';
            ionE.style.transform = 'translate(0px,0px)';
        }
    }
    if (s === 2) {
        info.textContent = 'จาก Na มีอิเล็กตรอนวงนอก 1 ตัว ได้ขยับไปหา Cl กลายเป็น Na⁺, Cl⁻ จึงเกิดแรงดึงดูดไฟฟ้าสถิตระหว่างประจุตรงข้าม';
        const from = { x: 240, y: 280 };
        const to = { x: 640, y: 280 };
        const dx = to.x - from.x + 35;
        const dy = to.y - from.y;
        if (ionE) ionE.style.transform = `translate(${dx}px, ${dy}px)`;
        setTimeout(() => {
            if (leftCharge) leftCharge.textContent = '';
            if (rightCharge) rightCharge.textContent = '';
        }, 900);
    }
    if (s >= 2.1) {
        info.textContent = 'จาก Na มีอิเล็กตรอนวงนอก 1 ตัว ได้ขยับไปหา Cl กลายเป็น Na⁺, Cl⁻ จึงเกิดแรงดึงดูดไฟฟ้าสถิตระหว่างประจุตรงข้าม';
    }
    if (s > 2.2) { step = 0; }
}

// --- Covalent ---
function runCovalent(s) {
    if (s === 1) { info.textContent = 'การแชร์อิเล็กตรอนร่วมกัน -> วงโคจรที่ซ้อนทับ ทำให้มักมีพลังงานพันธะสูงและมีความเสถียร'; }
    if (s === 2) { info.textContent = 'การแชร์อิเล็กตรอนร่วมกัน -> วงโคจรที่ซ้อนทับ ทำให้มักมีพลังงานพันธะสูงและมีความเสถียร'; }
    if (s >= 2.1) { info.textContent = 'การแชร์อิเล็กตรอนร่วมกัน -> วงโคจรที่ซ้อนทับ ทำให้มักมีพลังงานพันธะสูงและมีความเสถียร'; }
    if (s > 2.2) { step = 0; }
}

// --- Metallic ---
let metalLoopId = null;
function runMetallic(s) {
    const lattice = document.getElementById('metal-lattice');
    const layer = document.getElementById('metal-electrons');
    if (s === 1) {
        info.textContent = 'อิเล็กตรอนวิ่งอย่างอิสระ เปรียบเสมือน"ทะเลอิเล็กตรอน" -> ทำให้โลหะนำไฟฟ้าได้';
        // build lattice and electrons
        if (lattice) lattice.innerHTML = '';
        const rows = 5, cols = 6, gap = 120;
        if (lattice) {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cx = c * gap + 60;
                    const cy = r * gap + 60;
                    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                    circle.setAttribute('cx', cx);
                    circle.setAttribute('cy', cy);
                    circle.setAttribute('r', 14);
                    circle.setAttribute('fill', '#fde68a');
                    circle.setAttribute('stroke', 'rgba(0,0,0,0.15)');
                    lattice.appendChild(circle);
                }
            }
        }
        // electrons
        if (layer) layer.innerHTML = '';
        if (layer) {
            for (let i = 0; i < 24; i++) {
                const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                el.setAttribute('r', 6);
                el.setAttribute('class', 'electron');
                const x = 60 + Math.random() * 600;
                const y = 32 + Math.random() * 360;
                el.setAttribute('cx', x);
                el.setAttribute('cy', y);
                layer.appendChild(el);
            }
        }
        startMetalLoop();
    }
    if (s >= 2) { info.textContent = 'อิเล็กตรอนวิ่งอย่างอิสระ เปรียบเสมือน"ทะเลอิเล็กตรอน" -> ทำให้โลหะนำไฟฟ้าได้'; }
    if (s > 2.1) { step = 0; }
}

function startMetalLoop() {
    stopMetalLoop();
    const layer = document.getElementById('metal-electrons');
    function tick() {
        if (!layer) return;
        const nodes = layer.querySelectorAll('circle');
        nodes.forEach(n => {
            let cx = parseFloat(n.getAttribute('cx'));
            let cy = parseFloat(n.getAttribute('cy'));
            // ส่วนนี้คือสาเหตุของการสั่น
            cx += (Math.random() - 0.5) * 90;
            cy += (Math.random() - 0.5) * 90;
            cx = Math.max(120, Math.min(800, cx));
            cy = Math.max(80, Math.min(640, cy));
            n.setAttribute('cx', cx);
            n.setAttribute('cy', cy);
        });
        metalLoopId = requestAnimationFrame(tick);
    }
    metalLoopId = requestAnimationFrame(tick);
}
function stopMetalLoop() { if (metalLoopId) cancelAnimationFrame(metalLoopId); metalLoopId = null; }

// --- Hydrogen ---
function runHydrogen(s) {
    const hline = document.getElementById('hbond-line');
    if (s === 1) { info.textContent = 'แรงดึงดูดระหว่าง H มีประจุบวกบางส่วน เจอ O มีประจุลบบางส่วนของโมเลกุลอื่น มีความอ่อนกว่าพันธะโควาเลนต์และไม่ได้เกิดจากการแชร์อิเล็กตรอนโดยตรง'; if (hline) hline.style.animation = 'hPulse 1.6s infinite'; }
    if (s === 2) { info.textContent = 'แรงดึงดูดระหว่าง H มีประจุบวกบางส่วน เจอ O มีประจุลบบางส่วนของโมเลกุลอื่น มีความอ่อนกว่าพันธะโควาเลนต์และไม่ได้เกิดจากการแชร์อิเล็กตรอนโดยตรง'; }
    if (s > 2.2) { step = 0; }
}

// Event listeners สำหรับปุ่มเลือกพันธะแต่ละปุ่ม
document.querySelectorAll('.bond-btn').forEach(btn => btn.addEventListener('click', () => {
    setActiveBond(btn.dataset.bond);
    if (btn.dataset.bond === 'ionic') {
        setTimeout(() => { if (step === 0) { step = 0; runIonic(1); } }, 200);
    } else if (btn.dataset.bond === 'covalent') {
        setTimeout(() => { if (step === 0) { step = 0; runCovalent(1); } }, 200);
    } else if (btn.dataset.bond === 'metallic') {
        setTimeout(() => { if (step === 0) { step = 0; runMetallic(1); } }, 200);
    } else if (btn.dataset.bond === 'hydrogen') {
        setTimeout(() => { if (step === 0) { step = 0; runHydrogen(1); } }, 200);
    }
}));


// accessibility: keyboard shortcuts
window.addEventListener('keydown', (e) => {
    // อย่ารบกวนการพิมพ์ใน input/textarea
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (e.key === '1') setActiveBond('ionic');
    if (e.key === '2') setActiveBond('covalent');
    if (e.key === '3') setActiveBond('metallic');
    if (e.key === '4') setActiveBond('hydrogen');
    if (e.key === ' ') { e.preventDefault(); togglePlay(); } // เปลี่ยนจาก playBtn.click() เป็น togglePlay()
    if (e.key === 'ArrowRight') stepBtn && stepBtn.click();
});

// Initial setup for CH2 page on load
setActiveBond('ionic');

// =========================================
//         CH3 Original Code (renamed)
// =========================================
const $lewis = (sel, root = document) => root.querySelector(sel);
const $$lewis = (sel, root = document) => [...root.querySelectorAll(sel)];
const lewisSleep = (ms) => new Promise(r => setTimeout(r, ms));
const lewisClamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lewisToast = (msg, ms = 1600) => { const t = $lewis('#lewisToast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(lewisToast._t); lewisToast._t = setTimeout(() => t.style.display = 'none', ms); };
function lewisSetLED(el, state) { el.classList.remove('ok', 'warn', 'bad'); if (state) el.classList.add(state) }
function lewisBurstConfetti() { const box = $lewis('#lewisConfetti'); box.innerHTML = ''; for (let i = 0; i < 32; i++) { const s = document.createElement('i'); s.style.left = (Math.random() * 100) + '%'; s.style.transform = `translateY(-10px) rotate(${Math.random() * 180}deg)`; s.style.animationDelay = (Math.random() * 300) + 'ms'; box.appendChild(s); } setTimeout(() => box.innerHTML = '', 1200); }
function lewisSvgEl(tag, attrs) { const el = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el }

const lewisScene = $lewis('#lewisScene');
const lewisHint = $lewis('#lewisHint');
const lewisStepName = $lewis('#lewisStepName');
const lewisLedStep = $lewis('#lewisLedStep');
const lewisLedVal = $lewis('#lewisLedVal');
const lewisLedOctet = $lewis('#lewisLedOctet');
const lewisValenceCount = $lewis('#lewisValenceCount');
const lewisOctetStatus = $lewis('#lewisOctetStatus');
const lewisGameSvg = $lewis('#lewisGameSvg');
const lewisGScene = $lewis('#lewisGScene');
const lewisMoleculeSelect = $lewis('#lewisMoleculeSelect');
const lewisUsedElec = $lewis('#lewisUsedElec');
const lewisTotalElec = $lewis('#lewisTotalElec');
const lewisLedGameOctet = $lewis('#lewisLedGameOctet');
const lewisNetCharge = $lewis('#lewisNetCharge');


const lewisSPEED = { slow: 20000, normal: 10000, fast: 5000 };
let lewisSpeed = lewisSPEED.normal;
let lewisTutorial = { i: 0, steps: [], playing: false };
let lewisCurrentGame = null;
let lewisScore = 0;

const lewisMOLECULES = {
    H2O: { atoms: [{ id: 'O', sym: 'O', x: 450, y: 180, r: 26 }, { id: 'H1', sym: 'H', x: 270, y: 180, r: 20 }, { id: 'H2', sym: 'H', x: 630, y: 180, r: 20 }], bonds: [['O', 'H1', 1], ['O', 'H2', 1]], charge: 0 },
    CO2: { atoms: [{ id: 'O1', sym: 'O', x: 280, y: 200 }, { id: 'C', sym: 'C', x: 450, y: 200 }, { id: 'O2', sym: 'O', x: 620, y: 200 }], bonds: [['C', 'O1', 2], ['C', 'O2', 2]], charge: 0 },
    NH3: { atoms: [{ id: 'N', sym: 'N', x: 450, y: 170 }, { id: 'H1', sym: 'H', x: 330, y: 250 }, { id: 'H2', sym: 'H', x: 450, y: 280 }, { id: 'H3', sym: 'H', x: 570, y: 250 }], bonds: [['N', 'H1', 1], ['N', 'H2', 1], ['N', 'H3', 1]], charge: 0 },
    CH4: { atoms: [{ id: 'C', sym: 'C', x: 450, y: 200 }, { id: 'H1', sym: 'H', x: 300, y: 160 }, { id: 'H2', sym: 'H', x: 600, y: 160 }, { id: 'H3', sym: 'H', x: 340, y: 280 }, { id: 'H4', sym: 'H', x: 560, y: 280 }], bonds: [['C', 'H1', 1], ['C', 'H2', 1], ['C', 'H3', 1], ['C', 'H4', 1]], charge: 0 },
    BF3: { atoms: [{ id: 'B', sym: 'B', x: 450, y: 180 }, { id: 'F1', sym: 'F', x: 290, y: 260 }, { id: 'F2', sym: 'F', x: 610, y: 260 }, { id: 'F3', sym: 'F', x: 450, y: 60 }], bonds: [['B', 'F1', 1], ['B', 'F2', 1], ['B', 'F3', 1]], charge: 0 },
};
const lewisVALENCE = { H: 1, C: 4, N: 5, O: 6, F: 7, B: 3, Cl: 7, Br: 7, I: 7, S: 6, P: 5 };
const lewisTARGET = { H: 2, B: 6 };

lewisTutorial.play = async function (restart = false) {
    if (restart) { this.i = 0; lewisScene.innerHTML = ''; this._buildAtoms(); }
    this.playing = true;
    while (this.i < this.steps.length && this.playing) { await this.steps[this.i++](); }
    this.playing = false; lewisBurstConfetti(); lewisHint.textContent = 'จบแล้ว! ลองกด ▶ เพื่อเล่นใหม่';
};

lewisTutorial.stop = function () { this.playing = false };
lewisTutorial.next = async function () { if (this.i < this.steps.length) { await this.steps[this.i++](); } };
lewisTutorial.prev = async function () { this.i = Math.max(0, this.i - 2); await this.next(); };
lewisTutorial._buildAtoms = function () {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'atomNode'); g.setAttribute('id', 'H2O'); lewisScene.appendChild(g);
    const nodes = [{ id: 'O', x: 450, y: 180, r: 26, label: 'O' }, { id: 'H1', x: 270, y: 180, r: 20, label: 'H' }, { id: 'H2', x: 630, y: 180, r: 20, label: 'H' }];
    nodes.forEach(n => {
        const gg = document.createElementNS('http://www.w3.org/2000/svg', 'g'); gg.setAttribute('id', n.id); gg.setAttribute('class', 'atomNode'); gg.setAttribute('transform', `translate(${n.x},${n.y})`);
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('class', 'nucleus'); c.setAttribute('r', n.r);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t.setAttribute('class', 'nucleusLabel'); t.setAttribute('text-anchor', 'middle'); t.setAttribute('dy', '.35em'); t.textContent = n.label;
        gg.appendChild(c); gg.appendChild(t); g.appendChild(gg);
    });

    const b1 = document.createElementNS('http://www.w3.org/2000/svg', 'line'); b1.setAttribute('id', 'b1'); b1.setAttribute('class', 'bond'); b1.setAttribute('x1', 300); b1.setAttribute('y1', 180); b1.setAttribute('x2', 420); b1.setAttribute('y2', 180); b1.style.strokeDasharray = '120'; b1.style.strokeDashoffset = '120'; lewisScene.appendChild(b1);
    const b2 = document.createElementNS('http://www.w3.org/2000/svg', 'line'); b2.setAttribute('id', 'b2'); b2.setAttribute('class', 'bond'); b2.setAttribute('x1', 480); b2.setAttribute('y1', 180); b2.setAttribute('x2', 600); b2.setAttribute('y2', 180); b2.style.strokeDasharray = '120'; b2.style.strokeDashoffset = '120'; lewisScene.appendChild(b2);

    const eg = document.createElementNS('http://www.w3.org/2000/svg', 'g'); eg.setAttribute('id', 'eg'); lewisScene.appendChild(eg);

    this.steps = [
        async () => {
            lewisStepName.textContent = 'นับเวเลนซ์'; lewisSetLED(lewisLedStep, 'ok');
            const total = 6 + 1 + 1; lewisValenceCount.textContent = total; lewisSetLED(lewisLedVal, 'ok');
            lewisHint.textContent = 'O มี 6e⁻, H มี 1e⁻ x2 รวม 8e⁻'; await lewisSleep(5000);
        },
        async () => {
            lewisStepName.textContent = 'สร้างพันธะเดี่ยว'; lewisSetLED(lewisLedStep, 'ok');
            await lewisAnimateBond('#b1'); await lewisAnimateBond('#b2');
            lewisHint.textContent = 'วางพันธะ O–H สองเส้น = ใช้ 4e⁻'; lewisValenceCount.textContent = 'เหลือ 4e⁻ สำหรับคู่โดดเดี่ยว'; await lewisSleep(5000);
        },
        async () => {
            lewisStepName.textContent = 'เติมคู่โดดเดี่ยวบน O'; lewisSetLED(lewisLedStep, 'ok');
            await lewisDropPair(450, 130); await lewisDropPair(450, 230);
            lewisHint.textContent = 'เติม 2 คู่อิเล็กตรอนบน O ครบอ็อกเตต'; lewisSetLED(lewisLedOctet, 'ok'); lewisOctetStatus.textContent = 'ครบ'; await lewisSleep(5000);
        },
        async () => {
            lewisStepName.textContent = 'ตรวจประจุฟอร์มัล'; lewisSetLED(lewisLedStep, 'ok');
            lewisHint.textContent = 'FC(O) = 6 − (4 + 2) = 0, FC(H)=0 → รวม 0'; await lewisSleep(5000);
        },
    ];
};

function lewisCreateElectron(x, y) { const e = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); e.setAttribute('r', 4); e.setAttribute('class', 'electron glow'); e.setAttribute('cx', x); e.setAttribute('cy', y); return e }
async function lewisDropPair(x, y) {
    const eg = $lewis('#eg'); const e1 = lewisCreateElectron(x - 8, y), e2 = lewisCreateElectron(x + 8, y); e1.style.opacity = 0; e2.style.opacity = 0; eg.appendChild(e1); eg.appendChild(e2);
    await lewisSleep(50); e1.animate([{ transform: 'translateY(-14px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 300, fill: 'forwards' });
    await lewisSleep(80); e2.animate([{ transform: 'translateY(-14px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 300, fill: 'forwards' });
    await lewisSleep(260);
}
async function lewisAnimateBond(sel) { const el = $lewis(sel); el.style.strokeDashoffset = '120'; el.animate([{ strokeDashoffset: 120 }, { strokeDashoffset: 0 }], { duration: 420, easing: 'ease-out', fill: 'forwards' }); await lewisSleep(420) }

// Game logic
const lewisBuildGame = (molKey) => {
    lewisGScene.innerHTML = '';
    const data = JSON.parse(JSON.stringify(lewisMOLECULES[molKey]));
    lewisCurrentGame = { atoms: {}, bonds: [], charge: data.charge };

    data.atoms.forEach(a => {
        lewisCurrentGame.atoms[a.id] = { id: a.id, sym: a.sym, x: a.x, y: a.y, lone: 0 };
        lewisDrawAtom(a);
    });
    data.bonds.forEach(b => lewisAddBond(b[0], b[1], b[2]));
    lewisUpdateStats();
};

function lewisDrawAtom(a) {
    const g = lewisSvgEl('g', { transform: `translate(${a.x},${a.y})`, id: 'A_' + a.id });
    const c = lewisSvgEl('circle', { r: 24, class: 'nucleus' });
    const t = lewisSvgEl('text', { class: 'nucleusLabel', 'text-anchor': 'middle', dy: '.35em' }); t.textContent = a.sym;
    const plus = lewisSvgEl('foreignObject', { x: -42, y: -42, width: 36, height: 24 });
    plus.innerHTML = `<button xmlns="http://www.w3.org/1999/xhtml" class="sbtn" style="padding:4px 8px; font-weight:700">+ คู่</button>`;
    plus.firstChild.addEventListener('click', () => { lewisCurrentGame.atoms[a.id].lone = lewisClamp(lewisCurrentGame.atoms[a.id].lone + 1, 0, 4); lewisUpdateStats(); lewisDrawLone(a.id); });
    const minus = lewisSvgEl('foreignObject', { x: -42, y: -16, width: 36, height: 24 });
    minus.innerHTML = `<button xmlns="http://www.w3.org/1999/xhtml" class="sbtn" style="padding:4px 8px; font-weight:700">− คู่</button>`;
    minus.firstChild.addEventListener('click', () => { lewisCurrentGame.atoms[a.id].lone = lewisClamp(lewisCurrentGame.atoms[a.id].lone - 1, 0, 4); lewisUpdateStats(); lewisDrawLone(a.id); });

    g.appendChild(c); g.appendChild(t); g.appendChild(plus); g.appendChild(minus);
    g.appendChild(lewisSvgEl('g', { id: 'L_' + a.id }));
    lewisGScene.appendChild(g);
}

function lewisDrawLone(atomId) {
    const container = $lewis(`#L_${atomId}`, lewisGScene); container.innerHTML = '';
    const a = lewisCurrentGame.atoms[atomId];
    const r = 34;
    const positions = [[-r, 0], [r, 0], [0, -r], [0, r]];
    for (let i = 0; i < a.lone; i++) {
        const [dx, dy] = positions[i % positions.length];
        const g = lewisSvgEl('g', { transform: `translate(${dx},${dy})` });
        g.appendChild(lewisSvgEl('circle', { r: 4, class: 'electron glow', cx: -8, cy: 0 }));
        g.appendChild(lewisSvgEl('circle', { r: 4, class: 'electron glow', cx: 8, cy: 0 }));
        container.appendChild(g);
    }
}

function lewisAddBond(aId, bId, order = 1) {
    const a = lewisCurrentGame.atoms[aId], b = lewisCurrentGame.atoms[bId];
    const bond = { a: aId, b: bId, order: order };
    lewisCurrentGame.bonds.push(bond);
    const id = `B_${aId}_${bId}`;
    const line = lewisSvgEl('line', { id, class: 'bond', x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    line.addEventListener('click', () => {
        bond.order = bond.order === 1 ? 2 : (bond.order === 2 ? 3 : 1);
        lewisUpdateBondVisual(line, bond.order); lewisUpdateStats();
    });
    lewisGScene.appendChild(line);
    lewisUpdateBondVisual(line, order);
}

function lewisUpdateBondVisual(line, order) {
    line.setAttribute('stroke-width', order === 1 ? 3 : (order === 2 ? 6 : 9));
    line.setAttribute('stroke', order === 1 ? '#bfe8ff' : (order === 2 ? '#86c8ff' : '#68f1c8'));
}

function lewisElectronCount() {
    const bondElec = lewisCurrentGame.bonds.reduce((s, b) => s + 2 * b.order, 0);
    const loneElec = Object.values(lewisCurrentGame.atoms).reduce((s, a) => s + 2 * a.lone, 0);
    return { bondElec, loneElec, total: bondElec + loneElec };
}

function lewisValenceTotal() {
    let sum = 0;
    for (const a of Object.values(lewisCurrentGame.atoms)) sum += (lewisVALENCE[a.sym] || 0);
    sum += lewisCurrentGame.charge;
    return sum;
}

function lewisOctetCheck() {
    let ok = true;
    for (const a of Object.values(lewisCurrentGame.atoms)) {
        let bonded = 0; lewisCurrentGame.bonds.forEach(b => { if (b.a === a.id || b.b === a.id) bonded += b.order; });
        const electrons = (a.lone * 2) + bonded * 2;
        const target = lewisTARGET[a.sym] || 8;
        const pass = (a.sym === 'H') ? electrons === 2 : (a.sym === 'B' ? electrons >= 6 : electrons >= 8);
        if (!pass) ok = false;
    }
    return { ok };
}

function lewisFormalCharges() {
    let sum = 0;
    for (const a of Object.values(lewisCurrentGame.atoms)) {
        let bonded = 0; lewisCurrentGame.bonds.forEach(b => { if (b.a === a.id || b.b === a.id) bonded += b.order; });
        const nonbond = a.lone * 2; const halfBond = bonded;
        const val = lewisVALENCE[a.sym] || 0; const fc = val - (nonbond + halfBond);
        sum += fc;
    }
    return { sum };
}

function lewisUpdateStats() {
    const vt = lewisValenceTotal(); lewisTotalElec.textContent = vt;
    const { total } = lewisElectronCount(); lewisUsedElec.textContent = total;
    const { ok } = lewisOctetCheck(); lewisSetLED(lewisLedGameOctet, ok ? 'ok' : (total > vt ? 'bad' : 'warn'));
    const fc = lewisFormalCharges(); lewisNetCharge.textContent = fc.sum;
    for (const id in lewisCurrentGame.atoms) lewisDrawLone(id);
}

// CH3 event listeners (using new names)
$$lewis('.tabBtn').forEach(btn => btn.addEventListener('click', () => {
    $$lewis('.tabBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const t = btn.dataset.tab;
    ['tutorial', 'game', 'about'].forEach(k => $lewis(`#pane-${k}`).style.display = (k === t ? 'block' : 'none'));
    if (t === 'game') {
        lewisBuildGame(lewisMoleculeSelect.value);
    }
}));

// $lewis('#lewisBtnSlow').onclick = () => lewisSpeed.normal = 10000;
// $lewis('#lewisBtnFast').onclick = () => lewisSpeed.normal = 10000;
$lewis('#lewisBtnPrev').onclick = () => lewisTutorial.prev();
$lewis('#lewisBtnNext').onclick = () => lewisTutorial.next();
$lewis('#lewisPlayBtn').onclick = () => lewisTutorial.play(true);

$lewis('#lewisBtnCheck').onclick = () => {
    const vt = lewisValenceTotal(); const { total } = lewisElectronCount(); const { ok } = lewisOctetCheck(); const fc = lewisFormalCharges();
    if (total !== vt) { lewisToast(total > vt ? 'ใช้เกินจำนวนเวเลนซ์รวม!' : 'ยังใช้ไม่ครบเวเลนซ์รวม'); return }
    if (!ok) { lewisToast('ยังมีอ็อกเตตไม่ครบ บางอะตอมยังขาด'); return }
    if (fc.sum !== 0) { lewisToast('ประจุรวมไม่เป็นศูนย์ (ลองปรับพันธะ/คู่โดดเดี่ยว)'); return }
    lewisScore += 10; $lewis('#lewisScore').textContent = lewisScore; lewisToast('เยี่ยม! โครงสร้างถูกต้อง ✔'); lewisBurstConfetti();
};

$lewis('#lewisBtnHint').onclick = () => {
    const key = lewisMoleculeSelect.value; let tip = 'ลองปรับพันธะหรือคู่โดดเดี่ยวรอบอะตอมกลาง';
    if (key === 'H2O') tip = 'O ต้องมี 2 คู่โดดเดี่ยว และพันธะ O–H 2 เส้น';
    if (key === 'CO2') tip = 'C ควรเป็น O=C=O (คู่ซ้าย 1, คู่ขวา 1) โดยรวมไม่มีคู่โดดเดี่ยวบน C';
    if (key === 'NH3') tip = 'N มี 1 คู่โดดเดี่ยว และพันธะ N–H 3 เส้น';
    if (key === 'CH4') tip = 'C มีพันธะเดี่ยวกับ H 4 เส้น โดยไม่มีคู่โดดเดี่ยว';
    if (key === 'BF3') tip = 'B ยอมอ็อกเตตต่ำ: พันธะเดี่ยว 3 เส้น รอบ B รวม 6e⁻ ก็โอเค';
    lewisToast('Hint: ' + tip, 2600);
};

$lewis('#lewisBtnResetGame').onclick = () => lewisBuildGame(lewisMoleculeSelect.value);
lewisMoleculeSelect.addEventListener('change', () => lewisBuildGame(lewisMoleculeSelect.value));

// Initial setup for CH2 page on load
setActiveBond('ionic');
