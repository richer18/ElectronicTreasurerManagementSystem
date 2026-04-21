<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TaxpayerLookupController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));

        $query = DB::table('taxpayer')
            ->selectRaw("
                TRIM(COALESCE(OWNERNAME, '')) AS OWNERNAME,
                TRIM(COALESCE(LOCAL_TIN, '')) AS LOCAL_TIN
            ")
            ->whereRaw("TRIM(COALESCE(OWNERNAME, '')) <> ''");

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('OWNERNAME', 'like', "%{$search}%")
                    ->orWhere('LOCAL_TIN', 'like', "%{$search}%");
            });
        }

        $rows = $query
            ->orderBy('OWNERNAME')
            ->limit(20)
            ->get()
            ->map(fn ($row) => [
                'ownerName' => $row->OWNERNAME,
                'localTin' => $row->LOCAL_TIN,
            ])
            ->values();

        return response()->json($rows);
    }
}
