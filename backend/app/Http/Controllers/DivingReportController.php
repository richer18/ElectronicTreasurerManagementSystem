<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DivingReportController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('trust_fund_payment')
            ->whereRaw('COALESCE(DIVING_FEE, 0) > 0');

        if ($request->filled('year')) {
            $query->whereYear('DATE', (int) $request->input('year'));
        }

        return response()->json(
            $query
                ->selectRaw('NAME, ROUND(COALESCE(SUM(DIVING_FEE), 0), 2) AS AMOUNT')
                ->groupBy('NAME')
                ->orderByDesc('AMOUNT')
                ->orderBy('NAME')
                ->get()
        );
    }
}
