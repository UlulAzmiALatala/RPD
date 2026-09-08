<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            // User yang melakukan aksi (bisa null kalau misalnya gagal login/system error)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('action'); // Contoh: CREATE, UPDATE, DELETE
            $table->string('module'); // Contoh: TRANSAKSI_RPD, MASTER_USER, PROFIL
            $table->text('description'); // Contoh detail: "Menambahkan Realisasi Bulan 3 sebesar 50Jt"
            $table->string('ip_address')->nullable(); // Rekam IP Address untuk audit BPK

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
