<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\Satker;
use App\Models\Anggaran;

class LaporanRealisasiController extends Controller
{
    // =====================================================================
    // 🧠 HELPER: TARGET TRIWULAN KEMENKEU
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

    private function getBulanAkhirTw(string $tw): int
    {
        $bulan = ['I' => 3, 'II' => 6, 'III' => 9, 'IV' => 12];
        return $bulan[$tw] ?? 12;
    }

    // =====================================================================
    // 📊 GET SUMMARY (DASHBOARD & REKAP KESELURUHAN)
    // =====================================================================
    public function getSummary(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));

            $anggarans = Anggaran::where('tahun', $tahun)->get();
            $rpds = RencanaPenarikan::where('tahun', $tahun)->where('status', 'approved')->get();
            $realisasis = Realisasi::where('tahun', $tahun)->where('status', 'approved')->get();

            $globalPagu = $anggarans->sum('pagu_efektif');
            $globalRpd = $rpds->sum(function ($r) {
                return $r->belanja_gaji + $r->belanja_barang + $r->belanja_modal;
            });
            $globalRealisasi = $realisasis->sum(function ($r) {
                return $r->belanja_gaji + $r->belanja_barang + $r->belanja_modal;
            });

            $satkerSummary = [];
            foreach ($anggarans as $ang) {
                $sid = $ang->satker_id;

                $totRpd = $rpds->where('satker_id', $sid)->sum(function ($r) {
                    return $r->belanja_gaji + $r->belanja_barang + $r->belanja_modal;
                });

                $totReal = $realisasis->where('satker_id', $sid)->sum(function ($r) {
                    return $r->belanja_gaji + $r->belanja_barang + $r->belanja_modal;
                });

                $bulanan = [];
                for ($i = 1; $i <= 12; $i++) {
                    $rpdBulan = $rpds->where('satker_id', $sid)->where('bulan', $i);
                    $realBulan = $realisasis->where('satker_id', $sid)->where('bulan', $i);

                    $sumRpd = $rpdBulan->sum(function ($r) {
                        return $r->belanja_gaji + $r->belanja_barang + $r->belanja_modal;
                    });
                    $sumReal = $realBulan->sum(function ($r) {
                        return $r->belanja_gaji + $r->belanja_barang + $r->belanja_modal;
                    });

                    $bulanan[$i] = [
                        'rpd' => $sumRpd,
                        'realisasi' => $sumReal,
                        'sisa_rpd' => $sumRpd - $sumReal,
                        'rpd_detail' => [
                            'gaji' => $rpdBulan->sum('belanja_gaji'),
                            'barang' => $rpdBulan->sum('belanja_barang'),
                            'modal' => $rpdBulan->sum('belanja_modal')
                        ]
                    ];
                }

                $satkerSummary[$sid] = [
                    'pagu_efektif' => $ang->pagu_efektif,
                    'total_rpd' => $totRpd,
                    'total_realisasi' => $totReal,
                    'sisa_pagu_rpd' => $ang->pagu_efektif - $totRpd,
                    'sisa_pagu_realisasi' => $ang->pagu_efektif - $totReal,
                    'bulanan' => $bulanan
                ];
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'global' => [
                        'pagu_efektif' => $globalPagu,
                        'total_rpd' => $globalRpd,
                        'total_realisasi' => $globalRealisasi,
                        'sisa_pagu_rpd' => $globalPagu - $globalRpd,
                        'sisa_pagu_realisasi' => $globalPagu - $globalRealisasi,
                        'persentase_rpd' => $globalPagu > 0 ? round(($globalRpd / $globalPagu) * 100, 2) : 0,
                        'persentase_realisasi' => $globalPagu > 0 ? round(($globalRealisasi / $globalPagu) * 100, 2) : 0,
                    ],
                    'per_satker' => $satkerSummary
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // =====================================================================
    // 🔥 LAPORAN REALISASI PER SATKER (DETAIL KOMPONEN IKPA & EVALUASI TW)
    // =====================================================================
    public function getLaporanRealisasi(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        $satkerId = $request->query('satker_id');

        if (!$satkerId) {
            return response()->json(['status' => 'error', 'message' => 'Silakan pilih Satuan Kerja terlebih dahulu.'], 400);
        }

        $satker = Satker::find($satkerId);
        if (!$satker) {
            return response()->json(['status' => 'error', 'message' => 'Satker tidak ditemukan.'], 404);
        }

        // 🔥 DETEKSI APAKAH SATKER INI ADALAH SETJEN
        $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
        $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

        $anggaran = Anggaran::where('satker_id', $satkerId)->where('tahun', $tahun)->first();
        $paguTotal = $anggaran ? $anggaran->pagu_efektif : 0;

        // Jika bukan Setjen, Pagu Gaji dipaksa 0 mutlak
        $paguGaji = ($isSetjen && $anggaran) ? $anggaran->belanja_gaji : 0;
        $paguBarang = $anggaran ? $anggaran->belanja_barang : 0;
        $paguModal = $anggaran ? $anggaran->belanja_modal : 0;

        // Proporsi Pagu per Jenis Belanja (Tetap sepanjang tahun)
        $proporsi51 = $paguTotal > 0 ? ($paguGaji / $paguTotal) * 100 : 0;
        $proporsi52 = $paguTotal > 0 ? ($paguBarang / $paguTotal) * 100 : 0;
        $proporsi53 = $paguTotal > 0 ? ($paguModal / $paguTotal) * 100 : 0;

        $rpdList = RencanaPenarikan::where('satker_id', $satkerId)->where('tahun', $tahun)->where('status', 'approved')->get()->keyBy('bulan');
        $realisasiList = Realisasi::where('satker_id', $satkerId)->where('tahun', $tahun)->where('status', 'approved')->get()->keyBy('bulan');

        $laporan = [];
        $sumDeviasiTertimbangSeluruhBulan = 0;
        $bulanAdaData = 0;

        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $rpd = $rpdList->get($bulan);
            $realisasi = $realisasiList->get($bulan);

            // Jika bukan Setjen, RPD Gaji dan Realisasi Gaji dipaksa 0 mutlak
            $r51 = $isSetjen ? ($rpd ? $rpd->belanja_gaji : 0) : 0;
            $r52 = $rpd ? $rpd->belanja_barang : 0;
            $r53 = $rpd ? $rpd->belanja_modal : 0;
            $totRpd = $r51 + $r52 + $r53;

            $p51 = $isSetjen ? ($realisasi ? $realisasi->belanja_gaji : 0) : 0;
            $p52 = $realisasi ? $realisasi->belanja_barang : 0;
            $p53 = $realisasi ? $realisasi->belanja_modal : 0;
            $totReal = $p51 + $p52 + $p53;

            $d51 = abs($r51 - $p51);
            $d52 = abs($r52 - $p52);
            $d53 = abs($r53 - $p53);
            $totDeviasi = $d51 + $d52 + $d53;

            $hitungPersenDeviasi = function ($rpdNominal, $realisasiNominal) {
                $deviasiNominal = abs($rpdNominal - $realisasiNominal);
                if ($rpdNominal <= 0) {
                    return $realisasiNominal > 0 ? 100 : 0;
                }
                $persenDeviasi = ($deviasiNominal / $rpdNominal) * 100;
                return min($persenDeviasi, 100);
            };

            $pd51 = $hitungPersenDeviasi($r51, $p51);
            $pd52 = $hitungPersenDeviasi($r52, $p52);
            $pd53 = $hitungPersenDeviasi($r53, $p53);

            $devTertimbang51 = $pd51 * ($proporsi51 / 100);
            $devTertimbang52 = $pd52 * ($proporsi52 / 100);
            $devTertimbang53 = $pd53 * ($proporsi53 / 100);

            $totalDeviasiTertimbangBulanIni = $devTertimbang51 + $devTertimbang52 + $devTertimbang53;

            if ($totRpd > 0 || $totReal > 0) {
                $bulanAdaData++;
                $sumDeviasiTertimbangSeluruhBulan += $totalDeviasiTertimbangBulanIni;
                $rataKumulatif = $sumDeviasiTertimbangSeluruhBulan / $bulanAdaData;

                if ($rataKumulatif <= 5) {
                    $ikpa = 100;
                } else {
                    $ikpa = max(0, 100 - $rataKumulatif);
                }
            } else {
                $ikpa = '-';
                $rataKumulatif = 0;
                $totalDeviasiTertimbangBulanIni = 0;
            }

            $laporan[] = [
                'bulan' => $bulan,
                'rencana' => ['b51' => $r51, 'b52' => $r52, 'b53' => $r53],
                'realisasi' => ['b51' => $p51, 'b52' => $p52, 'b53' => $p53],
                'deviasi' => ['b51' => $d51, 'b52' => $d52, 'b53' => $d53],
                'persen_deviasi' => [
                    'b51' => ($r51 > 0 || $p51 > 0) ? round($pd51, 2) : '-',
                    'b52' => ($r52 > 0 || $p52 > 0) ? round($pd52, 2) : '-',
                    'b53' => ($r53 > 0 || $p53 > 0) ? round($pd53, 2) : '-'
                ],
                'proporsi_pagu' => [
                    'b51' => round($proporsi51, 2),
                    'b52' => round($proporsi52, 2),
                    'b53' => round($proporsi53, 2)
                ],
                'deviasi_tertimbang' => [
                    'b51' => round($devTertimbang51, 2),
                    'b52' => round($devTertimbang52, 2),
                    'b53' => round($devTertimbang53, 2)
                ],
                'persen_seluruh' => ($totRpd > 0 || $totReal > 0) ? round($totalDeviasiTertimbangBulanIni, 2) : '-',
                'rata_kumulatif' => ($totRpd > 0 || $totReal > 0) ? round($rataKumulatif, 2) : '-',
                'ikpa' => $ikpa === '-' ? '-' : round($ikpa, 2)
            ];
        }

        // =====================================================================
        // 🔥 FITUR BARU: EVALUASI TARGET & POIN TERTIMBANG KEMENKEU (I, II, III, IV)
        // =====================================================================
        $evaluasi_tw = [];
        $tw_list = ['I', 'II', 'III', 'IV'];

        foreach ($tw_list as $tw) {
            $bulanAkhir = $this->getBulanAkhirTw($tw);

            // Hitung realisasi kumulatif dari Januari sampai bulan terakhir TW ini
            $realisasiTWFiltered = $realisasiList->filter(function ($item, $key) use ($bulanAkhir) {
                return $key <= $bulanAkhir;
            });

            $real51_kumulatif = $isSetjen ? $realisasiTWFiltered->sum('belanja_gaji') : 0;
            $real52_kumulatif = $realisasiTWFiltered->sum('belanja_barang');
            $real53_kumulatif = $realisasiTWFiltered->sum('belanja_modal');

            $target51 = $this->getTargetKemenkeu($tw, '51');
            $target52 = $this->getTargetKemenkeu($tw, '52');
            $target53 = $this->getTargetKemenkeu($tw, '53');

            $persenSerap51 = $paguGaji > 0 ? ($real51_kumulatif / $paguGaji) * 100 : 0;
            $persenSerap52 = $paguBarang > 0 ? ($real52_kumulatif / $paguBarang) * 100 : 0;
            $persenSerap53 = $paguModal > 0 ? ($real53_kumulatif / $paguModal) * 100 : 0;

            // --- PERHITUNGAN NILAI KINERJA PENYERAPAN (RUMUS ASLI DJPB) ---
            $targetNominal51 = $paguGaji * ($target51 / 100);
            $targetNominal52 = $paguBarang * ($target52 / 100);
            $targetNominal53 = $paguModal * ($target53 / 100);

            $totalTargetNominalTW = $targetNominal51 + $targetNominal52 + $targetNominal53;
            $totalRealisasiKumulatifTW = $real51_kumulatif + $real52_kumulatif + $real53_kumulatif;

            $nilai_penyerapan = 0;
            if ($totalTargetNominalTW > 0) {
                $nilai_penyerapan = min(100, ($totalRealisasiKumulatifTW / $totalTargetNominalTW) * 100);
            } else if ($paguTotal == 0) {
                $nilai_penyerapan = 0;
            } else {
                $nilai_penyerapan = 100; // Case khusus jika target 0 tapi pagu ada
            }

            // Ambil Nilai IKPA Hal III (Dari bulan terakhir TW)
            $ikpa_hal_iii = $laporan[$bulanAkhir - 1]['ikpa'];
            $ikpa_hal_iii = $ikpa_hal_iii === '-' ? 0 : (float)$ikpa_hal_iii;

            // KALKULASI POIN TERTIMBANG SIRA (10% & 20%)
            $tertimbang_hal_iii = round(($ikpa_hal_iii * 10) / 100, 2);
            $tertimbang_penyerapan = round(($nilai_penyerapan * 20) / 100, 2);
            $total_poin_sira = round($tertimbang_hal_iii + $tertimbang_penyerapan, 2);

            $evaluasi_tw[$tw] = [
                '51' => [
                    'target_persen' => $paguGaji > 0 ? $target51 : 0,
                    'realisasi_persen' => round($persenSerap51, 2),
                    'status' => $paguGaji > 0 ? ($persenSerap51 >= $target51 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real51_kumulatif
                ],
                '52' => [
                    'target_persen' => $paguBarang > 0 ? $target52 : 0,
                    'realisasi_persen' => round($persenSerap52, 2),
                    'status' => $paguBarang > 0 ? ($persenSerap52 >= $target52 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real52_kumulatif
                ],
                '53' => [
                    'target_persen' => $paguModal > 0 ? $target53 : 0,
                    'realisasi_persen' => round($persenSerap53, 2),
                    'status' => $paguModal > 0 ? ($persenSerap53 >= $target53 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real53_kumulatif
                ],
                'poin' => [
                    'ikpa_hal_iii' => round($ikpa_hal_iii, 2),
                    'nilai_penyerapan' => round($nilai_penyerapan, 2),
                    'tertimbang_hal_iii' => $tertimbang_hal_iii,
                    'tertimbang_penyerapan' => $tertimbang_penyerapan,
                    'total_poin' => $total_poin_sira
                ]
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'satker' => $satker,
                'tahun' => $tahun,
                'pagu_total' => $paguTotal,
                'laporan_bulanan' => $laporan,
                'evaluasi_tw' => $evaluasi_tw // <- DIKIRIM KE REACT & PDF
            ]
        ]);
    }

    // =====================================================================
    // 📄 CETAK PDF LAPORAN (SANGAT DETAIL + EVALUASI PENYERAPAN TW)
    // =====================================================================
    public function cetakPdfLaporan(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        $satkerId = $request->query('satker_id');

        if (!$satkerId) {
            return response()->json(['status' => 'error', 'message' => 'Silakan pilih Satuan Kerja terlebih dahulu.'], 400);
        }

        $satker = Satker::find($satkerId);
        if (!$satker) {
            return response()->json(['status' => 'error', 'message' => 'Satker tidak ditemukan.'], 404);
        }

        $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
        $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

        $anggaran = Anggaran::where('satker_id', $satkerId)->where('tahun', $tahun)->first();
        $paguTotal = $anggaran ? $anggaran->pagu_efektif : 0;
        $paguGaji = ($isSetjen && $anggaran) ? $anggaran->belanja_gaji : 0;
        $paguBarang = $anggaran ? $anggaran->belanja_barang : 0;
        $paguModal = $anggaran ? $anggaran->belanja_modal : 0;

        $proporsi51 = $paguTotal > 0 ? ($paguGaji / $paguTotal) * 100 : 0;
        $proporsi52 = $paguTotal > 0 ? ($paguBarang / $paguTotal) * 100 : 0;
        $proporsi53 = $paguTotal > 0 ? ($paguModal / $paguTotal) * 100 : 0;

        $rpdList = RencanaPenarikan::where('satker_id', $satkerId)->where('tahun', $tahun)->where('status', 'approved')->get()->keyBy('bulan');
        $realisasiList = Realisasi::where('satker_id', $satkerId)->where('tahun', $tahun)->where('status', 'approved')->get()->keyBy('bulan');

        $laporan = [];
        $sumDeviasiTertimbangSeluruhBulan = 0;
        $bulanAdaData = 0;
        $namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $rpd = $rpdList->get($bulan);
            $realisasi = $realisasiList->get($bulan);

            $r51 = $isSetjen ? ($rpd ? $rpd->belanja_gaji : 0) : 0;
            $r52 = $rpd ? $rpd->belanja_barang : 0;
            $r53 = $rpd ? $rpd->belanja_modal : 0;
            $totRpd = $r51 + $r52 + $r53;

            $p51 = $isSetjen ? ($realisasi ? $realisasi->belanja_gaji : 0) : 0;
            $p52 = $realisasi ? $realisasi->belanja_barang : 0;
            $p53 = $realisasi ? $realisasi->belanja_modal : 0;
            $totReal = $p51 + $p52 + $p53;

            $d51 = abs($r51 - $p51);
            $d52 = abs($r52 - $p52);
            $d53 = abs($r53 - $p53);
            $totDeviasi = $d51 + $d52 + $d53;

            $hitungPersenDeviasi = function ($rpdNominal, $realisasiNominal) {
                $deviasiNominal = abs($rpdNominal - $realisasiNominal);
                if ($rpdNominal <= 0) {
                    return $realisasiNominal > 0 ? 100 : 0;
                }
                $persenDeviasi = ($deviasiNominal / $rpdNominal) * 100;
                return min($persenDeviasi, 100);
            };

            $pd51 = $hitungPersenDeviasi($r51, $p51);
            $pd52 = $hitungPersenDeviasi($r52, $p52);
            $pd53 = $hitungPersenDeviasi($r53, $p53);

            $devTertimbang51 = $pd51 * ($proporsi51 / 100);
            $devTertimbang52 = $pd52 * ($proporsi52 / 100);
            $devTertimbang53 = $pd53 * ($proporsi53 / 100);

            $totalDeviasiTertimbangBulanIni = $devTertimbang51 + $devTertimbang52 + $devTertimbang53;

            if ($totRpd > 0 || $totReal > 0) {
                $bulanAdaData++;
                $sumDeviasiTertimbangSeluruhBulan += $totalDeviasiTertimbangBulanIni;
                $rataKumulatif = $sumDeviasiTertimbangSeluruhBulan / $bulanAdaData;

                if ($rataKumulatif <= 5) {
                    $ikpa = 100;
                } else {
                    $ikpa = max(0, 100 - $rataKumulatif);
                }
            } else {
                $ikpa = '-';
                $totalDeviasiTertimbangBulanIni = 0;
                $rataKumulatif = 0;
            }

            $laporan[] = [
                'nama_bulan' => $namaBulan[$bulan - 1],
                'rpd_51' => $r51,
                'rpd_52' => $r52,
                'rpd_53' => $r53,
                'realisasi_51' => $p51,
                'realisasi_52' => $p52,
                'realisasi_53' => $p53,
                'deviasi_51' => $d51,
                'deviasi_52' => $d52,
                'deviasi_53' => $d53,
                'persen_deviasi_51' => ($r51 > 0 || $p51 > 0) ? round($pd51, 2) : '-',
                'persen_deviasi_52' => ($r52 > 0 || $p52 > 0) ? round($pd52, 2) : '-',
                'persen_deviasi_53' => ($r53 > 0 || $p53 > 0) ? round($pd53, 2) : '-',
                'proporsi_51' => round($proporsi51, 2),
                'proporsi_52' => round($proporsi52, 2),
                'proporsi_53' => round($proporsi53, 2),
                'dev_tertimbang_51' => round($devTertimbang51, 2),
                'dev_tertimbang_52' => round($devTertimbang52, 2),
                'dev_tertimbang_53' => round($devTertimbang53, 2),
                'persen_seluruh' => ($totRpd > 0 || $totReal > 0) ? round($totalDeviasiTertimbangBulanIni, 2) : '-',
                'rata_kumulatif' => ($totRpd > 0 || $totReal > 0) ? round($rataKumulatif, 2) : '-',
                'ikpa' => $ikpa === '-' ? '-' : round($ikpa, 2)
            ];
        }

        // =====================================================================
        // 🔥 FITUR BARU: EVALUASI TARGET & POIN TERTIMBANG UNTUK CETAK PDF
        // =====================================================================
        $evaluasi_tw = [];
        $tw_list = ['I', 'II', 'III', 'IV'];

        foreach ($tw_list as $tw) {
            $bulanAkhir = $this->getBulanAkhirTw($tw);

            $realisasiTWFiltered = $realisasiList->filter(function ($item, $key) use ($bulanAkhir) {
                return $key <= $bulanAkhir;
            });

            $real51_kumulatif = $isSetjen ? $realisasiTWFiltered->sum('belanja_gaji') : 0;
            $real52_kumulatif = $realisasiTWFiltered->sum('belanja_barang');
            $real53_kumulatif = $realisasiTWFiltered->sum('belanja_modal');

            $target51 = $this->getTargetKemenkeu($tw, '51');
            $target52 = $this->getTargetKemenkeu($tw, '52');
            $target53 = $this->getTargetKemenkeu($tw, '53');

            $persenSerap51 = $paguGaji > 0 ? ($real51_kumulatif / $paguGaji) * 100 : 0;
            $persenSerap52 = $paguBarang > 0 ? ($real52_kumulatif / $paguBarang) * 100 : 0;
            $persenSerap53 = $paguModal > 0 ? ($real53_kumulatif / $paguModal) * 100 : 0;

            // --- PERHITUNGAN NILAI KINERJA PENYERAPAN (RUMUS ASLI DJPB) ---
            $targetNominal51 = $paguGaji * ($target51 / 100);
            $targetNominal52 = $paguBarang * ($target52 / 100);
            $targetNominal53 = $paguModal * ($target53 / 100);

            $totalTargetNominalTW = $targetNominal51 + $targetNominal52 + $targetNominal53;
            $totalRealisasiKumulatifTW = $real51_kumulatif + $real52_kumulatif + $real53_kumulatif;

            $nilai_penyerapan = 0;
            if ($totalTargetNominalTW > 0) {
                $nilai_penyerapan = min(100, ($totalRealisasiKumulatifTW / $totalTargetNominalTW) * 100);
            } else if ($paguTotal == 0) {
                $nilai_penyerapan = 0;
            } else {
                $nilai_penyerapan = 100;
            }

            // Ambil Nilai IKPA Hal III (Dari bulan terakhir TW)
            $ikpa_hal_iii = $laporan[$bulanAkhir - 1]['ikpa'];
            $ikpa_hal_iii = $ikpa_hal_iii === '-' ? 0 : (float)$ikpa_hal_iii;

            // KALKULASI POIN TERTIMBANG SIRA (10% & 20%)
            $tertimbang_hal_iii = round(($ikpa_hal_iii * 10) / 100, 2);
            $tertimbang_penyerapan = round(($nilai_penyerapan * 20) / 100, 2);
            $total_poin_sira = round($tertimbang_hal_iii + $tertimbang_penyerapan, 2);

            $evaluasi_tw[$tw] = [
                '51' => [
                    'target_persen' => $paguGaji > 0 ? $target51 : 0,
                    'realisasi_persen' => round($persenSerap51, 2),
                    'status' => $paguGaji > 0 ? ($persenSerap51 >= $target51 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real51_kumulatif
                ],
                '52' => [
                    'target_persen' => $paguBarang > 0 ? $target52 : 0,
                    'realisasi_persen' => round($persenSerap52, 2),
                    'status' => $paguBarang > 0 ? ($persenSerap52 >= $target52 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real52_kumulatif
                ],
                '53' => [
                    'target_persen' => $paguModal > 0 ? $target53 : 0,
                    'realisasi_persen' => round($persenSerap53, 2),
                    'status' => $paguModal > 0 ? ($persenSerap53 >= $target53 ? 'Tercapai' : 'Gagal') : 'N/A',
                    'nominal' => $real53_kumulatif
                ],
                'poin' => [
                    'ikpa_hal_iii' => round($ikpa_hal_iii, 2),
                    'nilai_penyerapan' => round($nilai_penyerapan, 2),
                    'tertimbang_hal_iii' => $tertimbang_hal_iii,
                    'tertimbang_penyerapan' => $tertimbang_penyerapan,
                    'total_poin' => $total_poin_sira
                ]
            ];
        }

        $tanggalCetak = date('d') . ' ' . $namaBulan[date('n') - 1] . ' ' . date('Y');

        $data = [
            'satker' => $satker,
            'tahun' => $tahun,
            'pagu_total' => $paguTotal,
            'laporan' => $laporan,
            'evaluasi_tw' => $evaluasi_tw, // <- DIKIRIM KE PDF
            'tanggal_cetak' => $tanggalCetak
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.laporan-satker', $data);
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download("Laporan_Realisasi_IKPA_{$satker->kode_satker}_{$tahun}.pdf");
    }
}
