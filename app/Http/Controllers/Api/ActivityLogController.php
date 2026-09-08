<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            // Tarik data log beserta relasi usernya (nama dan satkernya)
            $query = ActivityLog::with(['user' => function ($q) {
                $q->select('id', 'name', 'role', 'kode_satker', 'avatar');
            }])->orderBy('created_at', 'desc'); // Yang terbaru di atas

            if ($search) {
                $query->where('description', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('kode_satker', 'like', "%{$search}%");
                    });
            }

            // Paginasi 15 baris per halaman
            return response()->json($query->paginate(15));
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
