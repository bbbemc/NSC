<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include __DIR__ . '/db.php';
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

    if (!isset($conn) || !($conn instanceof mysqli)) {
        error_log('No mysqli $conn available in register.php');
        die('Internal server error');
    }

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
    $hashed = password_hash($password, PASSWORD_DEFAULT);
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
