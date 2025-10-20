<?php
session_start();

// ล้างตัวแปร session
$_SESSION = [];

// ลบ cookie ของ session ถ้ามี
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// ทำลาย session
session_destroy();

// กลับไปหน้า login หรือหน้าแรก
header("Location: index.html");
exit;
?>
