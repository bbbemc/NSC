<?php
session_start();
include 'db.php';

error_log('reset_quiz.php user_id: ' . ($_SESSION['user_id'] ?? 'NULL'));

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo "Not logged in";
    exit;
}

$user_id = intval($_SESSION['user_id']);

// ตรวจสอบว่ามี user_id นี้ในตาราง quiz_progress หรือยัง
$result = $conn->query("SELECT user_id FROM quiz_progress WHERE user_id = $user_id");

if ($result->num_rows > 0) {
    // ถ้ามี user_id นี้อยู่แล้ว ให้อัปเดตค่า reset_count โดยตรง
    $conn->query("UPDATE quiz_progress SET reset_count = reset_count + 1 WHERE user_id = $user_id");
} else {
    // ถ้ายังไม่มี user_id นี้ในตาราง ให้ทำการ INSERT แถวใหม่
    $conn->query("INSERT INTO quiz_progress (user_id, reset_count) VALUES ($user_id, 1)");
}

echo "ok";
?>