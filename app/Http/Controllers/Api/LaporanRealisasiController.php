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
    // 🔥 LAPORAN REALISASI PER SATKER (DETAIL KOMPONEN IKPA)
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

        $anggaran = Anggaran::where('satker_id', $satkerId)->where('tahun', $tahun)->first();
        $paguTotal = $anggaran ? $anggaran->pagu_efektif : 0;
        $paguGaji = $anggaran ? $anggaran->belanja_gaji : 0;
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

            $r51 = $rpd ? $rpd->belanja_gaji : 0;
            $r52 = $rpd ? $rpd->belanja_barang : 0;
            $r53 = $rpd ? $rpd->belanja_modal : 0;
            $totRpd = $r51 + $r52 + $r53;

            $p51 = $realisasi ? $realisasi->belanja_gaji : 0;
            $p52 = $realisasi ? $realisasi->belanja_barang : 0;
            $p53 = $realisasi ? $realisasi->belanja_modal : 0;
            $totReal = $p51 + $p52 + $p53;

            $d51 = abs($r51 - $p51);
            $d52 = abs($r52 - $p52);
            $d53 = abs($r53 - $p53);
            $totDeviasi = $d51 + $d52 + $d53;

            $hitungPersenDeviasi = function ($rpdNominal, $deviasiNominal) {
                if ($rpdNominal <= 0) return 0;
                $persenDeviasi = ($deviasiNominal / $rpdNominal) * 100;
                return $persenDeviasi <= 5 ? 0 : $persenDeviasi; // Toleransi 5%
            };

            $pd51 = $hitungPersenDeviasi($r51, $d51);
            $pd52 = $hitungPersenDeviasi($r52, $d52);
            $pd53 = $hitungPersenDeviasi($r53, $d53);

            // Deviasi Tertimbang = Persen Deviasi Murni * (Proporsi / 100)
            $devTertimbang51 = $pd51 * ($proporsi51 / 100);
            $devTertimbang52 = $pd52 * ($proporsi52 / 100);
            $devTertimbang53 = $pd53 * ($proporsi53 / 100);

            $totalDeviasiTertimbangBulanIni = $devTertimbang51 + $devTertimbang52 + $devTertimbang53;

            if ($totRpd > 0 || $totReal > 0) {
                $bulanAdaData++;
                $sumDeviasiTertimbangSeluruhBulan += $totalDeviasiTertimbangBulanIni;
                $rataKumulatif = $sumDeviasiTertimbangSeluruhBulan / $bulanAdaData;
                $ikpa = max(0, 100 - $rataKumulatif);
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

        return response()->json([
            'status' => 'success',
            'data' => [
                'satker' => $satker,
                'tahun' => $tahun,
                'pagu_total' => $paguTotal,
                'laporan_bulanan' => $laporan
            ]
        ]);
    }

    // =====================================================================
    // 📄 CETAK PDF LAPORAN (SANGAT DETAIL)
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

        $anggaran = Anggaran::where('satker_id', $satkerId)->where('tahun', $tahun)->first();
        $paguTotal = $anggaran ? $anggaran->pagu_efektif : 0;
        $paguGaji = $anggaran ? $anggaran->belanja_gaji : 0;
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

            $r51 = $rpd ? $rpd->belanja_gaji : 0;
            $r52 = $rpd ? $rpd->belanja_barang : 0;
            $r53 = $rpd ? $rpd->belanja_modal : 0;
            $totRpd = $r51 + $r52 + $r53;

            $p51 = $realisasi ? $realisasi->belanja_gaji : 0;
            $p52 = $realisasi ? $realisasi->belanja_barang : 0;
            $p53 = $realisasi ? $realisasi->belanja_modal : 0;
            $totReal = $p51 + $p52 + $p53;

            $d51 = abs($r51 - $p51);
            $d52 = abs($r52 - $p52);
            $d53 = abs($r53 - $p53);
            $totDeviasi = $d51 + $d52 + $d53;

            $hitungPersenDeviasi = function ($rpdNominal, $deviasiNominal) {
                if ($rpdNominal <= 0) return 0;
                $persenDeviasi = ($deviasiNominal / $rpdNominal) * 100;
                return $persenDeviasi <= 5 ? 0 : $persenDeviasi; // Toleransi 5%
            };

            $pd51 = $hitungPersenDeviasi($r51, $d51);
            $pd52 = $hitungPersenDeviasi($r52, $d52);
            $pd53 = $hitungPersenDeviasi($r53, $d53);

            $devTertimbang51 = $pd51 * ($proporsi51 / 100);
            $devTertimbang52 = $pd52 * ($proporsi52 / 100);
            $devTertimbang53 = $pd53 * ($proporsi53 / 100);

            $totalDeviasiTertimbangBulanIni = $devTertimbang51 + $devTertimbang52 + $devTertimbang53;

            if ($totRpd > 0 || $totReal > 0) {
                $bulanAdaData++;
                $sumDeviasiTertimbangSeluruhBulan += $totalDeviasiTertimbangBulanIni;
                $rataKumulatif = $sumDeviasiTertimbangSeluruhBulan / $bulanAdaData;
                $ikpa = max(0, 100 - $rataKumulatif);
            } else {
                $ikpa = '-';
                $totalDeviasiTertimbangBulanIni = 0;
            }

            // 🔥 STRUKTUR ARRAY LENGKAP UNTUK PDF BLADE
            $laporan[] = [
                'nama_bulan' => $namaBulan[$bulan - 1],

                // Rencana
                'rpd_51' => $r51,
                'rpd_52' => $r52,
                'rpd_53' => $r53,

                // Realisasi
                'realisasi_51' => $p51,
                'realisasi_52' => $p52,
                'realisasi_53' => $p53,

                // Deviasi Nominal
                'deviasi_51' => $d51,
                'deviasi_52' => $d52,
                'deviasi_53' => $d53,

                // Persen Deviasi Murni
                'persen_deviasi_51' => ($r51 > 0 || $p51 > 0) ? round($pd51, 2) : '-',
                'persen_deviasi_52' => ($r52 > 0 || $p52 > 0) ? round($pd52, 2) : '-',
                'persen_deviasi_53' => ($r53 > 0 || $p53 > 0) ? round($pd53, 2) : '-',

                // Proporsi Pagu
                'proporsi_51' => round($proporsi51, 2),
                'proporsi_52' => round($proporsi52, 2),
                'proporsi_53' => round($proporsi53, 2),

                // Deviasi Tertimbang
                'dev_tertimbang_51' => round($devTertimbang51, 2),
                'dev_tertimbang_52' => round($devTertimbang52, 2),
                'dev_tertimbang_53' => round($devTertimbang53, 2),

                // Global
                'persen_seluruh' => ($totRpd > 0 || $totReal > 0) ? round($totalDeviasiTertimbangBulanIni, 2) : '-',
                'rata_kumulatif' => ($totRpd > 0 || $totReal > 0) ? round($rataKumulatif, 2) : '-',
                'ikpa' => $ikpa === '-' ? '-' : round($ikpa, 2)
            ];
        }

        $tanggalCetak = date('d') . ' ' . $namaBulan[date('n') - 1] . ' ' . date('Y');

        $data = [
            'satker' => $satker,
            'tahun' => $tahun,
            'pagu_total' => $paguTotal,
            'laporan' => $laporan,
            'tanggal_cetak' => $tanggalCetak
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.laporan-satker', $data);
        $pdf->setPaper('A4', 'landscape');

        return $pdf->download("Laporan_Realisasi_IKPA_{$satker->kode_satker}_{$tahun}.pdf");
    }
}
