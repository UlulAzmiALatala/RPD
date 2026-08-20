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
        Schema::create('satkers', function (Blueprint $table) {
            $table->id();
            $table->string('kode_eselon', 10)->nullable(); // cth: 01
            $table->string('kode_satker', 20)->unique(); // cth: 692028 (Harus unik karena jadi acuan)
            $table->string('nama_satker'); // cth: DIPA SETJEN
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('satkers');
    }
};
