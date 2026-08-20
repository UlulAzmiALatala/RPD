<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransaksiController; // Tambahkan ini

Route::get('/', function () {
    return view('welcome');
});

// Grup Route yang dilindungi otentikasi
Route::middleware(['auth'])->group(function () {

    // Route Dashboard
    Route::get('/dashboard/{any?}', function () {
        return view('dashboard');
    })->where('any', '.*')->name('dashboard');

    // Route API Dashboard
    Route::get('/api/dashboard-data', [DashboardController::class, 'index'])->name('api.dashboard');

    // Route API Transaksi - RPD
    Route::get('/api/transaksi/rpd', [TransaksiController::class, 'getRpd']);
    Route::post('/api/transaksi/rpd', [TransaksiController::class, 'storeRpd']);
    Route::put('/api/transaksi/rpd/{id}', [TransaksiController::class, 'updateRpd']); // Edit RPD
    Route::delete('/api/transaksi/rpd/{id}', [TransaksiController::class, 'destroyRpd']); // Hapus RPD

    // Route API Transaksi - REALISASI
    Route::get('/api/transaksi/realisasi', [TransaksiController::class, 'getRealisasi']);
    Route::post('/api/transaksi/realisasi', [TransaksiController::class, 'storeRealisasi']);
    Route::put('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'updateRealisasi']); // Edit Realisasi
    Route::delete('/api/transaksi/realisasi/{id}', [TransaksiController::class, 'destroyRealisasi']); // Hapus Realisasi

    // Route API Laporan
    Route::get('/api/laporan/realisasi-satker', [TransaksiController::class, 'getLaporanRealisasi']);
});

Route::get('/home', function () {
    return redirect('/dashboard');
});
