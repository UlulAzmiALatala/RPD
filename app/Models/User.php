<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'kode_satker',
        'nip',
        'no_hp',
        'avatar',
        'is_active',
        'must_change_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $appends = [
        'two_factor_enabled',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'must_change_password' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    // Status 2FA aman dikirim ke frontend tanpa membocorkan secret key
    public function getTwoFactorEnabledAttribute(): bool
    {
        return !is_null($this->two_factor_secret) && !is_null($this->two_factor_confirmed_at);
    }

    // =========================================================
    // RELASI & HELPER ROLE
    // =========================================================
    public function satker()
    {
        return $this->belongsTo(Satker::class, 'kode_satker', 'kode_satker');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSatker(): bool
    {
        return $this->role === 'satker';
    }
}
