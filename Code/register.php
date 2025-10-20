<?php
// register.php (mysqli version) - ใช้เมื่อ db.php สร้าง $conn เป็น mysqli object
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include __DIR__ . '/db.php'; // FIX: ใช้ __DIR__ เพื่อให้ path แน่นอน

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name     = trim($_POST["Username"] ?? '');
    $email    = trim($_POST["EMAIL"] ?? '');
    $password = $_POST["Password"] ?? '';
    $confirm  = $_POST["confirm_password"] ?? '';

    if ($password !== $confirm) {
        echo "<script>
                alert('❌ รหัสผ่านไม่ตรงกัน!');
                setTimeout(() => { window.location.href = 'sign.html'; }, 1000);
              </script>";
        exit;
    }

    // ตรวจว่ามีการเชื่อมต่อ mysqli หรือไม่
    if (!isset($conn) || !($conn instanceof mysqli)) {
        error_log('No mysqli $conn available in register.php');
        die('Internal server error');
    }

    // ตรวจชื่อซ้ำ
    $checkName = $conn->prepare("SELECT id FROM users WHERE name = ?");
    if (!$checkName) {
        error_log('Prepare failed (checkName): ' . $conn->error);
        die('Internal server error');
    }
    $checkName->bind_param("s", $name);
    $checkName->execute();
    $checkName->store_result();
    if ($checkName->num_rows > 0) {
        $checkName->close();
        echo "<script>
                alert('❌ ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว');
                setTimeout(() => { window.location.href = 'sign.html'; }, 1000);
              </script>";
        exit;
    }
    $checkName->close();

    // ตรวจ email ซ้ำ
    $checkEmail = $conn->prepare("SELECT id FROM users WHERE email = ?");
    if (!$checkEmail) {
        error_log('Prepare failed (checkEmail): ' . $conn->error);
        die('Internal server error');
    }
    $checkEmail->bind_param("s", $email);
    $checkEmail->execute();
    $checkEmail->store_result();
    if ($checkEmail->num_rows > 0) {
        $checkEmail->close();
        echo "<script>
                alert('❌ Email นี้ถูกใช้งานไปแล้ว');
                setTimeout(() => { window.location.href = 'sign.html'; }, 1000);
              </script>";
        exit;
    }
    $checkEmail->close();

    // เข้ารหัสรหัสผ่าน
    $hashed = password_hash($password, PASSWORD_DEFAULT);

    // เพิ่มผู้ใช้ใหม่
    $stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    if (!$stmt) {
        error_log('Prepare failed (insert): ' . $conn->error);
        die('Internal server error');
    }
    $stmt->bind_param("sss", $name, $email, $hashed);

    if ($stmt->execute()) {
        $stmt->close();
        header("Location: index.html");
        exit;
    } else {
        error_log('Register insert failed: ' . $stmt->error);
        $stmt->close();
        echo "<script>
                alert('❌ เกิดข้อผิดพลาดในการลงทะเบียน!');
                setTimeout(() => { window.location.href = 'sign.html'; }, 1000);
              </script>";
    }
}
?>
