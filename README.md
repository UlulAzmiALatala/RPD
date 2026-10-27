<div align="center">

  <!-- PROJECT BANNER -->
  <img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:005C84,50:0A192F,100:00F7FF&height=220&section=header&text=SIRA%202.0&fontSize=60&fontColor=FFFFFF&desc=Sistem%20Informasi%20Realisasi%20Anggaran&descSize=20&descAlignY=65" alt="SIRA 2.0 Banner" />

  <p align="center">
    <i>Platform Executive Dashboard & Monitoring Serapan Anggaran Berbasis Real-Time.</i>
  </p>

  <!-- TECH & STATUS BADGES -->
  <p align="center">
    <img src="https://img.shields.io/badge/Status-Production-00E676?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/Architecture-Monolithic_SPA-00F7FF?style=for-the-badge&logo=codeigniter&logoColor=black" alt="Architecture" />
    <img src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
    <img src="https://img.shields.io/badge/React.js-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Inertia.js-9553E9?style=for-the-badge&logo=inertia&logoColor=white" alt="Inertia" />
  </p>
</div>

---

## 🏛️ Tentang Proyek

**SIRA 2.0 (Sistem Informasi Realisasi Anggaran)** atau modul **RPD (Rencana Penarikan Dana)** adalah platform *GovTech* berskala *enterprise* yang dirancang khusus untuk memonitor, menganalisis, dan melaporkan serapan anggaran secara *real-time*. 

Sistem ini mentransformasi alur pelaporan keuangan konvensional menjadi ekosistem digital terpadu, memungkinkan jajaran pimpinan eksekutif untuk mengambil keputusan berbasis data (*data-driven decision making*) dengan visibilitas penuh terhadap arus operasional institusi.

---

## ✨ Fitur Utama (Core Features)

- 📊 **Executive Real-Time Dashboard:** Visualisasi data interaktif (menggunakan *Chart.js*) untuk memantau metrik serapan anggaran secara instan.
- 📄 **Automated Document Generation:** Ekspor laporan eksekutif, rekapitulasi RPD, dan dokumen Buku Saku ke format PDF (via DOMPDF) secara otomatis.
- 🔐 **Role-Based Access Control (RBAC):** Manajemen otorisasi bertingkat yang membedakan akses antara pimpinan eksekutif, divisi, dan staf operator.
- ⚡ **Seamless SPA Experience:** Navigasi super cepat tanpa *page-reload* berkat integrasi Laravel dan React.js yang dijembatani oleh Inertia.js.
- 📱 **Responsive Glassmorphism UI:** Antarmuka modern yang adaptif di berbagai ukuran layar (Desktop, Tablet, Mobile) menggunakan Tailwind CSS.

---

## 🛠️ Arsitektur Teknologi (Tech Stack)

| Kategori | Teknologi Utama | Fungsi dalam Sistem |
| :--- | :--- | :--- |
| **Backend / API** | `Laravel 10+` `PHP 8+` | Menangani logika bisnis, *routing*, autentikasi, dan ORM. |
| **Frontend / UI** | `React.js` `Tailwind CSS` | Membangun komponen UI interaktif dan *styling* responsif. |
| **Bridge / Routing**| `Inertia.js` | Menghubungkan Laravel & React sebagai *Single Page Application* tanpa API REST terpisah. |
| **Database** | `MySQL / MariaDB` | Penyimpanan data relasional skala institusi. |
| **Data Analytics** | `Chart.js` | *Rendering* grafik statistik dinamis pada dashboard. |
| **Reporting** | `DOMPDF` | *Generate* laporan dokumen resmi (PDF) secara *on-the-fly*. |

---

## 🚀 Panduan Instalasi (Local Environment)

Ikuti langkah-langkah berikut untuk menjalankan SIRA 2.0 di mesin lokal Anda. Pastikan Anda telah menginstal **PHP 8+**, **Composer**, **Node.js (NPM)**, dan **MySQL**.

### 1. Clone Repositori
```bash
git clone [https://github.com/UlulAzmiALatala/RPD.git](https://github.com/UlulAzmiALatala/RPD.git)
cd RPD
```

### 2. Konfigurasi Backend (Laravel)
```bash
# Install dependensi PHP
composer install

# Salin file environment
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 3. Konfigurasi Database
Buat database baru di MySQL (misalnya `sira_db`), lalu sesuaikan kredensial pada file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sira_db
DB_USERNAME=root
DB_PASSWORD=
```
Jalankan migrasi dan *seeder* (jika ada):
```bash
php artisan migrate --seed
```

### 4. Konfigurasi Frontend (React & Inertia)
```bash
# Install dependensi Node.js
npm install

# Build asset untuk development
npm run dev
```

### 5. Jalankan Server
Buka terminal baru dan jalankan server *development* Laravel:
```bash
php artisan serve
```
Aplikasi kini dapat diakses melalui: `http://localhost:8000`

---

## 💻 Cuplikan Layar Sistem (Screenshots)

<div align="center">
  <!-- GANTI LINK GAMBAR DI BAWAH INI DENGAN SCREENSHOT ASLI APLIKASIMU -->
    <img width="1920" height="1200" alt="Screenshot 2026-10-27 154111" src="https://github.com/user-attachments/assets/5142c07c-7be3-47f7-9601-8f868282f3c6" />
  <img src="https://via.placeholder.com/800x400/0D1117/00F7FF?text=Dashboard+Executive+View+(Upload+Screenshot+Here)" alt="Dashboard SIRA 2.0" width="80%" />
  <br/>
  <img src="https://via.placeholder.com/800x400/0D1117/00F7FF?text=Modul+Laporan+%26+PDF+Export+(Upload+Screenshot+Here)" alt="Reporting Modul" width="80%" />
</div>

---

## 🔐 Keamanan & Lisensi

Sistem ini dikembangkan secara spesifik untuk kebutuhan institusional. Penggunaan, penyalinan, atau modifikasi kode sumber di luar otorisasi yang diberikan dilarang secara ketat tanpa izin tertulis dari pengembang utama.

<div align="center">
  <br/>
  <i>Engineered with precision by <b>Ulul Azmi A. Latala</b> &copy; 2026</i>
</div>
