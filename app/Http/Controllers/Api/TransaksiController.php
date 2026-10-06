<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RencanaPenarikan;
use App\Models\Realisasi;
use App\Models\Satker;
use App\Models\ActivityLog;
use App\Models\User;
use App\Notifications\TransaksiNotification;
use App\Traits\CheckCutOffTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Auth;

class TransaksiController extends Controller
{
    use CheckCutOffTrait;

    // =====================================================================
    // 🛡️ HELPER: AMBIL ID SATKER MILIK USER LOGIN & VALIDASI SETJEN
    // =====================================================================
    private function getMySatkerId(User $user)
    {
        if ($user->isSatker()) {
            return Satker::where('kode_satker', $user->kode_satker)->value('id');
        }
        return null;
    }

    /**
     * Memeriksa apakah Satker yang dipilih adalah DIPA Sekretariat Jenderal
     * yang memiliki kewenangan mengelola Belanja Pegawai (51).
     */
    private function isSetjen(int|string $satkerId): bool
    {
        $satker = Satker::find($satkerId);
        if (!$satker) return false;

        $namaSatkerUpper = strtoupper($satker->nama_satker);
        return str_contains($namaSatkerUpper, 'SETJEN') || str_contains($namaSatkerUpper, 'SEKRETARIAT JENDERAL');
    }

    // =====================================================================
    // 📂 BAGIAN RENCANA PENARIKAN DANA (RPD)
    // =====================================================================

    public function getRpd(Request $request)
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $tahun = $request->query('tahun', date('Y'));
            $search = $request->query('search');
            $satkerId = $request->query('satker_id');
            $status = $request->query('status');
            $tw = $request->query('tw');

            $query = RencanaPenarikan::with('satker')
                ->where('tahun', $tahun)
                ->orderBy('bulan', 'asc');

