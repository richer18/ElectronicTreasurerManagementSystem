<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardDivingTicketTopController extends Controller
{
    public function index(Request $request)
    {
        $year = (int) $request->input('year', now()->year);

        return response()->json(
            DB::table('trust_fund_payment')
                ->selectRaw('MONTH(DATE) AS month_number, ROUND(COALESCE(SUM(DIVING_FEE), 0), 2) AS amount')
                ->whereYear('DATE', $year)
                ->whereRaw('COALESCE(DIVING_FEE, 0) > 0')
                ->groupByRaw('MONTH(DATE)')
                ->orderByRaw('MONTH(DATE)')
                ->get()
        );
    }
}
