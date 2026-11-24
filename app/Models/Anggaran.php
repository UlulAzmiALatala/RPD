<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Anggaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'satker_id',
        'tahun',
        'belanja_gaji',
        'belanja_barang',
        'belanja_modal',
        'blokir_gaji',
        'blokir_barang',
        'blokir_modal',
        'total_pagu',
        'pagu_blokir',
        'pagu_efektif'
    ];

    public function satker(): BelongsTo
    {
        return $this->belongsTo(Satker::class);
    }

    public function revisiDipas(): HasMany
    {
        return $this->hasMany(RevisiDipa::class, 'anggaran_id');
    }
}
