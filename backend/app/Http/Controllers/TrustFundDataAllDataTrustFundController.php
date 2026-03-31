<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataAllDataTrustFundController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment')
                ->selectRaw("
                    DATE,
                    ROUND(COALESCE(SUM(BUILDING_PERMIT_FEE), 0), 2) AS BUILDING_PERMIT_FEE,
                    ROUND(COALESCE(SUM(ELECTRICAL_FEE), 0), 2) AS ELECTRICAL_FEE,
                    ROUND(COALESCE(SUM(ZONING_FEE), 0), 2) AS ZONING_FEE,
                    ROUND(COALESCE(SUM(LIVESTOCK_DEV_FUND), 0), 2) AS LIVESTOCK_DEV_FUND,
                    ROUND(COALESCE(SUM(DIVING_FEE), 0), 2) AS DIVING_FEE,
                    ROUND(COALESCE(SUM(TOTAL), 0), 2) AS TOTAL,
                    GROUP_CONCAT(DISTINCT NULLIF(COMMENTS, '') SEPARATOR '; ') AS COMMENTS
                ");

            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $results = $query
                ->groupBy('DATE')
                ->orderBy('DATE')
                ->get();

            return response()->json($results);
        } catch (\Exception $e) {
            Log::error('Error fetching trust fund data: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }
}
