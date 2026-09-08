<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',         // <-- Tambahan
        'kode_satker',  // <-- Tambahan
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // =========================================================
    // RELASI & HELPER ROLE
    // =========================================================

    /**
     * Relasi ke tabel Satker.
     * Karena user pakai 'kode_satker' (string), kita hubungkan dengan 'kode_satker' di tabel Satker.
     */
    public function satker()
    {
        return $this->belongsTo(Satker::class, 'kode_satker', 'kode_satker');
    }

    // Cek apakah dia Admin Kanwil
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    // Cek apakah dia Operator Satker
    public function isSatker()
    {
        return $this->role === 'satker';
    }
}
