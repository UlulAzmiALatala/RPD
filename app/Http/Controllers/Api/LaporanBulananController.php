<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Satker;
use App\Models\Anggaran;
use Illuminate\Support\Facades\DB;

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
                // Ambil Pagu Efektif
                $anggaran = Anggaran::where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->first();
                $paguEfektif = $anggaran ? $anggaran->pagu_efektif : 0;

                // Ambil Data RPD (Sudah disesuaikan dengan nama tabel di database)
                $rpd = DB::table('rencana_penarikans')
                    ->where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->where('bulan', $bulan)
                    ->first();

                // Ambil Data Realisasi (Sudah disesuaikan dengan nama tabel di database)
                $realisasi = DB::table('realisasis')
                    ->where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->where('bulan', $bulan)
                    ->first();

                // Kalkulasi Total
                $totalRpd = $rpd ? ($rpd->belanja_gaji + $rpd->belanja_barang + $rpd->belanja_modal) : 0;
                $totalRealisasi = $realisasi ? ($realisasi->belanja_gaji + $realisasi->belanja_barang + $realisasi->belanja_modal) : 0;

                // Kalkulasi Deviasi
                $deviasi = $totalRealisasi - $totalRpd;

                // Persentase Penyerapan dari Pagu Efektif
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
