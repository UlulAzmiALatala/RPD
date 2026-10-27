<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('realisasi_details', function (Blueprint $table) {
            // Menambahkan foreign key ke tabel rincian_outputs
            // Dibuat nullable() agar data lama yang belum punya RO tidak error
            $table->foreignId('rincian_output_id')->nullable()->after('realisasi_id')->constrained('rincian_outputs')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('realisasi_details', function (Blueprint $table) {
            $table->dropForeign(['rincian_output_id']);
            $table->dropColumn('rincian_output_id');
        });
    }
};
