<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rincian_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('satker_id')->constrained('satkers')->onDelete('cascade');
            $table->year('tahun');
            $table->string('kode_ro')->nullable(); // Misal: 4258.EBA.962
            $table->string('nama_ro'); // Misal: Pembinaan Narapidana
            $table->string('satuan'); // Misal: Orang, Layanan, Dokumen
            $table->decimal('target_volume', 15, 2); // Misal: 500
            $table->decimal('pagu_anggaran', 20, 2); // Rp 3.000.000.000
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rincian_outputs');
    }
};
