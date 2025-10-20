<?php
// api/get_achievements.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/connect.php';
session_start();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
$user_id = $_SESSION['user_id'] ?? ($data['user_id'] ?? null);

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'missing user_id']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT achievement_key, unlocked, unlocked_at FROM achievements WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // คืนค่าเป็น array ของ objects { key, unlocked, unlocked_at }
    $out = [];
    foreach ($rows as $r) {
        $out[] = [
            'key' => $r['achievement_key'],
            'unlocked' => (int)$r['unlocked'],
            'unlocked_at' => $r['unlocked_at']
        ];
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'db_error', 'message' => $e->getMessage()]);
}
