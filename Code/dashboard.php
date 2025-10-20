<?php
session_start();
include 'db.php';

// ถ้าไม่ได้ login ให้เด้งกลับหน้า login
if (!isset($_SESSION['user_id'])) {
    header("Location: form-login.php");
    exit;
}

$user_id = intval($_SESSION['user_id']);

$stmt = $conn->prepare("SELECT name, email, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($name, $email, $created_at);
$stmt->fetch();
$stmt->close();
?>
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Dashboard</title></head>
<body>
<h1>ยินดีต้อนรับ <?=htmlspecialchars($name)?> (<?=htmlspecialchars($email)?>)</h1>
<p>สมัครสมาชิกเมื่อ: <?=htmlspecialchars($created_at)?></p>
<a href="logout.php">ออกจากระบบ</a>
</body>
</html>
