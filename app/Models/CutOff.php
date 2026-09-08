<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CutOff extends Model
{
    use HasFactory;

    protected $fillable = ['tahun', 'bulan', 'is_closed'];

    // Pastikan is_closed selalu terbaca sebagai boolean (true/false)
    protected $casts = [
        'is_closed' => 'boolean',
    ];
}
