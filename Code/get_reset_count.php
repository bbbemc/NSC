<?php
// =========================================================================
// PHP: Get Reset Count
// - This file fetches the user's quiz reset count.
// - Now uses PDO for consistency with other files.
// =========================================================================

session_start();
// The path to 'db.php' is relative to the current file (api/get_reset_count.php)
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo 0; // Not logged in, so reset count is 0
    exit;
}

$user_id = intval($_SESSION['user_id']);

try {
    $stmt = $pdo->prepare("SELECT reset_count FROM quiz_progress WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo $row ? $row['reset_count'] : 0;
} catch (Exception $e) {
    // Log the error but return 0 to the client
    error_log("Database error in get_reset_count.php: " . $e->getMessage());
    echo 0; 
}
?>
