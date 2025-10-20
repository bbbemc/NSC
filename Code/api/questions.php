<?php
// =========================================================================
// PHP: Get Questions
// - This file fetches 10 random questions from the database.
// =========================================================================

header('Content-Type: application/json; charset=utf-8');

// The path to 'db.php' assumes this file is in the parent directory.
require_once __DIR__ . '/../db.php';

try {
    $stmt = $pdo->query("SELECT * FROM questions ORDER BY RAND() LIMIT 10");
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($questions, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
