<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anggaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'satker_id',
        'tahun',
        'belanja_gaji',
        'belanja_barang',
        'belanja_modal',
        'blokir_gaji',      // 🔥 KOLOM BARU
        'blokir_barang',    // 🔥 KOLOM BARU
        'blokir_modal',     // 🔥 KOLOM BARU
        'total_pagu',
        'pagu_blokir',
        'pagu_efektif'
    ];

    public function satker()
    {
        return $this->belongsTo(Satker::class);
    }
}
