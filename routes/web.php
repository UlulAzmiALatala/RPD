<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\AnggaranController;
use App\Http\Controllers\Api\LaporanBulananController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ActivityLogController;

// ==============================================================================
// 1. ROUTE API (Tetap dipertahankan di sini, dilindungi Auth)
// ==============================================================================
Route::middleware(['auth'])->group(function () {

    // Route User Session
    Route::get('/api/user', function (Request $request) {
        return $request->user();
    });

    // Route API Profil (BARU)
    Route::post('/api/profile', [ProfileController::class, 'update']);

    // Route API Dashboard
    Route::get('/api/dashboard-data', [DashboardController::class, 'index'])->name('api.dashboard');

    // Route API Transaksi - RPD
    Route::get('/api/transaksi/rpd', [TransaksiController::class, 'getRpd']);
    Route::post('/api/transaksi/rpd', [TransaksiController::class, 'storeRpd']);
    Route::put('/api/transaksi/rpd/{id}', [TransaksiController::class, 'updateRpd']);
    Route::delete('/api/transaksi/rpd/{id}', [TransaksiController::class, 'destroyRpd']);
    Route::get('/api/transaksi/summary', [TransaksiController::class, 'getSummary']);

    // Route API Transaksi - REALISASI
    Route::get('/api/transaksi/realisasi', [TransaksiController::class, 'getRealisasi']);
    Route::post('/api/transaksi/realisasi', [TransaksiController::class, 'storeRealisasi']);
    Route::put('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'updateRealisasi']);
    Route::delete('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'destroyRealisasi']);

    // Route API Laporan
    Route::get('/api/laporan/realisasi-satker', [TransaksiController::class, 'getLaporanRealisasi']);
    Route::get('/api/laporan/bulanan', [LaporanBulananController::class, 'index']);

    // Route API Master Anggaran
    Route::get('/api/anggaran', [AnggaranController::class, 'index']);
    Route::post('/api/anggaran', [AnggaranController::class, 'store']);
    Route::put('/api/anggaran/{id}', [AnggaranController::class, 'update']);
    Route::delete('/api/anggaran/{id}', [AnggaranController::class, 'destroy']);

    // Route API Manajemen User (BARU)
    Route::get('/api/users', [UserController::class, 'index']);
    Route::post('/api/users', [UserController::class, 'store']);
    Route::put('/api/users/{id}', [UserController::class, 'update']);
    Route::delete('/api/users/{id}', [UserController::class, 'destroy']);

    Route::get('/api/activity-logs', [ActivityLogController::class, 'index']);
});


// ==============================================================================
// 2. ROUTE FRONTEND (REACT SPA)
// ==============================================================================

// Halaman Auth (Biar Fortify nggak bingung nyari view login)
Route::get('/login', function () {
    return view('dashboard');
})->name('login');

Route::get('/register', function () {
    return view('dashboard');
})->name('register');

// Halaman Dashboard & isinya
Route::get('/dashboard/{any?}', function () {
    return view('dashboard');
})->where('any', '.*');

// Halaman Root (Arahkan ke view React juga, nanti React yang me-redirect ke dashboard/login)
Route::get('/', function () {
    return view('dashboard');
});

Route::get('/home', function () {
    return redirect('/dashboard');
});
