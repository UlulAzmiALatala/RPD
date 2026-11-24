<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Satker;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class UserController extends Controller
{
    // 1. Tampilkan Daftar User (Bisa di-search)
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            $query = User::orderBy('created_at', 'desc');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('kode_satker', 'like', "%{$search}%");
                });
            }

            $users = $query->paginate(10);
            $satkers = Satker::orderBy('kode_satker', 'asc')->get();

            return response()->json([
                'status' => 'success',
                'data' => $users,
                'satkers' => $satkers
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // 2. Tambah User Baru (Admin-Only + Wajib Ganti Password saat login pertama)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,satker',
            'kode_satker' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        if ($request->role === 'satker' && empty($request->kode_satker)) {
            return response()->json(['status' => 'error', 'message' => 'Akun Satker wajib memiliki Kode Satker!'], 422);
        }

        $user = User::create([
            'name' => trim($request->name),
            'email' => Str::lower(trim($request->email)),
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'kode_satker' => $request->role === 'admin' ? null : $request->kode_satker,
            'is_active' => true,
            'must_change_password' => true,
        ]);

        $roleName = $request->role === 'admin' ? 'Admin Kanwil' : 'Operator Satker';
        ActivityLog::record(
            'CREATE',
            'MANAJEMEN PENGGUNA',
            "Membuat akun baru dengan nama {$user->name} sebagai {$roleName} (Wajib ganti password saat login pertama)."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil ditambahkan. Pengguna akan diminta mengganti password saat login pertama kali.',
            'data' => $user
        ], 201);
    }

    // 3. Update Data User
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'role' => 'required|in:admin,satker',
            'kode_satker' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        if ($request->role === 'satker' && empty($request->kode_satker)) {
            return response()->json(['status' => 'error', 'message' => 'Akun Satker wajib memiliki Kode Satker!'], 422);
        }

        $user->name = trim($request->name);
        $user->email = Str::lower(trim($request->email));
        $user->role = $request->role;
        $user->kode_satker = $request->role === 'admin' ? null : $request->kode_satker;

        $isPasswordChanged = false;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->must_change_password = true;
            $isPasswordChanged = true;
        }

        $user->save();

        $roleName = $request->role === 'admin' ? 'Admin Kanwil' : 'Operator Satker';
        $desc = "Memperbarui profil akun {$user->name} ({$roleName}).";
        if ($isPasswordChanged) {
            $desc .= " (Termasuk reset password sementara)";
        }

        ActivityLog::record('UPDATE', 'MANAJEMEN PENGGUNA', $desc);

        return response()->json([
            'status' => 'success',
            'message' => 'Data User berhasil diperbarui.'
        ]);
    }

    // 4. Suspend / Aktifkan Akun (Tanpa menghapus riwayat Audit Trail)
    public function toggleActive(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User tidak ditemukan.'], 404);
        }

        if ($request->user()->id == $id) {
            return response()->json(['status' => 'error', 'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri!'], 403);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $statusTeks = $user->is_active ? 'MENGAKTIFKAN KEMBALI' : 'MENONAKTIFKAN (SUSPEND)';
        ActivityLog::record(
            'UPDATE',
            'OTORITAS AKSES',
            "Admin {$statusTeks} akun {$user->name} ({$user->email})."
        );

        return response()->json([
            'status' => 'success',
            'message' => $user->is_active
                ? "Akun {$user->name} berhasil diaktifkan kembali."
                : "Akun {$user->name} telah dinonaktifkan (Suspended).",
            'data' => $user,
        ]);
    }

    // 5. Reset Password 1x Pakai (Menghasilkan password sementara & memaksa ganti saat login)
    public function resetPassword(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User tidak ditemukan.'], 404);
        }

        if ($request->user()->id == $id) {
            return response()->json(['status' => 'error', 'message' => 'Gunakan menu Profil Saya untuk mengubah password akun Anda sendiri.'], 403);
        }

        $tempPassword = 'SIRA-' . strtoupper(Str::random(4)) . '-' . random_int(1000, 9999);

        $user->password = Hash::make($tempPassword);
        $user->must_change_password = true;
        $user->save();

        ActivityLog::record(
            'UPDATE',
            'RESET PASSWORD',
            "Admin menerbitkan password sementara 1x pakai untuk akun {$user->name} ({$user->email})."
        );

        return response()->json([
            'status' => 'success',
            'message' => "Password sementara untuk {$user->name} berhasil dibuat.",
            'data' => [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'temporary_password' => $tempPassword,
            ],
        ]);
    }

    // 6. Reset Darurat 2FA (Jika HP pegawai hilang / Authenticator terhapus)
    public function resetTwoFactor(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User tidak ditemukan.'], 404);
        }

        if ($request->user()->id == $id) {
            return response()->json(['status' => 'error', 'message' => 'Nonaktifkan 2FA Anda sendiri melalui menu Profil Saya.'], 403);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        ActivityLog::record(
            'UPDATE',
            'PEMULIHAN 2FA',
            "Admin mereset paksa Google Authenticator 2FA milik akun {$user->name} ({$user->email})."
        );

        return response()->json([
            'status' => 'success',
            'message' => "2FA Google Authenticator milik {$user->name} berhasil direset.",
        ]);
    }

    // 7. Hapus User
    public function destroy(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User tidak ditemukan.'], 404);
        }

        if ($request->user()->id == $id) {
            return response()->json(['status' => 'error', 'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!'], 403);
        }

        $namaYgDihapus = $user->name;
        $roleYgDihapus = $user->role === 'admin' ? 'Admin Kanwil' : 'Operator Satker';

        $user->delete();

        ActivityLog::record(
            'DELETE',
            'MANAJEMEN PENGGUNA',
            "Menghapus akun {$namaYgDihapus} ({$roleYgDihapus}) secara permanen dari sistem."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil dihapus.'
        ]);
    }
}
