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
        Schema::create('rencana_penarikans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('satker_id')->constrained('satkers')->onDelete('cascade');
            $table->year('tahun');
            $table->tinyInteger('bulan'); // 1 = Januari, 12 = Desember

            $table->bigInteger('belanja_gaji')->default(0);
            $table->bigInteger('belanja_barang')->default(0);
            $table->bigInteger('belanja_modal')->default(0);

            $table->timestamps();

            // 1 Satker hanya boleh punya 1 RPD per bulan di tahun yang sama
            $table->unique(['satker_id', 'tahun', 'bulan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rencana_penarikans');
    }
};
