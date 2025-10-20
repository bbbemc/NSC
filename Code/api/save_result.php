<?php
// =========================================================================
// PHP: Save Score
// - This file receives a user's score via a POST request and saves it to the database.
// - It now expects a JSON payload and uses PDO for security.
// =========================================================================

header('Content-Type: application/json; charset=utf-8');
session_start();

// The path to 'db.php' assumes this file is in the parent directory.
require_once __DIR__ . '/../db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

// Get the user data from the session
$user_id = intval($_SESSION['user_id']);
$name = htmlspecialchars($_SESSION['name'], ENT_QUOTES, 'UTF-8');

// Get the score from the POST request
$score = isset($_POST['score']) ? intval($_POST['score']) : 0;

if ($score === 0 && !isset($_POST['score'])) {
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Missing score"]);
    exit;
}

try {
    // Save the quiz result
    $stmt = $pdo->prepare("INSERT INTO quiz_results (user_id, quiz_id, score, name) VALUES (?, 1, ?, ?)");
    $stmt->execute([$user_id, $score, $name]);

    // Update the leaderboard with the highest score
    $stmt = $pdo->prepare("INSERT INTO leaderboard (user_id, name, score, date)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE score = GREATEST(score, VALUES(score)), date = NOW()");
    $stmt->execute([$user_id, $name, $score]);

    echo json_encode(["success" => true, "message" => "บันทึกสำเร็จ"]);
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>
