<?php
// api/connect.php
// ใช้สำหรับเชื่อมต่อฐานข้อมูลเท่านั้น
$dsn = 'mysql:host=sql111.infinityfree.com;dbname=if0_39598697_chemical_bonds;charset=utf8mb4';

// TODO: ใส่ user/password จริงของ Hosting คุณ
$dbUser = 'if0_39598697';
$dbPass = 'aa12345abc541a';

try {
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'db_connect_failed', 'message' => $e->getMessage()]);
    exit;
}
