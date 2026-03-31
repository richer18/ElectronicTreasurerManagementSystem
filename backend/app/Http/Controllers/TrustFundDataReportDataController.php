<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TrustFundDataReportDataController extends Controller
{
    public function index(Request $request)
    {
        $month = (int) $request->query('month');
        $year = (int) $request->query('year');

        if (!$month || !$year) {
            return response()->json(['error' => 'Valid month and year are required'], 400);
        }

        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $result = $query->selectRaw("
                ROUND(COALESCE(SUM(LOCAL_80_PERCENT), 0), 2) AS LOCAL_80_PERCENT,
                ROUND(COALESCE(SUM(TRUST_FUND_15_PERCENT), 0), 2) AS TRUST_FUND_15_PERCENT,
                ROUND(COALESCE(SUM(NATIONAL_5_PERCENT), 0), 2) AS NATIONAL_5_PERCENT,
                ROUND(COALESCE(SUM(ELECTRICAL_FEE), 0), 2) AS ELECTRICAL_FEE,
                ROUND(COALESCE(SUM(ZONING_FEE), 0), 2) AS ZONING_FEE,
                ROUND(COALESCE(SUM(LOCAL_80_PERCENT_LIVESTOCK), 0), 2) AS LOCAL_80_PERCENT_LIVESTOCK,
                ROUND(COALESCE(SUM(NATIONAL_20_PERCENT), 0), 2) AS NATIONAL_20_PERCENT,
                ROUND(COALESCE(SUM(LOCAL_40_PERCENT_DIVE_FEE), 0), 2) AS LOCAL_40_PERCENT_DIVE_FEE,
                ROUND(COALESCE(SUM(BRGY_30_PERCENT), 0), 2) AS BRGY_30_PERCENT,
                ROUND(COALESCE(SUM(FISHERS_30_PERCENT), 0), 2) AS FISHERS_30_PERCENT,
                ROUND(COALESCE(SUM(TOTAL), 0), 2) AS TOTAL
            ")->first();

            return response()->json([$result]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Database query failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
