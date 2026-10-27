<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RealisasiDetail extends Model
{
    use HasFactory;

    // Mengizinkan semua kolom diisi (mass assignment)
    protected $guarded = [];

    // Relasi balik ke Induk (Transaksi Utama)
    public function realisasi()
    {
        return $this->belongsTo(Realisasi::class, 'realisasi_id');
    }

    // 🔥 FITUR BARU: Relasi ke Master RO (Integrasi Uang & Fisik)
    public function rincianOutput()
    {
        return $this->belongsTo(RincianOutput::class, 'rincian_output_id');
    }
}
