<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\Satker;
use App\Models\CutOff;
use App\Models\ActivityLog;
use App\Models\User;
use App\Notifications\TransaksiNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class TransaksiController extends Controller
{
    // =====================================================================
    // 🛡️ HELPER: CEK STATUS TUTUP BUKU (CUT-OFF)
    // =====================================================================
    private function checkCutOff($tahun, $bulan)
    {
        $cutOff = CutOff::where('tahun', $tahun)->where('bulan', $bulan)->first();
        if ($cutOff && $cutOff->is_closed) {
            return true;
        }
        return false;
    }

    // =====================================================================
    // BAGIAN RENCANA PENARIKAN DANA (RPD)
    // =====================================================================

    public function getRpd(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $search = $request->query('search');
            $satkerId = $request->query('satker_id');
            $status = $request->query('status');
            $tw = $request->query('tw');

            $query = RencanaPenarikan::with('satker')
                ->where('tahun', $tahun)
                ->orderBy('bulan', 'asc');

            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            }

            if ($satkerId) {
                $query->where('satker_id', $satkerId);
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($tw === 'I') {
                $query->whereBetween('bulan', [1, 3]);
            } elseif ($tw === 'II') {
                $query->whereBetween('bulan', [4, 6]);
            } elseif ($tw === 'III') {
                $query->whereBetween('bulan', [7, 9]);
            } elseif ($tw === 'IV') {
                $query->whereBetween('bulan', [10, 12]);
            }

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

        // 🔥 CEK VALIDASI SATKER SETJEN UNTUK BELANJA GAJI (51)
        $satker = Satker::find($request->satker_id);
        $namaSatkerUpper = strtoupper($satker->nama_satker ?? '');
        $kodeSatker = $satker->kode_satker ?? '';

        // Asumsi: Satker Setjen adalah yang memiliki kata 'SEKRETARIAT JENDERAL' atau 'SETJEN' atau kode khusus
        $isSetjen = str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');

        $belanjaGaji = (float) $request->belanja_gaji;
        if (!$isSetjen && $belanjaGaji > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal! Satuan Kerja selain DIPA Setjen tidak diperkenankan mengalokasikan Belanja Gaji (51).'
            ], 422);
        }

        if ($this->checkCutOff($request->tahun, $request->bulan)) {
            return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$request->bulan} Tahun {$request->tahun} sudah ditutup (Cut-Off)."], 403);
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
            'belanja_gaji' => $isSetjen ? $belanjaGaji : 0, // Paksa 0 jika bukan Setjen
            'belanja_barang' => (float) $request->belanja_barang,
            'belanja_modal' => (float) $request->belanja_modal,
            'status' => 'draft',
            'catatan_revisi' => null
        ]);

        $namaSatker = $satker->nama_satker ?? 'Unknown Satker';
        $totalInput = ($isSetjen ? $belanjaGaji : 0) + $request->belanja_barang + $request->belanja_modal;

        ActivityLog::record('CREATE', 'TRANSAKSI RPD', "Mengajukan draft RPD Bulan {$request->bulan} Tahun {$request->tahun} untuk Satker {$namaSatker}. (Total: Rp " . number_format($totalInput, 0, ',', '.') . ")");

        $admins = User::where('role', 'admin')->get();
        $pesanNotif = "{$namaSatker} baru saja mengajukan RPD Bulan {$request->bulan}. Silakan verifikasi.";
        Notification::send($admins, new TransaksiNotification('Draft RPD Baru', $pesanNotif, 'info'));

        return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil diajukan dan menunggu verifikasi Admin.', 'data' => $rpd], 201);
    }

    public function updateRpd(Request $request, $id)
    {
        $rpd = RencanaPenarikan::find($id);
        if (!$rpd) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        if ($this->checkCutOff($rpd->tahun, $rpd->bulan)) {
            return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$rpd->bulan} Tahun {$rpd->tahun} sudah ditutup (Cut-Off)."], 403);
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
            'belanja_gaji' => (float) $request->belanja_gaji,
            'belanja_barang' => (float) $request->belanja_barang,
            'belanja_modal' => (float) $request->belanja_modal,
            'status' => 'draft',
            'catatan_revisi' => null
        ]);

        $namaSatker = Satker::find($rpd->satker_id)->nama_satker ?? 'Unknown Satker';
        $totalInput = $request->belanja_gaji + $request->belanja_barang + $request->belanja_modal;

        ActivityLog::record('UPDATE', 'TRANSAKSI RPD', "Memperbarui draft RPD Bulan {$rpd->bulan} Tahun {$rpd->tahun} milik Satker {$namaSatker}. (Total Baru: Rp " . number_format($totalInput, 0, ',', '.') . ")");

        $admins = User::where('role', 'admin')->get();
        $pesanNotif = "{$namaSatker} telah merevisi RPD Bulan {$rpd->bulan}. Silakan verifikasi ulang.";
        Notification::send($admins, new TransaksiNotification('Revisi RPD', $pesanNotif, 'info'));

        return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil diperbarui dan status kembali menjadi Draft.']);
    }

    public function destroyRpd($id)
    {
        $rpd = RencanaPenarikan::find($id);
        if ($rpd) {
            if ($this->checkCutOff($rpd->tahun, $rpd->bulan)) {
                return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$rpd->bulan} Tahun {$rpd->tahun} sudah ditutup (Cut-Off)."], 403);
            }

            $namaSatker = Satker::find($rpd->satker_id)->nama_satker ?? 'Unknown Satker';
            $bulan = $rpd->bulan;
            $tahun = $rpd->tahun;
            $totalHapus = $rpd->belanja_gaji + $rpd->belanja_barang + $rpd->belanja_modal;

            $rpd->delete();

            ActivityLog::record('DELETE', 'TRANSAKSI RPD', "Menghapus data RPD Bulan {$bulan} Tahun {$tahun} milik Satker {$namaSatker}. (Total Terhapus: Rp " . number_format($totalHapus, 0, ',', '.') . ")");

            return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil dihapus.']);
        }
        return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
    }

    public function approveRpd(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'catatan_revisi' => 'required_if:status,rejected|nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $rpd = RencanaPenarikan::find($id);
        if (!$rpd) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        if ($this->checkCutOff($rpd->tahun, $rpd->bulan)) {
            return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$rpd->bulan} Tahun {$rpd->tahun} sudah ditutup (Cut-Off)."], 403);
        }

        $rpd->update([
            'status' => $request->status,
            'catatan_revisi' => $request->status === 'rejected' ? $request->catatan_revisi : null
        ]);

        $satker = Satker::find($rpd->satker_id);
        $namaSatker = $satker->nama_satker ?? 'Unknown Satker';
        $aksiLog = $request->status === 'approved' ? 'MENYETUJUI' : 'MENOLAK';

        ActivityLog::record('UPDATE', 'VERIFIKASI RPD', "Admin {$aksiLog} data RPD Bulan {$rpd->bulan} Tahun {$rpd->tahun} milik Satker {$namaSatker}.");

        if ($satker) {
            $userSatker = User::where('kode_satker', $satker->kode_satker)->get();
            $title = $request->status === 'approved' ? 'RPD Disetujui ✅' : 'RPD Ditolak ❌';
            $tipeNotif = $request->status === 'approved' ? 'success' : 'danger';
            $pesanBalasan = "Pengajuan RPD Bulan {$rpd->bulan} telah di-" . ($request->status === 'approved' ? "Setujui." : "Tolak. Catatan: " . $request->catatan_revisi);

            Notification::send($userSatker, new TransaksiNotification($title, $pesanBalasan, $tipeNotif));
        }

        return response()->json(['status' => 'success', 'message' => "Data RPD berhasil di-{$request->status}."]);
    }

    // =====================================================================
    // BAGIAN REALISASI 
    // =====================================================================

    public function getRealisasi(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $search = $request->query('search');
            $satkerId = $request->query('satker_id');
            $status = $request->query('status');
            $tw = $request->query('tw');

            $query = Realisasi::with(['satker', 'details'])
                ->where('tahun', $tahun)
                ->orderBy('bulan', 'asc');

            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            }

            if ($satkerId) {
                $query->where('satker_id', $satkerId);
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($tw === 'I') {
                $query->whereBetween('bulan', [1, 3]);
            } elseif ($tw === 'II') {
                $query->whereBetween('bulan', [4, 6]);
            } elseif ($tw === 'III') {
                $query->whereBetween('bulan', [7, 9]);
            } elseif ($tw === 'IV') {
                $query->whereBetween('bulan', [10, 12]);
            }

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
            'rincian' => 'required|array|min:1',
            'rincian.*.jenis_belanja' => 'required|in:gaji,barang,modal',
            'rincian.*.uraian' => 'required|string|max:255',
            'rincian.*.nominal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        if ($this->checkCutOff($request->tahun, $request->bulan)) {
            return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$request->bulan} Tahun {$request->tahun} sudah ditutup (Cut-Off)."], 403);
        }

        $exists = Realisasi::where('satker_id', $request->satker_id)
            ->where('tahun', $request->tahun)
            ->where('bulan', $request->bulan)
            ->exists();

        if ($exists) {
            return response()->json(['status' => 'error', 'message' => 'Data Realisasi untuk bulan ini sudah ada! Gunakan fitur Edit.'], 409);
        }

        DB::beginTransaction();
        try {
            $belanjaGaji = 0;
            $belanjaBarang = 0;
            $belanjaModal = 0;

            foreach ($request->rincian as $item) {
                $nominal = (float) $item['nominal'];
                if ($item['jenis_belanja'] == 'gaji') $belanjaGaji += $nominal;
                if ($item['jenis_belanja'] == 'barang') $belanjaBarang += $nominal;
                if ($item['jenis_belanja'] == 'modal') $belanjaModal += $nominal;
            }

            $realisasi = Realisasi::create([
                'satker_id' => $request->satker_id,
                'tahun' => $request->tahun,
                'bulan' => $request->bulan,
                'belanja_gaji' => $belanjaGaji,
                'belanja_barang' => $belanjaBarang,
                'belanja_modal' => $belanjaModal,
                'status' => 'draft',
                'catatan_revisi' => null
            ]);

            foreach ($request->rincian as $item) {
                $realisasi->details()->create([
                    'jenis_belanja' => $item['jenis_belanja'],
                    'uraian' => $item['uraian'],
                    'nominal' => (float) $item['nominal']
                ]);
            }

            DB::commit();

            $namaSatker = Satker::find($request->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalInput = $belanjaGaji + $belanjaBarang + $belanjaModal;

            ActivityLog::record('CREATE', 'TRANSAKSI REALISASI', "Mengajukan draft Realisasi Bulan {$request->bulan} Tahun {$request->tahun} untuk Satker {$namaSatker}. (Total: Rp " . number_format($totalInput, 0, ',', '.') . ")");

            $admins = User::where('role', 'admin')->get();
            $pesanNotif = "{$namaSatker} mengajukan draf Realisasi Bulan {$request->bulan}. Silakan verifikasi.";
            Notification::send($admins, new TransaksiNotification('Realisasi Baru', $pesanNotif, 'warning'));

            return response()->json(['status' => 'success', 'message' => 'Data Realisasi berhasil diajukan dan menunggu verifikasi Admin.'], 201);
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

        if ($this->checkCutOff($realisasi->tahun, $realisasi->bulan)) {
            return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} sudah ditutup (Cut-Off)."], 403);
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
                $nominal = (float) $item['nominal'];
                if ($item['jenis_belanja'] == 'gaji') $belanjaGaji += $nominal;
                if ($item['jenis_belanja'] == 'barang') $belanjaBarang += $nominal;
                if ($item['jenis_belanja'] == 'modal') $belanjaModal += $nominal;
            }

            $realisasi->update([
                'belanja_gaji' => $belanjaGaji,
                'belanja_barang' => $belanjaBarang,
                'belanja_modal' => $belanjaModal,
                'status' => 'draft',
                'catatan_revisi' => null
            ]);

            $realisasi->details()->delete();
            foreach ($request->rincian as $item) {
                $realisasi->details()->create([
                    'jenis_belanja' => $item['jenis_belanja'],
                    'uraian' => $item['uraian'],
                    'nominal' => (float) $item['nominal']
                ]);
            }

            DB::commit();

            $namaSatker = Satker::find($realisasi->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalInput = $belanjaGaji + $belanjaBarang + $belanjaModal;

            ActivityLog::record('UPDATE', 'TRANSAKSI REALISASI', "Memperbarui draft Realisasi Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} milik Satker {$namaSatker}. (Total Baru: Rp " . number_format($totalInput, 0, ',', '.') . ")");

            $admins = User::where('role', 'admin')->get();
            $pesanNotif = "{$namaSatker} merevisi laporan Realisasi Bulan {$realisasi->bulan}. Silakan verifikasi ulang.";
            Notification::send($admins, new TransaksiNotification('Revisi Realisasi', $pesanNotif, 'warning'));

            return response()->json(['status' => 'success', 'message' => 'Data Realisasi berhasil diperbarui dan status kembali menjadi Draft.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal update data: ' . $e->getMessage()], 500);
        }
    }

    public function destroyRealisasi($id)
    {
        $realisasi = Realisasi::find($id);
        if ($realisasi) {
            if ($this->checkCutOff($realisasi->tahun, $realisasi->bulan)) {
                return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} sudah ditutup (Cut-Off)."], 403);
            }

            $namaSatker = Satker::find($realisasi->satker_id)->nama_satker ?? 'Unknown Satker';
            $bulan = $realisasi->bulan;
            $tahun = $realisasi->tahun;
            $totalHapus = $realisasi->belanja_gaji + $realisasi->belanja_barang + $realisasi->belanja_modal;

            $realisasi->delete();

            ActivityLog::record('DELETE', 'TRANSAKSI REALISASI', "Menghapus seluruh rincian Realisasi Anggaran Bulan {$bulan} Tahun {$tahun} milik Satker {$namaSatker}. (Total Terhapus: Rp " . number_format($totalHapus, 0, ',', '.') . ")");

            return response()->json(['status' => 'success', 'message' => 'Data Realisasi dan rinciannya berhasil dihapus.']);
        }
        return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
    }

    public function approveRealisasi(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'catatan_revisi' => 'required_if:status,rejected|nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $realisasi = Realisasi::find($id);
        if (!$realisasi) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);
        }

        if ($this->checkCutOff($realisasi->tahun, $realisasi->bulan)) {
            return response()->json(['status' => 'error', 'message' => "Gagal! Transaksi Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} sudah ditutup (Cut-Off)."], 403);
        }

        $realisasi->update([
            'status' => $request->status,
            'catatan_revisi' => $request->status === 'rejected' ? $request->catatan_revisi : null
        ]);

        $satker = Satker::find($realisasi->satker_id);
        $namaSatker = $satker->nama_satker ?? 'Unknown Satker';
        $aksiLog = $request->status === 'approved' ? 'MENYETUJUI' : 'MENOLAK';

        ActivityLog::record('UPDATE', 'VERIFIKASI REALISASI', "Admin {$aksiLog} data Realisasi Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} milik Satker {$namaSatker}.");

        if ($satker) {
            $userSatker = User::where('kode_satker', $satker->kode_satker)->get();
            $title = $request->status === 'approved' ? 'Realisasi Disetujui ✅' : 'Realisasi Ditolak ❌';
            $tipeNotif = $request->status === 'approved' ? 'success' : 'danger';
            $pesanBalasan = "Pengajuan Realisasi Bulan {$realisasi->bulan} telah di-" . ($request->status === 'approved' ? "Setujui." : "Tolak. Catatan: " . $request->catatan_revisi);

            Notification::send($userSatker, new TransaksiNotification($title, $pesanBalasan, $tipeNotif));
        }

        return response()->json(['status' => 'success', 'message' => "Data Realisasi berhasil di-{$request->status}."]);
    }
}
