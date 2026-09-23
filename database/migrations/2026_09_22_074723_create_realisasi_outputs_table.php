<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('realisasi_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rincian_output_id')->constrained('rincian_outputs')->onDelete('cascade');
            $table->integer('bulan'); // 1 s.d 12
            $table->decimal('realisasi_volume', 15, 2)->default(0); // Tambah berapa volumenya bulan ini
            $table->decimal('realisasi_anggaran', 20, 2)->default(0); // Terserap berapa rupiah bulan ini
            $table->decimal('progress_capaian', 5, 2)->default(0); // % Progress Capaian (PC) ala SAKTI
            $table->text('keterangan')->nullable(); // Alasan kalau telat atau kendala
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('realisasi_outputs');
    }
};
