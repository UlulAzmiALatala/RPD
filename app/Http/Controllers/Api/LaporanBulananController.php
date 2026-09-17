<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Satker;
use App\Models\Anggaran;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;

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
                // 1. Ambil Anggaran (Pagu per Jenis Belanja)
                $anggaran = Anggaran::where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->first();

                $paguTotal = $anggaran ? $anggaran->pagu_efektif : 0;
                $paguGaji = $anggaran ? $anggaran->belanja_gaji : 0;
                $paguBarang = $anggaran ? $anggaran->belanja_barang : 0;
                $paguModal = $anggaran ? $anggaran->belanja_modal : 0;

                // 2. Ambil Data RPD & Realisasi (KUMULATIF)
                $rpds = RencanaPenarikan::where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->where('bulan', '<=', $bulan)
                    ->where('status', 'approved')
                    ->get();

                $realisasis = Realisasi::where('satker_id', $satker->id)
                    ->where('tahun', $tahun)
                    ->where('bulan', '<=', $bulan)
                    ->where('status', 'approved')
                    ->get();

                // 3. Kalkulasi Kumulatif per Jenis Belanja
                $rpdGaji = $rpds->sum('belanja_gaji');
                $rpdBarang = $rpds->sum('belanja_barang');
                $rpdModal = $rpds->sum('belanja_modal');

                $realGaji = $realisasis->sum('belanja_gaji');
                $realBarang = $realisasis->sum('belanja_barang');
                $realModal = $realisasis->sum('belanja_modal');

                // TOTAL KUMULATIF
                $totalRpd = $rpdGaji + $rpdBarang + $rpdModal;
                $totalRealisasi = $realGaji + $realBarang + $realModal;
                $totalDeviasiNominal = abs($totalRealisasi - $totalRpd); // Deviasi Total Absolut

                // 4. MENGHITUNG NILAI IKPA HAL III DIPA (Logika Kemenkeu)
                $totalDeviasiTertimbang = 0;

                // Helper Function untuk menghitung % Deviasi Tertimbang per Jenis Belanja
                $hitungDeviasiTertimbang = function ($rpd, $realisasi, $paguBelanja, $paguGlobal) {
                    if ($paguGlobal <= 0 || $rpd <= 0) return 0; // Hindari pembagian nol

                    // A. Deviasi Murni Absolut
                    $deviasiNominal = abs($realisasi - $rpd);

                    // B. Persentase Deviasi Murni
                    $persenDeviasiMurni = ($deviasiNominal / $rpd) * 100;

                    // C. Toleransi 5% Kemenkeu (Jika deviasi <= 5%, maka dianggap 0%)
                    if ($persenDeviasiMurni <= 5) {
                        $persenDeviasiMurni = 0;
                    }

                    // D. Proporsi Pagu Belanja
                    $proporsiPagu = $paguBelanja / $paguGlobal;

                    // E. % Deviasi Tertimbang
                    return $persenDeviasiMurni * $proporsiPagu;
                };

                // Hitung Deviasi Tertimbang masing-masing
                $devTertimbangGaji = $hitungDeviasiTertimbang($rpdGaji, $realGaji, $paguGaji, $paguTotal);
                $devTertimbangBarang = $hitungDeviasiTertimbang($rpdBarang, $realBarang, $paguBarang, $paguTotal);
                $devTertimbangModal = $hitungDeviasiTertimbang($rpdModal, $realModal, $paguModal, $paguTotal);

                // Total Rata-rata Kumulatif (Jumlah dari deviasi tertimbang)
                $rataRataKumulatif = $devTertimbangGaji + $devTertimbangBarang + $devTertimbangModal;

                // 🔥 NILAI IKPA FINAL (100 - Rata-rata Kumulatif)
                // Batasi minimal 0 agar tidak minus
                $nilaiIkpa = max(0, 100 - $rataRataKumulatif);

                // 5. Susun Response Array untuk Frontend
                $laporan[] = [
                    'satker' => $satker,
                    'pagu_efektif' => $paguTotal,

                    // Detail RPD
                    'rpd_gaji' => $rpdGaji,
                    'rpd_barang' => $rpdBarang,
                    'rpd_modal' => $rpdModal,
                    'total_rpd' => $totalRpd,

                    // Detail Realisasi
                    'realisasi_gaji' => $realGaji,
                    'realisasi_barang' => $realBarang,
                    'realisasi_modal' => $realModal,
                    'total_realisasi' => $totalRealisasi,

                    // Detail Deviasi Nominal
                    'deviasi_gaji' => abs($realGaji - $rpdGaji),
                    'deviasi_barang' => abs($realBarang - $rpdBarang),
                    'deviasi_modal' => abs($realModal - $rpdModal),
                    'total_deviasi' => $totalDeviasiNominal, // Total Nominal

                    // Indikator Kinerja Kemenkeu
                    'deviasi_tertimbang_kumulatif' => round($rataRataKumulatif, 2), // Ini nilai yang akan mengurangi 100
                    'nilai_ikpa' => round($nilaiIkpa, 2), // IKPA Hal III DIPA (Valid!)
                    'persentase_penyerapan' => $paguTotal > 0 ? round(($totalRealisasi / $paguTotal) * 100, 2) : 0
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
