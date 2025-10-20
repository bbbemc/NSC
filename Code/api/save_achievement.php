<?php
// api/save_achievement.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/connect.php';
session_start();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// รับ user_id จาก session หรือ body (fallback)
$user_id = $_SESSION['user_id'] ?? ($data['user_id'] ?? null);
$key = $data['achievement_key'] ?? $data['key'] ?? null;

if (!$user_id || !$key) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'missing user_id or achievement_key']);
    exit;
}

try {
    // ตรวจสอบ/สร้าง unique index ก่อนเรียก ON DUPLICATE (ดู SQL ด้านล่าง)
    $stmt = $pdo->prepare("
        INSERT INTO achievements (user_id, achievement_key, unlocked, unlocked_at)
        VALUES (?, ?, 1, NOW())
        ON DUPLICATE KEY UPDATE
            unlocked = VALUES(unlocked),
            unlocked_at = VALUES(unlocked_at)
    ");
    $stmt->execute([$user_id, $key]);

    echo json_encode(['ok' => true, 'key' => $key]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => $e->getMessage()]);
}
