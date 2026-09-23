<?php

namespace App\Models;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RealisasiOutput extends Model
{
    use HasFactory;

    protected $table = 'realisasi_outputs';

    protected $fillable = [
        'rincian_output_id',
        'bulan',
        'realisasi_volume',
        'realisasi_anggaran',
        'progress_capaian',
        'keterangan',
    ];

    // Laporan realisasi ini milik 1 Target RO
    public function rincianOutput()
    {
        return $this->belongsTo(RincianOutput::class, 'rincian_output_id');
    }
}
