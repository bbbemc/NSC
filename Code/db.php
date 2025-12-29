<?php
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

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (Exception $e) {
    http_response_code(500);
    error_log('DB connection (PDO) failed: '.$e->getMessage());
    die('Database connection error');
}

$mysqli = @new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    error_log('MySQLi connection failed: ' . $mysqli->connect_error);
} else {
    $mysqli->set_charset('utf8mb4');
    $conn = $mysqli;
}
?>
