<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

class PdfSetting extends Model
{
    use HasFactory;

    protected $table = 'pdf_settings';

    protected $fillable = [
        'logo_path',
        'instansi_baris_1',
        'instansi_baris_2',
        'alamat_kop',
        'kota_ttd',
        'jabatan_ttd',
        'nama_pejabat',
        'nip_pejabat',
        'catatan_kaki',
        'updated_by',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? '/storage/' . ltrim($this->logo_path, '/') : null;
    }

    /**
     * Mengonversi file logo di storage menjadi Data URI Base64
     * agar 100% stabil saat dirender oleh DomPDF di Windows maupun Linux.
     */
    public function getLogoBase64(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }

        $fullPath = storage_path('app/public/' . ltrim($this->logo_path, '/'));
        if (!file_exists($fullPath) || !is_readable($fullPath)) {
            return null;
        }

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        $mimeMap = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
        ];
        $mime = $mimeMap[$ext] ?? 'image/png';
        $data = file_get_contents($fullPath);

        if ($data === false) {
            return null;
        }

        return 'data:' . $mime . ';base64,' . base64_encode($data);
    }

    public static function defaults(): array
    {
        return [
            'logo_path' => null,
            'instansi_baris_1' => 'KEMENTERIAN HUKUM REPUBLIK INDONESIA',
            'instansi_baris_2' => 'KANTOR WILAYAH SULAWESI TENGAH',
            'alamat_kop' => 'Jalan Dewi Sartika No. 74, Palu Selatan, Kota Palu, Sulawesi Tengah 94114 | Laman: silakum.kemenkumsulteng.cloud',
            'kota_ttd' => 'Palu',
            'jabatan_ttd' => 'Kepala Kantor Wilayah,',
            'nama_pejabat' => 'Rakhmat Renaldy, S.H., M.H.',
            'nip_pejabat' => '197310101996031001',
            'catatan_kaki' => 'Dokumen dicetak secara otomatis dari Sistem Informasi Realisasi Anggaran (SIRA) 2.0 (Skala 65 Poin). Tidak memerlukan cap basah.',
        ];
    }

    public static function current(): self
    {
        try {
            if (Schema::hasTable('pdf_settings')) {
                $setting = self::with(['editor' => fn($q) => $q->select('id', 'name')])->first();
                if ($setting) {
                    return $setting;
                }
            }
        } catch (\Throwable $e) {
            // Fallback aman ke default jika tabel belum siap
        }

        return new self(self::defaults());
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
