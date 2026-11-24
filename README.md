# GESIT — Sistem Manajemen Inventaris Berbasis Web

GESIT adalah aplikasi manajemen inventaris barang berbasis web yang dirancang menggunakan arsitektur **Static Frontend + PHP REST API** dan di-deploy menggunakan kontainerisasi Docker penuh serta pipeline CI/CD otomatis ke Google Cloud Platform (GCP).

🌐 **Live Demo:** https://gesit-bondi.duckdns.org

---

## Arsitektur & Tech Stack

Aplikasi ini menerapkan konsep *separation of concerns* dengan memisahkan setiap layanan ke dalam container independen:

* **Reverse Proxy & Auto-SSL:** Caddy 2 (`caddy:2-alpine`) — Manajemen sertifikat SSL Let's Encrypt otomatis & routing HTTPS.
* **Web Server:** Nginx (`nginx:alpine`) — Menyajikan aset statis (`HTML`, `CSS`, `JS`) dan meneruskan request `/api/*` via FastCGI.
* **Backend API:** PHP 8.3 FPM (`php:8.3-fpm-alpine`) — REST API native dengan *prepared statements* (`mysqli`).
* **Database:** MariaDB 10.11 (`mariadb:10.11`) — Penyimpanan data inventaris, pengguna, dan log aktivitas dengan *persistent volume*.
* **CI/CD & Registry:** GitHub Actions & GitHub Container Registry (`ghcr.io`).
* **Cloud Infrastructure:** Google Cloud Platform (Compute Engine VM + Static External IP).

---

## Struktur Repository

```text
GESIT/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Pipeline CI/CD build image ke GHCR & auto-deploy ke GCP
├── database/
│   └── db_inventaris.sql       # Skema database & data awal (auto-import saat init)
├── docker/
│   ├── nginx/
│   │   ├── Dockerfile          # Custom image Nginx + aset frontend
│   │   └── default.conf        # Konfigurasi routing web & FastCGI PHP
│   └── php/
│       └── Dockerfile          # Custom image PHP-FPM 8.3 + ekstensi mysqli
├── src/
│   ├── api/
│   │   ├── api_barang.php      # Endpoint CRUD data inventaris & pencatatan log
│   │   ├── api_login.php       # Endpoint autentikasi pengguna (Admin & Karyawan)
│   │   ├── api_logs.php        # Endpoint riwayat aktivitas sistem
│   │   └── koneksi.php         # Koneksi database berbasis environment variables
│   ├── index.html              # Halaman dashboard utama
│   ├── login.html              # Halaman login
│   ├── script.js               # Logika frontend, Fetch API, live search, & cetak laporan
│   └── style.css               # Styling antarmuka pengguna
├── docker-compose.yml          # Orkestrasi container untuk environment production
├── docker-compose.dev.yml      # Orkestrasi container untuk development lokal (live-reload)
├── .env.example                # Template variabel environment
├── .gitattributes              # Standarisasi line-ending Linux (LF)
├── .gitignore                  # Pengecualian file sensitif (.env)
└── README.md                   # Dokumentasi proyek
```

---

## Menjalankan di Lingkungan Lokal (Development)

1. **Clone repository:**
   ```bash
   git clone https://github.com/[username-github-kamu]/GESIT.git
   cd GESIT
   ```
2. **Siapkan variabel environment:**
   ```bash
   cp .env.example .env
   ```
3. **Jalankan container development:**
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```
4. Akses aplikasi di browser melalui `http://localhost:8080/login.html`.

---

## Alur Kerja CI/CD (Deployment Otomatis)

Repository ini menggunakan strategi **2-Branch (`dev` & `main`)**:
1. Pengembangan dan pengujian fitur baru dilakukan di branch **`dev`**.
2. Saat perubahan di-merge ke branch **`main`**, **GitHub Actions** otomatis menjalankan dua tahap:
   * **Build & Push:** Mem-build image `gesit-web` dan `gesit-app`, lalu mengunggahnya ke **GitHub Container Registry (GHCR)**.
   * **Deploy to GCP:** Menghubungkan ke VM GCP via SSH, memperbarui konfigurasi environment dari GitHub Secrets, menarik image terbaru, dan me-restart container tanpa menghapus volume database.