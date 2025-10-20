<?php
// db.php
// Connection using PDO (existing) + compatibility mysqli ($conn) for legacy code
ini_set('display_errors', 1);
error_reporting(E_ALL);

$DB_HOST = 'sql111.infinityfree.com';
$DB_NAME = 'if0_39598697_chemical_bonds';
$DB_USER = 'if0_39598697';
$DB_PASS = 'aa12345abc541a';

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

// Create PDO (primary)
try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (Exception $e) {
    // In production avoid echoing error details — log instead.
    http_response_code(500);
    error_log('DB connection (PDO) failed: '.$e->getMessage());
    die('Database connection error');
}

// --- FIX: Compatibility for legacy files expecting $conn (mysqli) ---
// This section creates $conn as mysqli object so old code using $conn->prepare() works.
$mysqli = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    // If mysqli fails, log but do not die so PDO-based code can still run
    error_log('MySQLi connection failed: ' . $mysqli->connect_error);
    // $conn remains undefined in this case; prefer migrating code to PDO.
} else {
    $mysqli->set_charset('utf8mb4');
    $conn = $mysqli; // <-- Legacy code can use $conn->prepare(...)
}

// End of file (no extra output)
?>
