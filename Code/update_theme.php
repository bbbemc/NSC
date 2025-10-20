<?php
session_start();
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$newTheme = $data['theme'] ?? 'light';

$stmt = $pdo->prepare("UPDATE users SET theme = ? WHERE id = ?");
$stmt->execute([$newTheme, $_SESSION['user_id']]);

$_SESSION['theme'] = $newTheme;

echo json_encode(["status" => "success", "theme" => $newTheme]);
?>
