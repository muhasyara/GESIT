<?php
// File: api/api_barang.php
header("Content-Type: application/json");
require 'koneksi.php';

$method = $_SERVER['REQUEST_METHOD'];
$staff  = $_SERVER['HTTP_X_USERNAME'] ?? 'admin';

function catatLog($koneksi, $username, $aksi) {
    $stmtLog = $koneksi->prepare("INSERT INTO logs (username, aksi) VALUES (?, ?)");
    $stmtLog->bind_param("ss", $username, $aksi);
    $stmtLog->execute();
}

// 1. TAMPIL DATA (GET)
if ($method === 'GET') {
    $stmt = $koneksi->prepare("SELECT * FROM tas ORDER BY id DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $hasil = $result->fetch_all(MYSQLI_ASSOC);

    echo json_encode($hasil);
}

// 2. TAMBAH DATA (POST)
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $merk  = $data['merk'] ?? '';
    $tipe  = $data['tipe'] ?? '';
    $harga = (float) ($data['harga'] ?? 0);
    $stok  = (int) ($data['stok'] ?? 0);

    $stmt = $koneksi->prepare("INSERT INTO tas (merk, tipe, harga, stok) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssdi", $merk, $tipe, $harga, $stok);

    if ($stmt->execute()) {
        catatLog($koneksi, $staff, "Menambahkan tas baru: $merk $tipe");
        echo json_encode(["status" => "sukses", "pesan" => "Data berhasil ditambahkan"]);
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Gagal menambah data"]);
    }
}

// 3. EDIT DATA (PUT)
elseif ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    $data = json_decode(file_get_contents("php://input"), true);

    if ($id && $data) {
        $merk  = $data['merk'] ?? '';
        $tipe  = $data['tipe'] ?? '';
        $harga = (float) ($data['harga'] ?? 0);
        $stok  = (int) ($data['stok'] ?? 0);

        $stmt = $koneksi->prepare("UPDATE tas SET merk = ?, tipe = ?, harga = ?, stok = ? WHERE id = ?");
        $stmt->bind_param("ssdii", $merk, $tipe, $harga, $stok, $id);

        if ($stmt->execute()) {
            catatLog($koneksi, $staff, "Mengubah data tas: $merk $tipe (ID: $id)");
            echo json_encode(["status" => "sukses", "pesan" => "Data berhasil diupdate"]);
        } else {
            echo json_encode(["status" => "gagal", "pesan" => "Gagal mengupdate data"]);
        }
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "Data atau ID tidak valid"]);
    }
}

// 4. HAPUS DATA (DELETE)
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $koneksi->prepare("DELETE FROM tas WHERE id = ?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            catatLog($koneksi, $staff, "Menghapus tas dengan ID: $id");
            echo json_encode(["status" => "sukses", "pesan" => "Data berhasil dihapus"]);
        } else {
            echo json_encode(["status" => "gagal", "pesan" => "Gagal menghapus data"]);
        }
    } else {
        echo json_encode(["status" => "gagal", "pesan" => "ID tidak valid"]);
    }
}
?>