            if ($user->isSatker()) {
                $query->where('satker_id', $this->getMySatkerId($user));
            } else {
                if ($satkerId) {
                    $query->where('satker_id', $satkerId);
                }
            }

            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            }

            if ($status) $query->where('status', $status);

            if ($tw === 'I') $query->whereBetween('bulan', [1, 3]);
            elseif ($tw === 'II') $query->whereBetween('bulan', [4, 6]);
            elseif ($tw === 'III') $query->whereBetween('bulan', [7, 9]);
            elseif ($tw === 'IV') $query->whereBetween('bulan', [10, 12]);

            $rpds = $query->paginate(10);
            return response()->json($rpds);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Gagal mengambil data RPD: ' . $e->getMessage()], 500);
        }
    }

    public function storeRpd(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->isSatker()) {
            $request->merge(['satker_id' => $this->getMySatkerId($user)]);
        }

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

        $tanggalTransaksi = sprintf('%04d-%02d-01', $request->tahun, $request->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        $isSetjen = $this->isSetjen($request->satker_id);
        $belanjaGaji = (float) $request->belanja_gaji;

        if (!$isSetjen && $belanjaGaji > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak! Satuan Kerja selain Setjen tidak berhak menginput Belanja Pegawai (51).'
            ], 422);
        }

        $existingRpd = RencanaPenarikan::where('satker_id', $request->satker_id)
            ->where('tahun', $request->tahun)
            ->where('bulan', $request->bulan)
            ->exists();

        if ($existingRpd) {
            return response()->json(['status' => 'error', 'message' => 'Data RPD untuk periode tersebut sudah ada! Silakan gunakan fitur Edit.'], 409);
        }

        DB::beginTransaction();
        try {
            $rpd = RencanaPenarikan::create([
                'satker_id' => $request->satker_id,
                'tahun' => $request->tahun,
                'bulan' => $request->bulan,
                'belanja_gaji' => $isSetjen ? $belanjaGaji : 0,
                'belanja_barang' => (float) $request->belanja_barang,
                'belanja_modal' => (float) $request->belanja_modal,
                'status' => 'draft',
                'catatan_revisi' => null
            ]);

            $namaSatker = Satker::find($request->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalInput = ($isSetjen ? $belanjaGaji : 0) + $request->belanja_barang + $request->belanja_modal;

            ActivityLog::record('CREATE', 'TRANSAKSI RPD', "Mengajukan draf RPD Bulan {$request->bulan} Tahun {$request->tahun} untuk {$namaSatker}. (Total: Rp " . number_format($totalInput, 0, ',', '.') . ")");

            $admins = User::where('role', 'admin')->get();
            Notification::send($admins, new TransaksiNotification('Draft RPD Baru', "{$namaSatker} mengajukan draf RPD Bulan {$request->bulan}. Mohon segera ditinjau.", 'info'));

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil diajukan dan masuk ke antrean verifikasi.', 'data' => $rpd], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Sistem gagal menyimpan draf RPD: ' . $e->getMessage()], 500);
        }
    }

    public function updateRpd(Request $request, string $id)
    {
        /** @var User $user */
        $user = Auth::user();

        $rpd = RencanaPenarikan::find($id);
        if (!$rpd) return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);

        if ($user->isSatker() && $rpd->satker_id !== $this->getMySatkerId($user)) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak! Anda tidak memiliki otoritas atas data ini.'], 403);
        }

        $tanggalTransaksi = sprintf('%04d-%02d-01', $rpd->tahun, $rpd->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        $validator = Validator::make($request->all(), [
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);

        $isSetjen = $this->isSetjen($rpd->satker_id);
        $belanjaGaji = (float) $request->belanja_gaji;

        if (!$isSetjen && $belanjaGaji > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak! Satuan Kerja selain Setjen tidak berhak menginput Belanja Pegawai (51).'
            ], 422);
        }

        DB::beginTransaction();
        try {
            $rpd->update([
                'belanja_gaji' => $isSetjen ? $belanjaGaji : 0,
                'belanja_barang' => (float) $request->belanja_barang,
                'belanja_modal' => (float) $request->belanja_modal,
                'status' => 'draft',
                'catatan_revisi' => null
            ]);

            $namaSatker = Satker::find($rpd->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalInput = ($isSetjen ? $belanjaGaji : 0) + $request->belanja_barang + $request->belanja_modal;

            ActivityLog::record('UPDATE', 'TRANSAKSI RPD', "Merevisi RPD Bulan {$rpd->bulan} Tahun {$rpd->tahun} milik {$namaSatker}. (Total Baru: Rp " . number_format($totalInput, 0, ',', '.') . ")");

            $admins = User::where('role', 'admin')->get();
            Notification::send($admins, new TransaksiNotification('Revisi RPD', "{$namaSatker} telah merevisi RPD Bulan {$rpd->bulan}. Silakan verifikasi ulang.", 'info'));

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'RPD berhasil diperbarui dan dikembalikan ke status Draft.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Sistem gagal memperbarui RPD: ' . $e->getMessage()], 500);
        }
    }

    public function destroyRpd(string $id)
    {
        /** @var User $user */
        $user = Auth::user();

        $rpd = RencanaPenarikan::find($id);
        if (!$rpd) return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);

        if ($user->isSatker() && $rpd->satker_id !== $this->getMySatkerId($user)) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak! Anda tidak memiliki otoritas atas data ini.'], 403);
        }

        $tanggalTransaksi = sprintf('%04d-%02d-01', $rpd->tahun, $rpd->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        DB::beginTransaction();
        try {
            $namaSatker = Satker::find($rpd->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalHapus = $rpd->belanja_gaji + $rpd->belanja_barang + $rpd->belanja_modal;

            $rpd->delete();

            ActivityLog::record('DELETE', 'TRANSAKSI RPD', "Menghapus draf RPD Bulan {$rpd->bulan} Tahun {$rpd->tahun} milik {$namaSatker}. (Terhapus: Rp " . number_format($totalHapus, 0, ',', '.') . ")");

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Data RPD berhasil dimusnahkan secara permanen.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal menghapus RPD: ' . $e->getMessage()], 500);
        }
    }

    public function approveRpd(Request $request, string $id)
    {
        /** @var User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'catatan_revisi' => 'required_if:status,rejected|nullable|string'
        ]);

        if ($validator->fails()) return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);

        $rpd = RencanaPenarikan::find($id);
        if (!$rpd) return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);

        $tanggalTransaksi = sprintf('%04d-%02d-01', $rpd->tahun, $rpd->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        DB::beginTransaction();
        try {
            $rpd->update([
                'status' => $request->status,
                'catatan_revisi' => $request->status === 'rejected' ? $request->catatan_revisi : null
            ]);

            $satker = Satker::find($rpd->satker_id);
            $namaSatker = $satker->nama_satker ?? 'Unknown Satker';
            $aksiLog = $request->status === 'approved' ? 'MENGESAHKAN' : 'MENOLAK';

            ActivityLog::record('UPDATE', 'VERIFIKASI RPD', "Otoritas Pusat {$aksiLog} data RPD Bulan {$rpd->bulan} Tahun {$rpd->tahun} milik {$namaSatker}.");

            if ($satker) {
                $userSatker = User::where('kode_satker', $satker->kode_satker)->get();
                $title = $request->status === 'approved' ? 'RPD Disetujui ✅' : 'RPD Ditolak ❌';
                $tipeNotif = $request->status === 'approved' ? 'success' : 'danger';
                $pesanBalasan = "Pengajuan RPD Bulan {$rpd->bulan} telah di-" . ($request->status === 'approved' ? "Setujui oleh Pusat." : "Tolak. Catatan: " . $request->catatan_revisi);
                Notification::send($userSatker, new TransaksiNotification($title, $pesanBalasan, $tipeNotif));
            }

            DB::commit();
            return response()->json(['status' => 'success', 'message' => "Proses Otorisasi RPD selesai ({$request->status})."]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Otorisasi gagal diproses: ' . $e->getMessage()], 500);
        }
    }

    // =====================================================================
    // 🧾 BAGIAN REALISASI PENGELUARAN
    // =====================================================================

    public function getRealisasi(Request $request)
    {
        try {
            /** @var User $user */
            $user = Auth::user();

            $tahun = $request->query('tahun', date('Y'));
            $search = $request->query('search');
            $satkerId = $request->query('satker_id');
            $status = $request->query('status');
            $tw = $request->query('tw');

            $query = Realisasi::with(['satker', 'details'])
                ->where('tahun', $tahun)
                ->orderBy('bulan', 'asc');

            if ($user->isSatker()) {
                $query->where('satker_id', $this->getMySatkerId($user));
            } else {
                if ($satkerId) $query->where('satker_id', $satkerId);
            }

            if ($search) {
                $query->whereHas('satker', function ($q) use ($search) {
                    $q->where('nama_satker', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            }

            if ($status) $query->where('status', $status);

            if ($tw === 'I') $query->whereBetween('bulan', [1, 3]);
            elseif ($tw === 'II') $query->whereBetween('bulan', [4, 6]);
            elseif ($tw === 'III') $query->whereBetween('bulan', [7, 9]);
            elseif ($tw === 'IV') $query->whereBetween('bulan', [10, 12]);

            $realisasis = $query->paginate(10);
            return response()->json($realisasis);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Gagal mengambil data Realisasi: ' . $e->getMessage()], 500);
        }
    }

    public function storeRealisasi(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->isSatker()) {
            $request->merge(['satker_id' => $this->getMySatkerId($user)]);
        }

        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            'rincian' => 'required|array|min:1',
            'rincian.*.jenis_belanja' => 'required|in:gaji,barang,modal',
            'rincian.*.uraian' => 'required|string|max:255',
            'rincian.*.nominal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);

        $tanggalTransaksi = sprintf('%04d-%02d-01', $request->tahun, $request->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        $exists = Realisasi::where('satker_id', $request->satker_id)
            ->where('tahun', $request->tahun)
            ->where('bulan', $request->bulan)
            ->exists();

        if ($exists) return response()->json(['status' => 'error', 'message' => 'Data Realisasi untuk bulan ini sudah ada! Gunakan fitur Edit.'], 409);

        $isSetjen = $this->isSetjen($request->satker_id);

        DB::beginTransaction();
        try {
            $belanjaGaji = 0;
            $belanjaBarang = 0;
            $belanjaModal = 0;

            foreach ($request->rincian as $item) {
                $nominal = (float) $item['nominal'];

                // 🔥 PROTEKSI CELAH KEAMANAN INPUT GAJI DI REALISASI
                if ($item['jenis_belanja'] == 'gaji') {
                    if (!$isSetjen && $nominal > 0) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Akses Ditolak! Satuan Kerja selain Setjen tidak berhak menginput realisasi Belanja Pegawai (51).'
                        ], 422);
                    }
                    $belanjaGaji += $nominal;
                }

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
                // Jangan simpan rincian gaji jika bukan setjen (untuk keamanan ganda)
                if ($item['jenis_belanja'] == 'gaji' && !$isSetjen) continue;

                $realisasi->details()->create([
                    'jenis_belanja' => $item['jenis_belanja'],
                    'uraian' => $item['uraian'],
                    'nominal' => (float) $item['nominal']
                ]);
            }

            $namaSatker = Satker::find($request->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalInput = $belanjaGaji + $belanjaBarang + $belanjaModal;

            ActivityLog::record('CREATE', 'TRANSAKSI REALISASI', "Mengajukan draf Realisasi Bulan {$request->bulan} Tahun {$request->tahun} untuk {$namaSatker}. (Total: Rp " . number_format($totalInput, 0, ',', '.') . ")");

            $admins = User::where('role', 'admin')->get();
            Notification::send($admins, new TransaksiNotification('Realisasi Baru', "{$namaSatker} mengajukan draf Realisasi Bulan {$request->bulan}. Silakan verifikasi.", 'warning'));

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Draf Realisasi berhasil dibuat dan dikirim ke pusat.'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Sistem gagal memproses data: ' . $e->getMessage()], 500);
        }
    }

    public function updateRealisasi(Request $request, string $id)
    {
        /** @var User $user */
        $user = Auth::user();

        $realisasi = Realisasi::find($id);
        if (!$realisasi) return response()->json(['status' => 'error', 'message' => 'Data Realisasi tidak ditemukan.'], 404);

        if ($user->isSatker() && $realisasi->satker_id !== $this->getMySatkerId($user)) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak! Anda tidak memiliki otoritas atas data ini.'], 403);
        }

        $tanggalTransaksi = sprintf('%04d-%02d-01', $realisasi->tahun, $realisasi->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        $validator = Validator::make($request->all(), [
            'rincian' => 'required|array|min:1',
            'rincian.*.jenis_belanja' => 'required|in:gaji,barang,modal',
            'rincian.*.uraian' => 'required|string|max:255',
            'rincian.*.nominal' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);

        $isSetjen = $this->isSetjen($realisasi->satker_id);

        DB::beginTransaction();
        try {
            $belanjaGaji = 0;
            $belanjaBarang = 0;
            $belanjaModal = 0;

            foreach ($request->rincian as $item) {
                $nominal = (float) $item['nominal'];

                // 🔥 PROTEKSI CELAH KEAMANAN INPUT GAJI DI REALISASI
                if ($item['jenis_belanja'] == 'gaji') {
                    if (!$isSetjen && $nominal > 0) {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'Akses Ditolak! Satuan Kerja selain Setjen tidak berhak merevisi realisasi Belanja Pegawai (51).'
                        ], 422);
                    }
                    $belanjaGaji += $nominal;
                }

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
                if ($item['jenis_belanja'] == 'gaji' && !$isSetjen) continue;

                $realisasi->details()->create([
                    'jenis_belanja' => $item['jenis_belanja'],
                    'uraian' => $item['uraian'],
                    'nominal' => (float) $item['nominal']
                ]);
            }

            $namaSatker = Satker::find($realisasi->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalInput = $belanjaGaji + $belanjaBarang + $belanjaModal;

            ActivityLog::record('UPDATE', 'TRANSAKSI REALISASI', "Merevisi rincian Realisasi Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} milik {$namaSatker}. (Total Baru: Rp " . number_format($totalInput, 0, ',', '.') . ")");

            $admins = User::where('role', 'admin')->get();
            Notification::send($admins, new TransaksiNotification('Revisi Realisasi', "{$namaSatker} memperbarui laporan Realisasi Bulan {$realisasi->bulan}. Silakan verifikasi ulang.", 'warning'));

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Realisasi berhasil diperbarui dan status kembali menjadi Draft.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal memperbarui data: ' . $e->getMessage()], 500);
        }
    }

    public function destroyRealisasi(string $id)
    {
        /** @var User $user */
        $user = Auth::user();

        $realisasi = Realisasi::find($id);
        if (!$realisasi) return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);

        if ($user->isSatker() && $realisasi->satker_id !== $this->getMySatkerId($user)) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak! Anda tidak memiliki otoritas atas data ini.'], 403);
        }

        $tanggalTransaksi = sprintf('%04d-%02d-01', $realisasi->tahun, $realisasi->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        DB::beginTransaction();
        try {
            $namaSatker = Satker::find($realisasi->satker_id)->nama_satker ?? 'Unknown Satker';
            $totalHapus = $realisasi->belanja_gaji + $realisasi->belanja_barang + $realisasi->belanja_modal;

            $realisasi->delete();

            ActivityLog::record('DELETE', 'TRANSAKSI REALISASI', "Memusnahkan seluruh rincian Realisasi Anggaran Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} milik {$namaSatker}. (Terhapus: Rp " . number_format($totalHapus, 0, ',', '.') . ")");

            DB::commit();
            return response()->json(['status' => 'success', 'message' => 'Data Realisasi beserta rinciannya berhasil dimusnahkan.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Gagal menghapus Realisasi: ' . $e->getMessage()], 500);
        }
    }

    public function approveRealisasi(Request $request, string $id)
    {
        /** @var User $user */
        $user = Auth::user();

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'catatan_revisi' => 'required_if:status,rejected|nullable|string'
        ]);

        if ($validator->fails()) return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);

        $realisasi = Realisasi::find($id);
        if (!$realisasi) return response()->json(['status' => 'error', 'message' => 'Data tidak ditemukan.'], 404);

        $tanggalTransaksi = sprintf('%04d-%02d-01', $realisasi->tahun, $realisasi->bulan);
        $this->validateCutOff($tanggalTransaksi, $user->isAdmin());

        DB::beginTransaction();
        try {
            $realisasi->update([
                'status' => $request->status,
                'catatan_revisi' => $request->status === 'rejected' ? $request->catatan_revisi : null
            ]);

            $satker = Satker::find($realisasi->satker_id);
            $namaSatker = $satker->nama_satker ?? 'Unknown Satker';
            $aksiLog = $request->status === 'approved' ? 'MENGESAHKAN' : 'MENOLAK';

            ActivityLog::record('UPDATE', 'VERIFIKASI REALISASI', "Otoritas Pusat {$aksiLog} data Realisasi Bulan {$realisasi->bulan} Tahun {$realisasi->tahun} milik {$namaSatker}.");

            if ($satker) {
                $userSatker = User::where('kode_satker', $satker->kode_satker)->get();
                $title = $request->status === 'approved' ? 'Realisasi Disetujui ✅' : 'Realisasi Ditolak ❌';
                $tipeNotif = $request->status === 'approved' ? 'success' : 'danger';
                $pesanBalasan = "Pengajuan Realisasi Bulan {$realisasi->bulan} telah di-" . ($request->status === 'approved' ? "Setujui oleh Pusat." : "Tolak. Catatan: " . $request->catatan_revisi);
                Notification::send($userSatker, new TransaksiNotification($title, $pesanBalasan, $tipeNotif));
            }

            DB::commit();
            return response()->json(['status' => 'success', 'message' => "Proses Otorisasi Realisasi selesai ({$request->status})."]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => 'Otorisasi gagal diproses: ' . $e->getMessage()], 500);
        }
    }
}
