<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Pastikan user sudah login
        if (!$request->user()) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 401);
        }

        // Cek apakah role user saat ini ada di dalam array role yang diizinkan
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses ditolak! Anda tidak memiliki otoritas untuk tindakan ini.'
            ], 403);
        }

        return $next($request);
    }
}
