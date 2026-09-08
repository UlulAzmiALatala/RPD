<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog; // <-- IMPORT MODEL CCTV
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'nip' => 'nullable|string|max:50',
            'no_hp' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->nip = $request->nip;
        $user->no_hp = $request->no_hp;

        $perubahanEkstra = [];

        // Jika isi password baru
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $perubahanEkstra[] = 'Password';
        }

        // Jika upload foto avatar baru
        if ($request->hasFile('avatar')) {
            // Hapus foto lama jika ada
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            // Simpan foto baru ke storage/app/public/avatars
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
            $perubahanEkstra[] = 'Foto Profil';
        }

        $user->save();

        // ==========================================
        // 🔴 REKAM CCTV (UPDATE PROFIL)
        // ==========================================
        $desc = "Memperbarui informasi profil pribadi.";
        if (count($perubahanEkstra) > 0) {
            $desc .= " (Termasuk mengubah: " . implode(' & ', $perubahanEkstra) . ")";
        }

        ActivityLog::record(
            'UPDATE',
            'PROFIL SAYA',
            $desc
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui!',
            'data' => $user
        ]);
    }
}
