<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataTotalAllDataController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('PAYMENT as p')
                ->join('PAYMENTDETAIL as pd', 'p.PAYMENT_ID', '=', 'pd.PAYMENT_ID')
                ->join('T_OTHERPAYMENTRATE as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('pd.FUNDTYPE_CT', 'TF')
                ->whereRaw('COALESCE(p.VOID_BV, 0) = 0')
                ->whereIn('opr.ITAXTYPE_CT', ['PFB', 'EP', 'ZLC', 'IFL', 'IFD']);

            if ($request->filled('month')) {
                $query->whereMonth('p.PAYMENTDATE', $request->month);
            }

            if ($request->filled('year')) {
                $query->whereYear('p.PAYMENTDATE', $request->year);
            }

            $result = $query
                ->selectRaw('ROUND(COALESCE(SUM(pd.AMOUNTPAID), 0), 2) AS overall_total')
                ->get();

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Error fetching trust fund total: " . $e->getMessage());
            return response()->json(['error' => 'Error fetching data'], 500);
        }
    }
}
