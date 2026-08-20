<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\DashboardController;


Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth'])->group(function () {

    // 1. Route untuk memuat halaman HTML + React
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    // 2. Route API untuk menyuplai data ke React
    Route::get('/api/dashboard-data', [DashboardController::class, 'index'])->name('api.dashboard');
});

Route::get('/home', function () {
    return redirect('/dashboard');
});
