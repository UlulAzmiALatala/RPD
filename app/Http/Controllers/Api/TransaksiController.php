<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaPenarikan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransaksiController extends Controller
{
    public function storeRpd(Request $request)
    {
        // 1. Validasi Input
        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'messages' => $validator->errors()
            ], 422);
        }

        // 2. Cek Duplikasi (1 Satker hanya boleh 1 RPD per bulan/tahun)
        $existingRpd = RencanaPenarikan::where('satker_id', $request->satker_id)
            ->where('tahun', $request->tahun)
            ->where('bulan', $request->bulan)
            ->first();

        if ($existingRpd) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data RPD untuk Satker, Bulan, dan Tahun ini sudah ada. Silakan gunakan fitur edit.'
            ], 409); // Conflict
        }

        // 3. Simpan Data Baru
        $rpd = RencanaPenarikan::create([
            'satker_id' => $request->satker_id,
            'tahun' => $request->tahun,
            'bulan' => $request->bulan,
            'belanja_gaji' => $request->belanja_gaji,
            'belanja_barang' => $request->belanja_barang,
            'belanja_modal' => $request->belanja_modal,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data Rencana Penarikan Dana berhasil disimpan.',
            'data' => $rpd
        ], 201);
    }

    public function getRpd(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));

        // Ambil data RPD beserta relasi nama Satker-nya, diurutkan berdasarkan bulan
        $rpds = RencanaPenarikan::with('satker')
            ->where('tahun', $tahun)
            ->orderBy('bulan', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $rpds
        ]);
    }

    public function storeRealisasi(Request $request)
    {
        // 1. Validasi Input (Sama dengan RPD)
        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'messages' => $validator->errors()], 422);
        }

        // 2. Cek Duplikasi (Gunakan Model Realisasi)
        $existingRealisasi = \App\Models\Realisasi::where('satker_id', $request->satker_id)
            ->where('tahun', $request->tahun)
            ->where('bulan', $request->bulan)
            ->first();

        if ($existingRealisasi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Realisasi untuk Satker dan Bulan ini sudah ada. Silakan gunakan fitur edit.'
            ], 409);
        }

        // 3. Simpan Data Baru
        $realisasi = \App\Models\Realisasi::create([
            'satker_id' => $request->satker_id,
            'tahun' => $request->tahun,
            'bulan' => $request->bulan,
            'belanja_gaji' => $request->belanja_gaji,
            'belanja_barang' => $request->belanja_barang,
            'belanja_modal' => $request->belanja_modal,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data Realisasi berhasil disimpan.',
            'data' => $realisasi
        ], 201);
    }

    public function getRealisasi(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        $realisasis = \App\Models\Realisasi::with('satker')
            ->where('tahun', $tahun)
            ->orderBy('bulan', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $realisasis
        ]);
    }

    public function getLaporanRealisasi(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));
        $satkerId = $request->query('satker_id');

        if (!$satkerId) {
            return response()->json(['status' => 'error', 'message' => 'Silakan pilih Satuan Kerja terlebih dahulu.'], 400);
        }

        $satker = \App\Models\Satker::find($satkerId);
        if (!$satker) {
            return response()->json(['status' => 'error', 'message' => 'Satker tidak ditemukan.'], 404);
        }

        $rpdList = \App\Models\RencanaPenarikan::where('satker_id', $satkerId)->where('tahun', $tahun)->get()->keyBy('bulan');
        $realisasiList = \App\Models\Realisasi::where('satker_id', $satkerId)->where('tahun', $tahun)->get()->keyBy('bulan');

        $laporan = [];
        $sumDeviasiSeluruhBulan = 0; // Untuk menghitung kumulatif

        for ($bulan = 1; $bulan <= 12; $bulan++) {
            $rpd = $rpdList->get($bulan);
            $realisasi = $realisasiList->get($bulan);

            // Ambil data (51 = Gaji, 52 = Barang, 53 = Modal)
            $r51 = $rpd ? $rpd->belanja_gaji : 0;
            $r52 = $rpd ? $rpd->belanja_barang : 0;
            $r53 = $rpd ? $rpd->belanja_modal : 0;
            $totRpd = $r51 + $r52 + $r53;

            $p51 = $realisasi ? $realisasi->belanja_gaji : 0;
            $p52 = $realisasi ? $realisasi->belanja_barang : 0;
            $p53 = $realisasi ? $realisasi->belanja_modal : 0;
            $totReal = $p51 + $p52 + $p53;

            // Deviasi Nominal (Selisih Absolut)
            $d51 = abs($r51 - $p51);
            $d52 = abs($r52 - $p52);
            $d53 = abs($r53 - $p53);
            $totDeviasi = $d51 + $d52 + $d53;

            // % Deviasi per Jenis Belanja (Maksimal 100%)
            $pd51 = $r51 > 0 ? min(($d51 / $r51) * 100, 100) : ($p51 > 0 ? 100 : 0);
            $pd52 = $r52 > 0 ? min(($d52 / $r52) * 100, 100) : ($p52 > 0 ? 100 : 0);
            $pd53 = $r53 > 0 ? min(($d53 / $r53) * 100, 100) : ($p53 > 0 ? 100 : 0);

            // % Deviasi Seluruh Jenis Belanja (Bulan tsb)
            $pdSeluruh = $totRpd > 0 ? min(($totDeviasi / $totRpd) * 100, 100) : ($totReal > 0 ? 100 : 0);

            // Hitung Kumulatif & Rata-rata sesuai rumus DJPb
            $sumDeviasiSeluruhBulan += $pdSeluruh;
            $rataKumulatif = $sumDeviasiSeluruhBulan / $bulan;

            // IKPA
            $ikpa = 100 - $rataKumulatif;

            $laporan[] = [
                'bulan' => $bulan,
                'rencana' => ['b51' => $r51, 'b52' => $r52, 'b53' => $r53],
                'realisasi' => ['b51' => $p51, 'b52' => $p52, 'b53' => $p53],
                'deviasi' => ['b51' => $d51, 'b52' => $d52, 'b53' => $d53],
                'persen_deviasi' => ['b51' => round($pd51, 2), 'b52' => round($pd52, 2), 'b53' => round($pd53, 2)],
                'persen_seluruh' => round($pdSeluruh, 2),
                'rata_kumulatif' => round($rataKumulatif, 2),
                'ikpa' => round($ikpa, 2)
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'satker' => $satker,
                'tahun' => $tahun,
                'laporan_bulanan' => $laporan
            ]
        ]);
    }

    public function updateRpd(Request $request, $id)
    {
        $rpd = \App\Models\RencanaPenarikan::find($id);
        if (!$rpd) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'messages' => $validator->errors()], 422);
        }

        // Kita hanya mengizinkan edit nominalnya saja demi keamanan, satker & periode biarkan tetap
        $rpd->update([
            'belanja_gaji' => $request->belanja_gaji,
            'belanja_barang' => $request->belanja_barang,
            'belanja_modal' => $request->belanja_modal,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil diperbarui.']);
    }

    public function destroyRpd($id)
    {
        $rpd = \App\Models\RencanaPenarikan::find($id);
        if ($rpd) {
            $rpd->delete();
            return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil dihapus.']);
        }
        return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
    }

    // --- FUNGSI UPDATE & DELETE REALISASI ---

    public function updateRealisasi(Request $request, $id)
    {
        $realisasi = \App\Models\Realisasi::find($id);
        if (!$realisasi) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'messages' => $validator->errors()], 422);
        }

        $realisasi->update([
            'belanja_gaji' => $request->belanja_gaji,
            'belanja_barang' => $request->belanja_barang,
            'belanja_modal' => $request->belanja_modal,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data Realisasi berhasil diperbarui.']);
    }

    public function destroyRealisasi($id)
    {
        $realisasi = \App\Models\Realisasi::find($id);
        if ($realisasi) {
            $realisasi->delete();
            return response()->json(['status' => 'success', 'message' => 'Data Realisasi berhasil dihapus.']);
        }
        return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
    }
}
