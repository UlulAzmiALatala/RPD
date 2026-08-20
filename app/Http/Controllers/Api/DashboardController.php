<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Satker;
use App\Models\Anggaran;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Secara default kita ambil tahun saat ini, atau dari parameter request
        $tahun = $request->query('tahun', date('Y'));

        // Mengambil semua data Satker beserta anggarannya di tahun tersebut
        $satkers = Satker::with(['anggarans' => function ($query) use ($tahun) {
            $query->where('tahun', $tahun);
        }])->get();

        // Nanti di sini kita bisa tambahkan logika untuk menghitung total deviasi dan IKPA
        // Tapi untuk sekarang, kita kirimkan dulu raw data-nya ke React

        return response()->json([
            'status' => 'success',
            'tahun' => $tahun,
            'data' => $satkers
        ]);
    }
}
