function goBack() {
    window.location.href = "index.html";
  }

connectBtn.onclick = function () {
    if (selectedAction === "cheapter1") {
        window.location.href = "chepter1.html";
    } else {
        alert("กรุณากรอกข้อมูลให้ครบก่อนนะครับ 🙂");
    }
};
