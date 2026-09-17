<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rencana_penarikans', function (Blueprint $table) {
            // draft = Baru diinput satker, approved = disetujui admin, rejected = ditolak admin
            $table->enum('status', ['draft', 'approved', 'rejected'])->default('draft')->after('belanja_modal');
            $table->text('catatan_revisi')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('rencana_penarikans', function (Blueprint $table) {
            $table->dropColumn(['status', 'catatan_revisi']);
        });
    }
};
