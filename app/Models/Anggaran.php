<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Anggaran extends Model
{
    use HasFactory;

    protected $fillable = [
        'satker_id',
        'tahun',
        'belanja_gaji',
        'belanja_barang',
        'belanja_modal'
    ];

    // Relasi: Anggaran ini milik 1 Satker
    public function satker(): BelongsTo
    {
        return $this->belongsTo(Satker::class);
    }
}
