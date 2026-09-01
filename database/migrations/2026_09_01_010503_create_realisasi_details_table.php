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
        Schema::create('realisasi_details', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel induk (realisasis)
            $table->foreignId('realisasi_id')->constrained('realisasis')->onDelete('cascade');

            // Jenis belanja untuk grouping nanti
            $table->enum('jenis_belanja', ['gaji', 'barang', 'modal']);

            // Rincian / Uraian pengeluaran
            $table->string('uraian');

            // Nominal per item
            $table->decimal('nominal', 15, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realisasi_details');
    }
};
