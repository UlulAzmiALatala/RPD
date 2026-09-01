<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\Satker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TransaksiController extends Controller
{
    // =====================================================================
    // BAGIAN RENCANA PENARIKAN DANA (RPD)
    // =====================================================================

    public function getRpd(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $search = $request->query('search');

            // Ambil data RPD beserta relasi nama Satker-nya
            $query = RencanaPenarikan::with('satker')
                ->where('tahun', $tahun)
                ->orderBy('bulan', 'asc');

            // Fitur Pencarian berdasarkan nama/kode satker
            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            }

            // Paginasi (10 data per halaman) agar rapi di UI baru
            $rpds = $query->paginate(10);

            return response()->json($rpds);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function storeRpd(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $existingRpd = RencanaPenarikan::where('satker_id', $request->satker_id)
            ->where('tahun', $request->tahun)
            ->where('bulan', $request->bulan)
            ->exists();

        if ($existingRpd) {
            return response()->json(['status' => 'error', 'message' => 'Data RPD untuk Satker, Bulan, dan Tahun ini sudah ada. Silakan gunakan fitur edit.'], 409);
        }

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

    public function updateRpd(Request $request, $id)
    {
        $rpd = RencanaPenarikan::find($id);
        if (!$rpd) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $rpd->update([
            'belanja_gaji' => $request->belanja_gaji,
            'belanja_barang' => $request->belanja_barang,
            'belanja_modal' => $request->belanja_modal,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil diperbarui.']);
    }

    public function destroyRpd($id)
    {
        $rpd = RencanaPenarikan::find($id);
        if ($rpd) {
            $rpd->delete();
            return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil dihapus.']);
        }
        return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
    }

    // =====================================================================
    // BAGIAN REALISASI (DENGAN RINCIAN DETAIL DINAMIS)
    // =====================================================================

    public function getRealisasi(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $search = $request->query('search');

            // Ambil data Realisasi beserta relasi Satker dan Details
            $query = Realisasi::with(['satker', 'details'])
                ->where('tahun', $tahun)
                ->orderBy('bulan', 'asc');

            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            }

            // Paginasi 10 data per halaman
            $realisasis = $query->paginate(10);

            return response()->json($realisasis);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function storeRealisasi(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            // Rincian harus berupa array dan minimal ada 1 item
            'rincian' => 'required|array|min:1',
            'rincian.*.jenis_belanja' => 'required|in:gaji,barang,modal',
            'rincian.*.uraian' => 'required|string|max:255',
            'rincian.*.nominal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        // Cek duplikat bulan dan tahun untuk satker yang sama
        $exists = Realisasi::where('satker_id', $request->satker_id)
            ->where('tahun', $request->tahun)
            ->where('bulan', $request->bulan)
            ->exists();

        if ($exists) {
            return response()->json(['status' => 'error', 'message' => 'Data Realisasi untuk bulan ini sudah ada! Gunakan fitur Edit.'], 409);
        }

        // Mulai Transaksi Database
        DB::beginTransaction();
        try {
            $belanjaGaji = 0;
            $belanjaBarang = 0;
            $belanjaModal = 0;

            // Hitung otomatis total masing-masing dari array rincian
            foreach ($request->rincian as $item) {
                if ($item['jenis_belanja'] == 'gaji') $belanjaGaji += $item['nominal'];
                if ($item['jenis_belanja'] == 'barang') $belanjaBarang += $item['nominal'];
                if ($item['jenis_belanja'] == 'modal') $belanjaModal += $item['nominal'];
            }

            // 1. Simpan ke Tabel Induk
            $realisasi = Realisasi::create([
                'satker_id' => $request->satker_id,
                'tahun' => $request->tahun,
                'bulan' => $request->bulan,
                'belanja_gaji' => $belanjaGaji,
                'belanja_barang' => $belanjaBarang,
                'belanja_modal' => $belanjaModal,
            ]);

            // 2. Simpan ke Tabel Anak (Detail)
            foreach ($request->rincian as $item) {
                $realisasi->details()->create([
                    'jenis_belanja' => $item['jenis_belanja'],
                    'uraian' => $item['uraian'],
                    'nominal' => $item['nominal']
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data Realisasi dan Rincian berhasil disimpan.',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal menyimpan data: ' . $e->getMessage()], 500);
        }
    }

    public function updateRealisasi(Request $request, $id)
    {
        $realisasi = Realisasi::find($id);
        if (!$realisasi) {
            return response()->json(['status' => 'error', 'message' => 'Data Realisasi tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'rincian' => 'required|array|min:1',
            'rincian.*.jenis_belanja' => 'required|in:gaji,barang,modal',
            'rincian.*.uraian' => 'required|string|max:255',
            'rincian.*.nominal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        DB::beginTransaction();
        try {
            $belanjaGaji = 0;
            $belanjaBarang = 0;
            $belanjaModal = 0;

            foreach ($request->rincian as $item) {
                if ($item['jenis_belanja'] == 'gaji') $belanjaGaji += $item['nominal'];
                if ($item['jenis_belanja'] == 'barang') $belanjaBarang += $item['nominal'];
                if ($item['jenis_belanja'] == 'modal') $belanjaModal += $item['nominal'];
            }

            // 1. Update Tabel Induk
            $realisasi->update([
                'belanja_gaji' => $belanjaGaji,
                'belanja_barang' => $belanjaBarang,
                'belanja_modal' => $belanjaModal,
            ]);

            // 2. Hapus detail lama, lalu masukkan detail baru (Lebih aman dan bersih)
            $realisasi->details()->delete();
            foreach ($request->rincian as $item) {
                $realisasi->details()->create([
                    'jenis_belanja' => $item['jenis_belanja'],
                    'uraian' => $item['uraian'],
                    'nominal' => $item['nominal']
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Data Realisasi berhasil diperbarui.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal update data: ' . $e->getMessage()], 500);
        }
    }

    public function destroyRealisasi($id)
    {
        $realisasi = Realisasi::find($id);
        if ($realisasi) {
            // Karena kita pakai onDelete('cascade') di migration, details-nya akan otomatis terhapus
            $realisasi->delete();
            return response()->json(['status' => 'success', 'message' => 'Data Realisasi dan rinciannya berhasil dihapus.']);
        }
        return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
    }

    // =====================================================================
    // BAGIAN LAPORAN
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

        $rpdList = RencanaPenarikan::where('satker_id', $satkerId)->where('tahun', $tahun)->get()->keyBy('bulan');
        $realisasiList = Realisasi::where('satker_id', $satkerId)->where('tahun', $tahun)->get()->keyBy('bulan');

        $laporan = [];
        $sumDeviasiSeluruhBulan = 0;

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

            // Deviasi Nominal
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
}
