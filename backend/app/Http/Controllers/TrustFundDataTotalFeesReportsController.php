<?php

namespace App\Http\Controllers;

use App\Helpers\TrustFundPaymentSummaryHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TrustFundDataTotalFeesReportsController extends Controller
{
    public function __invoke(Request $request)
    {
        try {
            $query = DB::table('trust_fund_payment');
            $query = TrustFundPaymentSummaryHelper::applyActiveFilter($query);
            $query = TrustFundPaymentSummaryHelper::applyDateFilters($query, $request);

            $totals = $query->selectRaw("
                ROUND(COALESCE(SUM(BUILDING_PERMIT_FEE), 0), 2) AS building_total,
                ROUND(COALESCE(SUM(ELECTRICAL_FEE), 0), 2) AS electrical_total,
                ROUND(COALESCE(SUM(ZONING_FEE), 0), 2) AS zoning_total,
                ROUND(COALESCE(SUM(LIVESTOCK_DEV_FUND), 0), 2) AS livestock_total,
                ROUND(COALESCE(SUM(DIVING_FEE), 0), 2) AS diving_total,
                ROUND(COALESCE(SUM(TOTAL), 0), 2) AS overall_total
            ")->first();

            return response()->json([
                ['Taxes' => 'Building Permit Fee', 'Total' => $totals->building_total ?? 0],
                ['Taxes' => 'Electrical Permit Fee', 'Total' => $totals->electrical_total ?? 0],
                ['Taxes' => 'Zoning Fee', 'Total' => $totals->zoning_total ?? 0],
                ['Taxes' => 'Livestock Dev. Fund', 'Total' => $totals->livestock_total ?? 0],
                ['Taxes' => 'Diving Fee', 'Total' => $totals->diving_total ?? 0],
                ['Taxes' => 'Overall Total', 'Total' => $totals->overall_total ?? 0],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching total trust fund fees: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch data'], 500);
        }
    }
}
