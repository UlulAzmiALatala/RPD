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
        Schema::create('realisasis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('satker_id')->constrained('satkers')->onDelete('cascade');
            $table->year('tahun');
            $table->tinyInteger('bulan');

            $table->bigInteger('belanja_gaji')->default(0);
            $table->bigInteger('belanja_barang')->default(0);
            $table->bigInteger('belanja_modal')->default(0);

            $table->timestamps();

            $table->unique(['satker_id', 'tahun', 'bulan']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('realisasis');
    }
};
