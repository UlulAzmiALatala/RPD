<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revisi_dipas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anggaran_id')->constrained('anggarans')->onDelete('cascade');
            $table->foreignId('satker_id')->constrained('satkers')->onDelete('cascade');
            $table->year('tahun');
            $table->enum('triwulan', ['I', 'II', 'III', 'IV']);
            $table->date('tanggal_revisi');
            $table->string('nomor_revisi', 100)->nullable();
            // Standar IKPA Kemenkeu: hanya 'pagu_tetap' yang mengurangi skor jika > 1x per TW
            $table->enum('jenis_revisi', ['pagu_tetap', 'pagu_berubah'])->default('pagu_tetap');
            $table->bigInteger('pagu_sebelum')->default(0);
            $table->bigInteger('pagu_sesudah')->default(0);
            $table->text('keterangan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['satker_id', 'tahun', 'triwulan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revisi_dipas');
    }
};
