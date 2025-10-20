<?php
// =========================================================================
// PHP: Save Score (patched + achievements)
// =========================================================================

header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/../db.php';

// Validate method & content type
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method or content type.']);
    exit;
}

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

// DON'T cast user_id to int — keep the original format (some systems use string IDs)
$raw_user_id = $_SESSION['user_id'] ?? ($data['user_id'] ?? null);

// If no user_id, make a guest id (so leaderboard rows still have unique user_id)
if ($raw_user_id === null || $raw_user_id === '') {
    $user_id = 'guest_' . session_id();
    $isGuest = true;
} else {
    $user_id = (string)$raw_user_id;
    $isGuest = false;
}

// Default name fallback
// เริ่มจากชื่อที่ส่งมาจากเกมก่อน
$name = !empty($data['name']) ? trim($data['name']) : null;
$email = null;

try {
    if (!$isGuest) {
        $stmtUser = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ? LIMIT 1");
        $stmtUser->execute([$user_id]);
        $userRow = $stmtUser->fetch(PDO::FETCH_ASSOC);

        if ($userRow) {
            $email = $userRow['email'] ?? null;

            // ใช้ชื่อจาก DB เฉพาะกรณีที่ไม่ได้ส่งมาจากเกม
            if (empty($name) && !empty($userRow['name'])) {
                $name = $userRow['name'];
            }
        } elseif (!empty($_SESSION['name'])) {
            if (empty($name)) {
                $name = trim($_SESSION['name']);
            }
        }
    } elseif (!empty($_SESSION['name']) && empty($name)) {
        $name = trim($_SESSION['name']);
    }
} catch (Exception $e) {
    // fallback ถ้ายังไม่มีชื่อ
}

// fallback สุดท้าย
if (empty($name)) {
    $name = 'Guest';
}

$name = mb_substr(trim($name), 0, 255);


// Get score & correct answers
$score = isset($data['score']) ? intval($data['score']) : 0;
$correct_answers = isset($data['correct']) ? intval($data['correct']) : 0;

// Enforce score bounds
if ($score < 0) $score = 0;
if ($score > 10000) $score = 10000;

try {
    $pdo->beginTransaction();

    // Insert into quiz_results
    $stmt_quiz_results = $pdo->prepare("INSERT INTO quiz_results (user_id, score, name, correct_answers) VALUES (?, ?, ?, ?)");
    $stmt_quiz_results->execute([$user_id, $score, $name, $correct_answers]);

    // Leaderboard logic
    $stmt_check_leaderboard = $pdo->prepare("SELECT score FROM leaderboard WHERE user_id = ? LIMIT 1");
    $stmt_check_leaderboard->execute([$user_id]);
    $existing_score = $stmt_check_leaderboard->fetchColumn();

    if ($existing_score !== false) {
        if ($score > intval($existing_score)) {
            $stmt_leaderboard = $pdo->prepare("UPDATE leaderboard SET name = ?, score = ?, correct_answers = ?, date = NOW() WHERE user_id = ?");
            $stmt_leaderboard->execute([$name, $score, $correct_answers, $user_id]);
        }
    } else {
        $stmt_leaderboard = $pdo->prepare("INSERT INTO leaderboard (user_id, name, score, date, correct_answers, email) VALUES (?, ?, ?, NOW(), ?, ?)");
        $stmt_leaderboard->execute([$user_id, $name, $score, $correct_answers, $email]);
    }

    // ====== Achievements ======
    // First Blood
    if ($correct_answers >= 1) {
        $key = 'first_blood';
        $stmt = $pdo->prepare("
            INSERT INTO achievements (user_id, achievement_key, unlocked, unlocked_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE unlocked = VALUES(unlocked), unlocked_at = VALUES(unlocked_at)
        ");
        $stmt->execute([$user_id, $key]);
    }

    // Hot Streak (5 correct in a row)
    if ($correct_answers >= 5) {
        $key = 'hot_streak';
        $stmt = $pdo->prepare("
            INSERT INTO achievements (user_id, achievement_key, unlocked, unlocked_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE unlocked = VALUES(unlocked), unlocked_at = VALUES(unlocked_at)
        ");
        $stmt->execute([$user_id, $key]);
    }

    // Perfect Round (10 correct)
    if ($correct_answers >= 10) {
        $key = 'perfect_round';
        $stmt = $pdo->prepare("
            INSERT INTO achievements (user_id, achievement_key, unlocked, unlocked_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE unlocked = VALUES(unlocked), unlocked_at = VALUES(unlocked_at)
        ");
        $stmt->execute([$user_id, $key]);
    }

    // Time Master (score >= 10000)
    if ($score >= 10000) {
        $key = 'time_master';
        $stmt = $pdo->prepare("
            INSERT INTO achievements (user_id, achievement_key, unlocked, unlocked_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE unlocked = VALUES(unlocked), unlocked_at = VALUES(unlocked_at)
        ");
        $stmt->execute([$user_id, $key]);
    }

    // Chem Wiz (level >= 5, ต้องส่ง level มาจาก JS)
    if (!empty($data['level']) && intval($data['level']) >= 5) {
        $key = 'chem_wiz';
        $stmt = $pdo->prepare("
            INSERT INTO achievements (user_id, achievement_key, unlocked, unlocked_at)
            VALUES (?, ?, 1, NOW())
            ON DUPLICATE KEY UPDATE unlocked = VALUES(unlocked), unlocked_at = VALUES(unlocked_at)
        ");
        $stmt->execute([$user_id, $key]);
    }

    // Commit
    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Score + achievements saved successfully.',
        'user_id' => $user_id,
        'score' => $score,
        'correct_answers' => $correct_answers
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}


error_log("Data name: " . ($data['name'] ?? 'null'));
error_log("Session name: " . ($_SESSION['name'] ?? 'null'));
error_log("Final name: " . $name);