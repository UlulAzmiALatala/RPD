<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RincianOutput extends Model
{
    use HasFactory;

    protected $table = 'rincian_outputs';

    protected $fillable = [
        'satker_id',
        'tahun',
        'kode_ro',
        'nama_ro',
        'satuan',
        'target_volume',
        'pagu_anggaran',
    ];

    // RO ini milik 1 Satker
    public function satker()
    {
        return $this->belongsTo(Satker::class, 'satker_id');
    }

    // RO ini punya banyak laporan realisasi bulanan
    public function realisasiOutputs()
    {
        return $this->hasMany(RealisasiOutput::class, 'rincian_output_id');
    }
}
