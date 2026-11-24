<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            Auth::guard('web')->logout();

            if ($request->hasSession()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'code' => 'ACCOUNT_SUSPENDED',
                    'message' => 'Akun Anda telah dinonaktifkan oleh Admin Kanwil. Silakan hubungi administrator.',
                ], 403);
            }

            return redirect('/login');
        }

        return $next($request);
    }
}
