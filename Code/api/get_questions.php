<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../db.php';

$stmt = $pdo->query("SELECT * FROM questions ORDER BY RAND() LIMIT 10");
$questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($questions, JSON_UNESCAPED_UNICODE);