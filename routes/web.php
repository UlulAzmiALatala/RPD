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

// ==============================================================================
// 1. ROUTE API (Dilindungi Auth & RBAC)
// ==============================================================================
Route::middleware(['auth'])->group(function () {

    // ---------------------------------------------------------
    // A. RUTE UMUM (Bisa diakses Admin & Satker)
    // ---------------------------------------------------------
    Route::get('/api/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/api/profile', [ProfileController::class, 'update']);

    Route::get('/api/dashboard-data', [DashboardController::class, 'index'])->name('api.dashboard');
    Route::get('/api/dashboard-data/pdf', [DashboardController::class, 'cetakPdfDashboard']);

    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::put('/api/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/api/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::get('/api/activity-logs', [ActivityLogController::class, 'index']);

    // Transaksi & Laporan (GET - Hanya melihat data)
    Route::get('/api/transaksi/summary', [LaporanRealisasiController::class, 'getSummary']);
    Route::get('/api/laporan/realisasi-satker', [LaporanRealisasiController::class, 'getLaporanRealisasi']);
    Route::get('/api/laporan/realisasi-satker/pdf', [LaporanRealisasiController::class, 'cetakPdfLaporan']);
    Route::get('/api/laporan/bulanan', [LaporanBulananController::class, 'index']);
    Route::get('/api/laporan/bulanan/pdf', [LaporanBulananController::class, 'cetakPdfLaporanBulanan']);

    Route::get('/api/anggaran', [AnggaranController::class, 'index']);
    Route::get('/api/rincian-output', [RincianOutputController::class, 'index']);
    Route::get('/api/laporan/rincian-output/pdf', [RincianOutputController::class, 'cetakPdfRo']);
    Route::get('/api/cut-offs', [CutOffController::class, 'index']);


    // ---------------------------------------------------------
    // B. RUTE TRANSAKSI OPERASIONAL
    // ---------------------------------------------------------
    Route::get('/api/transaksi/rpd', [TransaksiController::class, 'getRpd']);
    Route::post('/api/transaksi/rpd', [TransaksiController::class, 'storeRpd']);
    Route::put('/api/transaksi/rpd/{id}', [TransaksiController::class, 'updateRpd']);
    Route::delete('/api/transaksi/rpd/{id}', [TransaksiController::class, 'destroyRpd']);

    Route::get('/api/transaksi/realisasi', [TransaksiController::class, 'getRealisasi']);
    Route::post('/api/transaksi/realisasi', [TransaksiController::class, 'storeRealisasi']);
    Route::put('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'updateRealisasi']);
    Route::delete('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'destroyRealisasi']);

    Route::post('/api/rincian-output', [RincianOutputController::class, 'storeTarget']);
    Route::post('/api/rincian-output/realisasi', [RincianOutputController::class, 'storeRealisasi']);
    Route::delete('/api/rincian-output/{id}', [RincianOutputController::class, 'destroyRo']);


    // ---------------------------------------------------------
    // C. RUTE SUPER ADMIN KANWIL (Mutlak)
    // ---------------------------------------------------------
    Route::middleware(['role:admin'])->group(function () {
        // Master Data Pengguna
        Route::get('/api/users', [UserController::class, 'index']);
        Route::post('/api/users', [UserController::class, 'store']);
        Route::put('/api/users/{id}', [UserController::class, 'update']);
        Route::delete('/api/users/{id}', [UserController::class, 'destroy']);

        // Master Pagu Anggaran
        Route::post('/api/anggaran', [AnggaranController::class, 'store']);
        Route::put('/api/anggaran/{id}', [AnggaranController::class, 'update']);
        Route::delete('/api/anggaran/{id}', [AnggaranController::class, 'destroy']);

        // Modul Approval
        Route::put('/api/transaksi/rpd/{id}/approve', [TransaksiController::class, 'approveRpd']);
        Route::put('/api/transaksi/realisasi/{id}/approve', [TransaksiController::class, 'approveRealisasi']);

        // Penguncian Periode Laporan (Tutup Buku)
        Route::post('/api/cut-offs/toggle', [CutOffController::class, 'toggle']);
    });
});


// ==============================================================================
// 2. ROUTE FRONTEND (REACT SPA)
// ==============================================================================

Route::get('/login', function () {
    return view('dashboard');
})->name('login');

Route::get('/register', function () {
    return view('dashboard');
})->name('register');

Route::get('/dashboard/{any?}', function () {
    return view('dashboard');
})->where('any', '.*');

Route::get('/', function () {
    return view('dashboard');
});

Route::get('/home', function () {
    return redirect('/dashboard');
});
