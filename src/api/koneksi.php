<?php
$host = getenv('DB_HOST') ?: 'db';
$user = getenv('DB_USERNAME') ?: 'root';
$pass = getenv('DB_PASSWORD') ?: 'password_rahasia';
$db   = getenv('DB_DATABASE') ?: 'db_inventaris';

$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode([
        "status" => "gagal",
        "pesan"  => "Koneksi database gagal: " . mysqli_connect_error()
    ]);
    exit;
}
?>