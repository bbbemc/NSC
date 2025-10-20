<?php
// =========================================================================
// PHP: Get Leaderboard
// - This file fetches the top 100 scores from the 'leaderboard' table,
//   which now has a unique entry per user.
// =========================================================================

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';

try {
    // Select from the 'leaderboard' table which now correctly holds one entry per user
    $sql = "
        SELECT name as nickname, score, date as created_at, correct_answers
        FROM leaderboard
        ORDER BY score DESC, created_at ASC
        LIMIT 100
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $out = [];
    foreach ($rows as $r) {
        $out[] = [
            'nickname'        => htmlspecialchars($r['nickname'] ?? $r['name'] ?? 'Guest'),
            'name'            => htmlspecialchars($r['name'] ?? $r['nickname'] ?? 'Guest'), // เพิ่มเพื่อเข้ากันได้
            'score'           => (int)$r['score'],
            'correct_answers' => (int)($r['correct_answers'] ?? 0),
            'created_at'      => $r['created_at'] ?? '',
        ];
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
