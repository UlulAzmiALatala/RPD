<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- Tambahan Import HasMany

class Realisasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'satker_id',
        'tahun',
        'bulan',
        'belanja_gaji',
        'belanja_barang',
        'belanja_modal'
    ];

    public function satker(): BelongsTo
    {
        return $this->belongsTo(Satker::class);
    }

    // <-- Tambahan Relasi ke Detail (Anak) -->
    public function details(): HasMany
    {
        return $this->hasMany(RealisasiDetail::class, 'realisasi_id');
    }
}
