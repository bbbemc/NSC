<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';

try {
    // เลือก “คะแนนดีที่สุดของแต่ละ user” พร้อมเวลาแรกสุดของคะแนนนั้น
    $sql = "
      SELECT qr.user_id, u.name AS user_name, qr.score, qr.detail, qr.created_at
      FROM quiz_results qr
      JOIN (
        SELECT user_id, MAX(score) AS best_score, MIN(created_at) AS first_time
        FROM quiz_results
        GROUP BY user_id
      ) b ON b.user_id = qr.user_id AND b.best_score = qr.score AND b.first_time = qr.created_at
      LEFT JOIN users u ON u.id = qr.user_id
      ORDER BY qr.score DESC, qr.created_at ASC
      LIMIT 100
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $out = [];
    foreach ($rows as $r) {
        $detail = [];
        if (!empty($r['detail'])) {
            $decoded = json_decode($r['detail'], true);
            if (is_array($decoded)) $detail = $decoded;
        }
        $out[] = [
            'nickname'    => $detail['nickname'] ?? ($r['user_name'] ?? 'anonymous'),
            'score'       => (int)$r['score'],
            'mode'        => $detail['mode'] ?? null,
            'topic'       => $detail['topic'] ?? null,
            'difficulty'  => $detail['difficulty'] ?? null,
            'created_at'  => $r['created_at'],
        ];
    }

    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}