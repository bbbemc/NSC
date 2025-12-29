<?php
header("Access-Control-Allow-Origin: https://autochem.42web.io/?i=1");
session_start();
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header("Location: index.html");
    exit;
}

$inputData = $_POST;
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $inputData = json_decode(file_get_contents('php://input'), true);
}

$email = $inputData['email'] ?? '';
$password = $inputData['Password'] ?? '';

if (!isset($pdo)) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "❌ เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: ตัวแปร PDO ไม่ถูกกำหนด"]);
    exit;
}

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
        $_SESSION['theme'] = $user['theme'];

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
