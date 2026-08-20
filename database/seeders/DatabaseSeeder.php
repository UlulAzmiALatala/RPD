<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Akun Admin (Tim Keuangan)
        User::create([
            'name' => 'Admin Keuangan',
            'email' => 'admin@kemenkum.go.id',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'kode_satker' => null,
        ]);

        // 2. Akun Operator Satker (Contoh: DIPA SETJEN)
        User::create([
            'name' => 'Operator DIPA SETJEN',
            'email' => 'setjen@kemenkum.go.id',
            'password' => Hash::make('password123'),
            'role' => 'satker',
            'kode_satker' => '692028', // Sesuai kode di Excel
        ]);
    }
}
