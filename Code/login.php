<?php
header("Access-Control-Allow-Origin: *");
session_start();
// The path to 'db.php' assumes this file is in the parent directory of 'api'.
// If not, adjust the path accordingly.
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: index.html");
    exit;
}

// Check Content-Type to handle both standard POST and JSON POST
$inputData = $_POST;
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $inputData = json_decode(file_get_contents('php://input'), true);
}

$email = $inputData['email'] ?? '';
$password = $inputData['Password'] ?? '';

// ตรวจสอบว่าตัวแปร $pdo ถูกกำหนดค่าจาก db.php แล้วหรือไม่
if (!isset($pdo)) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: ตัวแปร PDO ไม่ถูกกำหนด"]);
    exit;
}

// Using PDO to prepare and execute the query
$stmt = $pdo->prepare("SELECT id, password, name, theme FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

header('Content-Type: application/json');

if ($user) {
    if (password_verify($password, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $email;
        $_SESSION['name'] = $user['name'];
        $_SESSION['theme'] = $user['theme'];  // ✅ เก็บธีมของ user

        echo json_encode([
            "status" => "success",
            "message" => "เข้าสู่ระบบสำเร็จ"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "❌ รหัสผ่านไม่ถูกต้อง"
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "❌ ไม่พบผู้ใช้ในระบบ"
    ]);
}

exit;
