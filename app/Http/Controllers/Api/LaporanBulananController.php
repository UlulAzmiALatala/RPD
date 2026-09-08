<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Satker;
use App\Models\Anggaran;
use App\Models\RencanaPenarikan; // <-- Import Model RPD
use App\Models\Realisasi;        // <-- Import Model Realisasi

class LaporanBulananController extends Controller
{
    public function index(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $bulan = $request->query('bulan', date('m'));

            $satkers = Satker::all();
            $laporan = [];

            foreach ($satkers as $satker) {
                // 1. Ambil Pagu Efektif
                $anggaran = Anggaran::where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->first();
                $paguEfektif = $anggaran ? $anggaran->pagu_efektif : 0;

                // 2. Ambil Data RPD pake Eloquent (Lebih bersih daripada DB::table)
                $rpd = RencanaPenarikan::where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->where('bulan', $bulan)
                    ->first();

                // 3. Ambil Data Realisasi pake Eloquent
                $realisasi = Realisasi::where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->where('bulan', $bulan)
                    ->first();

                // 4. Kalkulasi Total
                $totalRpd = $rpd ? ($rpd->belanja_gaji + $rpd->belanja_barang + $rpd->belanja_modal) : 0;
                $totalRealisasi = $realisasi ? ($realisasi->belanja_gaji + $realisasi->belanja_barang + $realisasi->belanja_modal) : 0;

                // 5. Kalkulasi Deviasi
                // Minus = Kurang serap (Realisasi di bawah RPD)
                // Plus = Over serap (Realisasi di atas RPD)
                $deviasi = $totalRealisasi - $totalRpd;

                // 6. Persentase Penyerapan dari Pagu Efektif
                $persentase = $paguEfektif > 0 ? round(($totalRealisasi / $paguEfektif) * 100, 2) : 0;

                $laporan[] = [
                    'satker' => $satker,
                    'pagu_efektif' => $paguEfektif,
                    'total_rpd' => $totalRpd,
                    'total_realisasi' => $totalRealisasi,
                    'deviasi' => $deviasi,
                    'persentase_penyerapan' => $persentase
                ];
            }

            return response()->json([
                'status' => 'success',
                'tahun' => $tahun,
                'bulan' => $bulan,
                'data' => $laporan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Detail Error Laravel: ' . $e->getMessage()
            ], 500);
        }
    }
}
