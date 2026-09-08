<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satker;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $user = $request->user(); // Tarik data siapa yang login
            $isAdmin = $user->role === 'admin';

            // 1. Ambil Data Satker Sesuai Role
            $satkerQuery = Satker::with(['anggarans' => function ($query) use ($tahun) {
                $query->where('tahun', $tahun);
            }]);

            // Jika dia Satker, filter HANYA satker miliknya saja!
            if (!$isAdmin) {
                $satkerQuery->where('kode_satker', $user->kode_satker);
            }

            $satkers = $satkerQuery->get();
            $satkerIds = $satkers->pluck('id')->toArray(); // Array ID Satker (berguna untuk filter lanjutan)

            $totalAnggaran = 0;
            foreach ($satkers as $satker) {
                foreach ($satker->anggarans as $anggaran) {
                    $totalAnggaran += $anggaran->pagu_efektif;
                }
            }

            // 2. Kalkulasi Data Grafik & Deviasi Kumulatif
            $grafik = [];
            $bulanIni = date('n');
            $rpdBulanIni = 0;
            $realisasiBulanIni = 0;

            $sumDeviasiKumulatif = 0;
            $ikpaGlobalBerjalan = 100;

            for ($i = 1; $i <= 12; $i++) {
                // Siapkan Query per Bulan
                $rpdQuery = RencanaPenarikan::where('tahun', $tahun)->where('bulan', $i);
                $realisasiQuery = Realisasi::where('tahun', $tahun)->where('bulan', $i);

                // Filter Hak Akses Satker
                if (!$isAdmin) {
                    $rpdQuery->whereIn('satker_id', $satkerIds);
                    $realisasiQuery->whereIn('satker_id', $satkerIds);
                }

                $rpdBulan = $rpdQuery->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')->value('total') ?? 0;
                $realisasiBulan = $realisasiQuery->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')->value('total') ?? 0;

                // Hitung Deviasi
                $deviasiBulanIni = abs($rpdBulan - $realisasiBulan);
                $persenDeviasi = $rpdBulan > 0 ? min(($deviasiBulanIni / $rpdBulan) * 100, 100) : (($realisasiBulan > 0) ? 100 : 0);

                $sumDeviasiKumulatif += $persenDeviasi;
                $rataKumulatif = $sumDeviasiKumulatif / $i;

                // Tangkap data khusus untuk bulan berjalan
                if ($i == $bulanIni) {
                    $rpdBulanIni = $rpdBulan;
                    $realisasiBulanIni = $realisasiBulan;
                    $ikpaGlobalBerjalan = 100 - $rataKumulatif;
                }

                // Format untuk Recharts di Frontend
                $namaBulan = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
                $grafik[] = [
                    'name' => $namaBulan[$i],
                    'RPD' => round($rpdBulan / 1000000000, 2),
                    'Realisasi' => round($realisasiBulan / 1000000000, 2)
                ];
            }

            // Hitung Total RPD dan Realisasi Setahun Penuh (Untuk Card Dashboard Satker)
            $queryTotalRpd = RencanaPenarikan::where('tahun', $tahun);
            $queryTotalReal = Realisasi::where('tahun', $tahun);
            if (!$isAdmin) {
                $queryTotalRpd->whereIn('satker_id', $satkerIds);
                $queryTotalReal->whereIn('satker_id', $satkerIds);
            }
            $totalRpdSetahun = $queryTotalRpd->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')->value('total') ?? 0;
            $totalRealSetahun = $queryTotalReal->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')->value('total') ?? 0;

            // 3. Tambahkan persentase penyerapan per satker untuk tabel bawah
            $tabelSatker = $satkers->map(function ($satker) use ($tahun) {
                $paguSatker = $satker->anggarans->sum('pagu_efektif');
                $realisasiSatker = Realisasi::where('satker_id', $satker->id)->where('tahun', $tahun)
                    ->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')
                    ->value('total') ?? 0;

                return [
                    'id' => $satker->id,
                    'kode_satker' => $satker->kode_satker,
                    'nama_satker' => $satker->nama_satker,
                    'total_pagu' => $paguSatker,
                    'total_realisasi' => $realisasiSatker,
                    'persen_serap' => $paguSatker > 0 ? round(($realisasiSatker / $paguSatker) * 100, 2) : 0
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'tahun' => $tahun,
                    'summary' => [
                        'total_anggaran' => $totalAnggaran,
                        'rpd_bulan_ini' => $rpdBulanIni,
                        'realisasi_bulan_ini' => $realisasiBulanIni,
                        'total_rpd_setahun' => $totalRpdSetahun,
                        'total_realisasi_setahun' => $totalRealSetahun,
                        'ikpa' => round($ikpaGlobalBerjalan, 2)
                    ],
                    'grafik' => $grafik,
                    'tabel_satker' => $tabelSatker
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
