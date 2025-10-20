<?php
session_start();
include 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$name = $_POST['name'];
$current_password = $_POST['current_password'];
$new_password = $_POST['new_password'];
$confirm_password = $_POST['confirm_password'];

$sql = "SELECT password FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($new_password !== "") {
    if (!password_verify($current_password, $user['password'])) {
        echo json_encode(["status" => "error", "message" => "รหัสผ่านปัจจุบันไม่ถูกต้อง"]);
        exit();
    }
    if ($new_password !== $confirm_password) {
        echo json_encode(["status" => "error", "message" => "รหัสผ่านใหม่ไม่ตรงกัน"]);
        exit();
    }
    $hashed = password_hash($new_password, PASSWORD_DEFAULT);
    $update = "UPDATE users SET name=?, password=? WHERE id=?";
    $stmt = $conn->prepare($update);
    $stmt->bind_param("ssi", $name, $hashed, $user_id);
} else {
    $update = "UPDATE users SET name=? WHERE id=?";
    $stmt = $conn->prepare($update);
    $stmt->bind_param("si", $name, $user_id);
}

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Profile updated successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Update failed"]);
}
?>
