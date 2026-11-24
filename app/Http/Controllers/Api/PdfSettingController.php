<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PdfSetting;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PdfSettingController extends Controller
{
    public function show()
    {
        try {
            $setting = PdfSetting::current();

            return response()->json([
                'status' => 'success',
                'data' => $setting,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memuat pengaturan PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
            'remove_logo' => 'nullable|in:0,1,true,false',
            'instansi_baris_1' => 'required|string|max:200',
            'instansi_baris_2' => 'required|string|max:200',
            'alamat_kop' => 'required|string|max:350',
            'kota_ttd' => 'required|string|max:100',
            'jabatan_ttd' => 'required|string|max:150',
            'nama_pejabat' => 'required|string|max:150',
            'nip_pejabat' => 'required|string|max:50',
            'catatan_kaki' => 'nullable|string|max:350',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $setting = PdfSetting::first();
            $logoPath = $setting?->logo_path;

            // 1. Jika user meminta hapus logo
            if ($request->boolean('remove_logo')) {
                if ($logoPath && Storage::disk('public')->exists($logoPath)) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = null;
            }

            // 2. Jika user mengunggah file logo baru
            if ($request->hasFile('logo')) {
                if ($logoPath && Storage::disk('public')->exists($logoPath)) {
                    Storage::disk('public')->delete($logoPath);
                }
                $logoPath = $request->file('logo')->store('pdf_logos', 'public');
            }

            $payload = [
                'logo_path' => $logoPath,
                'instansi_baris_1' => trim($request->instansi_baris_1),
                'instansi_baris_2' => trim($request->instansi_baris_2),
                'alamat_kop' => trim($request->alamat_kop),
                'kota_ttd' => trim($request->kota_ttd),
                'jabatan_ttd' => trim($request->jabatan_ttd),
                'nama_pejabat' => trim($request->nama_pejabat),
                'nip_pejabat' => trim($request->nip_pejabat),
                'catatan_kaki' => $request->catatan_kaki ? trim($request->catatan_kaki) : null,
                'updated_by' => Auth::id(),
            ];

            if ($setting) {
                $setting->update($payload);
            } else {
                $setting = PdfSetting::create($payload);
            }

            $setting->load(['editor' => fn($q) => $q->select('id', 'name')]);

            ActivityLog::record(
                'UPDATE',
                'PENGATURAN PDF',
                "Memperbarui Logo, Kop Surat & Pejabat Penanda Tangan PDF menjadi {$setting->nama_pejabat} (NIP. {$setting->nip_pejabat})."
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Pengaturan Logo, Kop Surat & Pejabat TTD PDF berhasil diperbarui.',
                'data' => $setting,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menyimpan pengaturan PDF: ' . $e->getMessage(),
            ], 500);
        }
    }
}
