<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satker;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\Anggaran;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // =====================================================================
    // 🧠 HELPER: TARGET TRIWULAN KEMENKEU & RENTANG BULAN
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

    private function getBulanTerakhirTw(string $tw): int
    {
        $bulan = ['I' => 3, 'II' => 6, 'III' => 9, 'IV' => 12];
        return $bulan[$tw] ?? 12;
    }

    private function getBulanAwalTw(string $tw): int
    {
        $bulan = ['I' => 1, 'II' => 4, 'III' => 7, 'IV' => 10];
        return $bulan[$tw] ?? 1;
    }

    public function index(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $user = $request->user();
            $isAdmin = $user->role === 'admin';
            $selectedSatkerId = $request->query('satker_id');

            $bulanSaatIni = ($tahun == date('Y')) ? date('n') : 12;
            $currentTw = (int) ceil($bulanSaatIni / 3);
            $angkaKeRomawi = [1 => 'I', 2 => 'II', 3 => 'III', 4 => 'IV'];
            $defaultTwStr = $angkaKeRomawi[$currentTw] ?? 'IV';

            $tw = $request->query('tw', $defaultTwStr);
            $bulanMaksimal = $this->getBulanTerakhirTw($tw);
            $bulanAwal = $this->getBulanAwalTw($tw);

            // =========================================================
            // 1. AMBIL DATA SATKER SESUAI ROLE & FILTER
            // =========================================================
            $satkerQuery = Satker::with(['anggarans' => function ($query) use ($tahun) {
                $query->where('tahun', $tahun);
            }]);

            if (!$isAdmin) {
                $satkerQuery->where('kode_satker', $user->kode_satker);
            } else {
                if (!empty($selectedSatkerId)) {
                    $satkerQuery->where('id', $selectedSatkerId);
                }
            }

            $satkers = $satkerQuery->get();
            $satkerIds = $satkers->pluck('id')->toArray();

            $pagu51 = 0;
            $pagu52 = 0;
            $pagu53 = 0;
            $totalAnggaran = 0;

            foreach ($satkers as $satker) {
                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                foreach ($satker->anggarans as $anggaran) {
                    $paguGajiSatker = $isSetjen ? $anggaran->belanja_gaji : 0;
                    $paguBarangSatker = $anggaran->belanja_barang;
                    $paguModalSatker = $anggaran->belanja_modal;

                    $pagu51 += $paguGajiSatker;
                    $pagu52 += $paguBarangSatker;
                    $pagu53 += $paguModalSatker;
                    $totalAnggaran += $anggaran->pagu_efektif; // Menggunakan pagu efektif asli
                }
            }

            $semuaRpd = RencanaPenarikan::where('tahun', $tahun)->where('status', 'approved')->whereIn('satker_id', $satkerIds)->get();
            $semuaRealisasi = Realisasi::where('tahun', $tahun)->where('status', 'approved')->whereIn('satker_id', $satkerIds)->get();

            // =========================================================
            // 2. 🔥 GRAFIK DINAMIS BERDASARKAN FILTER & TRIWULAN 
            // =========================================================
            $grafik = [];
            $namaBulan = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

            // Mode Nasional (Semua Satker): Tampilkan perbandingan antar Satker
            if (empty($selectedSatkerId) && $isAdmin) {
                foreach ($satkers as $satker) {
                    $rpdSatkerTw = $semuaRpd->where('satker_id', $satker->id)->whereBetween('bulan', [$bulanAwal, $bulanMaksimal])->sum(function ($q) {
                        return $q->belanja_gaji + $q->belanja_barang + $q->belanja_modal;
                    });
                    $realSatkerTw = $semuaRealisasi->where('satker_id', $satker->id)->whereBetween('bulan', [$bulanAwal, $bulanMaksimal])->sum(function ($q) {
                        return $q->belanja_gaji + $q->belanja_barang + $q->belanja_modal;
                    });

                    $grafik[] = [
                        'name' => $satker->kode_satker,
                        'nama_satker' => $satker->nama_satker,
                        'Target_RPD' => round($rpdSatkerTw / 1000000, 2),
                        'Aktual_Realisasi' => round($realSatkerTw / 1000000, 2)
                    ];
                }
            } else {
                // Mode Spesifik Satker: Tampilkan rincian komponen per bulan di TW tersebut
                for ($i = $bulanAwal; $i <= $bulanMaksimal; $i++) {
                    $rpdBulan = $semuaRpd->where('bulan', $i);
                    $realBulan = $semuaRealisasi->where('bulan', $i);

                    $gaji = $realBulan->sum('belanja_gaji');
                    $barang = $realBulan->sum('belanja_barang');
                    $modal = $realBulan->sum('belanja_modal');
                    $rpdTot = $rpdBulan->sum(function ($q) {
                        return $q->belanja_gaji + $q->belanja_barang + $q->belanja_modal;
                    });

                    $grafik[] = [
                        'name' => $namaBulan[$i],
                        'Target_RPD' => round($rpdTot / 1000000, 2),
                        'Belanja_Gaji' => round($gaji / 1000000, 2),
                        'Belanja_Barang' => round($barang / 1000000, 2),
                        'Belanja_Modal' => round($modal / 1000000, 2),
                        'Total_Realisasi' => round(($gaji + $barang + $modal) / 1000000, 2)
                    ];
                }
            }

            // =========================================================
            // 3. KALKULASI IKPA AGREGAT & TARGET (KUMULATIF)
            // =========================================================
            $sumDeviasiTertimbangSeluruhBulan = 0;
            $bulanAdaData = 0;
            $ikpaGlobalBerjalan = 100;

            for ($i = 1; $i <= $bulanMaksimal; $i++) {
                $rpdBulanIni = $semuaRpd->where('bulan', $i);
                $realisasiBulanIni = $semuaRealisasi->where('bulan', $i);

                $r51_tot = 0;
                $r52_tot = 0;
                $r53_tot = 0;
                $p51_tot = 0;
                $p52_tot = 0;
                $p53_tot = 0;

                foreach ($satkers as $satker) {
                    $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                    $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                    $rpdSatker = $rpdBulanIni->where('satker_id', $satker->id)->first();
                    $realSatker = $realisasiBulanIni->where('satker_id', $satker->id)->first();

                    $r51 = $isSetjen ? ($rpdSatker ? $rpdSatker->belanja_gaji : 0) : 0;
                    $r52 = $rpdSatker ? $rpdSatker->belanja_barang : 0;
                    $r53 = $rpdSatker ? $rpdSatker->belanja_modal : 0;

                    $p51 = $isSetjen ? ($realSatker ? $realSatker->belanja_gaji : 0) : 0;
                    $p52 = $realSatker ? $realSatker->belanja_barang : 0;
                    $p53 = $realSatker ? $realSatker->belanja_modal : 0;

                    $r51_tot += $r51;
                    $r52_tot += $r52;
                    $r53_tot += $r53;
                    $p51_tot += $p51;
                    $p52_tot += $p52;
                    $p53_tot += $p53;
                }

                $totRpdBulan = $r51_tot + $r52_tot + $r53_tot;
                $totRealBulan = $p51_tot + $p52_tot + $p53_tot;

                if ($totRpdBulan > 0 || $totRealBulan > 0) {
                    $bulanAdaData++;
                    $hitungPd = function ($rVal, $pVal) {
                        $dev = abs($rVal - $pVal);
                        if ($rVal <= 0) return $pVal > 0 ? 100 : 0;
                        return min(($dev / $rVal) * 100, 100);
                    };

                    $pd51 = $hitungPd($r51_tot, $p51_tot);
                    $pd52 = $hitungPd($r52_tot, $p52_tot);
                    $pd53 = $hitungPd($r53_tot, $p53_tot);

                    $prop51 = $totalAnggaran > 0 ? ($pagu51 / $totalAnggaran) : 0;
                    $prop52 = $totalAnggaran > 0 ? ($pagu52 / $totalAnggaran) : 0;
                    $prop53 = $totalAnggaran > 0 ? ($pagu53 / $totalAnggaran) : 0;

                    $devTertimbangBulanIni = ($pd51 * $prop51) + ($pd52 * $prop52) + ($pd53 * $prop53);
                    $sumDeviasiTertimbangSeluruhBulan += $devTertimbangBulanIni;

                    $rataKumulatif = $sumDeviasiTertimbangSeluruhBulan / $bulanAdaData;
                    if ($rataKumulatif <= 5) {
                        $ikpaGlobalBerjalan = 100;
                    } else {
                        $ikpaGlobalBerjalan = max(0, 100 - $rataKumulatif);
                    }
                }
            }

            if ($bulanAdaData === 0) {
                $ikpaGlobalBerjalan = 100;
            }

            // =========================================================
            // 4. RINCIAN DATA TOTAL TW & POIN SIRA
            // =========================================================
            $rpdsFiltered = $semuaRpd->where('bulan', '<=', $bulanMaksimal);
            $realisasisFiltered = $semuaRealisasi->where('bulan', '<=', $bulanMaksimal);

            $totalRpdTerfilter = $rpdsFiltered->sum(function ($q) use ($satkers) {
                $satker = $satkers->where('id', $q->satker_id)->first();
                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');
                return ($isSetjen ? $q->belanja_gaji : 0) + $q->belanja_barang + $q->belanja_modal;
            });

            $realisasi51 = 0;
            $realisasi52 = 0;
            $realisasi53 = 0;
            foreach ($realisasisFiltered as $q) {
                $satker = $satkers->where('id', $q->satker_id)->first();
                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                $realisasi51 += ($isSetjen ? $q->belanja_gaji : 0);
                $realisasi52 += $q->belanja_barang;
                $realisasi53 += $q->belanja_modal;
            }

            $totalRealisasiTerfilter = $realisasi51 + $realisasi52 + $realisasi53;
            $persentaseRealisasiDashboard = $totalAnggaran > 0 ? round(($totalRealisasiTerfilter / $totalAnggaran) * 100, 2) : 0;

            $persenSerap51 = $pagu51 > 0 ? ($realisasi51 / $pagu51) * 100 : 0;
            $persenSerap52 = $pagu52 > 0 ? ($realisasi52 / $pagu52) * 100 : 0;
            $persenSerap53 = $pagu53 > 0 ? ($realisasi53 / $pagu53) * 100 : 0;

            $target51 = $this->getTargetKemenkeu($tw, '51');
            $target52 = $this->getTargetKemenkeu($tw, '52');
            $target53 = $this->getTargetKemenkeu($tw, '53');

            // --- PERHITUNGAN NILAI KINERJA PENYERAPAN UNTUK DASHBOARD ---
            $targetNominal51 = $pagu51 * ($target51 / 100);
            $targetNominal52 = $pagu52 * ($target52 / 100);
            $targetNominal53 = $pagu53 * ($target53 / 100);

            $totalTargetNominalTW = $targetNominal51 + $targetNominal52 + $targetNominal53;
            $totalRealisasiKumulatifTW = $realisasi51 + $realisasi52 + $realisasi53;

            $nilai_penyerapan = 0;
            if ($totalTargetNominalTW > 0) {
                $nilai_penyerapan = min(100, ($totalRealisasiKumulatifTW / $totalTargetNominalTW) * 100);
            } else if ($totalAnggaran == 0) {
                $nilai_penyerapan = 0;
            } else {
                $nilai_penyerapan = 100;
            }

            $tertimbang_hal_iii = round(($ikpaGlobalBerjalan * 10) / 100, 2);
            $tertimbang_penyerapan = round(($nilai_penyerapan * 20) / 100, 2);
            $total_poin_sira = round($tertimbang_hal_iii + $tertimbang_penyerapan, 2);

            // Analisis TW Kemenkeu
            $analisis_tw = [
                '51' => [
                    'target_persen' => $pagu51 > 0 ? $target51 : 0,
                    'realisasi_persen' => round($persenSerap51, 2),
                    'status' => $pagu51 > 0 ? ($persenSerap51 >= $target51 ? 'Tercapai' : 'Gagal') : 'N/A'
                ],
                '52' => [
                    'target_persen' => $pagu52 > 0 ? $target52 : 0,
                    'realisasi_persen' => round($persenSerap52, 2),
                    'status' => $pagu52 > 0 ? ($persenSerap52 >= $target52 ? 'Tercapai' : 'Gagal') : 'N/A'
                ],
                '53' => [
                    'target_persen' => $pagu53 > 0 ? $target53 : 0,
                    'realisasi_persen' => round($persenSerap53, 2),
                    'status' => $pagu53 > 0 ? ($persenSerap53 >= $target53 ? 'Tercapai' : 'Gagal') : 'N/A'
                ],
                'poin' => [
                    'ikpa_hal_iii' => round($ikpaGlobalBerjalan, 2),
                    'nilai_penyerapan' => round($nilai_penyerapan, 2),
                    'tertimbang_hal_iii' => $tertimbang_hal_iii,
                    'tertimbang_penyerapan' => $tertimbang_penyerapan,
                    'total_poin' => $total_poin_sira
                ]
            ];

            // =========================================================
            // 5. TABEL LEADERBOARD SATKER (KINI DIURUTKAN BERDASARKAN POIN SIRA)
            // =========================================================
            $tabelSatker = $satkers->map(function ($satker) use ($bulanMaksimal, $semuaRealisasi, $semuaRpd, $tw) {
                $paguSatker = 0;
                $p51 = 0;
                $p52 = 0;
                $p53 = 0;

                $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
                $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

                foreach ($satker->anggarans as $anggaran) {
                    $paguSatker += $anggaran->pagu_efektif;
                    $p51 += $isSetjen ? $anggaran->belanja_gaji : 0;
                    $p52 += $anggaran->belanja_barang;
                    $p53 += $anggaran->belanja_modal;
                }

                $realisasiSatker = 0;
                $real51 = 0;
                $real52 = 0;
                $real53 = 0;
                $reals = $semuaRealisasi->where('satker_id', $satker->id)->where('bulan', '<=', $bulanMaksimal);

                foreach ($reals as $q) {
                    $rGaji = $isSetjen ? $q->belanja_gaji : 0;
                    $real51 += $rGaji;
                    $real52 += $q->belanja_barang;
                    $real53 += $q->belanja_modal;
                    $realisasiSatker += ($rGaji + $q->belanja_barang + $q->belanja_modal);
                }

                // Kalkulasi Nilai Penyerapan per Satker
                $t51 = $this->getTargetKemenkeu($tw, '51');
                $t52 = $this->getTargetKemenkeu($tw, '52');
                $t53 = $this->getTargetKemenkeu($tw, '53');

                $tn51 = $p51 * ($t51 / 100);
                $tn52 = $p52 * ($t52 / 100);
                $tn53 = $p53 * ($t53 / 100);

                $totalTN = $tn51 + $tn52 + $tn53;
                $nilai_penyerapan = 0;
                if ($totalTN > 0) {
                    $nilai_penyerapan = min(100, ($realisasiSatker / $totalTN) * 100);
                } else if ($paguSatker == 0) {
                    $nilai_penyerapan = 0;
                } else {
                    $nilai_penyerapan = 100;
                }

                // Kalkulasi IKPA Hal III per Satker
                $rpds = $semuaRpd->where('satker_id', $satker->id)->where('bulan', '<=', $bulanMaksimal);
                $sumDevTertimbang = 0;
                $blnData = 0;
                for ($i = 1; $i <= $bulanMaksimal; $i++) {
                    $rb = $rpds->where('bulan', $i)->first();
                    $pb = $reals->where('bulan', $i)->first();

                    $rG = $isSetjen ? ($rb ? $rb->belanja_gaji : 0) : 0;
                    $rB = $rb ? $rb->belanja_barang : 0;
                    $rM = $rb ? $rb->belanja_modal : 0;

                    $pG = $isSetjen ? ($pb ? $pb->belanja_gaji : 0) : 0;
                    $pB = $pb ? $pb->belanja_barang : 0;
                    $pM = $pb ? $pb->belanja_modal : 0;

                    if (($rG + $rB + $rM) > 0 || ($pG + $pB + $pM) > 0) {
                        $blnData++;

                        $hitungP = function ($rV, $pV) {
                            $d = abs($rV - $pV);
                            if ($rV <= 0) return $pV > 0 ? 100 : 0;
                            return min(($d / $rV) * 100, 100);
                        };

                        $pd51 = $hitungP($rG, $pG);
                        $pd52 = $hitungP($rB, $pB);
                        $pd53 = $hitungP($rM, $pM);

                        $pr51 = $paguSatker > 0 ? ($p51 / $paguSatker) : 0;
                        $pr52 = $paguSatker > 0 ? ($p52 / $paguSatker) : 0;
                        $pr53 = $paguSatker > 0 ? ($p53 / $paguSatker) : 0;

                        $sumDevTertimbang += ($pd51 * $pr51) + ($pd52 * $pr52) + ($pd53 * $pr53);
                    }
                }

                $ikpaSatker = 100;
                if ($blnData > 0) {
                    $rataDev = $sumDevTertimbang / $blnData;
                    if ($rataDev > 5) $ikpaSatker = max(0, 100 - $rataDev);
                }

                // Kalkulasi Total Poin SIRA
                $poin_sira = round(($ikpaSatker * 10 / 100) + ($nilai_penyerapan * 20 / 100), 2);
                $persenSerap = $paguSatker > 0 ? round(($realisasiSatker / $paguSatker) * 100, 2) : 0;

                return [
                    'id' => $satker->id,
                    'kode_satker' => $satker->kode_satker,
                    'nama_satker' => $satker->nama_satker,
                    'total_pagu' => $paguSatker,
                    'total_realisasi' => $realisasiSatker,
                    'persen_serap' => $persenSerap,
                    'poin_sira' => $poin_sira // <-- Dipakai untuk ranking
                ];
            });

            $topSatker = [];
            $bottomSatker = [];
            $miniCCTV = [];
            if ($isAdmin) {
                // Diurutkan berdasarkan POIN SIRA Tertinggi
                $sortedSatker = collect($tabelSatker)->sortByDesc('poin_sira')->values();
                $topSatker = $sortedSatker->take(3)->values()->toArray();
                $bottomSatker = $sortedSatker->filter(function ($s) {
                    return $s['total_pagu'] > 0;
                })->slice(-3)->reverse()->values()->toArray();

                $miniCCTV = ActivityLog::with(['user' => function ($q) {
                    $q->select('id', 'name', 'avatar', 'kode_satker', 'role');
                }])->orderBy('created_at', 'desc')->take(5)->get();
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'tahun' => $tahun,
                    'tw_aktif' => $tw,
                    'is_global' => empty($selectedSatkerId),
                    'summary' => [
                        'total_anggaran' => $totalAnggaran,
                        'total_rpd_setahun' => $totalRpdTerfilter,
                        'total_realisasi_setahun' => $totalRealisasiTerfilter,
                        'ikpa' => round($ikpaGlobalBerjalan, 2),
                        'status_kesehatan' => $ikpaGlobalBerjalan >= 95 ? 'Sangat Baik' : ($ikpaGlobalBerjalan >= 85 ? 'Baik' : 'Perlu Evaluasi'),
                        'persentase_realisasi' => $persentaseRealisasiDashboard
                    ],
                    'analisis_tw' => $analisis_tw,
                    'grafik' => $grafik,
                    'tabel_satker' => $tabelSatker,
                    'rincian_belanja' => [
                        'gaji' => $realisasi51,
                        'barang' => $realisasi52,
                        'modal' => $realisasi53
                    ],
                    'leaderboard' => ['top' => $topSatker, 'bottom' => $bottomSatker],
                    'cctv_mini' => $miniCCTV
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // =====================================================================
    // 🖨️ FITUR EKSPORT PDF DASHBOARD (EXECUTIVE SUMMARY)
    // =====================================================================
    public function cetakPdfDashboard(Request $request)
    {
        $response = $this->index($request);
        $dataResponse = json_decode($response->getContent(), true);

        if ($dataResponse['status'] !== 'success') {
            return response()->json(['status' => 'error', 'message' => 'Gagal memuat data PDF'], 500);
        }

        $data = $dataResponse['data'];
        $user = $request->user();
        $isAdmin = $user->role === 'admin';

        $satkerId = $request->query('satker_id');
        $isGlobal = $isAdmin && empty($satkerId);

        $namaSatker = 'Nasional (Seluruh Satuan Kerja)';
        if (!$isGlobal && !empty($data['tabel_satker'])) {
            $namaSatker = $data['tabel_satker'][0]['nama_satker'];
        }

        $viewData = [
            'tahun' => $data['tahun'],
            'tw_aktif' => $data['tw_aktif'],
            'summary' => $data['summary'],
            'analisis_tw' => $data['analisis_tw'],
            'rincian_belanja' => $data['rincian_belanja'],
            // Sorting kembali berdasarkan poin sira
            'satkers' => collect($data['tabel_satker'])->sortByDesc('poin_sira')->values()->all(),
            'grafik' => $data['grafik'],
            'tanggal_cetak' => date('d M Y'),
            'dicetak_oleh' => $user->name . ' (' . strtoupper($user->role) . ')',
            'is_global' => $isGlobal,
            'nama_satker' => $namaSatker
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.dashboard-summary', $viewData);
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download("Executive_Summary_SIRA_TW_{$data['tw_aktif']}_{$data['tahun']}.pdf");
    }
}
