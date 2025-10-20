<?php
// api/log_activity.php
function logActivity($pdo, $user_id, $activity) {
    $stmt = $pdo->prepare("INSERT INTO user_activity_log (user_id, activity) VALUES (?, ?)");
    $stmt->execute([$user_id, $activity]);
}
?>
