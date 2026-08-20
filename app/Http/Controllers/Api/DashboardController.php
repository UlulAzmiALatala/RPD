<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satker;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));

        // 1. Ambil Data Satker & Total Pagu Anggaran (Tabel Bawah)
        $satkers = Satker::with(['anggarans' => function ($query) use ($tahun) {
            $query->where('tahun', $tahun);
        }])->get();

        $totalAnggaran = 0;
        foreach ($satkers as $satker) {
            foreach ($satker->anggarans as $anggaran) {
                $totalAnggaran += ($anggaran->belanja_gaji + $anggaran->belanja_barang + $anggaran->belanja_modal);
            }
        }

        // 2. Kalkulasi Data Grafik (Tren Bulanan RPD vs Realisasi)
        $grafik = [];
        $totalRpdTahunIni = 0;
        $totalRealisasiTahunIni = 0;

        $bulanIni = date('n'); // Mengambil angka bulan saat ini berjalan (1-12)
        $rpdBulanIni = 0;
        $realisasiBulanIni = 0;

        for ($i = 1; $i <= 12; $i++) {
            // Hitung total RPD semua satker di bulan ke-$i
            $rpdBulan = RencanaPenarikan::where('tahun', $tahun)->where('bulan', $i)
                ->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')
                ->value('total') ?? 0;

            // Hitung total Realisasi semua satker di bulan ke-$i
            $realisasiBulan = Realisasi::where('tahun', $tahun)->where('bulan', $i)
                ->selectRaw('SUM(belanja_gaji + belanja_barang + belanja_modal) as total')
                ->value('total') ?? 0;

            $totalRpdTahunIni += $rpdBulan;
            $totalRealisasiTahunIni += $realisasiBulan;

            // Simpan data khusus untuk bulan yang sedang berjalan (untuk Summary Card)
            if ($i == $bulanIni) {
                $rpdBulanIni = $rpdBulan;
                $realisasiBulanIni = $realisasiBulan;
            }

            // Format data untuk library Recharts di React
            $namaBulan = ["", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

            $grafik[] = [
                'name' => $namaBulan[$i],
                // Dibagi 1 Milyar agar angka di grafik tidak terlalu panjang (misal: 15.000.000.000 jadi 15)
                'RPD' => round($rpdBulan / 1000000000, 2),
                'Realisasi' => round($realisasiBulan / 1000000000, 2)
            ];
        }

        // 3. Hitung IKPA Rata-rata Global (Tahun Berjalan)
        $ikpa = 100;
        if ($totalRpdTahunIni > 0) {
            $persentase = ($totalRealisasiTahunIni / $totalRpdTahunIni) * 100;
            $ikpa = $persentase > 100 ? 100 : round($persentase, 2);
        } else if ($totalRpdTahunIni == 0 && $totalRealisasiTahunIni > 0) {
            $ikpa = 0;
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'tahun' => $tahun,
                'summary' => [
                    'total_anggaran' => $totalAnggaran,
                    'rpd_bulan_ini' => $rpdBulanIni,
                    'realisasi_bulan_ini' => $realisasiBulanIni,
                    'ikpa' => $ikpa
                ],
                'grafik' => $grafik,
                'tabel_satker' => $satkers
            ]
        ]);
    }
}
