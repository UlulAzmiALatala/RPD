<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CutOff;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class CutOffController extends Controller
{
    // Mengambil status 12 bulan di tahun tertentu
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));

        // Ambil data yang ada di database
        $cutOffs = CutOff::where('tahun', $tahun)->get()->keyBy('bulan');

        $data = [];
        // Buat struktur 12 bulan (jika belum ada di database, anggap terbuka / false)
        for ($i = 1; $i <= 12; $i++) {
            $data[] = [
                'bulan' => $i,
                'is_closed' => isset($cutOffs[$i]) ? $cutOffs[$i]->is_closed : false,
            ];
        }

        return response()->json([
            'status' => 'success',
            'tahun' => (int) $tahun,
            'data' => $data
        ]);
    }

    // Mengubah status buka/tutup buku (Khusus Admin)
    public function toggle(Request $request)
    {
        $request->validate([
            'tahun' => 'required|integer',
            'bulan' => 'required|integer|min:1|max:12',
            'is_closed' => 'required|boolean'
        ]);

        // updateOrCreate: Kalau belum ada datanya, dibikinin. Kalau udah ada, di-update.
        $cutoff = CutOff::updateOrCreate(
            ['tahun' => $request->tahun, 'bulan' => $request->bulan],
            ['is_closed' => $request->is_closed]
        );

        // Rekam CCTV
        $statusStr = $request->is_closed ? 'MENGUNCI (Tutup Buku)' : 'MEMBUKA KUNCI';
        ActivityLog::record(
            'UPDATE',
            'TUTUP BUKU',
            "{$statusStr} untuk transaksi Bulan {$request->bulan} Tahun {$request->tahun}."
        );

        $pesan = $request->is_closed ? "Terkunci" : "Terbuka";

        return response()->json([
            'status' => 'success',
            'message' => "Periode Bulan {$request->bulan} Tahun {$request->tahun} berhasil {$pesan}."
        ]);
    }
}
