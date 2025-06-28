// สถานะการคลิก
let selectedChepter = null;

function handleChepterClick(chepterId, redirectUrl) {
    const element = document.getElementById(chepterId);
    element.addEventListener("click", function () {
        if (selectedChepter === chepterId) {
            // ถ้าคลิกซ้ำ ไปยังหน้าที่ต้องการ
            window.location.href = redirectUrl;
        } else {
            // ตั้งให้ active แค่ตัวเดียว
            document.querySelectorAll('.chepter-btn').forEach(btn => btn.classList.remove('active'));
            element.classList.add("active");
            selectedChepter = chepterId;
        }
    });
}

// เชื่อมโยงแต่ละ chepter กับหน้าปลายทาง
handleChepterClick("chepter1", "chapter1.html");
handleChepterClick("chepter2", "chapter2.html");
handleChepterClick("chepter3", "chapter3.html");


let logoutSelected = false;

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {
    if (logoutSelected) {
        // ครั้งที่ 2 → logout จริง
        window.location.href = "login.html"; // หรือทำ session clear
    } else {
        // ครั้งแรก → เปลี่ยนสถานะ
        logoutSelected = true;
        logoutBtn.classList.add("active");

        // ตั้ง timeout ย้อนสถานะกลับ ถ้าไม่คลิกซ้ำภายใน 5 วินาที
        setTimeout(() => {
            logoutSelected = false;
            logoutBtn.classList.remove("active");
        }, 5000);
    }
});