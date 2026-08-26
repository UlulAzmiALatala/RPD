<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anggaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnggaranController extends Controller
{
    // Mengambil daftar Pagu Anggaran
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', date('Y'));

        $anggarans = Anggaran::with('satker')
            ->where('tahun', $tahun)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $anggarans
        ]);
    }

    // Menyimpan atau Update Pagu Anggaran
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'satker_id' => 'required|exists:satkers,id',
            'tahun' => 'required|integer',
            'belanja_gaji' => 'required|numeric|min:0',
            'belanja_barang' => 'required|numeric|min:0',
            'belanja_modal' => 'required|numeric|min:0',
            'pagu_blokir' => 'nullable|numeric|min:0', // Boleh kosong, nanti di-set 0
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'messages' => $validator->errors()], 422);
        }

        // Ambil nilai, default ke 0 jika kosong
        $belanjaGaji = $request->belanja_gaji ?: 0;
        $belanjaBarang = $request->belanja_barang ?: 0;
        $belanjaModal = $request->belanja_modal ?: 0;
        $paguBlokir = $request->pagu_blokir ?: 0;

        // --- KALKULASI OTOMATIS ---
        $totalPagu = $belanjaGaji + $belanjaBarang + $belanjaModal;
        $paguEfektif = $totalPagu - $paguBlokir;

        // Gunakan updateOrCreate agar kalau satker di tahun yang sama diinput lagi, dia bakal nge-update
        $anggaran = Anggaran::updateOrCreate(
            ['satker_id' => $request->satker_id, 'tahun' => $request->tahun],
            [
                'belanja_gaji' => $belanjaGaji,
                'belanja_barang' => $belanjaBarang,
                'belanja_modal' => $belanjaModal,
                'total_pagu' => $totalPagu,
                'pagu_blokir' => $paguBlokir,
                'pagu_efektif' => $paguEfektif,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pagu Anggaran berhasil disimpan.',
            'data' => $anggaran
        ]);
    }
}
