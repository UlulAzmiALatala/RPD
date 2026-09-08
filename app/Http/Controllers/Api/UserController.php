<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Satker;
use App\Models\ActivityLog; // <-- IMPORT MODEL CCTV
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    // 1. Tampilkan Daftar User (Bisa di-search)
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            $query = User::orderBy('created_at', 'desc');

            if ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('kode_satker', 'like', "%{$search}%");
            }

            $users = $query->paginate(10);

            // Kita juga kirim daftar Satker untuk pilihan di Dropdown tambah/edit user
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

    // 2. Tambah User Baru
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

        // Kalau rolenya Satker, WAJIB pilih kode satker
        if ($request->role === 'satker' && empty($request->kode_satker)) {
            return response()->json(['status' => 'error', 'message' => 'Akun Satker wajib memiliki Kode Satker!'], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Enkripsi Password
            'role' => $request->role,
            'kode_satker' => $request->role === 'admin' ? null : $request->kode_satker,
        ]);

        // ==========================================
        // 🔴 REKAM CCTV (CREATE)
        // ==========================================
        $roleName = $request->role === 'admin' ? 'Admin Kanwil' : 'Operator Satker';
        ActivityLog::record(
            'CREATE',
            'MANAJEMEN PENGGUNA',
            "Membuat akun baru dengan nama {$request->name} sebagai {$roleName}."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User berhasil ditambahkan.',
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

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;
        $user->kode_satker = $request->role === 'admin' ? null : $request->kode_satker;

        $isPasswordChanged = false;
        // Jika password diisi, berarti mau ganti password. Jika kosong, biarkan password lama.
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $isPasswordChanged = true;
        }

        $user->save();

        // ==========================================
        // 🔴 REKAM CCTV (UPDATE)
        // ==========================================
        $roleName = $request->role === 'admin' ? 'Admin Kanwil' : 'Operator Satker';
        $desc = "Memperbarui profil akun {$request->name} ({$roleName}).";
        if ($isPasswordChanged) {
            $desc .= " (Termasuk reset/ganti password)";
        }

        ActivityLog::record(
            'UPDATE',
            'MANAJEMEN PENGGUNA',
            $desc
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Data User berhasil diperbarui.'
        ]);
    }

    // 4. Hapus User
    public function destroy(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User tidak ditemukan.'], 404);
        }

        // Mencegah Admin menghapus dirinya sendiri
        if ($request->user()->id == $id) {
            return response()->json(['status' => 'error', 'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!'], 403);
        }

        $namaYgDihapus = $user->name;
        $roleYgDihapus = $user->role === 'admin' ? 'Admin Kanwil' : 'Operator Satker';

        $user->delete();

        // ==========================================
        // 🔴 REKAM CCTV (DELETE)
        // ==========================================
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
