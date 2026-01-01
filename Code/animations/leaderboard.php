<?php
// api/leaderboard.php — ดึงอันดับคะแนนสูงสุด 100 อันดับ
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$stmt = $pdo->query("SELECT nickname, score, mode, topic, difficulty, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at FROM leaderboard ORDER BY score DESC, created_at ASC LIMIT 10");
$rows = $stmt->fetchAll();
echo json_encode($rows);
