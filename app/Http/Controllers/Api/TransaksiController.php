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

        // Validasi agar satker_id wajib diisi untuk laporan ini
        if (!$satkerId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan pilih Satuan Kerja terlebih dahulu.'
            ], 400);
        }

        // Ambil data detail Satker
        $satker = \App\Models\Satker::find($satkerId);

        if (!$satker) {
            return response()->json(['status' => 'error', 'message' => 'Satker tidak ditemukan.'], 404);
        }

        // Ambil semua RPD untuk satker dan tahun terpilih
        $rpdList = \App\Models\RencanaPenarikan::where('satker_id', $satkerId)
            ->where('tahun', $tahun)
            ->get()
            ->keyBy('bulan'); // Jadikan bulan sebagai key array agar mudah dicari

        // Ambil semua Realisasi untuk satker dan tahun terpilih
        $realisasiList = \App\Models\Realisasi::where('satker_id', $satkerId)
            ->where('tahun', $tahun)
            ->get()
            ->keyBy('bulan');

        $laporan = [];
        $totalDeviasi = 0;

        // Looping dari bulan 1 (Januari) sampai 12 (Desember)
        for ($bulan = 1; $bulan <= 12; $bulan++) {

            // Ambil data jika ada, jika tidak set default 0
            $rpd = $rpdList->get($bulan);
            $realisasi = $realisasiList->get($bulan);

            // Hitung total RPD per bulan (Gaji + Barang + Modal)
            $totalRpdBulan = $rpd ? ($rpd->belanja_gaji + $rpd->belanja_barang + $rpd->belanja_modal) : 0;

            // Hitung total Realisasi per bulan
            $totalRealisasiBulan = $realisasi ? ($realisasi->belanja_gaji + $realisasi->belanja_barang + $realisasi->belanja_modal) : 0;

            // Hitung Deviasi (Selisih)
            // Sesuai kaidah keuangan, Deviasi = Nilai absolut selisih antara Rencana dan Realisasi
            $deviasi = abs($totalRpdBulan - $totalRealisasiBulan);
            $totalDeviasi += $deviasi;

            // Hitung IKPA (Indikator Kinerja Pelaksanaan Anggaran) sederhana
            // Jika RPD 0 dan Realisasi 0, IKPA = 100%. Jika RPD 0 tapi ada realisasi, IKPA = 0%
            $ikpa = 100;
            if ($totalRpdBulan > 0) {
                // Rumus sederhana: (Realisasi / RPD) * 100, maksimal 100%
                $persentase = ($totalRealisasiBulan / $totalRpdBulan) * 100;
                // Dalam beberapa aturan, jika realisasi melebihi RPD, nilainya bisa berkurang. 
                // Untuk tahap awal, kita batasi maksimal 100
                $ikpa = $persentase > 100 ? 100 : round($persentase, 2);
            } else if ($totalRpdBulan == 0 && $totalRealisasiBulan > 0) {
                $ikpa = 0;
            }

            $laporan[] = [
                'bulan' => $bulan,
                'rpd_gaji' => $rpd ? $rpd->belanja_gaji : 0,
                'rpd_barang' => $rpd ? $rpd->belanja_barang : 0,
                'rpd_modal' => $rpd ? $rpd->belanja_modal : 0,
                'rpd_total' => $totalRpdBulan,

                'realisasi_gaji' => $realisasi ? $realisasi->belanja_gaji : 0,
                'realisasi_barang' => $realisasi ? $realisasi->belanja_barang : 0,
                'realisasi_modal' => $realisasi ? $realisasi->belanja_modal : 0,
                'realisasi_total' => $totalRealisasiBulan,

                'deviasi' => $deviasi,
                'ikpa' => $ikpa
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'satker' => $satker,
                'tahun' => $tahun,
                'laporan_bulanan' => $laporan,
                'summary' => [
                    'total_deviasi' => $totalDeviasi
                ]
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
