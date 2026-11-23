<?php
// File: api/api_logs.php
header("Content-Type: application/json");
require 'koneksi.php';

$stmt = $koneksi->prepare("SELECT id, waktu, username, aksi FROM logs ORDER BY id DESC LIMIT 50");
$stmt->execute();
$result = $stmt->get_result();
$hasil = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($hasil);
?>