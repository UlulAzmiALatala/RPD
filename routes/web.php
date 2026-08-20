<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// 1. Halaman Utama / Landing Page
Route::get('/', function () {
    return view('welcome');
});

// 2. Halaman Dashboard (Hanya bisa diakses jika sudah login)
Route::get('/dashboard', function () {
    return "<h1>Selamat Datang di Dashboard!</h1><p>Anda berhasil login.</p><form action='" . route('logout') . "' method='POST'>" . csrf_field() . "<button type='submit'>Logout</button></form>";
})->middleware(['auth'])->name('dashboard');

// 3. Fallback Route untuk mengalihkan rute /home bawaan Fortify ke /dashboard
Route::get('/home', function () {
    return redirect('/dashboard');
});
