<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggaran;
use App\Models\RevisiDipa;
use App\Models\ActivityLog;
use App\Models\Satker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AnggaranController extends Controller
{
    // 1. Mengambil daftar Pagu Anggaran (Dengan Paginasi, Search & Ringkasan Revisi DIPA)
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            $query = Anggaran::with([
                'satker',
                'revisiDipas' => function ($q) {
                    $q->orderBy('tanggal_revisi', 'desc')->orderBy('id', 'desc');
                }
            ])
                ->withCount([
                    'revisiDipas',
                    'revisiDipas as revisi_pagu_tetap_count' => function ($q) {
                        $q->where('jenis_revisi', 'pagu_tetap');
                    }
                ])
                ->orderBy('created_at', 'desc');

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

        $satker = Satker::find($request->satker_id);
        $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
        $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL') || ($satker->kode_satker === '692028');

        $belanjaGaji = $isSetjen ? ($request->belanja_gaji ?: 0) : 0;
        $blokirGaji = $isSetjen ? ($request->blokir_gaji ?: 0) : 0;

        $belanjaBarang = $request->belanja_barang ?: 0;
        $belanjaModal = $request->belanja_modal ?: 0;
        $blokirBarang = $request->blokir_barang ?: 0;
        $blokirModal = $request->blokir_modal ?: 0;

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

    // 3. Mengupdate Pagu Anggaran (Opsional: Otomatis Catat Revisi DIPA)
    public function update(Request $request, $id)
    {
        $anggaran = Anggaran::find($id);
        if (!$anggaran) {
            return response()->json(['status' => 'error', 'message' => 'Data Anggaran tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'belanja_gaji' => 'nullable|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
            'blokir_gaji' => 'nullable|numeric|min:0',
            'blokir_barang' => 'nullable|numeric|min:0',
            'blokir_modal' => 'nullable|numeric|min:0',
            'catat_revisi' => 'nullable|boolean',
            'triwulan_revisi' => 'nullable|in:I,II,III,IV',
            'tanggal_revisi' => 'nullable|date',
            'nomor_revisi' => 'nullable|string|max:100',
            'jenis_revisi' => 'nullable|in:pagu_tetap,pagu_berubah',
            'keterangan_revisi' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $satker = Satker::find($anggaran->satker_id);
        $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
        $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL') || ($satker->kode_satker === '692028');

        $belanjaGaji = $isSetjen ? ($request->belanja_gaji ?: 0) : 0;
        $blokirGaji = $isSetjen ? ($request->blokir_gaji ?: 0) : 0;

        $belanjaBarang = $request->belanja_barang ?: 0;
        $belanjaModal = $request->belanja_modal ?: 0;
        $blokirBarang = $request->blokir_barang ?: 0;
        $blokirModal = $request->blokir_modal ?: 0;

        if ($blokirGaji > $belanjaGaji || $blokirBarang > $belanjaBarang || $blokirModal > $belanjaModal) {
            return response()->json(['status' => 'error', 'message' => 'Pagu Blokir tidak boleh melebihi Pagu di masing-masing jenis belanja!'], 422);
        }

        $paguSebelum = (int) $anggaran->total_pagu;
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

        // Jika Admin mencentang pencatatan Revisi DIPA saat edit pagu
        if ($request->boolean('catat_revisi')) {
            $tgl = $request->tanggal_revisi ?: date('Y-m-d');
            $bulanRevisi = (int) date('n', strtotime($tgl));
            $autoTw = $bulanRevisi <= 3 ? 'I' : ($bulanRevisi <= 6 ? 'II' : ($bulanRevisi <= 9 ? 'III' : 'IV'));
            $twFinal = $request->triwulan_revisi ?: $autoTw;
            $jenisFinal = $request->jenis_revisi ?: ($paguSebelum == $totalPagu ? 'pagu_tetap' : 'pagu_berubah');

            RevisiDipa::create([
                'anggaran_id' => $anggaran->id,
                'satker_id' => $anggaran->satker_id,
                'tahun' => $anggaran->tahun,
                'triwulan' => $twFinal,
                'tanggal_revisi' => $tgl,
                'nomor_revisi' => $request->nomor_revisi,
                'jenis_revisi' => $jenisFinal,
                'pagu_sebelum' => $paguSebelum,
                'pagu_sesudah' => $totalPagu,
                'keterangan' => $request->keterangan_revisi ?: 'Perubahan Pagu DIPA melalui Master Anggaran',
                'created_by' => Auth::id(),
            ]);
        }

        ActivityLog::record(
            'UPDATE',
            'MASTER ANGGARAN',
            "Mengubah detail Pagu DIPA Tahun {$anggaran->tahun} milik Satker {$satker->nama_satker}. (Total Pagu Baru: Rp " . number_format($totalPagu, 0, ',', '.') . ")"
        );

        return response()->json([
            'status' => 'success',
            'message' => $request->boolean('catat_revisi')
                ? 'Pagu Anggaran diperbarui dan riwayat Revisi DIPA berhasil dicatat.'
                : 'Pagu Anggaran berhasil diperbarui.',
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

    // =====================================================================
    // 📑 MODUL RIWAYAT REVISI DIPA (INDIKATOR IKPA 10%)
    // =====================================================================

    public function getRevisi($id)
    {
        $anggaran = Anggaran::with('satker')->find($id);
        if (!$anggaran) {
            return response()->json(['status' => 'error', 'message' => 'Data Anggaran tidak ditemukan.'], 404);
        }

        $revisis = RevisiDipa::with(['creator' => fn($q) => $q->select('id', 'name')])
            ->where('anggaran_id', $anggaran->id)
            ->orderBy('tanggal_revisi', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'anggaran' => $anggaran,
            'data' => $revisis
        ]);
    }

    public function storeRevisi(Request $request, $id)
    {
        $anggaran = Anggaran::with('satker')->find($id);
        if (!$anggaran) {
            return response()->json(['status' => 'error', 'message' => 'Data Anggaran tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'triwulan' => 'required|in:I,II,III,IV',
            'tanggal_revisi' => 'required|date',
            'nomor_revisi' => 'nullable|string|max:100',
            'jenis_revisi' => 'required|in:pagu_tetap,pagu_berubah',
            'keterangan' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $revisi = RevisiDipa::create([
            'anggaran_id' => $anggaran->id,
            'satker_id' => $anggaran->satker_id,
            'tahun' => $anggaran->tahun,
            'triwulan' => $request->triwulan,
            'tanggal_revisi' => $request->tanggal_revisi,
            'nomor_revisi' => $request->nomor_revisi,
            'jenis_revisi' => $request->jenis_revisi,
            'pagu_sebelum' => $anggaran->total_pagu,
            'pagu_sesudah' => $anggaran->total_pagu,
            'keterangan' => $request->keterangan,
            'created_by' => Auth::id(),
        ]);

        $jenisLabel = $request->jenis_revisi === 'pagu_tetap' ? 'Pagu Tetap (IKPA)' : 'Pagu Berubah (Dikecualikan)';
        ActivityLog::record(
            'CREATE',
            'REVISI DIPA',
            "Mencatat Revisi DIPA TW {$request->triwulan} ({$jenisLabel}) Tahun {$anggaran->tahun} untuk {$anggaran->satker->nama_satker}."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Riwayat Revisi DIPA berhasil dicatat.',
            'data' => $revisi
        ], 201);
    }

    public function destroyRevisi($revisiId)
    {
        $revisi = RevisiDipa::with('satker')->find($revisiId);
        if (!$revisi) {
            return response()->json(['status' => 'error', 'message' => 'Riwayat Revisi DIPA tidak ditemukan.'], 404);
        }

        $infoSatker = $revisi->satker->nama_satker ?? 'Satker';
        $tw = $revisi->triwulan;
        $tahun = $revisi->tahun;

        $revisi->delete();

        ActivityLog::record(
            'DELETE',
            'REVISI DIPA',
            "Menghapus catatan Revisi DIPA TW {$tw} Tahun {$tahun} milik {$infoSatker}."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Catatan Revisi DIPA berhasil dihapus.'
        ]);
    }
}
