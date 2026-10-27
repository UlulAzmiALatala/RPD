<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Satker;
use App\Models\Anggaran;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\RincianOutput;
use App\Models\RealisasiOutput;
use App\Models\RealisasiDetail;

class LaporanBulananController extends Controller
{
    // =====================================================================
    // 🧠 HELPER: TARGET TRIWULAN KEMENKEU & KONVERSI BULAN/TRIWULAN
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

    private function getBulanAkhirTw(string $tw): int
    {
        $bulan = ['I' => 3, 'II' => 6, 'III' => 9, 'IV' => 12];
        return $bulan[$tw] ?? 12;
    }

    private function hitungDataLaporanBulanan($tahun, $bulan)
    {
        $bulanInt = (int)$bulan;
        $satkers = Satker::all();
        $laporan = [];
        $twAktif = $this->getTriwulanAktif($bulanInt);
        $bulanAkhirTw = $this->getBulanAkhirTw($twAktif);

        foreach ($satkers as $satker) {
            $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
            $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

            // 1. Ambil Anggaran (Pagu Kotor untuk Evaluasi Kemenkeu & Pagu Efektif untuk Dompet)
            $anggaran = Anggaran::where('satker_id', $satker->id)
                ->where('tahun', $tahun)
                ->first();

            $paguTotal = $anggaran ? $anggaran->pagu_efektif : 0;
            $paguGaji = ($isSetjen && $anggaran) ? $anggaran->belanja_gaji : 0;
            $paguBarang = $anggaran ? $anggaran->belanja_barang : 0;
            $paguModal = $anggaran ? $anggaran->belanja_modal : 0;
            $paguKotorTotal = $paguGaji + $paguBarang + $paguModal;

            // Proporsi berdasarkan Pagu Kotor (100% sama dengan LaporanRealisasiController)
            $proporsi51 = $paguKotorTotal > 0 ? ($paguGaji / $paguKotorTotal) * 100 : 0;
            $proporsi52 = $paguKotorTotal > 0 ? ($paguBarang / $paguKotorTotal) * 100 : 0;
            $proporsi53 = $paguKotorTotal > 0 ? ($paguModal / $paguKotorTotal) * 100 : 0;

            // 2. Ambil seluruh RPD & Realisasi yang sudah approved pada tahun ini
            $allRpds = RencanaPenarikan::where('satker_id', $satker->id)
                ->where('tahun', $tahun)
                ->where('status', 'approved')
                ->get()
                ->keyBy('bulan');

            $allRealisasis = Realisasi::where('satker_id', $satker->id)
                ->where('tahun', $tahun)
                ->where('status', 'approved')
                ->get()
                ->keyBy('bulan');

            // Filter Kumulatif s.d. Bulan Pilihan (untuk tampilan kolom nominal RPD & Realisasi di tabel)
            $rpdsBulanIni = $allRpds->filter(fn($item, $key) => $key <= $bulanInt);
            $realisasisBulanIni = $allRealisasis->filter(fn($item, $key) => $key <= $bulanInt);

            $rpdGaji = $isSetjen ? $rpdsBulanIni->sum('belanja_gaji') : 0;
            $rpdBarang = $rpdsBulanIni->sum('belanja_barang');
            $rpdModal = $rpdsBulanIni->sum('belanja_modal');

            $realGaji = $isSetjen ? $realisasisBulanIni->sum('belanja_gaji') : 0;
            $realBarang = $realisasisBulanIni->sum('belanja_barang');
            $realModal = $realisasisBulanIni->sum('belanja_modal');

            $totalRpd = $rpdGaji + $rpdBarang + $rpdModal;
            $totalRealisasi = $realGaji + $realBarang + $realModal;
            $totalDeviasiNominal = abs($totalRealisasi - $totalRpd);

            // 3. Kalkulasi Nilai IKPA Hal III DIPA (100% Identik dengan LaporanRealisasiController)
            $hitungPersenDeviasi = function ($rpdNominal, $realisasiNominal) {
                $deviasiNominal = abs($rpdNominal - $realisasiNominal);
                if ($rpdNominal <= 0) {
                    return $realisasiNominal > 0 ? 100 : 0;
                }
                $persenDeviasi = ($deviasiNominal / $rpdNominal) * 100;
                return min($persenDeviasi, 100);
            };

            $sumDeviasiTertimbang = 0;
            $bulanAdaData = 0;
            $nilaiIkpaBulanPilihan = '-';
            $rataRataKumulatifBulanPilihan = 0;
            $nilaiIkpaTw = 0;

            for ($m = 1; $m <= $bulanAkhirTw; $m++) {
                $rpdM = $allRpds->get($m);
                $realM = $allRealisasis->get($m);

                $r51 = $isSetjen ? ($rpdM ? $rpdM->belanja_gaji : 0) : 0;
                $r52 = $rpdM ? $rpdM->belanja_barang : 0;
                $r53 = $rpdM ? $rpdM->belanja_modal : 0;
                $totRpdM = $r51 + $r52 + $r53;

                $p51 = $isSetjen ? ($realM ? $realM->belanja_gaji : 0) : 0;
                $p52 = $realM ? $realM->belanja_barang : 0;
                $p53 = $realM ? $realM->belanja_modal : 0;
                $totRealM = $p51 + $p52 + $p53;

                $pd51 = $hitungPersenDeviasi($r51, $p51);
                $pd52 = $hitungPersenDeviasi($r52, $p52);
                $pd53 = $hitungPersenDeviasi($r53, $p53);

                $devTertimbangM = ($pd51 * ($proporsi51 / 100)) + ($pd52 * ($proporsi52 / 100)) + ($pd53 * ($proporsi53 / 100));

                if ($totRpdM > 0 || $totRealM > 0) {
                    $bulanAdaData++;
                    $sumDeviasiTertimbang += $devTertimbangM;
                    $rataKumulatifM = $sumDeviasiTertimbang / $bulanAdaData;
                    $ikpaM = $rataKumulatifM <= 5 ? 100 : max(0, 100 - $rataKumulatifM);
                } else {
                    $rataKumulatifM = 0;
                    $ikpaM = '-';
                }

                if ($m == $bulanInt) {
                    $nilaiIkpaBulanPilihan = $ikpaM;
                    $rataRataKumulatifBulanPilihan = $rataKumulatifM;
                }

                if ($m == $bulanAkhirTw) {
                    $nilaiIkpaTw = $ikpaM === '-' ? 0 : (float)$ikpaM;
                }
            }

            // =========================================================
            // 4. 🔥 EVALUASI TARGET TRIWULAN KEMENKEU (S.D. AKHIR TW AKTIF)
            // =========================================================
            $realisasiTWFiltered = $allRealisasis->filter(fn($item, $key) => $key <= $bulanAkhirTw);
            $realisasiIdsTw = $realisasiTWFiltered->pluck('id');

            $real51_tw = $isSetjen ? $realisasiTWFiltered->sum('belanja_gaji') : 0;
            $real52_tw = $realisasiTWFiltered->sum('belanja_barang');
            $real53_tw = $realisasiTWFiltered->sum('belanja_modal');

            $target51 = $this->getTargetKemenkeu($twAktif, '51');
            $target52 = $this->getTargetKemenkeu($twAktif, '52');
            $target53 = $this->getTargetKemenkeu($twAktif, '53');

            $targetNominal51 = $paguGaji * ($target51 / 100);
            $targetNominal52 = $paguBarang * ($target52 / 100);
            $targetNominal53 = $paguModal * ($target53 / 100);

            $persenSerap51 = $targetNominal51 > 0 ? min(($real51_tw / $targetNominal51) * 100, 100) : ($paguGaji > 0 ? 0 : 100);
            $persenSerap52 = $targetNominal52 > 0 ? min(($real52_tw / $targetNominal52) * 100, 100) : ($paguBarang > 0 ? 0 : 100);
            $persenSerap53 = $targetNominal53 > 0 ? min(($real53_tw / $targetNominal53) * 100, 100) : ($paguModal > 0 ? 0 : 100);

            $totalTargetNominalTW = $targetNominal51 + $targetNominal52 + $targetNominal53;
            $totalRealisasiKumulatifTW = $real51_tw + $real52_tw + $real53_tw;

            $nilai_penyerapan = 0;
            if ($totalTargetNominalTW > 0) {
                $nilai_penyerapan = min(100, ($totalRealisasiKumulatifTW / $totalTargetNominalTW) * 100);
            } else if ($paguKotorTotal == 0) {
                $nilai_penyerapan = 0;
            } else {
                $nilai_penyerapan = 100;
            }

            // =========================================================
            // 5. 🔥 KALKULASI CAPAIAN OUTPUT RO & LIVE LEDGER SERAPAN
            // =========================================================
            $rincianOutputs = RincianOutput::where('satker_id', $satker->id)->where('tahun', $tahun)->get();
            $roIds = $rincianOutputs->pluck('id');

            $realisasiOutputs = RealisasiOutput::whereIn('rincian_output_id', $roIds)
                ->where('bulan', '<=', $bulanAkhirTw)
                ->get();

            $ledgerDetails = collect();
            if ($realisasiIdsTw->isNotEmpty() && $roIds->isNotEmpty()) {
                $ledgerDetails = RealisasiDetail::whereIn('realisasi_id', $realisasiIdsTw)
                    ->whereIn('rincian_output_id', $roIds)
                    ->get();
            }

            $total_pc_ro = 0;
            $jumlah_ro = $rincianOutputs->count();
            $nilai_ro = 0;
            $rincian_ro_summary = [];

            if ($jumlah_ro > 0) {
                foreach ($rincianOutputs as $ro) {
                    $vol_kumulatif = $realisasiOutputs->where('rincian_output_id', $ro->id)->sum('realisasi_volume');
                    $serapan_ro_kumulatif = $ledgerDetails->where('rincian_output_id', $ro->id)->sum('nominal');

                    $pc = $ro->target_volume > 0 ? ($vol_kumulatif / $ro->target_volume) * 100 : 0;
                    $pc_capped = min($pc, 100);
                    $total_pc_ro += $pc_capped;

                    $persen_anggaran_ro = $ro->pagu_anggaran > 0 ? ($serapan_ro_kumulatif / $ro->pagu_anggaran) * 100 : 0;

                    $status_ro = 'Wajar';
                    if ($pc >= 100) {
                        $status_ro = 'Selesai 100%';
                    } elseif ($pc < ($persen_anggaran_ro - 15)) {
                        $status_ro = 'Anomali Fisik';
                    }

                    $rincian_ro_summary[] = [
                        'id' => $ro->id,
                        'kode_ro' => $ro->kode_ro,
                        'nama_ro' => $ro->nama_ro,
                        'satuan' => $ro->satuan,
                        'target_volume' => $ro->target_volume,
                        'realisasi_volume' => $vol_kumulatif,
                        'persen_volume' => round($pc_capped, 2),
                        'pagu_anggaran' => $ro->pagu_anggaran,
                        'serapan_anggaran' => $serapan_ro_kumulatif,
                        'persen_anggaran' => round($persen_anggaran_ro, 2),
                        'status_kinerja' => $status_ro,
                        'jumlah_transaksi' => $ledgerDetails->where('rincian_output_id', $ro->id)->count()
                    ];
                }
                $nilai_ro = $total_pc_ro / $jumlah_ro;
            }

            // =========================================================
            // 6. KALKULASI POIN SIRA (10% + 20% + 25% = MAX 55 POIN)
            // =========================================================
            $tertimbang_hal_iii = round(($nilaiIkpaTw * 10) / 100, 2);
            $tertimbang_penyerapan = round(($nilai_penyerapan * 20) / 100, 2);
            $tertimbang_ro = round(($nilai_ro * 25) / 100, 2);

            $total_poin_sira = round($tertimbang_hal_iii + $tertimbang_penyerapan + $tertimbang_ro, 2);

            $evaluasi_tw = [
                'tw_aktif' => $twAktif,
                '51' => [
                    'target_persen' => $paguGaji > 0 ? $target51 : 0,
                    'realisasi_persen' => round($persenSerap51, 2),
                    'status' => $paguGaji > 0 ? ($real51_tw >= $targetNominal51 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real51_tw,
                    'target_nominal' => $targetNominal51
                ],
                '52' => [
                    'target_persen' => $paguBarang > 0 ? $target52 : 0,
                    'realisasi_persen' => round($persenSerap52, 2),
                    'status' => $paguBarang > 0 ? ($real52_tw >= $targetNominal52 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real52_tw,
                    'target_nominal' => $targetNominal52
                ],
                '53' => [
                    'target_persen' => $paguModal > 0 ? $target53 : 0,
                    'realisasi_persen' => round($persenSerap53, 2),
                    'status' => $paguModal > 0 ? ($real53_tw >= $targetNominal53 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real53_tw,
                    'target_nominal' => $targetNominal53
                ],
                'poin' => [
                    'ikpa_hal_iii' => round($nilaiIkpaTw, 2),
                    'nilai_penyerapan' => round($nilai_penyerapan, 2),
                    'nilai_ro' => round($nilai_ro, 2),
                    'tertimbang_hal_iii' => $tertimbang_hal_iii,
                    'tertimbang_penyerapan' => $tertimbang_penyerapan,
                    'tertimbang_ro' => $tertimbang_ro,
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
                'deviasi_tertimbang_kumulatif' => is_numeric($rataRataKumulatifBulanPilihan) ? round($rataRataKumulatifBulanPilihan, 2) : 0,
                'nilai_ikpa' => is_numeric($nilaiIkpaBulanPilihan) ? round($nilaiIkpaBulanPilihan, 2) : '-',
                'persentase_penyerapan' => $paguTotal > 0 ? round(($totalRealisasi / $paguTotal) * 100, 2) : 0,
                'evaluasi_tw' => $evaluasi_tw,
                'rincian_ro' => $rincian_ro_summary
            ];
        }

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
