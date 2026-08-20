<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Satker extends Model
{
    use HasFactory;

    protected $fillable = [
        'kode_eselon',
        'kode_satker',
        'nama_satker'
    ];

    // Relasi: 1 Satker punya banyak data Anggaran (per tahun)
    public function anggarans(): HasMany
    {
        return $this->hasMany(Anggaran::class);
    }

    // Relasi: 1 Satker punya banyak data RPD (per bulan)
    public function rencanaPenarikans(): HasMany
    {
        return $this->hasMany(RencanaPenarikan::class);
    }

    // Relasi: 1 Satker punya banyak data Realisasi (per bulan)
    public function realisasis(): HasMany
    {
        return $this->hasMany(Realisasi::class);
    }
}
