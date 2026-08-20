<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
