<?php
// api/submit_score.php
// บันทึกคะแนน (รองรับผู้ล็อกอินและ anonymous)
// พฤติกรรมหลัก:
//  - ถ้ามี users.name (จาก DB) ให้ใช้เป็น priority
//  - ถ้า client ส่ง nickname และไม่ใช่ 'guest' ให้ใช้
//  - ถ้าไม่มีชื่อ ให้เก็บเป็น NULL (ไม่บันทึก 'Guest')
//  - เก็บประวัติลง quiz_results ทุกครั้ง
//  - อัปเดต leaderboard โดยเก็บคะแนนเป็น MAX(old, new)
header('Content-Type: application/json; charset=utf-8');
session_start();
require_once __DIR__ . '/../db.php'; // ต้องให้ $pdo เป็น PDO instance

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'message' => 'Method not allowed. Use POST.']);
        exit;
    }

    // อ่าน input (รองรับ JSON หรือ form POST)
    $raw = file_get_contents('php://input');
    $in = json_decode($raw, true);
    if (!is_array($in)) {
        $in = $_POST;
    }

    // normalize inputs
    $payload_nickname = trim((string)($in['nickname'] ?? ''));
    $score = max(0, intval($in['score'] ?? 0));
    $mode = isset($in['mode']) ? trim((string)$in['mode']) : null;
    $topic = isset($in['topic']) ? trim((string)$in['topic']) : null;
    $difficulty = isset($in['difficulty']) ? trim((string)$in['difficulty']) : null;
    $correct = isset($in['correct_answers']) ? intval($in['correct_answers']) : null;

    // session / user identity (may be null)
    $user_id = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : null;

    // try to get authoritative name/email from users table if logged-in
    $name_from_db = null;
    $email = null;
    if ($user_id) {
        try {
            $q = $pdo->prepare('SELECT name, email FROM users WHERE id = ? LIMIT 1');
            $q->execute([$user_id]);
            $u = $q->fetch(PDO::FETCH_ASSOC);
            if ($u) {
                $name_from_db = trim((string)($u['name'] ?? ''));
                $email = trim((string)($u['email'] ?? ''));
            }
        } catch (Exception $e) {
            // ignore; we'll proceed without DB name/email
            $name_from_db = null;
            $email = null;
        }
    }

    // Decide final name priority:
    // 1) users.name (from DB) if present and not 'guest'
    // 2) session name (if you set it) if present and not 'guest'
    // 3) client-provided nickname if present and not 'guest'
    // 4) else null (we will not store literal 'Guest')
    $final_name = null;
    if ($name_from_db !== '' && strtolower($name_from_db) !== 'guest') {
        $final_name = mb_substr($name_from_db, 0, 64);
    } else {
        $sessname = trim((string)($_SESSION['name'] ?? ''));
        if ($sessname !== '' && strtolower($sessname) !== 'guest') {
            $final_name = mb_substr($sessname, 0, 64);
        } elseif ($payload_nickname !== '' && strtolower($payload_nickname) !== 'guest') {
            $final_name = mb_substr($payload_nickname, 0, 64);
        } else {
            $final_name = null;
        }
    }

    // Prepare detail JSON for quiz_results (optional)
    $detail = json_encode([
        'nickname'   => $final_name ?? ($payload_nickname !== '' ? mb_substr($payload_nickname,0,32) : null),
        'mode'       => $mode,
        'topic'      => $topic,
        'difficulty' => $difficulty,
    ], JSON_UNESCAPED_UNICODE);

    // Start DB transaction
    $pdo->beginTransaction();

    // 1) Insert history into quiz_results
    //    assumes quiz_results has columns (user_id, score, detail, created_at) - adapt if needed
    $insQr = $pdo->prepare('INSERT INTO quiz_results (user_id, score, detail, created_at) VALUES (?, ?, ?, NOW())');
    $insQr->execute([$user_id, $score, $detail]);

    // 2) Upsert into leaderboard
    // Try find existing row by user_id first, then by email (if available)
    $existing = null;
    if ($user_id) {
        $sel = $pdo->prepare('SELECT * FROM leaderboard WHERE user_id = ? LIMIT 1');
        $sel->execute([$user_id]);
        $existing = $sel->fetch(PDO::FETCH_ASSOC);
    }

    if (!$existing && !empty($email)) {
        $sel = $pdo->prepare('SELECT * FROM leaderboard WHERE email = ? LIMIT 1');
        $sel->execute([$email]);
        $existing = $sel->fetch(PDO::FETCH_ASSOC);
    }

    if ($existing) {
        // update existing row: keep max score, update name if we have authoritative name
        $oldScore = intval($existing['score'] ?? 0);
        $newScore = max($oldScore, $score);
        $name_to_store = $final_name ?? ($existing['name'] ?? null);
        // safe update (columns: user_id, email, name, score, correct_answers, date)
        $upd = $pdo->prepare('UPDATE leaderboard SET user_id = ?, email = ?, name = ?, score = ?, correct_answers = ?, date = NOW() WHERE id = ?');
        $upd->execute([$user_id ?: $existing['user_id'], $email ?: $existing['email'], $name_to_store, $newScore, $correct, $existing['id']]);
        $pdo->commit();
        echo json_encode([
            'ok' => true,
            'action' => 'updated',
            'previous' => $oldScore,
            'now' => $newScore,
            'name' => $name_to_store
        ], JSON_UNESCAPED_UNICODE);
        exit;
    } else {
        // insert new row
        $ins = $pdo->prepare('INSERT INTO leaderboard (user_id, email, name, score, correct_answers, date) VALUES (?, ?, ?, ?, ?, NOW())');
        $ins->execute([$user_id, $email ?: null, $final_name, $score, $correct]);
        $pdo->commit();
        echo json_encode([
            'ok' => true,
            'action' => 'inserted',
            'now' => $score,
            'name' => $final_name
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    error_log('submit_score error: ' . $e->getMessage());
    echo json_encode(['ok' => false, 'message' => 'Server error'], JSON_UNESCAPED_UNICODE);
    exit;
}
