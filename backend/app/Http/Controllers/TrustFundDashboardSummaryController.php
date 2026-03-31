<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDashboardSummaryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $summary = $query->selectRaw("
                ROUND(COALESCE(SUM(TOTAL), 0), 2) AS total,
                ROUND(COALESCE(SUM(BUILDING_PERMIT_FEE), 0), 2) AS building_permit_fee,
                ROUND(COALESCE(SUM(ELECTRICAL_FEE), 0), 2) AS electrical_fee,
                ROUND(COALESCE(SUM(ZONING_FEE), 0), 2) AS zoning_fee,
                ROUND(COALESCE(SUM(LIVESTOCK_DEV_FUND), 0), 2) AS livestock_dev_fund,
                ROUND(COALESCE(SUM(DIVING_FEE), 0), 2) AS diving_fee
            ")->first();

            return response()->json($summary);
        } catch (\Exception $e) {
            Log::error('Error fetching trust fund dashboard summary: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch summary'], 500);
        }
    }
}
