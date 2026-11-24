<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pdf_settings', function (Blueprint $table) {
            $table->id();
            $table->string('instansi_baris_1', 200)->default('KEMENTERIAN HUKUM REPUBLIK INDONESIA');
            $table->string('instansi_baris_2', 200)->default('KANTOR WILAYAH SULAWESI TENGAH');
            $table->string('alamat_kop', 350)->default('Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud');
            $table->string('kota_ttd', 100)->default('Palu');
            $table->string('jabatan_ttd', 150)->default('Kepala Kantor Wilayah,');
            $table->string('nama_pejabat', 150)->default('Rakhmat Renaldy, S.H., M.H.');
            $table->string('nip_pejabat', 50)->default('197310101996031001');
            $table->string('catatan_kaki', 350)->nullable()->default('Dokumen dicetak secara otomatis dari Sistem Informasi Realisasi Anggaran (SIRA) 2.0 (Skala 65 Poin). Tidak memerlukan cap basah.');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pdf_settings');
    }
};
