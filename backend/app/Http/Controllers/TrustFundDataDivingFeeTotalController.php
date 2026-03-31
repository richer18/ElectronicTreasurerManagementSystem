<?php

namespace App\Http\Controllers;

use App\Helpers\QueryHelpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataDivingFeeTotalController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('PAYMENT as p')
                ->join('PAYMENTDETAIL as pd', 'p.PAYMENT_ID', '=', 'pd.PAYMENT_ID')
                ->join('T_OTHERPAYMENTRATE as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('pd.FUNDTYPE_CT', 'TF')
                ->whereRaw('COALESCE(p.VOID_BV, 0) = 0')
                ->where(function ($query) {
                    $query->whereNull('p.STATUS_CT')->orWhere('p.STATUS_CT', '<>', 'CNL');
                })
                ->where('opr.ITAXTYPE_CT', 'IFD');

            $query = QueryHelpers::addDateFilters($query, $request, 'p.PAYMENTDATE');

            $result = $query
                ->selectRaw('ROUND(COALESCE(SUM(pd.AMOUNTPAID), 0), 2) AS Diving_Fee_Total')
                ->first();

            return response()->json([
                'diving_fee_total' => $result->Diving_Fee_Total ?? 0,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching diving fee total: ' . $e->getMessage());
            return response()->json(['error' => 'Database query failed'], 500);
        }
    }
}
