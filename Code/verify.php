<?php
require 'db.php';

// รับค่าจากลิงก์ยืนยัน
$email = $_GET['email'] ?? '';
$token = $_GET['verify_token'] ?? '';

// ตรวจสอบข้อมูลในฐานข้อมูล
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND verify_token = ? AND verified = 0");
$stmt->execute([$email, $token]);

if ($stmt->rowCount() === 1) {
    // อัปเดตสถานะยืนยันและลบ token
    $stmt = $pdo->prepare("UPDATE users SET verified = 1, verify_token = NULL WHERE email = ?");
    $stmt->execute([$email]);
    header("Location: index.html?msg=" . urlencode("Email verified. You can now login."));
    exit();
} else {
    echo "<h2>Invalid or expired verification link.</h2>";
}
?>