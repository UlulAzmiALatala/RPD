<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\LaporanRealisasiController;
use App\Http\Controllers\Api\AnggaranController;
use App\Http\Controllers\Api\LaporanBulananController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\CutOffController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RincianOutputController;
use App\Http\Controllers\Api\PdfSettingController;
use App\Http\Controllers\Api\SecurityController;

// ==============================================================================
// 1. ROUTE API (Dilindungi Auth, Status Aktif & RBAC)
// ==============================================================================
Route::middleware(['auth', 'active'])->group(function () {

    // ---------------------------------------------------------
    // A. RUTE UMUM & KEAMANAN AKUN (Admin & Satker)
    // ---------------------------------------------------------
    Route::get('/api/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/api/profile', [ProfileController::class, 'update']);

    // Keamanan Akun: Wajib Ganti Password & 2FA Google Authenticator
    Route::post('/api/security/force-change-password', [SecurityController::class, 'forceChangePassword']);
    Route::get('/api/security/two-factor', [SecurityController::class, 'twoFactorStatus']);
    Route::post('/api/security/two-factor/enable', [SecurityController::class, 'enableTwoFactor']);
    Route::post('/api/security/two-factor/confirm', [SecurityController::class, 'confirmTwoFactor']);
    Route::post('/api/security/two-factor/recovery-codes', [SecurityController::class, 'recoveryCodes']);
    Route::post('/api/security/two-factor/disable', [SecurityController::class, 'disableTwoFactor']);

    Route::get('/api/dashboard-data', [DashboardController::class, 'index'])->name('api.dashboard');
    Route::get('/api/dashboard-data/pdf', [DashboardController::class, 'cetakPdfDashboard']);

    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::put('/api/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/api/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::get('/api/activity-logs', [ActivityLogController::class, 'index']);

    // Transaksi & Laporan (GET)
    Route::get('/api/transaksi/summary', [LaporanRealisasiController::class, 'getSummary']);
    Route::get('/api/laporan/realisasi-satker', [LaporanRealisasiController::class, 'getLaporanRealisasi']);
    Route::get('/api/laporan/realisasi-satker/pdf', [LaporanRealisasiController::class, 'cetakPdfLaporan']);
    Route::get('/api/laporan/bulanan', [LaporanBulananController::class, 'index']);
    Route::get('/api/laporan/bulanan/pdf', [LaporanBulananController::class, 'cetakPdfLaporanBulanan']);

    Route::get('/api/anggaran', [AnggaranController::class, 'index']);
    Route::get('/api/anggaran/{id}/revisi', [AnggaranController::class, 'getRevisi']);
    Route::get('/api/rincian-output', [RincianOutputController::class, 'index']);
    Route::get('/api/laporan/rincian-output/pdf', [RincianOutputController::class, 'cetakPdfRo']);
    Route::get('/api/cut-offs', [CutOffController::class, 'index']);
    Route::get('/api/pdf-settings', [PdfSettingController::class, 'show']);


    // ---------------------------------------------------------
    // B. RUTE TRANSAKSI OPERASIONAL
    // ---------------------------------------------------------
    Route::get('/api/transaksi/rpd', [TransaksiController::class, 'getRpd']);
    Route::post('/api/transaksi/rpd', [TransaksiController::class, 'storeRpd']);
    Route::post('/api/transaksi/rpd/import', [TransaksiController::class, 'importRpd']);
    Route::put('/api/transaksi/rpd/{id}', [TransaksiController::class, 'updateRpd']);
    Route::delete('/api/transaksi/rpd/{id}', [TransaksiController::class, 'destroyRpd']);

    Route::get('/api/transaksi/realisasi', [TransaksiController::class, 'getRealisasi']);
    Route::post('/api/transaksi/realisasi', [TransaksiController::class, 'storeRealisasi']);
    Route::post('/api/transaksi/realisasi/import', [TransaksiController::class, 'importRealisasi']);
    Route::put('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'updateRealisasi']);
    Route::delete('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'destroyRealisasi']);

    Route::post('/api/rincian-output', [RincianOutputController::class, 'storeTarget']);
    Route::post('/api/rincian-output/realisasi', [RincianOutputController::class, 'storeRealisasi']);
    Route::delete('/api/rincian-output/{id}', [RincianOutputController::class, 'destroyRo']);


    // ---------------------------------------------------------
    // C. RUTE SUPER ADMIN KANWIL (Mutlak)
    // ---------------------------------------------------------
    Route::middleware(['role:admin'])->group(function () {
        // Master Data Pengguna & Otoritas Keamanan
        Route::get('/api/users', [UserController::class, 'index']);
        Route::post('/api/users', [UserController::class, 'store']);
        Route::put('/api/users/{id}', [UserController::class, 'update']);
        Route::put('/api/users/{id}/toggle-active', [UserController::class, 'toggleActive']);
        Route::post('/api/users/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::post('/api/users/{id}/reset-2fa', [UserController::class, 'resetTwoFactor']);
        Route::delete('/api/users/{id}', [UserController::class, 'destroy']);

        // Master Pagu Anggaran & Revisi DIPA
        Route::post('/api/anggaran', [AnggaranController::class, 'store']);
        Route::put('/api/anggaran/{id}', [AnggaranController::class, 'update']);
        Route::delete('/api/anggaran/{id}', [AnggaranController::class, 'destroy']);
        Route::post('/api/anggaran/{id}/revisi', [AnggaranController::class, 'storeRevisi']);
        Route::delete('/api/anggaran/revisi/{revisiId}', [AnggaranController::class, 'destroyRevisi']);

        // Modul Approval (Satuan & Massal)
        Route::put('/api/transaksi/rpd/{id}/approve', [TransaksiController::class, 'approveRpd']);
        Route::post('/api/transaksi/rpd/bulk-approve', [TransaksiController::class, 'bulkApproveRpd']);
        Route::put('/api/transaksi/realisasi/{id}/approve', [TransaksiController::class, 'approveRealisasi']);
        Route::post('/api/transaksi/realisasi/bulk-approve', [TransaksiController::class, 'bulkApproveRealisasi']);

        // Penguncian Periode Laporan (Tutup Buku)
        Route::post('/api/cut-offs/toggle', [CutOffController::class, 'toggle']);

        // Pengaturan Kop Surat & Pejabat Penanda Tangan PDF Dinamis
        Route::put('/api/pdf-settings', [PdfSettingController::class, 'update']);
    });
});


// ==============================================================================
// 2. ROUTE FRONTEND (REACT SPA)
// ==============================================================================

Route::get('/login', function () {
    return view('dashboard');
})->name('login');

Route::get('/forgot-password', function () {
    return view('dashboard');
});

Route::get('/ganti-password-wajib', function () {
    return view('dashboard');
});

// Registrasi publik DITUTUP permanen (arahkan balik ke Login)
Route::redirect('/register', '/login');

Route::get('/dashboard/{any?}', function () {
    return view('dashboard');
})->where('any', '.*');

Route::get('/', function () {
    return view('dashboard');
});

Route::get('/home', function () {
    return redirect('/dashboard');
});
