<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('anggarans', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke tabel satkers
            $table->foreignId('satker_id')->constrained('satkers')->onDelete('cascade');
            $table->year('tahun'); // cth: 2025

            // Tipe BigInteger karena nominal uang miliaran
            $table->bigInteger('belanja_gaji')->default(0);
            $table->bigInteger('belanja_barang')->default(0);
            $table->bigInteger('belanja_modal')->default(0);

            $table->timestamps();

            // Mencegah duplikasi data: 1 Satker hanya boleh punya 1 Anggaran di tahun yang sama
            $table->unique(['satker_id', 'tahun']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anggarans');
    }
};
