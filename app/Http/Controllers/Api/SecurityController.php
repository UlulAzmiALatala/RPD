<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Actions\ConfirmTwoFactorAuthentication;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;

class SecurityController extends Controller
{
    /**
     * Ganti Password Wajib (saat akun baru dibuat atau habis di-reset Admin)
     */
    public function forceChangePassword(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed|different:current_password',
        ], [
            'password.min' => 'Password baru minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
            'password.different' => 'Password baru harus berbeda dari password sementara.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password sementara / saat ini tidak sesuai.',
            ], 422);
        }

        $user->password = Hash::make($request->password);
        $user->must_change_password = false;
        $user->save();

        ActivityLog::record(
            'UPDATE',
            'KEAMANAN AKUN',
            "Pengguna {$user->name} menyelesaikan penggantian password wajib (aktivasi akun aman)."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Password baru berhasil disimpan! Mengarahkan ke Dashboard...',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Ambil status 2FA pengguna saat ini
     */
    public function twoFactorStatus(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $isEnabled = $user->two_factor_enabled;
        $isPendingConfirm = !is_null($user->two_factor_secret) && is_null($user->two_factor_confirmed_at);

        $response = [
            'enabled' => $isEnabled,
            'pending_confirm' => $isPendingConfirm,
            'confirmed_at' => $user->two_factor_confirmed_at,
        ];

        if ($isPendingConfirm) {
            $response['qr_svg'] = $user->twoFactorQrCodeSvg();
            $response['secret_key'] = $this->decryptSecret($user->two_factor_secret);
        }

        return response()->json([
            'status' => 'success',
            'data' => $response,
        ]);
    }

    /**
     * Tahap 1 Setup 2FA: Validasi password & generate QR Code Google Authenticator
     */
    public function enableTwoFactor(Request $request, EnableTwoFactorAuthentication $enable)
    {
        /** @var User $user */
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
        ]);

        if ($validator->fails() || !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password saat ini salah. Verifikasi diperlukan untuk mengaktifkan 2FA.',
            ], 422);
        }

        $enable($user, true);
        $user->refresh();

        return response()->json([
            'status' => 'success',
            'message' => 'QR Code Google Authenticator berhasil dibuat. Silakan pindai lalu masukkan 6 digit kode verifikasi.',
            'data' => [
                'qr_svg' => $user->twoFactorQrCodeSvg(),
                'secret_key' => $this->decryptSecret($user->two_factor_secret),
                'recovery_codes' => $user->recoveryCodes(),
            ],
        ]);
    }

    /**
     * Tahap 2 Setup 2FA: Konfirmasi 6 digit kode OTP pertama dari Google Authenticator
     */
    public function confirmTwoFactor(Request $request, ConfirmTwoFactorAuthentication $confirm)
    {
        /** @var User $user */
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|size:6',
        ], [
            'code.size' => 'Kode Authenticator harus terdiri dari 6 digit angka.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
            ], 422);
        }

        try {
            $confirm($user, trim($request->code));
            $user->refresh();

            ActivityLog::record(
                'UPDATE',
                'KEAMANAN 2FA',
                "Pengguna {$user->name} mengaktifkan autentikasi dua faktor (Google Authenticator 2FA)."
            );

            return response()->json([
                'status' => 'success',
                'message' => 'Google Authenticator 2FA berhasil diaktifkan! Simpan kode pemulihan Anda di tempat aman.',
                'data' => [
                    'enabled' => true,
                    'recovery_codes' => $user->recoveryCodes(),
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Kode 6 digit tidak valid atau sudah kedaluwarsa. Pastikan jam HP Anda sinkron otomatis.',
            ], 422);
        }
    }

    /**
     * Ambil / Buat ulang Recovery Codes (butuh verifikasi password)
     */
    public function recoveryCodes(Request $request, GenerateNewRecoveryCodes $generate)
    {
        /** @var User $user */
        $user = $request->user();

        if (!$user->two_factor_enabled) {
            return response()->json([
                'status' => 'error',
                'message' => '2FA belum aktif pada akun ini.',
            ], 400);
        }

        if (!$request->filled('current_password') || !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password saat ini salah.',
            ], 422);
        }

        if ($request->boolean('regenerate')) {
            $generate($user);
            $user->refresh();

            ActivityLog::record(
                'UPDATE',
                'KEAMANAN 2FA',
                "Pengguna {$user->name} memperbarui daftar Kode Pemulihan (Recovery Codes) 2FA."
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => $request->boolean('regenerate')
                ? 'Kode pemulihan baru berhasil dibuat. Kode lama sudah tidak berlaku.'
                : 'Daftar kode pemulihan berhasil dimuat.',
            'data' => [
                'recovery_codes' => $user->recoveryCodes(),
            ],
        ]);
    }

    /**
     * Nonaktifkan 2FA (butuh verifikasi password saat ini)
     */
    public function disableTwoFactor(Request $request, DisableTwoFactorAuthentication $disable)
    {
        /** @var User $user */
        $user = $request->user();

        if (!$request->filled('current_password') || !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password saat ini salah. Tidak dapat menonaktifkan 2FA.',
            ], 422);
        }

        $disable($user);

        ActivityLog::record(
            'UPDATE',
            'KEAMANAN 2FA',
            "Pengguna {$user->name} menonaktifkan Google Authenticator 2FA pada akunnya."
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Google Authenticator 2FA telah dinonaktifkan.',
        ]);
    }

    private function decryptSecret(?string $encrypted): ?string
    {
        if (!$encrypted) return null;
        try {
            return decrypt($encrypted);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
