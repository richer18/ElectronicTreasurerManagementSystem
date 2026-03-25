<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Helpers\QueryHelpers;

class TrustFundDataBuildingPermitFeeTotalController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('PAYMENT as p')
                ->join('PAYMENTDETAIL as pd', 'p.PAYMENT_ID', '=', 'pd.PAYMENT_ID')
                ->join('T_OTHERPAYMENTRATE as opr', 'pd.SOURCEID', '=', 'opr.OPRATE_ID')
                ->where('pd.FUNDTYPE_CT', 'TF')
                ->whereRaw('COALESCE(p.VOID_BV, 0) = 0')
                ->where('opr.ITAXTYPE_CT', 'PFB');

            $query = QueryHelpers::addDateFilters($query, $request, 'p.PAYMENTDATE');

            $result = $query
                ->selectRaw('ROUND(COALESCE(SUM(pd.AMOUNTPAID), 0), 2) AS Building_Permit_Fee_Total')
                ->first();

            return response()->json([
                'building_permit_fee_total' => $result->Building_Permit_Fee_Total ?? 0,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching Building Permit Fee total: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data.'], 500);
        }
    }
}
