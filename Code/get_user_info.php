<?php
// =========================================================================
// PHP: Get User Info
// - This file fetches the current logged-in user's details and returns them as a JSON object.
// - Now uses PDO for consistency with other files.
// =========================================================================

header('Content-Type: application/json; charset=utf-8');
session_start();

// The path to 'db.php' is relative to the current file (api/get_user_info.php)
require_once 'db.php';
require_once 'User.php';

try {
    // Check if the user is logged in via session
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Not logged in']);
        exit;
    }

    // Create an instance of the User class with the PDO connection
    $userModel = new User($pdo);
    $currentUser = $userModel->getCurrentUser();

    if ($currentUser) {
        // Return user data as JSON
        echo json_encode($currentUser, JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404); // Not Found
        echo json_encode(['error' => 'User not found']);
    }

} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
