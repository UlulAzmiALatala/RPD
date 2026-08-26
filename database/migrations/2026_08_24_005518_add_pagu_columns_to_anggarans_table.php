<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anggarans', function (Blueprint $table) {
            // Kita pakai tipe data decimal/double untuk nominal besar
            $table->double('total_pagu')->default(0)->after('belanja_modal');
            $table->double('pagu_blokir')->default(0)->after('total_pagu');
            $table->double('pagu_efektif')->default(0)->after('pagu_blokir');
        });
    }

    public function down(): void
    {
        Schema::table('anggarans', function (Blueprint $table) {
            // Drop kolom jika kita melakukan rollback
            $table->dropColumn(['total_pagu', 'pagu_blokir', 'pagu_efektif']);
        });
    }
};
