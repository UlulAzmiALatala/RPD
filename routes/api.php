<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Import Controller yang sudah kita buat
use App\Http\Controllers\Api\AnggaranController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Semua rute di dalam grup ini wajib LOGIN (dijaga oleh Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Tarik data user yang sedang login
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ---------------------------------------------------------------------
    // DASHBOARD & DATA UMUM
    // ---------------------------------------------------------------------
    Route::get('/dashboard-data', [DashboardController::class, 'index']);

    // ---------------------------------------------------------------------
    // TRANSAKSI RPD & REALISASI
    // ---------------------------------------------------------------------
    Route::get('/transaksi/rpd', [TransaksiController::class, 'getRpd']);
    Route::post('/transaksi/rpd', [TransaksiController::class, 'storeRpd']);
    Route::put('/transaksi/rpd/{id}', [TransaksiController::class, 'updateRpd']);
    Route::delete('/transaksi/rpd/{id}', [TransaksiController::class, 'destroyRpd']);

    Route::get('/transaksi/realisasi', [TransaksiController::class, 'getRealisasi']);
    Route::post('/transaksi/realisasi', [TransaksiController::class, 'storeRealisasi']);
    Route::put('/transaksi/realisasi/{id}', [TransaksiController::class, 'updateRealisasi']);
    Route::delete('/transaksi/realisasi/{id}', [TransaksiController::class, 'destroyRealisasi']);

    Route::get('/transaksi/summary', [TransaksiController::class, 'getSummary']);
    Route::get('/laporan/realisasi-satker', [TransaksiController::class, 'getLaporanRealisasi']);

    // ---------------------------------------------------------------------
    // MASTER ANGGARAN (Khusus Admin)
    // ---------------------------------------------------------------------
    Route::get('/anggaran', [AnggaranController::class, 'index']);
    Route::post('/anggaran', [AnggaranController::class, 'store']);
    Route::put('/anggaran/{id}', [AnggaranController::class, 'update']);
    Route::delete('/anggaran/{id}', [AnggaranController::class, 'destroy']);

    // ---------------------------------------------------------------------
    // MANAJEMEN USER (Khusus Admin)
    // ---------------------------------------------------------------------
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});
