<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevisiDipa extends Model
{
    use HasFactory;

    protected $table = 'revisi_dipas';

    protected $fillable = [
        'anggaran_id',
        'satker_id',
        'tahun',
        'triwulan',
        'tanggal_revisi',
        'nomor_revisi',
        'jenis_revisi',
        'pagu_sebelum',
        'pagu_sesudah',
        'keterangan',
        'created_by',
    ];

    protected $casts = [
        'tanggal_revisi' => 'date:Y-m-d',
        'pagu_sebelum' => 'integer',
        'pagu_sesudah' => 'integer',
    ];

    public function anggaran(): BelongsTo
    {
        return $this->belongsTo(Anggaran::class);
    }

    public function satker(): BelongsTo
    {
        return $this->belongsTo(Satker::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
