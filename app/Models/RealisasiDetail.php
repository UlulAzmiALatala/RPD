<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RealisasiDetail extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relasi balik ke Induk
    public function realisasi()
    {
        return $this->belongsTo(Realisasi::class, 'realisasi_id');
    }
}
