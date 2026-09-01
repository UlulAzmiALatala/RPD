<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnggaranController extends Controller
{
    // 1. Mengambil daftar Pagu Anggaran (Dengan Paginasi & Search)
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            // Query data anggaran beserta relasi satkernya
            $query = Anggaran::with('satker')->orderBy('created_at', 'desc');

            // Filter Pencarian (Cari berdasarkan Nama Satker, Kode, atau Tahun)
            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                })->orWhere('tahun', 'like', "%{$search}%");
            }

            // Gunakan paginate Laravel (10 data per halaman)
            $anggarans = $query->paginate(10);

            return response()->json($anggarans);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data anggaran: ' . $e->getMessage()
            ], 500);
        }
    }

    // 2. Menyimpan Pagu Anggaran Baru (Tanpa Pagu Blokir)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        // Cek apakah data satker di tahun tersebut sudah ada
        $exists = Anggaran::where('satker_id', $request->satker_id)->where('tahun', $request->tahun)->exists();
        if ($exists) {
            return response()->json(['status' => 'error', 'message' => 'Pagu Anggaran untuk Satker dan Tahun ini sudah ada! Gunakan fitur edit.'], 422);
        }

        $belanjaGaji = $request->belanja_gaji ?: 0;
        $belanjaBarang = $request->belanja_barang ?: 0;
        $belanjaModal = $request->belanja_modal ?: 0;
        $paguBlokir = 0; // Default 0 saat pertama kali tambah

        // --- KALKULASI OTOMATIS ---
        $totalPagu = $belanjaGaji + $belanjaBarang + $belanjaModal;
        $paguEfektif = $totalPagu - $paguBlokir;

        $anggaran = Anggaran::create([
            'satker_id' => $request->satker_id,
            'tahun' => $request->tahun,
            'belanja_gaji' => $belanjaGaji,
            'belanja_barang' => $belanjaBarang,
            'belanja_modal' => $belanjaModal,
            'total_pagu' => $totalPagu,
            'pagu_blokir' => $paguBlokir,
            'pagu_efektif' => $paguEfektif,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pagu Anggaran berhasil disimpan.',
            'data' => $anggaran
        ]);
    }

    // 3. Mengupdate Pagu Anggaran (Termasuk Pagu Blokir)
    public function update(Request $request, $id)
    {
        $anggaran = Anggaran::find($id);
        if (!$anggaran) {
            return response()->json(['status' => 'error', 'message' => 'Data Anggaran tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
            'pagu_blokir' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $belanjaGaji = $request->belanja_gaji;
        $belanjaBarang = $request->belanja_barang;
        $belanjaModal = $request->belanja_modal;
        $paguBlokir = $request->pagu_blokir;

        // --- KALKULASI OTOMATIS ---
        $totalPagu = $belanjaGaji + $belanjaBarang + $belanjaModal;

        // Validasi ekstra: Pagu Blokir logikanya tidak mungkin lebih besar dari Total Pagu
        if ($paguBlokir > $totalPagu) {
            return response()->json(['status' => 'error', 'message' => 'Nominal Pagu Blokir tidak boleh melebihi Total Pagu!'], 422);
        }

        $paguEfektif = $totalPagu - $paguBlokir;

        $anggaran->update([
            'belanja_gaji' => $belanjaGaji,
            'belanja_barang' => $belanjaBarang,
            'belanja_modal' => $belanjaModal,
            'total_pagu' => $totalPagu,
            'pagu_blokir' => $paguBlokir,
            'pagu_efektif' => $paguEfektif,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Pagu Anggaran berhasil diperbarui.',
            'data' => $anggaran
        ]);
    }

    // 4. Menghapus Data Pagu Anggaran
    public function destroy($id)
    {
        $anggaran = Anggaran::find($id);
        if (!$anggaran) {
            return response()->json(['status' => 'error', 'message' => 'Data Anggaran tidak ditemukan.'], 404);
        }

        $anggaran->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Pagu Anggaran berhasil dihapus.'
        ]);
    }
}
