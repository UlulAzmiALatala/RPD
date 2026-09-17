<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satker;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $user = $request->user();
            $isAdmin = $user->role === 'admin';
            $tw = $request->query('tw'); // 🔥 Tangkap parameter Triwulan

            // =========================================================
            // 1. AMBIL DATA SATKER SESUAI ROLE (RBAC) & FILTER
            // =========================================================
            $satkerQuery = Satker::with(['anggarans' => function ($query) use ($tahun) {
                $query->where('tahun', $tahun);
            }]);

            if (!$isAdmin) {
                // Kunci mati ke satker miliknya
                $satkerQuery->where('kode_satker', $user->kode_satker);
            } else {
                if ($request->has('satker_id') && $request->query('satker_id') != '') {
                    $satkerQuery->where('id', $request->query('satker_id'));
                }
            }

            $satkers = $satkerQuery->get();
            $satkerIds = $satkers->pluck('id')->toArray();

            $totalAnggaran = 0;
            foreach ($satkers as $satker) {
                foreach ($satker->anggarans as $anggaran) {
                    $totalAnggaran += $anggaran->pagu_efektif;
                }
            }

            // =========================================================
            // 2. KALKULASI DATA GRAFIK & IKPA KUMULATIF
            // =========================================================
            $grafik = [];
            $sumDeviasiKumulatif = 0;
            $ikpaGlobalBerjalan = 100;
            $bulanAdaData = 0;

            for ($i = 1; $i <= 12; $i++) {
                $rpdQuery = RencanaPenarikan::where('tahun', $tahun)->where('bulan', $i)->where('status', 'approved')->whereIn('satker_id', $satkerIds);
                $realisasiQuery = Realisasi::where('tahun', $tahun)->where('bulan', $i)->where('status', 'approved')->whereIn('satker_id', $satkerIds);

                $rpdBulan = $rpdQuery->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')->value('total') ?? 0;
                $realisasiBulan = $realisasiQuery->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')->value('total') ?? 0;

                $deviasiBulanIni = abs($rpdBulan - $realisasiBulan);
                $persenDeviasi = $rpdBulan > 0 ? min(($deviasiBulanIni / $rpdBulan) * 100, 100) : (($realisasiBulan > 0) ? 100 : 0);

                if ($rpdBulan > 0 || $realisasiBulan > 0) {
                    $bulanAdaData++;
                    $sumDeviasiKumulatif += $persenDeviasi;
                    $rataKumulatif = $sumDeviasiKumulatif / $bulanAdaData;
                    $ikpaGlobalBerjalan = 100 - $rataKumulatif;
                }

                $namaBulan = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                $grafik[] = [
                    'name' => $namaBulan[$i],
                    'RPD' => round($rpdBulan / 1000000000, 2),
                    'Realisasi' => round($realisasiBulan / 1000000000, 2)
                ];
            }

            // =========================================================
            // 3. KALKULASI TOTAL TERFILTER OLEH TW
            // =========================================================
            $queryTotalRpd = RencanaPenarikan::where('tahun', $tahun)->where('status', 'approved')->whereIn('satker_id', $satkerIds);
            $queryTotalReal = Realisasi::where('tahun', $tahun)->where('status', 'approved')->whereIn('satker_id', $satkerIds);

            if ($tw === 'I') {
                $queryTotalRpd->whereBetween('bulan', [1, 3]);
                $queryTotalReal->whereBetween('bulan', [1, 3]);
            } elseif ($tw === 'II') {
                $queryTotalRpd->whereBetween('bulan', [4, 6]);
                $queryTotalReal->whereBetween('bulan', [4, 6]);
            } elseif ($tw === 'III') {
                $queryTotalRpd->whereBetween('bulan', [7, 9]);
                $queryTotalReal->whereBetween('bulan', [7, 9]);
            } elseif ($tw === 'IV') {
                $queryTotalRpd->whereBetween('bulan', [10, 12]);
                $queryTotalReal->whereBetween('bulan', [10, 12]);
            }

            $rpdsFiltered = $queryTotalRpd->get();
            $realisasisFiltered = $queryTotalReal->get();

            // 🔥 TOTAL RPD DAN REALISASI TERFILTER
            $totalRpdTerfilter = $rpdsFiltered->sum(function ($q) {
                return $q->belanja_gaji + $q->belanja_barang + $q->belanja_modal;
            });

            // 🔥 RINCIAN BELANJA (51, 52, 53) SUDAH TEPAT
            $rincianBelanja = [
                'gaji' => $realisasisFiltered->sum('belanja_gaji'),
                'barang' => $realisasisFiltered->sum('belanja_barang'),
                'modal' => $realisasisFiltered->sum('belanja_modal')
            ];
            $totalRealisasiTerfilter = $rincianBelanja['gaji'] + $rincianBelanja['barang'] + $rincianBelanja['modal'];

            // 🔥 PERSENTASE REALISASI UNTUK AI INSIGHT
            $persentaseRealisasiDashboard = $totalAnggaran > 0 ? round(($totalRealisasiTerfilter / $totalAnggaran) * 100, 2) : 0;

            // =========================================================
            // 4. TABEL SATKER
            // =========================================================
            $tabelSatker = $satkers->map(function ($satker) use ($tahun, $tw) {
                $paguSatker = $satker->anggarans->sum('pagu_efektif');

                $realisasiSatkerQuery = Realisasi::where('satker_id', $satker->id)->where('tahun', $tahun)->where('status', 'approved');
                if ($tw === 'I') $realisasiSatkerQuery->whereBetween('bulan', [1, 3]);
                elseif ($tw === 'II') $realisasiSatkerQuery->whereBetween('bulan', [4, 6]);
                elseif ($tw === 'III') $realisasiSatkerQuery->whereBetween('bulan', [7, 9]);
                elseif ($tw === 'IV') $realisasiSatkerQuery->whereBetween('bulan', [10, 12]);

                $realisasiSatker = $realisasiSatkerQuery->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')->value('total') ?? 0;
                $persenSerap = $paguSatker > 0 ? round(($realisasiSatker / $paguSatker) * 100, 2) : 0;

                return [
                    'id' => $satker->id,
                    'kode_satker' => $satker->kode_satker,
                    'nama_satker' => $satker->nama_satker,
                    'total_pagu' => $paguSatker,
                    'total_realisasi' => $realisasiSatker,
                    'persen_serap' => $persenSerap
                ];
            });

            // =========================================================
            // 5. FITUR ADMIN: LEADERBOARD & CCTV
            // =========================================================
            $topSatker = [];
            $bottomSatker = [];
            $miniCCTV = [];

            if ($isAdmin) {
                $sortedSatker = collect($tabelSatker)->sortByDesc('persen_serap')->values();
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
                    'summary' => [
                        'total_anggaran' => $totalAnggaran,
                        'total_rpd_setahun' => $totalRpdTerfilter,
                        'total_realisasi_setahun' => $totalRealisasiTerfilter,
                        'ikpa' => round($ikpaGlobalBerjalan, 2),
                        'status_kesehatan' => $ikpaGlobalBerjalan >= 95 ? 'Sangat Baik' : ($ikpaGlobalBerjalan >= 85 ? 'Baik' : 'Perlu Evaluasi'),
                        'persentase_realisasi' => $persentaseRealisasiDashboard
                    ],
                    'grafik' => $grafik,
                    'tabel_satker' => $tabelSatker,
                    'rincian_belanja' => $rincianBelanja, // 🔥 Rincian sudah ada!
                    'leaderboard' => [
                        'top' => $topSatker,
                        'bottom' => $bottomSatker
                    ],
                    'cctv_mini' => $miniCCTV
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
