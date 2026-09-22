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
    // =====================================================================
    // 🧠 HELPER: TARGET TRIWULAN KEMENKEU & KONVERSI BULAN
    // =====================================================================
    private function getTargetKemenkeu(string $tw, string $jenisBelanja): int
    {
        $target = [
            '51' => ['I' => 20, 'II' => 50, 'III' => 75, 'IV' => 95], // Belanja Gaji
            '52' => ['I' => 15, 'II' => 50, 'III' => 70, 'IV' => 90], // Belanja Barang
            '53' => ['I' => 10, 'II' => 40, 'III' => 70, 'IV' => 90], // Belanja Modal
        ];
        return $target[$jenisBelanja][$tw] ?? 0;
    }

    private function getTriwulanAktif($bulan): string
    {
        $bulanInt = (int)$bulan;
        if ($bulanInt <= 3) return 'I';
        if ($bulanInt <= 6) return 'II';
        if ($bulanInt <= 9) return 'III';
        return 'IV';
    }

    private function hitungDataLaporanBulanan($tahun, $bulan)
    {
        $satkers = Satker::all();
        $laporan = [];
        $twAktif = $this->getTriwulanAktif($bulan);

        foreach ($satkers as $satker) {
            // 🔥 DETEKSI APAKAH SATKER INI ADALAH SETJEN
            $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
            $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

            // 1. Ambil Anggaran (Pagu per Jenis Belanja)
            $anggaran = Anggaran::where('satker_id', $satker->id)
                ->where('tahun', $tahun)
                ->first();

            $paguTotal = $anggaran ? $anggaran->pagu_efektif : 0;
            // Jika bukan Setjen, Pagu Gaji dipaksa 0 mutlak
            $paguGaji = ($isSetjen && $anggaran) ? $anggaran->belanja_gaji : 0;
            $paguBarang = $anggaran ? $anggaran->belanja_barang : 0;
            $paguModal = $anggaran ? $anggaran->belanja_modal : 0;

            // 2. Ambil Data RPD & Realisasi (KUMULATIF S/D BULAN INI)
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

            // 3. Kalkulasi Kumulatif per Jenis Belanja (Jika bukan Setjen, RPD & Realisasi Gaji dipaksa 0)
            $rpdGaji = $isSetjen ? $rpds->sum('belanja_gaji') : 0;
            $rpdBarang = $rpds->sum('belanja_barang');
            $rpdModal = $rpds->sum('belanja_modal');

            $realGaji = $isSetjen ? $realisasis->sum('belanja_gaji') : 0;
            $realBarang = $realisasis->sum('belanja_barang');
            $realModal = $realisasis->sum('belanja_modal');

            // TOTAL KUMULATIF
            $totalRpd = $rpdGaji + $rpdBarang + $rpdModal;
            $totalRealisasi = $realGaji + $realBarang + $realModal;
            $totalDeviasiNominal = abs($totalRealisasi - $totalRpd);

            // 4. MENGHITUNG NILAI IKPA HAL III DIPA (Logika Kemenkeu Murni)
            $hitungDeviasiTertimbang = function ($rpd, $realisasi, $paguBelanja, $paguGlobal) {
                if ($paguGlobal <= 0 || $rpd <= 0) return 0;

                $deviasiNominal = abs($realisasi - $rpd);
                $persenDeviasiMurni = ($deviasiNominal / $rpd) * 100;

                // Proporsi Pagu Belanja
                $proporsiPagu = $paguBelanja / $paguGlobal;

                return $persenDeviasiMurni * $proporsiPagu;
            };

            $devTertimbangGaji = $hitungDeviasiTertimbang($rpdGaji, $realGaji, $paguGaji, $paguTotal);
            $devTertimbangBarang = $hitungDeviasiTertimbang($rpdBarang, $realBarang, $paguBarang, $paguTotal);
            $devTertimbangModal = $hitungDeviasiTertimbang($rpdModal, $realModal, $paguModal, $paguTotal);

            $rataRataKumulatif = $devTertimbangGaji + $devTertimbangBarang + $devTertimbangModal;

            // 🔥 AMBANG BATAS IKPA 5%
            if ($rataRataKumulatif <= 5) {
                $nilaiIkpa = 100;
            } else {
                $nilaiIkpa = max(0, 100 - $rataRataKumulatif);
            }

            // Jika belum ada data RPD/Realisasi sama sekali
            if ($rpds->isEmpty() && $realisasis->isEmpty()) {
                $nilaiIkpa = '-';
                $rataRataKumulatif = 0;
            }

            // =========================================================
            // 5. 🔥 FITUR BARU: EVALUASI TARGET KEMENKEU & POIN SIRA
            // =========================================================
            $persenSerap51 = $paguGaji > 0 ? ($realGaji / $paguGaji) * 100 : 0;
            $persenSerap52 = $paguBarang > 0 ? ($realBarang / $paguBarang) * 100 : 0;
            $persenSerap53 = $paguModal > 0 ? ($realModal / $paguModal) * 100 : 0;

            $target51 = $this->getTargetKemenkeu($twAktif, '51');
            $target52 = $this->getTargetKemenkeu($twAktif, '52');
            $target53 = $this->getTargetKemenkeu($twAktif, '53');

            // MENGHITUNG POIN PENYERAPAN (Berdasarkan Nominal Asli sesuai DJPb)
            $targetNominal51 = $paguGaji * ($target51 / 100);
            $targetNominal52 = $paguBarang * ($target52 / 100);
            $targetNominal53 = $paguModal * ($target53 / 100);

            $totalTargetNominalTW = $targetNominal51 + $targetNominal52 + $targetNominal53;
            $totalRealisasiKumulatifTW = $realGaji + $realBarang + $realModal;

            $nilai_penyerapan = 0;
            if ($totalTargetNominalTW > 0) {
                $nilai_penyerapan = min(100, ($totalRealisasiKumulatifTW / $totalTargetNominalTW) * 100);
            } else if ($paguTotal == 0) {
                $nilai_penyerapan = 0;
            } else {
                $nilai_penyerapan = 100;
            }

            // KALKULASI POIN TERTIMBANG SIRA (10% & 20%)
            $ikpaNumeric = $nilaiIkpa === '-' ? 0 : (float)$nilaiIkpa;
            $tertimbang_hal_iii = round(($ikpaNumeric * 10) / 100, 2);
            $tertimbang_penyerapan = round(($nilai_penyerapan * 20) / 100, 2);
            $total_poin_sira = round($tertimbang_hal_iii + $tertimbang_penyerapan, 2);

            $evaluasi_tw = [
                'tw_aktif' => $twAktif,
                '51' => [
                    'target_persen' => $paguGaji > 0 ? $target51 : 0,
                    'realisasi_persen' => round($persenSerap51, 2),
                    'status' => $paguGaji > 0 ? ($persenSerap51 >= $target51 ? 'Lulus' : 'Gagal') : 'N/A'
                ],
                '52' => [
                    'target_persen' => $paguBarang > 0 ? $target52 : 0,
                    'realisasi_persen' => round($persenSerap52, 2),
                    'status' => $paguBarang > 0 ? ($persenSerap52 >= $target52 ? 'Lulus' : 'Gagal') : 'N/A'
                ],
                '53' => [
                    'target_persen' => $paguModal > 0 ? $target53 : 0,
                    'realisasi_persen' => round($persenSerap53, 2),
                    'status' => $paguModal > 0 ? ($persenSerap53 >= $target53 ? 'Lulus' : 'Gagal') : 'N/A'
                ],
                'poin' => [
                    'tertimbang_hal_iii' => $tertimbang_hal_iii,
                    'tertimbang_penyerapan' => $tertimbang_penyerapan,
                    'total_poin' => $total_poin_sira
                ]
            ];

            $laporan[] = [
                'satker' => $satker,
                'pagu_efektif' => $paguTotal,
                'rpd_gaji' => $rpdGaji,
                'rpd_barang' => $rpdBarang,
                'rpd_modal' => $rpdModal,
                'total_rpd' => $totalRpd,
                'realisasi_gaji' => $realGaji,
                'realisasi_barang' => $realBarang,
                'realisasi_modal' => $realModal,
                'total_realisasi' => $totalRealisasi,
                'deviasi_gaji' => abs($realGaji - $rpdGaji),
                'deviasi_barang' => abs($realBarang - $rpdBarang),
                'deviasi_modal' => abs($realModal - $rpdModal),
                'total_deviasi' => $totalDeviasiNominal,
                'deviasi_tertimbang_kumulatif' => is_numeric($rataRataKumulatif) ? round($rataRataKumulatif, 2) : 0,
                'nilai_ikpa' => is_numeric($nilaiIkpa) ? round($nilaiIkpa, 2) : '-',
                'persentase_penyerapan' => $paguTotal > 0 ? round(($totalRealisasi / $paguTotal) * 100, 2) : 0,
                'evaluasi_tw' => $evaluasi_tw // <-- DIKIRIM KE FRONTEND/PDF
            ];
        }

        // Urutkan Laporan berdasarkan Total Poin SIRA Tertinggi
        usort($laporan, function ($a, $b) {
            return $b['evaluasi_tw']['poin']['total_poin'] <=> $a['evaluasi_tw']['poin']['total_poin'];
        });

        return $laporan;
    }

    public function index(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $bulan = $request->query('bulan', date('m'));

            $laporan = $this->hitungDataLaporanBulanan($tahun, $bulan);

            return response()->json([
                'status' => 'success',
                'tahun' => $tahun,
                'bulan' => $bulan,
                'tw_aktif' => $this->getTriwulanAktif($bulan),
                'data' => $laporan
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Detail Error Laravel: ' . $e->getMessage()
            ], 500);
        }
    }

    // =====================================================================
    // 📄 CETAK PDF LAPORAN BULANAN KESELURUHAN (NASIONAL SATKER)
    // =====================================================================
    public function cetakPdfLaporanBulanan(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        $bulan = $request->query('bulan', date('m'));

        $namaBulan = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        $strBulan = $namaBulan[(int)$bulan] ?? 'Desember';

        $laporan = $this->hitungDataLaporanBulanan($tahun, $bulan);
        $tanggalCetak = date('d') . ' ' . $strBulan . ' ' . date('Y');

        $data = [
            'tahun' => $tahun,
            'bulan_teks' => $strBulan,
            'tw_aktif' => $this->getTriwulanAktif($bulan),
            'laporan' => $laporan,
            'tanggal_cetak' => $tanggalCetak,
            'dicetak_oleh' => $request->user()->name ?? 'Administrator'
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.laporan-bulanan-nasional', $data);
        $pdf->setPaper('legal', 'landscape');

        return $pdf->download("Laporan_Bulanan_Nasional_TW_" . $data['tw_aktif'] . "_{$tahun}.pdf");
    }
}
