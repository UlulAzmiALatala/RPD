<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'description',
        'ip_address'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Fungsi Ajaib untuk merekam jejak (CCTV)
    public static function record($action, $module, $description)
    {
        self::create([
            'user_id' => auth()->id(), // Otomatis deteksi siapa yang lagi login
            'action' => $action,       // CREATE, UPDATE, DELETE
            'module' => $module,       // TRANSAKSI, ANGGARAN, USER
            'description' => $description,
            'ip_address' => request()->ip() // Rekam IP Address untuk Audit
        ]);
    }
}
