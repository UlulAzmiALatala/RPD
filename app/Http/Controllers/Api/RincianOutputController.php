<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RincianOutput;
use App\Models\RealisasiOutput;
use App\Models\Satker;
use Illuminate\Support\Facades\Validator;

class RincianOutputController extends Controller
{
    // =====================================================================
    // 📊 AMBIL DATA DAFTAR RO DAN PROGRESS CAPAIANNYA
    // =====================================================================
    public function index(Request $request)
    {
        try {
            $tahun = $request->query('tahun', date('Y'));
            $user = $request->user();

            // Tentukan Satker ID (Jika Admin bisa pilih, jika user pakai miliknya sendiri)
            $satkerId = $request->query('satker_id');
            if ($user->role !== 'admin') {
                $satker = Satker::where('kode_satker', $user->kode_satker)->first();
                if (!$satker) return response()->json(['status' => 'error', 'message' => 'Satker tidak ditemukan.'], 404);
                $satkerId = $satker->id;
            } else if (!$satkerId) {
                return response()->json(['status' => 'error', 'message' => 'Pilih satker terlebih dahulu.'], 400);
            }

            // Ambil semua target RO berserta laporan realisasinya
            $dataRO = RincianOutput::with('realisasiOutputs')
                ->where('satker_id', $satkerId)
                ->where('tahun', $tahun)
                ->get();

            $hasil = $dataRO->map(function ($ro) {
                // Hitung kumulatif
                $totalVolume = $ro->realisasiOutputs->sum('realisasi_volume');
                $totalAnggaran = $ro->realisasiOutputs->sum('realisasi_anggaran');

                // Hitung Persentase
                $persenVolume = $ro->target_volume > 0 ? ($totalVolume / $ro->target_volume) * 100 : 0;
                $persenAnggaran = $ro->pagu_anggaran > 0 ? ($totalAnggaran / $ro->pagu_anggaran) * 100 : 0;

                // Status Kinerja sederhana
                $status = 'Wajar';
                if ($persenVolume >= 100) $status = 'Selesai 100%';
                elseif ($persenVolume < ($persenAnggaran - 10)) $status = 'Anomali'; // Uang habis banyak, barang dikit

                return [
                    'id' => $ro->id,
                    'kode_ro' => $ro->kode_ro,
                    'nama_ro' => $ro->nama_ro,
                    'satuan' => $ro->satuan,
                    'target_volume' => $ro->target_volume,
                    'pagu_anggaran' => $ro->pagu_anggaran,
                    'realisasi_volume_kumulatif' => $totalVolume,
                    'realisasi_anggaran_kumulatif' => $totalAnggaran,
                    'persen_volume' => round($persenVolume, 2),
                    'persen_anggaran' => round($persenAnggaran, 2),
                    'status_kinerja' => $status,
                    'detail_bulanan' => $ro->realisasiOutputs->keyBy('bulan') // Untuk modal edit
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $hasil
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // =====================================================================
    // 📝 SIMPAN TARGET RO BARU (SET UP AWAL TAHUN)
    // =====================================================================
    public function storeTarget(Request $request)
    {
        $user = $request->user();
        $inputData = $request->all();

        // 🧠 ALARM PELACAK: Analisis masalah Satker ID
        if ($user->role !== 'admin') {
            // Coba cari Satker di database berdasarkan kode_satker User
            $satker = \App\Models\Satker::where('kode_satker', $user->kode_satker)->first();

            if ($satker) {
                $inputData['satker_id'] = $satker->id;
            } else {
                // ALARM 1: Kalau kode satker user tidak ada di master satker
                return response()->json([
                    'status' => 'error',
                    'message' => "Gagal! Kode Satker Anda ({$user->kode_satker}) tidak terdaftar di Data Master Satker. Silakan hubungi Admin Kanwil."
                ], 422);
            }
        } else {
            // ALARM 2: Kalau Admin lupa / sistem gagal menangkap ID dari dropdown
            if (empty($inputData['satker_id'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Gagal! Anda login sebagai Admin tetapi sistem tidak menerima ID Satker dari dropdown. Pastikan Anda sudah memilih Satker."
                ], 422);
            }
        }

        $validator = Validator::make($inputData, [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'kode_ro' => 'required|string',
            'nama_ro' => 'required|string',
            'satuan' => 'required|string',
            'target_volume' => 'required|numeric|min:1',
            'pagu_anggaran' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi Data Gagal: ' . $validator->errors()->first()
            ], 422);
        }

        try {
            $ro = RincianOutput::create($inputData);
            return response()->json([
                'status' => 'success',
                'message' => 'Target RO berhasil ditambahkan!',
                'data' => $ro
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan database: ' . $e->getMessage()
            ], 500);
        }
    }

    // =====================================================================
    // 📈 SIMPAN REALISASI BULANAN (PROGRESS CAPAIAN)
    // =====================================================================
    public function storeRealisasi(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rincian_output_id' => 'required|exists:rincian_outputs,id',
            'bulan' => 'required|integer|min:1|max:12',
            'realisasi_volume' => 'required|numeric|min:0',
            'realisasi_anggaran' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        try {
            // Cek apakah bulan ini sudah ada laporannya
            $realisasi = RealisasiOutput::where('rincian_output_id', $request->rincian_output_id)
                ->where('bulan', $request->bulan)
                ->first();

            // Hitung persentase PC (Progress Capaian) berdasarkan volume
            $ro = RincianOutput::find($request->rincian_output_id);
            $pc = ($request->realisasi_volume / $ro->target_volume) * 100;
            $pc = min($pc, 100);

            if ($realisasi) {
                // Update jika sudah ada
                $realisasi->update([
                    'realisasi_volume' => $request->realisasi_volume,
                    'realisasi_anggaran' => $request->realisasi_anggaran,
                    'progress_capaian' => $pc,
                    'keterangan' => $request->keterangan
                ]);
                $msg = 'Laporan Realisasi Output berhasil diupdate!';
            } else {
                // Buat baru jika belum ada
                RealisasiOutput::create([
                    'rincian_output_id' => $request->rincian_output_id,
                    'bulan' => $request->bulan,
                    'realisasi_volume' => $request->realisasi_volume,
                    'realisasi_anggaran' => $request->realisasi_anggaran,
                    'progress_capaian' => $pc,
                    'keterangan' => $request->keterangan
                ]);
                $msg = 'Laporan Realisasi Output berhasil ditambahkan!';
            }

            return response()->json(['status' => 'success', 'message' => $msg]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Gagal menyimpan Realisasi Output.'], 500);
        }
    }

    // =====================================================================
    // 🗑️ HAPUS TARGET RO
    // =====================================================================
    public function destroyRo($id)
    {
        try {
            $ro = RincianOutput::findOrFail($id);
            $ro->delete();
            return response()->json(['status' => 'success', 'message' => 'Target RO berhasil dihapus!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Gagal menghapus Target RO.'], 500);
        }
    }
}
