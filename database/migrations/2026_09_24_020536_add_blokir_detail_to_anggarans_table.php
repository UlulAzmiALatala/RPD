<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('anggarans', function (Blueprint $table) {
            $table->decimal('blokir_gaji', 20, 2)->default(0)->after('belanja_modal');
            $table->decimal('blokir_barang', 20, 2)->default(0)->after('blokir_gaji');
            $table->decimal('blokir_modal', 20, 2)->default(0)->after('blokir_barang');
        });
    }

    public function down()
    {
        Schema::table('anggarans', function (Blueprint $table) {
            $table->dropColumn(['blokir_gaji', 'blokir_barang', 'blokir_modal']);
        });
    }
};
