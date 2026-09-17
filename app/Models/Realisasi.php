<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Realisasi extends Model
{
    use HasFactory;

    protected $fillable = [
        'satker_id',
        'tahun',
        'bulan',
        'belanja_gaji',
        'belanja_barang',
        'belanja_modal',
        'status',         // <-- Tambahan untuk fitur Approval
        'catatan_revisi'  // <-- Tambahan untuk catatan penolakan
    ];

    public function satker(): BelongsTo
    {
        return $this->belongsTo(Satker::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(RealisasiDetail::class, 'realisasi_id');
    }
}
