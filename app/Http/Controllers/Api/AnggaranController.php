<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggaran;
use App\Models\ActivityLog;
use App\Models\Satker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnggaranController extends Controller
{
    // 1. Mengambil daftar Pagu Anggaran (Dengan Paginasi & Search)
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            $query = Anggaran::with('satker')->orderBy('created_at', 'desc');

            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                })->orWhere('tahun', 'like', "%{$search}%");
            }

            $anggarans = $query->paginate(10);

            return response()->json($anggarans);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat data anggaran: ' . $e->getMessage()
            ], 500);
        }
    }

    // 2. Menyimpan Pagu Anggaran Baru
    public function store(Request $request)
    {
        // 🔒 Ubah belanja_gaji menjadi nullable agar tidak crash saat frontend mengirim string kosong ("")
        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'belanja_gaji' => 'nullable|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
            'blokir_gaji' => 'nullable|numeric|min:0',
            'blokir_barang' => 'nullable|numeric|min:0',
            'blokir_modal' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $exists = Anggaran::where('satker_id', $request->satker_id)->where('tahun', $request->tahun)->exists();
        if ($exists) {
            return response()->json(['status' => 'error', 'message' => 'Pagu Anggaran untuk Satker dan Tahun ini sudah ada! Gunakan fitur edit.'], 422);
        }

        // 🔥 LOGIKA KEAMANAN BACKEND: CEK SETJEN
        $satker = Satker::find($request->satker_id);
        $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
        $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL') || ($satker->kode_satker === '692028');

        // Jika bukan Setjen, PAKSA nilai Gaji menjadi 0 secara mutlak!
        $belanjaGaji = $isSetjen ? ($request->belanja_gaji ?: 0) : 0;
        $blokirGaji = $isSetjen ? ($request->blokir_gaji ?: 0) : 0;

        $belanjaBarang = $request->belanja_barang ?: 0;
        $belanjaModal = $request->belanja_modal ?: 0;
        $blokirBarang = $request->blokir_barang ?: 0;
        $blokirModal = $request->blokir_modal ?: 0;

        // Validasi Ekstra: Blokir tidak boleh lebih besar dari Pagu per belanja
        if ($blokirGaji > $belanjaGaji || $blokirBarang > $belanjaBarang || $blokirModal > $belanjaModal) {
            return response()->json(['status' => 'error', 'message' => 'Pagu Blokir tidak boleh melebihi Pagu di masing-masing jenis belanja!'], 422);
        }

        $totalPagu = $belanjaGaji + $belanjaBarang + $belanjaModal;
        $paguBlokir = $blokirGaji + $blokirBarang + $blokirModal;
        $paguEfektif = $totalPagu - $paguBlokir;

        $anggaran = Anggaran::create([
            'satker_id' => $request->satker_id,
            'tahun' => $request->tahun,
            'belanja_gaji' => $belanjaGaji,
            'belanja_barang' => $belanjaBarang,
            'belanja_modal' => $belanjaModal,
            'blokir_gaji' => $blokirGaji,
            'blokir_barang' => $blokirBarang,
            'blokir_modal' => $blokirModal,
            'total_pagu' => $totalPagu,
            'pagu_blokir' => $paguBlokir,
            'pagu_efektif' => $paguEfektif,
        ]);

        ActivityLog::record(
            'CREATE',
            'MASTER ANGGARAN',
            "Menambahkan Pagu DIPA Awal Tahun {$request->tahun} untuk Satker {$satker->nama_satker} senilai Rp " . number_format($totalPagu, 0, ',', '.')
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pagu Anggaran berhasil disimpan.',
            'data' => $anggaran
        ]);
    }

    // 3. Mengupdate Pagu Anggaran
    public function update(Request $request, $id)
    {
        $anggaran = Anggaran::find($id);
        if (!$anggaran) {
            return response()->json(['status' => 'error', 'message' => 'Data Anggaran tidak ditemukan.'], 404);
        }

        // 🔒 Ubah belanja_gaji menjadi nullable
        $validator = Validator::make($request->all(), [
            'belanja_gaji' => 'nullable|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
            'blokir_gaji' => 'nullable|numeric|min:0',
            'blokir_barang' => 'nullable|numeric|min:0',
            'blokir_modal' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        // 🔥 LOGIKA KEAMANAN BACKEND: CEK SETJEN
        $satker = Satker::find($anggaran->satker_id);
        $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
        $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL') || ($satker->kode_satker === '692028');

        // Jika bukan Setjen, PAKSA nilai Gaji menjadi 0 secara mutlak!
        $belanjaGaji = $isSetjen ? ($request->belanja_gaji ?: 0) : 0;
        $blokirGaji = $isSetjen ? ($request->blokir_gaji ?: 0) : 0;

        $belanjaBarang = $request->belanja_barang ?: 0;
        $belanjaModal = $request->belanja_modal ?: 0;
        $blokirBarang = $request->blokir_barang ?: 0;
        $blokirModal = $request->blokir_modal ?: 0;

        // Validasi Ekstra: Blokir tidak boleh lebih besar dari Pagu per belanja
        if ($blokirGaji > $belanjaGaji || $blokirBarang > $belanjaBarang || $blokirModal > $belanjaModal) {
            return response()->json(['status' => 'error', 'message' => 'Pagu Blokir tidak boleh melebihi Pagu di masing-masing jenis belanja!'], 422);
        }

        $totalPagu = $belanjaGaji + $belanjaBarang + $belanjaModal;
        $paguBlokir = $blokirGaji + $blokirBarang + $blokirModal;
        $paguEfektif = $totalPagu - $paguBlokir;

        $anggaran->update([
            'belanja_gaji' => $belanjaGaji,
            'belanja_barang' => $belanjaBarang,
            'belanja_modal' => $belanjaModal,
            'blokir_gaji' => $blokirGaji,
            'blokir_barang' => $blokirBarang,
            'blokir_modal' => $blokirModal,
            'total_pagu' => $totalPagu,
            'pagu_blokir' => $paguBlokir,
            'pagu_efektif' => $paguEfektif,
        ]);

        ActivityLog::record(
            'UPDATE',
            'MASTER ANGGARAN',
            "Mengubah detail Pagu DIPA Tahun {$anggaran->tahun} milik Satker {$satker->nama_satker}. (Total Pagu Baru: Rp " . number_format($totalPagu, 0, ',', '.') . ")"
        );

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

        $tahun = $anggaran->tahun;
        $namaSatker = Satker::find($anggaran->satker_id)->nama_satker ?? 'Unknown Satker';
        $totalHapus = $anggaran->total_pagu;

        $anggaran->delete();

        ActivityLog::record(
            'DELETE',
            'MASTER ANGGARAN',
            "Menghapus seluruh data Pagu DIPA Tahun {$tahun} milik Satker {$namaSatker}. (Nominal yang dihapus: Rp " . number_format($totalHapus, 0, ',', '.') . ")"
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Data Pagu Anggaran berhasil dihapus.'
        ]);
    }
}
