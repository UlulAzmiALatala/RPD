<?php

namespace App\Traits;

use App\Models\CutOff;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;

trait CheckCutOffTrait
{
    /**
     * Memvalidasi apakah bulan transaksi sudah ditutup.
     * 
     * @param string $tanggal Format YYYY-MM-DD
     * @param bool $isAdmin Hak akses admin untuk Bypass
     */
    public function validateCutOff($tanggal, $isAdmin = false)
    {
        // 1. Jika Super Admin Kanwil, langsung BYPASS (Bebas)
        if ($isAdmin) {
            return true;
        }

        // 2. Ekstrak Bulan dan Tahun dari tanggal
        $date = Carbon::parse($tanggal);
        $bulan = $date->month;
        $tahun = $date->year;

        // 3. Cek ke database CutOff
        $cutoff = CutOff::where('tahun', $tahun)->where('bulan', $bulan)->first();

        // 4. Jika digembok, lemparkan error 403
        if ($cutoff && $cutoff->is_closed) {
            throw new HttpResponseException(response()->json([
                'status' => 'error',
                'message' => "Operasi Ditolak! Laporan untuk periode Bulan {$bulan} Tahun {$tahun} telah dikunci (Tutup Buku)."
            ], 403));
        }

        return true;
    }
}
